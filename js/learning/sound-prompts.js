import { plain } from '../utils.js?v=review-16';

const phonemes = {
  A: 'a', E0: 'schwa', I: 'i', U: 'u', EE: 'e', EH: 'e-open',
  M: 'm', L: 'l', S: 's', R: 'r', F: 'f', P: 'p', T: 't', B: 'b',
  N: 'n', V: 'v', D: 'd', G: 'g', K: 'k', J: 'j', CH: 'ch', Z: 'z',
  OU: 'ou', ON: 'on', AN: 'an', IN: 'in', GN: 'gn', ILL: 'yod'
};
const closedEu = new Set(['feu', 'bleu', 'deux', 'jeu', 'cheveux']);
const combined = new Set(['x', 'oi', 'ui', 'oin', 'ien', 'eil', 'ail', 'ouil', 'euil', 'tion']);
const vowelNames = { a:'a', e:'schwa', i:'i', o:'o', u:'u' };

export function letterName(g) {
  return vowelNames[g] ? 'P:robin:' + vowelNames[g] : 'LN:' + g;
}

export function soundPrompt(target, mode) {
  const { g, p } = target;
  const word = plain(target.w);
  const example = 'w:' + word;
  if ((mode === 'consonnes' && g.length === 1) || g === 'h' || g === 'ç') return [letterName(g), example];
  if (combined.has(g)) return ['PS:' + g, example];
  const id = g === 'o' ? 'o-open'
    : p === 'O' ? 'o'
    : p === 'EU' ? (closedEu.has(word) ? 'eu' : 'eu-open')
    : g === 'un' ? 'un'
    : g === 'w' ? (word === 'wagon' ? 'v' : 'w')
    : phonemes[p];
  if (!id) throw new Error('Correspondance audio absente : ' + g);
  return ['P:robin:' + id, example];
}
