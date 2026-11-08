import { languagePairs, scenes, transferScenes } from '../data/curriculum-comprehension.js';
import { parseCodeForm } from './curriculum-code.js';

const directions = {
  oral_vocabulary:'Écoute puis choisis la scène correspondante.',
  oral_sentence:'Écoute la phrase, puis choisis la scène qui lui correspond.',
  sentence_picture:'Lis la phrase, puis choisis la scène qui lui correspond.',
  grapheme_highlight:'Dans la forme écrite, choisis les lettres demandées.',
  sentence_order:'Touche les mots dans l’ordre pour reconstruire la phrase que tu entends.',
  word_family:'Choisis un mot de la même famille.',
  morph_choice:'Observe la forme ou la scène, puis choisis.',
  syntax_choice:'Lis la phrase, puis choisis la réponse.',
  story_listen_question:'Écoute le récit et la question, puis choisis la réponse.',
  story_read_question:'Lis le récit et la question, puis choisis la réponse.',
  decode_word_audio:'Lis le mot, puis écoute les options.'
};

const controlledTransfer = [
  'l e | l ou p:- | f i l e:-', 'l a | l u n e:- | b r ill e:-', 'l a | p ou l e:- | p i c:k o r e:-',
  'l e | c:k a n a r d:- | n a g:ʒ e:-', 'l a | v a ch e:- | r u m i n e:-'
];
const timeOrder = [
  ['Le chat mange puis dort.','🍽️','💤'],
  ['Le lapin boit avant de manger.','💧','🍽️'],
  ['Après la pluie, la poule picore.','🌧️','🌾'],
  ['Le canard nage puis se repose.','💧','💤'],
  ['Avant de dormir, le chat boit.','💧','💤']
];
const causalQuestions = [
  'Pourquoi le rat boit-il ?', 'Pourquoi la poule picore-t-elle ?', 'Pourquoi le chat se couche-t-il ?',
  'Pourquoi la vache cherche-t-elle la mare ?', 'Pourquoi le loup rentre-t-il dans son abri ?'
];
const storyPlaces = [
  ['💧','🌳'], ['🏠','🌳'], ['🍳','🌊'], ['🏠','🌊'], ['💧','🏜️']
];
const storyOrder = [
  ['🐇⬆️','🥤'], ['🌧️👀','🏠➡️'], ['🍳➡️','🍴'], ['🥶','🏠➡️'], ['💧↗️','💤']
];
const storyWhy = [
  ['Pourquoi le lapin va-t-il vers la mare ?', '🥤','💤'],
  ['Pourquoi la vache rentre-t-elle ?', '🌧️','☀️'],
  ['Pourquoi le chat va-t-il dans la cuisine ?', '🍴','💤'],
  ['Pourquoi la poule part-elle ?', '🥶','🥵'],
  ['Pourquoi le canard quitte-t-il la mare ?', '💤','🍽️']
];
const articleScenes = [
  ['Le lapin saute.','🐇⬆️','🐇💤'], ['La lune brille.','🌕✨','☀️✨'],
  ['Un loup et une vache arrivent.','🐺🐄','🐺🐺'],
  ['Les pandas mangent.','🐼🐼🎋','🐼🐼💤'], ['Des poules picorent.','🐔🐔🌾','🐔🐔💤']
];
const articleLetters = [
  ['E','A','Quelle lettre fait le son neutre à la fin ?'], ['A','E','Quelle lettre donne la voyelle entendue ?'],
  ['UN','U','Quel groupe de lettres se prononce ensemble ?'], ['U','UN','Quelle lettre fait le son U dans ce mot ?'],
  ['S','L','Quelle lettre finale reste muette ?']
];
const introductoryScenes = [
  ['🐈👀🐔','🐈👀🐄'], ['🐄👀🐇','🐄👀🐈'], ['🐺👀🐔','🐺👀🐄'],
  ['🐼👀🐄','🐼👀🐔'], ['🐔👀🐈','🐔👀🐇']
];
const endingWords = ['chat','rat','renard','grand','canard'];

function checkTransfer(index, sentence) {
  const text = parseCodeForm(controlledTransfer[index], 'C4-U03').text;
  if (text !== sentence.slice(0, -1).toLowerCase()) throw new Error('Phrase de transfert non annotée : ' + sentence);
}

export function createComprehensionQuestions(unit, seed) {
  const rows = scenes[unit.id];
  const pairs = languagePairs[unit.id];
  return unit.blocks.flatMap((block, blockIndex) => {
    if (rows.length !== block.questionCount) throw new Error(block.id + ' · corpus incomplet');
    return rows.map((base, position) => {
      const transfer = blockIndex === 3 && transferScenes[unit.id]?.[position];
      const [text, yes, no, detail, contrast, action, alternative] = transfer || base;
      const pair = pairs?.[position];
      const q = {
        id: block.id + '-Q' + (position + 1), blockIndex, position, type: block.exerciseType,
        instruction: directions[block.exerciseType], choices: [], audio: {}
      };
      const clip = (value, ipa) => {
        const key = 'C4:' + (ipa ? ipa + ':' : '') + value;
        q.audio[key] = { text: value, ...(ipa ? { ipa } : {}) };
        return key;
      };
      const select = (field, correct, wrong) => {
        if (!correct || !wrong || correct === wrong) throw new Error(q.id + ' · options invalides');
        q[field] = (seed + position) % 2 ? [wrong, correct] : [correct, wrong];
        q.answer = q[field].indexOf(correct);
      };

      switch (q.type) {
        case 'oral_vocabulary':
        case 'oral_sentence': {
          const row = unit.id === 'C4-U01' ? articleScenes[position] : base;
          q.prompt = clip(row[0]);
          select('labels', row[1], row[2]);
          q.scene = true;
          break;
        }
        case 'sentence_picture':
          if (unit.id === 'C4-U03' && transfer) checkTransfer(position, text);
          q.display = unit.id === 'C4-U12' ? text.split('. ')[0] + '.' : text;
          if (unit.id === 'C4-U07') {
            q.display = text;
            q.instruction = 'Lis, puis choisis le personnage désigné par le pronom.';
            select('labels', detail, contrast);
          } else if (unit.id === 'C4-U12') {
            select('labels', ...introductoryScenes[position]);
          } else {
            select('labels', yes, no);
          }
          q.scene = true;
          break;
        case 'sentence_order': {
          const words = text.replace(/[.!?]$/, '').split(' ');
          q.prompt = clip(text);
          q.order = words;
          q.tiles = words.map((word, index) => ({ word, index }))
            .slice(1).reverse().concat({ word: words[0], index: 0 });
          q.answer = 1;
          break;
        }
        case 'grapheme_highlight':
          if (unit.id === 'C4-U01') {
            q.display = pair[0];
            q.prompt = clip(pair[0], ['lə','la','œ̃','yn','le'][position]);
            const [target, other, instruction] = articleLetters[position];
            q.instruction = instruction;
            select('labels', target, other);
          } else {
            q.display = pair[0];
            q.instruction = 'Quelle lettre finale reste muette ?';
            select('labels', pair[3].toUpperCase(), pair[0][0].toUpperCase());
          }
          break;
        case 'word_family':
          q.display = unit.id === 'C4-U02' ? pair[0] : pair[1];
          select('labels', unit.id === 'C4-U02' ? pair[1] : pair[0],
            unit.id === 'C4-U02' ? pair[2] : pairs[(position + 1) % pairs.length][0]);
          break;
        case 'morph_choice':
          if (unit.id === 'C4-U05' && blockIndex === 1) {
            q.display = pair[0].length >= pair[1].length ? pair[0] : pair[1];
            q.instruction = 'Quelle est la marque de pluriel de cette forme ?';
            if (position === 2) q.display = 'chevaux';
            select('labels', pair[2].toUpperCase(), pair[2] === 's' ? 'X' : 'S');
          } else {
            q.display = yes;
            q.scene = true;
            select('labels', unit.id === 'C4-U06' ? pair[1] : pair[0], unit.id === 'C4-U06' ? pair[0] : pair[1]);
          }
          break;
        case 'syntax_choice':
          q.display = unit.id === 'C4-U07' || unit.id === 'C4-U10' ? text.replace(pair[0], '…') : text;
          q.instruction = unit.id === 'C4-U08' ? 'Qu’est-ce qui caractérise cette phrase ?' : 'Quel mot complète la phrase ?';
          select('labels', pair[0], pair[1]);
          break;
        case 'story_listen_question': {
          let story = text;
          let question;
          let options;
          if (unit.id === 'C4-U07') {
            question = 'Qui agit dans la deuxième phrase ?';
            options = [detail, contrast];
          } else if (unit.id === 'C4-U10' && blockIndex === 1) {
            [story, ...options] = timeOrder[position];
            question = 'Qu’est-ce qui se passe en premier ?';
          } else if (unit.id === 'C4-U10') {
            question = causalQuestions[position];
            options = [yes, no];
          } else if (blockIndex === 0) {
            question = 'Qui est le personnage de cette histoire ?';
            options = [yes, no];
          } else if (blockIndex === 1) {
            question = position === 4 ? 'D’où part le personnage ?' : 'Où va le personnage ?';
            options = storyPlaces[position];
          } else if (blockIndex === 2) {
            question = 'Que se passe-t-il en premier ?';
            options = storyOrder[position];
          } else {
            [question, ...options] = storyWhy[position];
          }
          q.prompt = clip(story + ' ' + question);
          q.question = question;
          select('labels', ...options);
          q.scene = true;
          break;
        }
        case 'story_read_question':
          q.display = text;
          q.question = blockIndex === 1 ? 'Qui agit dans la deuxième phrase ?'
            : blockIndex === 2 ? 'Quel personnage est désigné par le pronom ?' : 'Dans quel ordre se passent les actions ?';
          select('labels', blockIndex === 3 ? action : detail, blockIndex === 3 ? alternative : contrast);
          q.scene = true;
          break;
        case 'decode_word_audio': {
          const word = endingWords[position];
          const spoken = ['ʃa','ʁa','ʁənaʁ','ɡʁɑ̃','kanaʁ'][position];
          const pronounced = ['ʃat','ʁat','ʁənaʁd','ɡʁɑ̃d','kanaʁd'][position];
          q.display = word;
          q.readFirst = true;
          select('choices', clip(word, spoken), clip(word, pronounced));
          break;
        }
        default: throw new Error(block.id + ' · exercice inconnu : ' + q.type);
      }
      return q;
    });
  });
}
