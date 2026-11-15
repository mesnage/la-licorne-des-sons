// Positions sit within the star field of the painted lunar panorama.
const planet = (id, x, y, width, light, dark, surface, rings = '') => ({
  id,x,y,width,
  art:`<svg xmlns="http://www.w3.org/2000/svg" width="180" height="128" viewBox="0 0 180 128">
    <defs>
      <radialGradient id="sphere" cx=".33" cy=".26" r=".78"><stop stop-color="${light}"/><stop offset="1" stop-color="${dark}"/></radialGradient>
      <clipPath id="disk"><circle cx="90" cy="64" r="53"/></clipPath>
    </defs>
    ${rings && '<ellipse cx="90" cy="64" rx="86" ry="18" transform="rotate(-16 90 64)" fill="none" stroke="#e8c993" stroke-width="7" opacity=".77"/>'}
    <circle cx="90" cy="64" r="53" fill="url(#sphere)"/>
    <g clip-path="url(#disk)">${surface}</g>
    ${rings}
  </svg>`
});

export const MOON_PLANETS = [
  planet('saturn',360,197,237,'#f0dbb6','#ad8b79',
    '<path d="M36 39q51 8 111-3M30 68q63 12 122-3m-119 18q62 9 115 0" fill="none" stroke="#b99481" opacity=".35" stroke-width="6"/>',
    '<path d="M4 64a86 18 0 0 0 172 0" transform="rotate(-16 90 64)" fill="none" stroke="#f3d8a7" stroke-width="7" opacity=".83"/>'),
  planet('jupiter',1420,223,268,'#ffe1b3','#af746d',
    '<path d="M31 38q32 10 71 3t50-6M32 59q47 10 80 2t38 1m-119 19q51 8 77 4t44 0" fill="none" stroke="#bd7b70" stroke-width="10" opacity=".62"/><ellipse cx="115" cy="82" rx="16" ry="7" fill="#b96c66" opacity=".8"/>'),
  planet('mars',3210,211,162,'#ffb184','#9a4e59',
    '<path d="M37 64q18-20 38-13t28-6q16-5 40 10l-4 10q-23-8-35 3t-36 5q-18-5-34 4z" fill="#a95257" opacity=".55"/><path d="M62 17q18 9 44 0L91 8Z" fill="#f7dcc7" opacity=".8"/>')
];
