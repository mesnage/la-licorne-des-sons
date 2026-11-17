import {FAUNA,faunaPose} from './fauna-data.js?v=polish-8';
/**
 * Painted, articulated animals. Every part is drawn once into a small tightly-cropped bitmap
 * and then only moved with CSS transforms (no per-frame canvas work).
 * Dimensions below are final scene pixels; origin is the ground under the animal, facing right.
 */
const INK='#3a3835',BLUSH='#e79b9d',CREAM='#f9efd9',r1=n=>Math.round(n*10)/10;
const Q=o=>({kit:'quad',L:70,H:36,leg:22,legW:9,head:15,hx:40,hy:-50,snout:[9,6.5],ear:'round',tail:'thin',x:[],...o});
const RABBIT=Q({L:40,H:31,leg:7,legW:9,head:14,hx:17,hy:-38,snout:[6,5],ear:'long',tail:'bob'});
const FOX=Q({L:56,H:27,leg:19,legW:6.5,head:14,hx:35,hy:-46,snout:[10,5.5],ear:'pointy',tail:'bushy',sock:1});
const HORSE=Q({L:72,H:36,leg:34,legW:8,head:15,hx:48,hy:-88,snout:[10,7],ear:'leaf',tail:'flow',neck:10,hoof:1,x:['mane']});
const OWL={kit:'owl',perch:'stump'};
const SPEC={
  rabbit:RABBIT,'moon-rabbit':{...RABBIT,x:['star']},jackalope:{...RABBIT,x:['antlers']},
  hedgehog:Q({L:44,H:30,leg:5,legW:8,head:11,hx:23,hy:-14,snout:[9,5],ear:'tiny',tail:'none',x:['spines']}),
  'roe-deer':Q({L:60,H:31,leg:31,legW:7,head:13.5,hx:39,hy:-78,snout:[9,6],ear:'leaf',tail:'tuft',neck:9.5,hoof:1,x:['spots']}),
  'red-deer':Q({L:78,H:38,leg:40,legW:8.5,head:15,hx:50,hy:-98,snout:[11,7],ear:'leaf',tail:'tuft',neck:12,hoof:1,x:['antlers']}),
  bee:{kit:'bee'},butterfly:{kit:'butterfly'},'moon-moth':{kit:'butterfly',moth:1},
  'red-fox':FOX,'arctic-fox':{...FOX,sock:0},'star-fox':{...FOX,sock:0,x:['star']},
  fennec:Q({L:38,H:20,leg:14,legW:5,head:11,hx:24,hy:-34,snout:[7,4.5],ear:'fennec',tail:'bushy'}),
  'red-squirrel':Q({L:27,H:25,leg:5,legW:7,head:11,hx:12,hy:-31,snout:[5,4],ear:'tuft',tail:'curl'}),
  jerboa:Q({L:21,H:19,leg:10,legW:4,head:9.5,hx:11,hy:-29,snout:[4.5,3.5],ear:'long',earLen:17,tail:'whip'}),
  badger:Q({L:56,H:29,leg:8,legW:9,head:13,hx:32,hy:-21,snout:[11,6],ear:'round',tail:'stub',darkLegs:1,x:['mask']}),
  'asian-elephant':Q({L:128,H:84,leg:40,legW:22,head:33,hx:68,hy:-90,snout:[0,0],ear:'big',tail:'thin',toes:1,eye:3.6,x:['trunk']}),
  'sumatran-tiger':Q({L:82,H:34,leg:20,legW:9,head:17,hx:50,hy:-49,snout:[10,7],ear:'round',tail:'long',x:['stripes']}),
  'malayan-tapir':Q({L:80,H:42,leg:20,legW:10,head:16,hx:50,hy:-42,snout:[13,8],ear:'round',tail:'none',x:['saddle','droop']}),
  'polar-bear':Q({L:104,H:54,leg:24,legW:17,head:22,hx:62,hy:-60,snout:[14,9],ear:'round',tail:'stub',eye:3.4}),
  'moon-dragon':Q({L:78,H:36,leg:20,legW:10,head:16,hx:52,hy:-64,snout:[11,7],ear:'horn',tail:'dino',neck:9,x:['wings','ridge','star']}),
  'fairy-dragon':Q({L:56,H:28,leg:15,legW:8,head:14,hx:38,hy:-50,snout:[9,6],ear:'horn',tail:'dino',neck:7,x:['wings','ridge']}),
  brachiosaurus:Q({L:120,H:64,leg:44,legW:20,head:13,hx:112,hy:-198,snout:[11,7],ear:'none',tail:'dino',neck:14,toes:1,x:['dabs']}),
  stegosaurus:Q({L:104,H:56,leg:20,legW:15,head:12,hx:68,hy:-30,snout:[10,6],ear:'none',tail:'dino',neck:9,toes:1,x:['plates']}),
  triceratops:Q({L:96,H:50,leg:20,legW:15,head:19,hx:62,hy:-42,snout:[14,9],ear:'none',tail:'dino',toes:1,x:['frill']}),
  camel:Q({L:88,H:40,leg:48,legW:8,head:14,hx:68,hy:-116,snout:[12,8],ear:'tiny',tail:'thin',neck:9,toes:1,x:['hump']}),
  unicorn:{...HORSE,x:['mane','horn']},pegasus:{...HORSE,x:['mane','wings']},
  'sea-turtle':{kit:'turtle',L:62,H:30,flippers:1},'desert-tortoise':{kit:'turtle',L:42,H:28},
  'shore-crab':{kit:'crab'},'hermit-crab':{kit:'crab',shell:1},
  'harbor-seal':{kit:'seal',L:88,H:32},walrus:{kit:'seal',L:122,H:50,tusks:1},
  'tawny-owl':OWL,'snowy-owl':{...OWL,perch:'snow'},'comet-owl':{...OWL,perch:'rock',star:1},
  hornbill:{kit:'hornbill'},'emperor-penguin':{kit:'penguin'},
  sandpiper:{kit:'wader',bw:20,bh:13,leg:11,neck:5,head:6.5,beak:15},
  crane:{kit:'wader',bw:46,bh:25,leg:44,neck:40,head:8,beak:20,cap:1},
  swallow:{kit:'flyer',bl:30,span:30,tail:'fork'},swift:{kit:'flyer',bl:28,span:34,tail:'fork'},
  albatross:{kit:'flyer',bl:60,span:66,tail:'fan'},eagle:{kit:'flyer',bl:52,span:56,tail:'fan',hook:1},
  phoenix:{kit:'flyer',bl:44,span:44,tail:'plume'},
  gibbon:{kit:'sitter',ape:1},meerkat:{kit:'sitter'},
  parasaurolophus:{kit:'biped',L:92,H:46,leg:40,crest:1},tyrannosaurus:{kit:'biped',L:104,H:54,leg:46,rex:1}
};
export function createFauna(habitat,{el,sprite,box,wash,shadeHex,host,groundY,pathWidth,meadowEdge,shadow:shadowColor='#2f4636',reduced=false}){
  const species=FAUNA[habitat]??FAUNA.meadow,washes=new Map();
  const tint=(hex,k=1)=>{const key=hex+k;if(!washes.has(key))washes.set(key,wash(k===1?hex:shadeHex(hex,k),{amp:.014,grain:.016}));return washes.get(key);};
  /* ---- drawing helpers ---- */
  const paintOf=w=>typeof w==='string'?w:w.fill;
  const E=(g,cx,cy,rx,ry,w,o={})=>{const {rot,...rest}=o;return el('ellipse',{cx:r1(cx),cy:r1(cy),rx:r1(rx),ry:r1(ry),...(rot?{transform:`rotate(${rot} ${r1(cx)} ${r1(cy)})`}:{}),fill:paintOf(w),...rest},g);};
  const P=(g,d,w,o={})=>el('path',{d,fill:paintOf(w),...o},g);
  const S=(g,d,color,width,o={})=>el('path',{d,fill:'none',stroke:color,'stroke-width':width,'stroke-linecap':'round','stroke-linejoin':'round',...o},g);
  // Several overlapping shapes read as one painted silhouette: soft darker rim first, fills on top.
  const rim=(g,w,draw,edge=.48)=>{
    draw((tag,a,strokeD)=>el(tag,{...a,...(strokeD?{d:strokeD}:{}),fill:'none',stroke:w.edge,'stroke-width':2.4,'stroke-opacity':edge,'stroke-linejoin':'round','stroke-linecap':'round'},g));
    draw((tag,a)=>el(tag,{...a,fill:w.fill},g));
  };
  const ell=(cx,cy,rx,ry,rot)=>({cx:r1(cx),cy:r1(cy),rx:r1(rx),ry:r1(ry),...(rot?{transform:`rotate(${rot} ${r1(cx)} ${r1(cy)})`}:{})});
  const eye=(g,x,y,r=3.1)=>{E(g,x,y,r,r*1.28,INK);E(g,x+r*.32,y-r*.5,r*.36,r*.36,'#fff');};
  const lidOf=(spots,w,r=3.1)=>g=>{for(const [x,y] of spots){E(g,x,y,r+1.3,r*1.28+1.3,w);S(g,`M${r1(x-r)} ${r1(y+.6)}q${r1(r)} ${r1(r*.85)} ${r1(2*r)} 0`,INK,1.5);}};
  const star=(g,x,y,k=1)=>P(g,`M${x} ${y-7*k}l${2*k} ${4.6*k} ${5*k} ${.6*k} ${-3.8*k} ${3.4*k} ${1*k} ${5*k} ${-4.2*k} ${-2.6*k} ${-4.2*k} ${2.6*k} ${1*k} ${-5*k} ${-3.8*k} ${-3.4*k} ${5*k} ${-.6*k}Z`,'#f3dc9a');
  const grp=(ox,oy,...kids)=>{const d=document.createElement('div');d.className='G';d.style.transformOrigin=`${r1(ox)}px ${r1(oy)}px`;d.append(...kids.filter(Boolean));return d;};
  const part=(build,ox=0,oy=0)=>sprite(build,ox,oy);
  const rot=(n,a)=>{if(n)n.style.transform=`rotate(${a.toFixed(2)}deg)`;};
  const show=(n,on)=>{if(n)n.style.visibility=on?'visible':'hidden';};
  const antlers=(g,x,y,k,color='#a18b73')=>{for(const [dx,o] of [[5,.55],[-3,1]])S(g,`M${x+dx} ${y}q${-3*k} ${-12*k} ${-9*k} ${-19*k}m${5*k} ${9*k}q${6*k} ${-5*k} ${6*k} ${-12*k}m${-8*k} ${6*k}q${-7*k} ${-1*k} ${-10*k} ${-7*k}`,color,2.6*Math.max(.8,k*.8),{opacity:o});};
  const wingShape=(g,x,y,k,w,feather=true)=>{rim(g,w,put=>put('path',{d:`M${x+6*k} ${y+3*k}Q${x-6*k} ${y-34*k} ${x-44*k} ${y-50*k}Q${x-40*k} ${y-38*k} ${x-46*k} ${y-30*k}Q${x-34*k} ${y-24*k} ${x-38*k} ${y-14*k}Q${x-24*k} ${y-10*k} ${x-22*k} ${y+1*k}Q${x-8*k} ${y+6*k} ${x+6*k} ${y+3*k}Z`}));
    if(feather)for(const [a,b] of [[-30,-36],[-24,-22],[-14,-10]])S(g,`M${x+a*k} ${y+b*k}q${6*k} ${3*k} ${10*k} ${9*k}`,'#fff',1.3,{opacity:.4});};

  /* ---- four-legged kit: most mammals, dragons and the big plant-eating dinosaurs ---- */
  function quad(s,p,T){
    const {L:len,H,leg,legW:w,head:r,hx,hy,snout:[sl,sh]}=p,has=f=>p.x.includes(f);
    const by=-(leg+H/2)+Math.min(6,H*.14),hip=by+H*.22,fx=len*.29,bx=-len*.3,nx=len*.3,ny=by-H*.12,tx=-len*.46,ty=by-H*.06;
    const top=x=>by-H/2*Math.sqrt(Math.max(0,1-(2*x/len)**2));
    const legColor=p.darkLegs?tint('#59544d'):null;
    const legB=(x,far)=>g=>{
      const c=legColor??(far?T.dark:T.coat);
      rim(g,c,put=>{put('path',{d:`M${r1(x-w/2)} ${r1(hip)}Q${r1(x-w*.6)} ${r1(-leg*.4)} ${r1(x-w*.4)} -3Q${r1(x-w*.36)} 0 ${r1(x+1)} 0H${r1(x+w*.55)}Q${r1(x+w*.62)} -3.5 ${r1(x+w*.4)} -5Q${r1(x+w*.58)} ${r1(-leg*.4)} ${r1(x+w/2)} ${r1(hip)}Z`});put('circle',{cx:r1(x),cy:r1(hip),r:r1(w/2)});});
      if(p.hoof||p.sock)P(g,`M${r1(x-w*.44)} ${-leg*(p.sock?.42:.16)}Q${r1(x-w*.5)} -2 ${r1(x-w*.36)} -.6Q${r1(x)} .6 ${r1(x+w*.56)} 0Q${r1(x+w*.62)} -3.5 ${r1(x+w*.44)} ${-leg*(p.sock?.42:.16)}Z`,p.sock?'#5d4a40':shadeHex(s.coat,.55),{opacity:far?.75:.95});
      if(p.toes)for(const dx of [-.22,.12,.44])E(g,x+w*dx,-1.8,w*.12,1.7,T.acc,{opacity:.9});
    };
    const legs=[[bx+w*.5,1],[fx+w*.5,1],[bx,0],[fx,0]].map(([x,far])=>({node:part(legB(x,far),x,hip),far}));
    const tail=p.tail==='none'?null:part(g=>{
      const k=p.tail;
      if(k==='bob')rim(g,T.acc,put=>put('circle',{cx:r1(tx-2),cy:r1(ty+2),r:6.5}));
      else if(k==='stub')rim(g,T.coat,put=>put('ellipse',ell(tx-1,ty+1,6,4.5,-20)));
      else if(k==='tuft'){rim(g,T.coat,put=>put('ellipse',ell(tx-1,ty-2,5,8,-28)));E(g,tx-2,ty-1,2.6,5.5,CREAM,{rot:-28});}
      else if(k==='bushy'){rim(g,T.coat,put=>put('path',{d:`M${tx+8} ${ty-5}Q${tx-14} ${ty-26} ${tx-36} ${ty-24}Q${tx-50} ${ty-12} ${tx-38} ${ty+3}Q${tx-14} ${ty+10} ${tx+8} ${ty+6}Z`}));
        P(g,`M${tx-36} ${ty-24}Q${tx-50} ${ty-12} ${tx-38} ${ty+3}Q${tx-33} ${ty-6} ${tx-27} ${ty-9}Q${tx-33} ${ty-16} ${tx-36} ${ty-24}Z`,T.acc);}
      else if(k==='curl'){rim(g,T.coat,put=>put('path',{d:`M${tx+6} ${ty+6}Q${tx-19} ${ty+10} ${tx-21} ${ty-12}Q${tx-23} ${ty-38} ${tx-4} ${ty-40}Q${tx+12} ${ty-38} ${tx+8} ${ty-25}Q${tx-3} ${ty-28} ${tx-6} ${ty-16}Q${tx-6} ${ty-4} ${tx+7} ${ty-4}Z`}));
        S(g,`M${tx-13} ${ty-8}q-2-16 8-22`,'#fff',2,{opacity:.28});}
      else if(k==='long'){S(g,`M${tx+4} ${ty}Q${tx-20} ${ty+12} ${tx-30} ${ty-6}Q${tx-35} ${ty-20} ${tx-27} ${ty-27}`,shadeHex(s.coat,.66),8.4,{opacity:.3});S(g,`M${tx+4} ${ty}Q${tx-20} ${ty+12} ${tx-30} ${ty-6}Q${tx-35} ${ty-20} ${tx-27} ${ty-27}`,s.coat,6.4);
        for(const [x,y,a] of [[tx-10,ty+5,20],[tx-21,ty+4,60],[tx-30,ty-6,95],[tx-32,ty-17,120]])E(g,x,y,1.5,3.6,'#5c5448',{rot:a});E(g,tx-27,ty-27,3.6,3.6,'#5c5448');}
      else if(k==='whip'){S(g,`M${tx+3} ${ty}Q${tx-16} ${ty+8} ${tx-24} ${ty-12}`,s.coat,2.2);E(g,tx-25,ty-15,3.2,5,T.acc,{rot:-20});}
      else if(k==='dino'){rim(g,T.coat,put=>put('path',{d:`M${tx+14} ${r1(by-H*.34)}Q${r1(tx-len*.25)} ${r1(by-H*.2)} ${r1(tx-len*.52)} ${r1(by+H*.34)}Q${r1(tx-len*.2)} ${r1(by+H*.36)} ${tx+16} ${r1(by+H*.3)}Z`}));
        if(has('plates'))for(const [dx,dy] of [[-.46,.2],[-.38,.08]])P(g,`M${r1(tx+len*dx-3)} ${r1(by+H*dy+4)}l-5-15 10 9Z`,CREAM);}
      else if(k==='flow'){rim(g,T.acc,put=>put('path',{d:`M${tx+6} ${ty-5}Q${tx-20} ${ty-12} ${tx-25} ${ty+12}Q${tx-28} ${ty+34} ${tx-13} ${ty+46}Q${tx-16} ${ty+28} ${tx-7} ${ty+15}Q${tx} ${ty+7} ${tx+8} ${ty+5}Z`}));
        P(g,`M${tx-2} ${ty-3}Q${tx-17} ${ty-2} ${tx-19} ${ty+16}Q${tx-20} ${ty+30} ${tx-15} ${ty+38}Q${tx-15} ${ty+22} ${tx-9} ${ty+12}Z`,p.x.includes('horn')?'#f0cf8f':'#fff',{opacity:.75});}
      else{S(g,`M${tx+3} ${ty}Q${tx-11} ${ty+5} ${tx-9} ${r1(ty+H*.5)}`,shadeHex(s.coat,.8),2.6);E(g,tx-9,ty+H*.5+3,2.6,4.5,shadeHex(s.coat,.6));}
    },tx+4,ty);
    const wings=has('wings')?part(g=>wingShape(g,len*.04,by-H*.3,Math.max(.75,len/74),T.acc),len*.04,by-H*.3):null;
    const body=part(g=>{
      if(has('plates'))for(let i=0;i<7;i++){const x=-len*.38+i*len*.115,h=13+15*Math.sin((i+.6)/7.4*Math.PI),b=top(x)+5;
        rim(g,T.acc,put=>put('path',{d:`M${r1(x-7)} ${r1(b)}Q${r1(x-8)} ${r1(b-h*.55)} ${r1(x)} ${r1(b-h)}Q${r1(x+8)} ${r1(b-h*.55)} ${r1(x+7)} ${r1(b)}Z`}));}
      if(has('ridge'))for(let i=0;i<6;i++){const x=-len*.36+i*len*.12,b=top(x)+3;P(g,`M${r1(x-4.5)} ${r1(b)}L${r1(x-1)} ${r1(b-8)}L${r1(x+4.5)} ${r1(b)}Z`,T.acc);}
      rim(g,T.coat,put=>{put('ellipse',ell(0,by,len/2,H/2));
        if(has('hump'))put('path',{d:`M${r1(-len*.34)} ${r1(by-H*.3)}Q${r1(-len*.16)} ${r1(by-H*1.32)} ${r1(len*.1)} ${r1(by-H*.4)}Z`});});
      if(!has('spines')&&!has('saddle'))E(g,len*.03,by+H*.22,len*.34,H*.24,T.acc,{opacity:.62});
      E(g,-len*.08,by-H*.27,len*.26,H*.11,'#fff',{opacity:.11});
      if(has('saddle'))P(g,`M${r1(-len*.3)} ${r1(top(-len*.3)+1.5)}Q0 ${r1(by-H*.56)} ${r1(len*.1)} ${r1(top(len*.1)+1.5)}Q${r1(len*.16)} ${r1(by)} ${r1(len*.08)} ${r1(by+H*.42)}Q${r1(-len*.1)} ${r1(by+H*.52)} ${r1(-len*.3)} ${r1(by+H*.4)}Q${r1(-len*.36)} ${r1(by)} ${r1(-len*.3)} ${r1(top(-len*.3)+1.5)}Z`,T.acc);
      if(has('spots'))for(const [dx,dy] of [[-.3,-.2],[-.17,-.31],[-.02,-.27],[-.25,.01],[-.08,-.08],[.11,-.14],[-.36,-.02]])E(g,len*dx,by+H*dy,2.5,2,CREAM,{opacity:.85});
      if(has('dabs'))for(const [dx,dy,a] of [[-.28,-.2,10],[-.1,-.3,-8],[.1,-.24,12],[-.2,.02,0],[.02,-.06,-10],[-.36,-.04,20]])E(g,len*dx,by+H*dy,6,3,T.acc,{rot:a,opacity:.55});
      if(has('stripes'))for(let i=0;i<6;i++){const x=-len*.36+i*len*.13,y=top(x)+1;P(g,`M${r1(x-2.6)} ${r1(y)}Q${r1(x+.6)} ${r1(by-H*.1)} ${r1(x+1.6)} ${r1(by+H*.14)}Q${r1(x+2.6)} ${r1(by-H*.1)} ${r1(x+3.8)} ${r1(y)}Z`,'#5c5448');}
      if(has('spines')){const pts=[],n=13;for(let i=0;i<=n;i++){const a=Math.PI*(1.02+i/n*.83),k=i%2?1.2:1.02;pts.push([Math.cos(a)*len/2*k,by+Math.sin(a)*H/2*k]);}
        const quill=tint('#8a7560');rim(g,quill,put=>put('path',{d:'M'+pts.map(q=>r1(q[0])+' '+r1(q[1])).join('L')+`Q${r1(len*.2)} ${r1(by+H*.1)} ${r1(len*.02)} ${r1(by+H*.36)}Q${r1(-len*.3)} ${r1(by+H*.52)} ${r1(pts[0][0])} ${r1(pts[0][1])}Z`}));
        for(let i=0;i<9;i++)S(g,`M${r1(-len*.34+i*len*.07)} ${r1(by-H*.05-(i%3)*5)}l3-6`,'#f1dfc0',1.4,{opacity:.6});}
      if(has('star'))star(g,-len*.12,by-H*.02,1);
    });
    const ears=p.ear==='none'?null:part(g=>{
      const k=p.ear;
      if(k==='long'){const h=p.earLen??25;rim(g,T.dark,put=>put('ellipse',ell(hx-r*.62,hy-r*.6-h/2,4.4,h/2+2,-17)));rim(g,T.coat,put=>put('ellipse',ell(hx-r*.12,hy-r*.66-h/2,4.8,h/2+2,5)));E(g,hx-r*.1,hy-r*.66-h/2,2.3,h/2-2,BLUSH,{rot:5,opacity:.7});}
      else if(k==='pointy'||k==='fennec'||k==='tuft'){const m=k==='fennec'?1.75:k==='tuft'?.8:1,tri=(dx,c)=>rim(g,c,put=>put('path',{d:`M${r1(hx+dx-r*.82)} ${r1(hy-r*.42)}Q${r1(hx+dx-r*.8)} ${r1(hy-r*(.7+.9*m))} ${r1(hx+dx-r*.5)} ${r1(hy-r*(.72+.98*m))}Q${r1(hx+dx-r*.02)} ${r1(hy-r*(.6+.6*m))} ${r1(hx+dx+r*.1)} ${r1(hy-r*.66)}Z`}));
        tri(r*.78,T.dark);tri(0,T.coat);P(g,`M${r1(hx-r*.62)} ${r1(hy-r*.6)}Q${r1(hx-r*.64)} ${r1(hy-r*(.66+.72*m))} ${r1(hx-r*.48)} ${r1(hy-r*(.68+.78*m))}Q${r1(hx-r*.2)} ${r1(hy-r*(.6+.45*m))} ${r1(hx-r*.14)} ${r1(hy-r*.72)}Z`,k==='pointy'&&p.sock?'#5d4a40':T.acc,{opacity:.9});
        if(k==='tuft')S(g,`M${r1(hx-r*.5)} ${r1(hy-r*1.5)}l-1-6m3 6l3-5`,s.coat,1.8);}
      else if(k==='leaf'){rim(g,T.dark,put=>put('ellipse',ell(hx+r*.1,hy-r*1.02,r*.3,r*.62,24)));rim(g,T.coat,put=>put('ellipse',ell(hx-r*.74,hy-r*.86,r*.3,r*.66,-52)));E(g,hx-r*.74,hy-r*.86,r*.14,r*.44,BLUSH,{rot:-52,opacity:.65});}
      else if(k==='round'){rim(g,T.dark,put=>put('circle',{cx:r1(hx+r*.3),cy:r1(hy-r*.84),r:r1(r*.32)}));rim(g,T.coat,put=>put('circle',{cx:r1(hx-r*.56),cy:r1(hy-r*.72),r:r1(r*.36)}));E(g,hx-r*.56,hy-r*.72,r*.18,r*.18,BLUSH,{opacity:.55});}
      else if(k==='tiny')rim(g,T.dark,put=>put('circle',{cx:r1(hx-r*.5),cy:r1(hy-r*.78),r:r1(r*.26)}));
      else if(k==='horn'){for(const [dx,o] of [[r*.5,.6],[0,1]])P(g,`M${r1(hx+dx-r*.5)} ${r1(hy-r*.62)}Q${r1(hx+dx-r*1.1)} ${r1(hy-r*1.3)} ${r1(hx+dx-r*.95)} ${r1(hy-r*1.75)}Q${r1(hx+dx-r*.3)} ${r1(hy-r*1.3)} ${r1(hx+dx-r*.05)} ${r1(hy-r*.78)}Z`,CREAM,{opacity:o});}
      else if(k==='big'){rim(g,T.dark,put=>put('path',{d:`M${r1(hx-r*.02)} ${r1(hy-r*.72)}Q${r1(hx-r*1.32)} ${r1(hy-r*1.18)} ${r1(hx-r*1.3)} ${r1(hy+r*.05)}Q${r1(hx-r*1.2)} ${r1(hy+r*.98)} ${r1(hx-r*.36)} ${r1(hy+r*.78)}Q${r1(hx-r*.02)} ${r1(hy+r*.2)} ${r1(hx-r*.02)} ${r1(hy-r*.72)}Z`}));
        P(g,`M${r1(hx-r*.2)} ${r1(hy-r*.5)}Q${r1(hx-r*1.08)} ${r1(hy-r*.86)} ${r1(hx-r*1.06)} ${r1(hy+r*.05)}Q${r1(hx-r*.98)} ${r1(hy+r*.7)} ${r1(hx-r*.42)} ${r1(hy+r*.56)}Q${r1(hx-r*.2)} ${r1(hy+r*.1)} ${r1(hx-r*.2)} ${r1(hy-r*.5)}Z`,BLUSH,{opacity:.32});}
    },hx-r*.35,hy-r*.6);
    const ex=hx+r*.3,ey=hy-r*.1,er=p.eye??Math.max(2.5,Math.min(3.4,r*.21)),mx=hx+r*.6,my=hy+r*.3;
    const head=part(g=>{
      if(has('frill')){rim(g,T.acc,put=>put('ellipse',ell(hx-r*.55,hy-r*.42,r*1.02,r*1.3,-18)));for(let i=0;i<6;i++){const a=-2.9+i*.5;E(g,hx-r*.55+Math.cos(a)*r*.86,hy-r*.42+Math.sin(a)*r*1.1,2.4,2.4,T.coat,{opacity:.8});}}
      if(p.neck){const nw=p.neck,a=`M${r1(nx-nw*1.25)} ${r1(ny+4)}Q${r1((nx+hx)/2-nw*1.05)} ${r1((ny+hy)/2-2)} ${r1(hx-r*.6)} ${r1(hy+r*.15)}`,b=`L${r1(hx+r*.35)} ${r1(hy+r*.72)}Q${r1((nx+hx)/2+nw*.95)} ${r1((ny+hy)/2+7)} ${r1(nx+nw*1.35)} ${r1(ny+10)}`;
        rim(g,T.coat,put=>put('path',{d:a+b+'Z'},a+b.replace('L','M')));
        if(has('mane')){const cols=has('horn')?[paintOf(T.acc),'#f0cf8f','#9fd0c7']:[paintOf(T.acc)];for(let i=0;i<6;i++){const t=i/5,x=hx-r*.72+(nx-nw*1.3-hx+r*.72)*t,y=hy-r*.7+(ny+2-hy+r*.7)*t;E(g,x-2,y,7.5-t*1.5,7.5-t*1.5,cols[i%cols.length]);}}
        if(has('ridge'))for(let i=1;i<5;i++){const t=i/5,x=hx-r*.7+(nx-nw*1.3-hx+r*.7)*t,y=hy+(ny-hy)*t;P(g,`M${r1(x+2)} ${r1(y-4)}L${r1(x-6)} ${r1(y-5)}L${r1(x+1)} ${r1(y+5)}Z`,T.acc);}}
      if(has('antlers'))antlers(g,hx-r*.2,hy-r*.74,Math.max(.7,r/11));
      if(has('horn'))rim(g,tint('#e8c98a'),put=>put('path',{d:`M${r1(hx+r*.18)} ${r1(hy-r*.8)}L${r1(hx+r*.78)} ${r1(hy-r*2.35)}L${r1(hx+r*.66)} ${r1(hy-r*.66)}Z`}));
      rim(g,has('mask')?T.acc:T.coat,put=>{put('ellipse',ell(hx,hy,r,r*.9));if(sl>r*.5)put('ellipse',ell(mx,my,sl,sh));});
      if(has('mask')){P(g,`M${r1(hx-r*.82)} ${r1(hy-r*.5)}Q${r1(hx)} ${r1(hy-r*.72)} ${r1(mx+sl*.5)} ${r1(my-sh*.75)}L${r1(mx+sl*.2)} ${r1(my+sh*.2)}Q${r1(hx)} ${r1(hy+r*.2)} ${r1(hx-r*.95)} ${r1(hy+r*.25)}Z`,'#59544d');}
      else if(sl)E(g,mx+sl*.08,my+sh*.08,sl*.9,sh*.88,T.acc);
      if(has('droop'))rim(g,T.coat,put=>put('ellipse',ell(mx+sl*.72,my+sh*.5,sh*.62,sh*.95,-28)));
      if(has('frill')){for(const dx of [.02,.42])P(g,`M${r1(hx+r*dx)} ${r1(hy-r*.62)}Q${r1(hx+r*(dx+.5))} ${r1(hy-r*1.55)} ${r1(hx+r*(dx+.95))} ${r1(hy-r*1.7)}Q${r1(hx+r*(dx+.55))} ${r1(hy-r*1.05)} ${r1(hx+r*(dx+.34))} ${r1(hy-r*.56)}Z`,CREAM);
        P(g,`M${r1(mx+sl*.35)} ${r1(my-sh*.8)}l${r1(sl*.42)} ${r1(-sh*1.25)} ${r1(sl*.12)} ${r1(sh*1.3)}Z`,CREAM);}
      if(sl){E(g,mx+sl*(has('droop')?.95:.72),my-sh*(has('droop')?-.75:.32),2.5,2,INK);
        S(g,`M${r1(mx+sl*.12)} ${r1(my+sh*.5)}q${r1(sl*.3)} 2.4 ${r1(sl*.62)} -.4`,INK,1.2,{opacity:.5});}
      else S(g,`M${r1(hx+r*.42)} ${r1(hy+r*.56)}q${r1(r*.16)} ${r1(r*.1)} ${r1(r*.3)} 0`,INK,1.4,{opacity:.5});
      if(has('stripes'))for(const [dx,dy,a] of [[-.5,-.62,20],[-.18,-.78,0],[.14,-.74,-20],[-.82,.05,80]])E(g,hx+r*dx,hy+r*dy,1.4,3.6,'#5c5448',{rot:a});
      eye(g,ex,ey,er);E(g,hx-r*.06,hy+r*.44,r*.21,r*.16,BLUSH,{opacity:.5});
    },nx,ny);
    const lid=part(lidOf([[ex,ey]],has('mask')?'#59544d':T.coat,er));
    const tx0=hx+r*.74,ty0=hy+r*.02;
    const trunk=has('trunk')?part(g=>{const d=`M${r1(tx0)} ${r1(ty0)}q${r1(r*.62)} ${r1(r*.26)} ${r1(r*.56)} ${r1(r*1.12)}q${r1(-r*.04)} ${r1(r*.56)} ${r1(r*.38)} ${r1(r*.6)}`;
      S(g,d,shadeHex(s.coat,.66),r*.46+2.4,{opacity:.3});S(g,d,s.coat,r*.46);
      for(let i=1;i<5;i++)S(g,`M${r1(tx0+r*.34+i*1.2)} ${r1(ty0+r*.2+i*r*.2)}q${r1(r*.16)} 2 ${r1(r*.3)} 0`,shadeHex(s.coat,.8),1.2,{opacity:.5});
      S(g,`M${r1(hx+r*.5)} ${r1(hy+r*.56)}q${r1(r*.34)} ${r1(r*.36)} ${r1(r*.6)} ${r1(r*.1)}`,CREAM,r*.15);},tx0,ty0):null;
    const earsFront=p.ear==='big';
    const headG=grp(nx,ny,earsFront?null:ears,head,lid,trunk,earsFront?ears:null);
    const up1=grp(0,0,tail,wings,body),up2=grp(0,0,headG);
    const [fb,ff,nb,nf]=legs.map(l=>l.node),grazeDeg=p.neck?Math.min(64,34+leg*.6):hy<by?14:8;
    return {shadow:[len*.56,Math.max(4.5,len*.07)],nodes:[fb,ff,up1,nb,nf,up2],
      pose(q,cheer){const bob=`translate(0,${(-Math.abs(Math.sin(q.phase))*1.5*q.walk).toFixed(2)}px)`;up1.style.transform=up2.style.transform=bob;
        const a=q.stride,tuck=q.air*34;rot(nf,a+tuck);rot(fb,a*.9-tuck*.9);rot(ff,-a+tuck*.8);rot(nb,-a*.9-tuck);
        rot(headG,q.head*(p.neck?.7:.55)+q.graze*grazeDeg-cheer*10);rot(ears,q.ear-cheer*12+q.air*10);rot(tail,q.tail*(p.tail==='dino'?.45:1)+q.air*-14);
        if(trunk)rot(trunk,Math.sin(q.phase*.5)*8+q.tail*.9-cheer*70);if(wings)rot(wings,-8+q.tail*.5-cheer*38-q.air*20);show(lid,q.blink);}};
  }

  /* ---- shelled walkers ---- */
  function turtle(s,p,T){
    const {L:len,H}=p,by=-9;
    const leg=(x,far)=>part(g=>{if(p.flippers)rim(g,far?T.dark:T.coat,put=>put('path',{d:`M${x-5} ${by+2}Q${x-17} ${by+12} ${x-21} ${by+26}Q${x-4} ${by+22} ${x+7} ${by+5}Z`}));
      else{rim(g,far?T.dark:T.coat,put=>put('path',{d:`M${x-5.5} ${by}V-3Q${x-5} 0 ${x} 0H${x+6}Q${x+7} -4 ${x+5.5} ${by}Z`}));for(const dx of [-2,2,5.4])E(g,x+dx,-1.4,1.2,1.4,CREAM,{opacity:.8});}},x,by+2);
    const legs=[leg(-len*.26,1),leg(len*.3,1),leg(-len*.3,0),leg(len*.26,0)];
    const hx=len*.5+8,hy=by-7;
    const head=part(g=>{rim(g,T.coat,put=>{put('path',{d:`M${len*.34} ${by-2}Q${hx-8} ${hy-3} ${hx-3} ${hy-5}L${hx-3} ${hy+7}Q${hx-10} ${by+8} ${len*.34} ${by+7}Z`});put('ellipse',ell(hx,hy,9,7.6));});
      eye(g,hx+2.6,hy-1.6,2.5);S(g,`M${hx+2} ${hy+4.2}q3 1.6 6-.6`,INK,1.2,{opacity:.5});E(g,hx-2.5,hy+3,2,1.6,BLUSH,{opacity:.5});},len*.34,by+2);
    const lid=part(lidOf([[hx+2.6,hy-1.6]],T.coat,2.5));
    const shell=part(g=>{S(g,`M${-len*.5-4} ${by+1}q-5 2-7 6`,s.coat,3);
      const dome=tint(shadeHex(s.coat,.9));rim(g,T.acc,put=>put('path',{d:`M${-len*.52} ${by+5}Q0 ${by+13} ${len*.5} ${by+5}L${len*.46} ${by-2}H${-len*.48}Z`}));
      rim(g,dome,put=>put('path',{d:`M${-len*.48} ${by}Q${-len*.46} ${by-H} 0 ${by-H}Q${len*.44} ${by-H} ${len*.46} ${by}Z`}));
      for(const [x,y,k] of [[-len*.22,by-H*.42,1],[0,by-H*.62,1.15],[len*.2,by-H*.4,1],[-len*.08,by-H*.2,.8],[len*.1,by-H*.18,.8]])P(g,`M${r1(x-7*k)} ${r1(y)}L${r1(x-3.5*k)} ${r1(y-6*k)}H${r1(x+3.5*k)}L${r1(x+7*k)} ${r1(y)}L${r1(x+3.5*k)} ${r1(y+6*k)}H${r1(x-3.5*k)}Z`,T.acc,{opacity:.5});
      E(g,-len*.1,by-H*.8,len*.2,H*.08,'#fff',{opacity:.16});});
    const headG=grp(len*.34,by+2,head,lid);
    return {shadow:[len*.6,5],nodes:[legs[0],legs[1],headG,shell,legs[2],legs[3]],
      pose(q,cheer){const a=q.stride*(p.flippers?.9:.6);rot(legs[3],a);rot(legs[0],a);rot(legs[1],-a);rot(legs[2],-a);
        headG.style.transform=`translate(${(Math.sin(q.head*.12)*2+q.graze*3+cheer*4).toFixed(2)}px,0) rotate(${(q.head*.5+q.graze*16-cheer*14).toFixed(2)}deg)`;show(lid,q.blink);}};
  }

  /* ---- crabs ---- */
  function crab(s,p,T){
    const side=k=>part(g=>{for(let i=0;i<3;i++)S(g,`M${k*12} ${-9+i}Q${k*(22+i*3)} ${-14+i*3} ${k*(25+i*4)} 0`,shadeHex(s.coat,.9),3.2);},k*12,-9);
    const claw=k=>part(g=>{S(g,`M${k*13} -14Q${k*22} -18 ${k*25} -25`,shadeHex(s.coat,.9),4);rim(g,T.coat,put=>put('ellipse',ell(k*28,-30,7.5,6,k*-30)));P(g,`M${k*29} -31l${k*8}-5 ${k*-3} 8Z`,CREAM,{opacity:.9});},k*13,-14);
    const legsL=side(-1),legsR=side(1),clawL=claw(-1),clawR=claw(1);
    const body=part(g=>{
      if(p.shell){const sh=tint(s.accent);rim(g,sh,put=>put('path',{d:'M-22-9Q-27-36-6-40Q16-42 17-22Q18-10 6-7Z'}));S(g,'M-14-13Q-21-30-6-33Q8-34 8-22Q7-13-2-15Q-8-18-5-23','#b08f76',2.2,{opacity:.7});E(g,-10,-34,6,2.4,'#fff',{opacity:.25,rot:-20});}
      rim(g,T.coat,put=>put('ellipse',p.shell?ell(6,-10,13,9):ell(0,-12,18,11.5)));
      if(!p.shell){E(g,0,-8,12,5,T.acc,{opacity:.55});for(const x of [-8,-2,5])E(g,x,-17,1.6,1.2,'#fff',{opacity:.35});}
      const ox=p.shell?6:0;for(const k of [-1,1]){S(g,`M${ox+k*6} -18v-9`,shadeHex(s.coat,.9),2.6);E(g,ox+k*6,-29,3.6,4,'#fff');E(g,ox+k*6+.6,-28.6,2,2.4,INK);}
      S(g,`M${ox-4} -9q4 3 8 0`,INK,1.3,{opacity:.6});for(const k of [-1,1])E(g,ox+k*9,-9,2.4,1.8,BLUSH,{opacity:.55});});
    return {shadow:[24,4.5],nodes:[legsL,legsR,body,clawL,clawR],
      pose(q,cheer){const w=Math.sin(q.phase)*9*q.walk;rot(legsL,w);rot(legsR,w);rot(clawL,q.wing+cheer*40);rot(clawR,-q.wing-cheer*40);}};
  }

  /* ---- seals and the walrus ---- */
  function seal(s,p,T){
    const {L:len,H}=p,hx=len*.43,hy=-H*1.12,r=H*.44,nx=len*.26,ny=-H*.6;
    const tail=part(g=>{for(const a of [-24,18])rim(g,T.dark,put=>put('ellipse',ell(-len*.56,-H*.34,len*.11,H*.16,a)));},-len*.46,-H*.36);
    const flip=part(g=>rim(g,T.dark,put=>put('path',{d:`M${r1(len*.1)} ${r1(-H*.3)}Q${r1(len*.02)} ${r1(-H*.02)} ${r1(-len*.1)} 1Q${r1(len*.1)} 6 ${r1(len*.22)} ${r1(-H*.1)}Z`})),len*.12,-H*.26);
    const body=part(g=>{rim(g,T.coat,put=>{put('path',{d:`M${r1(-len*.5)} ${r1(-H*.36)}Q${r1(-len*.3)} ${r1(-H*1.02)} ${r1(len*.02)} ${r1(-H*.98)}Q${r1(len*.2)} ${r1(-H*.96)} ${r1(len*.3)} ${r1(-H*1.2)}L${r1(len*.44)} ${r1(-H*.7)}Q${r1(len*.4)} ${r1(-H*.02)} ${r1(len*.16)} 0Q${r1(-len*.24)} 3 ${r1(-len*.5)} ${r1(-H*.36)}Z`});});
      E(g,len*.12,-H*.2,len*.26,H*.2,T.acc,{opacity:.6});E(g,-len*.1,-H*.82,len*.24,H*.09,'#fff',{opacity:.14});
      for(const [dx,dy] of [[-.3,-.62],[-.2,-.74],[-.08,-.66],[-.26,-.42],[-.02,-.8],[.08,-.62]])E(g,len*dx,H*dy,3,2.2,p.tusks?shadeHex(s.coat,.85):T.acc,{opacity:.6});});
    const ex=hx+r*.34,ey=hy-r*.14;
    const head=part(g=>{rim(g,T.coat,put=>{put('ellipse',ell(hx,hy,r,r*.92));put('path',{d:`M${r1(nx-len*.06)} ${r1(ny+2)}L${r1(hx-r*.7)} ${r1(hy+r*.2)}L${r1(hx+r*.5)} ${r1(hy+r*.75)}L${r1(nx+len*.14)} ${r1(ny+8)}Z`});});
      if(p.tusks)for(const dx of [.5,.86])P(g,`M${r1(hx+r*dx)} ${r1(hy+r*.56)}q3 ${r1(r*.75)} -2 ${r1(r*1.25)}q-3 ${r1(-r*.5)} -3 ${r1(-r*1.2)}Z`,CREAM);
      E(g,hx+r*.66,hy+r*.36,r*.5,r*.4,T.acc);for(const dy of [-.05,.14,.32])S(g,`M${r1(hx+r*.8)} ${r1(hy+r*(.3+dy*.6))}l${r1(r*.5)} ${r1(r*dy)}`,'#fff',1,{opacity:.7});
      E(g,hx+r*.98,hy+r*.12,2.6,2,INK);eye(g,ex,ey,Math.max(2.8,r*.2));E(g,hx,hy+r*.42,r*.2,r*.15,BLUSH,{opacity:.5});},nx,ny);
    const lid=part(lidOf([[ex,ey]],T.coat,Math.max(2.8,r*.2)));
    const headG=grp(nx,ny,head,lid);
    return {shadow:[len*.56,6],nodes:[tail,body,flip,headG],
      pose(q,cheer){rot(headG,q.head-cheer*12);rot(tail,q.tail);rot(flip,q.wing*.9+cheer*30);show(lid,q.blink);}};
  }

  /* ---- birds ---- */
  function perchBase(g,kind){
    if(kind==='stump'){const wood=tint('#9a7d62');rim(g,wood,put=>put('path',{d:'M-17 0Q-13-9-13-17H13Q13-9 19 0Q8 3 0 1Q-9 3-17 0Z'}));E(g,0,-17,13,4,'#c7ad8a');S(g,'M-6-17a6 1.8 0 1 0 12 0',shadeHex('#9a7d62',.8),1,{opacity:.6});S(g,'M-7-5q1-5 0-9m9 10q1-4 0-7','#6f5847',1.2,{opacity:.5});}
    else{const w=tint(kind==='snow'?'#eef2ee':'#9b9db1');rim(g,w,put=>put('path',{d:'M-22 0Q-20-13-8-17Q8-20 15-13Q23-8 23 0Z'}),.2);E(g,-4,-13,9,2.6,'#fff',{opacity:.35});}
  }
  function owl(s,p,T){
    const ph=17,by=-ph-20,hy=-ph-41,eyes=[[-6.6,hy+1],[6.6,hy+1]];
    const base=part(g=>perchBase(g,p.perch));
    const wing=k=>part(g=>rim(g,T.dark,put=>put('path',{d:`M${k*9} ${by-13}Q${k*21} ${by-4} ${k*15} ${by+17}Q${k*8} ${by+10} ${k*6} ${by-6}Z`})),k*9,by-12);
    const wl=wing(-1),wr=wing(1);
    const body=part(g=>{rim(g,T.coat,put=>put('ellipse',ell(0,by,15.5,20)));E(g,0,by+3,10.5,15,T.acc);
      for(const [x,y] of [[-4,by-3],[4,by-3],[0,by+3],[-5,by+9],[5,by+9],[0,by+14]])S(g,`M${x-2.4} ${y}q2.4 2.6 4.8 0`,shadeHex(s.coat,.85),1.3,{opacity:.7});
      for(const k of [-1,1])S(g,`M${k*5} ${-ph-1}l${k*-3} 3m3-3v3.4m0-3.4l3 3`,'#d0a560',2);if(p.star)star(g,0,by+3,.7);});
    const head=part(g=>{for(const k of [-1,1])P(g,`M${k*9} ${hy-9}L${k*15} ${hy-19}L${k*3} ${hy-12}Z`,T.coat);
      rim(g,T.coat,put=>put('ellipse',ell(0,hy,17,14.5)));for(const [x,y] of eyes)E(g,x,y,7.6,8,T.acc);
      for(const [x,y] of eyes)eye(g,x,y,3.3);P(g,`M-3 ${hy+5}L0 ${hy+10.5}L3 ${hy+5}Q0 ${hy+3.4}-3 ${hy+5}Z`,'#d9b064');for(const k of [-1,1])E(g,k*12,hy+7,2.6,2,BLUSH,{opacity:.5});},0,hy+12);
    const lid=part(lidOf(eyes,T.acc,3.3));
    const headG=grp(0,hy+12,head,lid);
    return {shadow:[22,4.5],nodes:[base,wl,wr,body,headG],
      pose(q,cheer){rot(headG,q.head+cheer*10);rot(wl,q.wing+cheer*50);rot(wr,-q.wing-cheer*50);show(lid,q.blink);}};
  }
  function hornbill(s,p,T){
    const ph=17,by=-ph-15,hx=11,hy=-ph-31;
    const base=part(g=>perchBase(g,'stump'));
    const tail=part(g=>rim(g,T.dark,put=>put('path',{d:`M-9 ${by+2}L-33 ${by+21}L-25 ${by+25}L-3 ${by+9}Z`})),-8,by+4);
    const body=part(g=>{rim(g,T.coat,put=>put('ellipse',ell(0,by,15,11.5,-24)));E(g,5,by+4,8,6.5,CREAM,{rot:-24,opacity:.85});
      for(const x of [-2,5])S(g,`M${x} ${-ph-1}v-6`,'#77736b',2.2);});
    const wing=part(g=>rim(g,T.dark,put=>put('path',{d:`M4 ${by-8}Q-14 ${by-9}-22 ${by+12}Q-6 ${by+10} 6 ${by}Z`})),3,by-6);
    const head=part(g=>{rim(g,T.coat,put=>put('ellipse',ell(hx,hy,9,8.5)));const b=tint(s.accent);
      rim(g,b,put=>{put('path',{d:`M${hx+5} ${hy-5}Q${hx+30} ${hy-10} ${hx+33} ${hy+6}Q${hx+18} ${hy+6} ${hx+5} ${hy+4}Z`});put('path',{d:`M${hx+3} ${hy-6}Q${hx+12} ${hy-18} ${hx+25} ${hy-9}Z`});});
      S(g,`M${hx+7} ${hy+.5}q12-1 23 2`,'#a8843f',1,{opacity:.6});E(g,hx+2,hy-1.5,4.2,4.2,CREAM);eye(g,hx+2.4,hy-1.5,2.4);},hx-4,hy+6);
    const lid=part(lidOf([[hx+2.4,hy-1.5]],CREAM,2.4));const headG=grp(hx-4,hy+6,head,lid);
    return {shadow:[22,4.5],nodes:[base,tail,body,wing,headG],
      pose(q,cheer){rot(headG,q.head*.8-cheer*14);rot(wing,-q.wing*1.4-cheer*60);rot(tail,q.tail*.4);show(lid,q.blink);}};
  }
  function penguin(s,p,T){
    const foot=x=>part(g=>rim(g,tint('#e0a95f'),put=>put('ellipse',ell(x+2,-2,7,3))),x,-3);
    const fl=foot(-6),fr=foot(6);
    const back=part(g=>rim(g,T.dark,put=>put('path',{d:'M-9-44Q-22-26-17-7Q-10-18-6-38Z'})),-8,-42);
    const body=part(g=>{rim(g,T.coat,put=>put('ellipse',ell(0,-30,16,29)));E(g,4,-27,11,23.5,CREAM);E(g,8,-46,5.5,7.5,'#edc470',{opacity:.9});E(g,-6,-44,5,10,'#fff',{opacity:.08});});
    const flip=part(g=>rim(g,T.coat,put=>put('path',{d:'M3-44Q-12-30-9-9Q0-18 7-38Z'})),3,-43);
    const hx=4,hy=-58;
    const head=part(g=>{rim(g,T.coat,put=>put('ellipse',ell(hx,hy,11.5,11)));E(g,hx+6,hy+5.5,5,3.6,'#edc470',{opacity:.85});
      P(g,`M${hx+9} ${hy-2}L${hx+23} ${hy+2}L${hx+9} ${hy+4.6}Z`,'#4a5560');S(g,`M${hx+10} ${hy+2.6}l10-.4`,'#e7a35f',1.6);
      E(g,hx+4.6,hy-2.4,4,4.4,'#fff');E(g,hx+5.4,hy-2,2.3,2.9,INK);E(g,hx+6,hy-3,.8,.8,'#fff');},hx-2,hy+9);
    const lid=part(g=>{E(g,hx+4.6,hy-2.4,4.6,5,T.coat);S(g,`M${hx+1.6} ${hy-1.6}q3 2.6 6 0`,'#fff',1.4,{opacity:.8});});
    const headG=grp(hx-2,hy+9,head,lid);
    return {shadow:[20,4.5],nodes:[fl,fr,back,body,flip,headG],
      pose(q,cheer){rot(fl,q.stride*.5);rot(fr,-q.stride*.5);rot(flip,-6-Math.abs(q.roll)*2-cheer*70+q.tail*.3);rot(back,6+Math.abs(q.roll)*2+cheer*60);rot(headG,q.head*.8+q.graze*14);show(lid,q.blink);}};
  }
  function wader(s,p,T){
    const {bw,bh,leg,neck,head:r,beak}=p,by=-leg-bh*.42,nx=bw*.34,ny=by-bh*.2,hx=nx+neck*.42+r*.4,hy=ny-neck*.94-r*.6;
    const mk=x=>part(g=>{S(g,`M${x} ${-leg-1}L${x+1} 0`,'#b08a66',leg>20?2.6:1.8);S(g,`M${x-3} 0h9`,'#b08a66',leg>20?2.4:1.6);},x,-leg);
    const l1=mk(-2),l2=mk(4);
    const body=part(g=>{rim(g,T.dark,put=>put('path',{d:`M${-bw*.36} ${by-bh*.2}L${-bw*.78} ${by+bh*.02}L${-bw*.34} ${by+bh*.32}Z`}));
      rim(g,T.coat,put=>put('ellipse',ell(0,by,bw/2,bh/2,-8)));E(g,bw*.08,by+bh*.16,bw*.34,bh*.26,T.acc,{rot:-8,opacity:.8});});
    const wing=part(g=>{rim(g,T.dark,put=>put('path',{d:`M${bw*.22} ${by-bh*.3}Q${-bw*.3} ${by-bh*.56} ${-bw*.62} ${by+bh*.06}Q${-bw*.2} ${by+bh*.2} ${bw*.26} ${by-bh*.02}Z`}));
      for(const dx of [-.34,-.14,.04])S(g,`M${r1(bw*dx)} ${r1(by-bh*.14)}q${r1(bw*.08)} ${r1(bh*.14)} ${r1(bw*.02)} ${r1(bh*.2)}`,'#fff',1,{opacity:.35});},bw*.2,by-bh*.24);
    const head=part(g=>{if(neck>8){const d=`M${r1(nx)} ${r1(ny)}Q${r1(nx+neck*.5)} ${r1(ny-neck*.38)} ${r1(nx+neck*.2)} ${r1(ny-neck*.66)}Q${r1(nx+neck*.02)} ${r1(ny-neck*.88)} ${r1(hx-1)} ${r1(hy+1)}`;S(g,d,shadeHex(s.coat,.66),r*.82+2,{opacity:.28});S(g,d,s.coat,r*.82);}
      else rim(g,T.coat,put=>put('path',{d:`M${r1(nx-4)} ${r1(ny+2)}L${r1(hx-r*.7)} ${r1(hy)}L${r1(hx+r*.6)} ${r1(hy+r*.5)}L${r1(nx+5)} ${r1(ny+5)}Z`}));
      P(g,`M${r1(hx+r*.6)} ${r1(hy-r*.3)}L${r1(hx+r+beak)} ${r1(hy+r*.25)}L${r1(hx+r*.6)} ${r1(hy+r*.45)}Z`,p.cap?'#c9b38c':'#6e6558');
      rim(g,T.coat,put=>put('ellipse',ell(hx,hy,r,r*.94)));if(p.cap)E(g,hx-r*.1,hy-r*.62,r*.62,r*.34,'#cf8c80');else E(g,hx+r*.2,hy+r*.3,r*.6,r*.42,T.acc,{opacity:.8});
      eye(g,hx+r*.32,hy-r*.12,Math.max(1.9,r*.3));},nx,ny);
    const headG=grp(nx,ny,head);
    return {shadow:[bw*.6,Math.max(3,bw*.1)],nodes:[l1,l2,body,wing,headG],
      pose(q,cheer){rot(l1,q.stride*.7);rot(l2,-q.stride*.7);rot(headG,q.head*.5+q.graze*(neck>8?72:38)+Math.sin(q.phase*2)*4*q.walk);rot(wing,-cheer*46);}};
  }
  function flyer(s,p,T){
    const {bl,span}=p,k=span/50,sx=bl*.1,sy=-bl*.08,hx=bl*.44,hy=-bl*.1,r=Math.max(5.5,bl*.17);
    const wing=far=>part(g=>wingShape(g,sx,sy,k,far?T.dark:(p.tail==='plume'?T.acc:T.coat)),sx,sy);
    const wf=wing(1),wn=wing(0);
    const tail=part(g=>{const c=p.tail==='plume'?T.acc:T.dark;
      if(p.tail==='fork')rim(g,c,put=>put('path',{d:`M${-bl*.3} -2L${-bl*.92} ${-bl*.2}L${-bl*.58} 1L${-bl*.9} ${bl*.2}L${-bl*.3} 4Z`}));
      else if(p.tail==='fan')rim(g,c,put=>put('path',{d:`M${-bl*.3} -3L${-bl*.72} ${-bl*.14}Q${-bl*.8} 2 ${-bl*.7} ${bl*.14}L${-bl*.3} 4Z`}));
      else{for(const [dy,w] of [[-12,T.acc],[10,T.coat],[0,tint('#f0cf8f')]])rim(g,w,put=>put('path',{d:`M${-bl*.3} -2Q${-bl*.9} ${dy-8} ${-bl*1.55} ${dy}Q${-bl*.9} ${dy+7} ${-bl*.3} 4Z`}));}},-bl*.3,0);
    const body=part(g=>{rim(g,T.coat,put=>{put('ellipse',ell(0,0,bl*.44,bl*.19,-4));put('ellipse',ell(hx,hy,r,r*.94));});
      E(g,bl*.04,bl*.07,bl*.34,bl*.1,p.tail==='plume'?'#f0cf8f':T.acc,{rot:-4,opacity:.9});
      if(p.hook||p.tail==='fan')E(g,hx,hy,r*.98,r*.9,T.acc);
      P(g,p.hook?`M${r1(hx+r*.7)} ${r1(hy-r*.3)}Q${r1(hx+r*1.7)} ${r1(hy-r*.3)} ${r1(hx+r*1.6)} ${r1(hy+r*.7)}Q${r1(hx+r*1.2)} ${r1(hy+r*.3)} ${r1(hx+r*.7)} ${r1(hy+r*.4)}Z`:`M${r1(hx+r*.74)} ${r1(hy-r*.26)}L${r1(hx+r*(p.tail==='fan'?2.3:1.7))} ${r1(hy+r*.12)}L${r1(hx+r*.74)} ${r1(hy+r*.42)}Z`,'#d9b064');
      if(p.tail==='plume')for(const a of [-30,-5,18])E(g,hx-r*.5,hy-r*1.1,2,6,T.acc,{rot:a});
      eye(g,hx+r*.3,hy-r*.12,Math.max(2,r*.28));E(g,hx+r*.05,hy+r*.42,r*.22,r*.16,BLUSH,{opacity:.5});});
    return {shadow:[bl*.4,3.5],nodes:[wf,tail,body,wn],
      pose(q){const v=q.wing/38,a=v>=0?v:v*.75,b=Math.sin(Math.asin(Math.max(-1,Math.min(1,v)))-.5);
        wn.style.transform=`scaleY(${(.14+.86*a).toFixed(3)})`;wf.style.transform=`translate(${(bl*.1).toFixed(1)}px,-2px) scaleY(${(.2+.8*(b>=0?b:b*.75)).toFixed(3)}) rotate(-12deg)`;rot(tail,q.roll*.5+Math.sin(q.phase)*2);}};
  }
  function bee(s,p,T){
    const wing=x=>part(g=>{E(g,x-2,-17,6,10.5,'#f4f7ee',{rot:-14,opacity:.8});S(g,`M${x-1} -9q-2-8 0-14`,'#b9c4c0',.8,{opacity:.6});},x,-7);
    const w1=wing(-5),w2=wing(3);
    const body=part(g=>{P(g,'M-12-1l-5 1 5 2Z',INK);rim(g,T.coat,put=>put('ellipse',ell(0,0,12,8.6)));for(const x of [-6,-.5,5])P(g,`M${x-1.6} ${-8.2+Math.abs(x)*.25}Q${x+1.4} 0 ${x-1.6} ${8.2-Math.abs(x)*.25}h3.2Q${x+4.6} 0 ${x+1.6} ${-8.2+Math.abs(x)*.25}Z`,s.accent);
      rim(g,tint(s.accent),put=>put('circle',{cx:11.5,cy:-1.5,r:6}));eye(g,13.5,-2.5,1.9);E(g,10.5,1.4,1.8,1.3,BLUSH,{opacity:.7});S(g,'M12-7q3-7 7-6m-9 5q0-7-4-8',INK,1,{opacity:.7});});
    return {shadow:[9,2.4],nodes:[w1,body,w2],pose(q){const v=.3+.7*Math.abs(q.wing);w1.style.transform=`scaleY(${v.toFixed(3)}) rotate(-8deg)`;w2.style.transform=`scaleY(${(1.3-v).toFixed(3)}) rotate(10deg)`;}};
  }
  function butterfly(s,p,T){
    const wings=far=>part(g=>{const a=far?T.acc:T.coat,b=far?T.coat:T.acc;
      rim(g,a,put=>{put('path',{d:'M0-2Q-9-25 7-30Q21-30 19-14Q16-4 0-2Z'});put('path',{d:p.moth?'M0-1Q16-2 15 8Q13 20 9 30Q5 14 0-1Z':'M0-1Q15-1 14 9Q9 15 2 9Z'});});
      E(g,10,-18,4.6,5.4,b,{opacity:.85});E(g,8,5,2.8,3.2,b,{opacity:.85});E(g,6,-25,1.6,1.6,'#fff',{opacity:.7});if(p.moth)star(g,10,-18,.5);},0,-1);
    const far=wings(1),near=wings(0);
    const body=part(g=>{E(g,1,0,2.4,8.5,INK,{rot:70,opacity:.85});E(g,9.5,-3.4,2.8,2.8,INK,{opacity:.85});S(g,'M10.5-5q3-7 7-7m-8 6q0-7-3-9',INK,.9,{opacity:.7});});
    return {shadow:[8,2.2],nodes:[far,body,near],pose(q){const v=.5+.5*q.wing;near.style.transform=`scaleY(${(.12+.88*v).toFixed(3)})`;far.style.transform=`translate(2px,-1px) scaleY(${(.2+.8*v).toFixed(3)}) rotate(-12deg)`;}};
  }

  /* ---- upright sitters: meerkat sentinel and gibbon ---- */
  function sitter(s,p,T){
    const ape=!!p.ape,bw=ape?16:9,bh=ape?19:21,by=-bh-(ape?1:3),hx=ape?5:3,hy=by-bh-(ape?7:4),r=ape?12.5:9;
    const tail=ape?null:part(g=>{S(g,`M-6 -4Q-22 0-30 -5`,shadeHex(s.coat,.9),3.4);E(g,-31,-5.4,3.4,2.4,'#5d4a40');},-6,-4);
    const arm=k=>part(g=>{const x=ape?-3+k*9:2+k*5,y=by-bh*.5;
      if(ape){const d=`M${x} ${y}Q${x-9+k*3} ${y+18} ${x+5+k*3} ${y+34}`;S(g,d,shadeHex(s.coat,.66),8.4,{opacity:.28});S(g,d,k?s.coat:shadeHex(s.coat,.86),6.4);E(g,x+6+k*3,y+35,4,3,'#5f574c');}
      else{S(g,`M${x} ${y}q5 6 4 13`,k?s.coat:shadeHex(s.coat,.86),4);E(g,x+4,y+13.6,2.4,2,'#5d4a40');}},ape?-3+k*9:2+k*5,by-bh*.5);
    const a1=arm(0),a2=arm(1);
    const body=part(g=>{if(ape)for(const x of [-8,9])rim(g,T.dark,put=>put('ellipse',ell(x,-5,10,6)));else for(const x of [-4,5])rim(g,T.dark,put=>put('ellipse',ell(x+1.5,-2,5.5,2.6)));
      rim(g,T.coat,put=>put('ellipse',ell(0,by,bw,bh)));E(g,bw*.22,by+bh*.1,bw*.6,bh*.72,T.acc,{opacity:.8});
      if(!ape)for(let i=0;i<4;i++)S(g,`M${-bw*.86} ${by-bh*.4+i*7}q${bw*.5} -3 ${bw*.8} 0`,shadeHex(s.coat,.8),1.3,{opacity:.5});});
    const eyes=ape?[[hx-1,hy-1.4],[hx+7,hy-1.4]]:[[hx+3.4,hy-1.2]];
    const head=part(g=>{if(!ape)E(g,hx-6,hy-5.4,3,3,'#5d4a40');
      rim(g,T.coat,put=>{put('ellipse',ell(hx,hy,r,r*.9));if(!ape)put('path',{d:`M${hx+3} ${hy-4}L${hx+14} ${hy+2.4}L${hx+4} ${hy+7}Z`});});
      if(ape){E(g,hx+3,hy+.6,9,8.4,T.acc);S(g,`M${hx-5.5} ${hy-6}q8.5-5 17 0`,CREAM,2.2,{opacity:.9});E(g,hx+3.4,hy+2.6,1.8,1.3,INK,{opacity:.7});S(g,`M${hx} ${hy+5.6}q3.4 2.4 6.8 0`,INK,1.2,{opacity:.6});}
      else{E(g,hx+6,hy+3,6,3.6,T.acc);E(g,hx+3.6,hy-1.2,4.4,3.6,'#5d4a40',{opacity:.75});E(g,hx+13,hy+2,1.9,1.6,INK);}
      for(const [x,y] of eyes)eye(g,x,y,ape?2.5:2.3);E(g,hx-(ape?6:2),hy+4.4,2.4,1.8,BLUSH,{opacity:.55});},hx-2,hy+r*.8);
    const lid=part(lidOf(eyes,ape?T.acc:'#5d4a40',ape?2.5:2.3));
    const headG=grp(hx-2,hy+r*.8,head,lid),up=grp(0,0,a1,body,a2,headG);
    return {shadow:[ape?22:11,ape?5:3.4],nodes:[tail,up],
      pose(q,cheer){rot(headG,q.head-cheer*10);rot(a1,q.wing*(ape?1:.5)-cheer*150);rot(a2,-q.wing*(ape?.8:.4)-cheer*150);rot(tail,q.tail*.5);show(lid,q.blink);}};
  }

  /* ---- two-legged dinosaurs ---- */
  function biped(s,p,T){
    const {L:len,H,leg}=p,by=-leg-H*.28,nx=len*.3,ny=by-H*.3,rex=!!p.rex,r=rex?24:15,hx=nx+len*.22,hy=ny-H*(rex?.52:.74);
    const legB=far=>part(g=>{const x=far?9:-4,c=far?T.dark:T.coat;
      rim(g,c,put=>{put('ellipse',ell(x,by+H*.3,len*.13,H*.36,12));put('path',{d:`M${x-len*.06} ${by+H*.5}L${x-2} -6Q${x-2} 0 ${x+4} 0H${x+len*.17}Q${x+len*.17} -6 ${x+len*.06} -7L${x+len*.09} ${by+H*.5}Z`});});
      for(const dx of [.07,.12,.16])E(g,x+len*dx,-1.6,1.6,1.8,CREAM,{opacity:.85});},far?9:-4,by+H*.2);
    const lf=legB(1),ln=legB(0);
    const tail=part(g=>rim(g,T.coat,put=>put('path',{d:`M${-len*.2} ${by-H*.38}Q${-len*.6} ${by-H*.36} ${-len*.98} ${by-H*.02}Q${-len*.6} ${by+H*.2} ${-len*.18} ${by+H*.36}Z`})),-len*.24,by);
    const body=part(g=>{rim(g,T.coat,put=>put('ellipse',ell(0,by,len*.4,H*.5,-16)));E(g,len*.1,by+H*.16,len*.26,H*.26,T.acc,{rot:-16,opacity:.7});
      for(const [dx,dy,a] of [[-.24,-.22,-10],[-.08,-.34,-16],[.08,-.4,-20],[-.16,-.04,-12],[.0,-.14,-16]])E(g,len*dx,by+H*dy,rex?5.5:4,2.4,rex?shadeHex(s.coat,.8):T.acc,{rot:a,opacity:.6});});
    const arm=part(g=>{S(g,`M${len*.24} ${by-H*.02}q${len*.1} ${H*.1} ${len*.08} ${H*.24}`,shadeHex(s.coat,.92),rex?5:6);for(const d of [-2,2])S(g,`M${r1(len*.32)} ${r1(by+H*.22)}l${d} 4`,CREAM,1.4);},len*.24,by-H*.02);
    const ex=hx+r*.14,ey=hy-r*.2;
    const head=part(g=>{
      if(p.crest)rim(g,T.acc,put=>put('path',{d:`M${r1(hx+r*.1)} ${r1(hy-r*.6)}Q${r1(hx-r*1.4)} ${r1(hy-r*1.9)} ${r1(hx-r*3)} ${r1(hy-r*1.7)}Q${r1(hx-r*1.6)} ${r1(hy-r*1.1)} ${r1(hx-r*.7)} ${r1(hy-r*.1)}Z`}));
      const a=`M${r1(nx-len*.11)} ${r1(ny+6)}Q${r1(nx-len*.04)} ${r1((ny+hy)/2)} ${r1(hx-r*.8)} ${r1(hy+r*.1)}`,b=`L${r1(hx+r*.2)} ${r1(hy+r*.7)}Q${r1(nx+len*.14)} ${r1((ny+hy)/2+8)} ${r1(nx+len*.14)} ${r1(ny+12)}`;
      rim(g,T.coat,put=>put('path',{d:a+b+'Z'},a+b.replace('L','M')));
      if(rex){rim(g,T.coat,put=>{put('ellipse',ell(hx,hy,r*.92,r*.74));put('path',{d:`M${r1(hx)} ${r1(hy-r*.62)}Q${r1(hx+r*1.5)} ${r1(hy-r*.7)} ${r1(hx+r*1.62)} ${r1(hy+r*.06)}Q${r1(hx+r*1.6)} ${r1(hy+r*.5)} ${r1(hx+r*.9)} ${r1(hy+r*.56)}L${r1(hx)} ${r1(hy+r*.6)}Z`});});
        P(g,`M${r1(hx+r*.05)} ${r1(hy+r*.3)}Q${r1(hx+r*.9)} ${r1(hy+r*.38)} ${r1(hx+r*1.58)} ${r1(hy+r*.2)}Q${r1(hx+r*1.5)} ${r1(hy+r*.56)} ${r1(hx+r*.9)} ${r1(hy+r*.6)}L${r1(hx+r*.05)} ${r1(hy+r*.62)}Z`,T.acc);
        for(let i=0;i<5;i++)P(g,`M${r1(hx+r*(.42+i*.22))} ${r1(hy+r*.31)}l${r1(r*.07)} ${r1(r*.16)} ${r1(r*.07)} ${r1(-r*.16)}Z`,'#fff');
        E(g,hx+r*1.36,hy-r*.26,1.6,1.3,INK,{opacity:.7});S(g,`M${r1(ex-5)} ${r1(ey-6)}q5-3 10 0`,shadeHex(s.coat,.7),2);}
      else{rim(g,T.coat,put=>put('ellipse',ell(hx,hy,r,r*.8)));rim(g,T.acc,put=>put('path',{d:`M${r1(hx+r*.5)} ${r1(hy-r*.3)}Q${r1(hx+r*1.7)} ${r1(hy-r*.2)} ${r1(hx+r*1.8)} ${r1(hy+r*.34)}Q${r1(hx+r*1.2)} ${r1(hy+r*.66)} ${r1(hx+r*.4)} ${r1(hy+r*.56)}Z`}));
        E(g,hx+r*1.5,hy+r*.02,1.5,1.2,INK,{opacity:.7});S(g,`M${r1(hx+r*.7)} ${r1(hy+r*.38)}q${r1(r*.5)} 2 ${r1(r*.9)} -.6`,INK,1.2,{opacity:.5});}
      eye(g,ex,ey,rex?3.3:2.9);E(g,hx-r*.2,hy+r*.36,r*.2,r*.14,BLUSH,{opacity:.5});},nx,ny);
    const lid=part(lidOf([[ex,ey]],T.coat,rex?3.3:2.9));const headG=grp(nx,ny,head,lid),up=grp(0,0,tail,body,arm),up2=grp(0,0,headG);
    return {shadow:[len*.5,6.5],nodes:[lf,up,ln,up2],
      pose(q,cheer){const bob=`translate(0,${(-Math.abs(Math.sin(q.phase))*2.4*q.walk).toFixed(2)}px)`;up.style.transform=up2.style.transform=bob;
        rot(ln,q.stride*1.1);rot(lf,-q.stride*1.1);rot(tail,q.tail*.35-q.stride*.12);rot(headG,q.head*.6+q.graze*42-cheer*16);rot(arm,q.stride*.5-cheer*40);show(lid,q.blink);}};
  }
  const KITS={quad,turtle,crab,seal,owl,hornbill,penguin,wader,flyer,bee,butterfly,sitter,biped};

  function rig(s,index){
    const p=SPEC[s.id]??Q({}),T={coat:tint(s.coat),dark:tint(s.coat,.81),acc:tint(s.accent)};
    const kit=KITS[p.kit](s,p,T),[rx,ry]=kit.shadow;
    const shadow=part(g=>E(g,0,1.5,rx,ry,shadowColor,{opacity:.3}),0,1.5),air=grp(0,0,...kit.nodes);
    const root=box(host,shadow,air);
    root.dataset.species=s.id;root.setAttribute('aria-label',s.name);root.style.pointerEvents='none';
    // Small creatures are drawn a little larger than life so a five-year-old can read their faces.
    const boost=p.kit==='flyer'||p.kit==='bee'||p.kit==='butterfly'?1.35:rx<30?1.3:rx<50?1.18:1.04;
    return {root,air,shadow,kit,s,index,boost,base:0,reach:Math.max(rx*2,70)*s.size*boost,small:rx<30,tall:rx>=58};
  }
  const actors=[];let seconds=0,celebration=0,span=0,calm=0;
  for(let i=0;i<10;i++){
    const actor=rig(species[i%5],i),previous=actors[i-1];
    span+=Math.max(210,((previous?.reach??90)+actor.reach)*.5+165);
    actor.base=span;actors.push(actor);
  }
  span+=120;
  const margin=Math.max(260,...actors.map(a=>a.reach+190));
  return {
    species:species.map(s=>s.id),
    /** `focus` is the world x of an open question: animals slow down and look that way with the child. */
    update(dt,cam,width,focus=null){
      const attending=focus!==null&&!reduced;calm+=((attending?1:0)-calm)*Math.min(1,Math.max(0,dt)*3);
      seconds+=Math.max(0,dt)*(1-.55*calm);celebration=Math.max(0,celebration-dt);
      for(const actor of actors){
        const {s,index,root,air,shadow,kit,base}=actor,cycle=Math.ceil((cam-margin-base)/span),home=base+cycle*span;
        if(home<cam-margin||home>cam+width+margin){if(!actor.hidden){actor.hidden=true;root.style.display='none';}continue;}
        if(actor.hidden){actor.hidden=false;root.style.display='';}
        const p=faunaPose(s,seconds,index,reduced),x=home+p.x;
        if(attending&&!p.flying&&p.walk<.15&&p.air<.05&&Math.abs(focus-x)<760){p.facing=focus>=x?1:-1;p.head=p.head*.3-5*calm;p.graze*=1-calm;p.ear-=6*calm;}
        const band=groundY(x)-pathWidth(x)*.72-meadowEdge(x);
        // Small creatures may come close to the path; big ones stay near the back of the clearing.
        const lane=actor.tall?.2:actor.small?(index%2?.7:.42):(index%2?.5:.3);
        const foot=meadowEdge(x)+16+Math.max(0,band-34)*lane,depth=.84+.2*lane;
        const cheer=celebration>0?Math.sin(Math.min(1,Math.max(0,(1-celebration)-index*.035)/.6)*Math.PI):0;
        const k=s.size*depth*actor.boost;root.style.transform=`translate3d(${x.toFixed(2)}px,${foot.toFixed(2)}px,0) scale(${(p.facing*k).toFixed(3)},${k.toFixed(3)})`;
        const lift=p.lift+cheer*(p.flying?10:15);
        air.style.transform=`translate(0,${(-lift).toFixed(2)}px) rotate(${p.roll.toFixed(2)}deg) scale(${(1-p.squash*.6).toFixed(3)},${(1+p.squash).toFixed(3)})`;
        shadow.style.opacity=Math.max(.25,1-lift/110).toFixed(2);
        kit.pose(p,cheer);
        root.dataset.animatedTime=seconds.toFixed(2);
      }
    },
    cheer(){if(!reduced)celebration=1;},
    destroy(){for(const a of actors)a.root.remove();}
  };
}
