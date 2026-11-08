import * as playback from '../audio.js?v=curriculum-chapter-1';
import { chapterMapUrl, chapterPlayUrl } from '../learning/chapter-one.js';
import { createSimpleQuestions } from '../learning/curriculum-simple.js';
import { simpleProgrammeVersion } from '../data/curriculum-simple.js';
import { WORLDS } from './model.js';
import { illustration } from '../illustrations.js';
import { createCurriculum } from '../learning/curriculum.js';
import {
  createPilotSession, newPilotState, readPilotProgress, restoreProgrammeState, unitProgressKey
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
  const params = new window.URLSearchParams(location.search);
  const testMode = params.get('test') === '1';
  const id = params.get('unite') ?? pilotUnitId;
  const unit = catalogue.getUnit(id);
  let storage;
  try { storage = window.localStorage; } catch { /* Play with session memory. */ }
  if (!unit || (!testMode && unit.prerequisiteUnitId && !readPilotProgress(storage, unit.prerequisiteUnitId)?.completed)) {
    loadStatus.textContent = 'Termine l’unité précédente sur la carte pour commencer celle-ci.';
    return;
  }
  const chapter = catalogue.getChapter(unit.chapterId);
  const block = testMode && unit.blocks.find(item => String(item.position) === params.get('bloc'));
  get('pilotTestMode').hidden = !testMode;
  const allUnits = catalogue.chapters.flatMap(item => item.units);
  const nextUnit = allUnits[allUnits.indexOf(unit) + 1];
  const nextChapter = nextUnit && nextUnit.chapterId !== unit.chapterId;
  const worldIndex = WORLDS.findIndex(world => world.habitat === chapter.theme);
  const [chapterAudio, simpleAudio, legacyAudio] = await Promise.all([
    readJson('audio/curriculum-' + chapter.id.toLowerCase() + '.json'), readJson('audio/curriculum-simple.json'), playback.ready
  ]);
  const files = Object.fromEntries(Object.entries({ ...chapterAudio, ...simpleAudio }).map(([audioId, track]) => [audioId, track.file]));
  await playback.registerClips(files);
  const manifest = { ...legacyAudio, ...files };
  document.querySelectorAll('[data-chapter-return]').forEach(link => {
    link.href = chapterMapUrl(block ? unit.id : chapter.id, testMode);
  });
  const total = block ? block.questionCount : unit.blocks.reduce((count, item) => count + item.questionCount, 0);
  get('pilotCrystals').max = total;
  const key = unitProgressKey(id, testMode, block?.position);
  get('pilotUnitName').textContent = unit.title;
  document.title = unit.title + ' · La Licorne des Sons';
  const saved = readPilotProgress(storage, id, testMode, block?.position);
  let completed = saved?.completed === true;
  let lastSaved;
  try { lastSaved = storage.getItem(key); } catch { storage = null; }

  let session, world, lastQuestion, conflict = false;
  let worldReady = false;
  let heard = new Set();
  let audioToken = 0;
  const readyAnswers = [];

  function restart(state) {
    const questions = createSimpleQuestions(chapter, unit, manifest, state.seed);
    session = createPilotSession(block ? questions.filter(q => q.blockIndex + 1 === block.position) : questions, state);
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
      const value = JSON.stringify({ version: simpleProgrammeVersion, completed, session: session.snapshot() });
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
    const canAnswer = (!question.prompt || heard.has(question.prompt)) && question.choices.every(key => heard.has(key));
    for (const node of readyAnswers) node.disabled = !canAnswer;
  }

  async function play(keys) {
    stopAudio();
    const token = audioToken;
    controls.setAttribute('aria-busy', 'true');
    playback.unlock();
    try {
      await playback.ready;
      if (token !== audioToken) return;
      const clips = await Promise.all(keys.map(key => playback.loadClip(key)));
      if (token !== audioToken) return;
      if (clips.some(clip => !clip)) throw new Error('Enregistrement indisponible');
      await playback.say(keys.flatMap((key, index) => index ? [650, key] : [key]));
      if (token !== audioToken || conflict) return;
      keys.forEach(key => heard.add(key));
      refreshAnswers();
    } catch {
      if (token === audioToken) audioStatus.textContent = 'Le son est indisponible. Touche Écouter pour réessayer.';
    } finally {
      if (token === audioToken) controls.setAttribute('aria-busy', 'false');
    }
  }

  function listen(label, keys, className = '') {
    const node = button(label, () => play(keys), 'pilot-listen ' + className);
    node.insertAdjacentHTML('afterbegin', illustration('sound'));
    return node;
  }

  function answerButton(label, value) {
    const node = button(label, () => answer(value));
    readyAnswers.push(node);
    return node;
  }

  function showCorrection(question) {
    actions.querySelector('.pilot-hint')?.remove();
    const hint = button('Un indice', () => {
      if (question.choices.length) {
        feedback.textContent = 'Écoute le choix ' + (question.answer + 1) + '.';
        play([question.choices[question.answer]]);
      } else if (question.labels) {
        feedback.textContent = 'Essaie avec « ' + question.labels[question.answer] + ' ».';
        if (question.prompt) play([question.prompt, question.context].filter(Boolean));
      } else {
        feedback.textContent = 'Ce mot a ' + question.answer + ' syllabe' + (question.answer === 1 ? '.' : 's.');
        play([question.prompt]);
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

  function showQuestion(question, state) {
    instructions.textContent = question.instruction;
    const audioControls = makeRow();
    const promptLabels = {
      oral_count: 'Écouter le mot',
      sound_to_grapheme: 'Écouter le son',
      oral_vocabulary: 'Écouter la phrase',
      story_listen_question: 'Écouter l’histoire'
    };
    if (question.display) {
      const display = document.createElement('p');
      display.className = question.display.includes(' ') ? 'pilot-text' : 'pilot-glyph';
      display.textContent = question.display;
      controls.append(display);
    }
    if (question.prompt) {
      audioControls.append(listen(promptLabels[question.type], [question.prompt, question.context].filter(Boolean), 'pilot-primary'));
    }
    if (question.choices.length) {
      audioControls.append(listen('Écouter les deux choix', question.choices, 'pilot-primary'));
    }
    audioControls.append(listen('Écouter la consigne', [question.instructionAudio], 'pilot-instruction'));
    controls.append(audioControls);
    if (question.labels) {
      const row = makeRow(question.scene ? 'pilot-scene-options' : 'pilot-answer-pair');
      question.labels.forEach((label, index) => row.append(answerButton(label, index)));
      controls.append(row);
    } else if (question.choices.length) {
      const row = makeRow('pilot-answer-pair');
      question.choices.forEach((_, index) => row.append(answerButton('Choix ' + (index + 1), index)));
      controls.append(row);
    } else {
      const row = makeRow('pilot-answer-pair pilot-counts');
      for (const count of question.counts) {
        const choice = answerButton(String(count), count);
        choice.setAttribute('aria-label', count + ' syllabe' + (count === 1 ? '' : 's'));
        row.append(choice);
      }
      controls.append(row);
    }
    refreshAnswers();
    if (state.wrong) feedback.textContent = 'Tu peux réessayer.';
    if (state.wrong >= 2) showCorrection(question);
  }

  function render(focus = false) {
    const state = session.snapshot();
    const question = session.question;
    if (question?.id !== lastQuestion) {
      heard = new Set();
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
      heading.textContent = block ? 'Bloc ' + block.position + ' testé !' : !nextUnit ? 'Le parcours est terminé !'
        : nextChapter ? 'Chapitre terminé !' : 'Bienvenue au château !';
      instructions.textContent = block ? 'Les cinq questions du bloc sont terminées.'
        : 'Tu as terminé les quatre blocs et gagné les vingt cristaux.';
      const castle = document.createElement('img');
      castle.src = 'assets/storybook/chateau-etoile.webp';
      castle.alt = '';
      castle.className = 'pilot-castle-art';
      if (!block) controls.append(castle);
      feedback.textContent = state.answers.filter(wrong => wrong === 0).length + ' réponses justes du premier coup sur ' + total + '.';
      if (block || nextUnit) {
        const next = document.createElement('a');
        next.className = 'curriculum-link curriculum-play-link';
        const nextBlock = block && unit.blocks[block.position];
        next.href = nextBlock ? chapterPlayUrl(id, true, nextBlock.position)
          : block ? chapterMapUrl(id, true) : chapterPlayUrl(nextUnit.id, testMode);
        next.textContent = nextBlock ? 'Tester le bloc suivant' : block ? 'Retour à l’unité'
          : nextChapter ? 'Chapitre suivant' : 'Unité suivante';
        actions.append(next);
      }
      actions.append(button(block ? 'Rejouer le bloc' : 'Rejouer l’unité', () => {
        restart(newPilotState(Math.floor(Math.random() * 1000000)));
        save();
        if (conflict) return;
        world?.reset(total, worldIndex);
        render(true);
      }, 'pilot-primary'));
    } else if (session.solved) {
      heading.textContent = question.position === 4 ? 'Bloc ' + (question.blockIndex + 1) + ' terminé !' : 'Un cristal de plus !';
      feedback.textContent = 'Paillette avance avec toi.';
      const label = state.answers.length === total ? (block ? 'Terminer le bloc' : 'Entrer dans le château')
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

  const restored = restoreProgrammeState(saved, total);
  if (!restored && saved?.session) get('pilotMigration').hidden = false;
  restart(restored ?? newPilotState(Math.floor(Math.random() * 1000000)));
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
