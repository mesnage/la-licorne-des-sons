import { LEVELS } from '../data/sounds.js';
import { WORDS } from '../data/words.js';
import { makeTargets, distractors } from '../questions.js';
import { shuffle } from '../utils.js';
import { QuestionSession, WordSession } from '../words/model.js';

export const MODULES = [
  { id:'voyelles', title:'Les voyelles', icon:'🌸', detail:'a, e, i, o, u…', color:'rose' },
  { id:'consonnes', title:'Les consonnes', icon:'🦋', detail:'Toutes les consonnes', color:'lavender' },
  { id:'sons', title:'Les sons', icon:'🌈', detail:'ou, on, an, ui…', color:'mint' },
  { id:'experts', title:'Sons experts', icon:'💎', detail:'Des sons à explorer', color:'peach' },
  { id:'tout', title:'Tout mélangé', icon:'✨', detail:'La grande aventure', color:'gold' },
  { id:'words', title:'Trouve le mot !', icon:'📖', detail:'Trois niveaux de lecture', color:'sky' }
];
export const WORLD_WIDTH = 3600, WORLD_HEIGHT = 1400;
export function pathPoint(progress){
  const p = Math.max(0,Math.min(1,progress)), x = 140 + p * 3160;
  return {x,y:620 + Math.sin(p*Math.PI*4)*60 - p*p*160};
}
export const CRYSTALS_PER_WORLD = 10;
export const WORLDS = [
  {id:0,name:'La prairie des fleurs',icon:'🌷',kind:'pink',sky:'#d4edf0',ground:'#b0d3a8',mountain:'#a8d2ce',road:'#fbe4b1'},
  {id:1,name:'La forêt des lucioles',icon:'🍄',kind:'pine',sky:'#91beb8',ground:'#6ca58a',mountain:'#719f9b',road:'#dfd4ab'},
  {id:2,name:'Le pays des bonbons',icon:'🍭',kind:'pink',sky:'#f4d9e9',ground:'#e5bcd6',mountain:'#c6a1ca',road:'#fff0ca'},
  {id:3,name:'Le lagon des sirènes',icon:'🐚',kind:'pine',sky:'#c3edf0',ground:'#8bcbd1',mountain:'#81b7c5',road:'#fff0cc'},
  {id:4,name:'Le pays des glaces',icon:'❄️',kind:'purple',sky:'#d3e6f5',ground:'#dbe8ef',mountain:'#a5bddb',road:'#f5faff'},
  {id:5,name:'Le royaume des nuages',icon:'☁️',kind:'purple',sky:'#d9ddf1',ground:'#d1c4e8',mountain:'#aaa4ce',road:'#fff7fb'},
  {id:6,name:'Le passage des étoiles',icon:'🌙',kind:'purple',sky:'#383d72',ground:'#8b88b4',mountain:'#7978aa',road:'#e5ddf0'}
];
export function checkpointFor(crystals){
  const count=Math.max(0,Math.floor(crystals));
  return Math.floor(count/5)*5;
}
export function journeyState(crystals,total,startWorld=0){
  const count=Math.max(0,Math.min(total,crystals)), finished=count===total;
  const worldIndex=finished?Math.ceil(total/10)-1:Math.floor(count/10);
  const worldCrystals=finished?10:count%10;
  return {worldIndex,worldCrystals,theme:WORLDS[(startWorld+worldIndex)%WORLDS.length],checkpoint:checkpointFor(count),finished};
}
export function gagFor(crystal){
  return [null,'prout',null,'rainbow',null,null,'boing',null,'hat',null][(crystal-1)%10]||null;
}
export class AdventureSession extends QuestionSession {
  constructor(questions){super(questions);this.mistakes=new Set();this.credited=new Set();this.returnIndex=null;}
  answer(id){
    if(this.phase!=='question'||!this.current.choices.some(c=>c.id===id)) return null;
    if(id!==this.current.target.id){
      const firstMistake=!this.mistakes.has(this.index);
      this.mistakes.add(this.index);this.returnIndex=checkpointFor(this.index);this.phase='returning';
      return {correct:false,firstMistake,checkpoint:this.returnIndex,from:this.index};
    }
    const firstCompletion=!this.credited.has(this.index),firstTry=!this.mistakes.has(this.index);
    if(firstCompletion&&firstTry) this.score++;
    this.credited.add(this.index);this.phase='feedback';
    return {correct:true,firstTry,firstCompletion};
  }
  recover(){
    if(this.phase!=='returning') return false;
    this.index=this.returnIndex;this.returnIndex=null;this.phase='question';this.missed=false;return true;
  }
}
export function createJourneyMemory(storage){
  let count=0,persistent=true;
  function load(){
    if(!persistent) return;
    try {const saved=JSON.parse(storage.getItem('licorne.adventure.v1'));if(Number.isSafeInteger(saved?.worldsCompleted)&&saved.worldsCompleted>=0) count=saved.worldsCompleted;}
    catch(e){persistent=false;}
  }
  load();
  return {
    get startWorld(){load();return count%WORLDS.length;},
    get persistent(){return persistent;},
    complete(worlds){load();count+=worlds;try{storage.setItem('licorne.adventure.v1',JSON.stringify({worldsCompleted:count}));}catch(e){persistent=false;}}
  };
}
export function createAdventure(mode, level = 1, stats = {}){
  if(mode === 'words') return new AdventureSession(new WordSession(WORDS,level,stats).questions);
  if(!LEVELS[mode]) throw new Error('Unknown learning module');
  const questions = makeTargets(LEVELS[mode],20).map(target => ({
    target:{...target,id:target.g},
    choices:shuffle([target,...distractors(target,LEVELS[mode])]).map(w => ({...w,id:w.g,text:w.g}))
  }));
  return new AdventureSession(questions);
}
