import { PAINTED_WORLDS, paintedWorld } from './themes.js?v=portals-12';
/* Adapter shared by every workshop and curriculum exercise.
 * The iframe isolates the scene's SVG IDs/styles; answers/audio/storage stay in the host.
 */
export function createWorld(parent,{onReady=()=>{},onBiome=()=>{},onError=()=>{}}={}){
  let frame=null,sceneFrame=null,pendingResolve=null,scene=null,disposed=false,roadButtons=[];
  let sceneBiome=paintedWorld(0),biome=paintedWorld(0),total=20,count=0,paused=false,first=true,loading=null,loadVersion=0,moveVersion=0,travelling=0,queuedTheme=null;
  function clearChoices(resetRoad=true){
    for(const button of roadButtons){button.removeAttribute('data-road-stone');button.removeAttribute('data-road-layout');button.removeAttribute('data-road-surface');button.style.removeProperty('--road-x');button.style.removeProperty('--road-y');button.style.removeProperty('--road-w');button.style.removeProperty('--road-h');button.style.removeProperty('--road-font');}
    roadButtons=[];document.body.classList.remove('road-choices');if(resetRoad)scene?.setRoadChoices(0);
  }
  function positionChoices(){
    if(disposed)return;
    if(scene&&roadButtons.length){const positions=scene.roadLayout();for(const [i,button] of roadButtons.entries()){const p=positions[i];if(!p)continue;const layout=[p.x,p.y,p.width,p.height,p.surface,button.textContent].join('|');if(button.dataset.roadLayout===layout)continue;button.dataset.roadLayout=layout;button.setAttribute('data-road-surface',p.surface??'trail');button.style.setProperty('--road-x',p.x+'px');button.style.setProperty('--road-y',p.y+'px');button.style.setProperty('--road-w',p.width+'px');button.style.setProperty('--road-h',p.height+'px');button.style.setProperty('--road-font',Math.max(22,Math.min(48,p.height*.44,p.width/(.55*(button.classList.contains('phonics-group')?button.textContent.length/2:button.textContent.length)+.5)))+'px');}}

  }
  function loadTheme(next,portal=false){
    if(disposed)return Promise.resolve(false);
    if(frame&&biome.id===next.id)return loading??Promise.resolve(true);
    const version=++loadVersion;
    pendingResolve?.(false);pendingResolve=null;
    if(frame&&frame!==sceneFrame)frame.remove();
    const oldBiome=sceneBiome;biome=next;
    const oldFrame=sceneFrame,oldScene=scene;
    oldScene?.setPaused(true);
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
        scene=loaded;scene.setLayoutListener?.(positionChoices);sceneBiome=next;sceneFrame=candidate;scene.reset(total,count);scene.setRoadChoices(roadButtons.length);scene.setPaused(paused);
        oldScene?.destroy();oldFrame?.remove();candidate.style.visibility='visible';if(portal)candidate.classList.add('portal-arrival');
        document.body.dataset.paintedHabitat=next.habitat;
        loading=null;pendingResolve=null;onBiome({...next,number:next.id+1});
        if(first){first=false;onReady();}
        resolve(true);
      },{once:true});
      candidate.addEventListener('error',fail,{once:true});
    });
    loading=promise;
    candidate.src=new window.URL('../../meadow-preview.html?scene&v=portals-12&habitat='+next.habitat+(parent.id==='pilotWorld'?'&reading':'')+(parent.ownerDocument?.location?.search.includes('perf')?'&perf':''),import.meta.url).href;
    parent.append(candidate);
    return promise;
  }
  void loadTheme(biome);
  return {
    reset(length,startWorld=0,at=0){
      ++moveVersion;travelling=0;queuedTheme=null;clearChoices();total=length;count=at;scene?.reset(total,count);
      void loadTheme(paintedWorld(startWorld));
    },
    placeChoices(buttons=[],keepRoad=false){clearChoices(!keepRoad);if(!buttons.length)return;roadButtons=buttons;document.body.classList.add('road-choices');buttons.forEach(button=>button.setAttribute('data-road-stone',''));scene?.setRoadChoices(buttons.length);},
    async moveTo(at,options){
      clearChoices(false);const version=++moveVersion;travelling=version;
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
    react(emotion){scene?.react(emotion);},
    setTheme(id){
      if(!PAINTED_WORLDS.some(world=>world.id===id))return false;
      if(travelling){queuedTheme=paintedWorld(id);return true;}
      void loadTheme(paintedWorld(id));return true;
    },
    state(){return {...(scene?.state()??{ready:false}),habitat:biome.habitat,theme:biome.id,pendingTheme:queuedTheme?.id??null};},
    destroy(){clearChoices();disposed=true;scene?.destroy();++loadVersion;++moveVersion;pendingResolve?.(false);parent.replaceChildren();scene=null;}
  };
}
