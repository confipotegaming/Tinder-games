'use strict';
// Jeux qui se jouent directement dans le navigateur, sans rien installer.
// joueurs : [minimum, maximum] — sert à cacher les jeux qui ne vont pas avec la taille du groupe.
// Les deux dernières colonnes : les envies (voir lib/criteres.js) et la durée d'une partie en minutes.

const jeux = [
  ['skribbl', 'skribbl.io', 'Dessin', '✏️', [2, 12], 'Gratuit', 'Un joueur dessine un mot, les autres devinent le plus vite possible.', 'https://skribbl.io', 'dessin rigolade', 15],
  ['gartic-phone', 'Gartic Phone', 'Dessin', '📞', [4, 30], 'Gratuit', 'Le téléphone arabe en dessins : une phrase, un dessin, une phrase… et ça dérape.', 'https://garticphone.com', 'dessin rigolade', 15],
  ['gartic-io', 'Gartic.io', 'Dessin', '🖍️', [2, 10], 'Gratuit', 'Dessine et fais deviner, avec des salons et des thèmes en français.', 'https://gartic.io', 'dessin', 15],
  ['drawasaurus', 'Drawasaurus', 'Dessin', '🦕', [2, 16], 'Gratuit', 'Un autre jeu de dessin et devinettes, simple et sans pub envahissante.', 'https://drawasaurus.org', 'dessin', 15],
  ['bombparty', 'BombParty (JKLM.fun)', 'Mots', '💣', [2, 16], 'Gratuit', 'Trouve un mot qui contient les lettres demandées avant que la bombe explose. Marche en français.', 'https://jklm.fun', 'quiz versus', 10],
  ['popsauce', 'PopSauce (JKLM.fun)', 'Quiz', '🍿', [2, 16], 'Gratuit', 'Quiz de culture pop avec images : films, logos, drapeaux… Le plus rapide gagne.', 'https://jklm.fun', 'quiz versus', 10],
  ['songtrivia', 'SongTrivia', 'Blind test', '🎵', [1, 20], 'Gratuit', 'Blind test en ligne : des playlists par thème, décennie ou artiste.', 'https://songtrivia2.io', 'quiz versus', 15],
  ['petit-bac', 'Le Petit Bac', 'Mots', '📝', [2, 10], 'Gratuit', 'Un prénom, un pays, un animal… qui commence par la lettre tirée au sort.', 'https://petitbac.net', 'quiz rigolade', 15],
  ['codenames', 'Codenames', 'Équipes', '🕵️', [4, 10], 'Gratuit', 'Deux équipes, un indice d’un mot pour faire deviner plusieurs cartes.', 'https://codenames.game', 'quiz reflexion versus', 20],
  ['spyfall', 'Spyfall', 'Bluff', '🕵️‍♀️', [3, 8], 'Gratuit', 'Tout le monde connaît le lieu, sauf l’espion. Démasquez-le en posant des questions.', 'https://spyfall.app', 'bluff rigolade', 10],
  ['make-it-meme', 'Make It Meme', 'Rigolade', '😂', [3, 12], 'Gratuit', 'Chacun crée un mème à partir de la même image, puis on vote pour le plus drôle.', 'https://makeitmeme.com', 'rigolade dessin', 15],
  ['geoguessr', 'GeoGuessr', 'Exploration', '🌍', [1, 20], 'Gratuit en partie', 'Tu es lâché dans Street View : devine où tu es dans le monde.', 'https://www.geoguessr.com', 'quiz reflexion', 15],
  ['wiki-speedruns', 'Wikipedia Speedruns', 'Course', '📚', [1, 10], 'Gratuit', 'Aller d’une page Wikipédia à une autre en cliquant seulement sur les liens.', 'https://wikispeedruns.com', 'quiz versus', 10],
  ['smash-karts', 'Smash Karts', 'Course, action', '🏎️', [1, 8], 'Gratuit', 'Des petits karts armés de roquettes dans une arène. Chaotique à souhait.', 'https://smashkarts.io', 'action versus', 10],
  ['krunker', 'Krunker', 'Tir', '🔫', [1, 8], 'Gratuit', 'Jeu de tir rapide en vue subjective, style pixel.', 'https://krunker.io', 'action versus', 10],
  ['bloxd', 'Bloxd.io', 'Construction', '🧱', [1, 10], 'Gratuit', 'Un univers en cubes façon Minecraft, avec des mini-jeux à plusieurs.', 'https://bloxd.io', 'dessin detente', 30],
];

// Image de présentation de chaque site (celle qui s'affiche quand on partage le lien).
// Pas d'image fiable pour Codenames, Spyfall et Wikipedia Speedruns : on garde l'emoji.
// [adresse, entière ?] : « entière » pour les logos carrés qu'il ne faut pas rogner.
const IMAGES = {
  skribbl: ['https://skribbl.io/img/thumbnail.png'],
  'gartic-phone': ['https://garticphone.com/images/thumb.png'],
  'gartic-io': ['https://gartic.io/static/images/thumb.png'],
  drawasaurus: ['https://www.drawasaurus.org/_next/static/media/cover.b97fbc1a.png'],
  bombparty: ['https://jklm.fun/images/icon512.png', true],
  popsauce: ['https://jklm.fun/images/icon512.png', true],
  songtrivia: ['https://songtrivia.io/og-default.png'],
  'petit-bac': ['https://petitbac.net/static/share/share-fr.png'],
  'make-it-meme': ['https://makeitmeme.com/header.webp'],
  geoguessr: ['https://www.geoguessr.com/_next/static/media/default.e7343242.webp'],
  'smash-karts': ['https://smashkarts.io/images/icon-144.png', true],
  krunker: ['https://assets.krunker.io/promo/og_1200x630.jpg'],
  bloxd: ['https://bloxd.io/textures/miscImages/bloxd_io_free_online_games.jpg'],
};

module.exports = jeux.map(([id, titre, genre, emoji, joueurs, prix, description, lien, envies, duree]) => ({
  id: `web-${id}`,
  titre,
  sousTitre: `${joueurs[0]} à ${joueurs[1]} joueurs · ~${duree} min · ${prix}`,
  etiquettes: genre.split(', '),
  emoji,
  image: IMAGES[id]?.[0],
  imageEntiere: Boolean(IMAGES[id]?.[1]),
  joueurs,
  envies: envies.split(' '),
  duree,
  description,
  lien,
  texteLien: 'Jouer',
}));
