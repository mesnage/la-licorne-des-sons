import test from 'node:test';
import assert from 'node:assert/strict';
import { MODULES, MENU_ITEMS, createAdventure, pathPoint, WORLD_WIDTH, WORLDS, checkpointFor, journeyState, gagFor, createJourneyMemory } from '../js/prototype/model.js';
import { QuestionSession } from '../js/words/model.js';
import { isE, OTHER_VOWELS } from '../js/questions.js';

test('all phonics modules and the three word levels retain their learning content',()=>{
  assert.deepEqual(MODULES.map(m=>m.id),['voyelles','consonnes','sons','experts','tout']);
  for(const module of MODULES){
    const session=createAdventure(module.id);assert.equal(session.questions.length,20);
    for(const q of session.questions){
      assert.equal(q.choices.length,3);assert.equal(new Set(q.choices.map(c=>c.p)).size,3);
      assert.ok(q.choices.some(c=>c.id===q.target.id));
      const es=q.choices.filter(c=>isE(c.g));assert.ok(es.length<=1);
      if(es.length)assert.ok(q.choices.filter(c=>!isE(c.g)).every(c=>OTHER_VOWELS.includes(c.g)));
    }
  }
  for(const level of [1,2,3]){
    const session=createAdventure('words',level);assert.equal(session.questions.length,10);
    for(const q of session.questions){assert.equal(q.choices.length,4);assert.equal(q.target.level,level);}
  }
  assert.throws(()=>createAdventure('unknown'),/Unknown/);
});
test('the menu has five original activities and three direct word-level choices',()=>{
 assert.equal(MENU_ITEMS.length,8);assert.equal(new Set(MENU_ITEMS.map(item=>item.id)).size,8);
 assert.deepEqual(MENU_ITEMS.filter(item=>item.mode==='words').map(item=>item.level),[1,2,3]);
 for(const item of MENU_ITEMS){const session=createAdventure(item.mode||item.id,item.level||1);assert.equal(session.questions.length,item.mode==='words'?10:20);}
});
test('world boundaries are every ten crystals and refuges are exactly halfway',()=>{
  assert.deepEqual([0,1,4,5,6,9,10,11,14,15,16,19].map(checkpointFor),[0,0,0,5,5,5,10,10,10,15,15,15]);
  assert.equal(journeyState(9,20).worldIndex,0);assert.equal(journeyState(10,20).worldIndex,1);
  assert.equal(journeyState(10,20).worldCrystals,0);assert.equal(journeyState(19,20).worldCrystals,9);
  assert.equal(journeyState(20,20).worldIndex,1);assert.equal(journeyState(20,20).worldCrystals,10);
  assert.equal(journeyState(10,10).finished,true);assert.equal(journeyState(10,10).worldIndex,0);
  assert.equal(journeyState(10,20,6).theme.id,0);assert.equal(WORLDS.length,7);
});
function advanceTo(session,index){
  while(session.index<index){session.answer(session.current.target.id);session.next();}
}
function wrong(session){return session.current.choices.find(c=>c.id!==session.current.target.id).id;}
test('mistakes roll back only to the current world start or its earned refuge',()=>{
  for(const [at,back] of [[0,0],[4,0],[5,5],[8,5],[10,10],[14,10],[15,15],[19,15]]){
    const session=createAdventure('voyelles');advanceTo(session,at);
    assert.deepEqual(session.answer(wrong(session)),{correct:false,firstMistake:true,checkpoint:back,from:at});
    assert.equal(session.phase,'returning');assert.equal(session.answer(session.current.target.id),null);
    assert.equal(session.next(),false);assert.equal(session.recover(),true);assert.equal(session.index,back);
    assert.equal(session.phase,'question');assert.equal(session.recover(),false);
  }
});
test('replaying lost crystals cannot inflate score, mastery credit or final completion',()=>{
  const session=createAdventure('words',1);advanceTo(session,4);
  session.answer(wrong(session));session.recover();
  const result=session.answer(session.current.target.id);
  assert.equal(result.firstCompletion,false);session.next();
  advanceTo(session,4);
  assert.equal(session.answer(wrong(session)).firstMistake,false);session.recover();
  advanceTo(session,10);assert.equal(session.score,9);assert.equal(session.phase,'finished');
  assert.equal(session.answer('anything'),null);assert.equal(session.next(),false);
});
test('gags rotate within each ten-crystal world and path stays within bounds',()=>{
  assert.deepEqual([2,4,7,9,12,14].map(gagFor),['prout','rainbow','boing','hat','prout','rainbow']);
  assert.equal(gagFor(1),null);assert.equal(gagFor(10),null);
  let previous=0;
  for(let i=0;i<=10;i++){const p=pathPoint(i/10);assert.ok(p.x>=previous&&p.x<WORLD_WIDTH);previous=p.x;}
  assert.deepEqual(pathPoint(-1),pathPoint(0));assert.deepEqual(pathPoint(2),pathPoint(1));
});
test('completed worlds persist across modules without storing child information',()=>{
  const data=new Map(),storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
  const memory=createJourneyMemory(storage);assert.equal(memory.startWorld,0);memory.complete(2);
  const reloaded=createJourneyMemory(storage);assert.equal(reloaded.startWorld,2);reloaded.complete(6);
  assert.equal(createJourneyMemory(storage).startWorld,1);
  assert.deepEqual(JSON.parse(data.get('licorne.adventure.v1')),{worldsCompleted:8});
  const blocked=createJourneyMemory(undefined);blocked.complete(1);assert.equal(blocked.startWorld,1);assert.equal(blocked.persistent,false);
});
test('the original word question session keeps its retry behavior',()=>{
  assert.throws(()=>new QuestionSession([]),/needs questions/);
  const session=new QuestionSession([{target:{id:'a'},choices:[{id:'a'},{id:'b'}]}]);
  session.answer('b');assert.equal(session.index,0);assert.equal(session.phase,'question');
  session.answer('a');session.next();assert.equal(session.phase,'finished');assert.equal(session.score,0);
});

test('the rainbow is a fixed climb connected to the road at both ends',async()=>{
  const { RAINBOW, rainbowPoint, walkingPoint, bridgeFocus }=await import('../js/prototype/travel.js');
  assert.deepEqual(rainbowPoint(0),pathPoint(RAINBOW.start));
  assert.ok(Math.abs(rainbowPoint(1).y-pathPoint(RAINBOW.end).y)<1e-9);
  assert.ok(rainbowPoint(1).x-rainbowPoint(0).x>600);
  assert.ok(walkingPoint(.35).lift>150);
  for(let i=0;i<=100;i++){
    const t=i/100,p=walkingPoint(RAINBOW.start+t*(RAINBOW.end-RAINBOW.start)),surface=rainbowPoint(t);
    assert.ok(Math.abs(p.y-surface.y)<1e-8);assert.ok(Math.abs(p.angle)<=16);
  }
  for(const end of [RAINBOW.start,RAINBOW.end]){
    assert.ok(Math.abs(walkingPoint(end-1e-8).y-walkingPoint(end+1e-8).y)<.001);
  }
  assert.equal(bridgeFocus(0),0);assert.equal(bridgeFocus(.35),1);assert.equal(bridgeFocus(1),0);
  assert.equal(walkingPoint(.6).onBridge,false);
});
test('decorative birds stay in world bounds and follow gentle independent flight paths',async()=>{
  const {birdPoint}=await import('../js/prototype/travel.js');
  for(let i=0;i<9;i++){
    assert.notDeepEqual(birdPoint(i,0),birdPoint(i,1));
    for(let s=0;s<500;s+=5){const p=birdPoint(i,s);assert.ok(p.x>=0&&p.x<WORLD_WIDTH);assert.ok(p.y>=297&&p.y<=429);}
  }
});

test('Retina profiles allocate real pixels while bounding the largest backing buffers',async()=>{
 const {renderProfile}=await import('../js/prototype/rendering.js');
 assert.deepEqual(renderProfile(1024,768,2),{ratio:2,width:2048,height:1536,cssWidth:1024,cssHeight:768});
 assert.equal(renderProfile(390,844,3).ratio,2);
 const large=renderProfile(1920,1080,2);assert.ok(large.width*large.height<=6010000);assert.ok(large.ratio>1);
 assert.equal(renderProfile(800,600,1).width,800);assert.ok(renderProfile(0,0,0).width>=1);
});
test('all seven habitats have native animal art and their own extra travel surprise',async()=>{
 const {HABITAT_ANIMALS,ANIMAL_KINDS,animalSVG}=await import('../js/prototype/animals.js');
 assert.equal(WORLDS.length,7);assert.equal(new Set(WORLDS.map(w=>w.habitat)).size,7);
 for(const kind of ['jungle','beach','clouds','moon'])assert.ok(WORLDS.some(w=>w.habitat===kind));
 assert.ok(ANIMAL_KINDS.length>=12);
 for(const world of WORLDS){
  assert.ok(HABITAT_ANIMALS[world.habitat].length);assert.ok(gagFor(6,world.habitat));assert.equal(gagFor(4,world.habitat),'rainbow');
  for(const animal of HABITAT_ANIMALS[world.habitat]){
   assert.notEqual(animalSVG(animal),animalSVG(animal,true));assert.ok(!/NaN|undefined/.test(animalSVG(animal)));
  }
 }
 assert.equal(gagFor(6,'moon'),'moonhop');assert.equal(gagFor(6,'clouds'),'bubble');assert.equal(gagFor(6,'beach'),'splash');
});
test('the native road is a continuous single ribbon with the requested width',async()=>{
 const {pathRibbon}=await import('../js/prototype/travel.js');
 const points=pathRibbon(88);assert.equal(points.length,362);
 for(let i=0;i<=180;i++){
  const a=points[i],b=points[361-i];assert.ok(Math.abs(Math.hypot(b.x-a.x,b.y-a.y)-88)<1e-8);
  if(i)assert.ok(Math.hypot(a.x-points[i-1].x,a.y-points[i-1].y)<30);
 }
});
