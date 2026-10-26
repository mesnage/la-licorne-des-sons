/* La Licorne des Sons — choix des questions et des fausses réponses */
import { ALL } from './data/sounds.js';
import { shuffle, plain } from './utils.js';
import { seen, markSeen } from './storage.js';

function pickWord(snd){
  const ws = shuffle(snd.words).sort((a,b) => (seen[a.w]||0) - (seen[b.w]||0));
  const w = ws[0]; markSeen(w.w);
  return Object.assign({}, snd, {w:w.w, e:w.e});
}
function makeTargets(p, n){
  const out = [];
  const bySeen = () => shuffle(p).sort((a,b) => Math.min(...a.words.map(w=>seen[w.w]||0)) - Math.min(...b.words.map(w=>seen[w.w]||0)));
  while(out.length < n){
    for(const snd of bySeen()){
      if(out.length < n && (!out.length || out[out.length-1].p !== snd.p)) out.push(pickWord(snd));
    }
  }
  return out;
}
/* Règle d'or : jamais deux « e » (e, é, è, eu, en, eau) sur les cartes.
   Un « e » est toujours présenté avec deux autres voyelles bien différentes. */
const isE = g => /[eéèê]/.test(g);
const OTHER_VOWELS = ['a','i','o','u','ou','on','an','in','oi','au','ain'];
function distractors(t, pool){
  const word = plain(t.w).toLowerCase();
  const inWord = new Set(ALL.filter(x => word.includes(x.g)).map(x => x.p));   // sons déjà présents dans le mot
  const ok = x => x.p !== t.p && !word.includes(x.g) && !inWord.has(x.p);
  const targetVowel = OTHER_VOWELS.includes(t.g);
  let c;
  if(isE(t.g)){
    const rank = x => (t.g.length === 1 && x.g.length > 1 ? 2 : 0) + (pool.includes(x) ? 0 : 1);
    c = shuffle(ALL.filter(x => OTHER_VOWELS.includes(x.g) && ok(x))).sort((a,b) => rank(a) - rank(b));
  } else {
    c = [...shuffle(pool.filter(ok)), ...shuffle(ALL.filter(x => ok(x) && !pool.includes(x)))];
  }
  const out = [];
  for(const x of c){
    if(out.length === 2) break;
    if(out.some(o => o.p === x.p)) continue;
    if(isE(x.g)){
      if(!targetVowel || out.some(o => isE(o.g) || !OTHER_VOWELS.includes(o.g))) continue;
    } else if(out.some(o => isE(o.g)) && !OTHER_VOWELS.includes(x.g)) continue;
    out.push(x);
  }
  return out;
}

export { pickWord, makeTargets, distractors, isE, OTHER_VOWELS };
