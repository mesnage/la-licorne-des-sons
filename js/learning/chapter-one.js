import { oralWords, pilotUnitId } from '../data/curriculum-pilot.js';
import { chapterInstructions, meanings, sounds, units } from '../data/curriculum-chapter-one.js';
import { createPilotQuestions } from './pilot-session.js';

const oralKey = word => 'C1:oral:' + word;
const writtenKey = word => 'C1:écrit:' + word;
const phonemeKey = g => 'P:robin:' + sounds[g][1];
export const instructionKey = type => 'C1:consigne:' + type;

export function isChapterOneUnit(id) {
  return id === pilotUnitId || Object.hasOwn(units, id);
}

export function chapterPlayUrl(id, testMode = false, block) {
  const params = [];
  if (id !== pilotUnitId) params.push('unite=' + id);
  if (testMode) {
    params.push('test=1');
    if (block) params.push('bloc=' + block);
  }
  return 'curriculum-play.html' + (params.length ? '?' + params.join('&') : '');
}

export function chapterMapUrl(id, testMode) {
  return 'curriculum.html' + (testMode ? '?test=1' : '') + '#' + id;
}

function decode(annotated, taught, isWord) {
  const segments = annotated.split(' ');
  const text = segments.join('');
  if (segments.some((g, index) => !taught.has(g) || (g === 's' && index !== 0)) ||
      (isWord && !Object.hasOwn(meanings, text))) throw new Error('Décodage non autorisé : ' + text);
  return { text, segments, ipa: segments.map(g => sounds[g][0]).join(''), meaning: meanings[text] ?? null };
}

function ordered(a, b, seed, index) {
  return (seed + index) % 2 === 0 ? [a, b] : [b, a];
}

function buildUnit(unit, taught, seed) {
  const rowsByBlock = units[unit.id];
  const alternate = (g, other) => g === other[0] ? other[1] : other[0];
  const options = {
    'C1-U02': ['a','i'], 'C1-U03': ['é','o'], 'C1-U04': ['u','ou'],
    'C1-U05': ['f','a'], 'C1-U06': ['v','f'], 'C1-U07': ['s','v'],
    'C1-U08': ['l','s'], 'C1-U09': ['r','l'], 'C1-U10': ['j','r'], 'C1-U11': ['ch','j']
  };
  const context = { 'C1-U12': ['f','l'] };
  const allowed = options[unit.id] ?? context[unit.id];
  return unit.blocks.flatMap((block, blockIndex) => {
    const rows = rowsByBlock[blockIndex];
    if (rows.length !== block.questionCount || new Set(rows.map(row => Array.isArray(row) ? row[0] : row)).size !== rows.length) {
      throw new Error('Stimuli insuffisants ou répétés : ' + block.id);
    }
    return rows.map((row, position) => {
      const question = { id: block.id + '-Q' + (position + 1), blockIndex, position, type: block.exerciseType, choices: [] };
      const select = (field, correct, wrong) => {
        question[field] = ordered(correct, wrong, seed, position);
        question.answer = question[field].indexOf(correct);
      };
      switch (block.exerciseType) {
        case 'oral_initial':
        case 'oral_contrast': {
          const [word, g] = row;
          question.prompt = oralKey(word);
          if (unit.id === 'C1-U08') {
            question.type = 'oral_yes_no';
            question.reference = phonemeKey('l');
            select('labels', g === 'l' ? 'Oui' : 'Non', g === 'l' ? 'Non' : 'Oui');
          } else {
            select('choices', phonemeKey(g), phonemeKey(alternate(g, allowed)));
          }
          break;
        }
        case 'sound_to_grapheme': {
          const [word, g] = row;
          question.prompt = oralKey(word);
          if (block.position === 2) question.reference = phonemeKey(g);
          select('labels', g.toUpperCase(), alternate(g, allowed).toUpperCase());
          break;
        }
        case 'grapheme_to_sound': {
          const [glyph, style] = row.split(' ');
          const g = glyph.toLowerCase();
          question.display = glyph;
          question.script = !!style;
          select('choices', phonemeKey(g), phonemeKey(alternate(g, allowed)));
          break;
        }
        case 'oral_sound_position': {
          const [word, g, answer] = row;
          question.prompt = oralKey(word);
          question.reference = phonemeKey(g);
          question.labels = ['Début','Milieu','Fin'];
          question.answer = answer;
          break;
        }
        case 'blend_cv':
        case 'decode_syllable_audio':
        case 'decode_word_audio': {
          const isWord = block.exerciseType === 'decode_word_audio';
          const word = decode(row, taught, isWord);
          const other = decode(rows[(position + 1) % rows.length], taught, isWord);
          if (word.ipa === other.ipa) throw new Error('Options homophones : ' + word.text);
          question.written = word;
          question.display = block.exerciseType === 'blend_cv' ? word.segments.join(' + ') : word.text;
          question.readFirst = block.exerciseType !== 'blend_cv';
          if (!question.readFirst) question.parts = word.segments.map(phonemeKey);
          select('choices', writtenKey(word.text), writtenKey(other.text));
          break;
        }
        default: throw new Error('Exercice indisponible : ' + block.id);
      }
      return question;
    });
  });
}

function buildSyllables(unit, seed) {
  const legacyKeys = Object.fromEntries(Object.keys(oralWords).map(word => ['W:' + word, true]));
  return createPilotQuestions(unit, legacyKeys, seed).map(question => ({
    ...question,
    prompt: oralKey(question.prompt.slice(2)),
    choices: question.choices.map(key => oralKey(key.slice(2)))
  }));
}

export function createChapterQuestions(chapter, id, manifest, seed) {
  const taught = new Set();
  for (const unit of chapter.units) {
    unit.skillTargets.filter(g => Object.hasOwn(sounds, g)).forEach(g => taught.add(g));
    if (unit.id !== id) continue;
    const questions = id === pilotUnitId ? buildSyllables(unit, seed) : buildUnit(unit, taught, seed);
    if (manifest) {
      for (const question of questions) {
        const keys = [question.prompt, question.reference, ...question.choices, ...(question.parts ?? []),
          instructionKey(question.type)].filter(Boolean);
        if (keys.some(key => typeof manifest[key] !== 'string')) throw new Error('Audio absent : ' + question.id);
      }
    }
    return questions;
  }
  throw new Error('Unité inconnue : ' + id);
}

export function chapterAudioSources(chapter) {
  const sources = {};
  for (const [word, syllables] of Object.entries(oralWords)) {
    sources[oralKey(word)] = { text: word, ipa: syllables.join('') };
  }
  for (const unit of chapter.units) {
    const questions = createChapterQuestions(chapter, unit.id, null, 0);
    for (const question of questions) {
      sources[instructionKey(question.type)] = { text: chapterInstructions[question.type] };
      if (question.prompt && !sources[question.prompt]) {
        const text = question.prompt.split(':').at(-1);
        sources[question.prompt] = text === 'igloo' ? { text, ipa: 'iɡlu' } : { text };
      }
      if (question.written) {
        const { text, ipa } = question.written;
        sources[writtenKey(text)] = { text, ipa };
      }
    }
  }
  return sources;
}
