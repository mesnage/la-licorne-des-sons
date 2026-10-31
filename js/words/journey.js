/* Reuse the original stage, camera, character and crystal animations for word sessions.
   One shared stage avoids duplicate SVG gradient IDs and rendering two large worlds. */
import { BIOMES, stepForProgress } from '../data/path.js';
import { camTo, skyTo, placeUni, anim, mood, zone } from '../scene.js';
import { sfx } from '../audio.js';

export function createWordJourney(gems, questions){
  const stage = document.getElementById('scene');
  const parent = stage.parentNode, next = stage.nextSibling;
  let active = false, completed = 0, gemTimer = null;
  const crystalSteps = new Set(Array.from({length:questions},(_,i) => stepForProgress(i+1,questions)));
  function position(instant){
    const step = stepForProgress(completed, questions);
    camTo(step, instant); skyTo(step); placeUni(step, instant);
  }
  function release(){
    clearTimeout(gemTimer);
    if(!active) return;
    active = false;
    parent.insertBefore(stage, next);
    gems.forEach(g => { if(g){ g.hidden = false; g.classList.remove('got'); } });
  }
  return {
    start(slot){
      clearTimeout(gemTimer); active = true; completed = 0;
      slot.appendChild(stage);
      gems.forEach((g,i) => { if(g){ g.hidden = !crystalSteps.has(i); g.classList.remove('got'); } });
      stage.querySelector('#bubble').classList.remove('on');
      stage.querySelector('#zone').classList.remove('on');
      mood(''); position(true); zone(BIOMES[0].name);
    },
    advance(count){
      if(!active || count <= completed) return;
      clearTimeout(gemTimer); completed = count;
      position(false); anim('a-hop',1000); mood('happy',1200); sfx.hop();
      const step = stepForProgress(completed,questions);
      const biome = Object.keys(BIOMES).map(Number).filter(i => i <= step).at(-1);
      zone(BIOMES[biome].name);
      gemTimer = setTimeout(() => {
        if(active && gems[step]){ gems[step].classList.add('got'); sfx.gem(); }
      },1050);
    },
    resize(){ if(active) position(true); },
    release
  };
}
