# Tinder-games 💘

On swipe entre amis, chacun sur son téléphone : **à droite = oui**, **à gauche = non**.
Quand **tout le monde** a dit oui à la même carte, c’est un **match** !

Quatre catégories :

| Catégorie | D’où viennent les cartes |
| --- | --- |
| 🎬 Films | Une liste choisie à la main (`data/films.js`) |
| 🎮 Jeux Steam | Les jeux que **tous** les joueurs ayant donné leur profil Steam possèdent |
| 🌐 Jeux web | skribbl.io, Gartic Phone, blind test, Codenames… (`data/web.js`) |
| 🎲 Board Game Arena | Skull, Just One, 6 qui prend… (`data/bga.js`) |

Les jeux web et BGA qui ne se jouent pas avec le nombre de joueurs du salon sont cachés automatiquement.

## Comment jouer

1. Une personne ouvre le site, écrit son prénom et clique **Créer un salon**.
2. Les autres tapent le **code à 4 lettres** (ou ouvrent le lien partagé).
3. L’hôte (👑) choisit la catégorie, et tout le monde swipe.
4. Le bouton 💘 en haut à droite montre tous les matchs.

## La partie Steam

Steam ne donne la liste des jeux qu’avec une **clé** (gratuite) et un profil public.

- **Chaque joueur** : Steam → Profil → Modifier le profil → Paramètres de confidentialité →
  « Détails des jeux » sur **Public**. Puis coller le lien de son profil sur la page d’accueil.
- **Une seule fois, pour le serveur** : créer une clé sur https://steamcommunity.com/dev/apikey
  (nom de domaine : mettre l’adresse du site, par ex. `tinder-games.onrender.com`).
  La mettre dans la variable d’environnement `STEAM_API_KEY` (sur Render : *Environment*).
  **Ne jamais écrire la clé dans le code ni la partager.**

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
| `lib/steam.js` | Lecture des bibliothèques Steam |
| `data/*.js` | Les listes de films et de jeux (faciles à compléter) |
| `public/` | Ce qui s’affiche dans le navigateur (page, style, swipe) |
| `test/` | Les tests automatiques |
