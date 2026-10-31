import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL, CONSONNES, SONS, EXPERTS } from '../js/data/sounds.js';
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
