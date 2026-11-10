import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { URL } from 'node:url';
import { exerciseVersion, simpleExercise, simpleProgrammeVersion } from '../js/data/curriculum-simple.js';
import { createCurriculum } from '../js/learning/curriculum.js';
import { audibleKeys, createSimpleQuestions } from '../js/learning/curriculum-simple.js';
import { createPilotSession, newPilotState, restoreProgrammeState } from '../js/learning/pilot-session.js';

const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const curriculum = createCurriculum(read('../js/data/curriculum.v2.json'));
const tracksFor = chapter => read('../audio/curriculum-' + chapter.id.toLowerCase() + '-robin.json');
const manifest = chapter => Object.fromEntries(Object.entries(tracksFor(chapter)).map(([key, track]) => [key, track.file]));

test('all 74 units use the same exercise and instruction for four blocks of five', () => {
  for (const chapter of curriculum.chapters) {
    const files = manifest(chapter);
    const tracks = tracksFor(chapter);
    for (const unit of chapter.units) {
      for (const seed of [0, 1, 211]) {
        const questions = createSimpleQuestions(chapter, unit, files, seed);
        const exercise = simpleExercise(unit);
        assert.equal(questions.length, 20);
        assert.deepEqual(new Set(questions.map(q => q.type)), new Set([exercise.type]));
        assert.deepEqual(new Set(questions.map(q => q.instruction)), new Set([exercise.instruction]));
        assert.deepEqual(new Set(questions.map(q => q.instructionAudio)).size, 1);
        const session = createPilotSession(questions, newPilotState(seed));
        if (chapter.id === 'C5') assert.equal(new Set(questions.map(q => q.display)).size, 20);
        if (chapter.id === 'C6') {
          assert.equal(new Set(questions.map(q => q.display)).size, 10);
          for (const [index, q] of questions.slice(0, 10).entries()) {
            assert.equal(q.display, questions[index + 10].display);
            assert.equal(q.answer, 1 - questions[index + 10].answer);
          }
        }
        for (const block of unit.blocks) {
          const items = questions.filter(q => q.id.startsWith(block.id + '-'));
          assert.equal(items.length, 5, block.id);
          assert.equal(new Set(items.map(q => q.word ?? q.context ?? (q.display === undefined
            ? q.prompt : q.display + (['C4-U05','C4-U06'].includes(unit.id) ? q.labels.slice().sort().join('|') : '')))).size, 5, block.id);
          for (const q of items) {
            assert.ok(!q.parts && !q.reference);
            if (chapter.id === 'C2') {
              assert.equal(q.order.length, 2);
              assert.equal(q.order.join('').toLowerCase(), q.word.replaceAll(' ', ''));
              assert.ok(q.prompt && !q.choices.length);
              for (const index of q.order.keys()) session.toggleTile(index);
              assert.equal(session.orderIsCorrect(), true);
            }
            if (chapter.id === 'C3') {
              if (unit.id === 'C3-U02') assert.ok(['tante','encore','maman','panda','ruban'].includes(q.word));
              if (unit.id === 'C3-U03') assert.ok(['pin','main','plein','rein','pain'].includes(q.word));
              if (unit.id === 'C3-U18') assert.ok(['bon','maman','pin','moi','soleil'].includes(q.word));
              assert.equal((q.blank[0] + q.labels[q.answer] + q.blank[1]).toLowerCase(), q.word);
              assert.equal(q.labels.length, 2);
              assert.ok(q.prompt && !q.choices.length);
            }
            if (chapter.id === 'C4') {
              assert.ok(!/\p{Extended_Pictographic}/u.test([q.display, ...q.labels].join(' ')), q.id);
            }
            if (q.modelAudio) assert.equal(tracks[q.modelAudio].text, q.sentence ?? q.display);
            if (chapter.id === 'C7') {
              assert.equal(q.order.length, 3 + (unit.position - 1) % 3);
              assert.equal(q.display, unit.position <= 3 ? q.sentence : undefined);
              assert.equal(q.prompt, unit.position > 3 ? q.modelAudio : undefined);
              assert.deepEqual([...q.tiles].sort(), [...q.order.keys()]);
              assert.notDeepEqual(q.tiles.map(index => q.order[index]), q.order);
              for (const index of q.order.keys()) session.toggleTile(index);
              assert.equal(session.orderIsCorrect(), true);
            }
            if (chapter.id === 'C6') {
              assert.equal(q.pictures.length, 2);
              assert.notDeepEqual(q.pictures[0], q.pictures[1]);
              assert.equal(session.answer(2), null);
            }
            assert.equal(session.answer(q.answer), true);
            assert.equal(session.advance(), true);
          }
        }
        assert.equal(session.finished, true);
      }
    }
  }
});

test('the first unit uses twenty different recorded words and only two number buttons per question', () => {
  const chapter = curriculum.getChapter('C1');
  const questions = createSimpleQuestions(chapter, chapter.units[0], manifest(chapter), 0);
  assert.equal(new Set(questions.map(question => question.prompt)).size, 20);
  assert.ok(questions.slice(0, 5).every(question => question.counts.every(count => count <= 2)));
  for (const q of questions) {
    assert.equal(q.counts.length, 2);
    assert.ok(q.counts.includes(q.answer));
    assert.ok(q.instruction.includes('Combien de syllabes entends-tu ?'));
  }
});

test('the new sequence restarts old partial sessions and retains completed units', () => {
  const old = { version: 1, completed: false, session: { ...newPilotState(0), cursor: 2, answers: [0, 1] } };
  assert.equal(restoreProgrammeState(old, 20), null);
  const finished = { version: 1, completed: true, session: { ...newPilotState(0), cursor: 20, answers: Array(20).fill(0) } };
  assert.equal(restoreProgrammeState(finished, 20).cursor, 20);
  assert.equal(restoreProgrammeState({ ...old, version: simpleProgrammeVersion }, 20).cursor, 2);
  const earlier = { ...old, version: 2 };
  assert.equal(restoreProgrammeState(earlier, 20, exerciseVersion(curriculum.getUnit('C1-U01'))).cursor, 2);
  assert.equal(restoreProgrammeState(earlier, 20, exerciseVersion(curriculum.getUnit('C2-U01'))), null);
});


test('chapters 2 through 7 have a complete local Robin manifest, including optional spoken answers', () => {
  for (const chapter of curriculum.chapters.slice(1)) {
    const tracks = tracksFor(chapter);
    const files = Object.fromEntries(Object.entries(tracks).map(([key, track]) => [key, track.file]));
    const used = new Set();
    for (const unit of chapter.units) {
      for (const seed of [0, 1, 27]) {
        for (const q of createSimpleQuestions(chapter, unit, files, seed)) {
          audibleKeys(q).forEach(key => used.add(key));
        }
      }
    }
    assert.deepEqual([...used].sort(), Object.keys(tracks).sort(), chapter.id);
    for (const track of Object.values(tracks)) {
      assert.equal(track.speaker, 'robin');
      assert.equal(track.provider, 'elevenlabs');
      const audio = readFileSync(new URL('../audio/' + track.file, import.meta.url));
      assert.equal(createHash('sha256').update(audio).digest('hex'), track.sha256);
    }
  }
});
