import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createJourney} from '../js/meadow/journey.js';

test('10 and 20 question sessions reach exactly the castle and clamp bad counts',async()=>{
  for(const total of [10,20]){const j=createJourney({start:100,end:4100});j.reset(total);const finished=j.moveTo(total);j.update(2);assert.equal(await finished,true);assert.equal(j.state().x,4100);assert.equal(j.state().count,total);j.reset(total,999);assert.equal(j.state().count,total);j.reset(total,-1);assert.equal(j.state().count,0);}
});
test('pause holds both position and completion until the scene resumes',async()=>{
  const j=createJourney();j.reset(20);let resolved=false;const p=j.moveTo(1).then(v=>{resolved=true;return v;});j.update(.4);const x=j.state().x;j.setPaused(true);j.update(100);await Promise.resolve();assert.equal(resolved,false);assert.equal(j.state().x,x);j.setPaused(false);j.update(2);assert.equal(await p,true);
});
test('checkpoint return travels backwards and restores the correct count',async()=>{
  const j=createJourney();j.reset(20,8);const from=j.state().x;const p=j.moveTo(5,{returning:true});j.update(.5);assert.ok(j.state().x<from);assert.equal(j.state().returning,true);j.update(2);assert.equal(await p,true);assert.equal(j.state().count,5);
});
test('leaving or restarting resolves old travel as cancelled and cannot award a crystal',async()=>{
  const j=createJourney();j.reset(10);const old=j.moveTo(1);j.update(.5);j.reset(20,0);assert.equal(await old,false);j.update(5);assert.equal(j.state().count,0);const next=j.moveTo(1);j.cancel();assert.equal(await next,false);assert.equal(j.state().moving,false);
});
test('reduced motion still awaits an unpaused scene tick and never skips completion',async()=>{
  const j=createJourney({reduced:true});j.reset(20,19);const p=j.moveTo(20);j.update(.02);assert.equal(await p,true);assert.equal(j.state().count,20);
});

test('every activity gets the same full walking distance, including the 30-question alphabet',async()=>{
  for(const total of [5,10,20,30]){
    const j=createJourney({start:320,step:640});j.reset(total);
    assert.equal(j.positionAt(1)-j.state().x,640);
    const p=j.moveTo(1,{gentle:true});j.update(.9);
    assert.equal(j.state().moving,true);
    assert.ok(j.state().x>320&&j.state().x<960);
    j.update(2);assert.equal(await p,true);assert.equal(j.state().x,960);
    j.reset(total,total-1);const finish=j.moveTo(total);j.update(3);
    assert.equal(await finish,true);assert.equal(j.state().x,320+total*640);
  }
});
