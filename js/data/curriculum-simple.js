// The original catalogue supplies the unit IDs, order and source corpus.
const count = ['oral_count', 'sound', 'Écoute le mot. Combien de syllabes entends-tu ?'];
const letters = ['sound_to_grapheme', 'letters', 'Écoute le son. Touche la lettre ou les lettres qui vont avec.'];
const decode = ['decode_word_audio', 'book', 'Lis la carte. Écoute les deux choix, puis touche ta réponse.'];
const listen = ['oral_vocabulary', 'sound', 'Écoute la phrase. Touche la bonne image.'];
const picture = ['sentence_picture', 'book', 'Lis la phrase. Touche la bonne image.'];

const comprehension = [
  listen,
  ['grapheme_highlight', 'letters', 'Quelle lettre reste muette à la fin du mot ?'],
  picture,
  picture,
  ['morph_choice', 'letters', 'Touche le mot qui va avec l’image.'],
  ['morph_choice', 'letters', 'Lis le petit mot. Touche la forme qui va avec.'],
  ['sentence_picture', 'book', 'Lis. Qui fait l’action dans la deuxième phrase ?'],
  ['syntax_choice', 'book', 'Lis. La phrase dit oui, dit non ou pose une question ?'],
  picture,
  picture,
  ['story_listen_question', 'sound', 'Écoute l’histoire. Qui est le personnage principal ?'],
  ['story_read_question', 'book', 'Lis l’histoire. Qui fait l’action dans la deuxième phrase ?']
];

export const simpleProgrammeVersion = 2;

export function simpleExercise(unit) {
  const [type, icon, instruction] = unit.chapterId === 'C1'
    ? (unit.position === 1 ? count : unit.position < 12 ? letters : decode)
    : unit.chapterId === 'C4' ? comprehension[unit.position - 1] : decode;
  return { type, icon, instruction };
}

export const simpleInstructionKey = instruction => 'simple:consigne:' + instruction;
