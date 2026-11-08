import * as playback from '../audio.js?v=curriculum-chapter-1';
import { chapterPlayUrl } from '../learning/chapter-one.js';
import { createUnitQuestions } from '../learning/curriculum-questions.js';
import { WORLDS } from './model.js';
import { illustration } from '../illustrations.js';
import { createCurriculum } from '../learning/curriculum.js';
import {
  createPilotSession, newPilotState, readPilotProgress, restorePilotState, unitProgressKey
} from '../learning/pilot-session.js';
import { pilotUnitId } from '../data/curriculum-pilot.js';

const get = id => document.getElementById(id);
const heading = get('pilotHeading');
const controls = get('pilotControls');
const actions = get('pilotActions');
const instructions = get('pilotInstructions');
const feedback = get('pilotFeedback');
const audioStatus = get('pilotAudioStatus');
const pauseDialog = get('pilotPauseDialog');
const pauseButton = get('pilotPause');
const loadStatus = get('pilotLoadStatus');
function button(label, callback, className = '') {
  const node = document.createElement('button');
  node.type = 'button';
  node.className = 'pilot-button ' + className;
  node.textContent = label;
  node.addEventListener('click', callback);
  return node;
}

function makeRow(className = 'pilot-row') {
  const row = document.createElement('div');
  row.className = className;
  return row;
}

async function readJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error('Ressource indisponible : ' + path);
  return response.json();
}

async function openPilot() {
  const catalogue = createCurriculum(await readJson('js/data/curriculum.v2.json'));
  const id = new window.URLSearchParams(location.search).get('unite') ?? pilotUnitId;
  const unit = catalogue.getUnit(id);
  let storage;
  try { storage = window.localStorage; } catch { /* Play with session memory. */ }
  if (!unit || (unit.prerequisiteUnitId && !readPilotProgress(storage, unit.prerequisiteUnitId)?.completed)) {
    loadStatus.textContent = 'Termine l’unité précédente sur la carte pour commencer celle-ci.';
    return;
  }
  const chapter = catalogue.getChapter(unit.chapterId);
  const allUnits = catalogue.chapters.flatMap(item => item.units);
  const nextUnit = allUnits[allUnits.indexOf(unit) + 1];
  const nextChapter = nextUnit && nextUnit.chapterId !== unit.chapterId;
  const worldIndex = WORLDS.findIndex(world => world.habitat === chapter.theme);
  const [chapterAudio, legacyAudio] = await Promise.all([
    readJson('audio/curriculum-' + chapter.id.toLowerCase() + '.json'), playback.ready
  ]);
  const files = Object.fromEntries(Object.entries(chapterAudio).map(([audioId, track]) => [audioId, track.file]));
  await playback.registerClips(files);
  const manifest = { ...legacyAudio, ...files };
  document.querySelectorAll('[data-chapter-return]').forEach(link => { link.href = 'curriculum.html#' + chapter.id; });
  const total = unit.blocks.reduce((count, block) => count + block.questionCount, 0);
  const key = unitProgressKey(id);
  get('pilotUnitName').textContent = unit.title;
  document.title = unit.title + ' · La Licorne des Sons';
  const saved = readPilotProgress(storage, id);
  let completed = saved?.completed === true;
  let lastSaved;
  try { lastSaved = storage.getItem(key); } catch { storage = null; }

  let session, world, lastQuestion, conflict = false;
  let worldReady = false;
  let heard = new Set();
  let showOptions = false;
  let audioToken = 0;
  const readyAnswers = [];

  function restart(state) {
    session = createPilotSession(createUnitQuestions(chapter, unit, manifest, state.seed), state);
    lastQuestion = null;
  }

  function save() {
    if (!storage) {
      get('pilotStorage').hidden = false;
      return;
    }
    try {
      if (storage.getItem(key) !== lastSaved) {
        showConflict();
        return;
      }
      const value = JSON.stringify({ version: 1, completed, session: session.snapshot() });
      storage.setItem(key, value);
      lastSaved = value;
    } catch {
      get('pilotStorage').hidden = false;
    }
  }

  function showConflict() {
    conflict = true;
    stopAudio();
    if (pauseDialog.open) pauseDialog.close();
    world?.setPaused(true);
    loadStatus.hidden = false;
    loadStatus.textContent = 'Cette partie a avancé dans un autre onglet. Recharge la page pour la reprendre.';
    get('pilotPanel').hidden = true;
    get('pilotProgress').hidden = true;
    pauseButton.hidden = true;
  }

  function stopAudio() {
    audioToken++;
    playback.hush();
    audioStatus.textContent = '';
    controls.setAttribute('aria-busy', 'false');
  }

  function refreshAnswers() {
    const question = session.question;
    const canAnswer = (!question.prompt || heard.has(question.prompt)) &&
      (!question.reference || heard.has(question.reference)) && question.choices.every(key => heard.has(key));
    for (const entry of readyAnswers) entry.node.disabled = !canAnswer || !entry.extra();
  }

  async function play(key, after = () => {}) {
    stopAudio();
    const token = audioToken;
    controls.setAttribute('aria-busy', 'true');
    playback.unlock();
    try {
      await playback.ready;
      if (token !== audioToken) return;
      const clip = await playback.loadClip(key);
      if (token !== audioToken) return;
      if (!clip) throw new Error('Enregistrement indisponible');
      await playback.say([key]);
      if (token !== audioToken || conflict) return;
      heard.add(key);
      refreshAnswers();
      after();
    } catch {
      if (token === audioToken) audioStatus.textContent = 'Le son est indisponible. Touche Écouter pour réessayer.';
    } finally {
      if (token === audioToken) controls.setAttribute('aria-busy', 'false');
    }
  }

  function listen(label, key) {
    const node = button(label, () => play(key), 'pilot-listen');
    node.insertAdjacentHTML('afterbegin', illustration('sound'));
    return node;
  }

  function answerButton(label, value, extra = () => true) {
    const node = button(label, () => answer(typeof value === 'function' ? value() : value));
    readyAnswers.push({ node, extra });
    return node;
  }

  function showCorrection(question) {
    const previous = actions.querySelector('.pilot-hint');
    previous?.remove();
    const hint = button('Écouter avec un indice', () => {
      if (question.choices.length) {
        feedback.textContent = question.type === 'oral_syllable_match'
          ? 'Le mot ' + (question.answer + 1) + ' commence par la même syllabe.'
          : 'Écoute à nouveau la bonne option, le son ' + (question.answer + 1) + '.';
        play(question.choices[question.answer]);
      } else if (question.order) {
        feedback.textContent = 'Écoute à nouveau la phrase. Touche un mot placé pour le retirer.';
        play(question.prompt);
      } else if (question.labels) {
        feedback.textContent = 'Essaie avec « ' + question.labels[question.answer] + ' ».';
        if (question.reference) play(question.reference, () => play(question.prompt));
        else play(question.prompt);
      } else {
        feedback.textContent = 'Ce mot a ' + question.answer + ' syllabe' + (question.answer === 1 ? '.' : 's.');
        play(question.prompt);
      }
    }, 'pilot-hint');
    actions.append(hint);
  }

  function answer(value) {
    if (conflict || pauseDialog.open || document.hidden) return;
    const result = session.answer(value);
    if (result === null) return;
    save();
    if (conflict) return;
    if (!result) {
      feedback.textContent = 'Tu peux réécouter et essayer encore.';
      if (session.snapshot().wrong >= 2) showCorrection(session.question);
      return;
    }

    stopAudio();
    render(true);
    if (worldReady) {
      const next = actions.querySelector('button');
      next.disabled = true;
      world.setPaused(false);
      world.moveTo(session.snapshot().answers.length, { gentle: true }).then(() => {
        if (!conflict) next.disabled = false;
      });
    }
  }

  function showTiles(question) {
    const picked = makeRow('pilot-tile-tray');
    const available = makeRow();
    const result = document.createElement('output');
    result.setAttribute('aria-live', 'polite');
    const check = answerButton('Vérifier', () => session.orderIsCorrect() ? 1 : 2,
      () => session.snapshot().order?.length === question.tiles.length);
    function move(tile) {
      session.toggleTile(tile);
      save();
      if (!conflict) {
        displayTiles();
        (available.querySelector('button:not(:disabled)') ?? check).focus();
      }
    }
    function displayTiles() {
      const order = session.snapshot().order ?? [];
      const tilesByIndex = new Map(question.tiles.map(tile => [tile.index, tile.word]));
      picked.replaceChildren(...order.map(index => button(tilesByIndex.get(index), () => move(index))));
      readyAnswers.splice(1);
      available.replaceChildren(...question.tiles.map(({ word, index }) => {
        const tile = button(word, () => move(index));
        readyAnswers.push({ node: tile, extra: () => !order.includes(index) });
        return tile;
      }));
      result.textContent = order.length ? order.map(index => tilesByIndex.get(index)).join(' ') : 'Choisis le premier mot.';
      refreshAnswers();
    }
    controls.append(result, picked, available, check);
    displayTiles();
  }

  function showQuestion(question, state) {
    instructions.textContent = question.instruction;
    const audioControls = makeRow();
    audioControls.append(listen('Écouter la consigne', question.instructionAudio));
    if (question.reference) audioControls.append(listen('Écouter le son', question.reference));
    if (question.prompt) {
      const promptLabel = question.type === 'story_listen_question' ? 'Écouter le récit'
        : ['oral_sentence', 'sentence_order', 'oral_vocabulary'].includes(question.type) ? 'Écouter la phrase' : 'Écouter le mot';
      audioControls.append(listen(promptLabel, question.prompt));
    }
    controls.append(audioControls);
    if (question.display) {
      const display = document.createElement('p');
      display.className = (question.display.includes(' ') && !question.parts ? 'pilot-text' : 'pilot-glyph') +
        (question.script ? ' pilot-script' : '');
      display.textContent = question.display;
      controls.append(display);
    }
    if (question.question && !question.prompt) {
      const task = document.createElement('p');
      task.className = 'pilot-reading-question';
      task.textContent = question.question;
      controls.append(task);
    }
    if (question.parts) {
      const parts = makeRow();
      for (const [index, part] of question.parts.entries()) {
        parts.append(listen('Écouter le son ' + (index + 1), part));
      }
      controls.append(parts);
    }
    if (question.readFirst && !showOptions) {
      controls.append(button('J’ai lu, écouter les options', () => {
        showOptions = true;
        render();
        controls.querySelector('.pilot-match button').focus();
      }, 'pilot-primary'));
      return;
    }
    if (question.type === 'oral_segment') {
      const row = makeRow();
      const marks = document.createElement('output');
      marks.className = 'pilot-marks';
      marks.setAttribute('aria-live', 'polite');
      const remove = button('Retirer un point', () => mark(-1));
      const add = button('Ajouter un point', () => mark(1));
      const check = answerButton('Vérifier', () => session.snapshot().marks, () => session.snapshot().marks > 0);
      function displayMarks(count) {
        marks.textContent = count ? '●'.repeat(count) : '0';
        marks.setAttribute('aria-label', count + ' point' + (count === 1 ? '' : 's'));
        remove.disabled = count === 0;
        add.disabled = count === 4;
        refreshAnswers();
      }
      function mark(delta) {
        displayMarks(session.mark(delta));
        save();
      }
      row.append(add, marks, remove, check);
      controls.append(row);
      displayMarks(state.marks);
    } else if (question.order) {
      showTiles(question);
    } else if (question.labels) {
      const row = makeRow(question.scene ? 'pilot-scene-options' : 'pilot-row');
      question.labels.forEach((label, index) => row.append(answerButton(label, index)));
      controls.append(row);
    } else if (question.choices.length) {
      const row = makeRow('pilot-match');
      for (const [index, key] of question.choices.entries()) {
        const group = document.createElement('div');
        group.append(listen('Écouter ' + (index + 1), key), answerButton('Choisir ' + (index + 1), index));
        row.append(group);
      }
      controls.append(row);
    } else {
      const row = makeRow('pilot-counts');
      for (let count = 1; count <= 4; count++) {
        const choice = answerButton(String(count), count);
        choice.setAttribute('aria-label', count + ' syllabe' + (count === 1 ? '' : 's'));
        row.append(choice);
      }
      controls.append(row);
    }
    refreshAnswers();
    if (state.wrong) feedback.textContent = 'Tu peux réécouter et essayer encore.';
    if (state.wrong >= 2) showCorrection(question);
  }

  function render(focus = false) {
    const state = session.snapshot();
    const question = session.question;
    if (question?.id !== lastQuestion) {
      heard = new Set();
      showOptions = false;
      lastQuestion = question?.id;
    }
    controls.replaceChildren();
    actions.replaceChildren();
    readyAnswers.length = 0;
    feedback.textContent = '';
    instructions.textContent = '';
    get('pilotCount').textContent = state.answers.length + ' / ' + total;
    get('pilotCrystals').value = state.answers.length;
    if (session.finished) {
      heading.textContent = !nextUnit ? 'Le parcours est terminé !'
        : nextChapter ? 'Chapitre terminé !' : 'Bienvenue au château !';
      instructions.textContent = 'Tu as terminé les quatre blocs et gagné les vingt cristaux.';
      const castle = document.createElement('img');
      castle.src = 'assets/storybook/chateau-etoile.webp';
      castle.alt = '';
      castle.className = 'pilot-castle-art';
      controls.append(castle);
      feedback.textContent = state.answers.filter(wrong => wrong === 0).length + ' réponses justes du premier coup sur ' + total + '.';
      if (nextUnit) {
        const next = document.createElement('a');
        next.className = 'curriculum-link curriculum-play-link';
        next.href = chapterPlayUrl(nextUnit.id);
        next.textContent = nextChapter ? 'Chapitre suivant' : 'Unité suivante';
        actions.append(next);
      }
      actions.append(button('Rejouer l’unité', () => {
        restart(newPilotState(Math.floor(Math.random() * 1000000)));
        save();
        if (conflict) return;
        world?.reset(total, worldIndex);
        render(true);
      }, 'pilot-primary'));
    } else if (session.solved) {
      heading.textContent = question.position === 4 ? 'Bloc ' + (question.blockIndex + 1) + ' terminé !' : 'Un cristal de plus !';
      feedback.textContent = 'Paillette avance avec toi.';
      const label = state.answers.length === total ? 'Entrer dans le château'
        : question.position === 4 ? 'Commencer le bloc suivant' : 'Question suivante';
      actions.append(button(label, () => {
        if (!session.advance()) return;
        if (session.finished) completed = true;
        save();
        if (!conflict) render(true);
      }, 'pilot-primary'));
    } else {
      heading.textContent = 'Bloc ' + (question.blockIndex + 1) + ' sur 4 · Question ' + (question.position + 1) + ' sur 5';
      showQuestion(question, state);
    }
    if (focus) heading.focus({ preventScroll: true });
  }

  restart(restorePilotState(saved?.session, total) ?? newPilotState(Math.floor(Math.random() * 1000000)));
  get('pilotPanel').hidden = false;
  get('pilotProgress').hidden = false;
  pauseButton.hidden = false;
  loadStatus.hidden = true;
  if (!storage) get('pilotStorage').hidden = false;
  render();
  pauseButton.addEventListener('click', () => {
    stopAudio();
    world?.setPaused(true);
    pauseDialog.showModal();
  });
  pauseDialog.addEventListener('close', () => {
    if (!conflict) world?.setPaused(document.hidden);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAudio();
    world?.setPaused(document.hidden || pauseDialog.open || conflict);
  });
  window.addEventListener('pagehide', stopAudio);
  window.addEventListener('storage', event => {
    if (event.key === key && event.newValue !== lastSaved) showConflict();
  });

  try {
    const { createWorld } = await import('./world.js?v=curriculum-pilot-1');
    world = createWorld(get('pilotWorld'), {
      onReady() {
        worldReady = true;
        world.reset(total, worldIndex, session.snapshot().answers.length);
        world.quiet(true);
        world.setPaused(document.hidden || pauseDialog.open || conflict);
      },
      onBiome() {},
      onError() { get('pilotWorld').classList.add('pilot-world-static'); }
    });
  } catch {
    // The illustrated background keeps the questions playable without WebGL or Canvas.
  }
}

openPilot().catch(error => {
  console.error(error);
  loadStatus.textContent = 'Le jeu est indisponible. Recharge la page ou retourne à la carte.';
});
