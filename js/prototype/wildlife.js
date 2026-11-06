// Small articulated storybook animals. SVG parts are rasterized once and shared;
// continuous poses animate their joints without replacing whole-body frames.
export const RIGGED_ANIMALS=['bunny','fox','turtle','hedgehog','deer','cow'];
const svg=(w,h,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
const coats={bunny:['#fff8ec','#e8d6bf','#b99e86'],fox:['#f5c17f','#ce824d','#925231'],turtle:['#b5dca2','#6eaa79','#3e7058'],hedgehog:['#e9c6a1','#b78863','#745441'],deer:['#e8bb83','#b87f51','#784c39'],cow:['#fff4dc','#e4d1ad','#9c876f']};
function part(kind,name,w,h,art){
 const [light,mid,dark]=coats[kind],id=kind+'-'+name;
 return {width:w,height:h,source:svg(w,h,`<defs><radialGradient id="${id}" cx="28%" cy="18%" r="90%"><stop stop-color="${light}"/><stop offset=".57" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/></radialGradient><linearGradient id="${id}-cream" x2=".4" y2="1"><stop stop-color="#fffdf1"/><stop offset="1" stop-color="#dfc9ad"/></linearGradient></defs>${art.replaceAll('$coat',`url(#${id})`).replaceAll('$cream',`url(#${id}-cream)`)}`)};
}
const eye=(x,y,blink)=>blink?`<path d="M${x-5} ${y}q5 5 10-1" stroke="#3c3337" stroke-width="2.5" stroke-linecap="round" fill="none"/>`:`<ellipse cx="${x}" cy="${y}" rx="5" ry="6.5" fill="#42373c"/><circle cx="${x-1.5}" cy="${y-2}" r="2" fill="#fffdf3"/><circle cx="${x+2}" cy="${y+2}" r=".8" fill="#d4bc9c"/>`;
export function animalParts(kind,blink=false){
 const bunny=kind==='bunny',fox=kind==='fox',turtle=kind==='turtle',hog=kind==='hedgehog',deer=kind==='deer',cow=kind==='cow';
 let body='',head='',ear='',tail='',leg='';
 if(turtle){
  body='<path d="M10 68Q6 11 61 8q54 0 59 60Z" fill="$coat" stroke="#456f50" stroke-width="2"/><path d="m49 13 26 0 18 24-13 24H43L28 36Z" fill="#75a56a" stroke="#d4d69a" stroke-width="2"/><path d="m49 13-8-3M28 36 9 39m34 22-13 9m50-9 12 9m1-33 25 5M61 14v44" stroke="#d1cf91" stroke-width="2" fill="none"/><path d="M6 68q57 13 116 0v8q-58 15-116 0Z" fill="#d0ce91"/><path d="M25 29q9-13 20-14" stroke="#deecbb" stroke-width="4" opacity=".65" fill="none" stroke-linecap="round"/>';
  head='<path d="M8 58q-6-30 17-41 22-13 40 8 21 24-4 36-21 16-53-3Z" fill="$coat"/><path d="M25 52q12 12 29 4" stroke="#548365" stroke-width="2" fill="none" stroke-linecap="round"/>'+eye(49,33,blink)+'<circle cx="63" cy="39" r="1.6" fill="#47775a"/><g fill="#d9e7b7" opacity=".8"><circle cx="23" cy="32" r="3"/><circle cx="30" cy="24" r="2"/><circle cx="34" cy="41" r="2"/></g>';
  leg='<path d="M8 4q20-4 23 16l4 12q-11 12-31 0L1 22Z" fill="$coat"/><path d="m9 29 1 6m8-7 1 7m8-8 2 6" stroke="#e6e1b9" stroke-width="2"/>';
  tail='<path d="M33 15Q10 10 2 23q17 8 31 3Z" fill="$coat"/>';
 }else{
  body=hog?'<path d="M8 69 5 55l8-4-2-13 10-1 2-13 11 3 7-13 10 6 12-13 9 9 14-8 6 12 13-3 4 14 12 3-1 14 9 10-7 12Z" fill="#795745"/>':'<ellipse cx="65" cy="45" rx="54" ry="35" fill="$coat"/><path d="M27 55q37 27 78 1-21 33-57 19Z" fill="$cream" opacity=".8"/>';
  if(hog)for(let i=0;i<27;i++){const x=19+i*29%89,y=23+i*17%40;body+=`<path d="m${x} ${y} 4-7" fill="none" stroke="${i%2?'#c09a70':'#ab805d'}" stroke-width="1.8" stroke-linecap="round"/>`;}
  if(cow)body+='<path d="M27 17q23-8 26 10t-17 22q-17-2-17-15Zm51-4q27 3 24 24-14 13-28 1Z" fill="#826452"/><path d="M37 57q14-7 18 5-4 15-19 9Z" fill="#a17c5c"/>';
  if(deer)body+='<path d="M83 64Q89 24 105 3l15 2q-15 38 1 56Z" fill="$coat"/><path d="M103 20q-7 24-3 35" stroke="#f3d5ab" stroke-width="4" opacity=".5" fill="none"/>';
  if(deer)for(let i=0;i<8;i++)body+=`<ellipse cx="${30+i*19%70}" cy="${25+i*11%25}" rx="3.4" ry="2.3" fill="#fae4bc"/>`;
  if(fox)body+='<path d="M87 30q25 8 28 22-11 15-22 9Z" fill="$cream"/>';
  // Short contour strokes add coat texture, not a full-surface noise filter.
  if(!hog)for(let i=0;i<(cow?6:deer?12:18);i++){const x=26+i*23%76,y=25+i*13%35;body+=`<path d="m${x} ${y} 3-1m-1 4 3-1" stroke="${coats[kind][0]}" stroke-width="1.2" opacity=".24" stroke-linecap="round"/>`;}
  head=hog?'<path d="M12 57Q4 27 32 18q25-3 43 30l-17 15Z" fill="$coat"/><ellipse cx="73" cy="48" rx="5" ry="4" fill="#483b37"/>':fox?'<path d="M8 18q39-18 58 20L77 50q-33 31-61 7Z" fill="$coat"/><path d="M13 40q20 4 31 13l31-5q-20 29-51 13Z" fill="$cream"/><ellipse cx="73" cy="49" rx="4" ry="3" fill="#51403a"/>':cow?'<path d="M13 11q43-13 50 25l7 24q-25 15-54-1Z" fill="$coat"/><ellipse cx="44" cy="57" rx="29" ry="16" fill="#db9fa0"/><g fill="#a9757d"><ellipse cx="32" cy="58" rx="3" ry="4"/><ellipse cx="54" cy="58" rx="3" ry="4"/></g><path d="M13 14 7 2q-1 15 5 22m42-10L61 2q6 15-3 22" fill="#e4cd98"/>':deer?'<path d="M15 13q32-17 45 17l12 21q-5 19-24 16L18 57Z" fill="$coat"/><path d="M47 50q16-5 25 1-8 21-25 12Z" fill="$cream"/><ellipse cx="69" cy="52" rx="4" ry="3" fill="#58413c"/>':'<path d="M10 27Q18 1 48 12q24 10 22 37-8 26-37 20Q7 66 10 27Z" fill="$coat"/><ellipse cx="51" cy="54" rx="22" ry="15" fill="$cream"/><path d="m66 48 7 4-7 4Z" fill="#c08c91"/>';
  head+=eye(hog?49:fox?49:45,hog?36:fox?32:33,blink);
  head+=`<ellipse cx="${hog?47:fox?48:44}" cy="${hog?47:fox?44:46}" rx="7" ry="3.7" fill="#dca4a1" opacity=".55"/><path d="M${hog?59:fox?56:49} ${hog?53:fox?55:59}q5 3 9-1" stroke="#91695f" stroke-width="1.5" stroke-linecap="round" fill="none"/>`;
  ear=bunny?'<path d="M14 56Q-2 12 12 3q23-8 12 53Z" fill="$coat"/><path d="M15 46Q8 17 15 10q7 12 5 34Z" fill="#dfabb7"/>':hog?'<circle cx="17" cy="19" r="13" fill="$coat"/><circle cx="17" cy="19" r="7" fill="#c49989"/>':fox?'<path d="M4 38 9 3q25 3 28 33Z" fill="$coat"/><path d="m12 29 2-16 14 16Z" fill="#d8a192"/>':'<path d="M17 37Q-5 20 5 7q21-1 28 27Z" fill="$coat"/><path d="M16 29 10 14q14 4 16 17Z" fill="#c69d88"/>';
  tail=hog?'':bunny?'<circle cx="22" cy="25" r="18" fill="$cream"/><path d="m12 16 5-3m5 6 4-2" stroke="#fffdf4" stroke-width="2" stroke-linecap="round"/>':fox?'<path d="M52 39Q-1 55 6 13q26-5 47 14Z" fill="$coat"/><path d="M6 13q22-4 24 18-14 14-21 3Z" fill="$cream"/>':cow?'<path d="M48 12Q20 4 16 34" fill="none" stroke="#b29773" stroke-width="5" stroke-linecap="round"/><path d="M16 27q-15 10-8 22 15-3 14-15Z" fill="#7e604d"/>':'<path d="M46 25Q23 2 5 20q16 22 39 14Z" fill="$cream"/>';
  const length=deer?59:cow?48:bunny?35:hog?23:43;
  leg=`<path d="M9 3q14-3 15 10l-3 ${length-20}q9 8 5 13H6q-4-4 1-12L4 14Z" fill="$coat"/><path d="M6 ${length-8}h19v8H6Z" fill="${deer||cow?'#695746':coats[kind][1]}"/><path d="M10 10v${length-26}" stroke="${coats[kind][0]}" stroke-width="2" opacity=".55" stroke-linecap="round"/>`;
 }
 const upper=deer?29:cow?24:turtle?13:hog?12:bunny?19:23,lower=deer?31:cow?25:turtle?13:hog?12:bunny?18:23;
 let upperArt=bunny?'<ellipse cx="15" cy="17" rx="13" ry="17" fill="$coat"/>':`<path d="M7 2q8-3 15 0l-3 ${upper-6}q-5 6-10 0Z" fill="$coat"/><path d="m11 6 1 ${upper-13}" stroke="${coats[kind][0]}" stroke-width="2" opacity=".5" stroke-linecap="round"/>`;
 const footArt=bunny?'<path d="M4 7q6-9 17-5 16-1 17 10-6 7-32 3-5-2-2-8Z" fill="$cream"/><path d="m23 8 2 5m5-4 1 5" stroke="#c6b092" stroke-width="1"/>':turtle?'<path d="M5 5q12-6 24 1l6 7q-15 7-31 0Z" fill="$coat"/><path d="m11 11 1 5m9-5 1 5m8-6 1 4" stroke="#d7dba9" stroke-width="1.5"/>':`<path d="M8 4q8-6 16 0l7 8q-2 5-26 3-3-3 3-11Z" fill="${deer||cow?'#685443':'$coat'}"/><path d="M19 7v7" stroke="${deer||cow?'#b49c78':'#bfa281'}" stroke-width="1"/>`;
 let lowerArt=`<path d="M10 1h10l-3 ${lower-5}q-3 3-8 0Z" fill="$coat"/>`;
 upperArt+=`<circle cx="15" cy="${upper-1}" r="3.2" fill="$coat"/>`;lowerArt+='<circle cx="15" cy="3" r="3.2" fill="$coat"/>';
 const headParts={body:part(kind,'body',130,90,body),head:part(kind,'head',82,80,head),foot:part(kind,'foot',40,18,footArt),foreUpper:part(kind,'foreUpper',40,upper+5,`<path d="M10 2q6-3 10 0l-3 ${upper-3}h-7Z" fill="$coat"/>`),leg:part(kind,'leg',36,66,leg),upperLeg:part(kind,'upperLeg',40,upper+5,upperArt),lowerLeg:part(kind,'lowerLeg',40,lower+8,lowerArt),tail:part(kind,'tail',60,54,tail)};
 if(!turtle)headParts.ear=part(kind,'ear',42,60,ear);
 return headParts;
}
const smooth=t=>t*t*(3-2*t);
export function wildlifePose(kind,seconds,seed=0){
 const slow=kind==='turtle',cycle=slow?28:kind==='cow'?25:kind==='hedgehog'?19:18;
 const t=(seconds+seed*2.71)%cycle/cycle;
 let travel=0,walking=false,direction=1,u=0;
 if(t<.16){travel=-1;}
 else if(t<.43){u=(t-.16)/.27;travel=-1+2*smooth(u);walking=true;}
 else if(t<.66){travel=1;}
 else if(t<.95){u=(t-.66)/.29;travel=1-2*smooth(u);walking=true;direction=-1;}
 else{travel=-1;direction=-1;}
 const stride=seconds*(slow?3:kind==='cow'?3.4:kind==='hedgehog'?7:5.3)+seed;
 const activity=walking?smooth(Math.min(1,u/.12,(1-u)/.12)):0;
 const hop=kind==='bunny'?Math.sin(Math.PI*(travel+1)*48/(46*.65))**2*13*activity:Math.sin(stride*2)*.7*activity;
 let turnBlend=0,facing=t<.06||t>=.565?-1:1;
 if(t>=.045&&t<.075){const q=smooth((t-.045)/.03);turnBlend=Math.sin(q*Math.PI);facing=q<.5?-1:1;}
 if(t>=.55&&t<.58){const q=smooth((t-.55)/.03);turnBlend=Math.sin(q*Math.PI);facing=q<.5?1:-1;}
 return {turnBlend,facing,offset:travel*(slow?24:kind==='cow'?36:kind==='hedgehog'?28:48),walking,direction,activity,stride,hop,
  head:Math.sin(seconds*.9+seed)*2+(walking?0:Math.sin(seconds*.5+seed)*5),
  tail:Math.sin(seconds*1.7+seed)*7,ear:Math.sin(seconds*1.3+seed)*3,
  blink:(seconds+seed*1.83)%5.7<.12};
}
export function createWildlife(scene,kind,x,y,scale=1){
 const turtle=kind==='turtle',deer=kind==='deer',cow=kind==='cow',hog=kind==='hedgehog',bunny=kind==='bunny';
 const root=scene.add.container(x,y),visual=scene.add.container(0,0);
 const shadow=scene.add.ellipse(0,2,cow?126:deer?105:turtle?100:hog?74:90,turtle||hog?7:10,0x263f33,.23);root.add([shadow,visual]);root.setScale(scale);const specs=animalParts(kind);
 const image=(name,px,py,ox=.5,oy=.5)=>{
  const spec=specs[name];return scene.add.image(px,py,'rig-'+kind+'-'+name+'0').setOrigin(ox,oy).setDisplaySize(spec.width,spec.height);
 };
 const bodyY=turtle?-31:deer?-72:cow?-61:hog?-30:-47;
 const legLength=turtle?26:deer?60:cow?49:hog?24:bunny?37:46,legY=-legLength*.97-6;
 const upper=deer?29:cow?24:turtle?13:hog?12:bunny?19:23,lower=deer?31:cow?25:turtle?13:hog?12:bunny?18:23;
 const legs=[-42,29,-28,43].map((lx,i)=>{
  const joint=scene.add.container(lx,legY+(i<2?-2:0)),top=image(bunny&&i%2?'foreUpper':'upperLeg',0,0,.375,0),bottom=image('lowerLeg',0,upper,.375,0),foot=image('foot',0,upper+lower,.375,.5);
  joint.add([top,bottom,foot]);joint.top=top;joint.bottom=bottom;joint.foot=foot;joint.upper=upper;joint.lower=lower;joint.extension=deer&&i%2?.995:.97;joint.y=-(upper+lower)*joint.extension-6+(i<2?-2:0);joint.baseY=joint.y;
  if(i<2){top.setTint(0xd9cbb5);bottom.setTint(0xd9cbb5);foot.setTint(0xd9cbb5);}
  return joint;
 });const tail=image('tail',turtle||bunny?-30:deer||cow?-40:-48,bodyY,1,.5);
 visual.add([tail,...legs.slice(0,2)]);
 const body=image('body',-4,bodyY);visual.add(body);visual.add(legs.slice(2));
 const neck=scene.add.container(turtle?51:hog?45:36,turtle?-27:deer?-95:cow?-72:hog?-33:-65);visual.add(neck);
 const head=image('head',0,-14,.35,.57),ears=[];
 if(!turtle){
  for(let i=0;i<2;i++){
   const ear=image('ear',i?11:-6,bunny?-36:hog?-22:-32,.5,bunny?.9:.62);ear.angle=cow?(i?65:-65):i?18:-18;ear.baseAngle=ear.angle;ears.push(ear);neck.add(ear);
  }
 }
 neck.add(head);
 const front=scene.add.image(0,0,'rig-'+kind+'-front').setOrigin(.5,180/190).setDisplaySize(210,190).setVisible(false);
 root.add(front);
 const contacts=legs.map(()=>scene.add.ellipse(0,0,bunny?22:deer?14:cow?20:13,4,0x233d30,.19));root.addAt(contacts,1);
 root.rig={visual,front,shadow,contacts,body,bodyY,head,neck,legs,legY,tail,ears,kind,scale,lastSeconds:0};
 root.kind=kind;root.baseX=x;root.baseY=y;root.greetingUntil=0;return root;
}
export function poseWildlife(root,seconds,seed=0,reduced=false){
 const rig=root.rig,pose=wildlifePose(root.kind,reduced?0:seconds,seed);
 if(root.kind==='bunny'){const distance=pose.direction>0?pose.offset+48:48-pose.offset;pose.hop=Math.sin(Math.PI*distance/(46*rig.scale))**2*13*pose.activity;}
 if(root.coastal && !reduced){
  // One readable gesture per pause. A rabbit listens before its ears settle;
  // grazers lower their muzzle, while the hedgehog noses the ground.
  const cycle=root.kind==='cow'?25:root.kind==='turtle'?28:root.kind==='hedgehog'?19:18;
  const phase=(seconds+seed*2.71)%cycle;
  const beat=(delay,duration)=>{
   const u=Math.max(0,Math.min(1,(phase-delay)/duration));
   return smooth(Math.min(1,u*5,(1-u)*4));
  };
  const listen=beat(cycle*.08,cycle*.075),forage=beat(cycle*.435,cycle*.11);
  pose.head=pose.activity*Math.sin(pose.stride)*2-listen*9+forage*(root.kind==='cow'||root.kind==='deer'?19:8);
  pose.ear=beat(cycle*.075,cycle*.057)*10-forage*3;
  pose.tail=pose.activity*Math.sin(pose.stride*.6)*4+forage*Math.sin(phase*5)*5;
 }
 const speed=pose.activity;
 rig.visual.y=reduced?0:-pose.hop;
 rig.visual.scaleX=reduced?1:pose.facing;const turning=!reduced&&pose.turnBlend>.3;rig.visual.setVisible(!turning);rig.front.setVisible(turning);rig.visual.alpha=1;rig.front.alpha=1;
 rig.front.setTexture('rig-'+root.kind+(pose.turnBlend>.87?'-front':'-quarter'));rig.front.setFlipX(pose.facing<0);
 rig.body.scaleY=(90/rig.body.height)*(1+(reduced?0:Math.sin(seconds*1.6+seed)*.012));
 rig.legs.forEach((leg,i)=>{
  const bunny=root.kind==='bunny',turtle=root.kind==='turtle',stance=turtle?.82:bunny?.48:.68;
  const stride=turtle?20:root.kind==='hedgehog'?24:root.kind==='cow'?43:46;
  const range=turtle?24:root.kind==='cow'?36:root.kind==='hedgehog'?28:48;
  const travelled=pose.direction>0?pose.offset+range:range-pose.offset;
  const offsets=turtle||root.kind==='cow'?[0,.5,.25,.75]:bunny?[0,.55,0,.55]:[0,.5,.5,0];
  const phase=(travelled/(stride*rig.scale)+offsets[i]+stance*.5)%1,swing=Math.max(0,(phase-stance)/(1-stance));
  const face=pose.facing,hip=leg.x*rig.scale*face,restWorld=pose.offset+hip;
  if(reduced||!pose.walking||seconds<rig.lastSeconds||seconds-rig.lastSeconds>.3||leg.contactWorld===undefined){
   leg.contactWorld=restWorld;leg.swingStart=restWorld;leg.previousStance=true;
  }
  let footWorld=restWorld;
  if(!reduced&&pose.walking){
   if(phase<stance){
    if(!leg.previousStance)leg.contactWorld=pose.offset+hip+stance*.5*stride*rig.scale*face;
    footWorld=leg.contactWorld;leg.previousStance=true;
   }else{
    if(leg.previousStance)leg.swingStart=leg.contactWorld;
    const target=pose.offset+hip+stance*.5*stride*rig.scale*face;
    footWorld=leg.swingStart+(target-leg.swingStart)*smooth(swing);leg.previousStance=false;
   }
  }
  const footX=(footWorld-pose.offset-hip)/(rig.scale*face),lift=reduced?0:Math.sin(swing*Math.PI)*(turtle?2.5:bunny?12:7)*speed;
  const dx=reduced?0:footX,desiredY=(leg.upper+leg.lower)*leg.extension+(reduced?0:pose.hop)-lift;
  const reach=Math.sqrt(Math.max(1,(leg.upper+leg.lower-.01)**2-dx*dx));
  const adjust=bunny&&pose.hop>2?0:Math.max(0,desiredY-reach),dy=desiredY-adjust;leg.y=leg.baseY+adjust;
  const distance=Math.hypot(dx,dy),d=Math.max(1,Math.min(distance,leg.upper+leg.lower-.01));
  const ax=dx/distance*d,ay=dy/distance*d,along=(leg.upper**2-leg.lower**2+d*d)/(2*d),height=Math.sqrt(Math.max(0,leg.upper**2-along**2));
  const bend=bunny||i%2===0?1:-1,jx=along*ax/d-bend*ay/d*height,jy=along*ay/d+bend*ax/d*height;
  leg.top.rotation=-Math.atan2(jx,jy);leg.bottom.setPosition(jx,jy);leg.bottom.rotation=-Math.atan2(ax-jx,ay-jy);
  leg.foot.setPosition(ax,ay);leg.foot.rotation=0;leg.planted=reduced||!pose.walking||phase<stance;leg.footWorld=footWorld;
  if(rig.contacts){rig.contacts[i].setPosition((leg.x+ax)*face,i<2?-2:0).setAlpha(leg.planted&&pose.hop<2?.2:.025).setVisible(!turning);}
 });
 rig.lastSeconds=seconds;
 rig.neck.angle=reduced?0:pose.head;
 rig.tail.angle=reduced?0:pose.tail;
 rig.ears.forEach((ear,i)=>{ear.angle=ear.baseAngle+(reduced?0:pose.ear*(i?1:-.6));});
 rig.head.setTexture('rig-'+root.kind+'-head'+(!reduced&&pose.blink?'1':'0'));
 rig.shadow.scaleX=1-pose.hop*.012;rig.shadow.alpha=.23-pose.hop*.005;
 return pose;
}
export function wildlifePortrait(kind,blink=false){
 const parts=animalParts(kind,blink),draw=(name,x,y,w,h)=>`<svg x="${x}" y="${y}" width="${w}" height="${h}">${parts[name].source.replace(/^<svg[^>]*>|<\/svg>$/g,'')}</svg>`;
 return svg(160,150,draw('tail',6,65,40,36)+draw('leg',35,95,24,44)+draw('leg',94,95,24,44)+draw('body',12,52,110,76)+(parts.ear?draw('ear',89,8,28,40):'')+draw('head',85,32,70,68));
}

// Opaque, grounded turning poses share the side rig's coordinates and foot baseline.
// The short quarter/front/quarter sequence never dissolves two animals together.
export function animalTurnSVG(kind,front=false){
 const bunny=kind==='bunny',fox=kind==='fox',cow=kind==='cow',deer=kind==='deer',turtle=kind==='turtle',hog=kind==='hedgehog';
 const bodyY=turtle?-31:deer?-72:cow?-61:hog?-30:-47;
 const headY=turtle?-43:deer?-114:cow?-92:hog?-51:-84,headX=front?0:turtle?25:hog?19:12;
 const radius=turtle?54:hog?42:front?cow?42:33:cow?53:48;
 let art='';
 const legLength=turtle?26:deer?60:cow?49:hog?24:bunny?37:46;
 const legXs=front?[-24,23,-15,15]:[-38,26,-23,35];
 for(let i=0;i<4;i++){
  const x=legXs[i],far=i<2,footY=far?-2:0,topY=-legLength-5;
  art+=`<path d="M${x-5} ${topY}q7-4 12 0l-3 ${legLength-6}h-7Z" fill="$coat" opacity="${far?.8:1}"/>`;
  art+=bunny?`<ellipse cx="${x+3}" cy="${footY-4}" rx="13" ry="5" fill="$cream"/>`:`<path d="M${x-7} ${footY-8}q7-5 14 0l3 8h-19Z" fill="${cow||deer?'#685443':'$coat'}"/>`;
 }
 if(fox)art+=`<path d="M${front?-15:-40} ${bodyY+8}q-42 7-40-28 33-9 48 12Z" fill="$coat"/><path d="M${front?-47:-72} ${bodyY-20}q14-2 21 10-4 15-17 14Z" fill="$cream"/>`;
 else if(bunny)art+=`<circle cx="${front?-25:-43}" cy="${bodyY+7}" r="13" fill="$cream"/>`;
 if(hog){
  let edge=`M${-radius} ${bodyY+28}`;
  for(let i=0;i<=12;i++){const a=Math.PI+i*Math.PI/12,x=Math.cos(a)*radius,y=bodyY+Math.sin(a)*38;edge+=`L${x} ${y}l${i%2?4:-4}-7`;}
  art+=`<path d="${edge}L${radius} ${bodyY+28}Z" fill="#806047"/>`;
 }else art+=`<ellipse cx="0" cy="${bodyY}" rx="${radius}" ry="${turtle?35:33}" fill="$coat"/>`;
 if(turtle)art+=`<path d="m-27 ${bodyY-23} 42 0 19 26-21 26h-36l-18-25Z" fill="#73a16c" stroke="#cbd29a" stroke-width="2"/><path d="M-49 ${bodyY+28}q51 9 99 0v6q-50 9-99 0Z" fill="#cecf93"/>`;
 else{
  art+=`<ellipse cx="${front?0:12}" cy="${bodyY+13}" rx="${front?21:29}" ry="18" fill="$cream" opacity=".7"/>`;
  if(deer)for(let i=0;i<6;i++)art+=`<ellipse cx="${-25+i*13%55}" cy="${bodyY-9+i*7%19}" rx="3" ry="2" fill="#fae4bc"/>`;
  if(cow)art+=`<path d="M-33 ${bodyY-20}q20-10 23 12-5 18-21 11Z" fill="#826452"/><path d="M16 ${bodyY-26}q21 3 18 20-15 12-23-2Z" fill="#937259"/>`;
  art+=`<path d="M${headX-13} ${headY+13}q-8 21-5 ${bodyY-headY-2}l27 1q2-21-5-${bodyY-headY-11}Z" fill="$coat"/>`;
 }
 if(bunny){
  art+=`<ellipse cx="${headX-13}" cy="${headY-37}" rx="10" ry="26" transform="rotate(-8 ${headX-13} ${headY-37})" fill="$coat"/><ellipse cx="${headX+13}" cy="${headY-37}" rx="10" ry="26" transform="rotate(8 ${headX+13} ${headY-37})" fill="$coat"/><g fill="#dfabb7"><ellipse cx="${headX-13}" cy="${headY-39}" rx="4" ry="17"/><ellipse cx="${headX+13}" cy="${headY-39}" rx="4" ry="17"/></g>`;
 }else if(fox)art+=`<path d="m${headX-24} ${headY-13}-1-28 23 20m6 0 23-20-2 29" fill="$coat"/>`;
 else if(!turtle)art+=`<path d="M${headX-19} ${headY-11}q-24-28-11-30 20 7 25 25m8 0q5-18 25-25 13 2-9 30" fill="$coat"/>`;
 if(cow)art+=`<path d="M${headX-21} ${headY-16}l-6-19q-5 15 0 23m45-4 6-19q5 15 0 23" fill="#e3cc98"/>`;
 art+=`<ellipse cx="${headX}" cy="${headY}" rx="${turtle?27:hog?23:29}" ry="${turtle?23:hog?21:27}" fill="$coat"/>`;
 art+=eye(headX-10,headY-4,false)+eye(headX+10,headY-4,false);
 if(cow)art+=`<ellipse cx="${headX}" cy="${headY+17}" rx="26" ry="13" fill="#d79f9f"/><g fill="#996e75"><ellipse cx="${headX-10}" cy="${headY+17}" rx="2.5" ry="3"/><ellipse cx="${headX+10}" cy="${headY+17}" rx="2.5" ry="3"/></g>`;
 else if(turtle)art+=`<path d="M${headX-9} ${headY+11}q10 7 19 0" fill="none" stroke="#527a59" stroke-width="2"/>`;
 else art+=`<ellipse cx="${headX}" cy="${headY+15}" rx="18" ry="11" fill="$cream"/><path d="m${headX-5} ${headY+9} 5 5 5-5Z" fill="#845e56"/><path d="M${headX-6} ${headY+20}q6 4 12 0" stroke="#967568" stroke-width="1.5" fill="none"/>`;
 return part(kind,'turn',210,190,`<g transform="translate(105 180)">${art}</g>`).source;
}
