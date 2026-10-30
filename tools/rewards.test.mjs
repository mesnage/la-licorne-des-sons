import test from 'node:test';
import assert from 'node:assert/strict';
import { createRewards, dayKey, REWARD_KEY, PRIZES, SEGMENTS } from '../js/reward-store.js';
const memory = () => {
  const data = new Map();
  return { getItem: k => data.get(k) ?? null, setItem: (k,v) => data.set(k,v) };
};
test('six equal segments give unicorn three times each other prize, with no money prize', () => {
  assert.deepEqual(PRIZES.map(p => p.id), ['candies','chocolate','story','unicorn']);
  assert.deepEqual(SEGMENTS.map(p => SEGMENTS.filter(n => n === p).length), [1,3,1,3,1,3]);
  const store = createRewards(memory());
  for(let i=0;i<6;i++){
    store.earn();
    assert.equal(store.spin(() => (i+.5)/6).segment, i);
  }
  assert.deepEqual(store.snapshot().counts, [1,1,1,3]);
});
test('one spin per completion, with pending spins and prizes surviving reload', () => {
  const storage = memory(), store = createRewards(storage);
  assert.equal(store.spin(), null);
  store.earn(); store.earn();
  const reloaded = createRewards(storage);
  assert.equal(reloaded.snapshot().pending, 2);
  reloaded.spin(() => 0); reloaded.spin(() => .9);
  assert.equal(reloaded.spin(), null);
  const last = createRewards(storage).snapshot();
  assert.equal(last.pending, 0);
  assert.deepEqual(last.counts, [1,0,0,1]);
});
test('local calendar day resets counts while preserving unclaimed spins', () => {
  const storage = memory();
  let date = new Date(2026,9,30,23,59);
  const store = createRewards(storage, () => date);
  store.earn(); store.spin(() => .99); store.earn();
  date = new Date(2026,9,31,0,1);
  assert.equal(dayKey(date), '2026-10-31');
  assert.deepEqual(store.snapshot().counts, [0,0,0,0]);
  assert.equal(store.snapshot().pending, 1);
  store.spin(() => .99);
  assert.deepEqual(createRewards(storage, () => date).snapshot().counts, [0,0,0,1]);
});
test('old five-prize records retain pending spins and non-money counts, without any balance', () => {
  const storage = memory(), date = () => new Date(2026,9,30,12);
  storage.setItem(REWARD_KEY, JSON.stringify({pending:2,savings:25,day:'2026-10-30',counts:[1,2,3,5,6]}));
  const store = createRewards(storage,date);
  assert.deepEqual(store.snapshot(), {pending:2,day:'2026-10-30',counts:[1,2,3,6],persistent:true});
  assert.equal(store.withdraw, undefined);
  store.spin(() => 0);
  assert.deepEqual(JSON.parse(storage.getItem(REWARD_KEY)), {pending:1,day:'2026-10-30',counts:[2,2,3,6]});
  assert.deepEqual(createRewards(storage,date).snapshot().counts,[2,2,3,6]);
});
test('bad or blocked storage does not break the game', () => {
  const storage = memory();
  storage.setItem(REWARD_KEY, '{bad json');
  assert.equal(createRewards(storage).snapshot().pending, 0);
  storage.setItem(REWARD_KEY, JSON.stringify({pending:-1,day:'',counts:[]}));
  assert.deepEqual(createRewards(storage).snapshot().counts, [0,0,0,0]);
  const store = createRewards({ getItem(){ throw new Error(); }, setItem(){ throw new Error(); } });
  store.earn(); store.spin(() => .99);
  assert.equal(store.snapshot().persistent, false);
  assert.deepEqual(store.snapshot().counts, [0,0,0,1]);
});
test('another tab sees claimed spins rather than reusing stale pending spins', () => {
  const storage = memory(), first = createRewards(storage), second = createRewards(storage);
  first.earn(); second.spin(() => .99);
  assert.equal(first.spin(), null);
  assert.deepEqual(first.snapshot().counts, [0,0,0,1]);
});
test('readable storage with a full quota still retains session prizes', () => {
  const storage = memory(), saved = createRewards(storage);
  saved.earn(); saved.spin(() => .99);
  storage.setItem = () => { throw new Error('Quota exceeded'); };
  const session = createRewards(storage);
  session.earn();
  assert.equal(session.snapshot().pending, 1);
  session.spin(() => .99);
  assert.deepEqual(session.snapshot().counts, [0,0,0,2]);
  assert.equal(session.snapshot().persistent, false);
});
