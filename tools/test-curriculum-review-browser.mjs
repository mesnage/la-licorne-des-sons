// Run against the static server. Playwright can be supplied via NODE_PATH.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import { createCurriculum } from '../js/learning/curriculum.js';
import { createSimpleQuestions } from '../js/learning/curriculum-simple.js';
import { chapterPlayUrl } from '../js/learning/chapter-one.js';
import { unitProgressKey } from '../js/learning/pilot-session.js';

const { chromium } = createRequire(import.meta.url)('playwright');
const catalogue = createCurriculum(JSON.parse(readFileSync(new URL('../js/data/curriculum.v2.json', import.meta.url))));
const base = process.env.LICORNE_TEST_URL ?? 'http://127.0.0.1:8080/';
const browser = await chromium.launch({ executablePath: process.env.LICORNE_CHROME_PATH });
try {
  const page = await browser.newPage({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    const start = window.AudioBufferSourceNode.prototype.start;
    window.AudioBufferSourceNode.prototype.start = function (...args) {
      this.playbackRate.value = 12;
      return start.apply(this, args);
    };
  });

  await page.goto(new URL('curriculum-play.html?unite=C7-U06&bloc=4', base).href);
  await page.getByText('Termine l’unité précédente', { exact: false }).waitFor();
  await page.goto(new URL('curriculum.html?test=1', base).href);
  await page.getByText('Toutes les unités et tous les blocs', { exact: false }).waitFor();

  for (const chapter of catalogue.chapters) {
    await page.evaluate(id => { location.hash = id; }, chapter.id);
    await page.getByRole('heading', { level: 1, name: chapter.title }).waitFor();
    assert.equal(await page.locator('.curriculum-unit[data-status="available"]').count(), chapter.units.length);
    for (const unit of chapter.units) {
      await page.evaluate(id => { location.hash = id; }, unit.id);
      await page.getByRole('heading', { level: 2, name: unit.title, exact: true }).waitFor();
      assert.equal(await page.getByRole('link', { name: 'Jouer cette unité' }).getAttribute('href'), chapterPlayUrl(unit.id, true));
      for (const block of unit.blocks) {
        assert.equal(await page.getByRole('link', { name: 'Tester le bloc ' + block.position }).getAttribute('href'),
          chapterPlayUrl(unit.id, true, block.position));
      }
    }
  }

  await page.getByRole('link', { name: 'Construire d’autres phrases' }).click();
  await page.getByText('Atelier conseillé', { exact: true }).waitFor();
  const activity = page.locator('[data-activity-id="sentence-listen-5"]');
  await activity.click();
  await page.locator('#adventureQuestion').waitFor();
  await page.locator('#adventureHome').click();
  await page.getByRole('link', { name: 'Retour à mon étape' }).click();
  await page.getByRole('heading', { name: 'À l’écoute · 5 mots' }).waitFor();
  assert.ok(new URL(page.url()).searchParams.has('test'));

  await page.evaluate(() => { location.hash = 'C4-U12'; });
  await page.getByRole('heading', { level: 2, name: 'Je lis ma première histoire' }).waitFor();
  await page.getByRole('link', { name: 'Tester le bloc 4' }).click();
  await page.getByRole('heading', { level: 1, name: 'Je lis ma première histoire' }).waitFor();
  await page.getByRole('heading', { name: 'Bloc 4 sur 4 · Question 1 sur 5' }).waitFor();
  assert.equal(await page.locator('#pilotCount').textContent(), '0 / 5');
  await page.getByRole('link', { name: 'La carte des unités' }).click();
  await page.getByRole('heading', { level: 2, name: 'Je lis ma première histoire' }).waitFor();

  const id = 'C1-U01';
  const key = unitProgressKey(id, true, 3);
  await page.evaluate(key => localStorage.setItem(key, JSON.stringify({
    version: 2, completed: false, session: { seed: 0, cursor: 0, answers: [], wrong: 0, marks: 0 }
  })), key);
  await page.goto(new URL(chapterPlayUrl(id, true, 3), base).href);
  const questions = createSimpleQuestions(catalogue.getChapter('C1'), catalogue.getUnit(id), null, 0).slice(10, 15);
  for (const question of questions) {
    await page.getByRole('heading', { name: 'Bloc 3 sur 4 · Question ' + (question.position + 1) + ' sur 5' }).waitFor();
    await page.getByRole('button', { name: 'Écouter le mot' }).click();
    await page.getByRole('button', { name: question.answer + ' syllabes', exact: true }).click();
  }
  await page.getByRole('heading', { name: 'Bloc 3 testé !' }).waitFor();
  assert.equal(await page.getByRole('link', { name: 'Tester le bloc suivant' }).getAttribute('href'), chapterPlayUrl(id, true, 4));
  const records = await page.evaluate(keys => keys.map(key => JSON.parse(localStorage.getItem(key))),
    [key, unitProgressKey(id, true), unitProgressKey(id)]);
  assert.equal(records[0].session.answers.length, 5);
  assert.equal(records[0].completed, true);
  assert.deepEqual(records.slice(1), [null, null]);
  assert.deepEqual(errors, []);
  console.log('74 unités et 296 liens de blocs vérifiés. Un bloc joué jusqu’au bout, avec sauvegarde séparée.');
} finally {
  await browser.close();
}
