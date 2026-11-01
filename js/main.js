/* La Licorne des Sons — démarrage */
import { $ } from './utils.js';
import { unicornSVG } from './unicorn.js';
import { mountWorld } from './world.js';
import { initScene } from './scene.js';
import { initGame } from './game.js?v=chapters-wheel-1';
import './audio.js';
import { initRewards } from './rewards.js?v=chapters-wheel-1';
import { initWordGame } from './words/game.js?v=chapters-wheel-1';

$('#homeUni').innerHTML = unicornSVG();
$('#gameUni').innerHTML = unicornSVG();
$('#winUni').innerHTML  = unicornSVG();
$('#winUni .uni').classList.add('happy');
initScene();
const gems = mountWorld();
initGame(gems);
initRewards();
initWordGame(gems);
window.__licorneOK = true;
