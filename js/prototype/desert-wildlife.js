import { animalPatrol } from './animal-motion.js';
import { pathPoint } from './model.js?v=review-16';

const frameCount=8;
const tau=2*Math.PI;
export const DESERT_ANIMALS=[
  {kind:'geocoucou',stop:.066,lane:-37,width:135,range:68,period:6.4,stride:31,bounce:3},
  {kind:'lezard',stop:.19,lane:112,width:116,range:31,period:7.4,stride:18,bounce:1},
  {kind:'lievre',stop:.55,lane:-32,width:111,range:85,period:8.2,stride:39,bounce:14},
  {kind:'tatou',stop:.80,lane:103,width:145,range:54,period:10,stride:24,bounce:2}
];

const svg = content => `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="112" viewBox="0 0 160 112">${content}</svg>`;
const eye = (x,y) => `<circle cx="${x}" cy="${y}" r="3.2" fill="#372c31"/><circle cx="${x+.9}" cy="${y-.95}" r="1" fill="#fff0d7"/>`;

function leg(x,y,length,step,color){
  const footX=x+step*6,footY=105-Math.max(0,step)*length*.22;
  return `<path d="M${x} ${y} Q${x-step*5} ${(y+footY)/2} ${footX} ${footY} l7 0" fill="none" stroke="${color}" stroke-width="${length/4.2}" stroke-linecap="round"/>`;
}

const drawings={
  geocoucou(step,lift,greet){
    const tail=`<path d="M69 59Q43 58 9 31q22 4 48 15l22 8" fill="#596b64" stroke="#3e514d" stroke-width="2.1" transform="rotate(${-step*7} 67 58)"/>`;
    return tail+leg(85,76,22,-step,'#92674f')+leg(72,75,22,step,'#673f3f')+`
      <path d="M61 51q23-19 47-5 13 6 11 23-9 16-34 14-32-5-31-20Z" fill="#ab8359" stroke="#66554b" stroke-width="2"/>
      <path d="M62 55q20-13 43 2-19 20-44 10Z" fill="#735f52"/>
      <path d="m64 60 26-1m-20 8 22-4m-16 11 16-4" fill="none" stroke="#e3bd82" stroke-width="2" stroke-linecap="round"/>
      <g transform="rotate(${greet?-12:step*7} 106 70)">
        <path d="M98 69q-1-13 11-30 1-15 18-14 14 2 13 11-2 8-16 12l-7 22Z" fill="#ccb38a" stroke="#6d6359" stroke-width="2"/>
        <path d="m116 28-7-13 13 8 2-13 7 15" fill="#577467"/>
        <path d="m137 33 18 3-19 6" fill="#d0a563" stroke="#806547" stroke-width="1.6"/>
        <path d="M118 37l12-2" stroke="#d98265" stroke-width="5" stroke-linecap="round"/>
        ${eye(128,33)}
      </g>`;
  },
  lezard(step,lift,greet){
    return `
      <path d="M69 77C44 78 31 58 10 65 23 64 26 91 67 92" stroke="#748554" stroke-width="11" fill="none" stroke-linecap="round" transform="rotate(${step*11} 69 82)"/>
      ${leg(84,86,12,-step,'#557254')}${leg(115,85,13,step,'#567654')}
      <path d="M53 83q8-18 40-15l18 4q27-8 39 5l-1 10q-16 11-42 3l-33 4q-16-1-21-11" fill="#9ea665" stroke="#586847" stroke-width="2"/>
      <path d="m70 73 4-10 7 7 8-12 5 11 8-9 5 12m21 0 3-8 6 8" fill="#aa9764" stroke="#6f7650" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="m68 84 13-4m4 6 15-5m6 2 7-4" stroke="#d9c87d" stroke-width="3" stroke-linecap="round"/>
      <path d="M146 85l-11 3" fill="none" stroke="#697752" stroke-width="1.6"/>
      ${eye(135,77)}
      ${greet?'<path d="m148 85 9-1m-2 0 4-2m-4 2 4 1" stroke="#df8c92" stroke-width="1.5" stroke-linecap="round"/>':''}`;
  },
  lievre(step,lift,greet){
    return `
      <ellipse cx="43" cy="80" rx="13" ry="11" fill="#fff0d8"/>
      <ellipse cx="65" cy="76" rx="31" ry="23" fill="#c39263" stroke="#826149" stroke-width="2"/>
      <path d="M74 69q17-24 35-22l12 26q-9 21-41 19" fill="#dfb98c"/>
      <path d="M67 80q-18-6-24 8l-10 ${9+lift*3}q4 7 18 4l27-10" fill="#b9825c" stroke="#9b6a50" stroke-width="2" transform="rotate(${step*19} 66 81)"/>
      ${leg(104,85,13,step,'#b98060')}
      <g transform="rotate(${greet?-9:step*4} 106 61)">
        <g transform="rotate(${step*10} 105 54)">
          <path d="M98 55C80 33 79 6 85 4c8-2 22 21 22 47m1 0c-5-18-2-45 5-45 8 0 11 27 5 48" fill="#c3956e" stroke="#815e4f" stroke-width="2"/>
          <path d="M100 39q-10-13-13-29 8 2 15 26m9 4q-1-18 2-29 6 7 2 27" fill="#deada8"/>
        </g>
        <path d="M91 61q2-14 24-13 17 4 18 18l12 8q-9 11-29 9-22-4-25-22" fill="#dbb78b" stroke="#8f6f57" stroke-width="2"/>
        <ellipse cx="130" cy="76" rx="10" ry="5" fill="#fff1d5"/>
        <circle cx="141" cy="73" r="2.4" fill="#845d56"/>
        ${eye(118,62)}
      </g>`;
  },
  tatou(step,lift,greet){
    return `
      <path d="M70 86Q45 91 15 102q9-10 38-23" fill="#a68c73" stroke="#7f665a" stroke-width="2" transform="rotate(${step*6} 65 88)"/>
      ${leg(66,90,13,step,'#8c6a58')}${leg(104,89,13,-step,'#775d52')}
      <g transform="rotate(${greet?-14:step*4} 117 82)">
        <path d="M110 71q9-8 22 0l21 17q-2 5-15 5l-27-7" fill="#b99b7d" stroke="#7d6557" stroke-width="2"/>
        <path d="M123 72q-8-22-4-24 8 1 12 24m-2 1q0-18 5-19 5 3 1 20" fill="#af8e78" stroke="#836a5c" stroke-width="1.5"/>
        ${eye(135,79)}
      </g>
      <path d="M45 86Q33 65 56 48q26-20 52-4 15 9 18 33l-9 17q-54 14-72-8" fill="#ac9384" stroke="#7d655c" stroke-width="2.4"/>
      <path d="M70 42q-17 26-4 55m14-58q-14 27-3 58m13-58q-11 26-1 56m10-52q-7 22 2 49" fill="none" stroke="#d8b69e" stroke-width="4"/>
      <path d="M45 73q34 17 75 4" fill="none" stroke="#7f6a62" stroke-width="2" opacity=".55"/>`;
  }
};

export function desertFrames(){
  return Object.entries(drawings).flatMap(([kind,draw])=>Array.from({length:frameCount+1},(_,frame)=>{
    const step=frame===frameCount?0:Math.sin(frame/frameCount*tau);
    return [kind+'-'+frame,svg(draw(step,Math.max(0,step),frame===frameCount))];
  }));
}

export function createDesertAnimal(scene,spec,reduced){
  const root=scene.add.container(0,0).setDepth(spec.lane<0?-3.6:4.4);
  const shadow=scene.add.ellipse(0,0,spec.width*.56,8,0x81523b,.24);
  const drawing=scene.add.image(0,0,spec.kind+'-0').setOrigin(.5,.94);
  drawing.setScale(spec.width/drawing.width);
  root.add([shadow,drawing]);
  const animal={root,shadow,drawing,spec,greetUntil:0};
  poseDesertAnimal(animal,0,reduced);
  return animal;
}

export function poseDesertAnimal({root,shadow,drawing,spec,greetUntil},seconds,reduced=false){
  const motion=animalPatrol(seconds+spec.period*.24,spec.period,spec.range);
  const point=pathPoint(spec.stop+(reduced?0:motion.offset)/3160);
  root.setPosition(point.x,point.y+spec.lane);
  if(reduced)return;
  const greeting=greetUntil>seconds;
  const stride=motion.walked/spec.stride;
  const frame=greeting?frameCount:motion.effort>.015?Math.floor(stride*frameCount)%frameCount:0;
  const texture=spec.kind+'-'+frame;
  if(drawing.texture.key!==texture)drawing.setTexture(texture);
  const lift=Math.sin(stride*Math.PI)**2*spec.bounce*motion.effort;
  drawing.y=-lift;
  drawing.setFlipX(motion.facing<0);
  shadow.setScale(1-lift*.018).setAlpha(.24-lift*.008);
}
