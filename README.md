# Tinder-games 💘

On swipe entre amis, chacun sur son téléphone : **à droite = oui**, **à gauche = non**.
Quand **tout le monde** a dit oui à la même carte, c’est un **match** !

Trois sources de jeux, à choisir seules ou ensemble (leurs jeux sont alors mélangés) :

| Catégorie | D’où viennent les cartes |
| --- | --- |
| 🎮 Jeux Steam | La bibliothèque Steam d’Elizou, lue automatiquement |
| 🌐 Jeux web | skribbl.io, Gartic Phone, blind test, Petit Bac… (`data/web.js`) |
| 🎲 Board Game Arena | Skull, Just One, 6 qui prend… avec l’image de la boîte (`data/bga.js`) |

## Comment jouer

1. Une personne ouvre le site, écrit son prénom et clique **Créer un salon**.
2. Les autres tapent le **code à 4 lettres** (ou ouvrent le lien partagé).
3. L’hôte (👑) coche une ou plusieurs sources, puis répond à quelques questions :
   - **combien de joueurs** ;
   - **envie de quoi** : coopératif, bluff, dessin, quiz, frissons, tranquille… (rien de coché = tout) ;
   - **combien de temps** (seulement si le web ou BGA est coché : Steam ne donne pas la durée des parties).
4. Seuls les jeux qui correspondent arrivent dans la pile, et tout le monde swipe.
5. Le bouton 💘 en haut à droite montre tous les matchs.

## La partie Steam

- Le site lit la bibliothèque du profil https://steamcommunity.com/profiles/76561199102603212
  (pour en utiliser un autre : variable d’environnement `STEAM_PROFIL`).
  Dans la confidentialité du profil, « Détails des jeux » doit être sur **Public**.
- Il faut une **clé Steam** dans la variable d’environnement `STEAM_API_KEY`
  (créée sur https://steamcommunity.com/dev/apikey). **Ne jamais l’écrire dans le code.**
- Le type de chaque jeu (coop, horreur, stratégie…) vient du magasin Steam.
- Le **nombre de joueurs** vient de `data/steam-joueurs.js` (liste à la main), sinon de Wikidata.
  Si personne ne le connaît, un jeu « à plusieurs » compte pour **2 joueurs maximum**, pour ne
  jamais proposer à 5 un jeu qui se joue à 2. Pour corriger un jeu, l’ajouter dans `data/steam-joueurs.js`.

## Commandes

| Commande | Rôle |
| --- | --- |
| `npm install` | Installe les outils (une fois) |
| `npm start` | Lance le site sur http://localhost:3000 |
| `npm test` | Vérifie automatiquement que tout marche |

Avec Steam en local : `STEAM_API_KEY=ta_cle npm start`.

## Mettre en ligne sur Render

New → Web Service → ce dépôt. Build : `npm install`, Start : `npm start`,
puis ajouter `STEAM_API_KEY` dans *Environment*. (Le fichier `render.yaml` contient les mêmes réglages.)

## Organisation

| Fichier | Rôle |
| --- | --- |
| `server.js` | Le serveur : salons, votes, envoi des cartes |
| `lib/salon.js` | Les règles : qui a voté quoi, quand c’est un match |
| `lib/criteres.js` | Les questions (envies, durées) et le tri des jeux |
| `lib/steam.js` | Lecture des bibliothèques Steam |
| `data/*.js` | Les listes de jeux (faciles à compléter) |
| `public/` | Ce qui s’affiche dans le navigateur (page, style, swipe) |
| `test/` | Les tests automatiques |
