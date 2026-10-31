// Phaser 4 has no game-config `resolution` setting. Size the real buffer, then scale its CSS display.
export function renderProfile(width,height,deviceRatio=1){
  const w=Math.max(1,Number(width)||1),h=Math.max(1,Number(height)||1);
  const requested=Math.max(1,Number(deviceRatio)||1);
  const ratio=Math.max(1,Math.min(2,requested,Math.sqrt(6000000/(w*h))));
  return {ratio,width:Math.round(w*ratio),height:Math.round(h*ratio),cssWidth:w,cssHeight:h};
}
export const SPRITE_DENSITY=2;
export const PANORAMA_SIZE={width:2400,height:933};
