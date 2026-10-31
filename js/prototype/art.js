import { unicornSVG } from '../unicorn.js';
import { pathPoint, WORLD_WIDTH, WORLD_HEIGHT } from './model.js';
const svg = (w,h,content) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${content}</svg>`;
export const uri = source => 'data:image/svg+xml;base64,'+window.btoa(Array.from(new window.TextEncoder().encode(source),byte=>String.fromCharCode(byte)).join(''));
export function pailletteFrame(frame, happy = false){
  const wave = Math.sin(frame*Math.PI/4)*17;
  let source = unicornSVG().replace('<defs>',`<style>.u-shadow,.u-happy,.m-open,.m-o,.u-acc{display:none}${happy?'.u-open,.m-smile{display:none}.u-happy,.m-open{display:inline}':''}</style><defs>`);
  source = source.replace(/<rect x="(40|94|56|108|60|112)"[^>]*\/>/g, rect => {
    const x = Number(/x="(\d+)"/.exec(rect)[1]);
    const leg = x===60?56:x===112?108:x;
    const angle = [40,108].includes(leg)?wave:-wave;
    return `<g transform="rotate(${angle} ${leg+9} 132)">${rect}</g>`;
  });
  return source.replace('class="u-tail"',`class="u-tail" transform="rotate(${wave/3} 38 116)"`);
}
export function landscape(){
  let mountains='',hills='',flowers='',stars='';
  for(let i=0;i<18;i++){
    const x=i*240-80, y=150+(i*73%120);
    mountains+=`<path d="M${x-230} 590 L${x+90} ${y} L${x+360} 590Z" fill="${i<6?'#a8d2ce':i<11?'#9fa8ce':'#8f84b8'}" opacity=".65"/><path d="M${x+90} ${y} l-45 67 40 -16 25 24 25 -15Z" fill="#fff9ed" opacity=".8"/>`;
  }
  for(let i=0;i<14;i++){
    const x=i*290;
    hills+=`<ellipse cx="${x}" cy="${630+i%3*25}" rx="350" ry="150" fill="${i<4?'#8ec5a5':i<8?'#67a89e':'#9991ba'}" opacity=".6"/>`;
  }
  let d='';
  for(let i=0;i<=160;i++){const p=pathPoint(i/160);d+=`${i?' L':'M'}${p.x} ${p.y}`;}
  for(let i=0;i<130;i++){
    const x=50+(i*137%3500), y=750+(i*71%550), c=['#ffe1eb','#ffefb1','#d5cef8'][i%3];
    flowers+=`<path d="M${x} ${y}v-12" stroke="#528c72" stroke-width="2"/><circle cx="${x}" cy="${y-16}" r="6" fill="${c}"/><circle cx="${x}" cy="${y-16}" r="2" fill="#e6ad54"/>`;
  }
  for(let i=0;i<65;i++) stars+=`<circle cx="${2150+i*83%1420}" cy="${40+i*57%350}" r="${i%3+1}" fill="#fff5d5" opacity=".8"/>`;
  return svg(WORLD_WIDTH,WORLD_HEIGHT,`<defs>
   <linearGradient id="sky"><stop stop-color="#cceaf0"/><stop offset=".4" stop-color="#d7e4ea"/><stop offset=".68" stop-color="#8d8eb9"/><stop offset="1" stop-color="#383d72"/></linearGradient>
   <linearGradient id="ground"><stop stop-color="#b0d3a8"/><stop offset=".38" stop-color="#8cbea5"/><stop offset=".7" stop-color="#8aa6ac"/><stop offset="1" stop-color="#a5a3c8"/></linearGradient>
   <linearGradient id="road"><stop stop-color="#fbe4b1"/><stop offset=".5" stop-color="#ead8ae"/><stop offset="1" stop-color="#e5ddf0"/></linearGradient>
  </defs><path fill="url(#sky)" d="M0 0H3600V1400H0Z"/><circle cx="380" cy="170" r="66" fill="#fff0bb"/><circle cx="3270" cy="135" r="56" fill="#fff4d8"/>${stars}${mountains}
  <path d="M0 580Q800 490 1400 560T2600 470T3600 470V1400H0Z" fill="url(#ground)"/>${hills}
  <path d="${d}" fill="none" stroke="#749983" stroke-width="105" stroke-linecap="round" opacity=".3"/>
  <path d="${d}" fill="none" stroke="url(#road)" stroke-width="88" stroke-linecap="round"/>
  <path d="${d}" fill="none" stroke="#fff7dd" stroke-width="3" stroke-dasharray="2 25" opacity=".6"/>
  ${flowers}`);
}
export function tree(kind = 'pink'){
  const colors = kind==='pine'?['#518d80','#326f69','#a3c9b0']:kind==='purple'?['#ad9fc9','#7a78a7','#dcd3f0']:['#f2bdcc','#d999b1','#ffe8e8'];
  return svg(180,240,`<ellipse cx="90" cy="229" rx="58" ry="10" fill="#3c635b" opacity=".15"/>
   <path d="M78 230L84 85h17l5 145" fill="#a3807a"/><path d="M91 160L50 104M95 142l36-47" stroke="#a3807a" stroke-width="9" stroke-linecap="round"/>
   <g fill="${colors[1]}"><ellipse cx="53" cy="92" rx="47" ry="53"/><ellipse cx="125" cy="90" rx="47" ry="55"/><ellipse cx="90" cy="65" rx="57" ry="59"/></g>
   <g fill="${colors[0]}"><ellipse cx="50" cy="77" rx="43" ry="42"/><ellipse cx="127" cy="73" rx="41" ry="44"/><ellipse cx="87" cy="46" rx="49" ry="43"/></g>
   <g fill="${colors[2]}" opacity=".55"><ellipse cx="62" cy="38" rx="24" ry="11"/><circle cx="28" cy="66" r="9"/><circle cx="132" cy="52" r="11"/></g>`);
}
export function castle(){
  return svg(340,350,`<defs><linearGradient id="wall"><stop stop-color="#c4d5ee"/><stop offset=".5" stop-color="#fff8f4"/><stop offset="1" stop-color="#b8acd3"/></linearGradient><linearGradient id="roof" x2="1" y2="1"><stop stop-color="#e8aec9"/><stop offset="1" stop-color="#8e7ab6"/></linearGradient></defs>
   <ellipse cx="170" cy="325" rx="160" ry="22" fill="#6d6b99" opacity=".2"/>
   <path d="M20 320V160h58v160M262 320V160h58v160M72 320V216h196v104M136 240V100h68v140" fill="url(#wall)" stroke="#e9e2ed" stroke-width="3"/>
   <path d="M10 163L49 75l40 88M251 163l40-88 40 88M125 105l45-100 45 100" fill="url(#roof)"/>
   <path d="M170 5v-2m0 0v-23l44 12-44 11M49 75V48l32 10-32 10M291 75V48l32 10-32 10" fill="#efd587" stroke="#f8e1a6" stroke-width="3"/>
   <path d="M137 320v-49a33 33 0 0 1 66 0v49" fill="#77678f"/>
   <path d="M163 320v-54a14 14 0 0 1 14 0v54" fill="#fff1bc"/>
   <g fill="#fff0b5"><rect x="40" y="184" width="18" height="35" rx="9"/><rect x="282" y="184" width="18" height="35" rx="9"/><rect x="159" y="128" width="22" height="42" rx="11"/><circle cx="106" cy="242" r="10"/><circle cx="234" cy="242" r="10"/></g>
   <path d="M154 214l16-23 16 23-16 28Z" fill="#a7e6df" stroke="#fff8ef" stroke-width="3"/>
   <g fill="#fff5cf"><path d="M25 40l3 9 9 3-9 3-3 9-3-9-9-3 9-3Z"/><path d="M230 70l3 9 9 3-9 3-3 9-3-9-9-3 9-3Z"/></g>`);
}
export const crystal = () => svg(48,62,`<path d="M7 20L18 3h16l10 17-19 39Z" fill="#b1e5e1" stroke="#fafff0" stroke-width="2"/><path d="M18 3l7 56 9-56M7 20h37" fill="none" stroke="#6bbacb" stroke-width="2"/><path d="M18 5l-7 13h12Z" fill="#fff9ee"/>`);
export const mushroom = () => svg(100,100,`<ellipse cx="50" cy="92" rx="35" ry="6" fill="#294e4c" opacity=".15"/><rect x="40" y="47" width="20" height="46" rx="10" fill="#f3e7d4"/><path d="M8 54Q8 0 50 0T92 54Q50 70 8 54" fill="#da94b2"/><g fill="#fff4ec"><circle cx="30" cy="25" r="8"/><circle cx="63" cy="15" r="7"/><circle cx="76" cy="40" r="6"/></g>`);
export const cloud = () => svg(210,85,`<path d="M25 76C-10 76-8 35 28 33 15 5 73-15 89 15c18-25 67-10 65 12 60-1 67 47 16 49Z" fill="#fffaf2" opacity=".8"/>`);
