# La Licorne des Sons — notes for Claude Code

French reading game for a ~5-year-old girl: Paillette the unicorn crosses 7 worlds in 20 steps; each step the voice says a
letter/sound and the child picks one of 3 cards. Static site (no build), native ES modules, deployed on GitHub Pages /
Cloudflare Pages. The owner speaks French; all game text and voice are in French. README.md documents the structure.

## Commands
- `npm run dev` — local server on :8080 (modules don't work from file://)
- `npm run check` — data, audio coverage and card rules (must pass before every commit)
- `npm run lint` — ESLint no-undef etc.
- `npm test` — reward accounting and word-game selection/scoring/progression/voice tests.
- `python3 tools/test-words-browser.py` — optional word-game integration tests with a local server and Python Playwright.
- `python3 tools/voice/build_voice.py [--list|--redo KEYS|--prune|--no-verify]` — generate missing voice clips
- Open the game with `?debug` → `window.__game.right()` / `window.__game.step()` for automated tests.
- On the owner's Mac, Anaconda's git segfaults on push: run `conda deactivate` or use `/usr/bin/git`.

## Hard-won rules (do not regress)
1. **For the five original phonics modes, never use the device's speech synthesis (Web Speech API).** It read French text with English voices and was unreliable
   on iOS. Every spoken line is a pre-recorded MP3 in `audio/`, referenced by key in `audio/manifest.json`.
   Phrases are written in code as `N("…")` (narrator) / `U("…")` (Paillette, pitched up); `tools/voice/build_voice.py`
   and `tools/check.mjs` find them by regex, so keep them as literal strings with double or single quotes,
   and don't write `N("…")` in comments.
2. **Letters are always spoken inside a full sentence** ("Trouve la lettre, M !", "Comme dans, moto !"). The TTS mangles
   isolated sounds (it produced "zo" for "o", "rême" for "M"). Keep the comma pause before the letter/word, otherwise
   "la lettre a" merges into "la lettra". Vowels = the sound; consonants = the letter NAME (èm, pé); complex graphemes
   (ch, ph, qu, gn, ill, ail, eil, euil, ouil, oin, ien, ui, tion) are spelled. "Trouve le son, an" renders badly → "Cherche bien le son, an".
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
7. Main adventure: each world has ten crystals and a refuge at five. Mistakes return to that refuge or the current
   world start. Classic fallback retains its previous WORLD_STARTS/banana behavior.
8. Cards show both cases ("M m"). Each sound has ≥4 words; the game rotates words using `licorne.seen.v1` in localStorage.

## Owner's wishes so far
Cute, funny, "Pixar-like" look (within the performance limits above), unicorn theme, French voice from France,
20 steps, many words so it doesn't repeat, simple and reliable above all.

## Trouve le mot ! (separate whole-word activity)
The user explicitly requested French synthetic speech with future MP3 replacement for this new module only.
`js/words/voice.js` uses a French-only voice at rate 0.8, cancels previous playback, prefers optional full-prompt MP3s,
and never reveals the target in a failure message. Keep the original phonics audio rules above intact.
Vocabulary and levels: `js/data/words.js`. Homophones added later must share `soundGroup`.
The word module has ten questions and now uses the same adventure checkpoint rules as the phonics modules.
Progress is local (`licorne.words.v1`); missed words are weighted more heavily in later sessions.
Scoped styles: `css/words.css`. Do not use the original `.lvl` class for new level buttons: the phonics initializer binds it.
Automated browser speech is mocked; listen on a real French-voice device before release.

Every completed game earns one spin: the five 20-step phonics modes and all three 10-question word levels.
The wheel has six equal segments (candies, chocolate, story, three unicorn animations). No savings or money prize.
Legacy five-prize records preserve pending spins and non-money counts; future saves omit the balance.

Phonics vocabulary: 58 graphemes and 495 unique illustrated words; 641 recorded prompts, including all alphabet
consonants plus Y, CH and Ç. The word module reuses the SAME #scene through js/words/journey.js, mapping ten
questions onto every second original stop. Restore the stage and show all twenty gems when leaving the module;
do not mount a second world with duplicate SVG gradient IDs. Words retain retry without losing crystals.

## Main Phaser adventure
`index.html` now serves the Phaser 4.2.1 adventure for all modules on prototype/immersive-worlds. `prototype.html`
is a compatibility redirect; `classic.html` holds the old interface for engine-failure recovery only.
The seven themes change every ten crystals, with a protected refuge at five. Mistakes roll back only to that refuge
or the current world's start. Completed-world variety is persisted in licorne.adventure.v1 across modules.
AdventureSession tracks unique question credit, so replaying lost crystals cannot inflate mastery or reward spins.
Twenty-crystal phonics sessions cover two worlds; ten-word sessions cover one. Gags rotate through colored prouts,
rainbow slides, trampoline bounces and a magic hat. Answers use enlarged responsive typography.
Engine license/checksum provenance remains under vendor/phaser; no runtime CDN/build dependency.
Run tools/test-prototype-browser.py and tools/test-checkpoints-browser.py with the local server for the main game.
The existing words/rewards browser scripts target classic.html. Real Safari/iPad listening/performance need device review.
