'use strict';
// Un salon = un groupe d'amis qui swipent les mêmes cartes.
// Ce fichier ne parle pas au réseau : il ne fait que retenir qui a voté quoi,
// et dire quand une carte devient un « match » (tout le monde a dit oui).

const LETTRES = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // sans I ni O, qu'on confond avec 1 et 0
const MAX_JOUEURS = 12;

function nouveauCode(dejaPris) {
  let code;
  do {
    code = Array.from({ length: 4 }, () => LETTRES[Math.floor(Math.random() * LETTRES.length)]).join('');
  } while (dejaPris(code));
  return code;
}

// Mélange de Fisher-Yates : renvoie une copie dans un ordre au hasard.
function melanger(liste) {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

class Salon {
  constructor(code) {
    this.code = code;
    this.joueurs = new Map(); // id -> { id, nom, connecte }
    this.hoteId = null;
    this.phase = 'salon'; // 'salon' (on attend) ou 'swipe' (on vote)
    this.categorie = null;
    this.criteres = ''; // résumé des réponses aux questions, ex. « 4 joueurs · 🤝 · Rapide »
    this.cartes = [];
    this.votes = new Map(); // id de carte -> Map(id de joueur -> true/false)
    this.matchs = []; // ids des cartes où tout le monde a dit oui, dans l'ordre
  }

  get plein() {
    return this.joueurs.size >= MAX_JOUEURS;
  }

  ajouterJoueur(id, nom) {
    const existant = this.joueurs.get(id);
    if (existant) {
      // Le même joueur qui revient (téléphone mis en veille, page rechargée…).
      Object.assign(existant, { nom, connecte: true });
      return existant;
    }
    const joueur = { id, nom, connecte: true };
    this.joueurs.set(id, joueur);
    if (!this.hoteId) this.hoteId = id;
    return joueur;
  }

  // Renvoie les cartes qui deviennent des matchs parce que ce joueur part.
  retirerJoueur(id) {
    this.joueurs.delete(id);
    for (const votesCarte of this.votes.values()) votesCarte.delete(id);
    if (this.hoteId === id) this.hoteId = this.joueurs.keys().next().value ?? null;
    if (this.phase !== 'swipe' || this.joueurs.size === 0) return [];
    return this.cartes.filter((c) => this.verifierMatch(c.id));
  }

  lancer(categorie, cartes, criteres = '') {
    this.phase = 'swipe';
    this.categorie = categorie;
    this.criteres = criteres;
    this.cartes = cartes;
    this.votes = new Map();
    this.matchs = [];
  }

  retourAuSalon() {
    this.phase = 'salon';
    this.categorie = null;
    this.criteres = '';
    this.cartes = [];
    this.votes = new Map();
    this.matchs = [];
  }

  // Renvoie la carte si ce vote crée un match, sinon null.
  voter(joueurId, carteId, oui) {
    if (this.phase !== 'swipe' || !this.joueurs.has(joueurId)) return null;
    const carte = this.cartes.find((c) => c.id === carteId);
    if (!carte) return null;
    if (!this.votes.has(carteId)) this.votes.set(carteId, new Map());
    this.votes.get(carteId).set(joueurId, Boolean(oui));
    return this.verifierMatch(carteId) ? carte : null;
  }

  // Une carte devient un match quand tous les joueurs présents ont dit oui.
  // On ne la compte qu'une fois.
  verifierMatch(carteId) {
    if (this.matchs.includes(carteId)) return false;
    const votesCarte = this.votes.get(carteId);
    if (!votesCarte) return false;
    for (const id of this.joueurs.keys()) {
      if (votesCarte.get(id) !== true) return false;
    }
    this.matchs.push(carteId);
    return true;
  }

  votesDe(joueurId) {
    const resultat = {};
    for (const [carteId, votesCarte] of this.votes) {
      if (votesCarte.has(joueurId)) resultat[carteId] = votesCarte.get(joueurId);
    }
    return resultat;
  }

  // Ce que tout le monde peut voir (sans les cartes, envoyées à part car plus lourdes).
  etat() {
    return {
      code: this.code,
      hoteId: this.hoteId,
      phase: this.phase,
      categorie: this.categorie,
      criteres: this.criteres,
      nombreCartes: this.cartes.length,
      matchs: this.matchs,
      joueurs: [...this.joueurs.values()].map((j) => ({
        id: j.id,
        nom: j.nom,
        connecte: j.connecte,
        avancement: Object.keys(this.votesDe(j.id)).length,
      })),
    };
  }
}

module.exports = { Salon, nouveauCode, melanger, MAX_JOUEURS };
