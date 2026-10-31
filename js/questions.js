/* La Licorne des Sons — choix des questions et des fausses réponses */
import { ALL } from './data/sounds.js';
import { shuffle, plain } from './utils.js';
import { seen, markSeen, occurrences } from './storage.js';

function pickWord(snd, history){
  const memory = history || seen;
  const ws = shuffle(snd.words).sort((a,b) => (memory[a.w]||0) - (memory[b.w]||0));
  const w = ws[0];
  if(history) history[w.w] = Date.now();
  else markSeen(w.w);
  return Object.assign({}, snd, {w:w.w, e:w.e});
}
function makeTargets(p, n){
  const out = [];
  const counts = { ...occurrences.targets }, history = { ...seen };
  while(out.length < n){
    const candidates = p.filter(s => !out.length || out[out.length-1].p !== s.p);
    const snd = shuffle(candidates.length ? candidates : p).sort((a,b) => (counts[a.g]||0) - (counts[b.g]||0))[0];
    out.push(pickWord(snd, history));
    counts[snd.g] = (counts[snd.g]||0) + 1;
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
  let c, rank;
  if(isE(t.g)){
    rank = x => (t.g.length === 1 && x.g.length > 1 ? 2 : 0) + (pool.includes(x) ? 0 : 1);
    c = ALL.filter(x => OTHER_VOWELS.includes(x.g) && ok(x));
  } else {
    rank = x => pool.includes(x) ? 0 : 1;
    c = ALL.filter(ok);
  }
  const pairs = [];
  for(let i = 0; i < c.length; i++) for(let j = i + 1; j < c.length; j++){
    const a = c[i], b = c[j];
    if(a.p === b.p) continue;
    if(isE(a.g) && (!targetVowel || isE(b.g) || !OTHER_VOWELS.includes(b.g))) continue;
    if(isE(b.g) && (!targetVowel || isE(a.g) || !OTHER_VOWELS.includes(a.g))) continue;
    pairs.push([a,b]);
  }
  const priority = pair => pair.reduce((n,x) => n + rank(x), 0);
  const exposure = pair => pair.reduce((n,x) => n + (occurrences.choices[x.g]||0), 0);
  return shuffle(pairs).sort((a,b) => priority(a) - priority(b) || exposure(a) - exposure(b))[0] || [];
}

export { pickWord, makeTargets, distractors, isE, OTHER_VOWELS };
