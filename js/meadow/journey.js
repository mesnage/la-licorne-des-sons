/** Scene-clock journey shared by workshops and reading units; no wall-clock timers. */
export function createJourney({start=320,end=4420,step=0,reduced=false}={}){
  let total=20,count=0,x=start,paused=false,move=null;
  const clamp=n=>Math.max(0,Math.min(total,n));
  const point=n=>start+(step ? step*total : end-start)*clamp(n)/total;
  function cancel(){if(move){const pending=move;move=null;pending.resolve(false);}}
  return {
    reset(length,at=0){cancel();total=Math.max(1,length);count=clamp(at);x=point(count);},
    moveTo(at,{returning=false,gentle=false}={}){
      cancel();at=clamp(at);
      return new Promise(resolve=>{move={from:x,to:point(at),count:at,elapsed:0,duration:reduced?.01:returning?2.2:step?2.6:gentle?.65:1.8,returning,resolve};});
    },
    update(dt){
      if(paused||!move)return false;
      const m=move;m.elapsed+=Math.max(0,dt);const t=Math.min(1,m.elapsed/m.duration),e=t*t*(3-2*t);
      x=m.from+(m.to-m.from)*e;
      if(t===1){count=m.count;move=null;m.resolve(true);return true;}
      return false;
    },
    positionAt:point,
    setPaused(value){paused=!!value;},
    cancel,
    state(){return {total,count,x,moving:!!move,returning:!!move?.returning,paused};}
  };
}
