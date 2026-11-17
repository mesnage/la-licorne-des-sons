/** Original woodland shapes, baked with the shared storybook renderer. */
export const FOREST_PALETTE={
  sea:'#799e8a',isle:'#91ac8b',mountA:'#b3c6ae',mountB:'#8eac98',mid:'#6e9276',near:'#66815b',
  meadow:'#6b8255',meadowD:'#4e6c48',fg:'#344f3e',fg2:'#496544',path:'#d9c79d',pathEdge:'#ae946b',
  trunk:'#76654f',leafA:'#3e6957',leafB:'#648852',leafC:'#8ea96b',pine:'#456f61',blossom:'#9eb17c',blossomL:'#b4bd86',
  ochreLeaf:'#bba15e',ochreL:'#d0bb7e',stone:'#cfc7b0',roof:'#b77862',roofT:'#5b8c75'
};
export function paintForest({S,el,wa,W,blob,R,tree,mushroom,sprig,groundY,pathWidth,midY,nearY,layers,widths}){
  const {valley,mid,near,grove,ground}=layers,{mid:mw,near:nw,ground:gw}=widths;
  // A woodland hollow replaces the open sea. Slender trunks build depth between hills.
  valley.replaceChildren();
  el('path',{d:'M-200 300Q700 360 1600 300T3400 320V1200H-200Z',fill:W.mountB.fill},valley);
  for(let x=-100;x<3400;x+=R(55,100)){
    const h=R(250,410),y=R(460,530);
    el('path',{d:`M${x-9} ${y}Q${x-13} ${y-h*.5} ${x-5} ${y-h}h12Q${x+4} ${y-h*.45} ${x+12} ${y}Z`,fill:'#5c8876',opacity:.42},valley);
    el('path',{d:blob(x,y-h+20,R(45,90),R(65,100)),fill:W.leafC.fill,opacity:.32},valley);
  }
  const fern=(g,x,y,scale)=>{
    const f=el('g',{transform:`translate(${x} ${y}) scale(${scale})`},g);
    for(const side of [-1,1])for(let k=0;k<4;k++){
      const tip=side*(16+k*12),h=38+k*8;
      el('path',{d:`M0 0Q${tip*.3} ${-h*.85} ${tip} ${-h}`,fill:'none',stroke:W.leafC.hex,'stroke-width':2},f);
      for(let j=1;j<5;j++){
        const t=j/5,cx=tip*t*t,cy=-h*t;
        el('path',{d:`M${cx} ${cy}q${-10*side} -9 ${-13*side} -3Q${cx-5*side} ${cy+5} ${cx} ${cy}q${12*side} -8 ${15*side} -1Q${cx+7*side} ${cy+7} ${cx} ${cy}`,fill:W.leafB.fill},f);
      }
    }
  };
  // Tree trunks are the vertical foreground landmarks; the road stays a broad clearing.
  for(let x=160;x<mw;x+=R(180,290))tree(mid,x,midY(x)+20,R(1.15,1.65),2);
  for(let x=100;x<nw;x+=R(270,440))tree(near,x,nearY(x)+28,R(1.5,2.1),2);
  for(let x=150;x<gw*.8;x+=R(720,1050)){
    const y=340+R(-18,30),h=R(410,520),holder=el('g',{transform:'translate(0 0) scale(1)'},grove),g=el('g',{class:'still','data-b':`${x-250},${y-h-160},${x+250},${y+32}`},holder);
    el('path',{d:`M${x-27} ${y}Q${x-16} ${y-h*.5} ${x-35} ${y-h}h58Q${x+7} ${y-h*.55} ${x+31} ${y}l36 15-49-6-40 9Z`,...wa(W.trunk,3,.2)},g);
    for(const side of [-1,1])el('path',{d:`M${x} ${y-h*.45}q${side*65} -36 ${side*100} -100`,fill:'none',stroke:W.trunk.hex,'stroke-width':15,'stroke-linecap':'round'},g);
    el('path',{d:`M${x-9} ${y-20}q8 -140 -6 -250`,fill:'none',stroke:'#b9ae85','stroke-width':5,opacity:.45},g);
    for(let k=0;k<5;k++)el('path',{d:blob(x+R(-100,100),y-h+R(-40,50),R(75,125),R(55,90)),...wa(k%2?W.leafA:W.pine,2,.12)},g);
  }
  for(let x=110;x<gw;x+=R(190,320)){
    const y=groundY(x)-pathWidth(x)*.72-16;
    fern(ground,x,y,R(.55,.9));mushroom(ground,x+50,y+8,R(.8,1.4));
    if(Math.floor(x)%3===0)S.boulder(ground,x-60,y+8,1,W.stone,'#7f9a5a');
    sprig(ground,x+80,groundY(x)+pathWidth(x)+28,.6,W.leafC);
  }
}
