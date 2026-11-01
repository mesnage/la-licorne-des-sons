# Living enchanted world: independent design rounds

Branch: `graphics/living-enchanted-world`.

The owner requested three to five implementation/review cycles, with an independent game designer's advice informing each following implementation. Reviews here are performed by independent AI agents acting as game designers/art directors, not by an external human consultant. Review agents inspect screenshots, motion evidence and the implementation without editing it.

## Round 1 — articulated wildlife foundation

Implemented six articulated species: rabbit, fox, turtle, hedgehog, deer and cow. Parts include body, moving legs, head, blinking eyes, ears and tail. Each species has a different roaming schedule and pace. Meadow and forest now include all requested new species. Clouds translate continuously and the existing breeze is more visible.

Independent review (`designer_round_1`) found the learning panel readable but the art below the desired polish. Priorities:

1. Correct blocky paws, peg-like deer legs, disconnected necks and the hedgehog's inappropriate white tail before adding texture.
2. Replace shared pendulum steps and instant flips with species-specific gaits, planted feet and turns during rests.
3. Replace repeated broccoli-like tree silhouettes; keep trunks planted while canopy groups and individual flower stems move.
4. Remove the pale green veil, strengthen coherent upper-left lighting/contact shadows, and sort roadside objects by ground position.
5. Distinguish the forest from the meadow and add directional leaves and restrained sunshine.

The reviewer requested a real-time reversal/ground-contact clip and close views of the cow and turtle, which were not visible in the initial scene captures.

## Round 2 — anatomy, grounding and vegetation

Implemented tapered, two-segment articulated legs with foot targets and planted/swing phases; rounded rabbit paws; a continuous deer chest/neck; a spiny hedgehog silhouette without a rabbit tail. Animals pause before turning through a brief narrow pose. Walking acceleration has smooth endpoints.

Trees now have separate fixed trunks and two moving canopy layers. Broadleaf/birch and broadleaf/conifer variants share directional shading, bark marks and small leaf shapes. Flower patches have individually swaying sprigs driven by a shared spatial wind field. Greens and near foliage have stronger contrast, with a cooler shaded forest floor. Roadside plants and roaming animals sort by ground position.

Review evidence includes a dedicated six-species graphics lab (`tools/graphics-lab.html`) and a real-time 20-second capture with reversals, plus desktop, phone and habitat screenshots. Captures are temporary review artifacts under `/tmp/licorne-graphics/round-2`.

Independent review (`designer_round_2`) confirmed the tail, neck and rectangular-paw fixes, but still found crouched/segmented legs, tilted stance hooves, a collapsing turn, a rainbow-cloud/wildlife collision, a forest too similar to the meadow, and repeated fence-like flower beds. It required level planted feet, a volume-preserving turn, a clear landing, more deliberate forest grouping, consistent contact lighting and a phone motion recording before approval. The 20-second six-species recording and extracted frames were inspected, not only code.

## Round 3 — grounded steps, complete turns and living atmosphere

Separated feet from shins, flattened stance soles, straightened deer forelegs and added independent four-beat cow/turtle timing. Stance targets are held in world space rather than multiplied by acceleration. Small hip corrections preserve limb reach; rabbit paired hops remain airborne. Tests check stable stance contact, flat soles, finite joint angles, smooth roaming endpoints and no body flattening.

Stationary turns now crossfade through a cached front-facing pose; the side silhouette stays full width. The rainbow clouds sit behind wildlife and the landing has a wider animal-free lane. Larger animals use lower roadside lanes so their heads do not merge with Paillette's legs.

Forest trees form uneven, overlapping stands with tapered conifer silhouettes and cool shaded pockets. Meadow/forest now have eight companions instead of six, including all requested species. Clouds drift continuously; birds have articulated, continuously moving wings and gliding intervals. Sparse rotating leaves travel through a shared breeze. Individual sprigs, butterflies, warm ground-light patches and glow-textured fireflies add restrained motion.

New forms are cached SVG textures without heavy filters. Off-screen containers skip rendering and joint updates; matching first-world scenery is reused when starting another activity. The same real-time scene clock governs scenery and wildlife, so pause freezes it and reduced motion stays static.

Review evidence: desktop/phone habitat captures, a real-time 30-second six-species clip showing a full departure/stride/stop/turn cycle, and a Retina phone recording with an explicit pause/resume (`/tmp/licorne-graphics/round-3`).

Independent review (`designer_round_3`) inspected the stills, full 30-second cycle, close turn frames and phone pause sequence. It accepted the flatter stance soles, recognizable legs/neck/paws, distinct forest and preserved reading UI. Its remaining priorities were: eliminate translucent turn ghosts; keep a grounded quadruped in the midpoint art; move rocks away from featured animal silhouettes; break remaining flower-fence repetition; and strengthen species-sized contact shadows. The turn treatment remained the critical blocker.

## Round 4 — opaque turns and final scene polish

Replaced dissolves with an opaque quarter/front/quarter pose sequence in the same rig coordinates and foot baseline. Torso proportions stay horizontal, tails/ears/neck retain species cues, and exactly one silhouette is visible at a time. Tests now enforce opaque visibility as well as flat, locked feet. The intermediate poses remain deliberately stepped; they no longer flatten or show overlapping translucent animals.

Companion rest/roam areas now guide nearby rock/bush placement. Flower patches vary from one to three sprigs, with low sparse patches, irregular bases and heights. Body shadows are sized by species and small foot-contact shadows follow planted feet. Camera zoom easing uses elapsed time rather than a fixed per-frame fraction.

The independent third reviewer performed a final acceptance recheck on the new stills, fresh complete wildlife cycle and phone recording. All five priorities were accepted, with **no remaining critical visual blocker**. It specifically confirmed opaque single silhouettes, grounded quadruped midpoints, clear former rock tangencies, improved flower variety and contact shadows, and preserved Paillette/landing/phone readability. It advised stopping visual iteration after regression checks.

Known visual limits: midpoint art is simpler than the continuously articulated side rig, and a small wooden-toy quality remains visible in enlarged limb joints. These are intentional/current quality limits, not claims of feature-film animation. Capture cadence is not a hardware FPS benchmark; physical Safari/iPad performance still needs device review.

## Validation and review access

- `npm run check`: reading-card rules and recorded-audio coverage.
- `npm test`: existing learning/reward/world tests plus wildlife continuity, opaque turns, level world-space stance and bounded wind.
- `npm run lint`: JavaScript validation.
- `tools/test-living-world-browser.py`: real motion, pause/world-picker freezing, reduced motion, repeated scene reuse, bridge travel, all seven habitats, Retina resizing and completed two-world/reward sessions in WebGL and Canvas.
- `tools/test-world-picker-browser.py`: retained world choice and unchanged current question/crystals across habitat changes.
- Live artwork lab: `http://localhost:8081/tools/graphics-lab.html` (development tool, excluded from hosting with the existing `tools` exclusion).
- Final stills and real-time recordings: `/tmp/licorne-graphics/round-4/`.

Final result: data/audio checks, unit tests, lint, the living-world browser suite and the world-picker browser suite all passed. The selector test verifies dialog visibility and world/session state explicitly rather than waiting for a navigation on buttons that do not navigate. No physical-device FPS or Safari listening claim is made.
