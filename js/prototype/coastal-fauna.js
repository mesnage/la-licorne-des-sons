// The two drawings of each animal share a ground line and the same scale.
const species={
  bunny:{frame:0,width:122,stride:31},
  hedgehog:{frame:1,width:86,stride:16},
  deer:{frame:2,width:184,stride:45},
  fox:{frame:6,width:145,stride:35},
  turtle:{frame:7,width:88,stride:18},
  cow:{frame:8,width:194,stride:43}
};

export function createCoastalAnimal(scene,kind,x,y){
  const {frame,width}=species[kind];
  const root=scene.add.container(x,y);
  const shadow=scene.add.ellipse(0,-1,width*.45,6,0x42452e,.16);
  const drawing=scene.add.image(0,0,'coastal-fauna',frame).setOrigin(.5,.99).setScale(width/400);
  root.add([shadow,drawing]);
  root.painted={shadow,drawing};
  return root;
}

export function poseCoastalAnimal(friend,pose,seconds,reduced=false){
  const {frame,width,stride}=species[friend.kind];
  const {shadow,drawing}=friend.painted;
  const phase=pose.offset/stride*Math.PI*2;
  const step=pose.walking && !reduced;
  const lift=step && friend.kind==='bunny' ? (1-Math.cos(phase))*5*pose.activity : 0;
  const greeting=Math.max(0,Math.min(1,(friend.greetingUntil-seconds)/1.5));
  const grazing=friend.kind==='cow' && !step && !reduced && Math.sin(seconds*.61+friend.baseX)>.5;
  drawing.setFrame(frame+((step && Math.cos(phase)<0)||grazing?3:0)).setFlipX(pose.facing<0);
  drawing.y=-lift;
  drawing.angle=reduced?0:pose.facing*(Math.sin(phase)*pose.activity*1.7-4*Math.sin(Math.PI*greeting));
  const breath=reduced?0:Math.sin(seconds*1.65+friend.baseX)*.009;
  drawing.setScale(width/400,width/400*(1+breath));
  shadow.scaleX=1-lift*.025;
}
