# Journey 11: smoother travel and terrain crossings

Local iteration on the painted renderer, retaining the pending UX-10 improvements.

- Shared route geometry drives the painted surface, Paillette, the duckling and answer stones. Wood bridges in meadow/forest/jungle/beach; raised stone or ice paths in ice/moon/dinosaur/desert; cloud bridges in cloud/fairy worlds. Alternating stepping stones add small grounded hops, with a plain walking section every third journey. Reduced motion disables hops.
- Travel eases into a steady cruise and eases out. Camera settles without perpetual tiny transform updates. Answer placement uses the scene frame instead of another animation loop.
- Smaller scenery tiles, indexed drawing bounds and cached Path2D geometry reduce painting work. Idle prepainting prepares the next journey; moves await preparation. Prepared return routes remain resident until arrival, then normal tile eviction resumes. Distant foliage animations pause. Whole-world bitmap baking remains prohibited.
- Answer stones on crossings use a soft contact shadow instead of grass. Wrong-answer return text now correctly describes returning, rather than retaining the previous congratulations message.

Validation: npm test and npm run check pass; ESLint reports no errors (two existing unused-import warnings in tools/words.test.mjs). Added travel-curve and ten-habitat route continuity/hop tests; existing adapter tests cover pause, world switches, cancellation and load recovery.

Browser checks: meadow bridge and stepping-stone travel; pause on bridge; portrait 390x844 to landscape 844x390 rotation and resume; ice world switch retaining progress; wrong-answer three-step return to start. Optional ?perf DOM counters reported zero scenery tiles painted while moving in these tested journeys, including the return. No console errors observed. These are desktop browser checks, not a measured before/after FPS benchmark or a real iPad/Safari performance guarantee.

Preview: http://localhost:8080/index.html?world=0&version=journey-11-final
No production deployment performed.
