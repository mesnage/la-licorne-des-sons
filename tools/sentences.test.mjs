import test from 'node:test';
import assert from 'node:assert/strict';
import { SENTENCES, SENTENCE_ACTIVITIES } from '../js/data/sentences.js';
import { shuffledTiles, sentenceQuestions } from '../js/sentences/model.js';
import { createAdventure, SentenceAdventureSession } from '../js/prototype/model.js';
import { createWordProgress, WORD_PROGRESS_KEY } from '../js/words/progress.js';
function seeded(seed=43){return ()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};}
function nextTile(session){return session.current.choices.find(tile=>!session.selected.includes(tile.id)&&tile.text===session.current.target.words[session.selected.length]);}
function complete(session){let result;while(session.phase==='question')result=session.answer(nextTile(session).id);return result;}

test('four activities share 48 recorded sentences with exact three/five-word lengths',()=>{
  assert.equal(SENTENCE_ACTIVITIES.length,4);
  assert.deepEqual(SENTENCE_ACTIVITIES.map(a=>[a.length,a.hidden]),[[3,false],[5,false],[3,true],[5,true]]);
  assert.equal(new Set(SENTENCES.map(s=>s.id)).size,SENTENCES.length);
  assert.equal(new Set(SENTENCES.map(s=>s.text)).size,SENTENCES.length);
  for(const length of [3,5])assert.ok(SENTENCES.filter(s=>s.length===length).length>=24);
  for(const sentence of SENTENCES){
    assert.equal(sentence.words.length,sentence.length);assert.equal(sentence.audioKey,'S:'+sentence.id);
    assert.match(sentence.text,/^[A-ZÀ-Ÿ].*\.$/u);
    assert.ok(sentence.words.every(word=>word===word.toLocaleLowerCase('fr')&&!/[.!?]/u.test(word)));
  }
});
test('every sentence is actually scrambled, even when the random shuffle keeps the original order',()=>{
  for(const sentence of SENTENCES)for(const random of [seeded(),()=>.99999999]){
    const tiles=shuffledTiles(sentence,random);
    assert.notDeepEqual(tiles.map(t=>t.text),sentence.words);
    assert.deepEqual(tiles.map(t=>t.text).sort(),[...sentence.words].sort());
    assert.equal(new Set(tiles.map(t=>t.id)).size,tiles.length);
  }
});
test('each activity has ten different sentences of the requested length',()=>{
  for(const activity of SENTENCE_ACTIVITIES){
    const session=createAdventure(activity.id);
    assert.equal(session.questions.length,10);
    assert.equal(new Set(session.questions.map(q=>q.target.id)).size,10);
    assert.ok(session.questions.every(q=>q.target.words.length===activity.length));
  }
  assert.throws(()=>sentenceQuestions(4),/at least ten/);
});
test('only a completed sentence earns credit; duplicate and unknown tile taps do nothing',()=>{
  const session=new SentenceAdventureSession(sentenceQuestions(5,{},seeded()));
  const tile=nextTile(session);
  assert.equal(session.answer('unknown'),null);
  assert.deepEqual(session.answer(tile.id),{correct:true,partial:true});
  assert.equal(session.answer(tile.id),null);
  assert.equal(session.index,0);assert.equal(session.score,0);assert.equal(session.credited.size,0);
  assert.equal(session.next(),false);assert.equal(session.selected.length,1);
  assert.deepEqual(complete(session),{correct:true,firstTry:true,firstCompletion:true});
  assert.equal(session.orderedWords.length,5);assert.equal(session.score,1);
  assert.equal(session.answer(tile.id),null);assert.equal(session.next(),true);
  assert.deepEqual(session.selected,[]);
});
test('identical written words can be used in either tile order and each copy only once',()=>{
  const target={id:'repeated',words:['le','chat','regarde','le','chat']};
  const choices=shuffledTiles(target,seeded());
  const session=new SentenceAdventureSession([{target,choices}]);
  const lastLe=choices.filter(t=>t.text==='le').at(-1);
  assert.equal(session.answer(lastLe.id).partial,true);
  assert.equal(session.answer(lastLe.id),null);
  assert.equal(complete(session).correct,true);assert.equal(session.score,1);
});
test('wrong words return to the refuge, reset assembly, and replay cannot inflate credits',()=>{
  const session=new SentenceAdventureSession(sentenceQuestions(3,{},seeded()));
  for(let i=0;i<7;i++){complete(session);session.next();}
  session.answer(nextTile(session).id);
  const wrong=session.current.choices.find(t=>!session.selected.includes(t.id)&&t.text!==session.current.target.words[1]);
  assert.deepEqual(session.answer(wrong.id),{correct:false,firstMistake:true,checkpoint:5,from:7});
  assert.equal(session.answer(nextTile(session)?.id),null);assert.equal(session.recover(),true);
  assert.equal(session.index,5);assert.deepEqual(session.selected,[]);
  for(let i=5;i<7;i++){assert.equal(complete(session).firstCompletion,false);session.next();}
  assert.deepEqual(complete(session),{correct:true,firstTry:false,firstCompletion:true});session.next();
  while(session.phase!=='finished'){complete(session);session.next();}
  assert.equal(session.score,9);assert.equal(session.credited.size,10);assert.equal(session.next(),false);
});
test('sentence practice is separate from existing word saves and survives reloads',()=>{
  const saved=new Map(),storage={getItem:key=>saved.get(key)??null,setItem:(key,value)=>saved.set(key,value)};
  createWordProgress(storage).complete('chat',true);
  const sentences=createWordProgress(storage,'licorne.sentences.v1');
  sentences.miss('sentence-listen-3:chat-dort');sentences.complete('sentence-listen-3:chat-dort',false);
  assert.equal(createWordProgress(storage).snapshot().chat.completed,1);
  assert.equal(Object.keys(JSON.parse(saved.get(WORD_PROGRESS_KEY))).length,1);
  assert.equal(createWordProgress(storage,'licorne.sentences.v1').snapshot()['sentence-listen-3:chat-dort'].misses,1);
  assert.equal(sentences.snapshot()['sentence-copy-3:chat-dort'],undefined);
});
