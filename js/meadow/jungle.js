/** Tropical valley artwork using the shared painted shapes and bitmap layers. */
export const JUNGLE_PALETTE={
  sea:'#6bb9b0',isle:'#87b6a0',mountA:'#a3cfc1',mountB:'#7aad9e',mid:'#699f7c',near:'#518267',
  meadow:'#6b965d',meadowD:'#477957',fg:'#2f5a48',fg2:'#447c58',path:'#ead0a2',pathEdge:'#bd9e6a',
  trunk:'#937457',leafA:'#386f55',leafB:'#579555',leafC:'#92b767',pine:'#417d66',blossom:'#e2a074',blossomL:'#edbe88',
  ochreLeaf:'#b0bc60',ochreL:'#d0ca7c',stone:'#c9c6ae',roof:'#ce946e',roofT:'#56a69a'
};
export function paintJungle({el,wa,W,blob,R,ridge,groundY,pathWidth,midY,nearY,layers,widths,S}){
  const {valley,mid,near,grove,ground}=layers,{mid:mw,near:nw,ground:gw}=widths;
  // The lagoon is sheltered by stepped cliffs, with waterfalls visible through the canopy.
  valley.replaceChildren();
  el('rect',{x:-200,y:330,width:3600,height:900,fill:W.sea.fill},valley);
  for(let x=520;x<3300;x+=920){
    const top=115+R(-20,30),g=el('g',{transform:`translate(${x} ${top}) scale(1)`},valley);
    el('path',{d:'M-180 300L-160 80Q-130 30-80 52L-48 0Q30-20 70 25L155 64L190 310Z',...wa(W.stone,2,.22)},g);
    for(let k=0;k<5;k++)el('path',{d:`M${-150+k*12} ${75+k*45}q140 -18 ${300-k*12} 10`,fill:'none',stroke:'#648b78','stroke-width':8,opacity:.26},g);
    el('path',{d:'M-160 78Q-100 26-48 0Q30-20 70 25L155 64Q50 38-30 58T-160 78Z',fill:W.leafB.fill},g);
    el('path',{d:'M-25 50Q-30 155-45 294Q0 314 47 294Q21 170 25 48Z',fill:'#bce5d5'},g);
    const flow=el('g',{class:'still waterfall','data-b':'-48,50,48,314'},g);
    for(const [dx,w] of [[-19,5],[0,9],[17,4]])el('path',{d:`M${dx} 64Q${dx-4} 150 ${dx+5} 208T${dx+8} 288`,fill:'none',stroke:'#f3f6de','stroke-width':w,opacity:.7,'stroke-linecap':'round'},flow);
    for(let k=0;k<6;k++)el('ellipse',{cx:-65+k*26,cy:306+R(-5,5),rx:27,ry:R(9,15),fill:'#e3f1d8',opacity:.7},g);
    el('ellipse',{cx:0,cy:330,rx:113,ry:9,fill:'none',stroke:'#d2ecce','stroke-width':3,opacity:.65},g);
  }
  function palm(parent,x,y,s){
    const holder=el('g',{transform:`translate(${x} ${y}) scale(${s})`},parent);
    const trunk=el('g',{class:'still','data-b':'-22,-265,58,12'},holder);
    el('path',{d:'M-12 0Q20-115 6-250L22-254Q48-110 14 0Z',...wa(W.trunk,2,.2)},trunk);
    for(let k=1;k<9;k++)el('path',{d:`M${4+k*.8} ${-k*27}l20 -5`,stroke:'#c3a57a','stroke-width':3,opacity:.5},trunk);
    const crown=el('g',{class:'sway','data-b':'-170,-330,190,-70'},holder);
    for(const [dx,dy] of [[-155,70],[-150,-15],[-100,-65],[0,-70],[115,-65],[165,-5],[165,75]]){
      el('path',{d:`M15-252Q${15+dx*.6} ${-292+dy*.3} ${15+dx} ${-252+dy}Q${15+dx*.5} ${-226+dy*.7} 15-252Z`,...wa(dx<0?W.leafA:W.leafB,1.5,.18)},crown);
      el('path',{d:`M15-252Q${15+dx*.55} ${-265+dy*.5} ${15+dx} ${-252+dy}`,stroke:W.leafC.hex,'stroke-width':2,fill:'none',opacity:.65},crown);
    }
    el('path',{d:'M-75-265Q-105-80-50-116Q-20-154-46-202',fill:'none',stroke:W.leafA.hex,'stroke-width':3,opacity:.75},crown);
    for(const dx of [1,15,27])el('circle',{cx:dx,cy:-242,r:8,fill:'#bd9959'},crown);
  }
  // Replace temperate hills with broad tropical foliage and palms at different depths.
  mid.replaceChildren();near.replaceChildren();grove.replaceChildren();
  for(const [g,w,yf,scale] of [[mid,mw,midY,.55],[near,nw,nearY,.9]]){
    el('path',{d:ridge(w,yf),...wa(g===mid?W.mid:W.near)},g);S.shadeRidge(g,w,yf,(g===mid?W.mid:W.near).hex);
    for(let x=60;x<w;x+=R(470,700))palm(g,x,yf(x)+22,scale*R(.8,1.2));
  }
  for(let x=180;x<gw*.8;x+=R(670,1050))palm(grove,x,330+R(-25,25),R(1.45,1.85));
  function leaves(g,x,y,s){
    const p=el('g',{transform:`translate(${x} ${y}) scale(${s})`},g);
    for(const [dx,dy] of [[-45,-45],[-30,-84],[24,-95],[52,-55]]){
      el('path',{d:`M0 0Q${dx*1.8} ${dy*.45} ${dx} ${dy}Q${dx*.05} ${dy*.9} 0 0Z`,...wa(dx<0?W.leafB:W.leafC,1.6,.16)},p);
      el('path',{d:`M0 0L${dx} ${dy}`,fill:'none',stroke:W.leafA.hex,'stroke-width':2,opacity:.65},p);
    }
  }
  for(let x=50;x<gw;x+=R(210,320)){
    const y=groundY(x)-pathWidth(x)*.72-12;
    leaves(ground,x,y,R(.6,.95));
    if(Math.floor(x)%2)S.boulder(ground,x+95,y+8,.9,S.tint('#c9c6ae'),'#6fa35c');
    const g=el('g',{transform:`translate(${x+50} ${y+2})`},ground);
    for(let k=0;k<3;k++)el('path',{d:`M0 0Q${k*6-10} -38 ${k*7-14} -60`,stroke:W.leafA.hex,'stroke-width':3,fill:'none'},g);
    for(const [dx,dy] of [[-14,-60],[-7,-50],[0,-40]])el('path',{d:`M${dx} ${dy}q28 -15 24 6q-19 10-24-6Z`,fill:kColor(dx)},g);
  }
  function kColor(x){return x<-10?'#e89b72':x<0?'#edbd72':'#dc8265';}
}
