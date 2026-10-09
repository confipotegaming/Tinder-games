'use strict';
// Une vraie partie à deux joueurs, avec le vrai serveur.
const test = require('node:test');
const assert = require('node:assert');
const { io } = require('socket.io-client');
const { creerServeur } = require('../server');

const attendre = (socket, evenement) => new Promise((ok) => socket.once(evenement, ok));
const emettre = (socket, evenement, donnees) => new Promise((ok) => socket.emit(evenement, donnees, ok));

test('deux joueurs, un match', async () => {
  const { serveur, io: ioServeur } = creerServeur({ cleSteam: '' });
  await new Promise((ok) => serveur.listen(0, ok));
  const url = `http://localhost:${serveur.address().port}`;
  const lea = io(url, { forceNew: true });
  const tom = io(url, { forceNew: true });
  try {
    const { code } = await emettre(lea, 'creer', { joueurId: 'lea', nom: 'Léa' });
    assert.match(code, /^[A-Z]{4}$/);
    assert.deepEqual(await emettre(tom, 'rejoindre', { joueurId: 'tom', nom: 'Tom', code: 'zzzz' }), { erreur: 'Aucun salon avec ce code.' });
    await emettre(tom, 'rejoindre', { joueurId: 'tom', nom: 'Tom', code: code.toLowerCase() });

    // Seul l'hôte lance ; Steam sans clé donne un message clair.
    assert.ok((await emettre(tom, 'lancer', { categories: ['web'] })).erreur);
    assert.match((await emettre(lea, 'lancer', { categories: ['steam'] })).erreur, /clé Steam/);

    const cartesTom = attendre(tom, 'cartes');
    assert.deepEqual(await emettre(lea, 'lancer', { categories: ['bga'] }), {});
    const { cartes } = await cartesTom;
    assert.ok(cartes.every((c) => c.id.startsWith('bga-') && c.joueurs[0] <= 2 && c.joueurs[1] >= 2));

    // Avec des réponses aux questions : seulement des jeux coop pour 4, et un message si rien ne va.
    const coop = attendre(tom, 'cartes');
    assert.deepEqual(await emettre(lea, 'lancer', { categories: ['bga'], criteres: { joueurs: 4, envies: ['coop'] } }), {});
    assert.ok((await coop).cartes.every((c) => c.envies.includes('coop') && c.joueurs[1] >= 4));
    assert.match((await emettre(lea, 'lancer', { categories: ['web'], criteres: { joueurs: 1, envies: ['bluff'] } })).erreur, /Aucun jeu/);
    // Plusieurs sources à la fois : les jeux web et BGA sont mélangés dans la même pile.
    // (Steam sans clé : message clair, même mélangé avec d'autres sources.)
    assert.match((await emettre(lea, 'lancer', { categories: ['web', 'steam'] })).erreur, /clé Steam/);
    assert.ok((await emettre(lea, 'lancer', { categories: [] })).erreur);
    const melange = attendre(tom, 'cartes');
    assert.deepEqual(await emettre(lea, 'lancer', { categories: ['web', 'bga', 'web'] }), {});
    const sources = new Set((await melange).cartes.map((c) => c.id.split('-')[0]));
    assert.deepEqual([...sources].sort(), ['bga', 'web']);

    const nouvelles = attendre(tom, 'cartes');
    await emettre(lea, 'lancer', { categories: ['bga'], criteres: { joueurs: 2 } });
    const { cartes: cartes2 } = await nouvelles;

    const match = attendre(lea, 'match');
    lea.emit('voter', { carteId: cartes2[0].id, oui: true });
    tom.emit('voter', { carteId: cartes2[0].id, oui: true });
    assert.equal((await match).id, cartes2[0].id);
  } finally {
    lea.close();
    tom.close();
    ioServeur.close();
  }
});
