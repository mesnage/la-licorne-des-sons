// Serve the repository locally and provide Playwright via node_modules or NODE_PATH.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import { createCurriculum } from '../js/learning/curriculum.js';
import { createChapterQuestions } from '../js/learning/chapter-one.js';
import { unitProgressKey } from '../js/learning/pilot-session.js';

const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const chapter = createCurriculum(read('../js/data/curriculum.v2.json')).getChapter('C1');
const { chromium } = createRequire(import.meta.url)('playwright');
const base = process.env.LICORNE_TEST_URL ?? 'http://127.0.0.1:8080/';
const browser = await chromium.launch({ executablePath: process.env.LICORNE_CHROME_PATH });
try {
  const page = await browser.newPage({ viewport: { width: 375, height: 812 }, hasTouch: true, reducedMotion: 'reduce' });
  const errors = [];
  const remote = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => {
    if (new URL(request.url()).origin !== new URL(base).origin) remote.push(request.url());
  });
  await page.addInitScript(() => {
    const start = window.AudioBufferSourceNode.prototype.start;
    window.AudioBufferSourceNode.prototype.start = function (...args) {
      this.playbackRate.value = 12;
      return start.apply(this, args);
    };
  });
  await page.goto(new URL('curriculum-play.html?unite=C1-U02', base).href);
  await page.getByText('Termine l’unité précédente', { exact: false }).waitFor();

  await page.goto(new URL('curriculum.html', base).href);
  await page.getByRole('link', { name: 'Commencer mon aventure' }).click();

  const controls = page.locator('#pilotControls');
  const audioButton = label => controls.getByRole('button', { name: label, exact: true });
  const hear = async label => {
    await audioButton(label).click();
    await page.locator('#pilotControls[aria-busy="false"]').waitFor();
    assert.equal(await page.locator('#pilotAudioStatus').textContent(), '');
  };
  const click = label => audioButton(label).click();
  for (const unit of chapter.units) {
    await page.locator('#pilotUnitName').filter({ hasText: unit.title }).waitFor();
    await page.locator('#pilotPanel').waitFor();
    let seed;
    // Each session chooses its initial option order independently. Read the seed after the first answer.
    for (const [index, item] of createChapterQuestions(chapter, unit.id, null, 0).entries()) {
      await page.locator('#pilotHeading').filter({ hasText: 'Question ' + (item.position + 1) + ' sur 5' }).waitFor();
      if (item.readFirst) {
        assert.equal(await controls.getByRole('button', { name: 'Écouter 1', exact: true }).count(), 0);
        await click('J’ai lu, écouter les options');
      }
      if (item.reference) await hear('Écouter le son');
      if (item.prompt) await hear('Écouter le mot');
      if (item.choices.length) {
        await hear('Écouter 1');
        await hear('Écouter 2');
        // Test the stable ordering for the seed stored after question 1.
        const answer = seed === undefined ? item.answer : (item.answer + seed % 2) % 2;
        await click('Choisir ' + (answer + 1));
        if (seed === undefined && !(await page.locator('#pilotActions .pilot-primary').isVisible())) {
          const retry = audioButton('Choisir ' + (2 - answer));
          if (await retry.isVisible()) await retry.click();
        }
      } else if (item.labels) {
        await click(item.labels[item.answer]);
      } else if (item.type === 'oral_segment') {
        for (let count = 0; count < item.answer; count++) await click('Ajouter un point');
        await click('Vérifier');
      } else {
        await click(item.answer + ' syllabe' + (item.answer === 1 ? '' : 's'));
      }
      const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), unitProgressKey(unit.id));
      seed = stored.session.seed;
      assert.equal(stored.session.answers.length, index + 1, item.id);
      await page.locator('#pilotActions .pilot-primary').click();
    }
    const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), unitProgressKey(unit.id));
    assert.equal(stored.completed, true, unit.id);
    if (unit.position < 12) await page.getByRole('link', { name: 'Unité suivante', exact: true }).click();
    console.log(unit.id + ' terminée');
  }
  await page.getByRole('heading', { name: 'Chapitre terminé !' }).waitFor();
  await page.goto(new URL('curriculum.html', base).href);
  await page.getByText('12 / 12 unités terminées').waitFor();
  await page.getByRole('link', { name: 'Continuer mon aventure' }).waitFor();
  assert.deepEqual(errors, []);
  assert.deepEqual(remote, []);
  console.log('Chapitre complet parcouru dans Chrome, avec les pistes locales et les déverrouillages.');
} finally {
  await browser.close();
}
