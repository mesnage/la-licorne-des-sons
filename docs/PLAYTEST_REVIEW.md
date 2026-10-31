# Rainbow adventure review

This is a developer review with automated browser playthroughs and visual inspection. No children or parents took
part in these tests. It does not establish commercial readiness or replace supervised family playtesting.

## Round 1 — scenery and movement

Replaced the moving rainbow trail with a fixed, seven-band bridge spanning more than 600 world units between
crystal stops 2 and 5. Paillette's feet follow the uphill and downhill surface, with a gentle body angle. Crystals
sit on that same route, and the bridge remains in place during questions and returns to the checkpoint.

Visual review at desktop, portrait phone and landscape phone sizes found that the first camera framing hid the
unicorn behind the phone HUD and exposed the panorama boundary. The revised camera leaves space above Paillette,
pulls back smoothly before the bridge, and fills the space beyond the panorama with the world's sky colour.
Landscape travel captions sit beside the HUD instead of covering the middle of the climb.

Birds use six lightweight SVG wing frames and independent gentle flight paths. They stop moving and flapping during
questions. Reduced-motion mode keeps them still and skips travel animations.

## Round 2 — child and parent usability

A pause dialog now protects against accidental activity changes. It stops the scene and audio, including during
answer feedback, a climb and a return to the refuge. Resume continues the existing journey; changing activity
explicitly starts a fresh journey. Escape resumes. Switching away from the page pauses the current activity.
The menu includes expandable parent guidance about crystals, refuges, local progress, rewards and French audio.

The focused browser suite exercises pauses in all three phases, frozen bird motion while reading, activity changes
during pending feedback, real climbs in desktop/phone/tablet layouts, and rotation during movement. It also repeats
12 activity-entry/exit loops and checks that scenery objects do not accumulate.

## Round 3 — learning and regression

The automated suites cover all five phonics modules and all three word levels, ten-crystal world transitions,
refuges at five, wrong-answer rollback, unique mastery credit, one reward per completed journey, and scene cleanup.
Pure geometry tests check connected bridge ends, the walking surface, bounded body angle and bird paths.
The content checker verifies the existing French recordings and phonics card rules.

Run from the repository with the local server active:

```bash
npm test
npm run check
npm run lint
python3 tools/test-rainbow-browser.py --screenshots /tmp/paillette-rainbow
python3 tools/test-prototype-browser.py
python3 tools/test-checkpoints-browser.py
```

A regression run exposed a local-server redirect that discarded the debug query parameter. `serve.json` disables
that URL rewriting, so explicit HTML preview URLs retain their parameters. This config applies to the local preview
server and does not change Cloudflare deployment settings.

## Before selling — supervised family review

Try the preview on a real iPad/Safari and an Android phone, with French audio enabled. Test both screen orientations
and device volume controls. Word prompts now use the shared recorded female narrator. Their pronunciation and playback need listening
on the actual device. The five phonics modules retain their recorded French audio.

During short, voluntary sessions with children aged 4–7 and a parent, observe whether they can:

- Start an appropriate activity and replay the prompt without explanation.
- Read the choices comfortably, including long words and multi-letter sounds.
- Understand where Paillette goes after an incorrect answer, before and after the refuge.
- Enjoy the rainbow and gags without losing attention to the letters.
- Pause, resume and complete the journey without an adult rescuing the interface.

Ask parents whether the refuge explanation, local saving and reward counts are clear. Note confusion, frustration,
accidental taps, audio failures and device slowdowns; fix recurring problems and repeat with another family.
If checkpoint setbacks discourage a child, revisit that rule with the owner before release. Store review notes
without names or other identifying information. Commercial readiness requires this evidence, not a claim based
only on automated checks.

## Recorded automated result — 31 October 2026

- 43 Node tests passed; lint passed.
- Content check passed: 58 sounds, 495 words, 685 recorded prompts and 18,870 card-generation trials.
- Main adventure browser suite passed all 130 questions across the five phonics modules and three word levels,
  rewards, real walking, Canvas/resizing and engine-failure recovery.
- Checkpoint browser suite passed returns in two worlds, unique progress credit, all gags and five device sizes.
- Rainbow browser suite passed real climbs, pauses, rotation, quiet birds and 12 scene-reset loops.

The current word activity uses recorded prompts; browser checks fetch and decode these files. These results apply to Chromium in the development environment;
actual French voice quality, Safari behaviour and comfort for children remain part of the family/device review.
