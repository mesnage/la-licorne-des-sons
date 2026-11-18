# Review 16 — maintainability, memory, question variety and voice audit

The other AI's crossroads work is worth keeping: real HTML answer buttons stay in the host while doors, houses, animals and animation remain in the scene. No framework/build dependency was added. The old renderer remains only as a fallback; removing it is outside this review.

## Changes

- Extracted editable door colours, house styles and proportions to `js/meadow/crossroads-theme.js`. Drawing/animation stays in `crossroads.js`; button placement and sizing stay in `door-signs.js` and `choice-fit.js`; journey orchestration stays in `world.js`. Learning content remains under `js/data/`, question selection under `js/learning/` and `js/prototype/model.js`.
- Shared Fisher–Yates shuffle and seeded randomness in `js/random.js`, reused by word and other activities. Alphabet covers all 26 letters in shuffled order before four distinct review questions, without an immediate repeat. Curriculum shuffles within pedagogical blocks, randomizes answer slots, preserves paired C6 review, and keeps the first counting block simple. Older saved sessions retain the legacy schedule through `questionVersion`; new sessions save the new schedule version.
- Bounded decoded audio to 32 recent clips with deduplicated in-flight requests, retry after failures and invalidation when a recording mapping changes. This prevents session-to-session accumulation of decoded audio.
- Door inset measurements now respond to ResizeObserver invalidation with a once-per-60-frames fallback instead of every six frames. Offscreen scenery/animal culling and bounded scenery tiles remain intact.
- Four short word answers use two phone columns to leave more room for Paillette; long labels retain the single-column layout and equal adaptive text size.
- `npm run dev` uses a small standard-library server serving only public game assets, with cache revalidation. No npm download needed and no dotfiles/backups/tooling served.

## Voice findings

`node tools/audit-voice.mjs --write` produces `docs/voice-audit.json`.

All 708 entries in the seven active curriculum Robin manifests declare `speaker: robin`, `provider: elevenlabs`; their file hashes match. The configured generator voice is `ZLsOpArVEayz7qulwa9E`. Older Piper curriculum manifests are not the ones loaded by the current curriculum player. All 1,275 main-manifest paths exist.

Follow-up after user authorization: all 31 legacy LN/PS entries now have Robin provenance. Nineteen existing excerpts were verified against documented Robin source recordings (waveform correlation >0.95); twelve were replaced with excerpts from contextual Robin recordings. See `audio/short-robin-provenance.json` and `voice-review.html`. The initial markup-generated batch was rejected after ASR flags and is not referenced by the game. Other Robin-named files have generator/history evidence, but names alone do not establish speaker identity. Hash/metadata checks also do not validate every pronunciation; many records explicitly remain pending human listening review.

## Validation

Full `npm test`, `npm run check`, ESLint and diff whitespace checks. Added cache and randomisation regressions, including old/new schedule reproducibility. Existing tests cover all 74 units and curriculum audio references. Browser checks cover mobile crossroads, replay, answer feedback, pause/rotation/resume, word cards, and curriculum startup. Real iPad/Safari profiling and complete human pronunciation review are not claimed.

Local preview: http://localhost:8081/index.html?version=review-16 . Not committed or deployed.
