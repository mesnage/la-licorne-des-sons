import { TONES, GREEN, STYLE, CROWN, SPREAD } from './crossroads-theme.js?v=review-16';
/* The question view: Paillette is seen from behind at a crossroads, wondering which door to take.
 * One door per answer. The host keeps the real answer buttons and lays them over the door signs
 * (see layout()); this module only paints and animates. All motion follows the scene clock, so
 * pause freezes it and reduced motion keeps a single calm pose.
 */
/* global innerWidth, innerHeight */
const NS='http://www.w3.org/2000/svg';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ease=v=>v*v*(3-2*v),r1=n=>Math.round(n*10)/10;

export function createCrossroads({view,W,wa,habitat,sky,shade='#2f4636',reduced=false,R=(a,b)=>a+Math.random()*(b-a),speck=()=>'none',shadeHex=h=>h}){
  const style=STYLE[habitat]??'stone',crown=CROWN[style],spread=SPREAD[style];
  const el=(tag,attrs={},parent)=>{const n=document.createElementNS(NS,tag);for(const k in attrs)n.setAttribute(k,attrs[k]);if(parent)parent.append(n);return n;};
  const root=document.createElement('div');root.id='fork';root.setAttribute('aria-hidden','true');
  const svg=el('svg',{xmlns:NS,width:'100%',height:'100%'});root.append(svg);view.append(root);
  const life=document.createElement('div');life.className='fork-life';root.append(life);let guests=[],guest=null,shows=0;
  let count=0,visible=false,doors=[],hero=null,duck=null,bubble=null,sparks=[],insets={top:0,hud:0,bottom:0,low:0};
  let clock=0,chosen=null,geom=null,shown=0;
  const P=(g,d,w,o={})=>el('path',{d,...(typeof w==='string'?{fill:w}:wa(w,2,.22)),...o},g);
  const S=(g,d,color,width,o={})=>el('path',{d,fill:'none',stroke:color,'stroke-width':width,'stroke-linecap':'round','stroke-linejoin':'round',...o},g);
  const E=(g,cx,cy,rx,ry,fill,o={})=>el('ellipse',{cx:r1(cx),cy:r1(cy),rx:r1(rx),ry:r1(ry),fill:typeof fill==='string'?fill:fill.fill,...o},g);
  const lush=GREEN.includes(habitat);

  /* ---------- Paillette, seen from behind (feet at 0,0; about 230 tall) ---------- */
  function makeHero(parent){
    const g=el('g',{},parent),sh=E(g,0,3,64,10,shade,{opacity:.28}),b=el('g',{},g);
    const leg=(x,far)=>{const l=el('g',{},b);
      P(l,`M${x-10} -74Q${x-11} -34 ${x-7.5} -10H${x+7.5}Q${x+11} -34 ${x+10} -74Z`,far?W.bodyS:W.body);
      P(l,`M${x-8.4} -13H${x+8.4}Q${x+12} -6 ${x+10.4} -1.4Q${x} 3.4 ${x-10.4} -1.4Q${x-12} -6 ${x-8.4} -13Z`,far?'#d98b93':W.pink.fill);return {l,x};};
    const legs=[leg(-34,true),leg(34,true),leg(-17,false),leg(17,false)];
    // body: a round rump narrowing to the shoulders
    P(b,'M-54-80Q-56-126-27-140Q0-148 27-140Q56-126 54-80Q52-44 0-42Q-52-44-54-80Z',W.body);
    P(b,'M-50-70Q0-44 50-70Q45-45 0-43Q-45-45-50-70Z',W.bodyS.fill,{opacity:.8});
    S(b,'M-34-122Q-42-106-42-90','#fff',5,{opacity:.5});
    for(const [x,y,r] of [[32,-100,2.6],[40,-90,1.8],[29,-88,1.6]])E(b,x,y,r,r,'#f0cf8f',{opacity:.9});
    // tail: coloured locks falling from the top of the rump
    const tail=el('g',{},b);
    P(tail,'M-13-112Q-34-92-30-52Q-27-20-6-4Q10 2 22-10Q4-26 6-56Q8-86 15-110Z',W.pink);
    P(tail,'M-9-110Q-22-88-18-56Q-15-34-3-20Q-4-44 0-64Q4-90 8-108Z',W.ochre);
    P(tail,'M2-108Q-6-88-3-62Q0-44 8-32Q7-52 10-70Q13-92 14-106Z',W.lilac);
    P(tail,'M-6-4Q-22-18-26-42Q-16-26-6-18Q2-12 4-2Z',W.teal);
    P(tail,'M-13-108Q-12-117 1-118Q15-117 15-108Q8-103 1-104Q-7-103-13-108Z',W.pink);
    P(tail,'M22-10Q12-24 12-46Q18-30 26-22Q30-16 22-10Z',W.teal);
    // head group: horn and snout sit behind the skull so only their edges show
    const head=el('g',{},b);
    P(head,'M-22-128Q-20-156 0-160Q20-156 22-128Q0-120-22-128Z',W.body.fill);
    const horn=el('g',{},head);
    P(horn,'M-8-196Q-3-226 0-242Q3-226 8-196Z',W.ochre);
    for(const d of ['M-4-214l8 3','M-5-206l10 3','M-3-224l6 2'])S(horn,d,'#fbe8b0',3);
    P(horn,'M10-244l1.8 4.6 4.6 1.8-4.6 1.8-1.8 4.6-1.8-4.6-4.6-1.8 4.6-1.8Z','#fff6c9');
    const snout=el('g',{},head);E(snout,0,-158,17,13,'#fbe9df');E(snout,0,-158,17,13,'none',{stroke:W.body.edge,'stroke-width':2,'stroke-opacity':.22});
    const ears=[-1,1].map(k=>{const e=el('g',{},head);
      P(e,`M${k*14} -196Q${k*20} -224 ${k*36} -230Q${k*42} -212 ${k*32} -192Z`,W.body);
      P(e,`M${k*20} -199Q${k*24} -216 ${k*34} -222Q${k*37} -210 ${k*30} -196Z`,W.bodyS.fill,{opacity:.9});return e;});
    P(head,'M-36-170Q-37-204 0-206Q37-204 36-170Q35-138 0-137Q-35-138-36-170Z',W.body);
    const face=el('g',{},head),eye=E(face,0,-172,5.6,7.4,'#2f2a2a');E(face,2,-175.4,2.1,2.1,'#fff');
    const blush=E(face,0,-160,7,5.5,'#eaa0a6',{opacity:.6});
    // mane: locks falling down the back of the neck
    const mane=el('g',{},head);
    P(mane,'M-12-204Q-30-196-30-168Q-30-140-14-122Q-18-146-12-164Q-6-184 4-200Z',W.teal);
    P(mane,'M2-208Q-18-196-18-166Q-18-134-4-112Q-6-140 0-160Q8-184 18-198Z',W.ochre);
    P(mane,'M12-204Q0-190 0-162Q0-140 8-124Q8-146 14-162Q22-184 26-194Z',W.lilac);
    P(mane,'M-4-210Q12-216 24-204Q32-194 30-178Q22-192 10-196Q0-200-10-200Z',W.pink);
    return {g,sh,b,legs,tail,head,horn,snout,ears,face,eye,blush,mane,look:0,blink:R(1.5,3),flick:R(2,4)};
  }
  /* ---------- the duckling, from behind ---------- */
  function makeDuck(parent){
    const g=el('g',{},parent);E(g,0,2,24,5,shade,{opacity:.28});const b=el('g',{},g);
    for(const x of [-8,8])P(b,`M${x-7} 0Q${x} -7 ${x+7} 0Q${x} 3 ${x-7} 0Z`,'#f0a04a');
    P(b,'M-22-22Q-24-44 0-46Q24-44 22-22Q20-4 0-4Q-20-4-22-22Z',W.duck);
    P(b,'M-7-30Q0-50 7-30Q0-22-7-30Z',W.duckD);
    const head=el('g',{},b);
    for(const d of ['M-3-74Q-8-84-3-90Q2-83 2-74Z','M2-75Q4-87 10-88Q10-80 6-74Z'])P(head,d,W.duck);
    P(head,'M-17-58Q-17-76 0-76Q17-76 17-58Q17-42 0-42Q-17-42-17-58Z',W.duck);
    const bill=P(head,'M12-58Q26-60 30-53Q23-48 12-50Z',W.bill);
    return {g,b,head,bill,hop:-1};
  }
  /* ---------- one door, set in a little house that belongs to the world ---------- */
  const circ=(cx,cy,r,ry=r*.9)=>`M${r1(cx-r)} ${r1(cy)}a${r1(r)} ${r1(ry)} 0 1 1 ${r1(2*r)} 0a${r1(r)} ${r1(ry)} 0 1 1 ${r1(-2*r)} 0Z`;
  const FRAME={stone:null,tree:'#6d5846',hut:'#fff8ea',igloo:'#d3e9f1',cloud:'#fffdf8',dome:'#b3afe0',adobe:'#cf9a6e',mushroom:'#fbf0dc'};
  function house(g,dw,dh,k,i,sw){
    const hw=dw/2,[tone,dark]=TONES[i%4];
    if(style==='tree'){
      const tw=Math.min(sw,hw*1.36),H=dh*1.2,jungle=habitat==='jungle',cy=-H-dh*.1;
      P(g,`M${r1(-tw*1.18)} 4Q${r1(-tw*.96)} ${r1(-dh*.2)} ${r1(-tw*.9)} ${r1(-dh*.6)}Q${r1(-tw*.88)} ${r1(-H)} ${r1(-tw*.6)} ${r1(-H-10*k)}H${r1(tw*.6)}Q${r1(tw*.88)} ${r1(-H)} ${r1(tw*.9)} ${r1(-dh*.6)}Q${r1(tw*.96)} ${r1(-dh*.2)} ${r1(tw*1.18)} 4Q${r1(tw*.6)} ${r1(-7*k)} 0 2Q${r1(-tw*.6)} ${r1(-7*k)} ${r1(-tw*1.18)} 4Z`,W.trunk);
      for(const [x,y,l] of [[-.76,-.24,.2],[.74,-.44,.2],[-.78,-.8,.16],[.76,-.92,.14]])S(g,`M${r1(tw*x)} ${r1(dh*y)}q${r1(3*k)} ${r1(-dh*l*.5)} 0 ${r1(-dh*l)}`,W.trunk.edge,2,{opacity:.5});
      P(g,`M${r1(-tw*.86)} ${r1(-dh*.5)}Q${r1(-tw*.8)} ${r1(-H*.96)} ${r1(-tw*.5)} ${r1(-H-6*k)}Q${r1(-tw*.66)} ${r1(-H*.7)} ${r1(-tw*.7)} ${r1(-dh*.5)}Z`,'#fff',{opacity:.16});
      for(const [dx,dy,r,w] of [[-.74,.07,.62,W.leafA],[.74,.09,.6,W.leafA],[0,-.1,.82,W.leafB]])P(g,circ(tw*dx,cy+dh*dy,tw*r),w);
      P(g,circ(-tw*.22,cy-dh*.16,tw*.46,tw*.3),speck(shadeHex(W.leafB.hex,1.14),3));P(g,circ(tw*.3,cy+dh*.14,tw*.6,tw*.2),speck(shadeHex(W.leafA.hex,.84),3));
      for(let q=0;q<6;q++)E(g,tw*R(-1,1),cy+dh*R(-.26,.2),3.2*k,3.2*k,jungle?['#f2a65e','#f6d06a'][q%2]:['#e59aa4','#fbf3e4'][q%2]);
      if(jungle)for(const sx of [-1,1]){S(g,`M${r1(sx*tw*.8)} ${r1(cy+dh*.2)}q${r1(sx*8*k)} ${r1(dh*.2)} ${r1(sx*-2*k)} ${r1(dh*.36)}`,W.leafA.hex,2.6);for(let q=1;q<4;q++)E(g,sx*tw*.8+sx*4*k,cy+dh*(.2+q*.1),5*k,3*k,W.leafB,{transform:`rotate(${sx*30} ${r1(sx*tw*.8+sx*4*k)} ${r1(cy+dh*(.2+q*.1))})`});}
      for(const [dx,c] of [[-1.02,'#d98b93'],[1.06,'#e0ad4c']]){P(g,`M${r1(tw*dx-2*k)} 3v${r1(-9*k)}h${r1(4*k)}v${r1(9*k)}Z`,'#f8e7cb');P(g,`M${r1(tw*dx-8*k)} ${r1(-6*k)}q${r1(8*k)} ${r1(-13*k)} ${r1(16*k)} 0Z`,c);}
    }else if(style==='hut'){
      const bw=Math.min(sw,hw*1.2),wh=dh*1.07,rh=dh*.28;
      P(g,`M${r1(-bw)} 2V${r1(-wh)}H${r1(bw)}V2Z`,'#fff8ea',{stroke:'#d8c7a8','stroke-width':2});
      for(let q=0;q<5;q+=2)el('path',{d:`M${r1(-bw+q*2*bw/5)} 1V${r1(-wh)}h${r1(2*bw/5)}V1Z`,fill:tone,opacity:.6},g);
      P(g,`M${r1(-bw*1.18)} ${r1(-wh+5*k)}L0 ${r1(-wh-rh)}L${r1(bw*1.18)} ${r1(-wh+5*k)}Z`,dark,{stroke:shadeHex(dark,.8),'stroke-width':2,'stroke-linejoin':'round'});
      for(let q=0;q<7;q++)E(g,-bw*1.05+q*bw*2.1/6,-wh+6*k,bw*.17,5*k,'#fff8ea');
      S(g,`M0 ${r1(-wh-rh)}v${r1(-15*k)}`,'#8a6a4a',2.4);P(g,`M0 ${r1(-wh-rh-15*k)}l${r1(13*k)} ${r1(4*k)}l${r1(-13*k)} ${r1(5*k)}Z`,'#f3bd4c');
      P(g,`M${r1(-bw*1.12)} 4h${r1(bw*2.24)}v${r1(6*k)}h${r1(-bw*2.24)}Z`,'#c9a877');
    }else if(style==='igloo'){
      const rx=Math.min(sw,hw*1.44),ry=dh*1.16;
      P(g,`M${r1(-rx)} 3Q${r1(-rx)} ${r1(-ry*.92)} 0 ${r1(-ry)}Q${r1(rx)} ${r1(-ry*.92)} ${r1(rx)} 3Z`,'#eef7f9',{stroke:'#9cc3d6','stroke-width':2.4,'stroke-linejoin':'round'});
      for(let q=1;q<5;q++){const yy=-ry*q/5,half=rx*Math.sqrt(1-(q/5.2)**2);S(g,`M${r1(-half)} ${r1(yy)}Q0 ${r1(yy-5*k)} ${r1(half)} ${r1(yy)}`,'#a9cddb',1.6,{opacity:.8});
        for(let j=-2;j<=2;j++){const x=half*(j+(q%2?.5:0))/2.6;S(g,`M${r1(x)} ${r1(yy-3*k)}v${r1(ry/5-2)}`,'#a9cddb',1.4,{opacity:.6});}}
      P(g,`M${r1(-rx*.62)} ${r1(-ry*.76)}Q0 ${r1(-ry*1.1)} ${r1(rx*.62)} ${r1(-ry*.76)}Q${r1(rx*.3)} ${r1(-ry*.86)} 0 ${r1(-ry*.8)}Q${r1(-rx*.3)} ${r1(-ry*.86)} ${r1(-rx*.62)} ${r1(-ry*.76)}Z`,'#ffffff');
      P(g,`M${r1(-rx*.84)} ${r1(-ry*.4)}Q${r1(-rx*.7)} ${r1(-ry*.8)} ${r1(-rx*.3)} ${r1(-ry*.92)}Q${r1(-rx*.62)} ${r1(-ry*.7)} ${r1(-rx*.84)} ${r1(-ry*.4)}Z`,'#fff',{opacity:.7});
    }else if(style==='cloud'){
      for(const [q,c] of [[3,'#f7b9c9'],[2,'#fbe0a0'],[1,'#bfe8d2'],[0,'#bcd0f6']]){const rx=hw*1.02+q*6.5*k;S(g,`M${r1(-rx)} 0V${r1(-dh+hw)}A${r1(rx)} ${r1(rx)} 0 0 1 ${r1(rx)} ${r1(-dh+hw)}V0`,c,6.5*k);}
      for(const [dx,dy,r] of [[-1.25,-.06,.42],[1.25,-.06,.42],[-.9,-.02,.34],[.92,-.02,.36],[-.7,-1.16,.36],[0,-1.25,.46],[.7,-1.16,.36]]){P(g,circ(hw*dx,dh*dy+4*k,hw*r),'#e3d6f0');P(g,circ(hw*dx,dh*dy,hw*r),'#fffdf8');}
    }else if(style==='dome'){
      const rx=Math.min(sw,hw*1.36),ry=dh*1.2;
      P(g,`M${r1(-rx)} 3Q${r1(-rx)} ${r1(-ry*.94)} 0 ${r1(-ry)}Q${r1(rx)} ${r1(-ry*.94)} ${r1(rx)} 3Z`,'#d9d6f2',{stroke:'#8f8bc4','stroke-width':2.4,'stroke-linejoin':'round'});
      P(g,`M${r1(-rx*.86)} ${r1(-ry*.36)}Q${r1(-rx*.72)} ${r1(-ry*.8)} ${r1(-rx*.3)} ${r1(-ry*.93)}Q${r1(-rx*.6)} ${r1(-ry*.7)} ${r1(-rx*.86)} ${r1(-ry*.36)}Z`,'#fff',{opacity:.6});
      S(g,`M${r1(-rx*.97)} ${r1(-ry*.2)}Q0 ${r1(-ry*.3)} ${r1(rx*.97)} ${r1(-ry*.2)}`,'#8f8bc4',2,{opacity:.6});
      for(let q=0;q<5;q++)E(g,-rx*.5+q*rx*.25,-dh*1.07-Math.sin(q/4*Math.PI)*6*k,4.6*k,4.6*k,'#ffe9a0',{stroke:'#8f8bc4','stroke-width':1.4});
      S(g,`M0 ${r1(-ry)}v${r1(-20*k)}`,'#8f8bc4',2.6);P(g,`M0 ${r1(-ry-31*k)}l${3*k} ${7*k} ${7.4*k} ${1*k}-${5.6*k} ${5*k} ${1.6*k} ${7.4*k}-${6.4*k}-${3.8*k}-${6.4*k} ${3.8*k} ${1.6*k}-${7.4*k}-${5.6*k}-${5*k} ${7.4*k}-${1*k}Z`,'#ffe9a0');
      for(const sx of [-1,1])E(g,sx*rx*1.02,2,10*k,3.4*k,'#7b76c4');
    }else if(style==='adobe'){
      const bw=Math.min(sw,hw*1.16),H=dh*1.13;
      P(g,`M${r1(-bw)} 2V${r1(-H*.84)}Q${r1(-bw)} ${r1(-H)} ${r1(-bw*.62)} ${r1(-H)}H${r1(bw*.62)}Q${r1(bw)} ${r1(-H)} ${r1(bw)} ${r1(-H*.84)}V2Z`,'#ecbf8f',{stroke:'#b98660','stroke-width':2.2,'stroke-linejoin':'round'});
      let z=`M${r1(-bw*.8)} ${r1(-H*.93)}`;for(let q=1;q<=8;q++)z+=`l${r1(bw*.2)} ${q%2?5*k:-5*k}`;S(g,z,'#cf7f5e',2.4);
      for(let q=0;q<3;q++)E(g,-bw*.5+q*bw*.5,-H*.86,3.4*k,3.4*k,'#8f6a4a');
      P(g,`M${r1(-bw*.9)} ${r1(-H*.3)}Q${r1(-bw*.8)} ${r1(-H*.8)} ${r1(-bw*.5)} ${r1(-H*.95)}Q${r1(-bw*.74)} ${r1(-H*.7)} ${r1(-bw*.9)} ${r1(-H*.3)}Z`,'#fff',{opacity:.3});
      const px=bw*1.06;P(g,`M${r1(px-8*k)} 3l${r1(2*k)} ${r1(-13*k)}h${r1(12*k)}l${r1(2*k)} ${r1(13*k)}Z`,'#cf7f5e');E(g,px,-22*k,6*k,13*k,'#6f9a66');E(g,px+7*k,-18*k,3.4*k,6*k,'#6f9a66');E(g,px,-36*k,2.6*k,2.6*k,'#f2a0a8');
    }else if(style==='mushroom'){
      const rx=Math.min(sw*1.04,hw*1.62),cy=-dh*.97,ry=dh*.45;
      P(g,`M${r1(-hw*1.14)} 3Q${r1(-hw*1.22)} ${r1(-dh*.6)} ${r1(-hw*.98)} ${r1(-dh)}H${r1(hw*.98)}Q${r1(hw*1.22)} ${r1(-dh*.6)} ${r1(hw*1.14)} 3Z`,W.cream??W.body);
      P(g,`M${r1(-rx)} ${r1(cy)}Q${r1(-rx*.98)} ${r1(cy-ry*1.02)} 0 ${r1(cy-ry*1.1)}Q${r1(rx*.98)} ${r1(cy-ry*1.02)} ${r1(rx)} ${r1(cy)}Q0 ${r1(cy+13*k)} ${r1(-rx)} ${r1(cy)}Z`,tone,{stroke:dark,'stroke-width':2.4,'stroke-linejoin':'round'});
      for(const [dx,dy,r] of [[-.56,-.42,.15],[.1,-.74,.17],[.6,-.36,.13],[-.14,-.3,.1],[.36,-.6,.08],[-.8,-.14,.08]])E(g,rx*dx,cy+ry*dy,rx*r,rx*r*.8,'#fffaf0');
      P(g,`M${r1(-rx*.9)} ${r1(cy-ry*.2)}Q${r1(-rx*.8)} ${r1(cy-ry*.8)} ${r1(-rx*.3)} ${r1(cy-ry*1)}Q${r1(-rx*.7)} ${r1(cy-ry*.7)} ${r1(-rx*.9)} ${r1(cy-ry*.2)}Z`,'#fff',{opacity:.35});
    }
  }
  function makeDoor(parent,x,y,dw,dh,i,k,sw){
    const g=el('g',{transform:`translate(${r1(x)} ${r1(y)})`},parent),[tone,dark]=TONES[i%4],hw=dw/2,ar=hw,body=dh-ar,stony=style==='stone';
    const arch=(w,h,pad=0)=>`M${-w} ${pad}V${-(h-w)}A${w} ${w} 0 0 1 ${w} ${-(h-w)}V${pad}Z`;
    E(g,0,3,Math.min(sw,hw*1.5),dh*.05,speck(shade,4),{opacity:.8});
    const glow=el('g',{opacity:0},g);
    E(glow,0,-dh*.55,dw*.95,dh*.75,'#fff3b8',{opacity:.5});E(glow,0,-dh*.55,dw*.7,dh*.6,'#fff9dc',{opacity:.6});
    house(g,dw,dh,k,i,sw);
    // door frame
    if(FRAME[style])el('path',{d:arch(hw,dh),fill:FRAME[style],stroke:shadeHex(FRAME[style],.72),'stroke-width':1.8,'stroke-linejoin':'round'},g);else P(g,arch(hw,dh),W.stone);
    const fr=hw*.82,frH=dh-hw*.18;
    if(stony||style==='igloo'||style==='adobe'){const edge=stony?W.stone.edge:shadeHex(FRAME[style],.7);
      for(let q=0;q<7;q++){const a=Math.PI*(q+.5)/7,x1=-Math.cos(a)*fr,y1=-body-Math.sin(a)*fr,x2=-Math.cos(a)*ar,y2=-body-Math.sin(a)*ar;S(g,`M${r1(x1)} ${r1(y1)}L${r1(x2)} ${r1(y2)}`,edge,1.6,{opacity:.4});}
      for(const sx of [-1,1])for(let q=1;q<4;q++)S(g,`M${sx*fr} ${r1(-body*q/4)}H${sx*hw}`,edge,1.6,{opacity:.4});}
    // what waits behind the door
    const inside=el('g',{},g);
    el('path',{d:arch(fr,frH),fill:'#fff1b0'},inside);
    el('path',{d:arch(fr*.72,frH*.86),fill:'#fffbe3'},inside);
    const rays=el('g',{opacity:0},inside);
    for(let q=0;q<5;q++){const a=-Math.PI*.5+(q-2)*.42;S(rays,`M0 ${r1(-frH*.5)}L${r1(Math.cos(a)*dw*1.1)} ${r1(-frH*.5+Math.sin(a)*dw*1.1)}`,'#fff6c9',dw*.09,{opacity:.55});}
    // the painted leaf: planks, iron bands, a heart window low down, knob
    const leaf=el('g',{},g);
    el('path',{d:arch(fr,frH),fill:tone,stroke:dark,'stroke-width':2.4,'stroke-linejoin':'round'},leaf);
    el('path',{d:arch(fr*.5,frH*.99),fill:'#fff',opacity:.1},leaf);
    for(let q=1;q<4;q++){const px=-fr+2*fr*q/4,top=-(frH-fr)-Math.sqrt(Math.max(0,fr*fr-px*px));S(leaf,`M${r1(px)} -2V${r1(top+3)}`,dark,1.8,{opacity:.5});}
    el('path',{d:arch(fr*.86,frH*.95,-4),fill:'none',stroke:'#fff','stroke-width':2,opacity:.25},leaf);
    for(const yy of [-dh*.1,-dh*.86]){P(leaf,`M${r1(-fr)} ${r1(yy-3.4*k)}H${r1(fr*.42)}l${r1(5*k)} ${r1(3.4*k)}l${r1(-5*k)} ${r1(3.4*k)}H${r1(-fr)}Z`,dark,{opacity:.75});for(const dx of [-.8,-.3,.2])E(leaf,fr*dx,yy,1.5*k,1.5*k,'#fff',{opacity:.5});}
    {const hx0=-fr*.1,hy0=-dh*.23,q=5.2*k;P(leaf,`M${r1(hx0)} ${r1(hy0+q*1.5)}C${r1(hx0-q*2.6)} ${r1(hy0-q*.4)} ${r1(hx0-q*1.2)} ${r1(hy0-q*1.9)} ${r1(hx0)} ${r1(hy0-q*.5)}C${r1(hx0+q*1.2)} ${r1(hy0-q*1.9)} ${r1(hx0+q*2.6)} ${r1(hy0-q*.4)} ${r1(hx0)} ${r1(hy0+q*1.5)}Z`,'#fff4c4',{stroke:dark,'stroke-width':1.6});}
    E(leaf,fr*.62,-dh*.25,dw*.055,dw*.055,'#f3d37c',{stroke:'#c79a3e','stroke-width':1.5});E(leaf,fr*.6,-dh*.262,dw*.02,dw*.02,'#fff',{opacity:.8});
    P(g,`M${r1(-hw*1.08)} 1Q0 ${r1(-5*k)} ${r1(hw*1.08)} 1Q0 ${r1(8*k)} ${r1(-hw*1.08)} 1Z`,stony?W.stone:FRAME[style]??W.stone.fill,{opacity:.95});
    if(stony){
      // ivy up one side and a star above the arch
      const vine=lush?W.leafB:W.leafA;S(g,`M${r1(-hw*1.02)} 0Q${r1(-hw*1.2)} ${r1(-dh*.5)} ${r1(-hw*.8)} ${r1(-dh*.86)}Q${r1(-hw*.4)} ${r1(-dh*1.04)} ${r1(hw*.1)} ${r1(-dh*1.02)}`,vine.hex,2.6);
      for(let q=0;q<9;q++){const t=q/8,u=1-t,vx=u*u*-hw*1.02+2*u*t*-hw*1.2+t*t*-hw*.8,vy=u*u*0+2*u*t*-dh*.5+t*t*-dh*.86;E(g,vx+(q%2?6:-5)*k,vy,5.4*k,3.4*k,vine,{transform:`rotate(${q%2?-35:35} ${r1(vx+(q%2?6:-5)*k)} ${r1(vy)})`});if(lush&&q%3===1)E(g,vx+7*k,vy-4*k,3*k,3*k,'#f6cfd6');}
    }
    return {g,leaf,glow,rays,x,y,dw,dh,fr,open:0,shake:0};
  }
  const tuft=(g,x,y,k,col)=>{let d='';for(const dx of [-7,-2,3,8]){const h=R(9,17)*k;d+=`M${r1(x+dx*k-2*k)} ${r1(y)}Q${r1(x+dx*k+R(-3,3))} ${r1(y-h)} ${r1(x+dx*k+R(-2,2)*k)} ${r1(y-h)}Q${r1(x+dx*k+1.5*k)} ${r1(y-h*.4)} ${r1(x+dx*k+2.6*k)} ${r1(y)}Z`;}P(g,d,col);};
  const bloom=(g,x,y,k,col)=>{S(g,`M${r1(x)} ${r1(y)}q${2*k} ${-8*k} 0 ${-15*k}`,'#4f6f3f',2.4*k);for(let i=0;i<5;i++){const a=i/5*6.283;E(g,x+Math.cos(a)*4.4*k,y-17*k+Math.sin(a)*4.4*k,3.9*k,3.4*k,col);}E(g,x,y-17*k,2.5*k,2.5*k,'#d99a3a');};
  const pebble=(g,x,y,k)=>{P(g,`M${r1(x-11*k)} ${r1(y)}Q${r1(x-12*k)} ${r1(y-10*k)} ${r1(x-2*k)} ${r1(y-12*k)}Q${r1(x+11*k)} ${r1(y-11*k)} ${r1(x+12*k)} ${r1(y)}Q${r1(x)} ${r1(y+4*k)} ${r1(x-11*k)} ${r1(y)}Z`,W.stone);S(g,`M${r1(x-6*k)} ${r1(y-8*k)}q${5*k} ${-3*k} ${10*k} 0`,'#fff',1.6,{opacity:.5});};
  const bush=(g,x,y,k)=>{const b=el('g',{},g);for(const [dx,dy,r,w] of [[-20,-14,20,W.leafA],[19,-13,19,W.leafA],[0,-25,25,W.leafB]])P(b,`M${r1(x+(dx-r)*k)} ${r1(y+dy*k)}a${r1(r*k)} ${r1(r*k*.9)} 0 1 1 ${r1(2*r*k)} 0a${r1(r*k)} ${r1(r*k*.9)} 0 1 1 ${r1(-2*r*k)} 0Z`,w);
    if(lush)for(let i=0;i<4;i++)E(b,x+R(-24,24)*k,y+R(-34,-10)*k,2.6*k,2.6*k,i%2?'#e59aa4':'#fbf3e4');return b;};
  const tree=(g,x,y,k,A=W.leafA,B=W.leafB)=>{P(g,`M${r1(x-5*k)} ${r1(y)}Q${r1(x-2*k)} ${r1(y-30*k)} ${r1(x-3*k)} ${r1(y-60*k)}h${r1(7*k)}Q${r1(x+3*k)} ${r1(y-30*k)} ${r1(x+6*k)} ${r1(y)}Z`,W.trunk);
    for(const [dx,dy,r,w] of [[-18,-66,24,A],[19,-68,25,A],[0,-92,30,B]])P(g,`M${r1(x+(dx-r)*k)} ${r1(y+dy*k)}a${r1(r*k)} ${r1(r*k*.92)} 0 1 1 ${r1(2*r*k)} 0a${r1(r*k)} ${r1(r*k*.92)} 0 1 1 ${r1(-2*r*k)} 0Z`,w);};

  /* ---------- composition ---------- */
  function measure(){
    const w=innerWidth,h=innerHeight,top=insets.top||h*.08,hud=Math.max(top,insets.hud||0),bottom=insets.bottom||h*.8;
    const tall=bottom-hud>=360||w<bottom-top;
    const n=Math.max(1,count);let dw,dh,xs,base,hx,hy,hs,area;
    let slot;
    if(tall){
      area=bottom-hud;slot=Math.min(250,(w-10)/n);dw=Math.min(230,slot-8,area*.36/(1+crown*.5))/spread;dh=dw*1.42;
      xs=Array.from({length:n},(_,i)=>w/2-slot*n/2+slot*(i+.5));
      base=hud+8+dh*(1+crown)+12;hs=clamp((bottom-base-26)/236,.34,1.5);if(base+hs*236+10>bottom)base=Math.max(hud+dh*.82,bottom-hs*236-10);
      hx=w/2;hy=bottom-8;
    }else{
      const low=Math.max(bottom,insets.low||0);area=bottom-top;hs=clamp((low-hud-8)/250,.34,1.2);hx=Math.max(70,Math.min(w*.2,hs*150));hy=low-6;
      const left=hx+hs*96,room=w-8-left;slot=room/n;dh=Math.min((area-16)/(1+crown),260);dw=Math.min(dh/1.42,(slot-10)/spread);dh=dw*1.42;
      xs=Array.from({length:n},(_,i)=>left+slot*(i+.5));base=Math.min(bottom-18,top+10+dh*(1+crown)+Math.max(0,(area-dh*(1+crown)-24)*.45));
    }
    const signW=Math.min(slot-8,dw*spread*1.02),signH=Math.min(dh*.42,dw*spread*.46);
    return {w,h,top,hud,bottom,tall,n,dw,dh,xs,base,hx,hy,hs,slot,signW,signH};
  }
  function build(keep=false){
    const was=keep&&hero?{clock,shown,look:hero.look,chosen}:null;
    svg.replaceChildren();doors=[];sparks=[];hero=duck=bubble=null;chosen=null;
    if(!count)return;
    const m=geom=measure(),{w,h,tall,n,dw,dh,xs,base,hx,hy,hs}=m,k0=dw/118;
    svg.setAttribute('viewBox',`0 0 ${w} ${h}`);root.style.background=sky();
    const horizon=base-dh*.34,far=el('g',{},svg),ground=el('g',{},svg),paths=el('g',{},svg),deco=el('g',{},svg);
    // distant hills
    const hill=(y0,amp,ph,wsh,g=far)=>{let d=`M-20 ${h+20}L-20 ${r1(y0)}`;for(let x=-20;x<=w+20;x+=20)d+=`L${x} ${r1(y0-amp*Math.sin(x/w*Math.PI*1.3+ph)-amp*.3*Math.sin(x/37+ph))}`;return P(g,d+`L${w+20} ${h+20}Z`,wsh);};
    
    // sky: clouds by day, stars and a ringed planet on the moon, a rainbow in the dreamy worlds
    const roof=base-dh*(1+crown),night=habitat==='moon',dreamy=habitat==='clouds'||habitat==='fairy';
    if(night||dreamy)for(let i=0;i<(night?34:12);i++){const x=R(0,w),y=R(0,roof+dh*.3),q=R(1.2,3);P(far,`M${r1(x)} ${r1(y-q*2)}l${r1(q*.6)} ${r1(q*1.4)} ${r1(q*1.4)} ${r1(q*.6)}-${r1(q*1.4)} ${r1(q*.6)}-${r1(q*.6)} ${r1(q*1.4)}-${r1(q*.6)}-${r1(q*1.4)}-${r1(q*1.4)}-${r1(q*.6)} ${r1(q*1.4)}-${r1(q*.6)}Z`,night?'#fff3c4':'#fffdf0',{opacity:R(.5,1).toFixed(2)});}
    if(night){const px=w*.8,py=Math.max(m.top+34,roof-dh*.5),q=dw*.2;E(far,px,py,q,q,'#f2c9a0');E(far,px-q*.3,py-q*.3,q*.5,q*.34,'#f9dcbd');S(far,`M${r1(px-q*1.7)} ${r1(py+q*.3)}Q${r1(px)} ${r1(py+q*.9)} ${r1(px+q*1.7)} ${r1(py-q*.4)}`,'#d9c2f0',3.4);}
    if(dreamy)for(const [q,c] of [[0,'#f7b9c9'],[1,'#fbe0a0'],[2,'#bfe8d2'],[3,'#bcd0f6']]){const rr=w*.62-q*dw*.07;S(far,`M${r1(w/2-rr)} ${r1(horizon)}A${r1(rr)} ${r1(rr*.95)} 0 0 1 ${r1(w/2+rr)} ${r1(horizon)}`,c,dw*.07,{opacity:.85});}
    if(!night)for(let i=0;i<4;i++){const x=w*(i+.3)/4+R(-30,30),y=Math.max(18,roof-dh*R(.2,.9)),q=dw/118*R(.5,.85),c=el('g',{transform:`translate(${r1(x)} ${r1(y)}) scale(${q.toFixed(2)})`},far);
      for(const [cx,cy,r] of [[-30,0,24],[4,-16,32],[44,-8,27],[80,2,20],[24,2,30]])E(c,cx,cy,r,r,W.cloud);P(c,'M-56 6Q-56-8-30-6H84Q104-6 102 8Q80 20 24 20Q-36 20-56 6Z',W.cloud.fill);P(c,'M-52 6Q24 22 100 6Q78 21 24 21Q-32 21-52 6Z',speck(shadeHex(W.cloud.hex,.84),4,.7));}
    // a far ridge high enough to show above the roofs, then tall trees standing between the houses
    hill(roof+dh*.06,dh*.2,.6,W.mountB);
    {let d='';for(let x=-20;x<=w+20;x+=20)d+=`${x<0?'M':'L'}${x} ${r1(roof+dh*.06-dh*.2*Math.sin(x/w*Math.PI*1.3+.6)-dh*.06*Math.sin(x/37+.6)+dh*.09)}`;S(far,d,speck(shadeHex(W.mountB.hex,.86),3),dh*.1,{'stroke-linecap':'butt'});}
    if(habitat==='ice'||habitat==='prehistoric'||habitat==='desert')for(const [fx,q] of [[.18,1],[.62,.8],[.9,1.1]]){const x=w*fx,y=roof+dh*.2,pw=dh*.5*q,ph=dh*.62*q,volcano=habitat==='prehistoric'&&fx>.5&&fx<.8,mesa=habitat==='desert';
      P(far,mesa?`M${r1(x-pw)} ${r1(y)}L${r1(x-pw*.7)} ${r1(y-ph*.6)}H${r1(x+pw*.7)}L${r1(x+pw)} ${r1(y)}Z`:`M${r1(x-pw)} ${r1(y)}L${r1(x-pw*.12)} ${r1(y-ph)}${volcano?`H${r1(x+pw*.12)}`:''}L${r1(x+pw)} ${r1(y)}Z`,W.mountA??W.mountB);
      if(habitat==='ice')P(far,`M${r1(x-pw*.42)} ${r1(y-ph*.62)}L${r1(x-pw*.12)} ${r1(y-ph)}L${r1(x+pw*.34)} ${r1(y-ph*.62)}l${r1(-pw*.16)} ${r1(ph*.1)}l${r1(-pw*.14)}-${r1(ph*.08)}l${r1(-pw*.14)} ${r1(ph*.1)}l${r1(-pw*.14)}-${r1(ph*.08)}Z`,'#ffffff');
      if(volcano){P(far,`M${r1(x-pw*.12)} ${r1(y-ph)}h${r1(pw*.24)}l${r1(pw*.06)} ${r1(ph*.16)}q${r1(-pw*.18)} ${r1(ph*.08)} ${r1(-pw*.36)} 0Z`,'#e9905e');for(const [dx,dy,r] of [[0,-.14,.1],[.1,-.3,.14],[-.04,-.5,.18]])E(far,x+pw*dx,y-ph+ph*dy,pw*r,pw*r*.8,'#f3ead8',{opacity:.8});}}
    hill(horizon-dh*.02,dh*.13,2.4,W.mid);
    const gaps=[xs[0]-m.slot/2,...xs.slice(1).map((x,i)=>(x+xs[i])/2),xs[n-1]+m.slot/2],tallK=dh*(1.3+crown);
    for(const [i,x] of gaps.entries()){const y=horizon+dh*.02+R(-4,6),kind=['forest','ice'].includes(habitat)?'pine':['jungle','beach','prehistoric'].includes(habitat)?'palm':['meadow','fairy'].includes(habitat)?'tree':null;
      if(kind==='pine'){const q=tallK/74*R(.85,1.1);P(far,`M${r1(x-3*q)} ${r1(y)}v${r1(-14*q)}h${r1(6*q)}v${r1(14*q)}Z`,W.trunk.fill);
        for(const [yy,wd] of [[-10,23],[-29,18],[-46,12]]){P(far,`M${r1(x-wd*q)} ${r1(y+yy*q)}L${r1(x)} ${r1(y+(yy-27)*q)}L${r1(x+wd*q)} ${r1(y+yy*q)}Q${r1(x)} ${r1(y+(yy+5)*q)} ${r1(x-wd*q)} ${r1(y+yy*q)}Z`,W.pine);
          if(habitat==='ice')P(far,`M${r1(x-wd*.5*q)} ${r1(y+(yy-13)*q)}L${r1(x)} ${r1(y+(yy-27)*q)}L${r1(x+wd*.5*q)} ${r1(y+(yy-13)*q)}Q${r1(x)} ${r1(y+(yy-8)*q)} ${r1(x-wd*.5*q)} ${r1(y+(yy-13)*q)}Z`,'#ffffff');}}
      else if(kind==='palm'){const q=tallK/84*R(.9,1.1),tx=x-2*q,ty=y-66*q,lean=i%2?1:-1;S(far,`M${r1(x)} ${r1(y)}q${r1(8*q*lean)} ${r1(-34*q)} ${r1(-2*q)} ${r1(-66*q)}`,W.trunk.hex,7*q);
        for(const a of [-160,-125,-90,-55,-20,15,195]){const rad=a*Math.PI/180,ex=tx+Math.cos(rad)*40*q,ey=ty+Math.sin(rad)*22*q+10*q;P(far,`M${r1(tx)} ${r1(ty)}Q${r1((tx+ex)/2)} ${r1(ty+Math.sin(rad)*30*q-14*q)} ${r1(ex)} ${r1(ey)}Q${r1((tx+ex)/2)} ${r1(ty+Math.sin(rad)*16*q)} ${r1(tx)} ${r1(ty)}Z`,a%2?W.leafA:W.leafB);}
        for(const dx of [-4,4])E(far,tx+dx*q,ty+5*q,3.6*q,3.6*q,'#b98b58');}
      else if(kind==='tree'&&style!=='tree')tree(far,x,y,tallK/122*R(.78,.95),...(i%2?[W.blossom,W.blossomL]:[W.leafA,W.leafB]));
      else if(habitat==='desert'){const q=tallK/90;P(far,`M${r1(x-6*q)} ${r1(y)}V${r1(y-54*q)}a${r1(6*q)} ${r1(6*q)} 0 0 1 ${r1(12*q)} 0V${r1(y)}Z`,'#6f9a66');for(const sx of [-1,1])S(far,`M${r1(x+sx*5*q)} ${r1(y-(sx<0?26:34)*q)}h${r1(sx*11*q)}v${r1(-13*q)}`,'#6f9a66',7*q);}
      else if(habitat==='clouds')for(const [dx,dy,r] of [[-14,0,20],[12,-8,24],[0,-26,18]]){E(far,x+dx*k0,y+dy*k0+3,r*k0,r*k0*.85,'#e3d6f0');E(far,x+dx*k0,y+dy*k0,r*k0,r*k0*.85,'#fffdf8');}
    }
    hill(horizon+dh*.06,dh*.06,4.1,W.near);
    {let d='';for(let x=-20;x<=w+20;x+=20)d+=`${x<0?'M':'L'}${x} ${r1(horizon+dh*.06-dh*.06*Math.sin(x/w*Math.PI*1.3+4.1)-dh*.018*Math.sin(x/37+4.1)+dh*.05)}`;S(far,d,speck(shadeHex(W.near.hex,.86),2),dh*.07,{'stroke-linecap':'butt'});}
    // ground and the forking path
    {let d=`M-20 ${h+20}L-20 ${r1(horizon+dh*.2)}`;for(let x=-20;x<=w+20;x+=20)d+=`L${x} ${r1(horizon+dh*.2-6*Math.sin(x/61)-5*Math.sin(x/23+1))}`;P(ground,d+`L${w+20} ${h+20}Z`,W.meadow);}
    const footW=tall?Math.min(w*.6,hs*210):hs*190,fy=h+30,jx=tall?hx:hx+hs*30,jy=hy-hs*(tall?70:40);
    // each branch is a ribbon along a curve from the junction under Paillette to its door
    const branch=(x,pad)=>{const tw=dw*.36+pad,bw=tw*1.08+pad,y1=base-2,L=[],Rr=[];
      const c1x=tall?jx:jx+(x-jx)*.62,c1y=tall?jy-(jy-y1)*.55:jy+hs*6,c2x=x,c2y=y1+(jy-y1)*(tall?.45:.75);
      for(let q=0;q<=14;q++){const t=q/14,u=1-t;
        const px=u*u*u*jx+3*u*u*t*c1x+3*u*t*t*c2x+t*t*t*x,py=u*u*u*jy+3*u*u*t*c1y+3*u*t*t*c2y+t*t*t*y1;
        const dx=3*u*u*(c1x-jx)+6*u*t*(c2x-c1x)+3*t*t*(x-c2x),dy=3*u*u*(c1y-jy)+6*u*t*(c2y-c1y)+3*t*t*(y1-c2y),len=Math.hypot(dx,dy)||1,hw=bw+(tw-bw)*ease(t);
        L.push([px+dy/len*hw,py-dx/len*hw]);Rr.unshift([px-dy/len*hw,py+dx/len*hw]);}
      return 'M'+[...L,...Rr].map(q=>r1(q[0])+' '+r1(q[1])).join('L')+'Z';};
    const trunk=pad=>{if(!tall){const rx=hs*150+pad,ry=hs*40+pad,cx=jx-hs*40,cy=hy-hs*8;return `M${r1(cx-rx)} ${r1(cy)}a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(2*rx)} 0a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(-2*rx)} 0Z`;}const a=Math.max(dw*.4,footW*.34)+pad,b2=footW*.62+pad*2;return `M${r1(jx-a)} ${r1(jy-hs*30)}Q${r1(jx-a*1.02)} ${r1((jy+fy)/2)} ${r1(jx-b2)} ${r1(fy)}H${r1(jx+b2)}Q${r1(jx+a*1.02)} ${r1((jy+fy)/2)} ${r1(jx+a)} ${r1(jy-hs*30)}Q${r1(jx)} ${r1(jy-hs*74)} ${r1(jx-a)} ${r1(jy-hs*30)}Z`;};
    P(paths,trunk(7),W.pathEdge.fill,{opacity:.8});
    for(const x of xs)P(paths,branch(x,7),W.pathEdge.fill,{opacity:.8});
    for(const x of xs)P(paths,branch(x,0),W.path.fill);
    P(paths,trunk(0),W.path.fill);
    for(let i=0;i<26;i++){const x=xs[i%n]+R(-dw*.3,dw*.3),t=R(0,1),px=x+(hx-x)*t,py=base+(hy-base)*t+R(-4,4);E(paths,px,py,R(2,5),R(1,2),W.pathEdge.fill,{opacity:.6});}
    // a guest from this world comes to watch
    for(const g0 of guests)g0.hide();guest=guests.length?guests[shows%guests.length]:null;
    // little things on the grass between the branches and along the sides
    const free=(x,y)=>{if(!tall)return y<base+dh*.3&&y>base+6&&xs.every(dx=>Math.abs(x-dx)>dw*.45)&&x>hx+hs*90;if(y>jy-hs*40)return Math.abs(x-jx)>footW*.66+18;const t=clamp((y-base)/(jy-base)),e=ease(t);return xs.every(dx=>Math.abs(x-(dx+(jx-dx)*e))>dw*.4+12);};
    const cols=[W.leafA.hex,W.meadowD.hex,W.leafC.hex];
    for(let i=0;i<130;i++){const x=R(0,w),y=R(horizon+dh*.3,Math.min(h,m.bottom+30));if(!free(x,y))continue;const k=.7+clamp((y-horizon)/(h-horizon))*.9;
      const q=i%7;if(q<4)tuft(deco,x,y,k,cols[i%3]);else if(q<6&&lush)bloom(deco,x,y,k*.9,['#fbf3e4','#e59aa4','#e0ad4c','#f2c4bd'][i%4]);else pebble(deco,x,y,k*.8);}
    // doors with bushes at their sides, drawn far to near
    const dg=el('g',{},svg),order=xs.map((x,i)=>({x,i,y:base-(tall&&n>2&&i>0&&i<n-1?dh*.05:0)}));
    for(const o of order){const k=dw/118;
      if(style==='stone'){bush(dg,o.x-dw*.6,o.y+3,k*.85);bush(dg,o.x+dw*.62,o.y+5,k*.7);}
      doors[o.i]=makeDoor(dg,o.x,o.y,dw,dh,o.i,k,m.slot/2+3);
      tuft(dg,o.x-dw*.46,o.y+5,k,cols[0]);tuft(dg,o.x+dw*.44,o.y+6,k,cols[1]);if(lush)bloom(dg,o.x+dw*.55,o.y+7,k,'#fbf3e4');}
    // the two friends
    const live=el('g',{},svg);
    duck=makeDuck(live);duck.x=hx+(tall?hs*104:-hs*96);duck.y=hy-hs*4;duck.s=hs*.92;
    hero=makeHero(live);hero.x=hx;hero.y=hy;hero.s=hs;hero.walk=0;hero.cheer=0;hero.no=0;
    // her question
    bubble=el('g',{},live);
    for(const [dx,dy,r] of [[0,0,5],[9,-13,8]])E(bubble,dx,dy,r,r,'#fffaf0',{stroke:'#d9c9b0','stroke-width':1.5});
    E(bubble,34,-46,30,27,'#fffaf0',{stroke:'#d9c9b0','stroke-width':2});
    const q=el('text',{x:34,y:-34,'text-anchor':'middle','font-size':38,'font-weight':800,fill:'#b9506b','font-family':'ui-rounded,"SF Pro Rounded",Nunito,system-ui,sans-serif'},bubble);q.textContent='?';
    const fx=el('g',{},svg);
    if(guest){guest.gx=tall?Math.max(44,hx-hs*150):hx+hs*124;guest.gy=tall?hy-hs*84:hy-hs*34;guest.gs=hs*(guest.small?1.3:1);}
    root.sparks=fx;clock=was?.clock??0;shown=was?.shown??0;if(was){hero.look=was.look;chosen=was.chosen&&doors[was.chosen.i]?was.chosen:null;}pose(0);
  }
  function burst(x,y,n){for(let i=0;i<n;i++){const a=R(-Math.PI,0),sp=R(50,190)*geom.hs;
    sparks.push({n:E(root.sparks,x,y,R(2.5,5),R(2.5,5),['#e0ad4c','#fbf3e4','#e59aa4','#6fbfb8'][i%4]),x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-30,life:R(.6,1.2),t:0});}}
  function pose(dt){
    if(!hero)return;const T=clock,h=hero,m=geom;
    shown=Math.min(1,shown+dt*3);
    // travelling to the chosen door
    let x=h.x,y=h.y,s=h.s,walk=0;
    if(chosen?.ok){chosen.t+=dt;const d=doors[chosen.i],k=reduced?0:ease(clamp((chosen.t-.28)/.75));
      x=h.x+(d.x-h.x)*k*.86;y=h.y+(d.y+8-h.y)*k*.86;s=h.s*(1-.52*k);walk=k>0&&k<1?1:0;
      d.open=reduced?1:ease(clamp((chosen.t-.12)/.5));}
    for(const d of doors){
      if(d.shake>0){d.shake=Math.max(0,d.shake-dt*2.2);}
      const sx=1-d.open*.86,wob=Math.sin(d.shake*Math.PI*5)*4*d.shake;
      d.leaf.setAttribute('transform',`translate(${r1(-d.fr*d.open*.86+wob)} 0) scale(${sx.toFixed(3)} 1)`);
      d.glow.setAttribute('opacity',(d.open*.9).toFixed(2));d.rays.setAttribute('opacity',d.open.toFixed(2));
    }
    const step=Math.sin(T*13),hop=walk?Math.abs(step)*9:0,jump=h.cheer>0?Math.sin(clamp(1-h.cheer)*Math.PI)*34:0;
    h.cheer=Math.max(0,h.cheer-dt/.5);h.no=Math.max(0,h.no-dt/.7);
    h.g.setAttribute('transform',`translate(${r1(x)} ${r1(y)}) scale(${s.toFixed(3)})`);
    h.b.setAttribute('transform',`translate(0 ${r1(-hop-jump+(reduced?0:Math.sin(T*1.6)*1.4))})`);
    h.sh.setAttribute('opacity',(.28*(1-jump/80)).toFixed(2));
    h.legs.forEach((L,i)=>L.l.setAttribute('transform',`translate(0 ${r1(walk?(i%2?1:-1)*step*-7:0)})`));
    h.tail.setAttribute('transform',`rotate(${r1(reduced?0:Math.sin(T*2.1)*9+(walk?step*10:0))} 0 -110)`);
    // she looks from door to door, then tilts her head: a real question
    const target=chosen?(chosen.ok?(doors[chosen.i].x-h.x)/Math.max(60,m.w*.3):0):reduced?0:clamp((m.tall?0:.55)+1.5*Math.sin(T*.85),-1,1);
    h.look+=(clamp(target,-1,1)-h.look)*Math.min(1,dt*6+(dt?0:1));
    const shakeNo=h.no>0?Math.sin(h.no*Math.PI*4)*.8:0,look=clamp(h.look+shakeNo,-1,1);
    h.head.setAttribute('transform',`translate(${r1(look*5)} ${r1(walk?-Math.abs(step)*2:0)}) rotate(${r1(look*7)} 0 -150)`);
    h.snout.setAttribute('transform',`translate(${r1(look*33)} 0)`);
    h.horn.setAttribute('transform',`translate(${r1(look*9)} 0) rotate(${r1(look*8)} 0 -196)`);
    h.mane.setAttribute('transform',`translate(${r1(-look*9)} 0)`);
    h.face.setAttribute('transform',`translate(${r1(look*27)} 0)`);h.face.setAttribute('opacity',clamp((Math.abs(look)-.45)*3).toFixed(2));
    h.blink-=dt;const bl=h.blink<0&&h.blink>-.13;if(h.blink<-.13)h.blink=R(2.2,4.6);h.eye.setAttribute('ry',bl?1.1:7.4);
    h.flick-=dt;const fl=h.flick<0?Math.sin(Math.min(1,-h.flick/.35)*Math.PI)*14:0;if(h.flick<-.35)h.flick=R(2.5,6);
    h.ears.forEach((e,i)=>e.setAttribute('transform',`rotate(${r1((i?1:-1)*(fl*(i?1:.4)+look*6*(i?-1:1))+(h.no>0?(i?1:-1)*16:0))} ${i?24:-24} -196)`));
    // thought bubble pops in, bobs, and goes once she has decided
    const bs=chosen?Math.max(0,1-chosen.t*5):ease(clamp(shown*1.4-.3));
    bubble.setAttribute('transform',`translate(${r1(x+34*s)} ${r1(y-228*s+(reduced?0:Math.sin(T*2.2)*3))}) scale(${(bs*Math.max(.8,s)).toFixed(3)})`);
    // duckling looks up at her and bounces along
    const dk=duck,dj=dk.hop>=0?Math.sin(Math.PI*dk.hop)*26:0;if(dk.hop>=0){dk.hop+=dt/.45;if(dk.hop>=1)dk.hop=-1;}
    const side=dk.x<h.x?1:-1;
    dk.g.setAttribute('transform',`translate(${r1(dk.x+(x-h.x)*.8)} ${r1(dk.y+(y-h.y)*.8)}) scale(${(side*dk.s*(s/h.s)).toFixed(3)} ${(dk.s*(s/h.s)).toFixed(3)})`);
    dk.b.setAttribute('transform',`translate(0 ${r1(-dj-(walk?Math.abs(Math.cos(T*13))*6:0))})`);
    dk.head.setAttribute('transform',`rotate(${r1(-8+(reduced?0:Math.sin(T*1.3)*5))} 0 -46)`);
    if(guest)guest.place(guest.gx,guest.gy,guest.gs,guest.gx<x?1:-1,T,chosen?.ok&&!reduced?Math.sin(clamp(chosen.t/.6)*Math.PI):0);
    for(let i=sparks.length-1;i>=0;i--){const p=sparks[i];p.t+=dt;p.vy+=240*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;const k=1-p.t/p.life;
      if(k<=0){p.n.remove();sparks.splice(i,1);continue;}p.n.setAttribute('cx',r1(p.x));p.n.setAttribute('cy',r1(p.y));p.n.setAttribute('opacity',k.toFixed(2));}
  }
  return {
    get visible(){return visible;},life,
    setInsets(next){const same=next.top===insets.top&&next.hud===insets.hud&&next.bottom===insets.bottom&&next.low===insets.low;insets={...next};if(!same&&visible&&!chosen)build(true);},
    setGuests(list){guests=list;},
    /** `instant` skips the fade, for a scene that opens straight onto a question (world change). */
    show(n,instant=false){
      if(visible&&n===count&&!chosen)return;
      count=n;visible=n>0;shows++;build();
      root.classList.toggle('instant',instant);root.classList.toggle('on',visible);
      if(instant)window.requestAnimationFrame(()=>root.classList.remove('instant'));
    },
    hide(){if(!visible)return;visible=false;root.classList.remove('on');},
    resize(){if(visible)build(true);},
    /** Screen rectangles (CSS px) of the answer signs, in door order. */
    layout(){if(!visible||!geom)return [];const {dh,signW,signH}=geom;return doors.map(d=>({x:d.x-signW/2,y:d.y-dh*1.13,width:signW,height:signH,reach:Math.max(0,dh*1.13-signH)}));},
    choose(i,ok){if(!visible||!doors[i])return;
      if(ok){chosen={i,ok:true,t:0};hero.cheer=reduced?0:1;duck.hop=reduced?-1:0;if(!reduced)burst(doors[i].x,doors[i].y-geom.dh*.6,22);}
      else{doors[i].shake=reduced?0:1;hero.no=reduced?0:1;}},
    update(dt){if(!visible)return;clock+=reduced?0:dt;pose(dt);},
    state(){return {visible,doors:visible?count:0,decided:!!chosen,tall:!!geom?.tall,hero:hero&&geom?{x:hero.x,y:hero.y,scale:hero.s}:null};},
    destroy(){root.remove();}
  };
}
