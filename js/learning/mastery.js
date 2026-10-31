import { ALL } from '../data/sounds.js';
export const MASTERY_KEY='licorne.mastery.v1';
export const SKILLS=ALL.map(s=>({id:'letters:'+s.g,scope:'letters',label:s.g}));
const allowed=new Set(SKILLS.map(s=>s.id));
const day=86400000;
const natural=n=>Number.isSafeInteger(n)&&n>=0&&n<=1000000;
export const wellRecognized=s=>!!s&&s.streak>=3&&s.sessions?.length>=2&&s.contexts?.length>=2;
export function skillStatus(s){return !s?.attempts?'À découvrir':wellRecognized(s)?'Bien reconnu':s.streak===0?'À revoir':'En progrès';}
export function revisionWeight(s,now=Date.now()){
  if(!s?.attempts)return 1.2;
  if(s.streak===0)return 5;
  const due=now>=s.nextReview?1.8:0;
  return wellRecognized(s)?.3+due:1.5+Math.min(2,(s.attempts-s.correct)/s.attempts*3)+due;
}
function clean(value){
  if(value?.version!==1||!value.skills||typeof value.skills!=='object')return {};
  return Object.fromEntries(Object.entries(value.skills).filter(([id,s])=>allowed.has(id)&&s&&
    ['attempts','correct','streak'].every(k=>natural(s[k]))&&s.correct<=s.attempts&&s.streak<=s.correct&&
    ['lastSeen','nextReview'].every(k=>Number.isSafeInteger(s[k])&&s[k]>=0)&&
    ['sessions','contexts'].every(k=>Array.isArray(s[k])&&s[k].length<=6&&s[k].every(x=>typeof x==='string'&&x.length<=80))));
}
export function createMastery(storage){
  let stats={},persistent=!!storage;
  function load(){if(!persistent)return;try{stats=clean(JSON.parse(storage.getItem(MASTERY_KEY)));}catch(e){persistent=false;}}
  function save(){try{storage.setItem(MASTERY_KEY,JSON.stringify({version:1,skills:stats}));}catch(e){persistent=false;}}
  load();
  return {
    snapshot(){load();return JSON.parse(JSON.stringify(stats));},
    get persistent(){return persistent;},
    record(id,correct,session,context,now=Date.now()){
      if(!allowed.has(id)||typeof correct!=='boolean'||typeof session!=='string'||!session||session.length>80||typeof context!=='string'||!context||context.length>80)return;
      load();const s=stats[id]||{attempts:0,correct:0,streak:0,lastSeen:0,nextReview:0,sessions:[],contexts:[]};
      s.attempts++;s.correct+=Number(correct);s.streak=correct?s.streak+1:0;s.lastSeen=now;
      if(correct){s.sessions=[...new Set([...s.sessions,session])].slice(-6);s.contexts=[...new Set([...s.contexts,context])].slice(-6);}
      s.nextReview=now+(correct?[1,1,3,7,14][Math.min(4,s.streak)]:0)*day;stats[id]=s;save();
    },
    reset(scope='all'){
      if(!['all','letters'].includes(scope))return;
      load();stats=Object.fromEntries(Object.entries(stats).filter(([id])=>scope!=='all'&&!id.startsWith(scope+':')));save();
    }
  };
}
export function weightedPick(pool,stats,key,previous,random=Math.random,now=Date.now()){
  const candidates=pool.filter(s=>key(s)!==previous);
  if(!candidates.length)throw new Error('Two distinct skills are required');
  let ticket=random()*candidates.reduce((sum,s)=>sum+revisionWeight(stats[key(s)],now),0);
  for(const s of candidates){ticket-=revisionWeight(stats[key(s)],now);if(ticket<0)return s;}
  return candidates[candidates.length-1];
}
