import test from 'node:test';
import assert from 'node:assert/strict';
import { createRewards, dayKey, REWARD_KEY, SEGMENTS } from '../js/reward-store.js';
const memory = () => {
  const data = new Map();
  return { getItem: k => data.get(k) ?? null, setItem: (k,v) => data.set(k,v) };
};
test('seven equal segments give unicorn three times each other prize', () => {
  assert.deepEqual(SEGMENTS.map(p => SEGMENTS.filter(n => n === p).length), [1,3,1,3,1,3,1]);
  const store = createRewards(memory());
  for(let i=0;i<7;i++){
    store.earn();
    assert.equal(store.spin(() => (i+.5)/7).segment, i);
  }
  assert.deepEqual(store.snapshot().counts, [1,1,1,1,3]);
  assert.equal(store.snapshot().savings, 5);
});
test('one spin per completion, with pending spins and prizes surviving reload', () => {
  const storage = memory(), store = createRewards(storage);
  assert.equal(store.spin(), null);
  store.earn(); store.earn();
  const reloaded = createRewards(storage);
  assert.equal(reloaded.snapshot().pending, 2);
  reloaded.spin(() => 0);
  reloaded.spin(() => .9);
  assert.equal(reloaded.spin(), null);
  const last = createRewards(storage).snapshot();
  assert.equal(last.pending, 0);
  assert.deepEqual(last.counts, [1,0,0,1,0]);
  assert.equal(last.savings, 5);
});
test('local calendar day resets counts while preserving savings and unclaimed spins', () => {
  const storage = memory();
  let date = new Date(2026,9,30,23,59);
  const store = createRewards(storage, () => date);
  store.earn(); store.spin(() => .99); store.earn();
  date = new Date(2026,9,31,0,1);
  assert.equal(dayKey(date), '2026-10-31');
  assert.deepEqual(store.snapshot().counts, [0,0,0,0,0]);
  assert.equal(store.snapshot().savings, 5);
  assert.equal(store.snapshot().pending, 1);
  store.spin(() => .99);
  assert.equal(createRewards(storage, () => date).snapshot().savings, 10);
});
test('withdrawals use whole cents and cannot overdraw or accept invalid amounts', () => {
  const storage = memory(), store = createRewards(storage);
  store.earn(); store.spin(() => .99);
  for(const value of [-1,0,6,.5,NaN,Infinity,'1']) assert.equal(store.withdraw(value), false);
  assert.equal(store.withdraw(3), true);
  assert.equal(createRewards(storage).snapshot().savings, 2);
  assert.equal(store.withdraw(2), true);
  assert.equal(store.snapshot().savings, 0);
  assert.deepEqual(store.snapshot().counts, [0,0,0,1,0]);
});
test('bad or blocked storage does not break the game', () => {
  const storage = memory();
  storage.setItem(REWARD_KEY, '{bad json');
  assert.equal(createRewards(storage).snapshot().pending, 0);
  storage.setItem(REWARD_KEY, JSON.stringify({pending:-1,savings:3,day:'',counts:[]}));
  assert.equal(createRewards(storage).snapshot().savings, 0);
  const store = createRewards({ getItem(){ throw new Error(); }, setItem(){ throw new Error(); } });
  store.earn(); store.spin(() => .99);
  assert.equal(store.snapshot().persistent, false);
  assert.equal(store.snapshot().savings, 5);
});
test('another tab sees claimed spins and withdrawals rather than reusing stale balances', () => {
  const storage = memory(), first = createRewards(storage), second = createRewards(storage);
  first.earn();
  second.spin(() => .99);
  assert.equal(first.spin(), null);
  assert.equal(first.snapshot().savings, 5);
  assert.equal(first.withdraw(4), true);
  assert.equal(second.withdraw(4), false);
  assert.equal(second.snapshot().savings, 1);
});
test('readable storage with a full quota still retains session prizes', () => {
  const storage = memory(), saved = createRewards(storage);
  saved.earn(); saved.spin(() => .99);
  storage.setItem = () => { throw new Error('Quota exceeded'); };
  const session = createRewards(storage);
  session.earn();
  assert.equal(session.snapshot().pending, 1);
  session.spin(() => .99);
  assert.equal(session.snapshot().savings, 10);
  assert.equal(session.snapshot().persistent, false);
});
