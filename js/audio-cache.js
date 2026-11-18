/** Bounded decoded clips. Pending requests are shared; failures can be retried. */
export function createClipCache(limit=32){
  const ready=new Map(),pending=new Map();
  return {
    get(key,load){
      if(ready.has(key)){const clip=ready.get(key);ready.delete(key);ready.set(key,clip);return Promise.resolve(clip);}
      if(pending.has(key))return pending.get(key);
      const promise=Promise.resolve().then(load).catch(()=>null).then(clip=>{
        if(pending.get(key)!==promise)return clip;
        pending.delete(key);
        if(clip){ready.set(key,clip);while(ready.size>limit)ready.delete(ready.keys().next().value);}
        return clip;
      });
      pending.set(key,promise);return promise;
    },
    invalidate(key){ready.delete(key);pending.delete(key);},
    get size(){return ready.size;}
  };
}
