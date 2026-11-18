import {test} from 'node:test';
import {URL} from 'node:url';
import assert from 'node:assert/strict';
import {createWorld} from '../js/meadow/world.js';

function harness(deferred=false){
  const scenes=[];
  const make=()=>{
    const listeners={};
    const node={style:{},classList:{add(){}},setAttribute(){},addEventListener(type,fn){listeners[type]=fn;},remove(){parent.children=parent.children.filter(c=>c!==node);}};
    let total=0,count=0,paused=false,dead=false,pending;
    const scene={reset(n,c){total=n;count=c;},setRoadChoices(){},setPaused(v){paused=v;},cancel(){pending?.(false);pending=null;},destroy(){dead=true;},moveTo(c){if(deferred)return new Promise(resolve=>{pending=ok=>{if(ok)count=c;resolve(ok);};});count=c;return Promise.resolve(true);},arrive(){pending?.(true);pending=null;},state(){return {total,crystals:count,paused,dead};}};
    node.contentWindow={meadowScene:scene};node.load=()=>listeners.load();node.fail=()=>listeners.error();scenes.push(scene);return node;
  };
  const parent={id:'testWorld',children:[],append(node){this.children.push(node);},replaceChildren(){this.children=[];}};
  globalThis.document={createElement:make,body:{dataset:{},classList:{remove(){},add(){}}}};
  globalThis.window={URL,requestAnimationFrame:()=>1,cancelAnimationFrame(){}};
  return {parent,scenes};
}
test('changing habitats keeps the question journey, pause and a single live scene',async()=>{
  const {parent,scenes}=harness();let ready=0;const names=[];
  const world=createWorld(parent,{onReady:()=>ready++,onBiome:b=>names.push(b.habitat)});
  parent.children[0].load();world.reset(30,0,7);world.setPaused(true);
  assert.equal(world.setTheme(1),true);parent.children.at(-1).load();
  assert.equal(parent.children.length,1);assert.equal(ready,1);
  assert.deepEqual(names,['meadow','forest']);
  assert.equal(world.state().crystals,7);assert.equal(world.state().paused,true);assert.equal(world.state().theme,1);
  assert.equal(scenes[0].state().dead,true);
  world.setPaused(false);assert.equal(await world.moveTo(8),true);
  world.setTheme(0);parent.children.at(-1).load();
  assert.equal(world.state().crystals,8);assert.equal(world.state().paused,false);
  world.destroy();assert.equal(parent.children.length,0);
});
test('rapid theme changes and cancellation cannot resume a stale movement',async()=>{
  const {parent}=harness();const world=createWorld(parent);parent.children[0].load();
  world.setTheme(1);const stale=parent.children.at(-1);const travel=world.moveTo(1);
  world.cancel();world.setTheme(0);stale.load();parent.children.at(-1).load();
  assert.equal(await travel,false);assert.equal(parent.children.length,1);
  assert.equal(world.state().crystals,0);assert.equal(world.state().theme,0);
  world.destroy();
});

test('jungle loading restores reading progress and preserves the single scene lifecycle',async()=>{
  const {parent}=harness();const world=createWorld(parent);parent.children[0].load();
  world.reset(20,2,12);parent.children.at(-1).load();
  assert.equal(world.state().habitat,'jungle');assert.equal(world.state().theme,2);
  assert.equal(world.state().crystals,12);assert.equal(parent.children.length,1);
  assert.match(parent.children[0].src,/habitat=jungle/);
  assert.equal(await world.moveTo(13),true);assert.equal(world.state().crystals,13);
  world.destroy();
});

test('all ten saved world IDs load and retain progress, including return trips',async()=>{
  const {parent}=harness();const world=createWorld(parent);parent.children[0].load();
  const habitats=['meadow','forest','jungle','beach','ice','clouds','moon','prehistoric','desert','fairy'];
  for(const [id,habitat] of habitats.entries()){
    world.reset(30,id,8);if(id>0)parent.children.at(-1).load();
    assert.equal(world.state().theme,id);assert.equal(world.state().habitat,habitat);
    assert.equal(world.state().crystals,8);assert.equal(parent.children.length,1);
    assert.equal(await world.moveTo(5,{returning:true}),true);assert.equal(world.state().crystals,5);
  }
  world.destroy();
});

test('world changes during travel apply at the next stop without losing completion',async()=>{
  const {parent,scenes}=harness(true);const world=createWorld(parent);parent.children[0].load();world.reset(30,0,4);
  const movement=world.moveTo(5);world.setPaused(true);world.setTheme(2);world.setTheme(4);
  assert.equal(parent.children.length,1);assert.equal(world.state().pendingTheme,4);
  world.setPaused(false);scenes[0].arrive();await Promise.resolve();parent.children.at(-1).load();
  assert.equal(await movement,true);assert.equal(world.state().crystals,5);assert.equal(world.state().theme,4);assert.equal(world.state().pendingTheme,null);
  world.destroy();
});
test('cancelled travel also clears a queued world change',async()=>{
  const {parent,scenes}=harness(true);const world=createWorld(parent);parent.children[0].load();
  const movement=world.moveTo(1);world.setTheme(3);world.cancel();scenes[0].arrive();
  assert.equal(await movement,false);assert.equal(world.state().pendingTheme,null);assert.equal(parent.children.length,1);world.destroy();
});
test('a failed world load restores the previous playable scene and allows retry',async()=>{
  const {parent}=harness();const world=createWorld(parent);parent.children[0].load();world.reset(30,0,6);
  world.setTheme(2);parent.children.at(-1).fail();
  assert.equal(world.state().theme,0);assert.equal(world.state().crystals,6);assert.equal(world.state().paused,false);assert.equal(parent.children.length,1);
  world.setTheme(2);parent.children.at(-1).load();assert.equal(world.state().theme,2);assert.equal(await world.moveTo(7),true);world.destroy();
});

test('portals advance every ten crystals, wrap worlds and preserve progress',async()=>{
  const {parent}=harness();const world=createWorld(parent);parent.children[0].load();world.reset(30,9,9);parent.children.at(-1).load();
  const first=world.moveTo(10);await Promise.resolve();await Promise.resolve();parent.children.at(-1).load();
  assert.equal(await first,true);assert.equal(world.state().theme,0);assert.equal(world.state().crystals,10);
  const second=world.moveTo(20);await Promise.resolve();await Promise.resolve();parent.children.at(-1).load();
  assert.equal(await second,true);assert.equal(world.state().theme,1);assert.equal(world.state().crystals,20);
  assert.equal(await world.moveTo(30),true);assert.equal(world.state().theme,1);
  world.destroy();
});
test('returning to ten and replaying that stop do not trigger another portal',async()=>{
  const {parent}=harness();const world=createWorld(parent);parent.children[0].load();world.reset(30,0,14);
  assert.equal(await world.moveTo(10,{returning:true}),true);assert.equal(world.state().theme,0);
  assert.equal(await world.moveTo(10),true);assert.equal(world.state().theme,0);world.destroy();
});
test('a manually queued world takes precedence at a portal boundary',async()=>{
  const {parent,scenes}=harness(true);const world=createWorld(parent);parent.children[0].load();world.reset(30,0,9);
  const movement=world.moveTo(10);world.setTheme(4);scenes[0].arrive();await Promise.resolve();parent.children.at(-1).load();
  assert.equal(await movement,true);assert.equal(world.state().theme,4);assert.equal(world.state().crystals,10);world.destroy();
});
