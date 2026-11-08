// Serve the repository locally and provide Playwright via node_modules or NODE_PATH.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import { createCurriculum } from '../js/learning/curriculum.js';
import { createChapterQuestions } from '../js/learning/chapter-one.js';
import { pilotProgressKey } from '../js/learning/pilot-session.js';

const { chromium } = createRequire(import.meta.url)('playwright');
const base = process.env.LICORNE_TEST_URL ?? 'http://127.0.0.1:8080/';
const readJson = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const catalogue = createCurriculum(readJson('../js/data/curriculum.v2.json'));
const manifest = Object.fromEntries(Object.entries(readJson('../audio/curriculum-c1.json')).map(([id, clip]) => [id, clip.file]));

const browser = await chromium.launch({ executablePath: process.env.LICORNE_CHROME_PATH });
try {
  const page = await browser.newPage({ viewport: { width: 320, height: 568 }, hasTouch: true, reducedMotion: 'reduce' });
  const errors = [];
  const requests = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => requests.push(request.url()));
  const save = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), pilotProgressKey);
  const heading = page.locator('#pilotHeading');
  const count = page.locator('#pilotCount');
  const audioStatus = page.locator('#pilotAudioStatus');
  const listen = () => page.getByRole('button', { name: 'Écouter le mot' }).click();
  const waitForAudio = () => page.locator('#pilotControls[aria-busy="false"]').waitFor();
  const chooseCount = value => page.getByRole('button', { name: value + ' syllabe' + (value === 1 ? '' : 's'), exact: true });
  const next = () => page.getByRole('button', { name: /Question suivante|Commencer le bloc suivant|Entrer dans le château/ }).click();

  await page.goto(new URL('curriculum.html#C1-U01', base).href);
  await page.getByRole('link', { name: 'Jouer cette unité' }).click();
  await heading.filter({ hasText: 'Question 1 sur 5' }).waitFor();
  await page.locator('#pilotWorld[data-phaser-version] canvas').waitFor();
  assert.equal(await chooseCount(1).isDisabled(), true);

  const firstMp3 = '**/audio/' + manifest['C1:oral:chat'];
  await page.route(firstMp3, route => route.abort());
  await listen();
  await audioStatus.filter({ hasText: 'indisponible' }).waitFor();
  assert.equal(await chooseCount(1).isDisabled(), true);
  await page.unroute(firstMp3);
  await listen();
  await chooseCount(2).click();
  assert.equal(await count.textContent(), '0 / 20');
  await chooseCount(2).click();
  await page.getByRole('button', { name: 'Écouter avec un indice' }).waitFor();
  await chooseCount(1).click();
  assert.equal(await count.textContent(), '1 / 20');
  assert.equal((await save()).session.answers[0], 2);
  await page.reload();
  await heading.filter({ hasText: 'Un cristal de plus' }).waitFor();
  assert.equal(await count.textContent(), '1 / 20');
  await next();

  const questions = createChapterQuestions(catalogue.getChapter('C1'), 'C1-U01', manifest, (await save()).session.seed);
  for (const [index, question] of questions.entries()) {
    if (index === 0) continue;
    await listen();
    if (question.type === 'oral_segment') {
      const add = page.getByRole('button', { name: 'Ajouter un point' });
      for (let marks = 0; marks < question.answer; marks++) await add.click();
      if (index === 5) {
        await page.getByRole('button', { name: 'Pause', exact: true }).click();
        await page.getByRole('dialog').waitFor();
        await page.getByRole('button', { name: 'Reprendre', exact: true }).click();
        await page.reload();
        assert.equal(await page.locator('.pilot-marks').textContent(), '●');
        await listen();
      }
      await page.getByRole('button', { name: 'Vérifier' }).click();
    } else if (question.choices.length) {
      // Wait for each recording to finish before asking for the next one.
      await waitForAudio();
      await page.getByRole('button', { name: 'Écouter 1', exact: true }).click();
      await waitForAudio();
      await page.getByRole('button', { name: 'Écouter 2', exact: true }).click();
      await page.getByRole('button', { name: 'Choisir ' + (question.answer + 1), exact: true }).click();
    } else {
      await chooseCount(question.answer).click();
    }
    assert.equal(await count.textContent(), (index + 1) + ' / 20');
    if (index === 9) assert.equal((await save()).completed, false);
    await next();
  }

  await heading.filter({ hasText: 'Bienvenue au château' }).waitFor();
  assert.equal((await save()).completed, true);
  assert.match(await page.locator('#pilotFeedback').textContent(), /19 réponses justes/);
  assert.ok(await page.locator('.pilot-panel').evaluate(node => node.scrollWidth <= node.clientWidth));
  await page.getByRole('link', { name: 'La carte des unités' }).click();
  await page.locator('[data-unit-id="C1-U01"][data-status="completed"]').waitFor();
  await page.locator('[data-unit-id="C1-U02"][data-status="available"]').click();
  await page.getByRole('link', { name: 'Jouer cette unité' }).waitFor();

  await page.goto(new URL('curriculum-play.html?renderer=canvas', base).href);
  await heading.filter({ hasText: 'Bienvenue au château' }).waitFor();
  await page.locator('#pilotWorld[data-phaser-version] canvas').waitFor();
  await page.getByRole('button', { name: 'Rejouer l’unité' }).click();
  assert.equal(await count.textContent(), '0 / 20');
  assert.equal((await save()).completed, true);
  assert.deepEqual(errors, []);
  assert.ok(requests.every(request => new URL(request).origin === new URL(base).origin));
  console.log('Pilote : 20 questions, échec audio récupérable, reprise, correction, château et rejeu.');
} finally {
  await browser.close();
}
