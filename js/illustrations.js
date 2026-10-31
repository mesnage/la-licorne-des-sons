// Original, platform-independent storybook illustrations. No system emoji fonts.
const drawings={
 flower:'<path d="M32 55V34m0 14Q14 34 14 47q4 9 18 5m0-7q18-18 19-5-1 10-19 10" fill="#91ad83"/><g fill="#e4a8a1"><circle cx="24" cy="22" r="10"/><circle cx="39" cy="21" r="10"/><circle cx="22" cy="35" r="10"/><circle cx="40" cy="35" r="10"/></g><circle cx="32" cy="28" r="9" fill="#ead692"/>',
 butterfly:'<path d="M31 29C5-4 1 37 25 35 0 48 20 65 31 39c12 30 33 6 10-4C66 38 56 1 33 29" fill="#c9b3d7"/><path d="M32 22v25m0-23-8-10m8 10 8-10" fill="none" stroke="#657368" stroke-width="3" stroke-linecap="round"/>',
 rainbow:'<path d="M7 51C8 4 56 4 57 51" fill="none" stroke="#d7a1a1" stroke-width="10"/><path d="M16 51c1-33 31-33 32 0" fill="none" stroke="#e5ce9a" stroke-width="9"/><path d="M25 51c0-19 14-19 14 0" fill="none" stroke="#9db9a6" stroke-width="9"/>',
 gem:'<path d="M8 22 21 7h23l12 15-24 35Z" fill="#9dc9c5"/><path d="m21 7 11 50L44 7M8 22h48" fill="none" stroke="#f8f4df" stroke-width="2"/><path d="M21 9 13 20h17Z" fill="#eff4e3"/>',
 book:'<path d="M5 13q15-7 27 3 12-10 27-3v38q-15-7-27 3-12-10-27-3Z" fill="#e7d9b6" stroke="#899783" stroke-width="2"/><path d="M32 16v38M12 23l12 2m-12 7 12 2m-12 7 12 2m16-16 11-3m-11 12 11-3m-11 12 11-3" stroke="#9b8c77" stroke-width="2"/>',
 sound:'<path d="M8 25h11L34 12v40L19 39H8Z" fill="#b4c5af"/><path d="M42 22q12 10 0 20m7-30q22 20 0 40" fill="none" stroke="#8b9e8f" stroke-width="4" stroke-linecap="round"/>',
 castle:'<path d="M7 55V24h13v31m24 0V24h13v31M20 55V34h24v21M26 36V15h12v21" fill="#c4c4d6"/><path d="m4 24 10-18 10 18m16 0L50 6l10 18M23 15l9-14 9 14" fill="#b49aa9"/><path d="M27 55V44q5-9 10 0v11" fill="#f0ddb0"/>',
 flag:'<path d="M14 58V8" fill="none" stroke="#a08d72" stroke-width="4"/><path d="M17 9h36L42 23l11 13H17Z" fill="#e7c99a"/><path d="m30 17 6 7-6 7-6-7Z" fill="#92b4a3"/>',
 gift:'<path d="M8 28h48v29H8Z" fill="#b7c4ad"/><path d="M5 21h54v13H5Z" fill="#d8b1ad"/><path d="M28 21h8v36h-8Z" fill="#f1dab0"/><path d="M31 21C0 21 18-6 31 21Zm2 0C65 21 47-6 33 21Z" fill="none" stroke="#c5a47e" stroke-width="5"/>',
 candy:'<path d="m12 24-9-8v30l10-8m39-14 9-8v30l-10-8" fill="#dfc5b0"/><rect x="11" y="18" width="42" height="28" rx="12" fill="#d7a3b4"/><path d="m23 20-6 24m21-24-6 24m16-24-6 24" stroke="#f1dece" stroke-width="4"/>',
 chocolate:'<path d="M12 5h40v53H12Z" fill="#90715e"/><path d="M15 8h16v15H15Zm19 0h15v15H34ZM15 26h16v15H15Zm19 0h15v15H34Z" fill="#b28c6c"/><path d="M7 40h50v21H7Z" fill="#c7b8ca"/><path d="M7 40 23 52l18-12 16 10" fill="#f4e7ce"/>',
 prout:'<path d="M13 50C-5 46 5 29 18 32c-6-24 27-30 31-8 24-3 21 28 1 27Z" fill="#c9bed5"/><circle cx="21" cy="42" r="8" fill="#b3cfb9"/><path d="m43 5 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="#e7cc87"/>',
 star:'<path d="m32 4 9 18 20 3-15 15 4 21-18-10-18 10 4-21L3 25l20-3Z" fill="#e6cc91"/>',
 leaf:'<path d="M12 53C-3 15 30-1 56 7c4 32-15 51-39 42Z" fill="#9eb799"/><path d="m9 59 36-39M21 42l-3-16m15 4 13 2" fill="none" stroke="#718f78" stroke-width="3"/>',
 moon:'<path d="M45 6C7-1-5 45 28 58c13 5 25-2 31-12C27 57 15 23 45 6Z" fill="#e9dca9"/>',
 shell:'<path d="M27 55C-3 45 0 11 19 15 29-5 45 0 48 15c23-2 23 29-10 40Z" fill="#dcb5a2"/><path d="m32 51-14-30m14 30V14m4 37 12-29" stroke="#f6e3cb" stroke-width="3" fill="none"/>',
 ice:'<path d="M32 3v58M7 17l50 30M7 47l50-30M21 9l11 9L43 9M21 55l11-9 11 9" stroke="#a0c1c7" stroke-width="4" fill="none" stroke-linecap="round"/>',
 cloud:'<path d="M13 52C-5 52-3 29 14 27 8 9 36 3 42 22 64 17 71 52 49 52Z" fill="#ece8d9" stroke="#c0c8c0" stroke-width="2"/>',
 mushroom:'<path d="m26 31-4 26h22l-6-26Z" fill="#e8ddc0"/><path d="M4 33C4-2 60-2 60 33q-28 12-56 0" fill="#bb9188"/><g fill="#efdfc3"><circle cx="20" cy="19" r="5"/><circle cx="41" cy="12" r="4"/><circle cx="48" cy="28" r="4"/></g>',
 letters:'<path d="m9 52 13-38 13 38M13 39h18m10-7q18-13 17 5v15m0-12c-20-6-20 18 0 7" fill="none" stroke="#a18da5" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>'
};
export function illustration(name,cls=''){
  return `<svg class="illustration ${cls}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${drawings[name]||drawings.leaf}</svg>`;
}
