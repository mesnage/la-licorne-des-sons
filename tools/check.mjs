/* Vérifications automatiques du jeu (aucune dépendance) :  npm run check
   1. chaque son a assez de mots, bien écrits ([partie surlignée] + emoji)
   2. chaque phrase / lettre / mot dit par le jeu a son fichier audio
   3. la règle des « e » et des fausses réponses est respectée (milliers de tirages) */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PHONEMES } from '../js/data/phonemes.js';
import { LEVELS, ALL } from '../js/data/sounds.js';
import { distractors, isE, OTHER_VOWELS } from '../js/questions.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const plain = w => w.replace(/[[\]]/g, '');
let errors = 0;
const fail = m => { errors++; console.error('✗ ' + m); };

// 1. données
for (const s of ALL) {
  if (s.words.length < 4) fail(`le son « ${s.g} » n'a que ${s.words.length} mots (4 minimum)`);
  for (const w of s.words) {
    if (!/\[.+\]/.test(w.w)) fail(`« ${w.w} » (son ${s.g}) : il manque la partie surlignée [..]`);
    if (!w.e || w.e.length > 12) fail(`« ${w.w} » (son ${s.g}) : emoji manquant`);
  }
}

// 2. audio
const manifest = JSON.parse(readFileSync(join(ROOT, 'audio/manifest.json'), 'utf8'));
const need = new Set();
for(const p of PHONEMES)for(const key of p.audio)need.add(key);
for (const s of ALL) { need.add('L:' + s.g); need.add('F:' + s.g); for (const w of s.words) need.add('w:' + plain(w.w)); }
const walk = d => readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(join(d, e.name)) : e.name.endsWith('.js') ? [join(d, e.name)] : []);
for (const f of walk(join(ROOT, 'js'))) {
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(/\b([NU])\((['"])(.+?)\2\)/g)) need.add(m[1].toLowerCase() + ':' + m[3]);
}
for (const k of need) {
  if (!manifest[k]) fail(`pas d'audio pour « ${k} »  ->  lancez : python3 tools/voice/build_voice.py`);
  else if (!existsSync(join(ROOT, 'audio', manifest[k]))) fail(`fichier audio manquant : audio/${manifest[k]}`);
}
const unused = Object.keys(manifest).filter(k => !need.has(k));
if (unused.length) console.log(`ℹ ${unused.length} audio(s) inutilisé(s) (python3 tools/voice/build_voice.py --prune pour les retirer)`);

// 3. fausses réponses
let rounds = 0;
for (const [name, pool] of Object.entries(LEVELS)) {
  for (const s of pool) for (const w of s.words) for (let r = 0; r < 15; r++) {
    rounds++;
    const t = { ...s, w: w.w }, d = distractors(t, pool), opts = [t, ...d], word = plain(t.w).toLowerCase();
    const es = opts.filter(o => isE(o.g));
    const where = `${name} / ${t.g} / ${plain(t.w)} -> ${d.map(o => o.g).join(', ')}`;
    if (d.length !== 2) { fail(`pas 2 fausses réponses : ${where}`); continue; }
    if (new Set(opts.map(o => o.p)).size !== 3) fail(`deux cartes du même son : ${where}`);
    if (es.length > 1) fail(`deux « e » sur les cartes : ${where}`);
    if (es.length === 1 && opts.filter(o => !isE(o.g)).some(o => !OTHER_VOWELS.includes(o.g))) fail(`un « e » sans deux autres voyelles : ${where}`);
    if (d.some(o => word.includes(o.g))) fail(`une fausse réponse est dans le mot : ${where}`);
  }
}

const words = new Set(ALL.flatMap(s => s.words.map(w => plain(w.w))));
console.log(`${ALL.length} sons, ${words.size} mots, ${need.size} audios nécessaires, ${rounds} tirages testés`);
if (errors) { console.error(`\n${errors} problème(s)`); process.exit(1); }
console.log('✓ tout est en ordre');
