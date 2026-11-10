import { plain } from '../utils.js';

const phonemes = {
  A: 'a', E0: 'schwa', I: 'i', U: 'u', EE: 'e', EH: 'e-open',
  M: 'm', L: 'l', S: 's', R: 'r', F: 'f', P: 'p', T: 't', B: 'b',
  N: 'n', V: 'v', D: 'd', G: 'g', K: 'k', J: 'j', CH: 'ch', Z: 'z',
  OU: 'ou', ON: 'on', AN: 'an', IN: 'in', GN: 'gn'
};
const closedEu = new Set(['feu', 'bleu', 'deux', 'jeu', 'cheveux']);
// These are whole sound sequences, silent letters, or spellings with variable values.
const inContext = new Set(['h', 'w', 'x', 'oi', 'ui', 'oin', 'ill', 'ien', 'eil', 'ail', 'ouil', 'euil', 'tion']);

export function soundPrompt(target, mode) {
  const { g, p } = target;
  const word = plain(target.w);
  const example = 'w:' + word;
  if ((mode === 'consonnes' && g.length === 1) || g === 'h') return ['L:' + g, 250, example];
  if (inContext.has(g)) return [example];
  const id = g === 'o' ? 'o-open'
    : p === 'O' ? 'o'
    : p === 'EU' ? (closedEu.has(word) ? 'eu' : 'eu-open')
    : g === 'un' ? 'un'
    : g === 'y' ? 'yod'
    : phonemes[p];
  if (!id) throw new Error('Correspondance audio absente : ' + g);
  return ['P:robin:' + id, 250, example];
}
