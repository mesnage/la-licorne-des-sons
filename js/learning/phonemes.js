import { PHONEMES } from '../data/phonemes.js';
import { shuffle } from '../words/model.js';
import { weightedPick } from './mastery.js';
import { isE, OTHER_VOWELS } from '../questions.js';
export function phonemeQuestions(level=1,stats={},random=Math.random){
  const all=PHONEMES.filter(p=>p.level<=level);
  if(!all.length)throw new Error('Unknown phoneme level');
  const known=p=>(stats['phonemes:'+p.id]?.attempts||0)>0;
  const newSounds=all.filter(p=>!known(p)&&p.level===level).slice(0,6);
  const pool=all.filter(p=>known(p)||newSounds.includes(p)),questions=[];
  const occurrences={};let previous;
  for(let index=0;index<10;index++){
    const phoneme=weightedPick(pool,stats,p=>'phonemes:'+p.id,previous,random);
    const example=(occurrences[phoneme.id]||0)%phoneme.examples.length;occurrences[phoneme.id]=(occurrences[phoneme.id]||0)+1;
    const target={...phoneme,w:phoneme.examples[example],audioKey:phoneme.audio[example]};
    const choices=[target];
    // No duplicate spellings/sounds. The original e-family card rule is preserved here too.
    for(const p of shuffle(all,random)){
      if(choices.some(c=>c.id===p.id||c.g===p.g||c.ipa===p.ipa))continue;
      if(isE(target.g)&&!OTHER_VOWELS.includes(p.g))continue;
      if(isE(p.g)&&(!OTHER_VOWELS.includes(target.g)||choices.some(c=>isE(c.g)||!OTHER_VOWELS.includes(c.g))))continue;
      if(!isE(p.g)&&choices.some(c=>isE(c.g))&&!OTHER_VOWELS.includes(p.g))continue;
      if(target.w.toLowerCase().includes(p.g))continue;
      choices.push(p);if(choices.length===3)break;
    }
    if(choices.length!==3)throw new Error('Not enough distinct phoneme choices');
    questions.push({target,choices:shuffle(choices,random)});previous='phonemes:'+phoneme.id;
  }
  return questions;
}
