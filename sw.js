/* La Licorne des Sons — service worker de l'application installable.
   Code et pages : réseau d'abord (toujours la dernière version en ligne), copie locale hors ligne.
   Voix : gardées sur l'appareil à la première écoute. Aucune synthèse vocale, aucun contenu modifié. */
importScripts('js/pwa-files.js');

const SHELL = 'licorne-shell-v2-' + self.LICORNE_PWA.version;
const MEDIA = 'licorne-media-v1';
const NETWORK_WAIT = 4000;
const scope = self.registration.scope;
const { version = 'dev', files = [] } = self.LICORNE_PWA || {};
const STAMP = scope + '__licorne-refreshed';

/* Une seule entrée par fichier : les suffixes ?v=… et les adresses sans .html pointent vers la même copie. */
function keyFor(url) {
  const u = new URL(url);
  let path = u.pathname;
  if (path.endsWith('/')) path += 'index.html';
  else if (!/\.[a-z0-9]+$/i.test(path)) path += '.html';
  return u.origin + path;
}
const isMedia = path => /\.(mp3|webp|jpe?g|png|svg|woff2?)$/i.test(path);
const isFrozen = path => /[-/][0-9a-f]{10,}\.mp3$/i.test(path);

/* Une réponse issue d'une redirection ne peut pas servir une navigation : on la recopie. */
async function storable(response) {
  if (!response.redirected) return response;
  return new Response(await response.blob(), { status: response.status, statusText: response.statusText, headers: response.headers });
}
async function keep(cacheName, key, response) {
  if (!response || response.status !== 200 || response.type === 'opaque') return;
  try {
    const cache = await caches.open(cacheName);
    await cache.put(key, await storable(response));
  } catch (error) { /* stockage plein ou refusé : le jeu continue en ligne */ }
}

async function precache(reuse = false) {
  const cache = await caches.open(SHELL);
  const pending = files.map(file => new URL(file, scope).href);
  for (let i = 0; i < pending.length; i += 8) {
    await Promise.all(pending.slice(i, i + 8).map(async url => {
      if (reuse && await cache.match(keyFor(url))) return;
      const response = await fetch(url, { cache: 'no-cache' });
      if (response.status !== 200) throw new Error('Téléchargement incomplet');
      await cache.put(keyFor(url), await storable(response));
    }));
    for (const client of await self.clients.matchAll({includeUncontrolled:true})) client.postMessage({type:'licorne:offline',done:Math.min(i+8,pending.length),total:pending.length});
  }
}
async function prune() {
  const wanted = new Set(files.map(file => keyFor(new URL(file, scope).href)));
  const cache = await caches.open(SHELL);
  for (const request of await cache.keys()) if (!wanted.has(request.url)) await cache.delete(request);
  for (const name of await caches.keys()) if (name.startsWith('licorne-') && name !== SHELL && name !== MEDIA) await caches.delete(name);
}

self.addEventListener('install', event => {
  event.waitUntil(precache(true).then(async () => {
    await (await caches.open(MEDIA)).put(STAMP, new Response(String(Date.now())));
    return self.skipWaiting();
  }));
});
self.addEventListener('activate', event => { event.waitUntil(prune().then(() => self.clients.claim())); });

async function networkFirst(request, key, event) {
  const cached = caches.match(key);
  let timer;
  const online = fetch(request).then(response => {
    if (response.status === 200) event.waitUntil(keep(SHELL, key, response.clone()));
    return response;
  });
  online.catch(() => {});
  const slow = new Promise(resolve => { timer = setTimeout(async () => resolve(await cached), NETWORK_WAIT); });
  try {
    const first = await Promise.race([online, slow]);
    if (first) return first;
    return await online;
  } catch (error) {
    const copy = await cached;
    if (copy) return copy;
    throw error;
  } finally { clearTimeout(timer); }
}
async function cacheFirst(request, key, refresh, event) {
  const copy = await caches.match(key);
  if (copy) {
    if (refresh) event.waitUntil(fetch(request).then(response => keep(MEDIA, key, response)).catch(() => {}));
    return copy;
  }
  const response = await fetch(request);
  if (response.status === 200) event.waitUntil(keep(MEDIA, key, response.clone()));
  return response;
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || request.headers.has('range')) return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(scope)) return;
  const key = keyFor(url.href);
  const path = new URL(key).pathname;
  if (isMedia(path)) event.respondWith(cacheFirst(request, key, !isFrozen(path), event));
  else event.respondWith(networkFirst(request, key, event));
});

/* Une fois par jour au plus, la page demande de revalider les fichiers gardés (réponses 304 si rien n'a changé),
   pour que les activités pas encore rouvertes ne restent pas sur une ancienne version hors ligne. */
async function refresh() {
  const media = await caches.open(MEDIA);
  const last = Number(await (await media.match(STAMP))?.text() || 0);
  if (Date.now() - last < 20 * 3600 * 1000) return false;
  await precache();
  await media.put(STAMP, new Response(String(Date.now())));
  return true;
}

self.addEventListener('message', event => {
  if (event.data === 'licorne:refresh') event.waitUntil(refresh().catch(() => {}));
  if (event.data === 'licorne:version') event.source?.postMessage({ type: 'licorne:version', version, files: files.length });
});
