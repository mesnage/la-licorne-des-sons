export const SESSION_LENGTH = 10;
const normalized = text => text.normalize('NFC').toLocaleLowerCase('fr').replace(/’/g, "'").trim();
const sound = word => word.soundGroup || normalized(word.text);
export function shuffle(items, random = Math.random){
  const result = [...items];
  for(let i = result.length - 1; i > 0; i--){
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export const mastered = stat => (stat?.streak || 0) >= 3;
export function practiceWeight(stat){
  if(mastered(stat)) return .5;
  return 1 + Math.min(4, stat?.misses || 0) / (1 + (stat?.firstTry || 0));
}
export function introducedPool(words, level, stats){
  const pool = words.filter(w => w.level === level);
  const known = w => (stats[w.id]?.completed || 0) + (stats[w.id]?.misses || 0) > 0;
  const newWords = pool.filter(w => !known(w)).slice(0, 6);
  return pool.filter(w => known(w) || newWords.includes(w));
}
export function chooseTarget(pool, stats, previousId, random = Math.random){
  const candidates = pool.filter(w => w.id !== previousId);
  if(!candidates.length) throw new Error('At least two target words are required');
  const total = candidates.reduce((n,w) => n + practiceWeight(stats[w.id]), 0);
  let ticket = random() * total;
  for(const w of candidates){
    ticket -= practiceWeight(stats[w.id]);
    if(ticket < 0) return w;
  }
  return candidates[candidates.length - 1];
}
export function makeQuestion(target, pool, random = Math.random){
  const choices = [target];
  for(const candidate of shuffle(pool, random)){
    if(choices.some(w => w.id === candidate.id || normalized(w.text) === normalized(candidate.text) || sound(w) === sound(candidate))) continue;
    choices.push(candidate);
    if(choices.length === 4) break;
  }
  if(choices.length !== 4) throw new Error('A level needs at least four distinguishable words');
  return { target, choices: shuffle(choices, random) };
}
export class QuestionSession {
  constructor(questions){
    if(!questions.length) throw new Error('A session needs questions');
    this.questions = questions;
    this.index = 0; this.score = 0; this.missed = false; this.phase = 'question';
  }
  get current(){ return this.questions[this.index]; }
  answer(id){
    if(this.phase !== 'question' || !this.current.choices.some(w => w.id === id)) return null;
    if(id !== this.current.target.id){
      const firstMistake = !this.missed;
      this.missed = true;
      return { correct: false, firstMistake };
    }
    const firstTry = !this.missed;
    if(firstTry) this.score++;
    this.phase = 'feedback';
    return { correct: true, firstTry };
  }
  next(){
    if(this.phase !== 'feedback') return false;
    this.index++; this.missed = false;
    this.phase = this.index === this.questions.length ? 'finished' : 'question';
    return true;
  }
}

export class WordSession extends QuestionSession {
  constructor(words, level, stats = {}, random = Math.random, previousId){
    const pool = introducedPool(words, level, stats);
    const questions = [];
    let previous = previousId;
    for(let i = 0; i < SESSION_LENGTH; i++){
      const target = chooseTarget(pool, stats, previous, random);
      questions.push(makeQuestion(target, pool, random));
      previous = target.id;
    }
    super(questions);
  }
}
