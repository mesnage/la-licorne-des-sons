import { curriculumLocation, reviewMode } from '../learning/curriculum-mode.js';
import { revisionFor, revisionUrl } from './curriculum-revision.js?v=storybook-2';
import * as playback from '../audio.js?v=curriculum-chapter-1';
import { chapterMapUrl, chapterPlayUrl } from '../learning/chapter-one.js';
import { createSimpleQuestions } from '../learning/curriculum-simple.js?v=storybook-2';
import { exerciseVersion } from '../data/curriculum-simple.js?v=storybook-2';
import { WORLDS, worldPanorama } from './model.js';
import { illustration } from '../illustrations.js';
import { createCurriculum } from '../learning/curriculum.js?v=storybook-2';
import {
  createPilotSession, newPilotState, readPilotProgress, restoreProgrammeState, unitProgressKey
} from '../learning/pilot-session.js?v=storybook-2';
import { pictureLabel, pictureSVG } from './curriculum-pictures.js?v=storybook-2';
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
  const catalogue = createCurriculum(await readJson('js/data/curriculum.v2.json?v=storybook-2'));
  const url = curriculumLocation();
  const params = url.searchParams;
  const testMode = reviewMode(url);
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
  const [, revisionLabel] = revisionFor(unit);
  const revision = get('pilotRevision');
  revision.href = revisionUrl(unit, testMode);
  revision.textContent = revisionLabel + ' →';
  const allUnits = catalogue.chapters.flatMap(item => item.units);
  const nextUnit = allUnits[allUnits.indexOf(unit) + 1];
  const nextChapter = nextUnit && nextUnit.chapterId !== unit.chapterId;
  const worldIndex = WORLDS.findIndex(world => world.habitat === chapter.theme);
  if (worldIndex >= 0) {
    const panorama = new window.URL(worldPanorama(WORLDS[worldIndex]), location.href);
    get('pilotWorld').style.setProperty('--pilot-panorama', 'url("' + panorama.href + '")');
  }
  const chapterAudio = await readJson('audio/curriculum-' + chapter.id.toLowerCase() + '-robin.json?v=storybook-2');
  const manifest = Object.fromEntries(Object.entries(chapterAudio).map(([audioId, track]) => [audioId, track.file]));
  await playback.registerClips(manifest);
  document.querySelectorAll('[data-chapter-return]').forEach(link => {
    link.href = chapterMapUrl(block ? unit.id : chapter.id, testMode);
  });
  const version = exerciseVersion(unit);
  const total = block ? block.questionCount : unit.blocks.reduce((count, item) => count + item.questionCount, 0);
  get('pilotCrystals').max = total;
  const markers = [];
  for (const group of block ? [block] : unit.blocks) {
    const row = makeRow('pilot-crystal-group');
    for (let index = 0; index < group.questionCount; index++) {
      const marker = document.createElement('span');
      markers.push(marker);
      row.append(marker);
    }
    get('pilotCrystalGroups').append(row);
  }
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
      const value = JSON.stringify({ version, completed, session: session.snapshot() });
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
    const placed = question.order ? session.snapshot().order : [];
    for (const node of readyAnswers) node.disabled = !canAnswer || placed.includes(Number(node.dataset.tile));
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
      if (question.pictures) {
        readyAnswers[question.answer].classList.add('pilot-picture-hint');
        feedback.textContent = 'Regarde le dessin entouré.';
      } else if (question.order) {
        feedback.textContent = 'Touche « ' + question.order[session.snapshot().order.length] + ' » pour continuer.';
        if (question.prompt) play([question.prompt]);
      } else if (question.choices.length) {
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
      feedback.textContent = session.question.sentence ? 'Essaie avec un autre mot.'
        : session.question.pictures ? 'Relis la phrase et essaie encore.'
        : 'Tu peux réécouter et essayer encore.';
      if (session.snapshot().wrong >= 2) showCorrection(session.question);
      return;
    }

    const word = session.question.word;
    stopAudio();
    render(true);
    if (word) feedback.textContent = 'Tu as fabriqué « ' + word + ' ».';
    if (worldReady) {
      const next = actions.querySelector('button');
      next.disabled = true;
      world.setPaused(false);
      world.moveTo(session.snapshot().answers.length, { gentle: true }).then(() => {
        if (!conflict) next.disabled = false;
      });
    }
  }

  function showWrittenWord(question, placed) {
    const paper = document.createElement('div');
    paper.className = 'pilot-writing-paper';
    const label = document.createElement('div');
    label.className = 'pilot-writing-label';
    label.textContent = question.sentence ? 'Ma phrase' : 'Mon mot';
    const line = makeRow('pilot-writing-line');
    if (question.sentence) line.classList.add('pilot-sentence-line');
    line.setAttribute('aria-live', 'polite');
    if (placed.length === question.order.length) {
      line.textContent = question.sentence ?? question.word.toUpperCase();
    } else {
      const writing = document.createElement('span');
      const text = placed.map(index => question.order[index]).join(question.sentence ? ' ' : '');
      writing.textContent = question.sentence && text ? text[0].toLocaleUpperCase('fr') + text.slice(1) : text;
      line.append(writing);
      for (let position = placed.length; position < question.order.length; position++) {
        const blank = document.createElement('span');
        blank.className = position === placed.length ? 'pilot-writing-blank pilot-writing-next' : 'pilot-writing-blank';
        blank.setAttribute('aria-hidden', 'true');
        line.append(blank);
      }
    }
    paper.append(label, line);
    controls.append(paper);
  }

  function showWordTiles(question, placed) {
    showWrittenWord(question, placed);
    const tray = makeRow('pilot-word-tiles' + (question.sentence ? ' pilot-sentence-tiles' : ''));
    for (const tile of question.tiles) {
      const piece = question.order[tile];
      const node = button(piece, () => {
        if (conflict || pauseDialog.open || document.hidden) return;
        if (piece !== question.order[session.snapshot().order.length]) {
          answer(2);
          return;
        }
        session.toggleTile(tile);
        if (session.orderIsCorrect()) answer(1);
        else {
          save();
          if (!conflict) {
            render();
            controls.querySelector('.pilot-word-tiles button:not(:disabled)')?.focus();
          }
        }
      }, 'pilot-letter-tile');
      node.dataset.tile = tile;
      readyAnswers.push(node);
      tray.append(node);
    }
    controls.append(tray);
  }

  function showMissingLetters(parts) {
    const word = makeRow('pilot-word-slots pilot-gap-word');
    const blank = document.createElement('span');
    blank.className = 'pilot-word-slot pilot-next-slot';
    blank.setAttribute('aria-label', 'Lettres manquantes');
    word.append(parts[0], blank, parts[1]);
    controls.append(word);
  }

  function showAnswerCards(question) {
    const row = makeRow('pilot-answer-pair');
    for (const [index, label] of question.labels.entries()) {
      const answer = answerButton(label, index);
      if (question.blank) answer.classList.add('pilot-letter-tile');
      if (question.optionAudio) {
        const card = document.createElement('div');
        card.className = 'pilot-answer-card';
        const speaker = listen('Écouter', [question.optionAudio[index]], 'pilot-card-listen');
        speaker.setAttribute('aria-label', 'Écouter : ' + label);
        card.append(answer, speaker);
        row.append(card);
      } else row.append(answer);
    }
    controls.append(row);
  }

  function showReadingText(question) {
    const display = document.createElement('p');
    display.className = question.modelAudio ? 'pilot-reading-text'
      : question.display.includes(' ') ? 'pilot-text' : 'pilot-glyph';
    display.textContent = question.display;
    controls.append(display);
  }

  function showPictureCards(question) {
    const row = makeRow('pilot-picture-pair');
    for (const [index, picture] of question.pictures.entries()) {
      const card = answerButton('', index);
      card.classList.add('pilot-picture-card');
      card.setAttribute('aria-label', pictureLabel(picture));
      card.innerHTML = pictureSVG(picture);
      row.append(card);
    }
    controls.append(row);
  }

  function showQuestion(question, state) {
    instructions.textContent = question.instruction;
    const audioControls = makeRow();
    const promptLabels = {
      oral_count: 'Écouter le mot',
      assemble_word: 'Écouter',
      order_sentence: 'Écouter la phrase',
      fill_grapheme: 'Écouter le mot',
      morph_choice: 'Écouter le nombre',
      sound_to_grapheme: 'Écouter le son',
      oral_vocabulary: 'Écouter la phrase',
      story_listen_question: 'Écouter l’histoire'
    };
    if (question.display) showReadingText(question);
    if (question.question) {
      const task = document.createElement('p');
      task.className = 'pilot-reading-question';
      task.textContent = question.question;
      controls.append(task);
    }
    if (question.blank) showMissingLetters(question.blank);
    if (question.type === 'reread_text') {
      audioControls.append(listen('Écouter Robin', [question.modelAudio], 'pilot-primary'));
    }
    if (question.prompt) {
      audioControls.append(listen(promptLabels[question.type], [question.prompt, question.context].filter(Boolean), 'pilot-primary'));
    }
    if (question.choices.length) {
      audioControls.append(listen('Écouter les deux choix', question.choices, 'pilot-primary'));
    }
    audioControls.append(question.questionAudio
      ? listen('Écouter la question', [question.questionAudio], 'pilot-instruction')
      : listen('Écouter la consigne', [question.instructionAudio], 'pilot-instruction'));
    controls.append(audioControls);
    if (question.type === 'reread_text') {
      actions.append(button('J’ai lu', () => answer(1), 'pilot-primary'));
    } else if (question.pictures) {
      showPictureCards(question);
    } else if (question.order) {
      showWordTiles(question, state.order);
    } else if (question.labels) {
      showAnswerCards(question);
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
    for (const [index, marker] of markers.entries()) {
      marker.classList.toggle('collected', index < state.answers.length);
    }
    get('pilotRevision').hidden = !session.finished;
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
      feedback.textContent = chapter.id === 'C5' ? total + ' lectures faites.'
        : state.answers.filter(wrong => wrong === 0).length + ' réponses justes du premier coup sur ' + total + '.';
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
      if (question.order) showWrittenWord(question, state.order);
      if (question.modelAudio) {
        if (!question.sentence) showReadingText(question);
        if (question.pictures) {
          const picture = makeRow('pilot-picture-solution');
          picture.innerHTML = pictureSVG(question.pictures[question.answer]);
          controls.append(picture);
        }
        controls.append(listen(question.pictures || question.sentence ? 'Écouter la phrase avec Robin' : 'Réécouter Robin',
          [question.modelAudio], 'pilot-instruction'));
      }
      heading.textContent = question.position === 4 ? 'Bloc ' + (question.blockIndex + 1) + ' terminé !' : 'Un cristal de plus !';
      feedback.textContent = 'Paillette avance avec toi.';
      const label = state.answers.length === total ? (block ? 'Terminer le bloc' : 'Entrer dans le château')
        : question.position === 4 ? 'Commencer le bloc suivant' : 'Question suivante';
      actions.append(button(label, () => {
        if (!session.advance()) return;
        stopAudio();
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

  const restored = restoreProgrammeState(saved, total, version);
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
