/* Non-monetary rewards and unused spins stay on this browser. */
export const PRIZES = [
  { id: 'candies', icon: '🍬', label: 'Des bonbons' },
  { id: 'chocolate', icon: '🍫', label: 'Un morceau de chocolat' },
  { id: 'story', icon: '📖', label: 'Une histoire en plus ce soir' },
  { id: 'unicorn', icon: '🦄💨', label: 'Le prout magique de Paillette !' }
];
export const SEGMENTS = [0, 3, 1, 3, 2, 3];
export const REWARD_KEY = 'licorne.rewards.v1';
export function dayKey(date = new Date()){
  return [date.getFullYear(), String(date.getMonth()+1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}
const empty = () => ({ pending: 0, day: '', counts: [0,0,0,0] });
const validInt = v => Number.isSafeInteger(v) && v >= 0;
export function createRewards(storage, date = () => new Date()){
  let state = empty(), persistent = true;
  function load(){
    if(!persistent) return;
    try {
      const saved = JSON.parse(storage.getItem(REWARD_KEY));
      if(saved && validInt(saved.pending) && typeof saved.day === 'string' &&
        Array.isArray(saved.counts) && [4,5].includes(saved.counts.length) && saved.counts.every(validInt)){
        // The old five-prize layout put the removed money prize at index 3.
        const counts = saved.counts.length === 5 ? saved.counts.filter((_,i) => i !== 3) : saved.counts;
        state = { pending: saved.pending, day: saved.day, counts };
      }
    } catch(e){ persistent = false; }
  }
  load();
  function save(){
    try { storage.setItem(REWARD_KEY, JSON.stringify(state)); } catch(e){ persistent = false; }
  }
  function today(){
    const day = dayKey(date());
    if(state.day !== day){ state.day = day; state.counts = [0,0,0,0]; }
  }
  return {
    snapshot(){ load(); today(); return { ...state, counts: [...state.counts], persistent }; },
    earn(){ load(); state.pending++; save(); },
    spin(random = Math.random){
      load();
      if(!state.pending) return null;
      const roll = random();
      if(!(roll >= 0 && roll < 1)) throw new RangeError('Invalid random value');
      const segment = Math.floor(roll * SEGMENTS.length), prize = SEGMENTS[segment];
      today();
      state.pending--; state.counts[prize]++;
      save();
      return { segment, prize: PRIZES[prize] };
    }
  };
}
