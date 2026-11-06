// A little illustration unfolds at the point of contact. All marks share one
// graphics object and the scenery clock, including its pause behaviour.
const tau=Math.PI*2;
export function drawHabitatTouch(g,habitat,t){
  g.clear();
  const fade=Math.sin(Math.PI*Math.min(1,t*4)/2)*(1-t*t);
  for(let i=0;i<7;i++){
    const a=i*tau/7;
    const x=Math.cos(a)*(10+32*t),y=Math.sin(a)*(6+17*t);
    switch(habitat){
      case 'forest': {
        const px=x+Math.sin(t*6+i)*9,py=y-t*(24+i*4);
        g.fillStyle(0xffcd68,.12*fade).fillCircle(px,py,8);
        g.fillStyle(0xffed9b,.96*fade).fillCircle(px,py,2.4);
        break;
      }
      case 'jungle': {
        const py=y-34*Math.sin(Math.PI*t);
        g.fillStyle(0x76d8ce,.8*fade).fillEllipse(x,py,6,10);
        g.fillStyle(0xeaffea,fade).fillEllipse(x-1,py-2,2,4);
        break;
      }
      case 'beach':
        if(i<3){
          const radius=10+t*44+i*8;
          g.lineStyle(2,0xfff3d7,fade*(.9-i*.21)).strokeEllipse(0,0,radius*2,radius*.65);
        }
        break;
      case 'ice': {
        if(i===6)break;
        const angle=i*tau/6,len=8+Math.min(1,t*3)*23;
        const cx=Math.cos(angle),cy=Math.sin(angle);
        g.lineStyle(2,0xeaffff,fade).lineBetween(0,0,cx*len,cy*len);
        for(const side of [-1,1])g.lineBetween(cx*len*.6,cy*len*.6,cx*len*.8-side*cy*6,cy*len*.8+side*cx*6);
        break;
      }
      case 'clouds':
        g.fillStyle(i%2?0xffede3:0xe6d9f5,.48*fade).fillEllipse(x,y-t*28,17+14*t,12+10*t);
        break;
      case 'moon': {
        const px=x*1.3,py=y*1.2;
        if(i)g.lineStyle(1,0xefda99,.65*fade).lineBetween(Math.cos(a-tau/7)*(10+32*t)*1.3,Math.sin(a-tau/7)*(6+17*t)*1.2,px,py);
        g.fillStyle(0xffe9a4,fade).fillEllipse(px,py,3,8).fillEllipse(px,py,8,3);
        break;
      }
    }
  }
}
