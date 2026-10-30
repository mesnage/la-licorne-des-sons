/* Editable vocabulary for Trouve le mot !
   audio: optional URL of a recording saying the FULL prompt, e.g. « Trouve le mot… maison ! ».
   speech: optional pronunciation override (never displayed as a hint).
   soundGroup: give homophones the SAME value, e.g. et/est → 'eh', to keep them out of one question.
   Add new words in teaching order; up to six unseen words enter the target pool per session. */
export const WORD_LEVELS = [
  { id: 1, title: 'Mes premiers mots', detail: 'De petits mots pour commencer', icon: '🌱' },
  { id: 2, title: 'Je reconnais les mots', detail: 'Des mots de tous les jours', icon: '🌷' },
  { id: 3, title: 'Je deviens un lecteur', detail: 'Des mots et de petites expressions', icon: '🌳' }
];
const word = (id, text, level, extra = {}) => ({ id, text, level, ...extra });
export const WORDS = [
  word('le', 'le', 1), word('la', 'la', 1), word('un', 'un', 1), word('une', 'une', 1),
  word('sur', 'sur', 1), word('dans', 'dans', 1), word('avec', 'avec', 1), word('pour', 'pour', 1),
  word('moi', 'moi', 1), word('toi', 'toi', 1), word('papa', 'papa', 1), word('maman', 'maman', 1),
  word('chat', 'chat', 1), word('lune', 'lune', 1), word('ecole', 'école', 1),
  word('lena', 'lena', 1, { speech: 'Léna' }), word('leon', 'léon', 1),
  word('caca', 'caca', 1), word('pipi', 'pipi', 1), word('prout', 'prout', 1),
  word('maison', 'maison', 2), word('petit', 'petit', 2), word('grand', 'grand', 2),
  word('merci', 'merci', 2), word('bonjour', 'bonjour', 2), word('encore', 'encore', 2),
  word('toujours', 'toujours', 2), word('beaucoup', 'beaucoup', 2), word('jamais', 'jamais', 2),
  word('demain', 'demain', 2), word('soleil', 'soleil', 2), word('bateau', 'bateau', 2),
  word('jardin', 'jardin', 2), word('jouer', 'jouer', 2),
  word('aujourdhui', 'aujourd’hui', 3), word('maintenant', 'maintenant', 3),
  word('pourquoi', 'pourquoi', 3), word('comment', 'comment', 3), word('bientot', 'bientôt', 3),
  word('quelquefois', 'quelquefois', 3), word('plusieurs', 'plusieurs', 3), word('ensemble', 'ensemble', 3),
  word('longtemps', 'longtemps', 3), word('parce-que', 'parce que', 3)
];
