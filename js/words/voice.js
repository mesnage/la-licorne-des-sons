/* French-only speech for this activity; recorded full prompts take priority.
   The original phonics game's pre-recorded audio is deliberately unchanged. */
export function frenchVoice(voices){
  const french = voices.filter(v => /^fr(?:[-_]|$)/i.test(v.lang));
  return french.find(v => /^fr[-_]FR$/i.test(v.lang) && v.localService) ||
    french.find(v => /^fr[-_]FR$/i.test(v.lang)) || french[0] || null;
}
export function createWordVoice(host, status){
  let token = 0, clip = null, utterance = null, watchdog = null, needsVoice = false;
  const synth = host.speechSynthesis;
  const unavailable = 'Le son français n’est pas disponible. Demande à un adulte d’activer une voix française sur cet appareil, puis touche Réécouter.';
  function stop(){
    token++;
    if(watchdog) host.clearTimeout(watchdog);
    watchdog = null;
    if(clip){ clip.onended = clip.onerror = null; clip.pause(); clip = null; }
    if(utterance){ utterance.onend = utterance.onerror = null; }
    utterance = null;
    if(synth) synth.cancel();
  }
  function speak(word){
    stop();
    const my = token;
    needsVoice = false; status('');
    const failed = () => {
      if(my === token){
        host.clearTimeout(watchdog); watchdog = null; needsVoice = true; status(unavailable);
      }
    };
    function synthetic(){
      if(my !== token) return;
      const voice = synth && frenchVoice(synth.getVoices());
      if(!voice || !host.SpeechSynthesisUtterance){ failed(); return; }
      utterance = new host.SpeechSynthesisUtterance(`Trouve le mot… ${word.speech || word.text} !`);
      utterance.voice = voice; utterance.lang = voice.lang;
      utterance.rate = .8; utterance.pitch = 1;
      utterance.onerror = failed;
      utterance.onend = () => { if(my === token){ host.clearTimeout(watchdog); watchdog = null; } };
      // Some mobile engines fail silently. Never reveal the written answer as a fallback.
      watchdog = host.setTimeout(failed, 12000);
      try { synth.speak(utterance); } catch(e){ failed(); }
    }
    if(word.audio){
      try {
        clip = new host.Audio(word.audio);
        clip.playbackRate = .9;
        clip.onerror = () => {
          if(my !== token) return;
          clip.pause(); clip = null; synthetic();
        };
        const playing = clip.play();
        if(playing && playing.catch) playing.catch(() => {
          if(my === token && clip){ clip.onerror(); }
        });
      } catch(e){ synthetic(); }
    } else synthetic();
  }
  function voicesChanged(){
    if(needsVoice && frenchVoice(synth.getVoices())) status('La voix française est prête. Touche Réécouter.');
  }
  if(synth) synth.addEventListener('voiceschanged', voicesChanged);
  return { speak, stop, destroy(){ stop(); if(synth) synth.removeEventListener('voiceschanged', voicesChanged); } };
}
