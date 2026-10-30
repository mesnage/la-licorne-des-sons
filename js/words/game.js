import { WORDS, WORD_LEVELS } from '../data/words.js';
import { WordSession, SESSION_LENGTH, mastered } from './model.js';
import { createWordProgress } from './progress.js';
import { createWordVoice } from './voice.js';
import { unicornSVG } from '../unicorn.js';
import { hush, sfx, unlock } from '../audio.js';

export function initWordGame(){
  const $ = id => document.getElementById(id);
  let storage;
  try { storage = window.localStorage; } catch(e){}
  const progress = createWordProgress(storage);
  const voice = createWordVoice(window, message => { $('wordAudioStatus').textContent = message; });
  let session = null, level = 1, nextTimer = null, previousId;
  const active = () => $('wordPlay').classList.contains('on');
  function stop(){ clearTimeout(nextTimer); nextTimer = null; voice.stop(); }
  function show(id){
    document.querySelectorAll('.screen').forEach(screen => screen.classList.toggle('on', screen.id === id));
    window.scrollTo(0, 0);
  }
  function storageNote(){
    const text = progress.persistent ? 'Les progrès restent sur cet appareil, sans compte.' :
      'La sauvegarde est bloquée. Les progrès resteront seulement pendant cette visite.';
    document.querySelectorAll('.word-storage-note').forEach(el => { el.textContent = text; });
  }
  function refreshPractice(){
    const stats = progress.snapshot();
    $('wordPractice').replaceChildren();
    for(const data of WORD_LEVELS){
      const items = WORDS.filter(w => w.level === data.id);
      const solid = items.filter(w => mastered(stats[w.id]));
      const practice = items.filter(w => stats[w.id]?.misses && !mastered(stats[w.id]));
      const row = document.createElement('p');
      row.textContent = `${data.title} : ${solid.length} mot(s) reconnu(s) régulièrement, ${practice.length} à revoir.`;
      if(solid.length) row.appendChild(document.createTextNode(` Bien reconnus : ${solid.map(w => w.text).join(', ')}.`));
      if(practice.length) row.appendChild(document.createTextNode(` À revoir : ${practice.map(w => w.text).join(', ')}.`));
      $('wordPractice').appendChild(row);
    }
    storageNote();
  }
  function levels(){ stop(); session = null; refreshPractice(); show('wordLevels'); }
  function renderProgress(completed){
    $('wordQuestionNumber').textContent = `Mot ${Math.min(session.index + 1, SESSION_LENGTH)} sur ${SESSION_LENGTH}`;
    $('wordProgress').setAttribute('aria-valuenow', completed);
    $('wordProgress').setAttribute('aria-valuetext', `${completed} mots trouvés sur ${SESSION_LENGTH}`);
    $('wordGarden').style.setProperty('--word-step', completed / SESSION_LENGTH);
    [...$('wordStones').children].forEach((stone,i) => stone.classList.toggle('visited', i < completed));
  }
  function replay(){
    if(!active() || !session?.current) return;
    unlock();
    voice.speak(session.current.target);
    if(session.phase === 'feedback') continueSession(5000);
  }
  function renderQuestion(){
    previousId = session.current.target.id;
    $('wordFeedback').textContent = 'Écoute le mot, puis regarde bien les lettres.';
    renderProgress(session.index);
    $('wordChoices').replaceChildren();
    session.current.choices.forEach((word,i) => {
      const wrap = document.createElement('div'); wrap.className = 'word-choice-wrap';
      const button = document.createElement('button');
      button.className = `word-choice word-tint-${i}`;
      button.dataset.wordId = word.id;
      button.classList.toggle('word-long', word.text.length > 8);
      const label = document.createElement('span'); label.textContent = word.text;
      button.appendChild(label);
      button.addEventListener('click', () => answer(word.id, button, wrap));
      wrap.appendChild(button); $('wordChoices').appendChild(wrap);
    });
    replay();
  }
  function finish(){
    stop();
    $('wordScore').textContent = `Bravo ! Tu as trouvé ${session.score} mot${session.score === 1 ? '' : 's'} sur ${SESSION_LENGTH} du premier coup !`;
    $('wordFinishNote').textContent = 'Et tu as réussi les 10 mots ! Paillette a traversé le jardin grâce à toi.';
    storageNote(); show('wordFinish'); sfx.fanfare();
    $('wordFinishTitle').focus({ preventScroll: true });
  }
  function continueSession(delay = 1600){
    clearTimeout(nextTimer);
    nextTimer = setTimeout(() => {
      if(!active() || !session || document.hidden) return;
      session.next();
      if(session.phase === 'finished') finish(); else renderQuestion();
    }, delay);
  }
  function answer(id, button, wrap){
    const result = session.answer(id);
    if(!result) return;
    const targetId = session.current.target.id;
    if(!result.correct){
      if(result.firstMistake) progress.miss(targetId);
      button.classList.remove('word-retry');
      // Restart a gentle shake even if the same card is tapped again.
      void button.offsetWidth;
      button.classList.add('word-retry');
      $('wordFeedback').textContent = 'Essaie encore. Écoute et regarde chaque lettre.';
      storageNote(); return;
    }
    progress.complete(targetId, result.firstTry); storageNote();
    voice.stop(); sfx.ding();
    button.classList.add('word-correct');
    const check = document.createElement('span'); check.className = 'word-check'; check.textContent = '✓'; check.setAttribute('aria-hidden', 'true');
    button.appendChild(check);
    button.setAttribute('aria-label', `${session.current.target.text}, bonne réponse`);
    const cheer = document.createElement('div'); cheer.className = 'word-card-cheer'; cheer.setAttribute('aria-hidden', 'true');
    cheer.innerHTML = unicornSVG(); wrap.prepend(cheer);
    cheer.querySelector('.uni').classList.add('happy');
    $('wordChoices').querySelectorAll('button').forEach(b => { b.disabled = true; });
    $('wordFeedback').textContent = 'Bien joué ! Un nouveau pas pour Paillette !';
    renderProgress(session.index + 1);
    continueSession();
  }
  function start(id){
    stop(); hush(); unlock(); level = id;
    session = new WordSession(WORDS, level, progress.snapshot(), Math.random, previousId);
    $('wordLevelName').textContent = WORD_LEVELS.find(l => l.id === level).title;
    show('wordPlay'); renderQuestion();
  }
  for(const data of WORD_LEVELS){
    const button = document.createElement('button');
    button.className = 'word-level-button candy c-white'; button.dataset.wordLevel = data.id;
    const icon = document.createElement('span'); icon.className = 'word-level-icon'; icon.textContent = data.icon; icon.setAttribute('aria-hidden', 'true');
    const text = document.createElement('span'); text.textContent = `${data.id}. ${data.title}`;
    const detail = document.createElement('small'); detail.textContent = data.detail; text.appendChild(detail);
    button.append(icon, text); button.addEventListener('click', () => start(data.id));
    $('wordLevelButtons').appendChild(button);
  }
  $('wordGardenUnicorn').innerHTML = unicornSVG();
  $('wordFinishUnicorn').innerHTML = unicornSVG();
  $('wordFinishUnicorn').querySelector('.uni').classList.add('happy');
  for(let i = 0; i < SESSION_LENGTH; i++){
    const stone = document.createElement('span'); stone.setAttribute('aria-hidden', 'true');
    $('wordStones').appendChild(stone);
  }
  $('wordActivityOpen').addEventListener('click', () => { hush(); levels(); });
  $('wordLevelsHome').addEventListener('click', () => { stop(); session = null; show('home'); });
  $('wordPlayBack').addEventListener('click', levels);
  $('wordChooseLevel').addEventListener('click', levels);
  $('wordReplaySession').addEventListener('click', () => start(level));
  $('wordSpeaker').addEventListener('click', replay);
  document.addEventListener('visibilitychange', () => {
    if(document.hidden) stop();
    else if(active() && session?.phase === 'feedback') continueSession();
  });
  window.addEventListener('pagehide', stop);
  if(location.search.includes('debug')) window.__words = {
    state: () => session && ({ index: session.index, score: session.score, phase: session.phase, targetId: session.current?.target.id })
  };
}
