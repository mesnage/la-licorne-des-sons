import { readFileSync, statSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { URL } from 'node:url';
import { createPilotQuestions, createPilotSession, newPilotState, restorePilotState } from '../js/learning/pilot-session.js';

const readJson = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const unit = readJson('../js/data/curriculum.v2.json').units[0];
const manifest = readJson('../audio/manifest.json');

test('the pilot uses twenty distinct local audio prompts across four homogeneous blocks', () => {
  const questions = createPilotQuestions(unit, manifest, 10);
  assert.equal(questions.length, 20);
  assert.equal(new Set(questions.map(question => question.prompt)).size, 20);
  const keys = new Set(questions.flatMap(question => [question.prompt, ...question.choices]));
  for (const key of keys) assert.ok(statSync(new URL('../audio/' + manifest[key], import.meta.url)).size > 0, key);
  const matching = questions.filter(question => question.choices.length);
  assert.deepEqual(matching.map(question => question.answer), [0, 1, 0, 1, 0]);
  assert.deepEqual(createPilotQuestions(unit, manifest, 10), questions);
  assert.deepEqual(createPilotQuestions(unit, manifest, 11).slice(10, 15).map(q => q.answer), [1, 0, 1, 0, 1]);
  const missing = { ...manifest };
  delete missing[matching[0].choices[0]];
  assert.throws(() => createPilotQuestions(unit, missing, 10), /indisponible/);
});

test('errors preserve crystals, corrections count once and the exact question can be resumed', () => {
  const questions = createPilotQuestions(unit, manifest, 42);
  const start = newPilotState(42);
  const session = createPilotSession(questions, start);
  assert.equal(session.answer(2), false);
  assert.equal(session.snapshot().answers.length, 0);
  assert.equal(session.advance(), false);
  assert.equal(session.answer(1), true);
  assert.equal(session.answer(1), null);
  assert.equal(session.snapshot().answers[0], 1);
  const resumed = createPilotSession(questions, restorePilotState(session.snapshot(), questions.length));
  assert.equal(resumed.solved, true);
  assert.equal(resumed.question.id, questions[0].id);
  assert.equal(resumed.advance(), true);
  for (const question of questions.slice(1, 5)) {
    assert.equal(resumed.answer(question.answer), true);
    assert.equal(resumed.advance(), true);
  }
  assert.equal(resumed.mark(1), 1);
  assert.equal(resumed.mark(1), 2);
  assert.equal(resumed.mark(-1), 1);
  const restored = restorePilotState(resumed.snapshot(), questions.length);
  assert.equal(restored.marks, 1);
  assert.equal(restored.cursor, 5);
  const last = createPilotSession(questions, restored);
  for (const question of questions.slice(5)) {
    assert.equal(last.answer(question.answer), true);
    assert.equal(last.advance(), true);
  }
  assert.equal(last.finished, true);
  assert.equal(last.snapshot().answers.length, 20);
  assert.equal(last.snapshot().answers.filter(wrong => wrong === 0).length, 19);
  assert.equal(restorePilotState({ ...last.snapshot(), answers: [] }, questions.length), null);
});
