// Serve the repository locally and provide Playwright via node_modules or NODE_PATH.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const base = process.env.LICORNE_TEST_URL ?? 'http://127.0.0.1:8080/';
const catalogue = JSON.parse(readFileSync(new URL('../js/data/curriculum.v2.json', import.meta.url), 'utf8'));
const browser = await chromium.launch({ executablePath: process.env.LICORNE_CHROME_PATH });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const requests = [];
  page.on('request', request => requests.push(request.url()));

  await page.goto(new URL('index.html?debug', base).href);
  await page.waitForFunction(() => window.__adventure?.state().ready);
  const adventureTile = page.getByRole('link', { name: /Parcours d’aventure/ });
  for (const [width, height] of [[320, 568], [375, 812], [430, 932], [844, 390], [1024, 768]]) {
    await page.setViewportSize({ width, height });
    const [tile, chapters] = await Promise.all([adventureTile.boundingBox(), page.locator('#chapterTiles').boundingBox()]);
    assert.ok(tile && chapters && tile.y < chapters.y);
    assert.ok(Math.abs(tile.width - chapters.width) < 2 && tile.height >= 44);
    assert.ok(tile.x >= 0 && tile.x + tile.width <= width && tile.y + tile.height <= height);
    assert.equal(await page.locator('#chapterTiles [data-chapter]:visible').count(), 4);
  }
  await adventureTile.focus();
  await page.keyboard.press('Enter');
  await page.getByRole('heading', { name: 'Mon parcours de lecture' }).waitFor();
  assert.equal(await page.locator('.curriculum-card').count(), 6);
  assert.ok(await page.getByText('Version pilote', { exact: false }).isVisible());

  for (const [width, height] of [[320, 568], [375, 812], [430, 932], [768, 1024], [1024, 768], [844, 390]]) {
    await page.setViewportSize({ width, height });
    await page.locator('.curriculum-card').first().focus();
    await page.keyboard.press('Enter');
    await page.getByRole('heading', { name: 'Les premiers sons' }).waitFor();
    assert.equal(await page.locator('h1').evaluate(node => node === document.activeElement), true);
    assert.equal(await page.locator('[data-status="available"]').count(), 1);
    assert.equal(await page.locator('[data-status="upcoming"]').count(), 11);
    assert.ok(await page.locator('[data-unit-id="C1-U08"]').evaluate(node => node.getBoundingClientRect().height >= 44));
    await page.locator('[data-unit-id="C1-U08"]').click();
    await page.getByRole('heading', { name: 'Le son /l/ : L' }).waitFor();
    assert.equal(await page.locator('#curriculumUnitTitle').evaluate(node => node === document.activeElement), true);
    assert.equal(await page.locator('[data-block-id]').count(), 4);
    assert.equal(await page.getByText(/Bloc [1-4] · 5 questions/).count(), 4);
    assert.equal(await page.locator('.curriculum-units').isVisible(), width >= 768);
    assert.ok(await page.locator('[data-block-id]').evaluateAll(nodes =>
      nodes.every(node => node.getBoundingClientRect().right <= window.innerWidth && node.scrollWidth <= node.clientWidth)));
    assert.equal(await page.getByRole('button').count(), 0);
    await page.goBack();
    await page.locator('.curriculum-map:not(.has-unit)').waitFor();
    await page.getByRole('link', { name: 'Les chapitres' }).click();
    await page.locator('.curriculum-card').first().waitFor();
  }

  for (const unit of catalogue.units) {
    await page.evaluate(id => { location.hash = id; }, unit.id);
    await page.locator('[data-block-id="' + unit.blocks[0].id + '"]').waitFor();
    assert.deepEqual(await page.locator('[data-block-id]').evaluateAll(nodes =>
      nodes.map(node => node.dataset.blockId)), unit.blocks.map(block => block.id));
  }
  await page.reload();
  await page.getByRole('heading', { name: catalogue.units.at(-1).title, exact: true }).waitFor();
  await page.evaluate(() => { location.hash = 'inconnu'; });
  await page.getByRole('heading', { name: 'Mon parcours de lecture' }).waitFor();
  await page.getByRole('link', { name: 'Jouer aux activités actuelles' }).click();
  await page.locator('[data-chapter="letters"]').click();
  assert.equal(await adventureTile.isVisible(), false);
  await page.locator('[data-activity-id="voyelles"]').click();
  await page.locator('#adventureQuestion').waitFor();

  assert.deepEqual(errors, []);
  assert.ok(requests.every(request => new URL(request).origin === new URL(base).origin));
  console.log('Aperçu V2 : 68 unités, six chapitres, clavier, liens directs et retour au jeu Phaser.');
} finally {
  await browser.close();
}
