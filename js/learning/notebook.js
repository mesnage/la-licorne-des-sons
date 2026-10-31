import { SKILLS, skillStatus } from './mastery.js';
import { WORDS } from '../data/words.js';
export function initNotebook({mastery,words}){
  const $=id=>document.getElementById(id);
  const dialog=$('progressNotebook'),scope=$('progressScope');
  const entries=()=>scope.value==='words'?WORDS.map(w=>({id:w.id,label:w.text,scope:'words'})):[...SKILLS.filter(s=>scope.value==='all'||s.scope===scope.value),...(scope.value==='all'?WORDS.map(w=>({id:w.id,label:w.text,scope:'words'})):[])];
  function render(){
    const stats=mastery.snapshot(),wordStats=words.snapshot(),box=$('progressSkills');box.replaceChildren();
    const list=entries();let recognized=0,practiced=0;
    for(const skill of list){
      const s=skill.scope==='words'?wordStats[skill.id]:stats[skill.id];
      const status=skill.scope==='words'?(!s?.completed&&!s?.misses?'À découvrir':s?.streak>=3?'Bien reconnu':s?.misses&&!s.streak?'À revoir':'En progrès'):skillStatus(s);
      if(status==='Bien reconnu')recognized++;if(status!=='À découvrir')practiced++;
      const row=document.createElement('li');row.dataset.skillId=skill.id;
      const label=document.createElement('strong');label.textContent=skill.label;
      const tag=document.createElement('span');tag.textContent=status;tag.className='skill-status status-'+['À découvrir','À revoir','En progrès','Bien reconnu'].indexOf(status);
      row.append(label,tag);box.appendChild(row);
    }
    $('progressSummary').textContent=`${practiced} travaillés · ${recognized} bien reconnus · ${list.length} au total`;
    $('progressResetConfirm').hidden=true;dialog.classList.remove('confirming');
    $('progressPrivacy').textContent=mastery.persistent&&words.persistent?'Ces progrès sont enregistrés uniquement sur cet appareil.':'La sauvegarde est indisponible. Ces progrès restent pour cette visite.';
  }
  $('progressOpen').addEventListener('click',()=>{render();$('progressResetStatus').textContent='';dialog.showModal();});
  $('progressClose').addEventListener('click',()=>dialog.close());scope.addEventListener('change',render);
  $('progressReset').addEventListener('click',()=>{
    $('progressResetConfirm').hidden=false;dialog.classList.add('confirming');
    $('progressResetQuestion').textContent=`Effacer ${scope.options[scope.selectedIndex].text.toLowerCase()} ? Les cadeaux et les mondes terminés sont conservés.`;
    $('progressResetCancel').focus();
  });
  $('progressResetCancel').addEventListener('click',()=>{$('progressResetConfirm').hidden=true;dialog.classList.remove('confirming');$('progressReset').focus();});
  $('progressResetDo').addEventListener('click',()=>{
    if(scope.value==='words')words.reset();else mastery.reset(scope.value);
    if(scope.value==='all')words.reset();
    render();$('progressResetStatus').textContent='Les progrès sélectionnés ont été réinitialisés.';$('progressReset').focus();
  });
}
