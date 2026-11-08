import { illustration } from '../illustrations.js';
import { createCurriculum } from '../learning/curriculum.js';
import { chapterPlayUrl } from '../learning/chapter-one.js';
import { pilotProgressKey, pilotQuestionCount, readPilotProgress } from '../learning/pilot-session.js';
import { WORLDS, worldPanorama } from './model.js';

const content = document.getElementById('curriculumContent');
const statusLabels = { completed: 'Terminée', available: 'Prochaine étape', upcoming: 'À venir' };
const blockIcons = ['sound', 'letters', 'gem', 'book'];

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
  const card = link('#' + chapter.id, '', 'curriculum-card tone-' + ['rose', 'mint', 'sky', 'lavender'][index]);
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
  const hero = element('div', 'curriculum-hero');
  const intro = element('div', '');
  intro.append(
    element('p', 'curriculum-label', 'Le livre de Paillette'),
    element('h1', '', 'Mon parcours de lecture'),
    element('p', '', 'Des premiers sons aux premières histoires. Ouvre un chapitre pour découvrir le voyage.')
  );
  const allUnits = curriculum.chapters.flatMap(chapter => chapter.units);
  const next = allUnits.find(unit => !completedUnits.has(unit.id));
  const destination = next ?? allUnits.at(-1);
  const progress = pilot.get(destination.id);
  const startLabel = !next ? 'Revoir le château final' : progress?.session || completedUnits.size
    ? 'Continuer mon aventure' : 'Commencer mon aventure';
  intro.append(link(chapterPlayUrl(destination.id), startLabel, 'curriculum-link curriculum-play-link'));
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
  const blocks = element('ol', 'curriculum-blocks');
  for (const block of unit.blocks) {
    const item = element('li', 'curriculum-block');
    item.dataset.blockId = block.id;
    const icon = element('span', 'curriculum-block-icon');
    icon.innerHTML = illustration(blockIcons[block.position - 1]);
    const copy = element('div', '');
    copy.append(
      element('small', 'curriculum-label', 'Bloc ' + block.position + ' · ' + block.questionCount + ' questions'),
      element('p', '', block.goal)
    );
    item.append(icon, copy);
    blocks.append(item);
  }
  const castle = element('p', 'curriculum-castle', 'Au bout des quatre blocs, le château !');
  castle.prepend(art('assets/storybook/chateau-etoile.webp'));
  detail.append(
    link('#' + unit.chapterId, '← Les unités', 'curriculum-link curriculum-unit-back'),
    element('p', 'curriculum-label', 'Unité ' + unit.position + ' · ' + statusLabels[status]),
    heading,
    blocks,
    castle
  );
  const progress = pilot.get(unit.id);
  if (status === 'upcoming') {
    detail.append(element('p', '', 'Termine l’unité précédente pour jouer à celle-ci.'));
  } else {
    const label = progress?.session && progress.session.cursor < pilotQuestionCount
      ? 'Reprendre l’unité' : progress?.completed ? 'Voir le château' : 'Jouer cette unité';
    detail.append(link(chapterPlayUrl(unit.id), label, 'curriculum-link curriculum-play-link'));
  }
  return detail;
}

function chapterView(curriculum, chapter, selectedUnit, completedUnits, pilot) {
  const heading = element('h1', '', chapter.title);
  const header = element('div', 'curriculum-chapter-header');
  header.append(link('#chapitres', '← Les chapitres'), heading, element('p', '', chapter.description));

  const map = element('div', selectedUnit ? 'curriculum-map has-unit' : 'curriculum-map');
  const units = element('ol', 'curriculum-units');
  units.setAttribute('aria-label', 'Unités du chapitre');
  for (const unit of chapter.units) {
    const status = curriculum.getUnitStatus(unit.id, completedUnits);
    const item = element('li', '');
    const anchor = link('#' + unit.id, '', 'curriculum-unit');
    anchor.dataset.unitId = unit.id;
    anchor.dataset.status = status;
    if (unit === selectedUnit) anchor.setAttribute('aria-current', 'page');
    const number = element('span', 'curriculum-unit-number', String(unit.position));
    number.setAttribute('aria-hidden', 'true');
    const copy = element('div', '');
    copy.append(element('strong', '', unit.title), element('small', '', statusLabels[status]));
    anchor.append(number, copy);
    item.append(anchor);
    units.append(item);
  }
  map.append(units);

  if (selectedUnit) {
    map.append(unitDetail(selectedUnit, curriculum.getUnitStatus(selectedUnit.id, completedUnits), pilot));
  }
  content.replaceChildren(header, map);
  return selectedUnit ? document.getElementById('curriculumUnitTitle') : heading;
}

async function openCatalogue() {
  const response = await fetch(new window.URL('../data/curriculum.v2.json', import.meta.url));
  if (!response.ok) throw new Error('Chargement du catalogue V2 : ' + response.status);
  const curriculum = createCurriculum(await response.json());
  function render(focus) {
    const pilot = new Map();
    try {
      for (const unit of curriculum.chapters.flatMap(chapter => chapter.units)) {
        pilot.set(unit.id, readPilotProgress(window.localStorage, unit.id));
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
