import test from 'node:test';
import assert from 'node:assert/strict';
import { RIGGED_ANIMALS, animalParts, animalTurnSVG, wildlifePose, poseWildlife } from '../js/prototype/wildlife.js';
import { windAt } from '../js/prototype/atmosphere.js';

const visibility=()=>({visible:true,setVisible(value){this.visible=value;},setTexture(){},setFlipX(){}});
const movable=()=>({x:0,y:0,rotation:0,setPosition(x,y){this.x=x;this.y=y;}});
function testRig(){
 const legs=[-38,30,-29,41].map(x=>({x,y:-54.5,baseY:-54.5,upper:25,lower:25,extension:.97,top:movable(),bottom:movable(),foot:movable()}));
 return {kind:'cow',rig:{visual:visibility(),front:visibility(),shadow:{},body:{height:180},head:{setTexture(){}},neck:{},tail:{},ears:[],legs,scale:.86,lastSeconds:0}};
}
test('all requested wildlife have complete parts and a volume-preserving turn pose',()=>{
 for(const kind of RIGGED_ANIMALS){
  const parts=animalParts(kind);
  for(const name of ['body','head','upperLeg','lowerLeg','foot','tail'])assert.ok(parts[name]?.source.startsWith('<svg'));
  for(const part of Object.values(parts))assert.ok(!/NaN|undefined/.test(part.source));
  assert.ok(animalTurnSVG(kind).includes('<svg'));
  assert.notEqual(animalParts(kind).head.source,animalParts(kind,true).head.source);
 }
});
test('roaming has smooth starts/stops and turns happen while resting',()=>{
 for(const kind of RIGGED_ANIMALS){
  let before=wildlifePose(kind,0,0);
  for(let frame=1;frame<120*60;frame++){
   const pose=wildlifePose(kind,frame/120,0);
   assert.ok(Math.abs(pose.offset-before.offset)<.5,kind+' position discontinuity');
   assert.equal(Math.abs(pose.facing),1,kind+' body must not flatten');
   assert.ok(pose.turnBlend>=0&&pose.turnBlend<=1);
   if(pose.turnBlend>.001)assert.equal(pose.walking,false);
   before=pose;
  }
 }
});
test('weight-bearing hooves stay flat and locked in world space',()=>{
 const root=testRig(),previous=[];
 for(let frame=0;frame<120*45;frame++){
  const pose=poseWildlife(root,frame/120,0);
  root.rig.legs.forEach((leg,i)=>{
   assert.ok(Number.isFinite(leg.top.rotation)&&Number.isFinite(leg.bottom.rotation));
   assert.equal(leg.foot.rotation,0);
   assert.notEqual(root.rig.visual.visible,root.rig.front.visible,'one opaque silhouette must be visible');
   assert.equal(root.rig.visual.alpha,1);assert.equal(root.rig.front.alpha,1);
   const worldX=pose.offset+(leg.x+leg.foot.x)*root.rig.scale*pose.facing;
   const last=previous[i];
   if(leg.planted&&pose.walking&&last?.planted&&last.contact===leg.contactWorld&&last.facing===pose.facing)assert.ok(Math.abs(worldX-last.worldX)<.05,'stance foot slipped');
   previous[i]={planted:leg.planted,contact:leg.contactWorld,worldX,facing:pose.facing};
  });
 }
});
test('shared breeze is bounded and continuous at neighboring times/positions',()=>{
 for(let time=0;time<120;time+=.07){
  const value=windAt(time,780,.3);assert.ok(Math.abs(value)<=1.001);
  assert.ok(Math.abs(value-windAt(time+.001,780,.3))<.003);
  assert.ok(Math.abs(value-windAt(time,781,.3))<.004);
 }
});
