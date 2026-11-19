import('./app.js?v=perf-19').catch(() => {
  document.getElementById('legacyFallback').hidden=false;
  document.getElementById('engineStatus').textContent='Le décor animé n’a pas pu démarrer. Recharge la page ou ouvre les activités classiques avec le lien de secours.';
});
