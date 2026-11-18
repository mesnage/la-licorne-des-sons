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
export function paintCrossings(route,{el,ground,front,groundY,habitat}){
  const water=habitat==='ice'?'#8ab7cf':habitat==='moon'?'#59549b':habitat==='desert'?'#c39467':'#72b8b5';
  const wood=habitat==='jungle'?'#b98b58':'#c39b65',stone=habitat==='ice'?'#dceef0':habitat==='desert'?'#dec097':'#c4c7af';
  const path=(g,d,fill,stroke,width=2)=>el('path',{d,fill,...(stroke?{stroke,'stroke-width':width,'stroke-linecap':'round','stroke-linejoin':'round'}:{})},g);
  for(const c of route.crossings){
    // Translation lets the scenery renderer cull entire crossings outside a tile.
    const g=el('g',{transform:`translate(${c.center} 0)`},ground),fg=el('g',{transform:`translate(${c.center} 0)`},front);
    const y=x=>route.y(c.center+x),base=groundY(c.center);
    if(c.kind!=='cloud'){
      path(g,`M-5 ${base-290}Q45 ${base-70} -8 ${base+25}Q-56 ${base+160} 48 1300L164 1300Q49 ${base+140} 91 ${base+25}Q141 ${base-80} 5 ${base-290}Z`,water);
      for(let i=0;i<10;i++){const yy=base-135+i*43;path(g,`M${-30+Math.sin(i)*30} ${yy}q22-5 44 0`,'none',habitat==='moon'?'#8d88c3':'#d6eee6',2);}
    }
    if(c.kind==='steps'){
      for(let i=0;i<=4;i++){const x=-c.half+i*c.half/2,yy=y(x);
        el('ellipse',{cx:x+4,cy:yy+29,rx:47,ry:32,fill:'#324b4930'},g);
        path(g,`M${x-40} ${yy-33}Q${x} ${yy-57} ${x+40} ${yy-29}L${x+45} ${yy+28}Q${x} ${yy+53} ${x-44} ${yy+26}Z`,stone,'#81948c');
        path(g,`M${x-29} ${yy-27}Q${x} ${yy-41} ${x+27} ${yy-25}`,'none','#f9f1dc',3);
      }
      continue;
    }
    const edge=(offset,reverse=false)=>{
      const points=[];for(let x=-c.half;x<=c.half;x+=12)points.push([x,y(x)+offset]);
      if(reverse)points.reverse();return points.map(([x,yy],i)=>`${i?'L':'M'}${x} ${yy}`).join(' ');
    };
    if(c.kind==='cloud'){
      path(g,edge(-48)+edge(58,true).replace('M','L')+'Z','#f4eafa','#c2bddc',3);
      for(let x=-c.half+20;x<c.half;x+=40){el('ellipse',{cx:x,cy:y(x)+36,rx:36,ry:25,fill:'#fff8ec'},fg);}
      path(g,edge(-35),'none','#fff5cd',5);
    }else{
      path(g,edge(-53)+edge(69,true).replace('M','L')+'Z',c.kind==='wood'?wood:stone,c.kind==='wood'?'#886744':'#8b9889',4);
      path(g,edge(69)+edge(84,true).replace('M','L')+'Z',c.kind==='wood'?'#927147':'#929f90');
      for(let x=-c.half+12;x<c.half;x+=c.kind==='wood'?22:48){path(g,`M${x} ${y(x)-49}L${x} ${y(x)+65}`,'none',c.kind==='wood'?'#927147':'#9ba48f',2);}
      if(c.kind==='wood'){
        for(const side of [-1,1]){const host=side<0?g:fg,off=side<0?-48:70;
          for(let x=-c.half+8;x<c.half;x+=86){path(host,`M${x} ${y(x)+off+8}v-54`,'none','#806347',7);el('circle',{cx:x,cy:y(x)+off-46,r:5,fill:'#e4c58f'},host);}
          path(host,edge(off-39),'none',habitat==='jungle'?'#9e8054':'#b99563',5);
        }
      }else{path(fg,edge(64),'none',habitat==='ice'?'#f5ffff':'#e6e4d0',7);}
    }
  }
}
