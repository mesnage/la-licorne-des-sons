/**
 * Shared scenery brushes for every painted world: ground texture (tufts, flower drifts, pebbles,
 * ripples), depth haze and reusable props. Everything is drawn once and baked by the renderer.
 * Detail is grouped in translated chunks so tile baking can skip chunks outside a tile.
 */
export const GROUND_DETAIL={
  meadow:{shade:'#3f6a3c',tufts:['#4f7a3f','#8fb262','#3f6a3c'],blooms:[['#fbf3e4','#e9c56a'],['#e59aa4','#f8dcd6'],['#e7b655','#f6e2a0'],['#b9a7d8','#ece4f6']],haze:'#e4eec0',density:1},
  forest:{shade:'#2f4a38',tufts:['#39593c','#7f9a5a','#2f4a38'],blooms:[['#9fb0de','#e4e8f8'],['#f1e6c4','#d9a441']],litter:['#c9a35a','#b77862','#d8bd7a'],haze:'#cfdcb0',density:.9},
  jungle:{shade:'#255a44',tufts:['#2f6a48','#8fc06a','#255a44'],blooms:[['#e88b6a','#f6d08a'],['#f2c35e','#fff0c0'],['#e0708a','#f9d4dc']],haze:'#d2e8b4',density:1},
  beach:{shade:'#c2a56c',tufts:['#a99d62','#8f9a62'],pebbles:['#f0b9a8','#fff3dc','#d9b98f','#c5d5d0'],ripples:'#fff4d6',haze:'#fff3d2',density:.3},
  ice:{shade:'#9fc3d6',pebbles:['#ffffff','#cfe6ee','#b3d5e2'],ripples:'#b7d6e2',sparkle:'#ffffff',haze:'#ffffff',density:.5},
  clouds:{shade:'#9fb6ee',puffs:['#ffffff','#fff6ea','#fde6ee'],sparkle:'#f6c66a',haze:'#ffffff',density:.6},
  moon:{shade:'#5a54a8',pebbles:['#e6e0fb','#6a63bc','#c6c0f0'],ripples:'#c6c0f0',sparkle:'#8fe0d2',haze:'#c6c0f0',density:.5},
  prehistoric:{shade:'#4b6f3c',tufts:['#4b6f3c','#9db26a','#3c5d3a'],blooms:[['#f1d98c','#c98a4e'],['#e8a37a','#f8dcc0']],haze:'#dfe2ac',density:.9},
  desert:{shade:'#bd8a60',tufts:['#b0935a','#8e9a5a'],pebbles:['#b5835f','#f0d5a8','#c9966e'],ripples:'#f8dfb4',haze:'#fbe6bd',density:.3},
  fairy:{shade:'#6f9a80',tufts:['#6f9a72','#b9d6a0','#5c8a6a'],blooms:[['#f3b6cf','#fff3dc'],['#fff3dc','#f0cf8f'],['#c8b6ec','#f2ecfb'],['#f6dc8f','#fff8dc']],sparkle:'#fff3c4',haze:'#f3e6ee',density:1.15}
};
export function createScenery({el,wa,W,blob,R,rnd,pick,smooth,f1,sway,wash,speck,dash,shadeHex,kind='meadow'}){
  const shade=(GROUND_DETAIL[kind]??GROUND_DETAIL.meadow).shade;
  const tints=new Map(),tint=hex=>{if(!tints.has(hex))tints.set(hex,wash(hex));return tints.get(hex);};
  const group=(parent,x,y,s=1)=>el('g',{transform:`translate(${f1(x)} ${f1(y)}) scale(${f1(s*10)/10})`},parent);
  const path=(g,d,fill,extra={})=>el('path',{d,fill,...extra},g);
  const stroke=(g,d,color,width,extra={})=>el('path',{d,fill:'none',stroke:color,'stroke-width':width,'stroke-linecap':'round','stroke-linejoin':'round',...extra},g);
  const ellipse=(g,x,y,rx,ry,fill,extra={})=>el('ellipse',{cx:f1(x),cy:f1(y),rx:f1(rx),ry:f1(ry),fill,...extra},g);
  const band=(layer,x1,topFn,botFn,fill,opacity,step=60)=>{const a=[],b=[];for(let x=-200;x<=x1;x+=step){a.push([x,topFn(x)]);b.unshift([x,botFn(x)]);}
    path(layer,smooth(a,false)+smooth(b,false).replace(/^M/,'L')+'Z',fill,{opacity});};

  /** Texture for the broad walkable plane. `onPath` keeps the trail and its verge readable. */
  function ground(layer,kind,{width,edge,groundY,pathWidth,bottom=1150,scatter=null}){
    // The plane continues below a wide screen's edge because tall (portrait) screens show much more of it.
    const cfg=GROUND_DETAIL[kind]??GROUND_DETAIL.meadow,dens=cfg.density*(bottom-300)/500;
    const onPath=(x,y,pad=10)=>y>groundY(x)-pathWidth(x)*.72-pad&&y<groundY(x)+pathWidth(x)+pad;
    // Aerial perspective: the far edge of the clearing is paler, the near edge deeper.
    // Aerial perspective as sponge stipple: dense pale speckle at the far edge thinning towards the viewer,
    // and a deeper speckle gathering along the bottom. No translucent veils.
    const far=shadeHex(W.meadow.hex,1.17);
    for(const [d,l] of [[14,3],[40,2],[84,2],[150,1]])band(layer,width,x=>edge(x)-2,x=>edge(x)+d,speck(far,l,.8),.5);
    band(layer,width,x=>Math.max(groundY(x)+pathWidth(x)+110,660),()=>1300,speck(shade,1,1.3),.55);
    band(layer,width,x=>Math.max(groundY(x)+pathWidth(x)+210,760),()=>1300,speck(shade,2,1.3),.55);
    // Mossy stippled islands break up the big plane with crisp, deliberate shapes.
    for(let x=-100;x<width;x+=R(120,220)){const y=R(edge(x)+60,bottom-10);if(onPath(x,y,34)||(kind==='moon'&&rnd()<.6))continue;const k=.55+(y-edge(x))/420;
      path(layer,blob(x,y,R(70,150)*k,R(12,26)*k,10,.2),speck(rnd()<.55?shadeHex(W.meadow.hex,.91):far,2,.8),{opacity:.5});}
    // The trail: dry-brush dashes down the worn centre, stippled shade under both verges.
    band(layer,width,x=>groundY(x)-pathWidth(x)*.42,x=>groundY(x)+pathWidth(x)*.6,dash(shadeHex(W.path.hex,1.07),1),.65,40);
    band(layer,width,x=>groundY(x)-pathWidth(x)*.72,x=>groundY(x)-pathWidth(x)*.72+12,speck(shadeHex(W.pathEdge.hex,.92),2,.8),.7,40);
    band(layer,width,x=>groundY(x)+pathWidth(x)-18,x=>groundY(x)+pathWidth(x),speck(shadeHex(W.pathEdge.hex,.92),2,.8),.7,40);
    if(scatter)for(let x=120,i=0;x<width;x+=R(150,260),i++){const y=R(groundY(x)+pathWidth(x)+150,bottom-30);scatter(x,y,Math.min(1.5,.95+(y-600)/900),i);}
    for(let x=-200;x<width;x+=320){
      const g=el('g',{transform:`translate(${x} 0)`},layer),depthOf=(xx,y)=>Math.max(.42,Math.min(1.35,.42+(y-edge(xx))/460));
      if(cfg.ripples)for(let i=0;i<9*dens+5;i++){const dx=R(0,320),y=R(edge(x+dx)+22,bottom),k=depthOf(x+dx,y),w=R(14,34)*k;
        stroke(g,`M${f1(dx)} ${f1(y)}q${f1(w*.5)} ${f1(-3.4*k)} ${f1(w)} 0`,cfg.ripples,1.5*k,{opacity:onPath(x+dx,y,0)?.3:.5});}
      if(cfg.tufts){const d=cfg.tufts.map(()=>'');
        const drifts=Array.from({length:Math.ceil(5*dens)},()=>[R(0,320),R(edge(x)+20,bottom)]);
        for(let i=0;i<78*dens;i++){const [mx,my]=drifts[i%drifts.length],far0=i%4===0,dx=far0?R(0,320):mx+R(-1,1)*R(0,70),y=far0?R(edge(x+dx)+10,bottom):Math.max(edge(x+dx)+10,my+R(-1,1)*R(0,34));if(onPath(x+dx,y,4))continue;const k=depthOf(x+dx,y)*R(.9,1.5),c=Math.floor(rnd()*d.length);
          d[c]+=`M${f1(dx-1.3*k)} ${f1(y)}Q${f1(dx-2.5*k)} ${f1(y-6*k)} ${f1(dx-4.6*k)} ${f1(y-9.5*k)}Q${f1(dx-.9*k)} ${f1(y-6*k)} ${f1(dx)} ${f1(y)}Q${f1(dx-.4*k)} ${f1(y-8*k)} ${f1(dx+.6*k)} ${f1(y-13*k)}Q${f1(dx+1.4*k)} ${f1(y-7*k)} ${f1(dx+1.1*k)} ${f1(y)}Q${f1(dx+2.4*k)} ${f1(y-5.5*k)} ${f1(dx+5*k)} ${f1(y-8.5*k)}Q${f1(dx+3.4*k)} ${f1(y-3*k)} ${f1(dx+2.4*k)} ${f1(y)}Z`;}
        d.forEach((dd,c)=>{if(dd)path(g,dd,cfg.tufts[c],{opacity:.78});});
        // Verge grass leans over both edges of the trail and hides the hard line.
        let v='';for(let dx=0;dx<320;dx+=R(7,13)){const xx=x+dx,up=rnd()<.5,y=up?groundY(xx)-pathWidth(xx)*.72+R(-1,5):groundY(xx)+pathWidth(xx)+R(-4,3),k=(up?.7:1.05)*R(.8,1.3),lean=R(-3,3);
          v+=`M${f1(dx-2*k)} ${f1(y+2)}Q${f1(dx+lean*k)} ${f1(y-8*k)} ${f1(dx+lean*1.6*k)} ${f1(y-11*k)}Q${f1(dx+1*k)} ${f1(y-5*k)} ${f1(dx+2.4*k)} ${f1(y+2)}Z`;}
        path(g,v,cfg.tufts[0],{opacity:.8});}
      if(cfg.blooms)for(let n=0;n<Math.round(dens*1.4+rnd()*.8);n++){const cx=R(20,300),cy=R(edge(x+cx)+34,bottom-20),[petal,heart]=pick(cfg.blooms),spread=R(34,84),k0=depthOf(x+cx,cy);
        for(let i=0;i<R(9,22);i++){const a=R(0,6.283),q=Math.sqrt(rnd()),dx=cx+Math.cos(a)*spread*q,y=cy+Math.sin(a)*spread*q*.34;if(onPath(x+dx,y,6)||y<edge(x+dx)+8)continue;const r=R(1.9,3.5)*k0;
          stroke(g,`M${f1(dx)} ${f1(y+r*2.4)}v${f1(-r*2)}`,cfg.tufts?.[0]??'#5c7a48',Math.max(.8,r*.34),{opacity:.75});
          el('circle',{cx:f1(dx),cy:f1(y),r:f1(r),fill:petal,opacity:.95},g);el('circle',{cx:f1(dx),cy:f1(y),r:f1(r*.4),fill:heart},g);}}
      if(cfg.litter)for(let i=0;i<16;i++){const dx=R(0,320),y=R(edge(x+dx)+14,bottom),k=depthOf(x+dx,y);ellipse(g,dx,y,R(2.6,5)*k,R(1.2,2.2)*k,pick(cfg.litter),{opacity:onPath(x+dx,y,0)?.5:.75,transform:`rotate(${f1(R(-40,40))} ${f1(dx)} ${f1(y)})`});}
      if(cfg.pebbles)for(let i=0;i<16*dens+6;i++){const dx=R(0,320),y=R(edge(x+dx)+16,bottom),k=depthOf(x+dx,y);ellipse(g,dx,y,R(1.8,5.2)*k,R(1.2,2.8)*k,pick(cfg.pebbles),{opacity:onPath(x+dx,y,0)?.55:.85});}
      else for(let dx=0;dx<320;dx+=R(22,60)){const xx=x+dx,up=rnd()<.5,y=up?groundY(xx)-pathWidth(xx)*.72+R(2,9):groundY(xx)+pathWidth(xx)-R(2,10);ellipse(g,dx,y,R(2,5),R(1.4,2.6),pick(['#cdb98f','#f4ead2','#b9a98a']),{opacity:.75});}
      if(cfg.puffs)for(let i=0;i<5;i++){const dx=R(0,320),y=R(edge(x+dx)+20,bottom);if(onPath(x+dx,y,14))continue;const k=depthOf(x+dx,y),c=pick(cfg.puffs);
        for(const [ox,oy,rr] of [[-13,0,9],[0,-6,12],[13,-1,9.5],[0,3,15]])ellipse(g,dx+ox*k,y+oy*k,rr*k*(ox?1:1.25),rr*k*.72,c,{opacity:.8});}
      if(cfg.sparkle)for(let i=0;i<7*dens;i++){const dx=R(0,320),y=R(edge(x+dx)+10,bottom),k=depthOf(x+dx,y)*R(.6,1.2);
        path(g,`M${f1(dx)} ${f1(y-4.4*k)}q${f1(.7*k)} ${f1(3.6*k)} ${f1(4*k)} ${f1(4.4*k)}q${f1(-3.3*k)} ${f1(.8*k)} ${f1(-4*k)} ${f1(4.4*k)}q${f1(-.7*k)} ${f1(-3.6*k)} ${f1(-4*k)} ${f1(-4.4*k)}q${f1(3.3*k)} ${f1(-.8*k)} ${f1(4*k)} ${f1(-4.4*k)}Z`,cfg.sparkle,{opacity:f1(R(.5,.95))});}
    }
  }
  /** Pale veil over a distant ridge so nearer planes separate from farther ones. */
  const haze=(layer,width,yf,color,opacity)=>{const p=[];for(let x=-200;x<=width;x+=80)p.push([x,yf(x)-2]);path(layer,smooth(p,false)+`L${width} 1200L-200 1200Z`,color,{opacity});};
  // Cast shadows are stippled in each world's own shade colour.
  const castShadow=(layer,x,y,rx,ry=rx*.2)=>ellipse(layer,x,y,rx,ry,speck(shade,4),{opacity:.7});
  /** Sunlit stipple under a crest and deeper stipple lower down give a flat hill its roundness. */
  function shadeRidge(layer,width,yf,hex){const light=shadeHex(hex,1.2),dark=shadeHex(hex,.8);
    for(const [d,l] of [[12,3],[30,2],[58,1]])band(layer,width,x=>yf(x)+1,x=>yf(x)+d,speck(light,l,.8),.6,80);
    band(layer,width,x=>yf(x)+84,x=>yf(x)+150,speck(dark,1),.55,80);band(layer,width,x=>yf(x)+130,()=>1200,speck(dark,2),.5,80);}

  /* ---------- props shared by several worlds ---------- */
  function cloud(g,x,y,s=1,fill=W.cloud.fill,shade='#d9cfe0'){const c=group(g,x,y,s);
    for(const [cx,cy,r] of [[-52,-4,26],[-20,-22,34],[20,-16,30],[52,-2,24],[0,-4,36]])el('circle',{cx,cy,r,fill},c);
    path(c,'M-78 4Q-78-10-52-8H56Q80-8 78 6Q60 16 0 16Q-60 16-78 4Z',fill);path(c,'M-70 8Q0 20 72 8Q50 17 0 17Q-52 17-70 8Z',shade,{opacity:.4});
    ellipse(c,-22,-34,18,7,'#fff',{opacity:.5});return c;}
  function palm(g,x,y,s=1,o={}){const h=group(g,x,y,s),lean=o.lean??18,trunk=el('g',{class:'still','data-b':'-26,-262,62,10'},h);
    el('path',{d:`M-11 0Q${lean} -112 ${lean-12} -246L${lean+4} -250Q${lean+30} -110 12 0Z`,...wa(W.trunk,2,.2)},trunk);
    for(let k=1;k<9;k++)stroke(trunk,`M${f1(-4+lean*.11*k)} ${-k*27}q11 -6 20 -2`,'#fff',2.4,{opacity:.2});
    const crown=sway(h,'-176,-338,196,-96'),cx=lean-3,cy=-250;
    for(const [dx,dy,w] of [[-158,62,W.leafA],[-150,-22,W.leafA],[-96,-78,W.leafB],[6,-82,W.leafB],[112,-70,W.leafC],[166,-10,W.leafB],[162,70,W.leafA]]){
      el('path',{d:`M${cx} ${cy}Q${f1(cx+dx*.6)} ${f1(cy-44+dy*.25)} ${cx+dx} ${cy+dy}Q${f1(cx+dx*.5)} ${f1(cy+24+dy*.7)} ${cx} ${cy}Z`,...wa(w,1.5,.18)},crown);
      stroke(crown,`M${cx} ${cy}Q${f1(cx+dx*.55)} ${f1(cy-14+dy*.5)} ${cx+dx} ${cy+dy}`,'#e9f0c4',1.8,{opacity:.45});}
    if(o.fruit!==false)for(const dx of [-12,2,14])el('circle',{cx:cx+dx,cy:cy+10,r:8,fill:o.fruit??'#b98f5a'},crown);return h;}
  function crystal(g,x,y,s=1,o={}){const c=group(g,x,y,s),light=o.light??'#f4fbf6',mid=o.mid??'#b9dbe6',dark=o.dark??'#86b6cc';
    for(const [dx,h,w] of [[-21,52,18],[1,92,25],[25,40,17],[12,24,12]]){path(c,`M${dx-w/2} 0V${-h+w*.7}L${dx} ${-h}L${dx+w/2} ${-h+w*.7}V0Z`,mid);path(c,`M${dx} 0V${-h}L${dx+w/2} ${-h+w*.7}V0Z`,dark,{opacity:.75});path(c,`M${dx-w/2} ${-h+w*.7}L${dx} ${-h}L${dx-w*.12} ${-h+w*.9}V-4H${dx-w/2}Z`,light,{opacity:.7});}
    if(o.glow)ellipse(c,0,-40,54,58,o.glow,{opacity:.14});return c;}
  // A chunky rock: grounded shadow, dark side, pale faceted top, a crack, moss and a tuft at its foot.
  function boulder(g,x,y,s=1,w=W.stone,moss){const r=group(g,x,y,s),hex=w.hex,flip=rnd()<.5?-1:1,X=v=>f1(v*flip);
    castShadow(r,3,1,40,6);
    path(r,`M${X(-34)} 0Q${X(-39)}-18 ${X(-26)}-30Q${X(-12)}-42 ${X(8)}-40Q${X(30)}-37 ${X(36)}-18Q${X(40)}-4 ${X(32)} 1Q0 6 ${X(-34)} 0Z`,shadeHex(hex,.78));
    el('path',{d:`M${X(-34)}-4Q${X(-37)}-19 ${X(-25)}-30Q${X(-12)}-41 ${X(7)}-39Q${X(24)}-36 ${X(26)}-22Q${X(10)}-13 ${X(-8)}-12Q${X(-24)}-11 ${X(-34)}-4Z`,...wa(w,2,.2)},r);
    path(r,`M${X(-28)}-24Q${X(-14)}-37 ${X(4)}-36Q${X(-10)}-28 ${X(-28)}-24Z`,'#fff',{opacity:.45});
    stroke(r,`M${X(4)}-13q${X(5)} 6 ${X(2)} 12`,shadeHex(hex,.6),1.6,{opacity:.6});stroke(r,`M${X(-18)}-11q${X(-2)} 5 ${X(1)} 9`,shadeHex(hex,.6),1.4,{opacity:.45});
    path(r,blob(14*flip,-7,13,6,7,.12),speck(shadeHex(hex,.62),3));
    if(moss){path(r,`M${X(-24)}-30Q${X(-10)}-43 ${X(10)}-40Q${X(18)}-36 ${X(14)}-32Q${X(4)}-36 ${X(-4)}-31Q${X(-12)}-34 ${X(-17)}-28Q${X(-22)}-27 ${X(-24)}-30Z`,moss);
      for(const [dx,c] of [[-30,'#e59aa4'],[34,'#fbf3e4']]){stroke(r,`M${X(dx)} 1q1-7 0-11`,'#4f6f3f',1.8);el('circle',{cx:X(dx),cy:-11,r:3,fill:c},r);}
      path(r,`M${X(22)} 2q2-10 5-13q0 7 3 13ZM${X(-38)} 2q-1-9 2-12q1 6 4 12Z`,moss);}
    return r;}
  function boat(g,x,y,s=1,sail='#fbf3e4',hull='#c9806f'){const b=group(g,x,y,s);path(b,'M-24 0Q-20 12 0 12Q20 12 26 0Z',hull);path(b,'M-1-44V0',hull);stroke(b,'M0 0V-46','#7a5c48',2);path(b,'M2-44Q24-22 22-4H2Z',sail);path(b,'M-2-38Q-18-20-16-4H-2Z',sail,{opacity:.85});ellipse(b,0,13,30,2.6,'#fff',{opacity:.5});return b;}
  function cottage(g,x,y,s=1,roof='#c98d7c'){const c=group(g,x,y,s);path(c,'M-22 0V-22H22V0Z','#fbf3e4');path(c,'M-28-20L0-44L28-20Z',roof);path(c,'M12-36V-48H19V-30Z','#e6d3b2');
    el('rect',{x:-5,y:-14,width:10,height:14,rx:5,fill:'#9c7458'},c);el('rect',{x:9,y:-17,width:8,height:8,rx:1.5,fill:'#9ccfd0'},c);el('rect',{x:-17,y:-17,width:8,height:8,rx:1.5,fill:'#9ccfd0'},c);
    for(const [dx,dy,r] of [[16,-58,5],[21,-70,7],[17,-84,9]])el('circle',{cx:dx,cy:dy,r,fill:'#fff',opacity:.5},c);return c;}
  function lighthouse(g,x,y,s=1){const l=group(g,x,y,s);path(l,'M-12 0L-8-62H8L12 0Z','#fbf3e4');for(const yy of [-18,-44])path(l,`M${-11+(-yy)*.062} ${yy}h${22-(-yy)*.124}v-11h${-22+(-yy+11)*.124}Z`,'#d98b93');
    el('rect',{x:-10,y:-66,width:20,height:5,rx:2,fill:'#7a5c48'},l);el('rect',{x:-6,y:-78,width:12,height:12,fill:'#fdf0c0'},l);path(l,'M-9-78L0-90L9-78Z','#d98b93');path(l,'M6-74L60-86V-60Z','#fdf0c0',{opacity:.3});return l;}
  // A fallen log with bark, a cut end with rings, a stub branch, moss and two little mushrooms.
  function log(g,x,y,s=1){const n=group(g,x,y,s);castShadow(n,0,2,54,7);
    el('path',{d:'M-46-3Q-50-24-34-27H30Q46-25 46-5Q34 3 0 2Q-32 3-46-3Z',...wa(W.trunk,2,.22)},n);
    path(n,'M-46-3Q-32 3 0 2Q34 3 46-5Q40-9 0-8Q-34-7-46-3Z',shadeHex(W.trunk.hex,.74));
    stroke(n,'M-8-26q-4-10-12-13',W.trunk.hex,7);ellipse(n,-20,-39,4,3.4,'#d6bd95');
    for(const d of ['M-34-20q16 4 34 0','M-28-12q22 5 50 1','M-12-24q10 3 22 1'])stroke(n,d,'#5f4a38',1.6,{opacity:.4});
    ellipse(n,38,-15,10,12,'#b99a70');ellipse(n,38,-15,8,10,'#e3cba3');ellipse(n,38,-15,4.6,6,'none',{stroke:'#b99a70','stroke-width':1.3});ellipse(n,38,-15,1.6,2,'#b99a70');
    path(n,blob(-18,-27,19,5.5,8,.2),'#7fa35c');path(n,blob(10,-28,10,3.6,7,.2),'#93b56a');
    for(const [dx,h,r,c] of [[-36,-9,7,'#d98b93'],[-27,-5,5,'#e0ad4c']]){path(n,`M${dx-2} 2V${h+2}h4V2Z`,'#f8e7cb');path(n,`M${dx-r} ${h+3}Q${dx-r} ${h-r} ${dx} ${h-r}Q${dx+r} ${h-r} ${dx+r} ${h+3}Z`,c);el('circle',{cx:dx-2,cy:h-2,r:1.3,fill:'#fff'},n);}
    return n;}
  function grassClump(g,x,y,s,colors,flower){const h=group(g,x,y,s),c=sway(h,'-26,-62,26,4');
    for(let i=0;i<9;i++){const a=R(-26,26),hh=R(30,58);path(c,`M${f1(a*.3-2)} 0Q${f1(a*.6)} ${f1(-hh*.6)} ${f1(a)} ${f1(-hh)}Q${f1(a*.5+2)} ${f1(-hh*.5)} ${f1(a*.3+2.4)} 0Z`,pick(colors),{opacity:.92});}
    if(flower)for(const a of [-10,8])el('circle',{cx:a,cy:f1(R(-56,-44)),r:3.6,fill:flower},c);return h;}
  return {shade,speck,dash,shadeRidge,tint,group,path,stroke,ellipse,band,ground,haze,castShadow,cloud,palm,crystal,boulder,boat,cottage,lighthouse,grassClump,log};
}
