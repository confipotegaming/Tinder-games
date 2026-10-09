'use strict';
// Lecture des bibliothèques Steam grâce à l'API officielle de Steam.
// Il faut une clé (gratuite) : https://steamcommunity.com/dev/apikey
// et que le profil ait « Détails des jeux » en Public dans ses paramètres de confidentialité.

const { ENVIES } = require('./criteres');
const JOUEURS_A_LA_MAIN = require('../data/steam-joueurs');

const API = 'https://api.steampowered.com';
const DUREE_CACHE = 10 * 60 * 1000; // on garde une bibliothèque 10 minutes en mémoire
const cache = new Map(); // id Steam -> { quand, jeux }
const infosMagasin = new Map(); // numéro du jeu -> { tags, joueurs } (ne change presque jamais)
let nomsDesTags = null; // numéro d'étiquette -> nom en français
const joueursWikidata = new Map(); // numéro du jeu -> [min, max], ou null si Wikidata ne sait pas

// Catégories « joueurs » du magasin Steam : 2 = solo, les autres = à plusieurs.
const MULTI = [1, 9, 24, 27, 36, 37, 38, 39, 44, 47, 48, 49];
const COOP = [9, 38, 39, 48];
const VERSUS = [36, 37, 47, 49];

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

// Demande au magasin Steam les étiquettes de chaque jeu (« Coop », « Horreur »…) et s'il se joue
// à plusieurs. Pas besoin de clé pour ça. Par paquets de 100 jeux, gardé en mémoire.
async function chargerInfosMagasin(appids, fetchFn) {
  const manquants = appids.filter((id) => !infosMagasin.has(id));
  for (let i = 0; i < manquants.length; i += 100) {
    const paquet = manquants.slice(i, i + 100);
    const url = new URL(`${API}/IStoreBrowseService/GetItems/v1/`);
    url.searchParams.set('input_json', JSON.stringify({
      ids: paquet.map((appid) => ({ appid })),
      context: { language: 'french', country_code: 'FR' },
      data_request: { include_tag_count: 20 },
    }));
    const reponse = await fetchFn(url);
    if (!reponse.ok) throw new Error(`Magasin Steam : erreur ${reponse.status}`);
    for (const item of (await reponse.json()).response?.store_items || []) {
      if (item.success !== 1) continue;
      infosMagasin.set(item.appid, {
        tags: item.tagids || [],
        joueurs: item.categories?.supported_player_categoryids || [],
      });
    }
  }
  if (!nomsDesTags) {
    const reponse = await fetchFn(new URL(`${API}/IStoreService/GetTagList/v1/?language=french`));
    if (reponse.ok) {
      nomsDesTags = new Map(((await reponse.json()).response?.tags || []).map((t) => [t.tagid, t.name]));
    }
  }
}

// Demande à Wikidata (la base de données de Wikipédia) le nombre de joueurs minimum et maximum,
// car Steam ne le donne pas. Par paquets de 150 jeux, gardé en mémoire.
async function chargerJoueursWikidata(appids, fetchFn) {
  const manquants = appids.filter((id) => !joueursWikidata.has(id) && !JOUEURS_A_LA_MAIN[id]);
  for (let i = 0; i < manquants.length; i += 150) {
    const paquet = manquants.slice(i, i + 150);
    const requete = `SELECT ?appid ?min ?max WHERE {
      VALUES ?appid { ${paquet.map((id) => `"${id}"`).join(' ')} }
      ?jeu wdt:P1733 ?appid .
      OPTIONAL { ?jeu wdt:P1872 ?min . }
      OPTIONAL { ?jeu wdt:P1873 ?max . }
    }`;
    const url = new URL('https://query.wikidata.org/sparql');
    url.searchParams.set('query', requete);
    url.searchParams.set('format', 'json');
    const reponse = await fetchFn(url, { headers: { 'User-Agent': 'Tinder-games (https://github.com/confipotegaming/Tinder-games)' } });
    if (!reponse.ok) throw new Error(`Wikidata : erreur ${reponse.status}`);
    for (const id of paquet) joueursWikidata.set(id, null);
    for (const ligne of (await reponse.json()).results?.bindings || []) {
      const id = Number(ligne.appid.value);
      const max = Number(ligne.max?.value);
      if (!max) continue;
      // Un jeu peut avoir plusieurs valeurs (ex. 4 en coop, 8 en versus) : on garde les plus larges.
      const min = Number(ligne.min?.value) || 1;
      const avant = joueursWikidata.get(id);
      joueursWikidata.set(id, avant ? [Math.min(avant[0], min), Math.max(avant[1], max)] : [min, max]);
    }
  }
}

// « 2 joueurs », « 1 à 4 joueurs »…
function texteJoueurs([min, max]) {
  return min === max ? `${min} joueur${min > 1 ? 's' : ''}` : `${min} à ${max} joueurs`;
}

// Traduit les infos du magasin en « envies », nombre de joueurs et étiquettes affichées.
function decrire(appid) {
  const infos = infosMagasin.get(appid);
  // Nombre de joueurs : notre liste, sinon Wikidata.
  const connu = JOUEURS_A_LA_MAIN[appid] || joueursWikidata.get(appid);
  if (!infos) return connu ? { joueurs: connu, infoJoueurs: texteJoueurs(connu) } : {};

  const envies = ENVIES.filter((e) => e.tagsSteam.some((t) => infos.tags.includes(t))).map((e) => e.cle);
  if (infos.joueurs.some((c) => COOP.includes(c)) && !envies.includes('coop')) envies.push('coop');
  if (infos.joueurs.some((c) => VERSUS.includes(c)) && !envies.includes('versus')) envies.push('versus');
  const multi = infos.joueurs.some((c) => MULTI.includes(c));
  // Sinon, Steam dit seulement « solo » ou « à plusieurs » : un jeu à plusieurs dont on ne connaît
  // pas le maximum compte pour 2 joueurs, pour ne jamais proposer à 5 un jeu qui se joue à 2.
  let joueurs = connu;
  let infoJoueurs = connu && texteJoueurs(connu);
  if (!connu && multi) [joueurs, infoJoueurs] = [[1, 2], 'à plusieurs (max inconnu)'];
  else if (!connu && infos.joueurs.length) [joueurs, infoJoueurs] = [[1, 1], 'solo'];
  return {
    envies,
    joueurs,
    infoJoueurs,
    etiquettes: infos.tags.slice(0, 3).map((t) => nomsDesTags?.get(t)).filter(Boolean),
  };
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
  const appids = communs.map((g) => g.appid);
  // Si l'un de ces services ne répond pas, on continue sans ses infos.
  await Promise.all([
    chargerInfosMagasin(appids, fetchFn).catch((e) => console.error('Magasin Steam indisponible :', e.message)),
    chargerJoueursWikidata(appids, fetchFn).catch((e) => console.error('Wikidata indisponible :', e.message)),
  ]);

  return communs.map((g) => {
    const description = decrire(g.appid);
    const morceaux = [description.infoJoueurs, ...bibliotheques.map((b) => `${b.nom} : ${heures(b.jeux.get(g.appid).minutes)}`)];
    return {
      id: `steam-${g.appid}`,
      titre: g.nom,
      sousTitre: morceaux.filter(Boolean).join(' · '),
      etiquettes: [],
      ...description,
      emoji: '🎮',
      image: `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${g.appid}/header.jpg`,
      description: '',
      lien: `https://store.steampowered.com/app/${g.appid}`,
      texteLien: 'Page Steam',
    };
  });
}

module.exports = { lireProfil, trouverId, jeuxEnCommun, ErreurSteam, _cache: cache, _infosMagasin: infosMagasin, _joueursWikidata: joueursWikidata };
