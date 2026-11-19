# Stability pass — 19 November 2026

The jungle allocated moving foliage canvases for the entire route. Culling stopped
animations but did not free their pixels. A world switch also retained the old
scene while constructing the next one. These are verified sources of memory
pressure; an operating-system/browser memory kill was not reproduced.

At 1024 × 768 in the local browser, the settled jungle menu changed from 676
canvases / approximately 110 MiB of raw RGBA pixels (69 MiB foliage) to 196
canvases / 39.45 MiB (5.99 MiB foliage). This is not total process/GPU memory or an
FPS measurement, and actual device results will differ.

Changes:
- Rasterize foliage near the camera through the existing idle painting queue.
- Evict distant buffers, explicitly zero their dimensions and trim tile retention.
- Release outgoing scenery before loading another world; preserve lightweight
  source geometry so a failed load can restore the previous scene.
- Skip hidden walking-scene animation while crossroads questions are visible.
  Keep SVG paint definitions visible because the question artwork reuses them.
- Save workshop sessions per tab after questions/answers and on page hiding.
  Restore question order, world, crystals, sentence assembly and unique scoring
  credit in a paused state. A reload during a return resumes its checkpoint;
  during success feedback it repeats that question without duplicate credit.
  Intentional exit and completion clear the snapshot. Curriculum exercises retain
  their existing persistence and share the renderer improvements.

Checks: npm test; npm run check (including voice provenance); ESLint (two existing
unused-import warnings in words.test.mjs); git diff --check. Browser checks cover
alphabet movement, jungle-to-forest switching, reload at crystal 1 with identical
answer order, restoring the selected forest, portrait 390 × 844, and explicit exit
followed by reload. No runtime errors observed in these flows.

Limits: per-tab recovery needs sessionStorage and browser preservation of the tab;
blocked storage or a discarded browsing session cannot be recovered this way.
Actual iPad/Safari or other affected device performance still needs user testing.
This is a local preview, not a production deployment.
