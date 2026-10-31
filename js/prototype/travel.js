import { pathPoint, WORLD_WIDTH } from './model.js';

// A fixed bridge spans two crystal stops. It stays in the world; it never follows the unicorn.
export const RAINBOW = { start:.25, end:.45, rise:210, band:10, bands:7 };
export function rainbowPoint(t){
  const p=Math.max(0,Math.min(1,t)),start=pathPoint(RAINBOW.start),end=pathPoint(RAINBOW.end);
  return {x:start.x+(end.x-start.x)*p,y:start.y+(end.y-start.y)*p-Math.sin(p*Math.PI)*RAINBOW.rise};
}
export function walkingPoint(progress){
  const ground=pathPoint(progress);
  if(progress<RAINBOW.start||progress>RAINBOW.end)return {...ground,onBridge:false,lift:0,angle:0};
  const t=(progress-RAINBOW.start)/(RAINBOW.end-RAINBOW.start),surface=rainbowPoint(t);
  const a=rainbowPoint(Math.max(0,t-.002)),b=rainbowPoint(Math.min(1,t+.002));
  const slope=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;
  return {...surface,onBridge:true,lift:ground.y-surface.y,angle:Math.max(-16,Math.min(16,slope))};
}
export function bridgeFocus(progress){
  // Smooth camera pullback starts before the obstacle and ends after its landing.
  if(progress<=.16||progress>=.54)return 0;
  const t=progress<.25?(progress-.16)/.09:progress>.45?(.54-progress)/.09:1;
  return t*t*(3-2*t);
}
export function birdPoint(index,seconds){
  const speed=14+(index%3)*3,phase=index*1.7;
  return {x:(100+index*395+seconds*speed)%WORLD_WIDTH,y:315+(index%3)*48+Math.sin(seconds*.65+phase)*18};
}

// A single filled ribbon avoids translucent stroke joins appearing as stripes on broad paths.
export function pathRibbon(width,offset=0,samples=180){
  const left=[],right=[];
  for(let i=0;i<=samples;i++){
    const progress=i/samples,p=pathPoint(progress),a=pathPoint(Math.max(0,progress-.001)),b=pathPoint(Math.min(1,progress+.001));
    const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy),nx=-dy/length,ny=dx/length;
    left.push({x:p.x+nx*(offset-width/2),y:p.y+ny*(offset-width/2)});
    right.push({x:p.x+nx*(offset+width/2),y:p.y+ny*(offset+width/2)});
  }
  return [...left,...right.reverse()];
}
