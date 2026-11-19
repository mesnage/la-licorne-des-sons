#!/usr/bin/env node
/* Liste des fichiers que l'application installable garde hors ligne (js/pwa-files.js, lu par sw.js).
   node tools/pwa-files.mjs          → réécrit la liste
   node tools/pwa-files.mjs --check  → échoue si un fichier a été ajouté ou retiré sans régénérer la liste
   Les voix (MP3) n'y figurent pas : elles sont gardées à la première écoute. */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const OUTPUT = 'js/pwa-files.js';
const PAGES = ['index.html', 'curriculum.html', 'curriculum-play.html', 'meadow-preview.html', 'classic.html', 'prototype.html'];
const SKIP_AUDIO_JSON = new Set(['short-robin-provenance.json']);

function walk(dir, keep) {
  const out = [];
  for (const name of readdirSync(join(ROOT, dir)).sort()) {
    if (name.startsWith('.')) continue;
    const path = `${dir}/${name}`;
    if (statSync(join(ROOT, path)).isDirectory()) out.push(...walk(path, keep));
    else if (keep(path)) out.push(path);
  }
  return out;
}

export function collectFiles() {
  const files = new Set(PAGES.filter(page => existsSync(join(ROOT, page))));
  ['favicon.svg', 'manifest.webmanifest', 'vendor/phaser/phaser.esm.min.js'].forEach(file => files.add(file));
  walk('css', path => path.endsWith('.css')).forEach(file => files.add(file));
  walk('js', path => /\.(js|json)$/.test(path) && path !== OUTPUT).forEach(file => files.add(file));
  walk('assets', path => /\.(webp|jpe?g|png|svg|woff2?)$/i.test(path)).forEach(file => files.add(file));
  walk('audio', path => path.endsWith('.mp3') || (dirname(path) === 'audio' && path.endsWith('.json') && !SKIP_AUDIO_JSON.has(path.slice(6)))).forEach(file => files.add(file));
  /* Images nommées en toutes lettres dans le code : les autres sont gardées quand elles s'affichent. */
  const sources = [...files].filter(file => /\.(html|css|js)$/.test(file));
  for (const source of sources) {
    const text = readFileSync(join(ROOT, source), 'utf8');
    for (const [asset] of text.matchAll(/assets\/[A-Za-z0-9_.\/-]+\.(?:webp|jpe?g|png|svg)/g)) {
      if (existsSync(join(ROOT, asset))) files.add(asset);
    }
  }
  return [...files].filter(file => existsSync(join(ROOT, file))).sort();
}

export function render(files) {
  const version = createHash('sha256').update(files.map(file => file + ':' + createHash('sha256').update(readFileSync(join(ROOT,file))).digest('hex')).join('\n')).digest('hex').slice(0, 12);
  return `/* Fichier généré par tools/pwa-files.mjs — ne pas modifier à la main. */\nself.LICORNE_PWA = ${JSON.stringify({ version, files }, null, 1)};\n`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const wanted = render(collectFiles());
  const target = join(ROOT, OUTPUT);
  if (process.argv.includes('--check')) {
    if (!existsSync(target) || readFileSync(target, 'utf8') !== wanted) {
      console.error(`${relative(process.cwd(), target)} n'est plus à jour : lancer « npm run pwa ».`);
      process.exit(1);
    }
    console.log('Liste hors ligne à jour.');
  } else {
    writeFileSync(target, wanted);
    console.log(`${OUTPUT} : ${collectFiles().length} fichiers.`);
  }
}
