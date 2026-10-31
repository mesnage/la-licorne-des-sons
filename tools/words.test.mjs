import test from 'node:test';
import assert from 'node:assert/strict';
import { WORDS, WORD_LEVELS } from '../js/data/words.js';
import { WordSession, makeQuestion, chooseTarget, introducedPool, practiceWeight, mastered } from '../js/words/model.js';
import { createWordProgress, WORD_PROGRESS_KEY } from '../js/words/progress.js';
import { createWordVoice, frenchVoice } from '../js/words/voice.js';

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
  for(const w of WORDS){ assert.equal(w.text, w.text.toLocaleLowerCase('fr')); assert.ok(w.id); }
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
function voiceHost(voices){
  let timer = 0;
  const spoken = [], audios = [], events = new Map(), timers = new Map();
  const host = {
    setTimeout(fn){timers.set(++timer,fn);return timer;}, clearTimeout(id){timers.delete(id);},
    SpeechSynthesisUtterance: class { constructor(text){this.text=text;} },
    Audio: class {
      constructor(url){this.url=url;this.paused=true;audios.push(this);}
      play(){this.paused=false;return Promise.resolve();}
      pause(){this.paused=true;}
    },
    speechSynthesis: {
      getVoices:()=>voices,
      speak(u){spoken.push(u);}, cancel(){},
      addEventListener:(name,fn)=>events.set(name,fn), removeEventListener:name=>events.delete(name)
    }
  };
  return {host,spoken,audios,events,timers};
}
const fr = {lang:'fr-FR',localService:true}, en = {lang:'en-US',localService:true};
test('French voice only, complete slow prompt, replace previous speech on every replay', () => {
  assert.equal(frenchVoice([en]),null);
  assert.equal(frenchVoice([en,{lang:'fr-CA'},fr]),fr);
  const {host,spoken,timers} = voiceHost([en,fr]), messages = [];
  let cancels = 0; host.speechSynthesis.cancel = () => {cancels++;};
  const voice = createWordVoice(host,m => messages.push(m));
  voice.speak({text:'maison'}); voice.speak({text:'chat'}); voice.speak({text:'lena',speech:'Léna'});
  assert.equal(cancels,3); assert.equal(timers.size,1);
  assert.equal(spoken[0].text,'Trouve le mot… maison !');
  assert.equal(spoken[2].text,'Trouve le mot… Léna !');
  assert.equal(spoken[2].rate,.8); assert.equal(spoken[2].voice,fr);
  spoken[2].onend(); assert.equal(timers.size,0);
  voice.destroy();
});
test('no French voice, playback errors and silent engines give a generic hint, never the target', () => {
  const {host,spoken,events,timers} = voiceHost([en]), messages = [];
  const voice = createWordVoice(host,m => messages.push(m));
  voice.speak({text:'maison'});
  assert.equal(spoken.length,0); assert.match(messages.at(-1),/voix française/);
  assert.ok(messages.every(m => !m.includes('maison')));
  host.speechSynthesis.getVoices = () => [fr]; events.get('voiceschanged')();
  voice.speak({text:'maison'}); spoken[0].onerror();
  assert.ok(messages.every(m => !m.includes('maison')));
  voice.speak({text:'maison'});
  [...timers.values()].forEach(fn=>fn());
  assert.match(messages.at(-1),/voix française/);
  voice.destroy(); assert.equal(events.size,0);
});
test('recorded prompts have priority, stop on replay, and fall back safely on load error', () => {
  const {host,spoken,audios} = voiceHost([fr]);
  const voice = createWordVoice(host,()=>{});
  voice.speak({text:'maison',audio:'audio/word-maison.mp3'});
  assert.equal(audios[0].url,'audio/word-maison.mp3'); assert.equal(spoken.length,0);
  voice.speak({text:'chat',audio:'audio/word-chat.mp3'});
  assert.equal(audios[0].paused,true);
  audios[1].onerror(); assert.equal(spoken[0].text,'Trouve le mot… chat !');
  voice.stop();
});
test('starting a new session avoids the previous session’s last word', () => {
  const first = new WordSession(WORDS,1,{},seeded());
  const lastId = first.questions.at(-1).target.id;
  for(let seed = 0; seed < 50; seed++){
    const next = new WordSession(WORDS,1,{},seeded(seed),lastId);
    assert.notEqual(next.current.target.id,lastId);
  }
});
test('late rejection of an old recording cannot restart or overlap the current prompt', async () => {
  const {host,spoken} = voiceHost([fr]);
  let reject;
  host.Audio = class {
    play(){return new Promise((resolve,failed) => {reject = failed;});}
    pause(){}
  };
  const voice = createWordVoice(host,()=>{});
  voice.speak({text:'maison',audio:'missing.mp3'});
  voice.speak({text:'chat'});
  reject(new Error('Delayed rejection'));
  await Promise.resolve();
  assert.equal(spoken.length,1); assert.equal(spoken[0].text,'Trouve le mot… chat !');
  voice.stop();
});
