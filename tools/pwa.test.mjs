/* Application installable : liste hors ligne à jour, identité complète, pages reliées. */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { collectFiles, OUTPUT, render, ROOT } from './pwa-files.mjs';

const read = file => readFileSync(join(ROOT, file), 'utf8');
const files = collectFiles();

assert.equal(read(OUTPUT), render(files), 'js/pwa-files.js doit être régénéré : npm run pwa');
for (const needed of ['index.html', 'curriculum.html', 'curriculum-play.html', 'meadow-preview.html', 'classic.html',
  'js/audio.js', 'js/prototype/boot.js', 'js/meadow/preview.js', 'audio/manifest.json', 'vendor/phaser/phaser.esm.min.js']) {
  assert.ok(files.includes(needed), `${needed} doit être gardé hors ligne`);
}
assert.ok(files.some(file => file.endsWith('.mp3')), 'les voix sont gardées à la première écoute, pas à l’installation');
assert.ok(!files.some(file => file.startsWith('tools/')), 'les outils ne sont pas publiés');

const manifest = JSON.parse(read('manifest.webmanifest'));
assert.equal(manifest.lang, 'fr');
assert.equal(manifest.display, 'standalone');
assert.ok(manifest.start_url.startsWith('./') && manifest.scope === './', 'adresses relatives : GitHub Pages et Cloudflare');
for (const icon of manifest.icons) assert.ok(existsSync(join(ROOT, icon.src)), `icône absente : ${icon.src}`);
assert.ok(manifest.icons.some(icon => icon.sizes === '512x512' && icon.purpose === 'maskable'));
assert.ok(manifest.icons.some(icon => icon.sizes === '192x192'));

for (const page of ['index.html', 'curriculum.html', 'curriculum-play.html', 'classic.html']) {
  const html = read(page);
  assert.match(html, /<link rel="manifest" href="manifest\.webmanifest">/, `${page} : manifeste`);
  assert.match(html, /<link rel="apple-touch-icon" href="assets\/icons\/apple-touch-icon\.png">/, `${page} : icône iOS`);
  assert.match(html, /<script src="js\/pwa\.js" defer><\/script>/, `${page} : enregistrement`);
}

const worker = read('sw.js');
assert.match(worker, /importScripts\('js\/pwa-files\.js'\)/);
assert.doesNotMatch(worker, /speechSynthesis|SpeechSynthesisUtterance/, 'aucune synthèse vocale');
assert.doesNotMatch(read('js/pwa.js'), /speechSynthesis/);
console.log(`pwa: ${files.length} fichiers hors ligne, identité et pages vérifiées`);
