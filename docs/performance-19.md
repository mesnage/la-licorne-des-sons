# Performance pass 19 — audit and cuts (19 November 2026)

Symptom reported: lag, freezes and Safari's "a problem repeatedly occurred" reload. That message is compatible with memory pressure, but does not establish the cause of the reload.
The incoming audit reports measurements in headless Chrome at iPhone size
(390 × 844 @3×) with a 4× CPU throttle; no real device was used, so these are relative numbers.

## What the audit found

| Cost | Finding |
| --- | --- |
| Question view | A full-screen live SVG whose large shapes were filled with image patterns, updated 60 times a second. Every frame re-rasterised textured vector art over about half the screen. This is where a child spends most of the time. |
| Texture patterns | 97–122 SVG `<pattern>` elements, each a 256 × 256 PNG built with `toDataURL` at load and kept decoded. |
| Moving plants | Every tree, bush and tall flower on four planes was its own bitmap with its own endless CSS animation and compositor layer (32 running animations, 82–116 promoted layers). |
| Full-screen overlays | Paper grain, vignette, sky paper, dusk tint and light rays (with a CSS mask): five blended full-screen layers composited every frame. |
| Blurred chrome | The world-name chip used `backdrop-filter: blur` on top of the animated scene, so it was re-blurred every frame. |
| Particles | 16–26 drifting motes and 16 fireflies, each an SVG attribute write per frame scattered over the whole screen. |
| Memory growth | Canvas memory rose from 70 MB at the menu to 115 MB after seven answers. |

## What was cut or changed

- Live SVG (Paillette, the duckling, the question view) uses flat colour. Baked scenery keeps its textures.
- No SVG patterns are created any more.
- Only the big framing trees, hanging branches and waterfalls sway. All other plants are painted into the tiles.
- Grain, vignette, sky paper, dusk tint and light rays removed. Motes removed; fireflies 16 → 6; clouds 22 → 8.
- Backdrop blur removed from the header chip, HUD and prompt.
- The question view updates at half rate while Paillette is only looking around, full rate once an answer is tapped.
- Phones bake scenery at 1.2× instead of 1.5×.
- Flower drifts and speckles are one path per colour instead of one element per dot.

## Result (same measurement)

| | Before | After |
| --- | --- | --- |
| Canvas memory at the menu | 70 MB | 39 MB |
| Canvas memory after seven answers | 115 MB | 67 MB |
| Promoted layers | 82–116 | 38–44 |
| Running CSS animations at the menu | 32 | 5 |
| SVG patterns | 97–122 | 0 |
| Retained DOM nodes | about 40 000 | about 32 000 |

Kept on purpose: animal behaviour, Paillette's and the duckling's movement, doors, crossings, the goal crystal,
clouds and far birds, answer feedback.

Still open: about 27 000 source SVG nodes are kept so tiles can be painted on demand; a tile painted while
walking can still cost a frame; nothing here has been measured on the affected device.

## Independent release review

Local browser verification on 19 November covered 15 world changes, visiting all
ten habitats, alphabet answer feedback and travel, reload recovery at crystal 1,
and a curriculum syllable exercise in the dinosaur world. No crash, unexpected
menu return or console error was observed. At a 390 × 844 viewport, three visits
to the jungle at the same question each retained one scene iframe, 157 canvases
and 65.08 MiB of DOM-attached RGBA canvas buffers. This is a different browser
configuration from the incoming audit above; it is a repeatability check, not an
independent reproduction of its before/after table or total process memory.
All ten worlds had zero SVG patterns and no unresolved SVG pattern-fill references.

Review fixes: converted the remaining castle-star and standalone-preview stone/
flower fills to flat colours, removed dead particle/ray branches and the unused
defs node. Automated checks: npm test, npm run check including the Robin audit,
ESLint (only the two pre-existing words-test warnings), and git diff --check.
Physical-device Safari stability and long-duration memory usage remain unverified.
