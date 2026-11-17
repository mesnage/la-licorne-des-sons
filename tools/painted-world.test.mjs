import {test} from 'node:test';
import {URL} from 'node:url';
import assert from 'node:assert/strict';
import {createWorld} from '../js/meadow/world.js';

function harness(){
  const scenes=[];
  const make=()=>{
    const listeners={};
    const node={style:{},setAttribute(){},addEventListener(type,fn){listeners[type]=fn;},remove(){parent.children=parent.children.filter(c=>c!==node);}};
    let total=0,count=0,paused=false,dead=false;
    const scene={reset(n,c){total=n;count=c;},setRoadChoices(){},setPaused(v){paused=v;},cancel(){},destroy(){dead=true;},moveTo(c){count=c;return Promise.resolve(true);},state(){return {total,crystals:count,paused,dead};}};
    node.contentWindow={meadowScene:scene};node.load=()=>listeners.load();scenes.push(scene);return node;
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
