/* Suivi pour les parents : comptage, persistance, séries jour/semaine, score et export CSV. */
import assert from 'node:assert/strict';
import test from 'node:test';
import { createTracker, menuCatalogue, dayKey, weekStart, TRACKER_KEY, PATH_CATEGORIES } from '../js/learning/tracker.js';
import { CHAPTERS, MENU_ITEMS } from '../js/prototype/model.js';

const memory = () => { const data = new Map(); return { data, getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, String(value)) }; };
const catalogue = menuCatalogue(CHAPTERS, MENU_ITEMS);
const clock = start => { let date = new Date(start); return { now: () => new Date(date), set: value => { date = new Date(value); } }; };

test('the catalogue covers every menu exercise once, in learning-path order', () => {
  assert.equal(catalogue.length, MENU_ITEMS.length);
  assert.equal(new Set(catalogue.map(item => item.id)).size, catalogue.length);
  assert.deepEqual([...new Set(catalogue.map(item => item.category))], PATH_CATEGORIES);
  for (const item of catalogue) assert.ok(item.label && item.label !== item.id, item.id);
  assert.equal(new Set(catalogue.map(item => item.label)).size, catalogue.length, 'every exercise has its own name');
});

test('answers accumulate per day and exercise and survive a new session', () => {
  const storage = memory(), time = clock('2026-11-16T10:00:00');
  const first = createTracker(storage, { now: time.now, catalogue });
  for (let i = 0; i < 8; i++) first.record('voyelles', true);
  first.record('voyelles', false); first.record('words-1', true); first.complete('voyelles');
  time.set('2026-11-17T18:30:00');
  const second = createTracker(storage, { now: time.now, catalogue });
  second.record('voyelles', false); second.record('find-typo', true);
  const third = createTracker(storage, { now: time.now, catalogue });
  assert.deepEqual(third.days(), ['2026-11-16', '2026-11-17']);
  assert.deepEqual(third.snapshot().days['2026-11-16'].voyelles, [8, 1, 1]);
  const vowels = third.exercises().find(item => item.id === 'voyelles');
  assert.equal(vowels.correct, 8); assert.equal(vowels.wrong, 2); assert.equal(vowels.completed, 1); assert.equal(vowels.last, '2026-11-17');
  assert.equal(third.persistent, true);
  assert.ok(!/nom|name/i.test(storage.data.get(TRACKER_KEY)), 'no personal information is stored');
});

test('daily and weekly series end today, fill empty days and filter by family', () => {
  const storage = memory(), time = clock('2026-11-03T09:00:00');
  const tracker = createTracker(storage, { now: time.now, catalogue });
  tracker.record('voyelles', true); tracker.record('words-1', false);
  time.set('2026-11-18T09:00:00'); tracker.record('voyelles', true); tracker.record('voyelles', false);
  time.set('2026-11-19T09:00:00'); tracker.record('sons', true);
  const days = tracker.series({ period: 'day', count: 14 });
  assert.equal(days.length, 14); assert.equal(days.at(-1).start, '2026-11-19'); assert.equal(days[0].start, '2026-11-06');
  assert.deepEqual(days.slice(-2).map(day => [day.correct, day.wrong]), [[1, 1], [1, 0]]);
  assert.equal(days[5].answers, 0); assert.equal(days[5].accuracy, null);
  const weeks = tracker.series({ period: 'week', count: 4 });
  assert.equal(weeks.at(-1).start, dayKey(weekStart(time.now()))); assert.equal(weeks.at(-1).start, '2026-11-16'); assert.equal(weeks.at(-1).end, '2026-11-22');
  assert.deepEqual(weeks.map(week => week.answers), [0, 2, 0, 3]);
  assert.equal(weeks.at(-1).activeDays, 2);
  assert.deepEqual(tracker.series({ period: 'week', count: 4, category: 'words' }).map(week => week.answers), [0, 1, 0, 0]);
  assert.deepEqual(tracker.series({ period: 'day', count: 2, category: 'sounds' }).map(day => day.correct), [0, 1]);
});

test('the path score rewards both accuracy and enough practice, and never exceeds 100', () => {
  const time = clock('2026-11-19T09:00:00'), tracker = createTracker(memory(), { now: time.now, catalogue });
  assert.equal(tracker.score().total, 0);
  for (let i = 0; i < 10; i++) tracker.record('voyelles', true);
  const early = tracker.exercises().find(item => item.id === 'voyelles');
  assert.equal(early.accuracy, 1); assert.equal(early.score, 25, 'ten perfect answers are a quarter of the way');
  for (const item of catalogue) for (let i = 0; i < 200; i++) tracker.record(item.id, true);
  const full = tracker.score();
  assert.equal(full.total, 100); assert.equal(full.started, catalogue.length); assert.equal(full.exercises, catalogue.length);
  assert.deepEqual(full.categories.map(item => item.id), PATH_CATEGORIES);
  time.set('2026-11-20T09:00:00');
  for (let i = 0; i < 60; i++) tracker.record('voyelles', false);
  assert.equal(tracker.exercises().find(item => item.id === 'voyelles').score, 0, 'the most recent days decide the success rate');
  assert.ok(tracker.score().total < 100);
});

test('guided-path chapters are listed apart and do not change the menu score', () => {
  const tracker = createTracker(memory(), { now: clock('2026-11-19T09:00:00').now, catalogue });
  tracker.record('parcours:C1', true, { label: 'Parcours · Les premiers sons', category: 'path' });
  tracker.complete('parcours:C1', { label: 'Parcours · Les premiers sons', category: 'path' });
  const score = tracker.score();
  assert.equal(score.total, 0); assert.equal(score.started, 0);
  assert.equal(score.categories.at(-1).id, 'path'); assert.equal(score.categories.at(-1).answers, 1);
  assert.equal(tracker.exercises().at(-1).label, 'Parcours · Les premiers sons');
});

test('the CSV opens in a French spreadsheet: BOM, semicolons, one line per day and exercise', () => {
  const time = clock('2026-11-18T09:00:00'), tracker = createTracker(memory(), { now: time.now, catalogue });
  tracker.record('voyelles', true); tracker.record('voyelles', true); tracker.record('voyelles', false); tracker.complete('voyelles');
  time.set('2026-11-19T09:00:00'); tracker.record('words-2', false);
  const csv = tracker.toCSV();
  assert.equal(csv.charCodeAt(0), 0xfeff);
  const lines = csv.slice(1).trim().split('\r\n');
  assert.equal(lines[0], 'date;famille;exercice;identifiant;reponses_justes;reponses_fausses;reussite_pourcent;parties_terminees');
  assert.equal(lines.length, 3);
  assert.equal(lines[1], '2026-11-18;Lettres;Les voyelles;voyelles;2;1;67;1');
  assert.match(lines[2], /^2026-11-19;Mots;.*;words-2;0;1;0;0$/);
});

test('damaged or blocked storage never breaks the game', () => {
  const broken = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  const tracker = createTracker(broken, { catalogue });
  tracker.record('voyelles', true);
  assert.equal(tracker.persistent, false);
  tracker.record('voyelles', false);
  assert.equal(tracker.exercises().find(item => item.id === 'voyelles').answers, 2);
  const temporary = createTracker(null, { catalogue });
  temporary.record('voyelles', true);
  temporary.record('voyelles', false);
  temporary.complete('voyelles');
  assert.equal(temporary.exercises().find(item => item.id === 'voyelles').answers, 2);
  assert.equal(temporary.exercises().find(item => item.id === 'voyelles').completed, 1);
  const full = createTracker({ getItem: () => null, setItem() { throw new Error('quota exceeded'); } }, { catalogue });
  full.record('voyelles', true); full.record('voyelles', false);
  assert.equal(full.exercises().find(item => item.id === 'voyelles').answers, 2);
  assert.equal(full.persistent, false);
  const storage = memory(); storage.data.set(TRACKER_KEY, '{"days":{"bad":1,"2026-11-19":{"voyelles":["x",-4,2.9],"sons":"no"}},"labels":7}');
  const cleaned = createTracker(storage, { now: clock('2026-11-19T09:00:00').now, catalogue });
  assert.deepEqual(cleaned.snapshot().days, { '2026-11-19': { voyelles: [0, 0, 2] } });
  assert.doesNotThrow(() => createTracker(null, { catalogue }).record('voyelles', true));
});
