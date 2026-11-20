import {test} from 'node:test';
import assert from 'node:assert/strict';
import {AdventureSession,SentenceAdventureSession} from '../js/prototype/model.js?v=accueil-22';
import {createSessionRecovery} from '../js/prototype/session-recovery.js';
const questions=Array.from({length:20},(_,i)=>({target:{id:String(i)},choices:[{id:String(i)},{id:'wrong'}]}));
function setup(){const data=new Map();return createSessionRecovery({getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)});}
const details={mode:'alphabet',sessionId:'test',theme:2,startWorld:0,level:1,evaluated:new Set([0,1])};
test('reload retains the exact question schedule, world and progress',()=>{
 const r=setup(),s=new AdventureSession(questions);s.index=7;r.save({...details,session:s});
 const restored=r.read();assert.equal(restored.session.index,7);assert.deepEqual(restored.session.questions,questions);assert.equal(restored.theme,2);assert.deepEqual([...restored.evaluated],[0,1]);
 r.clear();assert.equal(r.read(),null);
});
test('reload during success feedback cannot grant duplicate credit',()=>{
 const r=setup(),s=new AdventureSession(questions);s.answer('0');r.save({...details,session:s});
 const restored=r.read().session;assert.equal(restored.phase,'question');assert.equal(restored.answer('0').firstCompletion,false);assert.equal(restored.score,1);
});
test('reload during a return restores the protected checkpoint',()=>{
 const r=setup(),s=new AdventureSession(questions);s.index=8;s.answer('wrong');r.save({...details,session:s});
 const restored=r.read().session;assert.equal(restored.index,5);assert.equal(restored.mistakes.has(8),true);
});
test('sentence assembly resumes its selected words',()=>{
 const r=setup(),s=new SentenceAdventureSession([{target:{id:'sentence',words:['Le','chat']},choices:[{id:'a',text:'Le'},{id:'b',text:'chat'}]}]);
 s.answer('a');r.save({...details,session:s});const restored=r.read().session;
 assert.ok(restored instanceof SentenceAdventureSession);assert.deepEqual(restored.orderedWords,['Le']);assert.equal(restored.answer('b').correct,true);
});
test('blocked or invalid storage never interrupts play',()=>{
 const blocked=createSessionRecovery({getItem(){throw Error();},setItem(){throw Error();},removeItem(){throw Error();}});
 assert.equal(blocked.read(),null);blocked.save({...details,session:new AdventureSession(questions)});blocked.clear();
 for(const value of ['oops','{}','null',JSON.stringify({version:1,mode:'alphabet',sessionId:'x',session:{questions:[],index:0}})])assert.equal(createSessionRecovery({getItem:()=>value}).read(),null);
});
