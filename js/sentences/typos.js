import { TYPO_SENTENCES } from '../data/typos.js';
import { shuffle, chooseTarget } from '../words/model.js';

export function typoQuestion(item, wrongIndex){
  if(!Number.isInteger(wrongIndex)||wrongIndex<0||wrongIndex>2)throw new Error('A typo must be in one of three word positions');
  const {sentence,typos}=item;
  const id=sentence.id+':typo:'+wrongIndex;
  return {
    target:{id,sentenceId:sentence.id,text:sentence.text,words:sentence.words,wrongIndex,audioKey:sentence.audioKey},
    choices:sentence.words.map((word,index)=>({id:index===wrongIndex?id:sentence.id+':word:'+index,text:index===wrongIndex?typos[index]:word}))
  };
}
export function typoQuestions(stats = {}, random = Math.random){
  const available=[...TYPO_SENTENCES], questions=[];
  // Every session includes all three positions, without repeating a sentence.
  const offset=Math.floor(random()*3);
  const positions=shuffle(Array.from({length:10},(_,index)=>(index+offset)%3),random);
  for(const position of positions){
    const candidates=available.map(item=>typoQuestion(item,position));
    const target=chooseTarget(candidates.map(question=>question.target),stats,null,random);
    questions.push(candidates.find(question=>question.target.id===target.id));
    available.splice(available.findIndex(item=>item.sentence.id===target.sentenceId),1);
  }
  return questions;
}
