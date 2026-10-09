'use strict';
// Nombre de joueurs de jeux Steam que Wikidata ne connaît pas (ou mal).
// Ce qui est écrit ici passe avant Wikidata.
// Pour ajouter un jeu : son numéro est dans l'adresse de sa page Steam
// (store.steampowered.com/app/1966720/... → 1966720), puis [minimum, maximum].

module.exports = {
  1966720: [1, 4], // Lethal Company
  739630: [1, 4], // Phasmophobia
  2881650: [1, 4], // Content Warning
  892970: [1, 10], // Valheim
  105600: [1, 8], // Terraria
  322330: [1, 6], // Don't Starve Together
  1172620: [1, 4], // Sea of Thieves
  2001120: [2, 2], // Split Fiction
  1426210: [2, 2], // It Takes Two
  285900: [1, 8], // Gang Beasts
  431240: [1, 12], // Golf With Your Friends
  880940: [1, 8], // Pummel Party
};
