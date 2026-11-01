import { createWorld } from './world.js';
import { WORLDS, MODULES, MENU_ITEMS, createAdventure, createJourneyMemory, journeyState } from './model.js?v=sentence-menu-3';
import { illustration } from '../illustrations.js';
import { createMastery, skillStatus } from '../learning/mastery.js';
import { WORD_LEVELS } from '../data/words.js';
import { sentenceActivity } from '../data/sentences.js';
import { createWordProgress } from '../words/progress.js?v=sentence-menu-3';
import { createWordVoice } from '../words/voice.js';
import { initRewards, earnReward, showReward } from '../rewards.js';
import { ready as audioReady, loadClip, say, hush, sfx, unlock } from '../audio.js?v=sentence-menu-3';
import { gemSVG, plain } from '../utils.js';

const $ = id => document.getElementById(id);
let storage;
try {storage=window.localStorage;}catch(e){}
const practice=createWordProgress(storage);
const sentencePractice=createWordProgress(storage,'licorne.sentences.v1');
const mastery=createMastery(storage);
let evaluated=new Set(),sessionId='';
const journeyMemory=createJourneyMemory(storage);
let chosenWorld=null;
try {const value=JSON.parse(storage?.getItem('licorne.world-choice.v1')||'null');if(Number.isInteger(value)&&value>=0&&value<WORLDS.length)chosenWorld=value;}catch(e){}
const startingWorld=()=>chosenWorld??journeyMemory.startWorld;
const voice=createWordVoice({ready:audioReady,loadClip,say,hush,unlock},message=>{$('adventureAudioStatus').textContent=message;});
let session=null, mode='voyelles', level=1, token=0, promptToken=0, ready=false, rewardTimer=null, startWorld=0, paused=false;
const resumeWaiters=new Set();
initRewards();
$('fartUnicorn').innerHTML='<img src="assets/storybook/paillette-3.webp" alt="Paillette la licorne">';
for(const el of document.querySelectorAll('[data-art]'))el.innerHTML=illustration(el.dataset.art);
function stopAudio(){promptToken++;hush();voice.stop();}
function resume(){
  paused=false;world.setPaused(false);
  if($('adventurePause').open)$('adventurePause').close();
  if($('worldDialog').open)$('worldDialog').close();
  $('worldName').setAttribute('aria-expanded','false');
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
  $('adventureStorage').textContent=practice.persistent&&sentencePractice.persistent&&mastery.persistent&&journeyMemory.persistent?'':'La sauvegarde est bloquée. Les progrès resteront pendant cette visite.';
}
function panels(name){
  document.body.dataset.screen=name;
  for(const [id,state] of [['adventureMenu','menu'],['adventureQuestion','question'],['adventureWalking','walking'],['adventureFinish','finish']]) $(id).hidden=name!==state;
  $('adventureHome').hidden=name==='menu';$('adventureHud').hidden=name==='menu';
  $('worldName').disabled=!ready||name==='walking';
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
  if(mode==='words'||sentenceActivity(mode)){voice.speak(session.current.target);return;}
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
  panels('question');world.quiet(false);progress();
  const activity=sentenceActivity(mode);
  $('questionTitle').textContent=activity?(activity.hidden?'Écoute la phrase':'La phrase en ordre'):mode==='words'?'Trouve le mot !':'Écoute bien !';
  const skill=mode==='words'||activity?null:mastery.snapshot()[skillId()];
  world.react(skill?.attempts?'attentive':'curious');
  const state=journeyState(session.index,session.questions.length,startWorld);
  $('checkpointName').textContent=`MONDE ${state.worldIndex+1} · CRISTAL ${state.worldCrystals+1}/10`;
  $('adventureFeedback').textContent=state.worldCrystals===5?'Refuge atteint ! Tes cinq premiers cristaux sont protégés.':'Regarde bien chaque lettre. Tu peux prendre ton temps.';
  const box=$('adventureChoices');box.classList.toggle('words',mode==='words'||!!activity);box.classList.toggle('sentence-choices',!!activity);box.replaceChildren();
  $('adventureQuestion').classList.toggle('sentence-question',!!activity);
  $('adventureHud').classList.toggle('sentence-hud',!!activity);
  $('sentenceWorkbench').hidden=!activity;
  $('sentenceTarget').textContent='';
  box.setAttribute('aria-label',activity?'Mots à remettre dans l’ordre':'Choisis ce que tu entends');
  if(activity){renderSentence(activity);replay();return;}
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
function renderAssembly(){
  const sentence=session.current.target, ordered=session.orderedWords, complete=ordered.length===sentence.words.length;
  $('sentenceAssembly').replaceChildren();
  sentence.words.forEach((word,index)=>{
    const slot=document.createElement('span');slot.className='sentence-slot'+(index<ordered.length?' filled':'');
    slot.textContent=index<ordered.length?(complete&&index===0?ordered[index][0].toLocaleUpperCase('fr')+ordered[index].slice(1):ordered[index])+(complete&&index===sentence.words.length-1?'.':''):String(index+1);
    slot.setAttribute('aria-label',index<ordered.length?slot.textContent:'Mot '+(index+1)+' à placer');
    $('sentenceAssembly').appendChild(slot);
  });
}
function renderSentence(activity){
  $('sentenceModel').hidden=activity.hidden;
  $('sentenceTarget').textContent=activity.hidden?'':session.current.target.text;
  $('sentenceInstruction').textContent=activity.hidden?'Écoute, puis touche les mots dans le bon ordre.':'Regarde le modèle, puis touche les mots dans le bon ordre.';
  $('adventureFeedback').textContent='À toi ! Construis ta phrase, un mot après l’autre.';
  renderAssembly();
  session.current.choices.forEach((tile,index)=>{
    const button=document.createElement('button');button.className='adventure-answer tone-'+['rose','lavender','mint','peach','gold'][index];button.dataset.choiceId=tile.id;
    const text=document.createElement('span');text.textContent=tile.text;button.appendChild(text);
    button.addEventListener('click',()=>answer(tile.id,button));$('adventureChoices').appendChild(button);
  });
}
function finish(){
  stopAudio();world.quiet(false);panels('finish');progress();sfx.fanfare();earnReward();journeyMemory.complete(Math.ceil(session.questions.length/10));
  $('adventureResult').textContent=`Bravo ! Tu as réuni les ${session.questions.length} cristaux et rejoint le château !`;
  $('finishCrystals').innerHTML=Array.from({length:session.questions.length},(_,i)=>gemSVG(i+1)).join('');
  $('finishTitle').focus({preventScroll:true});
  const my=token;rewardTimer=setTimeout(()=>{if(my===token) showReward();},700);
}
function skillId(){return 'letters:'+session.current.target.id;}
async function answer(id,button){
  if(!session||paused) return;
  const result=session.answer(id);if(!result) return;
  const activity=sentenceActivity(mode);
  if(result.partial){
    renderAssembly();button.disabled=true;button.classList.add('placed');
    $('adventureFeedback').textContent=`${session.selected.length} mot${session.selected.length>1?'s':''} placé${session.selected.length>1?'s':''} sur ${session.current.target.words.length}. Continue !`;
    $('adventureChoices').querySelector('button:not(:disabled)')?.focus({preventScroll:true});return;
  }
  if(activity&&result.correct)renderAssembly();
  $('worldName').disabled=true;
  let newlyRecognized=false;
  if(mode!=='words'&&!activity&&!evaluated.has(session.index)){
    const key=skillId(),before=skillStatus(mastery.snapshot()[key]);
    mastery.record(key,result.correct,sessionId,plain(session.current.target.w));evaluated.add(session.index);
    newlyRecognized=before!=='Bien reconnu'&&skillStatus(mastery.snapshot()[key])==='Bien reconnu';
  }
  if(!result.correct){
    if(mode==='words'&&result.firstMistake) practice.miss(session.current.target.id);
    if(activity&&result.firstMistake)sentencePractice.miss(mode+':'+session.current.target.id);
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
  if(activity&&result.firstCompletion)sentencePractice.complete(mode+':'+session.current.target.id,result.firstTry);
  if(activity)$('adventureFeedback').textContent='Bravo ! Tu as construit toute la phrase !';
  storageNote();stopAudio();world.react('proud');
  if(newlyRecognized)$('adventureFeedback').textContent='Tu reconnais ce son de mieux en mieux !';
  sfx.ding();button.classList.add('correct');
  $('adventureChoices').querySelectorAll('button').forEach(b=>{b.disabled=true;});
  const my=token;
  // Show the successful answer briefly, then let the child watch Paillette walk.
  await new Promise(resolve=>setTimeout(resolve,activity?1100:window.matchMedia('(prefers-reduced-motion: reduce)').matches?80:650));
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
  const activity=sentenceActivity(mode);
  const stats=activity?Object.fromEntries(Object.entries(sentencePractice.snapshot()).filter(([key])=>key.startsWith(mode+':')).map(([key,value])=>[key.slice(mode.length+1),value])):practice.snapshot();
  session=createAdventure(mode,level,stats,mastery.snapshot());
  $('activityName').textContent=activity?activity.title+' · '+activity.length+' mots':mode==='words'?WORD_LEVELS.find(l=>l.id===level).title:MODULES.find(m=>m.id===mode).title;
  startWorld=startingWorld();world.reset(session.questions.length,startWorld);storageNote();ask();
}
function menu(){
  cleanUp();session=null;$('sentenceTarget').textContent='';$('sentenceAssembly').replaceChildren();panels('menu');world.reset(20,startingWorld());world.quiet(false);world.setPaused(false);
}
for(const module of MENU_ITEMS){
  const button=document.createElement('button');button.className=`adventure-module tone-${module.color}`;button.dataset.module=module.mode||module.id;if(module.level)button.dataset.wordLevel=module.level;if(sentenceActivity(module.id))button.dataset.sentenceMode=module.id;button.disabled=true;
  const icon=document.createElement('span');icon.className='module-icon';icon.innerHTML=illustration(module.icon);icon.setAttribute('aria-hidden','true');
  const title=document.createElement('strong');title.textContent=module.title+(sentenceActivity(module.id)?' · '+module.length+' mots':'');
  const detail=document.createElement('small');detail.textContent=module.detail;
  button.append(icon,title,detail);
  button.addEventListener('click',()=>{unlock();start(module.mode||module.id,module.level||1);});
  $('adventureModules').appendChild(button);
}
function openWorldPicker(){
  if(!ready||paused||(session&&!['question','finished'].includes(session.phase)))return;
  clearTimeout(rewardTimer);stopAudio();paused=true;world.setPaused(true);
  const current=world.state().theme;
  for(const button of $('worldChoices').children)button.setAttribute('aria-pressed',String(Number(button.dataset.worldId)===current));
  $('worldName').setAttribute('aria-expanded','true');$('worldDialog').showModal();
  $('worldDialog').scrollTop=0;$('worldDialogClose').focus();
}
function closeWorldPicker(){resume();replay();$('worldName').focus();}
for(const theme of WORLDS){
  const button=document.createElement('button');button.type='button';button.className='world-option';button.dataset.worldId=theme.id;
  button.style.setProperty('--world-sky',theme.sky);button.style.setProperty('--world-ground',theme.ground);
  button.innerHTML=`<span class="world-option-art" aria-hidden="true">${illustration(theme.icon)}</span><strong>${theme.name}</strong><span class="world-check" aria-hidden="true">✓</span>`;
  button.setAttribute('aria-pressed','false');
  button.addEventListener('click',()=>{
    if(!world.setTheme(theme.id))return;
    chosenWorld=theme.id;
    try {storage?.setItem('licorne.world-choice.v1',JSON.stringify(chosenWorld));}catch(e){}
    if(session){const current=journeyState(session.index,session.questions.length,startWorld);startWorld=(theme.id-current.worldIndex+WORLDS.length)%WORLDS.length;progress();}
    closeWorldPicker();
  });
  $('worldChoices').appendChild(button);
}
$('worldName').addEventListener('click',openWorldPicker);
$('worldDialogClose').addEventListener('click',closeWorldPicker);
$('worldDialog').addEventListener('cancel',event=>{event.preventDefault();closeWorldPicker();});
document.querySelector('.adventure-brand').addEventListener('click',event=>{event.preventDefault();pause();});
$('adventureHome').addEventListener('click',pause);
$('adventureResume').addEventListener('click',()=>{resume();replay();});
$('adventureLeave').addEventListener('click',menu);
$('adventurePause').addEventListener('cancel',event=>{event.preventDefault();resume();replay();});
$('adventureChoose').addEventListener('click',menu);
$('adventureAgain').addEventListener('click',()=>start(mode,level));$('listenBtn').addEventListener('click',replay);
const world=createWorld($('adventureWorld'),{
  onReady(){
    ready=true;$('engineStatus').textContent='';$('worldName').disabled=false;
    document.querySelectorAll('[data-module]').forEach(button=>{button.disabled=false;});world.reset(20,startingWorld());world.quiet(false);world.setPaused(false);
  },
  onBiome(biome){$('worldName').innerHTML=illustration(biome.icon)+`<span class="world-name-label">${biome.name}</span><span class="world-chevron" aria-hidden="true">⌄</span>`;$('worldName').setAttribute('aria-label','Choisir un monde. Monde actuel : '+biome.name);$('adventureWorld').setAttribute('aria-label','Paillette · '+biome.name);},
  onGag(kind){
    const returning=session?.phase==='returning';
    const messages={prout:'Prout arc-en-ciel ! Paillette a fait une petite surprise !',rainbow:'Tout en haut de l’arc-en-ciel ! Paillette grimpe vers les nuages.',boing:'Boïng ! Les nuages font un trampoline !',hat:'Abracadabra ! Un chapeau magique !',butterfly:'Oh ! Un papillon chatouille la corne de Paillette !',crown:'Une couronne de fleurs ! Paillette est la reine de la forêt.',splash:'Plouf ! Une petite vague chatouille les sabots !',bubble:'Une bulle géante ! Paillette flotte tout doucement.',moonhop:'Youhou ! Sur la Lune, Paillette fait des bonds de géante !'};
    $('adventureWalking').textContent=returning?(session.returnIndex%10===5?'Une petite glissade ! Retour au refuge, tes cinq cristaux sont protégés.':'Une petite glissade ! On repart du début de ce monde.'):(messages[kind]||'Paillette avance !');
    if(kind==='prout')sfx.prout();else if(kind==='rainbow'||kind==='return')sfx.slip();else if(kind==='boing')sfx.boing();else if(['hat','butterfly','crown'].includes(kind))sfx.sparkle();else if(['moonhop','bubble','splash'].includes(kind))sfx.boing();
  },
  onError(message){$('engineStatus').textContent=message;$('legacyFallback').hidden=false;}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopAudio();if(session&&session.phase!=='finished')pause();}});
window.addEventListener('pagehide',event=>{cleanUp();if(!event.persisted){voice.destroy();world.destroy();}});
window.addEventListener('pageshow',event=>{if(event.persisted) menu();});
if(location.search.includes('debug')) window.__adventure={
  state:()=>({ready,paused,mode,level,promptKey:mode==='words'||sentenceActivity(mode)?session?.current?.target.audioKey:session?.current?'L:'+session.current.target.g:null,index:session?.index,total:session?.questions.length,phase:session?.phase,targetId:session?.current?.target.id,score:session?.score,sentenceWords:sentenceActivity(mode)?session?.current?.target.words:null,selected:session?.selected?[...session.selected]:null,checkpoint:session?.returnIndex,startWorld,mastery:mastery.snapshot(),world:world.state()})
};
