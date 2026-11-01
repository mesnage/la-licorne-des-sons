import { SENTENCES } from '../data/sentences.js';
import { shuffle, chooseTarget } from '../words/model.js';

export function shuffledTiles(sentence, random = Math.random){
  const tiles=sentence.words.map((text,index)=>({id:sentence.id+':'+index,text}));
  const mixed=shuffle(tiles,random);
  // Compare written words: exchanging identical words alone is not a scramble.
  if(mixed.every((tile,index)=>tile.text===sentence.words[index])) mixed.push(mixed.shift());
  return mixed;
}
export function sentenceQuestions(length, stats = {}, random = Math.random){
  const available=SENTENCES.filter(sentence=>sentence.length===length), questions=[];
  if(available.length<10)throw new Error('A sentence level needs at least ten sentences');
  for(let index=0;index<10;index++){
    const target=chooseTarget(available,stats,null,random);
    available.splice(available.indexOf(target),1);
    questions.push({target,choices:shuffledTiles(target,random)});
  }
  return questions;
}
