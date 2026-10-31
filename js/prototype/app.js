import { createWorld } from './world.js';
import { MODULES, createAdventure } from './model.js';
import { WORD_LEVELS } from '../data/words.js';
import { createWordProgress } from '../words/progress.js';
import { createWordVoice } from '../words/voice.js';
import { initRewards, earnReward, showReward } from '../rewards.js';
import { ready as audioReady, loadClip, say, hush, sfx, unlock } from '../audio.js';
import { gemSVG, plain } from '../utils.js';

const $ = id => document.getElementById(id);
let storage;
try {storage=window.localStorage;}catch(e){}
const practice=createWordProgress(storage);
const voice=createWordVoice(window,message=>{$('adventureAudioStatus').textContent=message;});
let session=null, mode='voyelles', level=1, token=0, promptToken=0, ready=false, rewardTimer=null;
initRewards();
function stopAudio(){promptToken++;hush();voice.stop();}
function cleanUp(){token++;clearTimeout(rewardTimer);stopAudio();world.cancel();}
function storageNote(){
  $('adventureStorage').textContent=practice.persistent?'':'La sauvegarde est bloquée. Les progrès resteront pendant cette visite.';
}
function panels(name){
  for(const [id,state] of [['adventureMenu','menu'],['adventureQuestion','question'],['adventureWalking','walking'],['adventureFinish','finish']]) $(id).hidden=name!==state;
  $('adventureHome').hidden=name==='menu';$('adventureHud').hidden=name==='menu';
}
function progress(){
  const count=session?.index||0,total=session?.questions.length||20;
  $('adventureCount').textContent=`💎 ${count} / ${total}`;
  $('adventureProgress').setAttribute('aria-valuemax',total);
  $('adventureProgress').setAttribute('aria-valuenow',count);
  $('adventureProgress').setAttribute('aria-valuetext',`${count} cristaux collectés sur ${total}`);
  $('adventureProgress').firstElementChild.style.width=`${count/total*100}%`;
}
async function replay(){
  if(!session||session.phase!=='question') return;
  stopAudio();unlock();$('adventureAudioStatus').textContent='';
  if(mode==='words'){voice.speak(session.current.target);return;}
  const my=promptToken, target=session.current.target, keys=['L:'+target.g,'w:'+plain(target.w)];
  await audioReady;
  const clips=await Promise.all(keys.map(key=>loadClip(key)));
  if(my!==promptToken) return;
  if(clips.some(clip=>!clip)){
    $('adventureAudioStatus').textContent='Le son n’a pas pu se charger. Vérifie le volume et la connexion, puis touche Réécouter.';return;
  }
  say([keys[0],250,keys[1]],true);
}
function ask(){
  panels('question');world.quiet(true);progress();
  $('questionTitle').textContent=mode==='words'?'Trouve le mot !':`${session.current.target.e} Écoute bien !`;
  $('checkpointName').textContent=`UN CRISTAL À LIBÉRER · ${session.index+1}/${session.questions.length}`;
  $('adventureFeedback').textContent='Regarde bien chaque lettre. Tu peux prendre ton temps.';
  const box=$('adventureChoices');box.classList.toggle('words',mode==='words');box.replaceChildren();
  session.current.choices.forEach((choice,i)=>{
    const button=document.createElement('button');button.className=`adventure-answer tone-${['rose','lavender','mint','peach'][i]}`;
    button.dataset.choiceId=choice.id;
    const text=document.createElement('span');text.textContent=mode==='words'?choice.text:choice.g.toUpperCase();button.appendChild(text);
    if(mode!=='words'){
      const lower=document.createElement('small');lower.textContent=choice.g;button.appendChild(lower);
      if(choice.g.length>2) button.classList.add('long','phonics-group');
    }else if(choice.text.length>8) button.classList.add('long');
    button.addEventListener('click',()=>answer(choice.id,button));box.appendChild(button);
  });
  replay();
}
function finish(){
  stopAudio();world.quiet(false);panels('finish');progress();sfx.fanfare();earnReward();
  $('adventureResult').textContent=mode==='words'?`Bravo ! ${session.score} mots sur 10 du premier coup, et 10 cristaux trouvés !`:`Bravo ! Tu as trouvé les ${session.questions.length} cristaux et rejoint le château !`;
  $('finishCrystals').innerHTML=Array.from({length:session.questions.length},(_,i)=>gemSVG(i+1)).join('');
  $('finishTitle').focus({preventScroll:true});
  const my=token;rewardTimer=setTimeout(()=>{if(my===token) showReward();},700);
}
async function answer(id,button){
  if(!session) return;
  const result=session.answer(id);if(!result) return;
  if(!result.correct){
    if(mode==='words'&&result.firstMistake) practice.miss(session.current.target.id);
    button.classList.remove('retry');void button.offsetWidth;button.classList.add('retry');
    $('adventureFeedback').textContent='Essaie encore. Écoute et regarde chaque lettre.';storageNote();return;
  }
  if(mode==='words') practice.complete(session.current.target.id,result.firstTry);
  storageNote();stopAudio();sfx.ding();button.classList.add('correct');
  $('adventureChoices').querySelectorAll('button').forEach(b=>{b.disabled=true;});
  const my=token;
  // Show the successful answer briefly, then let the child watch Paillette walk.
  await new Promise(resolve=>setTimeout(resolve,window.matchMedia('(prefers-reduced-motion: reduce)').matches?80:650));
  if(my!==token) return;
  panels('walking');world.quiet(false);
  const arrived=await world.moveTo((session.index+1)/session.questions.length);
  if(my!==token||!arrived) return;
  sfx.gem();session.next();
  if(session.phase==='finished') finish();else ask();
}
function start(id,wordLevel=1){
  if(!ready) return;
  cleanUp();mode=id;level=wordLevel;
  session=createAdventure(mode,level,practice.snapshot());
  $('activityName').textContent=mode==='words'?WORD_LEVELS.find(l=>l.id===level).title:MODULES.find(m=>m.id===mode).title;
  world.reset(session.questions.length);storageNote();ask();
}
function menu(){
  cleanUp();session=null;panels('menu');world.quiet(false);world.reset(20);
}
for(const module of MODULES){
  const button=document.createElement('button');button.className=`adventure-module tone-${module.color}`;button.dataset.module=module.id;button.disabled=true;
  const icon=document.createElement('span');icon.className='module-icon';icon.textContent=module.icon;icon.setAttribute('aria-hidden','true');
  const title=document.createElement('strong');title.textContent=module.title;
  const detail=document.createElement('small');detail.textContent=module.detail;
  button.append(icon,title,detail);
  button.addEventListener('click',()=>{unlock();if(module.id==='words') $('adventureLevels').showModal();else start(module.id);});
  $('adventureModules').appendChild(button);
}
for(const data of WORD_LEVELS){
  const button=document.createElement('button');button.dataset.wordLevel=data.id;
  const title=document.createElement('span');title.textContent=`${data.icon} ${data.title}`;
  const detail=document.createElement('small');detail.textContent=data.detail;button.append(title,detail);
  button.addEventListener('click',()=>{$('adventureLevels').close();start('words',data.id);});$('adventureWordLevels').appendChild(button);
}
$('closeLevels').addEventListener('click',()=>$('adventureLevels').close());
$('adventureHome').addEventListener('click',menu);$('adventureChoose').addEventListener('click',menu);
$('adventureAgain').addEventListener('click',()=>start(mode,level));$('listenBtn').addEventListener('click',replay);
const world=createWorld($('adventureWorld'),{
  onReady(){
    ready=true;$('engineStatus').textContent='';
    document.querySelectorAll('[data-module]').forEach(button=>{button.disabled=false;});world.reset(20);
  },
  onBiome(biome){$('worldName').textContent=`${biome.icon} ${biome.name}`;},
  onError(message){$('engineStatus').textContent=message;}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden) stopAudio();});
window.addEventListener('pagehide',event=>{cleanUp();if(!event.persisted){voice.destroy();world.destroy();}});
window.addEventListener('pageshow',event=>{if(event.persisted) menu();});
if(location.search.includes('debug')) window.__adventure={
  state:()=>({ready,mode,level,index:session?.index,total:session?.questions.length,phase:session?.phase,targetId:session?.current?.target.id,score:session?.score,world:world.state()})
};
