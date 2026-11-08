import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { URL } from 'node:url';
import { createCurriculum } from '../js/learning/curriculum.js';
import { createUnitQuestions, curriculumAudioSources } from '../js/learning/curriculum-questions.js';
import { parseCodeForm } from '../js/learning/curriculum-code.js';
import { createPilotSession, newPilotState, restorePilotState } from '../js/learning/pilot-session.js';

const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const curriculum = createCurriculum(read('../js/data/curriculum.v2.json'));
const legacy = read('../audio/manifest.json');

test('the four chapters resolve 1,120 questions and all generated recordings match their manifests', () => {
  const ids = new Set();
  const completed = new Set();
  for (const chapter of curriculum.chapters) {
    const entries = read('../audio/curriculum-' + chapter.id.toLowerCase() + '.json');
    const files = Object.fromEntries(Object.entries(entries).map(([key, track]) => [key, track.file]));
    const sources = curriculumAudioSources(chapter);
    assert.deepEqual(Object.keys(entries).sort(), Object.keys(sources).sort());
    for (const [key, track] of Object.entries(entries)) {
      assert.equal(track.text, sources[key].text);
      assert.equal(track.review, 'pending_human_review');
      if (sources[key].ipa) assert.equal(track.phonemes, sources[key].ipa);
      const contents = readFileSync(new URL('../audio/' + track.file, import.meta.url));
      assert.ok(contents.length > 100);
      assert.equal(createHash('sha256').update(contents).digest('hex'), track.sha256);
    }
    for (const unit of chapter.units) {
      assert.equal(curriculum.getUnitStatus(unit.id, completed), 'available');
      const questions = createUnitQuestions(chapter, unit, { ...legacy, ...files }, 0);
      const session = createPilotSession(questions, newPilotState(0));
      assert.equal(questions.length, 20);
      for (const block of unit.blocks) {
        const items = questions.filter(q => q.id.startsWith(block.id + '-'));
        assert.equal(items.length, 5);
        assert.equal(new Set(items.map(q => q.prompt ?? (q.display + (q.script ? ' manuscrit' : '')))).size, 5, block.id);
      }
      for (const question of questions) {
        ids.add(question.id);
        if (question.readFirst) assert.equal(question.prompt, undefined);
        if (question.oralExpected) {
          const audio = entries[question.prompt].phonemes.replace(/[ˈˌ. ]/g, '');
          const matches = sound => question.type === 'oral_initial' ? audio.startsWith(sound) : audio.includes(sound);
          assert.ok(matches(question.oralExpected), question.id + ' · ' + audio);
          assert.ok(!matches(question.oralDistractor), question.id + ' · distracteur audible dans ' + audio);
        }
        if (question.order) {
          for (const [index] of question.order.entries()) session.toggleTile(index);
          assert.equal(session.orderIsCorrect(), true);
        }
        assert.equal(session.answer(question.answer), true);
        assert.equal(session.advance(), true);
      }
      assert.equal(session.finished, true);
      completed.add(unit.id);
    }
  }
  assert.equal(ids.size, 1120);
  assert.equal(completed.size, 56);
});

test('complex graphèmes remain intact and contextual values respect their unit prerequisites', () => {
  assert.equal(parseCodeForm('f au t euil', 'C3-U17').ipa, 'fotœj');
  assert.deepEqual(parseCodeForm('p oi ss on', 'C3-U08').segments.map(segment => segment.g), ['p','oi','ss','on']);
  assert.throws(() => parseCodeForm('p oi ss on', 'C3-U07'), /non enseigné/);
  assert.throws(() => parseCodeForm('c:k i l', 'C3-U09'), /contexte/);
  assert.throws(() => parseCodeForm('g:ɡ é', 'C3-U11'), /contexte/);
  assert.throws(() => parseCodeForm('f au t euil', 'C3-U16'), /non enseigné/);
});

test('a partially ordered sentence resumes and repeated words are interchangeable', () => {
  const question = { order: ['le','rat','voit','le','chat'], answer: 1, choices: [] };
  let session = createPilotSession([question], newPilotState(1));
  session.toggleTile(3);
  const saved = restorePilotState(session.snapshot(), 1);
  session = createPilotSession([question], saved);
  for (const index of [1, 2, 0, 4]) session.toggleTile(index);
  assert.equal(session.orderIsCorrect(), true);
  assert.equal(session.answer(1), true);
  assert.equal(session.advance(), true);
  assert.deepEqual(session.snapshot().order, []);
});
