# Painted meadow integration — version 1.1

Branch: `codex/storybook-meadow`. Entry points: `index.html`, `curriculum.html`, `curriculum-play.html`.

## Scope

All 15 workshops and all 74 reading-path units use the shared painted renderer. All ten stable habitat IDs are now implemented, and reading chapters use their corresponding scene. The picker and saved preferences retain those IDs. The classic fallback and original renderer remain available in source. No deployment was performed.

The original curriculum and workshop session models remain authoritative for answers, partial sentence assembly, correctness, unique question credit, local progress, checkpoints and reward earning. Existing recorded narration stays in the parent activity. The curriculum now enables answer controls independently of audio playback, so unavailable clips do not strand the child.

## Renderer boundary

`js/meadow/world.js` implements the existing world API with a same-origin iframe of `meadow-preview.html?scene`. This isolates the scene's SVG IDs and CSS from lesson controls. The scene does not receive answers, award rewards, play narration, or write progress. It only resets, travels to counts, reacts, pauses and tears down. The standalone six-vowel preview remains available without `?scene`.

`js/meadow/journey.js` uses scene time for movement. Pause freezes completion; cancellation resolves a pending move as false. It supports checkpoint returns and 5/10/20/30-question sessions. Scenery is baked once and reused when activities change. Ground-plane perspective, animal lanes and larger portrait characters are retained. HTML answers use painted stone/tile styling; long reading content scrolls within a bounded panel.

## Verification performed

Short letter and sound choices now appear as clickable stones directly on the winding road in both workshops and reading units. Their positions track the scene camera and road elevation; longer words, sentences and picture exercises retain their reading panels. Paillette follows the same curved ground while travelling between questions.

- Road stones were checked at desktop size and 390 × 844, including a successful answer and travel to the next question, and the U/OU reading block. Browser error logs were empty.

- `npm run check` and the full existing unit suite passed.
- Six new journey regression tests cover 10/20-question completion, pause, checkpoint return, cancelled travel, and reduced motion. They are included in `npm test`.
- ESLint passed with the two pre-existing unused-import warnings in `tools/words.test.mjs`.
- All 15 workshops opened in desktop and 390 × 844 browser layouts, with correctly sized, horizontally contained answer controls.
- Representative units for all 15 reading-path exercise types rendered. One long syntax-choice label overflow was found and fixed with adaptive type size and wrapping.
- A real ten-question sentence workshop completed on a separate local test origin. Partial assembly did not move the scene; pause retained assembly; a mistake at six returned to five; finishing reached ten and earned exactly one wheel spin.
- A twenty-question reading unit completed in local review mode. Reload at three answers restored both the session and scene to three; completion reached twenty and the castle.
- No browser errors were observed during these journeys.

## Remaining review

Real iPad/Safari frame rate, memory and listening quality need device review. The full 74-unit content corpus is covered by the existing generator/session tests; browser coverage sampled each exercise type rather than manually answering every unit. The historical Phaser-specific visual tests do not describe this new renderer. No pedagogical changes from the supplied handoff were made in this migration.

## Longer journeys

Each answer now covers 640 world units in 2.6 seconds, including alphabet (previously about 137 units). Only the next road crystal is drawn. The landscape extends to the full alphabet journey, and the castle follows the actual session endpoint. Reading activities await arrival before advancing. Regression coverage checks equal travel distance and completion for 5, 10, 20 and 30 questions.

## Firefly forest

The shared renderer now has a second habitat with a wooded hollow, layered trunks and canopy, ferns, moss, mushrooms, perched owls and animated fireflies. The forest uses the same path geometry, large answer stones, 640-unit travel and single upcoming crystal. Its stable ID is 1. Workshop selection persists in the existing preference; reading chapters with the forest theme select it automatically. Theme loads preserve question controls, count and pause state; superseded loads and moves are cancelled. Two adapter regression tests cover these lifecycle cases.

Forest browser verification: 1280 × 800 and 390 × 844 layouts; alphabet success and next question; meadow/forest switching at one crystal with identical answer choices; C2-U01 local-review word assembly; no browser errors. Full tests and content checks passed; ESLint has only the two existing unused-import warnings. Real iPad/Safari performance still needs device review.

## Waterfall jungle preview

Stable world ID 2 adds layered tropical palms, hanging vines, painted cliffs, animated waterfall streaks, lagoon ripples, tropical flowers and perched toucans. The shared winding route, answer stones, travel distance and single next crystal are retained. `index.html?world=2&version=jungle-2` opens the jungle without overwriting the saved world preference. Chapter C5 selects the jungle automatically. Waterfall animation respects pause and reduced motion. Desktop (1280 × 800) and phone (390 × 844) compositions were checked, and alphabet travel was exercised. Full tests and content checks pass; the jungle adapter regression also covers restored reading progress.

## Complete world set

Beach, ice, clouds, moon, dinosaur valley, cactus desert and unicorn kingdom now each have their own terrain, palette, foreground props and landmarks. Native shapes are baked once, using the same route and camera as the earlier three worlds. The moon omits daylight clouds/birds and uses stars, distant lunar ridges and rabbit companions. All seven were visually checked on desktop and at 390 × 844; phone answer stones remain 77 px high, within the viewport, with exactly one upcoming road crystal. A clipped dinosaur head was corrected by extending the appropriate bitmap bounds. All ten adapter IDs are covered by a progress/return-trip regression test.

Final browser check (2026-11-17): verified the lunar landscape and alphabet interaction, plus a correct C6-U01 reading answer in the ice scene. Restarted the local preview server. The complete preview is `index.html?world=3&version=worlds-3`; the world-name button exposes all ten habitats.
