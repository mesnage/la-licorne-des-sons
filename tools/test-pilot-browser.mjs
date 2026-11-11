// Run against a local server with Playwright available through node_modules or NODE_PATH.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import { pilotProgressKey } from '../js/learning/pilot-session.js';

const { chromium } = createRequire(import.meta.url)('playwright');
const base = process.env.LICORNE_TEST_URL ?? 'http://127.0.0.1:8080/';
const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const manifest = read('../audio/curriculum-c1-robin.json');
const browser = await chromium.launch({ executablePath: process.env.LICORNE_CHROME_PATH });
try {
  const page = await browser.newPage({ viewport: { width: 320, height: 568 }, hasTouch: true, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const save = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), pilotProgressKey);
  const heading = page.locator('#pilotHeading');
  const count = page.locator('#pilotCount');
  const audioStatus = page.locator('#pilotAudioStatus');
  const listen = () => page.getByRole('button', { name: 'Écouter le mot' }).click();
  const chooseCount = value => page.getByRole('button', { name: value + ' syllabe' + (value === 1 ? '' : 's'), exact: true });

  await page.addInitScript(key => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify({
        version: 1, completed: false, session: { seed: 0, cursor: 3, answers: [0, 0, 0], wrong: 0, marks: 2 }
      }));
    }
  }, pilotProgressKey);
  await page.goto(new URL('curriculum.html#C1-U01', base).href);
  await page.getByRole('link', { name: 'Jouer cette unité' }).click();
  await heading.filter({ hasText: 'Question 1 sur 5' }).waitFor();
  assert.ok(await page.getByText('L’exercice a changé', { exact: false }).isVisible());
  assert.equal(await count.textContent(), '0 / 20');
  assert.equal(await page.locator('.pilot-counts button').count(), 2);
  assert.equal(await chooseCount(1).isDisabled(), true);
  assert.equal(await page.getByRole('button', { name: 'Ajouter un point' }).count(), 0);

  const firstMp3 = '**/audio/' + manifest['C1:oral:chat'].file;
  await page.route(firstMp3, route => route.abort());
  await listen();
  await audioStatus.filter({ hasText: 'indisponible' }).waitFor();
  assert.equal(await chooseCount(1).isDisabled(), true);
  await page.unroute(firstMp3);
  await listen();
  await chooseCount(2).click();
  assert.equal(await count.textContent(), '0 / 20');
  await chooseCount(2).click();
  await page.getByRole('button', { name: 'Un indice' }).waitFor();
  await chooseCount(1).click();
  assert.ok(await heading.evaluate(node => node === document.activeElement));
  assert.equal(await page.locator('#pilotActions button').count(), 0);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.getByRole('dialog').waitFor();
  await page.waitForTimeout(1100);
  assert.match(await heading.textContent(), /Un cristal de plus/);
  assert.equal(await count.textContent(), '1 / 20');
  const solved = await save();
  assert.equal(solved.version, 2);
  assert.equal(solved.session.answers[0], 2);
  assert.equal(solved.session.cursor, 0);
  await page.getByRole('button', { name: 'Reprendre', exact: true }).click();
  await heading.filter({ hasText: 'Question 2 sur 5' }).waitFor();
  assert.ok(await heading.evaluate(node => node === document.activeElement));

  await page.evaluate(({ key, solved }) => localStorage.setItem(key, JSON.stringify(solved)), { key: pilotProgressKey, solved });
  await page.reload();
  await heading.filter({ hasText: 'Un cristal de plus' }).waitFor();
  assert.equal(await count.textContent(), '1 / 20');
  await heading.filter({ hasText: 'Question 2 sur 5' }).waitFor();
  assert.equal((await save()).session.cursor, 1);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.getByRole('dialog').waitFor();
  await page.getByRole('button', { name: 'Reprendre', exact: true }).click();
  assert.equal(await page.locator('.pilot-counts button').count(), 2);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.getByRole('link', { name: 'Retour à mon étape' }).click();
  await page.getByRole('link', { name: 'Reprendre l’unité' }).waitFor();
  assert.ok(new URL(page.url()).hash === '#C1-U01');
  assert.deepEqual(errors, []);
  console.log('Syllabes : deux choix, migration, relance audio, correction, pause et reprise.');
} finally {
  await browser.close();
}
