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
    assert.ok((await emettre(tom, 'lancer', { categorie: 'web' })).erreur);
    assert.match((await emettre(lea, 'lancer', { categorie: 'steam' })).erreur, /clé Steam/);

    const cartesTom = attendre(tom, 'cartes');
    assert.deepEqual(await emettre(lea, 'lancer', { categorie: 'bga' }), {});
    const { cartes } = await cartesTom;
    assert.ok(cartes.every((c) => c.id.startsWith('bga-') && c.joueurs[0] <= 2 && c.joueurs[1] >= 2));

    const match = attendre(lea, 'match');
    lea.emit('voter', { carteId: cartes[0].id, oui: true });
    tom.emit('voter', { carteId: cartes[0].id, oui: true });
    assert.equal((await match).id, cartes[0].id);
  } finally {
    lea.close();
    tom.close();
    ioServeur.close();
  }
});
