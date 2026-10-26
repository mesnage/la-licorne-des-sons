/* La Licorne des Sons — le son : voix enregistrées + petits effets */
import { $, wait } from './utils.js';

/* audio/manifest.json associe chaque clé de phrase (ex. "L:m", "w:moto") à son fichier MP3. */
let manifest = {};
const ready = fetch('audio/manifest.json').then(r => r.json()).then(m => { manifest = m; }).catch(() => {});
/** précharge des phrases à l'avance (ex. la prochaine question) */
function preload(keys){ ready.then(() => keys.forEach(k => typeof k === 'string' && loadClip(k))); }

let ctx = null;
function audio(){
  if(!ctx){ const C = window.AudioContext || window.webkitAudioContext; if(C){ try{ ctx = new C(); }catch(e){} } }
  if(ctx && ctx.state !== 'running'){ try{ ctx.resume(); }catch(e){} }
  return ctx;
}
/* Débloque le son au premier toucher (obligatoire sur iPhone / iPad) */
function unlock(){
  const a = audio(); if(!a) return;
  try{ const s = a.createBufferSource(); s.buffer = a.createBuffer(1, 1, 22050); s.connect(a.destination); s.start(0); }catch(e){}
  try{ if(navigator.audioSession) navigator.audioSession.type = 'playback'; }catch(e){}
}
['pointerdown','touchend','click','keydown'].forEach(ev => document.addEventListener(ev, unlock, {passive:true, capture:true}));

const bufs = {};
function loadClip(key){
  if(bufs[key]) return bufs[key];
  const a = audio();
  if(!a || !manifest[key]) return Promise.resolve(null);
  bufs[key] = fetch('audio/' + manifest[key])
    .then(r => r.ok ? r.arrayBuffer() : Promise.reject(r.status))
    .then(buf => new Promise(res => {
      const p = a.decodeAudioData(buf, b => res(b), () => res(null));
      if(p && p.catch) p.catch(() => res(null));
    }))
    .catch(() => { delete bufs[key]; return null; });
  return bufs[key];
}
let tok = 0, src = null;
function hush(){
  tok++;
  if(src){ try{ src.stop(); }catch(e){} src = null; }
  $('#listenBtn').classList.remove('talking');
}
function playBuf(b){
  return new Promise(res => {
    const a = audio(); if(!a || !b) return res();
    const s = a.createBufferSource(); s.buffer = b; s.connect(a.destination); src = s;
    let done = false; const fin = () => { if(!done){ done = true; if(src === s) src = null; res(); } };
    s.onended = fin; setTimeout(fin, b.duration*1000 + 250);
    try{ s.start(0); }catch(e){ fin(); }
  });
}
/* parts : clés audio et pauses (ms). Ne bloque jamais le jeu. */
async function say(parts, talk=false){
  hush(); const my = tok;
  const loads = parts.map(p => typeof p === 'string' ? loadClip(p) : null);
  if(talk) $('#listenBtn').classList.add('talking');
  for(let i=0;i<parts.length;i++){
    if(my !== tok) return;
    if(typeof parts[i] === 'number'){ await wait(parts[i]); continue; }
    const b = await loads[i];
    if(my !== tok) return;
    await playBuf(b);
  }
  if(my === tok) $('#listenBtn').classList.remove('talking');
}
/* petits effets sonores */
function tone(f, t0, dur, type='sine', vol=.2, f2){
  const a = audio(); if(!a) return;
  try{
    const t = a.currentTime + t0, o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if(f2) o.frequency.exponentialRampToValueAtTime(f2, t+dur);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t+.02); g.gain.exponentialRampToValueAtTime(.0001, t+dur);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t+dur+.05);
  }catch(e){}
}
const sfx = {
  ding(){ [784,988,1319,1568].forEach((f,i)=>tone(f,i*.08,.4,'triangle',.16)); },
  boing(){ tone(330,0,.4,'sine',.22,110); },
  hop(){ tone(380,0,.18,'sine',.14,820); },
  gem(){ [1568,2093,2637].forEach((f,i)=>tone(f,i*.07,.3,'sine',.1)); },
  sparkle(){ for(let i=0;i<6;i++) tone(1400+Math.random()*1600,i*.05,.18,'sine',.06); },
  slip(){ tone(1600,0,.9,'sine',.15,240); },
  prout(){ tone(140,0,.6,'sawtooth',.12,60); },
  fanfare(){ [523,659,784,1047,784,1047].forEach((f,i)=>tone(f,i*.14,i===5?.7:.2,'square',.06)); },
};

export { ready, preload, audio, unlock, loadClip, hush, say, sfx };
