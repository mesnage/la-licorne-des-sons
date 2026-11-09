import { SENTENCES } from './sentences.js';

const fourWords = [
  'Le chat dort bien.', 'Le lapin saute haut.',
  'La poule picore ici.', 'Le canard nage vite.', 'La tortue avance doucement.',
  'Le renard court loin.', 'La lune brille fort.', 'Le vent souffle fort.',
  'Le bébé rit encore.', 'Le cheval trotte vite.', 'Un papillon vole haut.',
  'Le poisson tourne lentement.', 'Le chien joue dehors.', 'La souris danse ici.',
  'La fille dessine bien.', 'Le garçon chante juste.', 'Le bateau avance doucement.',
  'La pluie tombe encore.', 'La neige fond vite.', 'Un oiseau chante dehors.'
];

export function sentenceOrderPool(position) {
  const length = 3 + (position - 1) % 3;
  const listening = position > 3;
  const texts = length === 4 ? fourWords : SENTENCES.filter(item => item.length === length).map(item => item.text);
  return texts.slice(0, 20).map(sentence => {
    const modelAudio = 'lecture:modèle:' + sentence;
    return {
      sentence, order: sentence.slice(0, -1).toLocaleLowerCase('fr').split(' '),
      ...(listening ? { prompt: modelAudio } : { display: sentence }),
      modelAudio, choices: [], answer: 1
    };
  });
}
