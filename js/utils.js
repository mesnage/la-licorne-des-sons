/* La Licorne des Sons — outils */
import { GEMCOLS } from './data/path.js';

const $ = s => document.querySelector(s);
const wait = ms => new Promise(r => setTimeout(r, ms));
const shuffle = a => { a=[...a]; for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];} return a; };
const pick = a => a[Math.random()*a.length|0];
const plain = w => w.replace(/[\[\]]/g,'');
const wordHTML = w => w.replace(/\[(.+?)\]/,'<mark>$1</mark>');
const cardHTML = g => `<span class="up">${g.toUpperCase()}</span><span class="lo">${g}</span>`;
function gemSVG(k){
  const [a,b,c,d] = GEMCOLS[k % GEMCOLS.length];
  return `<svg viewBox="0 0 40 44" aria-hidden="true">
    <polygon points="2,15 10,4 14,15" fill="${b}"/><polygon points="10,4 30,4 26,15 14,15" fill="${a}"/>
    <polygon points="30,4 38,15 26,15" fill="${c}"/><polygon points="2,15 14,15 20,41" fill="${c}"/>
    <polygon points="14,15 26,15 20,41" fill="${b}"/><polygon points="26,15 38,15 20,41" fill="${d}"/>
    <polygon points="13,7 18,7 15,12" fill="#fff" opacity=".85"/></svg>`;
}

export { $, wait, shuffle, pick, plain, wordHTML, cardHTML, gemSVG };
