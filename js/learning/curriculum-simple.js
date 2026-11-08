import { sounds } from '../data/curriculum-chapter-one.js';
import { oralWords } from '../data/curriculum-pilot.js';
import { answerCards, answerAudioKey, questionAudioKey } from '../data/curriculum-answer-cards.js';
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

function decodePool(source) {
  const readable = source.filter(question => question.written && question.choices.length === 2);
  // Prefer whole-word transfer examples before the training syllables.
  return [...readable].reverse().map(question => ({
    display: question.written.text,
    choices: question.choices,
    answer: question.answer
  }));
}

const vowel = /[aeiouyɑɔɛœøə]/u;

function assemblePool(unit, source) {
  const pool = unit.id === 'C2-U02' || unit.id === 'C2-U14'
    ? source.filter(q => q.type === 'decode_word_audio') : source.filter(q => q.written && q.choices.length === 2);
  return [...pool].reverse().map(q => {
    const segments = q.written.segments;
    const space = segments.findIndex(segment => segment.g === ' ');
    const split = space >= 0 ? space : Math.min(segments.length - 1,
      segments.findIndex(segment => vowel.test(segment.ipa)) + 1 || 1);
    const join = parts => parts.map(part => part.g).join('').toUpperCase();
    const order = [join(segments.slice(0, split)), join(segments.slice(space >= 0 ? split + 1 : split))];
    if (order.some(piece => !piece)) throw new Error('Découpage insuffisant : ' + q.written.text);
    return { prompt: q.choices[q.answer], word: q.written.text, order, choices: [], answer: 1 };
  });
}

const missingGroups = [
  ['on'], ['an','en'], ['in','ain','ein'], ['oi'], ['au','eau'], ['è','ê','ai','ei'],
  ['er','ez'], ['ss','s','z'], ['c','ç'], ['gu'], ['g'], ['ph'], ['gn'], ['ill'],
  ['eil'], ['ail'], ['ouil','euil'], ['on','an','ain','oi','eil']
];

function fillPool(unit, source) {
  const candidates = missingGroups[unit.position - 1];
  return source.filter(q => q.type.startsWith('decode_')).map(q => {
    const segments = q.written.segments;
    const index = segments.findIndex(segment => candidates.includes(segment.g));
    if (index < 0) throw new Error('Graphème cible absent : ' + q.written.text);
    const { g, ipa } = segments[index];
    const rival = g === 's' && ipa === 'z' ? 'ss' : ({
      ss:'s', z:'s', c:'g', ç:'t', gu:'g', g:'gu', ouil:'euil', euil:'ouil'
    })[g] ?? 'i';
    const join = parts => parts.map(part => part.g).join('').toUpperCase();
    return {
      prompt: q.choices[q.answer], word: q.written.text, choices: [],
      blank: [join(segments.slice(0, index)), join(segments.slice(index + 1))],
      labels: [g.toUpperCase(), rival.toUpperCase()], answer: 0
    };
  });
}

function comprehensionPool(unit, source) {
  const type = simpleExercise(unit).type;
  if (unit.position === 8) {
    return [...scenes[unit.id], ...transferScenes[unit.id]].map(([display]) => ({
      display, choices: [], labels: ['Elle dit oui', 'Elle dit non', 'Elle pose une question'],
      answer: display.endsWith('?') ? 2 : /\bne\b.*\bpas\b/i.test(display) ? 1 : 0
    }));
  }
  if (unit.position === 6) {
    return languagePairs[unit.id].map(([male, female]) => ({
      display: 'UNE …', choices: [], labels: [male.toUpperCase(), female.toUpperCase()], answer: 1
    }));
  }
  const cards = answerCards[unit.id];
  if ([10, 12].includes(unit.position)) {
    return [...scenes[unit.id], ...transferScenes[unit.id]].map(([display], index) => ({
      display, choices: [], labels: cards[index].slice(0, 2), question: cards[index][2], answer: 0, spokenCards: true
    }));
  }
  const questions = source.filter(q => q.type === type &&
    (unit.position !== 5 || q.blockIndex === 3) && (unit.position !== 11 || q.blockIndex === 0));
  return questions.map(q => {
    if (unit.position === 5) {
      const one = q.position === 0 || q.position === 2;
      const quantity = one ? 'Un seul' : 'Plusieurs';
      return { display: quantity, prompt: answerAudioKey(quantity), choices: [], labels: q.labels, answer: q.answer };
    }
    const card = cards?.[(q.blockIndex === 3 && transferScenes[unit.id] ? 5 : 0) + q.position];
    return {
      prompt: q.prompt, display: q.display, choices: [],
      labels: card ? card.slice(0, 2) : q.labels, question: card?.[2], answer: card ? 0 : q.answer, spokenCards: !!card
    };
  });
}

function getPool(chapter, unit, seed) {
  if (unit.id === 'C1-U01') return countPool();
  const source = createSourceQuestions(chapter, unit, null, seed);
  if (chapter.id === 'C2') return assemblePool(unit, source);
  if (chapter.id === 'C3') return fillPool(unit, source);
  if (chapter.id === 'C4') return comprehensionPool(unit, source);
  return chapter.id === 'C1' && unit.position < 12 ? letterPool(unit, source) : decodePool(source);
}

function distinct(pool) {
  const seen = new Set();
  return pool.filter(question => {
    const key = question.word ?? question.context ?? (question.prompt && question.display === undefined ? question.prompt
      : question.display + '\n' + (question.labels ?? []).join('|'));
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
      const answer = counts || item.order ? item.answer : answerIndex;
      const rivalCount = counts ? (answer === 1 ? 2 : answer === 4 ? 3 : reverse ? answer - 1 : answer + 1) : null;
      const question = {
        ...item, id: block.id + '-Q' + (position + 1), blockIndex, position, type, instruction, instructionAudio, answer,
        ...(item.labels ? { labels: ordered } : { choices: ordered }),
        ...(item.order ? { tiles: reverse ? [1, 0] : [0, 1] } : {}),
        ...(item.spokenCards ? { optionAudio: ordered.map(answerAudioKey) } : {}),
        ...(item.question ? { questionAudio: questionAudioKey(item.question) } : {}),
        ...(counts ? { counts: [answer, rivalCount].sort((a, b) => a - b) } : {})
      };
      if (manifest && [instructionAudio, question.prompt, question.context, question.questionAudio, ...question.choices, ...(question.optionAudio ?? [])]
        .filter(Boolean).some(key => typeof manifest[key] !== 'string')) {
        throw new Error('Audio absent : ' + question.id);
      }
      return question;
    });
  });
}
