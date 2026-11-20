/** Seven original storybook habitats. Geometry is baked once, like the meadow. */
const pal=o=>({meadowD:o.near,fg2:o.near,mountB:o.mountA,leafC:o.leafB,...o});
export const HABITATS={
  beach:{sky:['#7cc6d6','#c9eae4','#fff1cf'],cloudShade:'#cfd9d6',palette:pal({meadow:'#ecd7a6',meadowD:'#d9bf8a',path:'#fbeecb',pathEdge:'#cfae78',mid:'#f0dfb4',near:'#e3cb98',fg:'#cfae78',fg2:'#d9bf8a',mountA:'#b9dcd8',mountB:'#9ccbc9',sea:'#5fb9c4',leafA:'#4f8f68',leafB:'#6fae6f',leafC:'#a8c97a',trunk:'#a88a66',stone:'#c9c2b0'}),animals:['crab','turtle','bird']},
  ice:{sky:['#7fb4d2','#c6e2e8','#f6f1e2'],cloudShade:'#c3d6e0',palette:pal({meadow:'#e9f1f0',meadowD:'#c9dfe6',path:'#fbf8ee',pathEdge:'#a9cddb',mid:'#dcebee',near:'#cde0e8',fg:'#b5d2de',fg2:'#cde0e8',mountA:'#b9d6e6',mountB:'#9cc3d8',sea:'#6fa9c6',leafA:'#5f8f8f',leafB:'#7fa9a6',leafC:'#eaf2ef',trunk:'#8f7b6c',stone:'#b9d0da',pine:'#5f8f8a'}),animals:['penguin']},
  clouds:{sky:['#5f9be6','#b9b2ee','#ffd2a8'],cloudShade:'#f0b9c6',palette:pal({meadow:'#e9f1ff',meadowD:'#c2d6f6',path:'#ffeec2',pathEdge:'#f2bfa6',mid:'#fbe9f1',near:'#dfeaff',fg:'#b9cdf4',fg2:'#d2e0fa',mountA:'#c9d2f6',mountB:'#f3cfe0',sea:'#f9dfe6',leafA:'#c9afd2',leafB:'#d9c2e0',trunk:'#baa4bb',stone:'#e6ecfb',cloud:'#fffdf6'}),animals:['bird']},
  moon:{sky:['#17143f','#3b2f7c','#7a5cb0'],palette:pal({meadow:'#a39fe0',meadowD:'#8581cc',path:'#f3e9d6',pathEdge:'#b9a6dc',mid:'#8e8ad2',near:'#7b76c4',fg:'#55509e',fg2:'#6f6ab8',mountA:'#5b56a8',mountB:'#6f69ba',sea:'#4a4596',leafA:'#829bb1',leafB:'#93aabf',trunk:'#7b7991',stone:'#cfcbf0',cloud:'#66728e'}),animals:['rabbit']},
  prehistoric:{sky:['#8fc0a8','#d6dba6','#f6d79c'],cloudShade:'#d6c9a6',palette:pal({meadow:'#8fa868',meadowD:'#6f8f58',path:'#e9c890',pathEdge:'#b98f5e',mid:'#7fa67a',near:'#5f8a5e',fg:'#3f6a48',fg2:'#5a8552',mountA:'#b0c4b0',mountB:'#93b0a0',sea:'#7fb9a6',leafA:'#3f7550',leafB:'#5c9458',leafC:'#9cbc6a',trunk:'#8f7052',stone:'#a9a593'}),animals:['dinosaur','bird']},
  desert:{sky:['#e88f78','#f6c79a','#fdeec6'],cloudShade:'#e6b9a0',palette:pal({meadow:'#e9c48c',meadowD:'#d6a873',path:'#fbe2b4',pathEdge:'#c98f62',mid:'#efcf9c',near:'#e0b47e',fg:'#c98f62',fg2:'#d6a873',mountA:'#d99a86',mountB:'#c9806f',sea:'#e6b98a',leafA:'#5f8a62',leafB:'#7fa56f',leafC:'#a9c088',trunk:'#a87f5e',stone:'#c99a7c'}),animals:['rabbit','tortoise']},
  peluches:{sky:['#f8dfd2','#fbe8d9','#fdf0df'],cloudShade:'#ecd2c6',palette:pal({meadow:'#f1d6cc',meadowD:'#e4c0b6',path:'#fff5e2',pathEdge:'#dba9a4',mid:'#ecd6b8',near:'#dfc4a0',fg:'#c7b5e2',fg2:'#b7a3d8',mountA:'#f2cdc4',mountB:'#eabfb6',sea:'#e3c49c',leafA:'#8fb8a6',leafB:'#a9cdb8',leafC:'#cfe3c6',trunk:'#b98f6c',stone:'#d9cbbd'}),animals:['rabbit']},
  fairy:{sky:['#a9b6e2','#e6cfe2','#fff0d2'],cloudShade:'#dcc6dc',palette:pal({meadow:'#a6c394',meadowD:'#86a884',path:'#fbe6dc',pathEdge:'#d9aebd',mid:'#b9d2ae',near:'#98ba96',fg:'#6f9a80',fg2:'#86a884',mountA:'#c6c0e6',mountB:'#b0abda',sea:'#a9d2d6',leafA:'#7fa894',leafB:'#9cc0a0',leafC:'#c9deb0',trunk:'#a48a8c',stone:'#c9c2d6',blossom:'#e7a9c6',blossomL:'#f3cddd',roof:'#d98ba6'}),animals:['unicorn','rabbit','butterfly']}
};
export function paintHabitat(kind,K){
  const {el,wa,W,blob,R,pick,ridge,smooth,tree,mushroom,flower,thrift,fringe,sway,f1,groundY,pathWidth,meadowEdge,midY,nearY,layers,widths,S}=K;
  const {sky,mountains,valley,mid,near,grove,ground,foreground,top}=layers,{mid:mw,near:nw,ground:gw,foreground:fw}=widths;
  for(const layer of [mountains,valley,mid,near,grove,ground,foreground,top])layer.replaceChildren();
  const {group,path,stroke,ellipse,tint}=S,C=hex=>tint(hex);
  const roadTop=x=>groundY(x)-pathWidth(x)*.72,roadBot=x=>groundY(x)+pathWidth(x);
  const every=(w,a,b,fn,start=a*.4)=>{let i=0;for(let x=start;x<w;x+=R(a,b))fn(x,i++);};
  const hill=(layer,w,yf,wash,rim=.16)=>{el('path',{d:ridge(w,yf),...wa(wash,2.4,rim)},layer);if(layer!==ground&&layer!==foreground)S.shadeRidge(layer,w,yf,wash.hex);};
  const spots=(layer,w,yf,color,n,op=.3)=>{for(let i=0;i<n;i++){const x=R(0,w);path(layer,blob(x,yf(x)+R(30,110),R(50,150),R(10,26),9,.2),S.speck(color,3),{opacity:Math.min(.9,op*2.2)});}};
  const fy=x=>712+12*Math.sin(x/160)+6*Math.sin(x/57);
  // Every world keeps exactly the same walkable plane, trail and foreground band.
  function terrain({verge=.3}={}){
    hill(ground,gw,meadowEdge,W.meadow,.2);
    for(let i=0;i<Math.ceil(gw/60);i++){const x=R(-150,gw),y=R(meadowEdge(x)+30,790);path(ground,blob(x,y,R(40,150),R(9,24),9,.2),S.speck(pick([W.meadowD.hex,W.near.hex]),3),{opacity:.7});}
    for(const extra of [13,0]){const a=[],b=[];for(let x=-200;x<=gw;x+=30){const w=pathWidth(x)+extra;a.push([x,groundY(x)-w*.72]);b.unshift([x,groundY(x)+w]);}
      path(ground,smooth(a,false)+smooth(b,false).replace(/^M/,'L')+'Z',extra?W.pathEdge.fill:W.path.fill,{opacity:extra?verge:.95});}
    hill(foreground,fw,fy,W.fg,.2);
  }
  /* ---------- props ---------- */
  const shell=(g,x,y,s=1,c='#eeb7a2')=>{const n=group(g,x,y,s);path(n,'M0 2Q-34-2-27-26Q-12-48 10-36Q34-24 27-4Q14 4 0 2Z',c,{stroke:'#b98f7c','stroke-width':1.6,'stroke-opacity':.5});for(let i=-2;i<=2;i++)stroke(n,`M0 0Q${i*8} -14 ${i*11} -30`,'#fff3dc',2,{opacity:.8});ellipse(n,0,3,7,3,'#fff3dc');};
  const starfish=(g,x,y,s=1,c='#e99a7c')=>{const n=group(g,x,y,s);let d='';for(let i=0;i<5;i++){const a=i/5*6.283-1.57,b=a+.628;d+=`${i?'L':'M'}${f1(Math.cos(a)*20)} ${f1(Math.sin(a)*13)}L${f1(Math.cos(b)*8)} ${f1(Math.sin(b)*5.4)}`;}
    path(n,d+'Z',c,{stroke:'#b9705c','stroke-width':1.4,'stroke-opacity':.4,'stroke-linejoin':'round'});for(let i=0;i<5;i++){const a=i/5*6.283-1.57;el('circle',{cx:f1(Math.cos(a)*9),cy:f1(Math.sin(a)*6),r:1.5,fill:'#fff0d8',opacity:.85},n);}};
  const sandcastle=(g,x,y,s=1)=>{const n=group(g,x,y,s),c=C('#f0d9a4');path(n,'M-34 0V-24H-22V-34H-12V-24H12V-34H22V-24H34V0Z',c.fill,{stroke:c.edge,'stroke-width':1.6,'stroke-opacity':.3});path(n,'M-12-24V-50H12V-24Z',c.fill);path(n,'M-15-50L0-66L15-50Z','#e59aa4');
    path(n,'M-6 0V-12a6 6 0 0 1 12 0V0Z','#c9a56c');stroke(n,'M0-66V-82','#8a6a52',1.6);path(n,'M0-82L14-77L0-72Z','#6fbfb8');ellipse(n,0,2,44,5,'#d9bf8a',{opacity:.6});};
  const hut=(g,x,y,s,c)=>{const n=group(g,x,y,s);path(n,'M-17 0V-30H17V0Z','#fbf3e4');for(const dx of [-11,1,13])path(n,`M${dx-4} 0V-30h5V0Z`,c);path(n,'M-22-28L0-48L22-28Z',c);path(n,'M-5 0V-16H5V0Z','#8a6a52');};
  const driftwood=(g,x,y,s)=>{const n=group(g,x,y,s);stroke(n,'M-34-2Q-6-12 34-6','#b59a7c',9);stroke(n,'M-34-2Q-6-12 34-6','#d6c1a2',4,{opacity:.6});stroke(n,'M8-9l12-14','#b59a7c',5);};
  const snowPine=(g,x,y,s)=>{const n=group(g,x,y,s),c=sway(n,'-44,-150,44,6');path(c,'M-5 0V-24H5V0Z',W.trunk.fill);
    for(const [yy,w] of [[-22,40],[-58,31],[-92,22]]){path(c,`M0 ${yy-50}L${w} ${yy+8}Q0 ${yy+18} ${-w} ${yy+8}Z`,W.pine.fill);path(c,`M0 ${yy-50}L${w*.62} ${yy-14}Q${w*.3} ${yy-6} ${w*.1} ${yy-16}Q${-w*.2} ${yy-4} ${-w*.62} ${yy-14}Z`,'#f6fbf8');}};
  const igloo=(g,x,y,s)=>{const n=group(g,x,y,s),c=C('#eef4f2');el('path',{d:'M-46 0Q-46-50 0-50Q46-50 46 0Z',...wa(c,2,.25)},n);for(const d of ['M-44-14H44','M-36-30H36','M-22-43H22','M-22-14V0M0-14V0M22-14V0M-12-30V-14M12-30V-14M0-43V-30'])stroke(n,d,'#a9cddb',1.6,{opacity:.6});
    path(n,'M-15 0V-17a15 15 0 0 1 30 0V0Z','#6f9db5');path(n,'M-21 0V-18a21 21 0 0 1 42 0V0h-6V-17a15 15 0 0 0-30 0V0Z','#dfeaec');};
  const snowman=(g,x,y,s)=>{const n=group(g,x,y,s),c=C('#f6f8f4');for(const [yy,r] of [[-17,19],[-44,14],[-65,10.5]])el('circle',{cx:0,cy:yy,r,...wa(c,2,.2)},n);
    for(const dx of [-3.6,3.6])el('circle',{cx:dx,cy:-67,r:1.4,fill:'#3a3835'},n);path(n,'M0-64l11 2.4-11 1.8Z','#e7a35f');stroke(n,'M-9-55Q0-50 10-55','#d98b93',4);stroke(n,'M7-53l3 12','#d98b93',4);
    stroke(n,'M-13-46l-15-9M13-46l15-11','#8f7b6c',2);path(n,'M-9-74h18v-11h-18Z','#5f7f8f');path(n,'M-13-73h26v-3.4h-26Z','#5f7f8f');};
  const floe=(g,x,y,w)=>{path(g,`M${x-w} ${y}L${x-w*.7} ${y-7}L${x+w*.5} ${y-9}L${x+w} ${y-2}L${x+w*.6} ${y+5}L${x-w*.5} ${y+6}Z`,'#f4f9f6');path(g,`M${x-w} ${y}L${x-w*.5} ${y+6}L${x+w*.6} ${y+5}L${x+w} ${y-2}L${x+w*.5} ${y+1}L${x-w*.6} ${y+2}Z`,'#a9cfe0',{opacity:.8});};
  const balloon=(g,x,y,s,c1,c2)=>{const n=group(g,x,y,s);path(n,'M0-78Q38-78 38-42Q38-14 9 6H-9Q-38-14-38-42Q-38-78 0-78Z',c1);path(n,'M0-78Q14-60 14-42Q14-14 5 6H-5Q-14-14-14-42Q-14-60 0-78Z',c2);path(n,'M0-78Q38-78 38-42Q38-14 9 6Q30-20 22-52Q16-72 0-78Z','#5a4a6a',{opacity:.12});
    stroke(n,'M-8 7l2 12M8 7l-2 12','#8a7a8a',1.2);path(n,'M-8 19h16l-2 11h-12Z','#c9a26a');};
  const starDrop=(g,x,y,s,len)=>{const n=group(g,x,y,s);stroke(n,`M0 ${-len}V-8`,'#fff8e2',1.2,{opacity:.7});path(n,'M0-10l3 6.6 7.2.8-5.4 4.9 1.5 7.1L0 5.6l-6.3 3.8 1.5-7.1-5.4-4.9 7.2-.8Z','#f6dc8f',{stroke:'#d9b860','stroke-width':1,'stroke-opacity':.5});};
  const crater=(g,x,y,s=1)=>{const n=group(g,x,y,s);ellipse(n,0,0,42,12,'#6a63bc');ellipse(n,0,3.4,34,7.6,'#544da4');stroke(n,'M-42 0Q0-21 42 0','#e6e0fb',3,{opacity:.8});ellipse(n,8,5,14,2.6,'#8fe0d2',{opacity:.35});};
  const glowshroom=(g,x,y,s,c='#8fe0d2')=>{const n=group(g,x,y,s);ellipse(n,0,-16,30,26,c,{opacity:.13});for(const [dx,h,r] of [[0,-22,13],[14,-12,8]]){path(n,`M${dx-3} 0Q${dx-4} ${h*.6} ${dx-2} ${h}h5Q${dx+5} ${h*.6} ${dx+4} 0Z`,'#dfe6f2');path(n,`M${dx-r} ${h}Q${dx-r} ${h-r*1.1} ${dx+.5} ${h-r*1.15}Q${dx+r+1} ${h-r*1.1} ${dx+r+1} ${h}Z`,c);for(let i=0;i<3;i++)el('circle',{cx:f1(dx+R(-r*.6,r*.6)),cy:f1(h-R(3,r*.8)),r:1.6,fill:'#f6fffb',opacity:.9},n);}};
  const dome=(g,x,y,s)=>{const n=group(g,x,y,s);ellipse(n,0,-14,58,44,'#fdf0c0',{opacity:.14});path(n,'M-40 0Q-40-42 0-42Q40-42 40 0Z','#e6e0fb',{stroke:'#8f86d6','stroke-width':2,'stroke-opacity':.5});path(n,'M-40 0Q-40-42 0-42Q-18-30-20 0Z','#ffffff',{opacity:.5});for(const dx of [-20,2,22])el('rect',{x:dx-6,y:-20,width:12,height:11,rx:5,fill:'#fdf0c0'},n);path(n,'M-7 0V-9a7 7 0 0 1 14 0V0Z','#8f86d6');stroke(n,'M0-42V-58','#cfcbf0',2);el('circle',{cx:0,cy:-60,r:3.4,fill:'#f0a6c0'},n);};
  const starflower=(g,x,y,s,c)=>{const n=group(g,x,y,s);ellipse(n,0,-26,16,16,c,{opacity:.2});stroke(n,'M0 0Q3-12 0-22','#6fc7b8',2.4);path(n,'M0-36l3 7 7.4.8-5.6 5 1.6 7.4L0-19.6l-6.4 3.8 1.6-7.4-5.6-5 7.4-.8Z',c);el('circle',{cx:0,cy:-26,r:2.4,fill:'#fffdf0'},n);path(n,'M0-4Q-10-8-12-2Q-6 2 0-4Z','#6fc7b8');};
  const rocket=(g,x,y,s)=>{const n=group(g,x,y,s);path(n,'M-20 0L-13-22H-22ZM20 0L13-22H22Z','#d98b93');path(n,'M0-92Q20-66 15-12H-15Q-20-66 0-92Z','#f1ecf2',{stroke:'#8a86a0','stroke-width':1.6,'stroke-opacity':.4});path(n,'M0-92Q11-78 13-62H-13Q-11-78 0-92Z','#d98b93');
    el('circle',{cx:0,cy:-44,r:8,fill:'#8fd0d6',stroke:'#6f79a0','stroke-width':2.4},n);path(n,'M-10-12h20l-3 9h-14Z','#6f79a0');ellipse(n,0,2,30,5,'#474f72',{opacity:.35});};
  const flag=(g,x,y,s,c)=>{const n=group(g,x,y,s);stroke(n,'M0 0V-46','#d6d6e6',2);path(n,'M0-46Q11-50 22-44Q11-38 0-34Z',c);};
  const volcano=(g,x,y,s)=>{const n=group(g,x,y,s),c=C('#9a8f84');el('path',{d:'M-250 300L-70 26Q-40 8-12 22Q20 4 54 24L260 300Z',...wa(c,2,.2)},n);path(n,'M-70 26Q-40 8-12 22Q20 4 54 24L78 62L46 46L26 86L0 52L-26 92L-44 50L-84 70Z','#f09a5c');path(n,'M-44 30Q-12 16 0 26Q20 14 40 28L20 44L0 36L-22 48Z','#f8cf7a');
    for(const [dx,dy,r,o] of [[-6,-18,26,.5],[18,-58,36,.42],[-14,-104,46,.34],[26,-156,56,.26]])el('circle',{cx:dx,cy:dy,r,fill:'#f6efe0',opacity:o},n);for(const d of ['M-150 170q30-14 60 4','M60 150q40-10 80 8','M-60 240q50-12 100 6'])stroke(n,d,'#6f6a60',5,{opacity:.2});};
  const treeFern=(g,x,y,s)=>{const n=group(g,x,y,s),t=el('g',{class:'still','data-b':'-18,-190,18,8'},n);el('path',{d:'M-12 0Q-6-90-9-180H9Q8-90 13 0Z',...wa(W.trunk,2,.2)},t);for(let k=1;k<12;k++)stroke(t,`M-9 ${-k*15}q9 5 18 0`,'#5f4a38',2,{opacity:.35});
    const c=sway(n,'-150,-250,150,-110');for(const [dx,dy,w] of [[-140,40,W.leafA],[-120,-20,W.leafB],[-60,-60,W.leafA],[0,-66,W.leafB],[62,-58,W.leafC],[122,-18,W.leafB],[140,44,W.leafA]]){stroke(c,`M0-180Q${dx*.5} ${-196+dy*.2} ${dx} ${-180+dy}`,w.edge,3);
      path(c,`M0-180Q${f1(dx*.5)} ${f1(-214+dy*.2)} ${dx} ${-180+dy}Q${f1(dx*.5)} ${f1(-166+dy*.5)} 0-180Z`,w.fill,{stroke:w.edge,'stroke-width':1.4,'stroke-opacity':.25});
      for(let j=1;j<=7;j++){const t2=j/7.5,px=dx*t2,py=-180+dy*t2*t2-18*Math.sin(t2*3.14),len=32*(1-t2*.5),a=Math.atan2(dy,dx)*57.3;for(const sd of [-1,1])ellipse(c,px,py+sd*len*.5,len*.26,len*.62,w.fill,{transform:`rotate(${f1(a+sd*16)} ${f1(px)} ${f1(py)})`});}
      stroke(c,`M0-180Q${f1(dx*.5)} ${f1(-190+dy*.3)} ${dx} ${-180+dy}`,'#dce9b4',1.6,{opacity:.4});}};
  const cycad=(g,x,y,s)=>{const n=group(g,x,y,s);path(n,'M-13 0Q-18-26 0-30Q18-26 13 0Z',W.trunk.fill);for(let k=0;k<4;k++)stroke(n,`M-12 ${-5-k*6}q12 5 24 0`,'#5f4a38',1.6,{opacity:.4});
    const c=sway(n,'-78,-98,78,-18');for(const a of [-70,-44,-18,8,34,62]){const r=a*.01745,ex=Math.sin(r)*72,ey=-28-Math.cos(r)*56;path(c,`M0-28Q${f1(ex*.5-8)} ${f1(ey-14)} ${f1(ex)} ${f1(ey)}Q${f1(ex*.5+6)} ${f1(ey+12)} 0-28Z`,pick([W.leafA,W.leafB]).fill,{stroke:W.leafA.edge,'stroke-width':1.2,'stroke-opacity':.25});stroke(c,`M0-28L${f1(ex)} ${f1(ey)}`,'#dce9b4',1.2,{opacity:.4});}};
  const nest=(g,x,y,s)=>{const n=group(g,x,y,s);ellipse(n,0,-3,30,10,'#8f7052');for(const [dx,a] of [[-11,-12],[2,6],[14,-4]])ellipse(n,dx,-15,8,11,'#f6ecd6',{transform:`rotate(${a} ${dx} -15)`,stroke:'#c9b79a','stroke-width':1.2});for(const [dx,dy] of [[-13,-18],[4,-12],[15,-19],[0,-20]])el('circle',{cx:dx,cy:dy,r:1.6,fill:'#9cbc6a'},n);
    for(let i=0;i<9;i++)stroke(n,`M${-28+i*7} -4q4-6 9 0`,'#b99a6e',2,{opacity:.8});};
  const footprint=(g,x,y,s,a)=>{const n=el('g',{transform:`translate(${f1(x)} ${f1(y)}) scale(${s})`,opacity:.26},g);ellipse(n,0,0,13,8,'#7a5c40',{transform:`rotate(${a})`});for(const [dx,dy] of [[14,-9],[18,0],[14,9]])ellipse(n,dx,dy,5.4,3.6,'#7a5c40',{transform:`rotate(${a})`});};
  const mesa=(g,x,y,w,h,wash)=>{el('path',{d:`M${x-w*1.25} ${y}L${x-w} ${y-h*.52}L${x-w*.86} ${y-h*.56}L${x-w*.8} ${y-h}H${x+w*.7}L${x+w*.78} ${y-h*.6}L${x+w} ${y-h*.52}L${x+w*1.3} ${y}Z`,...wa(wash,2,.18)},g);
    for(const [k,o] of [[.84,.22],[.7,.14],[.38,.16]])path(g,`M${x-w*.8} ${y-h*k}H${x+w*.72}l3 ${h*.06}H${x-w*.82}Z`,'#fbe2b4',{opacity:o+.06});path(g,`M${x+w*.2} ${y-h}H${x+w*.7}L${x+w*.78} ${y-h*.6}L${x+w} ${y-h*.52}L${x+w*1.3} ${y}H${x+w*.5}Z`,'#7a4a44',{opacity:.16});};
  const saguaro=(g,x,y,s=1)=>{const n=group(g,x,y,s),c=W.leafB;el('path',{d:'M-12 0V-50Q-44-50-44-74V-98Q-44-111-33-111Q-22-111-22-98V-80Q-22-71-12-71V-132Q-12-150 1-150Q15-150 15-132V-96Q30-96 30-108V-120Q30-133 41-133Q52-133 52-120V-104Q52-76 15-75V0Z',...wa(c,2,.25)},n);
    for(const d of ['M-5-140V-4','M2-143V-4','M9-140V-4','M-33-104V-76','M41-126V-100'])stroke(n,d,'#d2e2ae',1.6,{opacity:.55});for(const [dx,dy] of [[1,-152],[-33,-113],[41,-135]]){for(const a of [-1,0,1])ellipse(n,dx+a*5,dy-2,4,5.4,'#f1a9a0',{transform:`rotate(${a*26} ${dx} ${dy})`});el('circle',{cx:dx,cy:dy-1,r:2.2,fill:'#f6dc8f'},n);}};
  const barrel=(g,x,y,s)=>{const n=group(g,x,y,s);el('path',{d:'M-20 0Q-26-34 0-36Q26-34 20 0Z',...wa(W.leafB,2,.25)},n);for(const dx of [-11,-4,4,11])stroke(n,`M${dx} -2Q${dx*1.25} -22 ${dx*.4} -35`,'#d2e2ae',1.6,{opacity:.6});for(const a of [-1,0,1])ellipse(n,a*6,-38,5,6,'#e88b8f',{transform:`rotate(${a*28} 0 -34)`});el('circle',{cx:0,cy:-36,r:2.6,fill:'#f6dc8f'},n);};
  const pear=(g,x,y,s)=>{const n=group(g,x,y,s);for(const [dx,dy,rx,ry,a] of [[0,-16,15,19,0],[-17,-38,11,14,-28],[15,-42,12,15,22],[4,-64,9,11,6]]){ellipse(n,dx,dy,rx,ry,W.leafA.fill,{transform:`rotate(${a} ${dx} ${dy})`,stroke:W.leafA.edge,'stroke-width':1.4,'stroke-opacity':.3});for(let i=0;i<4;i++)el('circle',{cx:f1(dx+R(-rx*.5,rx*.5)),cy:f1(dy+R(-ry*.5,ry*.5)),r:1,fill:'#eef3d2'},n);}
    for(const [dx,dy] of [[-22,-52],[20,-58],[6,-76]])el('circle',{cx:dx,cy:dy,r:4,fill:'#e0708a'},n);};
  const agave=(g,x,y,s)=>{const n=group(g,x,y,s);for(const a of [-64,-38,-12,12,38,64]){const r=a*.01745,ex=Math.sin(r)*40,ey=-Math.cos(r)*40;path(n,`M-4 0Q${f1(ex*.5-5)} ${f1(ey*.6)} ${f1(ex)} ${f1(ey)}Q${f1(ex*.5+5)} ${f1(ey*.5)} 4 0Z`,a%24?'#8fae8a':'#7a9c80');}};
  const arch=(g,x,y,s,wash)=>{const n=group(g,x,y,s);el('path',{d:'M-90 0Q-98-80-40-104Q30-124 80-84Q104-50 98 0H58Q62-44 34-62Q-8-78-34-52Q-52-34-48 0Z',...wa(wash,2,.2)},n);for(const d of ['M-72-60q50-34 120-8','M-80-30q14-8 30-4','M64-30q14-4 26 4'])stroke(n,d,'#fbe2b4',4,{opacity:.3});};
  const toadhouse=(g,x,y,s,cap)=>{const n=group(g,x,y,s),stem=C('#fbf1e2'),c=C(cap);el('path',{d:'M-22 0Q-26-30-18-52H18Q26-30 22 0Z',...wa(stem,2,.2)},n);el('path',{d:'M-50-48Q-48-98 0-100Q48-98 50-48Q26-40 0-42Q-26-40-50-48Z',...wa(c,2.4,.25)},n);
    for(const [dx,dy,r] of [[-24,-66,7],[2,-80,8.4],[25,-62,6],[-6,-56,4],[36,-50,3.4]])ellipse(n,dx,dy,r,r*.8,'#fff8ee',{opacity:.9});path(n,'M-7 0V-17a7 7 0 0 1 14 0V0Z','#b98a8f');el('circle',{cx:3.4,cy:-9,r:1.3,fill:'#f6dc8f'},n);
    el('circle',{cx:12,cy:-32,r:5.4,fill:'#fdf0c0',stroke:'#c9a2a8','stroke-width':1.6},n);stroke(n,'M12-37.4v10.8M6.6-32h10.8','#c9a2a8',1);ellipse(n,12,-32,13,13,'#fdf0c0',{opacity:.22});};
  const lantern=(g,x,y,s)=>{const n=group(g,x,y,s);stroke(n,'M0 0V-58Q0-70 12-70','#a48a8c',3);ellipse(n,13,-56,20,20,'#fdf0c0',{opacity:.2});path(n,'M7-68h12l3 6v14l-3 5H7l-3-5v-14Z','#fdf0c0',{stroke:'#c9a26a','stroke-width':1.6});path(n,'M4-68h18l-9-8Z','#c9a26a');};
  const farCastle=(g,x,y,s)=>{const n=group(g,x,y,s);for(const [dx,w,h,c] of [[-34,20,58,'#8fb3d2'],[34,20,58,'#8fb3d2'],[0,28,92,'#e7a9c6'],[-16,14,40,'#f0cf8f'],[16,14,40,'#f0cf8f']]){path(n,`M${dx-w/2} 0V${-h}H${dx+w/2}V0Z`,'#f6eef2');path(n,`M${dx-w/2-4} ${-h}L${dx} ${-h-w*1.3}L${dx+w/2+4} ${-h}Z`,c);el('rect',{x:dx-2.6,y:-h+10,width:5.2,height:9,rx:2.6,fill:'#c9a2c0'},n);}
    path(n,'M-44 0V-26H44V0Z','#f6eef2');path(n,'M-8 0V-13a8 8 0 0 1 16 0V0Z','#c9a2c0');};
  const rainbow=(g,x,y,s=1,o=.7)=>{const c=group(g,x,y,s);['#e79ea6','#f0c08c','#f1dc98','#a9d2ae','#9cc3d8','#b9aadc'].forEach((color,i)=>stroke(c,`M${-190+i*10} 0A${190-i*10} ${190-i*10} 0 0 1 ${190-i*10} 0`,color,10.4,{opacity:o,'stroke-linecap':'butt'}));};
  const reeds=(g,x,y,s,cols,fl)=>S.grassClump(g,x,y,s,cols,fl);

  /* ---------- the seven worlds ---------- */
  const SCENES={
    beach(){
      el('path',{d:ridge(3200,x=>236+34*Math.sin(x*.0043+1)+14*Math.sin(x*.012),50,4),...wa(W.mountA,2,.14)},mountains);
      el('path',{d:ridge(3200,x=>282+26*Math.sin(x*.0057+2.4)+10*Math.sin(x*.014),50,3),...wa(W.mountB,2,.14)},mountains);
      el('rect',{x:-100,y:352,width:3500,height:700,fill:W.sea.fill},valley);
      for(const [y,h,c,o] of [[352,9,'#effaf2',.6],[361,28,'#a9dedd',.45],[389,40,'#7fcfd0',.28],[470,300,'#3f97a8',.18]])el('rect',{x:-100,y,width:3500,height:h,fill:c,opacity:o},valley);el('rect',{x:-100,y:360,width:3500,height:60,fill:S.dash('#ffffff',2)},valley);el('rect',{x:-100,y:420,width:3500,height:260,fill:S.dash('#ffffff',1)},valley);
      for(let i=0;i<170;i++)ellipse(valley,R(-80,3350),R(360,660),R(14,60),R(1.2,2.4),'#f4fbf4',{opacity:R(.3,.7)});
      for(let i=0;i<120;i++){const x=R(-80,3350),y=R(372,660);stroke(valley,`M${f1(x)} ${f1(y)}q6-5 12 0q6-5 12 0`,'#fff',1.8,{opacity:.5});}
      every(3300,320,560,x=>{const y=R(380,402),w=R(26,54);ellipse(valley,x,y+3,w*1.3,3.4,'#f4fbf4',{opacity:.75});el('path',{d:smooth([[x-w,y+2],[x-w*.5,y-w*.4],[x+w*.1,y-w*.62],[x+w*.6,y-w*.36],[x+w,y+2],[x,y+6]],true),...wa(W.stone,2,.2)},valley);});
      every(3300,640,980,(x,i)=>S.boat(valley,x,R(376,392),R(.4,.62),pick(['#fbf3e4','#f6c9c0','#fde9c4']),pick(['#c9806f','#5f8fa8','#d9a45e'])),300);
      S.lighthouse(valley,1180,382,.95);S.lighthouse(valley,2760,380,.8);
      for(const [g,w,yf,wash,k] of [[mid,mw,midY,W.mid,.62],[near,nw,nearY,W.near,1]]){
        hill(g,w,yf,wash);spots(g,w,yf,'#fff6dc',Math.ceil(w/160),.35);
        every(w,70,150,x=>reeds(g,x,yf(x)+R(6,22),k*R(.55,.95),['#a9a566','#8f9a62','#c6bd7e']));
        every(w,520,820,(x,i)=>{if(i%3===1&&g===mid){for(let j=0;j<3;j++)hut(g,x+j*30,yf(x+j*30)+8,.8,['#e59aa4','#6fbfb8','#e0ad4c'][j]);}else S.palm(g,x,yf(x)+10,k*R(.5,.68),{lean:R(8,26)});});
        every(w,340,620,x=>S.boulder(g,x,yf(x)+16,k*R(.6,1)),200);
      }
      every(gw*.8,760,1100,x=>S.palm(grove,x,meadowEdge(x)+74,R(1.25,1.55),{lean:R(14,30)}),300);
      terrain();
      every(gw,150,250,(x,i)=>{const up=roadTop(x)-R(18,70),dn=roadBot(x)+R(26,90);
        [()=>shell(ground,x,up,R(.5,.75),pick(['#eeb7a2','#f6d9c0','#d9c2dc'])),()=>starfish(ground,x,up,R(.7,1),pick(['#e99a7c','#f0b866'])),()=>S.boulder(ground,x,up,R(.5,.8)),()=>reeds(ground,x,up,R(.6,.9),['#a9a566','#8f9a62','#c6bd7e']),()=>driftwood(ground,x,up,R(.6,.9)),()=>sandcastle(ground,x,up,R(.6,.8))][i%6]();
        if(i%2)shell(ground,x+70,dn,R(.5,.8),pick(['#eeb7a2','#fff0dc']));else starfish(ground,x+60,dn,R(.8,1.1),pick(['#e99a7c','#f0b866','#e59aa4']));
        S.castShadow(ground,x,up+3,26,4);});
      every(fw,130,250,(x,i)=>{i%3?shell(foreground,x,fy(x)+30,R(1.1,1.6),pick(['#eeb7a2','#f6d9c0'])):reeds(foreground,x,fy(x)+34,R(1.4,2),['#8f9a62','#a9a566','#6f8a5c']);});
      return (x,y,k,i)=>[()=>shell(ground,x,y,k*.8,pick(['#eeb7a2','#f6d9c0','#d9c2dc'])),()=>starfish(ground,x,y,k,pick(['#e99a7c','#f0b866'])),()=>driftwood(ground,x,y,k),()=>S.boulder(ground,x,y,k*.8),()=>sandcastle(ground,x,y,k*.8),()=>reeds(ground,x,y,k,['#a9a566','#8f9a62','#c6bd7e'])][i%6]();
    },
    ice(){
      const peaks=(yb,h0,h1,wash,step)=>{for(let x=-100;x<3300;x+=R(step*.7,step)){const h=R(h0,h1),w=h*R(.8,1.1);el('path',{d:`M${x-w} ${yb}L${x-w*.24} ${yb-h*.72}L${x} ${yb-h}L${x+w*.3} ${yb-h*.66}L${x+w} ${yb}Z`,...wa(wash,2,.14)},mountains);
        path(mountains,`M${x} ${yb-h}L${x+w*.3} ${yb-h*.66}L${x+w} ${yb}H${x+w*.2}Z`,'#4f7fa0',{opacity:.16});path(mountains,`M${x-w*.32} ${yb-h*.62}L${x-w*.24} ${yb-h*.72}L${x} ${yb-h}L${x+w*.3} ${yb-h*.66}L${x+w*.18} ${yb-h*.56}L${x+w*.04} ${yb-h*.7}L${x-w*.1} ${yb-h*.5}Z`,'#fbfdfb');}};
      peaks(420,170,300,W.mountA,360);peaks(430,90,170,W.mountB,250);
      el('rect',{x:-100,y:356,width:3500,height:700,fill:W.sea.fill},valley);el('rect',{x:-100,y:356,width:3500,height:12,fill:'#eaf6f6',opacity:.6},valley);el('rect',{x:-100,y:362,width:3500,height:60,fill:S.dash('#ffffff',2)},valley);el('rect',{x:-100,y:422,width:3500,height:260,fill:S.dash('#ffffff',1)},valley);
      for(let i=0;i<130;i++)floe(valley,R(-60,3350),R(368,650),R(16,60));
      for(let i=0;i<40;i++)ellipse(valley,R(-80,3350),R(364,470),R(14,50),1.6,'#fff',{opacity:R(.3,.6)});
      every(3300,700,1000,x=>{const y=R(372,388);path(valley,`M${x-60} ${y}L${x-34} ${y-58}L${x-8} ${y-36}L${x+18} ${y-84}L${x+62} ${y}Z`,'#f4f9f6');path(valley,`M${x+18} ${y-84}L${x+62} ${y}H${x+6}Z`,'#9cc3d8',{opacity:.6});ellipse(valley,x,y+2,74,4,'#fff',{opacity:.6});});
      for(const [g,w,yf,wash,k] of [[mid,mw,midY,W.mid,.62],[near,nw,nearY,W.near,1]]){
        hill(g,w,yf,wash);spots(g,w,yf,'#ffffff',Math.ceil(w/140),.5);spots(g,w,yf,'#a9cddb',Math.ceil(w/260),.25);
        every(w,150,330,(x,i)=>{const y=yf(x)+10;i%7===3?igloo(g,x,y+6,k*.9):i%5===2?S.crystal(g,x,y+4,k*R(.8,1.3)):snowPine(g,x,y,k*R(.6,1));});
        every(w,900,1500,x=>snowman(g,x,yf(x)+16,k*.9),520);
      }
      terrain({verge:.5});
      for(let i=0;i<Math.ceil(gw/110);i++){const x=R(-150,gw),y=R(meadowEdge(x)+40,780);stroke(ground,`M${f1(x-R(30,70))} ${f1(y)}Q${f1(x)} ${f1(y-R(8,16))} ${f1(x+R(30,70))} ${f1(y)}`,'#a9cddb',R(3,6),{opacity:.3});}
      every(gw,150,250,(x,i)=>{const up=roadTop(x)-R(18,70),dn=roadBot(x)+R(26,90);
        [()=>S.crystal(ground,x,up,R(.45,.7)),()=>{ellipse(ground,x,up,R(34,54),8,'#9cc8dc',{opacity:.7});ellipse(ground,x-8,up-2,16,2.4,'#fff',{opacity:.7});},()=>S.boulder(ground,x,up,R(.6,.9),C('#eef4f2')),()=>snowPine(ground,x,up,R(.5,.7)),()=>S.boulder(ground,x,up,R(.5,.8),W.stone,'#f6fbf8')][i%5]();
        i%3?S.crystal(ground,x+70,dn,R(.4,.6)):S.boulder(ground,x+70,dn,R(.6,1),C('#eef4f2'));});
      every(fw,140,260,(x,i)=>{i%2?S.crystal(foreground,x,fy(x)+38,R(.9,1.3)):S.boulder(foreground,x,fy(x)+30,R(1.3,1.9),C('#eef4f2'));});
      return (x,y,k,i)=>[()=>S.crystal(ground,x,y,k*.6),()=>S.boulder(ground,x,y,k*.9,C('#eef4f2')),()=>snowPine(ground,x,y,k*.7),()=>{ellipse(ground,x,y,50*k,9*k,'#9cc8dc',{opacity:.7});ellipse(ground,x-8,y-2,18*k,2.6,'#fff',{opacity:.7});},()=>snowman(ground,x,y,k*.8)][i%5]();
    },
    clouds(){
      ellipse(sky,820,250,210,210,'#fff0c4',{opacity:.35});ellipse(sky,820,250,120,120,'#fff6d8',{opacity:.7});ellipse(sky,820,250,70,70,'#fffbea');
      for(let a=-80;a<=80;a+=20){const r=a*.01745;path(sky,`M820 250L${f1(820+Math.sin(r-.05)*900)} ${f1(250-Math.cos(r-.05)*900)}L${f1(820+Math.sin(r+.05)*900)} ${f1(250-Math.cos(r+.05)*900)}Z`,'#fff6d8',{opacity:.1});}
      for(let i=0;i<16;i++)S.cloud(mountains,R(0,3200),R(190,300),R(1.6,3),i%2?'#f6d6e6':'#dfe6fb',i%2?'#e6a9c6':'#a9bce8');
      for(const x of [760,2250]){const c=group(mountains,x,236,1.25);for(const [dx,w,h] of [[-40,22,60],[40,22,60],[0,30,96],[-20,16,40],[20,16,40]]){path(c,`M${dx-w/2} 0V${-h}H${dx+w/2}V0Z`,'#fffdf6');path(c,`M${dx} 0V${-h}H${dx+w/2}V0Z`,'#f3cfe0',{opacity:.5});path(c,`M${dx-w/2-4} ${-h}L${dx} ${-h-w*1.4}L${dx+w/2+4} ${-h}Z`,'#f6c66a');el('rect',{x:dx-2.6,y:-h+10,width:5.2,height:9,rx:2.6,fill:'#9fb6ee'},c);}
        path(c,'M-52 0V-24H52V0Z','#fffdf6');path(c,'M-9 0V-14a9 9 0 0 1 18 0V0Z','#9fb6ee');S.cloud(c,-60,10,.8,'#fffdf6','#f0b9c6');S.cloud(c,50,12,.9,'#fffdf6','#f0b9c6');}
      rainbow(valley,620,404,1.2,.6);rainbow(valley,2300,410,1,.5);
      for(let r=0;r<4;r++)for(let x=-80;x<3400;x+=R(120,200))S.cloud(valley,x,R(372,384)+r*30,R(1.1,1.6)+r*.3,['#fffdf6','#fde6ee','#eaf0ff','#fffdf6'][r],['#f0b9c6','#e6a9c6','#a9bce8','#f0b9c6'][r]);
      every(3300,700,1100,x=>{const n=group(valley,x,R(300,340),R(.7,1));S.cloud(n,0,26,1.1,'#fffdf6','#f0b9c6');path(n,'M-46 8Q-40-18 0-20Q40-18 46 8Z','#a9d6a0');path(n,'M-13 0V-20H13V0Z','#fffdf6');path(n,'M-18-18L0-36L18-18Z','#e79ea6');el('rect',{x:-4,y:-12,width:8,height:12,rx:4,fill:'#c98d7c'},n);tree(n,30,-6,.26,1);},400);
      every(3300,520,820,(x,i)=>balloon(valley,x,R(250,320),R(.5,.8),['#e79ea6','#f1dc98','#9cc3d8','#b9aadc'][i%4],'#fff6ea'),260);
      for(const [g,w,yf,k,c] of [[mid,mw,midY,1.5,'#fde6ee'],[near,nw,nearY,2,'#fffdf6']]){
        hill(g,w,yf,g===mid?W.mid:W.near,.1);
        for(let x=-100;x<w;x+=R(90,150)*k)S.cloud(g,x,yf(x)+12,k*R(.9,1.3),c,g===mid?'#e6a9c6':'#a9bce8');
        every(w,620,980,(x,i)=>{if(i%2)balloon(g,x,yf(x)-R(70,130),k*R(.34,.44),['#f0c08c','#a9d2ae','#e79ea6'][i%3],'#fff6ea');else for(let j=0;j<3;j++)starDrop(g,x+j*34,yf(x)-R(40,90),k*.5,R(60,120));});
      }
      terrain({verge:.5});
      for(let x=-160;x<gw;x+=R(70,120))S.cloud(ground,x,meadowEdge(x)+10,R(.7,1.1),'#fffdf6','#a9bce8');
      every(gw,150,250,(x,i)=>{const up=roadTop(x)-R(22,70),dn=roadBot(x)+R(30,90);
        [()=>S.cloud(ground,x,up,R(.4,.6),'#fffdf6','#a9bce8'),()=>starDrop(ground,x,up,R(.9,1.3),0),()=>S.crystal(ground,x,up,R(.4,.6),{light:'#fff6ea',mid:'#f1dc98',dark:'#e7b98a'}),()=>{path(ground,`M${x-12} ${up-20}a16 16 0 1 0 20 20a12 12 0 1 1-20-20Z`,'#f6dc8f');}][i%4]();
        S.cloud(ground,x+70,dn,R(.5,.8),'#fffdf6','#a9bce8');});
      every(fw,150,260,x=>S.cloud(foreground,x,fy(x)+34,R(1,1.7),'#fffdf6','#a9bce8'));
      return (x,y,k,i)=>[()=>S.cloud(ground,x,y,k*.8,'#fffdf6','#a9bce8'),()=>starDrop(ground,x,y,k*1.3,0),()=>S.crystal(ground,x,y,k*.6,{light:'#fff6ea',mid:'#f1dc98',dark:'#e7b98a'})][i%3]();
    },
    moon(){
      sky.replaceChildren();
      for(let i=0;i<14;i++)path(sky,blob(R(0,2400),R(-600,380),R(160,420),R(40,110),9,.25),S.speck(pick(['#b48ae0','#6fc7d6','#e69ac8']),2,1.4),{opacity:.5});
      for(let i=0;i<260;i++){const x=R(0,2400),y=R(-750,430),r=R(.8,2.6);ellipse(sky,x,y,r,r,pick(['#fff6dc','#dfe9ff','#ffe6f0']),{opacity:R(.45,1)});}
      for(let i=0;i<26;i++){const x=R(0,2400),y=R(-700,360),k=R(.8,1.8);path(sky,`M${f1(x)} ${f1(y-6*k)}q${f1(k)} ${f1(5*k)} ${f1(6*k)} ${f1(6*k)}q${f1(-5*k)} ${f1(k)} ${f1(-6*k)} ${f1(6*k)}q${f1(-k)} ${f1(-5*k)} ${f1(-6*k)} ${f1(-6*k)}q${f1(5*k)} ${f1(-k)} ${f1(6*k)} ${f1(-6*k)}Z`,'#fff6dc',{opacity:.9});}
      const planet=group(mountains,1500,150,1);stroke(planet,'M-78 10Q0 34 78-12','#f6dc8f',7,{opacity:.9});ellipse(planet,0,0,44,44,'#f0a6c0');for(const d of ['M-40-12Q0-24 40-8','M-42 10Q0-2 42 14'])stroke(planet,d,'#f8cfe0',6,{opacity:.8});path(planet,'M0-44A44 44 0 0 1 0 44A30 44 0 0 0 0-44Z','#3b2f7c',{opacity:.2});stroke(planet,'M-78 10Q-30 30 20 22','#f6dc8f',7,{opacity:.9});
      for(const [x,y,l] of [[900,60,150],[2300,110,120]]){stroke(mountains,`M${x} ${y}l${l} ${-l*.36}`,'#fff6dc',3,{opacity:.6});path(mountains,`M${x} ${y-7}l2.4 5 5 2-5 2-2.4 5-2.4-5-5-2 5-2Z`,'#fff6dc');}
      const earth=group(mountains,520,180,1);ellipse(earth,0,0,118,118,'#9fd6e6',{opacity:.16});ellipse(earth,0,0,96,96,'#6fb3d6');
      for(const d of ['M-70-40Q-40-78 6-70Q30-50 10-28Q-16-22-28 4Q-52 6-70-40Z','M24 6Q60-8 78 22Q74 58 42 66Q20 48 24 6Z','M-50 40Q-22 30-6 54Q-22 78-50 66Z'])path(earth,d,'#8fc79a');
      for(const d of ['M-84-10Q-30-26 40-12','M-60 22Q10 8 88 30','M-30-56Q20-64 66-44'])stroke(earth,d,'#f6fbff',7,{opacity:.55});path(earth,'M0-96A96 96 0 0 1 0 96A70 96 0 0 0 0-96Z','#1f2a4a',{opacity:.22});
      el('path',{d:ridge(3200,x=>300+52*Math.sin(x/310)+18*Math.sin(x/97),40,6),...wa(W.mountA,2,.2)},mountains);
      el('path',{d:ridge(3400,x=>372+30*Math.sin(x/190+1)+10*Math.sin(x/61),40,4),...wa(W.mountB,2,.2)},valley);
      for(let i=0;i<40;i++){const x=R(0,3400);crater(valley,x,R(400,470),R(.4,.9));}
      rocket(valley,1540,388,.7);flag(valley,1600,390,.7,'#e79ea6');rocket(valley,2900,392,.6);
      for(const [g,w,yf,wash,k] of [[mid,mw,midY,W.mid,.7],[near,nw,nearY,W.near,1]]){
        hill(g,w,yf,wash,.25);spots(g,w,yf,'#474f72',Math.ceil(w/200),.22);
        every(w,170,330,(x,i)=>{const y=yf(x)+18;i%4===0?S.crystal(g,x,y,k*R(.7,1.2),{light:'#e6fbf6',mid:'#8fd6d0',dark:'#5fa9b0',glow:'#8fe0d2'}):i%4===1?glowshroom(g,x,y,k*R(1,1.6),pick(['#8fe0d2','#c9aef0','#f0b6d6'])):i%4===2?crater(g,x,y+8,k*R(.8,1.3)):S.boulder(g,x,y,k*R(.8,1.3));});
        every(w,1100,1700,(x,i)=>{if(i%2){rocket(g,x,yf(x)+14,k*.9);flag(g,x+50*k,yf(x)+16,k,pick(['#e79ea6','#f1dc98','#9cc3d8']));}else dome(g,x,yf(x)+16,k*1.1);},500);
        every(w,120,240,x=>starflower(g,x,yf(x)+R(14,30),k*R(.7,1.1),pick(['#f6dc8f','#8fe0d2','#f0a6c0'])),90);
      }
      terrain({verge:.45});
      for(let i=0;i<Math.ceil(gw/120);i++){const x=R(-150,gw),y=R(meadowEdge(x)+30,790);if(y>roadTop(x)-16&&y<roadBot(x)+16)continue;crater(ground,x,y,R(.3,.9)*(.5+(y-270)/700));}
      every(gw,150,250,(x,i)=>{const up=roadTop(x)-R(20,70),dn=roadBot(x)+R(30,90);
        [()=>glowshroom(ground,x,up,R(.9,1.3),pick(['#8fe0d2','#f6dc8f','#f0b6d6'])),()=>S.crystal(ground,x,up,R(.4,.6),{light:'#e6fbf6',mid:'#8fd6d0',dark:'#5fa9b0',glow:'#8fe0d2'}),()=>starflower(ground,x,up,R(1,1.4),pick(['#f6dc8f','#f0a6c0'])),()=>S.boulder(ground,x,up,R(.6,.9)),()=>dome(ground,x,up,R(.5,.65)),()=>flag(ground,x,up,1,pick(['#e79ea6','#f1dc98']))][i%6]();starflower(ground,x+40,up+R(-6,10),R(.7,1),'#8fe0d2');
        i%2?glowshroom(ground,x+70,dn,R(1,1.4),'#f0b6d6'):starflower(ground,x+70,dn,R(1.2,1.6),'#f6dc8f');});
      every(fw,150,260,(x,i)=>{i%2?S.crystal(foreground,x,fy(x)+38,R(.9,1.3),{light:'#e6fbf6',mid:'#8fd6d0',dark:'#5fa9b0',glow:'#8fe0d2'}):S.boulder(foreground,x,fy(x)+30,R(1.3,1.9));});
      return (x,y,k,i)=>[()=>starflower(ground,x,y,k*1.5,pick(['#f6dc8f','#8fe0d2','#f0a6c0'])),()=>glowshroom(ground,x,y,k*1.3,pick(['#8fe0d2','#f6dc8f','#f0b6d6'])),()=>S.crystal(ground,x,y,k*.6,{light:'#e6fbf6',mid:'#8fd6d0',dark:'#5fa9b0',glow:'#8fe0d2'}),()=>S.boulder(ground,x,y,k),()=>crater(ground,x,y,k*1.2),()=>flag(ground,x,y,k*1.2,pick(['#e79ea6','#f1dc98']))][i%6]();
    },
    prehistoric(){
      el('path',{d:ridge(3200,x=>250+40*Math.sin(x*.004+.4)+16*Math.sin(x*.011),50,4),...wa(W.mountA,2,.14)},mountains);
      for(const x of [520,1650,2780])volcano(mountains,x,118+R(-10,16),R(1.05,1.3));
      el('path',{d:ridge(3400,x=>356+16*Math.sin(x*.006)+8*Math.sin(x*.017),50,3),...wa(W.mountB,2,.14)},valley);
      for(let x=0;x<3400;x+=R(40,90)){const y=356+16*Math.sin(x*.006);path(valley,blob(x,y-R(6,22),R(26,46),R(22,36),8,.16),pick(['#86ab92','#9cbc9c','#7aa48c']),{opacity:.9});}
      el('rect',{x:-100,y:392,width:3500,height:700,fill:W.sea.fill},valley);for(let i=0;i<50;i++)ellipse(valley,R(-80,3350),R(398,470),R(16,60),1.8,'#f1f8e2',{opacity:R(.3,.6)});
      for(const [g,w,yf,wash,k] of [[mid,mw,midY,W.mid,.6],[near,nw,nearY,W.near,1]]){
        hill(g,w,yf,wash);fringe(g,w,yf,g===mid?'#6f9a6c':'#4f7a50',11,7);spots(g,w,yf,'#b9cf8a',Math.ceil(w/170),.25);
        every(w,150,300,(x,i)=>{const y=yf(x)+10;i%4===0?treeFern(g,x,y,k*R(.6,.85)):i%4===1?cycad(g,x,y+6,k*R(1,1.5)):i%4===2?S.palm(g,x,y,k*R(.5,.66),{lean:R(6,22),fruit:false}):S.boulder(g,x,y+8,k*R(.8,1.4),W.stone,'#7fa66c');});
      }
      every(gw*.8,780,1120,x=>treeFern(grove,x,meadowEdge(x)+76,R(1.45,1.75)),320);
      terrain();fringe(ground,gw,meadowEdge,'#7f9a5c',14,7);
      for(let x=200;x<gw;x+=R(520,900)){const s0=R(.8,1.2);for(let j=0;j<4;j++){const xx=x+j*44;footprint(ground,xx,groundY(xx)+(j%2?-16:16),s0,-8);}}
      every(gw,150,240,(x,i)=>{const up=roadTop(x)-R(18,70),dn=roadBot(x)+R(30,90);S.castShadow(ground,x,up+3,30,5);
        [()=>cycad(ground,x,up,R(.8,1.2)),()=>S.boulder(ground,x,up,R(.6,1),W.stone,'#7fa66c'),()=>nest(ground,x,up,R(.8,1.1)),()=>reeds(ground,x,up,R(.8,1.2),['#4b6f3c','#7f9a5c','#9db26a'],'#f1d98c'),()=>mushroom(ground,x,up,R(1,1.5))][i%5]();
        i%2?cycad(ground,x+80,dn,R(.9,1.3)):reeds(ground,x+70,dn,R(1,1.4),['#4b6f3c','#7f9a5c','#9db26a'],'#e8a37a');});
      every(fw,130,240,(x,i)=>{i%2?cycad(foreground,x,fy(x)+44,R(1.5,2.1)):reeds(foreground,x,fy(x)+40,R(1.6,2.2),['#3c5d3a','#5a8552','#7f9a5c']);});
      const scatter=(x,y,k,i)=>[()=>cycad(ground,x,y,k*1.2),()=>S.boulder(ground,x,y,k,W.stone,'#7fa66c'),()=>nest(ground,x,y,k),()=>reeds(ground,x,y,k*1.2,['#4b6f3c','#7f9a5c','#9db26a'],'#f1d98c'),()=>mushroom(ground,x,y,k*1.4)][i%5]();
      for(let x=160;x<widths.top;x+=R(700,1100)){const h=group(top,x,0,R(1,1.4)),c=sway(h,'-190,-12,190,170','sway top'),dir=R(0,1)<.5?1:-1;stroke(c,`M${-170*dir} -10Q${-40*dir} 34 ${120*dir} 60`,'#6f5a44',8);
        for(let i=0;i<6;i++){const t=i/5,bx=(-150+250*t)*dir,by=-6+62*t*t,len=R(70,120),lean=R(-22,22),w=R(22,34);path(c,`M${f1(bx)} ${f1(by)}Q${f1(bx-w+lean*.4)} ${f1(by+len*.5)} ${f1(bx+lean)} ${f1(by+len)}Q${f1(bx+w+lean*.6)} ${f1(by+len*.45)} ${f1(bx)} ${f1(by)}Z`,pick([W.leafA,W.leafB,W.leafC]).fill,{stroke:W.leafA.edge,'stroke-width':1.6,'stroke-opacity':.25});stroke(c,`M${f1(bx)} ${f1(by)}Q${f1(bx+lean*.5)} ${f1(by+len*.5)} ${f1(bx+lean)} ${f1(by+len)}`,'#dce9b4',1.6,{opacity:.5});}}
      return scatter;
    },
    desert(){
      ellipse(sky,860,150,140,140,'#fff3c9',{opacity:.5});ellipse(sky,860,150,84,84,'#fff8de',{opacity:.92});
      every(3200,330,520,x=>mesa(mountains,x,430,R(90,170),R(150,240),W.mountA),160);
      every(3200,420,700,x=>mesa(mountains,x,440,R(60,110),R(80,130),W.mountB),300);
      el('path',{d:ridge(3400,x=>366+14*Math.sin(x*.007)+8*Math.sin(x*.019),50,3),...wa(W.sea,2,.14)},valley);
      for(let i=0;i<60;i++){const x=R(0,3400),y=R(380,470);stroke(valley,`M${f1(x-40)} ${f1(y)}q40-9 80 0`,'#fbe2b4',2.4,{opacity:.45});}
      every(3300,900,1400,x=>{const y=R(384,396);ellipse(valley,x,y+6,70,9,'#7fc3c2');ellipse(valley,x-10,y+4,30,2.4,'#fff',{opacity:.6});for(const dx of [-50,-20,36])S.palm(valley,x+dx,y+2,R(.22,.3),{lean:R(4,16)});},500);
      for(const [g,w,yf,wash,k] of [[mid,mw,midY,W.mid,.62],[near,nw,nearY,W.near,1]]){
        hill(g,w,yf,wash);spots(g,w,yf,'#fbe6bd',Math.ceil(w/170),.4);
        for(let i=0;i<w/90;i++){const x=R(0,w),y=yf(x)+R(20,80);stroke(g,`M${f1(x-30)} ${f1(y)}q30-8 60 0`,'#c98f62',2,{opacity:.3});}
        every(w,170,330,(x,i)=>{const y=yf(x)+10;i%5===0?saguaro(g,x,y,k*R(.6,.95)):i%5===1?S.boulder(g,x,y+6,k*R(.8,1.4),W.stone):i%5===2?pear(g,x,y+4,k*R(.7,1)):i%5===3?agave(g,x,y+6,k*R(.8,1.2)):barrel(g,x,y+5,k*R(.7,1));});
        every(w,1200,1900,x=>arch(g,x,yf(x)+20,k*R(.8,1.1),W.stone),600);
      }
      terrain();
      every(gw,150,250,(x,i)=>{const up=roadTop(x)-R(18,70),dn=roadBot(x)+R(30,90);S.castShadow(ground,x+8,up+3,28,4.4);
        [()=>saguaro(ground,x,up,R(.5,.75)),()=>barrel(ground,x,up,R(.7,1)),()=>S.boulder(ground,x,up,R(.6,.9),W.stone),()=>pear(ground,x,up,R(.6,.9)),()=>agave(ground,x,up,R(.7,1)),()=>reeds(ground,x,up,R(.6,.9),['#b0935a','#c9ae72','#8e9a5a'])][i%6]();
        i%2?barrel(ground,x+70,dn,R(.8,1.1)):S.boulder(ground,x+70,dn,R(.7,1.1),W.stone);});
      every(fw,150,270,(x,i)=>{i%3===0?saguaro(foreground,x,fy(x)+52,R(.7,.9)):i%3===1?agave(foreground,x,fy(x)+40,R(1.5,2)):S.boulder(foreground,x,fy(x)+30,R(1.3,1.9),W.stone);});
      return (x,y,k,i)=>[()=>saguaro(ground,x,y,k*.75),()=>barrel(ground,x,y,k),()=>S.boulder(ground,x,y,k,W.stone),()=>pear(ground,x,y,k*.9),()=>agave(ground,x,y,k*1.1),()=>reeds(ground,x,y,k,['#b0935a','#c9ae72','#8e9a5a'])][i%6]();
    },
    peluches(){
      /* A child's bedroom: wallpaper and windows far away, furniture on a wooden floor, a soft carpet to walk on. */
      const PASTEL=['#f2a9b8','#f6cf8a','#a9d6c9','#b9b0e6','#f4b99a','#9fc7e8'],COATS=[['#dba56c','#f6e2c0'],['#a87a5c','#ecd3b0'],['#eeb1bd','#fdeae4'],['#f1e4cf','#fffaf0'],['#c9b08f','#f3e3c8']];
      const dot=(x,y,r)=>`M${f1(x-r)} ${f1(y)}a${f1(r)} ${f1(r)} 0 1 0 ${f1(2*r)} 0a${f1(r)} ${f1(r)} 0 1 0 ${f1(-2*r)} 0Z`;
      const starD=(x,y,r)=>{let d='';for(let i=0;i<10;i++){const a=i/10*6.283-1.571,q=i%2?r*.46:r;d+=`${i?'L':'M'}${f1(x+Math.cos(a)*q)} ${f1(y+Math.sin(a)*q)}`;}return d+'Z';};
      const heartD=(x,y,r)=>`M${f1(x)} ${f1(y+r*.9)}C${f1(x-r*1.5)} ${f1(y-r*.1)} ${f1(x-r*.6)} ${f1(y-r*1.1)} ${f1(x)} ${f1(y-r*.3)}C${f1(x+r*.6)} ${f1(y-r*1.1)} ${f1(x+r*1.5)} ${f1(y-r*.1)} ${f1(x)} ${f1(y+r*.9)}Z`;
      const rot=(a,x,y)=>({transform:`rotate(${a} ${x} ${y})`}),soft={'stroke-width':1.6,'stroke-opacity':.32,'stroke-linejoin':'round'};
      const teddy=(g,x,y,s=1,[coat,cream]=pick(COATS),bow=pick(PASTEL))=>{const n=group(g,x,y,s),c=C(coat),o={stroke:c.edge,...soft};
        ellipse(n,0,2,38,7,'#7a5a50',{opacity:.16});
        for(const sx of [-1,1]){ellipse(n,sx*27,-37,9.5,17,c.fill,{...o,...rot(sx*24,sx*27,-37)});ellipse(n,sx*21,-9,16,12,c.fill,o);ellipse(n,sx*22,-8,8.5,6.5,cream);}
        ellipse(n,0,-31,27,29,c.fill,o);ellipse(n,0,-27,16,18,cream,{opacity:.95});
        path(n,'M0-47l-14-8q-3 8 0 16Zm0 0l14-8q3 8 0 16Z',bow,{stroke:shadeOf(bow),...soft});el('circle',{cx:0,cy:-47,r:3.4,fill:bow},n);
        for(const sx of [-1,1]){el('circle',{cx:sx*21,cy:-88,r:10.5,fill:c.fill,...o},n);el('circle',{cx:sx*21,cy:-87,r:5.6,fill:cream},n);}
        ellipse(n,0,-69,28,25,c.fill,o);ellipse(n,0,-60,12.5,9.5,cream);ellipse(n,0,-64,4.4,3.2,'#5a4038');
        stroke(n,'M0-61v4M-4.5-56Q0-52.5 4.5-56','#5a4038',1.7);
        for(const sx of [-1,1]){el('circle',{cx:sx*10.5,cy:-73,r:3.2,fill:'#3d2c28'},n);el('circle',{cx:sx*10.5+1,cy:-74.2,r:1.1,fill:'#fff'},n);ellipse(n,sx*18.5,-62,5,3.2,'#f2a39c',{opacity:.55});}
        return n;};
      const shadeOf=hex=>C(hex).edge;
      const block=(g,x,y,s=1,color=pick(PASTEL),mark=0)=>{const n=group(g,x,y,s),c=C(color);path(n,'M-15 0V-26L-9-33H21V-7L15 0Z',c.edge,{opacity:.55});el('rect',{x:-15,y:-26,width:30,height:26,rx:3,fill:c.fill,stroke:c.edge,...soft},n);
        path(n,mark%3===0?starD(0,-13,8):mark%3===1?heartD(0,-13,7):dot(0,-13,6.5),'#fffaf0',{opacity:.9});return n;};
      const ball=(g,x,y,s=1,a=pick(PASTEL),b='#fffaf0')=>{const n=group(g,x,y,s);ellipse(n,0,1,17,4,'#7a5a50',{opacity:.16});el('circle',{cx:0,cy:-16,r:16,fill:a,stroke:shadeOf(a),...soft},n);path(n,'M-16-16Q0-26 16-16Q0-6-16-16Z',b,{opacity:.85});path(n,starD(0,-16,4.5),a);return n;};
      const rings=(g,x,y,s=1)=>{const n=group(g,x,y,s);ellipse(n,0,1,24,4.5,'#7a5a50',{opacity:.16});for(const [i,w] of [22,18,14,10].entries())ellipse(n,0,-6-i*10,w,6.5,PASTEL[(i+1)%6],{stroke:shadeOf(PASTEL[(i+1)%6]),...soft});el('circle',{cx:0,cy:-46,r:6,fill:'#f2a9b8'},n);return n;};
      const train=(g,x,y,s=1)=>{const n=group(g,x,y,s);ellipse(n,0,2,56,4,'#7a5a50',{opacity:.14});
        for(const [i,dx] of [-34,0].entries()){el('rect',{x:dx-13,y:-24,width:28,height:18,rx:3,fill:PASTEL[i+2],stroke:shadeOf(PASTEL[i+2]),...soft},n);for(const wx of [-7,9])el('circle',{cx:dx+wx,cy:-5,r:5,fill:'#c98f6c'},n);}
        el('rect',{x:20,y:-22,width:32,height:16,rx:4,fill:'#f2a9b8',stroke:shadeOf('#f2a9b8'),...soft},n);el('rect',{x:22,y:-36,width:15,height:16,rx:3,fill:'#f6cf8a'},n);el('rect',{x:42,y:-32,width:6,height:11,rx:2,fill:'#b98f6c'},n);
        for(const wx of [28,45])el('circle',{cx:wx,cy:-5,r:5.5,fill:'#c98f6c'},n);ellipse(n,45,-40,6,4,'#fffaf0',{opacity:.85});return n;};
      const cushion=(g,x,y,s=1,color=pick(PASTEL))=>{const n=group(g,x,y,s),c=C(color);path(n,'M-34 0Q-40-22-30-34Q0-42 30-34Q40-22 34 0Q0 6-34 0Z',c.fill,{stroke:c.edge,...soft});path(n,starD(0,-18,7),'#fffaf0',{opacity:.8});return n;};
      const crayons=(g,x,y,s=1)=>{const n=group(g,x,y,s);for(const [i,a] of [-28,12,48].entries()){const c=PASTEL[(i*2+1)%6];el('rect',{x:-16,y:-3,width:28,height:6,rx:2,fill:c,...rot(a,0,0)},n);path(n,'M12-3l8 3l-8 3Z',shadeOf(c),rot(a,0,0));}return n;};
      const windowAt=(g,x,y,s=1)=>{const n=group(g,x,y,s);el('rect',{x:-62,y:-150,width:124,height:150,rx:10,fill:'#fffaf0',stroke:'#e3cdbf','stroke-width':2},n);el('rect',{x:-52,y:-140,width:104,height:130,rx:5,fill:'#bfe2ee'},n);
        el('rect',{x:-52,y:-50,width:104,height:40,fill:'#d9f0e6',opacity:.9},n);for(const [cx,cy,r] of [[-22,-104,13],[-8,-110,16],[10,-104,13]])ellipse(n,cx,cy,r,r*.72,'#fffdf8');ellipse(n,30,-72,12,7,'#fffdf8',{opacity:.9});
        stroke(n,'M0-140V-10M-52-75H52','#fffaf0',6,{'stroke-linecap':'butt'});
        for(const sx of [-1,1])path(n,`M${sx*70}-156Q${sx*30}-150 ${sx*34}-96Q${sx*38}-40 ${sx*58} 6H${sx*76}Z`,'#f6c7cf',{stroke:'#e3a4b0',...soft});
        el('rect',{x:-80,y:-164,width:160,height:14,rx:7,fill:'#f2a9b8'},n);el('rect',{x:-70,y:0,width:140,height:9,rx:4,fill:'#fffaf0',stroke:'#e3cdbf','stroke-width':1.5},n);return n;};
      const picture=(g,x,y,s=1,i=0)=>{const n=group(g,x,y,s),c=PASTEL[i%6];el('rect',{x:-26,y:-32,width:52,height:64,rx:5,fill:'#fffaf0',stroke:'#d9bfa6','stroke-width':3},n);el('rect',{x:-19,y:-25,width:38,height:50,rx:3,fill:c,opacity:.5},n);
        path(n,i%3===0?starD(0,0,13):i%3===1?heartD(0,0,11):'M-12 6a12 12 0 1 1 24 0Z',i%3===2?'#f6cf8a':'#fffaf0');return n;};
      const shelf=(g,x,y,s=1,i=0)=>{const n=group(g,x,y,s);el('rect',{x:-70,y:0,width:140,height:9,rx:4,fill:'#fffaf0',stroke:'#e3cdbf','stroke-width':1.5},n);for(const sx of [-52,52])path(n,`M${sx-4} 9h8l-4 14Z`,'#ecd9c8');
        let bx=-62;for(let k=0;k<6;k++){const w=R(8,13),hh=R(26,40);el('rect',{x:f1(bx),y:f1(-hh),width:f1(w),height:f1(hh),rx:2,fill:PASTEL[(k+i)%6]},n);bx+=w+1.5;}
        i%2?teddy(n,34,0,.42):ball(n,36,0,.9);return n;};
      const garland=(g,x,y,w)=>{stroke(g,`M${x} ${y}Q${x+w/2} ${y+46} ${x+w} ${y}`,'#d9b9a4',1.6,{opacity:.8});for(let i=1;i<8;i++){const t=i/8,px=x+w*t,py=y+184*t*(1-t);path(g,starD(px,py+9,7.5),PASTEL[i%6]);}};
      const bed=(g,x,y,s=1)=>{const n=group(g,x,y,s);ellipse(n,0,4,150,10,'#7a5a50',{opacity:.14});el('rect',{x:-150,y:-104,width:26,height:108,rx:12,fill:'#fffaf0',stroke:'#e3cdbf','stroke-width':2},n);path(n,starD(-137,-78,8),'#f6cf8a');
        el('rect',{x:-132,y:-44,width:272,height:46,rx:8,fill:'#fffaf0',stroke:'#e3cdbf','stroke-width':2},n);el('rect',{x:-132,y:-62,width:272,height:26,rx:12,fill:'#fdf3e6'},n);
        ellipse(n,-96,-66,34,14,'#fffdf8',{stroke:'#e9d6c6','stroke-width':1.5});
        for(let i=0;i<6;i++)for(let j=0;j<2;j++)el('rect',{x:-56+i*33,y:-64+j*24,width:33,height:24,fill:PASTEL[(i+j*2)%6],opacity:.9},n);
        path(n,'M-56-64H142V-16H-56Z','none',{stroke:'#fffaf0','stroke-width':2,'stroke-dasharray':'4 5',opacity:.8});el('rect',{x:128,y:-74,width:22,height:78,rx:10,fill:'#fffaf0',stroke:'#e3cdbf','stroke-width':2},n);
        teddy(n,-20,-62,.56);teddy(n,34,-62,.48);return n;};
      const chest=(g,x,y,s=1)=>{const n=group(g,x,y,s);ellipse(n,0,3,62,7,'#7a5a50',{opacity:.14});el('rect',{x:-54,y:-48,width:108,height:50,rx:7,fill:'#a9d6c9',stroke:'#7fb3a4',...soft},n);path(n,'M-58-46Q-58-70 0-70Q58-70 58-46Z','#bfe3d8',{stroke:'#7fb3a4',...soft});
        path(n,starD(0,-22,12),'#fffaf0');teddy(n,-22,-68,.44);ball(n,26,-68,.8);return n;};
      const tipi=(g,x,y,s=1)=>{const n=group(g,x,y,s);ellipse(n,0,3,78,8,'#7a5a50',{opacity:.14});path(n,'M0-150L-76 0H76Z','#fdf3e6',{stroke:'#e3cdbf','stroke-width':2,'stroke-linejoin':'round'});
        for(const [i,t] of [.3,.52,.74].entries())path(n,`M${-76*t} ${-150+150*t}H${76*t}L${76*(t+.07)} ${-150+150*(t+.07)}H${-76*(t+.07)}Z`,PASTEL[i*2],{opacity:.75});
        path(n,'M0-84L-24 0H24Z','#e9b9a6');stroke(n,'M-8-158L4-142M8-158L-4-142','#b98f6c',3);teddy(n,0,0,.5);return n;};
      const bookcase=(g,x,y,s=1)=>{const n=group(g,x,y,s);ellipse(n,0,3,60,7,'#7a5a50',{opacity:.14});el('rect',{x:-52,y:-132,width:104,height:134,rx:7,fill:'#fffaf0',stroke:'#e3cdbf','stroke-width':2},n);
        for(const [k,yy] of [-92,-48,-4].entries()){el('rect',{x:-46,y:yy-36,width:92,height:36,fill:'#f6e6d6'},n);let bx=-44;for(let i=0;i<5;i++){const w=R(9,14),hh=R(22,32);el('rect',{x:f1(bx),y:f1(yy-hh),width:f1(w),height:f1(hh),rx:2,fill:PASTEL[(i+k*2)%6]},n);bx+=w+1.5;}
          k===1?teddy(n,30,yy,.3):k===0?ball(n,30,yy,.62):block(n,28,yy,.8);}
        return n;};
      const lamp=(g,x,y,s=1)=>{const n=group(g,x,y,s);ellipse(n,0,2,26,5,'#7a5a50',{opacity:.16});ellipse(n,0,-150,70,58,'#fff6d8',{opacity:.35});stroke(n,'M0 0V-128','#d9bfa6',5);ellipse(n,0,-1,20,5,'#d9bfa6');
        path(n,'M-18-168H18L32-122H-32Z','#f6cf8a',{stroke:'#dfae5e',...soft});for(const dx of [-16,0,16])path(n,starD(dx,-143,5),'#fffaf0',{opacity:.9});return n;};
      /* ---------- far wall ---------- */
      el('rect',{x:-100,y:262,width:3500,height:200,fill:W.mountA.fill},mountains);el('rect',{x:-100,y:256,width:3500,height:9,rx:4,fill:'#fffaf0'},mountains);
      {let stars='',dots='',hearts='';for(let i=0;i<150;i++){const x=R(0,3250),y=R(-420,240),k=i%3;if(k===0)stars+=starD(x,y,R(5,8));else if(k===1)dots+=dot(x,y,R(2.5,4.5));else hearts+=heartD(x,y,R(4,6));}
        path(mountains,stars,'#fffaf0',{opacity:.75});path(mountains,dots,'#f2b8bd',{opacity:.55});path(mountains,hearts,'#f6d39c',{opacity:.6});
      }
      /* A long cubby shelf under the rail: tall screens show it instead of the furniture row. */
      el('rect',{x:-100,y:292,width:3500,height:160,fill:'#fffaf0',stroke:'#e3cdbf','stroke-width':2},mountains);
      {let cells='';for(let x=-60;x<3400;x+=80)for(const y of [302,376])cells+=`M${x} ${y}h72v66h-72Z`;path(mountains,cells,'#f3e2d2');
        let n=0;for(let x=-60;x<3400;x+=80)for(const y of [302,376]){const cx=x+36,by=y+66,k=(n++*7+((x/80)|0))%6;
          if(k===0)teddy(mountains,cx,by,.56);else if(k===1){let bx=x+8;for(let i=0;i<4;i++){const w=R(10,14),hh=R(34,50);el('rect',{x:f1(bx),y:f1(by-hh),width:f1(w),height:f1(hh),rx:2,fill:PASTEL[(i+n)%6]},mountains);bx+=w+2;}}
          else if(k===2)ball(mountains,cx,by,1.25,PASTEL[n%6]);else if(k===3){block(mountains,cx-15,by,.95,PASTEL[n%6],n);block(mountains,cx+15,by,.95,PASTEL[(n+3)%6],n+1);}
          else if(k===4)rings(mountains,cx,by,.95);else{el('rect',{x:x+8,y:by-34,width:56,height:34,rx:7,fill:PASTEL[(n+2)%6],opacity:.9},mountains);path(mountains,heartD(cx,by-17,8),'#fffaf0',{opacity:.9});}}}
      every(3200,330,430,(x,i)=>{i%3===0?windowAt(mountains,x,236,1.05):i%3===1?(shelf(mountains,x,170,1,i),picture(mountains,x-112,96,.9,i),picture(mountains,x+112,104,.8,i+1)):(picture(mountains,x-34,128,1.15,i),picture(mountains,x+44,150,.9,i+2),garland(mountains,x-150,48,300));},170);
      /* ---------- wooden floor ---------- */
      el('rect',{x:-100,y:366,width:3500,height:760,fill:W.sea.fill},valley);el('rect',{x:-100,y:354,width:3500,height:14,fill:'#fffaf0',stroke:'#e3cdbf','stroke-width':1.5},valley);
      {let lines='',seams='';for(let k=0;k<11;k++){const y=372+k*k*3.6+k*12;lines+=`M-100 ${f1(y)}H3400`;for(let x=R(0,260);x<3400;x+=R(240,420))seams+=`M${f1(x)} ${f1(y)}v${f1(12+k*7.2)}`;}
        path(valley,lines,'none',{stroke:'#c9a67c','stroke-width':1.6,opacity:.5});path(valley,seams,'none',{stroke:'#c9a67c','stroke-width':1.4,opacity:.4});}
      /* ---------- furniture and toys standing on the floor ---------- */
      every(mw,300,420,(x,i)=>{const y=430;[()=>bed(mid,x,y,.74),()=>bookcase(mid,x,y,.86),()=>tipi(mid,x,y,.78),()=>chest(mid,x,y,.86),()=>lamp(mid,x,y,.8)][i%5]();},210);
      every(nw,250,380,(x,i)=>{const y=474;[()=>teddy(near,x,y,1.25),()=>{block(near,x-22,y,1.4,PASTEL[i%6],i);block(near,x+22,y,1.4,PASTEL[(i+2)%6],i+1);block(near,x,y-36,1.4,PASTEL[(i+4)%6],i+2);},()=>rings(near,x,y,1.5),()=>train(near,x,y,1.25),()=>teddy(near,x,y,1.05),()=>ball(near,x,y,1.6)][i%6]();},140);
      every(gw*.8,820,1180,(x,i)=>i%2?lamp(grove,x,meadowEdge(x)+92,2.1):teddy(grove,x,meadowEdge(x)+96,2.5),340);
      /* ---------- the carpet and its play road ---------- */
      terrain({verge:.5});
      {let dash='';for(let x=-180;x<gw;x+=64)dash+=`M${f1(x)} ${f1(groundY(x)+pathWidth(x)*.14)}L${f1(x+30)} ${f1(groundY(x+30)+pathWidth(x+30)*.14)}`;path(ground,dash,'none',{stroke:'#f2b8bd','stroke-width':4,'stroke-linecap':'round',opacity:.7});}
      every(gw,150,240,(x,i)=>{const up=roadTop(x)-R(18,66),dn=roadBot(x)+R(34,90);
        [()=>teddy(ground,x,up,R(.52,.66)),()=>block(ground,x,up,R(.9,1.15),PASTEL[i%6],i),()=>ball(ground,x,up,R(.8,1.05)),()=>rings(ground,x,up,R(.75,.95)),()=>train(ground,x,up,R(.62,.78)),()=>{block(ground,x-14,up,.9,PASTEL[(i+1)%6],i);block(ground,x+14,up,.9,PASTEL[(i+3)%6],i+1);block(ground,x,up-23,.9,PASTEL[(i+5)%6],i+2);}][i%6]();
        i%3===0?crayons(ground,x+78,dn,R(.9,1.2)):i%3===1?ball(ground,x+78,dn,R(.9,1.2)):block(ground,x+78,dn,R(1,1.3),PASTEL[(i+2)%6],i);});
      every(fw,150,250,(x,i)=>{i%3===0?cushion(foreground,x,fy(x)+44,R(1.5,1.9)):i%3===1?teddy(foreground,x,fy(x)+92,R(1.25,1.5)):ball(foreground,x,fy(x)+52,R(1.5,2));});
      const scatter=(x,y,k,i)=>[()=>teddy(ground,x,y,k*.62),()=>block(ground,x,y,k*1.05,PASTEL[i%6],i),()=>ball(ground,x,y,k),()=>rings(ground,x,y,k*.85),()=>crayons(ground,x,y,k*1.1),()=>cushion(ground,x,y,k*.7)][i%6]();
      /* Bunting hangs across the top of the room and sways gently. */
      for(let x=120;x<widths.top;x+=R(620,900)){const h=group(top,x,0,R(1,1.3)),c=sway(h,'-200,-12,200,110','sway top');stroke(c,'M-190-6Q0 86 190-6','#d9b9a4',2.2);
        for(let i=0;i<9;i++){const t=(i+.5)/9,px=-190+380*t,py=-6+368*t*(1-t);path(c,`M${f1(px-17)} ${f1(py)}L${f1(px+17)} ${f1(py)}L${f1(px)} ${f1(py+38)}Z`,PASTEL[i%6],{stroke:shadeOf(PASTEL[i%6]),...soft});}}
      return scatter;
    },
    fairy(){
      for(const [yb,amp,wash] of [[250,60,W.mountA],[300,36,W.mountB]]){el('path',{d:ridge(3200,x=>yb+amp*Math.sin(x*.0052+yb)+amp*.5*Math.sin(x*.013),40,5),...wa(wash,2,.14)},mountains);}
      for(const x of [700,2150])farCastle(mountains,x,300+36*Math.sin(x*.0052+300)+18*Math.sin(x*.013)+6,1.1);
      rainbow(valley,560,396,1.35,.62);rainbow(valley,2500,400,1.1,.5);
      el('rect',{x:-100,y:366,width:3500,height:700,fill:W.sea.fill},valley);el('rect',{x:-100,y:366,width:3500,height:10,fill:'#f6fbf6',opacity:.6},valley);el('rect',{x:-100,y:372,width:3500,height:60,fill:S.dash('#ffffff',2)},valley);el('rect',{x:-100,y:432,width:3500,height:260,fill:S.dash('#ffffff',1)},valley);
      for(let i=0;i<140;i++)ellipse(valley,R(-80,3350),R(374,650),R(14,56),1.8,'#fff',{opacity:R(.3,.7)});
      every(3300,420,700,x=>{const y=R(384,404),w=R(30,60);el('path',{d:smooth([[x-w,y+2],[x-w*.5,y-w*.4],[x+w*.1,y-w*.6],[x+w*.6,y-w*.36],[x+w,y+2],[x,y+6]],true),...wa(W.near,2,.2)},valley);tree(valley,x,y-w*.4,R(.28,.4),1);});
      for(const [g,w,yf,wash,k] of [[mid,mw,midY,W.mid,.6],[near,nw,nearY,W.near,1]]){
        hill(g,w,yf,wash);fringe(g,w,yf,g===mid?'#a6c69c':'#86ac86',11,7);spots(g,w,yf,'#dcecc0',Math.ceil(w/170),.3);
        for(let i=0;i<w/70;i++){const x=R(0,w),y=yf(x)+R(18,90);for(let j=0;j<5;j++)el('circle',{cx:f1(x+R(-26,26)),cy:f1(y+R(-8,8)),r:f1(R(1.4,2.8)),fill:pick(['#fff3dc','#f3b6cf','#c8b6ec','#f6dc8f']),opacity:.9},g);}
        every(w,150,300,(x,i)=>{const y=yf(x)+10;i%5===0?toadhouse(g,x,y+8,k*R(.8,1.2),pick(['#e58a9a','#b99ae0','#f0b866'])):i%5===2?S.crystal(g,x,y+4,k*R(.6,1),{light:'#fff6fb',mid:'#e6c2ea',dark:'#b99ad6',glow:'#f3c6e6'}):tree(g,x,y,k*R(.8,1.15),i%2?1:3);});
      }
      every(gw*.8,780,1120,x=>tree(grove,x,meadowEdge(x)+80,R(2.2,2.7),1,true),320);
      terrain();fringe(ground,gw,meadowEdge,'#9cc08c',14,7);
      every(gw,150,240,(x,i)=>{const up=roadTop(x)-R(18,70),dn=roadBot(x)+R(30,90);S.castShadow(ground,x,up+3,30,5);
        [()=>toadhouse(ground,x,up,R(.55,.8),pick(['#e58a9a','#b99ae0','#f0b866'])),()=>S.crystal(ground,x,up,R(.4,.6),{light:'#fff6fb',mid:'#e6c2ea',dark:'#b99ad6',glow:'#f3c6e6'}),()=>lantern(ground,x,up,R(.8,1)),()=>mushroom(ground,x,up,R(1.1,1.6)),()=>thrift(ground,x,up,R(1,1.4)),()=>S.boulder(ground,x,up,R(.6,.9),W.stone,'#b9d6a0')][i%6]();
        i%2?mushroom(ground,x+70,dn,R(1.2,1.7)):flower(ground,x+70,dn,R(1.3,1.8),pick(['#f3b6cf','#fff3dc','#c8b6ec']));});
      every(fw,130,240,(x,i)=>{i%3===0?mushroom(foreground,x,fy(x)+30,R(1.6,2.2)):i%3===1?S.crystal(foreground,x,fy(x)+40,R(.8,1.1),{light:'#fff6fb',mid:'#e6c2ea',dark:'#b99ad6'}):thrift(foreground,x,fy(x)+34,R(1.7,2.3));});
      const scatter=(x,y,k,i)=>[()=>toadhouse(ground,x,y,k*.8,pick(['#e58a9a','#b99ae0','#f0b866'])),()=>S.crystal(ground,x,y,k*.6,{light:'#fff6fb',mid:'#e6c2ea',dark:'#b99ad6',glow:'#f3c6e6'}),()=>mushroom(ground,x,y,k*1.5),()=>flower(ground,x,y,k*1.6,pick(['#f3b6cf','#fff3dc','#c8b6ec'])),()=>lantern(ground,x,y,k),()=>thrift(ground,x,y,k*1.4)][i%6]();
      for(let x=140;x<widths.top;x+=R(700,1100)){const h=group(top,x,0,R(1,1.4)),c=sway(h,'-190,-12,190,150','sway top'),dir=R(0,1)<.5?1:-1;stroke(c,`M${-170*dir} -8Q${-60*dir} 30 ${40*dir} 66Q${90*dir} 90 ${130*dir} 86`,'#8f7478',8);
        for(let i=0;i<26;i++){const t=R(0,1),bx=(-170+300*t)*dir+R(-24,24),by=-8+96*t*t+R(-6,50);path(c,blob(bx,by,R(12,19),R(10,15),8,.14),pick([W.blossom,W.blossomL]).fill,{opacity:.95});}
        for(let i=0;i<8;i++)el('circle',{cx:f1(R(-150,130)*dir),cy:f1(R(20,120)),r:f1(R(2.4,4)),fill:'#fff6ea',opacity:.9},c);}
      return scatter;
    }
  };
  // Each scene returns a brush for scattering its own props over the deep foreground plane.
  return SCENES[kind]();
}
