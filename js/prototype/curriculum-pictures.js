import { animals, objects } from '../data/curriculum-next.js';
import { curriculumAnimal as animal } from './curriculum-animals.js';

const props = {
  apple: ['#d74c57', '<path d="M80 45c-31-21-52 4-42 34 6 18 19 27 42 20 23 7 36-2 42-20 10-30-11-55-42-34Z" fill="currentColor"/><path d="M80 45q-3-16 5-22"/><path d="M83 34q8-18 26-14-6 17-26 14Z" fill="#71a65c"/>'],
  pear: ['#b4ca55', '<path d="M80 32c-18 0-16 19-27 30-29 31-6 46 27 46s56-15 27-46C96 51 98 32 80 32Z" fill="currentColor"/><path d="M80 32q0-10 8-17"/>'],
  bowl: ['#e0a651', '<path d="M26 53q5 52 54 52t54-52Z" fill="currentColor"/><ellipse cx="80" cy="53" rx="54" ry="13" fill="currentColor"/><path d="M41 53q39 15 78 0" fill="none"/>'],
  book: ['#7861aa', '<rect x="36" y="21" width="86" height="89" rx="8" fill="currentColor"/><path d="M49 24v73m-10 3h80v9H45q-9 0-9-8" fill="#fff1d7"/><path d="M65 44h41m-41 13h32" stroke="#fff1d7" stroke-width="4"/>'],
  ball: ['#e39e59', '<circle cx="80" cy="64" r="45" fill="currentColor"/><path d="M43 42q37 41 79 42M84 20q-29 24-15 87" fill="none" stroke="#fff4dc" stroke-width="5"/>'],
  flower: ['#df79a6', '<path d="M80 64v45" stroke="#557d45" stroke-width="5"/><path d="M80 102q-27-2-30-22 23-2 30 22Zm0-8q24-1 29-20-23-1-29 20Z" fill="#7ba65f"/><path d="M80 33q17-23 25-1 23 4 11 22 5 24-17 22-13 20-27 2-24 8-26-13-18-12-1-28 6-21 24-14Z" fill="currentColor"/><circle cx="80" cy="52" r="12" fill="#f6d46d"/>'],
  moon: ['#f2c75f', '<path d="M96 18a46 46 0 1 0 27 71A49 49 0 0 1 96 18Z" fill="currentColor"/>'],
  basket: ['#bc8759', '<path d="M52 58V47a28 28 0 0 1 56 0v11" fill="none" stroke-width="6"/><path d="M32 55h96l-12 43q-2 7-9 7H53q-7 0-9-7Z" fill="currentColor"/><path d="M44 71h72M49 86h62m-48-28 5 45m13-45v45m17-45-5 45" fill="none" stroke="#fff2d7"/>'],
  key: ['#edbe55', '<path d="M65 71a25 25 0 1 1 13-16h53v13h-11v12h-13V68H78Z" fill="currentColor"/><circle cx="51" cy="53" r="8" fill="#fffbf1"/>'],
  door: ['#a0765d', '<path d="M40 111V15h80v96m-89 0h98" fill="none" stroke-width="5"/><rect x="49" y="23" width="62" height="88" fill="currentColor"/><rect x="58" y="31" width="44" height="29" rx="3" fill="currentColor"/><circle cx="98" cy="76" r="4" fill="#f2c75f"/>']
};

const table = '<path d="M28 65v53m104-53v53" stroke="#91664d" stroke-width="9"/><rect x="12" y="60" width="136" height="12" rx="5" fill="#c8986a" stroke="#73513d" stroke-width="3"/>';
const scenery = {
  tree: '<path d="M112 104h17l-3-53h-10Z" fill="#93674a"/><path d="M120 23c-21-7-25 13-22 20-17 8-11 26 4 27 7 11 28 11 36 0 18 0 19-22 7-27 1-14-12-23-25-20Z" fill="#76a461" stroke="#53784a" stroke-width="3"/>',
  pond: '<ellipse cx="117" cy="96" rx="37" ry="16" fill="#89c9dc" stroke="#4f8fa3" stroke-width="3"/><path d="M92 96h12m5 8h15m-5-15h13" stroke="#e7f8fa" stroke-width="3"/>'
};

export function pictureLabel({ id, color, count, place, near }) {
  const [name, detail] = animals[id] ?? objects[id];
  if (color) return name + (color === 'red' ? ' rouge' : detail ? ' bleue' : ' bleu');
  if (count === 2) return 'deux ' + detail;
  if (count === 1) return (name.startsWith('la ') ? 'une ' : 'un ') + name.slice(3);
  if (place) return name + (place === 'on' ? ' sur la table' : ' sous la table');
  if (near) return name + (near === 'tree' ? ' près de l’arbre' : ' près de la mare');
  return name;
}

export function pictureSVG({ id, color, count, place, near }) {
  let drawing;
  if (Object.hasOwn(props, id)) {
    const [base, paths] = props[id];
    const fill = { red: '#d64956', blue: '#437fc5' }[color] ?? base;
    drawing = `<g color="${fill}" fill="none" stroke="#4e3c4c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${paths}</g>`;
  } else if (place) {
    drawing = table + (place === 'on' ? animal(id, 45, -3, 70) : animal(id, 50, 64, 60));
  } else if (near) {
    drawing = scenery[near] + animal(id, 4, 35, 82);
  } else if (count === 2) {
    drawing = animal(id, 2, 24, 78) + animal(id, 80, 24, 78);
  } else {
    drawing = animal(id, 22, 4, 116);
  }
  return '<svg viewBox="0 0 160 125" aria-hidden="true">' + drawing + '</svg>';
}
