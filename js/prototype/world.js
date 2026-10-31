import Phaser from '../../vendor/phaser/phaser.esm.min.js';
import { WORLD_WIDTH, WORLD_HEIGHT, pathPoint, WORLDS, gagFor } from './model.js';
import { uri, pailletteFrame, landscape, tree, castle, crystal, mushroom, cloud, checkpointFlag, magicHat, birdFrame, pailletteEmotion } from './art.js';
import { landmark, foreground } from './scenery.js';
import { RAINBOW, rainbowPoint, walkingPoint, bridgeFocus, birdPoint } from './travel.js';

export function createWorld(parent,{onReady,onBiome,onError,onGag=()=>{}}){
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let scene,finishMove=null,progress=0,crystals=0,assetsFailed=false,serial=0;
  class Journey extends Phaser.Scene {
    constructor(){super('journey');}
    preload(){
      const load=(key,source,size)=>this.load.svg(key,uri(source),size);
      // Seven half-resolution panoramas keep GPU memory lower than seven full-size worlds.
      WORLDS.forEach(theme=>load('land'+theme.id,landscape(theme),{width:1800,height:700}));
      WORLDS.forEach(theme=>{load('landmark'+theme.id,landmark(theme),{width:330,height:270});load('plants'+theme.id,foreground(theme),{width:320,height:230});});
      for(const emotion of ['curious','encouraging','proud'])load('paillette-'+emotion,pailletteEmotion(emotion),{width:240,height:216});
      load('pink',tree());load('pine',tree('pine'));load('purple',tree('purple'));
      load('castle',castle());load('crystal',crystal());load('mushroom',mushroom());load('cloud',cloud());
      load('refuge',checkpointFlag());load('hat',magicHat());
      for(let i=0;i<6;i++)load('bird'+i,birdFrame(i),{width:110,height:75});
      for(let i=0;i<8;i++) load('paillette'+i,pailletteFrame(i),{width:240,height:216});
      load('pailletteHappy',pailletteFrame(0,true),{width:240,height:216});
      this.load.on('loaderror',()=>{assetsFailed=true;onError('Le décor n’a pas pu se charger. Recharge la page ou ouvre les activités de secours.');});
    }
    create(){
      scene=this;
      if(assetsFailed||!this.textures.exists('paillette0')) return;
      this.skyFill=this.add.rectangle(0,-2000,WORLD_WIDTH,6000,0xd4edf0).setOrigin(0).setDepth(-30);
      this.background=this.add.image(0,0,'land0').setOrigin(0).setDisplaySize(WORLD_WIDTH,WORLD_HEIGHT).setDepth(-20);
      this.decor=[];this.fireflies=[];this.gems=[];this.effects=[];this.waits=[];this.birds=[];this.birdSeconds=0;this.petals=[];this.emotion='attentive';
      this.total=20;this.startWorld=0;this.worldNumber=0;this.theme=WORLDS[0];
      this.castle=this.add.image(3380,pathPoint(1).y+5,'castle').setOrigin(.5,1).setDisplaySize(340,350).setDepth(0);
      this.portal=this.add.ellipse(3370,pathPoint(1).y-75,115,170,0xe1eee1,.7).setStrokeStyle(8,0xffffff,.75).setDepth(0);
      const refuge=pathPoint(.5);
      this.refuge=this.add.image(refuge.x+55,refuge.y+8,'refuge').setOrigin(.5,1).setDisplaySize(72,94).setDepth(3);
      this.refugeHalo=this.add.ellipse(refuge.x,refuge.y+7,125,25,0xffedb4,.2).setDepth(1);
      this.shadow=this.add.ellipse(140,620,84,17,0x4a5663,.16).setDepth(2);
      this.hero=this.add.sprite(140,620,'paillette0').setOrigin(.5,.94).setDisplaySize(152,137).setDepth(5);
      this.hat=this.add.image(140,470,'hat').setDisplaySize(65,58).setDepth(6).setVisible(false);
      this.bridge=this.add.graphics().setDepth(3);
      this.bridgeShadow=this.add.ellipse(0,0,510,34,0x697e80,.12).setDepth(1);
      this.bridgeClouds=[0,1].map(()=>this.add.image(0,0,'cloud').setDisplaySize(145,72).setDepth(4));
      this.returnCloud=this.add.image(0,0,'cloud').setDisplaySize(115,38).setDepth(4).setVisible(false);
      this.anims.create({key:'walk',frames:Array.from({length:8},(_,i)=>({key:'paillette'+i})),frameRate:12,repeat:-1});
      this.anims.create({key:'bird-flight',frames:Array.from({length:6},(_,i)=>({key:'bird'+i})),frameRate:8,repeat:-1});
      this.quiet=false;this.moving=false;this.travel={value:0};this.motion={t:0};this.gag=null;this.lastGag=null;
      this.cameras.main.setBounds(0,-1800,WORLD_WIDTH,WORLD_HEIGHT+3600);
      this.input.on('pointerdown',pointer=>{if(!this.quiet) this.sparkle(pointer.worldX,pointer.worldY);});
      this.scale.on('resize',()=>{this.cameraInitialized=false;this.positionCamera();});
      parent.querySelector('canvas').setAttribute('aria-hidden','true');parent.dataset.phaserVersion=Phaser.VERSION;
      onReady();
    }
    paintWorld(number,local=0){
      this.worldNumber=number;this.theme=WORLDS[(this.startWorld+number)%WORLDS.length];
      this.skyFill.setFillStyle(Number.parseInt(this.theme.sky.slice(1),16));
      this.background.setTexture('land'+this.theme.id).setDisplaySize(WORLD_WIDTH,WORLD_HEIGHT);
      this.decor.forEach(object=>object.destroy());this.decor=[];this.fireflies=[];this.birds=[];this.birdSeconds=0;this.petals=[];
      const keep=object=>{this.decor.push(object);return object;};
      for(let i=0;i<46;i++){
        const x=30+i*78,p=Math.max(0,Math.min(1,(x-140)/3160)),point=pathPoint(p),near=i%3===0;
        if(this.theme.id!==5&&!(near&&p>.19&&p<.52)) keep(this.add.image(x,point.y+(near?245:-110)-(i*19%70),this.theme.kind).setOrigin(.5,1).setScale(near?.9:.55+(i%3)*.13).setDepth(near?10:-10).setAlpha(.9));
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
      const vista=pathPoint(.78);
      keep(this.add.image(vista.x,vista.y-12,'landmark'+this.theme.id).setOrigin(.5,1).setDisplaySize(330,270).setDepth(-3));
      for(let i=0;i<9;i++){
        const p=pathPoint(i/9);
        keep(this.add.image(p.x,p.y+280,'plants'+this.theme.id).setOrigin(.5,1).setScale(.6+i%3*.15).setScrollFactor(1.02,1).setDepth(9).setAlpha(.85));
      }
      for(let i=0;i<18;i++){
        const mote=keep(this.add.ellipse(150+i*190,290+(i*53%310),3+i%3,2+i%2,this.theme.id===6?0xf4dea4:0xf3e4c4,.45).setDepth(4));
        mote.startX=mote.x;mote.startY=mote.y;this.petals.push(mote);
      }
      this.castle.setVisible(number===Math.ceil(this.total/10)-1);this.portal.setVisible(!this.castle.visible);
      this.drawBridge();
      for(let i=0;i<9;i++){
        const bird=keep(this.add.sprite(0,0,'bird0').setDisplaySize(42+(i%3)*6,29+(i%3)*4).setDepth(-5).setAlpha(.9));
        const p=birdPoint(i,0);bird.setPosition(p.x,p.y);if(!reduced&&!this.quiet)bird.play('bird-flight');
        this.birds.push(bird);
      }
      this.travel.value=local/10;this.setCrystals(local);this.pose();this.cameraInitialized=false;this.positionCamera();
      onBiome({...this.theme,number:number+1});
    }
    setCrystals(local){
      this.gems.forEach(g=>g.destroy());this.gems=[];
      for(let i=1;i<=10;i++){
        const p=walkingPoint(i/10),gem=this.add.image(p.x,p.y-90,'crystal').setDisplaySize(34,45).setDepth(3).setVisible(i>local);
        gem.baseY=p.y-90;this.gems.push(gem);
      }
      this.refugeHalo.setAlpha(local>=5?.7:.2);
      if(local>=5) this.refuge.setTint(0xd5f9dc);else this.refuge.clearTint();
    }
    drawBridge(){
      this.bridge.clear();
      const colors=[0xf09eb5,0xf4b891,0xf4dfa0,0xb6d3a7,0x9dcfd3,0xa9b8df,0xc2a8d6];
      colors.forEach((color,i)=>{
        this.bridge.lineStyle(RAINBOW.band+2,color,.98).beginPath();
        for(let j=0;j<=100;j++){
          const p=rainbowPoint(j/100),y=p.y+RAINBOW.band/2+i*RAINBOW.band;
          if(j===0)this.bridge.moveTo(p.x,y);else this.bridge.lineTo(p.x,y);
        }
        this.bridge.strokePath();
      });
      this.bridge.lineStyle(2,0xfffae9,.9).beginPath();
      for(let j=0;j<=100;j++){const p=rainbowPoint(j/100);if(j===0)this.bridge.moveTo(p.x,p.y);else this.bridge.lineTo(p.x,p.y);}
      this.bridge.strokePath();
      [0,1].forEach((t,i)=>{const p=rainbowPoint(t);this.bridgeClouds[i].setPosition(p.x,p.y+56);});
      const middle=pathPoint((RAINBOW.start+RAINBOW.end)/2);
      this.bridgeShadow.setPosition(middle.x,middle.y+35);
    }
    positionCamera(){
      const w=this.scale.width,h=this.scale.height,base=w<600?.72:w<1000?.85:1;
      const focus=bridgeFocus(this.travel.value),fit=Math.max(.42,Math.min(base,w/850));
      const target=base+(fit-base)*focus;
      const zoom=this.cameraInitialized&&!reduced?this.cameras.main.zoom+(target-this.cameras.main.zoom)*.14:target;
      this.cameraInitialized=true;this.cameras.main.setZoom(zoom);
      const ground=pathPoint(this.travel.value),lift=ground.y-this.hero.y;
      // The camera gives the climb room while leaving the arch and landing visible.
      const follow= h<700?.75:.42;
      this.cameras.main.centerOn(this.hero.x+w*.14/zoom,ground.y-lift*follow+h*(h<500?-.1:.09)/zoom);
    }
    sparkle(x,y){
      if(reduced) return;
      for(let i=0;i<12;i++){
        const a=i*Math.PI/6,dot=this.add.circle(x,y,2+i%3,[0xffedb7,0xe8c4e6,0xc6eee2][i%3]).setDepth(20);this.effects.push(dot);
        this.tweens.add({targets:dot,x:x+Math.cos(a)*50,y:y+Math.sin(a)*40-20,alpha:0,duration:650,onComplete:()=>{dot.destroy();this.effects=this.effects.filter(d=>d!==dot);}});
      }
    }
    startGag(kind){
      this.gag=kind;this.lastGag=kind;this.hat.setVisible(kind==='hat');this.returnCloud.setVisible(kind==='return'&&!reduced);
      if(kind) onGag(kind);
      if(kind==='prout'&&!reduced) for(let i=0;i<7;i++){
        const puff=this.add.ellipse(this.hero.x-45,this.hero.y-55,18+i*6,13+i*5,[0xf2cae0,0xc7c8ee,0xbde3df][i%3],.8).setDepth(4);this.effects.push(puff);
        this.tweens.add({targets:puff,x:puff.x-80-i*8,y:puff.y-35-i*5,alpha:0,scaleX:1.8,scaleY:1.8,duration:1500,onComplete:()=>{puff.destroy();this.effects=this.effects.filter(d=>d!==puff);}});
      }
    }
    pose(time=0){
      const p=walkingPoint(this.travel.value),phase=this.motion.t;
      let bounce=0;
      if(this.moving&&!reduced){
        if(this.gag==='boing')bounce=-Math.abs(Math.sin(phase*Math.PI*3))*38;
        else if(this.gag==='return'&&!p.onBridge)bounce=-Math.sin(phase*Math.PI)*6;
        else bounce=Math.sin(time*.025)*2;
      }
      this.hero.setPosition(p.x,p.y+bounce);
      const ground=pathPoint(this.travel.value);this.shadow.setPosition(p.x,ground.y-1).setAlpha(p.onBridge?.08:.16);
      this.hero.angle=p.onBridge?p.angle*(this.backwards?-1:1):this.gag==='return'&&!reduced?Math.sin(phase*Math.PI)*-7:0;
      this.hat.setPosition(p.x,p.y-145+bounce);this.returnCloud.setPosition(p.x,p.y+16);
    }
    update(time,delta){
      if(!this.hero) return;
      this.pose(time);this.positionCamera();
      if(!reduced&&!this.quiet){
        this.birdSeconds+=Math.min(delta||0,80)/1000;
        this.birds.forEach((bird,i)=>{const p=birdPoint(i,this.birdSeconds);bird.setPosition(p.x,p.y);});
        this.petals.forEach((p,i)=>{p.x=p.startX+Math.sin(this.birdSeconds*.3+i)*16;p.y=p.startY+Math.sin(this.birdSeconds*.5+i)*9;});
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
      scene.moving=false;scene.gag=null;scene.emotion='attentive';scene.hero.stop().setTexture('paillette0').setFlipX(false);scene.hero.angle=0;
      scene.returnCloud.setVisible(false);scene.hat.setVisible(false);
    }
    if(finishMove){finishMove(false);finishMove=null;}
  }
  return {
    reset(total,startWorld=0){
      cancel();progress=0;crystals=0;if(!scene?.hero)return;
      scene.total=total;scene.startWorld=startWorld;scene.paintWorld(0,0);
    },
    quiet(value){if(scene){scene.quiet=value;scene.birds.forEach(bird=>{if(reduced)return;if(value)bird.anims.pause();else if(bird.anims.isPlaying)bird.anims.resume();else bird.play('bird-flight');});}},
    moveTo(count,{returning=false}={}){
      cancel();if(!scene?.hero)return Promise.resolve(false);
      const my=serial;
      return new Promise(resolve=>{
        finishMove=resolve;scene.moving=true;scene.backwards=returning;scene.hero.setFlipX(returning);
        scene.motion={t:0};const from=scene.travel.value,to=(count-scene.worldNumber*10)/10;
        scene.startGag(returning?'return':gagFor(count));
        if(!reduced&&scene.gag!=='boing'&&(!returning||walkingPoint(from).onBridge))scene.hero.play('walk');
        const settle=()=>{
          if(my!==serial)return;
          progress=count/scene.total;crystals=count;scene.moving=false;scene.gag=null;scene.hat.setVisible(false);scene.returnCloud.setVisible(false);
          scene.hero.stop().setTexture(count===scene.total?'pailletteHappy':'paillette0').setFlipX(false);scene.hero.angle=0;
          if(count===scene.total)onBiome({id:7,name:'Le château de cristal',icon:'castle',number:scene.worldNumber+1});
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
        else scene.tweens.add({targets:scene.motion,t:1,duration:returning?Math.max(1400,Math.abs(to-from)*6000):scene.gag==='rainbow'?3000:walkingPoint(to).onBridge||walkingPoint(from).onBridge?2400:1900,ease:'Sine.easeInOut',onUpdate:()=>{scene.travel.value=from+(to-from)*scene.motion.t;},onComplete:complete});
      });
    },
    cancel,
    react(emotion){if(scene?.hero&&!scene.moving){scene.emotion=emotion;scene.hero.setTexture(emotion==='attentive'?'paillette0':'paillette-'+emotion);}},
    setPaused(value){if(scene?.hero){if(value)scene.scene.pause();else scene.scene.resume();}},
    state(){return {ready:!!scene?.hero,progress,crystals,moving:!!scene?.moving,worldIndex:scene?.worldNumber,theme:scene?.theme.id,
      emotion:scene?.emotion,landmark:scene?.theme.name,birdCount:scene?.birds.length,birdSeconds:scene?.birdSeconds,childCount:scene?.children.length,bridge:{start:rainbowPoint(0),crest:rainbowPoint(.5),end:rainbowPoint(1)},onBridge:scene?walkingPoint(scene.travel.value).onBridge:false,bridgeLift:scene?walkingPoint(scene.travel.value).lift:0,visibleCrystals:scene?.gems.filter(g=>g.visible).length,effectCount:scene?.effects.length,hatVisible:scene?.hat.visible,angle:scene?.hero.angle,worldCrystals:Math.round((scene?.travel.value||0)*10),gag:scene?.gag,lastGag:scene?.lastGag,
      position:scene?.hero?{x:scene.hero.x,y:scene.hero.y}:null,frame:scene?.hero?.anims.currentFrame?.index,renderer:game?.renderer?.type,version:Phaser.VERSION};},
    destroy(){cancel();game?.destroy(true);}
  };
}
