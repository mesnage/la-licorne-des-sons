/** One type size per question, based on actual glyph widths rather than character counts. */
export function sharedChoiceSize(metrics,maxSize){
  return Math.floor(Math.min(maxSize,...metrics.map(({width,units})=>width/Math.max(.01,units)))*10)/10;
}
export function fitChoiceGroup(root){
  if(!root)return ()=>{};
  const ctx=document.createElement('canvas').getContext('2d');
  let frame=0,buttons=[];
  const schedule=()=>{if(!frame)frame=window.requestAnimationFrame(fit);};
  const resize=new window.ResizeObserver(schedule);
  function collect(){
    resize.disconnect();resize.observe(root);
    buttons=[...root.querySelectorAll('.adventure-answer,.pilot-answer-pair > .pilot-button,.pilot-answer-card > .pilot-button,.pilot-word-tiles > .pilot-button')];
    root.classList.toggle('short-word-choices',root.classList.contains('words')&&!root.classList.contains('sentence-choices')&&buttons.length>0&&buttons.length<=4&&buttons.every(b=>b.textContent.trim().length<=8));
    buttons.forEach(b=>resize.observe(b));schedule();
  }
  function fit(){
    frame=0;
    const visible=buttons.filter(b=>b.getBoundingClientRect().width>0);
    if(!visible.length||visible.every(b=>b.disabled))return;
    const road=visible.every(b=>b.hasAttribute('data-road-door'));
    const max=road?46:root.querySelector('.sentence-choices,.pilot-word-tiles')||root.classList.contains('sentence-choices')?24:32;
    const metrics=visible.map(b=>{
      const style=window.getComputedStyle(b),rect=b.getBoundingClientRect();
      const parts=[...b.childNodes].filter(n=>n.nodeType===3||['SPAN','SMALL'].includes(n.nodeName));
      let units=0,count=0;
      for(const part of parts){const text=part.textContent.trim();if(!text)continue;const small=part.nodeName==='SMALL',ratio=small?.72:1;
        ctx.font=`${style.fontWeight} ${100*ratio}px ${style.fontFamily}`;
        units+=ctx.measureText(text).width/100;count++;
      }
      return {units,width:Math.max(1,(b.offsetWidth||rect.width)-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight)-parseFloat(style.borderLeftWidth)-parseFloat(style.borderRightWidth)-Math.max(0,count-1)*(parseFloat(style.columnGap)||0)-6)};
    });
    const size=sharedChoiceSize(metrics,max)+'px';
    visible.forEach(b=>{if(b.style.getPropertyValue('--choice-font')!==size)b.style.setProperty('--choice-font',size);});
  }
  const mutations=new window.MutationObserver(collect);
  mutations.observe(root,{childList:true,subtree:true,characterData:true});collect();
  document.fonts?.ready.then(schedule);
  return ()=>{resize.disconnect();mutations.disconnect();window.cancelAnimationFrame(frame);};
}
