'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { Salon } = require('../lib/salon');
const { lireCriteres, filtrer, resume, ENVIES } = require('../lib/criteres');

const cartes = [{ id: 'a' }, { id: 'b' }];

test('un match seulement quand tout le monde dit oui', () => {
  const s = new Salon('ABCD');
  s.ajouterJoueur('1', 'Léa');
  s.ajouterJoueur('2', 'Tom');
  s.lancer(['web'], cartes);
  assert.equal(s.voter('1', 'a', true), null);
  assert.equal(s.voter('2', 'a', true).id, 'a');
  assert.deepEqual(s.matchs, ['a']);
  s.voter('1', 'b', true);
  assert.equal(s.voter('2', 'b', false), null);
  // Revoter ne recompte pas le match.
  assert.equal(s.voter('2', 'a', true), null);
});

test('le départ d’un joueur peut créer des matchs et passe l’hôte au suivant', () => {
  const s = new Salon('ABCD');
  s.ajouterJoueur('1', 'Léa');
  s.ajouterJoueur('2', 'Tom');
  s.lancer(['web'], cartes);
  s.voter('2', 'b', true);
  assert.deepEqual(s.retirerJoueur('1').map((c) => c.id), ['b']);
  assert.equal(s.hoteId, '2');
});

test('tri selon le nombre de joueurs, les envies et la durée', () => {
  const liste = [
    { id: 'steam-inconnu' },
    { id: 'duo', joueurs: [2, 2], envies: ['coop'], duree: 15 },
    { id: 'groupe', joueurs: [3, 8], envies: ['bluff'], duree: 20 },
    { id: 'long', joueurs: [2, 4], envies: ['coop', 'reflexion'], duree: 60 },
  ];
  const ids = (c) => filtrer(liste, lireCriteres(c)).map((x) => x.id);
  assert.deepEqual(ids({ joueurs: 2 }), ['steam-inconnu', 'duo', 'long']);
  assert.deepEqual(ids({ joueurs: 2, envies: ['coop'] }), ['duo', 'long']);
  assert.deepEqual(ids({ joueurs: 2, envies: ['coop'], duree: 20 }), ['duo']);
  assert.deepEqual(ids({ joueurs: 4, envies: ['bluff', 'reflexion'] }), ['groupe', 'long']);
});

test('les réponses bizarres sont nettoyées', () => {
  assert.deepEqual(lireCriteres({ joueurs: '-3', envies: ['coop', 'pirate', 'coop'], duree: 7 }, 4), { joueurs: 1, envies: ['coop'], duree: 0 });
  assert.deepEqual(lireCriteres(undefined, 4), { joueurs: 4, envies: [], duree: 0 });
  assert.equal(resume({ joueurs: 4, envies: ['coop', 'rigolade'], duree: 20 }), '4 joueurs · 🤝 😂 · Rapide');
});

test('toutes les listes ont des identifiants uniques et des champs complets', () => {
  const toutes = [...require('../data/web'), ...require('../data/bga')];
  assert.equal(new Set(toutes.map((c) => c.id)).size, toutes.length);
  for (const c of toutes) {
    for (const champ of ['titre', 'sousTitre', 'emoji', 'description', 'lien', 'texteLien', 'duree']) assert.ok(c[champ], `${c.id}.${champ}`);
    assert.ok(c.envies.length && c.envies.every((e) => ENVIES.some((x) => x.cle === e)), `${c.id}.envies`);
  }
});
