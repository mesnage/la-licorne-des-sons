import test from 'node:test';
import assert from 'node:assert/strict';
import { WORDS, WORD_LEVELS } from '../js/data/words.js';
import { WordSession, makeQuestion, chooseTarget, introducedPool, practiceWeight, mastered } from '../js/words/model.js';
import { createWordProgress, WORD_PROGRESS_KEY } from '../js/words/progress.js';
import { createWordVoice } from '../js/words/voice.js';

function seeded(seed = 12345){
  return () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
}
function memory(){
  const data = new Map();
  return { getItem: k => data.get(k) ?? null, setItem: (k,v) => data.set(k,v) };
}
const stat = (extra = {}) => ({ completed: 0, firstTry: 0, misses: 0, streak: 0, ...extra });
test('all requested words are editable, uniquely identified and lowercase across three levels', () => {
  assert.ok(WORDS.length >= 44);
  assert.equal(new Set(WORDS.map(w => w.id)).size, WORDS.length);
  assert.ok(WORD_LEVELS.every(l => WORDS.filter(w => w.level === l.id).length >= 4));
  for(const w of WORDS){ assert.equal(w.text, w.text.toLocaleLowerCase('fr')); assert.ok(w.id); assert.equal(w.audioKey,'W:'+w.id); }
  for(const text of ['lena','léon','aujourd’hui','parce que','prout']) assert.ok(WORDS.some(w => w.text === text));
});
test('question generation: four unique same-level choices, one target, shuffled positions', () => {
  const random = seeded(), positions = new Set();
  for(const level of WORD_LEVELS){
    const pool = WORDS.filter(w => w.level === level.id);
    for(const target of pool) for(let i = 0; i < 30; i++){
      const q = makeQuestion(target, pool, random);
      assert.equal(q.choices.length, 4);
      assert.equal(new Set(q.choices.map(w => w.text)).size, 4);
      assert.equal(q.choices.filter(w => w.id === target.id).length, 1);
      assert.ok(q.choices.every(w => w.level === level.id));
      positions.add(q.choices.findIndex(w => w.id === target.id));
    }
  }
  assert.equal(positions.size, 4);
});
test('homophones and duplicate written words never appear together, including distractor pairs', () => {
  const pool = [
    {id:'et',text:'et',soundGroup:'eh'}, {id:'est',text:'est',soundGroup:'eh'},
    {id:'mes',text:'mes',soundGroup:'meh'}, {id:'mais',text:'mais',soundGroup:'meh'},
    {id:'chat',text:'chat'}, {id:'lune',text:'lune'}, {id:'chat2',text:'chat'}
  ];
  const random = seeded();
  for(const target of pool) for(let i = 0; i < 50; i++){
    const q = makeQuestion(target, pool, random);
    assert.equal(new Set(q.choices.map(w => w.soundGroup || w.text)).size, 4);
    assert.equal(new Set(q.choices.map(w => w.text)).size, 4);
  }
  assert.throws(() => makeQuestion(pool[0], pool.slice(0,3)), /four distinguishable/);
});
test('sessions have exactly ten questions, no consecutive repeated targets, and gradual introductions', () => {
  for(const level of WORD_LEVELS){
    const session = new WordSession(WORDS, level.id, {}, seeded());
    assert.equal(session.questions.length, 10);
    for(let i = 1; i < 10; i++) assert.notEqual(session.questions[i].target.id, session.questions[i-1].target.id);
    assert.equal(introducedPool(WORDS, level.id, {}).length, Math.min(6, WORDS.filter(w => w.level === level.id).length));
    const first = WORDS.find(w => w.level === level.id);
    const pool = introducedPool(WORDS, level.id, { [first.id]: stat({completed:1}) });
    assert.equal(pool.length, Math.min(7, WORDS.filter(w => w.level === level.id).length));
  }
});
test('missed words are selected more often later; mastered words are maintained less often', () => {
  const pool = WORDS.filter(w => w.level === 1).slice(0,6), stats = { le: stat({misses:3}), la: stat({streak:3,firstTry:3,completed:3}) };
  const counts = Object.fromEntries(pool.map(w => [w.id,0])), random = seeded();
  for(let i = 0; i < 10000; i++) counts[chooseTarget(pool,stats,null,random).id]++;
  assert.ok(counts.le > counts.un * 3);
  assert.ok(counts.la < counts.un * .7);
  assert.ok(practiceWeight(stats.le) > practiceWeight(stats.la));
  assert.equal(mastered(stats.la), true);
});
test('retry without penalty, first-try scoring, duplicate tap protection and exact end of session', () => {
  const session = new WordSession(WORDS,1,{},seeded());
  assert.equal(session.next(), false);
  assert.equal(session.answer('unknown'), null);
  for(let i = 0; i < 10; i++){
    const q = session.current;
    if(i < 2){
      const wrong = q.choices.find(w => w.id !== q.target.id);
      assert.deepEqual(session.answer(wrong.id), {correct:false,firstMistake:true});
      assert.deepEqual(session.answer(wrong.id), {correct:false,firstMistake:false});
      assert.equal(session.index, i);
    }
    assert.deepEqual(session.answer(q.target.id), {correct:true,firstTry:i >= 2});
    assert.equal(session.answer(q.target.id), null);
    assert.equal(session.next(), true);
  }
  assert.equal(session.score, 8);
  assert.equal(session.phase, 'finished');
  assert.equal(session.answer('le'), null);
  assert.equal(session.next(), false);
});
test('progress persists, includes abandoned missed words and mastery recovers with practice', () => {
  const storage = memory(), progress = createWordProgress(storage);
  progress.miss('maison');
  assert.equal(createWordProgress(storage).snapshot().maison.misses,1);
  progress.complete('maison',false);
  for(let i = 0; i < 3; i++) progress.complete('maison',true);
  const saved = createWordProgress(storage).snapshot().maison;
  assert.deepEqual(saved, {completed:4,firstTry:3,misses:1,streak:3});
  assert.equal(mastered(saved),true);
  progress.miss('maison');
  assert.equal(mastered(progress.snapshot().maison),false);
});
test('malformed, unavailable and full storage do not prevent learning during the session', () => {
  const storage = memory(); storage.setItem(WORD_PROGRESS_KEY, JSON.stringify({bad:{streak:-1}}));
  assert.deepEqual(createWordProgress(storage).snapshot(),{});
  for(const source of [undefined, {getItem(){throw new Error();},setItem(){throw new Error();}},
    {getItem:()=>null,setItem(){throw new Error();}}]){
    const p = createWordProgress(source);
    p.miss('le'); p.complete('le',false); p.complete('la',true);
    assert.equal(p.snapshot().le.misses,1);
    assert.equal(p.snapshot().la.firstTry,1);
    assert.equal(p.persistent,false);
  }
});
function playback(){
  const spoken=[],hushed=[],loaded=[],unlocked=[];
  const audio={ready:Promise.resolve(),loadClip:async key=>{loaded.push(key);return {duration:2};},say:async parts=>{spoken.push(parts);},hush:()=>hushed.push(true),unlock:()=>unlocked.push(true)};
  return {audio,spoken,hushed,loaded,unlocked};
}
test('word prompts use the shared recorded audio engine and stable word IDs',async()=>{
  const p=playback(),messages=[],voice=createWordVoice(p.audio,m=>messages.push(m));
  await voice.speak(WORDS.find(w=>w.id==='maison'));await voice.speak(WORDS.find(w=>w.id==='lena'));
  assert.deepEqual(p.loaded,['W:maison','W:lena']);assert.deepEqual(p.spoken,[['W:maison'],['W:lena']]);
  assert.equal(p.hushed.length,2);assert.equal(p.unlocked.length,2);assert.ok(messages.every(m=>m===''));
});
test('missing or failed recordings show a generic retry hint without revealing the answer',async()=>{
  const p=playback(),messages=[],voice=createWordVoice(p.audio,m=>messages.push(m));p.audio.loadClip=async()=>null;
  await voice.speak({id:'maison',text:'maison'});assert.equal(p.spoken.length,0);assert.match(messages.at(-1),/Réécouter/);assert.ok(messages.every(m=>!m.includes('maison')));
  p.audio.loadClip=async()=>{throw Error('Network');};await voice.speak({id:'chat',text:'chat'});assert.ok(messages.every(m=>!m.includes('chat')));
});
test('stopping or leaving during loading cancels the pending word prompt',async()=>{
  for(const end of ['stop','destroy']){
    const p=playback();let resolve;p.audio.loadClip=()=>new Promise(done=>{resolve=done;});
    const voice=createWordVoice(p.audio,()=>{}),pending=voice.speak({id:'chat'});await Promise.resolve();voice[end]();resolve({duration:2});await pending;assert.equal(p.spoken.length,0);
  }
});
test('playback errors use the same generic hint and never substitute a device voice',async()=>{
  const p=playback(),messages=[];p.audio.say=async()=>{throw Error('Playback');};
  const voice=createWordVoice(p.audio,m=>messages.push(m));await voice.speak({id:'maison'});assert.match(messages.at(-1),/Réécouter/);assert.ok(!messages.at(-1).includes('maison'));
});
test('starting a new session avoids the previous session’s last word', () => {
  const first = new WordSession(WORDS,1,{},seeded());
  const lastId = first.questions.at(-1).target.id;
  for(let seed = 0; seed < 50; seed++){
    const next = new WordSession(WORDS,1,{},seeded(seed),lastId);
    assert.notEqual(next.current.target.id,lastId);
  }
});
test('a late load from an old prompt cannot restart or overlap the current word',async()=>{
  const p=playback();let resolve;p.audio.loadClip=key=>key==='W:maison'?new Promise(done=>{resolve=done;}):Promise.resolve({duration:2});
  const voice=createWordVoice(p.audio,()=>{}),old=voice.speak({id:'maison'});await Promise.resolve();await voice.speak({id:'chat'});resolve({duration:2});await old;
  assert.deepEqual(p.spoken,[['W:chat']]);
});
