import { coastalPonyFrame } from './coastal-pony.js';

export const CAMEOS = {
  meadow:[{key:'mickey',stop:.059,width:78}],
  forest:[{key:'donald',stop:.059,width:78}],
  beach:[{key:'stitch',stop:.059,width:111}],
  ice:[{key:'olaf',stop:.059,width:94}],
  fairy:[
    {key:'coastal-pony',stop:.06,width:123,tint:0xffd5ec},
    {key:'coastal-pony',stop:.42,width:132,tint:0xd1fff8},
    {key:'coastal-pony',stop:.84,width:114,tint:0xe4d7ff}
  ]
};

const svg = content => `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="144" viewBox="0 0 128 144">${content}</svg>`;

const frameCount=8;
const tau=Math.PI*2;

const cameoArt = {
  stitch:(wave,blink)=>svg(`
    <defs><linearGradient id="fur" x2=".8" y2="1"><stop stop-color="#7ab8de"/><stop offset="1" stop-color="#325a9e"/></linearGradient></defs>
    <g stroke="#29466e" stroke-width="2.5" stroke-linejoin="round">
      <path d="M40 121q-19-2-13-19 5-8 17-7" fill="#538ac0" transform="rotate(${wave*33} 43 103)"/><path d="M87 103q14 0 12 14-4 9-15 5" fill="#538ac0" transform="rotate(${-14-wave*25} 86 108)"/>
      <path d="M40 130q-14-27 6-40h34q20 14 8 40-17 12-48 0z" fill="url(#fur)"/>
      <ellipse cx="63" cy="118" rx="17" ry="15" fill="#a3d3e4" stroke="none"/>
      <path d="M29 137q-7-9 9-15 10-3 15 12l-4 5H33zm45 0q4-16 15-14 15 4 12 14l-4 3H80z" fill="#4978b2"/>
      <g transform="rotate(${wave*12} 43 49)">
        <path d="M38 59C10 57 3 30 8 13q29 5 41 32" fill="#598abe"/>
        <path d="M35 52Q16 44 15 22q17 5 27 24" fill="#ceb4d7" stroke="none"/>
      </g>
      <g transform="rotate(${-wave*16} 86 49)">
        <path d="M91 59q26-3 30-45-28 4-41 32" fill="#598abe"/>
        <path d="M94 53q19-11 20-30-17 4-27 23" fill="#ceb4d7" stroke="none"/>
      </g>
      <path d="m54 39-3-13 12 9 5-13 4 13 12-5-5 12q24 6 27 31 0 29-41 33-43-3-43-30 1-28 32-37z" fill="url(#fur)"/>
      <path d="M30 71q4-19 16-14 13 5 12 22-15 13-28-8m68 0q-4-19-16-14-13 5-12 22 15 13 28-8" fill="#afd8ed" stroke="none"/>
      <ellipse cx="46" cy="71" rx="9" ry="${blink?1.3:12}" fill="#17243d"/><ellipse cx="83" cy="71" rx="9" ry="${blink?1.3:12}" fill="#17243d"/>
      <ellipse cx="64" cy="80" rx="13" ry="9" fill="#263651"/>
      <path d="M39 87q25 11 51-1-10 16-26 15-14 0-25-14z" fill="#303344"/>
      <path d="M43 89 50 95l5-4m20 0 4 4 7-7" fill="#fff6ea" stroke="none"/>
      ${blink?'':'<circle cx="43" cy="67" r="3" fill="#fff" stroke="none"/><circle cx="80" cy="67" r="3" fill="#fff" stroke="none"/>'}
    </g>`),
  olaf:(wave,blink)=>svg(`
    <defs><linearGradient id="snow" x2=".8" y2="1"><stop stop-color="#fffdf2"/><stop offset="1" stop-color="#cee5f5"/></linearGradient></defs>
    <g fill="none" stroke="#805e53" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M44 100 22 83 13 66m10 16-12-2m11 1 4-9" transform="rotate(${wave*16} 44 100)"/>
      <path d="M82 101 102 83 111 66m-9 17 13-4m-13 4-4-10" transform="rotate(${-16-wave*33} 82 101)"/>
      <path d="M64 32 59 13m8 18 6-22m-5 22 15-13"/>
    </g>
    <g fill="url(#snow)" stroke="#91b5ca" stroke-width="1.7">
      <ellipse cx="51" cy="134" rx="14" ry="8"/><ellipse cx="78" cy="134" rx="14" ry="8"/>
      <ellipse cx="64" cy="116" rx="28" ry="17"/><ellipse cx="64" cy="98" rx="23" ry="17"/>
      <path d="M45 36q19-12 37 0l4 19q10 15 4 27-9 15-26 15-21 1-31-14-7-10 4-29z"/>
    </g>
    <g fill="#493d48"><circle cx="65" cy="103" r="4"/><circle cx="64" cy="114" r="4"/><circle cx="63" cy="125" r="4"/>
      <ellipse cx="53" cy="52" rx="3.5" ry="${blink?1:6}"/><ellipse cx="74" cy="51" rx="3.5" ry="${blink?1:6}"/>
      <path d="M38 72q24 9 51-3-2 18-25 20-18 0-26-17z"/>
    </g>
    <path d="m55 76 14 1-1 8-12-1z" fill="#fffdf2"/>
    <path d="M61 61q3-6 9-4l31 9-33 4q-9-1-7-9z" fill="#ed9b56" stroke="#c67644" stroke-width="1.5"/>
    <path d="M47 43q6-4 12-1m9 0q6-5 12-1" fill="none" stroke="#916e63" stroke-width="2.8" stroke-linecap="round"/>`)
};

export function cameoFrames(){
  return Object.entries(cameoArt).flatMap(([key,draw])=>[
    ...Array.from({length:frameCount},(_,i)=>[key+'-'+i,draw(Math.sin(i/frameCount*tau),false)]),
    [key+'-blink',draw(0,true)]
  ]);
}

// Both painted poses already have a raised hand. Bend that silhouette around
// the shoulder without shifting the face or the grounded shoes.
function wavingTexture(scene,key){
  const id=key+'-wave';
  if(scene.textures.exists(id))return id;
  const art=scene.textures.get(key).getSourceImage();
  const {width,height}=art,pivot=Math.round(height*.48);
  const texture=scene.textures.createCanvas(id,width*4,height*2);
  const {context}=texture;
  for(let frame=0;frame<frameCount;frame++){
    const x=frame%4*width,y=Math.floor(frame/4)*height,angle=Math.sin(frame/frameCount*tau);
    context.save();
    context.beginPath();context.rect(x,y,width,height);context.clip();
    for(let left=0;left<width;left+=4){
      const band=Math.min(4,width-left);
      const influence=Math.max(0,1-(left+band/2)/(width*.39))**1.6;
      const shift=angle*height*.07*influence;
      context.drawImage(art,left,0,band,pivot,x+left,y+shift,band,pivot-shift);
    }
    context.drawImage(art,0,pivot,width,height-pivot,x,y+pivot,width,height-pivot);
    context.restore();
    texture.add(frame,0,x,y,width,height);
  }
  texture.refresh();
  return id;
}

export function createCameo(scene, spec, point, reduced){
  const {key}=spec,pony=key==='coastal-pony',drawn=Boolean(cameoArt[key]);
  const texture=drawn?key+'-0':pony||reduced?key:wavingTexture(scene,key);
  const sprite=scene.add.image(point.x,point.y-83,texture,pony||(!reduced&&!drawn)?0:undefined)
    .setOrigin(.5,1).setDepth(-3.5);
  sprite.setScale(spec.width/sprite.width);
  if(spec.tint)sprite.setTint(spec.tint);
  return {sprite,x:sprite.x,y:sprite.y,key,pony,drawn,phase:spec.stop*4,greetUntil:0};
}

export function poseCameo({sprite,x,y,key,pony,drawn,phase,greetUntil},seconds){
  if(pony){
    const frame=coastalPonyFrame('attentive',seconds+phase,0,false,false);
    if(sprite.frame.name!==frame)sprite.setFrame(frame);
    return;
  }
  const greeting=greetUntil>seconds;
  const cycle=(seconds+(key==='donald'?.9:0))%(key==='olaf'?5.3:4.7);
  const active=greeting||cycle<1.55;
  const waving=greeting?seconds*2.3:cycle*1.6;
  const frame=active?Math.floor(waving*frameCount)%frameCount:0;
  if(drawn){
    const blink=!active&&cycle>2.46&&cycle<2.60;
    const texture=key+'-'+(blink?'blink':frame);
    if(sprite.texture.key!==texture)sprite.setTexture(texture);
  }else if(sprite.frame.name!==frame)sprite.setFrame(frame);
  const hop=key==='stitch'&&active?Math.sin(waving*Math.PI)**4*12:0;
  sprite.setPosition(x,y-hop);
  sprite.angle=active?Math.sin(waving*tau)*(key==='donald'?4:2):0;
}
