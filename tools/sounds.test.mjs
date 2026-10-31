import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL, CONSONNES, SONS, EXPERTS, LEVELS } from '../js/data/sounds.js';
import { makeTargets, distractors } from '../js/questions.js';
import { seen, occurrences, recordRound } from '../js/storage.js';
import { STOPS, stepForProgress } from '../js/data/path.js';

test('every alphabet consonant plus Y is available, alongside CH and Ç', () => {
  const letters = new Set(CONSONNES.map(s => s.g));
  for(const letter of 'bcdfghjklmnpqrstvwx yz'.replaceAll(' ','')) assert.ok(letters.has(letter),letter);
  assert.ok(letters.has('ch')); assert.ok(letters.has('ç'));
  assert.equal(letters.size, CONSONNES.length);
});
test('expanded vocabulary has over twice the original 200 words and diverse sound patterns', () => {
  const words = new Set(ALL.flatMap(s => s.words.map(w => w.w.replace(/[\[\]]/g,''))));
  assert.ok(words.size >= 450);
  assert.ok(SONS.length >= 13); assert.ok(EXPERTS.length >= 15);
  for(const s of ALL){
    assert.ok(s.words.length >= 4);
    for(const w of s.words) assert.equal(/\[(.+?)\]/.exec(w.w)?.[1],s.g,w.w);
  }
});
test('ten word answers collect ten distinct crystals and reach the original castle', () => {
  const route = Array.from({length:11},(_,i) => stepForProgress(i,10));
  assert.deepEqual(route,[0,2,4,6,8,10,12,14,16,18,20]);
  assert.equal(STOPS[route.at(-1)].pad,'castle');
  assert.equal(stepForProgress(-1,10),0); assert.equal(stepForProgress(11,10),20);
  assert.equal(stepForProgress(20,20),20);
});

test('target planning balances every letter without recording unplayed words', () => {
  const before = { ...seen };
  for(const pool of Object.values(LEVELS)){
    const targets = makeTargets(pool, pool.length * 3);
    const counts = pool.map(sound => targets.filter(t => t.g === sound.g).length);
    // Avoiding consecutive homophones can defer one member of a sound group.
    assert.ok(Math.min(...counts) >= 2);
    assert.ok(Math.max(...counts) - Math.min(...counts) <= 2);
    for(let i = 1; i < targets.length; i++) assert.notEqual(targets[i].p, targets[i-1].p);
  }
  assert.deepEqual(seen, before);
});

test('played rounds persist exposure and less-used targets take priority', () => {
  const pool = LEVELS.voyelles;
  const target = { ...pool[0], w: pool[0].words[0].w };
  recordRound(target, [target, pool[1], pool[2]]);
  assert.equal(occurrences.targets.a, 1);
  assert.equal(occurrences.choices.e, 1);
  assert.ok(seen[target.w]);
  assert.ok(makeTargets(pool, 6).every(t => t.g !== 'a'));
  delete occurrences.targets.a;
  for(const s of [target, pool[1], pool[2]]) delete occurrences.choices[s.g];
  delete seen[target.w];
});

test('frequently displayed E variants give way to eligible less-used vowels', () => {
  for(const g of ['e','é','è']) occurrences.choices[g] = 1000;
  const target = { ...LEVELS.voyelles[0], w: '[a]' };
  for(let i = 0; i < 30; i++){
    const choices = distractors(target, LEVELS.voyelles);
    assert.equal(choices.length, 2);
    assert.ok(choices.every(s => ['i','o','u'].includes(s.g)));
  }
  for(const g of ['e','é','è']) delete occurrences.choices[g];
});

test('word rotation uses every example before repeating within a planned game', () => {
  const pool = LEVELS.voyelles;
  const targets = makeTargets(pool, pool.length * 4);
  for(const sound of pool){
    const words = targets.filter(t => t.g === sound.g).map(t => t.w);
    assert.equal(new Set(words).size, words.length);
  }
});
