/* La Licorne des Sons — déroulé d'une partie */
import { $, wait, shuffle, pick, plain, wordHTML, cardHTML, gemSVG } from './utils.js';
import { LEVELS, STEPS } from './data/sounds.js';
import { STOPS, BIOMES, WORLD_STARTS } from './data/path.js';
import { N, U } from './voice-keys.js';
import { unlock, hush, say, sfx, preload } from './audio.js';
import { uniEl, camTo, skyTo, placeUni, anim, mood, bubble, zone, burst, gag } from './scene.js';
import { makeTargets, distractors } from './questions.js';
import { getStars, addStar } from './storage.js';
import { earnReward, showReward } from './rewards.js';

let gems = [];
let pool = [], targets = [], step = 0, cur = null, busy = true, level = 'voyelles', round = 0;
function show(id){ document.querySelectorAll('.screen').forEach(s => s.classList.toggle('on', s.id === id)); window.scrollTo(0,0); }
function refreshStars(){ $('#homeStars').textContent = getStars(); }
function renderTrack(){
  $('#track').innerHTML = Array.from({length:STEPS}, (_,k) => `<div class="slot ${k < step ? 'got' : ''}">${gemSVG(k+1)}</div>`).join('');
}
/* le son de la lettre est dit à chaque manche : « Écoute bien le son… X… X… comme dans… mot » */
/* Phrases complètes : « Trouve la lettre M ! » puis « Comme dans moto ! »
   (voyelles : le son ; consonnes : le nom de la lettre ; groupes de consonnes : épelés) */
const prompt = t => ['L:' + t.g, 250, 'w:' + plain(t.w)];

function startGame(key){
  unlock();
  level = key; pool = LEVELS[key];
  targets = makeTargets(pool, STEPS); step = 0;
  gems.forEach(g => g && g.classList.remove('got'));
  renderTrack(); mood('');
  show('game');
  camTo(0, true); skyTo(0); placeUni(0, true);
  zone(BIOMES[0].name);
  newRound([BIOMES[0].say, 200, N("Attention aux peaux de banane ! Si tu te trompes, tu glisses au début du monde !"), 300]);
}
function newRound(intro=[]){
  round++;
  cur = targets[step];
  const opts = shuffle([cur, ...distractors(cur, pool)]);
  const colors = shuffle(['c-pink','c-lilac','c-aqua']);
  const box = $('#cards'); box.innerHTML = '';
  opts.forEach((it, k) => {
    const b = document.createElement('button');
    b.className = 'card candy x3d ' + colors[k]; b.innerHTML = cardHTML(it.g); b.dataset.g = it.g;
    b.style.setProperty('--glyph-scale', Math.min(1, 2 / it.g.length));
    b.addEventListener('click', () => answer(b, it));
    box.appendChild(b);
  });
  $('#emoji').textContent = cur.e;
  $('#word').innerHTML = '? ? ?';
  busy = false;                       // les cartes sont cliquables tout de suite
  say([...intro, ...prompt(cur)], true);
  if(targets[step+1]) preload(prompt(targets[step+1]));
}
function answer(btn, it){
  if(busy) return;
  busy = true; hush();
  const my = round;
  const cards = [...document.querySelectorAll('.card')];
  cards.forEach(b => b.disabled = true);
  $('#word').innerHTML = wordHTML(cur.w);
  if(it.g === cur.g){
    btn.classList.add('good'); cards.forEach(b => b !== btn && b.classList.add('fade'));
    sfx.ding(); mood('happy');
    say([pick([N("Bravo !"), N("Super !"), N("Génial !"), N("Oui, bravo !"), N("Trop forte !"), N("Excellent !"), N("Bravo, bravo !")])]);
    setTimeout(() => { if(my === round) gag(); }, 900);
    setTimeout(() => {
      if(my !== round) return;
      step++;
      camTo(step); skyTo(step); placeUni(step); anim('a-hop', 1000); sfx.hop();
      setTimeout(() => {
        if(my !== round) return;
        if(gems[step]){ gems[step].classList.add('got'); sfx.gem(); }
        renderTrack();
        if(step >= STEPS) return finish();
        const bio = BIOMES[step];
        if(bio){ zone(bio.name); newRound([bio.say, 300]); } else newRound();
      }, 1100);
    }, 3000);
  } else {
    btn.classList.add('bad'); sfx.boing(); anim('f-no', 500); mood('oops');
    const right = cards.find(b => b.dataset.g === cur.g);
    cards.forEach(b => b !== right && b !== btn && b.classList.add('fade'));
    if(right) right.classList.add('reveal');
    bubble('Oh non ! 🙈', 2000);
    fail(my);
  }
}
/* une erreur : on entend la bonne réponse, puis Paillette glisse sur une peau de banane
   jusqu'au début du monde en cours */
async function fail(my){
  await say([N("Oh non !"), 150, 'F:' + cur.g, 250, 'w:' + plain(cur.w)]);
  await wait(300);
  if(my !== round) return;
  const back = Math.max(...WORLD_STARTS.filter(k => k <= step));
  if(step > back){
    const st = STOPS[step], ban = document.createElement('div');
    ban.className = 'banana'; ban.textContent = '🍌';
    ban.style.left = (st.x + 4) + 'px'; ban.style.bottom = (st.y - 4) + 'px';
    $('#world').appendChild(ban);
    await wait(500); if(my !== round){ ban.remove(); return; }
    anim('f-slip', 900); sfx.slip(); bubble('Une peau de banane ! 🍌', 2800); say([U("Oups ! Une peau de banane !")]);
    await wait(900); if(my !== round){ ban.remove(); return; }
    ['far','world','front'].forEach(id => $('#'+id).classList.add('slow'));
    $('#uniWrap').classList.add('slow'); uniEl().classList.add('sliding');
    step = back; camTo(step); skyTo(step); placeUni(step);
    gems.forEach((g,k) => g && k > step && g.classList.remove('got'));
    renderTrack();
    await wait(2500);
    ['far','world','front'].forEach(id => $('#'+id).classList.remove('slow'));
    $('#uniWrap').classList.remove('slow'); uniEl().classList.remove('sliding'); ban.remove();
    if(my !== round) return;
  }
  mood('happy', 1500); bubble('On recommence ! 💪', 2000);
  targets = makeTargets(pool, STEPS);
  newRound([N("On recommence ! Tu vas y arriver !"), 300]);
}
function finish(){
  const my = round; busy = true;
  mood('happy'); zone(BIOMES[20].name); sfx.fanfare(); confetti(); anim('f-dance', 1200);
  burst(['🎆','✨','💖','⭐'], 12);
  const stars = addStar(); refreshStars();
  earnReward();
  $('#gemsRow').innerHTML = Array.from({length:STEPS}, (_,k) => gemSVG(k+1)).join('');
  $('#starsRow').textContent = stars <= 20 ? '⭐'.repeat(stars) : '⭐'.repeat(20) + ' ×' + stars;
  setTimeout(() => {
    if(my !== round) return;
    show('win');
    showReward();
    say([N("Bravo, ma championne !"), 250, N("Tu as trouvé les vingt cristaux magiques !")]);
  }, 2600);
}
function confetti(){
  const cols = ['#ff5fa8','#9b6bff','#2fcfd6','#ffc93c','#7fd3ff','#ffffff'];
  for(let i=0;i<60;i++){
    const c = document.createElement('div'); c.className = 'confetti';
    c.style.left = Math.random()*100 + 'vw'; c.style.background = pick(cols);
    c.style.animationDuration = (2 + Math.random()*2) + 's'; c.style.animationDelay = (Math.random()*.5) + 's';
    document.body.appendChild(c); setTimeout(() => c.remove(), 5000);
  }
}

/* relie les boutons ; gemsList = cristaux posés dans le décor */
function initGame(gemsList){
  gems = gemsList;
  document.querySelectorAll('.lvl').forEach(b => b.addEventListener('click', () => startGame(b.dataset.level)));
  const replay = () => { if(cur && !busy) say(prompt(cur), true); };
  $('#listenBtn').addEventListener('click', replay);
  $('#emojiTile').addEventListener('click', replay);
  $('#homeBtn').addEventListener('click', () => { round++; busy = true; hush(); show('home'); });
  $('#againBtn').addEventListener('click', () => startGame(level));
  $('#menuBtn').addEventListener('click', () => { round++; hush(); show('home'); });
  window.addEventListener('resize', () => { if($('#game').classList.contains('on')){ camTo(step, true); placeUni(step, true); } });
  refreshStars();
  // outil de test : ajoutez ?debug à l'adresse pour lire l'état du jeu depuis la console
  if(location.search.includes('debug')) window.__game = { right: () => cur && cur.g, step: () => step };
}
export { initGame };
