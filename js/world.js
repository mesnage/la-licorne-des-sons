/* La Licorne des Sons — le décor (7 mondes) dessiné en SVG */
import { W, H, STOPS } from './data/path.js';
import { $, gemSVG } from './utils.js';

const sy = y => H - y;
const f1 = n => Math.round(n*10)/10;
function tulip(x,b,c){ return `<path d="M${x} ${b} V${b-15}" stroke="#3fae6e" stroke-width="2"/><path d="M${x-5} ${b-19} Q${x-5} ${b-11} ${x} ${b-11} Q${x+5} ${b-11} ${x+5} ${b-19} L${x+2.5} ${b-16} L${x} ${b-20} L${x-2.5} ${b-16}Z" fill="${c}"/>`; }
function daisy(x,b){ let s=`<path d="M${x} ${b} V${b-11}" stroke="#3fae6e" stroke-width="2"/>`; for(let k=0;k<6;k++){const a=k*Math.PI/3; s+=`<circle cx="${f1(x+Math.cos(a)*4)}" cy="${f1(b-13+Math.sin(a)*4)}" r="2.8" fill="#fff"/>`;} return s+`<circle cx="${x}" cy="${b-13}" r="2.6" fill="#ffc93c"/>`; }
function tree(x,b,s,g){ return clay(`<ellipse cx="${x}" cy="${b}" rx="${22*s}" ry="${4*s}" fill="#1d6b50" opacity=".25"/>
  <rect x="${x-4*s}" y="${b-36*s}" width="${8*s}" height="${36*s}" rx="${3*s}" fill="url(#wTrunk)"/>
  <circle cx="${x-15*s}" cy="${b-42*s}" r="${18*s}" fill="url(#${g})"/><circle cx="${x+15*s}" cy="${b-44*s}" r="${17*s}" fill="url(#${g})"/>
  <circle cx="${x}" cy="${b-60*s}" r="${23*s}" fill="url(#${g})"/>
  <ellipse cx="${x-7*s}" cy="${b-70*s}" rx="${8*s}" ry="${5*s}" fill="#fff" opacity=".55"/>`); }
function mushroom(x,b,s,cap){ const w=26*s,h=20*s,st=18*s;
  return clay(`<rect x="${x-6*s}" y="${b-st}" width="${12*s}" height="${st}" rx="${5*s}" fill="url(#wStem)"/>
  <path d="M${x-w} ${b-st+2*s} Q${x-w} ${b-st-h} ${x} ${b-st-h} Q${x+w} ${b-st-h} ${x+w} ${b-st+2*s} Q${x} ${b-st+8*s} ${x-w} ${b-st+2*s}Z" fill="url(#${cap})"/>
  <ellipse cx="${x-10*s}" cy="${b-st-9*s}" rx="${4*s}" ry="${3*s}" fill="#fff" opacity=".9"/><ellipse cx="${x+8*s}" cy="${b-st-13*s}" rx="${5*s}" ry="${3.5*s}" fill="#fff" opacity=".9"/><ellipse cx="${x+18*s}" cy="${b-st-3*s}" rx="${3*s}" ry="${2*s}" fill="#fff" opacity=".9"/>`); }
function lolli(x,b,s,c1,c2){ return clay(`<rect x="${x-2*s}" y="${b-50*s}" width="${4*s}" height="${50*s}" rx="2" fill="#fff"/>
  <circle cx="${x}" cy="${b-58*s}" r="${16*s}" fill="${c1}"/><circle cx="${x}" cy="${b-58*s}" r="${11*s}" fill="none" stroke="${c2}" stroke-width="${3.5*s}"/>
  <circle cx="${x}" cy="${b-58*s}" r="${4.5*s}" fill="${c2}"/><ellipse cx="${x-6*s}" cy="${b-66*s}" rx="${5*s}" ry="${3*s}" fill="#fff" opacity=".75"/>`); }
function scoop(x,b,r,c,c2){ return clay(`<circle cx="${x}" cy="${b}" r="${r}" fill="${c}"/>
  <path d="M${x-r*.95} ${b-r*.3} q${r*.2} ${r*.35} ${r*.4} 0 q${r*.2} ${r*.45} ${r*.45} 0 q${r*.2} ${r*.3} ${r*.45} 0 q${r*.2} ${r*.4} ${r*.6} -.1" fill="none" stroke="${c2}" stroke-width="6" stroke-linecap="round" opacity=".5"/>
  <circle cx="${x}" cy="${b-r-6}" r="8" fill="#ff4f6d"/><path d="M${x} ${b-r-13} q4 -10 10 -12" stroke="#3fae6e" stroke-width="2" fill="none"/>
  <ellipse cx="${x-r*.4}" cy="${b-r*.65}" rx="${r*.25}" ry="${r*.12}" fill="#fff" opacity=".6"/>`); }
function gumdrop(x,b,c){ return clay(`<path d="M${x-12} ${b} Q${x-12} ${b-20} ${x} ${b-20} Q${x+12} ${b-20} ${x+12} ${b}Z" fill="${c}"/><ellipse cx="${x-4}" cy="${b-14}" rx="3" ry="2" fill="#fff" opacity=".7"/>`); }
function cane(x,b){ return clay(`<path d="M${x} ${b} V${b-56} Q${x} ${b-72} ${x+13} ${b-72} Q${x+26} ${b-72} ${x+26} ${b-60}" fill="none" stroke="url(#wCane)" stroke-width="9" stroke-linecap="round"/>`); }
function star4(x,y,s,cls='tw'){ return `<path class="${cls}" style="animation-delay:${f1(-Math.random()*2.2)}s" d="M${x} ${y-6*s} L${x+1.6*s} ${y-1.6*s} L${x+6*s} ${y} L${x+1.6*s} ${y+1.6*s} L${x} ${y+6*s} L${x-1.6*s} ${y+1.6*s} L${x-6*s} ${y} L${x-1.6*s} ${y-1.6*s}Z" fill="#fff8d6"/>`; }
function cloud(x,y,s,g='wCloud'){ return `<g fill="url(#${g})"><ellipse cx="${x}" cy="${y+8*s}" rx="${38*s}" ry="${11*s}"/><circle cx="${x-16*s}" cy="${y+2*s}" r="${14*s}"/><circle cx="${x+4*s}" cy="${y-4*s}" r="${18*s}"/><circle cx="${x+22*s}" cy="${y+3*s}" r="${12*s}"/></g>`; }
function butterfly(x,y,c,d){ return `<g class="bf" style="animation-delay:${d}s"><g transform="translate(${x} ${y})"><g class="wing"><path d="M0 0 C-10 -12 -14 -2 -8 3 C-12 8 -4 10 0 2 C4 10 12 8 8 3 C14 -2 10 -12 0 0Z" fill="${c}"/><circle r="1.6" fill="#45185a"/></g></g></g>`; }

function padSVG(s){
  const x = s.x, t = sy(s.y);
  if(s.pad === 'flower'){
    let p = `<path d="M${x} ${t+4} V232" stroke="#3fae6e" stroke-width="5" stroke-linecap="round"/>
      <path d="M${x} ${t+30} q-18 -8 -24 2 q12 6 24 -2" fill="#5ccb8c"/><path d="M${x} ${t+40} q18 -8 24 2 q-12 6 -24 -2" fill="#4fbf80"/>`;
    for(let k=0;k<8;k++){ const a = k*Math.PI/4; p += `<ellipse cx="${f1(x+Math.cos(a)*19)}" cy="${f1(t+3+Math.sin(a)*7)}" rx="14" ry="7" fill="${s.c}" stroke="#fff" stroke-opacity=".5"/>`; }
    return p + `<ellipse cx="${x}" cy="${t+3}" rx="14" ry="5.5" fill="url(#wPollen)"/><ellipse cx="${x-4}" cy="${t+1}" rx="5" ry="1.8" fill="#fff" opacity=".7"/>`;
  }
  if(s.pad === 'mush'){
    const w = 42, h = 22;
    return `<ellipse cx="${x}" cy="228" rx="22" ry="4" fill="#0e4d38" opacity=".3"/>
      <rect x="${x-11}" y="${t+14}" width="22" height="${228-t-14}" rx="9" fill="url(#wStem)"/>
      <ellipse cx="${x}" cy="${t+h-2}" rx="${w-6}" ry="6" fill="#f3e2cf"/>
      <path d="M${x-w} ${t+h-2} Q${x-w} ${t-2} ${x} ${t-2} Q${x+w} ${t-2} ${x+w} ${t+h-2} Q${x} ${t+h+6} ${x-w} ${t+h-2}Z" fill="url(#${s.c})"/>
      <ellipse cx="${x-22}" cy="${t+10}" rx="6" ry="4" fill="#fff" opacity=".92"/><ellipse cx="${x+18}" cy="${t+8}" rx="7" ry="4.5" fill="#fff" opacity=".92"/><ellipse cx="${x+33}" cy="${t+15}" rx="3.5" ry="2.5" fill="#fff" opacity=".92"/><ellipse cx="${x-36}" cy="${t+16}" rx="3" ry="2.2" fill="#fff" opacity=".92"/>
      <ellipse cx="${x-12}" cy="${t+2}" rx="12" ry="3" fill="#fff" opacity=".55"/>`;
  }
  if(s.pad === 'macaron'){
    return `<rect x="${x-8}" y="${t+18}" width="16" height="${232-t-18}" rx="6" fill="url(#wCane)"/>
      <rect x="${x-8}" y="${t+18}" width="16" height="${232-t-18}" rx="6" fill="url(#wCyl)"/>
      <ellipse cx="${x}" cy="${t+17}" rx="32" ry="9" fill="${s.c2}"/>
      <ellipse cx="${x}" cy="${t+11}" rx="30" ry="6" fill="#fff7e8"/>
      <path d="M${x-32} ${t+8} Q${x-32} ${t-4} ${x} ${t-4} Q${x+32} ${t-4} ${x+32} ${t+8} Q${x} ${t+14} ${x-32} ${t+8}Z" fill="${s.c}"/>
      <ellipse cx="${x-10}" cy="${t+1}" rx="11" ry="3" fill="#fff" opacity=".6"/>`;
  }
  if(s.pad === 'shell'){
    let r = '';
    for(let k=-3;k<=3;k++) r += `<path d="M${x} ${t+30} L${x+k*9.5} ${t+1+Math.abs(k)*2.2}" stroke="#fff" stroke-width="2.4" opacity=".75" stroke-linecap="round"/>`;
    return `<ellipse cx="${x}" cy="${t+36}" rx="32" ry="5" fill="#b07a3a" opacity=".3"/>
      <path d="M${x-34} ${t+12} Q${x-30} ${t-6} ${x} ${t-4} Q${x+30} ${t-6} ${x+34} ${t+12} Q${x+16} ${t+36} ${x} ${t+36} Q${x-16} ${t+36} ${x-34} ${t+12}Z" fill="${s.c}" stroke="#fff" stroke-width="2"/>${r}
      <path d="M${x-12} ${t+34} L${x} ${t+44} L${x+12} ${t+34}Z" fill="${s.c}" stroke="#fff" stroke-width="1.5"/>
      <circle cx="${x+22}" cy="${t+30}" r="5.5" fill="url(#wPearl)"/><circle cx="${x+20.5}" cy="${t+28.5}" r="1.6" fill="#fff"/>
      <ellipse cx="${x-12}" cy="${t+2}" rx="10" ry="2.6" fill="#fff" opacity=".7"/>`;
  }
  if(s.pad === 'ice'){
    return `<ellipse cx="${x}" cy="233" rx="32" ry="4" fill="#4a7cc0" opacity=".25"/>
      <rect x="${x-27}" y="${t}" width="54" height="${232-t}" rx="9" fill="url(#wIce)"/>
      <rect x="${x-27}" y="${t}" width="54" height="11" rx="5.5" fill="#fff" opacity=".9"/>
      <path d="M${x-27} ${t+6} q6 10 0 18 M${x+27} ${t+6} q-5 8 0 14" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M${x-15} ${t+22} l10 -7 M${x+5} ${t+36} l12 -8" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".85"/>`;
  }
  if(s.pad === 'cloud'){
    return `<g fill="url(#wCloudN)"><ellipse cx="${x}" cy="${t+20}" rx="40" ry="10"/><circle cx="${x-22}" cy="${t+14}" r="13"/><circle cx="${x+22}" cy="${t+14}" r="13"/><circle cx="${x}" cy="${t+12}" r="17"/></g>
      <ellipse cx="${x-6}" cy="${t+2}" rx="9" ry="3" fill="#fff" opacity=".7"/>`;
  }
  return '';
}

function crystalCastle(x, base){
  return `<g transform="translate(${x-60} ${base-150})"><circle cx="60" cy="80" r="95" fill="url(#wGlow)" class="glowpulse"/></g>
  <g transform="translate(${x-60} ${base-150})"><g>
    <rect x="8" y="64" width="26" height="86" rx="6" fill="url(#wCrW)"/><rect x="86" y="64" width="26" height="86" rx="6" fill="url(#wCrW)"/>
    <rect x="28" y="80" width="64" height="70" rx="6" fill="url(#wCrW)"/>
    <g fill="url(#wCrW)"><rect x="28" y="72" width="11" height="12" rx="2.5"/><rect x="45" y="72" width="11" height="12" rx="2.5"/><rect x="64" y="72" width="11" height="12" rx="2.5"/><rect x="81" y="72" width="11" height="12" rx="2.5"/></g>
    <rect x="45" y="42" width="30" height="46" rx="6" fill="url(#wCrW)"/>
    <path d="M3 66 L21 22 L39 66Z" fill="url(#wCrR)"/><path d="M81 66 L99 22 L117 66Z" fill="url(#wCrR)"/><path d="M40 44 L60 0 L80 44Z" fill="url(#wCrR)"/>
    <path d="M21 22 L21 66 M99 22 L99 66 M60 0 L60 44" stroke="#fff" stroke-width="1.5" opacity=".7"/>
    <path d="M14 96 v-8 a7 7 0 0 1 14 0 v8Z" fill="#fff6b8"/><path d="M92 96 v-8 a7 7 0 0 1 14 0 v8Z" fill="#fff6b8"/><circle cx="60" cy="58" r="8" fill="#fff6b8"/>
    <path d="M48 150 V126 a12 12 0 0 1 24 0 V150Z" fill="#7a5be0"/>
    <path d="M60 104 c-4-6-12-2-8 4 l8 7 8-7 c4-6-4-10-8-4z" fill="#ff5fa8"/>
  </g>${star4(21,18,1.3)}${star4(99,18,1.3)}${star4(60,-6,1.6)}</g>`;
}

/* petits générateurs de décor */
const clay = x => x;
let seedN = 7;
const rnd = () => (seedN = (seedN * 9301 + 49297) % 233280) / 233280;
function hills(x0, x1, base, amp, fill, extra=''){
  const n = Math.max(2, Math.round((x1 - x0) / 140));
  let top = `M${x0} ${base}`;
  for(let k=0;k<n;k++){
    const xa = x0 + (k+.5)*(x1-x0)/n, xb = x0 + (k+1)*(x1-x0)/n;
    top += ` Q${f1(xa)} ${f1(base - amp*(.6 + rnd()*.9))} ${f1(xb)} ${f1(base + (rnd()-.5)*amp*.3)}`;
  }
  return `<g><path d="M${x0} 262 L${top.slice(1)} L${x1} 262Z" fill="${fill}" ${extra}/></g>
    <path d="${top}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2.4" stroke-linecap="round" transform="translate(0 1.5)"/>`;
}
function tufts(x0, x1, y, c){
  let d = '';
  for(let x = x0; x < x1; x += 23 + (x % 17)){ const yy = y + ((x*7) % 14); d += `M${x} ${yy} q2 -9 4 0 q2 -12 4 0 q2 -8 4 0 `; }
  return `<path d="${d}" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>`;
}
const emo = (x, y, size, ch, cls='', style='') => `<text class="${cls}" style="${style}" x="${x}" y="${y}" font-size="${size}" text-anchor="middle">${ch}</text>`;
function palm(x, b, s){
  const tx = x + 4*s, ty = b - 84*s;
  let leaves = '';
  [[-1,-.1],[-.65,-.85],[.15,-1],[.85,-.6],[1,.1]].forEach(([dx,dy]) => {
    leaves += `<path d="M${f1(tx)} ${f1(ty)} q${f1(dx*24*s)} ${f1(dy*16*s - 12*s)} ${f1(dx*44*s)} ${f1(dy*22*s + 10*s)}" stroke="#2fb873" stroke-width="${f1(10*s)}" fill="none" stroke-linecap="round"/>`;
  });
  return clay(`<ellipse cx="${x}" cy="${b}" rx="${20*s}" ry="${3.5*s}" fill="#b07a3a" opacity=".3"/>
    <path d="M${x} ${b} Q${x+10*s} ${b-44*s} ${f1(tx)} ${f1(ty)}" stroke="url(#wTrunk)" stroke-width="${f1(8*s)}" fill="none" stroke-linecap="round"/>
    ${leaves}<circle cx="${f1(tx-3*s)}" cy="${f1(ty+5*s)}" r="${f1(4.5*s)}" fill="#a8714f"/><circle cx="${f1(tx+4*s)}" cy="${f1(ty+6*s)}" r="${f1(4.5*s)}" fill="#8b583b"/>`);
}
function starfish(x, y, s, c){
  let pts = '';
  for(let k=0;k<10;k++){ const a = -Math.PI/2 + k*Math.PI/5, r = (k%2 ? 4.5 : 11) * s; pts += `${f1(x+Math.cos(a)*r)},${f1(y+Math.sin(a)*r)} `; }
  return clay(`<polygon points="${pts}" fill="${c}" stroke="#fff" stroke-width="1" stroke-linejoin="round"/><circle cx="${x}" cy="${y}" r="${1.6*s}" fill="#fff" opacity=".8"/>`);
}
function umbrella(x, b){
  const cols = ['#ff6fb1','#fff','#7fe3e0','#fff','#ffd34d','#fff'];
  let sl = '';
  cols.forEach((c,k) => { const a0 = Math.PI + k*Math.PI/6, a1 = a0 + Math.PI/6; sl += `<path d="M${x} ${b-62} L${f1(x+Math.cos(a0)*36)} ${f1(b-62+Math.sin(a0)*18)} L${f1(x+Math.cos(a1)*36)} ${f1(b-62+Math.sin(a1)*18)}Z" fill="${c}"/>`; });
  return clay(`<path d="M${x} ${b} V${b-64}" stroke="#fff" stroke-width="3"/><path d="M${x-36} ${b-62} Q${x} ${b-100} ${x+36} ${b-62}" fill="#ff6fb1"/>${sl}
    <path d="M${x-36} ${b-62} Q${x-24} ${b-58} ${x-12} ${b-62} Q${x} ${b-58} ${x+12} ${b-62} Q${x+24} ${b-58} ${x+36} ${b-62}" fill="none" stroke="#fff" stroke-width="2"/>
    <rect x="${x-26}" y="${b-6}" width="30" height="6" rx="3" fill="#7fe3e0"/>`);
}
function sandcastle(x, b){
  return clay(`<g fill="#f5c77e"><rect x="${x-22}" y="${b-22}" width="44" height="22" rx="3"/><rect x="${x-26}" y="${b-34}" width="14" height="34" rx="3"/><rect x="${x+12}" y="${b-34}" width="14" height="34" rx="3"/><rect x="${x-8}" y="${b-40}" width="16" height="40" rx="3"/></g>
    <path d="M${x-4} ${b} V${b-10} a4 4 0 0 1 8 0 V${b}Z" fill="#c9954d"/>
    <path d="M${x} ${b-40} V${b-54}" stroke="#a8714f" stroke-width="1.5"/><path d="M${x} ${b-54} L${x+10} ${b-50} L${x} ${b-46}Z" fill="#ff5fa8"/>`);
}
function iceSpike(x, b, h, w){
  return clay(`<path d="M${x-w} ${b} L${x} ${b-h} L${x+w} ${b}Z" fill="url(#wIce)"/><path d="M${x} ${b-h} L${x+w*.25} ${b}" stroke="#fff" stroke-width="2" opacity=".75"/>`);
}
function igloo(x, b){
  return clay(`<path d="M${x-40} ${b} A40 34 0 0 1 ${x+40} ${b}Z" fill="url(#wSnowB)" stroke="#cfe3ff" stroke-width="2"/>
    <path d="M${x-36} ${b-12} H${x+36} M${x-28} ${b-24} H${x+28} M${x-10} ${b} V${b-12} M${x+14} ${b-12} V${b-24} M${x-16} ${b-24} V${b-34}" stroke="#b8d4ff" stroke-width="2"/>
    <path d="M${x+14} ${b} V${b-10} a10 10 0 0 1 20 0 V${b}Z" fill="#7fa8e0"/>`);
}
function snowman(x, b){
  return clay(`<circle cx="${x}" cy="${b-16}" r="18" fill="url(#wSnowB)"/><circle cx="${x}" cy="${b-42}" r="13" fill="url(#wSnowB)"/>
    <circle cx="${x-4}" cy="${b-45}" r="1.8" fill="#45185a"/><circle cx="${x+5}" cy="${b-45}" r="1.8" fill="#45185a"/>
    <path d="M${x+1} ${b-41} l12 3 l-12 2Z" fill="#ff8a3d"/>
    <path d="M${x-12} ${b-31} Q${x} ${b-26} ${x+12} ${b-31}" stroke="#ff5fa8" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M${x+7} ${b-30} l4 12" stroke="#ff5fa8" stroke-width="4" stroke-linecap="round"/>
    <path d="M${x-9} ${b-53} h18 v-3 h-4 v-10 h-10 v10 h-4Z" fill="#8b5cf6"/>
    <path d="M${x-17} ${b-22} l-14 -10 M${x+17} ${b-22} l14 -10" stroke="#a8714f" stroke-width="2.5" stroke-linecap="round"/>`);
}

function buildWorld(){
  seedN = 7;
  let s = `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true"><defs>
    <linearGradient id="wMeadow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9fadb"/><stop offset=".35" stop-color="#8fe6b2"/><stop offset="1" stop-color="#4fbf80"/></linearGradient>
    <linearGradient id="wForest" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a5ebcf"/><stop offset=".35" stop-color="#5cc79e"/><stop offset="1" stop-color="#23876a"/></linearGradient>
    <linearGradient id="wCandy" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe6f3"/><stop offset=".35" stop-color="#ffb8da"/><stop offset="1" stop-color="#ec74b0"/></linearGradient>
    <linearGradient id="wWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c8f4ff"/><stop offset="1" stop-color="#3fa9e6"/></linearGradient>
    <linearGradient id="wSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9f6ff"/><stop offset=".45" stop-color="#45cde8"/><stop offset="1" stop-color="#1f8fd6"/></linearGradient>
    <linearGradient id="wSand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4d2"/><stop offset=".4" stop-color="#ffdf96"/><stop offset="1" stop-color="#eab35c"/></linearGradient>
    <linearGradient id="wSnowB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfe3ff"/></linearGradient>
    <linearGradient id="wSnow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".4" stop-color="#e6f2ff"/><stop offset="1" stop-color="#a9c8f5"/></linearGradient>
    <linearGradient id="wIce" x1="0" x2="1"><stop offset="0" stop-color="#8fdcff"/><stop offset=".35" stop-color="#e8fbff"/><stop offset=".7" stop-color="#9fe0fa"/><stop offset="1" stop-color="#4f9ee0"/></linearGradient>
    <radialGradient id="wPearl" cx="35%" cy="30%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e0cfff"/></radialGradient>
    <radialGradient id="wCloud" cx="50%" cy="25%" r="75%"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#fff"/><stop offset="1" stop-color="#e2d6ff"/></radialGradient>
    <radialGradient id="wCloudN" cx="50%" cy="25%" r="75%"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#efe8ff"/><stop offset="1" stop-color="#b8a2f0"/></radialGradient>
    <linearGradient id="wStem" x1="0" x2="1"><stop offset="0" stop-color="#e2cfb8"/><stop offset=".4" stop-color="#fffaf2"/><stop offset="1" stop-color="#cdb498"/></linearGradient>
    <linearGradient id="wCyl" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".18"/><stop offset=".4" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
    <radialGradient id="wCapP" cx="40%" cy="25%" r="80%"><stop offset="0" stop-color="#ffd6ea"/><stop offset=".5" stop-color="#ff6fb1"/><stop offset="1" stop-color="#c8246f"/></radialGradient>
    <radialGradient id="wCapL" cx="40%" cy="25%" r="80%"><stop offset="0" stop-color="#eee4ff"/><stop offset=".5" stop-color="#a07bff"/><stop offset="1" stop-color="#5b2fc2"/></radialGradient>
    <radialGradient id="wCapA" cx="40%" cy="25%" r="80%"><stop offset="0" stop-color="#dcfffb"/><stop offset=".5" stop-color="#4fd6dc"/><stop offset="1" stop-color="#11899a"/></radialGradient>
    <radialGradient id="wPollen" cx="40%" cy="30%"><stop offset="0" stop-color="#fffbe0"/><stop offset="1" stop-color="#ffb81f"/></radialGradient>
    <radialGradient id="wTreeA" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#d8fff0"/><stop offset=".5" stop-color="#6fd8b0"/><stop offset="1" stop-color="#23876a"/></radialGradient>
    <radialGradient id="wTreeL" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#efe6ff"/><stop offset=".5" stop-color="#b597ff"/><stop offset="1" stop-color="#6d43d6"/></radialGradient>
    <radialGradient id="wTreeP" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#ffe1ef"/><stop offset=".5" stop-color="#ff9cc9"/><stop offset="1" stop-color="#e0478f"/></radialGradient>
    <linearGradient id="wTrunk" x1="0" x2="1"><stop offset="0" stop-color="#a8714f"/><stop offset=".4" stop-color="#e0ad88"/><stop offset="1" stop-color="#8b583b"/></linearGradient>
    <pattern id="wCane" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="12" height="12" fill="#fff"/><rect width="6" height="12" fill="#ff6fb1"/></pattern>
    <radialGradient id="wGlow"><stop offset="0" stop-color="#fff6c9" stop-opacity=".95"/><stop offset=".5" stop-color="#e6d6ff" stop-opacity=".45"/><stop offset="1" stop-color="#e6d6ff" stop-opacity="0"/></radialGradient>
    <linearGradient id="wCrW" x1="0" x2="1"><stop offset="0" stop-color="#cfefff"/><stop offset=".3" stop-color="#ffffff"/><stop offset=".7" stop-color="#e5d8ff"/><stop offset="1" stop-color="#a98bff"/></linearGradient>
    <linearGradient id="wCrR" x1="0" x2="1"><stop offset="0" stop-color="#7fe3f0"/><stop offset=".45" stop-color="#ecfdff"/><stop offset=".55" stop-color="#bfe6ff"/><stop offset="1" stop-color="#7a63e6"/></linearGradient>
    <radialGradient id="wHouse" cx="40%" cy="25%" r="80%"><stop offset="0" stop-color="#ffd6ea"/><stop offset=".5" stop-color="#ff6fb1"/><stop offset="1" stop-color="#b81f65"/></radialGradient>
  </defs>`;

  /* ===== 1. Prairie des fleurs (0–780) ===== */
  s += hills(-20, 790, 200, 24, '#b6f2cf');
  s += tree(392,206,.9,'wTreeP') + tree(570,204,.8,'wTreeL') + tree(720,206,.7,'wTreeA');
  s += hills(-20, 790, 222, 8, 'url(#wMeadow)') + tufts(0, 780, 228, '#3fae6e');
  s += `<ellipse cx="34" cy="224" rx="36" ry="5" fill="#1d6b50" opacity=".3"/><g>
    <rect x="8" y="168" width="52" height="56" rx="16" fill="url(#wStem)"/>
    <path d="M24 224 V204 a10 10 0 0 1 20 0 V224Z" fill="#a8714f"/><circle cx="40" cy="214" r="1.6" fill="#ffd34d"/>
    <circle cx="50" cy="186" r="6" fill="#fff6b8" stroke="#e2cfb8" stroke-width="2"/>
    <path d="M-16 176 Q-16 128 34 128 Q84 128 84 176 Q34 186 -16 176Z" fill="url(#wHouse)"/>
    <ellipse cx="10" cy="152" rx="8" ry="5" fill="#fff" opacity=".92"/><ellipse cx="44" cy="142" rx="10" ry="6" fill="#fff" opacity=".92"/><ellipse cx="68" cy="162" rx="6" ry="4" fill="#fff" opacity=".92"/>
    <rect x="58" y="120" width="10" height="18" rx="3" fill="#c0896a"/>
  </g><circle class="smoke" cx="63" cy="116" r="6" fill="#fff"/><circle class="smoke" style="animation-delay:-2s" cx="63" cy="116" r="5" fill="#fff"/>`;
  for(let x=150, k=0; x<780; x+=52, k++) s += tulip(x, 226 - (k%2)*4, ['#ff6fb1','#b99bff','#ffd34d','#ff8cc4'][k%4]);
  for(let x=124, k=0; x<780; x+=96, k++) s += daisy(x, 230 - (k%3)*3);
  s += butterfly(200,150,'#ff8cc4',0) + butterfly(420,130,'#8fdcff',-3) + butterfly(620,160,'#ffd34d',-5);
  s += emo(300, 228, 18, '🐞', 'crab');

  /* ===== 2. Forêt enchantée (720–1300) ===== */
  s += hills(720, 1300, 206, 14, '#7fd9b3', 'opacity=".9"');
  s += tree(770,210,1.15,'wTreeA') + tree(900,206,1.25,'wTreeL') + tree(1060,208,1.1,'wTreeA') + tree(1170,206,1.2,'wTreeL') + tree(1265,210,.9,'wTreeA');
  s += mushroom(870,226,1.1,'wCapA') + mushroom(930,230,.7,'wCapP') + mushroom(1110,228,.9,'wCapA') + mushroom(1230,229,.6,'wCapP');
  s += hills(720, 1300, 222, 7, 'url(#wForest)') + tufts(730, 1270, 228, '#1d7a5a');
  for(let i=0;i<18;i++){ const x = 740 + i*31, y = 110 + ((i*37)%90); s += `<circle class="ff" style="animation-delay:${f1(-i*.4)}s" cx="${x}" cy="${y}" r="2.4" fill="#fff6a8"/><circle class="ff" style="animation-delay:${f1(-i*.4)}s" cx="${x}" cy="${y}" r="6" fill="#fff6a8" opacity=".35"/>`; }
  s += emo(990, 214, 22, '🦔', 'crab', 'animation-duration:6s');

  /* ===== 3. Rivière & pont arc-en-ciel (1270–1460) ===== */
  s += `<path d="M1270 230 Q1364 220 1460 230 L1470 262 L1260 262Z" fill="url(#wWater)"/>
    <path class="shimmer" d="M1290 242 h28 M1340 250 h34 M1392 240 h24 M1430 252 h18" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>
    <ellipse cx="1300" cy="248" rx="9" ry="3" fill="#5ccb8c"/><circle cx="1302" cy="246" r="3" fill="#ff8cc4"/><ellipse cx="1420" cy="254" rx="8" ry="2.6" fill="#5ccb8c"/>`;
  s += emo(1330, 252, 18, '🐟', 'dolph', 'animation-delay:-1s');

  /* ===== 4. Pays des bonbons (1440–2010) ===== */
  s += scoop(1520,214,58,'#aaf0d1','#fff') + scoop(1680,212,70,'#fff0c4','#ffc2dc') + scoop(1850,214,62,'#ffc2dc','#fff');
  s += lolli(1610,222,1,'#ff9ccc','#fff') + lolli(1790,222,1.15,'#b99bff','#fff') + lolli(1960,222,.9,'#7fe3e0','#fff') + cane(1700,224);
  s += hills(1440, 2020, 218, 10, 'url(#wCandy)');
  s += gumdrop(1480,236,'#ff6fb1') + gumdrop(1640,232,'#b99bff') + gumdrop(1770,236,'#4fd6dc') + gumdrop(1900,234,'#ffc93c') + gumdrop(1990,236,'#ff6fb1');
  for(let i=0;i<28;i++){ const x = 1455 + i*20, y = 238 + (i*7)%16, c = ['#fff','#ffe066','#8fdcff','#b99bff'][i%4]; s += `<rect x="${x}" y="${y}" width="6" height="2.4" rx="1.2" fill="${c}" transform="rotate(${(i*47)%180} ${x+3} ${y+1})"/>`; }
  s += emo(1560, 240, 18, '🧁') + emo(1940, 242, 18, '🍩');

  /* le pont arc-en-ciel, dessiné par-dessus les rives */
  ['#ff6b8f','#ffad47','#ffe45c','#6fe0a0','#5cc2ff','#a98bff','#e9a4ff'].forEach((c,k) => { const r = 80 - k*6.2; s += `<path d="M${f1(1364-r)} 236 A${f1(r)} ${f1(r)} 0 0 1 ${f1(1364+r)} 236" fill="none" stroke="${c}" stroke-width="6.6"/>`; });
  s += `<path d="M1288 236 A76 76 0 0 1 1440 236" fill="none" stroke="#fff" stroke-width="1.6" opacity=".7"/>`;
  s += star4(1300,170,1) + star4(1430,160,1.2) + star4(1364,128,.9);

  /* ===== 5. Lagon des sirènes (2000–2560) ===== */
  s += `<rect x="2000" y="176" width="565" height="70" fill="url(#wSea)"/>
    <path d="M2000 178 q12 -5 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0" fill="none" stroke="#fff" stroke-width="3" opacity=".9"/>
    <path class="shimmer" d="M2040 192 h30 M2120 200 h22 M2210 190 h34 M2330 198 h26 M2440 192 h30" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>`;
  s += emo(2160, 206, 30, '🐬', 'dolph') + emo(2420, 206, 26, '🐬', 'dolph', 'animation-delay:-2.5s');
  s += emo(2290, 190, 24, '⛵', 'boat');
  s += emo(2520, 172, 22, '🧜‍♀️', 'boat', 'animation-duration:3.2s');
  s += hills(1995, 2570, 222, 9, 'url(#wSand)');
  s += palm(2030, 228, 1) + palm(2545, 228, 1.1) + umbrella(2250, 236) + sandcastle(2370, 238);
  s += starfish(2100,240,1,'#ff8cc4') + starfish(2200,248,.8,'#ffb547') + starfish(2470,244,.9,'#b99bff');
  s += emo(2310, 252, 18, '🦀', 'crab') + emo(2140, 254, 14, '🐚');

  /* ===== 6. Pays des glaces (2555–3080) ===== */
  s += hills(2555, 3080, 196, 26, 'url(#wSnowB)');
  s += iceSpike(2600,206,46,14) + iceSpike(2624,206,30,10) + iceSpike(2905,204,56,16) + iceSpike(2932,204,34,11) + iceSpike(3040,206,40,13);
  s += igloo(2700, 216) + snowman(2840, 220);
  s += hills(2555, 3080, 220, 8, 'url(#wSnow)');
  s += emo(2985, 226, 26, '🐧', 'waddle') + emo(2650, 232, 16, '🐧', 'waddle', 'animation-delay:-.4s');
  for(let i=0;i<26;i++){ const x = 2565 + (i*41)%510, y = (i*29)%150; s += `<circle class="snow" style="animation-delay:${f1(-i*.47)}s;animation-duration:${f1(5+(i%4))}s" cx="${x}" cy="${y}" r="${1.6+(i%3)}" fill="#fff"/>`; }

  /* ===== 7. Royaume des nuages (3060–3800) ===== */
  for(let i=0;i<22;i++) s += star4(3080 + (i*37)%710, 18 + (i*53)%120, .7 + (i%3)*.25);
  for(let x=3080, k=0; x<3820; x+=120, k++) s += cloud(x, 200 + (k%2)*12, 1.3 + (k%3)*.2, 'wCloudN');
  for(let x=3050, k=0; x<3840; x+=150, k++) s += cloud(x, 238, 1.8 + (k%2)*.3, 'wCloudN');
  s += `<g fill="url(#wCloudN)"><ellipse cx="3678" cy="${sy(98)+16}" rx="110" ry="22"/><circle cx="3618" cy="${sy(98)+6}" r="26"/><circle cx="3738" cy="${sy(98)+8}" r="24"/></g>`;
  s += crystalCastle(3678, sy(98)+4);
  s += emo(3330, 60, 22, '🌙', 'boat', 'animation-duration:4s');

  STOPS.forEach(st => s += clay(padSVG(st)));
  return s + `</svg>`;
}

function buildFar(){
  seedN = 3;
  const FW = 1800;
  let d = 'M0 175', caps = '', x = 0;
  while(x < FW){
    const w = 70 + rnd()*60, h = 70 + rnd()*70, px = x + w/2, py = 200 - h;
    d += ` L${f1(px)} ${f1(py)} L${f1(x+w)} ${f1(150 + rnd()*25)}`;
    caps += `<path d="M${f1(px)} ${f1(py)} L${f1(px+11)} ${f1(py+15)} L${f1(px+4)} ${f1(py+12)} L${f1(px)} ${f1(py+17)} L${f1(px-5)} ${f1(py+12)} L${f1(px-11)} ${f1(py+15)}Z" fill="#fff"/>`;
    x += w;
  }
  d += ` L${FW} 260 L0 260Z`;
  const island = (ix, iy, c) => `<g transform="translate(${ix} ${iy})"><ellipse cx="0" cy="0" rx="34" ry="8" fill="#9fe8c0"/><path d="M-30 2 Q0 46 30 2Z" fill="#c9b6ff"/><circle cx="-8" cy="-10" r="8" fill="${c}"/><rect x="-9" y="-4" width="2" height="6" fill="#c0896a"/><circle cx="14" cy="18" r="3" fill="#fff" opacity=".7"/></g>`;
  return `<svg viewBox="0 0 ${FW} 260" aria-hidden="true"><defs>
    <linearGradient id="fM1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6dcff"/><stop offset="1" stop-color="#b9a5f2"/></linearGradient>
    <linearGradient id="fM2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d3c4ff"/><stop offset="1" stop-color="#a48ee8"/></linearGradient>
    <linearGradient id="fHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".6" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  </defs>
  <path d="${d}" fill="url(#fM1)"/>${caps}
  ${island(560,64,'#ff9ccc')}${island(1120,50,'#7fe3e0')}
  <g transform="translate(1660 92)" opacity=".8"><rect x="0" y="20" width="10" height="34" fill="#efe6ff"/><rect x="30" y="20" width="10" height="34" fill="#efe6ff"/><rect x="8" y="28" width="24" height="26" fill="#efe6ff"/><rect x="14" y="8" width="12" height="30" fill="#efe6ff"/><path d="M-2 22 L5 4 L12 22Z M28 22 L35 4 L42 22Z M12 10 L20 -8 L28 10Z" fill="#c9b6ff"/></g>
  ${hills(0, FW, 192, 26, 'url(#fM2)')}
  <rect y="150" width="${FW}" height="70" fill="url(#fHaze)"/></svg>`;
}

function buildFront(){
  const FW = 4800;
  let s = `<svg viewBox="0 0 ${FW} 260" aria-hidden="true">`;
  for(let k=0, x=60; x<FW; x+=330, k++){
    const wx = x / 1.2;
    const c = wx < 760 ? ['#ff8cc4','#b99bff'][k%2] : wx < 1300 ? '#2f9a73' : wx < 2000 ? ['#ff9ccc','#7fe3e0'][k%2] : wx < 2560 ? '#ffd98a' : wx < 3080 ? '#eaf4ff' : '#ffffff';
    if(wx >= 760 && wx < 1300 && k%2){ s += `<path d="M${x} 262 q10 -40 18 0 q8 -50 18 0 q8 -36 16 0Z" fill="${c}" opacity=".85"/>`; continue; }
    s += `<g opacity=".9"><circle cx="${x}" cy="262" r="26" fill="${c}"/><circle cx="${x+30}" cy="268" r="18" fill="${c}"/><circle cx="${x-6}" cy="250" r="6" fill="#fff" opacity=".6"/></g>`;
  }
  return s + `</svg>`;
}

/* Dessine le décor et place les cristaux ; renvoie la liste des cristaux (index = étape) */
function mountWorld(){
  $('#far').innerHTML = buildFar();
  $('#world').insertAdjacentHTML('afterbegin', buildWorld());
  $('#front').innerHTML = buildFront();
  const n = $('#skyNight');
  for(let i=0;i<24;i++){ const d=document.createElement('div'); d.className='nstar'; const z=1+Math.random()*2;
    Object.assign(d.style,{width:z+'px',height:z+'px',left:Math.random()*100+'%',top:Math.random()*60+'%'}); n.appendChild(d); }
  const gems = [];
  STOPS.forEach((st,i) => {
    if(i === 0) return;
    const g = document.createElement('div'); g.className = 'gem';
    g.innerHTML = gemSVG(i); g.style.left = (st.x - 15) + 'px'; g.style.bottom = (st.y + 62) + 'px';
    $('#world').appendChild(g); gems[i] = g;
  });
  return gems;
}

export { mountWorld };
