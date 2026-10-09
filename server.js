'use strict';
// Le serveur : il envoie les pages au navigateur et fait circuler les votes entre les joueurs.

const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const { Salon, nouveauCode, melanger } = require('./lib/salon');
const steam = require('./lib/steam');
const criteres = require('./lib/criteres');

const CATEGORIES = {
  web: { nom: 'Jeux web', cartes: () => require('./data/web') },
  bga: { nom: 'Board Game Arena', cartes: () => require('./data/bga') },
  steam: { nom: 'Jeux Steam', cartes: null }, // lu dans la bibliothèque Steam (voir PROFIL_STEAM)
};

// La bibliothèque Steam utilisée pour la catégorie « Jeux Steam » (le profil d'Elizou).
// On peut en mettre une autre avec la variable d'environnement STEAM_PROFIL.
const PROFIL_STEAM = process.env.STEAM_PROFIL || 'https://steamcommunity.com/profiles/76561199102603212';

// Combien de temps on garde la place d'un joueur déconnecté (téléphone en veille…).
const DELAI_DECONNEXION = 60 * 1000;

function texte(valeur, max) {
  return typeof valeur === 'string' ? valeur.trim().slice(0, max) : '';
}

function creerServeur({ cleSteam = process.env.STEAM_API_KEY, profilSteam = PROFIL_STEAM, fetchFn = fetch } = {}) {
  const app = express();
  app.use(express.static(path.join(__dirname, 'public')));
  app.get('/sante', (req, res) => res.send('ok'));
  // Les questions posées à l'hôte (le navigateur les affiche).
  app.get('/questions', (req, res) => res.json({ envies: criteres.ENVIES, durees: criteres.DUREES }));

  const serveur = http.createServer(app);
  const io = new Server(serveur);
  const salons = new Map();

  function diffuser(salon) {
    io.to(salon.code).emit('salon', salon.etat());
  }

  function envoyerCartes(salon, socket, joueurId) {
    socket.emit('cartes', {
      categories: salon.categories,
      cartes: salon.cartes,
      mesVotes: salon.votesDe(joueurId),
      matchs: salon.matchs,
    });
  }

  function annoncerMatchs(salon, cartes) {
    for (const carte of cartes) io.to(salon.code).emit('match', carte);
  }

  io.on('connection', (socket) => {
    let salon = null;
    let joueurId = null;

    function entrer(s, d) {
      const id = texte(d.joueurId, 64);
      const nom = texte(d.nom, 20);
      if (!id || !nom) return 'Il faut un prénom.';
      if (!s.joueurs.has(id) && s.plein) return 'Ce salon est complet.';
      if (salon && salon !== s) quitter();
      const joueur = s.ajouterJoueur(id, nom);
      clearTimeout(joueur.minuteur);
      joueur.socketId = socket.id;
      salon = s;
      joueurId = id;
      socket.join(s.code);
      if (s.phase === 'swipe') envoyerCartes(s, socket, id);
      diffuser(s);
      return null;
    }

    function quitter() {
      if (!salon) return;
      const s = salon;
      socket.leave(s.code);
      annoncerMatchs(s, s.retirerJoueur(joueurId));
      salon = null;
      if (s.joueurs.size === 0) salons.delete(s.code);
      else diffuser(s);
    }

    socket.on('creer', (d = {}, ack) => {
      if (typeof ack !== 'function') return;
      const s = new Salon(nouveauCode((c) => salons.has(c)));
      salons.set(s.code, s);
      const erreur = entrer(s, d);
      if (erreur) salons.delete(s.code);
      ack(erreur ? { erreur } : { code: s.code });
    });

    socket.on('rejoindre', (d = {}, ack) => {
      if (typeof ack !== 'function') return;
      const s = salons.get(texte(d.code, 4).toUpperCase());
      if (!s) return ack({ erreur: 'Aucun salon avec ce code.' });
      const erreur = entrer(s, d);
      ack(erreur ? { erreur } : { code: s.code });
    });

    socket.on('lancer', async (d = {}, ack) => {
      if (typeof ack !== 'function') return;
      if (!salon || salon.hoteId !== joueurId) return ack({ erreur: 'Seul l’hôte peut lancer.' });
      // Une ou plusieurs sources : ['steam', 'web', 'bga'].
      const categories = [...new Set(Array.isArray(d.categories) ? d.categories : [])].filter((c) => Object.hasOwn(CATEGORIES, c));
      if (categories.length === 0) return ack({ erreur: 'Choisis au moins une source de jeux.' });
      const s = salon;
      const joueurs = [...s.joueurs.values()];
      const reponses = criteres.lireCriteres(d.criteres, joueurs.length);

      // On rassemble les jeux de toutes les sources choisies dans une seule pile.
      let cartes = [];
      for (const c of categories) {
        if (CATEGORIES[c].cartes) {
          cartes.push(...CATEGORIES[c].cartes());
          continue;
        }
        try {
          cartes.push(...await steam.jeuxEnCommun([{ nom: 'Temps de jeu', steam: profilSteam }], cleSteam, fetchFn));
        } catch (e) {
          if (!(e instanceof steam.ErreurSteam)) console.error(e);
          return ack({ erreur: e instanceof steam.ErreurSteam ? e.message : 'Impossible de joindre Steam.' });
        }
      }
      if (cartes.length === 0) return ack({ erreur: 'Aucun jeu dans la bibliothèque Steam.' });
      cartes = criteres.filtrer(cartes, reponses);
      if (cartes.length === 0) {
        return ack({ erreur: 'Aucun jeu ne correspond. Essaie avec plus d’envies ou une durée plus longue.' });
      }

      s.lancer(categories, melanger(cartes), criteres.resume(reponses));
      for (const j of s.joueurs.values()) {
        const sock = io.sockets.sockets.get(j.socketId);
        if (sock) envoyerCartes(s, sock, j.id);
      }
      diffuser(s);
      ack({});
    });

    socket.on('voter', (d = {}) => {
      if (!salon) return;
      const carte = salon.voter(joueurId, texte(d.carteId, 100), d.oui === true);
      if (carte) annoncerMatchs(salon, [carte]);
      diffuser(salon);
    });

    socket.on('retourSalon', () => {
      if (!salon || salon.hoteId !== joueurId) return;
      salon.retourAuSalon();
      diffuser(salon);
    });

    socket.on('quitter', quitter);

    socket.on('disconnect', () => {
      if (!salon) return;
      const s = salon;
      const joueur = s.joueurs.get(joueurId);
      // Le joueur s'est peut-être déjà reconnecté avec une autre connexion.
      if (!joueur || joueur.socketId !== socket.id) return;
      joueur.connecte = false;
      diffuser(s);
      const id = joueurId;
      joueur.minuteur = setTimeout(() => {
        if (s.joueurs.get(id) !== joueur || joueur.connecte) return;
        annoncerMatchs(s, s.retirerJoueur(id));
        if (s.joueurs.size === 0) salons.delete(s.code);
        else diffuser(s);
      }, DELAI_DECONNEXION);
      joueur.minuteur.unref(); // ce minuteur n'empêche pas le serveur de s'arrêter
    });
  });

  return { serveur, io, salons };
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  creerServeur().serveur.listen(port, () => {
    console.log(`Tinder-games sur http://localhost:${port}`);
    if (!process.env.STEAM_API_KEY) console.log('(Pas de STEAM_API_KEY : la catégorie Steam ne marchera pas.)');
  });
}

module.exports = { creerServeur };
