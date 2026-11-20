# La Licorne des Sons — notes for Claude Code

## Current voice and module policy (review 16)

The user wants one voice: Robin from ElevenLabs (`ZLsOpArVEayz7qulwa9E`). This supersedes the historical Piper/three-voice notes below. Do not generate new Piper clips for the playable game. `node tools/audit-voice.mjs --write` checks the active curriculum metadata/hashes and lists legacy short clips that still need source verification. A file named Robin is not, by itself, proof; pronunciation review is separate from provenance.

Graphics live under `js/meadow/`; curriculum and question selection live under `js/learning/`, `js/data/`, and the pure `js/prototype/model.js`. Door colours/proportions are in `crossroads-theme.js`. Keep scoring/storage/audio out of drawing modules. `js/random.js` supplies shared, injectable shuffling. Saved curriculum sessions carry `questionVersion`: old sessions retain their old schedule. `js/audio-cache.js` bounds decoded recording memory and shares pending loads. No new framework or build dependency is needed.

Use `npm run dev` for a local public-assets-only preview. It does not serve dotfiles, tooling or backups. The in-progress review is not a deployment.


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
The word activity uses the SAME recorded female French narrator as letters and sounds. `js/words/voice.js`
receives the shared audio engine and plays full `W:<word-id>` MP3 prompts; it never uses browser/device speech.
Generate missing prompts with tools/voice/build_voice.py. Keep prompt cancellation and generic audio-failure hints.
Vocabulary and levels: `js/data/words.js`. Homophones added later must share `soundGroup`.
The word module has ten questions and now uses the same adventure checkpoint rules as the phonics modules.
Progress is local (`licorne.words.v1`); missed words are weighted more heavily in later sessions.
Scoped styles: `css/words.css`. Do not use the original `.lvl` class for new level buttons: the phonics initializer binds it.
Browser checks decode the real recordings. Listen on real iPad/Safari before release.

Every completed game earns one spin: the five 20-step phonics modes and all 10-question word/sentence/typo activities.
The wheel has six equal segments: chocolate twice, candies twice, ten minutes of TV once and one piggy-bank coin once. There is no in-app cash balance or withdrawal. The version-2 record under licorne.rewards.v1 keeps pending spins and new counts; old stories/unicorn wins stay separate in earlier so they are never relabeled as TV or coins. Original five-prize coin counts are retained, without restoring the old cash balance.

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
fixed rainbow climbs, trampoline bounces and a magic hat. Answers use enlarged responsive typography.
Engine license/checksum provenance remains under vendor/phaser; no runtime CDN/build dependency.
Run tools/test-prototype-browser.py and tools/test-checkpoints-browser.py with the local server for the main game.
The existing words/rewards browser scripts target classic.html. Real Safari/iPad listening/performance need device review.

Rainbow geometry and bird trajectories live in js/prototype/travel.js. The bridge stays in world coordinates;
hero feet and crystals use walkingPoint so they follow the same surface. Keep camera framing clear of the HUD
on portrait phones. Birds, animal companions and ambient scenery keep moving while questions are visible; explicit pause stops the scene, and reduced motion keeps them still.
The pause dialog freezes the Phaser scene and gates pending answer delays; leaving cancels the old session token.
Run tools/test-rainbow-browser.py for real climbing, pause/resume, rotation and repeated scene-reset checks.

## Direct activity menu and shared narrator

The main menu contains exactly four chapter tiles in a 2×2 grid: Les lettres, Les sons, Les mots, Les phrases. CHAPTERS in js/prototype/model.js assigns the thirteen MENU_ITEMS once each (2/3/3/5). Selecting a chapter reveals its activities; leaving a game returns to that chapter and Les chapitres returns to the four-tile home. The child's menu has no progress notebook; since 20 Nov the owner wants a parents-only progress view inside « Aide aux parents » (see below).
Phoneme activities/data/audio and their generators have been removed at the owner's request. Existing local letter
and word practice stays in the background for revision; gift balances/spins and world history remain intact.
Both main and classic word activities use `W:` prompts through the shared recorded audio engine. New word prompts
use Piper fr_FR-siwis-medium, pitch 1.0, rate 0.85, and the existing French ASR verification. No browser TTS fallback.
Scenery and original UI icons remain in js/prototype/scenery.js and js/illustrations.js; keep SVG rendering light.
Run tools/test-menu-browser.py for direct selection, real audio decoding, replay cancellation and failure hints.

## Retina rendering, habitats and animal companions

Phaser 4 ignores the old game-config resolution option. js/prototype/rendering.js computes a real backing buffer
(up to DPR 2, about six million pixels) with CSS scaling. Keep Scale.NONE + explicit resize, the camera's density
factor, and ResizeObserver/window-resize cleanup together. Do not reintroduce a CSS-sized low-resolution canvas.
Sprites rasterize at 2× density with explicit display sizes; panoramas stay bounded at 2400×933 to limit memory.
Native filled pathRibbon geometry avoids translucent wide-stroke seams. Keep foreground foliage clear of Paillette.

Seven stable world IDs now represent meadow, forest, tropical jungle, beach, ice, clouds and moon. Saved numeric world
progress keeps cycling across those IDs. Six to eight animal companions per scene come from animals.js; new props and habitat
art live in habitats.js. Animals and particles continue during questions, pause freezes the entire scene, and reduced
motion skips travel gags. Gag 6 varies with habitat; the old prout/rainbow/boing/hat schedule stays intact. Clear all
props and effects on completion, return, reset and exit. Run tools/test-variety-browser.py alongside the existing
main/checkpoint/menu/rainbow suites. No educational content, audio or reward accounting should change for artwork.

The world-name button opens the seven-world picker. Habitat changes preserve the current question, crystals, checkpoints and reward accounting. The preferred starting habitat is saved separately as licorne.world-choice.v1; completion history stays in licorne.adventure.v1. Disable habitat changes during travel/answer feedback; the picker pauses the scene and resumes the existing question on close. Run tools/test-world-picker-browser.py for selection, persistence, ambient motion and pause/reduced-motion checks.

## Living world graphics

`wildlife.js` owns cached layered parts and grounded gait/turn poses for rabbit, fox, turtle, hedgehog, deer and cow. Meadow/forest have eight companions; other habitats have six. Keep foot targets in world space, sole rotation level and opaque turn poses mutually exclusive. Never restore whole-body squeeze/dissolve turns. `atmosphere.js` owns shared spatial wind, fixed-trunk/moving-canopy trees, individual sprigs, articulated flying birds, drifting leaves and restrained ground light. All ambient motion follows the scene clock and must freeze on pause/picker and stay static for reduced motion.

`world.js` reuses matching initial scenery and culls off-screen containers/joint work. Avoid heavyweight SVG filters, new per-frame game-object allocation, and texture growth on reset. Keep the Retina buffer limit and buffer-before-CSS-zoom resize order. The independent iteration record is docs/graphics-upgrade-review.md; tools/graphics-lab.html is a development-only six-species live showcase. Run tools/test-living-world-browser.py and tools/test-world-picker-browser.py with the local server; `--browser-path` supports installed Chrome on macOS.


## Sentence activities

`js/data/sentences.js` defines 24 three-word and 24 five-word French sentences and four activity cards in Les phrases: visible model or listening only, at each length. `js/sentences/model.js` selects ten distinct sentences and guarantees genuinely shuffled, lowercase tiles without punctuation. `SentenceAdventureSession` in `js/prototype/model.js` accepts the next word by text, so duplicate written words are interchangeable, while used tile IDs cannot be reused. Partial answers never advance the world, score, mastery or rewards. Wrong words use the existing checkpoint rules; recover/next clears the assembly and unique credit protects replayed sentences.

`app.js` renders the visible model only for copying activities. Clear `sentenceTarget` for listening activities, including audio failure, and retain partial assembly across replay, pause and world selection. Complete sentences use full `S:<id>` MP3 recordings through the shared narrator, rate .85/pitch 1.0, generated and ASR-verified with `build_voice.py`. Never add device speech or text fallbacks that reveal hidden models. Local practice is namespaced by activity in `licorne.sentences.v1`; the existing word save stays separate. The classic fallback retains its original eight activities. Run `tools/test-sentences-browser.py` for all four completions, real audio decoding, checkpoint/reward accounting, pause/picker, hidden-model failure recovery and responsive layouts.


## Find the spelling mistake

`js/data/typos.js` curates three nonword misspellings for each of the 24 three-word sentences. `js/sentences/typos.js` builds ten questions with distinct sentences and balanced error positions. Keep sentence word order intact and change exactly one word. The `find-typo` tile appears in Les phrases after the four sentence-building activities. All three choices must look alike before feedback; the corrected sentence is revealed only after selecting the misspelled word. Narration reuses each sentence's verified `S:` recording and never speaks the misspelling. Typo practice lives separately in `licorne.typos.v1`. Use normal AdventureSession checkpoints and unique credits; never update letter mastery for this activity. Clear the correction when retrying or changing modes. Run `tools/typos.test.mjs`, `tools/test-typos-browser.py` and the menu checks. The versioned entry/import URLs refresh cached clients when the menu or app changes.


## Chapters and the family reward wheel

The chapter menu lives in app.js + css/chapters.css. Keep four root tiles in two rows at every screen size. The chapter back button is available inside each chapter; navigation must not mutate learning progress or rewards. Browser checks use tools/browser_menu.py to open chapters through the real UI before choosing a module. tools/test-chapters-browser.py exercises all thirteen starts, responsive navigation, all six deterministic wheel outcomes, legacy gift migration, one real earned spin, classic fallback and normal-motion locking. The shared reward module/import revision must match across main, game.js and words/game.js. Never reintroduce the removed wheel fart animation; the separate adventure prout gags stay unchanged.


## Art pass 4 (painted worlds)

`js/meadow/fauna.js` draws fifty species from thirteen kits listed in `SPEC`; `faunaPose` in `fauna-data.js` is a pure
behaviour loop and must stay deterministic (tests compare poses). Parts are baked with `sprite()` (auto-cropped) and
moved only with CSS transforms. `scenery.js` owns the shared ground brush and props; `habitats.js` returns a scatter
brush per world. Scenery tiles are virtualised in `preview.js` (`syncTiles`, `needBottom`): never go back to baking
every tile up front — it used over 600 MB. Far planes use `LIFT` on wide screens. Road stones are positioned with the
CSS `translate` property so `transform` stays free for animations. While a question is open, animals slow down and
look at the stones (`fauna.update(..., focus)`). Review record: docs/art-pass-4-panel-review.md.

Art pass 5: colour fills are flat on purpose (`wash` caps its noise). Do not bring back blotchy washes, translucent
shadow pools or veils — the owner sees them as grey marks. Shading is done with the `texture` tiles (`speck`, `dash`)
placed where they describe form: under hill crests, along the far edge, under verges, in cast shadows.

Art pass 6: the companion is an original duckling (`makeDuck` in preview.js, variable `pal`); do not draw licensed
characters. Paillette keeps her rig anchors (leg pivots y=-46, head 24,-72, tail -40,-74, ear 42,-134).


## Crossroads 13: question view, crossings and livelier animals

`js/meadow/crossroads.js` draws the question view inside the scene iframe: Paillette seen from behind, wondering
(`?` bubble, head turning door to door), one door per answer. `world.placeChoices(buttons)` returns `true` when the
answers fit (≤3 doors on phones, ≤4 on wide screens, short labels); the host buttons become the door signs
(`data-road-door`, positioned from `scene.roadLayout()`), otherwise they stay as cards in the panel. `world.react`
passes the tapped door to `scene.chooseDoor(index, ok)`: right = door opens with light and she trots in, wrong = the
door rattles and she shakes her head. `app.js` lengthens the feedback pause while `forked` so the child sees it.
The scene measures the host header/HUD/panel (`setForkInsets`) so nothing is hidden; sentences and typo activities
keep their panels. The old stones-on-the-road layout (`data-road-stone` CSS) is no longer used.

`route.js` paints crossings as structures (planked bridge with railings/lanterns, stone/ice arch with parapets,
thick stepping stones, rainbow cloud bridge) over a stream centred under them. Keep to path/ellipse/circle with flat
fills: the tile baker supports nothing else.

`fauna.js`: five adults with different sizes and tempos, walkers get a youngster trailing the parent, other species a
smaller sibling. `update(dt,cam,width,hero)` takes Paillette's position: the nearest small walker trots beside her
(`buddy`), a flyer circles her horn (`visitor`), others turn to look and hop hello as she passes. `faunaPose` stays
pure. All of it stops for reduced motion.

Crossroads 14: each world has its own little houses around the doors (`STYLE` in crossroads.js: stone arch with ivy,
tree house, beach hut, igloo, cloud arch, moon dome, adobe, mushroom) and its own backdrop (ridge, tall trees between
the houses, clouds/stars/planet/rainbow). `CROWN`/`SPREAD` reserve the room each house needs; the answer sign hangs on
the lintel so the door leaf stays visible. `fauna.guests(host)` builds two extra rigs before `scratch` is removed; one
sits beside Paillette in the crossroads, looks around and hops when the answer is right. Canvases inside `.fork-life`
must stay `position:absolute`.

Crossroads 15: `js/meadow/door-signs.js` owns the answer signs (fit decision, hanging/releasing the host buttons,
inset measuring, following the doors every frame, the tapped door). `world.js` only delegates (`placeChoices`,
`world.forked`, `react`). The decision is re-made on every resize/rotation: four word doors on a tablet become panel
cards on a phone and back. A newly loaded world adopts the open question without replaying the fade
(`setRoadChoices(n, true)`), and a rebuild keeps an answer in progress (door stays open). The old stone CSS and the
`roadChoices` framing were removed. Run `node --test tools/door-signs.test.mjs` and
`python3 tools/test-crossroads-browser.py --browser-path <chrome>` (rotations in every world, world change while
walking and right after answering, pause, mistake, words on tablet/phone).

## Performance pass 19

Anything drawn live in the scene SVG (Paillette, duckling, crossroads question view) must use flat colour (`WL`,
`liveSpeck` in preview.js): textured pattern fills repainted every frame were the main cause of lag on phones, and no
SVG `<pattern>` elements are created any more. Only framing trees, hanging branches and waterfalls sway (`windify`);
other plants are baked into tiles. Do not bring back full-screen overlays (grain, vignette, rays, dusk), motes, or
`backdrop-filter` over the scene. Audit record and numbers: docs/performance-19.md.

## Installable web app (PWA)

`manifest.webmanifest`, `sw.js`, `js/pwa.js` (registration, loaded by the four entry pages) and icons in `assets/icons/`.
`js/pwa-files.js` is generated by `npm run pwa` (tools/pwa-files.mjs): rerun it whenever a game file is added or
removed; `npm test` fails if it is stale. Code, pages and JSON are network-first with a 4 s fallback to the stored copy,
so online devices always get the published version and no reload prompt is needed. Stored copies are keyed by path
(`?v=` ignored) and revalidated at most once a day. MP3s are stored on first listen, never at install (91 MB);
hash-named clips are cache-first, the others refresh in the background. Keep every path relative (GitHub Pages
subfolder). The worker never speaks, rewrites content or touches localStorage. Automated browsers
(`navigator.webdriver`) skip registration unless the URL has `pwa=1`, so the existing suites stay uncached.
`tools/serve.py` serves `sw.js` and the manifest. Run tools/test-pwa-browser.py (starts and stops its own server).
On iOS the installed app has storage separate from Safari.
The install button lives inside « Aide aux parents » (`#installApp`, logic in js/pwa.js): it calls the browser's install
prompt where one exists and otherwise shows the Share → « Sur l’écran d’accueil » steps (iOS cannot install from a
button). It hides itself once the game runs as an installed app. Keep it out of the child's main menu.

## Memory pass 20 (world changes)

A Safari memory recording (Mac, 19 Nov) showed 0.6 GB at the menu, rising to 1.8 GB with critical memory pressure
after twelve world changes. Cause: in `js/meadow/world.js` each new scene iframe kept an `error` listener whose closure
held the previous scene, so every world visited stayed alive as a chain. The load/error listeners now remove
each other as soon as either fires. Never let a host-side closure outlive the frame swap while holding
`oldScene`/`oldFrame`. `window.__adventure.setTheme(id)` (debug only) drives tools/test-world-memory-browser.py, which
fails if live documents grow across eight world changes. Record: docs/memory-20.md.

## Le monde des peluches (world 10)

Eleventh painted world, habitat `peluches`: a child's bedroom. It reuses the outdoor planes: the mountains layer is the
wallpapered wall (windows, shelves, pictures, a cubby shelf that tall screens show), the valley layer is the wooden
floor, mid/near carry furniture and big toys, the ground is the carpet with a play-road, the stream is a blue blanket
crossed on cushions (`TONE.peluches` in route.js). `indoor` in preview.js and crossroads.js turns off sun, clouds,
mist, birds, grass tufts and hills. Companions are four plush bears and a plush rabbit (`TEDDY` rig in fauna.js).
All toys are original designs; do not add licensed characters. Props carry stars, hearts and dots, never letters,
so the scenery cannot be confused with an answer. Adding a world means: themes.js, model.js WORLDS + gag map,
habitats.js, fauna-data.js/fauna.js, scenery.js GROUND_DETAIL, crossroads-theme.js, route.js tone, the
illustrations.js icon, prototype/animals.js, `assets/storybook/<habitat>.webp`, and the tests that list habitats.
Saved world counts now cycle over eleven worlds.

## Parents' progress tracking

`js/learning/tracker.js` (pure, tested by tools/tracker.test.mjs) keeps per-day, per-exercise counts
`[correct, wrong, gamesCompleted]` under `licorne.suivi.v1`: no names, no typed answers, 800 days kept. app.js records
every evaluated answer (`tracker.record`, never the partial steps of a sentence) and each finished game; the guided
path records one line per chapter (`parcours:C1`…), except in review/test mode. Tracking must never block or slow an
answer and must not touch mastery, rewards or checkpoints. The view (`js/parents/progress.js`, `css/progress.css`) is
loaded only when a parent taps « Suivi des progrès » in « Aide aux parents »: path score, day/week bar chart with a
family filter, per-exercise table, CSV download (semicolons + BOM; share sheet in an installed iOS app).
Score = mean of the four menu families; each exercise = recent success (about the last 60 answers) × practice
(full from 40 answers). Keep the button inside the parents' help, never in the child's menu.
Run tools/test-progress-browser.py for counting, persistence across reloads, the picker's eleven worlds and the CSV.

## Menu and welcome screens (accueil-2, 20 Nov)

`css/menu.css` is loaded last by index.html and curriculum.html and owns the look of the home card, chapter views,
footer buttons, pause/world/level dialogs and the curriculum header. Titles and buttons there use the bundled display
font `Paillette Display` (Fredoka, OFL, `assets/fonts/`); it is deliberately a separate family name so answer cards
and question text keep their existing font. Do not apply it to anything the child reads as an answer.
The menu card is opaque (no scenery showing through tiles). The `.menu-mascot` image shows only where the card is
centred over the scene's Paillette (width ≤ 650 px and height > 700 px). Chapter tiles stay two rows of two at every
size and must fit the first viewport at 320×568 and 844×390 (tools/test-menu-browser.py, test-chapters-browser.py).
Chapter and workshop tiles use the bold `chapter-*` icons from illustrations.js (`MENU_ICONS` in app.js maps the
pale in-game pictograms for the menu only).
