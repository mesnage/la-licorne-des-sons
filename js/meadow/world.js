import { PAINTED_WORLDS, paintedWorld } from './themes.js?v=review-16';
import { createDoorSigns } from './door-signs.js?v=review-16';
/* Adapter shared by every workshop and curriculum exercise.
 * The iframe isolates the scene's SVG IDs/styles; answers/audio/storage stay in the host.
 */
export function createWorld(parent,{onReady=()=>{},onBiome=()=>{},onError=()=>{}}={}){
  let frame=null,sceneFrame=null,pendingResolve=null,scene=null,disposed=false;
  let sceneBiome=paintedWorld(0),biome=paintedWorld(0),total=20,count=0,paused=false,first=true,loading=null,loadVersion=0,moveVersion=0,travelling=0,queuedTheme=null;
  const signs=createDoorSigns(parent.ownerDocument??document,()=>scene);
  function loadTheme(next,portal=false){
    if(disposed)return Promise.resolve(false);
    if(frame&&biome.id===next.id)return loading??Promise.resolve(true);
    const version=++loadVersion;
    pendingResolve?.(false);pendingResolve=null;
    if(frame&&frame!==sceneFrame)frame.remove();
    const oldBiome=sceneBiome;biome=next;
    const oldFrame=sceneFrame,oldScene=scene;
    oldScene?.setPaused(true);oldScene?.releaseScenery?.();
    const candidate=document.createElement('iframe');
    candidate.className='painted-scene';candidate.title=next.name;
    candidate.tabIndex=-1;candidate.setAttribute('aria-hidden','true');
    candidate.style.visibility='hidden';
    frame=candidate;
    const promise=new Promise(resolve=>{
      pendingResolve=resolve;
      const fail=()=>{
        if(disposed||version!==loadVersion){resolve(false);return;}
        candidate.remove();frame=oldFrame;biome=oldBiome;loading=null;pendingResolve=null;
        oldScene?.setPaused(paused);
        onError('Ce décor ne peut pas se charger. Tu peux réessayer ou continuer ici.');resolve(false);
      };
      candidate.addEventListener('load',()=>{
        if(disposed||version!==loadVersion){candidate.remove();resolve(false);return;}
        const loaded=candidate.contentWindow.meadowScene;
        if(!loaded){fail();return;}
        scene=loaded;scene.setLayoutListener?.(signs.follow);sceneBiome=next;sceneFrame=candidate;scene.reset(total,count);signs.adopt();scene.setPaused(paused);
        oldScene?.destroy();oldFrame?.remove();candidate.style.visibility='visible';if(portal)candidate.classList.add('portal-arrival');
        document.body.dataset.paintedHabitat=next.habitat;
        loading=null;pendingResolve=null;onBiome({...next,number:next.id+1});
        if(first){first=false;onReady();}
        resolve(true);
      },{once:true});
      candidate.addEventListener('error',fail,{once:true});
    });
    loading=promise;
    candidate.src=new window.URL('../../meadow-preview.html?scene&v=stability-18&habitat='+next.habitat+(parent.id==='pilotWorld'?'&reading':'')+(parent.ownerDocument?.location?.search.includes('perf')?'&perf':''),import.meta.url).href;
    parent.append(candidate);
    return promise;
  }
  void loadTheme(biome);
  return {
    reset(length,startWorld=0,at=0){
      ++moveVersion;travelling=0;queuedTheme=null;signs.clear();total=length;count=at;scene?.reset(total,count);
      void loadTheme(paintedWorld(startWorld));
    },
    /** Answers become signs on the crossroads doors when they are few and short enough to read there. */
    placeChoices(buttons=[]){if(!buttons.length){signs.clear();return false;}return signs.offer(buttons);},
    get forked(){return signs.active;},
    async moveTo(at,options){
      signs.clear();const version=++moveVersion;travelling=version;
      if(loading&&!await loading){if(travelling===version)travelling=0;return false;}
      if(disposed||version!==moveVersion)return false;
      const arrived=await (scene?.moveTo(at,options)??false);
      if(version===moveVersion){
        travelling=0;
        if(arrived){const crossed=!options?.returning&&at>count&&at%10===0&&at<total;count=at;const next=queuedTheme??(crossed?paintedWorld((biome.id+1)%PAINTED_WORLDS.length):null);queuedTheme=null;if(next)await loadTheme(next,crossed);}
      }
      return arrived&&version===moveVersion;
    },
    cancel(){++moveVersion;travelling=0;queuedTheme=null;scene?.cancel();},
    quiet(){/* Ambient life remains active while the child reads. */},
    setPaused(value){paused=!!value;scene?.setPaused(value);},
    react(emotion){
      if(signs.picked>=0&&(emotion==='proud'||emotion==='encouraging'))scene?.chooseDoor?.(signs.picked,emotion==='proud');
      scene?.react(emotion);
    },
    setTheme(id){
      if(!PAINTED_WORLDS.some(world=>world.id===id))return false;
      if(travelling){queuedTheme=paintedWorld(id);return true;}
      void loadTheme(paintedWorld(id));return true;
    },
    state(){return {...(scene?.state()??{ready:false}),habitat:biome.habitat,theme:biome.id,pendingTheme:queuedTheme?.id??null};},
    destroy(){signs.dispose();disposed=true;scene?.destroy();++loadVersion;++moveVersion;pendingResolve?.(false);parent.replaceChildren();scene=null;}
  };
}
