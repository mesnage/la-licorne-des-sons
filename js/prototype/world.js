import Phaser from '../../vendor/phaser/phaser.esm.min.js';
import { WORLD_WIDTH, WORLD_HEIGHT, pathPoint, WORLDS, gagFor } from './model.js';
import { uri, pailletteFrame, landscape, tree, castle, crystal, mushroom, cloud, checkpointFlag, magicHat } from './art.js';

export function createWorld(parent,{onReady,onBiome,onError,onGag=()=>{}}){
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let scene,finishMove=null,progress=0,crystals=0,assetsFailed=false,serial=0;
  class Journey extends Phaser.Scene {
    constructor(){super('journey');}
    preload(){
      const load=(key,source,size)=>this.load.svg(key,uri(source),size);
      // Seven half-resolution panoramas keep GPU memory lower than seven full-size worlds.
      WORLDS.forEach(theme=>load('land'+theme.id,landscape(theme),{width:1800,height:700}));
      load('pink',tree());load('pine',tree('pine'));load('purple',tree('purple'));
      load('castle',castle());load('crystal',crystal());load('mushroom',mushroom());load('cloud',cloud());
      load('refuge',checkpointFlag());load('hat',magicHat());
      for(let i=0;i<8;i++) load('paillette'+i,pailletteFrame(i),{width:240,height:216});
      load('pailletteHappy',pailletteFrame(0,true),{width:240,height:216});
      this.load.on('loaderror',()=>{assetsFailed=true;onError('Le décor n’a pas pu se charger. Recharge la page ou ouvre les activités de secours.');});
    }
    create(){
      scene=this;
      if(assetsFailed||!this.textures.exists('paillette0')) return;
      this.background=this.add.image(0,0,'land0').setOrigin(0).setDisplaySize(WORLD_WIDTH,WORLD_HEIGHT).setDepth(-20);
      this.decor=[];this.fireflies=[];this.gems=[];this.effects=[];this.waits=[];
      this.total=20;this.startWorld=0;this.worldNumber=0;this.theme=WORLDS[0];
      this.castle=this.add.image(3380,pathPoint(1).y+5,'castle').setOrigin(.5,1).setDisplaySize(340,350).setDepth(0);
      this.portal=this.add.ellipse(3370,pathPoint(1).y-75,115,170,0xe1eee1,.7).setStrokeStyle(8,0xffffff,.75).setDepth(0);
      const refuge=pathPoint(.5);
      this.refuge=this.add.image(refuge.x+55,refuge.y+8,'refuge').setOrigin(.5,1).setDisplaySize(72,94).setDepth(3);
      this.refugeHalo=this.add.ellipse(refuge.x,refuge.y+7,125,25,0xffedb4,.2).setDepth(1);
      this.shadow=this.add.ellipse(140,620,84,17,0x4a5663,.16).setDepth(2);
      this.hero=this.add.sprite(140,620,'paillette0').setOrigin(.5,.94).setDisplaySize(152,137).setDepth(5);
      this.hat=this.add.image(140,470,'hat').setDisplaySize(65,58).setDepth(6).setVisible(false);
      this.rainbow=this.add.graphics().setDepth(4);
      this.anims.create({key:'walk',frames:Array.from({length:8},(_,i)=>({key:'paillette'+i})),frameRate:12,repeat:-1});
      this.quiet=false;this.moving=false;this.travel={value:0};this.motion={t:0};this.gag=null;this.lastGag=null;
      this.cameras.main.setBounds(0,0,WORLD_WIDTH,WORLD_HEIGHT);
      this.input.on('pointerdown',pointer=>{if(!this.quiet) this.sparkle(pointer.worldX,pointer.worldY);});
      this.scale.on('resize',()=>this.positionCamera());
      parent.querySelector('canvas').setAttribute('aria-hidden','true');parent.dataset.phaserVersion=Phaser.VERSION;
      onReady();
    }
    paintWorld(number,local=0){
      this.worldNumber=number;this.theme=WORLDS[(this.startWorld+number)%WORLDS.length];
      this.background.setTexture('land'+this.theme.id).setDisplaySize(WORLD_WIDTH,WORLD_HEIGHT);
      this.decor.forEach(object=>object.destroy());this.decor=[];this.fireflies=[];
      const keep=object=>{this.decor.push(object);return object;};
      for(let i=0;i<46;i++){
        const x=30+i*78,p=Math.max(0,Math.min(1,(x-140)/3160)),point=pathPoint(p),near=i%3===0;
        if(this.theme.id!==5) keep(this.add.image(x,point.y+(near?245:-110)-(i*19%70),this.theme.kind).setOrigin(.5,1).setScale(near?.9:.55+(i%3)*.13).setDepth(near?10:-10).setAlpha(.9));
        if(this.theme.id===1&&i%2===0) keep(this.add.image(x+30,point.y+70,'mushroom').setOrigin(.5,1).setScale(.45).setDepth(1));
        if(this.theme.id===2&&i%3===0){
          keep(this.add.rectangle(x,point.y-10,9,100,0xfff4e0).setDepth(-5));
          keep(this.add.circle(x,point.y-70,35,[0xeaa8c6,0xbab0e5,0xb3ded0][Math.floor(i/3)%3]).setStrokeStyle(8,0xffe6ed).setDepth(-4));
        }
        if(this.theme.id===3&&i%3===0) keep(this.add.ellipse(x,point.y+170,220,55,0x6cbacb,.6).setStrokeStyle(2,0xe3f8f6,.7).setDepth(-8));
        if(this.theme.id===4&&i%3===0) keep(this.add.triangle(x,point.y+150,0,0,40,-100,80,0,0xb7d8ee).setStrokeStyle(3,0xf3faff).setDepth(0));
        if(this.theme.id===5&&i%2===0) keep(this.add.image(x,point.y+110,'cloud').setDisplaySize(270,110).setDepth(1));
      }
      if([1,6].includes(this.theme.id)) for(let i=0;i<28;i++){
        const fly=keep(this.add.circle(150+i*122,300+(i*61%300),2,0xffedb8,.8).setDepth(4));
        fly.startY=fly.y;this.fireflies.push(fly);
      }
      for(let i=0;i<8;i++) keep(this.add.image(180+i*490,70+(i*41%180),'cloud').setScale(.7+(i%3)*.2).setScrollFactor(.45,1).setDepth(-12).setAlpha(.6));
      this.castle.setVisible(number===Math.ceil(this.total/10)-1);this.portal.setVisible(!this.castle.visible);
      this.travel.value=local/10;this.setCrystals(local);this.pose();this.positionCamera();
      onBiome({...this.theme,number:number+1});
    }
    setCrystals(local){
      this.gems.forEach(g=>g.destroy());this.gems=[];
      for(let i=1;i<=10;i++){
        const p=pathPoint(i/10),gem=this.add.image(p.x,p.y-90,'crystal').setDisplaySize(34,45).setDepth(3).setVisible(i>local);
        gem.baseY=p.y-90;this.gems.push(gem);
      }
      this.refugeHalo.setAlpha(local>=5?.7:.2);
      if(local>=5) this.refuge.setTint(0xd5f9dc);else this.refuge.clearTint();
    }
    positionCamera(){
      const w=this.scale.width,h=this.scale.height;
      this.cameras.main.setZoom(w<600?.72:w<1000?.85:1);
      const zoom=this.cameras.main.zoom;
      this.cameras.main.centerOn(this.hero.x+w*.14/zoom,this.hero.y+h*.09/zoom);
    }
    sparkle(x,y){
      if(reduced) return;
      for(let i=0;i<12;i++){
        const a=i*Math.PI/6,dot=this.add.circle(x,y,2+i%3,[0xffedb7,0xe8c4e6,0xc6eee2][i%3]).setDepth(20);this.effects.push(dot);
        this.tweens.add({targets:dot,x:x+Math.cos(a)*50,y:y+Math.sin(a)*40-20,alpha:0,duration:650,onComplete:()=>{dot.destroy();this.effects=this.effects.filter(d=>d!==dot);}});
      }
    }
    startGag(kind){
      this.gag=kind;this.lastGag=kind;this.hat.setVisible(kind==='hat');
      if(kind) onGag(kind);
      if(kind==='prout'&&!reduced) for(let i=0;i<7;i++){
        const puff=this.add.ellipse(this.hero.x-45,this.hero.y-55,18+i*6,13+i*5,[0xf2cae0,0xc7c8ee,0xbde3df][i%3],.8).setDepth(4);this.effects.push(puff);
        this.tweens.add({targets:puff,x:puff.x-80-i*8,y:puff.y-35-i*5,alpha:0,scaleX:1.8,scaleY:1.8,duration:1500,onComplete:()=>{puff.destroy();this.effects=this.effects.filter(d=>d!==puff);}});
      }
    }
    pose(time=0){
      const p=pathPoint(this.travel.value),phase=this.motion.t;
      let lift=0;
      if(this.moving&&!reduced){
        if(this.gag==='rainbow') lift=-Math.sin(phase*Math.PI)*40;
        else if(this.gag==='boing') lift=-Math.abs(Math.sin(phase*Math.PI*3))*38;
        else lift=Math.sin(time*.025)*2;
      }
      this.hero.setPosition(p.x,p.y+lift);this.shadow.setPosition(p.x,p.y-1);
      this.hero.angle=this.gag==='rainbow'&&!reduced?Math.sin(phase*Math.PI)*12*(this.backwards?-1:1):0;
      this.hat.setPosition(p.x,p.y-145+lift);
      this.rainbow.clear();
      if(this.gag==='rainbow'&&!reduced){
        [0xf0a4bd,0xf2c292,0xf7e59f,0xaad5b9,0xa0cedd,0xb5a6d6].forEach((color,i)=>{
          this.rainbow.lineStyle(5,color,.85).beginPath();
          for(let j=0;j<=20;j++){const x=p.x-95+j*7,y=p.y+15+i*4-Math.sin(j/20*Math.PI)*32;if(!j)this.rainbow.moveTo(x,y);else this.rainbow.lineTo(x,y);}
          this.rainbow.strokePath();
        });
      }
    }
    update(time){
      if(!this.hero) return;
      this.pose(time);this.positionCamera();
      if(!reduced&&!this.quiet){
        this.gems.forEach((g,i)=>{if(g.visible)g.y=g.baseY+Math.sin(time*.002+i)*5;});
        this.fireflies.forEach((f,i)=>{f.y=f.startY+Math.sin(time*.001+i)*14;f.alpha=.3+(Math.sin(time*.002+i)+1)*.3;});
      }
    }
  }
  let game;
  try {game=new Phaser.Game({
    type:new window.URLSearchParams(location.search).get('renderer')==='canvas'?Phaser.CANVAS:Phaser.AUTO,
    parent,backgroundColor:'#cce4e9',width:parent.clientWidth,height:parent.clientHeight,
    scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},resolution:Math.min(window.devicePixelRatio||1,1.5),
    antialias:true,audio:{noAudio:true},scene:[Journey],fps:{target:60},banner:false
  });}catch(e){onError('Le décor animé n’est pas disponible sur cet appareil. Tu peux ouvrir les activités de secours.');}
  function cancel(){
    serial++;
    if(scene?.hero){
      scene.tweens.killTweensOf(scene.motion);scene.waits.forEach(t=>t.remove(false));scene.waits=[];scene.cameras.main.resetFX();
      scene.effects.forEach(o=>{scene.tweens.killTweensOf(o);o.destroy();});scene.effects=[];
      scene.moving=false;scene.gag=null;scene.hero.stop().setTexture('paillette0').setFlipX(false);scene.hero.angle=0;
      scene.rainbow.clear();scene.hat.setVisible(false);
    }
    if(finishMove){finishMove(false);finishMove=null;}
  }
  return {
    reset(total,startWorld=0){
      cancel();progress=0;crystals=0;if(!scene?.hero)return;
      scene.total=total;scene.startWorld=startWorld;scene.paintWorld(0,0);
    },
    quiet(value){if(scene)scene.quiet=value;},
    moveTo(count,{returning=false}={}){
      cancel();if(!scene?.hero)return Promise.resolve(false);
      const my=serial;
      return new Promise(resolve=>{
        finishMove=resolve;scene.moving=true;scene.backwards=returning;scene.hero.setFlipX(returning);
        scene.motion={t:0};const from=scene.travel.value,to=(count-scene.worldNumber*10)/10;
        scene.startGag(returning?'rainbow':gagFor(count));
        if(!reduced&&!['rainbow','boing'].includes(scene.gag))scene.hero.play('walk');
        const settle=()=>{
          if(my!==serial)return;
          progress=count/scene.total;crystals=count;scene.moving=false;scene.gag=null;scene.hat.setVisible(false);scene.rainbow.clear();
          scene.hero.stop().setTexture(count===scene.total?'pailletteHappy':'paillette0').setFlipX(false);scene.hero.angle=0;
          if(count===scene.total)onBiome({id:7,name:'Le château de cristal',icon:'🏰',number:scene.worldNumber+1});
          if(finishMove){finishMove(true);finishMove=null;}
        };
        const complete=()=>{
          if(my!==serial)return;
          scene.travel.value=to;scene.pose();scene.setCrystals(count-scene.worldNumber*10);scene.sparkle(scene.hero.x,scene.hero.y-55);
          if(!returning&&count>0&&count%10===0&&count<scene.total){
            const change=()=>{if(my!==serial)return;scene.paintWorld(count/10,0);if(!reduced)scene.cameras.main.fadeIn(250);settle();};
            if(reduced)change();else{scene.cameras.main.fadeOut(250);scene.waits.push(scene.time.delayedCall(250,change));}
          }else settle();
        };
        if(reduced){scene.travel.value=to;complete();}
        else scene.tweens.add({targets:scene.motion,t:1,duration:returning?1400:1900,ease:'Sine.easeInOut',onUpdate:()=>{scene.travel.value=from+(to-from)*scene.motion.t;},onComplete:complete});
      });
    },
    cancel,
    state(){return {ready:!!scene?.hero,progress,crystals,moving:!!scene?.moving,worldIndex:scene?.worldNumber,theme:scene?.theme.id,
      visibleCrystals:scene?.gems.filter(g=>g.visible).length,effectCount:scene?.effects.length,hatVisible:scene?.hat.visible,angle:scene?.hero.angle,worldCrystals:Math.round((scene?.travel.value||0)*10),gag:scene?.gag,lastGag:scene?.lastGag,
      position:scene?.hero?{x:scene.hero.x,y:scene.hero.y}:null,frame:scene?.hero?.anims.currentFrame?.index,renderer:game?.renderer?.type,version:Phaser.VERSION};},
    destroy(){cancel();game?.destroy(true);}
  };
}
