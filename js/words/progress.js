export const WORD_PROGRESS_KEY = 'licorne.words.v1';
const integer = n => Number.isSafeInteger(n) && n >= 0;
function clean(value){
  if(!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([,s]) => s &&
    ['completed', 'firstTry', 'misses', 'streak'].every(k => integer(s[k])) &&
    s.firstTry <= s.completed && s.streak <= s.firstTry));
}
export function createWordProgress(storage){
  let stats = {}, persistent = true;
  function load(){
    if(!persistent) return;
    try { stats = clean(JSON.parse(storage.getItem(WORD_PROGRESS_KEY))); }
    catch(e){ persistent = false; }
  }
  function save(){
    try { storage.setItem(WORD_PROGRESS_KEY, JSON.stringify(stats)); }
    catch(e){ persistent = false; }
  }
  function update(id, change){
    load();
    const stat = Object.hasOwn(stats, id) ? stats[id] : { completed: 0, firstTry: 0, misses: 0, streak: 0 };
    change(stat); stats[id] = stat; save();
  }
  load();
  return {
    snapshot(){ load(); return JSON.parse(JSON.stringify(stats)); },
    get persistent(){ return persistent; },
    miss(id){ update(id, s => { s.misses++; s.streak = 0; }); },
    complete(id, firstTry){ update(id, s => {
      s.completed++;
      if(firstTry){ s.firstTry++; s.streak++; } else s.streak = 0;
    }); }
  };
}
