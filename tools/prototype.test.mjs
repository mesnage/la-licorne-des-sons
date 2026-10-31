import test from 'node:test';
import assert from 'node:assert/strict';
import { MODULES, createAdventure, pathPoint, biomeFor, WORLD_WIDTH } from '../js/prototype/model.js';
import { QuestionSession } from '../js/words/model.js';
import { isE, OTHER_VOWELS } from '../js/questions.js';

test('prototype retains every phonics module and all three word levels', () => {
  assert.deepEqual(MODULES.map(m=>m.id),['voyelles','consonnes','sons','experts','tout','words']);
  for(const module of MODULES.filter(m=>m.id!=='words')){
    const session=createAdventure(module.id);
    assert.equal(session.questions.length,20);
    for(const q of session.questions){
      assert.equal(q.choices.length,3);
      assert.equal(new Set(q.choices.map(c=>c.p)).size,3);
      assert.ok(q.choices.some(c=>c.id===q.target.id));
      const es=q.choices.filter(c=>isE(c.g));
      assert.ok(es.length<=1);
      if(es.length) assert.ok(q.choices.filter(c=>!isE(c.g)).every(c=>OTHER_VOWELS.includes(c.g)));
    }
  }
  for(const level of [1,2,3]){
    const session=createAdventure('words',level);
    assert.equal(session.questions.length,10);
    for(const q of session.questions){assert.equal(q.choices.length,4);assert.equal(q.target.level,level);}
  }
  assert.throws(()=>createAdventure('unknown'),/Unknown/);
});
test('retries and duplicate taps cannot skip a checkpoint or count an extra correct answer', () => {
  const session=createAdventure('voyelles');
  for(let i=0;i<20;i++){
    const q=session.current, wrong=q.choices.find(c=>c.id!==q.target.id);
    assert.deepEqual(session.answer(wrong.id),{correct:false,firstMistake:true});
    assert.equal(session.index,i);assert.equal(session.next(),false);
    assert.deepEqual(session.answer(q.target.id),{correct:true,firstTry:false});
    assert.equal(session.answer(q.target.id),null);
    session.next();
  }
  assert.equal(session.phase,'finished');assert.equal(session.score,0);assert.equal(session.next(),false);
});
test('shared question state machine finishes by its actual question count', () => {
  assert.throws(()=>new QuestionSession([]),/needs questions/);
  const session=new QuestionSession([{target:{id:'a'},choices:[{id:'a'},{id:'b'}]}]);
  session.answer('a');session.next();
  assert.equal(session.phase,'finished');assert.equal(session.score,1);
});
test('walking path moves forward through three biomes and ends inside the castle world', () => {
  let previous=0;
  for(let i=0;i<=20;i++){
    const p=pathPoint(i/20);
    assert.ok(p.x>=previous&&p.x<WORLD_WIDTH);assert.ok(Number.isFinite(p.y));previous=p.x;
  }
  assert.deepEqual(pathPoint(-1),pathPoint(0));assert.deepEqual(pathPoint(2),pathPoint(1));
  assert.deepEqual([0,.4,.8,1].map(p=>biomeFor(p).id),[0,1,2,3]);
  assert.ok(pathPoint(1).y<pathPoint(0).y);
});
