// Original storybook scenery: layered washes, botanical silhouettes and quiet landmarks.
const svg=(w,h,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
export function landmark(theme){
  const common='<ellipse cx="165" cy="251" rx="145" ry="15" fill="#334d45" opacity=".12"/>';
  const art=[
    '<path d="M78 238V109h113v129Z" fill="#e2caa5"/><path d="m60 113 73-80 77 80Z" fill="#9c7970"/><path d="M114 237v-65h35v65" fill="#898e78"/><path d="m135 42 4-30" stroke="#7b7562" stroke-width="8"/><g fill="#e8e0bb"><path d="m139 22-63-3 4-19 61 14Zm3 3 50-47 13 15-55 42Zm0 1 50 42-13 15-46-47Zm-3 1-45 49-13-16 54-42Z"/></g><path d="M63 239q-40-20-40 4m168-1q48-38 71 2" stroke="#8b9c75" stroke-width="12" fill="none"/>',
    '<path d="M82 247q25-110-13-220 70-34 107 15-30 115 14 205Z" fill="#7f8062"/><path d="M109 245v-59q21-37 42 0v59" fill="#4d6859"/><path d="M72 43q-9-42 47-42 79-5 88 63-78-30-135-21Z" fill="#577965"/><g fill="#d6dfa4"><circle cx="71" cy="137" r="4"/><circle cx="211" cy="174" r="4"/><circle cx="49" cy="197" r="3"/></g><path d="M124 96h29v31h-29Z" fill="#e5c985"/>',
    '<path d="M62 242V109h194v133Z" fill="#e7d1b5"/><path d="m43 113 116-96 116 96Z" fill="#b78c97"/><path d="M111 242v-69q42-45 84 0v69" fill="#aa8a80"/><path d="M65 124h193v27H65Z" fill="#e8bbb5"/><path d="M80 124v27m32-27v27m32-27v27m32-27v27m32-27v27m32-27v27" stroke="#f5e2c3" stroke-width="14"/><circle cx="160" cy="81" r="23" fill="#e4c78d"/><path d="M154 62q35 6 12 24-21 10-18-11" fill="none" stroke="#c6a5aa" stroke-width="7"/>',
    '<path d="M125 244 145 61h49l22 183Z" fill="#e6d8b9"/><path d="M139 57h62v34h-62Z" fill="#99b9b9"/><path d="m133 57 36-31 39 31Z" fill="#8e9991"/><path d="M146 114h50m-54 38h60m-65 40h72" stroke="#ba9d8d" stroke-width="14"/><path d="M67 243q-10-45 21-71-2 37 9 71m155 0q-7-47 23-67-7 37 5 67" fill="#8baa97"/>',
    '<path d="m58 245 20-84 40-19L138 46l61 24 21 93 43 23 21 59Z" fill="#b8d4dc"/><path d="m138 46 17 162 44-138m-81 72 37 66 65-45m-142-2 77 47-97 37m97-37 129 37" fill="none" stroke="#eef4e7" stroke-width="4"/><path d="M140 245v-30q15-31 31 0v30" fill="#84abb8"/>',
    '<path d="M70 236h187v-82H70Z" fill="#ddd5c8"/><path d="M59 156q96-120 209 0Z" fill="#b3aec8"/><path d="M104 235v-69m43 69v-69m43 69v-69m43 69v-69" stroke="#f4ead8" stroke-width="12"/><path d="M42 240q-8-33 25-27 7-29 36-4 39-10 43 20 39-18 48 7 44-23 59 1 39-18 43 10" fill="#f1eadf"/>',
    '<path d="M81 245v-40L159 60l87 145v40Z" fill="#8d91ae"/><path d="M111 245v-34l49-90 55 90v34Z" fill="#434f75"/><path d="m159 19 9 18 20 3-14 15 3 21-18-10-18 10 3-21-14-15 20-3Z" fill="#e4d2a1"/><path d="M69 246h195M89 222h151" stroke="#c6c0c5" stroke-width="7"/>'
  ];
  return svg(330,270,common+art[theme.id]);
}
export function foreground(theme){
  const green=theme.id===6?'#626a83':theme.id===4?'#9ebbb8':'#6d9474';
  let body='';
  for(let i=0;i<9;i++){
    const x=10+i*33,y=98+i*29%70;
    body+=`<path d="M${x} 220Q${x-38} ${y+24} ${x-22} ${y}Q${x+6} ${y+25} ${x} 220M${x} 201Q${x+2} ${y+4} ${x+30} ${y+15}Q${x+38} ${y+47} ${x} 201" fill="${green}" opacity="${.5+i%3*.15}"/>`;
    if(i%3===0)body+=`<path d="M${x} 214v-82" stroke="#829d78" stroke-width="3"/><g fill="${theme.id===6?'#d5c697':theme.id===4?'#edf5e9':'#e2c7a6'}"><ellipse cx="${x-4}" cy="130" rx="12" ry="6"/><ellipse cx="${x+3}" cy="126" rx="6" ry="13"/></g>`;
  }
  if(theme.id===1)body+='<path d="M130 220v-30m50 30v-23" stroke="#e7d8b5" stroke-width="9"/><path d="M110 192q20-35 40 0Zm54 7q16-29 32 0Z" fill="#b78e7e"/>';
  else if(theme.id===4)body+='<path d="m105 220 14-59 20 59m0 0 20-39 16 39" fill="#c6e0dd" stroke="#eff4e7" stroke-width="2"/>';
  else if(theme.id===3)body+='<ellipse cx="152" cy="216" rx="45" ry="14" fill="#96a7a0"/><path d="m130 212 18-11 20 12" stroke="#d6dcc7" stroke-width="3" fill="none"/>';
  else body+='<ellipse cx="152" cy="220" rx="36" ry="10" fill="#a7ac91" opacity=".6"/>';
  return svg(320,230,body);
}
export function canopy(kind='pink'){
  const colors=kind==='pine'?['#567b65','#7a9573','#a0ad82']:kind==='purple'?['#8d8da1','#b3a7b9','#d1c1ca']:['#7f9a79','#a4b58a','#d5c4a3'];
  let leaves='';
  for(let i=0;i<30;i++){
    const radius=Math.sqrt(i/30),angle=i*2.399;
    const x=90+Math.cos(angle)*62*radius,y=70+Math.sin(angle)*45*radius,r=20+i%5*3;
    leaves+=`<path d="M${x-r*.9} ${y+r*.2}C${x-r*1.25} ${y-r*.25} ${x-r*.55} ${y-r*1.1} ${x-r*.2} ${y-r*.78}C${x+r*.3} ${y-r*1.35} ${x+r*1.1} ${y-r*.5} ${x+r*.8} ${y}C${x+r*1.3} ${y+r*.4} ${x+r*.4} ${y+r*1.05} ${x} ${y+r*.7}C${x-r*.7} ${y+r*.95} ${x-r*1.15} ${y+r*.7} ${x-r*.9} ${y+r*.2}Z" fill="${colors[i%3]}" opacity=".9"/><path d="M${x-8} ${y-9}q8-8 17-5m-5 8 8-3" stroke="${colors[(i+1)%3]}" stroke-width="2" fill="none" opacity=".35"/>`;
  }
  return svg(180,240,`<ellipse cx="90" cy="231" rx="59" ry="7" fill="#385948" opacity=".12"/><path d="M75 231q18-74 5-144h21q-6 88 6 144" fill="#8c8c72"/><path d="M89 173 42 106m48 45 50-63m-50 33-18-53" stroke="#8c8c72" stroke-width="8" fill="none"/>${leaves}<path d="M87 216q13-48 5-89" stroke="#c1b491" stroke-width="3" opacity=".5" fill="none"/>`);
}
export function paintedLandscape(theme,pathPoint){
  let ridges='',grain='',flowers='';
  for(let layer=0;layer<3;layer++){
    let path=`M-100 ${400+layer*65}`;
    for(let x=-100;x<=3800;x+=260){const y=230+layer*90+Math.sin(x*.002+layer)*72;path+=`Q${x+90} ${y-160} ${x+260} ${y}`;}
    ridges+=`<path d="${path}V1400H-100Z" fill="${theme.mountain}" opacity="${.2+layer*.13}"/>`;
  }
  for(let i=0;i<500;i++){
    const x=i*137%3600,y=i*79%1400;
    grain+=`<ellipse cx="${x}" cy="${y}" rx="${3+i%9}" ry="${2+i%4}" fill="${i%2?'#fff9df':theme.ground}" opacity=".07"/>`;
  }
  for(let i=0;i<110;i++){
    const x=i*173%3600,y=760+i*79%550;
    flowers+=`<path d="M${x} ${y}q-5-15 0-26" stroke="#7a9874" stroke-width="2"/><ellipse cx="${x}" cy="${y-28}" rx="${4+i%4}" ry="4" fill="${['#ede0b1','#cfacaa','#c3c5d0'][i%3]}"/>`;
  }
  let road='';for(let i=0;i<=160;i++){const p=pathPoint(i/160);road+=`${i?'L':'M'}${p.x} ${p.y}`;}
  return svg(3600,1400,`<defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="${theme.sky}"/><stop offset="1" stop-color="${theme.id===6?'#495674':'#f3ecd6'}"/></linearGradient><linearGradient id="field" x2="0" y2="1"><stop stop-color="${theme.ground}"/><stop offset="1" stop-color="${theme.sky}"/></linearGradient><radialGradient id="sun"><stop stop-color="#fff2c9" stop-opacity=".65"/><stop offset="1" stop-color="#fff1ce" stop-opacity="0"/></radialGradient></defs>
  <path d="M0 0h3600v1400H0Z" fill="url(#sky)"/><ellipse cx="480" cy="160" rx="500" ry="300" fill="url(#sun)"/>${ridges}
  <path d="M0 540q500-110 1040 0t1040-10 1520-50v920H0Z" fill="url(#field)"/><path d="M0 780q700-140 1400-30t2200-100v150H0Z" fill="${theme.ground}" opacity=".5"/>
  <path d="${road}" stroke="#8f9b7c" stroke-width="105" opacity=".22" fill="none" stroke-linecap="round"/><path d="${road}" stroke="${theme.road}" stroke-width="88" fill="none" stroke-linecap="round"/><path d="${road}" stroke="#f6e7c3" stroke-width="3" stroke-dasharray="3 34" opacity=".65" fill="none"/>${flowers}${grain}`);
}
