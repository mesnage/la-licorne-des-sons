/** Five species per habitat. Moon/fairy creatures and the mixed-polar ice setting are storybook fiction. */
const animal=(id,name,shape,coat,accent,features=[],size=1)=>({id,name,shape,coat,accent,features,size});
export const FAUNA={
  meadow:[animal('rabbit','Lapin','mammal','#d8c5aa','#f6e9ce',['rabbit'],1),animal('hedgehog','Hérisson','mammal','#a18b71','#ead1af',['spines'],1),animal('roe-deer','Chevreuil','mammal','#c49a70','#f4dfb9',['deer'],1),animal('bee','Abeille','insect','#dfbd62','#63584b',['bee'],1),animal('butterfly','Papillon','insect','#d9a3b6','#edcf9d',['butterfly'],1)],
  forest:[animal('red-fox','Renard roux','mammal','#d89b67','#f5e2c1',['fox'],1),animal('red-squirrel','Écureuil roux','mammal','#bd8969','#efd6b1',['squirrel'],1),animal('tawny-owl','Chouette hulotte','bird','#a68d76','#f3dfb9',['owl'],1),animal('badger','Blaireau','mammal','#8b9290','#e9e1cd',['badger'],1),animal('red-deer','Cerf','mammal','#c69c78','#e6cfab',['deer','antlers'],1)],
  jungle:[animal('asian-elephant','Éléphant d’Asie','mammal','#9ba7a3','#c9c9b5',['elephant'],1),animal('sumatran-tiger','Tigre de Sumatra','mammal','#d6a166','#f1dfbc',['tiger'],1),animal('gibbon','Gibbon','mammal','#958773','#e7d4ae',['gibbon'],1),animal('hornbill','Calao','bird','#527167','#edc578',['hornbill'],1),animal('malayan-tapir','Tapir malais','mammal','#65716e','#e5dfce',['tapir'],1)],
  beach:[animal('shore-crab','Crabe','crab','#dc9b82','#f2c7a0',[],1),animal('sea-turtle','Tortue marine','mammal','#80a88b','#c7cf9f',['turtle','flippers'],1),animal('sandpiper','Bécasseau','bird','#b6ad96','#f2e7cd',['wader'],1),animal('hermit-crab','Bernard-l’ermite','crab','#c99b7c','#e9cdb2',['shell'],1),animal('harbor-seal','Phoque','seal','#a2b2b5','#e6dfcd',[],1)],
  ice:[animal('polar-bear','Ours polaire','mammal','#ede8d7','#d5d9ce',['bear'],1),animal('emperor-penguin','Manchot empereur','bird','#536d7d','#f4e6c6',['penguin'],1),animal('arctic-fox','Renard polaire','mammal','#e8e9df','#b9c8cd',['fox'],1),animal('walrus','Morse','seal','#b29987','#ead9ba',['tusks'],1),animal('snowy-owl','Harfang des neiges','bird','#e8e6d8','#bec7ce',['owl'],1)],
  clouds:[animal('swallow','Hirondelle','bird','#4f7fc0','#fff0dc',['swallow'],1),animal('swift','Martinet','bird','#d98ba6','#fff0dc',['swift'],1),animal('crane','Grue','bird','#fffdf6','#7f8fc0',['wader','crane'],1),animal('albatross','Albatros','bird','#f0e8d4','#828e9a',['albatross'],1),animal('eagle','Aigle','bird','#c99a5e','#fff6e2',['eagle'],1)],
  moon:[animal('moon-rabbit','Lapin lunaire','mammal','#f1eefb','#f6dc8f',['rabbit','star'],1),animal('star-fox','Renard étoilé','mammal','#f0a6c0','#fff0dc',['fox','star'],1),animal('comet-owl','Chouette comète','bird','#8fd6d0','#fff0c4',['owl','star'],1),animal('moon-moth','Papillon de lune','insect','#f6dc8f','#8fe0d2',['butterfly','star'],1),animal('moon-dragon','Dragon de lune','mammal','#8fd0e6','#f6c6dc',['dragon','star'],1)],
  prehistoric:[animal('brachiosaurus','Brachiosaure','dinosaur','#86a786','#c6ce9c',['long-neck'],1),animal('stegosaurus','Stégosaure','dinosaur','#99aa7c','#d2b382',['plates'],1),animal('triceratops','Tricératops','dinosaur','#a7a28c','#e5d5af',['frill'],1),animal('parasaurolophus','Parasaurolophus','dinosaur','#c3aa7c','#e6ce99',['crest'],1),animal('tyrannosaurus','Tyrannosaure','dinosaur','#81a79a','#cbd1a6',['rex'],1)],
  desert:[animal('fennec','Fennec','mammal','#e0bc8e','#fae6c3',['fennec','fox'],1),animal('camel','Dromadaire','mammal','#c6a079','#e8d1a6',['camel'],1),animal('meerkat','Suricate','mammal','#bda17d','#ecdbb7',['meerkat'],1),animal('desert-tortoise','Tortue du désert','mammal','#a9a47d','#ddd0a2',['turtle'],1),animal('jerboa','Gerboise','mammal','#d0b28d','#f0dec1',['jerboa','rabbit'],1)],
  fairy:[animal('unicorn','Licorne','mammal','#f4e7df','#c8a4c7',['unicorn'],1),animal('pegasus','Pégase','mammal','#e8e7ed','#b6bfd7',['horse','wings'],1),animal('fairy-dragon','Petit dragon','mammal','#a9c7b0','#dab5c7',['dragon'],1),animal('phoenix','Phénix','bird','#dfac88','#e9ce9b',['phoenix'],1),animal('jackalope','Lapin à bois','mammal','#decbd4','#f2e3c8',['rabbit','antlers'],1)],
  peluches:[animal('teddy-honey','Ourson miel','mammal','#dba56c','#f6e2c0',['bear','plush'],1),animal('teddy-cocoa','Ourson chocolat','mammal','#a87a5c','#ecd3b0',['bear','plush'],1),animal('teddy-rose','Ourson rose','mammal','#eeb1bd','#fdeae4',['bear','plush'],1),animal('teddy-panda','Panda en peluche','mammal','#f6f0e6','#f6f0e6',['bear','plush','panda'],1),animal('plush-bunny','Lapin en peluche','mammal','#c9cdee','#f6f0fb',['rabbit','plush'],1)]
};
/** How a species gets about. Drives both the pose and the rig that is drawn. */
export function locomotion(species){
  const has=f=>species.features.includes(f);
  if(species.shape==='insect')return 'flutter';
  if(species.shape==='crab')return 'scuttle';
  if(species.shape==='seal')return 'loll';
  if(species.shape==='bird')return has('owl')||has('hornbill')?'perch':has('penguin')?'waddle':has('wader')?'walk':'fly';
  if(has('rabbit')||has('squirrel'))return 'hop';
  if(has('gibbon')||has('meerkat'))return 'sit';
  return 'walk';
}
const PERIOD={walk:17,hop:12,waddle:15,scuttle:8,loll:11,sit:9,perch:8,fly:13,flutter:10};
const RANGE={walk:64,hop:58,waddle:40,scuttle:52,loll:9,sit:0,perch:0,fly:170,flutter:64};
const ease=v=>v*v*(3-2*v),bump=v=>v<=0||v>=1?0:Math.sin(v*Math.PI);
/**
 * Pure pose for a species at a scene time. A slow loop alternates rests, strolls and grazing;
 * leg phase is tied to distance travelled so feet do not slide. Reduced motion gives one calm pose.
 */
export function faunaPose(species,time,index=0,reduced=false){
  const mode=locomotion(species),has=f=>species.features.includes(f),t=reduced?0:time,seed=index*1.83;
  const slow=has('turtle')||has('elephant')||has('long-neck')||has('camel')?1.5:1;
  const period=PERIOD[mode]*slow,range=RANGE[mode]*(has('turtle')?.45:1);
  const u=reduced?.04:(((t/period+index*.37)%1)+1)%1;
  let x=0,lift=0,facing=1,walk=0,phase=0,graze=0,roll=0,squash=0,air=0;
  let head=Math.sin(t*.8+seed)*4,tail=Math.sin(t*1.7+seed)*10,ear=0,wing=0;
  const flying=mode==='fly'||mode==='flutter';
  if(mode==='walk'||mode==='waddle'||mode==='hop'){
    // rest left · go right · rest/graze right · come back
    let k;
    if(u<.14){x=-range;facing=-1;head+=Math.sin(t*1.3+seed)*7;lift=bump((u-.1)/.04)*4;}
    else if(u<.46){k=(u-.14)/.32;facing=1;}
    else if(u<.7){x=range;facing=1;graze=ease(bump((u-.48)/.2));lift=bump((u-.66)/.04)*4;}
    else{k=(u-.7)/.3;facing=-1;}
    if(k!==undefined){
      if(mode==='hop'){
        const hops=5,kk=k*hops,frac=Math.min(1,(kk%1)/.62);air=bump(frac);
        const go=(Math.floor(kk)+ease(frac))/hops;x=facing*(-range+2*range*go);lift=air*17;squash=frac<1?air*.12:-bump(((kk%1)-.62)/.38)*.08;
      }else{
        x=facing*(-range+2*range*ease(k));walk=Math.min(1,bump(k)*1.8);phase=x/7.5;
        lift=Math.abs(Math.sin(phase))*1.6*walk;if(mode==='waddle')roll=Math.sin(phase)*7*walk;
      }
    }
    ear=bump(((t*.23+seed)%1-.9)/.1)*-14;
  }else if(mode==='scuttle'){
    const dash=v=>ease(Math.min(1,Math.max(0,v)));
    x=u<.5?-range+2*range*dash(u/.3):range-2*range*dash((u-.5)/.3);
    walk=(u<.3||(u>=.5&&u<.8))?1:0;phase=x/3.2;wing=walk?8:22+Math.sin(t*3+seed)*14;lift=walk?Math.abs(Math.sin(phase))*1.2:0;
  }else if(mode==='loll'){
    const go=bump((u-.62)/.22);x=range*Math.sin(u*Math.PI*2);squash=Math.sin(t*1.4+seed)*.03+go*Math.sin(t*7)*.06;
    head=-9+Math.sin(t*.7+seed)*9;wing=Math.sin(t*1.9+seed)*12+go*18;tail=Math.sin(t*2.3+seed)*12;facing=index%2?-1:1;
  }else if(mode==='sit'){
    facing=Math.sin(t*.21+seed)>0?1:-1;squash=-bump((u-.3)/.4)*.1;head=Math.sin(t*1.1+seed)*8;
    wing=Math.sin(t*1.6+seed)*16;tail=Math.sin(t*1.2+seed)*14;
  }else if(mode==='perch'){
    facing=index%2?-1:1;head=Math.sin(t*.45+seed)*16;const flap=bump((u-.72)/.16);
    wing=flap*Math.abs(Math.sin(t*9))*46;lift=flap*3;squash=Math.sin(t*1.5+seed)*.025;
  }else if(mode==='fly'){
    const a=u*Math.PI*2,glider=has('albatross')||has('eagle')||has('crane');
    x=range*Math.sin(a);facing=Math.cos(a)>=0?1:-1;
    lift=(glider?92:64)+34*Math.sin(2*a+seed)+6*Math.sin(t*1.3+seed);
    const beat=glider?(Math.sin(t*.6+seed)>.35?1:.12):1;
    wing=Math.sin(t*(glider?5:11)+seed)*38*beat-(glider?10*(1-beat):0);roll=-Math.cos(2*a+seed)*9*facing;head=0;
  }else{
    const a=u*Math.PI*2,rest=has('butterfly')?bump((u-.78)/.2):0;
    x=range*Math.sin(a)+7*Math.sin(t*2.7+seed);facing=Math.cos(a)>=0?1:-1;
    lift=(30+16*Math.sin(2*a+seed)+5*Math.sin(t*4.1+seed))*(1-rest*.85);
    wing=Math.sin(t*(has('bee')?34:9)*(1-rest*.7)+seed);roll=Math.sin(t*2.2+seed)*8;
  }
  if(reduced){walk=0;air=0;wing=mode==='fly'?-18:mode==='flutter'?.6:0;head=0;tail=0;ear=0;roll=0;squash=0;if(!flying)lift=0;}
  return {x,lift,facing,walk,phase,graze,roll,squash,air,head,tail,ear,wing,
    stride:Math.sin(phase)*24*walk,blink:!reduced&&(t+index*.7)%4.7>4.52,flying,mode};
}
