'use strict';
// Jeux de société jouables sur Board Game Arena (https://boardgamearena.com).
// La première colonne est le nom du jeu dans l'adresse BGA (gamepanel?game=...).
// joueurs : [minimum, maximum].

const jeux = [
  ['skull', 'Skull', 'Bluff', '💀', [3, 6], 'Des fleurs et un crâne : pariez sur le nombre de fleurs que vous pouvez retourner sans tomber sur un crâne.'],
  ['sechsnimmt', '6 qui prend !', 'Cartes', '🐮', [2, 10], 'Posez vos cartes en même temps et évitez de ramasser les têtes de bœuf.'],
  ['justone', 'Just One', 'Coopératif, mots', '💡', [3, 7], 'Donnez chacun un indice pour faire deviner un mot… mais les indices en double sont effacés.'],
  ['hanabi', 'Hanabi', 'Coopératif, cartes', '🎆', [2, 5], 'Construisez un feu d’artifice ensemble, sans voir vos propres cartes.'],
  ['thecrew', 'The Crew', 'Coopératif, cartes', '🚀', [3, 5], 'Un jeu de plis coopératif, en missions de plus en plus difficiles.'],
  ['loveletter', 'Love Letter', 'Bluff, cartes', '💌', [2, 6], 'Faites parvenir votre lettre à la princesse en éliminant les autres prétendants.'],
  ['saboteur', 'Saboteur', 'Bluff', '⛏️', [3, 10], 'Des nains creusent vers l’or… mais des saboteurs se cachent parmi eux.'],
  ['kingoftokyo', 'King of Tokyo', 'Dés', '🦍', [2, 6], 'Des monstres géants se battent pour Tokyo à coups de dés.'],
  ['incangold', 'Incan Gold', 'Stop ou encore', '🏺', [3, 8], 'Explorez un temple : continuez pour plus de trésors, ou rentrez avant les pièges.'],
  ['cantstop', 'Can’t Stop', 'Dés, stop ou encore', '🎲', [2, 4], 'Lancez les dés tant que vous osez, mais un mauvais lancer fait tout perdre.'],
  ['sevenwonders', '7 Wonders', 'Stratégie', '🏛️', [3, 7], 'Développez votre civilisation en trois âges en choisissant des cartes en même temps.'],
  ['carcassonne', 'Carcassonne', 'Placement de tuiles', '🏰', [2, 5], 'Construisez routes, villes et abbayes tuile après tuile.'],
  ['kingdomino', 'Kingdomino', 'Placement de tuiles', '👑', [2, 4], 'Construisez un petit royaume avec des dominos de paysages.'],
  ['takenoko', 'Takenoko', 'Familial', '🐼', [2, 4], 'Faites pousser du bambou… que le panda de l’empereur s’empresse de manger.'],
  ['azul', 'Azul', 'Familial', '🔷', [2, 4], 'Récupérez des carreaux de couleur pour décorer le palais royal.'],
  ['sushigo', 'Sushi Go !', 'Cartes', '🍣', [2, 5], 'Choisissez un sushi et passez le reste à votre voisin. Rapide et mignon.'],
  ['splendor', 'Splendor', 'Stratégie', '💎', [2, 4], 'Marchand de pierres précieuses, gagnez le prestige et la visite des nobles.'],
  ['diceforge', 'Dice Forge', 'Dés', '⚒️', [2, 4], 'Améliorez vos propres dés en changeant leurs faces.'],
  ['boomerangaustralia', 'Boomerang : Australia', 'Cartes', '🪃', [2, 4], 'Voyagez en Australie en draftant des cartes de lieux à visiter.'],
  ['luckynumbers', 'Lucky Numbers', 'Familial', '🍀', [1, 4], 'Remplissez votre grille de trèfles numérotés dans l’ordre croissant.'],
  ['welcometo', 'Welcome To…', 'Papier-crayon', '🏡', [1, 100], 'Construisez votre quartier en remplissant une feuille. Tout le monde joue en même temps.'],
  ['cartographers', 'Cartographers', 'Papier-crayon', '🗺️', [1, 100], 'Dessinez la carte du royaume selon les ordres de la reine, en évitant les monstres.'],
  ['bandido', 'Bandido', 'Coopératif', '🤠', [1, 4], 'Bloquez ensemble tous les tunnels pour empêcher le bandit de s’évader.'],
  ['frenchtarot', 'Tarot', 'Cartes', '🃏', [3, 5], 'Le grand classique français : prise, garde, petit au bout…'],
  ['belote', 'Belote', 'Cartes', '♠️', [4, 4], 'L’autre grand classique, en équipes de deux.'],
  ['hearts', 'Hearts (la Dame de pique)', 'Cartes', '♥️', [4, 4], 'Évitez de ramasser les cœurs et surtout la Dame de pique.'],
];

module.exports = jeux.map(([nomBga, titre, genre, emoji, joueurs, description]) => ({
  id: `bga-${nomBga}`,
  titre,
  sousTitre: joueurs[1] >= 100 ? `À partir de ${joueurs[0]} joueur` : `${joueurs[0]} à ${joueurs[1]} joueurs`,
  etiquettes: genre.split(', '),
  emoji,
  joueurs,
  description,
  lien: `https://boardgamearena.com/gamepanel?game=${nomBga}`,
  texteLien: 'Voir sur BGA',
}));
