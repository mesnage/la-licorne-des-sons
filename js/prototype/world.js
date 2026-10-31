import Phaser from '../../vendor/phaser/phaser.esm.min.js';
import { WORLD_WIDTH, WORLD_HEIGHT, pathPoint, biomeFor } from './model.js';
import { uri, pailletteFrame, landscape, tree, castle, crystal, mushroom, cloud } from './art.js';

export function createWorld(parent, {onReady,onBiome,onError}){
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let scene, finishMove = null, progress = 0, assetsFailed = false;
  class Journey extends Phaser.Scene {
    constructor(){ super('journey'); }
    preload(){
      const load = (key,source,size) => this.load.svg(key,uri(source),size);
      load('land',landscape()); load('pink',tree()); load('pine',tree('pine')); load('purple',tree('purple'));
      load('castle',castle()); load('crystal',crystal()); load('mushroom',mushroom()); load('cloud',cloud());
      for(let i=0;i<8;i++) load('paillette'+i,pailletteFrame(i),{width:240,height:216});
      load('pailletteHappy',pailletteFrame(0,true),{width:240,height:216});
      this.load.on('loaderror', () => {assetsFailed=true;onError('Le décor n’a pas pu se charger. Recharge la page ou retrouve les activités classiques.');});
    }
    create(){
      scene = this;
      if(assetsFailed||!this.textures.exists('paillette0')) return;
      this.add.image(0,0,'land').setOrigin(0).setDepth(-20);
      // Far trees, then a second row close to the path: scenery at several depths.
      for(let i=0;i<48;i++){
        const x=30+i*75, p=Math.max(0,Math.min(1,(x-140)/3160)), point=pathPoint(p);
        const kind=x<1200?'pink':x<2450?'pine':'purple';
        const near=i%3===0, y=point.y+(near?245:-110)-(i*19%70);
        this.add.image(x,y,kind).setOrigin(.5,1).setScale(near?.9:.55+(i%3)*.13).setDepth(near?10:-10).setAlpha(near?1:.82);
        if(x>1050&&x<2350&&i%2===0) this.add.image(x+30,point.y+70,'mushroom').setOrigin(.5,1).setScale(.45).setDepth(1);
      }
      this.fireflies=[];
      for(let i=0;i<22;i++){
        const fly=this.add.circle(1180+i*47,300+(i*61%300),2,0xffedb8,.85).setDepth(4);
        fly.startY=fly.y; this.fireflies.push(fly);
      }
      for(let i=0;i<8;i++) this.add.image(180+i*490,70+(i*41%180),'cloud').setScale(.7+(i%3)*.2).setScrollFactor(.45,1).setDepth(-12).setAlpha(.65);
      this.castle=this.add.image(3380,pathPoint(1).y+5,'castle').setOrigin(.5,1).setDisplaySize(340,350).setDepth(0);
      this.castleGlow=this.add.ellipse(3380,pathPoint(1).y-100,330,300,0xfff2bf,.13).setDepth(-1);
      this.shadow=this.add.ellipse(140,620,84,17,0x4a5663,.16).setDepth(2);
      this.hero=this.add.sprite(140,620,'paillette0').setOrigin(.5,.94).setDisplaySize(152,137).setDepth(5);
      this.anims.create({key:'walk',frames:Array.from({length:8},(_,i)=>({key:'paillette'+i})),frameRate:12,repeat:-1});
      this.gems=[]; this.quiet=false; this.moving=false; this.travel={value:0}; this.lastBiome=-1;
      this.cameras.main.setBounds(0,0,WORLD_WIDTH,WORLD_HEIGHT);
      this.input.on('pointerdown', pointer => { if(!this.quiet) this.sparkle(pointer.worldX,pointer.worldY); });
      this.scale.on('resize',()=>this.positionCamera());
      this.positionCamera();
      parent.querySelector('canvas').setAttribute('aria-hidden','true');
      parent.dataset.phaserVersion=Phaser.VERSION;
      onReady();
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
        const a=i*Math.PI/6, dot=this.add.circle(x,y,2+i%3,[0xffedb7,0xe8c4e6,0xc6eee2][i%3]).setDepth(20);
        this.tweens.add({targets:dot,x:x+Math.cos(a)*50,y:y+Math.sin(a)*40-20,alpha:0,duration:650,onComplete:()=>dot.destroy()});
      }
    }
    update(time){
      if(!this.hero) return;
      const p=pathPoint(this.travel.value);
      this.hero.setPosition(p.x,p.y+(!reduced&&this.moving?Math.sin(time*.025)*2:0));
      this.shadow.setPosition(p.x,p.y-1);
      if(!reduced&&!this.quiet){
        this.gems.forEach((g,i)=>{ if(g.visible) g.y=g.baseY+Math.sin(time*.002+i)*5; });
        this.fireflies.forEach((f,i)=>{f.y=f.startY+Math.sin(time*.001+i)*14;f.alpha=.3+(Math.sin(time*.002+i)+1)*.3;});
      }
      this.positionCamera();
      const biome=biomeFor(this.travel.value);
      if(biome.id!==this.lastBiome){this.lastBiome=biome.id;onBiome(biome);}
    }
  }
  const config={
    type:new window.URLSearchParams(location.search).get('renderer')==='canvas'?Phaser.CANVAS:Phaser.AUTO,
    parent, backgroundColor:'#cce4e9', width:parent.clientWidth,height:parent.clientHeight,
    scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},
    resolution:Math.min(window.devicePixelRatio||1,1.5), antialias:true,
    audio:{noAudio:true}, scene:[Journey], fps:{target:60}, banner:false
  };
  let game;
  try { game=new Phaser.Game(config); }
  catch(e){onError('Le décor animé n’est pas disponible sur cet appareil. Tu peux ouvrir les activités classiques.');}
  function cancel(){
    if(scene){scene.tweens.killTweensOf(scene.travel);scene.moving=false;scene.hero.stop();scene.hero.setTexture('paillette0');}
    if(finishMove){finishMove(false);finishMove=null;}
  }
  return {
    reset(total){
      cancel();progress=0;if(!scene) return;
      scene.travel.value=0;scene.lastBiome=-1;scene.hero.setTexture('paillette0');
      scene.gems.forEach(g=>g.destroy());scene.gems=[];
      for(let i=1;i<=total;i++){
        const p=pathPoint(i/total),gem=scene.add.image(p.x,p.y-90,'crystal').setDisplaySize(32,42).setDepth(3);
        gem.baseY=p.y-90;scene.gems.push(gem);
      }
      scene.positionCamera();
    },
    quiet(value){if(scene) scene.quiet=value;},
    moveTo(value){
      cancel();
      if(!scene) return Promise.resolve(false);
      return new Promise(resolve=>{
        finishMove=resolve;scene.moving=true;
        if(!reduced) scene.hero.play('walk');
        const complete=()=>{
          progress=value;scene.moving=false;scene.hero.stop();scene.hero.setTexture(value>=1?'pailletteHappy':'paillette0');
          scene.gems.forEach((gem,i)=>{if((i+1)/scene.gems.length<=value) gem.setVisible(false);});
          scene.sparkle(scene.hero.x,scene.hero.y-55);
          if(finishMove){finishMove(true);finishMove=null;}
        };
        if(reduced){scene.travel.value=value;scene.positionCamera();complete();}
        else scene.tweens.add({targets:scene.travel,value,duration:1900,ease:'Sine.easeInOut',onComplete:complete});
      });
    },
    cancel,
    state(){return {ready:!!scene,progress,moving:!!scene?.moving,position:scene?{x:scene.hero.x,y:scene.hero.y}:null,frame:scene?.hero.anims.currentFrame?.index,renderer:game?.renderer?.type,version:Phaser.VERSION};},
    destroy(){cancel();game?.destroy(true);}
  };
}
