# Painted meadow graphics trial

Branch: `codex/storybook-meadow`. Open `/meadow-preview.html` using the local server, or select **Essayer la prairie peinte** on the home screen.

This is a single-world, six-question vowel preview adapted from the supplied `paillette-styleframe.html`. It retains its painted washes, baked scenery, parallax, swaying foliage, original unicorn and fox, wildlife, flowering answer stones and castle. HTML, CSS and the scene module are separated. Recorded `L:` prompts use the existing audio engine; controls do not wait for playback. The start button unlocks audio. Pause and hidden-tab handling suspend scene time and queued feedback. Reduced motion freezes ambient animation. Only active answer stones are exposed to assistive technology.

The scope is visual review, not a curriculum migration: no mastery, curriculum completion or reward credits are written. Wrong answers allow retry within this preview. Existing activities and their checkpoint rules are unchanged. The supplied handoff's full rebuild and pedagogical proposals were treated as context rather than instructions for this trial.

Validation: existing data checks and unit suites pass; ESLint passes with two existing unused-import warnings in tools/words.test.mjs. Browser review covered desktop and 390 × 844, six crystals through the castle, pause/resume and console errors. Real iPad/Safari smoothness and listening remain to be reviewed. The inherited scenery uses many canvases; this trial does not establish a device memory or frame-rate budget for a full rollout.

Optional developer routes: `#demo` answers automatically; `?debug` exposes the preview state and answer helpers. Preview progress intentionally resets on reload.

## Ground and perspective iteration

The meadow now occupies a broad plane rather than a narrow grass strip. The route curves in depth with variable width; Paillette and the fox follow its elevation and gently change scale. Rabbit lanes span the clearing, and flower/rock sizes vary with depth. Portrait framing lifts the play area while retaining larger character and answer sizes. Background layers remain baked once. The scene viewport clips overflow without becoming a keyboard-focus scroll container.

Visual references: the meadow clearing still from *The Great Gull* on Knowledge Kids (https://www.knowledgekids.ca/videos/puffin-rock/s2/e6/great-gull) and Puffin Rock Habitats grasslands material (https://puffinrockhabitats.com/grasslands). These inform general staging only; the game retains its original artwork. No full episode playback was reviewed.
