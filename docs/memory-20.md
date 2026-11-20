# Memory pass 20 — 19 November 2026

Source: Safari Web Inspector timeline with the Memory instrument, published build (perf-19 + installable app),
recorded on the owner's Mac for 286 s with twelve world changes.

| Moment | Total | JavaScript | Page |
|---|---|---|---|
| Menu, first sample | 627 MB | 359 MB | 254 MB |
| Menu after scenery baked (12 s) | 869 MB | 450 MB | 401 MB |
| After 1st world change (82 s) | 1 164 MB | 636 MB | 508 MB |
| After 4 changes (153 s) | 1 622 MB | 1 111 MB | 490 MB |
| Peak (239 s) | 1 862 MB | 666 MB | 1 085 MB |

Twenty memory-pressure events, the first critical one at 186 s; seven critical in total. Processor load stayed
between 9 % and 20 %. Each world load froze the page for 0.5–0.75 s. The owner saw scenery stop appearing near the end,
which is what Safari does when it can no longer allocate canvases.

## Cause

`createWorld().loadTheme` registered `load` and `error` listeners on each new iframe. Both closed over the previous
scene and frame. The `error` listener never fired, so it stayed on the live frame and kept the previous scene's window
alive, whose frame kept the one before it, and so on. Canvases were already released on destroy, but each retained scene
still held its source SVG (15 000–38 000 nodes), path index and script heap.

Chromium, 1440×800 @2×, six world changes, forced GC: live documents 3 → 9 and DOM nodes 31 000 → 153 000 before;
3 → 3 and 31 000 → 15 000 after.

## Still open

- The level before any world change (0.6–0.9 GB on a Retina Mac window) is high and has not been reduced here.
  It needs a new recording, ideally from the iPad, to see what the fixed build settles at.
- Memory also crept up about 0.7 MB/s during play between world changes (450 → 498 MB of JavaScript in 60 s).
- World loads still block for 0.5–0.75 s while the scene is built.
- tools/test-world-picker-browser.py expects a `cameos` state key that the painted world does not report; it was
  already failing before this change.
