/* La Licorne des Sons — mémoire du navigateur (étoiles, mots déjà vus) */
const store = {
  get(k, d){ try{ const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
};
let stars = store.get('licorne.stars', 0);
const seen = store.get('licorne.seen.v1', {});
export const getStars = () => stars;
export function addStar(){ stars++; store.set('licorne.stars', stars); return stars; }
export function markSeen(w){ seen[w] = Date.now(); store.set('licorne.seen.v1', seen); }
export { seen };
