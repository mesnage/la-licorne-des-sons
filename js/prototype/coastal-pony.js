// Each painted frame shares the same hoof line. Travel drives the four
// walking drawings, so the cadence follows the speed of the character.
export function coastalPonyFrame(emotion,seconds,distance,walking,reduced){
  if(walking&&!reduced)return 4+Math.floor(distance/108*4)%4;
  if(emotion==='encouraging')return 9;
  if(emotion==='proud')return reduced||seconds%4.5>1.2?11:10;
  if(emotion==='curious'&&(reduced||seconds%5<2.8))return 8;
  if(reduced)return 0;
  const beat=seconds%4.8;
  if(beat<1.8)return 0;
  if(beat<3)return 1;
  if(beat<3.16)return 2;
  return 3;
}

export function posePonyGlints(glints,hero,seconds,visible){
  // One glint at the horn and two motes trailing the flowing tail.
  const offsets=[[77,-160],[-63,-83],[-79,-48]];
  const angle=hero.rotation,cos=Math.cos(angle),sin=Math.sin(angle);
  glints.forEach((star,i)=>{
    const phase=(seconds/3.6+i*.34)%1;
    star.setVisible(visible&&phase<.46);
    if(!star.visible)return;
    const shine=Math.sin(Math.PI*phase/.46)**2;
    const dx=(offsets[i][0]-(i?phase*22:0))*(hero.flipX?-1:1);
    const dy=offsets[i][1]-(i?phase*26:0);
    star.setPosition(hero.x+dx*cos-dy*sin,hero.y+dx*sin+dy*cos);
    star.setScale(.32+.8*shine).setAlpha(.92*shine);
  });
}
