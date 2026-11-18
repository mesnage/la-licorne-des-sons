import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createClipCache} from '../js/audio-cache.js';
test('decoded audio cache evicts least recently used clips and shares pending loads',async()=>{
  const cache=createClipCache(2);let calls=0;
  const load=()=>{calls++;return {clip:true};};
  const a=cache.get('a',load);assert.equal(a,cache.get('a',load));await a;assert.equal(calls,1);
  await cache.get('b',load);await cache.get('a',load);await cache.get('c',load);assert.equal(cache.size,2);
  await cache.get('a',load);assert.equal(calls,3);await cache.get('b',load);assert.equal(calls,4);
});
test('failed and invalidated audio can be loaded again without a stale request taking over',async()=>{
  const cache=createClipCache();assert.equal(await cache.get('a',()=>Promise.reject(Error('offline'))),null);
  let finish;const old=cache.get('a',()=>new Promise(resolve=>{finish=resolve;}));await Promise.resolve();
  cache.invalidate('a');await cache.get('a',()=> 'new');finish('old');await old;
  assert.equal(await cache.get('a',()=> 'wrong'),'new');
});
