// Layered, code-native scenery: the background stays quiet and every roadside
// object shares the same soft light, palette and rounded silhouette.
const svg=(w,h,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
const palettes={
 pink:['#d6e9a3','#7fa95e','#345f4c'],
 pine:['#b7d29b','#5b9870','#274f46'],
 purple:['#e0d9ed','#9a9ac3','#606e9c']
};
export function gardenTree(kind='pink',layer='whole',variant=0){
 const [light,mid,dark]=palettes[kind]||palettes.pink;
 const birch=variant===1&&kind==='pink',conifer=variant===1&&kind!=='pink';
 const groups=[[],[]];let detail='';
 const count=conifer?6:16;
 for(let i=0;i<count;i++){
  const a=i*2.399+variant*.7,r=Math.sqrt(i/count),x=150+Math.cos(a)*(birch?57:87)*r,y=(birch?128:118)+Math.sin(a)*(birch?93:66)*r;
  const rx=conifer?18+i*12:birch?30+i%3*6:43+i%4*6,ry=conifer?28:birch?38:31+i%3*5;
  const cx=conifer?150:x,cy=conifer?35+i*30:y;
  let edge=`M${cx+rx} ${cy}`;
  for(let n=0;n<12;n++){const angle=n*Math.PI/6,next=(n+1)*Math.PI/6;edge+=`Q${cx+Math.cos(angle+.16)*rx*1.12} ${cy+Math.sin(angle+.16)*ry*1.13} ${cx+Math.cos(next)*rx} ${cy+Math.sin(next)*ry}`;}
  let cluster=conifer?`<path d="M150 ${cy-38}Q${cx-rx*.25} ${cy-8} ${cx-rx} ${cy+14}l13-3-6 9q${rx-6} 12 ${rx*2-14} 0l-7-10 13 4Q${cx+rx*.25} ${cy-8} 150 ${cy-38}Z" fill="url(#leaf${i%3})"/>`:`<path d="${edge}Z" fill="url(#leaf${i%3})"/>`;
  for(let n=0;n<7;n++){
   const lx=cx+(n*29%Math.max(1,rx*1.5))-rx*.7,ly=cy+(n*17%Math.max(1,ry*1.5))-ry*.7;
   cluster+=`<path d="M${lx-4} ${ly}q3-8 10-6-1 8-10 6Z" fill="${n%2?light:mid}" opacity=".38"/>`;
  }
  if(kind==='pink'&&!birch&&i%3===0)cluster+=`<g fill="#f4c4d1"><circle cx="${cx-7}" cy="${cy+8}" r="3.5"/><circle cx="${cx-2}" cy="${cy+6}" r="3"/><circle cx="${cx-4}" cy="${cy+12}" r="3"/></g>`;
  groups[i%3===0?0:1].push(cluster);
 }
 for(let i=0;i<14;i++)detail+=`<path d="M${138+i*7%27} ${220+i*19%140}l${i%2?7:-5} ${birch?0:12}" stroke="${birch?'#647973':'#685a48'}" stroke-width="${birch?3:1.4}" opacity=".45" stroke-linecap="round"/>`;
 const trunk=`<ellipse cx="150" cy="382" rx="93" ry="10" fill="#2b4d3a" opacity=".2"/><path d="M125 378q26-108 7-222l31-4q-11 143 16 226l-27-10Z" fill="url(#bark)"/><path d="M146 270q-21-69-70-104m71 65q31-65 80-77m-81 54-16-94" fill="none" stroke="${birch?'#ced4c2':'#8a7356'}" stroke-width="12" stroke-linecap="round"/><path d="M145 357q10-78-2-145" stroke="${birch?'#fff3d4':'#d9b77c'}" stroke-width="4" opacity=".6" fill="none"/>${detail}<path d="M115 380q13-23 23-12m29 12q14-19 27-10" fill="none" stroke="${mid}" stroke-width="5" stroke-linecap="round"/>`;
 const defs=`<defs>${[0,1,2].map(n=>`<radialGradient id="leaf${n}" cx="25%" cy="10%" r="88%"><stop stop-color="${n===1?mid:light}"/><stop offset=".52" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/></radialGradient>`).join('')}<linearGradient id="bark"><stop stop-color="${birch?'#f0e9d0':'#ba9b72'}"/><stop offset=".5" stop-color="${birch?'#d3d5c2':'#947452'}"/><stop offset="1" stop-color="${birch?'#8b9e93':'#655943'}"/></linearGradient></defs>`;
 return svg(300,400,defs+(layer==='trunk'?trunk:layer==='back'?groups[0].join(''):layer==='front'?groups[1].join(''):trunk+groups[0].join('')+groups[1].join('')));
}
export function gardenSprig(theme,variant=0){
 const forest=theme.habitat==='forest',petal=['#fff2cf','#e5a9ca','#abb9df'][variant];
 const green=forest?'#487e60':'#6c9557',dark=forest?'#2c5946':'#416c4b';
 let body='';
 for(let i=0;i<2;i++){
  const x=25+i*34,y=24+i*27;
  body+=`<path d="M${x+4} 139Q${x-6} ${y+34} ${x} ${y}" stroke="${dark}" stroke-width="2.5" fill="none"/><path d="M${x+1} ${y+51}q-26-22-24-5 3 13 25 11m-1 20q26-23 26-7-5 12-24 12" fill="${green}"/>`;
  if(variant===2)body+=`<path d="M${x-11} ${y+5}q2-22 12-18 12 1 11 22l-7-4-7 4-6-5Z" fill="${petal}" stroke="#838cbd" stroke-width="1"/>`;
  else{
   for(let n=0;n<6;n++){const a=n*Math.PI/3;body+=`<ellipse cx="${x+Math.cos(a)*8}" cy="${y+Math.sin(a)*8}" rx="6.5" ry="3.8" transform="rotate(${n*60} ${x+Math.cos(a)*8} ${y+Math.sin(a)*8})" fill="${petal}"/>`;}
   body+=`<circle cx="${x}" cy="${y}" r="4.5" fill="#d7a652"/><circle cx="${x-1}" cy="${y-1}" r="2" fill="#f4d795"/>`;
  }
 }
 return svg(90,145,body);
}
export function gardenProp(kind,theme){
 const ice=theme.habitat==='ice',moon=theme.habitat==='moon',night=moon||theme.habitat==='forest';
 const light=ice?'#e9f5ee':moon?'#cbd3eb':'#d8e5a5',green=ice?'#a5c6ce':moon?'#8494b5':night?'#689a73':'#89ad68',dark=ice?'#85a8bd':moon?'#687994':'#3f7255';
 const defs=`<defs><radialGradient id="leaves" cx="25%" cy="15%" r="95%"><stop stop-color="${light}"/><stop offset=".5" stop-color="${green}"/><stop offset="1" stop-color="${dark}"/></radialGradient><linearGradient id="stone" x2=".8" y2="1"><stop stop-color="${ice?'#e5f0f7':moon?'#cbd3e5':'#d1cbbb'}"/><stop offset=".55" stop-color="${ice?'#b6cfdf':moon?'#9caaca':'#aaa99d'}"/><stop offset="1" stop-color="${ice?'#8cabc4':moon?'#7785a6':'#7e8f87'}"/></linearGradient></defs>`;
 let art='';
 if(kind==='bush'){
  art='<path d="M22 139q-20-24 6-44-3-40 37-33 17-44 54-17 43-18 49 24 47 1 31 48 13 27-28 27Z" fill="url(#leaves)"/>';
  for(let i=0;i<14;i++){const x=32+i*37%157,y=77+i*23%54;art+=`<path d="M${x} ${y}q6-10 15-8m-9 15 13-5" stroke="${light}" opacity=".5" stroke-width="3" stroke-linecap="round" fill="none"/>`;if(i%3===0)art+=`<g fill="#e8b5cb"><circle cx="${x}" cy="${y}" r="4"/><circle cx="${x+6}" cy="${y+2}" r="3"/></g>`;}
 }else if(kind==='rock'){
  art='<path d="M27 139Q9 122 30 90l29-38q15-19 44-10l56 18q20 8 32 46 16 36-13 41Z" fill="url(#stone)"/><path d="m33 93 33-34q13-11 34-6l44 15-54 10Z" fill="#fff9e6" opacity=".35"/><path d="m91 78-13 32 18 24m63-58-18 36 28 16" fill="none" stroke="#778c91" opacity=".23" stroke-width="3" stroke-linecap="round"/>';
  if(!moon&&!ice)art+='<path d="M27 128q15-25 29-10 12-16 24-4 15-12 25 6l-13 16H35Z" fill="url(#leaves)"/><path d="m151 146 6-17m8 18 5-13" stroke="#6f9974" stroke-width="3" stroke-linecap="round"/>';
 }else{
  for(let i=0;i<13;i++){
   const x=20+i*47%180,y=44+i*29%63,petal=['#fff4df','#edbad2','#d1bee6','#fff4df'][i%4];
   art+=`<path d="M${x-5} 148Q${x+6} ${y+28} ${x} ${y}" fill="none" stroke="${dark}" stroke-width="2.5"/><path d="M${x} ${y+43}q-22-23-25-9 4 13 24 15m-23 13q35-22 35-9-3 10-17 12" fill="${green}"/>`;
   for(let n=0;n<5;n++){const a=n*Math.PI*2/5;art+=`<ellipse cx="${x+Math.cos(a)*7}" cy="${y+Math.sin(a)*7}" rx="5.5" ry="4" transform="rotate(${n*72} ${x+Math.cos(a)*7} ${y+Math.sin(a)*7})" fill="${petal}"/>`;}
   art+=`<circle cx="${x}" cy="${y}" r="3.5" fill="#e4ba71"/>`;
  }
 }
 return svg(220,160,defs+'<ellipse cx="111" cy="149" rx="94" ry="8" fill="#486c59" opacity=".12"/>'+art);
}
export function gardenLandscape(theme){
 const forest=theme.habitat==='forest';
 let trees='',grass='';
 for(let i=0;i<47;i++){
  const x=i*81,y=330+Math.sin(i*.65)*27,h=42+i*17%60;
  trees+=`<path d="M${x-24} ${y}q-20-${h/2} 6-${h} 28-15 42 21 31 17 3 ${h-21}Z" fill="${forest?'#79a397':'#98b5a8'}" opacity=".35"/>`;
 }
 for(let i=0;i<220;i++){
  const x=i*139%3600,y=460+i*67%920;
  grass+=`<path d="M${x} ${y}q8-6 18-2m9 3 9-4" stroke="${i%2?'#f4edca':'#769a77'}" stroke-width="2" opacity=".12" fill="none" stroke-linecap="round"/>`;
 }
 return svg(3600,1400,`<defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="${forest?'#b4d3d4':'#c3dcea'}"/><stop offset="1" stop-color="#f8e8cd"/></linearGradient><linearGradient id="grass" x2=".1" y2="1"><stop stop-color="${forest?'#8aae8c':'#c3d998'}"/><stop offset=".65" stop-color="${forest?'#699477':'#a3c17d'}"/><stop offset="1" stop-color="${forest?'#537d66':'#8faf6d'}"/></linearGradient><radialGradient id="sun"><stop stop-color="#fff7d9" stop-opacity=".7"/><stop offset="1" stop-color="#fff7d9" stop-opacity="0"/></radialGradient></defs>
 <path d="M0 0h3600v1400H0Z" fill="url(#sky)"/><ellipse cx="580" cy="170" rx="550" ry="250" fill="url(#sun)"/>
 <path d="M0 290Q220 115 430 240T850 220 1300 235 1800 210 2300 230 2800 195 3600 255V700H0Z" fill="#b1b9d2" opacity=".4"/>
 <path d="M0 343Q300 232 600 310T1200 285 1800 320 2400 265 3000 310 3600 270V700H0Z" fill="#a7c3b9" opacity=".6"/>
 ${trees}<path d="M0 385Q380 320 780 375T1540 350 2320 370 3000 325 3600 360V1400H0Z" fill="url(#grass)"/>
 <path d="M0 750Q430 530 950 760T1970 700 2800 720 3600 640V1400H0Z" fill="${forest?'#3c6c58':'#779b59'}" opacity=".14"/>
 ${grass}`);
}
