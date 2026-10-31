/* Full word prompts use the same recorded female narrator and audio engine as letters/sounds. */
export function createWordVoice(playback,status){
  let token=0;
  const unavailable='Le son n’a pas pu se charger. Vérifie le volume et la connexion, puis touche Réécouter.';
  function stop(){token++;playback.hush();}
  async function speak(word){
    stop();const my=token;status('');playback.unlock();
    try{
      await playback.ready;
      if(my!==token)return;
      const key=word.audioKey||'W:'+word.id,clip=await playback.loadClip(key);
      if(my!==token)return;
      if(!clip){status(unavailable);return;}
      await playback.say([key],true);
    }catch(e){if(my===token)status(unavailable);}
  }
  return {speak,stop,destroy:stop};
}
