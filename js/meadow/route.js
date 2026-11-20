/** Terrain crossings share their geometry with the painted surface and both travellers. */
export function createRoute(habitat,groundY,{start=320,gap=640,total=30}={}){
  const stone=['ice','moon','prehistoric','desert'].includes(habitat);
  const cloud=['clouds','fairy'].includes(habitat);
  const crossings=Array.from({length:total},(_,i)=>({
    center:start+(i+.5)*gap,half:i%3===1?132:180,
    kind:i%3===1?'steps':cloud?'cloud':stone?'arch':'wood',index:i
  })).filter(c=>c.index%3!==2);
  function at(x){const i=Math.floor((x-start)/gap);if(i<0||i>=total||i%3===2)return null;
    const c=crossings.find(c=>c.index===i);return Math.abs(x-c.center)<=c.half?c:null;}
  function height(x){const c=at(x);if(!c)return 0;const u=(x-c.center+c.half)/(2*c.half);return -(c.kind==='steps'?10:c.kind==='cloud'?44:34)*Math.sin(Math.PI*u)**2;}
  return {crossings,at,height,y:x=>groundY(x)+height(x),
    hop(x,reduced=false){const c=at(x);if(reduced||c?.kind!=='steps')return 0;const u=(x-c.center+c.half)/(2*c.half);return 18*Math.sin(4*Math.PI*u)**2*Math.sin(Math.PI*u)**2;},
    tilt(x){const c=at(x);if(!c)return 0;const u=(x-c.center+c.half)/(2*c.half),rise=c.kind==='steps'?10:c.kind==='cloud'?44:34;return Math.atan(-rise*Math.PI*Math.sin(2*Math.PI*u)/(2*c.half))*180/Math.PI;}
  };
}
const TONE={
  /* Indoors the stream is a blue blanket with white stitches, crossed on cushions. */
  peluches:{water:'#bcdcf0',deep:'#a6cdea',foam:'#fffdf8',bank:'#fffaf0',reed:null,pad:null},
  meadow:{water:'#72b8b5',deep:'#4f9b9c',foam:'#e3f4ee',bank:'#5c8a4a',reed:'#4f7a3f',pad:'#6fa35c'},
  forest:{water:'#6fb1ab',deep:'#4b8f8d',foam:'#dcefe6',bank:'#4c7446',reed:'#456b3b',pad:'#5f9358'},
  jungle:{water:'#62b3a6',deep:'#3f8f86',foam:'#dff3e6',bank:'#3f7a4c',reed:'#3c7044',pad:'#58a05c'},
  beach:{water:'#74c4cc',deep:'#4fa3b0',foam:'#f4fbf6',bank:'#d9bf8a',reed:'#7fae6f',pad:null},
  ice:{water:'#8ab7cf',deep:'#6a9cb9',foam:'#f4fbff',bank:'#bcd9e6',reed:null,pad:null},
  moon:{water:'#59549b',deep:'#454184',foam:'#a7a2d9',bank:'#7f7bbd',reed:null,pad:null},
  prehistoric:{water:'#6fb3a2',deep:'#4c9184',foam:'#e2f2e2',bank:'#6f8f4c',reed:'#5c8246',pad:'#74a85c'},
  desert:{water:'#7cc3c2',deep:'#55a3a6',foam:'#f3faf2',bank:'#c9a066',reed:'#8aa862',pad:null}
};
const WOOD={deck:'#cfa46c',plankA:'#d6ad76',plankB:'#c79a62',gap:'#8d6a43',beam:'#9a7449',dark:'#7b5a3a',post:'#8a6645',rail:'#b98d5c',light:'#ecd0a0'};
const STONE={
  ice:{deck:'#e6f4f6',a:'#f4fbfc',b:'#cfe6ee',wall:'#bcdbe8',cap:'#f7fdff',dark:'#8fb9cf',joint:'#9cc3d6'},
  moon:{deck:'#c9c6e6',a:'#dad8f2',b:'#b3afd9',wall:'#a39fcf',cap:'#e6e4f7',dark:'#6f6aa8',joint:'#8884bd'},
  desert:{deck:'#e3c79c',a:'#eed6ae',b:'#d5b585',wall:'#cba873',cap:'#f3dfbb',dark:'#a37f4f',joint:'#b08a58'},
  prehistoric:{deck:'#c9cbb2',a:'#d9dbc4',b:'#b5b99d',wall:'#a9ae90',cap:'#e3e5cf',dark:'#7c846a',joint:'#8d9479'}
};
/* Crossings are painted as real little structures: planked footbridges with railings and lanterns,
 * stone and ice arches with parapets, chunky stepping stones with ripples, and rainbow cloud bridges.
 * Only path/ellipse/circle with flat fills, so the tile baker can draw them. */
export function paintCrossings(route,{el,ground,front,groundY,habitat}){
  const T=TONE[habitat]??TONE.meadow,ST=STONE[habitat]??STONE.prehistoric,icy=habitat==='ice';
  const r=n=>Math.round(n*10)/10;
  const fill=(g,d,color,o={})=>el('path',{d,fill:color,...o},g);
  const line=(g,d,color,width=2,o={})=>el('path',{d,fill:'none',stroke:color,'stroke-width':width,'stroke-linecap':'round','stroke-linejoin':'round',...o},g);
  const oval=(g,cx,cy,rx,ry,color,o={})=>el('ellipse',{cx:r(cx),cy:r(cy),rx:r(rx),ry:r(ry),fill:color,...o},g);
  const FAR=-52,NEAR=68;
  for(const c of route.crossings){
    // Translation lets the scenery renderer cull entire crossings outside a tile.
    const g=el('g',{transform:`translate(${c.center} 0)`},ground),fg=el('g',{transform:`translate(${c.center} 0)`},front);
    const y=x=>route.y(c.center+x),base=groundY(c.center),h=c.half;
    const curve=(off,x0=-h,x1=h,step=12)=>{const pts=[];for(let x=x0;x<x1;x+=step)pts.push([x,y(x)+off]);pts.push([x1,y(x1)+off]);return pts;};
    const d=pts=>pts.map(([x,yy],i)=>`${i?'L':'M'}${r(x)} ${r(yy)}`).join('');
    const band=(o1,o2,x0=-h,x1=h)=>d(curve(o1,x0,x1))+d(curve(o2,x0,x1).reverse()).replace('M','L')+'Z';
    if(c.kind!=='cloud'){
      // a stream wide enough to deserve its crossing, with banks, current lines and things growing in it
      const k=h/(c.kind==='steps'?78:92),X=x=>r((x-82)*k),river=`M${X(35)} ${base-290}Q${X(85)} ${base-70} ${X(32)} ${base+25}Q${X(-16)} ${base+160} ${X(88)} 1300L${X(204)} 1300Q${X(89)} ${base+140} ${X(131)} ${base+25}Q${X(181)} ${base-80} ${X(45)} ${base-290}Z`;
      fill(g,river,T.bank,{stroke:T.bank,'stroke-width':13,'stroke-linejoin':'round',opacity:.55});
      fill(g,river,T.water);
      fill(g,`M${X(58)} ${base-150}Q${X(100)} ${base-60} ${X(76)} ${base+25}Q${X(40)} ${base+150} ${X(128)} 1300L${X(170)} 1300Q${X(72)} ${base+140} ${X(104)} ${base+25}Q${X(128)} ${base-70} ${X(70)} ${base-150}Z`,T.deep,{opacity:.45});
      for(let i=0;i<16;i++){const yy=base-150+i*36,cx=(82+Math.sin(i*1.7)*30-82)*k+(yy-base)*.1;line(g,`M${r(cx-16)} ${yy}q8-5 16 0q8 5 16 0`,T.foam,2.2,{opacity:.75});}
      for(let i=0;i<7;i++){const yy=base-110+i*58,cx=(82+Math.cos(i*2.3)*34-82)*k+(yy-base)*.1;line(g,`M${r(cx-9)} ${yy}q9-4 18 0`,T.foam,1.8,{opacity:.55});}
      // pebbles on both banks
      for(const [bx,by,s] of [[-22,-118,1],[176,-96,.8],[-8,112,1.2],[204,128,1],[-30,170,.8]]){const px=(bx-82)*k*.9+(bx<82?-6:6),py=base+by;
        fill(g,`M${r(px-13*s)} ${py}Q${r(px-14*s)} ${r(py-11*s)} ${r(px-2*s)} ${r(py-13*s)}Q${r(px+13*s)} ${r(py-12*s)} ${r(px+14*s)} ${py}Q${r(px)} ${r(py+5*s)} ${r(px-13*s)} ${py}Z`,icy?'#eaf6f8':habitat==='peluches'?'#f6cf8a':'#d9d2c0');
        line(g,`M${r(px-7*s)} ${r(py-9*s)}q${r(6*s)} ${r(-3*s)} ${r(12*s)} 0`,'#fff',1.6,{opacity:.6});}
      if(T.pad)for(const [bx,by,s] of [[70,118,1],[100,150,.75],[92,-124,.6]]){const px=(bx-82)*k+(by)*.12,py=base+by;
        fill(g,`M${r(px)} ${py}L${r(px+15*s)} ${r(py-4*s)}A${r(16*s)} ${r(8*s)} 0 1 0 ${r(px+13*s)} ${r(py+5*s)}Z`,T.pad);
        if(s>.7){for(let q=0;q<5;q++){const a=q/5*6.283;oval(g,px-4*s+Math.cos(a)*4,py-3*s+Math.sin(a)*3,3.4,2.8,'#f6cfd6');}oval(g,px-4*s,py-3*s,2,2,'#e9b84f');}}
      if(T.reed)for(const [bx,by,dir] of [[2,84,-1],[170,70,1],[14,-98,-1]]){const px=(bx-82)*k*.94,py=base+by;
        for(let q=0;q<4;q++){const hh=30+q%2*14,lean=(q-1.5)*4*dir;fill(g,`M${r(px+q*6-3)} ${py}Q${r(px+q*6+lean*.5)} ${r(py-hh*.6)} ${r(px+q*6+lean)} ${r(py-hh)}Q${r(px+q*6+lean*.4+2)} ${r(py-hh*.5)} ${r(px+q*6+3)} ${py}Z`,T.reed);}
        oval(g,px+7,py-38,2.6,7,'#8a6645');}
    }
    if(c.kind==='steps'){
      const plush=habitat==='peluches',light=plush?'#fbe3ea':icy?'#f4fbfc':habitat==='moon'?'#dad8f2':habitat==='desert'?'#f0dcb6':'#e4dfcc',side=plush?'#ecb9c6':icy?'#b5d6e4':habitat==='moon'?'#8f8bc4':habitat==='desert'?'#c7a574':'#aaa791',rim=plush?'#d99fb0':icy?'#8fb9cf':habitat==='moon'?'#6f6aa8':habitat==='desert'?'#a8875a':'#8c8a75';
      for(let i=0;i<=4;i++){const x=-h+i*h/2,yy=y(x)+10,rr=45+(i%2?4:-2),ry=25;
        // ripples, then a thick stone: dark side, pale flat top, moss or snow, and a highlight
        line(g,`M${r(x-rr-16)} ${r(yy+24)}a${r(rr+16)} 13 0 0 0 ${r(2*rr+32)} 0`,T.foam,2.4,{opacity:.8});
        line(g,`M${r(x-rr-4)} ${r(yy+40)}q${r(rr*.5)} 9 ${r(rr)} 6`,T.foam,2,{opacity:.55});
        fill(g,`M${r(x-rr)} ${r(yy)}Q${r(x-rr-3)} ${r(yy+25)} ${r(x-rr*.62)} ${r(yy+34)}Q${r(x)} ${r(yy+44)} ${r(x+rr*.62)} ${r(yy+34)}Q${r(x+rr+3)} ${r(yy+25)} ${r(x+rr)} ${r(yy)}Z`,side,{stroke:rim,'stroke-width':2,'stroke-linejoin':'round'});
        for(const dx of [-.5,.05,.5])line(g,`M${r(x+rr*dx)} ${r(yy+ry-3)}q2 7 -1 12`,rim,1.6,{opacity:.5});
        oval(g,x,yy,rr,ry,light,{stroke:rim,'stroke-width':2});
        fill(g,`M${r(x-rr*.82)} ${r(yy-4)}Q${r(x-rr*.5)} ${r(yy-ry*.92)} ${r(x+rr*.1)} ${r(yy-ry*.94)}Q${r(x-rr*.3)} ${r(yy-ry*.5)} ${r(x-rr*.82)} ${r(yy-4)}Z`,'#ffffff',{opacity:.55});
        if(icy)fill(g,`M${r(x-rr*.7)} ${r(yy-10)}Q${r(x)} ${r(yy-ry-7)} ${r(x+rr*.7)} ${r(yy-10)}Q${r(x+rr*.3)} ${r(yy-4)} ${r(x)} ${r(yy-9)}Q${r(x-rr*.3)} ${r(yy-3)} ${r(x-rr*.7)} ${r(yy-10)}Z`,'#ffffff');
        else if(T.pad){fill(g,`M${r(x+rr*.2)} ${r(yy+ry*.5)}Q${r(x+rr*.9)} ${r(yy+ry*.5)} ${r(x+rr*.96)} ${r(yy-2)}Q${r(x+rr*.6)} ${r(yy+2)} ${r(x+rr*.5)} ${r(yy+8)}Q${r(x+rr*.3)} ${r(yy+7)} ${r(x+rr*.2)} ${r(yy+ry*.5)}Z`,T.pad,{opacity:.9});
          for(const [dx,dy] of [[.62,.2],[.76,.05]])oval(g,x+rr*dx,yy+ry*dy,2,2,'#cfe0a0');}
        for(const [dx,dy,q] of [[-.3,.25,3],[.1,-.3,2.2],[-.55,-.1,1.8]])oval(g,x+rr*dx,yy+ry*dy,q,q*.7,rim,{opacity:.35});
      }
      continue;
    }
    if(c.kind==='cloud'){
      const puff=(host,x,yy,q,color='#fffdf8')=>oval(host,x,yy,q,q*.78,color);
      for(let x=-h+10;x<h;x+=38)puff(g,x,y(x)+FAR-6,30+((x/38)&1)*7,'#f1e6f7');
      fill(g,band(FAR-8,NEAR+6),'#fffaf3');
      // a pastel rainbow runs along the bridge
      for(const [o1,o2,color] of [[-34,-17,'#f7cdda'],[-17,0,'#fbe6b0'],[0,17,'#cdeedd'],[17,34,'#cfdcf7']])fill(g,band(o1,o2,-h+14,h-14),color,{opacity:.9});
      line(g,d(curve(-34,-h+14,h-14)),'#fff',3,{opacity:.8});
      for(let x=-h+30;x<h;x+=64){const yy=y(x)+((x/64)&1?-26:26);fill(g,`M${r(x)} ${r(yy-7)}l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z`,'#fff7c9');}
      for(let x=-h+4;x<h+10;x+=40){const q=27+((x/40)&1)*8,yy=y(x)+NEAR-6;puff(fg,x,yy+7,q,'#e3d6f0');puff(fg,x,yy,q);}
      for(let x=-h+24;x<h;x+=80)oval(fg,x-6,y(x)+NEAR-18,10,4,'#fff',{opacity:.9});
      continue;
    }
    if(c.kind==='wood'){
      const W=WOOD;
      // shadow on the water, posts standing in the stream, cross-braces
      fill(g,band(NEAR+12,NEAR+50,-h+34,h-34),T.deep,{opacity:.55});
      for(const px of [-h*.42,h*.42]){const top=y(px)+NEAR+6;fill(g,`M${r(px-8)} ${r(top)}h16v50h-16Z`,W.dark);fill(g,`M${r(px-8)} ${r(top)}h6v50h-6Z`,W.post);
        line(g,`M${r(px-17)} ${r(top+50)}a17 6 0 0 0 34 0`,T.foam,2.2,{opacity:.85});}
      line(g,`M${r(-h*.42)} ${r(y(-h*.42)+NEAR+16)}L${r(h*.42)} ${r(y(h*.42)+NEAR+44)}M${r(h*.42)} ${r(y(h*.42)+NEAR+16)}L${r(-h*.42)} ${r(y(-h*.42)+NEAR+44)}`,W.dark,5,{opacity:.85});
      // deck: one plank at a time, alternating tones, with dark gaps and nails
      fill(g,band(FAR,NEAR),W.deck);
      for(let x=-h,i=0;x<h;x+=20,i++){const x2=Math.min(h,x+20);
        fill(g,`M${r(x)} ${r(y(x)+FAR)}L${r(x2)} ${r(y(x2)+FAR)}L${r(x2)} ${r(y(x2)+NEAR)}L${r(x)} ${r(y(x)+NEAR)}Z`,i%2?W.plankA:W.plankB);
        line(g,`M${r(x)} ${r(y(x)+FAR)}V${r(y(x)+NEAR)}`,W.gap,1.8,{opacity:.7});
        if(i%3===1)line(g,`M${r(x+6)} ${r(y(x+6)+FAR+30)}q5 14 1 34`,W.gap,1.2,{opacity:.35});
        for(const o of [FAR+8,NEAR-8])oval(g,x+10,y(x+10)+o,1.7,1.7,W.dark,{opacity:.7});}
      fill(g,band(-12,26),W.light,{opacity:.28});
      // side beam with a lit top edge
      fill(g,band(NEAR,NEAR+17),W.beam);line(g,d(curve(NEAR+1)),W.light,2.4,{opacity:.7});line(g,d(curve(NEAR+17)),W.dark,2.4);
      fill(g,band(FAR-7,FAR),W.dark);
      // stone footings where the bridge meets the path
      for(const sx of [-1,1])for(const [o,q] of [[FAR+2,13],[NEAR+12,17]]){const px=sx*(h+3),py=y(sx*h)+o;
        fill(g,`M${r(px-q)} ${r(py+6)}Q${r(px-q-1)} ${r(py-q*.7)} ${r(px)} ${r(py-q*.8)}Q${r(px+q+1)} ${r(py-q*.7)} ${r(px+q)} ${r(py+6)}Q${r(px)} ${r(py+11)} ${r(px-q)} ${r(py+6)}Z`,'#d6d0be',{stroke:'#9a9684','stroke-width':1.6});
        line(g,`M${r(px-q*.5)} ${r(py-q*.5)}q${r(q*.4)} -4 ${r(q*.9)} 0`,'#fff',1.6,{opacity:.6});}
      // railings: the far one behind Paillette, the near one low in front of her hooves
      const rail=(host,foot,height,post,thick,lantern)=>{
        const xs=[];for(let x=-h+6;x<=h-4;x+=(2*h-10)/6)xs.push(x);
        line(host,d(curve(foot-height*.52,-h+6,h-6)),W.post,thick*.62);
        for(const [i,x] of xs.entries()){const end=i===0||i===xs.length-1,top=y(x)+foot-height-(end?8:0);
          fill(host,`M${r(x-post/2)} ${r(y(x)+foot)}V${r(top)}h${post}V${r(y(x)+foot)}Z`,W.post);
          fill(host,`M${r(x-post/2)} ${r(y(x)+foot)}V${r(top)}h${r(post*.36)}V${r(y(x)+foot)}Z`,W.rail,{opacity:.8});
          oval(host,x,top,post*.78,post*.52,W.light,{stroke:W.dark,'stroke-width':1.2});
          if(end&&lantern){fill(host,`M${r(x-7)} ${r(top-6)}h14l-2 -18h-10Z`,'#fff0b8',{stroke:W.dark,'stroke-width':1.6,'stroke-linejoin':'round'});fill(host,`M${r(x-9)} ${r(top-24)}h18l-9 -9Z`,W.dark);oval(host,x,top-14,3.2,5,'#f7c95c');}}
        line(host,d(curve(foot-height,-h+6,h-6)),W.dark,thick+2.4);line(host,d(curve(foot-height,-h+6,h-6)),W.rail,thick);
        line(host,d(curve(foot-height-thick*.22,-h+10,h-10)),W.light,thick*.28,{opacity:.75});
      };
      rail(g,FAR+2,50,8,7,true);rail(fg,NEAR+14,40,10,8.5,false);
      continue;
    }
    // stone, sandstone and ice arches
    {const S=ST,wl=base+NEAR+62;
      fill(g,`M${-h+10} ${r(y(-h+10)+NEAR)}`+d(curve(NEAR,-h+10,h-10)).replace('M','L')+`L${h-10} ${wl}Q0 ${wl+12} ${-h+10} ${wl}Z`,S.wall);
      // the arch opening shows the stream running underneath
      fill(g,`M${r(-h*.6)} ${wl+2}Q${r(-h*.58)} ${r(y(0)+NEAR+20)} 0 ${r(y(0)+NEAR+18)}Q${r(h*.58)} ${r(y(0)+NEAR+20)} ${r(h*.6)} ${wl+2}Z`,T.deep);
      line(g,`M${r(-h*.6)} ${wl+2}Q${r(-h*.58)} ${r(y(0)+NEAR+20)} 0 ${r(y(0)+NEAR+18)}Q${r(h*.58)} ${r(y(0)+NEAR+20)} ${r(h*.6)} ${wl+2}`,S.cap,7);
      for(let i=1;i<8;i++){const a=Math.PI*i/8,px=-Math.cos(a)*h*.6,py=wl+2-(wl-16-y(0)-NEAR)*Math.sin(a)**.8;line(g,`M${r(px)} ${r(py-4)}l${r(-Math.cos(a)*6)} ${r(-Math.sin(a)*6-1)}`,S.joint,1.6);}
      for(const [x1,x2,o] of [[-h+14,-h*.66,24],[h*.66,h-14,24],[-h+14,-h*.7,44],[h*.7,h-14,44]])line(g,`M${r(x1)} ${r(y((x1+x2)/2)+NEAR+o)}H${r(x2)}`,S.joint,1.5,{opacity:.7});
      line(g,`M${r(-h*.3)} ${wl+4}q${r(h*.15)} -5 ${r(h*.3)} 0t${r(h*.3)} 0`,T.foam,2.2,{opacity:.8});
      if(icy)for(let x=-h+26;x<h-20;x+=34){if(Math.abs(x)<h*.62)continue;const yy=y(x)+NEAR+16;fill(g,`M${r(x-5)} ${r(yy)}l5 ${16+((x/34)&1)*9} 5 ${-16-((x/34)&1)*9}Z`,'#f4fbff',{opacity:.9});}
      // paved deck
      fill(g,band(FAR,NEAR),S.deck);
      for(const [o,shift] of [[-38,0],[-13,17],[13,0],[40,17]])for(let x=-h+16+shift,i=0;x<h-10;x+=34,i++)
        fill(g,`M${r(x-14)} ${r(y(x)+o)}q0 -10 14 -10q14 0 14 10q0 10 -14 10q-14 0 -14 -10Z`,i%2?S.a:S.b,{opacity:icy?.75:.9});
      if(icy)for(let x=-h+30;x<h-30;x+=70)line(g,`M${r(x)} ${r(y(x)-20)}l26 44`,'#fff',5,{opacity:.6});
      fill(g,band(NEAR,NEAR+12),S.dark,{opacity:.5});
      // parapets with capstones
      const wall=(host,top,bottom,jointStep)=>{fill(host,band(top,bottom),S.wall);fill(host,band(top-7,top+1,-h-4,h+4),S.cap);line(host,d(curve(top+1,-h-4,h+4)),S.dark,1.6,{opacity:.6});
        for(let x=-h+jointStep*.5,i=0;x<h;x+=jointStep,i++)line(host,`M${r(x)} ${r(y(x)+top+3)}V${r(y(x)+bottom-2)}`,S.joint,1.5,{opacity:.75});
        for(const sx of [-1,1]){const px=sx*h,py=y(px)+bottom;fill(host,`M${r(px-11)} ${r(py+3)}V${r(py-(bottom-top)-16)}Q${r(px)} ${r(py-(bottom-top)-25)} ${r(px+11)} ${r(py-(bottom-top)-16)}V${r(py+3)}Z`,S.cap,{stroke:S.dark,'stroke-width':1.5});}};
      wall(g,FAR-30,FAR+2,32);wall(fg,NEAR-12,NEAR+14,36);
    }
  }
}
