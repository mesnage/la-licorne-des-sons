import { simpleProgrammeVersion } from '../data/curriculum-simple.js';
import { oralBlocks, oralWords, pilotUnitId } from '../data/curriculum-pilot.js';

export const pilotProgressKey = 'licorne.curriculum.pilot.v1';
export const pilotQuestionCount = oralBlocks.reduce((count, block) => count + block.length, 0);
const blockTypes = ['oral_count', 'oral_segment', 'oral_syllable_match', 'oral_count'];
const hasWord = id => Object.hasOwn(oralWords, id);
const audioKey = id => 'W:' + id;

export function createPilotQuestions(unit, manifest, seed) {
  if (unit?.id !== pilotUnitId || unit.blocks.length !== oralBlocks.length) {
    throw new Error('Unité pilote invalide');
  }
  const targets = new Set();
  return unit.blocks.flatMap((block, index) => {
    const rows = oralBlocks[index];
    const matching = block.exerciseType === 'oral_syllable_match';
    if (block.exerciseType !== blockTypes[index] || rows.length !== block.questionCount) {
      throw new Error('Bloc pilote invalide : ' + block.id);
    }
    return rows.map(([target, correct, distractor], position) => {
      const ids = matching ? [target, correct, distractor] : [target];
      if (targets.has(target) || new Set(ids).size !== ids.length ||
          !ids.every(id => hasWord(id) && Object.hasOwn(manifest, audioKey(id)))) {
        throw new Error('Stimulus pilote indisponible : ' + target);
      }
      targets.add(target);
      const syllables = oralWords[target];
      if (syllables.length < 1 || syllables.length > 4 || (matching &&
          (oralWords[correct][0] !== syllables[0] || oralWords[distractor][0] === syllables[0]))) {
        throw new Error('Segmentation pilote invalide : ' + target);
      }
      // Alternate the correct position, with a stable starting side per playthrough.
      const choices = matching
        ? ((seed + position) % 2 === 0 ? [correct, distractor] : [distractor, correct]).map(audioKey)
        : [];
      return {
        id: block.id + '-Q' + (position + 1),
        blockIndex: index,
        position,
        type: block.exerciseType,
        prompt: audioKey(target),
        choices,
        answer: matching ? choices.indexOf(audioKey(correct)) : syllables.length
      };
    });
  });
}

export function newPilotState(seed) {
  return { seed, cursor: 0, answers: [], wrong: 0, marks: 0 };
}

export function restorePilotState(value, length) {
  if (!value || !Number.isSafeInteger(value.seed) || value.seed < 0) return null;
  const { cursor, answers, wrong, marks } = value;
  if (!Number.isInteger(cursor) || cursor < 0 || cursor > length || !Array.isArray(answers) ||
      answers.length > length || answers.length < cursor || answers.length > cursor + 1 ||
      !answers.every(n => Number.isSafeInteger(n) && n >= 0) ||
      !Number.isSafeInteger(wrong) || wrong < 0 ||
      !Number.isInteger(marks) || marks < 0 || marks > 4) return null;
  const order = value.order ?? [];
  if (!Array.isArray(order) || order.length > 30 || new Set(order).size !== order.length ||
      order.some(index => !Number.isInteger(index) || index < 0 || index >= 30)) return null;
  return { seed: value.seed, cursor, answers: [...answers], wrong, marks, order: [...order] };
}

export function unitProgressKey(id, testMode = false, block) {
  if (testMode) return pilotProgressKey + '.test.' + id + (block ? '.B' + block : '');
  return id === pilotUnitId ? pilotProgressKey : pilotProgressKey + '.' + id;
}

export function readPilotProgress(storage, id = pilotUnitId, testMode = false, block) {
  try {
    const value = JSON.parse(storage.getItem(unitProgressKey(id, testMode, block)));
    if ([1, 2, simpleProgrammeVersion].includes(value?.version)) return value;
  } catch {
    // The pilot also works when browser storage is unavailable.
  }
  return null;
}

export function restoreProgrammeState(progress, length, version = simpleProgrammeVersion) {
  const state = restorePilotState(progress?.session, length);
  return progress?.version === version || (progress?.completed && state?.cursor === length)
    ? state : null;
}

export function createPilotSession(questions, state) {
  const order = state.order ??= [];
  const limit = questions[state.cursor]?.order?.length ?? 0;
  if (order.some(index => index >= limit)) order.length = 0;
  const snapshot = () => ({ ...state, answers: [...state.answers], order: [...order] });
  const solved = () => state.answers.length > state.cursor;
  const finished = () => state.cursor === questions.length;

  return {
    get question() { return questions[state.cursor]; },
    get solved() { return solved(); },
    get finished() { return finished(); },
    snapshot,
    toggleTile(index) {
      const words = questions[state.cursor]?.order;
      if (!words || solved() || !Number.isInteger(index) || index < 0 || index >= words.length) return;
      const position = order.indexOf(index);
      if (position < 0) order.push(index);
      else order.splice(position, 1);
    },
    orderIsCorrect() {
      const words = questions[state.cursor]?.order;
      return words?.length === order.length && order.every((index, position) => words[index] === words[position]);
    },
    answer(value) {
      const question = questions[state.cursor];
      if (!question || solved()) return null;
      const options = question.pictures ?? question.labels ?? question.choices;
      const valid = options.length
        ? Number.isInteger(value) && value >= 0 && value < options.length
        : question.counts ? question.counts.includes(value) : Number.isInteger(value) && value >= 1 && value <= 4;
      if (!valid) return null;
      if (value !== question.answer) {
        state.wrong++;
        return false;
      }
      state.answers.push(state.wrong);
      return true;
    },
    mark(delta) {
      if (questions[state.cursor]?.type === 'oral_segment' && !solved() && [1, -1].includes(delta)) {
        state.marks = Math.min(4, Math.max(0, state.marks + delta));
      }
      return state.marks;
    },
    advance() {
      if (!solved()) return false;
      state.cursor++;
      state.wrong = 0;
      state.marks = 0;
      order.length = 0;
      return true;
    }
  };
}
