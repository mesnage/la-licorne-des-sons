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
export function biomeFor(progress){
  if(progress >= .98) return {id:3,name:'Le château de cristal',icon:'🏰'};
  if(progress >= .67) return {id:2,name:'Le passage des étoiles',icon:'🌙'};
  if(progress >= .33) return {id:1,name:'La forêt des lucioles',icon:'🍄'};
  return {id:0,name:'La prairie des fleurs',icon:'🌷'};
}
export function createAdventure(mode, level = 1, stats = {}){
  if(mode === 'words') return new WordSession(WORDS,level,stats);
  if(!LEVELS[mode]) throw new Error('Unknown learning module');
  const questions = makeTargets(LEVELS[mode],20).map(target => ({
    target:{...target,id:target.g},
    choices:shuffle([target,...distractors(target,LEVELS[mode])]).map(w => ({...w,id:w.g,text:w.g}))
  }));
  return new QuestionSession(questions);
}
