'use strict';
const test = require('node:test');
const assert = require('node:assert');
const steam = require('../lib/steam');

// Un faux Steam : répond comme l'API, sans passer par Internet.
function fauxSteam(bibliotheques) {
  return async (url) => {
    const p = url.searchParams;
    let response = {};
    if (url.pathname.includes('GetItems')) {
      // Le magasin : Lethal Company est coop + horreur (étiquettes 1685 et 1667), Celeste est solo.
      response = { store_items: [
        { appid: 1, success: 1, tagids: [1685, 1667], categories: { supported_player_categoryids: [1, 9] } },
        { appid: 2, success: 1, tagids: [1625], categories: { supported_player_categoryids: [2] } },
      ] };
    } else if (url.pathname.includes('GetTagList')) {
      response = { tags: [{ tagid: 1685, name: 'Coop' }, { tagid: 1667, name: 'Horreur' }] };
    } else if (url.pathname.includes('ResolveVanityURL')) {
      response = p.get('vanityurl') === 'tom' ? { success: 1, steamid: '76561190000000002' } : { success: 42 };
    } else if (bibliotheques[p.get('steamid')]) {
      response = { games: bibliotheques[p.get('steamid')] };
    }
    return { ok: true, status: 200, json: async () => ({ response }) };
  };
}

test('comprend les différentes façons d’écrire un profil', () => {
  assert.deepEqual(steam.lireProfil('https://steamcommunity.com/profiles/76561199102603212/'), { type: 'id64', valeur: '76561199102603212' });
  assert.deepEqual(steam.lireProfil('https://steamcommunity.com/id/tom'), { type: 'pseudo', valeur: 'tom' });
  assert.deepEqual(steam.lireProfil('76561199102603212'), { type: 'id64', valeur: '76561199102603212' });
  assert.equal(steam.lireProfil('https://exemple.com/pas un profil'), null);
});

test('garde seulement les jeux possédés par tous', async () => {
  steam._cache.clear();
  const fetchFn = fauxSteam({
    '76561190000000001': [{ appid: 1, name: 'Lethal Company', playtime_forever: 600 }, { appid: 2, name: 'Celeste', playtime_forever: 0 }],
    '76561190000000002': [{ appid: 1, name: 'Lethal Company', playtime_forever: 30 }],
  });
  const cartes = await steam.jeuxEnCommun([
    { nom: 'Élisa', steam: 'https://steamcommunity.com/profiles/76561190000000001' },
    { nom: 'Tom', steam: 'tom' },
  ], 'cle', fetchFn);
  assert.equal(cartes.length, 1);
  assert.equal(cartes[0].titre, 'Lethal Company');
  assert.equal(cartes[0].sousTitre, 'Élisa : 10 h · Tom : < 1 h');
  assert.deepEqual(cartes[0].envies, ['coop', 'frissons']);
  assert.deepEqual(cartes[0].joueurs, [1, 100]);
  assert.deepEqual(cartes[0].etiquettes, ['Coop', 'Horreur']);
});

test('un jeu solo est repéré comme solo', async () => {
  steam._cache.clear();
  const fetchFn = fauxSteam({ '76561190000000001': [{ appid: 2, name: 'Celeste', playtime_forever: 0 }] });
  const [celeste] = await steam.jeuxEnCommun([{ nom: 'Élisa', steam: '76561190000000001' }], 'cle', fetchFn);
  assert.deepEqual(celeste.joueurs, [1, 1]);
  assert.equal(celeste.etiquettes[0], 'Solo');
});

test('messages clairs : pas de clé, bibliothèque privée', async () => {
  steam._cache.clear();
  await assert.rejects(steam.jeuxEnCommun([{ nom: 'A', steam: '76561190000000001' }], ''), /clé Steam/);
  await assert.rejects(steam.jeuxEnCommun([{ nom: 'A', steam: '76561190000000009' }], 'cle', fauxSteam({})), /privée/);
});
