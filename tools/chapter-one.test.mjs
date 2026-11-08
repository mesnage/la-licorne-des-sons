import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { URL } from 'node:url';
import { sounds, units } from '../js/data/curriculum-chapter-one.js';
import { chapterAudioSources, createChapterQuestions, instructionKey } from '../js/learning/chapter-one.js';
import { createSimpleQuestions } from '../js/learning/curriculum-simple.js';
import { createCurriculum } from '../js/learning/curriculum.js';
import { createPilotSession, newPilotState, readPilotProgress, unitProgressKey } from '../js/learning/pilot-session.js';

const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const chapter = createCurriculum(read('../js/data/curriculum.v2.json')).getChapter('C1');
const audio = read('../audio/curriculum-c1.json');
const manifest = { ...read('../audio/manifest.json'), ...Object.fromEntries(Object.entries(audio).map(([key, track]) => [key, track.file])) };

test('all 12 units have 20 playable questions and every referenced clip is local', () => {
  const expected = chapterAudioSources(chapter);
  assert.deepEqual(Object.keys(audio).sort(), Object.keys(expected).sort());
  for (const [key, track] of Object.entries(audio)) {
    assert.ok(track.file.startsWith('curriculum-c1/') && track.file.endsWith('.mp3'));
    assert.equal(track.review, 'pending_human_review');
    assert.equal(track.text, expected[key].text);
    if (expected[key].ipa) assert.equal(track.phonemes, expected[key].ipa);
    const buffer = readFileSync(new URL('../audio/' + track.file, import.meta.url));
    assert.ok(buffer.length > 100);
    assert.equal(createHash('sha256').update(buffer).digest('hex'), track.sha256);
  }
  const ids = new Set();
  for (const unit of chapter.units) {
    const questions = createChapterQuestions(chapter, unit.id, manifest, 0);
    assert.equal(questions.length, 20);
    const session = createPilotSession(questions, newPilotState(0));
    for (const question of questions) {
      ids.add(question.id);
      assert.ok(manifest[instructionKey(question.type)]);
      assert.equal(session.answer(question.answer), true);
      assert.equal(session.advance(), true);
    }
    assert.equal(session.finished, true);
  }
  assert.equal(ids.size, 240);
});

test('oral targets match the annotated speech and written tasks keep the audio answer gated', () => {
  for (const [id, blocks] of Object.entries(units)) {
    for (const rows of blocks) {
      for (const row of rows) {
        if (!Array.isArray(row)) continue;
        const [word, g, position] = row;
        const sound = sounds[g]?.[0];
        const phonemes = audio['C1:oral:' + word].phonemes.replace(/[ˈˌ. ]/g, '');
        if (g === 'non') assert.ok(!phonemes.startsWith(sounds.l[0]), word);
        else if (position === undefined || position === 0) assert.ok(phonemes.startsWith(sound), word);
        else if (position === 1) assert.ok(phonemes.slice(1, -1).includes(sound), word);
        else assert.ok(phonemes.endsWith(sound), word);
      }
    }
    for (const question of createChapterQuestions(chapter, id, manifest, 0)) {
      if (!question.type.startsWith('decode_')) continue;
      assert.equal(question.readFirst, true);
      assert.equal(question.prompt, undefined);
      assert.ok(question.choices[question.answer].endsWith(':' + question.display));
    }
  }
  const wordsL = createChapterQuestions(chapter, 'C1-U08', manifest, 0).slice(15);
  assert.deepEqual(wordsL.map(q => q.display), ['fil', 'salé', 'lavé', 'fou', 'vu']);
  const missing = { ...manifest };
  delete missing['C1:écrit:salé'];
  assert.throws(() => createChapterQuestions(chapter, 'C1-U08', missing, 0), /Audio absent/);
});

test('the existing first-unit save is reused and later units store progress separately', () => {
  const values = new Map([
    ['licorne.curriculum.pilot.v1', JSON.stringify({ version: 1, completed: true })],
    [unitProgressKey('C1-U02'), JSON.stringify({ version: 1, completed: false, session: { cursor: 4 } })]
  ]);
  const storage = { getItem: key => values.get(key) };
  assert.equal(readPilotProgress(storage, 'C1-U01').completed, true);
  assert.equal(readPilotProgress(storage, 'C1-U02').session.cursor, 4);
  assert.equal(readPilotProgress(storage, 'C1-U03'), null);
});


test('all audible Chapter 1 questions and instructions use only Robin audio from ElevenLabs', () => {
  const robin = read('../audio/curriculum-c1-robin.json');
  const playable = Object.fromEntries(Object.entries(robin).map(([key, track]) => [key, track.file]));
  const used = new Set();
  for (const unit of chapter.units) {
    for (const seed of [0, 1, 7, 24, 137]) {
      const questions = createSimpleQuestions(chapter, unit, playable, seed);
      for (const question of questions) {
        for (const key of [question.instructionAudio, question.prompt, question.context, ...question.choices].filter(Boolean)) {
          used.add(key);
        }
      }
    }
  }
  assert.deepEqual([...used].sort(), Object.keys(robin).sort());
  for (const [key, track] of Object.entries(robin)) {
    assert.equal(track.speaker, 'robin');
    assert.equal(track.provider, 'elevenlabs');
    const data = readFileSync(new URL('../audio/' + track.file, import.meta.url));
    assert.equal(createHash('sha256').update(data).digest('hex'), track.sha256);
    if (key.startsWith('P:robin:')) {
      assert.equal(track.file, manifest[key]);
      assert.equal(track.review, 'approved_existing_phoneme');
    } else {
      assert.ok(track.file.startsWith('curriculum-c1-robin/'));
      assert.equal(track.language, 'fr');
      assert.equal(track.review, 'pending_human_review');
    }
  }
});
