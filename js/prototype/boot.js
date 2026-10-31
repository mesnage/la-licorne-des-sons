import('./app.js').catch(() => {
  document.getElementById('engineStatus').textContent='Le décor animé n’a pas pu démarrer. Recharge la page ou ouvre les activités classiques avec le lien ci-dessus.';
});
