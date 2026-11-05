import { PHONEMES } from '../data/phonemes.js?v=phoneme-red-3';
import { shuffle } from '../utils.js';

export const PHONEME_ACTIVITY = {id:'listen-phonemes',title:'Quel son entends-tu ?',detail:'36 sons à écouter · 3 choix',icon:'sound',color:'mint'};
// Conservative exclusions: accent variants, nasal vowels, related glides,
// voiced/unvoiced pairs and neighbouring fricatives must never compete.
export const CONFUSABLE_GROUPS = [
  ['a','a-back'], ['schwa','e','e-open','eu','eu-open'], ['o','o-open'],
  ['an','in','on','un'], ['ou','u','w','huit'], ['i','yod','huit'],
  ['p','b'], ['t','d'], ['k','g'], ['f','v'], ['s','z','ch','j'],
  ['m','n','gn'], ['l','r'], ['gn','yod']
];
export function compatible(a,b){
  return a.id!==b.id && a.g!==b.g && !CONFUSABLE_GROUPS.some(group=>group.includes(a.id)&&group.includes(b.id));
}
export function phonemeChoices(target){
  const choices=[target];
  for(const candidate of shuffle(PHONEMES)){
    if(choices.every(choice=>compatible(choice,candidate)))choices.push(candidate);
    if(choices.length===3)return shuffle(choices);
  }
  throw new Error('Not enough distinct phoneme choices');
}
export function phonemeQuestions(){
  return shuffle(PHONEMES).slice(0,10).map(target=>({target,choices:phonemeChoices(target)}));
}
