/* Application installable : enregistre le service worker (sw.js) qui garde le jeu et les voix déjà entendues
   sur l'appareil, et propose l'installation dans « Aide aux parents ».
   Les tests automatiques (navigator.webdriver) restent sans cache, sauf avec ?pwa=1. */
(() => {
  if (window.top !== window) return;

  /* Le bouton d'installation. Chrome, Edge et Android ouvrent leur propre fenêtre d'installation ;
     iPhone et iPad ne le permettent pas à un site : le bouton y montre les deux gestes à faire. */
  let offer = null;
  const installed = () => window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;
  const apple = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  function steps() {
    if (apple()) return 'Touche le bouton Partager (le carré avec une flèche vers le haut), puis « Sur l’écran d’accueil ». Paillette apparaît alors parmi tes applications.';
    return 'Ouvre le menu du navigateur, puis choisis « Installer » ou « Ajouter à l’écran d’accueil ».';
  }
  function setupInstall() {
    const box = document.getElementById('installApp'), button = document.getElementById('installButton'), text = document.getElementById('installSteps');
    if (!box || !button || !text) return;
    const show = () => { box.hidden = installed(); };
    show();
    button.addEventListener('click', async () => {
      if (offer) {
        const asked = offer; offer = null;
        try { asked.prompt(); await asked.userChoice; } catch (error) { /* fenêtre refusée : on montre les gestes */ }
        if (installed()) { show(); return; }
      }
      text.textContent = steps(); text.hidden = false;
      try { text.scrollIntoView({ block: 'nearest' }); } catch (error) { /* ancien navigateur */ }
    });
    window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); offer = event; text.hidden = true; show(); });
    window.addEventListener('appinstalled', () => { offer = null; box.hidden = true; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupInstall, { once: true });
  else setupInstall();

  if (!('serviceWorker' in navigator)) return;
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  if (location.protocol !== 'https:' && !local) return;
  if (navigator.webdriver && !/[?&]pwa=1(&|$)/.test(location.search)) return;
  window.addEventListener('load', () => {
    const status = document.createElement('p');status.setAttribute('role','status');
    status.textContent='Préparation du jeu hors connexion… Garde cette page ouverte.';
    const retry=document.createElement('button');retry.textContent='Réessayer le téléchargement';retry.hidden=true;
    (document.querySelector('.adventure-help') || document.body).append(status,retry);
    const register=()=>{retry.hidden=true;navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(reg=>{
      const watch=worker=>{if(!worker)return;const changed=()=>{
        if(worker.state==='activated')status.textContent='Jeu prêt hors connexion, avec toutes les voix.';
        if(worker.state==='redundant'){status.textContent='Téléchargement interrompu. Reconnecte-toi puis réessaie.';retry.hidden=false;}
      };worker.addEventListener('statechange',changed);changed();};
      if(reg.installing)watch(reg.installing);else if(reg.active)status.textContent='Jeu prêt hors connexion, avec toutes les voix.';
      reg.addEventListener('updatefound',()=>watch(reg.installing));
    }).catch(()=>{status.textContent='Téléchargement indisponible. Réessaie avec une connexion.';retry.hidden=false;});};
    retry.addEventListener('click',register);
    navigator.serviceWorker.addEventListener('message',event=>{if(event.data?.type==='licorne:offline')status.textContent=`Téléchargement hors connexion : ${Math.round(event.data.done/event.data.total*100)} %`;});
    register();
    /* Après le démarrage du jeu : revalidation discrète des fichiers gardés (au plus une fois par jour). */
    setTimeout(() => { if (navigator.onLine) navigator.serviceWorker.controller?.postMessage('licorne:refresh'); }, 15000);
    try { navigator.storage?.persist?.().catch(() => {}); } catch (error) { /* stockage non persistant : sans gravité */ }
  }, { once: true });
})();
