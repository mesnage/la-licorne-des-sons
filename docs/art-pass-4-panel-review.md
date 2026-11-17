# Art pass 4 — richer animals and worlds, with three review rounds

Branch `codex/storybook-meadow` (uncommitted). Version string `art-4`. Date: 2026-11-17.
A backup of the files as they were before this pass is in `backup-avant-refonte-visuelle-2026-11-17.tar.gz`.

The "panel" below is a role-play by the same assistant that wrote the code, working from real
screenshots (1280×800, 1024×768, 390×844) rendered in headless Chrome. It is a structured self-review,
not an independent expert opinion, and nothing here was seen on a real iPad.

## Scores

| Round | Aesthetics | Learning dynamics | UX / UI |
| --- | --- | --- | --- |
| Baseline | 5 | 6.5 | 6 |
| Round 1 (new animals, new worlds) | 7 | 6.5 | 6 |
| Round 2 (panel requests) | 7.5 | 7 | 7.5 |
| Round 3 (portrait and polish) | 8 | 7 | 7.5 |

## Round 1 — developer proposal

- `fauna.js` rewritten: thirteen drawing kits (four-legged, turtle, crab, seal, owl, hornbill, penguin,
  wader, flyer, bee, butterfly, sitter, two-legged dinosaur) cover the fifty species. Each animal has
  painted-wash fills, a soft rim, belly and back shading, cheeks, a blinking eyelid, separate ears,
  tail, legs, wings or trunk.
- `fauna-data.js`: `faunaPose` is now a slow behaviour loop (rest, stroll, graze, return; hops, waddles,
  scuttles, soaring with glides, fluttering with rests). Leg phase follows distance so feet do not slide.
- `scenery.js` (new): shared ground brush (tufts, flower drifts, pebbles, ripples, sparkles, depth haze,
  sun and shadow pools, verge grass over the trail edges) and shared props.
- `habitats.js` rewritten: beach, ice, clouds, moon, dinosaur valley, desert and unicorn kingdom each have
  their own distance, water, two hill planes, props beside the trail, foreground and palette.
- Far planes are lifted on wide screens so layered hills, trees and water show above the clearing.

## Panel review 1

Art director: animals too small and low-contrast in pale worlds; tall screens show empty sky and an
empty lower plane; haze banding at the horizon; cloud world washed out; answer stones are grey slabs
that do not belong to the painting; the goal crystal is a flat icon; the sky is lifeless.

Learning designer: moving animals compete with the letters while a question is open; the right answer
is shown too briefly; progress is text a five-year-old cannot read; a single mistake sends Paillette
back to the refuge, which is harsh at this age (left for the owner to decide — not changed).

UX designer: HUD text is 10–11 px; replay is the key control for a non-reader and should be more
inviting; stones need a press state and should not lose their shake animation to an `!important` transform.

Technical: 657 MB of canvas at 1024×768 @2× before this pass — a real risk on iPad.

## Round 2 — what was built from that

- Animals drawn 4–35 % larger by size class, spaced so they do not overlap, kept in depth lanes.
- While a question is open the animals slow to 45 % and resting ones turn to look at the stones.
- Right answer: stone turns gold, flowers bloom at its base, all animals hop in a staggered wave.
  Letter feedback delay 650 → 900 ms (`app.js`). Wrong answer: gentle rock, no red.
- HUD: a row of ten crystals with the refuge ringed; the bar and its ARIA values remain in the DOM.
- Answer stones: painted limestone with lichen, lip and cast shadow, tucked into grass, snow, sand or
  cloud depending on the world; positioned with `translate` so press/joy/retry can animate.
- Goal crystal floats, glows and glints. Far birds cross the sky; more clouds for tall screens.
- Tile virtualisation: scenery tiles are painted on demand around the camera and each plane is cropped
  to what can show. 657 MB → 177 MB in the same measurement; first load roughly halved.

## Panel review 2 and round 3

Remaining requests: portrait still empty below the trail; seas stop too high on tall screens; a stray
rim line on the moon; thin tree-fern crowns; sparse hanging leaves in the dinosaur valley.
All done: ground detail and a scatter of each world's props now continue to the bottom of tall screens.

## Final panel verdict

A coherent, attractive picture-book look across ten worlds; clearly better than the starting point.
It is not yet at the level where the art alone would sell the game:

- Paillette and the fox are the original, simpler rigs and now look plainer than the animals around them.
- Animation is procedural. There are no drawn turn-arounds, no secondary motion on fur or cloth.
- The reading-path map uses older, differently styled images (`assets/storybook/*.webp`).
- The world picker shows icons, not small paintings of each world.
- Portrait water still looks misty.
- Never run on a real iPad or in Safari: frame rate, memory and the CSS `mask` / `translate`
  features used by the stones need a device check (there is a fallback for `translate`).

## Verification

- `tools/meadow-journey`, `painted-world`, `painted-fauna` tests: 12/12. ESLint: only the two old warnings.
- Browser run through the real game shell, all ten worlds at 1280×800 and four at 390×844: three right
  answers, travel, stones inside the viewport and ≥ 64 px, pause freezes animals, five species each,
  no console errors; world 9 with reduced motion.
- Wrong answer returns to the refuge; changing world from the picker keeps the same question.
- Reading path (`curriculum-play.html`) opens with the new scene at 1024×768 and 390×844.

Not changed: questions, audio, rewards, checkpoint rules, saved progress, world IDs.

## Art pass 5 — clean colour and placed textures (same day, version `art-5`)

Owner feedback: grey marks on the images; Puffin Rock uses a mix of textures placed with intent.
Cause: the watercolour fill added random pools and horizontal streaks to every colour, repeated every
256 px, plus translucent shadow pools and a blotchy paper overlay. On sand, snow and paths this read as dirt.

Round 4: fills are now nearly flat with a fine tooth (`wash`). Removed the shadow pools and dark veils,
lightened grain, vignette and mist. Added two texture tiles (`texture`: sponge stipple and dry-brush
dashes, four densities) used only where they describe form.

Round 5 (review: stipple too white at the far edge, pox-like dots in tree crowns, stitched-looking trail
edges): far-edge stipple uses a lighter tone of the ground itself; finer dots in crowns; softer verge
shade; grass tufts grow in drifts; water gets dry-brush light near the horizon; every hill gets sunlit
stipple under its crest and deeper stipple lower down; cast shadows use each world's own shade colour.

Round 6 (review: big grey boulders in forest and jungle, flat cloud undersides, bare sky at the horizon):
warmer, smaller mossy stones; stippled cloud undersides; stippled glow at the horizon.

Scores after this pass — aesthetics 8.5, learning 7, UX/UI 7.5. The remaining gaps listed above are unchanged.
Checks: 12/12 scene tests, all ten worlds through the game shell on desktop and four on phone size, no errors.

## Art pass 6 — heroes, moon, clouds, picker (version `art-6`)

- Paillette redrawn: tapered legs with rounded hooves, rounder body, flowing four-colour mane and tail,
  lashes, striped horn with a glint. Same rig anchors, so all existing motion still applies.
- The fox companion is replaced by an original yellow duckling that waddles behind her in every world.
  (A Disney character was requested; that is not something to draw into the game.)
- Moon: violet-indigo palette instead of grey-blue, stippled nebulae, a ringed planet, shooting stars,
  glowing star-flowers, lit domes, recoloured moon creatures.
- Clouds: blue-to-peach sky with a low sun and rays, pink and blue cloud banks, a cloud castle,
  floating islands, golden trail, recoloured birds.
- World picker: each tile shows a small painted landscape in that world's colours. HUD text enlarged.

Scores after this pass — aesthetics 9, learning 7, UX/UI 8. What still holds it below 9.5: procedural
animation, the older images on the reading-path map, and no real-device run.

## Art pass 7 — reading path and phone layouts (version `art-7`)

- Reading path (`curriculum.html`): the old bitmap panoramas, the glossy unicorn and the castle image are
  replaced by painted artwork (`assets/storybook/paillette-peinte.svg`, `paillette-et-caneton.svg`,
  `chateau-peint.svg`) and CSS landscapes in each chapter's colours. Rounded UI type, stone-shaped stops,
  the next unit highlighted in gold. No change to units, progress or links.
- Phone audit at 390×844, 360×640 and 844×390 over menu, chapter list and one activity per chapter:
  no horizontal overflow, stones and answer buttons inside the screen and at least 51 px high.
  Fixed: on a phone held sideways the prompt bar covered the stones (now a slim bar below them, compact
  counter); in portrait Paillette was cut off at the left and the first stone touched her nose.
- A Disney duck was requested again for the companion; the duckling stays an original character.
