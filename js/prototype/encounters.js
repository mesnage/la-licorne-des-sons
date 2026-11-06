// The travelling visitor chases a small treasure, catches it, then rests.
const scenes={
  forest:{animal:'world-fauna',frame:0,token:'glow-mote',size:24,altitude:115,arc:38},
  jungle:{animal:'world-fauna',frame:2,token:'butterfly',size:26,altitude:100,arc:50},
  beach:{animal:'world-fauna',frame:8,token:'trail-details',tokenFrame:6,size:37,altitude:-58,arc:0},
  ice:{animal:'world-fauna',frame:9,token:'trail-details',tokenFrame:8,size:35,altitude:-50,arc:5},
  clouds:{animal:'world-fauna',frame:11,token:'glow-mote',size:28,altitude:108,arc:58},
  moon:{animal:'coastal-fauna',frame:0,token:'trail-details',tokenFrame:12,size:38,altitude:-48,arc:62}
};

export function createEncounter(scene,habitat){
  const spec=scenes[habitat];
  if(!spec)return null;
  const group=scene.add.container(0,0).setDepth(4.2);
  const token=scene.add.image(0,0,spec.token,spec.tokenFrame??0).setDisplaySize(spec.size,spec.size);
  const animal=scene.add.image(0,0,spec.animal,spec.frame).setOrigin(.5,.98).setDisplaySize(114,80);
  group.add([token,animal]);
  return {group,token,animal,spec,habitat,start:0,cheer:-10};
}

export function poseEncounter(e,seconds,anchor,ground,reduced){
  const t=reduced?3:(seconds-e.start)%14;
  const progress=Math.min(1,Math.max(0,(t-1)/5));
  const chase=progress*progress*(3-2*progress);
  const returnTrip=t>8;
  const retreat=Math.min(1,Math.max(0,(t-8)/5));
  const travel=chase-retreat*retreat*(3-2*retreat);
  const stride=Math.sin(travel*Math.PI*4);
  const applause=Math.max(0,1-(seconds-e.cheer)/1.4);
  const lift=reduced?0:Math.sin(applause*Math.PI)*18;
  const x=anchor+travel*105;
  e.group.setPosition(x,ground-e.spec.altitude);
  const active=t>1&&t<6||t>8&&t<13;
  e.animal.setPosition(0,-Math.abs(stride)*e.spec.arc-lift).setFlipX(returnTrip);
  e.animal.setFrame(e.spec.frame+((active&&stride>.05||applause>.1)?(e.habitat==='moon'?3:4):0));
  e.animal.angle=e.habitat==='ice'&&active?stride*9:0;
  e.token.setPosition(104-travel*105,-8-(e.spec.altitude>0?Math.sin(t*2)*7:0));
  e.token.alpha=t>6&&t<8?.4:1;
}
