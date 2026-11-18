# Restored ten-crystal portals

The shared painted-world adapter advances to the next habitat at each forward ten-crystal boundary when the activity continues. The final stop remains the castle. Manual habitat choices queued during travel take precedence. Return trips and duplicate stops do not advance the habitat.

A two-layer pastel portal surrounds the boundary crystal: Paillette walks between its back and front rim, then the new habitat fades in. The destination retains the total crystal count and current question. Reduced-motion settings skip the arrival fade. Portal art stays visible while the next scene loads; a failed load retains the playable old scene.

Verified in the browser by playing alphabet A–J: meadow portal at 9/30, forest at 10/30, K question ready, no console errors. Adapter regression tests cover boundaries at 10 and 20, last-world wraparound, final-stop exclusion, return/replay exclusion and manually queued choices. npm test, npm run check and ESLint run for this iteration.

Local preview: http://localhost:8080/index.html?world=0&version=portals-12
