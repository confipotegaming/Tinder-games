'use strict';
// Jeux qui se jouent directement dans le navigateur, sans rien installer.
// joueurs : [minimum, maximum] — sert à cacher les jeux qui ne vont pas avec la taille du groupe.

const jeux = [
  ['skribbl', 'skribbl.io', 'Dessin', '✏️', [2, 12], 'Gratuit', 'Un joueur dessine un mot, les autres devinent le plus vite possible.', 'https://skribbl.io'],
  ['gartic-phone', 'Gartic Phone', 'Dessin', '📞', [4, 30], 'Gratuit', 'Le téléphone arabe en dessins : une phrase, un dessin, une phrase… et ça dérape.', 'https://garticphone.com'],
  ['gartic-io', 'Gartic.io', 'Dessin', '🖍️', [2, 10], 'Gratuit', 'Dessine et fais deviner, avec des salons et des thèmes en français.', 'https://gartic.io'],
  ['drawasaurus', 'Drawasaurus', 'Dessin', '🦕', [2, 16], 'Gratuit', 'Un autre jeu de dessin et devinettes, simple et sans pub envahissante.', 'https://drawasaurus.org'],
  ['bombparty', 'BombParty (JKLM.fun)', 'Mots', '💣', [2, 16], 'Gratuit', 'Trouve un mot qui contient les lettres demandées avant que la bombe explose. Marche en français.', 'https://jklm.fun'],
  ['popsauce', 'PopSauce (JKLM.fun)', 'Quiz', '🍿', [2, 16], 'Gratuit', 'Quiz de culture pop avec images : films, logos, drapeaux… Le plus rapide gagne.', 'https://jklm.fun'],
  ['songtrivia', 'SongTrivia', 'Blind test', '🎵', [1, 20], 'Gratuit', 'Blind test en ligne : des playlists par thème, décennie ou artiste.', 'https://songtrivia2.io'],
  ['petit-bac', 'Le Petit Bac', 'Mots', '📝', [2, 10], 'Gratuit', 'Un prénom, un pays, un animal… qui commence par la lettre tirée au sort.', 'https://petitbac.net'],
  ['codenames', 'Codenames', 'Équipes', '🕵️', [4, 10], 'Gratuit', 'Deux équipes, un indice d’un mot pour faire deviner plusieurs cartes.', 'https://codenames.game'],
  ['spyfall', 'Spyfall', 'Bluff', '🕵️‍♀️', [3, 8], 'Gratuit', 'Tout le monde connaît le lieu, sauf l’espion. Démasquez-le en posant des questions.', 'https://spyfall.app'],
  ['make-it-meme', 'Make It Meme', 'Rigolade', '😂', [3, 12], 'Gratuit', 'Chacun crée un mème à partir de la même image, puis on vote pour le plus drôle.', 'https://makeitmeme.com'],
  ['geoguessr', 'GeoGuessr', 'Exploration', '🌍', [1, 20], 'Gratuit en partie', 'Tu es lâché dans Street View : devine où tu es dans le monde.', 'https://www.geoguessr.com'],
  ['wiki-speedruns', 'Wikipedia Speedruns', 'Course', '📚', [1, 10], 'Gratuit', 'Aller d’une page Wikipédia à une autre en cliquant seulement sur les liens.', 'https://wikispeedruns.com'],
  ['smash-karts', 'Smash Karts', 'Course, action', '🏎️', [1, 8], 'Gratuit', 'Des petits karts armés de roquettes dans une arène. Chaotique à souhait.', 'https://smashkarts.io'],
  ['krunker', 'Krunker', 'Tir', '🔫', [1, 8], 'Gratuit', 'Jeu de tir rapide en vue subjective, style pixel.', 'https://krunker.io'],
  ['bloxd', 'Bloxd.io', 'Construction', '🧱', [1, 10], 'Gratuit', 'Un univers en cubes façon Minecraft, avec des mini-jeux à plusieurs.', 'https://bloxd.io'],
];

module.exports = jeux.map(([id, titre, genre, emoji, joueurs, prix, description, lien]) => ({
  id: `web-${id}`,
  titre,
  sousTitre: `${joueurs[0]} à ${joueurs[1]} joueurs · ${prix}`,
  etiquettes: genre.split(', '),
  emoji,
  joueurs,
  description,
  lien,
  texteLien: 'Jouer',
}));
