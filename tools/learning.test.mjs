import test from 'node:test';
import assert from 'node:assert/strict';
import { createMastery, MASTERY_KEY, SKILLS, revisionWeight, skillStatus, weightedPick } from '../js/learning/mastery.js';
import { PHONEMES } from '../js/data/phonemes.js';
import { phonemeQuestions } from '../js/learning/phonemes.js';
import { createWordProgress, WORD_PROGRESS_KEY } from '../js/words/progress.js';
import { createAdventure } from '../js/prototype/model.js';
const memory=()=>{const data=new Map();return {data,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};};
const rng=()=>{let n=153;return ()=>((n=(n*1664525+1013904223)>>>0)/2**32);};
test('all letter/grapheme skills and 31 separate phoneme skills have stable unique IDs',()=>{
 assert.equal(PHONEMES.length,31);assert.equal(SKILLS.length,89);assert.equal(new Set(SKILLS.map(s=>s.id)).size,89);
 const m=PHONEMES.find(s=>s.id==='m');assert.equal(m.ipa,'m');assert.ok(!m.ipa.includes('ɛ'));
 for(const p of PHONEMES){assert.equal(p.audio.length,p.examples.length);assert.equal(new Set(p.examples).size,2);}
});
test('phoneme questions introduce the selected stage progressively and avoid duplicate sound/spelling choices',()=>{
 const random=rng();
 for(const level of [1,2,3])for(let run=0;run<100;run++){
  const qs=phonemeQuestions(level,{},random);assert.equal(qs.length,10);
  assert.ok(new Set(qs.map(q=>q.target.id)).size<=6);
  for(const [i,q]of qs.entries()){
   assert.equal(q.target.level,level);assert.equal(q.choices.length,3);assert.equal(new Set(q.choices.map(c=>c.g)).size,3);assert.equal(new Set(q.choices.map(c=>c.ipa)).size,3);
   assert.ok(q.target.audioKey.startsWith('P:'));assert.ok(q.choices.some(c=>c.id===q.target.id));
   if(i)assert.notEqual(q.target.id,qs[i-1].target.id);
  }
 }
 assert.equal(createAdventure('phonemes',1).questions.length,10);
});
test('recognition requires varied examples and independent sessions; letter names cannot credit phonemes',()=>{
 const storage=memory(),m=createMastery(storage),id='phonemes:m';
 for(let i=0;i<4;i++)m.record(id,true,'first','moto',100+i);
 assert.equal(skillStatus(m.snapshot()[id]),'En progrès');
 m.record(id,true,'second','maison',200);assert.equal(skillStatus(m.snapshot()[id]),'Bien reconnu');
 m.record(id,false,'third','moto',300);assert.equal(skillStatus(m.snapshot()[id]),'À revoir');
 m.record('letters:m',true,'third','moto',400);assert.equal(m.snapshot()[id].correct,5);
 assert.equal(createMastery(storage).snapshot()[id].attempts,6);
});
test('difficult and due skills receive more revision while mastered skills remain in rotation',()=>{
 const m=createMastery(memory()),now=1000000;
 for(const [session,context] of [['a','moto'],['a','maison'],['b','moto']])m.record('phonemes:m',true,session,context,now);
 const mastered=m.snapshot()['phonemes:m'];assert.ok(revisionWeight(mastered,now)>0);assert.ok(revisionWeight(mastered,now)<revisionWeight(undefined,now));
 assert.ok(revisionWeight(mastered,now+15*86400000)>revisionWeight(mastered,now));
 const stats={m:mastered,s:{...mastered,streak:0}},random=rng(),counts={m:0,s:0};
 for(let i=0;i<10000;i++)counts[weightedPick([{id:'m'},{id:'s'}],stats,x=>x.id,null,random,now).id]++;
 assert.ok(counts.s>counts.m*5);assert.equal(weightedPick([{id:'m'},{id:'s'}],stats,x=>x.id,'s',random,now).id,'m');
});
test('reset can clear one sound category or all learning, while rewards and worlds survive',()=>{
 const storage=memory();storage.setItem('licorne.rewards.v1','gift');storage.setItem('licorne.adventure.v1','world');
 const m=createMastery(storage),words=createWordProgress(storage);
 m.record('phonemes:m',false,'a','moto');m.record('letters:m',true,'a','moto');words.complete('chat',true);
 m.reset('phonemes');assert.ok(!m.snapshot()['phonemes:m']);assert.ok(m.snapshot()['letters:m']);assert.ok(words.snapshot().chat);
 m.reset('all');words.reset();assert.deepEqual(createMastery(storage).snapshot(),{});assert.deepEqual(JSON.parse(storage.getItem(WORD_PROGRESS_KEY)),{});
 assert.equal(storage.getItem('licorne.rewards.v1'),'gift');assert.equal(storage.getItem('licorne.adventure.v1'),'world');
});
test('malformed, unavailable or quota-limited storage retains usable in-memory learning and reset',()=>{
 const storage=memory();storage.setItem(MASTERY_KEY,JSON.stringify({version:1,skills:{'phonemes:m':{attempts:-1},unknown:{}}}));
 assert.deepEqual(createMastery(storage).snapshot(),{});
 for(const store of [undefined,{getItem(){throw Error();}},{getItem(){return null;},setItem(){throw Error();}}]){
  const m=createMastery(store);m.record('phonemes:m',false,'a','moto');assert.equal(m.snapshot()['phonemes:m'].attempts,1);m.reset('all');assert.deepEqual(m.snapshot(),{});assert.equal(m.persistent,false);
 }
});
test('adaptive letter revision keeps all five activities and their card rules valid',()=>{
 const stats=Object.fromEntries(SKILLS.filter(s=>s.scope==='letters').map(s=>[s.id,{attempts:4,correct:4,streak:4,sessions:['a','b'],contexts:['one','two'],lastSeen:Date.now(),nextReview:Date.now()+86400000}]));
 stats['letters:a']={...stats['letters:a'],streak:0,correct:1};let a=0,i=0;
 for(const mode of ['voyelles','consonnes','sons','experts','tout'])for(let run=0;run<20;run++){
  const session=createAdventure(mode,1,{},stats);assert.equal(session.questions.length,20);
  for(const [index,q]of session.questions.entries()){
   assert.equal(q.choices.length,3);assert.equal(new Set(q.choices.map(c=>c.p)).size,3);
   if(index)assert.notEqual(q.target.p,session.questions[index-1].target.p);
   if(mode==='voyelles'){a+=Number(q.target.g==='a');i+=Number(q.target.g==='i');}
  }
 }
 assert.ok(a>i*3);
});
