/* Rewards and unused spins stay on this browser; coins are counted, without a cash balance. */
export const PRIZES = [
  { id: 'candies', icon: '🍬', label: 'Des bonbons', color: '#f6c9dc' },
  { id: 'chocolate', icon: '🍫', label: 'Un morceau de chocolat', color: '#edd2ae' },
  { id: 'tv', icon: '📺', label: '10 minutes de télé', color: '#cce4e7' },
  { id: 'coin', icon: '🐷', label: 'Une pièce pour la tirelire', color: '#f4e3aa' }
];
export const SEGMENTS = [1, 3, 0, 3, 2, 3, 1, 3, 0, 3];
export const REWARD_KEY = 'licorne.rewards.v1';
export function dayKey(date = new Date()){
  return [date.getFullYear(), String(date.getMonth()+1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}
const empty = () => ({ version: 2, pending: 0, day: '', counts: [0,0,0,0], earlier: [0,0] });
const validInt = value => Number.isSafeInteger(value) && value >= 0;
const countsOf = (values,length) => Array.isArray(values) && values.length === length && values.every(validInt);
export function createRewards(storage, date = () => new Date()){
  let state = empty(), persistent = true;
  function load(){
    if(!persistent) return;
    try {
      const saved = JSON.parse(storage.getItem(REWARD_KEY));
      if(!saved || !validInt(saved.pending) || typeof saved.day !== 'string')return;
      if(saved.version === 2 && countsOf(saved.counts,4) && countsOf(saved.earlier,2)){
        state = {version:2,pending:saved.pending,day:saved.day,counts:[...saved.counts],earlier:[...saved.earlier]};
      }else if(saved.version === undefined && (countsOf(saved.counts,4) || countsOf(saved.counts,5))){
        const old = saved.counts, five = old.length === 5;
        // Keep old stories/unicorn wins separate, never relabel them as TV or coins.
        state = {version:2,pending:saved.pending,day:saved.day,counts:[old[0],old[1],0,five?old[3]:0],earlier:[old[2],old[five?4:3]]};
      }
    } catch(e){ persistent = false; }
  }
  load();
  function save(){
    try { storage.setItem(REWARD_KEY, JSON.stringify(state)); } catch(e){ persistent = false; }
  }
  function today(){
    const day = dayKey(date());
    if(state.day !== day){ state.day = day; state.counts = [0,0,0,0]; state.earlier = [0,0]; }
  }
  return {
    snapshot(){ load(); today(); return { ...state, counts: [...state.counts], earlier: [...state.earlier], persistent }; },
    earn(){ load(); today(); state.pending++; save(); },
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
