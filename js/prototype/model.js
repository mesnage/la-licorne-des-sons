import { PHONEME_ACTIVITY, phonemeQuestions } from '../phonemes/model.js?v=phoneme-red-3';
import { LEVELS } from '../data/sounds.js';
import { WORDS, WORD_LEVELS } from '../data/words.js';
import { distractors, pickWord } from '../questions.js';
import { shuffle } from '../utils.js';
import { QuestionSession, WordSession } from '../words/model.js';
import { SENTENCE_ACTIVITIES, sentenceActivity } from '../data/sentences.js';
import { sentenceQuestions } from '../sentences/model.js';
import { TYPO_ACTIVITY } from '../data/typos.js';
import { typoQuestions } from '../sentences/typos.js';

export const MODULES = [
  { id:'voyelles', title:'Les voyelles', icon:'flower', detail:'a, e, i, o, u…', color:'rose' },
  { id:'consonnes', title:'Les consonnes', icon:'butterfly', detail:'Le nom des lettres', color:'lavender' },
  { id:'sons', title:'Les sons', icon:'rainbow', detail:'ou, on, an, ui…', color:'mint' },
  { id:'experts', title:'Sons experts', icon:'gem', detail:'Des sons à explorer', color:'peach' },
  { id:'tout', title:'Tout mélangé', icon:'star', detail:'La grande aventure', color:'gold' },
];
export const MENU_ITEMS=[TYPO_ACTIVITY,...SENTENCE_ACTIVITIES,...MODULES,PHONEME_ACTIVITY,...WORD_LEVELS.map(level=>({id:'words-'+level.id,mode:'words',level:level.id,title:'Trouve le mot ! · '+level.id,detail:level.title,icon:'book',color:['sky','mint','lavender'][level.id-1]}))];
export const CHAPTERS = [
  {id:'letters',title:'Les lettres',detail:'Voyelles et consonnes',icon:'letters',color:'rose',activities:['voyelles','consonnes']},
  {id:'sounds',title:'Les sons',detail:'Découvrir et mélanger les sons',icon:'sound',color:'mint',activities:['sons','experts','tout','listen-phonemes']},
  {id:'words',title:'Les mots',detail:'Trois niveaux de lecture',icon:'book',color:'sky',activities:['words-1','words-2','words-3']},
  {id:'sentences',title:'Les phrases',detail:'Construire et trouver la faute',icon:'sentence',color:'lavender',activities:['sentence-copy-3','sentence-copy-5','sentence-listen-3','sentence-listen-5','find-typo']}
];
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
export function worldPanorama(theme){
  const file=theme.habitat==='meadow'?'prairie-cotiere.jpg':theme.habitat+'.webp';
  return 'assets/storybook/'+file;
}
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
    return this.grade(id===this.current.target.id);
  }
  grade(correct){
    if(this.phase!=='question')return null;
    if(!correct){
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
export class SentenceAdventureSession extends AdventureSession {
  constructor(questions){super(questions);this.selected=[];}
  get orderedWords(){return this.selected.map(id=>this.current.choices.find(tile=>tile.id===id).text);}
  answer(id){
    if(this.phase!=='question'||this.selected.includes(id))return null;
    const tile=this.current.choices.find(choice=>choice.id===id);
    if(!tile)return null;
    if(tile.text!==this.current.target.words[this.selected.length])return this.grade(false);
    this.selected.push(id);
    return this.selected.length===this.current.target.words.length?this.grade(true):{correct:true,partial:true};
  }
  next(){const advanced=super.next();if(advanced)this.selected=[];return advanced;}
  recover(){const recovered=super.recover();if(recovered)this.selected=[];return recovered;}
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
  if(mode === PHONEME_ACTIVITY.id)return new AdventureSession(phonemeQuestions());
  if(mode === TYPO_ACTIVITY.id)return new AdventureSession(typoQuestions(stats));
  if(mode === 'words') return new AdventureSession(new WordSession(WORDS,level,stats).questions);
  const activity=sentenceActivity(mode);
  if(activity)return new SentenceAdventureSession(sentenceQuestions(activity.length,stats));
  if(!LEVELS[mode]) throw new Error('Unknown learning module');
  const targets=[],history={};
  let bag=[];
  while(targets.length<20){
    if(!bag.length)bag=shuffle(LEVELS[mode]);
    const previous=targets.at(-1)?.p;
    const remaining=new Map();
    for(const sound of bag)remaining.set(sound.p,(remaining.get(sound.p)||0)+1);
    const eligible=bag.filter(sound=>sound.p!==previous);
    eligible.sort((a,b)=>remaining.get(b.p)-remaining.get(a.p));
    const different=eligible.length?bag.indexOf(eligible[0]):-1;
    // A shuffled bag balances exposure while keeping the order unpredictable.
    // Prefer a different sound, including across the boundary between bags.
    const index=different<0?0:different;
    const [sound]=bag.splice(index,1);
    targets.push(pickWord(sound,history));
  }
  const questions = targets.map(target => ({
    target:{...target,id:target.g},
    choices:shuffle([target,...distractors(target,LEVELS[mode])]).map(w => ({...w,id:w.g,text:w.g}))
  }));
  return new AdventureSession(questions);
}
