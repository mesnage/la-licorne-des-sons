/* La Licorne des Sons — Paillette, dessinée en SVG */
let uid = 0;
function unicornSVG(){
  const p = 'u' + (++uid);
  const heart = (cx, cy, k) => `M${cx} ${cy+k*.9} C${cx-k*1.5} ${cy-k*.1} ${cx-k*.7} ${cy-k*1.2} ${cx} ${cy-k*.4} C${cx+k*.7} ${cy-k*1.2} ${cx+k*1.5} ${cy-k*.1} ${cx} ${cy+k*.9}Z`;
  const eye = (cx) => `
    <ellipse cx="${cx}" cy="75" rx="12" ry="14" fill="url(#${p}sc)"/>
    <ellipse cx="${cx+2}" cy="77" rx="10" ry="12" fill="url(#${p}i)"/>
    <ellipse cx="${cx+2}" cy="77" rx="10" ry="12" fill="none" stroke="#2a0a5e" stroke-width="1.2" opacity=".55"/>
    <ellipse cx="${cx+3}" cy="78" rx="4.8" ry="6" fill="#1f0636"/>
    <path d="M${cx-5} 84 Q${cx+2} 89 ${cx+9} 83" stroke="#e8d9ff" stroke-width="2" fill="none" opacity=".75" stroke-linecap="round"/>
    <ellipse cx="${cx}" cy="75" rx="12" ry="14" fill="url(#${p}lid)"/>
    <circle cx="${cx+6}" cy="71" r="3.8" fill="#fff"/>
    <circle cx="${cx-2}" cy="83" r="1.7" fill="#fff"/>
    <circle cx="${cx+1}" cy="69" r="1.1" fill="#fff" opacity=".9"/>`;
  return `<svg class="uni" viewBox="0 0 200 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="${p}b" cx="36%" cy="24%" r="80%"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#fdf8ff"/><stop offset=".8" stop-color="#e8d9ff"/><stop offset="1" stop-color="#c9abf5"/></radialGradient>
    <linearGradient id="${p}lg" x1="0" x2="1"><stop offset="0" stop-color="#cdb3f6"/><stop offset=".35" stop-color="#ffffff"/><stop offset=".7" stop-color="#f1e7ff"/><stop offset="1" stop-color="#bfa0f0"/></linearGradient>
    <linearGradient id="${p}lb" x1="0" x2="1"><stop offset="0" stop-color="#ac8ce4"/><stop offset=".35" stop-color="#e6d9ff"/><stop offset=".7" stop-color="#d4c0fa"/><stop offset="1" stop-color="#9c7bdb"/></linearGradient>
    <linearGradient id="${p}hf" x1="0" x2="1"><stop offset="0" stop-color="#5b2fc2"/><stop offset=".35" stop-color="#c3a2ff"/><stop offset=".7" stop-color="#9466f2"/><stop offset="1" stop-color="#4f26ad"/></linearGradient>
    <linearGradient id="${p}m1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd0e8"/><stop offset=".45" stop-color="#ff74b4"/><stop offset="1" stop-color="#d8287a"/></linearGradient>
    <linearGradient id="${p}m2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8dbff"/><stop offset=".45" stop-color="#a47bff"/><stop offset="1" stop-color="#5f30cf"/></linearGradient>
    <linearGradient id="${p}m3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d2fffb"/><stop offset=".45" stop-color="#45d6dd"/><stop offset="1" stop-color="#0f8f9c"/></linearGradient>
    <linearGradient id="${p}h" x1="0" x2="1"><stop offset="0" stop-color="#dd8a00"/><stop offset=".3" stop-color="#ffd34d"/><stop offset=".5" stop-color="#fff6c4"/><stop offset=".72" stop-color="#ffcf45"/><stop offset="1" stop-color="#d68300"/></linearGradient>
    <radialGradient id="${p}i" cx="50%" cy="62%" r="62%"><stop offset="0" stop-color="#f4eaff"/><stop offset=".3" stop-color="#c39dff"/><stop offset=".7" stop-color="#7a3fe6"/><stop offset="1" stop-color="#2d0b63"/></radialGradient>
    <radialGradient id="${p}sc" cx="50%" cy="70%" r="65%"><stop offset="0" stop-color="#ffffff"/><stop offset=".75" stop-color="#ffffff"/><stop offset="1" stop-color="#e2d4f6"/></radialGradient>
    <linearGradient id="${p}lid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a2896" stop-opacity=".45"/><stop offset=".38" stop-color="#5a2896" stop-opacity="0"/></linearGradient>
    <radialGradient id="${p}s" cx="50%" cy="28%" r="72%"><stop offset="0" stop-color="#fff5fa"/><stop offset=".55" stop-color="#ffd3e8"/><stop offset="1" stop-color="#f4a2c9"/></radialGradient>
    <radialGradient id="${p}ei" cx="50%" cy="70%" r="70%"><stop offset="0" stop-color="#ffd9ea"/><stop offset="1" stop-color="#ff8fc1"/></radialGradient>
    <linearGradient id="${p}gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7ab8"/><stop offset="1" stop-color="#7a1550"/></linearGradient>
    <linearGradient id="${p}hat" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7fe3f0"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient>
    <clipPath id="${p}cb"><ellipse cx="78" cy="122" rx="48" ry="32"/></clipPath>
    <clipPath id="${p}ch"><ellipse cx="140" cy="76" rx="41" ry="37"/></clipPath>
  </defs>

  <ellipse class="u-shadow" cx="90" cy="171" rx="66" ry="8" fill="#2c0c45" opacity=".28"/>
  <g>

  <g class="u-tail">
    <path d="M38 106 C24 82 0 90 3 112 C12 98 26 102 36 116 Z" fill="url(#${p}m3)"/>
    <path d="M38 112 C8 96 -6 132 12 152 C9 134 22 126 37 128 Z" fill="url(#${p}m2)"/>
    <path d="M38 120 C14 120 8 154 30 164 C23 147 31 136 43 134 Z" fill="url(#${p}m1)"/>
    <path d="M14 108 C18 102 26 102 32 108 M8 128 C10 118 20 112 30 114 M20 146 C20 136 26 130 34 128" stroke="#fff" stroke-width="2.2" fill="none" opacity=".55" stroke-linecap="round"/>
  </g>

  <rect x="40" y="128" width="17" height="40" rx="8.5" fill="url(#${p}lb)"/>
  <rect x="94" y="128" width="17" height="40" rx="8.5" fill="url(#${p}lb)"/>
  <rect x="40" y="157" width="17" height="12" rx="6" fill="url(#${p}hf)"/>
  <rect x="94" y="157" width="17" height="12" rx="6" fill="url(#${p}hf)"/>

  <g class="u-acc u-wings"><g class="u-wing">
    <path d="M86 98 C70 60 40 50 20 60 C32 64 36 68 38 73 C28 73 22 79 20 86 C32 84 38 86 42 90 C36 94 34 100 34 106 C50 98 70 100 86 104Z" fill="#fff" stroke="#d6c4fb" stroke-width="1.5"/>
    <path d="M80 96 C66 74 48 66 32 67 M76 100 C62 88 50 86 40 88" stroke="#ffc6e1" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  </g></g>
  <ellipse cx="78" cy="122" rx="48" ry="32" fill="url(#${p}b)"/>
  <g clip-path="url(#${p}cb)">
    <ellipse cx="116" cy="102" rx="28" ry="14" fill="#8e63d9" opacity=".35"/>
    <ellipse cx="80" cy="156" rx="46" ry="10" fill="#9a74e0" opacity=".45"/>
  </g>
  <ellipse cx="62" cy="104" rx="22" ry="7.5" fill="#fff" opacity=".95"/>
  <path d="M34 112 Q44 94 66 91" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".9"/>

  <rect x="56" y="132" width="18" height="38" rx="9" fill="url(#${p}lg)"/>
  <rect x="108" y="130" width="18" height="40" rx="9" fill="url(#${p}lg)"/>
  <rect x="56" y="158" width="18" height="13" rx="6.5" fill="url(#${p}hf)"/>
  <rect x="108" y="158" width="18" height="13" rx="6.5" fill="url(#${p}hf)"/>
  <rect x="60" y="160" width="5" height="3.5" rx="1.7" fill="#fff" opacity=".75"/>
  <rect x="112" y="160" width="5" height="3.5" rx="1.7" fill="#fff" opacity=".75"/>

  <g class="u-mane">
    <path d="M114 44 C80 40 66 78 78 108 C68 104 64 122 78 130 C98 122 104 94 122 78 Z" fill="url(#${p}m2)"/>
    <path d="M122 40 C96 50 90 86 102 110 C110 94 116 82 130 72 Z" fill="url(#${p}m1)"/>
    <path d="M100 58 C92 70 90 84 94 98" stroke="#fff" stroke-width="3" fill="none" opacity=".55" stroke-linecap="round"/>
    <path d="M84 68 C78 80 78 94 82 106" stroke="#fff" stroke-width="2.5" fill="none" opacity=".45" stroke-linecap="round"/>
  </g>

  <path d="M108 52 Q100 18 129 42 Z" fill="url(#${p}b)" stroke="#dcc8fb" stroke-width="1.2" stroke-linejoin="round"/>
  <path d="M110.5 46 Q106 29 123 41 Z" fill="url(#${p}ei)"/>
  <g class="u-ear">
    <path d="M172 52 Q182 18 153 42 Z" fill="url(#${p}b)" stroke="#dcc8fb" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M169.5 46 Q175 29 159 41 Z" fill="url(#${p}ei)"/>
  </g>

  <ellipse cx="140" cy="76" rx="41" ry="37" fill="url(#${p}b)"/>
  <g clip-path="url(#${p}ch)">
    <ellipse cx="140" cy="118" rx="40" ry="14" fill="#9a74e0" opacity=".35"/>
    <ellipse cx="180" cy="86" rx="10" ry="26" fill="#a985ea" opacity=".3"/>
  </g>

  <path d="M130 44 L142 2 L154 44 Z" fill="url(#${p}h)" stroke="#c97a00" stroke-width="1.2" stroke-linejoin="round"/>
  <path d="M132 36 Q142 30 152 34 M134.5 26 Q142 21 149.5 24.5 M137 16.5 Q142 13 147 15" stroke="#c97a00" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/>
  <path d="M139.5 40 L142.5 9" stroke="#fff" stroke-width="2.2" opacity=".9" stroke-linecap="round"/>

  <path d="M116 47 C121 28 154 25 160 42 C150 37 141 46 136 60 C131 50 124 47 116 47 Z" fill="url(#${p}m1)"/>
  <path d="M150 40 C165 32 177 46 170 60 C165 50 158 48 150 48 Z" fill="url(#${p}m3)"/>
  <path d="M123 41 C130 34 142 32 149 35" stroke="#fff" stroke-width="3" fill="none" opacity=".75" stroke-linecap="round"/>
  <path d="M158 40 C163 39 167 41 169 45" stroke="#fff" stroke-width="2.2" fill="none" opacity=".7" stroke-linecap="round"/>

  <ellipse cx="165" cy="60" rx="6" ry="3.6" fill="#fff" opacity=".9"/>
  <g class="u-acc u-hat">
    <path d="M100 50 L128 37 L102 6Z" fill="url(#${p}hat)" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>
    <circle cx="110" cy="34" r="2.4" fill="#fff"/><circle cx="118" cy="40" r="2" fill="#ffd34d"/><circle cx="106" cy="20" r="1.8" fill="#fff"/>
    <path d="M100 50 Q114 46 128 37" stroke="#ffd34d" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <circle cx="102" cy="6" r="5.5" fill="#ff5fa8"/><circle cx="100.5" cy="4.5" r="1.8" fill="#fff" opacity=".8"/>
  </g>

  </g>
  <g class="u-open u-blink">
    ${eye(124)}${eye(156)}
    <path d="M112.2 72 A12 14 0 0 1 135.8 72 M144.2 72 A12 14 0 0 1 167.8 72" stroke="#3a1050" stroke-width="2.8" fill="none" stroke-linecap="round"/>
    <path d="M113.5 66.5 L107.5 63 M116.5 62.5 L112.5 57 M166.5 66.5 L172.5 63 M163.5 62.5 L167.5 57" stroke="#3a1050" stroke-width="2.3" stroke-linecap="round"/>
  </g>
  <g class="u-happy">
    <path d="M113 79 Q124 64 135 79 M145 79 Q156 64 167 79" stroke="#3a1050" stroke-width="3.6" fill="none" stroke-linecap="round"/>
    <path d="M113.5 75 L107.5 71 M166.5 75 L172.5 71" stroke="#3a1050" stroke-width="2.3" stroke-linecap="round"/>
  </g>

  <ellipse cx="141" cy="99" rx="23" ry="13" fill="url(#${p}s)"/>
  <ellipse cx="135" cy="92" rx="7" ry="2.6" fill="#fff" opacity=".8"/>
  <ellipse cx="132.5" cy="97" rx="2.4" ry="1.7" fill="#c94f8a"/>
  <ellipse cx="149.5" cy="97" rx="2.4" ry="1.7" fill="#c94f8a"/>
  <path class="m-smile" d="M133 103.5 Q141 111.5 149 103.5" stroke="#b02d6c" stroke-width="2.7" fill="none" stroke-linecap="round"/>
  <g class="m-open">
    <path d="M131 102 Q141 117 151 102 Q141 105 131 102 Z" fill="#8e1f57"/>
    <path d="M135 108.5 Q141 114 147 108.5 Q141 106 135 108.5 Z" fill="#ff7fb4"/>
  </g>
  <ellipse class="m-o" cx="141" cy="106" rx="4" ry="4.8" fill="#8e1f57"/>

  <ellipse cx="110" cy="91" rx="8.5" ry="5" fill="#ff7ab8" opacity=".55"/>
  <ellipse cx="172" cy="91" rx="8.5" ry="5" fill="#ff7ab8" opacity=".55"/>

  <g class="u-acc u-glasses">
    <path d="M108 74 L101 68 M172 74 L179 68" stroke="#3a1050" stroke-width="2.6" stroke-linecap="round"/>
    <path d="${heart(124,77,11)}" fill="url(#${p}gl)" stroke="#3a1050" stroke-width="1.5"/>
    <path d="${heart(156,77,11)}" fill="url(#${p}gl)" stroke="#3a1050" stroke-width="1.5"/>
    <path d="M134 72 Q140 68 146 72" stroke="#3a1050" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="118" cy="72" rx="4" ry="2.4" fill="#fff" opacity=".75" transform="rotate(-25 118 72)"/>
    <ellipse cx="150" cy="72" rx="4" ry="2.4" fill="#fff" opacity=".75" transform="rotate(-25 150 72)"/>
  </g>
  <g class="u-acc u-stache">
    <path d="M141 101 C134 95 123 97 119 104 C124 101 129 104 132 106 C136 108 140 106 141 103 C142 106 146 108 150 106 C153 104 158 101 163 104 C159 97 148 95 141 101Z" fill="#6b3a1f"/>
    <path d="M128 100 Q133 99 137 101" stroke="#fff" stroke-width="1.4" opacity=".5" fill="none" stroke-linecap="round"/>
  </g>
  <path class="u-twinkle" d="M150 4 l2.2 5.8 5.8 2.2 -5.8 2.2 -2.2 5.8 -2.2 -5.8 -5.8 -2.2 5.8 -2.2z" fill="#fff"/>
</svg>`;
}

export { unicornSVG };
