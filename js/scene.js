/* La Licorne des Sons — caméra, ciel, Paillette et ses gags */
import { $ } from './utils.js';
import { W, STOPS } from './data/path.js';
import { sfx, say } from './audio.js';
import { U } from './voice-keys.js';

let gameUni = null;
/** à appeler une fois que la licorne du jeu est dessinée */
function initScene(){ gameUni = $('#gameUni .uni'); }
const uniEl = () => gameUni;

let camX = 0;
function camTo(i, instant){
  const sw = $('#scene').clientWidth;
  camX = Math.max(0, Math.min(W - sw, STOPS[i].x - sw * .42));
  ['far','world','front'].forEach(id => $('#'+id).classList.toggle('nocam', !!instant));
  $('#world').style.transform = `translateX(${-camX}px)`;
  $('#far').style.transform   = `translateX(${-camX * .3}px)`;
  $('#front').style.transform = `translateX(${-camX * 1.2}px)`;
  if(instant) setTimeout(() => ['far','world','front'].forEach(id => $('#'+id).classList.remove('nocam')), 50);
}
function skyTo(i){
  const phase = i < 8 ? 0 : i < 14 ? 1 : 2;
  $('#skyDusk').style.opacity  = phase >= 1 ? 1 : 0;
  $('#skyNight').style.opacity = phase >= 2 ? 1 : 0;
  $('#far').style.filter = ['none','brightness(.92)','brightness(.65)'][phase];
}
function placeUni(i, instant){
  const w = $('#uniWrap'), st = STOPS[i];
  if(instant) w.classList.add('nojump');
  w.style.left = (st.x - 48) + 'px'; w.style.bottom = (st.y - 4) + 'px';
  w.classList.toggle('right', (st.x - camX) > $('#scene').clientWidth * .62);
  if(instant){ void w.offsetWidth; w.classList.remove('nojump'); }
}
let animT;
function anim(cls, ms){
  gameUni.classList.remove('a-hop','f-dance','f-flip','f-squash','f-no','f-hic','f-cool','f-giggle','f-slip');
  void gameUni.getBoundingClientRect();
  gameUni.classList.add(cls);
  clearTimeout(animT); animT = setTimeout(() => gameUni.classList.remove(cls), ms);
}
function mood(m, ms){
  gameUni.classList.remove('happy','oops');
  if(m){ gameUni.classList.add(m); if(ms) setTimeout(() => gameUni.classList.remove(m), ms); }
}
function accessory(name, ms){ gameUni.classList.add('acc-'+name); setTimeout(() => gameUni.classList.remove('acc-'+name), ms); }
let bubbleT;
function bubble(txt, ms=1700){
  const b = $('#bubble'); b.textContent = txt; b.classList.add('on');
  clearTimeout(bubbleT); bubbleT = setTimeout(() => b.classList.remove('on'), ms);
}
let zoneT;
function zone(txt){
  const z = $('#zone'); z.textContent = txt; z.classList.add('on');
  clearTimeout(zoneT); zoneT = setTimeout(() => z.classList.remove('on'), 2600);
}
function burst(chars, n=8){
  const scene = $('#scene'), s = scene.getBoundingClientRect(), u = $('#uniWrap').getBoundingClientRect();
  const x = u.left - s.left + u.width/2, y = u.top - s.top + u.height*.3;
  for(let i=0;i<n;i++){
    const p = document.createElement('div'); p.className = 'pt'; p.textContent = chars[i % chars.length];
    const ang = -Math.PI/2 + (Math.random()-.5)*2.2, d = 45 + Math.random()*60;
    p.style.left = x+'px'; p.style.top = y+'px';
    p.style.setProperty('--dx', Math.cos(ang)*d + 'px'); p.style.setProperty('--dy', Math.sin(ang)*d - 20 + 'px');
    scene.appendChild(p); setTimeout(() => p.remove(), 1400);
  }
}
const GAGS = [
  () => { anim('f-squash', 1000); sfx.prout(); burst(['🌈','☁️','✨']); bubble('Prout arc-en-ciel ! 🌈'); say([U("Oups, un prout !")]); },
  () => { anim('f-squash', 1000); sfx.sparkle(); burst(['✨','⭐','💫']); bubble('Atchoum ! ✨'); say([U("Atchoum !")]); },
  () => { anim('f-dance', 1200); sfx.sparkle(); burst(['🎵','🎶','💖']); bubble('Je danse ! 💃'); say([U("Je danse !")]); },
  () => { anim('f-flip', 1000); sfx.hop(); burst(['⭐','🌟']); bubble('Salto magique ! 🤸'); say([U("Hop là !")]); },
  () => { anim('f-hic', 1500); burst(['🫧']); bubble('Hic ! Hic ! Hic !'); say([U("Oh, le hoquet !")]); },
  () => { anim('f-cool', 2000); accessory('glasses', 2200); sfx.sparkle(); bubble('Trop stylée ! 😎'); say([U("Trop stylée !")]); },
  () => { anim('f-dance', 1200); accessory('hat', 2000); burst(['🎉','🎊','🎈'], 10); bubble("C'est la fête ! 🎉"); say([U("C'est la fête !")]); },
  () => { anim('f-giggle', 1400); burst(['💗']); bubble('Ça chatouille ! 🤭'); say([U("Ça chatouille !")]); },
  () => { anim('f-squash', 1000); burst(['🍩','✨']); bubble('Miam miam ! 😋'); say([U("Miam miam !")]); },
];
let lastGags = [];
function gag(){
  let i; do{ i = Math.random()*GAGS.length|0; }while(lastGags.includes(i));
  lastGags.push(i); if(lastGags.length > 4) lastGags.shift();
  mood('happy', 1800); GAGS[i]();
}

export { initScene, uniEl, camTo, skyTo, placeUni, anim, mood, accessory, bubble, zone, burst, gag };
