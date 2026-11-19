/** Small per-tab checkpoint; renderer resources are never serialized. */
import {AdventureSession,SentenceAdventureSession} from './model.js?v=review-16';
const KEY='licorne.active-adventure.v1';
export function restoreAdventure(value){
  try{
    if(value?.version!==1||typeof value.mode!=='string'||typeof value.sessionId!=='string')return null;
    const s=value.session;
    if(!Array.isArray(s.questions)||!s.questions.length||s.questions.length>40||!Number.isInteger(s.index)||s.index<0||s.index>=s.questions.length)return null;
    if(s.questions.some(q=>typeof q.target?.id!=='string'||!Array.isArray(q.choices)||q.choices.length<2||q.choices.some(c=>typeof c.id!=='string')))return null;
    const session=s.sentence?new SentenceAdventureSession(s.questions):new AdventureSession(s.questions);
    session.index=s.index;session.score=Math.max(0,Math.min(s.questions.length,Number(s.score)||0));
    const indices=values=>new Set((values??[]).filter(n=>Number.isInteger(n)&&n>=0&&n<s.questions.length));
    session.credited=indices(s.credited);session.mistakes=indices(s.mistakes);
    if(s.sentence){session.selected=[...new Set(s.selected??[])].filter(id=>session.current.choices.some(c=>c.id===id));if(session.selected.length>=session.current.target.words.length)session.selected=[];}
    return {...value,session,evaluated:indices(value.evaluated)};
  }catch{return null;}
}
export function createSessionRecovery(storage){
  return {
    read(){try{return restoreAdventure(JSON.parse(storage?.getItem(KEY)||'null'));}catch{return null;}},
    save({session,...details}){
      if(!session||session.phase==='finished')return;
      const returning=session.phase==='returning';
      const state={...details,version:1,evaluated:[...(details.evaluated??[])],session:{
        questions:session.questions,index:returning?session.returnIndex:session.index,score:session.score,
        credited:[...session.credited],mistakes:[...session.mistakes],sentence:session instanceof SentenceAdventureSession,
        selected:session.phase==='question'?[...(session.selected??[])]:[]
      }};
      try{storage?.setItem(KEY,JSON.stringify(state));}catch{/* Storage restrictions must never interrupt play. */}
    },
    clear(){try{storage?.removeItem(KEY);}catch{}}
  };
}
