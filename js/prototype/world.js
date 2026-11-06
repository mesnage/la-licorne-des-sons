import { createEncounter, poseEncounter } from './encounters.js';
import { drawHabitatTouch } from './habitat-touch.js';
import Phaser from '../../vendor/phaser/phaser.esm.min.js';
import { WORLD_WIDTH, WORLD_HEIGHT, pathPoint, WORLDS, worldPanorama, gagFor } from './model.js';
import { uri, crystal, cloud, checkpointFlag, magicHat } from './art.js';
import { landmark } from './scenery.js';
import { coastalBreeze, coastalGrasses, windAt, sunPatch, driftingLeaf, glowMote, birdParts, createFlyingBird, poseCoastalBird } from './atmosphere.js';
import { renderProfile, SPRITE_DENSITY } from './rendering.js';
import { wildlifePose } from './wildlife.js';
import { HABITAT_ANIMALS } from './animals.js';
import { butterfly, flowerCrown, soapBubble } from './habitats.js';
import { RAINBOW, rainbowPoint, walkingPoint, bridgeFocus, birdPoint, pathRibbon } from './travel.js';

import { createCoastalAnimal, poseCoastalAnimal } from './coastal-fauna.js';
import { coastalPonyFrame, posePonyGlints } from './coastal-pony.js';

function companionPlan(theme){
 const kinds=HABITAT_ANIMALS[theme.habitat],count=theme.id<2?8:6,slots=[.035,.12,.23,.39,.54,.67,.8,.94];
 return Array.from({length:count},(_,i)=>{
  const p=pathPoint(count===8?slots[i]:(i+.32)/6),kind=kinds[i%kinds.length],x=p.x+(i%2?12:-18);
  const landing=p.x>880&&p.x<1700,lane=landing?185:kind==='deer'||kind==='cow'?175:kind==='bunny'?125:kind==='fox'?135:105;
  return {kind,x,y:p.y+lane,lane,scale:kind==='cow'?.86:kind==='deer'?.76:kind==='hedgehog'?.61:.65};
 });
}

export function createWorld(parent,{onReady,onBiome,onError,onGag=()=>{}}){
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let profile=renderProfile(parent.clientWidth,parent.clientHeight,window.devicePixelRatio);
  let scene,finishMove=null,progress=0,crystals=0,assetsFailed=false,serial=0;
  class Journey extends Phaser.Scene {
    constructor(){super('journey');}
    preload(){
      const load=(key,source,size)=>{
        const dimensions=/<svg[^>]*width="([\d.]+)"[^>]*height="([\d.]+)"/.exec(source);
        const raster=size||{width:Number(dimensions[1])*SPRITE_DENSITY,height:Number(dimensions[2])*SPRITE_DENSITY};
        this.load.svg(key,uri(source),raster);
      };
      WORLDS.forEach(theme=>this.load.image('land'+theme.id,worldPanorama(theme)));
      this.load.spritesheet('trail-details','assets/storybook/bords-du-sentier.webp',{frameWidth:240,frameHeight:200});
      load('landmark0',landmark(WORLDS[0]),{width:660,height:540});
      this.load.spritesheet('world-fauna','assets/storybook/faune-mondes.webp',{frameWidth:400,frameHeight:280});
      this.load.spritesheet('coastal-fauna','assets/storybook/faune-prairie.webp',{frameWidth:400,frameHeight:280});
      this.load.spritesheet('coastal-pony','assets/storybook/paillette-etoilee.webp',{frameWidth:368,frameHeight:368});
      for(let i=0;i<3;i++)load('coastal-grass'+i,coastalGrasses(i));
      load('butterfly',butterfly());load('crown',flowerCrown());load('bubble',soapBubble());
      this.load.image('castle','assets/storybook/chateau-etoile.webp');load('crystal',crystal());load('cloud',cloud());
      load('refuge',checkpointFlag());load('hat',magicHat());
      load('sun-patch',sunPatch(),{width:900,height:540});load('wind-leaf',driftingLeaf());load('glow-mote',glowMote());
      for(const [name,source] of Object.entries(birdParts()))load('flying-'+name,source);
      this.load.on('loaderror',()=>{assetsFailed=true;onError('Le décor n’a pas pu se charger. Recharge la page ou ouvre les activités de secours.');});
    }
    create(){
      scene=this;
      if(assetsFailed||!this.textures.exists('coastal-pony')) return;
      this.skyFill=this.add.rectangle(0,-2000,WORLD_WIDTH,6000,0xd4edf0).setOrigin(0).setDepth(-30);
      this.bottomFill=this.add.rectangle(0,WORLD_HEIGHT-1,WORLD_WIDTH,3000,0xd4edf0).setOrigin(0).setDepth(-21);
      this.road=this.add.graphics().setDepth(-2);
      this.background=this.add.image(0,0,'land0').setOrigin(0).setDisplaySize(WORLD_WIDTH,WORLD_HEIGHT).setDepth(-20);
      this.decor=[];this.fireflies=[];this.gems=[];this.effects=[];this.waits=[];this.birds=[];this.birdSeconds=0;this.petals=[];this.animals=[];this.foliage=[];this.clouds=[];this.lights=[];this.ambientButterflies=[];this.emotion='attentive';
      this.total=20;this.startWorld=0;this.worldNumber=0;this.theme=WORLDS[0];
      this.castle=this.add.image(3380,pathPoint(1).y+5,'castle').setOrigin(.5,1).setDisplaySize(340,350).setDepth(0);
      this.portal=this.add.ellipse(3370,pathPoint(1).y-75,115,170,0xe1eee1,.7).setStrokeStyle(8,0xffffff,.75).setDepth(0);
      const refuge=pathPoint(.5);
      this.refuge=this.add.image(refuge.x+55,refuge.y+8,'refuge').setOrigin(.5,1).setDisplaySize(72,94).setDepth(3);
      this.refugeHalo=this.add.ellipse(refuge.x,refuge.y+7,125,25,0xffedb4,.2).setDepth(1);
      this.shadow=this.add.ellipse(140,620,84,17,0x4a5663,.16).setDepth(2);
      this.hero=this.add.sprite(140,620,'coastal-pony',0).setOrigin(.5,.976).setDisplaySize(185,185).setDepth(5);
      this.ponyGlints=[7,5,4].map(radius=>this.add.star(0,0,4,radius*.25,radius,0xffedaf)
        .setStrokeStyle(1,0xfffbde).setDepth(5.5).setVisible(false));
      this.hat=this.add.image(140,470,'hat').setDisplaySize(65,58).setDepth(6).setVisible(false);
      this.butterfly=this.add.image(0,0,'butterfly').setDisplaySize(60,54).setDepth(7).setVisible(false);
      this.crown=this.add.image(0,0,'crown').setDisplaySize(74,47).setDepth(7).setVisible(false);
      this.bubble=this.add.image(0,0,'bubble').setDisplaySize(205,205).setDepth(6).setVisible(false);
      this.bridge=this.add.graphics().setDepth(3);
      this.bridgeShadow=this.add.ellipse(0,0,510,34,0x697e80,.12).setDepth(1);
      this.bridgeClouds=[0,1].map(()=>this.add.image(0,0,'cloud').setDisplaySize(145,72).setDepth(3.1));
      this.returnCloud=this.add.image(0,0,'cloud').setDisplaySize(115,38).setDepth(4).setVisible(false);
      this.quiet=false;this.moving=false;this.travel={value:0};this.motion={t:0};this.gag=null;this.lastGag=null;
      this.cameras.main.setBounds(0,-1800,WORLD_WIDTH,WORLD_HEIGHT+3600);
      this.habitatTouch=this.add.graphics().setDepth(19);
      this.input.on('pointerdown',pointer=>{
        if(this.quiet)return;
        const point=this.cameras.main.getWorldPoint(pointer.x,pointer.y);
        const encounter=this.encounter;
        if(encounter && (encounter.animal.getBounds().contains(point.x,point.y)||encounter.token.getBounds().contains(point.x,point.y))){
          encounter.cheer=this.birdSeconds;
          encounter.start=this.birdSeconds;
          if(reduced){
            encounter.animal.setFrame(encounter.spec.frame+(encounter.habitat==='moon'?3:4));
            this.touchClear?.remove(false);
            this.touchClear=this.time.delayedCall(800,()=>encounter.animal.setFrame(encounter.spec.frame));
          }else this.sparkle(point.x,point.y);
          return;
        }
        const friend=this.animals.filter(a=>a.visible&&a.painted.drawing.getBounds().contains(point.x,point.y))
          .sort((a,b)=>b.depth-a.depth)[0];
        if(friend){
          friend.greetingUntil=this.birdSeconds+1.5;
          if(reduced){
            const drawing=friend.painted.drawing;
            drawing.setFrame(friend.painted.greetingFrame);
            friend.resetGreeting?.remove(false);
            friend.resetGreeting=this.time.delayedCall(900,()=>{if(drawing.active)drawing.setFrame(friend.painted.restFrame);});
          }
        }else if(this.theme.habitat==='meadow')this.sparkle(point.x,point.y);
        else{
          this.habitatTouch.setPosition(point.x,point.y);
          this.touchStart=this.birdSeconds;
          if(reduced){
            drawHabitatTouch(this.habitatTouch,this.theme.habitat,.45);
            this.touchClear?.remove(false);
            this.touchClear=this.time.delayedCall(650,()=>this.habitatTouch.clear());
          }
        }
        this.touchBreeze={x:point.x,y:point.y,time:this.birdSeconds};
      });
      this.scale.on('resize',()=>{this.cameraInitialized=false;this.positionCamera();});
      parent.querySelector('canvas').setAttribute('aria-hidden','true');parent.dataset.phaserVersion=Phaser.VERSION;
      onReady();
    }
    paintWorld(number,local=0){
      this.worldNumber=number;this.theme=WORLDS[(this.startWorld+number)%WORLDS.length];
      this.skyFill.setFillStyle(Number.parseInt(this.theme.sky.slice(1),16));
      this.bottomFill.setFillStyle(Number.parseInt((this.theme.habitat==='beach'?this.theme.ground:this.theme.sky).slice(1),16));
      const paintedMeadow=this.theme.habitat==='meadow';
      this.touchStart=null;this.habitatTouch.clear();this.touchClear?.remove(false);
      this.touchBreeze=null;
      this.hero.stop();
      this.setHeroDrawing();
      this.drawRoad();
      this.background.setTexture('land'+this.theme.id).setDisplaySize(WORLD_WIDTH,WORLD_HEIGHT);this.decor.forEach(object=>object.destroy());this.decor=[];this.fireflies=[];this.birds=[];this.birdSeconds=0;this.petals=[];this.animals=[];this.foliage=[];this.clouds=[];this.lights=[];this.ambientButterflies=[];
      const keep=object=>{this.decor.push(object);return object;},companions=companionPlan(this.theme);
      this.encounter=createEncounter(this,this.theme.habitat);
      if(this.encounter)keep(this.encounter.group);
      const detailsByHabitat={
        meadow:[0,1], forest:[2,3,15], jungle:[4,5], beach:[6,7,14],
        ice:[8,9], clouds:[10,11], moon:[12,13]
      };
      const frames=detailsByHabitat[this.theme.habitat];
      for(let i=0;i<17;i++){
        const point=pathPoint((i+.3)/17),back=i%3===1;
        const x=point.x+Math.sin(i*4)*24,y=point.y+(back?-64:170+i*37%60);
        const frame=frames[i%frames.length],height=back?46:56+i*13%27;
        const detail=keep(this.add.image(x,y,'trail-details',frame).setOrigin(.5,.985)
          .setDisplaySize(height*1.2,height).setFlipX(i%2===1).setDepth(back?-4:3+y*.001));
        if([0,1,3,4,5,7,10].includes(frame))this.foliage.push({object:detail,amplitude:2,phase:i,x});
      }
      if([1,6].includes(this.theme.id)) for(let i=0;i<28;i++){
        const fly=keep(this.add.image(150+i*122,300+(i*61%300),'glow-mote').setDisplaySize(19+i%3*4,19+i%3*4).setAlpha(.65).setDepth(4));
        fly.startY=fly.y;this.fireflies.push(fly);
      }
      for(let i=0;i<(paintedMeadow||this.theme.habitat==='moon'?0:8);i++){
        const cloud=keep(this.add.image(180+i*490,170+(i*41%100),'cloud').setDisplaySize(147+(i%3)*42,60+(i%3)*17).setScrollFactor(.6,1).setDepth(-12).setAlpha(.55));
        this.clouds.push({object:cloud,x:cloud.x,phase:i});
      }
      const vista=pathPoint(.78);
      if(paintedMeadow)keep(this.add.image(vista.x,vista.y-80,'landmark0').setOrigin(.5,1).setDisplaySize(330,270).setDepth(-3));
      if(['meadow','forest','jungle','beach'].includes(this.theme.habitat)){
        for(let i=0;i<32;i++){
          const point=pathPoint((i+.25)/32),x=point.x+Math.sin(i*7)*43;
          const near=i%3!==0,height=near?48+i*17%34:30+i%14;
          const grass=keep(this.add.image(x,point.y+(near?190+i*41%88:-65-i%24),'coastal-grass'+i%3)
            .setOrigin(.5,.98).setDisplaySize(height*100/90,height).setDepth(near?4.5:-5));
          this.foliage.push({object:grass,amplitude:2+height*.04,phase:i,x});
          if(near){
            const tuft=keep(this.add.image(x+height*.27,grass.y+3,'coastal-grass'+(i+1)%3)
              .setOrigin(.5,.98).setDisplaySize(height*.59,height*.54).setFlipX(true).setDepth(4.5));
            this.foliage.push({object:tuft,amplitude:3,phase:i+1,x:x+14});
          }
        }
      }
      const leafy=['meadow','forest','jungle'].includes(this.theme.habitat);
      if(leafy){
        for(let i=0;i<4;i++){
          const p=pathPoint(.08+i*.25),light=keep(this.add.image(p.x,p.y+64,'sun-patch').setDisplaySize(this.theme.id===1?420:610,240).setAlpha(.2).setDepth(-3));
          this.lights.push({object:light,x:p.x,phase:i*2});
        }
        for(let i=0;i<3;i++){
          const p=pathPoint(.12+i*.33),friend=keep(this.add.image(p.x,p.y-74,'butterfly').setDisplaySize(30,27).setDepth(3.9));
          this.ambientButterflies.push({object:friend,x:p.x,y:p.y-74,phase:i*2.3});
        }
      }
      for(let i=0;i<18;i++){
        const x=150+i*190,y=200+(i*53%310);
        const mote=keep(leafy?this.add.image(x,y,'wind-leaf').setDisplaySize(12+i%3*4,8+i%3*3).setAlpha(.45).setDepth(4):this.add.ellipse(x,y,3+i%3,2+i%2,this.theme.id===6?0xf4dea4:0xf3e4c4,.45).setDepth(4));
        mote.startX=x;mote.startY=y;mote.leaf=leafy;this.petals.push(mote);
      }
      this.castle.setVisible(number===Math.ceil(this.total/10)-1);this.portal.setVisible(!this.castle.visible);
      this.drawBridge();
      this.poseBird=poseCoastalBird;
      for(let i=0;i<(this.theme.habitat==='moon'?0:9);i++){
        const bird=keep(createFlyingBird(this,0,0,42+(i%3)*6,i).setDepth(-5).setAlpha(.95));
        const p=birdPoint(i,0);bird.setPosition(p.x,p.y);this.poseBird(bird,0,reduced);
        this.birds.push(bird);
      }
      for(let i=0;i<companions.length;i++){
        const {kind,x,y,lane}=companions[i];
        const friend=keep(createCoastalAnimal(this,kind,x,y).setDepth(4));
        friend.baseX=friend.x;friend.baseY=friend.y;friend.pathProgress=(x-140)/3160;friend.lane=lane;friend.kind=kind;friend.greetingUntil=0;this.animals.push(friend);
        poseCoastalAnimal(friend,wildlifePose(kind,0,i),0,reduced);
      }
      this.travel.value=local/10;this.setCrystals(local);this.pose();this.cameraInitialized=false;this.positionCamera();
      onBiome({...this.theme,number:number+1});
    }
    setHeroDrawing(){
      const pose=this.emotion||'attentive';
      const walking=this.moving&&this.gag!=='boing'&&(!this.backwards||walkingPoint(this.travel.value).onBridge);
      const frame=coastalPonyFrame(pose,this.birdSeconds||0,this.travel.value*3160,walking,reduced);
      if(this.hero.frame.name!==frame)this.hero.setFrame(frame);
    }
    drawRoad(){
      this.road.clear();
      const line=(width,color,alpha=1)=>{
        const points=pathRibbon(width),a=pathPoint(0),b=pathPoint(.001),length=Math.hypot(b.x-a.x,b.y-a.y);
        const extend=p=>({x:p.x-(b.x-a.x)/length*350,y:p.y-(b.y-a.y)/length*350});
        const first=extend(points[0]),last=extend(points[points.length-1]);
        this.road.fillStyle(color,alpha).fillPoints([first,...points,last],true);
        const end=pathPoint(1);this.road.fillCircle(end.x,end.y,width/2);
      };
      const road=this.theme.id===0?0xe5ba76:Number.parseInt(this.theme.road.slice(1),16);
      for(const [width,alpha] of [[80,.09],[64,.13],[46,.12],[28,.08]])line(width,road,alpha);
      for(let i=0;i<780;i++){
        const p=pathPoint(i/780),cross=Math.sin(i*57.3)*32;
        this.road.fillStyle(i%4?0xffefd4:road,.38);
        this.road.fillEllipse(p.x,p.y+cross,2+i%6,1+i%2);
      }
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
        this.bridge.lineStyle(RAINBOW.band+1,color,.79).beginPath();
        for(let j=0;j<=100;j++){
          const p=rainbowPoint(j/100),y=p.y+RAINBOW.band/2+i*RAINBOW.band;
          if(j===0)this.bridge.moveTo(p.x,y);else this.bridge.lineTo(p.x,y);
        }
        this.bridge.strokePath();
      });
      this.bridge.lineStyle(2,0xfffae9,.9).beginPath();
      for(let j=0;j<=100;j++){const p=rainbowPoint(j/100);if(j===0)this.bridge.moveTo(p.x,p.y);else this.bridge.lineTo(p.x,p.y);}
      this.bridge.strokePath();
      // Fixed flecks follow the painted arch as the camera moves.
      for(let i=1;i<180;i++){
        const point=rainbowPoint(i/180);
        const y=point.y+2+(i*31%53);
        this.bridge.fillStyle(0xfff4cb,i%9===0?.78:.36);
        this.bridge.fillEllipse(point.x,y,i%9===0?5:2,1.5);
        if(i%9===0)this.bridge.fillEllipse(point.x,y,1.5,7);
      }
      [0,1].forEach((t,i)=>{const p=rainbowPoint(t);this.bridgeClouds[i].setPosition(p.x,p.y+56);});
      const middle=pathPoint((RAINBOW.start+RAINBOW.end)/2);
      this.bridgeShadow.setPosition(middle.x,middle.y+35);
    }
    positionCamera(){
      const density=profile.ratio,w=this.scale.width/density,h=this.scale.height/density,base=w<600?.72:w<1000?.85:1;
      const focus=bridgeFocus(this.travel.value),fit=Math.max(.42,Math.min(base,w/850));
      const target=base+(fit-base)*focus;
      const smoothing=1-Math.exp(-8.5*(this.frameSeconds||1/60));
      const zoom=this.cameraInitialized&&!reduced?this.cameras.main.zoom/density+(target-this.cameras.main.zoom/density)*smoothing:target;
      this.cameraInitialized=true;this.cameras.main.setZoom(zoom*density);
      const ground=pathPoint(this.travel.value),lift=ground.y-this.hero.y;
      // The camera gives the climb room while leaving the arch and landing visible.
      const follow= h<700?.75:.42;
      const menu=document.body.dataset.screen==='menu',vertical=menu&&w<600&&h>w?.29:h<500?-.1:.09;
      this.cameras.main.centerOn(this.hero.x+w*.14/zoom,ground.y-lift*follow+h*vertical/zoom);

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
      this.butterfly.setVisible(kind==='butterfly'&&!reduced);this.crown.setVisible(kind==='crown');this.bubble.setVisible(kind==='bubble'&&!reduced);
      if(kind) onGag(kind);
      if(kind==='splash'&&!reduced)for(let i=0;i<10;i++){
        const drop=this.add.ellipse(this.hero.x+i*8-40,this.hero.y-12,5,9,0xbce2e5,.85).setDepth(6);this.effects.push(drop);
        this.tweens.add({targets:drop,y:drop.y-35-i%3*16,x:drop.x+(i-4)*13,alpha:0,duration:900,onComplete:()=>{drop.destroy();this.effects=this.effects.filter(d=>d!==drop);}});
      }
      if(kind==='prout'&&!reduced) for(let i=0;i<7;i++){
        const puff=this.add.ellipse(this.hero.x-45,this.hero.y-55,18+i*6,13+i*5,[0xf2cae0,0xc7c8ee,0xbde3df][i%3],.8).setDepth(4);this.effects.push(puff);
        this.tweens.add({targets:puff,x:puff.x-80-i*8,y:puff.y-35-i*5,alpha:0,scaleX:1.8,scaleY:1.8,duration:1500,onComplete:()=>{puff.destroy();this.effects=this.effects.filter(d=>d!==puff);}});
      }
    }
    pose(time=0){
      const p=walkingPoint(this.travel.value),phase=this.motion.t;
      let bounce=0;
      if(this.moving&&!reduced){
        if(this.gag==='moonhop')bounce=-Math.abs(Math.sin(phase*Math.PI*2))*75;
        else if(this.gag==='bubble')bounce=-Math.sin(phase*Math.PI)*65;
        else if(this.gag==='splash')bounce=-Math.abs(Math.sin(phase*Math.PI*3))*26;
        else if(this.gag==='boing')bounce=-Math.abs(Math.sin(phase*Math.PI*3))*38;
        else if(this.gag==='return'&&!p.onBridge)bounce=-Math.sin(phase*Math.PI)*6;
        else bounce=Math.sin(time*.025)*2;
      }
      this.setHeroDrawing();
      this.hero.setPosition(p.x,p.y+bounce);
      const ground=pathPoint(this.travel.value);this.shadow.setPosition(p.x,ground.y-1).setAlpha(p.onBridge?.08:.16);
      this.hero.angle=p.onBridge?p.angle*(this.backwards?-1:1):this.gag==='return'&&!reduced?Math.sin(phase*Math.PI)*-7:0;
      posePonyGlints(this.ponyGlints,this.hero,this.birdSeconds,!reduced);
      this.hat.setPosition(p.x,p.y-145+bounce);this.returnCloud.setPosition(p.x,p.y+16);
      this.bubble.setPosition(p.x+6,p.y-67+bounce);this.crown.setPosition(p.x+32,p.y-118+bounce);
      this.butterfly.setPosition(p.x+66+Math.sin(phase*Math.PI*4)*18,p.y-112+bounce+Math.cos(phase*Math.PI*3)*12).setScale((.55+Math.sin(phase*Math.PI*12)*.08)/SPRITE_DENSITY,.6/SPRITE_DENSITY);
    }
    update(time,delta){
      if(!this.hero) return;
      this.frameSeconds=Math.min(delta||16.67,80)/1000;this.pose(time);this.positionCamera();
      const camera=this.cameras.main,half=camera.width/camera.zoom/2;
      const center=camera.scrollX+camera.width/2;
      for(const object of this.decor){const x=object.x+camera.scrollX*(1-object.scrollFactorX);object.setVisible(x>center-half-350&&x<center+half+350);}
      if(this.encounter){
        const anchor=Math.min(WORLD_WIDTH-155,Math.max(90,this.hero.x+Math.min(150,half*.25)));
        const ground=pathPoint((anchor-140)/3160).y;
        if(!reduced||this.encounter.anchor!==anchor)poseEncounter(this.encounter,this.birdSeconds,anchor,ground,reduced);
        this.encounter.anchor=anchor;
      }
      if(!reduced&&!this.quiet){
        this.birdSeconds+=Math.min(delta||0,80)/1000;
        if(this.touchStart!=null){
          const t=Math.min(1,(this.birdSeconds-this.touchStart)/1.45);
          drawHabitatTouch(this.habitatTouch,this.theme.habitat,t);
          if(t===1){this.touchStart=null;this.habitatTouch.clear();}
        }
        this.foliage.forEach(({object,amplitude,phase,x})=>{if(object.parentContainer&&!object.parentContainer.visible)return;const sway=this.theme.habitat==='meadow'
          ?coastalBreeze(this.birdSeconds-(phase%3)*.06,x??object.x)
          :windAt(this.birdSeconds,x??object.x,phase);
          const worldX=x??object.x;
          const distance=worldX-this.hero.x;
          const passing=this.moving?Math.sin(distance/110*Math.PI)*Math.max(0,1-Math.abs(distance)/110):0;
          let ripple=0;
          if(this.touchBreeze){
            const radius=Math.hypot(worldX-this.touchBreeze.x,(object.parentContainer?.y??object.y)-this.touchBreeze.y);
            const age=this.birdSeconds-this.touchBreeze.time-radius/420;
            if(age>0&&age<1)ripple=Math.sin(age*Math.PI*2)*(1-age)*Math.max(0,1-radius/320);
          }
          object.angle=(sway+passing*.85+ripple*1.8)*amplitude;});
        this.clouds.forEach(({object,x,phase})=>{object.x=(x+this.birdSeconds*(3+phase%3)+400)%(WORLD_WIDTH+800)-400;});
        this.birds.forEach((bird,i)=>{const p=birdPoint(i,this.birdSeconds);bird.setPosition(p.x,p.y);this.poseBird(bird,this.birdSeconds);});
        this.lights.forEach(({object,x,phase})=>{object.x=x+Math.sin(this.birdSeconds*.17+phase)*18;object.alpha=.19+Math.sin(this.birdSeconds*.23+phase)*.045;});
        this.ambientButterflies.forEach(({object,x,y,phase})=>{object.setPosition(x+Math.sin(this.birdSeconds*.6+phase)*40,y+Math.sin(this.birdSeconds*.95+phase)*18);object.setDisplaySize(30*(.5+Math.sin(this.birdSeconds*8+phase)**2*.5),27);object.angle=Math.sin(this.birdSeconds*.8+phase)*12;});
        this.animals.forEach((friend,i)=>{
          const pose=wildlifePose(friend.kind,this.birdSeconds,i);
          const p=pathPoint(friend.pathProgress+pose.offset/3160);
          friend.x=friend.baseX+pose.offset;friend.y=p.y+friend.lane;
          const depth=3+friend.y*.001;
          if(Math.abs(friend.depth-depth)>.003)friend.setDepth(depth);
          poseCoastalAnimal(friend,pose,this.birdSeconds);
        });
        this.petals.forEach((p,i)=>{if(p.leaf){const t=(this.birdSeconds+i*3.7)%(18+i%5),life=t/(18+i%5);p.x=(p.startX+this.birdSeconds*13+windAt(this.birdSeconds,p.startX,i)*14)%(WORLD_WIDTH+260)-130;p.y=p.startY+life*210;p.angle=this.birdSeconds*28+i*40;p.alpha=Math.sin(life*Math.PI)*.6;}else{p.x=p.startX+Math.sin(this.birdSeconds*.3+i)*16;p.y=p.startY+Math.sin(this.birdSeconds*.5+i)*9;}});
        this.gems.forEach((g,i)=>{if(g.visible)g.y=g.baseY+Math.sin(time*.002+i)*5;});
        this.fireflies.forEach((f,i)=>{f.y=f.startY+Math.sin(time*.001+i)*14;f.alpha=.3+(Math.sin(time*.002+i)+1)*.3;});
      }
    }
  }
  let game;
  try {game=new Phaser.Game({
    type:new window.URLSearchParams(location.search).get('renderer')==='canvas'?Phaser.CANVAS:Phaser.AUTO,
    parent,backgroundColor:'#cce4e9',width:profile.width,height:profile.height,
    scale:{mode:Phaser.Scale.NONE,zoom:1/profile.ratio,autoRound:false},
    antialias:true,audio:{noAudio:true},scene:[Journey],fps:{target:60},banner:false
  });}catch(e){onError('Le décor animé n’est pas disponible sur cet appareil. Tu peux ouvrir les activités de secours.');}
  function resize(){
    if(!game)return;
    const next=renderProfile(parent.clientWidth,parent.clientHeight,window.devicePixelRatio);
    if(next.width===profile.width&&next.height===profile.height&&next.ratio===profile.ratio)return;
    // Phaser computes the CSS display size in setZoom; resize the backing buffer first.
    profile=next;game.scale.resize(profile.width,profile.height);game.scale.setZoom(1/profile.ratio);
  }
  const observer=window.ResizeObserver?new window.ResizeObserver(resize):null;observer?.observe(parent);window.addEventListener('resize',resize);
  function hideProps(){if(scene?.hero){scene.returnCloud.setVisible(false);scene.hat.setVisible(false);scene.butterfly.setVisible(false);scene.crown.setVisible(false);scene.bubble.setVisible(false);}}
  function cancel(){
    serial++;
    if(scene?.hero){
      scene.tweens.killTweensOf(scene.motion);scene.waits.forEach(t=>t.remove(false));scene.waits=[];scene.cameras.main.resetFX();
      scene.effects.forEach(o=>{scene.tweens.killTweensOf(o);o.destroy();});scene.effects=[];
      scene.moving=false;scene.gag=null;scene.emotion='attentive';scene.hero.stop().setFlipX(false);scene.setHeroDrawing();scene.hero.angle=0;
      hideProps();
    }
    if(finishMove){finishMove(false);finishMove=null;}
  }
  return {
    reset(total,startWorld=0){
      cancel();progress=0;crystals=0;if(!scene?.hero)return;
      const reuse=scene.worldNumber===0&&scene.theme.id===WORLDS[startWorld%WORLDS.length].id&&scene.decor.length>0;
      scene.total=total;scene.startWorld=startWorld;
      if(reuse){
        scene.birdSeconds=0;scene.travel.value=0;scene.setCrystals(0);scene.animals.forEach(a=>{a.greetingUntil=0;});
        scene.castle.setVisible(total<=10);scene.portal.setVisible(total>10);
        scene.pose();scene.cameraInitialized=false;scene.positionCamera();onBiome({...scene.theme,number:1});
      }else scene.paintWorld(0,0);
    },
    setTheme(id){
      if(!scene?.hero||scene.moving||!Number.isInteger(id)||id<0||id>=WORLDS.length)return false;
      scene.startWorld=(id-scene.worldNumber+WORLDS.length)%WORLDS.length;
      scene.paintWorld(scene.worldNumber,Math.round(scene.travel.value*10));
      return true;
    },
    quiet(value){if(scene){scene.quiet=value;scene.birds.forEach(bird=>{if(reduced||!bird.anims)return;if(value)bird.anims.pause();else if(bird.anims.isPlaying)bird.anims.resume();else bird.play('bird-flight');});}},
    moveTo(count,{returning=false}={}){
      cancel();if(!scene?.hero)return Promise.resolve(false);
      const my=serial;
      return new Promise(resolve=>{
        finishMove=resolve;scene.moving=true;scene.backwards=returning;scene.hero.setFlipX(returning);
        scene.motion={t:0};const from=scene.travel.value,to=(count-scene.worldNumber*10)/10;
        scene.startGag(returning?'return':gagFor(count,scene.theme.habitat));
        const settle=()=>{
          if(my!==serial)return;
          progress=count/scene.total;crystals=count;scene.moving=false;scene.gag=null;hideProps();
          scene.emotion=count===scene.total?'proud':'attentive';scene.hero.stop().setFlipX(false);scene.setHeroDrawing();scene.hero.angle=0;
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
    react(emotion){if(scene?.hero&&!scene.moving){scene.emotion=emotion;scene.setHeroDrawing();}},
    setPaused(value){if(scene?.hero){if(value)scene.scene.pause();else scene.scene.resume();}},
    state(){return {camera:scene?.cameras?.main?{width:scene.cameras.main.width,height:scene.cameras.main.height,zoom:scene.cameras.main.zoom,scrollX:scene.cameras.main.scrollX,scrollY:scene.cameras.main.scrollY}:null,rigCount:scene?.animals?.filter(a=>a.rig).length,rigPoses:scene?.animals?.map(a=>a.rig?{head:a.rig.neck.angle,bodyVisible:a.rig.visual.visible,turnVisible:a.rig.front.visible,bodyAlpha:a.rig.visual.alpha,turnAlpha:a.rig.front.alpha,feet:a.rig.legs.map(l=>({x:l.foot.x,y:l.foot.y,angle:l.foot.angle,planted:l.planted}))}:null),lighting:scene?.lights?.map(l=>({x:l.object.x,alpha:l.object.alpha})),leafPoses:scene?.petals?.map(p=>({x:p.x,y:p.y,angle:p.angle,alpha:p.alpha})),animalActivities:scene?.animals?.map((a,i)=>(a.rig||a.painted)?(wildlifePose(a.kind,scene.birdSeconds,i).walking?'walking':'resting'):null),foliageCount:scene?.foliage?.length,foliageAngles:scene?.foliage?.map(f=>f.object.angle),density:profile.ratio,canvas:{width:game?.canvas.width,height:game?.canvas.height},animalKinds:scene?.animals?.map(a=>a.kind),greetings:scene?.animals?.map(a=>a.greetingUntil),animalScreens:scene?.animals?.map(a=>{const camera=scene.cameras.main,p=camera.matrixCombined.transformPoint(a.x,a.y-35);return {x:p.x/profile.ratio,y:p.y/profile.ratio};}),animalPoses:scene?.animals?.map(a=>({x:a.x,y:a.y,angle:a.angle})),habitat:scene?.theme.habitat,propsVisible:!!(scene?.butterfly?.visible||scene?.crown?.visible||scene?.bubble?.visible),ready:!!scene?.hero,progress,crystals,moving:!!scene?.moving,worldIndex:scene?.worldNumber,theme:scene?.theme.id,
      emotion:scene?.emotion,landmark:scene?.theme.name,birdCount:scene?.birds?.length,birdSeconds:scene?.birdSeconds,childCount:scene?.children.length,bridge:{start:rainbowPoint(0),crest:rainbowPoint(.5),end:rainbowPoint(1)},onBridge:scene?.travel?walkingPoint(scene.travel.value).onBridge:false,bridgeLift:scene?.travel?walkingPoint(scene.travel.value).lift:0,visibleCrystals:scene?.gems?.filter(g=>g.visible).length,effectCount:scene?.effects?.length,hatVisible:scene?.hat?.visible,angle:scene?.hero?.angle,worldCrystals:Math.round((scene?.travel?.value||0)*10),gag:scene?.gag,lastGag:scene?.lastGag,
      position:scene?.hero?{x:scene.hero.x,y:scene.hero.y}:null,frame:scene?.hero?.frame.name,renderer:game?.renderer?.type,version:Phaser.VERSION};},
    destroy(){cancel();observer?.disconnect();window.removeEventListener('resize',resize);game?.destroy(true);}
  };
}
