'use strict';
// Tout ce qui se passe dans le navigateur : écrans, swipe, votes, matchs.

const socket = io();
const $ = (id) => document.getElementById(id);

// --- Petite mémoire du navigateur (prénom, identifiant) -----------------------------
function lire(cle, ou = localStorage) {
  try { return ou.getItem(cle) || ''; } catch { return ''; }
}
function ecrire(cle, valeur, ou = localStorage) {
  try { ou.setItem(cle, valeur); } catch { /* navigation privée : tant pis */ }
}

// L'identifiant permet de retrouver sa place si la page se recharge.
let monId = lire('joueurId');
if (!monId) {
  monId = Math.random().toString(36).slice(2) + Date.now().toString(36);
  ecrire('joueurId', monId);
}

const CATEGORIES = {
  steam: '🎮 Jeux Steam',
  web: '🌐 Jeux web',
  bga: '🎲 Board Game Arena',
};

let etat = null; // l'état du salon envoyé par le serveur
let cartes = [];
let mesVotes = {};
let matchsVus = new Set();
let codeActuel = lire('code', sessionStorage);

// --- Écrans ---------------------------------------------------------------------------
function afficher(nom) {
  for (const e of document.querySelectorAll('.ecran')) e.hidden = e.id !== `ecran-${nom}`;
}

function erreur(ou, message) {
  $(ou).textContent = message || '';
}

// --- Accueil --------------------------------------------------------------------------
$('nom').value = lire('nom');
$('code').value = new URLSearchParams(location.search).get('code') || '';

function infosJoueur() {
  const nom = $('nom').value.trim();
  ecrire('nom', nom);
  return { joueurId: monId, nom };
}

function entrer(reponse) {
  if (reponse.erreur) {
    codeActuel = '';
    ecrire('code', '', sessionStorage);
    afficher('accueil');
    return erreur('erreur-accueil', reponse.erreur);
  }
  erreur('erreur-accueil');
  codeActuel = reponse.code;
  ecrire('code', codeActuel, sessionStorage);
  history.replaceState(null, '', `?code=${codeActuel}`);
}

$('bouton-creer').onclick = () => {
  const infos = infosJoueur();
  if (!infos.nom) return erreur('erreur-accueil', 'Écris ton prénom d’abord.');
  socket.emit('creer', infos, entrer);
};

$('bouton-rejoindre').onclick = () => {
  const infos = infosJoueur();
  const code = $('code').value.trim().toUpperCase();
  if (!infos.nom) return erreur('erreur-accueil', 'Écris ton prénom d’abord.');
  if (code.length !== 4) return erreur('erreur-accueil', 'Le code fait 4 lettres.');
  socket.emit('rejoindre', { ...infos, code }, entrer);
};
$('code').onkeydown = (e) => { if (e.key === 'Enter') $('bouton-rejoindre').click(); };

// Si la connexion revient (téléphone en veille, réseau qui saute), on reprend sa place.
socket.on('connect', () => {
  if (codeActuel && lire('nom')) {
    socket.emit('rejoindre', { joueurId: monId, nom: lire('nom'), code: codeActuel }, entrer);
  }
});

// --- Salon ----------------------------------------------------------------------------
$('code-salon').onclick = async () => {
  const lien = `${location.origin}/?code=${etat.code}`;
  try {
    if (navigator.share) await navigator.share({ title: 'Tinder-games', url: lien });
    else {
      await navigator.clipboard.writeText(lien);
      $('code-salon').dataset.copie = 'Lien copié !';
      setTimeout(() => delete $('code-salon').dataset.copie, 1500);
    }
  } catch { /* partage annulé */ }
};

// Étape 1 : l'hôte choisit une catégorie, puis on passe aux questions.
let categorieChoisie = null;
let nombreJoueurs = 2;
let envies = new Set(lire('envies').split(',').filter(Boolean)); // on se souvient des derniers choix
let duree = Number(lire('duree')) || 0;
let questions = { envies: [], durees: [] };

fetch('/questions').then((r) => r.json()).then((q) => { questions = q; }).catch(() => {});

function montrerEtape(etape) {
  $('etape-categories').hidden = etape !== 'categories';
  $('etape-questions').hidden = etape !== 'questions';
  erreur('erreur-salon');
}

for (const bouton of document.querySelectorAll('[data-categorie]')) {
  bouton.onclick = () => {
    categorieChoisie = bouton.dataset.categorie;
    nombreJoueurs = etat.joueurs.length;
    $('titre-questions').textContent = CATEGORIES[categorieChoisie];
    // Steam ne donne pas la durée des parties : on ne pose pas la question.
    $('bloc-duree').hidden = categorieChoisie === 'steam';
    dessinerQuestions();
    montrerEtape('questions');
  };
}

// Une « puce » = un bouton qu'on allume ou éteint.
function puce(texte, allumee, auClic) {
  const b = document.createElement('button');
  b.className = 'puce';
  b.textContent = texte;
  b.setAttribute('aria-pressed', allumee);
  b.onclick = auClic;
  return b;
}

function dessinerQuestions() {
  $('nombre-joueurs').textContent = nombreJoueurs;
  $('bouton-moins').disabled = nombreJoueurs <= 1;
  $('choix-envies').replaceChildren(...questions.envies.map((e) => puce(`${e.emoji} ${e.nom}`, envies.has(e.cle), () => {
    if (envies.has(e.cle)) envies.delete(e.cle); else envies.add(e.cle);
    ecrire('envies', [...envies].join(','));
    dessinerQuestions();
  })));
  $('choix-duree').replaceChildren(...questions.durees.map((d) => puce(
    `${d.emoji} ${d.nom}${d.detail ? ` (${d.detail})` : ''}`, duree === d.valeur, () => {
      duree = d.valeur;
      ecrire('duree', duree);
      dessinerQuestions();
    },
  )));
}

$('bouton-moins').onclick = () => { nombreJoueurs = Math.max(1, nombreJoueurs - 1); dessinerQuestions(); };
$('bouton-plus').onclick = () => { nombreJoueurs = Math.min(100, nombreJoueurs + 1); dessinerQuestions(); };
$('bouton-retour-categories').onclick = () => montrerEtape('categories');

// Étape 2 : on envoie les réponses, le serveur prépare la sélection.
$('bouton-lancer').onclick = () => {
  erreur('erreur-salon', 'Je prépare la sélection…');
  $('bouton-lancer').disabled = true;
  const criteres = {
    joueurs: nombreJoueurs,
    envies: [...envies],
    duree: categorieChoisie === 'steam' ? 0 : duree,
  };
  socket.emit('lancer', { categorie: categorieChoisie, criteres }, (r) => {
    $('bouton-lancer').disabled = false;
    erreur('erreur-salon', r.erreur);
  });
};

$('bouton-quitter').onclick = () => {
  socket.emit('quitter');
  codeActuel = '';
  etat = null;
  ecrire('code', '', sessionStorage);
  history.replaceState(null, '', '/');
  afficher('accueil');
};

function dessinerSalon() {
  $('code-salon').textContent = etat.code;
  const hote = etat.hoteId === monId;
  $('joueurs').replaceChildren(...etat.joueurs.map((j) => {
    const li = document.createElement('li');
    li.textContent = j.nom;
    if (j.id === etat.hoteId) li.append(' 👑');
    if (!j.connecte) li.classList.add('absent');
    if (j.id === monId) li.classList.add('moi');
    return li;
  }));
  $('choix-hote').hidden = !hote;
  $('attente-hote').hidden = hote;
}

// --- Swipe ----------------------------------------------------------------------------
function carteSuivante() {
  return cartes.find((c) => !(c.id in mesVotes));
}

function creerCarte(carte, classe) {
  const div = document.createElement('article');
  div.className = `carte ${classe}`;
  const visuel = document.createElement('div');
  visuel.className = carte.imageEntiere ? 'visuel entiere' : 'visuel';
  if (carte.image) {
    const img = document.createElement('img');
    img.src = carte.image;
    img.alt = '';
    img.draggable = false;
    img.onerror = () => img.replaceWith(carte.emoji);
    visuel.append(img);
  } else {
    visuel.textContent = carte.emoji;
  }
  const corps = document.createElement('div');
  corps.className = 'corps';
  const titre = document.createElement('h3');
  titre.textContent = carte.titre;
  const sous = document.createElement('p');
  sous.className = 'sous-titre';
  sous.textContent = carte.sousTitre;
  const etiquettes = document.createElement('p');
  etiquettes.className = 'etiquettes';
  for (const e of carte.etiquettes) {
    const span = document.createElement('span');
    span.textContent = e;
    etiquettes.append(span);
  }
  const desc = document.createElement('p');
  desc.className = 'description';
  desc.textContent = carte.description;
  const lien = document.createElement('a');
  lien.href = carte.lien;
  lien.target = '_blank';
  lien.rel = 'noopener';
  lien.textContent = `${carte.texteLien} ↗`;
  lien.onpointerdown = (e) => e.stopPropagation(); // cliquer le lien ne fait pas glisser la carte
  corps.append(titre, sous, etiquettes, desc, lien);
  const tampons = document.createElement('div');
  tampons.className = 'tampons';
  tampons.innerHTML = '<span class="tampon oui">OUI</span><span class="tampon non">NON</span>';
  div.append(visuel, corps, tampons);
  return div;
}

function dessinerPile() {
  const restantes = cartes.filter((c) => !(c.id in mesVotes));
  const pile = $('pile');
  pile.replaceChildren();
  // La carte de derrière d'abord, celle du dessus ensuite.
  if (restantes[1]) pile.append(creerCarte(restantes[1], 'derriere'));
  if (restantes[0]) {
    const dessus = creerCarte(restantes[0], 'dessus');
    pile.append(dessus);
    rendreGlissable(dessus);
  }
  $('fin-pile').hidden = restantes.length > 0;
  $('bouton-oui').disabled = $('bouton-non').disabled = restantes.length === 0;
}

function dessinerAvancement() {
  $('titre-categorie').textContent = CATEGORIES[etat.categorie] || '';
  $('resume-criteres').textContent = etat.criteres;
  $('nombre-matchs').textContent = etat.matchs.length;
  $('bouton-retour').hidden = etat.hoteId !== monId;
  $('avancement').replaceChildren(...etat.joueurs.map((j) => {
    const li = document.createElement('li');
    li.textContent = `${j.nom} ${j.avancement}/${etat.nombreCartes}`;
    if (!j.connecte) li.classList.add('absent');
    return li;
  }));
}

let enVol = false;
function voter(oui) {
  const carte = carteSuivante();
  const element = $('pile').querySelector('.dessus');
  if (!carte || !element || enVol) return;
  enVol = true;
  mesVotes[carte.id] = oui;
  socket.emit('voter', { carteId: carte.id, oui });
  element.style.transition = 'transform .3s ease-in, opacity .3s';
  element.style.transform = `translateX(${oui ? 140 : -140}vw) rotate(${oui ? 30 : -30}deg)`;
  element.style.opacity = '0';
  setTimeout(() => { enVol = false; dessinerPile(); }, 250);
}

$('bouton-oui').onclick = () => voter(true);
$('bouton-non').onclick = () => voter(false);
document.addEventListener('keydown', (e) => {
  if ($('ecran-swipe').hidden || !$('fenetre-match').hidden || e.target.tagName === 'INPUT') return;
  if (e.key === 'ArrowRight') voter(true);
  if (e.key === 'ArrowLeft') voter(false);
});

// Glisser la carte au doigt ou à la souris.
function rendreGlissable(element) {
  let depart = null;
  const tamponOui = element.querySelector('.tampon.oui');
  const tamponNon = element.querySelector('.tampon.non');

  element.onpointerdown = (e) => {
    depart = { x: e.clientX, y: e.clientY };
    element.setPointerCapture(e.pointerId);
    element.style.transition = 'none';
  };
  element.onpointermove = (e) => {
    if (!depart) return;
    const dx = e.clientX - depart.x;
    const dy = e.clientY - depart.y;
    element.style.transform = `translate(${dx}px, ${dy * 0.3}px) rotate(${dx / 15}deg)`;
    tamponOui.style.opacity = Math.max(0, Math.min(1, dx / 100));
    tamponNon.style.opacity = Math.max(0, Math.min(1, -dx / 100));
  };
  element.onpointerup = element.onpointercancel = (e) => {
    if (!depart) return;
    const dx = e.clientX - depart.x;
    depart = null;
    if (Math.abs(dx) > 100) return voter(dx > 0);
    element.style.transition = 'transform .2s';
    element.style.transform = '';
    tamponOui.style.opacity = tamponNon.style.opacity = 0;
  };
}

$('bouton-retour').onclick = () => socket.emit('retourSalon');

// --- Matchs ---------------------------------------------------------------------------
function carteMatch(carte) {
  const element = creerCarte(carte, 'mini');
  element.querySelector('.tampons').remove();
  return element;
}

function montrerMatch(carte) {
  $('carte-match').replaceChildren(carteMatch(carte));
  $('fenetre-match').hidden = false;
  navigator.vibrate?.(200);
}

$('bouton-continuer').onclick = () => { $('fenetre-match').hidden = true; };

function ouvrirListe() {
  const liste = etat.matchs.map((id) => cartes.find((c) => c.id === id)).filter(Boolean);
  if (liste.length === 0) {
    const li = document.createElement('li');
    li.className = 'petit';
    li.textContent = 'Pas encore de match. Continuez à swiper !';
    $('liste-matchs').replaceChildren(li);
  } else {
    $('liste-matchs').replaceChildren(...liste.map((c) => {
      const li = document.createElement('li');
      li.append(carteMatch(c));
      return li;
    }));
  }
  $('fenetre-liste').hidden = false;
}
$('bouton-matchs').onclick = ouvrirListe;
$('bouton-voir-matchs').onclick = ouvrirListe;
$('bouton-fermer-liste').onclick = () => { $('fenetre-liste').hidden = true; };

// --- Messages du serveur --------------------------------------------------------------
socket.on('salon', (s) => {
  etat = s;
  if (s.phase === 'salon') {
    cartes = [];
    mesVotes = {};
    $('fenetre-match').hidden = $('fenetre-liste').hidden = true;
    // En arrivant dans le salon, on repart du choix de catégorie
    // (si on y est déjà, on ne bouge pas : l'hôte est peut-être en train de répondre).
    if ($('ecran-salon').hidden) montrerEtape('categories');
    dessinerSalon();
    afficher('salon');
  } else {
    dessinerAvancement();
    if ($('ecran-swipe').hidden) afficher('swipe');
  }
});

socket.on('cartes', (d) => {
  cartes = d.cartes;
  mesVotes = d.mesVotes;
  matchsVus = new Set(d.matchs); // on ne réannonce pas les anciens matchs en revenant
  dessinerPile();
});

socket.on('match', (carte) => {
  if (matchsVus.has(carte.id)) return;
  matchsVus.add(carte.id);
  montrerMatch(carte);
});
