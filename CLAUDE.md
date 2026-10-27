# La Licorne des Sons — notes for Claude Code

French reading game for a ~5-year-old girl: Paillette the unicorn crosses 7 worlds in 20 steps; each step the voice says a
letter/sound and the child picks one of 3 cards. Static site (no build), native ES modules, deployed on GitHub Pages /
Cloudflare Pages. The owner speaks French; all game text and voice are in French. README.md documents the structure.

## Commands
- `npm run dev` — local server on :8080 (modules don't work from file://)
- `npm run check` — data, audio coverage and card rules (must pass before every commit)
- `npm run lint` — ESLint no-undef etc.
- `python3 tools/voice/build_voice.py [--list|--redo KEYS|--prune|--no-verify]` — generate missing voice clips
- Open the game with `?debug` → `window.__game.right()` / `window.__game.step()` for automated tests.
- On the owner's Mac, Anaconda's git segfaults on push: run `conda deactivate` or use `/usr/bin/git`.

## Hard-won rules (do not regress)
1. **Never use the device's speech synthesis (Web Speech API).** It read French text with English voices and was unreliable
   on iOS. Every spoken line is a pre-recorded MP3 in `audio/`, referenced by key in `audio/manifest.json`.
   Phrases are written in code as `N("…")` (narrator) / `U("…")` (Paillette, pitched up); `tools/voice/build_voice.py`
   and `tools/check.mjs` find them by regex, so keep them as literal strings with double or single quotes,
   and don't write `N("…")` in comments.
2. **Letters are always spoken inside a full sentence** ("Trouve la lettre, M !", "Comme dans, moto !"). The TTS mangles
   isolated sounds (it produced "zo" for "o", "rême" for "M"). Keep the comma pause before the letter/word, otherwise
   "la lettre a" merges into "la lettra". Vowels = the sound; consonants = the letter NAME (èm, pé); consonant digraphs
   (ch, ph, qu, gn, ill) are spelled. "Trouve le son, an" renders badly → "Cherche bien le son, an".
3. **Every new clip must be checked by speech recognition** (build_voice.py does this; lines marked "⚠ à écouter" need a
   human listen or `--redo`). Words that failed repeatedly were removed (jupe, kiwi, cent). The voice is
   piper `fr_FR-siwis-medium` (the *newer* version that supports nasal vowels — the old 2023 "fr-siwis" drops them).
4. **Cards must be clickable immediately**; audio is fire-and-forget and never blocks the UI (`say()` resolves after each
   clip's duration even if playback fails). Web Audio is unlocked on the first tap (iOS).
5. **Keep rendering light.** Heavy SVG filters (feDiffuseLighting/feSpecularLighting, big blurs) on the 3800px world froze
   phones; they were removed. Test changes at 390×844 with touch emulation.
6. **Card rules** (enforced by `npm run check`): never two "e"-family cards (e, é, è, eu, en, eau); an "e" card is always
   shown with two non-e vowels; never two cards with the same pronounced sound (`p` field, e.g. an/en, o/au/eau, c/k/qu);
   a wrong option is never a grapheme or sound contained in the target word.
7. A mistake sends Paillette back to the start of the current world (`WORLD_STARTS`), with a banana-slip animation.
8. Cards show both cases ("M m"). Each sound has ≥4 words; the game rotates words using `licorne.seen.v1` in localStorage.

## Owner's wishes so far
Cute, funny, "Pixar-like" look (within the performance limits above), unicorn theme, French voice from France,
20 steps, many words so it doesn't repeat, simple and reliable above all.
