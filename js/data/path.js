/* La Licorne des Sons — le parcours et les mondes */
import { N } from '../voice-keys.js';

/* Le parcours : 21 arrêts (départ + 20 étapes) dans un monde de 3800 × 260 px.
   y = hauteur des sabots depuis le bas de la scène. */
const W = 3800, H = 260;
const PADS = [
  ['flower',44,'#ff8cc4'],['flower',54,'#ffd34d'],['flower',46,'#b99bff'],['flower',58,'#7fe3e0'],
  ['mush',62,'wCapP'],['mush',76,'wCapL'],['mush',66,'wCapA'],
  ['bridge',104],
  ['macaron',62,'#ffb3d6','#ff7fb4'],['macaron',76,'#a9f0d6','#4fd1a5'],['macaron',66,'#d9c6ff','#9b6bff'],
  ['shell',58,'#ffc2dc'],['shell',66,'#ffe0b8'],['shell',60,'#d9c6ff'],
  ['ice',70],['ice',84],['ice',74],
  ['cloud',96],['cloud',112],['cloud',100],
  ['castle',98],
];
const STOPS = PADS.map(([pad,y,c,c2], i) => ({x: 118 + i*178, y, pad, c, c2}));
const BIOMES = {
  0:  {name:'🌼 La Prairie des Fleurs',  say:N("C'est parti pour la grande aventure !")},
  4:  {name:'🍄 La Forêt Enchantée',      say:N("Bienvenue dans la forêt enchantée !")},
  7:  {name:'🌈 Le Pont Arc-en-ciel',     say:N("Le pont arc-en-ciel ! Attention, ça glisse !")},
  8:  {name:'🍭 Le Pays des Bonbons',     say:N("Miam ! Le pays des bonbons !")},
  10: {name:'⭐ La moitié du chemin !',   say:N("Bravo ! Tu es à la moitié du chemin !")},
  11: {name:'🐚 Le Lagon des Sirènes',    say:N("Oh, la mer ! Coucou les dauphins !")},
  14: {name:'❄️ Le Pays des Glaces',      say:N("Brrr ! Il fait froid au pays des glaces !")},
  17: {name:'☁️ Le Royaume des Nuages',   say:N("On vole dans les nuages !")},
  20: {name:'🏰 Le Château de Cristal'},
};
const WORLD_STARTS = [0, 4, 7, 8, 11, 14, 17];
const GEMCOLS = [
  ['#ffd0e8','#ff8cc4','#e0478f','#b8246d'],
  ['#d9fffb','#6fe3e6','#1fb3c2','#0d7f8c'],
  ['#efe6ff','#b99bff','#7c4ce8','#5229b8'],
  ['#fff7cc','#ffe066','#ffb81f','#c97900'],
];

export { W, H, PADS, STOPS, BIOMES, WORLD_STARTS, GEMCOLS };
