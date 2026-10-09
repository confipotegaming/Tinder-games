'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { Salon, pourNombreDeJoueurs } = require('../lib/salon');

const cartes = [{ id: 'a' }, { id: 'b' }];

test('un match seulement quand tout le monde dit oui', () => {
  const s = new Salon('ABCD');
  s.ajouterJoueur('1', 'Léa');
  s.ajouterJoueur('2', 'Tom');
  s.lancer('films', cartes);
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
  s.lancer('films', cartes);
  s.voter('2', 'b', true);
  assert.deepEqual(s.retirerJoueur('1').map((c) => c.id), ['b']);
  assert.equal(s.hoteId, '2');
});

test('filtre selon le nombre de joueurs', () => {
  const liste = [{ id: 'film' }, { id: 'duo', joueurs: [2, 2] }, { id: 'groupe', joueurs: [3, 8] }];
  assert.deepEqual(pourNombreDeJoueurs(liste, 2).map((c) => c.id), ['film', 'duo']);
});

test('toutes les listes ont des identifiants uniques et des champs complets', () => {
  const toutes = [...require('../data/films'), ...require('../data/web'), ...require('../data/bga')];
  assert.equal(new Set(toutes.map((c) => c.id)).size, toutes.length);
  for (const c of toutes) {
    for (const champ of ['titre', 'sousTitre', 'emoji', 'description', 'lien', 'texteLien']) assert.ok(c[champ], `${c.id}.${champ}`);
  }
});
