/* La Licorne des Sons — mémoire du navigateur (étoiles, mots déjà vus) */
const store = {
  get(k, d){ try{ const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
};
let stars = store.get('licorne.stars', 0);
const seen = store.get('licorne.seen.v1', {});
const occurrences = store.get('licorne.occurrences.v1', { targets: {}, choices: {} });
export function recordRound(target, choices){
  occurrences.targets[target.g] = (occurrences.targets[target.g] || 0) + 1;
  for(const choice of choices) occurrences.choices[choice.g] = (occurrences.choices[choice.g] || 0) + 1;
  markSeen(target.w);
  store.set('licorne.occurrences.v1', occurrences);
}
export const getStars = () => stars;
export function addStar(){ stars++; store.set('licorne.stars', stars); return stars; }
export function markSeen(w){ seen[w] = Date.now(); store.set('licorne.seen.v1', seen); }
export { seen, occurrences };
