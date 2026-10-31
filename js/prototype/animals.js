// Original rounded animal portraits; rasterized at Retina density by the scene loader.
export const HABITAT_ANIMALS={
 meadow:['bunny','fox'],forest:['owl','fox','bunny'],jungle:['monkey','toucan','tiger'],
 beach:['turtle','crab'],ice:['penguin','seal'],clouds:['cloud-bunny','dove'],moon:['moon-bunny']
};
export const ANIMAL_KINDS=[...new Set(Object.values(HABITAT_ANIMALS).flat())];
const face=(x,y,blink=false)=>`<g fill="#40515b">${blink?`<path d="M${x-21} ${y}q7-8 14 0m14 0q7-8 14 0" fill="none" stroke="#40515b" stroke-width="3" stroke-linecap="round"/>`:`<ellipse cx="${x-14}" cy="${y}" rx="6" ry="8"/><ellipse cx="${x+14}" cy="${y}" rx="6" ry="8"/><g fill="#fff"><circle cx="${x-12}" cy="${y-3}" r="2.2"/><circle cx="${x+16}" cy="${y-3}" r="2.2"/></g>`}<path d="M${x-6} ${y+16}q6 7 12 0" fill="none" stroke="#705564" stroke-width="2.5" stroke-linecap="round"/></g><g fill="#edb4b4" opacity=".7"><ellipse cx="${x-25}" cy="${y+10}" rx="8" ry="4"/><ellipse cx="${x+25}" cy="${y+10}" rx="8" ry="4"/></g>`;
export function animalSVG(kind,blink=false){
 let body='',eyes='';
 if(kind.includes('bunny')){
  body='<ellipse cx="80" cy="108" rx="35" ry="31" fill="url(#fur)"/><ellipse cx="56" cy="132" rx="18" ry="9" fill="#f7e6db"/><ellipse cx="104" cy="132" rx="18" ry="9" fill="#f7e6db"/><ellipse cx="59" cy="30" rx="13" ry="29" transform="rotate(-13 59 30)" fill="url(#fur)"/><ellipse cx="99" cy="28" rx="13" ry="29" transform="rotate(12 99 28)" fill="url(#fur)"/><g fill="#eabfc7"><ellipse cx="59" cy="29" rx="6" ry="20" transform="rotate(-13 59 29)"/><ellipse cx="99" cy="27" rx="6" ry="20" transform="rotate(12 99 27)"/></g><ellipse cx="80" cy="70" rx="42" ry="35" fill="url(#fur)"/><path d="m75 79 5 5 5-5Z" fill="#ce9ba9"/>';
  eyes=face(80,66,blink);
  if(kind==='moon-bunny')body='<rect x="38" y="87" width="27" height="37" rx="10" fill="#afc7d9"/>'+body;
  if(kind==='moon-bunny')eyes+='<circle cx="80" cy="55" r="51" fill="#d3f4ff" fill-opacity=".08" stroke="#c2e7eb" stroke-width="4"/><path d="M43 28q10-15 25-17" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M60 107h40v9H60Z" fill="#acc8d7"/><circle cx="80" cy="111" r="4" fill="#ead48e"/>';
  if(kind==='cloud-bunny')body='<path d="M45 100C7 71 10 118 48 117m65-17c39-29 35 17-2 17" fill="#f4f5f0" stroke="#d7d8e6" stroke-width="2"/>'+body;
 }else if(kind==='fox'){
  body='<path d="M111 120q60-9 27-70-21 11-23 37" fill="#d99c73"/><path d="M135 51q18 29 9 39-12-7-21-16Z" fill="#fff2dc"/><ellipse cx="79" cy="109" rx="34" ry="29" fill="#d99c73"/><ellipse cx="80" cy="114" rx="19" ry="21" fill="#f8ead7"/><path d="m39 58 2-41q30 0 39 29 15-29 38-29l3 41" fill="#d99c73"/><path d="m49 44 1-16 16 16m30 0 13-15 2 16" fill="#c99194"/><ellipse cx="80" cy="71" rx="43" ry="35" fill="#e6b183"/><path d="M39 73q11 28 41 31 32-3 42-31-18-3-28 12H68Q54 69 39 73" fill="#fff2dc"/><path d="m74 79 6 7 6-7Z" fill="#6c5b59"/>';
  eyes=face(80,65,blink);
 }else if(kind==='monkey'){
  body='<path d="M111 117c52 20 44-48 20-29-12 11 13 18 12 3" stroke="#a8836c" stroke-width="11" fill="none" stroke-linecap="round"/><ellipse cx="78" cy="110" rx="34" ry="28" fill="#a8836c"/><ellipse cx="78" cy="115" rx="22" ry="23" fill="#ebd4b4"/><g fill="#ac8c74"><circle cx="37" cy="61" r="20"/><circle cx="120" cy="61" r="20"/></g><g fill="#dec0aa"><circle cx="37" cy="61" r="12"/><circle cx="120" cy="61" r="12"/></g><ellipse cx="79" cy="65" rx="41" ry="40" fill="#a8836c"/><path d="M42 66q-2-35 36-14 39-23 38 14v18q-34 35-73 0Z" fill="#f1dcbd"/><path d="M72 80q6-5 12 0" stroke="#b49584" stroke-width="3" fill="none"/>';
  eyes=face(79,66,blink);
 }else if(kind==='tiger'){
  body='<path d="M110 119q48 8 30-43" stroke="#d6a268" stroke-width="12" fill="none" stroke-linecap="round"/><ellipse cx="79" cy="112" rx="35" ry="27" fill="#e1b477"/><ellipse cx="80" cy="115" rx="21" ry="24" fill="#f6e8c8"/><g fill="#dcad70"><circle cx="49" cy="32" r="17"/><circle cx="109" cy="32" r="17"/></g><ellipse cx="79" cy="69" rx="44" ry="39" fill="#e8bd83"/><path d="m78 30 1 23m-34-8 15 11m-24 12 19 5m55-27-15 10m26 13-19 5" stroke="#8b7963" stroke-width="5" stroke-linecap="round"/><ellipse cx="80" cy="88" rx="22" ry="13" fill="#fff1d9"/><path d="m74 80 6 6 6-6Z" fill="#af8580"/>';
  eyes=face(79,68,blink);
 }else if(kind==='turtle'){
  body='<g fill="#a6c7a0"><ellipse cx="35" cy="122" rx="17" ry="10"/><ellipse cx="94" cy="125" rx="18" ry="10"/></g><path d="M18 116q4-72 48-71 47 2 47 71Z" fill="#8db098"/><path d="m40 61 24 13 24-13m-24 13v29m-42-8 18 10 24-2 29 5 17-11M40 61l-1 44m49-44 5 47" stroke="#bed1a8" stroke-width="3" fill="none"/><path d="M10 113h103v9H10Z" fill="#cad6ad"/><ellipse cx="119" cy="98" rx="30" ry="28" fill="#accda2"/>';
  eyes=face(121,91,blink);
 }else if(kind==='crab'){
  body='<g fill="none" stroke="#d5a1a2" stroke-width="7" stroke-linecap="round"><path d="m47 105-23 18m28-8-15 20m76-30 23 18m-28-8 15 20M44 92 24 78m93 14 20-14"/></g><path d="M22 87C-7 70 4 42 18 62 23 41 42 61 22 87m116 0c29-17 18-45 4-25-5-21-24-1-4 25" fill="#dfa9aa"/><ellipse cx="80" cy="100" rx="44" ry="29" fill="#e5b9ae"/><path d="m64 80-3-24m35 24 3-24" stroke="#d5a1a2" stroke-width="7" stroke-linecap="round"/>';
  eyes=face(80,59,blink);
 }else if(kind==='seal'){
  body='<path d="M45 116q-37 19-34-1 3-13 22-10m71 14q40 20 43 3-1-15-31-14" fill="#b6cfd4"/><ellipse cx="81" cy="111" rx="43" ry="27" fill="#c0d7d8"/><circle cx="83" cy="72" r="38" fill="url(#fur)"/><ellipse cx="84" cy="88" rx="23" ry="15" fill="#f0f3e6"/><ellipse cx="83" cy="81" rx="7" ry="5" fill="#8b9b9d"/><path d="m65 88-23-4m23 10-24 5m61-11 22-4m-22 10 24 5" stroke="#92a9ae" stroke-width="2"/>';
  eyes=face(83,68,blink);
 }else if(kind==='penguin'){
  body='<g fill="#e4be8b"><ellipse cx="59" cy="133" rx="20" ry="8"/><ellipse cx="102" cy="133" rx="20" ry="8"/></g><path d="M45 78q-34 10-25 43l28-15m65-28q34 10 25 43l-28-15" fill="#758b9f"/><ellipse cx="81" cy="90" rx="40" ry="47" fill="#7c91a5"/><ellipse cx="81" cy="99" rx="27" ry="37" fill="#f1f0df"/><path d="M42 65q-2-48 39-48 42 0 39 48-22-28-39-6-19-21-39 6" fill="#7c91a5"/><path d="m74 77 7 8 8-8Z" fill="#e2bc87"/><path d="M48 91q33 13 65-1v9q-32 13-65 0" fill="#c5a6bd"/>';
  eyes=face(81,65,blink);
 }else if(kind==='owl'){
  body='<path d="m43 49-2-23 26 11m29 0 25-11-1 25" fill="#b49d86"/><ellipse cx="81" cy="91" rx="42" ry="46" fill="#c8b497"/><path d="M43 78q-16 37 14 50m61-50q16 37-14 50" fill="#ac9783"/><g fill="#f5e7cb"><ellipse cx="63" cy="65" rx="23" ry="27"/><ellipse cx="98" cy="65" rx="23" ry="27"/></g><path d="m73 78 8 12 8-12Z" fill="#d2ac70"/><path d="m67 113 5 4m14-4 5 4m-18 8 5 4" stroke="#a48e78" stroke-width="3" stroke-linecap="round"/>';
  eyes=face(81,64,blink);
 }else{
  const toucan=kind==='toucan';
  body=`<path d="m48 106-30 12 28 1" fill="${toucan?'#687d7f':'#c7d5dd'}"/><ellipse cx="77" cy="97" rx="37" ry="29" fill="${toucan?'#5f777b':'#e8eee7'}"/><path d="M69 84q-19 13-8 35 18 0 29-18" fill="${toucan?'#99aaa5':'#cbdcde'}"/><circle cx="101" cy="62" r="29" fill="${toucan?'#617b80':'#eff1e9'}"/><path d="M117 54q51-7 34 26l-31-7Z" fill="${toucan?'#e6c388':'#d9b58c'}"/><path d="M122 56q27-4 30 7l-27 4" fill="${toucan?'#c6a4a4':'#e3c6a0'}"/>`;
  eyes=face(99,58,blink);
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="150" viewBox="0 0 160 150"><defs><radialGradient id="fur" cx="35%" cy="20%" r="85%"><stop stop-color="#fff9ed"/><stop offset="1" stop-color="${kind==='seal'?'#c3d8dc':'#e8d5c9'}"/></radialGradient></defs><ellipse cx="80" cy="139" rx="46" ry="7" fill="#455e66" opacity=".12"/>${body}${eyes}</svg>`;
}
