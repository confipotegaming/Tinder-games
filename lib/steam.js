'use strict';
// Lecture des bibliothèques Steam grâce à l'API officielle de Steam.
// Il faut une clé (gratuite) : https://steamcommunity.com/dev/apikey
// et que le profil ait « Détails des jeux » en Public dans ses paramètres de confidentialité.

const API = 'https://api.steampowered.com';
const DUREE_CACHE = 10 * 60 * 1000; // on garde une bibliothèque 10 minutes en mémoire
const cache = new Map(); // id Steam -> { quand, jeux }

class ErreurSteam extends Error {}

// Comprend un lien de profil, un identifiant à 17 chiffres ou un pseudo personnalisé.
function lireProfil(texte) {
  const propre = String(texte || '').trim();
  if (!propre) return null;
  let m = propre.match(/steamcommunity\.com\/profiles\/(\d{17})/i) || propre.match(/^(\d{17})$/);
  if (m) return { type: 'id64', valeur: m[1] };
  m = propre.match(/steamcommunity\.com\/id\/([\w-]+)/i) || propre.match(/^([\w-]{2,32})$/);
  if (m) return { type: 'pseudo', valeur: m[1] };
  return null;
}

async function appeler(chemin, parametres, cle, fetchFn) {
  const url = new URL(API + chemin);
  url.search = new URLSearchParams({ key: cle, format: 'json', ...parametres }).toString();
  const reponse = await fetchFn(url);
  if (reponse.status === 401 || reponse.status === 403) throw new ErreurSteam('La clé Steam est refusée par Steam.');
  if (!reponse.ok) throw new ErreurSteam(`Steam ne répond pas correctement (erreur ${reponse.status}).`);
  return (await reponse.json()).response || {};
}

async function trouverId(texte, cle, fetchFn = fetch) {
  const profil = lireProfil(texte);
  if (!profil) throw new ErreurSteam(`Je ne comprends pas ce profil Steam : « ${texte} ».`);
  if (profil.type === 'id64') return profil.valeur;
  const r = await appeler('/ISteamUser/ResolveVanityURL/v1/', { vanityurl: profil.valeur }, cle, fetchFn);
  if (r.success !== 1 || !r.steamid) throw new ErreurSteam(`Profil Steam introuvable : « ${profil.valeur} ».`);
  return r.steamid;
}

async function jeuxDe(id64, cle, fetchFn = fetch) {
  const enCache = cache.get(id64);
  if (enCache && Date.now() - enCache.quand < DUREE_CACHE) return enCache.jeux;
  const r = await appeler('/IPlayerService/GetOwnedGames/v1/', {
    steamid: id64,
    include_appinfo: 1,
    include_played_free_games: 1,
  }, cle, fetchFn);
  // Quand les jeux sont privés, Steam renvoie une réponse vide (sans « games »).
  if (!Array.isArray(r.games)) {
    throw new ErreurSteam('Une bibliothèque Steam est privée : passer « Détails des jeux » en Public dans la confidentialité du profil.');
  }
  const jeux = r.games.map((g) => ({ appid: g.appid, nom: g.name, minutes: g.playtime_forever || 0 }));
  cache.set(id64, { quand: Date.now(), jeux });
  return jeux;
}

function heures(minutes) {
  return minutes < 60 ? (minutes ? '< 1 h' : 'jamais lancé') : `${Math.round(minutes / 60)} h`;
}

// joueurs : [{ nom, steam }]. Renvoie les cartes des jeux que tous ces joueurs possèdent.
async function jeuxEnCommun(joueurs, cle, fetchFn = fetch) {
  if (!cle) throw new ErreurSteam('La clé Steam n’est pas encore installée sur le serveur (variable STEAM_API_KEY).');
  if (joueurs.length === 0) throw new ErreurSteam('Personne n’a donné son profil Steam.');

  const bibliotheques = await Promise.all(joueurs.map(async (j) => {
    const id64 = await trouverId(j.steam, cle, fetchFn);
    return { nom: j.nom, jeux: new Map((await jeuxDe(id64, cle, fetchFn)).map((g) => [g.appid, g])) };
  }));

  const [premiere, ...autres] = bibliotheques;
  const communs = [...premiere.jeux.values()].filter((g) => autres.every((b) => b.jeux.has(g.appid)));

  return communs.map((g) => ({
    id: `steam-${g.appid}`,
    titre: g.nom,
    sousTitre: bibliotheques.map((b) => `${b.nom} : ${heures(b.jeux.get(g.appid).minutes)}`).join(' · '),
    etiquettes: [],
    emoji: '🎮',
    image: `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${g.appid}/header.jpg`,
    description: '',
    lien: `https://store.steampowered.com/app/${g.appid}`,
    texteLien: 'Page Steam',
  }));
}

module.exports = { lireProfil, trouverId, jeuxEnCommun, ErreurSteam, _cache: cache };
