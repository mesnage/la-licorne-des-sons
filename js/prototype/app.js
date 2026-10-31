import { createWorld } from './world.js';
import { MODULES, createAdventure, createJourneyMemory, journeyState } from './model.js';
import { PHONEME_LEVELS } from '../data/phonemes.js';
import { illustration } from '../illustrations.js';
import { createMastery, skillStatus } from '../learning/mastery.js';
import { initNotebook } from '../learning/notebook.js';
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
const mastery=createMastery(storage);
initNotebook({mastery,words:practice});
let evaluated=new Set(),sessionId='';
const journeyMemory=createJourneyMemory(storage);
const voice=createWordVoice(window,message=>{$('adventureAudioStatus').textContent=message;});
let session=null, mode='voyelles', level=1, token=0, promptToken=0, ready=false, rewardTimer=null, startWorld=0, paused=false;
const resumeWaiters=new Set();
initRewards();
for(const el of document.querySelectorAll('[data-art]'))el.innerHTML=illustration(el.dataset.art);
function stopAudio(){promptToken++;hush();voice.stop();}
function resume(){
  paused=false;world.setPaused(false);
  if($('adventurePause').open)$('adventurePause').close();
  for(const resolve of resumeWaiters)resolve();resumeWaiters.clear();
}
function cleanUp(){token++;resume();clearTimeout(rewardTimer);stopAudio();world.cancel();}
async function continueWhenReady(my){
  if(paused)await new Promise(resolve=>resumeWaiters.add(resolve));
  return my===token;
}
function pause(){
  if(!session||session.phase==='finished'){menu();return;}
  if(paused)return;
  paused=true;stopAudio();world.setPaused(true);$('adventurePause').showModal();
}

function storageNote(){
  $('adventureStorage').textContent=practice.persistent&&mastery.persistent&&journeyMemory.persistent?'':'La sauvegarde est bloquée. Les progrès resteront pendant cette visite.';
}
function panels(name){
  for(const [id,state] of [['adventureMenu','menu'],['adventureQuestion','question'],['adventureWalking','walking'],['adventureFinish','finish']]) $(id).hidden=name!==state;
  $('adventureHome').hidden=name==='menu';$('adventureHud').hidden=name==='menu';
}
function progress(){
  const count=session?.index||0,total=session?.questions.length||20;
  const state=journeyState(count,total,startWorld);
  $('adventureCount').innerHTML=illustration('gem')+` ${state.worldCrystals} / 10`;
  $('adventureTotal').textContent=`Voyage : ${count} / ${total}`;
  $('adventureRefuge').textContent=state.worldCrystals>=5?'Refuge sauvegardé : 5 cristaux':'Refuge à 5 cristaux';
  $('adventureProgress').setAttribute('aria-valuemax',10);
  $('adventureProgress').setAttribute('aria-valuenow',state.worldCrystals);
  $('adventureProgress').setAttribute('aria-valuetext',`${state.worldCrystals} cristaux sur 10 dans ce monde. Refuge à 5.`);
  $('adventureProgress').firstElementChild.style.width=`${state.worldCrystals*10}%`;
}
async function replay(){
  if(!session||paused||session.phase!=='question') return;
  stopAudio();unlock();$('adventureAudioStatus').textContent='';
  if(mode==='words'){voice.speak(session.current.target);return;}
  const my=promptToken, target=session.current.target, keys=mode==='phonemes'?[target.audioKey]:['L:'+target.g,'w:'+plain(target.w)];
  await audioReady;
  const clips=await Promise.all(keys.map(key=>loadClip(key)));
  if(my!==promptToken) return;
  if(clips.some(clip=>!clip)){
    $('adventureAudioStatus').textContent='Le son n’a pas pu se charger. Vérifie le volume et la connexion, puis touche Réécouter.';return;
  }
  say(keys.length===1?keys:[keys[0],250,keys[1]],true);
}
function ask(){
  panels('question');world.quiet(true);progress();
  $('questionTitle').textContent=mode==='words'?'Trouve le mot !':mode==='phonemes'?'Écoute le son !':'Écoute bien !';
  const skill=mode==='words'?null:mastery.snapshot()[skillId()];
  world.react(skill?.attempts?'attentive':'curious');
  const state=journeyState(session.index,session.questions.length,startWorld);
  $('checkpointName').textContent=`MONDE ${state.worldIndex+1} · CRISTAL ${state.worldCrystals+1}/10`;
  $('adventureFeedback').textContent=state.worldCrystals===5?'Refuge atteint ! Tes cinq premiers cristaux sont protégés.':'Regarde bien chaque lettre. Tu peux prendre ton temps.';
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
  if(mode==='phonemes'&&!skill?.attempts)$('adventureFeedback').textContent='Un nouveau son ! Écoutons ensemble, puis cherche une écriture de ce son.';
  replay();
}
function finish(){
  stopAudio();world.quiet(false);panels('finish');progress();sfx.fanfare();earnReward();journeyMemory.complete(Math.ceil(session.questions.length/10));
  $('adventureResult').textContent=`Bravo ! Tu as réuni les ${session.questions.length} cristaux et rejoint le château !`;
  $('finishCrystals').innerHTML=Array.from({length:session.questions.length},(_,i)=>gemSVG(i+1)).join('');
  $('finishTitle').focus({preventScroll:true});
  const my=token;rewardTimer=setTimeout(()=>{if(my===token) showReward();},700);
}
function skillId(){return (mode==='phonemes'?'phonemes:':'letters:')+session.current.target.id;}
async function answer(id,button){
  if(!session||paused) return;
  const result=session.answer(id);if(!result) return;
  let newlyRecognized=false;
  if(mode!=='words'&&!evaluated.has(session.index)){
    const key=skillId(),before=skillStatus(mastery.snapshot()[key]);
    mastery.record(key,result.correct,sessionId,plain(session.current.target.w));evaluated.add(session.index);
    newlyRecognized=before!=='Bien reconnu'&&skillStatus(mastery.snapshot()[key])==='Bien reconnu';
  }
  if(!result.correct){
    if(mode==='words'&&result.firstMistake) practice.miss(session.current.target.id);
    storageNote();stopAudio();world.react('encouraging');
    $('adventureFeedback').textContent='On essaie encore ensemble. Paillette t’accompagne !';
    button.classList.add('retry');$('adventureChoices').querySelectorAll('button').forEach(b=>{b.disabled=true;});
    const my=token;
    await new Promise(resolve=>setTimeout(resolve,window.matchMedia('(prefers-reduced-motion: reduce)').matches?40:400));
    if(!await continueWhenReady(my))return;
    panels('walking');world.quiet(false);
    const arrived=await world.moveTo(result.checkpoint,{returning:true});
    if(my!==token||!arrived)return;
    session.recover();ask();return;
  }
  if(mode==='words'&&result.firstCompletion) practice.complete(session.current.target.id,result.firstTry);
  storageNote();stopAudio();world.react('proud');
  if(newlyRecognized)$('adventureFeedback').textContent='Tu reconnais ce son de mieux en mieux !';
  sfx.ding();button.classList.add('correct');
  $('adventureChoices').querySelectorAll('button').forEach(b=>{b.disabled=true;});
  const my=token;
  // Show the successful answer briefly, then let the child watch Paillette walk.
  await new Promise(resolve=>setTimeout(resolve,window.matchMedia('(prefers-reduced-motion: reduce)').matches?80:650));
  if(!await continueWhenReady(my)) return;
  panels('walking');world.quiet(false);$('adventureWalking').textContent='Bravo ! Paillette avance vers le prochain cristal…';
  const arrived=await world.moveTo(session.index+1);
  if(my!==token||!arrived) return;
  sfx.gem();session.next();
  if(session.phase==='finished') finish();else ask();
}
function start(id,wordLevel=1){
  if(!ready) return;
  cleanUp();mode=id;level=wordLevel;
  evaluated=new Set();sessionId=Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
  session=createAdventure(mode,level,practice.snapshot(),mastery.snapshot());
  $('activityName').textContent=mode==='words'?WORD_LEVELS.find(l=>l.id===level).title:mode==='phonemes'?PHONEME_LEVELS.find(l=>l.id===level).title:MODULES.find(m=>m.id===mode).title;
  startWorld=journeyMemory.startWorld;world.reset(session.questions.length,startWorld);storageNote();ask();
}
function menu(){
  cleanUp();session=null;panels('menu');world.quiet(false);world.reset(20,journeyMemory.startWorld);
}
for(const module of MODULES){
  const button=document.createElement('button');button.className=`adventure-module tone-${module.color}`;button.dataset.module=module.id;button.disabled=true;
  const icon=document.createElement('span');icon.className='module-icon';icon.innerHTML=illustration(module.icon);icon.setAttribute('aria-hidden','true');
  const title=document.createElement('strong');title.textContent=module.title;
  const detail=document.createElement('small');detail.textContent=module.detail;
  button.append(icon,title,detail);
  button.addEventListener('click',()=>{unlock();if(module.id==='words') $('adventureLevels').showModal();else if(module.id==='phonemes')$('phonemeLevels').showModal();else start(module.id);});
  $('adventureModules').appendChild(button);
}
for(const data of WORD_LEVELS){
  const button=document.createElement('button');button.dataset.wordLevel=data.id;
  const title=document.createElement('span');title.textContent=data.title;
  const detail=document.createElement('small');detail.textContent=data.detail;button.append(title,detail);
  button.addEventListener('click',()=>{$('adventureLevels').close();start('words',data.id);});$('adventureWordLevels').appendChild(button);
}
for(const data of PHONEME_LEVELS){
  const button=document.createElement('button');button.dataset.phonemeLevel=data.id;
  const title=document.createElement('span');title.textContent=data.title;
  const detail=document.createElement('small');detail.textContent=data.detail;button.append(title,detail);
  button.addEventListener('click',()=>{$('phonemeLevels').close();start('phonemes',data.id);});$('phonemeLevelChoices').appendChild(button);
}
$('closePhonemeLevels').addEventListener('click',()=>$('phonemeLevels').close());
$('closeLevels').addEventListener('click',()=>$('adventureLevels').close());
document.querySelector('.adventure-brand').addEventListener('click',event=>{event.preventDefault();pause();});
$('adventureHome').addEventListener('click',pause);
$('adventureResume').addEventListener('click',()=>{resume();replay();});
$('adventureLeave').addEventListener('click',menu);
$('adventurePause').addEventListener('cancel',event=>{event.preventDefault();resume();replay();});
$('adventureChoose').addEventListener('click',menu);
$('adventureAgain').addEventListener('click',()=>start(mode,level));$('listenBtn').addEventListener('click',replay);
const world=createWorld($('adventureWorld'),{
  onReady(){
    ready=true;$('engineStatus').textContent='';
    document.querySelectorAll('[data-module]').forEach(button=>{button.disabled=false;});world.reset(20,journeyMemory.startWorld);
  },
  onBiome(biome){$('worldName').innerHTML=illustration(biome.icon)+`<span>${biome.name}</span>`;},
  onGag(kind){
    const returning=session?.phase==='returning';
    const messages={prout:'Prout arc-en-ciel ! Paillette a fait une petite surprise !',rainbow:'Tout en haut de l’arc-en-ciel ! Paillette grimpe vers les nuages.',boing:'Boïng ! Les nuages font un trampoline !',hat:'Abracadabra ! Un chapeau magique !'};
    $('adventureWalking').textContent=returning?(session.returnIndex%10===5?'Une petite glissade ! Retour au refuge, tes cinq cristaux sont protégés.':'Une petite glissade ! On repart du début de ce monde.'):(messages[kind]||'Paillette avance !');
    if(kind==='prout')sfx.prout();else if(kind==='rainbow'||kind==='return')sfx.slip();else if(kind==='boing')sfx.boing();else if(kind==='hat')sfx.sparkle();
  },
  onError(message){$('engineStatus').textContent=message;$('legacyFallback').hidden=false;}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopAudio();if(session&&session.phase!=='finished')pause();}});
window.addEventListener('pagehide',event=>{cleanUp();if(!event.persisted){voice.destroy();world.destroy();}});
window.addEventListener('pageshow',event=>{if(event.persisted) menu();});
if(location.search.includes('debug')) window.__adventure={
  state:()=>({ready,paused,mode,level,promptKey:mode==='phonemes'?session?.current?.target.audioKey:session?.current?'L:'+session.current.target.g:null,index:session?.index,total:session?.questions.length,phase:session?.phase,targetId:session?.current?.target.id,score:session?.score,checkpoint:session?.returnIndex,startWorld,mastery:mastery.snapshot(),world:world.state()})
};
