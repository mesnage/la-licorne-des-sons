import { chapterAudioSources, createChapterQuestions, instructionKey } from './chapter-one.js';
import { chapterInstructions } from '../data/curriculum-chapter-one.js';
import { createCodeQuestions } from './curriculum-code.js';
import { createComprehensionQuestions } from './curriculum-comprehension.js';

export function createSourceQuestions(chapter, unit, manifest, seed) {
  const firstChapter = chapter.id === 'C1';
  const raw = firstChapter ? createChapterQuestions(chapter, unit.id, manifest, seed)
    : chapter.id === 'C4' ? createComprehensionQuestions(unit, seed) : createCodeQuestions(unit, seed);
  const questions = raw.map(question => {
    const instruction = firstChapter ? chapterInstructions[question.type] : question.instruction;
    if (!instruction) throw new Error('Consigne absente : ' + question.id);
    const instructionAudio = firstChapter ? instructionKey(question.type) : chapter.id + ':consigne:' + instruction;
    const audio = { ...question.audio, [instructionAudio]: { text: instruction } };
    return { ...question, instruction, instructionAudio, audio };
  });
  if (manifest) {
    for (const question of questions) {
      const keys = [question.instructionAudio, question.prompt, question.reference,
        ...question.choices, ...(question.parts ?? [])].filter(Boolean);
      if (keys.some(key => typeof manifest[key] !== 'string')) throw new Error('Audio absent : ' + question.id);
    }
  }
  return questions;
}

export function curriculumAudioSources(chapter) {
  if (chapter.id === 'C1') return chapterAudioSources(chapter);
  const sources = {};
  for (const unit of chapter.units) {
    for (const question of createSourceQuestions(chapter, unit, null, 0)) Object.assign(sources, question.audio);
  }
  return sources;
}
