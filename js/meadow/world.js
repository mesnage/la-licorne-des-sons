import { PAINTED_WORLDS, paintedWorld } from './themes.js?v=choices-9';
/* Adapter shared by every workshop and curriculum exercise.
 * The iframe isolates the scene's SVG IDs/styles; answers/audio/storage stay in the host.
 */
export function createWorld(parent,{onReady=()=>{},onBiome=()=>{},onError=()=>{}}={}){
  let frame=null,sceneFrame=null,pendingResolve=null,scene=null,disposed=false,roadButtons=[],animation;
  let biome=paintedWorld(0),total=20,count=0,paused=false,first=true,loading=null,loadVersion=0,moveVersion=0;
  function clearChoices(resetRoad=true){
    for(const button of roadButtons){button.removeAttribute('data-road-stone');button.removeAttribute('data-road-layout');button.style.removeProperty('--road-x');button.style.removeProperty('--road-y');button.style.removeProperty('--road-w');button.style.removeProperty('--road-h');button.style.removeProperty('--road-font');}
    roadButtons=[];document.body.classList.remove('road-choices');if(resetRoad)scene?.setRoadChoices(0);
  }
  function positionChoices(){
    if(disposed)return;
    if(scene&&roadButtons.length){const positions=scene.roadLayout();for(const [i,button] of roadButtons.entries()){const p=positions[i];if(!p)continue;const layout=[p.x,p.y,p.width,p.height,button.textContent].join('|');if(button.dataset.roadLayout===layout)continue;button.dataset.roadLayout=layout;button.style.setProperty('--road-x',p.x+'px');button.style.setProperty('--road-y',p.y+'px');button.style.setProperty('--road-w',p.width+'px');button.style.setProperty('--road-h',p.height+'px');button.style.setProperty('--road-font',Math.max(22,Math.min(48,p.height*.44,p.width/(.55*(button.classList.contains('phonics-group')?button.textContent.length/2:button.textContent.length)+.5)))+'px');}}
    animation=window.requestAnimationFrame(positionChoices);
  }
  positionChoices();
  function loadTheme(next){
    if(disposed)return Promise.resolve(false);
    if(frame&&biome.id===next.id)return loading??Promise.resolve(true);
    const version=++loadVersion;
    pendingResolve?.(false);pendingResolve=null;
    if(frame&&frame!==sceneFrame)frame.remove();
    biome=next;
    const oldFrame=sceneFrame,oldScene=scene;
    oldScene?.setPaused(true);
    const candidate=document.createElement('iframe');
    candidate.className='painted-scene';candidate.title=next.name;
    candidate.tabIndex=-1;candidate.setAttribute('aria-hidden','true');
    candidate.style.visibility='hidden';
    frame=candidate;
    const promise=new Promise(resolve=>{
      pendingResolve=resolve;
      candidate.addEventListener('load',()=>{
        if(disposed||version!==loadVersion){candidate.remove();resolve(false);return;}
        const loaded=candidate.contentWindow.meadowScene;
        if(!loaded){onError('Le décor est indisponible. Recharge la page pour réessayer.');resolve(false);return;}
        scene=loaded;sceneFrame=candidate;scene.reset(total,count);scene.setRoadChoices(roadButtons.length);scene.setPaused(paused);
        oldScene?.destroy();oldFrame?.remove();candidate.style.visibility='visible';
        document.body.dataset.paintedHabitat=next.habitat;
        loading=null;pendingResolve=null;onBiome({...next,number:next.id+1});
        if(first){first=false;onReady();}
        resolve(true);
      },{once:true});
      candidate.addEventListener('error',()=>{onError('Le décor est indisponible.');resolve(false);},{once:true});
    });
    loading=promise;
    candidate.src=new window.URL('../../meadow-preview.html?scene&v=choices-9&habitat='+next.habitat+(parent.id==='pilotWorld'?'&reading':''),import.meta.url).href;
    parent.append(candidate);
    return promise;
  }
  void loadTheme(biome);
  return {
    reset(length,startWorld=0,at=0){
      ++moveVersion;clearChoices();total=length;count=at;scene?.reset(total,count);
      void loadTheme(paintedWorld(startWorld));
    },
    placeChoices(buttons=[],keepRoad=false){clearChoices(!keepRoad);if(!buttons.length)return;roadButtons=buttons;document.body.classList.add('road-choices');buttons.forEach(button=>button.setAttribute('data-road-stone',''));scene?.setRoadChoices(buttons.length);},
    async moveTo(at,options){
      clearChoices(false);const version=++moveVersion;
      if(loading&&!await loading)return false;
      if(disposed||version!==moveVersion)return false;
      const arrived=await (scene?.moveTo(at,options)??false);
      if(arrived&&version===moveVersion)count=at;
      return arrived&&version===moveVersion;
    },
    cancel(){++moveVersion;scene?.cancel();},
    quiet(){/* Ambient life remains active while the child reads. */},
    setPaused(value){paused=!!value;scene?.setPaused(value);},
    react(emotion){scene?.react(emotion);},
    setTheme(id){
      if(!PAINTED_WORLDS.some(world=>world.id===id))return false;
      void loadTheme(paintedWorld(id));return true;
    },
    state(){return {...(scene?.state()??{ready:false}),habitat:biome.habitat,theme:biome.id};},
    destroy(){clearChoices();disposed=true;window.cancelAnimationFrame(animation);scene?.destroy();++loadVersion;++moveVersion;pendingResolve?.(false);parent.replaceChildren();scene=null;}
  };
}
