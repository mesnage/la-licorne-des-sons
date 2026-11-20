/**
 * Espace parents : suivi des progrès. Construit le contenu de la fenêtre à partir du suivi (js/learning/tracker.js).
 * Chargé seulement quand un parent ouvre la fenêtre ; rien ici ne tourne pendant le jeu.
 */
import { CATEGORIES, PATH_CATEGORIES, parseDay } from '../learning/tracker.js?v=suivi-1';

const COLORS = { letters: '#e2879d', sounds: '#5db59d', words: '#6aa3d8', sentences: '#9a86d3', path: '#d6a13f' };
const el = (tag, attrs = {}, ...children) => {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === false || value === null || value === undefined) continue;
    if (key === 'class') node.className = value; else if (key === 'text') node.textContent = value; else node.setAttribute(key, value === true ? '' : value);
  }
  node.append(...children.filter(child => child !== null && child !== undefined));
  return node;
};
const svg = (tag, attrs = {}) => { const node = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value); return node; };
const percent = value => value === null ? '–' : Math.round(value * 100) + ' %';
const plural = (n, one, many) => n + ' ' + (n > 1 ? many : one);
const dayFormat = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
const shortFormat = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const initial = date => 'DLMMJVS'[date.getDay()];
const niceMax = value => { if (value <= 4) return 4; const step = 10 ** Math.floor(Math.log10(value)), unit = value / step; return (unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 5 ? 5 : 10) * step; };

async function download(csv, name) {
  const blob = new window.Blob([csv], { type: 'text/csv;charset=utf-8' });
  const installed = window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;
  // Une application installée sur iPhone ou iPad n'a pas de dossier de téléchargements : on passe par la feuille de partage.
  if (installed && navigator.canShare) {
    try {
      const file = new window.File([blob], name, { type: 'text/csv' });
      if (navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Suivi des progrès' }); return 'shared'; }
    } catch (error) { if (error?.name === 'AbortError') return 'cancelled'; }
  }
  const url = window.URL.createObjectURL(blob), link = el('a', { href: url, download: name });
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => window.URL.revokeObjectURL(url), 4000);
  return 'saved';
}

function gauge(total) {
  const size = 132, radius = 54, length = 2 * Math.PI * radius;
  const root = svg('svg', { viewBox: `0 0 ${size} ${size}`, class: 'progress-ring', role: 'img', 'aria-label': `Score de progression : ${total} sur 100` });
  root.append(svg('circle', { cx: size / 2, cy: size / 2, r: radius, fill: 'none', stroke: '#f0e4ee', 'stroke-width': 13 }));
  const arc = svg('circle', { cx: size / 2, cy: size / 2, r: radius, fill: 'none', stroke: '#9a86d3', 'stroke-width': 13, 'stroke-linecap': 'round',
    'stroke-dasharray': `${(length * total / 100).toFixed(1)} ${length.toFixed(1)}`, transform: `rotate(-90 ${size / 2} ${size / 2})` });
  if (total > 0) root.append(arc);
  const value = svg('text', { x: size / 2, y: size / 2 + 4, 'text-anchor': 'middle', class: 'progress-ring-value' }); value.textContent = total;
  const unit = svg('text', { x: size / 2, y: size / 2 + 26, 'text-anchor': 'middle', class: 'progress-ring-unit' }); unit.textContent = 'sur 100';
  root.append(value, unit);
  return root;
}

function scoreCard(tracker) {
  const score = tracker.score(), path = score.categories.filter(item => PATH_CATEGORIES.includes(item.id));
  const rows = el('div', { class: 'progress-families' });
  for (const category of CATEGORIES.filter(item => PATH_CATEGORIES.includes(item.id))) {
    const item = path.find(entry => entry.id === category.id) ?? { score: 0, started: 0, exercises: 0 };
    const fill = el('span', { class: 'progress-family-fill' }); fill.style.width = item.score + '%'; fill.style.background = COLORS[category.id];
    rows.append(el('div', { class: 'progress-family' },
      el('span', { class: 'progress-family-name', text: category.label }),
      el('span', { class: 'progress-family-track', role: 'img', 'aria-label': `${category.label} : ${item.score} sur 100` }, fill),
      el('span', { class: 'progress-family-score', text: String(item.score) })));
  }
  return el('section', { class: 'progress-card', 'aria-labelledby': 'progressScoreTitle' },
    el('h3', { id: 'progressScoreTitle', text: 'Chemin d’apprentissage' }),
    el('div', { class: 'progress-score' }, gauge(score.total),
      el('div', { class: 'progress-score-text' },
        el('p', { class: 'progress-strong', text: `${score.started} exercice${score.started > 1 ? 's' : ''} commencé${score.started > 1 ? 's' : ''} sur ${score.exercises}` }),
        el('p', { text: 'Des lettres aux phrases : le score monte quand les réponses sont justes et que l’exercice a été assez pratiqué.' }))),
    rows,
    el('details', { class: 'progress-how' }, el('summary', { text: 'Comment ce score est calculé' }),
      el('p', { text: 'Pour chaque exercice : la réussite des 60 dernières réponses environ, multipliée par la pratique (complète à partir de 40 réponses). Chaque famille est la moyenne de ses exercices, et le score est la moyenne des quatre familles. C’est un repère pour suivre l’évolution, pas une note.' })));
}

function trendCard(tracker) {
  const state = { period: 'day', category: 'all', selected: -1 };
  const families = [{ id: 'all', label: 'Tout' }, ...CATEGORIES.filter(category => PATH_CATEGORIES.includes(category.id) || tracker.score().categories.some(item => item.id === category.id && item.answers))];
  const caption = el('p', { class: 'progress-eyebrow' }), big = el('p', { class: 'progress-big' }), detail = el('p', { class: 'progress-detail' });
  const chart = el('div', { class: 'progress-chart' }), range = el('p', { class: 'progress-range' });
  const segment = (items, key, label, kind = '') => {
    const group = el('div', { class: 'progress-segment' + kind, role: 'group', 'aria-label': label });
    for (const item of items) {
      const button = el('button', { type: 'button', 'data-value': item.id, 'aria-pressed': String(state[key] === item.id), text: item.label });
      button.addEventListener('click', () => { state[key] = item.id; state.selected = -1; for (const other of group.children) other.setAttribute('aria-pressed', String(other === button)); draw(); });
      group.append(button);
    }
    return group;
  };
  function label(bucket) {
    const start = parseDay(bucket.start);
    return state.period === 'week' ? `Semaine du ${shortFormat.format(start)} au ${shortFormat.format(parseDay(bucket.end))}` : dayFormat.format(start);
  }
  function summary(buckets) {
    const chosen = buckets[state.selected];
    const correct = chosen ? chosen.correct : buckets.reduce((sum, item) => sum + item.correct, 0), wrong = chosen ? chosen.wrong : buckets.reduce((sum, item) => sum + item.wrong, 0);
    const games = chosen ? chosen.completed : buckets.reduce((sum, item) => sum + item.completed, 0), answers = correct + wrong;
    caption.textContent = chosen ? label(chosen) : state.period === 'week' ? 'Les 12 dernières semaines' : 'Les 14 derniers jours';
    big.replaceChildren(el('strong', { text: String(answers) }), document.createTextNode(answers > 1 ? ' réponses' : ' réponse'));
    detail.textContent = answers ? `${percent(correct / answers)} de réussite · ${plural(correct, 'juste', 'justes')}, ${plural(wrong, 'erreur', 'erreurs')} · ${plural(games, 'partie terminée', 'parties terminées')}`
      : 'Aucune réponse sur cette période.';
  }
  function draw() {
    const buckets = tracker.series({ period: state.period, category: state.category }), top = niceMax(Math.max(...buckets.map(item => item.answers), 1));
    chart.replaceChildren();
    const grid = el('div', { class: 'progress-grid', 'aria-hidden': 'true' });
    for (const tick of [top, top / 2, 0]) grid.append(el('span', { text: String(tick) }));
    const bars = el('div', { class: 'progress-bars', role: 'group', 'aria-label': 'Réponses par ' + (state.period === 'week' ? 'semaine' : 'jour') });
    buckets.forEach((bucket, index) => {
      const start = parseDay(bucket.start), text = `${label(bucket)} : ${plural(bucket.correct, 'réponse juste', 'réponses justes')}, ${plural(bucket.wrong, 'erreur', 'erreurs')}`;
      const stack = el('span', { class: 'progress-stack' }), wrong = el('span', { class: 'progress-wrong' }), right = el('span', { class: 'progress-right' });
      wrong.style.height = (bucket.wrong / top * 100).toFixed(2) + '%'; right.style.height = (bucket.correct / top * 100).toFixed(2) + '%';
      stack.append(wrong, right);
      const tick = state.period === 'week' ? (index % 2 === buckets.length % 2 ? '' : start.getDate() + '/' + (start.getMonth() + 1)) : initial(start);
      const bar = el('button', { type: 'button', class: 'progress-bar' + (bucket.answers ? '' : ' empty'), 'aria-label': text, 'aria-pressed': String(index === state.selected), title: text }, stack, el('span', { class: 'progress-tick', 'aria-hidden': 'true', text: tick }));
      bar.addEventListener('click', () => { state.selected = state.selected === index ? -1 : index; for (const [i, other] of [...bars.children].entries()) other.setAttribute('aria-pressed', String(i === state.selected)); summary(buckets); });
      bars.append(bar);
    });
    chart.append(grid, bars);
    range.textContent = `Du ${shortFormat.format(parseDay(buckets[0].start))} au ${shortFormat.format(parseDay(buckets.at(-1).end))}`;
    summary(buckets);
  }
  const card = el('section', { class: 'progress-card', 'aria-labelledby': 'progressTrendTitle' },
    el('h3', { id: 'progressTrendTitle', text: 'Réponses' }),
    segment([{ id: 'day', label: 'Jours' }, { id: 'week', label: 'Semaines' }], 'period', 'Période'),
    segment(families, 'category', 'Type d’exercice', ' wrap'),
    el('div', { class: 'progress-summary', 'aria-live': 'polite' }, caption, big, detail),
    chart, range,
    el('p', { class: 'progress-legend', 'aria-hidden': 'true' }, el('span', { class: 'progress-dot right' }), document.createTextNode('Justes'), el('span', { class: 'progress-dot wrong' }), document.createTextNode('Erreurs')));
  draw();
  return card;
}

function tableCard(tracker) {
  const list = tracker.exercises(), body = el('tbody');
  for (const category of CATEGORIES) {
    const rows = list.filter(item => item.category === category.id && (PATH_CATEGORIES.includes(category.id) || item.answers || item.completed));
    if (!rows.length) continue;
    const dot = el('span', { class: 'progress-dot' }); dot.style.background = COLORS[category.id];
    body.append(el('tr', { class: 'progress-group' }, el('th', { colspan: '5', scope: 'colgroup' }, dot, document.createTextNode(category.label))));
    for (const item of rows) body.append(el('tr', { class: item.answers ? '' : 'untouched' },
      el('th', { scope: 'row', text: item.label.replace(/^Parcours · /, '') }),
      el('td', { text: String(item.correct) }), el('td', { text: String(item.wrong) }),
      el('td', { text: percent(item.allTimeAccuracy) }), el('td', { text: String(item.completed) })));
  }
  return el('section', { class: 'progress-card', 'aria-labelledby': 'progressTableTitle' },
    el('h3', { id: 'progressTableTitle', text: 'Par exercice' }),
    el('div', { class: 'progress-table-wrap' }, el('table', { class: 'progress-table' },
      el('thead', {}, el('tr', {}, el('th', { scope: 'col', text: 'Exercice' }), el('th', { scope: 'col', text: 'Justes' }), el('th', { scope: 'col', text: 'Erreurs' }), el('th', { scope: 'col', text: 'Réussite' }), el('th', { scope: 'col', text: 'Parties' }))),
      body)));
}

/** Remplit la fenêtre et l'ouvre. Rappelée à chaque ouverture pour afficher les derniers chiffres. */
export function openProgress(tracker, dialog) {
  const body = dialog.querySelector('#progressBody'), days = tracker.days();
  const status = el('p', { class: 'progress-status', role: 'status', 'aria-live': 'polite' });
  const button = el('button', { type: 'button', class: 'progress-download', id: 'progressDownload', text: 'Télécharger le fichier CSV', disabled: !days.length });
  button.addEventListener('click', async () => {
    const today = new Date(), name = `suivi-paillette-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}.csv`;
    const result = await download(tracker.toCSV(), name);
    status.textContent = result === 'cancelled' ? '' : result === 'shared' ? 'Fichier partagé.' : `Fichier « ${name} » enregistré dans les téléchargements.`;
  });
  body.replaceChildren(
    ...(days.length ? [] : [el('p', { class: 'progress-empty', text: 'Pas encore de réponses enregistrées. Le suivi commence dès la prochaine partie.' })]),
    scoreCard(tracker), trendCard(tracker), tableCard(tracker),
    el('div', { class: 'progress-actions' }, button, status),
    el('p', { class: 'progress-note', text: tracker.persistent
      ? 'Ces chiffres restent sur cet appareil et ne sont pas effacés quand le jeu se ferme. Ils s’ajoutent de jour en jour ; rien n’est envoyé ailleurs.'
      : 'La sauvegarde est bloquée sur cet appareil : ces chiffres ne seront gardés que pendant cette visite.' }));
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
}
