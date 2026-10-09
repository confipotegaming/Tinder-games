'use strict';
// Les questions posées avant de swiper, et le tri des jeux selon les réponses.

// Les « envies » proposées. Pour Steam, on les reconnaît grâce aux étiquettes du magasin
// (numéros trouvés avec https://api.steampowered.com/IStoreService/GetTagList/v1/?language=french).
const ENVIES = [
  { cle: 'coop', nom: 'Coopératif', emoji: '🤝', tagsSteam: [1685, 3843, 3841, 4508] },
  { cle: 'versus', nom: 'Les uns contre les autres', emoji: '⚔️', tagsSteam: [1775, 3878] },
  { cle: 'rigolade', nom: 'Rigolade', emoji: '😂', tagsSteam: [7178, 4136] },
  { cle: 'bluff', nom: 'Bluff & déduction', emoji: '🎭', tagsSteam: [745697, 8369] },
  { cle: 'dessin', nom: 'Dessin & création', emoji: '🎨', tagsSteam: [1643, 3810] },
  { cle: 'quiz', nom: 'Quiz & mots', emoji: '🧠', tagsSteam: [10437] },
  { cle: 'reflexion', nom: 'Réflexion & stratégie', emoji: '🧩', tagsSteam: [9, 1664, 1708, 6129, 1770, 1666] },
  { cle: 'action', nom: 'Action', emoji: '💥', tagsSteam: [19, 1774, 1663, 699, 701, 3993] },
  { cle: 'frissons', nom: 'Frissons', emoji: '👻', tagsSteam: [1667, 3978, 1721, 1659] },
  { cle: 'detente', nom: 'Tranquille', emoji: '🌿', tagsSteam: [1654, 5350, 4726] },
];

// Durées : la valeur est la durée maximale d'une partie, en minutes.
const DUREES = [
  { valeur: 20, nom: 'Rapide', detail: '20 min max', emoji: '⚡' },
  { valeur: 45, nom: 'Moyen', detail: '45 min max', emoji: '⏱️' },
  { valeur: 0, nom: 'Peu importe', detail: '', emoji: '🌙' },
];

// Nettoie ce que le navigateur envoie, pour ne garder que des réponses valables.
function lireCriteres(brut = {}, nombreDansLeSalon = 1) {
  const joueurs = Number.parseInt(brut.joueurs, 10);
  const cles = new Set(ENVIES.map((e) => e.cle));
  return {
    joueurs: Number.isFinite(joueurs) ? Math.min(Math.max(joueurs, 1), 100) : nombreDansLeSalon,
    envies: Array.isArray(brut.envies) ? [...new Set(brut.envies.filter((c) => cles.has(c)))] : [],
    duree: DUREES.some((d) => d.valeur === brut.duree) ? brut.duree : 0,
  };
}

// Garde les jeux qui correspondent aux réponses.
// - nombre de joueurs : le jeu doit l'accepter (si on le connaît) ;
// - envies : au moins une des envies choisies (aucune choisie = tout va) ;
// - durée : seulement pour les jeux dont on connaît la durée.
function filtrer(cartes, criteres) {
  return cartes.filter((c) => {
    if (c.joueurs && (criteres.joueurs < c.joueurs[0] || criteres.joueurs > c.joueurs[1])) return false;
    if (criteres.envies.length && !criteres.envies.some((e) => (c.envies || []).includes(e))) return false;
    if (criteres.duree && c.duree && c.duree > criteres.duree) return false;
    return true;
  });
}

// Petit résumé lisible, affiché pendant le swipe : « 4 joueurs · 🤝 😂 · Rapide ».
function resume(criteres) {
  const morceaux = [`${criteres.joueurs} joueur${criteres.joueurs > 1 ? 's' : ''}`];
  if (criteres.envies.length) morceaux.push(criteres.envies.map((c) => ENVIES.find((e) => e.cle === c).emoji).join(' '));
  if (criteres.duree) morceaux.push(DUREES.find((d) => d.valeur === criteres.duree).nom);
  return morceaux.join(' · ');
}

module.exports = { ENVIES, DUREES, lireCriteres, filtrer, resume };
