// Picture-card illustrations. All animals share the same baseline and a clear silhouette.
const eyes = (left, right, y) => `<g fill="#382d3d" stroke="none">
  <circle cx="${left}" cy="${y}" r="3.8"/><circle cx="${right}" cy="${y}" r="3.8"/>
  <circle cx="${left - 1}" cy="${y - 1.3}" r="1.15" fill="#fff"/><circle cx="${right - 1}" cy="${y - 1.3}" r="1.15" fill="#fff"/>
</g>`;

const portraits = {
  bunny: `<ellipse cx="64" cy="82" rx="26" ry="25" fill="#e8c4ad"/>
    <circle cx="88" cy="86" r="12" fill="#fff3df"/><ellipse cx="46" cy="100" rx="15" ry="7" fill="#f6ddc8"/>
    <ellipse cx="82" cy="100" rx="15" ry="7" fill="#f6ddc8"/>
    <path d="M45 54C29 24 33 5 42 7c10 2 18 25 19 42m9 0C73 25 80 5 88 8c9 3 5 29-3 46" fill="#f6ddc8"/>
    <path d="M44 18l10 28m31-28-8 27" stroke="#c97988" stroke-width="5"/>
    <ellipse cx="64" cy="60" rx="28" ry="24" fill="#f6ddc8"/>
    <ellipse cx="64" cy="68" rx="16" ry="11" fill="#fff3df" stroke="none"/>
    ${eyes(53,75,58)}<path d="M60 66q4 6 8 0Z" fill="#c97988"/>`,
  fox: `<path d="M67 92q40 11 48-35-17 0-28 14L69 80Z" fill="#d77942"/>
    <path d="M115 57q-17 0-26 13l18 4q5-7 8-17Z" fill="#fff1d9"/>
    <ellipse cx="59" cy="83" rx="28" ry="23" fill="#da814c"/>
    <path d="M38 90v12h12V89m17 0v13h12V89" fill="#623e48"/>
    <path d="M31 51 26 21l25 16q9-3 17 0l23-16-3 31 6 14-20 15-21 1-29-15Z" fill="#e18c4f"/>
    <path d="m33 33 12 9-11 6Zm52 0-12 9 11 6Z" fill="#8e5255" stroke="none"/>
    <path d="M25 65q20-7 32 4 14-11 36-3L73 81H52Z" fill="#fff1d9" stroke="none"/>
    ${eyes(46,70,57)}<path d="M54 67q5 7 10 0Z" fill="#4e3542"/>`,
  cow: `<path d="M28 86v18h12V89m36-1v16h13V86" fill="#6e5864"/>
    <path d="M92 70q23-13 18 13" fill="none"/><circle cx="110" cy="86" r="4" fill="#66515b"/>
    <rect x="25" y="62" width="69" height="32" rx="16" fill="#fff3dc"/>
    <path d="M68 63h8q16 4 15 16-11 9-18 0-7-7-5-16Z" fill="#6e5864" stroke="none"/>
    <path d="M29 49q-12-5-13-14 13-3 20 7m34 0q8-12 19-7-1 10-12 15" fill="#d38b95"/>
    <path d="M34 38q-6-8-2-15l12 14m15 0 10-14q6 8 0 15" fill="#efcb8b"/>
    <ellipse cx="53" cy="55" rx="25" ry="21" fill="#fff3dc"/>
    <path d="M51 35q15-3 23 10-5 12-17 9-8-5-6-19Z" fill="#6e5864" stroke="none"/>
    ${eyes(43,65,52)}<rect x="31" y="59" width="44" height="22" rx="10" fill="#e4a2aa"/>
    <path d="M44 69h2m14 0h2" stroke="#7d5264" stroke-width="3.5"/>`,
  turtle: `<path d="M21 80 9 84l15 7m17-7-9 17h14l7-12m16-1 6 13h13l-5-19" fill="#8eb874"/>
    <path d="M72 80q8-34 26-33 18 1 19 15 1 11-17 13l-7 14Z" fill="#a5c780"/>
    <path d="M21 82q0-41 35-41 34 0 35 41Z" fill="#799454"/>
    <path d="m31 79 9-18 17-6 17 7 8 17m-42-18-3-12m20 6 1-13m16 20 6-10m-23 3v25" fill="none" stroke="#486744"/>
    <path d="M22 82h69v9H25Z" fill="#d8b76d"/>
    <circle cx="103" cy="58" r="3.5" fill="#382d3d" stroke="none"/><path d="M104 67q4 2 8 0" fill="none"/>`,
  owl: `<path d="M37 40 30 22l24 9q10-4 20 0l24-9-8 21q15 16 12 36-5 24-38 24-34 0-38-24-4-21 11-39Z" fill="#ac7961"/>
    <path d="M34 62q-8 20 11 31l9-13m40-18q7 20-11 31l-9-13" fill="#875d58"/>
    <ellipse cx="64" cy="79" rx="20" ry="21" fill="#e3b890" stroke="none"/>
    <circle cx="50" cy="54" r="16" fill="#fff0d1"/><circle cx="78" cy="54" r="16" fill="#fff0d1"/>
    ${eyes(50,78,54)}<path d="m60 62 4 8 4-8Z" fill="#e8aa4b"/><path d="M49 103h10m10 0h10" stroke="#965d44" stroke-width="5"/>`,
  crab: `<path d="m37 83-17 8-5 10m23-10-10 7-2 7m65-22 17 8 5 10M90 91l10 7 2 7M35 76 21 64m72 12 14-12" fill="none" stroke="#a74650" stroke-width="4"/>
    <path d="M20 64Q3 60 10 42l9 9 8-10q12 15-7 23Zm88 0q17-4 10-22l-9 9-8-10q-12 15 7 23Z" fill="#e57c71"/>
    <ellipse cx="64" cy="82" rx="30" ry="20" fill="#e57c71"/>
    <path d="m52 73-2-13m26 13 2-13" stroke="#a74650" stroke-width="4"/>
    <circle cx="50" cy="58" r="7" fill="#fff6df"/><circle cx="78" cy="58" r="7" fill="#fff6df"/>
    ${eyes(50,78,58)}<path d="M59 83q5 5 10 0" fill="none"/>`,
  monkey: `<path d="M80 91q30 8 31-17 0-12-12-10" fill="none" stroke="#9a6450" stroke-width="7"/>
    <ellipse cx="62" cy="82" rx="24" ry="24" fill="#a9785d"/><ellipse cx="62" cy="85" rx="14" ry="17" fill="#deb293" stroke="none"/>
    <path d="M43 83q-16 14-7 19h14m29-19q16 14 7 19H72" fill="#a9785d"/>
    <circle cx="33" cy="51" r="11" fill="#deb293"/><circle cx="93" cy="51" r="11" fill="#deb293"/>
    <path d="M36 50q0-24 27-24 28 0 28 25 0 24-28 24-27 0-27-25Z" fill="#a9785d"/>
    <path d="M44 54q-5-16 9-15 8 0 10 7 2-7 10-7 14-1 9 15 7 17-19 18-26-1-19-18Z" fill="#deb293" stroke="none"/>
    ${eyes(53,73,53)}<path d="M58 62q5 5 10 0" fill="none"/>`,
  tiger: `<path d="M82 92q34 1 29-26" fill="none" stroke="#be683d" stroke-width="8"/>
    <path d="M105 74q5-1 7-4" stroke="#4b3642" stroke-width="6"/>
    <ellipse cx="64" cy="83" rx="29" ry="23" fill="#eaa453"/>
    <ellipse cx="48" cy="99" rx="14" ry="7" fill="#eaa453"/><ellipse cx="80" cy="99" rx="14" ry="7" fill="#eaa453"/>
    <circle cx="40" cy="41" r="13" fill="#eaa453"/><circle cx="88" cy="41" r="13" fill="#eaa453"/>
    <ellipse cx="64" cy="58" rx="32" ry="27" fill="#eaa453"/>
    <path d="M62 33v10m-9-9 2 8m20-8-2 8m-37 7 10 3m-10 6 8 1m48-10-10 3m10 6-8 1" stroke="#513746" stroke-width="4"/>
    <ellipse cx="64" cy="69" rx="20" ry="12" fill="#fff0d3" stroke="none"/>
    ${eyes(52,76,55)}<path d="M59 64q5 7 10 0Z" fill="#9c5c68"/>`,
  seal: `<path d="M83 87q20-8 29-25 9 13-8 24l17-4q-6 17-29 15Z" fill="#92aebd"/>
    <path d="M22 79q-8-27 15-34 24-6 31 16 4 9 18 15 16 7 12 16-7 13-38 12-33-1-38-25Z" fill="#a5bdca"/>
    <path d="M39 84q-20 9-17 18 14 5 31-12m13-2q1 12 13 15" fill="#92aebd"/>
    <ellipse cx="37" cy="76" rx="15" ry="9" fill="#dce6e5" stroke="none"/>
    ${eyes(30,46,65)}<path d="M35 72q3 5 6 0Z" fill="#554758"/>`,
  dove: `<path d="M63 83q23-10 47-21l-10 23 13 3-28 11Z" fill="#d6dfeb"/>
    <path d="M31 62q-8-20 8-27 18-7 29 8 4 6 4 17 26 2 26 20-1 19-31 21-31 1-42-15-9-14 6-24Z" fill="#fffaf0"/>
    <path d="M55 66q19-14 35 1-6 21-29 21-13-2-6-22Z" fill="#d6dfeb"/>
    <path d="m30 52-13 6 13 4m23 39-3 7m16-7-1 7" fill="#d39269"/>
    <circle cx="42" cy="51" r="3.8" fill="#382d3d" stroke="none"/>`
};

export function curriculumAnimal(id, x, y, size) {
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 128 112">
    <g stroke="#4c3946" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">${portraits[id]}</g>
  </svg>`;
}
