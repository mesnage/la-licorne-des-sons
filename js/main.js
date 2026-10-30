/* La Licorne des Sons — démarrage */
import { $ } from './utils.js';
import { unicornSVG } from './unicorn.js';
import { mountWorld } from './world.js';
import { initScene } from './scene.js';
import { initGame } from './game.js';
import './audio.js';
import { initRewards } from './rewards.js';

$('#homeUni').innerHTML = unicornSVG();
$('#gameUni').innerHTML = unicornSVG();
$('#winUni').innerHTML  = unicornSVG();
$('#winUni .uni').classList.add('happy');
initScene();
initGame(mountWorld());
initRewards();
window.__licorneOK = true;
