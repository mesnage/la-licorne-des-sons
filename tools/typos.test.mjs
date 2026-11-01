import test from 'node:test';
import assert from 'node:assert/strict';
import { TYPO_ACTIVITY, TYPO_SENTENCES } from '../js/data/typos.js';
import { typoQuestion, typoQuestions } from '../js/sentences/typos.js';
import { createAdventure } from '../js/prototype/model.js';
import { WORDS } from '../js/data/words.js';
import { ALL } from '../js/data/sounds.js';
import { createWordProgress } from '../js/words/progress.js';
const seeded=(seed=43)=>()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};

test('24 three-word sentences have three curated nonword spelling mistakes and existing narration',()=>{
  const vocabulary=new Set([...WORDS.map(w=>w.text),...ALL.flatMap(s=>s.words.map(w=>w.w.replace(/[\[\]]/gu,'')))].map(word=>word.toLocaleLowerCase('fr')));
  assert.equal(TYPO_SENTENCES.length,24);
  for(const item of TYPO_SENTENCES){
    assert.equal(item.sentence.words.length,3);assert.equal(item.typos.length,3);
    assert.equal(item.sentence.audioKey,'S:'+item.sentence.id);
    for(let index=0;index<3;index++){
      assert.match(item.typos[index],/^[a-zà-ÿ]+$/u);
      assert.notEqual(item.typos[index],item.sentence.words[index]);
      assert.ok(!vocabulary.has(item.typos[index]),item.typos[index]+' is a real vocabulary word');
    }
  }
});
test('all 72 variants keep the sentence order and change exactly one word',()=>{
  for(const item of TYPO_SENTENCES)for(let position=0;position<3;position++){
    const question=typoQuestion(item,position);
    assert.equal(question.choices.length,3);
    assert.equal(new Set(question.choices.map(choice=>choice.id)).size,3);
    assert.equal(question.choices.filter((choice,index)=>choice.text!==item.sentence.words[index]).length,1);
    assert.equal(question.choices[position].id,question.target.id);
    assert.equal(question.target.wrongIndex,position);
    assert.equal(question.target.text,item.sentence.text);
    assert.equal(question.target.audioKey,item.sentence.audioKey);
  }
  assert.throws(()=>typoQuestion(TYPO_SENTENCES[0],3),/three word positions/);
});
test('ten-question sessions have unique sentences and balanced error positions',()=>{
  for(let seed=0;seed<100;seed++){
    const questions=typoQuestions({},seeded(seed));
    assert.equal(questions.length,10);
    assert.equal(new Set(questions.map(question=>question.target.sentenceId)).size,10);
    assert.deepEqual([0,1,2].map(index=>questions.filter(q=>q.target.wrongIndex===index).length).sort(),[3,3,4]);
  }
});
test('missed variants receive more practice without repeating sentences in one adventure',()=>{
  const id=typoQuestion(TYPO_SENTENCES[0],1).target.id;
  let ordinary=0,revision=0;
  for(let seed=0;seed<500;seed++){
    ordinary+=typoQuestions({},seeded(seed)).some(question=>question.target.id===id);
    revision+=typoQuestions({[id]:{misses:20}},seeded(seed)).some(question=>question.target.id===id);
  }
  assert.ok(revision>ordinary*1.5);
});
test('only the misspelled word advances the session; wrong taps and replay cannot inflate credits',()=>{
  const session=createAdventure(TYPO_ACTIVITY.id);
  assert.equal(session.questions.length,10);
  assert.equal(session.answer('unknown'),null);
  for(let index=0;index<7;index++){assert.equal(session.answer(session.current.target.id).correct,true);session.next();}
  const wrong=session.current.choices.find(choice=>choice.id!==session.current.target.id);
  assert.deepEqual(session.answer(wrong.id),{correct:false,firstMistake:true,checkpoint:5,from:7});
  assert.equal(session.answer(wrong.id),null);session.recover();assert.equal(session.index,5);
  for(let index=5;index<7;index++){assert.equal(session.answer(session.current.target.id).firstCompletion,false);session.next();}
  assert.deepEqual(session.answer(session.current.target.id),{correct:true,firstTry:false,firstCompletion:true});
  assert.equal(session.answer(session.current.target.id),null);session.next();
  while(session.phase!=='finished'){session.answer(session.current.target.id);session.next();}
  assert.equal(session.score,9);assert.equal(session.credited.size,10);
});
test('typo practice preserves the independent word and sentence saves',()=>{
  const saved=new Map(),storage={getItem:key=>saved.get(key)??null,setItem:(key,value)=>saved.set(key,value)};
  createWordProgress(storage).complete('chat',true);
  createWordProgress(storage,'licorne.sentences.v1').complete('sentence-copy-3:chat-dort',true);
  const typos=createWordProgress(storage,'licorne.typos.v1');typos.miss('chat-dort:typo:1');typos.complete('chat-dort:typo:1',false);
  assert.equal(createWordProgress(storage).snapshot().chat.completed,1);
  assert.equal(createWordProgress(storage,'licorne.sentences.v1').snapshot()['sentence-copy-3:chat-dort'].completed,1);
  assert.equal(createWordProgress(storage,'licorne.typos.v1').snapshot()['chat-dort:typo:1'].misses,1);
});
