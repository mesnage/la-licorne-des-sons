// Layered, code-native scenery: the background stays quiet and every roadside
// object shares the same soft light, palette and rounded silhouette.
const svg=(w,h,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
const palettes={
 pink:['#e3edb2','#a9c47e','#5c906a'],
 pine:['#b9d4a0','#7eab82','#3f7664'],
 purple:['#eadcec','#b5acd2','#7e86ac']
};
export function gardenTree(kind='pink'){
 const [light,mid,dark]=palettes[kind]||palettes.pink;
 let crown='',detail='';
 for(let i=0;i<25;i++){
  const a=i*2.399,r=Math.sqrt(i/25),x=145+Math.cos(a)*93*r,y=117+Math.sin(a)*70*r;
  crown+=`<ellipse cx="${x}" cy="${y}" rx="${39+i%4*6}" ry="${32+i%3*5}" fill="url(#leaf${i%3})"/>`;
  if(i%2===0)detail+=`<path d="M${x-12} ${y-10}q8-7 18-3m-2 9 10-5" stroke="${light}" stroke-width="3" opacity=".45" stroke-linecap="round" fill="none"/>`;
  if(kind==='pink'&&i%3===0)detail+=`<g fill="#f4c5d6"><circle cx="${x}" cy="${y+8}" r="4"/><circle cx="${x+6}" cy="${y+6}" r="3.5"/><circle cx="${x+3}" cy="${y+13}" r="3"/></g>`;
 }
 return svg(300,400,`<defs>${[0,1,2].map((n)=>`<radialGradient id="leaf${n}" cx="30%" cy="18%" r="85%"><stop stop-color="${n===1?mid:light}"/><stop offset=".55" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/></radialGradient>`).join('')}<linearGradient id="bark"><stop stop-color="#b39976"/><stop offset=".4" stop-color="#a28365"/><stop offset="1" stop-color="#715f54"/></linearGradient></defs>
 <ellipse cx="150" cy="382" rx="108" ry="13" fill="#42664e" opacity=".15"/>
 <path d="M122 380q27-104 8-222l35-4q-12 141 14 226l-27-11Z" fill="url(#bark)"/>
 <path d="M145 263Q110 195 71 173m76 60q33-60 78-78m-80 48-18-91" fill="none" stroke="#94785f" stroke-width="15" stroke-linecap="round"/>
 <path d="M143 354q13-63 3-118m12 82 3 35" stroke="#d2b68a" stroke-width="4" stroke-linecap="round" fill="none" opacity=".65"/>
 ${crown}${detail}<path d="M109 378q16-28 28-13m32 13q15-25 30-14" fill="none" stroke="${mid}" stroke-width="7" stroke-linecap="round"/>`);
}
export function gardenProp(kind,theme){
 const ice=theme.habitat==='ice',moon=theme.habitat==='moon',night=moon||theme.habitat==='forest';
 const light=ice?'#e9f5ee':moon?'#cbd3eb':'#d8e5a5',green=ice?'#a5c6ce':moon?'#8494b5':night?'#7bab81':'#a4be77',dark=ice?'#85a8bd':moon?'#687994':'#588568';
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
 return svg(3600,1400,`<defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="${forest?'#b4d3d4':'#c3dcea'}"/><stop offset="1" stop-color="#f8e8cd"/></linearGradient><linearGradient id="grass" x2=".1" y2="1"><stop stop-color="${forest?'#afc99b':'#c8dba8'}"/><stop offset=".65" stop-color="${forest?'#9ab88c':'#b7ce9d'}"/><stop offset="1" stop-color="${forest?'#87a987':'#a4bf91'}"/></linearGradient><radialGradient id="sun"><stop stop-color="#fff7d9" stop-opacity=".7"/><stop offset="1" stop-color="#fff7d9" stop-opacity="0"/></radialGradient></defs>
 <path d="M0 0h3600v1400H0Z" fill="url(#sky)"/><ellipse cx="580" cy="170" rx="550" ry="250" fill="url(#sun)"/>
 <path d="M0 290Q220 115 430 240T850 220 1300 235 1800 210 2300 230 2800 195 3600 255V700H0Z" fill="#b1b9d2" opacity=".4"/>
 <path d="M0 343Q300 232 600 310T1200 285 1800 320 2400 265 3000 310 3600 270V700H0Z" fill="#a7c3b9" opacity=".6"/>
 ${trees}<path d="M0 385Q380 320 780 375T1540 350 2320 370 3000 325 3600 360V1400H0Z" fill="url(#grass)"/>
 <path d="M0 750Q430 530 950 760T1970 700 2800 720 3600 640V1400H0Z" fill="${forest?'#8eae82':'#9fbe87'}" opacity=".14"/>
 ${grass}`);
}
