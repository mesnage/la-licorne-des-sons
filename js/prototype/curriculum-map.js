import { curriculumLocation, reviewMode } from '../learning/curriculum-mode.js';
import { revisionFor, revisionUrl } from './curriculum-revision.js?v=ateliers-sons-2';
import { exerciseVersion, simpleExercise } from '../data/curriculum-simple.js?v=storybook-2';
import { createCurriculum } from '../learning/curriculum.js?v=storybook-2';
import { chapterMapUrl, chapterPlayUrl } from '../learning/chapter-one.js';
import { pilotProgressKey, pilotQuestionCount, readPilotProgress, restoreProgrammeState } from '../learning/pilot-session.js?v=storybook-2';
import { WORLDS, worldPanorama } from './model.js?v=roue-dinos-1';

const testMode = reviewMode(curriculumLocation());
const content = document.getElementById('curriculumContent');
const statusLabels = { completed: 'Terminée', available: testMode ? 'À tester' : 'Prochaine étape', upcoming: 'À venir' };

function element(tag, className, text = '') {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}

function link(href, text, className = 'curriculum-link') {
  const anchor = element('a', className, text);
  anchor.href = href;
  return anchor;
}

function art(src, className = '') {
  const image = element('img', className);
  image.src = src;
  image.alt = '';
  return image;
}

function chapterCard(chapter, index, completedUnits) {
  const card = link('#' + chapter.id, '', 'curriculum-card tone-' + ['rose', 'mint', 'sky', 'lavender', 'peach', 'gold', 'lavender'][index]);
  const world = WORLDS.find(world => world.habitat === chapter.theme);
  if (world) card.append(art(worldPanorama(world), 'curriculum-panorama'));

  const summary = element('div', 'curriculum-card-copy');
  const completed = chapter.units.filter(unit => completedUnits.has(unit.id)).length;
  summary.append(
    element('span', 'curriculum-label', 'Chapitre ' + (index + 1)),
    element('strong', '', chapter.title),
    element('span', '', chapter.subtitle),
    element('small', '', completed + ' / ' + chapter.units.length + ' unités terminées')
  );
  card.append(summary);
  return card;
}

function chapterHome(curriculum, completedUnits, pilot) {
  document.body.style.removeProperty('--curriculum-panorama');
  const hero = element('div', 'curriculum-hero');
  const intro = element('div', '');
  intro.append(element('h1', '', 'Mon parcours de lecture'));
  const allUnits = curriculum.chapters.flatMap(chapter => chapter.units);
  const next = allUnits.find(unit => !completedUnits.has(unit.id));
  const destination = next ?? allUnits.at(-1);
  const progress = pilot.get(destination.id);
  const startLabel = !next ? 'Revoir le château final' : progress?.session || completedUnits.size
    ? 'Continuer mon aventure' : 'Commencer mon aventure';
  if (next) intro.append(element('p', 'curriculum-next-step', next.title));
  intro.append(link(chapterPlayUrl(destination.id, testMode), startLabel, 'curriculum-link curriculum-play-link'));
  hero.append(intro, art('assets/storybook/paillette-0.webp', 'curriculum-paillette'));
  const chapters = element('nav', 'curriculum-chapters');
  chapters.setAttribute('aria-label', 'Chapitres du parcours de lecture');
  chapters.append(...curriculum.chapters.map((chapter, index) => chapterCard(chapter, index, completedUnits)));
  content.replaceChildren(hero, chapters);
  return intro.querySelector('h1');
}

function unitDetail(unit, status, pilot) {
  const detail = element('section', 'curriculum-unit-detail');
  const heading = element('h2', '', unit.title);
  heading.id = 'curriculumUnitTitle';
  detail.setAttribute('aria-labelledby', heading.id);
  const exercise = simpleExercise(unit);
  const progress = pilot.get(unit.id);
  const active = restoreProgrammeState(progress, pilotQuestionCount, exerciseVersion(unit));
  const answered = progress?.completed ? pilotQuestionCount : active?.answers.length ?? 0;
  detail.append(
    link('#' + unit.chapterId, '← Les unités', 'curriculum-link curriculum-unit-back'),
    element('p', 'curriculum-label', 'Unité ' + unit.position + ' · ' + statusLabels[status]),
    heading,
    element('p', '', exercise.instruction)
  );
  if (status === 'upcoming') {
    detail.append(element('p', 'curriculum-locked-message', 'Termine l’unité précédente pour jouer.'));
  } else {
    const label = active && active.cursor < pilotQuestionCount
      ? 'Reprendre l’unité' : progress?.completed ? 'Voir le château' : 'Jouer cette unité';
    detail.append(link(chapterPlayUrl(unit.id, testMode), label, 'curriculum-link curriculum-play-link'));
  }

  const blocks = element('ol', 'curriculum-blocks');
  blocks.setAttribute('aria-label', 'Blocs de l’unité');
  let preceding = 0;
  for (const block of unit.blocks) {
    const item = element('li', 'curriculum-block');
    item.dataset.blockId = block.id;
    item.append(element('strong', '', 'Bloc ' + block.position));
    const finished = answered >= preceding + block.questionCount;
    const unlocked = status !== 'upcoming' && answered >= preceding;
    item.dataset.blockStatus = finished ? 'done' : unlocked ? 'next' : 'locked';
    preceding += block.questionCount;
    if (testMode) {
      item.append(link(chapterPlayUrl(unit.id, true, block.position), 'Tester le bloc ' + block.position));
    }
    if (!testMode) {
      item.append(element('span', 'curriculum-block-status', finished ? 'Terminé' : unlocked ? 'À jouer' : 'À venir'));
    }
    blocks.append(item);
  }
  detail.append(blocks);
  const [, revisionLabel] = revisionFor(unit);
  const practice = element('aside', 'curriculum-revision');
  practice.append(element('p', 'curriculum-label', 'Pour t’entraîner'),
    link(revisionUrl(unit, testMode), revisionLabel + ' →'));
  detail.append(practice);
  return detail;
}

function chapterView(curriculum, chapter, selectedUnit, completedUnits, pilot) {
  const getStatus = id => testMode && !completedUnits.has(id)
    ? 'available' : curriculum.getUnitStatus(id, completedUnits);
  const heading = element('h1', '', chapter.title);
  const completed = chapter.units.filter(unit => completedUnits.has(unit.id)).length;
  const header = element('div', 'curriculum-chapter-header');
  header.append(link('#chapitres', '← Les chapitres'),
    element('p', 'curriculum-label', 'Chapitre ' + (curriculum.chapters.indexOf(chapter) + 1)), heading);
  if (!selectedUnit) {
    header.append(element('p', 'curriculum-chapter-progress', completed + ' / ' + chapter.units.length + ' étapes terminées'));
  }

  const map = element('div', selectedUnit ? 'curriculum-map has-unit' : 'curriculum-map');
  const path = element('div', 'curriculum-trail');
  const world = WORLDS.find(world => world.habitat === chapter.theme);
  if (world) {
    document.body.style.setProperty('--curriculum-panorama', 'url("' + new window.URL(worldPanorama(world), location.href).href + '")');
  }
  const units = element('ol', 'curriculum-units');
  units.setAttribute('aria-label', 'Unités du chapitre');
  const firstUnfinished = chapter.units.find(unit => !completedUnits.has(unit.id));
  const active = firstUnfinished?.position ?? chapter.units.length + 1;
  const stops = [22, 32, 24, 15];
  const stopAt = index => stops[index % stops.length];
  const paillette = element('span', 'curriculum-traveler');
  paillette.setAttribute('aria-hidden', 'true');
  const castleStop = 25;
  function placeTraveler(item) {
    item.append(paillette);
    if (selectedUnit) return;
    // Animate only on a later visit after actual progress in this chapter.
    const key = 'licorne.trail.' + chapter.id + (testMode ? '.test' : '');
    try {
      const previous = Number(window.sessionStorage.getItem(key));
      window.sessionStorage.setItem(key, String(active));
      if (previous > 0 && previous < active
          && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        requestAnimationFrame(() => {
          const from = units.children[previous - 1]?.querySelector('.curriculum-stop');
          const to = item.querySelector('.curriculum-stop');
          if (!from || !to || !paillette.offsetWidth) return;
          const here = to.getBoundingClientRect();
          const steps = [...units.children].slice(previous - 1, active).map(step => {
            const point = step.querySelector('.curriculum-stop').getBoundingClientRect();
            return { transform: 'translate(' + (point.left - here.left) + 'px,' + (point.top - here.top) + 'px)' };
          });
          paillette.classList.add('is-walking');
          const walking = paillette.animate(steps, { duration: Math.min(1400, 520 * (active - previous)), easing: 'ease-in-out' });
          const stop = () => paillette.classList.remove('is-walking');
          walking.finished.then(stop, stop);
        });
      }
    } catch { /* The map still shows the current stop without session storage. */ }
  }
  for (const [index, unit] of chapter.units.entries()) {
    const status = getStatus(unit.id);
    const item = element('li', 'curriculum-trail-step');
    const stop = stopAt(index);
    const next = index === chapter.units.length - 1 ? castleStop : stopAt(index + 1);
    const pathShape = 'M ' + stop + ' 0 C ' + stop + ' 52 ' + next + ' 48 ' + next + ' 100';
    const road = element('div', 'curriculum-road');
    road.setAttribute('aria-hidden', 'true');
    road.innerHTML = '<svg viewBox="0 0 100 100" preserveAspectRatio="none"><path d="' + pathShape + '"/><path d="' + pathShape + '"/></svg>';
    if (status === 'completed') road.classList.add('is-traveled');
    item.style.setProperty('--stop', stop + '%');
    const anchor = link('#' + unit.id, '', 'curriculum-unit');
    anchor.dataset.unitId = unit.id;
    anchor.dataset.status = status;
    if (unit === selectedUnit) anchor.setAttribute('aria-current', 'page');
    const number = element('span', 'curriculum-unit-number curriculum-stop', String(unit.position));
    number.setAttribute('aria-hidden', 'true');
    const copy = element('div', '');
    copy.append(element('strong', '', unit.title), element('small', '', active === unit.position
      ? (testMode ? 'Paillette est ici · À tester' : status === 'upcoming' ? 'Paillette attend ici' : 'Paillette est ici')
      : statusLabels[status]));
    anchor.append(number, copy);
    item.append(road, anchor);
    if (unit.position === active) placeTraveler(item);
    units.append(item);
  }
  const destination = element('li', 'curriculum-trail-step curriculum-trail-end');
  destination.style.setProperty('--stop', castleStop + '%');
  const castle = art('assets/storybook/chateau-etoile.webp', 'curriculum-stop');
  const nextChapter = curriculum.chapters[curriculum.chapters.indexOf(chapter) + 1];
  const title = element('strong', '', nextChapter ? 'Château du chapitre' : 'Château final');
  const arrival = element('div', 'curriculum-arrival');
  arrival.append(title);
  if (!firstUnfinished && nextChapter) arrival.append(link('#' + nextChapter.id, 'Chapitre suivant →'));
  else arrival.append(element('small', '', firstUnfinished ? 'Au bout du sentier' : 'Parcours terminé !'));
  destination.append(castle, arrival);
  if (!firstUnfinished) placeTraveler(destination);
  units.append(destination);
  path.append(units);
  map.append(path);

  if (selectedUnit) {
    map.append(unitDetail(selectedUnit, getStatus(selectedUnit.id), pilot));
  }
  content.replaceChildren(header, map);
  return selectedUnit ? document.getElementById('curriculumUnitTitle') : heading;
}

async function openCatalogue() {
  const response = await fetch(new window.URL('../data/curriculum.v2.json?v=storybook-2', import.meta.url));
  if (!response.ok) throw new Error('Chargement du catalogue V2 : ' + response.status);
  const curriculum = createCurriculum(await response.json());
  if (testMode) {
    const banner = document.getElementById('curriculumNotice');
    banner.hidden = false;
    banner.textContent = 'Mode test · Toutes les unités et tous les blocs sont accessibles. ';
    banner.append(link(chapterMapUrl('chapitres', false), 'Revenir au parcours normal'));
  }
  function render(focus) {
    const pilot = new Map();
    try {
      for (const unit of curriculum.chapters.flatMap(chapter => chapter.units)) {
        pilot.set(unit.id, readPilotProgress(window.localStorage, unit.id, testMode));
      }
    } catch { /* Storage may be disabled. */ }
    const completedUnits = new Set([...pilot].filter(([, progress]) => progress?.completed).map(([id]) => id));
    const id = location.hash.slice(1);
    const unit = curriculum.getUnit(id);
    const chapter = curriculum.getChapter(unit?.chapterId ?? id);
    const heading = chapter
      ? chapterView(curriculum, chapter, unit, completedUnits, pilot)
      : chapterHome(curriculum, completedUnits, pilot);
    heading.tabIndex = -1;
    if (focus) {
      heading.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    }
  }

  render(false);
  window.addEventListener('hashchange', () => render(true));
  window.addEventListener('pageshow', event => { if (event.persisted) render(false); });
  window.addEventListener('storage', event => { if (event.key?.startsWith(pilotProgressKey)) render(false); });
}

openCatalogue().catch(error => {
  console.error(error);
  content.replaceChildren(element('h1', '', 'Le parcours est indisponible'), element('p', '',
    'Recharge cette page ou retrouve les activités actuelles avec le lien en haut.'));
});
