// Run one chapter at a time against a local server, using real Web Audio at a faster rate.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import { createCurriculum } from '../js/learning/curriculum.js';
import { exerciseVersion } from '../js/data/curriculum-simple.js';
import { createSimpleQuestions } from '../js/learning/curriculum-simple.js';
import { chapterMapUrl, chapterPlayUrl } from '../js/learning/chapter-one.js';
import { unitProgressKey } from '../js/learning/pilot-session.js';

const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const catalogue = createCurriculum(read('../js/data/curriculum.v2.json'));
const chapter = catalogue.getChapter(process.argv[2] ?? 'C4');
const all = catalogue.chapters.flatMap(item => item.units);
const base = process.env.LICORNE_TEST_URL ?? 'http://127.0.0.1:8080/';
const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch({ executablePath: process.env.LICORNE_CHROME_PATH });

try {
  const page = await browser.newPage({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });
  const errors = [];
  const foreign = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => {
    if (new URL(request.url()).origin !== new URL(base).origin) foreign.push(request.url());
  });

  await page.addInitScript(({ prior, chapterKeys }) => {
    for (const key of prior) {
      localStorage.setItem(key, JSON.stringify({ version: 1, completed: true }));
    }
    for (const { key, version } of chapterKeys) {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify({
          version, completed: false, session: { seed: 0, cursor: 0, answers: [], wrong: 0, marks: 0 }
        }));
      }
    }
    const wait = window.setTimeout.bind(window);
    window.setTimeout = (callback, delay, ...args) => wait(callback, delay === 650 ? 25 : delay, ...args);
    const start = window.AudioBufferSourceNode.prototype.start;
    window.AudioBufferSourceNode.prototype.start = function (...args) {
      this.playbackRate.value = 12;
      return start.apply(this, args);
    };
  }, {
    prior: all.slice(0, all.indexOf(chapter.units[0])).map(unit => unitProgressKey(unit.id)),
    chapterKeys: chapter.units.map(unit => ({ key: unitProgressKey(unit.id), version: exerciseVersion(unit) }))
  });

  await page.goto(new URL('curriculum.html#' + chapter.units[0].id, base).href);
  await page.getByRole('link', { name: 'Reprendre l’unité' }).click();
  const heading = page.locator('#pilotHeading');
  for (const unit of chapter.units) {
    await page.locator('#pilotUnitName').filter({ hasText: unit.title }).waitFor();
    await page.locator('#pilotHelp').getByRole('button', { name: /Écouter la (consigne|question)/ }).click();
    await page.locator('#pilotControls[aria-busy="false"]').waitFor();
    const questions = createSimpleQuestions(chapter, unit, null, 0);
    for (const [index, question] of questions.entries()) {
      await page.evaluate(async ({ item, count }) => {
        const controls = document.getElementById('pilotControls');
        const actions = document.getElementById('pilotActions');
        const displayed = document.getElementById('pilotHeading');
        const wait = async (condition, label) => {
          const deadline = Date.now() + 7000;
          while (!condition()) {
            if (Date.now() > deadline) throw new Error(item.id + ' · ' + label);
            await new Promise(resolve => window.setTimeout(resolve, 10));
          }
        };
        const press = async (label, root = controls) => {
          const find = () => [...root.querySelectorAll('button')]
            .find(button => !button.disabled && button.getAttribute('aria-disabled') !== 'true' && button.textContent.trim() === label);
          await wait(find, label);
          find().click();
        };
        const hear = async (label, root = controls) => {
          await press(label, root);
          await wait(() => controls.getAttribute('aria-busy') === 'false', label);
          if (document.getElementById('pilotAudioStatus').textContent) throw new Error(item.id + ' · audio ' + label);
        };
        await wait(() => displayed.textContent.includes('Question ' + (item.position + 1) + ' sur 5'), 'question');
        if (item.prompt) {
          const promptLabels = {
            oral_count: 'Écouter le mot', sound_to_grapheme: 'Écouter le son',
            assemble_word: 'Écouter', order_sentence: 'Écouter la phrase', fill_grapheme: 'Écouter le mot', morph_choice: 'Écouter le nombre',
            oral_vocabulary: 'Écouter la phrase', story_listen_question: 'Écouter l’histoire'
          };
          await hear(promptLabels[item.type]);
        }
        if (item.type === 'reread_text') {
          if (controls.querySelector('.pilot-reading-text')?.textContent !== item.display) throw new Error(item.id + ' · texte absent');
          if (item.position % 2 === 0) await hear('Écouter Robin', document.getElementById('pilotHelp'));
          await press('J’ai lu', actions);
        } else if (item.pictures) {
          const cards = controls.querySelectorAll('.pilot-picture-card');
          if (cards.length !== 2 || [...cards].some(card => !card.querySelector('svg') || card.disabled)) {
            throw new Error(item.id + ' · deux dessins attendus');
          }
          if (controls.textContent.includes('Écouter la phrase avec Robin')) throw new Error(item.id + ' · lecture avant réponse');
          if (count === 1) {
            cards[1 - item.answer].click();
            cards[1 - item.answer].click();
            await press('Un indice', actions);
            if (!cards[item.answer].classList.contains('pilot-picture-hint')) throw new Error(item.id + ' · indice absent');
          }
          cards[item.answer].click();
          await hear('Écouter la phrase avec Robin', document.getElementById('pilotHelp'));
        } else if (item.order) {
          const paper = controls.querySelector('.pilot-writing-paper');
          if (item.sentence && !item.prompt && controls.querySelector('.pilot-reading-text')?.textContent !== item.sentence) {
            throw new Error(item.id + ' · modèle écrit absent');
          }
          if (item.sentence && item.prompt && controls.querySelector('.pilot-reading-text')) {
            throw new Error(item.id + ' · modèle visible en mode écoute');
          }
          if (!paper || paper.querySelector('button')) throw new Error(item.id + ' · support du mot absent');
          for (const tile of item.order) await press(tile, controls.querySelector('.pilot-word-tiles'));
          await wait(() => controls.querySelector('.pilot-writing-line')?.textContent === (item.sentence ?? item.word.toUpperCase()), 'texte écrit');
        } else if (item.choices.length) {
          if ([...controls.querySelectorAll('button')].filter(button => /^Choix [12]$/.test(button.textContent.trim()))
              .some(button => !button.disabled)) throw new Error('Choix activé avant écoute ' + item.id);
          await hear('Écouter les deux choix');
          await press('Choix ' + (item.answer + 1));
        } else if (item.labels) {
          await press(item.labels[item.answer]);
        } else {
          if (controls.querySelectorAll('.pilot-counts button').length !== 2) throw new Error(item.id + ' · deux choix attendus');
          await press(String(item.answer));
        }
        await wait(() => document.getElementById('pilotCrystals').value === count, 'cristal');
        await press(count === 20 ? 'Entrer dans le château'
          : item.position === 4 ? 'Commencer le bloc suivant' : 'Question suivante', actions);
      }, { item: question, count: index + 1 });
    }
    const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), unitProgressKey(unit.id));
    assert.equal(saved.completed, true);
    assert.equal(saved.session.answers.filter(attempts => attempts === 0).length, chapter.id === 'C6' ? 19 : 20);
    console.log(unit.id + ' · 20 questions');
    if (unit.position < chapter.units.length) {
      await page.getByRole('link', { name: 'Unité suivante', exact: true }).click();
    }
  }

  const next = all[all.indexOf(chapter.units.at(-1)) + 1];
  if (next) {
    await heading.filter({ hasText: 'Chapitre terminé !' }).waitFor();
    const nextLink = page.getByRole('link', { name: 'Chapitre suivant' });
    assert.equal(await nextLink.getAttribute('href'), chapterPlayUrl(next.id));
    await nextLink.click();
    await page.locator('#pilotUnitName').filter({ hasText: next.title }).waitFor();
  } else {
    await heading.filter({ hasText: 'Le parcours est terminé !' }).waitFor();
    const back = page.locator('#pilotActions').getByRole('link', { name: 'Retour à la carte' });
    assert.equal(await back.getAttribute('href'), chapterMapUrl(chapter.id));
    await back.click();
    await page.getByText('Parcours terminé !', { exact: true }).waitFor();
    await page.goBack();
    await page.getByRole('button', { name: 'Rejouer l’unité' }).click();
    await heading.filter({ hasText: 'Question 1 sur 5' }).waitFor();
    const key = unitProgressKey(chapter.units.at(-1).id);
    const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key);
    assert.equal(saved.completed, true);
    assert.equal(saved.session.cursor, 0);
  }
  await page.goto(new URL('curriculum.html', base).href);
  await page.getByText(chapter.units.length + ' / ' + chapter.units.length + ' unités terminées', { exact: true }).first().waitFor();
  assert.deepEqual(errors, []);
  assert.deepEqual(foreign, []);
  console.log(chapter.id + ' terminé dans Chrome.');
} finally {
  await browser.close();
}
