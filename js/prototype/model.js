import { LEVELS } from '../data/sounds.js';
import { WORDS, WORD_LEVELS } from '../data/words.js';
import { makeTargets, distractors, pickWord } from '../questions.js';
import { shuffle } from '../utils.js';
import { weightedPick } from '../learning/mastery.js';
import { QuestionSession, WordSession } from '../words/model.js';

export const MODULES = [
  { id:'voyelles', title:'Les voyelles', icon:'flower', detail:'a, e, i, o, u…', color:'rose' },
  { id:'consonnes', title:'Les consonnes', icon:'butterfly', detail:'Le nom des lettres', color:'lavender' },
  { id:'sons', title:'Les sons', icon:'rainbow', detail:'ou, on, an, ui…', color:'mint' },
  { id:'experts', title:'Sons experts', icon:'gem', detail:'Des sons à explorer', color:'peach' },
  { id:'tout', title:'Tout mélangé', icon:'star', detail:'La grande aventure', color:'gold' },
];
export const MENU_ITEMS=[...MODULES,...WORD_LEVELS.map(level=>({id:'words-'+level.id,mode:'words',level:level.id,title:'Trouve le mot ! · '+level.id,detail:level.title,icon:'book',color:['sky','mint','lavender'][level.id-1]}))];
export const WORLD_WIDTH = 3600, WORLD_HEIGHT = 1400;
export function pathPoint(progress){
  const p = Math.max(0,Math.min(1,progress)), x = 140 + p * 3160;
  return {x,y:620 + Math.sin(p*Math.PI*4)*60 - p*p*160};
}
export const CRYSTALS_PER_WORLD = 10;
export const WORLDS = [
  {id:0,habitat:'meadow',name:'La prairie des fleurs',icon:'flower',kind:'pink',sky:'#cbdedb',ground:'#b5c49e',mountain:'#8da79b',road:'#e9d6ac'},
  {id:1,habitat:'forest',name:'La forêt des lucioles',icon:'mushroom',kind:'pine',sky:'#a5bcb0',ground:'#839f81',mountain:'#6e8e80',road:'#d6c89e'},
  {id:2,habitat:'jungle',name:'La jungle des cascades',icon:'leaf',kind:'palm',sky:'#c3e3d6',ground:'#8eb89c',mountain:'#709c92',road:'#decfa1'},
  {id:3,habitat:'beach',name:'La plage des coquillages',icon:'shell',kind:'palm',sky:'#c4e9ed',ground:'#f0dbb2',mountain:'#83c4cf',road:'#f8e7c3'},
  {id:4,habitat:'ice',name:'Le pays des glaces',icon:'ice',kind:'purple',sky:'#d3e6f5',ground:'#dbe8ef',mountain:'#a5bddb',road:'#f5faff'},
  {id:5,habitat:'clouds',name:'Le voyage dans les nuages',icon:'cloud',kind:'purple',sky:'#d9ddf1',ground:'#d1c4e8',mountain:'#aaa4ce',road:'#fff7fb'},
  {id:6,habitat:'moon',name:'La lune des petits lapins',icon:'moon',kind:'purple',sky:'#383d72',ground:'#9ba6c2',mountain:'#7978aa',road:'#d9deec'}
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
export function gagFor(crystal,habitat){
  if(crystal%10===6&&habitat)return {meadow:'butterfly',forest:'crown',jungle:'crown',beach:'splash',ice:'bubble',clouds:'bubble',moon:'moonhop'}[habitat]||null;
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
export function createAdventure(mode, level = 1, stats = {}, skills = {}){
  if(mode === 'words') return new AdventureSession(new WordSession(WORDS,level,stats).questions);
  if(!LEVELS[mode]) throw new Error('Unknown learning module');
  let targets;
  if(Object.keys(skills).some(id=>id.startsWith('letters:'))){
    targets=[];let previous;
    for(let i=0;i<20;i++){
      const eligible=LEVELS[mode].filter(s=>s.p!==previous);
      const sound=weightedPick(eligible,skills,s=>'letters:'+s.g,null);
      targets.push(pickWord(sound));previous=sound.p;
    }
  }else targets=makeTargets(LEVELS[mode],20);
  const questions = targets.map(target => ({
    target:{...target,id:target.g},
    choices:shuffle([target,...distractors(target,LEVELS[mode])]).map(w => ({...w,id:w.g,text:w.g}))
  }));
  return new AdventureSession(questions);
}
