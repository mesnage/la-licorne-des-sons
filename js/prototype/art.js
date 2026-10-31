import { paintedLandscape, canopy } from './scenery.js';
import { unicornSVG } from '../unicorn.js';
import { pathPoint, WORLDS } from './model.js';
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
export const landscape=(theme=WORLDS[0])=>paintedLandscape(theme,pathPoint);
export const tree=(kind='pink')=>canopy(kind);
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

export const checkpointFlag=()=>svg(100,130,`<ellipse cx="50" cy="122" rx="37" ry="7" fill="#718c7b" opacity=".2"/><path d="M35 120V12" stroke="#947967" stroke-width="7" stroke-linecap="round"/><path d="M39 12h48L72 34l15 22H39Z" fill="#f9deb0" stroke="#fff9e8" stroke-width="3"/><path d="M57 25l6 12-6 12-6-12Z" fill="#8dc8bd"/>`);
export const magicHat=()=>svg(90,80,`<ellipse cx="45" cy="67" rx="43" ry="11" fill="#8b73ac"/><path d="M20 64L15 8Q45-4 75 8L70 64Z" fill="#a699d2"/><path d="M20 50h51v12H20Z" fill="#f4d78b"/><path d="M46 15l3 9 10 3-10 3-3 9-3-9-10-3 10-3Z" fill="#fff4bd"/>`);

export function birdFrame(frame){
  const flap=Math.sin(frame*Math.PI/3),tip=23-flap*19;
  return svg(110,75,`<path d="M34 43Q8 ${tip+9} 3 ${tip+22}Q14 53 40 52Z" fill="#a9c8d5"/>
    <path d="M34 44Q22 ${tip-5} 5 ${tip}Q16 30 43 40Z" fill="#d9e7ed"/>
    <path d="M30 47L7 56l23 2" fill="#9cbbcd"/>
    <ellipse cx="48" cy="47" rx="28" ry="17" fill="#e5edf0"/>
    <ellipse cx="50" cy="52" rx="22" ry="10" fill="#faf5e8"/>
    <path d="M42 43Q35 ${tip+3} 20 ${tip+9}Q28 48 55 52Z" fill="#b5cfda"/>
    <circle cx="72" cy="33" r="17" fill="#e5edf0"/>
    <path d="M85 33l17 5-17 5Z" fill="#e8ba78"/>
    <circle cx="78" cy="30" r="3.5" fill="#435868"/><circle cx="79" cy="29" r="1" fill="#fff"/>
    <ellipse cx="78" cy="39" rx="4" ry="2" fill="#edc8ca"/>`);
}

export function pailletteEmotion(emotion){
  let source=pailletteFrame(0,emotion==='proud');
  if(emotion==='curious')source=source.replace('class="m-smile"','style="display:none" class="m-smile"').replace('</svg>','<path d="M113 55q10-8 21-2" stroke="#684a7b" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="141" cy="106" rx="4" ry="5" fill="#955078"/></svg>');
  if(emotion==='encouraging')source=pailletteFrame(0,true).replace('</svg>','<style>.m-open{display:none}.m-smile{display:inline}</style></svg>');
  return source;
}
