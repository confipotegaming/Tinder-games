# CLAUDE.md — Tinder-games

Appli de « swipe » entre amis (films, jeux Steam en commun, jeux web, Board Game Arena) :
un match quand tous les joueurs du salon disent oui. Voir `README.md`.

La porteuse du projet débute en code : **expliquer simplement**, en français, sans jargon inutile.
Code, commentaires et textes affichés en français.

- Stack : Node 22, Express, socket.io, JavaScript sans framework ni build (`public/` servi tel quel).
- Règles du match dans `lib/salon.js` (sans réseau, testé dans `test/salon.test.js`).
- Steam : `lib/steam.js`, clé dans `STEAM_API_KEY` (jamais dans le code). Les tests utilisent un faux Steam.
- Listes : `data/films.js`, `data/web.js`, `data/bga.js`. Vérifier qu'un nouveau lien BGA existe
  (`https://boardgamearena.com/gamepanel?game=<nom>` répond 200, un nom inconnu donne 500).
- Tester avec `npm test` avant chaque commit ; une petite étape à la fois.
