// One continuous wind field makes neighboring leaves respond to the same breeze.
export function windAt(seconds,x=0,phase=0){
 return Math.sin(seconds*.72-x*.0016+phase)*.58+Math.sin(seconds*.31-x*.0021)*.29+Math.sin(seconds*1.8+phase)*.13;
}
export function createGardenTree(scene,x,y,kind,width,height,variant=0){
 const tree=scene.add.container(x,y);
 const key=kind+'-'+variant;
 const trunk=scene.add.image(0,0,'tree-'+key+'-trunk').setOrigin(.5,1).setDisplaySize(width,height);
 const back=scene.add.image(0,-height*.45,'tree-'+key+'-back').setOrigin(.5,.55).setDisplaySize(width,height);
 const front=scene.add.image(0,-height*.45,'tree-'+key+'-front').setOrigin(.5,.55).setDisplaySize(width,height);
 tree.add([back,trunk,front]);
 tree.windParts=[{object:back,amplitude:.9,phase:0,x},{object:front,amplitude:1.65,phase:.45,x}];
 return tree;
}
export function createWindFlowers(scene,x,y,theme,height,seed=0){
 const root=scene.add.container(x,y);root.windParts=[];
 const count=1+seed%3;
 for(let i=0;i<count;i++){
  const h=height*(seed%4===0?.52:.68+(i*19+seed*7)%42/100),sprig=scene.add.image((i-(count-1)*.5)*height*(.24+(i+seed)%3*.11),-(i*7+seed*11)%15,'sprig'+theme.id+'-'+(i+seed)%3).setOrigin(.5,1).setDisplaySize(h*90/145,h);
  root.add(sprig);root.windParts.push({object:sprig,amplitude:3.2,phase:i*.7+seed,x:x+i*12});
 }
 return root;
}
const svg=(w,h,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
export function sunPatch(){
 return svg(600,360,'<defs><radialGradient id="light"><stop stop-color="#ffedac" stop-opacity=".65"/><stop offset=".5" stop-color="#ffedac" stop-opacity=".2"/><stop offset="1" stop-color="#ffedac" stop-opacity="0"/></radialGradient></defs><ellipse cx="300" cy="180" rx="300" ry="180" fill="url(#light)"/>');
}
export function driftingLeaf(){
 return svg(36,24,'<defs><linearGradient id="leaf" x2=".3" y2="1"><stop stop-color="#d7d98b"/><stop offset="1" stop-color="#638858"/></linearGradient></defs><path d="M2 18Q3-1 28 4q5 17-26 14Z" fill="url(#leaf)"/><path d="m3 18 24-12m-14 8-2-6m7 4 4 3" fill="none" stroke="#e6e0a6" stroke-width="1"/>');
}
export function glowMote(){
 return svg(32,32,'<defs><radialGradient id="glow"><stop stop-color="#fffbd1"/><stop offset=".15" stop-color="#ffe697" stop-opacity=".85"/><stop offset="1" stop-color="#ffe697" stop-opacity="0"/></radialGradient></defs><circle cx="16" cy="16" r="15" fill="url(#glow)"/>');
}
export function birdParts(){
 return {
  body:svg(100,70,'<defs><radialGradient id="body" cx="30%" cy="15%"><stop stop-color="#fff9e8"/><stop offset="1" stop-color="#b5cfda"/></radialGradient></defs><path d="m27 46-24 7 26 4" fill="#7496b0"/><ellipse cx="49" cy="44" rx="28" ry="16" fill="url(#body)"/><path d="M29 46q25 19 44-3-5 20-29 16Z" fill="#f9f2db"/><circle cx="73" cy="29" r="17" fill="url(#body)"/><path d="m86 28 12 6-13 4Z" fill="#dcad6d"/><circle cx="78" cy="25" r="3" fill="#374c61"/><circle cx="79" cy="24" r="1" fill="#fff"/><path d="M39 53q8 7 16 4" stroke="#a6bbc3" fill="none" stroke-width="1.3"/>'),
  wing:svg(52,55,'<defs><linearGradient id="feather" x2=".7" y2="1"><stop stop-color="#edf3eb"/><stop offset="1" stop-color="#759bb5"/></linearGradient></defs><path d="M8 47Q-4 18 46 3l-6 16 8-4-12 17 7-3q-8 19-35 18Z" fill="url(#feather)"/><path d="m12 41 25-27m-18 24 19-15m-15 19 10-6" stroke="#b2cad5" opacity=".7" stroke-width="1.4" fill="none"/>')
 };
}
export function createFlyingBird(scene,x,y,width=52,seed=0){
 const root=scene.add.container(x,y),back=scene.add.image(-5,-7,'flying-wing').setOrigin(.17,.85).setDisplaySize(52,55).setAlpha(.75),body=scene.add.image(0,0,'flying-body').setDisplaySize(100,70),front=scene.add.image(-5,0,'flying-wing').setOrigin(.17,.85).setDisplaySize(52,55);
 root.add([back,body,front]);root.setScale(width/100);root.wings={back,front,seed};return root;
}
export function poseFlyingBird(bird,seconds,reduced=false){
 const {front,back,seed}=bird.wings;
 const cycle=(seconds+seed*1.3)%8,glide=cycle>5.5?Math.sin((cycle-5.5)/2.5*Math.PI)**2:0;
 const flap=reduced?0:Math.sin(seconds*5.8+seed)*38*(1-glide*.9);
 front.angle=-28+flap;back.angle=-40-flap*.65;bird.angle=reduced?0:Math.sin(seconds*.7+seed)*3;
}
