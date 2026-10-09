'use strict';
// Films pour une soirée entre amis. Pour en ajouter un, copier une ligne et la modifier.
// L'identifiant (id) doit être unique.

const films = [
  ['diner-de-cons', 'Le Dîner de cons', 1998, '1 h 20', 'Comédie', '🍽️', 'Un éditeur invite un « con » à un dîner pour se moquer de lui. Rien ne se passe comme prévu.'],
  ['oss-117', 'OSS 117 : Le Caire, nid d’espions', 2006, '1 h 39', 'Comédie', '🕶️', 'Un agent secret français aussi sûr de lui qu’incompétent, en mission en Égypte.'],
  ['cite-de-la-peur', 'La Cité de la peur', 1994, '1 h 33', 'Comédie', '🔪', 'Un tueur au marteau et à la faucille sème la panique au Festival de Cannes.'],
  ['mission-cleopatre', 'Astérix & Obélix : Mission Cléopâtre', 2002, '1 h 47', 'Comédie', '🏛️', 'Construire un palais en trois mois pour Cléopâtre, avec l’aide des Gaulois.'],
  ['kaamelott', 'Kaamelott – Premier Volet', 2021, '2 h', 'Comédie, aventure', '⚔️', 'Arthur revient d’exil pour reprendre le trône à Lancelot.'],
  ['intouchables', 'Intouchables', 2011, '1 h 52', 'Comédie, drame', '♿', 'L’amitié improbable entre un riche tétraplégique et son aide à domicile.'],
  ['shaun-of-the-dead', 'Shaun of the Dead', 2004, '1 h 39', 'Comédie horrifique', '🧟', 'Une invasion de zombies… que Shaun met un moment à remarquer.'],
  ['hot-fuzz', 'Hot Fuzz', 2007, '2 h 01', 'Comédie, policier', '🚓', 'Un super-flic londonien est muté dans un village bien trop calme.'],
  ['zombieland', 'Bienvenue à Zombieland', 2009, '1 h 28', 'Comédie horrifique', '🧟', 'Survivre aux zombies grâce à une liste de règles très précises.'],
  ['tremors', 'Tremors', 1990, '1 h 36', 'Comédie horrifique', '🪱', 'Des vers géants sous le sable d’un village perdu du Nevada.'],
  ['sos-fantomes', 'SOS Fantômes', 1984, '1 h 45', 'Comédie, fantastique', '👻', 'Trois scientifiques lancent une entreprise de chasse aux fantômes à New York.'],
  ['get-out', 'Get Out', 2017, '1 h 44', 'Horreur, thriller', '☕', 'Un week-end chez les parents de sa copine devient de plus en plus inquiétant.'],
  ['scream', 'Scream', 1996, '1 h 51', 'Horreur', '📞', 'Un tueur masqué qui connaît par cœur les règles des films d’horreur.'],
  ['the-thing', 'The Thing', 1982, '1 h 49', 'Horreur, SF', '🧊', 'Une base en Antarctique, une créature qui imite les humains. Qui est qui ?'],
  ['alien', 'Alien, le huitième passager', 1979, '1 h 57', 'Horreur, SF', '👽', 'Un équipage de vaisseau spatial traqué par une créature inconnue.'],
  ['retour-vers-le-futur', 'Retour vers le futur', 1985, '1 h 56', 'SF, aventure', '⏰', 'Marty voyage en 1955 et doit faire en sorte que ses parents tombent amoureux.'],
  ['jurassic-park', 'Jurassic Park', 1993, '2 h 07', 'Aventure', '🦖', 'Un parc d’attractions avec de vrais dinosaures. Que pourrait-il arriver ?'],
  ['seigneur-des-anneaux', 'Le Seigneur des anneaux : La Communauté de l’anneau', 2001, '2 h 58', 'Fantasy', '💍', 'Un hobbit doit détruire un anneau maléfique. Prévoir des snacks.'],
  ['mad-max', 'Mad Max: Fury Road', 2015, '2 h', 'Action', '🔥', 'Une course-poursuite géante en plein désert, presque sans pause.'],
  ['interstellar', 'Interstellar', 2014, '2 h 49', 'SF', '🪐', 'Des astronautes cherchent une nouvelle planète pour sauver l’humanité.'],
  ['inception', 'Inception', 2010, '2 h 28', 'SF, action', '🌀', 'Des voleurs qui s’infiltrent dans les rêves, et les rêves dans les rêves.'],
  ['dune', 'Dune', 2021, '2 h 35', 'SF', '🏜️', 'Une planète de sable, des vers géants et une épice que tout le monde veut.'],
  ['le-prestige', 'Le Prestige', 2006, '2 h 10', 'Thriller', '🎩', 'Deux magiciens rivaux prêts à tout pour le meilleur tour.'],
  ['parasite', 'Parasite', 2019, '2 h 12', 'Thriller', '🪨', 'Une famille pauvre s’infiltre peu à peu chez une famille riche.'],
  ['a-couteaux-tires', 'À couteaux tirés', 2019, '2 h 10', 'Policier, comédie', '🔍', 'Un riche écrivain est retrouvé mort. Toute la famille est suspecte.'],
  ['everything-everywhere', 'Everything Everywhere All at Once', 2022, '2 h 19', 'SF, comédie', '🥯', 'Une gérante de laverie doit sauver tous les univers parallèles.'],
  ['pulp-fiction', 'Pulp Fiction', 1994, '2 h 34', 'Policier', '💼', 'Des histoires de gangsters de Los Angeles qui s’entremêlent.'],
  ['les-evades', 'Les Évadés', 1994, '2 h 22', 'Drame', '⛓️', 'Un banquier condamné à tort se lie d’amitié avec un détenu.'],
  ['grand-budapest', 'The Grand Budapest Hotel', 2014, '1 h 40', 'Comédie, aventure', '🏨', 'Les aventures d’un concierge d’hôtel et de son jeune groom.'],
  ['chihiro', 'Le Voyage de Chihiro', 2001, '2 h 05', 'Animation', '🐉', 'Une fillette se retrouve piégée dans un monde d’esprits.'],
  ['coco', 'Coco', 2017, '1 h 45', 'Animation', '💀', 'Un garçon passionné de musique se retrouve au pays des morts.'],
  ['spider-verse', 'Spider-Man : New Generation', 2018, '1 h 57', 'Animation, action', '🕷️', 'Miles Morales rencontre des Spider-Men venus d’autres univers.'],
];

module.exports = films.map(([id, titre, annee, duree, genre, emoji, description]) => ({
  id: `film-${id}`,
  titre,
  sousTitre: `${annee} · ${duree}`,
  etiquettes: genre.split(', '),
  emoji,
  description,
  lien: `https://www.justwatch.com/fr/recherche?q=${encodeURIComponent(titre)}`,
  texteLien: 'Où le regarder ?',
}));
