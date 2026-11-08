// The original catalogue supplies the unit IDs, order and source corpus.
const count = ['oral_count', 'sound', 'Écoute le mot. Combien de syllabes entends-tu ?'];
const letters = ['sound_to_grapheme', 'letters', 'Écoute le son. Touche la lettre ou les lettres qui vont avec.'];
const decode = ['decode_word_audio', 'book', 'Lis la carte. Écoute les deux choix, puis touche ta réponse.'];
const listen = ['oral_vocabulary', 'sound', 'Écoute la phrase. Choisis ce que tu as entendu.'];
const picture = ['sentence_picture', 'book', 'Lis la phrase. Choisis la bonne réponse.'];
const assemble = ['assemble_word', 'letters', 'Écoute. Touche les deux morceaux dans l’ordre.'];
const fill = ['fill_grapheme', 'letters', 'Écoute le mot. Touche les lettres qui manquent.'];

const comprehension = [
  listen,
  ['grapheme_highlight', 'letters', 'Quelle lettre reste muette à la fin du mot ?'],
  picture,
  picture,
  ['morph_choice', 'letters', 'Combien y en a-t-il ? Touche le bon mot.'],
  ['morph_choice', 'letters', 'Lis le petit mot. Touche la forme qui va avec.'],
  ['sentence_picture', 'book', 'Lis. Qui fait l’action dans la deuxième phrase ?'],
  ['syntax_choice', 'book', 'Lis. La phrase dit oui, dit non ou pose une question ?'],
  ['sentence_picture', 'book', 'Lis la phrase. Touche le bon endroit.'],
  picture,
  ['story_listen_question', 'sound', 'Écoute l’histoire. Qui est le personnage principal ?'],
  ['story_read_question', 'book', 'Lis l’histoire. Qui fait l’action dans la deuxième phrase ?']
];

export const simpleProgrammeVersion = 3;
export const exerciseVersion = unit => unit.chapterId === 'C1' ? 2 : simpleProgrammeVersion;

export function simpleExercise(unit) {
  const [type, icon, instruction] = unit.chapterId === 'C1'
    ? (unit.position === 1 ? count : unit.position < 12 ? letters : decode)
    : unit.chapterId === 'C2' ? assemble : unit.chapterId === 'C3' ? fill : comprehension[unit.position - 1];
  return { type, icon, instruction };
}

export const simpleInstructionKey = instruction => 'simple:consigne:' + instruction;
