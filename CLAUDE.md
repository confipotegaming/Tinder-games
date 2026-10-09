# CLAUDE.md — Tinder-games

Appli de « swipe » entre amis (jeux Steam d'Elizou, jeux web, Board Game Arena) :
l'hôte coche une ou plusieurs sources (mélangées dans une pile), répond à quelques questions
(joueurs, envies, durée), puis un match quand tous disent oui. Voir `README.md`.

La porteuse du projet débute en code : **expliquer simplement**, en français, sans jargon inutile.
Code, commentaires et textes affichés en français.

- Stack : Node 22, Express, socket.io, JavaScript sans framework ni build (`public/` servi tel quel).
- Règles du match dans `lib/salon.js` (sans réseau, testé dans `test/salon.test.js`).
- Questions et tri : `lib/criteres.js` (envies, durées). Chaque jeu web/BGA a ses `envies` et sa `duree`.
- Steam : `lib/steam.js`, clé dans `STEAM_API_KEY` (jamais dans le code), profil fixe `PROFIL_STEAM`
  dans `server.js` (ou `STEAM_PROFIL`). Les envies Steam viennent des étiquettes du magasin
  (`IStoreBrowseService/GetItems`, sans clé). Nombre de joueurs : `data/steam-joueurs.js`, sinon
  Wikidata (P1733 = appid Steam, P1872/P1873 = min/max), sinon multi inconnu = [1, 2].
  Les tests utilisent un faux Steam.
- Images : boîtes BGA (`x.boardgamearena.net/.../box/fr|en.png`), image de partage des sites web ;
  sans image fiable, on garde l'emoji.
- Listes : `data/web.js`, `data/bga.js`. Vérifier qu'un nouveau lien BGA existe
  (`https://boardgamearena.com/gamepanel?game=<nom>` répond 200, un nom inconnu donne 500).
- Tester avec `npm test` avant chaque commit ; une petite étape à la fois.
