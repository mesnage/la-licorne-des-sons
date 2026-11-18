# UX 10 — adventure controls and rotation

## Findings and fixes

- Workshop world selection was disabled throughout feedback and walking. It now stays available. While travelling, the latest selected world is applied at the next stop, after recording the arrived position. Opening the picker pauses movement; closing resumes it. Questions, partial sentence answers and crystals stay in the host model.
- Reading-path units had no world selector. A labeled selector now provides all ten habitats without restarting the unit. It uses the same safe travel handling.
- Rewards were accessible only from the menu/finish screen. The pause menu now includes both world selection and the reward wheel; opening/closing rewards leaves the adventure paused.
- The wheel exceeded the landscape dialog height. Its layout now puts the complete wheel and spin button side by side on short screens, sets explicit square dimensions, keeps the close control reachable and resets scroll after orientation changes. Reopening an already-open reward dialog is safe. Rotation never calls the reward-store spin operation.
- Reading-path headings and crystal groups crowded short screens. Both now have compact landscape layouts. Long curriculum answer cards use a single column on phones.
- A failed habitat load could leave the old scene paused and an unusable loading promise. Failure now restores the old scene and permits retry.
- The workshop explicitly reset when restored from the browser's back/forward cache. Cache restoration now retains the current session. This does not restore an adventure after a full page reload: the test browser reloaded rather than using this cache, so that navigation still returns to the menu.

## Validation

Full npm test and npm run check pass. ESLint has no errors (two pre-existing unused imports in tools/words.test.mjs). Added regressions for switching during travel, latest-selection behavior, cancellation and failed-world recovery.

Browser checks at 390×844 and 844×390: reward dialog in both orientations; wheel/controls remain visible after rotation; switching dinosaur → ice during alphabet travel arrives at B with exactly one crystal; switching again through pause keeps B and its choices; nested reward dialog returns to pause; curriculum switching preserves the current question. Short-screen reading headings and progress reviewed. No new reward credit was issued for testing, and spinning during physical-device rotation has not been tested on an iPad/Safari.

Local entry: index.html?world=7&version=ux-10. This pass has not been deployed.
