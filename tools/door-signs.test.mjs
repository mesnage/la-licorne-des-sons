import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createDoorSigns} from '../js/meadow/door-signs.js';

function harness(width=390){
  const listeners={},classes=new Set(),calls=[];
  const view={innerWidth:width,innerHeight:844,addEventListener:(type,fn)=>{listeners[type]=fn;},removeEventListener:type=>{delete listeners[type];}};
  const doc={defaultView:view,body:{classList:{add:c=>classes.add(c),remove:c=>classes.delete(c)}},querySelector:()=>null};
  const scene={setRoadChoices:(n,instant=false)=>calls.push([n,instant]),setForkInsets(){},roadLayout:()=>[{x:10,y:20,width:100,height:40,reach:60},{x:130,y:20,width:100,height:40,reach:60},{x:250,y:20,width:100,height:40,reach:60},{x:370,y:20,width:100,height:40,reach:60}]};
  const button=text=>{const attrs={},style={},handlers={};return {textContent:text,attrs,style:{...style,setProperty:(k,v)=>{style[k]=v;},removeProperty:k=>{delete style[k];},values:style},
    setAttribute:(k,v)=>{attrs[k]=v;},getAttribute:k=>attrs[k]??null,removeAttribute:k=>{delete attrs[k];},
    addEventListener:(type,fn)=>{handlers[type]=fn;},removeEventListener:type=>{delete handlers[type];},tap(){handlers.pointerdown?.({currentTarget:this});}};};
  return {signs:createDoorSigns(doc,()=>scene),view,listeners,classes,calls,button};
}
test('short answers hang on doors, follow them and report the tapped door',()=>{
  const {signs,classes,calls,button}=harness(),buttons=['Aa','Ee','OUou'].map(button);
  assert.equal(signs.offer(buttons),true);assert.equal(signs.active,true);assert.ok(classes.has('road-choices'));
  assert.deepEqual(calls.at(-1),[3,false]);
  signs.follow();
  assert.equal(buttons[1].style.values['--road-x'],'130px');assert.equal(buttons[1].style.values['--door-reach'],'60px');
  assert.equal(signs.picked,-1);buttons[2].tap();assert.equal(signs.picked,2);
  signs.clear();assert.equal(signs.active,false);assert.equal(classes.has('road-choices'),false);
  assert.equal(buttons[1].getAttribute('data-road-door'),null);assert.equal(buttons[1].style.values['--road-x'],undefined);
  assert.deepEqual(calls.at(-1),[0,false]);
});
test('too many or too long answers stay in the panel on a phone',()=>{
  const {signs,button,classes}=harness();
  assert.equal(signs.offer(['vert','tas','cuir','main'].map(button)),false);
  assert.equal(signs.offer(['chocolats','ami','bol'].map(button)),false);
  assert.equal(classes.has('road-choices'),false);assert.equal(signs.picked,-1);
});
test('rotating re-decides: four doors on a wide screen, cards again on a narrow one',()=>{
  const {signs,view,listeners,button,calls}=harness(1024),buttons=['vert','tas','cuir','main'].map(button);
  assert.equal(signs.offer(buttons),true);assert.deepEqual(calls.at(-1),[4,false]);
  view.innerWidth=390;listeners.resize();
  assert.equal(signs.active,false);assert.deepEqual(calls.at(-1),[0,false]);assert.equal(buttons[0].getAttribute('data-road-door'),null);
  view.innerWidth=1024;listeners.resize();
  assert.equal(signs.active,true);assert.deepEqual(calls.at(-1),[4,false]);
});
test('a new scene adopts the doors without replaying the entrance, and dispose detaches',()=>{
  const {signs,listeners,button,calls}=harness();signs.offer(['Aa','Ee'].map(button));
  signs.adopt();assert.deepEqual(calls.at(-1),[2,true]);
  signs.dispose();assert.equal(signs.active,false);assert.equal(listeners.resize,undefined);
});
