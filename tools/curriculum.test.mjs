import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { URL } from 'node:url';
import { createCurriculum } from '../js/learning/curriculum.js';

const source = readFileSync(new URL('../js/data/curriculum.v2.json', import.meta.url), 'utf8');
const data = JSON.parse(source);

test('all 74 draft units and their 296 blocks retain stable IDs and order', () => {
  const curriculum = createCurriculum(data);
  assert.deepEqual(curriculum.chapters.map(chapter => chapter.units.length), [12, 14, 18, 12, 6, 6, 6]);
  const units = curriculum.chapters.flatMap(chapter => chapter.units);
  const blocks = units.flatMap(unit => unit.blocks);
  assert.equal(new Set(units.map(unit => unit.id)).size, 74);
  assert.equal(new Set(blocks.map(block => block.id)).size, 296);
  assert.equal(blocks.reduce((total, block) => total + block.questionCount, 0), 1480);
  assert.ok(units.every(unit => unit.status === 'pedagogical_draft' && unit.auditRequired === true));
  assert.equal(curriculum.getUnit('C1-U08').blocks[3].id, 'C1-U08-B4');
  assert.equal(curriculum.getChapter('C4').units.at(-1).id, 'C4-U12');
  assert.equal(curriculum.getUnit('C5-U01').prerequisiteUnitId, 'C4-U12');
  assert.equal(curriculum.getUnit('C6-U01').prerequisiteUnitId, 'C5-U06');
  assert.equal(curriculum.getUnit('C7-U01').prerequisiteUnitId, 'C6-U06');
});

test('completion unlocks the next unit across chapter boundaries', () => {
  const curriculum = createCurriculum(data);
  const completed = new Set();
  const units = curriculum.chapters.flatMap(chapter => chapter.units);
  for (const [index, unit] of units.entries()) {
    assert.equal(curriculum.getUnitStatus(unit.id, completed), 'available');
    const next = units[index + 1];
    if (next) assert.equal(curriculum.getUnitStatus(next.id, completed), 'upcoming');
    completed.add(unit.id);
    assert.equal(curriculum.getUnitStatus(unit.id, completed), 'completed');
  }
  assert.equal(curriculum.getUnitStatus('absent', completed), undefined);
});

test('rejects bad IDs, out-of-order records, invalid prerequisites and malformed blocks', () => {
  const cases = [
    [draft => { draft.chapters[1].id = draft.chapters[0].id; }, /C2/],
    [draft => { draft.units[0].position = 2; }, /C1-U01/],
    [draft => { draft.units[1].id = draft.units[0].id; }, /C1-U02/],
    [draft => { draft.units[0].prerequisiteUnitId = draft.units[1].id; }, /C1-U01/],
    [draft => { draft.units[1].prerequisiteUnitId = 'absent'; }, /C1-U02/],
    [draft => { draft.units[0].blocks.pop(); }, /C1-U01/],
    [draft => { draft.units[0].blocks[1].id = draft.units[0].blocks[0].id; }, /C1-U01-B2/],
    [draft => { draft.units[0].blocks[0].questionCount = 4; }, /C1-U01-B1/],
    [draft => { draft.units[0].blocks[0].exerciseType = 'toString'; }, /C1-U01-B1/],
    [draft => { draft.units[0].blocks[0].isHomogeneous = false; }, /C1-U01-B1/]
  ];
  for (const [mutate, expected] of cases) {
    const draft = JSON.parse(source);
    mutate(draft);
    assert.throws(() => createCurriculum(draft), expected);
  }
});
