import { reviewMode } from '../learning/curriculum-mode.js';
import { chapterMapUrl } from '../learning/chapter-one.js';

const suggestions = {
  C1: ['blend-simple', 'Réviser les syllabes'],
  C2: ['words-1', 'S’entraîner à lire des mots'],
  C3: ['sons', 'Réviser les voyelles nasales'],
  C4: ['sentence-copy-3', 'Reconstruire des phrases courtes'],
  C5: ['words-2', 'Relire des mots'],
  C6: ['sentence-copy-3', 'S’entraîner avec des phrases courtes']
};

export function revisionFor(unit) {
  if (unit.chapterId === 'C7') {
    const mode = unit.position > 3 ? 'listen' : 'copy';
    const length = [3, 3, 5][(unit.position - 1) % 3];
    return ['sentence-' + mode + '-' + length, 'Construire d’autres phrases'];
  }
  return suggestions[unit.chapterId];
}

export function revisionUrl(unit, testMode) {
  const [activity] = revisionFor(unit);
  return 'index.html?revision=' + activity + '&retour=' + unit.id + (testMode ? '&test=1' : '');
}

export function returnFromRevision(url) {
  const id = url.searchParams.get('retour');
  return /^C[1-7]-U\d{2}$/.test(id ?? '') ? chapterMapUrl(id, reviewMode(url)) : null;
}
