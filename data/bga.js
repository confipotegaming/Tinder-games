'use strict';
// Jeux de société jouables sur Board Game Arena (https://boardgamearena.com).
// La première colonne est le nom du jeu dans l'adresse BGA (gamepanel?game=...).
// joueurs : [minimum, maximum].
// Les deux dernières colonnes : les envies (voir lib/criteres.js) et la durée d'une partie en minutes.

const jeux = [
  ['skull', 'Skull', 'Bluff', '💀', [3, 6], 'Des fleurs et un crâne : pariez sur le nombre de fleurs que vous pouvez retourner sans tomber sur un crâne.', 'bluff rigolade', 20],
  ['sechsnimmt', '6 qui prend !', 'Cartes', '🐮', [2, 10], 'Posez vos cartes en même temps et évitez de ramasser les têtes de bœuf.', 'rigolade', 20],
  ['justone', 'Just One', 'Coopératif, mots', '💡', [3, 7], 'Donnez chacun un indice pour faire deviner un mot… mais les indices en double sont effacés.', 'coop quiz rigolade', 20],
  ['hanabi', 'Hanabi', 'Coopératif, cartes', '🎆', [2, 5], 'Construisez un feu d’artifice ensemble, sans voir vos propres cartes.', 'coop reflexion', 25],
  ['thecrew', 'The Crew', 'Coopératif, cartes', '🚀', [3, 5], 'Un jeu de plis coopératif, en missions de plus en plus difficiles.', 'coop reflexion', 20],
  ['loveletter', 'Love Letter', 'Bluff, cartes', '💌', [2, 6], 'Faites parvenir votre lettre à la princesse en éliminant les autres prétendants.', 'bluff', 20],
  ['saboteur', 'Saboteur', 'Bluff', '⛏️', [3, 10], 'Des nains creusent vers l’or… mais des saboteurs se cachent parmi eux.', 'bluff rigolade', 30],
  ['kingoftokyo', 'King of Tokyo', 'Dés', '🦍', [2, 6], 'Des monstres géants se battent pour Tokyo à coups de dés.', 'versus rigolade', 30],
  ['incangold', 'Incan Gold', 'Stop ou encore', '🏺', [3, 8], 'Explorez un temple : continuez pour plus de trésors, ou rentrez avant les pièges.', 'rigolade', 20],
  ['cantstop', 'Can’t Stop', 'Dés, stop ou encore', '🎲', [2, 4], 'Lancez les dés tant que vous osez, mais un mauvais lancer fait tout perdre.', 'rigolade detente', 30],
  ['sevenwonders', '7 Wonders', 'Stratégie', '🏛️', [3, 7], 'Développez votre civilisation en trois âges en choisissant des cartes en même temps.', 'reflexion', 30],
  ['carcassonne', 'Carcassonne', 'Placement de tuiles', '🏰', [2, 5], 'Construisez routes, villes et abbayes tuile après tuile.', 'reflexion detente', 40],
  ['kingdomino', 'Kingdomino', 'Placement de tuiles', '👑', [2, 4], 'Construisez un petit royaume avec des dominos de paysages.', 'reflexion detente', 20],
  ['takenoko', 'Takenoko', 'Familial', '🐼', [2, 4], 'Faites pousser du bambou… que le panda de l’empereur s’empresse de manger.', 'detente', 45],
  ['azul', 'Azul', 'Familial', '🔷', [2, 4], 'Récupérez des carreaux de couleur pour décorer le palais royal.', 'reflexion detente', 40],
  ['sushigo', 'Sushi Go !', 'Cartes', '🍣', [2, 5], 'Choisissez un sushi et passez le reste à votre voisin. Rapide et mignon.', 'detente rigolade', 15],
  ['splendor', 'Splendor', 'Stratégie', '💎', [2, 4], 'Marchand de pierres précieuses, gagnez le prestige et la visite des nobles.', 'reflexion', 30],
  ['diceforge', 'Dice Forge', 'Dés', '⚒️', [2, 4], 'Améliorez vos propres dés en changeant leurs faces.', 'reflexion', 45],
  ['boomerangaustralia', 'Boomerang : Australia', 'Cartes', '🪃', [2, 4], 'Voyagez en Australie en draftant des cartes de lieux à visiter.', 'detente', 30],
  ['luckynumbers', 'Lucky Numbers', 'Familial', '🍀', [1, 4], 'Remplissez votre grille de trèfles numérotés dans l’ordre croissant.', 'detente reflexion', 20],
  ['welcometo', 'Welcome To…', 'Papier-crayon', '🏡', [1, 100], 'Construisez votre quartier en remplissant une feuille. Tout le monde joue en même temps.', 'reflexion detente', 30],
  ['cartographers', 'Cartographers', 'Papier-crayon', '🗺️', [1, 100], 'Dessinez la carte du royaume selon les ordres de la reine, en évitant les monstres.', 'reflexion detente', 40],
  ['bandido', 'Bandido', 'Coopératif', '🤠', [1, 4], 'Bloquez ensemble tous les tunnels pour empêcher le bandit de s’évader.', 'coop detente', 15],
  ['frenchtarot', 'Tarot', 'Cartes', '🃏', [3, 5], 'Le grand classique français : prise, garde, petit au bout…', 'reflexion versus', 45],
  ['belote', 'Belote', 'Cartes', '♠️', [4, 4], 'L’autre grand classique, en équipes de deux.', 'versus', 45],
  ['hearts', 'Hearts (la Dame de pique)', 'Cartes', '♥️', [4, 4], 'Évitez de ramasser les cœurs et surtout la Dame de pique.', 'versus', 30],
];

module.exports = jeux.map(([nomBga, titre, genre, emoji, joueurs, description, envies, duree]) => ({
  id: `bga-${nomBga}`,
  titre,
  sousTitre: `${joueurs[1] >= 100 ? `À partir de ${joueurs[0]} joueur` : `${joueurs[0]} à ${joueurs[1]} joueurs`} · ~${duree} min`,
  etiquettes: genre.split(', '),
  emoji,
  joueurs,
  envies: envies.split(' '),
  duree,
  description,
  lien: `https://boardgamearena.com/gamepanel?game=${nomBga}`,
  texteLien: 'Voir sur BGA',
}));
