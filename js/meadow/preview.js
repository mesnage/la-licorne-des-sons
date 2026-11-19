import {createRoute,paintCrossings} from './route.js?v=review-16';
/* Meadow graphics trial adapted from the supplied Paillette style frame. */
/* global matchMedia, innerWidth, innerHeight, performance, Path2D, URLSearchParams */
import { ready, say, hush, unlock } from '../audio.js?v=review-16';
import { createFauna } from './fauna.js?v=review-16';
import { HABITATS, paintHabitat } from './habitats.js?v=review-16';
import { PAINTED_WORLDS } from './themes.js?v=review-16';
import { JUNGLE_PALETTE, paintJungle } from './jungle.js?v=review-16';
import { FOREST_PALETTE, paintForest } from './forest.js?v=review-16';
import { createJourney } from './journey.js?v=review-16';
import { createScenery } from './scenery.js?v=perf-19';
import { createCrossroads } from './crossroads.js?v=perf-19';

(() => {
const NS='http://www.w3.org/2000/svg', svg=document.getElementById('svg');
const el=(tag,attrs={},parent)=>{const n=document.createElementNS(NS,tag);for(const k in attrs)n.setAttribute(k,attrs[k]);if(parent)parent.append(n);return n;};
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
const embedded=new URLSearchParams(location.search).has('scene');
const readingLayout=new URLSearchParams(location.search).has('reading');
const theme=PAINTED_WORLDS.find(t=>t.habitat===new URLSearchParams(location.search).get('habitat'))??PAINTED_WORLDS[0];
const metrics={frames:0,slowFrames:0,workMs:0,maxWorkMs:0,paintMs:0,tiles:0,travelTiles:0};
const perf=new URLSearchParams(location.search).has('perf');
const habitat=theme.habitat,forest=habitat==='forest',jungle=habitat==='jungle',custom=HABITATS[habitat];
document.body.dataset.habitat=habitat;
const sceneRaise=readingLayout?275:300;
let layoutListener=null;
const demo=!embedded&&location.hash==='#demo';
if(embedded)document.body.classList.add('scene-only');
let started=false, paused=true;
const scheduled=[];
const later=(fn,ms)=>scheduled.push({fn,left:ms/1000});
let seed=20261115;const rnd=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
const R=(a,b)=>a+rnd()*(b-a), pick=a=>a[Math.floor(rnd()*a.length)];
/* ---------- hand-painted washes: each colour is a small watercolour tile ---------- */
const hex2=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const shadeHex=(h,k)=>'#'+hex2(h).map(v=>Math.max(0,Math.min(255,Math.round(v*k))).toString(16).padStart(2,'0')).join('');
function pnoise(S,cx,cy){const g=[];for(let i=0;i<cx*cy;i++)g.push(Math.random());
  return (x,y)=>{const fx=x/S*cx,fy=y/S*cy,x0=Math.floor(fx),y0=Math.floor(fy);let tx=fx-x0,ty=fy-y0;tx=tx*tx*(3-2*tx);ty=ty*ty*(3-2*ty);
    const a=g[(y0%cy)*cx+x0%cx],b=g[(y0%cy)*cx+(x0+1)%cx],c=g[((y0+1)%cy)*cx+x0%cx],d=g[((y0+1)%cy)*cx+(x0+1)%cx];
    return a+(b-a)*tx+(c-a)*ty+(a-b-c+d)*tx*ty;};}
let wid=0;const PAT={};
const TS=256,tcv=document.createElement('canvas');tcv.width=tcv.height=TS;const tcx=tcv.getContext('2d');
// Fills are clean, nearly flat colour with a fine paper tooth. Form comes from the placed textures below,
// not from random blotches (which read as grey smudges on sand, snow and paths).
function wash(hex,o={}){const amp=Math.min(o.amp??.016,.022),streak=o.water?.028:0,grain=Math.min(o.grain??.018,.022),[r,g,b]=hex2(hex);
  const n1=pnoise(TS,3,3),n2=pnoise(TS,8,8),n3=pnoise(TS,2,22),n4=pnoise(TS,3,3),img=tcx.createImageData(TS,TS),d=img.data;
  for(let y=0,i=0;y<TS;y++)for(let x=0;x<TS;x++,i+=4){
    const pool=n1(x,y)-.5,v=pool*2*amp+(n2(x,y)-.5)*amp+(n3(x,y)-.5)*2*streak+(Math.random()-.5)*2*grain,k=1+v,warm=(n4(x,y)-.5)*2.4;
    d[i]=Math.max(0,Math.min(255,r*k+warm));d[i+1]=Math.max(0,Math.min(255,g*k));d[i+2]=Math.max(0,Math.min(255,b*k-warm));d[i+3]=255;}
  tcx.putImageData(img,0,0);const id='w'+(wid++),tile=document.createElement('canvas');tile.width=tile.height=TS;tile.getContext('2d').drawImage(tcv,0,0);PAT[id]=tile;return {fill:`url(#${id})`,edge:shadeHex(hex,.66),hex};}
/* Placed textures: sponge stipple and dry-brush dashes on transparent tiles, used as fills for shading
 * bands, moss patches and cast shadows. Levels 1–4 are separate tiles so stacked bands build a gradient. */
const TEX={};
function texture(kind,hex,level=2,size=1){const key=kind+hex+level+size;if(TEX[key])return TEX[key];
  const c=document.createElement('canvas');c.width=c.height=TS;const x=c.getContext('2d');x.fillStyle=hex;
  const n=[0,150,420,1000,2300][level]/(size*size)*(kind==='dash'?.45:1);
  for(let i=0;i<n;i++){const px=Math.random()*TS,py=Math.random()*TS,r=(.8+Math.random()*1.5)*size,w=(5+Math.random()*12)*size;x.globalAlpha=.5+Math.random()*.5;
    for(const ox of [0,TS,-TS])for(const oy of [0,TS,-TS]){const cx=px+ox,cy=py+oy;if(cx<-20||cx>TS+20||cy<-6||cy>TS+6)continue;
      x.beginPath();if(kind==='dash')x.ellipse(cx,cy,w,r*.62,0,0,6.2832);else x.arc(cx,cy,r,0,6.2832);x.fill();}}
  const id='t'+(wid++);PAT[id]=c;return TEX[key]=`url(#${id})`;}
const speck=(hex,level,size)=>texture('dot',hex,level,size),dash=(hex,level,size)=>texture('dash',hex,level,size);
// Anything drawn live in the SVG (heroes, question view) is repainted every frame, so it uses flat
// colour: textured fills there were the main cause of lag on phones. Baked scenery keeps its textures.
const WL=new Proxy({},{get:(_,k)=>W[k]&&{fill:W[k].hex,edge:W[k].edge,hex:W[k].hex}});
const liveSpeck=(hex,level=2)=>hex+['00','1c','30','48','66'][level];
const wa=(w,sw=2.6,so=.24)=>({fill:w.fill,stroke:w.edge,'stroke-width':sw,'stroke-opacity':so,'stroke-linejoin':'round','stroke-linecap':'round'});
const W={sea:wash('#6dbdb6',{water:1}),isle:wash('#a9c9bd'),mountA:wash('#b3d2cb',{amp:.06}),mountB:wash('#9cc3b6',{amp:.07}),isle2:wash('#bcd6cb'),mid:wash('#9bb884'),near:wash('#7f9f5e'),
  meadow:wash('#6f9152'),meadowD:wash('#587a48'),fg:wash('#46683f'),fg2:wash('#55794a'),path:wash('#ecd3a0',{streak:.08}),pathEdge:wash('#d4b176'),
  trunk:wash('#8a6a52'),leafA:wash('#5f8650'),leafB:wash('#79994f'),leafC:wash('#93ad62'),pine:wash('#4f7a5c'),blossom:wash('#e2a3a0'),blossomL:wash('#edbdb4'),
  ochreLeaf:wash('#d8a546'),ochreL:wash('#e6bf6c'),stone:wash('#e0d6c0'),stoneWarm:wash('#f1dcaa'),cloud:wash('#fbf5e6',{amp:.04,streak:.03}),
  body:wash('#fbf3e4',{amp:.045,streak:.03}),bodyS:wash('#ecdcc8',{amp:.05}),pink:wash('#e59aa4'),teal:wash('#6fbfb8'),ochre:wash('#e0ad4c'),
  duck:wash('#f7d76e'),duckD:wash('#e9bd52'),bill:wash('#f0a04a'),lilac:wash('#c9b2e6'),cream:wash('#f8e7cb',{amp:.05}),castle:wash('#f6e9cf',{amp:.05}),castleS:wash('#e6d3b2'),roof:wash('#d98b93'),roofT:wash('#5fb0aa'),door:wash('#9c7458'),
  rabbit:wash('#c2a48a'),rabbit2:wash('#d9c7ae'),paper:wash('#f4ecd8',{amp:.12,streak:.02,grain:.05})};
if(forest||jungle||custom)for(const [key,hex] of Object.entries(custom?.palette??(jungle?JUNGLE_PALETTE:FOREST_PALETTE)))W[key]=wash(hex);
const C={pink:'#e59aa4',lilac:'#e0ad4c',teal:'#6fbfb8',gold:'#e0ad4c',ink:'#35372f',grassDark:'#587a48'};
const STOPS=6, GAP=640, X0=320, CASTLE=X0+STOPS*GAP+260, CAMMAX=(embedded?X0+30*GAP:CASTLE)+400;
// The route bends through a broad clearing, rather than tracking the meadow edge.
const groundY=x=>488+62*Math.sin((x-X0)/245)+17*Math.sin(x/470+1.3);
const route=createRoute(habitat,groundY);
const surfaceY=route.y;
const meadowEdge=x=>272+28*Math.sin(x/380)+13*Math.sin(x/155);
const pathWidth=x=>66+22*(.5+.5*Math.sin((x-X0)/245));
const travelScale=x=>1+.065*Math.sin((x-X0)/245);
const f1=v=>v.toFixed(1),pt=p=>f1(p[0])+' '+f1(p[1]),mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
function smooth(pts,close){const n=pts.length;if(close){let d='M'+pt(mid(pts[n-1],pts[0]));for(let i=0;i<n;i++)d+='Q'+pt(pts[i])+' '+pt(mid(pts[i],pts[(i+1)%n]));return d+'Z';}
  let d='M'+pt(pts[0]);for(let i=1;i<n-1;i++)d+='Q'+pt(pts[i])+' '+pt(mid(pts[i],pts[i+1]));return d+'L'+pt(pts[n-1]);}
function blob(cx,cy,rx,ry,n=10,j=.15){const p=[],o=R(0,6);for(let i=0;i<n;i++){const a=o+i/n*Math.PI*2,k=1+R(-j,j);p.push([cx+Math.cos(a)*rx*k,cy+Math.sin(a)*ry*k]);}return smooth(p,true);}
function ridge(w,fn,step=60,j=3){const p=[];for(let x=-200;x<=w;x+=step)p.push([x,fn(x)+R(-j,j)]);return smooth(p,false)+`L${w} 1200L-200 1200Z`;}
function dabs(g,cx,cy,rx,ry,n,col,op=.4){for(let i=0;i<n;i++){const a=R(0,6.28),k=Math.sqrt(rnd()),x=cx+Math.cos(a)*rx*k,y=cy+Math.sin(a)*ry*k;
  el('ellipse',{cx:f1(x),cy:f1(y),rx:f1(R(4,9)),ry:f1(R(1.8,3.4)),transform:`rotate(${f1(R(-35,35))} ${f1(x)} ${f1(y)})`,fill:col,opacity:f1(R(op*.6,op))},g);}}
const sway=(parent,b,cls='sway')=>{const c=el('g',{class:cls+' '+pick(['','s2','s3'])},parent);c.style.animationDelay=(-R(0,6)).toFixed(2)+'s';if(b)c.dataset.b=b;return c;};

let VW=1200,VH=750,K=1,topDiv=null;
const reliefLayers=[], answerStones=[];
let heroScale=1, stoneScale=1, stageLift=0, layerList=null;
// Spread distant planes upward on tall screens, without stretching characters or answers.
function fitRelief(){
  const extra=Math.max(0,VH-750);
  const liftK=Math.max(0,1-extra/500);
  for(const {node,depth,lift=0} of reliefLayers)node.style.top=(-extra*depth-lift*liftK-(embedded&&depth===.12?sceneRaise*Math.max(0,Math.min(1,(.95-innerWidth/innerHeight)/.35)):0)).toFixed(1)+'px';
}
const $=id=>document.getElementById(id),wA=$('worldA'),wB=$('worldB'),scratch=$('scratch');
const sun=document.createElement('div');sun.style.cssText='width:500px;height:500px;top:-20px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,251,232,.95),rgba(253,240,192,.6) 30%,rgba(253,240,192,0))';wA.append(sun);if(habitat==='moon')sun.style.display='none';
function fit(){const a=innerWidth/innerHeight;VW=Math.max(640,Math.min(1500,750*a));VH=VW/a;if(VH<750){VH=750;VW=750*a;}
  svg.setAttribute('viewBox',`0 ${750-VH} ${VW} ${VH}`);K=innerHeight/VH;
  const t=`translate(0px,${(-(750-VH)*K).toFixed(2)}px) scale(${K.toFixed(5)})`;wA.style.transform=t;wB.style.transform=t;
  sun.style.left=(VW*.72-250).toFixed(0)+'px';const h=(366-(750-VH))/VH*100;
  if(topDiv)topDiv.style.top=(750-VH).toFixed(1)+'px';
  fitRelief();
  const portrait=Math.max(0,Math.min(1,(.95-a)/.35));
  stageLift=Math.max(0,VH-750)*.12+(embedded?sceneRaise*portrait:0);
  heroScale=1+portrait*.24;stoneScale=1+portrait*.10;
  for(const stone of answerStones)stone.g.setAttribute('transform',`translate(${stone.x} ${stone.y}) scale(${stoneScale})`);
  if(layerList)for(const L of layerList)if(L.tiles&&L.tiles.size&&needBottom(L)>(L.bottom??0)+1)dropTiles(L);
  $('skyg').style.background=custom?`linear-gradient(${custom.sky[0]} 0%,${custom.sky[1]} ${(h*.6).toFixed(1)}%,${custom.sky[2]} ${(h*.97).toFixed(1)}%)`:jungle?`linear-gradient(#73b4a6 0%,#b5d8b7 ${(h*.6).toFixed(1)}%,#eee1b5 ${(h*.97).toFixed(1)}%)`:forest?`linear-gradient(#496e61 0%,#9cb399 ${(h*.6).toFixed(1)}%,#e5d7a6 ${(h*.97).toFixed(1)}%)`:`linear-gradient(#8fcbc9 0%,#c9e6dc ${(h*.6).toFixed(1)}%,#f6ecd0 ${(h*.97).toFixed(1)}%)`;}
let onFit=null;window.addEventListener('resize',()=>{fit();onFit?.();});fit();


/* ---------- scenery: drawn once as vectors, then baked into bitmaps the GPU can slide ---------- */
const GW=CAMMAX+1700,FW=1600+CAMMAX*1.38,TWD=1700+CAMMAX*1.6,layers=[];
const MIDW=embedded?CAMMAX*.3+2200:3100, NEARW=embedded?CAMMAX*.55+2000:4300;
let castleCanvas,castleLight,castleX=CASTLE;
layerList=layers;
const layer=(f,host,x1,y0,y1,o={})=>{const g=el('g',{},scratch);layers.push({g,f,host,x1,y0,y1,...o});return g;};
const mist=(top,h,o,depth,lift=0)=>layers.push({mist:[top,h,habitat==='moon'?0:o],depth,lift});
// On wide screens the far planes are lifted so layered hills and water show above the clearing.
const LIFT={mount:60,sea:150,mid:200,near:245};
const slot=(f,host)=>{const L={slot:true,f,host};layers.push(L);return L;};
const Lsky=layer(0,wA,2400,-760,440,{res:.4});
const cloudS=slot(.04,wA);
const Lmount=layer(.06,wA,3200,40,900,{depth:.86,lift:LIFT.mount});
const Lsea=layer(.08,wA,3400,0,1000,{depth:.60,wind:1,lift:LIFT.sea}),duckS=slot(.08,wA);duckS.depth=.60;duckS.lift=LIFT.sea;mist(322,110,.26,.60,LIFT.sea);
const birdS=slot(.15,wA);birdS.depth=.48;birdS.lift=LIFT.sea;
const Lmid=layer(.3,wA,MIDW,custom?0:170,900,{wind:1,depth:.36,lift:LIFT.mid,soft:.8}),sheepS=slot(.3,wA);sheepS.depth=.36;sheepS.lift=LIFT.mid;mist(424,90,.14,.36,LIFT.mid);
const Lnear=layer(.55,wA,NEARW,custom?0:190,900,{wind:1,depth:.14,lift:LIFT.near,soft:.9}),hillRabS=slot(.55,wA);hillRabS.depth=.14;hillRabS.lift=LIFT.near;
const Lgrove=layer(.8,wA,0,0,0,{wind:1,noTiles:1,depth:.12});
const Lground=layer(1,wA,GW,habitat==='prehistoric'?0:180,1300,{wind:1,depth:.12}),rabS=slot(1,wA);rabS.depth=.12;
const castleS=el('g',{},scratch),Llive=el('g',{},svg),liveBehind=el('g',{},Llive);

function cloud(g,x,y,s){const c=el('g',{transform:`translate(${x} ${y}) scale(${s})`},g);
  // Flat-bottomed storybook cumulus: stacked rounds, a soft underside and a sunlit cap.
  for(const [cx,cy,r] of [[-30,0,24],[4,-16,32],[44,-8,27],[80,2,20],[24,2,30]])el('circle',{cx,cy,r,fill:W.cloud.fill},c);
  el('path',{d:'M-56 6Q-56-8-30-6H84Q104-6 102 8Q80 20 24 20Q-36 20-56 6Z',fill:W.cloud.fill},c);
  el('path',{d:'M-52 4Q24 22 100 4Q78 21 24 21Q-32 21-52 4Z',fill:speck(custom?.cloudShade??'#d9c9c0',4,.7),opacity:.9},c);
  el('ellipse',{cx:2,cy:-30,rx:20,ry:7,fill:'#fff',opacity:.55},c);return c;}
const clouds=[];for(let i=0;i<(habitat==='moon'?0:8);i++){const sc=R(.9,1.8);clouds.push({g:cloud(scratch,0,0,sc),sc,x:i*310+R(-60,60),y:i%2?R(0,150):R(-600,-30),v:R(3,8)});}

function tree(g,x,y,s,kind=0,split){const t=el('g',{transform:`translate(${f1(x)} ${f1(y)}) scale(${f1(s*10)/10})`},g);
  const tk=split?sway(t,'-16,-92,16,6','still'):t;
  el('path',{d:`M-8 3Q-3-40 ${f1(R(-7,0))}-86L${f1(R(4,9))}-86Q5-40 9 3Z`,...wa(W.trunk)},tk);
  el('path',{d:'M-2-10q2-20 0-44M3-52q1-14 0-24',stroke:'#6f5341','stroke-width':1.6,'stroke-linecap':'round',fill:'none',opacity:.5},tk);
  if(kind===2){const c=sway(t,'-56,-206,56,-34');
    for(const [yy,w] of [[-58,48],[-98,39],[-136,29]])el('path',{d:smooth([[0,yy-60],[w*.5,yy-18],[w,yy+10],[w*.4,yy+18],[-w*.4,yy+18],[-w,yy+10],[-w*.5,yy-18]],true),...wa(W.pine)},c);
    dabs(c,0,-100,26,60,9,'#7fa685',.45);dabs(c,0,-90,30,56,5,'#3c6048',.3);}
  else{const c=sway(t,'-78,-186,78,-52');
    const [a,b,l]=kind===1?[W.blossom,W.blossomL,'#f8ddd2']:kind===3?[W.ochreLeaf,W.ochreL,'#f4dc9c']:[pick([W.leafA,W.leafB]),W.leafC,'#bccb85'];
    el('path',{d:blob(-26,-96,36,31),...wa(a)},c);el('path',{d:blob(27,-100,38,33),...wa(a)},c);el('path',{d:blob(0,-134,45,38),...wa(b)},c);
    el('path',{d:blob(-16,-132,32,22,9,.12),fill:speck(shadeHex(b.hex,1.14),3,.6)},c);el('path',{d:blob(14,-90,42,20,9,.12),fill:speck(shadeHex(a.hex,.86),3,.6)},c);
    dabs(c,0,-118,48,42,10,l,.5);
    if(kind!==1)for(let i=0;i<5;i++)el('circle',{cx:f1(R(-40,40)),cy:f1(R(-150,-84)),r:f1(R(2,3.6)),fill:kind===3?'#b9506b':'#e59aa4',opacity:.8},c);}
  return t;}
function bush(g,x,y,s,w=W.leafB){const b0=el('g',{transform:`translate(${f1(x)} ${f1(y)}) scale(${f1(s*10)/10})`},g),b=sway(b0,'-52,-54,52,6');
  el('path',{d:blob(-20,-14,24,18),...wa(w)},b);el('path',{d:blob(22,-13,24,17),...wa(w)},b);el('path',{d:blob(0,-24,28,22),...wa(W.leafC)},b);el('path',{d:blob(4,-10,34,10,8,.1),fill:speck(shadeHex(w.hex,.78),3)},b);dabs(b,0,-24,30,12,6,'#c3d08d',.5);
  for(let i=0;i<4;i++)el('circle',{cx:f1(R(-28,28)),cy:f1(R(-34,-10)),r:f1(R(1.8,3)),fill:pick(['#e59aa4','#fbf3e4']),opacity:.85},b);}
function flower(g,x,y,s,col){const f=el('g',{transform:`translate(${f1(x)} ${f1(y)}) scale(${f1(s*10)/10})`},g),w=sway(f,'-14,-42,14,2');
  el('path',{d:'M0 0Q3-14 0-26',stroke:'#4f6f3f','stroke-width':3,fill:'none','stroke-linecap':'round'},w);
  for(let i=0;i<5;i++){const a=i/5*Math.PI*2;el('ellipse',{cx:f1(Math.cos(a)*6),cy:f1(-28+Math.sin(a)*6),rx:5.4,ry:4.6,fill:col},w);}
  el('circle',{cx:0,cy:-28,r:3.4,fill:'#d99a3a'},w);return f;}
function thrift(g,x,y,s,palette=W){const f=el('g',{transform:`translate(${f1(x)} ${f1(y)}) scale(${f1(s*10)/10})`},g);
  for(const a of [-50,-20,15,45])el('path',{d:'M0 0Q-2-10 0-18Q3-10 2 0Z',fill:'#4f6f3f',transform:`rotate(${a})`},f);
  const w=sway(f,'-24,-66,26,2');
  for(const [dx,h] of [[-9,-34],[0,-46],[10,-30]]){el('path',{d:`M0 0Q${dx*.4} ${h*.5} ${dx} ${h}`,stroke:'#4f6f3f','stroke-width':2.6,fill:'none','stroke-linecap':'round'},w);
    el('path',{d:blob(dx,h-6,9,8,8,.18),...wa(palette.pink,2,.3)},w);el('circle',{cx:dx-2,cy:h-9,r:3,fill:'#f6cfcf',opacity:.7},w);}
  return f;}
function fern(g,x,y,s,w){const f=el('g',{transform:`translate(${f1(x)} ${f1(y)}) scale(${f1(s*10)/10})`},g),c=sway(f,'-92,-126,92,6');
  for(const a of [-30,-4,24]){const fr=el('g',{transform:`rotate(${f1(a+R(-5,5))})`},c);
    el('path',{d:'M0 0Q7-52 0-108',stroke:w.hex,'stroke-width':3,fill:'none','stroke-linecap':'round'},fr);
    for(let i=1;i<=8;i++){const yy=-i*12.5,len=31-i*2.8,xx=7*Math.sin(i/8.6*Math.PI)*.9;
      el('ellipse',{cx:f1(xx-len/2),cy:yy,rx:f1(len/2),ry:5.2,transform:`rotate(22 ${f1(xx)} ${yy})`,fill:w.fill},fr);
      el('ellipse',{cx:f1(xx+len/2),cy:yy,rx:f1(len/2),ry:5.2,transform:`rotate(-22 ${f1(xx)} ${yy})`,fill:w.fill},fr);}}}
function sprig(g,x,y,s,w){const f=el('g',{transform:`translate(${f1(x)} ${f1(y)}) scale(${f1(s*10)/10})`},g),c=sway(f,'-32,-100,38,4');
  el('path',{d:'M0 0Q-10-40 6-84',stroke:w.edge,'stroke-width':3,fill:'none','stroke-linecap':'round'},c);
  for(let i=0;i<6;i++){const t=(i+1)/6.5,xx=-10*Math.sin(t*Math.PI)+6*t*t,yy=-84*t,sd=i%2?1:-1;el('path',{d:blob(xx+sd*11,yy-3,9.5,8,8,.12),...wa(w,2,.25)},c);}}
function rock(g,x,y,s){const r=el('g',{transform:`translate(${f1(x)} ${f1(y)}) scale(${f1(s*10)/10})`},g),k=shadeHex(W.stone.hex,.76);
  // two stones leaning together: dark sides, pale tops, a highlight, lichen dots and grass at the foot
  el('path',{d:'M-30 0Q-34-17-22-27Q-8-36 8-31Q22-25 22-8Q22 0 16 2Q-8 5-30 0Z',fill:k},r);
  el('path',{d:'M-30-3Q-33-17-21-26Q-8-34 7-30Q16-26 14-17Q0-10-14-9Q-24-8-30-3Z',...wa(W.stone,2,.2)},r);
  el('path',{d:'M10 2Q8-10 17-16Q27-20 33-11Q37-3 32 2Q20 5 10 2Z',fill:k},r);
  el('path',{d:'M11-2Q10-10 17-15Q26-18 31-11Q24-6 11-2Z',...wa(W.stone,2,.2)},r);
  el('path',{d:'M-24-20Q-12-31 2-29Q-10-23-24-20Z',fill:'#fff',opacity:.5},r);
  for(let i=0;i<4;i++)el('circle',{cx:f1(R(-20,6)),cy:f1(R(-22,-10)),r:f1(R(1.6,3.4)),fill:'#d9a441',opacity:.6},r);
  el('path',{d:'M-36 2q1-9 4-12q1 7 4 12ZM24 3q2-8 5-10q0 6 3 10ZM-4 4q1-7 3-9q1 5 3 9Z',fill:W.meadowD.hex},r);}
function mushroom(g,x,y,s){const m=el('g',{transform:`translate(${f1(x)} ${f1(y)}) scale(${f1(s*10)/10})`},g);
  for(const [dx,h,r] of [[0,-20,13],[15,-11,8]]){el('path',{d:`M${dx-3} 0Q${dx-4} ${h*.6} ${dx-2} ${h}h5Q${dx+5} ${h*.6} ${dx+4} 0Z`,fill:W.cream.fill},m);
    el('path',{d:`M${dx-r} ${h}Q${dx-r} ${h-r*1.1} ${dx+.5} ${h-r*1.15}Q${dx+r+1} ${h-r*1.1} ${dx+r+1} ${h}Z`,...wa(pick([W.roof,W.ochre]),2,.3)},m);
    for(let i=0;i<3;i++)el('circle',{cx:f1(dx+R(-r*.6,r*.6)),cy:f1(h-R(3,r*.8)),r:1.7,fill:'#fbf3e4',opacity:.9},m);}}
function fringe(g,x1,fn,col,step=12,h=8,op=1){let d='';for(let x=-200;x<x1;x+=step+R(-3,3)){const y=fn(x)+3,hh=R(h*.6,h*1.6),ln=R(-4,4);
  d+=`M${f1(x-3)} ${f1(y)}Q${f1(x+ln)} ${f1(y-hh)} ${f1(x+ln*1.5)} ${f1(y-hh)}Q${f1(x+2)} ${f1(y-hh*.4)} ${f1(x+4)} ${f1(y)}Z`;}el('path',{d,fill:col,opacity:op},g);}
const dot=(x,y,r)=>`M${f1(x-r)} ${f1(y)}a${f1(r)} ${f1(r)} 0 1 0 ${f1(2*r)} 0a${f1(r)} ${f1(r)} 0 1 0 ${f1(-2*r)} 0Z`;
function specks(g,cx,cy,n,cols,sp=40){const d={};for(let i=0;i<n;i++){const c=pick(cols);d[c]=(d[c]||'')+dot(cx+R(-sp,sp),cy+R(-sp*.3,sp*.3),R(1.4,3));}for(const c in d)el('path',{d:d[c],fill:c,opacity:.9},g);}
// A patch is a crisp shape filled with stipple of a deeper tone, not a translucent smudge.
function patch(g,x,y,rx,ry,w,op){el('path',{d:blob(x,y,rx,ry,9,.2),fill:speck(shadeHex(w.hex,.84),3),opacity:Math.min(.9,op*2.4)},g);}
const scenery=createScenery({el,wa,W,blob,R,rnd,pick,smooth,f1,sway,wash,speck,dash,shadeHex,kind:habitat});
const meadowOnly=habitat==='meadow',groveSpots=[];

// sky washes (kept soft: baked at low resolution)
for(let i=0;i<26;i++)el('path',{d:blob(R(0,2400),i<16?R(-80,400):R(-700,-80),R(180,460),R(26,80),9,.2),fill:'#ffffff',opacity:f1(R(.08,.18))},Lsky);
if(habitat!=='moon'){el('rect',{x:0,y:120,width:2400,height:330,fill:speck('#fffaf0',1,1.2),opacity:.7},Lsky);el('rect',{x:0,y:250,width:2400,height:200,fill:speck('#fffaf0',2,1.2),opacity:.7},Lsky);}
// mountains across the bay
const mA=x=>195+72*Math.sin(x*.0031+.6)+26*Math.sin(x*.0083+2)+10*Math.sin(x*.021),mB=x=>280+44*Math.sin(x*.0046+2.2)+16*Math.sin(x*.012+.5);
el('path',{d:ridge(3200,mA,50,5),...wa(W.mountA,2,.14)},Lmount);
for(let i=0;i<50;i++){const x=R(0,3200);el('path',{d:`M${f1(x)} ${f1(mA(x)+R(8,30))}q${f1(R(-10,10))} ${f1(R(20,50))} ${f1(R(-22,22))} ${f1(R(60,110))}`,stroke:'#86b0a6','stroke-width':f1(R(2,5)),'stroke-linecap':'round',fill:'none',opacity:.4},Lmount);}
el('path',{d:ridge(3200,mB,50,4),...wa(W.mountB,2,.14)},Lmount);
for(let i=0;i<60;i++){const x=R(0,3200);dabs(Lmount,x,mB(x)+R(20,70),44,12,3,'#c3ddd0',.4);}
for(let x=40;x<3200;x+=R(26,70))el('path',{d:smooth([[x,mB(x)+3],[x-5,mB(x)-R(6,10)],[x,mB(x)-R(14,22)],[x+5,mB(x)-R(6,10)]],true),fill:'#7fa99b',opacity:.75},Lmount);
// sea
el('rect',{x:-100,y:366,width:3400,height:640,...wa(W.sea,0,0)},Lsea);
el('rect',{x:-100,y:366,width:3400,height:16,fill:'#e9f5ee',opacity:.5},Lsea);el('rect',{x:-100,y:370,width:3400,height:60,fill:dash('#eefaf4',2)},Lsea);el('rect',{x:-100,y:430,width:3400,height:260,fill:dash('#eefaf4',1)},Lsea);
for(let i=0;i<150;i++)el('ellipse',{cx:f1(R(-80,3250)),cy:f1(R(374,660)),rx:f1(R(16,70)),ry:f1(R(1.3,2.6)),fill:'#e6f4ec',opacity:f1(R(.25,.6))},Lsea);
for(let i=0;i<110;i++){const x=R(-80,3250),y=R(384,660);el('path',{d:`M${f1(x)} ${f1(y)}q6-5 12 0q6-5 12 0`,stroke:'#4c9e9a','stroke-width':1.8,'stroke-linecap':'round',fill:'none',opacity:.45},Lsea);}
for(let x=140;x<3200;x+=R(260,520)){const w=R(26,60),y=R(388,420);el('ellipse',{cx:f1(x),cy:f1(y+3),rx:f1(w*1.25),ry:3.4,fill:'#eef8f1',opacity:.7},Lsea);
  el('path',{d:smooth([[x-w,y+2],[x-w*.5,y-w*.45],[x+w*.1,y-w*.7],[x+w*.6,y-w*.4],[x+w,y+2],[x,y+6]],true),...wa(pick([W.isle,W.stone]),2,.2)},Lsea);
  dabs(Lsea,x,y-w*.3,w*.5,w*.2,3,'#7f9f5e',.6);}
if(meadowOnly){for(let x=380;x<3200;x+=R(620,980))scenery.boat(Lsea,x,R(380,396),R(.42,.62),pick(['#fbf3e4','#f6c9c0','#fde9c4']),pick(['#c9806f','#5f8fa8','#d9a45e']));
  for(const [x,k] of [[980,.95],[2620,.8]]){el('path',{d:smooth([[x-46,392],[x-22,378],[x+8,372],[x+34,380],[x+50,392],[x,397]],true),...wa(W.isle,2,.2)},Lsea);scenery.lighthouse(Lsea,x+4,376,k);}}
// mid hills
const midY=x=>415+48*Math.sin(x*.0048+1.2)+14*Math.sin(x*.011+2.4);
el('path',{d:ridge(MIDW,midY),...wa(W.mid)},Lmid);fringe(Lmid,MIDW,midY,'#86a570',10,6);
scenery.haze(Lmid,MIDW,midY,'#eef4dc',.2);scenery.shadeRidge(Lmid,MIDW,midY,W.mid.hex);
for(let i=0;i<34;i++){const x=R(0,MIDW);patch(Lmid,x,midY(x)+R(40,110),R(60,140),R(14,30),pick([W.near,W.leafC]),.35);}
for(let i=0;i<70;i++){const x=R(0,MIDW);dabs(Lmid,x,midY(x)+R(24,90),40,10,3,'#b7cd9a',.4);}
for(let i=0;i<40;i++){const x=R(0,MIDW);specks(Lmid,x,midY(x)+R(20,90),R(4,9)|0,['#fbf3e4','#f2c4bd','#e9c56a'],30);}
for(let x=60;x<MIDW;x+=R(90,210)){const k=rnd(),y=midY(x)+8;k<.2?bush(Lmid,x,y+6,R(.5,.8)):k<.3?rock(Lmid,x,y+8,R(.6,1)):tree(Lmid,x,y,R(.45,.68),pick([0,0,2,2,1,3]));}
if(meadowOnly)for(let x=420;x<MIDW;x+=R(820,1300)){const y=midY(x)+34;scenery.cottage(Lmid,x,y,R(.62,.82),pick(['#c98d7c','#7fb0aa','#d9a45e']));
  for(let k=0;k<5;k++){const sx=x+R(60,190),sy=midY(sx)+R(34,70);el('ellipse',{cx:f1(sx),cy:f1(sy),rx:6.4,ry:4.6,fill:'#fbf3e4'},Lmid);el('circle',{cx:f1(sx+5.6),cy:f1(sy-2.6),r:2.5,fill:'#5c5148'},Lmid);}
  let d='';for(let wx=x-170;wx<x-40;wx+=11)d+=`M${f1(wx)} ${f1(midY(wx)+52+R(-1,1))}h8`;el('path',{d,fill:'none',stroke:'#cfc6b4','stroke-width':4.4,'stroke-linecap':'round',opacity:.85},Lmid);}
// Narrow winding tracks follow the distant slopes and disappear behind the next ridge.
for(let x=240;x<MIDW;x+=760){const y=midY(x);
  el('path',{d:`M${x} ${y+6}C${x-100} ${y+42} ${x+150} ${y+64} ${x+50} ${y+100}S${x-70} ${y+160} ${x+100} ${y+210}`,fill:'none',stroke:'#d4c593','stroke-width':9,'stroke-linecap':'round',opacity:.65},Lmid);
}
// near hills
const nearY=x=>495+38*Math.sin(x*.0052+3.3)+12*Math.sin(x*.012+6.6);
el('path',{d:ridge(NEARW,nearY),...wa(W.near)},Lnear);fringe(Lnear,NEARW,nearY,'#6c8c50',11,8);
scenery.haze(Lnear,NEARW,nearY,'#eef4dc',.08);scenery.shadeRidge(Lnear,NEARW,nearY,W.near.hex);
for(let i=0;i<40;i++){const x=R(0,NEARW);patch(Lnear,x,nearY(x)+R(40,90),R(70,160),R(14,28),pick([W.meadow,W.leafB]),.35);}
for(let i=0;i<90;i++){const x=R(0,NEARW);dabs(Lnear,x,nearY(x)+R(26,70),46,10,3,'#a3bd78',.4);}
for(let i=0;i<60;i++){const x=R(0,NEARW);specks(Lnear,x,nearY(x)+R(20,70),R(4,10)|0,['#fbf3e4','#e59aa4','#e0ad4c'],34);}
for(let x=40;x<NEARW;x+=R(120,260)){const y=nearY(x)+9,k=rnd();k<.25?bush(Lnear,x,y,R(.9,1.4)):k<.35?rock(Lnear,x,y+4,R(1,1.6)):tree(Lnear,x,y,R(.75,1.05),pick([0,0,1,2,3]));}
// tall trees close to the path
for(let x=260;x<GW*.8;x+=R(620,980)){const s=R(2.2,2.8);tree(Lgrove,x,meadowEdge(x)+80,s,pick([0,0,3,1]),true);groveSpots.push([x,s]);}

// Broad ground plane: soft clearings, tapering trail, and patches at several depths.
{el('path',{d:ridge(GW,meadowEdge,40,2),...wa(W.meadow)},Lground);
 for(let i=0;i<Math.ceil(GW/36);i++){const x=R(-150,GW),y=R(meadowEdge(x)+25,790);
   patch(Lground,x,y,R(35,140),R(9,25),pick([W.near,W.leafB,W.meadowD]),.22);
   dabs(Lground,x,y,40,8,3,'#a7bc7d',.35);}
 const band=(extra,w)=>{const top=[],bot=[];for(let x=-200;x<=GW;x+=30){
   const width=pathWidth(x)+extra;top.push([x,groundY(x)-width*.72]);bot.unshift([x,groundY(x)+width]);}
   el('path',{d:smooth(top,false)+smooth(bot,false).replace(/^M/,'L')+'Z',fill:w.fill,opacity:extra? .34:.85},Lground);};
 band(13,W.pathEdge);band(0,W.path);
 for(let x=-150;x<GW;x+=R(25,65))el('ellipse',{cx:f1(x),cy:f1(groundY(x)+R(-35,48)),rx:f1(R(2,6)),ry:f1(R(1,2)),fill:pick(['#d4b176','#f6e6c0','#c9a56c']),opacity:.55},Lground);
 // Larger near patches and smaller distant tufts establish a ground surface.
 for(let i=0;i<Math.ceil(GW/25);i++){const x=R(-150,GW),y=R(meadowEdge(x)+15,800);
   if(Math.abs(y-groundY(x))<pathWidth(x)+22)continue;
   const depth=Math.max(.45,Math.min(1.4,(y-180)/380));
   specks(Lground,x,y,5,['#fbf3e4','#e59aa4','#e0ad4c'],28*depth);
   if(i%3===0)flower(Lground,x,y,depth*.75,pick(['#fbf3e4','#e0ad4c','#e59aa4']));
   else if(i%5===0)rock(Lground,x,y,depth*.65);
 }
 // Small grassy islands soften the trail into a chain of clearings.
 for(let x=80;x<GW;x+=360){const side=Math.sin(x)>0?1:-1,y=groundY(x)+side*(pathWidth(x)+12);
   patch(Lground,x,y,65,20,W.leafB,.65);thrift(Lground,x+12,y,.85);
   if(side<0)bush(Lground,x-24,y,.55);
 }
 // Things to discover on both sides of the trail: logs, mossy stones, reeds and daisy clumps.
 for(let x=140,i=0;x<GW;x+=R(210,330),i++){const up=groundY(x)-pathWidth(x)*.72-R(22,64),dn=groundY(x)+pathWidth(x)+R(34,96),y=i%2?up:dn,k=i%2?.8:1.15;
   [()=>scenery.log(Lground,x,y,k*R(.7,.9)),()=>scenery.boulder(Lground,x,y,k*R(.6,.9),W.stone,'#7fa35c'),()=>scenery.grassClump(Lground,x,y,k*R(.8,1.1),['#4f7a3f','#6f9152','#8fb262'],pick(['#e59aa4','#fbf3e4','#e0ad4c'])),()=>{for(const dx of [-16,0,15])flower(Lground,x+dx,y+R(-4,4),k*R(.8,1.2),pick(['#fbf3e4','#fbf3e4','#f2c4bd']));},()=>mushroom(Lground,x,y,k*R(.9,1.3))][i%5]();}
 fringe(Lground,GW,meadowEdge,'#86a566',14,7);
 for(const [x,s] of groveSpots)scenery.castShadow(Lground,x+26,meadowEdge(x)+86,62*s,9*s);
}

// castle
{const cx=CASTLE+210,cy=groundY(CASTLE+210)-36,g=el('g',{transform:`translate(${cx} ${cy})`},castleS),lg=el('g',{transform:`translate(${cx} ${cy})`},liveBehind);
 el('path',{d:blob(0,8,215,38,14,.06),...wa(W.near)},g);
 const tower=(x,w,h,roof)=>{el('rect',{x:x-w/2,y:-h,width:w,height:h,rx:6,...wa(W.castle)},g);el('rect',{x:x-w/2,y:-h,width:w*.3,height:h,rx:6,fill:W.castleS.fill,opacity:.6},g);
   el('path',{d:smooth([[x-w/2-10,-h+5],[x-w*.2,-h-w*.6],[x,-h-w*1.2],[x+w*.2,-h-w*.6],[x+w/2+10,-h+5],[x,-h+9]],true),...wa(roof)},g);
   el('rect',{x:x-7,y:-h+24,width:14,height:22,rx:7,fill:'#c98d7c',opacity:.85},g);};
 tower(-92,54,150,W.roofT);tower(92,54,150,W.roofT);el('rect',{x:-80,y:-104,width:160,height:104,rx:6,...wa(W.castle)},g);tower(0,70,214,W.roof);
 el('path',{d:'M-24 0v-40a24 24 0 0 1 48 0V0Z',...wa(W.door)},g);
 castleLight=lg;
 window.__glow=el('circle',{cx:0,cy:-306,r:10,fill:'#fdf0c0',opacity:0},lg);
 el('path',{d:'M0-322l7 15 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2Z',...wa(WL.ochre,2,.3)},lg);
 thrift(g,-150,6,1.1);thrift(g,160,10,1);bush(g,-190,10,.9);}

/* ---------- stones (answers live in the world) ---------- */
const LETTERS=['a','e','i','o','u','y'];
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const targets=shuffle([...LETTERS]).slice(0,STOPS);
const stops=embedded?[]:targets.map((t,i)=>{
  const opts=shuffle([t,...shuffle(LETTERS.filter(l=>l!==t)).slice(0,2)]);
  const x0=X0+i*GAP;
  const stones=opts.map((letter,k)=>{
    const x=x0+185+k*140,y=surfaceY(x)-34;
    const g=el('g',{class:'stone',transform:`translate(${x} ${y}) scale(${stoneScale})`,role:'button','aria-hidden':'true','aria-label':'Lettre '+letter.toUpperCase()},liveBehind);
    const blooms=el('g',{},g);
    for(let b=0;b<7;b++){const f=b%3===1?thrift(blooms,-58+b*19,R(4,10),R(.7,.95),WL):flower(blooms,-58+b*19+R(-4,4),R(2,10),R(.8,1.25),pick(['#e59aa4','#e0ad4c','#fbf3e4','#f2c4bd']));
      const w=el('g',{class:'bloom'},blooms);w.style.transitionDelay=(b*70)+'ms';w.append(f);}
    el('ellipse',{cx:0,cy:4,rx:58,ry:9,fill:'#2c4a2c',opacity:.2},g);
    const inner=el('g',{class:'inner'},g);
    el('path',{class:'body',d:'M-52 0Q-58-56-30-84Q0-104 32-84Q58-58 52 0Q0 10-52 0Z',...wa(WL.stone,3,.3)},inner);
    el('path',{d:'M52 0Q58-58 32-84Q44-52 30-6Q44-2 52 0Z',fill:'#8f8672',opacity:.28},inner);
    for(let q=0;q<4;q++)el('circle',{cx:f1(R(-40,-16)),cy:f1(R(-70,-52)),r:f1(R(2,4.5)),fill:'#d9a441',opacity:.55},inner);
    for(const a of [-46,-38,36,44])el('path',{d:`M${a} 2q-2-10 ${a<0?-5:5}-15`,stroke:'#587a48','stroke-width':3,'stroke-linecap':'round',fill:'none'},inner);
    el('path',{class:'ring',d:'M-52 0Q-58-56-30-84Q0-104 32-84Q58-58 52 0Q0 10-52 0Z',fill:'none',stroke:'#b9506b','stroke-width':4,opacity:0},inner);
    const t=el('text',{x:-4,y:-26,'text-anchor':'middle','font-size':56,'font-weight':700,fill:C.ink},inner);
    t.textContent=letter.toUpperCase();
    const s=el('tspan',{'font-size':42,dx:5,'font-weight':600},t);s.textContent=letter;
    const hit=el('rect',{x:-59,y:-104,width:118,height:118,fill:'transparent'},g);
    const stone={g,letter,x,y};answerStones.push(stone);
    hit.addEventListener('pointerdown',()=>choose(i,stone));
    g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(i,stone);}});
    return stone;});
  return {x:x0,target:t,stones,done:false};
});

/* ---------- characters ---------- */
const actors=el('g',{},Llive);
// Paillette's companion: a little yellow duckling (original design) who waddles behind her.
function makeDuck(){const g=el('g',{},actors),sh=el('ellipse',{cx:2,cy:2,rx:27,ry:5,fill:scenery.shade,opacity:.3},g),b=el('g',{},g);
  const legs=[-5,9].map((x,i)=>{const l=el('g',{},b);el('path',{d:`M${x} -14V-3`,stroke:i?'#ec9a45':'#d98838','stroke-width':4,'stroke-linecap':'round',fill:'none'},l);
    el('path',{d:`M${x-2} -4Q${x+4} -6 ${x+13} -1Q${x+13} 2 ${x+8} 1.6L${x+5} 0L${x+2} 2Q${x-4} 2 ${x-2} -4Z`,fill:i?'#f0a04a':'#dd8f3e'},l);return l;});
  const tail=el('g',{},b);el('path',{d:'M-17-27Q-31-33-38-49Q-25-46-13-36Z',...wa(WL.duckD,2,.25)},tail);el('path',{d:'M-19-24Q-31-26-40-37Q-27-36-15-30Z',...wa(WL.duck,2,.25)},tail);
  el('path',{d:'M-23-22Q-25-42-6-45Q16-46 23-30Q26-12 8-7Q-14-4-23-22Z',...wa(WL.duck)},b);
  el('path',{d:'M-8-14Q4-8 18-14Q14-7 4-7Q-6-8-8-14Z',fill:'#fff3c4',opacity:.8},b);
  el('path',{d:'M-13-31Q1-38 11-27Q4-16-10-19Q-17-24-13-31Z',...wa(WL.duckD,2,.25)},b);el('path',{d:'M-9-27q7-3 13 2M-8-22q6-1 10 2',stroke:'#fff3c4','stroke-width':1.6,'stroke-linecap':'round',fill:'none',opacity:.7},b);
  const head=el('g',{},b);
  el('path',{d:'M10-34Q9-46 16-50L28-44Q26-36 24-30Z',fill:WL.duck.fill},head);
  for(const d of ['M15-64Q9-74 14-80Q19-73 19-64Z','M19-65Q20-77 27-79Q27-71 23-64Z'])el('path',{d,...wa(WL.duck,2,.25)},head);
  el('path',{d:blob(21,-51,16.5,15.5,10,.03),...wa(WL.duck)},head);
  el('path',{d:'M33-56Q48-57 52-49Q44-43 33-45Z',...wa(WL.bill,2,.3)},head);el('path',{d:'M34-49Q43-48 51-49',stroke:'#c97a34','stroke-width':1.4,'stroke-linecap':'round',fill:'none',opacity:.7},head);
  const eye=el('ellipse',{cx:27,cy:-55,rx:3.6,ry:4.8,fill:'#2f2a2a'},head),hl=el('circle',{cx:28.2,cy:-57,r:1.4,fill:'#fff'},head);
  el('circle',{cx:19,cy:-46,r:4.4,fill:'#f1a08f',opacity:.55},head);
  for(let k=0;k<5;k++){const a=k/5*6.283;el('ellipse',{cx:f1(8+Math.cos(a)*3.6),cy:f1(-61+Math.sin(a)*3.6),rx:2.8,ry:2.4,fill:'#fffaf0'},head);}el('circle',{cx:8,cy:-61,r:2,fill:'#e59aa4'},head);
  return {g,sh,b,tail,legs,pivots:[-5,9],head,eye,hl,x:X0-130,v:0,ph:0,hop:-1,blink:R(1,4)};}
function makeUnicorn(){const g=el('g',{},actors),sh=el('ellipse',{cx:0,cy:3,rx:56,ry:8,fill:scenery.shade,opacity:.32},g),b=el('g',{},g);
  const leg=(x,far)=>{const l=el('g',{},b);el('path',{d:`M${x-9.5} -52Q${x-9} -28 ${x-5.6} -9H${x+5.6}Q${x+9} -28 ${x+9.5} -52Z`,...wa(far?WL.bodyS:WL.body,2,far?.12:.22)},l);
    el('path',{d:`M${x-6.2} -12H${x+6.2}Q${x+9.6} -6 ${x+8.4} -1.6Q${x} 2.8 ${x-8.4} -1.6Q${x-9.6} -6 ${x-6.2} -12Z`,fill:far?'#d98b93':WL.pink.fill},l);return {l,x};};
  const tail=el('g',{},b);
  el('path',{d:'M-38-82Q-76-96-92-60Q-102-28-82 0Q-70 6-63-3Q-76-28-66-49Q-56-64-37-66Z',...wa(WL.pink)},tail);
  el('path',{d:'M-42-76Q-70-78-79-52Q-85-28-73-9Q-68-31-59-46Q-51-58-39-63Z',...wa(WL.ochre,2,.2)},tail);
  el('path',{d:'M-46-70Q-64-66-68-46Q-70-32-66-22Q-62-38-55-48Q-49-56-42-60Z',...wa(WL.lilac,2,.2)},tail);
  el('path',{d:'M-82 0Q-96-22-90-50Q-83-30-76-17Q-71-7-72 2Z',...wa(WL.teal,2,.2)},tail);
  const farB=leg(-22,true),farF=leg(24,true);
  el('path',{d:'M-48-68Q-50-100-18-102Q16-105 38-94Q54-82 50-60Q44-34 6-32Q-42-32-48-68Z',...wa(WL.body)},b);
  el('path',{d:'M-45-58Q0-34 47-60Q42-36 6-33Q-36-33-45-58Z',fill:WL.bodyS.fill,opacity:.75},b);
  el('path',{d:'M-34-92Q-10-100 14-97',stroke:'#fff','stroke-width':5,'stroke-linecap':'round',fill:'none',opacity:.55},b);
  for(const [x,y,r] of [[-30,-70,2.4],[-23,-78,1.7],[-22,-66,1.5]])el('circle',{cx:x,cy:y,r,fill:'#f0cf8f',opacity:.85},b);
  const nearB=leg(-30,false),nearF=leg(32,false);
  const head=el('g',{},b);
  el('path',{d:'M12-74Q16-106 34-122L62-98Q50-80 47-56Q30-58 12-74Z',fill:WL.body.fill},head);
  const mane=el('g',{},head);
  el('path',{d:'M32-128Q0-130-10-98Q-14-74 4-58Q5-86 18-98Q30-108 40-118Z',...wa(WL.teal,2,.22)},mane);
  el('path',{d:'M40-143Q6-152-4-118Q-8-100 1-86Q9-112 26-121Q40-128 48-134Z',...wa(WL.ochre,2,.22)},mane);
  el('path',{d:'M36-134Q14-132 6-108Q16-118 30-123Z',...wa(WL.lilac,2,.2)},mane);
  el('path',{d:'M51-128Q55-158 66-178Q72-158 68-130Z',...wa(WL.ochre,2.5,.3)},head);
  for(const d of ['M57-146l10 3','M55-136l13 4','M60-158l6 2'])el('path',{d,stroke:'#fbe8b0','stroke-width':3,'stroke-linecap':'round'},head);
  el('path',{d:'M76-176l1.8 4.6 4.6 1.8-4.6 1.8-1.8 4.6-1.8-4.6-4.6-1.8 4.6-1.8Z',fill:'#fff6c9'},head);
  const ear=el('g',{},head);el('path',{d:'M33-134Q29-157 44-164Q53-149 48-131Z',...wa(WL.body)},ear);el('path',{d:'M38-138Q36-152 44-157Q48-147 46-137Z',fill:WL.pink.fill},ear);
  el('path',{d:blob(46,-112,30,29.5,12,.03),...wa(WL.body)},head);el('path',{d:blob(69,-102,17,14,9,.05),fill:'#fbe9df'},head);
  el('path',{d:'M54-144Q36-158 24-142Q16-130 20-118Q28-132 40-136Q48-138 56-138Z',...wa(WL.pink,2,.22)},mane);
  el('path',{d:'M50-141Q62-142 66-130Q59-135 51-133Z',...wa(WL.pink,2,.22)},mane);
  const eye=el('ellipse',{cx:54,cy:-116,rx:5.8,ry:7.6,fill:'#2f2a2a'},head),hl=el('circle',{cx:56,cy:-119.6,r:2.2,fill:'#fff'},head);
  el('circle',{cx:52.4,cy:-112.6,r:1.1,fill:'#fff',opacity:.8},head);
  el('path',{d:'M58.6-123.4l3.4-3M60.2-120l4-1.6',stroke:'#2f2a2a','stroke-width':1.5,'stroke-linecap':'round',fill:'none'},head);
  el('circle',{cx:45,cy:-101,r:7.4,fill:'#eaa0a6',opacity:.6},head);
  const mouth=el('path',{d:'M66-97Q72-92 78-97',fill:'none',stroke:'#a9736c','stroke-width':2.4,'stroke-linecap':'round'},head);
  el('circle',{cx:77,cy:-106,r:1.6,fill:'#b98f84'},head);
  return {g,sh,b,tail,head,ear,eye,hl,mouth,mane,legs:{farB,farF,nearB,nearF},x:X0,v:0,ph:0,hop:-1,tilt:0,blink:R(1,3),flick:R(2,5)};}
const pal=makeDuck(),uni=makeUnicorn();
const sparks=el('g',{},Llive);
const Lfg=layer(1.38,wB,FW,480,750,{wind:1});
{const fy=x=>702+16*Math.sin(x/190)+8*Math.sin(x/61);
 el('path',{d:ridge(FW,fy,40,3),...wa(W.fg)},Lfg);fringe(Lfg,FW,fy,'#3d5c38',12,12);
 for(let i=0;i<110;i++){const x=R(-150,FW);dabs(Lfg,x,fy(x)+R(26,70),40,10,2,'#6c8f58',.45);}
 for(let i=0;i<70;i++){const x=R(-150,FW);specks(Lfg,x,fy(x)+R(16,50),R(3,8)|0,['#fbf3e4','#e59aa4','#e0ad4c'],40);}
 for(let x=-100;x<FW;x+=R(70,180)){const y=fy(x)+26,k=rnd();
   k<.3?fern(Lfg,x,y,R(.9,1.35),pick([W.fg2,W.leafA])):k<.5?sprig(Lfg,x,y,R(1,1.5),pick([W.leafB,W.fg2])):k<.7?thrift(Lfg,x,y-4,R(1.5,2.1)):k<.8?rock(Lfg,x,y-8,R(1.4,2.2)):k<.9?mushroom(Lfg,x,y-10,R(1.3,1.9))
   :flower(Lfg,x,y-6,R(1.5,2.1),pick(['#e59aa4','#fbf3e4','#e0ad4c']));}}
// overhanging branches frame the top of the page
const Ltop=layer(1.6,wB,0,0,0,{wind:1,noTiles:1,top:1});
for(let x=120;x<TWD;x+=R(620,1050)){const sc=R(1,1.5),dir=rnd()<.5?1:-1,h=el('g',{transform:`translate(${f1(x)} 0) scale(${f1(sc*10)/10})`},Ltop),c=sway(h,'-190,-12,190,190','sway top');
  el('path',{d:`M${-170*dir}-8Q${-60*dir} 30 ${40*dir} 70Q${90*dir} 96 ${130*dir} 92`,stroke:'#7a5c48','stroke-width':9,'stroke-linecap':'round',fill:'none'},c);
  el('path',{d:`M${-40*dir} 34Q${-10*dir} 80 ${-30*dir} 120`,stroke:'#7a5c48','stroke-width':5,'stroke-linecap':'round',fill:'none'},c);
  const lw=pick([[W.leafA,W.leafB,W.leafC],[W.leafB,W.leafC,W.ochreLeaf]]);
  for(let i=0;i<34;i++){const t=rnd(),bx=(-170+300*t)*dir+R(-26,26),by=-8+100*t*t+R(-6,60),a=R(40,140);
    el('ellipse',{cx:f1(bx),cy:f1(by),rx:f1(R(13,20)),ry:f1(R(6,9)),transform:`rotate(${f1(a)} ${f1(bx)} ${f1(by)})`,...wa(pick(lw),1.6,.25)},c);}
  for(let i=0;i<7;i++)el('circle',{cx:f1(R(-150,130)*dir),cy:f1(R(20,130)),r:f1(R(3,5)),fill:pick(['#e59aa4','#f2c4bd']),opacity:.9},c);}
if(forest)paintForest({S:scenery,el,wa,W,blob,R,tree,mushroom,sprig,groundY,pathWidth,midY,nearY,layers:{valley:Lsea,mid:Lmid,near:Lnear,grove:Lgrove,ground:Lground},widths:{mid:MIDW,near:NEARW,ground:GW}});
if(jungle)paintJungle({S:scenery,el,wa,W,blob,R,ridge,groundY,pathWidth,midY,nearY,layers:{valley:Lsea,mid:Lmid,near:Lnear,grove:Lgrove,ground:Lground},widths:{mid:MIDW,near:NEARW,ground:GW}});
const customScatter=custom&&paintHabitat(habitat,{el,wa,W,blob,R,pick,ridge,smooth,tree,mushroom,patch,flower,thrift,fringe,sway,f1,groundY,pathWidth,meadowEdge,midY,nearY,S:scenery,layers:{sky:Lsky,mountains:Lmount,valley:Lsea,mid:Lmid,near:Lnear,grove:Lgrove,ground:Lground,foreground:Lfg,top:Ltop},widths:{mid:MIDW,near:NEARW,ground:GW,foreground:FW,top:TWD}});
// The same brush adds tufts, flower drifts, pebbles and depth haze to every world's clearing.
const woodScatter=(x,y,k,i)=>[()=>scenery.log(Lground,x,y,k),()=>scenery.boulder(Lground,x,y,k,W.stone,'#7fa35c'),()=>scenery.grassClump(Lground,x,y,k*1.1,[W.leafA.hex,W.meadowD.hex,W.leafC.hex],pick(['#e59aa4','#fbf3e4','#e0ad4c'])),()=>mushroom(Lground,x,y,k*1.3),()=>{for(const dx of [-18,0,17])flower(Lground,x+dx,y+R(-5,5),k*R(1,1.4),pick(['#fbf3e4','#f2c4bd','#e0ad4c']));},()=>thrift(Lground,x,y,k*1.2)][i%6]();
scenery.ground(Lground,habitat,{width:GW,edge:meadowEdge,groundY,pathWidth,scatter:customScatter||woodScatter});
const crossingFront=layer(1,wB,GW,180,1300,{depth:.12,route:true});
paintCrossings(route,{el,ground:Lground,front:crossingFront,groundY,habitat});
const dusk=$('dusk');
const fork=embedded?createCrossroads({view:$('view'),W:WL,wa,habitat,sky:()=>$('skyg').style.background,shade:scenery.shade,reduced,R:(a,b)=>a+Math.random()*(b-a),speck:liveSpeck,shadeHex}):null;
/* ---------- baking ---------- */
function applyT(ctx,tr){for(const m of tr.matchAll(/(translate|scale|rotate)\(([^)]*)\)/g)){const v=m[2].trim().split(/[\s,]+/).map(Number);
  if(m[1]==='translate')ctx.translate(v[0],v[1]||0);else if(m[1]==='scale')ctx.scale(v[0],v[1]??v[0]);
  else{const r=v[0]*Math.PI/180;if(v.length>2){ctx.translate(v[1],v[2]);ctx.rotate(r);ctx.translate(-v[1],-v[2]);}else ctx.rotate(r);}}}
const pathCache=new WeakMap(),tileIndex=new WeakMap();
function paint(ctx,n,cull){const tag=n.tagName,tr=n.getAttribute('transform');
  if(cull){let x=n.getAttribute('cx');if(x===null){const m=/translate\(([-\d.]+)/.exec(tr||'');x=m?m[1]:null;}if(x!==null&&(+x<cull[0]||+x>cull[1]))return;}
  if(tag==='g'&&!tr&&!n.getAttribute('opacity')){for(const c of n.children)paint(ctx,c,cull);return;}
  ctx.save();if(tr)applyT(ctx,tr);const op=n.getAttribute('opacity');if(op!==null)ctx.globalAlpha*=+op;
  if(tag==='g'){for(const c of n.children)paint(ctx,c,null);}
  else{let p;const A=k=>+n.getAttribute(k)||0;
    if(tag==='path'){p=pathCache.get(n);if(!p){p=new Path2D(n.getAttribute('d'));pathCache.set(n,p);}}
    else{p=new Path2D();if(tag==='rect'){p.roundRect&&A('rx')?p.roundRect(A('x'),A('y'),A('width'),A('height'),A('rx')):p.rect(A('x'),A('y'),A('width'),A('height'));}
      else if(tag==='ellipse')p.ellipse(A('cx'),A('cy'),A('rx'),A('ry'),0,0,6.2832);else p.arc(A('cx'),A('cy'),A('r'),0,6.2832);}
    const fill=n.getAttribute('fill');
    if(fill&&fill!=='none'){ctx.fillStyle=fill.startsWith('url(')?(ctx.__p[fill]??=ctx.createPattern(PAT[fill.slice(5,-1)],'repeat')):fill;ctx.fill(p);}
    const st=n.getAttribute('stroke'),sw=+n.getAttribute('stroke-width');
    if(st&&sw){ctx.strokeStyle=st;ctx.lineWidth=sw;ctx.lineCap=n.getAttribute('stroke-linecap')||'butt';ctx.lineJoin=n.getAttribute('stroke-linejoin')||'miter';
      const so=n.getAttribute('stroke-opacity');if(so!==null)ctx.globalAlpha*=+so;ctx.stroke(p);}}
  ctx.restore();}
const BK=Math.max(.8,Math.min(Math.min(innerWidth,innerHeight)<600?1.2:1.5,(window.devicePixelRatio||1)*Math.max(innerHeight,innerWidth*.5,480)/750));
/* Tile virtualisation: a long journey is far wider than the screen, so only the tiles near the camera
 * exist as bitmaps. Each plane is also cropped to the part that can show above the nearer planes. */
const TILE=650;
let bakeQueue=[],bakeHandle=null,prepareVersion=0,pinnedRange=null,scenerySuspended=false;
const pendingBakes=new Map();
function pumpBakes(){
  bakeHandle=null;
  const job=bakeQueue.shift();if(!job)return;
  pendingBakes.delete(job.key);
  if(destroyed||scenerySuspended){job.resolve(false);}else{job.paint();job.resolve(true);}
  if(bakeQueue.length)scheduleBake();
}
function scheduleBake(){if(bakeHandle!==null)return;
  bakeHandle=window.requestIdleCallback?window.requestIdleCallback(pumpBakes,{timeout:100}):window.setTimeout(pumpBakes,0);
}
function queueTile(L,i){
  const key=layers.indexOf(L)+':'+i;
  if(L.tiles.has(i))return Promise.resolve(true);
  if(pendingBakes.has(key))return pendingBakes.get(key);
  const promise=new Promise(resolve=>bakeQueue.push({key,paint:()=>bakeTile(L,i),resolve}));pendingBakes.set(key,promise);scheduleBake();return promise;
}
function bakeTile(L,i){if(L.tiles.has(i))return;
  const x=i*TILE,w=Math.min(TILE+2,L.x1-x),bottom=needBottom(L);L.bottom=bottom;
  L.tiles.set(i,w>0&&bottom-L.y0>8?tile(L.tileBox,L.g,x,L.y0,w,bottom-L.y0,[x-24,x+w+24],L.res||BK*(L.soft||1)):null);
}
function preparePath(target,pin=false){
  const end=Math.max(0,target+225-VW/2),lo=Math.min(cam,end),hi=Math.max(cam,end),jobs=[];
  if(pin)pinnedRange=[lo,hi];
  for(let x=lo;x<=hi+TILE;x+=TILE)jobs.push(...syncTiles(99,Math.min(x,hi),false));
  return Promise.all(jobs);
}
function needBottom(L){const extra=Math.max(0,VH-750),k=Math.max(0,1-extra/500),portrait=Math.max(0,Math.min(1,(.95-innerWidth/innerHeight)/.35));
  if(L.g===Lground||L.route)return Math.min(L.y1,764+extra*.12+(embedded?sceneRaise*portrait:0));
  if(L.depth)return Math.min(L.y1,338+extra*(L.depth-.12)+(L.lift||0)*k);
  return L.y1;}
function releaseCanvas(c){if(!c)return;c.width=0;c.height=0;c.remove();}
function dropTiles(L){for(const c of L.tiles.values())releaseCanvas(c);L.tiles.clear();}
function queueSprite(L,s){
  if(s.n)return Promise.resolve(true);
  const key='plant:'+layers.indexOf(L)+':'+L.sprites.indexOf(s);
  if(pendingBakes.has(key))return pendingBakes.get(key);
  const promise=new Promise(resolve=>bakeQueue.push({key,paint:()=>{if(!s.n){s.n=s.paint();s.hidden=null;L.div.append(s.n);}},resolve}));
  pendingBakes.set(key,promise);scheduleBake();return promise;
}
function syncSprites(L,camera,immediate,jobs){
  if(!L.sprites)return;const sx=camera*L.f;
  const lo=(pinnedRange?.[0]??camera)*L.f-800,hi=(pinnedRange?.[1]??camera)*L.f+VW+800;
  for(const s of L.sprites){
    if(s.x+s.w>=sx-200&&s.x<=sx+VW+400&&!s.n)jobs.push(queueSprite(L,s));
    if(!immediate||!s.n)continue;
    if(s.x+s.w<lo||s.x>hi){releaseCanvas(s.n);s.n=null;continue;}
    const hidden=s.x+s.w<sx-160||s.x>sx+VW+160;
    if(hidden!==s.hidden){s.hidden=hidden;s.n.style.visibility=hidden?'hidden':'';s.n.style.animationPlayState=hidden?'paused':'';}
  }
}
function releaseScenery(){
  scenerySuspended=true;
  for(const job of bakeQueue)job.resolve(false);bakeQueue=[];pendingBakes.clear();
  for(const L of layers){if(L.tiles)dropTiles(L);for(const s of L.sprites??[]){releaseCanvas(s.n);s.n=null;}}
}
function syncTiles(prefetch,camera=cam,immediate=true){
  let spare=prefetch;const jobs=[];if(scenerySuspended)return jobs;
  for(const L of layers){syncSprites(L,camera,immediate,jobs);if(!L.tiles)continue;
    const sx=camera*L.f,pad=400*Math.max(1,L.f)+100,count=Math.ceil(L.x1/TILE),lo=Math.floor(sx/TILE),hi=Math.floor((sx+VW)/TILE);
    const first=Math.max(0,Math.floor((sx-pad)/TILE)),last=Math.min(count-1,Math.floor((sx+VW+pad)/TILE));
    for(let i=first;i<=last;i++){if(L.tiles.has(i))continue;const visible=i>=lo&&i<=hi;
      if(!visible){if(spare<=0)continue;spare--;}
      if(visible&&immediate)bakeTile(L,i);else jobs.push(queueTile(L,i));
    }
    if(immediate){const keepFirst=pinnedRange?Math.min(first-1,Math.floor((pinnedRange[0]*L.f-pad)/TILE)):first-1,keepLast=pinnedRange?Math.max(last+1,Math.ceil((pinnedRange[1]*L.f+VW+pad)/TILE)):last+1;for(const [i,c] of L.tiles)if(i<keepFirst||i>keepLast){releaseCanvas(c);L.tiles.delete(i);}}

  }
  return jobs;
}
function canvasFor(x,y,w,h,res){const c=document.createElement('canvas');c.width=Math.ceil(w*res);c.height=Math.ceil(h*res);
  c.style.cssText=`left:${f1(x)}px;top:${f1(y)}px;width:${f1(w)}px;height:${f1(h)}px`;const ctx=c.getContext('2d');ctx.__p={};ctx.setTransform(res,0,0,res,-x*res,-y*res);return [c,ctx];}
function tile(host,root,x,y,w,h,cull,res=BK){const start=performance.now();const [c,ctx]=canvasFor(x,y,w,h,res);const entries=tileIndex.get(root);if(entries){for(const e of entries)if(!cull||e.hi>=cull[0]&&e.lo<=cull[1])paint(ctx,e.n,null);}else for(const n of root.children)paint(ctx,n,cull);host.append(c);if(perf){metrics.tiles++;metrics.paintMs+=performance.now()-start;if(document.body.dataset.moving==='true')metrics.travelTiles++;}return c;}
// plants that move in the wind become their own small images, animated by the compositor
function windify(L){const out=[];for(const c of [...L.g.querySelectorAll('.sway,.still')]){
  const b=(c.dataset.b||'').split(',').map(Number),tr=c.parentNode.getAttribute('transform')||'';
  const m=/translate\(([-\d.]+)[ ,]+([-\d.]+)\)\s*scale\(([-\d.]+)\)/.exec(tr);if(!m||b.length<4)continue;
  const x=+m[1],y=+m[2],sc=+m[3],h=(b[3]-b[1])*sc;if(!L.noTiles&&!c.classList.contains('waterfall'))continue;
  const X0=x+b[0]*sc-3,Y0=y+b[1]*sc-3,w=(b[2]-b[0])*sc+6;
  const cls=c.classList.contains('waterfall')?'waterfall':c.classList.contains('sway')?'wind'+(c.classList.contains('top')?' top':'')+pick(['',' s2',' s3']):'';
  const delay=(-R(0,7)).toFixed(2)+'s';c.remove();
  out.push({x:X0,y:Y0,w,n:null,hidden:null,paint(){
    const [cv,ctx]=canvasFor(X0,Y0,w,h+6,BK);applyT(ctx,tr);for(const n of c.children)paint(ctx,n,null);
    cv.className=cls;cv.style.animationDelay=delay;cv.style.transformOrigin=`${f1(x-X0)}px ${f1(y-Y0)}px`;return cv;
  }});
}return out;}

for(const L of layers){
  if(L.mist){const m=document.createElement('div'),[top,h,o]=L.mist;if(!o)continue;m.style.cssText=`top:${top}px;height:${h}px;width:2600px;opacity:${o};background:linear-gradient(rgba(251,243,223,0),rgba(251,243,223,.55) 55%,rgba(251,243,223,0))`;const wrap=document.createElement('div');wrap.append(m);wA.append(wrap);reliefLayers.push({node:wrap,depth:L.depth,lift:L.lift});continue;}
  L.div=document.createElement('div');L.div.className='L';L.host.append(L.div);if(L.depth)reliefLayers.push({node:L.div,depth:L.depth,lift:L.lift||0});if(L.slot)continue;if(L.top)topDiv=L.div;
  const sprites=L.wind?windify(L):[];
  L.sprites=sprites;
  tileIndex.set(L.g,[...L.g.children].map(n=>{
    try{const b=n.getBBox(),m=n.getCTM();const xs=[[b.x,b.y],[b.x+b.width,b.y],[b.x,b.y+b.height],[b.x+b.width,b.y+b.height]].map(([x,y])=>m.a*x+m.c*y+m.e);
      return {n,lo:Math.min(...xs)-16,hi:Math.max(...xs)+16};}catch{return {n,lo:-Infinity,hi:Infinity};}
  }));
  // Scenery tiles are painted on demand around the camera (see syncTiles) instead of all at once.
  if(!L.noTiles){L.tiles=new Map();L.tileBox=document.createElement('div');L.tileBox.className='T';L.div.append(L.tileBox);}
  if(L.g===Lground)castleCanvas=tile(L.div,castleS,CASTLE-60,groundY(CASTLE+210)-36-340,540,410,null);
}
for(const c of clouds){const wrap=el('g',{},scratch);wrap.append(c.g);c.n=tile(cloudS.div,wrap,-110*c.sc,-52*c.sc,280*c.sc,100*c.sc,null);c.n.style.left=c.n.style.top='0';c.n.style.willChange='transform';}

/* ---------- animals: a few small images each, moved only with transforms ---------- */
// Same, but cropped to what was actually drawn, so each animal part is a small texture.
function sprite(build,ox=0,oy=0){const g=el('g',{},scratch);build(g);let b=null;try{b=g.getBBox();}catch(_){b=null;}
  if(!b||!(b.width>0&&b.height>0))b={x:-130,y:-200,width:260,height:230};
  const pad=5,x0=Math.floor(b.x-pad),y0=Math.floor(b.y-pad),[c,ctx]=canvasFor(x0,y0,Math.ceil(b.width+pad*2),Math.ceil(b.height+pad*2),BK*1.3);
  for(const n of g.children)paint(ctx,n,null);g.remove();c.style.transformOrigin=`${f1(ox-x0)}px ${f1(oy-y0)}px`;return c;}
const box=(host,...parts)=>{const d=document.createElement('div');d.className='A';d.append(...parts);host.append(d);return d;};
const fauna=createFauna(habitat,{el,sprite,box,wash,shadeHex,shadow:scenery.shade,host:rabS.div,groundY,pathWidth,meadowEdge,reduced});
const heroInfo={x:0,y:0,scale:1,moving:false};
const animals=dt=>{heroInfo.x=uni.x;heroInfo.y=surfaceY(uni.x)+6;heroInfo.scale=heroScale*travelScale(uni.x);heroInfo.moving=uni.v>25;fauna.update(dt,cam,VW,heroInfo);};
const cheerAnimals=()=>fauna.cheer();
if(fork)fork.setGuests(fauna.guests(fork.life));
scratch.remove();fit();

// A few far-off birds cross the sky; each is one tiny bitmap moved and flapped with transforms.
const flock=[];
if(!reduced&&!['moon','clouds','desert'].includes(habitat))for(let i=0;i<5;i++){
  const n=sprite(g=>el('path',{d:'M-11 1Q-6-7 0 0Q6-7 11 1Q6-3 0 3Q-6-3-11 1Z',fill:habitat==='ice'?'#6f8fa4':'#5f6f6a',opacity:.75},g),0,0);
  n.style.left=n.style.top='0';birdS.div.append(n);flock.push({n,x:R(0,1700),y:R(40,170)+(i%2?-R(120,420):0),v:R(14,26),p:R(0,6),s:R(.7,1.25)});}

/* ---------- HUD ---------- */
const gems=document.getElementById('gems');
for(let i=0;i<STOPS;i++)gems.insertAdjacentHTML('beforeend','<svg viewBox="0 0 20 22"><path d="M5 1h10l5 6-10 14L0 7Z"/></svg>');
const prompt=document.getElementById('prompt'),targetEl=document.getElementById('target'),endEl=document.getElementById('end');

/* ---------- sound (placeholder tones, no speech synthesis) ---------- */
let ac=null,soundOn=false,wind=null;
function tone(f,t0,d,vol=.08,type='sine'){if(!soundOn||!ac)return;const t=ac.currentTime+t0,o=ac.createOscillator(),g=ac.createGain();
  o.type=type;o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.03);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+d+.05);}
const chime=()=>[659,784,988,1319].forEach((f,i)=>tone(f,i*.09,.7,.07,'triangle'));
const hmm=()=>{tone(330,0,.25,.05);tone(294,.14,.35,.05);};
const ask=()=>{if(started&&!paused&&soundOn&&cur<STOPS)void ready.then(()=>{if(!paused&&state==='ask')return say(['L:'+stops[cur].target]);});};
document.getElementById('snd').addEventListener('click',e=>{
  try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();ac.resume();}catch(_){return;}
  soundOn=!soundOn;e.currentTarget.setAttribute('aria-pressed',soundOn);e.currentTarget.textContent=soundOn?'♪ Son ✓':'♪ Son';
  if(soundOn&&!wind){const n=ac.sampleRate*3,buf=ac.createBuffer(1,n,ac.sampleRate),d=buf.getChannelData(0);let v=0;
    for(let i=0;i<n;i++){v=v*.985+(Math.random()*2-1)*.015;d[i]=v*6;}
    const s=ac.createBufferSource();s.buffer=buf;s.loop=true;const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=520;
    wind=ac.createGain();wind.gain.value=.05;s.connect(f);f.connect(wind);wind.connect(ac.destination);s.start();}
  if(wind)wind.gain.value=soundOn&&!paused?.05:0;if(soundOn)ask();else hush();});
document.getElementById('say').addEventListener('click',ask);
document.getElementById('again').addEventListener('click',()=>location.reload());

/* ---------- game flow ---------- */
let cur=0,state='arrive',cam=0,goal=X0,collected=0,last=performance.now(),T=0,finaleT=-1;
let journeyTotal=20,journeyCount=0,destroyed=false,backwards=false;
const journey=createJourney({start:X0,end:CASTLE,step:GAP,reduced});
const fireflies=forest?Array.from({length:6},(_,i)=>{const g=el('g',{'aria-hidden':'true'},svg);el('circle',{r:11,fill:'#f4d989',opacity:.12},g);el('circle',{r:3,fill:'#fff1a9'},g);return {g,phase:i*2.4};}):[];
const journeyMarks=el('g',{'aria-hidden':'true'},liveBehind);
const portalFront=el('g',{'aria-hidden':'true'},Llive);
function markJourney(keepPortal=false){
  document.body.dataset.crystals=String(journeyCount);
  if(keepPortal&&journeyCount>0&&journeyCount%10===0&&journeyCount<journeyTotal)return;
  journeyMarks.replaceChildren();portalFront.replaceChildren();
  if(!embedded)return;
  if(journeyCount>=journeyTotal)return;
  const x=journey.positionAt(journeyCount+1),y=surfaceY(x)-100;
  if((journeyCount+1)%10===0&&journeyCount+1<journeyTotal){
    const portal=el('g',{'data-world-portal':'entrance',transform:`translate(${x} ${surfaceY(x)})`},journeyMarks);
    el('ellipse',{cx:0,cy:-98,rx:67,ry:106,fill:'#9ccfd2',opacity:.45},portal);
    el('ellipse',{cx:0,cy:-98,rx:72,ry:112,fill:'none',stroke:'#d0b2df','stroke-width':15},portal);
    el('ellipse',{cx:0,cy:-98,rx:62,ry:102,fill:'none',stroke:'#fff2b8','stroke-width':5},portal);
    for(let i=0;i<9;i++){const a=Math.PI+i*Math.PI/8;el('circle',{cx:Math.cos(a)*72,cy:-98+Math.sin(a)*112,r:4,fill:'#fff9df'},portal);}
    const front=el('g',{transform:`translate(${x} ${surfaceY(x)})`},portalFront);
    el('path',{d:'M0 -210A72 112 0 0 1 0 14',fill:'none',stroke:'#d0b2df','stroke-width':15},front);
    el('path',{d:'M0 -200A62 102 0 0 1 0 4',fill:'none',stroke:'#fff2b8','stroke-width':5},front);
  }
  const gem=el('g',{'data-journey-crystal':'next',class:'gem',transform:`translate(${x} ${y})`},journeyMarks),bob=el('g',{class:'gem-bob'},gem);
  el('ellipse',{cx:0,cy:92,rx:20,ry:4.6,fill:scenery.shade,opacity:.3},gem);
  el('circle',{class:'gem-halo',cx:0,cy:20,r:38,fill:'#fff6c9',opacity:.3},bob);
  el('path',{d:'M-13 0h26l11 13-24 32-24-32Z',fill:'#6fc7bd',stroke:'#fbf3e4','stroke-width':3,'stroke-linejoin':'round'},bob);
  el('path',{d:'M-13 0h26l11 13h-48Z',fill:'#a9e6dc'},bob);el('path',{d:'M0 13l24 0-24 32Z',fill:'#4fa9a6',opacity:.75},bob);el('path',{d:'M-8 13L0 0 8 13 0 45Z',fill:'#d6f6ee',opacity:.55},bob);
  el('path',{class:'gem-glint',d:'M19-9l2.2 6 6 2.2-6 2.2-2.2 6-2.2-6-6-2.2 6-2.2Z',fill:'#fffdf0'},bob);
}

function openQuestion(){const s=stops[cur];state='ask';targetEl.textContent=s.target.toUpperCase();prompt.classList.remove('away');
  s.stones.forEach(st=>{st.g.classList.add('live');st.g.setAttribute('tabindex',0);st.g.removeAttribute('aria-hidden');});ask();
  if(demo)later(()=>choose(cur,s.stones.find(st=>st.letter===s.target)),900);}
function burst(x,y,n,cols){for(let i=0;i<n;i++){const a=R(-Math.PI,0),sp=R(60,210);
  const c=el('circle',{r:R(2.5,5.5),fill:pick(cols)},sparks);parts.push({c,x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-40,life:R(.7,1.3),t:0});}}
const parts=[];
function choose(i,stone){if(paused||state!=='ask'||i!==cur)return;const s=stops[cur];
  if(stone.letter!==s.target){stone.g.classList.remove('no');void stone.g.getBBox();stone.g.classList.add('no');uni.tilt=1;hmm();return;}
  hush();state='cheer';s.done=true;prompt.classList.add('away');chime();
  s.stones.forEach(st=>{st.g.classList.remove('live');st.g.removeAttribute('tabindex');st.g.setAttribute('aria-hidden','true');if(st!==stone)st.g.classList.add('dim');});
  stone.g.querySelector('.body').setAttribute('fill',WL.stoneWarm.fill);stone.g.querySelectorAll('.bloom').forEach(b=>b.classList.add('on'));
  burst(stone.x,stone.y-70,22,['#e0ad4c','#fbf3e4','#e59aa4','#6fbfb8']);
  gems.children[collected++].classList.add('got');uni.hop=0;later(()=>pal.hop=0,160);cheerAnimals();
  dusk.style.opacity=(collected/STOPS*.16).toFixed(3);
  later(()=>{cur++;if(cur<STOPS){goal=stops[cur].x;state='walk';}else{goal=CASTLE;state='finale';}},reduced?300:950);}
function step(a,dt,target,max,snap){const want=Math.max(0,Math.min(max,(target-a.x)*2.4+14));a.v+=(want-a.v)*Math.min(1,dt*5);
  let dx=a.v*dt;if(a.x+dx>=target){dx=Math.max(0,target-a.x);if(snap||a.v<30)a.v=0;}
  a.x+=dx;a.ph+=dx/24;return Math.min(1,a.v/110);}
let lastStepSide=0;
let fN=0,fT=0,forkWait=0,forkTick=false;

function frame(now){if(destroyed)return;const elapsed=(now-last)/1000,dt=Math.min(.05,elapsed);last=now;const workStart=performance.now();
  if(paused){requestAnimationFrame(frame);return;}
  if(fork?.visible&&!journey.state().moving){forkWait+=dt;if(fork.state().decided||(forkTick=!forkTick)){fork.update(Math.min(.05,forkWait));forkWait=0;}layoutListener?.();requestAnimationFrame(frame);return;}
  for(const job of [...scheduled]){job.left-=dt;if(job.left<=0){scheduled.splice(scheduled.indexOf(job),1);job.fn();}}
  T+=reduced?0:dt;
  for(const [i,f] of fireflies.entries()){const x=((i+.5)/fireflies.length*VW+Math.sin(T*.35+f.phase)*30),y=750-VH+VH*(.25+(i%5)*.12)+Math.cos(T*.6+f.phase)*16;f.g.setAttribute('transform',`translate(${x} ${y})`);f.g.setAttribute('opacity',String(.4+.5*(.5+.5*Math.sin(T*1.2+f.phase))));}
  if(fN>=0&&T>2){fN++;fT+=dt;if(fT>3){if(fN/fT<42)document.body.classList.add('calm');fN=-1;}}
  const moving=state==='walk'||state==='finale'||state==='arrive';
  let w,fw;
  if(embedded){
    const wasReturning=journey.state().returning,before=uni.x,completed=journey.update(dt),motion=journey.state();uni.x=motion.x;
    const dx=uni.x-before;uni.ph+=Math.abs(dx)/24;backwards=motion.returning;
    if(document.body.dataset.moving!==String(motion.moving))document.body.dataset.moving=String(motion.moving);
    const crossing=route.at(uni.x)?.kind??'trail';if(document.body.dataset.crossing!==crossing)document.body.dataset.crossing=crossing;
    if(completed){journeyCount=motion.count;markJourney(!wasReturning);dusk.style.opacity=(journeyCount/journeyTotal*.16).toFixed(3);uni.hop=reduced?-1:0;if(journeyCount===journeyTotal)finaleT=0;}
    w=Math.min(1,Math.abs(dx)/Math.max(.001,dt)/170);uni.v=w*170;
    const follow=uni.x-146+(heroScale-1)*190,delta=(follow-pal.x)*Math.min(1,dt*5);pal.x+=delta;pal.ph+=Math.abs(delta)/24;fw=Math.min(1,Math.abs(delta)/Math.max(.001,dt)/170);
  }else{w=step(uni,dt,moving?goal:uni.x,235,true);fw=step(pal,dt,uni.x-146,255,false);}
  if(!embedded&&(state==='walk'||state==='arrive')&&uni.v===0&&Math.abs(goal-uni.x)<1)openQuestion();
  if(state==='finale'&&uni.v===0&&finaleT<0){finaleT=0;endEl.classList.add('on');chime();uni.hop=0;later(()=>pal.hop=0,200);}
  // camera
  const focus=embedded?uni.x+170:state==='finale'?uni.x+170:(state==='cheer'||state==='ask')&&cur<STOPS?stops[cur].x+225:uni.x+225;
  const tc=Math.max(0,focus-VW/2);cam=Math.abs(tc-cam)<.08?tc:cam+(tc-cam)*(1-Math.exp(-dt*4));
  syncTiles(document.body.dataset.moving==='true'||state==='walk'||state==='finale'?0:1);
  for(const L of layers)if(L.div&&L.f){const x=(-cam*L.f).toFixed(2);if(x!==L.lastX){L.lastX=x;L.div.style.transform=`translate3d(${x}px,0,0)`;}}
  animals(reduced?0:dt);
  Llive.setAttribute('transform',`translate(${(-cam).toFixed(2)} ${(-stageLift).toFixed(2)})`);
  for(const b of flock){b.x+=b.v*dt;b.p+=dt*5.2;if(b.x>cam*.15+VW+80)b.x=cam*.15-80;if(b.x<cam*.15-120)b.x=cam*.15+VW+60;b.n.style.transform=`translate3d(${b.x.toFixed(1)}px,${(b.y+Math.sin(b.p*.31)*7).toFixed(1)}px,0) scale(${b.s.toFixed(2)},${(b.s*(.35+.65*Math.abs(Math.sin(b.p)))).toFixed(3)})`;}
  for(const c of clouds){c.x+=c.v*(reduced?0:dt);if(c.x>2500)c.x=-240;c.n.style.transform=`translate3d(${(c.x-110*c.sc).toFixed(1)}px,${(c.y-52*c.sc).toFixed(1)}px,0)`;}
  // unicorn
  {const u=uni,gy=surfaceY(u.x)+6-route.hop(u.x,reduced)*Math.min(1,w*2),A=26*w,s=Math.sin(u.ph),bob=-Math.abs(s)*4*w+Math.sin(T*1.6)*1.2*(1-w);
   let hopY=0,sx=1,sy=1;if(u.hop>=0){u.hop+=dt/.62;if(u.hop>=1)u.hop=-1;else{const h=u.hop;hopY=-Math.sin(Math.PI*h)*52;const q=Math.sin(Math.PI*2*h);sy=1+.10*q;sx=1-.07*q;}}
   u.g.setAttribute('transform',`translate(${u.x.toFixed(2)} ${gy.toFixed(2)}) rotate(${route.tilt(u.x).toFixed(2)}) scale(${((backwards?-1:1)*heroScale*travelScale(u.x)).toFixed(3)} ${(heroScale*travelScale(u.x)).toFixed(3)})`);
   u.b.setAttribute('transform',`translate(0 ${(bob+hopY).toFixed(2)}) scale(${sx.toFixed(3)} ${sy.toFixed(3)}) rotate(${(-1.5*w+ (hopY?-4*Math.sin(Math.PI*u.hop):0)).toFixed(2)} 0 -60)`);
   u.sh.setAttribute('rx',(54*(1+hopY/160)).toFixed(1));u.sh.setAttribute('opacity',(.32*(1+hopY/90)).toFixed(3));
   const L=u.legs,rot=(leg,a)=>leg.l.setAttribute('transform',`rotate(${a.toFixed(2)} ${leg.x} -46)`);
   const tuck=hopY?18*Math.sin(Math.PI*u.hop):0;
   rot(L.nearF,A*s-tuck);rot(L.farB,A*s*.9+tuck);rot(L.farF,-A*s-tuck*.6);rot(L.nearB,-A*s*.9+tuck*.6);
   u.tilt=Math.max(0,u.tilt-dt*1.3);const tl=Math.sin(u.tilt*Math.PI)*-13;
   u.head.setAttribute('transform',`rotate(${(Math.sin(u.ph*2)*2.2*w+Math.sin(T*1.1)*1.6*(1-w)+tl-(hopY?6*Math.sin(Math.PI*u.hop):0)).toFixed(2)} 24 -72)`);
   u.tail.setAttribute('transform',`rotate(${(Math.sin(T*2.1)*7+s*9*w+(hopY?-18*Math.sin(Math.PI*u.hop):0)).toFixed(2)} -40 -74)`);
   u.mane.setAttribute('transform',`translate(${(-2.5*w+Math.sin(T*1.7)*.8).toFixed(2)} ${(Math.sin(u.ph*2+1)*1.6*w).toFixed(2)})`);
   u.blink-=dt;const bl=u.blink<0&&u.blink>-.13;if(u.blink<-.13)u.blink=R(2.2,4.6);u.eye.setAttribute('ry',bl||hopY?1.2:7.4);u.hl.setAttribute('opacity',bl||hopY?0:1);
   u.flick-=dt;const fl=u.flick<0?Math.sin(Math.min(1,-u.flick/.35)*Math.PI)*-16:0;if(u.flick<-.35)u.flick=R(3,7);u.ear.setAttribute('transform',`rotate(${fl.toFixed(1)} 42 -134)`);
   u.mouth.setAttribute('d',hopY||state==='finale'&&finaleT>=0?'M64-98Q72-86 80-98Z':u.tilt>0?'M67-95Q72-96 77-95':'M66-97Q72-92 78-97');
   if(w>.4){const side=s>0?1:-1;if(side!==lastStepSide){lastStepSide=side;tone(150,0,.05,.022);}}}
  // duckling companion
  {const f=pal,gy=surfaceY(f.x)+28-route.hop(f.x,reduced)*Math.min(1,fw*2),s=Math.sin(f.ph*1.5);let hopY=-Math.abs(s)*7*fw;
   if(f.hop>=0){f.hop+=dt/.5;if(f.hop>=1)f.hop=-1;else hopY-=Math.sin(Math.PI*f.hop)*34;}
   f.g.setAttribute('transform',`translate(${f.x.toFixed(2)} ${gy.toFixed(2)}) scale(${(travelScale(f.x)*(1+(heroScale-1)*.6)).toFixed(3)})`);f.b.setAttribute('transform',`translate(0 ${hopY.toFixed(2)}) rotate(${(s*6*fw).toFixed(1)} 0 -6)`);
   f.legs.forEach((l,i)=>l.setAttribute('transform',`rotate(${((i%2?1:-1)*26*fw*s).toFixed(1)} ${f.pivots[i]} -13)`));
   f.tail.setAttribute('transform',`rotate(${(Math.sin(T*3)*9+s*8*fw).toFixed(1)} -18 -22)`);
   f.head.setAttribute('transform',`rotate(${(Math.sin(T*1.3+1)*2.5-(state==='ask'?5:0)).toFixed(1)} 18 -34)`);
   f.blink-=dt;const bl=f.blink<0&&f.blink>-.12;if(f.blink<-.12)f.blink=R(2,5);f.eye.setAttribute('ry',bl||f.hop>=0?.9:4.8);f.hl.setAttribute('opacity',bl?0:1);}
  // particles
  for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.t+=dt;p.vy+=260*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;const k=1-p.t/p.life;
    if(k<=0){p.c.remove();parts.splice(i,1);continue;}p.c.setAttribute('cx',p.x.toFixed(1));p.c.setAttribute('cy',p.y.toFixed(1));p.c.setAttribute('opacity',k.toFixed(2));}
  if(finaleT>=0){finaleT+=dt;window.__glow.setAttribute('r',(22+Math.sin(finaleT*2.4)*6+Math.min(40,finaleT*30)).toFixed(1));window.__glow.setAttribute('opacity',.7);
    if(!reduced&&Math.random()<dt*9)burst(castleX+210+R(-150,150),groundY(castleX+210)-R(120,340),1,['#e0ad4c','#fbf3e4','#e59aa4']);}
  fork?.update(dt);
  layoutListener?.();
  if(perf&&T>2){metrics.frames++;if(elapsed>.025)metrics.slowFrames++;const work=performance.now()-workStart;metrics.workMs+=work;metrics.maxWorkMs=Math.max(metrics.maxWorkMs,work);if(metrics.frames%60===0)document.body.dataset.performance=JSON.stringify(metrics);}
  requestAnimationFrame(frame);}
function setPaused(value){
  if(!value&&scenerySuspended){scenerySuspended=false;syncTiles(99);}
  paused=value;journey.setPaused(value);document.body.dataset.paused=String(value);document.body.classList.toggle('paused',paused);
  $('pause').textContent=paused?'Reprendre':'Pause';$('pause').setAttribute('aria-pressed',String(paused));
  if(paused)hush();else ask();if(wind)wind.gain.value=soundOn&&!paused?.05:0;
}
$('pause').addEventListener('click',()=>{if(started)setPaused(!paused);});
document.addEventListener('visibilitychange',()=>{if(!embedded&&document.hidden&&started)setPaused(true);});
$('begin').addEventListener('click',()=>{unlock();started=true;soundOn=true;$('snd').textContent='♪ Son ✓';$('snd').setAttribute('aria-pressed','true');$('start').hidden=true;setPaused(false);});
if(demo){started=true;$('start').hidden=true;setPaused(false);}
if(new URLSearchParams(location.search).has('debug'))window.__meadow={
  snapshot:()=>({state,cur,collected,paused,cam,animals:fauna.species}),
  right:()=>choose(cur,stops[cur].stones.find(s=>s.letter===stops[cur].target)),
  wrong:()=>choose(cur,stops[cur].stones.find(s=>s.letter!==stops[cur].target))
};
uni.x=X0-260;pal.x=X0-400;cam=0;
if(embedded){
  onFit=()=>fork.resize();
  const cancel=()=>{prepareVersion++;pinnedRange=null;journey.cancel();document.body.dataset.moving='false';uni.v=0;backwards=false;scheduled.length=0;};
  started=true;paused=false;state='external';$('start').hidden=true;uni.x=X0;pal.x=X0-128;
  window.meadowScene={
    setLayoutListener(fn){layoutListener=fn;},
    // Questions open the crossroads view; the walking view keeps its own framing throughout.
    setRoadChoices(count,instant=false){document.body.classList.toggle('question-view',count>0);if(count){fork.show(count,instant);void preparePath(journey.positionAt(Math.min(journeyTotal,journeyCount+1)));}else fork.hide();},
    roadLayout(){return fork.layout();},
    setForkInsets(value){fork.setInsets(value);},
    chooseDoor(index,ok){fork.choose(index,ok);},
    reset(total,count=0){cancel();journey.reset(total,count);journeyTotal=journey.state().total;journeyCount=journey.state().count;uni.x=journey.state().x;castleX=journey.positionAt(journeyTotal);castleCanvas.style.transform=`translate(${castleX-CASTLE}px,${groundY(castleX+210)-groundY(CASTLE+210)}px)`;castleLight.setAttribute('transform',`translate(${castleX+210} ${groundY(castleX+210)-36})`);pal.x=uni.x-146;cam=Math.max(0,uni.x+170-VW/2);finaleT=count===total?0:-1;uni.hop=pal.hop=-1;uni.tilt=0;markJourney();syncTiles(99);for(const L of layers)if(L.div&&L.f){const x=(-cam*L.f).toFixed(2);if(x!==L.lastX){L.lastX=x;L.div.style.transform=`translate3d(${x}px,0,0)`;}}dusk.style.opacity=(journeyCount/journeyTotal*.16).toFixed(3);},
    async moveTo(count,options={}){cancel();const version=prepareVersion;finaleT=-1;await preparePath(journey.positionAt(count),true);if(destroyed||version!==prepareVersion)return false;const arrived=await journey.moveTo(count,options);if(version===prepareVersion)pinnedRange=null;return arrived;},
    cancel,
    releaseScenery,
    setPaused(value){setPaused(value);},
    react(emotion){if(emotion==='proud'){uni.hop=reduced?-1:0;pal.hop=reduced?-1:0;cheerAnimals();}else uni.tilt=1;},
    state(){return {ready:true,progress:journeyCount/journeyTotal,crystals:journeyCount,moving:journey.state().moving,paused,habitat,theme:theme.id,worldIndex:Math.floor(Math.min(journeyCount,journeyTotal-1)/10),worldCrystals:journeyCount%10,position:{x:uni.x,y:groundY(uni.x)},birdSeconds:T,animalKinds:fauna.species,renderer:'painted-canvas',fork:fork.state(),camera:{scrollX:cam},canvasCount:document.querySelectorAll('canvas').length};},
    destroy(){cancel();releaseScenery();for(const c of document.querySelectorAll('canvas'))releaseCanvas(c);destroyed=true;layoutListener=null;fork.destroy();for(const job of bakeQueue)job.resolve(false);bakeQueue=[];pendingBakes.clear();fauna.destroy();hush();}
  };
}

syncTiles(99);
requestAnimationFrame(t=>{last=t;$('load').classList.add('off');frame(t);});

/* paper grain: fine tooth plus soft blotches */
{const S=256,c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d'),d=x.createImageData(S,S),n=pnoise(S,5,5),m=pnoise(S,2,30);
 for(let yy=0,i=0;yy<S;yy++)for(let xx=0;xx<S;xx++,i+=4){const v=(Math.random()-.5)*1.5+(n(xx,yy)+m(xx,yy)-1)*0,dk=v<0;d.data[i]=dk?96:255;d.data[i+1]=dk?84:252;d.data[i+2]=dk?62:240;d.data[i+3]=Math.min(255,Math.abs(v)*(dk?70:60));}
 x.putImageData(d,0,0);document.getElementById('grain').style.backgroundImage=`url(${c.toDataURL()})`;}
})();
