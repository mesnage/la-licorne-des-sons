import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createJourney,travelEase} from '../js/meadow/journey.js';

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

 test('travel accelerates gently, cruises steadily and stops symmetrically',()=>{
  assert.equal(travelEase(0),0);assert.equal(travelEase(1),1);
  let last=0;for(let i=0;i<=100;i++){const t=i/100,v=travelEase(t);assert.ok(v>=last);assert.ok(Math.abs(v+travelEase(1-t)-1)<1e-10);last=v;}
  assert.ok(travelEase(.01)<.001);
  assert.ok(Math.abs((travelEase(.5)-travelEase(.4))-(travelEase(.7)-travelEase(.6)))<1e-10);
});

// Geometry is shared by scenery, feet and answer stones in every habitat.
const {createRoute}=await import('../js/meadow/route.js');
test('crossings join the trail continuously in every world',()=>{
  for(const habitat of ['meadow','forest','jungle','beach','ice','clouds','moon','prehistoric','desert','fairy','peluches']){
    const ground=x=>540+Math.sin(x/300)*30,route=createRoute(habitat,ground);
    for(const c of route.crossings){
      for(const x of [c.center-c.half,c.center+c.half]){
        assert.ok(Math.abs(route.y(x)-ground(x))<1e-8);
        assert.ok(Math.abs(route.y(x+.001)-route.y(x-.001))<.001);
        assert.ok(Math.abs(route.tilt(x))<.1);
      }
      assert.ok(route.y(c.center)<ground(c.center));
    }
    assert.equal(route.at(320+2.5*640),null);
    const steps=route.crossings.find(c=>c.kind==='steps');
    for(let i=0;i<=4;i++)assert.ok(route.hop(steps.center-steps.half+i*steps.half/2)<1e-8);
    const midair=steps.center-steps.half+steps.half/4;
    assert.ok(route.hop(midair)>0);assert.equal(route.hop(midair,true),0);
  }
});
