/**
 * The crossroads doors are painted inside the scene; their signs are the host's real answer buttons,
 * so handlers, focus and screen readers keep working. This module decides whether a set of answers
 * fits on doors, lays the buttons over them, and keeps them in place through rotations and resizes.
 */
const SIGN='data-road-door',PLACED='data-road-layout';
const VARS={x:'--road-x',y:'--road-y',width:'--road-w',height:'--road-h',reach:'--door-reach'};
const REMEASURE_EVERY=60; // fallback for positional changes; sizes invalidate immediately

export function createDoorSigns(doc,currentScene){
  const view=doc?.defaultView,body=doc?.body;
  let offered=[],signs=[],picked=-1,countdown=0;
  const observed=new Set();
  const observer=view?.ResizeObserver?new view.ResizeObserver(()=>{countdown=0;}):null;
  function watch(node){if(observer&&node&&!observed.has(node)){observer.observe(node);observed.add(node);}return node;}

  const pick=event=>{picked=signs.indexOf(event.currentTarget);};
  const label=button=>(button.firstElementChild?.textContent??button.textContent??'');
  function fits(){
    if(!offered.length)return false;
    const wide=(view?.innerWidth??390)>=560;
    return offered.length<=(wide?4:3)&&Math.max(...offered.map(b=>label(b).length))<=(wide?12:8);
  }
  function release(){
    for(const button of signs){
      button.removeAttribute(SIGN);button.removeAttribute(PLACED);
      for(const name of Object.values(VARS))button.style.removeProperty(name);
      button.removeEventListener?.('pointerdown',pick,true);button.removeEventListener?.('click',pick,true);
    }
    observer?.disconnect();observed.clear();
    signs=[];body?.classList.remove('road-choices');currentScene()?.setRoadChoices(0);
  }
  function hang(instant=false){
    signs=offered;countdown=0;body?.classList.add('road-choices');
    for(const button of signs){
      button.setAttribute(SIGN,'');
      // capture phase: the door is known before the host's own click handler reacts
      button.addEventListener?.('pointerdown',pick,true);button.addEventListener?.('click',pick,true);
    }
    measure();currentScene()?.setRoadChoices(signs.length,instant);
  }
  /** Doors when the answers fit, the host panel otherwise; re-decided whenever the screen changes. */
  function arrange(){
    const want=fits();
    if(want&&!signs.length)hang();else if(!want&&signs.length)release();
    return want;
  }
  /* The crossroads keeps clear of the host's header, crystal counter and question panel. */
  function measure(){
    const scene=currentScene();if(!view||!doc.querySelector||!scene?.setForkInsets)return;
    const box=selector=>{const node=watch(doc.querySelector(selector));if(!node||node.hidden)return null;const r=node.getBoundingClientRect();return r.width&&r.height?r:null;};
    const h=view.innerHeight,w=view.innerWidth;
    const header=box('.adventure-header')??box('#pilotUnitName')??box('header');
    const counter=box('#adventureHud')??box('#pilotProgress');
    const panel=watch(signs[0]?.closest?.('section,.pilot-panel'))?.getBoundingClientRect();
    const note=box('#adventureFeedback'),beside=panel&&panel.left>w*.25; // sideways phones put the prompt at the right
    scene.setForkInsets({
      top:Math.round(header?header.bottom:h*.08),
      hud:Math.round(counter&&counter.top<h*.4?counter.bottom:0),
      bottom:Math.round(panel&&panel.top>h*.4?panel.top:h*.8),
      low:beside?Math.round(note&&note.top>h*.5?note.top-4:h-8):0
    });
  }
  const onResize=()=>{countdown=0;if(offered.length)arrange();};
  view?.addEventListener?.('resize',onResize);view?.addEventListener?.('orientationchange',onResize);

  return {
    /** Offer a question's answer buttons; returns true when they became door signs. */
    offer(buttons){release();offered=buttons;picked=-1;return arrange();},
    clear(){offered=[];release();},
    /** A freshly loaded scene takes over the doors without replaying the fade. */
    adopt(){if(!signs.length)return;countdown=0;measure();currentScene()?.setRoadChoices(signs.length,true);},
    /** Called every scene frame: follow the doors. */
    follow(){
      const scene=currentScene();if(!scene||!signs.length)return;
      if(countdown--<=0){countdown=REMEASURE_EVERY;measure();}
      const slots=scene.roadLayout();
      for(const [i,button] of signs.entries()){
        const slot=slots[i];if(!slot)continue;
        const key=[slot.x,slot.y,slot.width,slot.height].map(Math.round).join('|');
        if(button.getAttribute(PLACED)===key)continue;
        button.setAttribute(PLACED,key);
        for(const [field,name] of Object.entries(VARS))button.style.setProperty(name,(slot[field]??0)+'px');
      }
    },
    get active(){return signs.length>0;},
    get picked(){return signs.length?picked:-1;},
    dispose(){offered=[];release();view?.removeEventListener?.('resize',onResize);view?.removeEventListener?.('orientationchange',onResize);}
  };
}
