// Every drawing uses the same registration point at the hooves. The walk is
// indexed by ground distance so held drawings slow down with the traveller.
export const COASTAL_STRIDE = 86;
export const COASTAL_STEPS = 8;

function leg(x, phase, far, walking) {
  const angle = phase * Math.PI / 4;
  const reach = walking ? Math.cos(angle) * 13 : far ? 4 : -2;
  const lift = walking ? Math.max(0, Math.sin(angle)) * 12 : 0;
  const toe = x + reach, heel = 151 - lift;
  return `<path d="M${x-6} 99 Q${x-8} 116 ${x+reach*.4-3} 128 L${toe-4} ${heel-2}
    Q${toe} ${heel+2} ${toe+6} ${heel} L${toe+3} ${heel-6}
    Q${x+reach*.35+4} 124 ${x+7} 104Z" fill="${far?'#cbbfa5':'#f6eacf'}"/>
    <path d="M${toe-4} ${heel-6}q4 2 7-1l3 5q-1 3-10 2Z" fill="${far?'#766c73':'#987d85'}"/>`;
}

export function coastalPony(pose='attentive', step=0) {
  const walking = pose==='walk';
  const nod = walking ? [0,2,3,1,0,2,3,1][step] : ({curious:-7,proud:-10,encouraging:5})[pose] || 0;
  const swish = walking ? Math.sin(step*Math.PI/4)*5 : pose==='curious'?5:0;
  const eye = pose==='blink' || pose==='encouraging'
    ? '<path d="M169 62q5-7 11-2" fill="none" stroke="#393d44" stroke-width="3" stroke-linecap="round"/>'
    : '<ellipse cx="174" cy="60" rx="6.6" ry="8.4" fill="#fff8e7"/><ellipse cx="175" cy="60" rx="4.9" ry="6.8" fill="#343b43"/><circle cx="176.7" cy="57" r="1.8" fill="#fff8e7"/>';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160" viewBox="0 0 240 160">
    <g transform="rotate(${swish} 82 87)">
      <path d="M89 88C61 67 51 84 40 99Q27 118 12 108Q24 133 47 118Q34 134 21 126C56 149 69 99 89 99Z" fill="#a65f78"/>
      <path d="M84 86C55 74 54 110 29 116C58 116 61 85 82 92Z" fill="#d89091"/>
      <path d="M73 91Q58 131 38 128Q58 126 68 100Z" fill="#809f98"/>
    </g>
    ${leg(87,step+4,true,walking)}${leg(137,step+2,true,walking)}
    <path d="M73 86C82 70 105 78 124 80Q139 81 145 58L163 65Q157 82 154 98C147 118 117 123 94 114Q66 110 73 86Z" fill="#f7ebce"/>
    <path d="M78 102Q99 117 121 112Q141 110 150 98Q140 122 111 119Q86 118 78 102Z" fill="#e2cfb0"/>
    ${leg(84,step,false,walking)}${leg(138,step+6,false,walking)}
    <g transform="rotate(${nod} 148 78)">
      <path d="M161 46C140 34 129 45 126 61Q121 79 108 83Q121 89 130 80Q127 91 117 96Q140 100 150 78Z" fill="#a9657b"/>
      <path d="M151 44C129 47 138 74 120 82Q139 79 143 57Z" fill="#d99197"/>
      <path d="M147 58Q144 83 129 89Q145 87 151 67Z" fill="#82a59c"/>
      <path d="M148 78Q141 65 148 48L145 29Q154 30 161 43Q177 38 183 53Q186 62 196 66Q206 72 198 81Q189 90 173 81L161 76Q156 88 149 94Z" fill="#fff1d5"/>
      <path d="M150 45l-2-11q7 4 9 10Z" fill="#d99896"/>
      <path d="M170 44l17-31q2-3 2 1l-7 33Z" fill="#d6a54d"/>
      <path d="m178 31 7 2m-11 5 9 2" stroke="#f7dd8d" stroke-width="2"/>
      <path d="M145 50q4-18 22-15q15 1 17 13q-5 1-10-4q-4 9-14 10l3-7q-7 7-18 6Z" fill="#c77e88"/>
      <path d="M151 45q11-12 22-6q-10-2-22 6Z" fill="#e9ada2"/>
      ${eye}<ellipse cx="176" cy="71" rx="5" ry="2.7" fill="#e6ac9e"/>
      <circle cx="197" cy="70" r="1.7" fill="#826b68"/><path d="M188 80q4 1 7-2" fill="none" stroke="#aa8478" stroke-width="1.5" stroke-linecap="round"/>
    </g>
    <g fill="#c59d60"><path d="m93 84 2 4 4 1-4 2-2 5-1-5-4-2 4-1Z"/><circle cx="100" cy="94" r="1.4"/><circle cx="86" cy="91" r="1.2"/></g>
  </svg>`;
}
