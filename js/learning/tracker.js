/**
 * Suivi pour les parents : nombre de réponses justes et fausses par exercice et par jour.
 * Les totaux restent sur l'appareil (localStorage) et ne contiennent ni nom ni réponse saisie.
 * Module pur : aucun accès au DOM, pour être testé avec Node.
 */
export const TRACKER_KEY = 'licorne.suivi.v1';
export const CATEGORIES = [
  { id: 'letters', label: 'Lettres' },
  { id: 'sounds', label: 'Sons' },
  { id: 'words', label: 'Mots' },
  { id: 'sentences', label: 'Phrases' },
  { id: 'path', label: 'Parcours guidé' }
];
/** Les quatre familles du menu forment le chemin d'apprentissage ; le parcours guidé est suivi à part. */
export const PATH_CATEGORIES = ['letters', 'sounds', 'words', 'sentences'];
const KEEP_DAYS = 800, RECENT_ANSWERS = 60, SOLID_ANSWERS = 40;

const pad = n => String(n).padStart(2, '0');
export const dayKey = date => date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
export const parseDay = key => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d, 12); };
const addDays = (date, n) => { const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + n, 12); return next; };
/** Lundi de la semaine qui contient cette date. */
export const weekStart = date => addDays(date, -((date.getDay() + 6) % 7));
const count = value => Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;

function clean(raw) {
  const data = { version: 1, days: {}, labels: {} };
  if (!raw || typeof raw !== 'object') return data;
  for (const [day, entries] of Object.entries(raw.days ?? {})) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !entries || typeof entries !== 'object') continue;
    const kept = {};
    for (const [id, value] of Object.entries(entries)) {
      if (!Array.isArray(value)) continue;
      const row = [count(value[0]), count(value[1]), count(value[2])];
      if (row[0] || row[1] || row[2]) kept[id] = row;
    }
    if (Object.keys(kept).length) data.days[day] = kept;
  }
  for (const [id, info] of Object.entries(raw.labels ?? {})) {
    if (info && typeof info.label === 'string' && typeof info.category === 'string') data.labels[id] = { label: info.label.slice(0, 80), category: info.category };
  }
  return data;
}

/**
 * @param storage  objet de type localStorage (ou null : le suivi reste alors en mémoire pour la visite)
 * @param catalogue liste ordonnée { id, label, category } des exercices du menu
 */
export function createTracker(storage, { now = () => new Date(), catalogue = [] } = {}) {
  let data = clean(null), persistent = false, memoryOnly = false;
  const known = new Map(catalogue.map((item, order) => [item.id, { ...item, order }]));
  function load() {
    if (!storage || memoryOnly) return;
    try { data = clean(JSON.parse(storage?.getItem(TRACKER_KEY) || 'null')); persistent = !!storage; }
    catch (error) { persistent = false; memoryOnly = true; }
  }
  function save() {
    const days = Object.keys(data.days).sort();
    for (const old of days.slice(0, Math.max(0, days.length - KEEP_DAYS))) delete data.days[old];
    if (memoryOnly) return;
    try { storage?.setItem(TRACKER_KEY, JSON.stringify(data)); persistent = !!storage; }
    catch (error) { persistent = false; memoryOnly = true; }
  }
  function row(id, info) {
    load();
    const day = dayKey(now());
    if (info?.label && !known.has(id)) data.labels[id] = { label: String(info.label).slice(0, 80), category: info.category || 'path' };
    return (data.days[day] ??= {})[id] ??= [0, 0, 0];
  }
  const describe = id => known.get(id) ?? { id, order: 1000, label: data.labels[id]?.label ?? id, category: data.labels[id]?.category ?? 'path' };
  const matches = (id, category) => !category || category === 'all' || describe(id).category === category;

  /** Totaux par exercice sur toute la période gardée, dans l'ordre du menu. */
  function exercises() {
    load();
    const totals = new Map();
    for (const day of Object.keys(data.days).sort()) for (const [id, [right, wrong, done]] of Object.entries(data.days[day])) {
      const item = totals.get(id) ?? { ...describe(id), id, correct: 0, wrong: 0, completed: 0, first: day, last: day, recent: [] };
      item.correct += right; item.wrong += wrong; item.completed += done; item.last = day;
      if (right || wrong) item.recent.push([right, wrong]);
      totals.set(id, item);
    }
    for (const item of catalogue) if (!totals.has(item.id)) totals.set(item.id, { ...describe(item.id), id: item.id, correct: 0, wrong: 0, completed: 0, first: null, last: null, recent: [] });
    return [...totals.values()].sort((a, b) => a.order - b.order || a.label.localeCompare(b.label, 'fr')).map(item => {
      const answers = item.correct + item.wrong;
      // Réussite récente : on remonte les jours jusqu'à réunir assez de réponses.
      let right = 0, total = 0;
      for (let i = item.recent.length - 1; i >= 0 && total < RECENT_ANSWERS; i--) { right += item.recent[i][0]; total += item.recent[i][0] + item.recent[i][1]; }
      const accuracy = total ? right / total : null, solidity = Math.min(1, answers / SOLID_ANSWERS);
      const rest = { ...item }; delete rest.recent; delete rest.order;
      return { ...rest, answers, accuracy, allTimeAccuracy: answers ? item.correct / answers : null, solidity, score: accuracy === null ? 0 : Math.round(100 * accuracy * solidity) };
    });
  }

  /** Score du chemin d'apprentissage : moyenne des familles, chacune étant la moyenne de ses exercices. */
  function score() {
    const list = exercises(), categories = [];
    for (const category of CATEGORIES) {
      const own = list.filter(item => item.category === category.id && (known.has(item.id) || item.answers));
      if (!own.length) continue;
      const answers = own.reduce((sum, item) => sum + item.answers, 0), correct = own.reduce((sum, item) => sum + item.correct, 0);
      categories.push({ ...category, exercises: own.length, started: own.filter(item => item.answers).length, answers, correct, wrong: answers - correct,
        accuracy: answers ? correct / answers : null, score: Math.round(own.reduce((sum, item) => sum + item.score, 0) / own.length) });
    }
    const path = categories.filter(item => PATH_CATEGORIES.includes(item.id));
    const total = path.length ? Math.round(path.reduce((sum, item) => sum + item.score, 0) / path.length) : 0;
    return { total, categories, started: list.filter(item => item.answers && PATH_CATEGORIES.includes(item.category)).length, exercises: catalogue.length };
  }

  /** Série pour le graphique : `count` jours ou semaines jusqu'à aujourd'hui, du plus ancien au plus récent. */
  function series({ period = 'day', count: size = period === 'week' ? 12 : 14, category = 'all' } = {}) {
    load();
    const today = now(), buckets = [];
    for (let i = size - 1; i >= 0; i--) {
      const start = period === 'week' ? addDays(weekStart(today), -7 * i) : addDays(today, -i);
      buckets.push({ start: dayKey(start), end: dayKey(period === 'week' ? addDays(start, 6) : start), correct: 0, wrong: 0, completed: 0, activeDays: 0 });
    }
    const index = new Map(buckets.map((bucket, i) => [bucket.start, i]));
    for (const [day, entries] of Object.entries(data.days)) {
      const date = parseDay(day), bucket = buckets[index.get(dayKey(period === 'week' ? weekStart(date) : date))];
      if (!bucket) continue;
      let active = false;
      for (const [id, [right, wrong, done]] of Object.entries(entries)) if (matches(id, category)) { bucket.correct += right; bucket.wrong += wrong; bucket.completed += done; active ||= right + wrong > 0; }
      if (active) bucket.activeDays++;
    }
    return buckets.map(bucket => ({ ...bucket, answers: bucket.correct + bucket.wrong, accuracy: bucket.correct + bucket.wrong ? bucket.correct / (bucket.correct + bucket.wrong) : null }));
  }

  /** Une ligne par jour et par exercice. Point-virgule et BOM : s'ouvre directement dans Excel et Numbers en français. */
  function toCSV() {
    load();
    const cell = value => /[";\n]/.test(String(value)) ? '"' + String(value).replace(/"/g, '""') + '"' : String(value);
    const category = id => CATEGORIES.find(item => item.id === id)?.label ?? id;
    const lines = [['date', 'famille', 'exercice', 'identifiant', 'reponses_justes', 'reponses_fausses', 'reussite_pourcent', 'parties_terminees']];
    for (const day of Object.keys(data.days).sort()) {
      const rows = Object.entries(data.days[day]).map(([id, values]) => ({ id, values, info: describe(id) })).sort((a, b) => a.info.order - b.info.order || a.id.localeCompare(b.id));
      for (const { id, values: [right, wrong, done], info } of rows) lines.push([day, category(info.category), info.label, id, right, wrong, right + wrong ? Math.round(100 * right / (right + wrong)) : '', done]);
    }
    return '﻿' + lines.map(line => line.map(cell).join(';')).join('\r\n') + '\r\n';
  }

  load();
  return {
    get persistent() { return persistent; },
    /** Une réponse évaluée (les étapes intermédiaires d'une phrase ne comptent pas). */
    record(id, correct, info) { if (!id) return; row(id, info)[correct ? 0 : 1]++; save(); },
    /** Une partie menée jusqu'au château. */
    complete(id, info) { if (!id) return; row(id, info)[2]++; save(); },
    exercises, score, series, toCSV,
    days() { load(); return Object.keys(data.days).sort(); },
    snapshot() { load(); return JSON.parse(JSON.stringify(data)); }
  };
}

/** Catalogue des exercices du menu à partir des chapitres : l'ordre du menu est celui du chemin d'apprentissage. */
export function menuCatalogue(chapters, items) {
  const titles = new Map(items.map(item => [item.id, item.title])), details = new Map(items.map(item => [item.id, item.detail]));
  const shared = new Set(items.filter(item => items.some(other => other !== item && other.title === item.title)).map(item => item.id));
  // Deux exercices du même nom (trois ou cinq mots) sont distingués par la fin de leur description.
  const label = id => shared.has(id) && details.get(id) ? titles.get(id) + ' · ' + String(details.get(id)).split(' · ').at(-1) : titles.get(id) ?? id;
  return chapters.flatMap(chapter => chapter.activities.map(id => ({ id, label: label(id), category: chapter.id })));
}
