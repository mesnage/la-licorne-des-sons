import { sounds } from '../data/curriculum-chapter-one.js';
import { oralWords } from '../data/curriculum-pilot.js';
import { languagePairs, scenes, transferScenes } from '../data/curriculum-comprehension.js';
import { simpleExercise, simpleInstructionKey } from '../data/curriculum-simple.js';
import { createSourceQuestions } from './curriculum-questions.js';

const syllableBlocks = [
  ['chat','moto','bol','lapin','loup'],
  ['chocolat','tortue','abricot','sac','cabane'],
  ['parapluie','hippopotame','chapeau','escargot','bateau'],
  ['maison','harmonica','kangourou','banane','salade']
];

const graphemes = new Map(Object.entries(sounds).map(([letter, [, key]]) => ['P:robin:' + key, letter]));
const keyForLetter = letter => 'P:robin:' + sounds[letter][1];

function countPool() {
  return syllableBlocks.flat().map(word => ({
    prompt: 'C1:oral:' + word,
    choices: [],
    answer: oralWords[word].length
  }));
}

function letterPool(unit, source) {
  return source.flatMap(question => {
    if (question.type === 'sound_to_grapheme') {
      const correct = question.labels[question.answer].toLowerCase();
      return [{
        prompt: keyForLetter(correct),
        context: question.prompt,
        choices: [],
        labels: question.labels,
        answer: question.answer
      }];
    }
    if (['oral_initial', 'oral_contrast'].includes(question.type)) {
      return [{
        prompt: question.choices[question.answer],
        context: question.prompt,
        choices: [],
        labels: question.choices.map(key => graphemes.get(key).toUpperCase()),
        answer: question.answer
      }];
    }
    if (question.type === 'oral_yes_no' && question.prompt !== 'C1:oral:moto') {
      const positive = question.labels[question.answer] === 'Oui';
      return [{
        prompt: keyForLetter(positive ? 'l' : 'v'),
        context: question.prompt,
        choices: [],
        labels: ['L','V'],
        answer: positive ? 0 : 1
      }];
    }
    return [];
  }).filter(question => unit.position !== 8 || question.labels.every(label => ['L','S','V'].includes(label)));
}

function decodePool(unit, source) {
  const readable = unit.id === 'C2-U02' || unit.id === 'C2-U14'
    ? source.filter(question => question.type === 'decode_word_audio')
    : source.filter(question => question.written && question.choices.length === 2);
  // Prefer whole-word transfer examples before the training syllables.
  return [...readable].reverse().map(question => ({
    display: question.written.text,
    choices: question.choices,
    answer: question.answer
  }));
}

function comprehensionPool(unit, source) {
  const type = simpleExercise(unit).type;
  if (unit.position === 8) {
    return [...scenes[unit.id], ...transferScenes[unit.id]].map(([display]) => ({
      display, choices: [], labels: ['Elle dit oui', 'Elle dit non', 'Elle pose une question'],
      answer: display.endsWith('?') ? 2 : /\bne\b.*\bpas\b/i.test(display) ? 1 : 0
    }));
  }
  if (unit.position === 10 || unit.position === 12) {
    return [...scenes[unit.id], ...transferScenes[unit.id]].map(([display, yes, no, actor, other]) => ({
      display, choices: [], scene: true, labels: unit.position === 12 ? [actor, other] : [yes, no], answer: 0
    }));
  }
  if (unit.position === 6) {
    return languagePairs[unit.id].map(([male, female]) => ({
      display: 'UNE …', choices: [], labels: [male.toUpperCase(), female.toUpperCase()], answer: 1
    }));
  }
  return source.filter(question => question.type === type &&
    (unit.position !== 5 || question.blockIndex === 3) &&
    (unit.position !== 11 || question.blockIndex === 0)).map(question => ({
    prompt: question.prompt,
    display: question.display,
    choices: [],
    labels: question.labels,
    scene: question.scene,
    answer: question.answer
  }));
}

function getPool(chapter, unit, seed) {
  if (unit.id === 'C1-U01') return countPool();
  const source = createSourceQuestions(chapter, unit, null, seed);
  if (chapter.id === 'C4') return comprehensionPool(unit, source);
  return chapter.id === 'C1' && unit.position < 12 ? letterPool(unit, source) : decodePool(unit, source);
}

function distinct(pool) {
  const seen = new Set();
  return pool.filter(question => {
    const key = question.context ?? question.prompt ?? (question.display + '\n' + (question.labels ?? []).join('|'));
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function createSimpleQuestions(chapter, unit, manifest, seed) {
  const { type, instruction } = simpleExercise(unit);
  const instructionAudio = simpleInstructionKey(instruction);
  const pool = distinct(getPool(chapter, unit, seed));
  return unit.blocks.flatMap((block, blockIndex) => {
    if (pool.length < block.questionCount) throw new Error('Exemples insuffisants : ' + unit.id);
    const counts = type === 'oral_count';
    const start = counts ? blockIndex * 5
      : (seed % pool.length + blockIndex * (pool.length === 5 ? 1 : 5)) % pool.length;
    return Array.from({ length: block.questionCount }, (_, position) => {
      const item = pool[(start + position) % pool.length];
      const reverse = (seed + blockIndex + position) % 2 !== 0;
      const options = item.labels ?? item.choices;
      const answerIndex = options.length ? options.length === 3
        ? (item.answer + blockIndex + position) % 3 : reverse ? 1 : 0 : item.answer;
      const ordered = [...options];
      if (options.length) {
        ordered.splice(item.answer, 1);
        ordered.splice(answerIndex, 0, options[item.answer]);
      }
      const answer = counts ? item.answer : answerIndex;
      const rivalCount = counts ? (answer === 1 ? 2 : answer === 4 ? 3 : reverse ? answer - 1 : answer + 1) : null;
      const question = {
        ...item, id: block.id + '-Q' + (position + 1), blockIndex, position, type, instruction, instructionAudio, answer,
        ...(item.labels ? { labels: ordered } : { choices: ordered }),
        ...(counts ? { counts: [answer, rivalCount].sort((a, b) => a - b) } : {})
      };
      if (manifest && [instructionAudio, question.prompt, question.context, ...question.choices]
        .filter(Boolean).some(key => typeof manifest[key] !== 'string')) {
        throw new Error('Audio absent : ' + question.id);
      }
      return question;
    });
  });
}
