# Robin 17 — short prompt provenance

User authorized replacement of unverified short recordings on 2026-11-18.

All 31 audited LN/PS manifest entries now point to provenance-backed Robin clips:
- 19 existing letter excerpts matched the documented Robin full-game source recordings with normalized waveform correlation above 0.95. Source-file SHA-256 values were also matched to that batch.
- 12 replacements were extracted from newly generated contextual speech, with Robin voice ID ZLsOpArVEayz7qulwa9E, French language, Eleven v4. Timestamp alignments and original responses remain cached locally. Public source audio permits comparison on voice-review.html.

An initial 31-clip pronunciation-dictionary batch was rejected after speech recognition exposed spoken markup in several outputs. Those files and the experimental generator were moved to the ignored preview cache and are not in the game manifest. The work used 43 TTS requests in total (31 initial, 12 contextual) plus one pronunciation dictionary request. No automatic API retries.

All final clips decode; local Whisper checks ran on the 31 excerpts and the 12 new source recordings. Transcripts are retained in audio/short-robin-provenance.json. Recognition of isolated letters/glides is unreliable and several transcripts remain ambiguous; no automatic phonetic approval is claimed. Final human listening, especially of the combined sounds, remains pending. The listening page exposes both short clips and original context.

The voice audit is now part of npm run check. It verifies final manifest mappings, voice ID/provider, clip hashes and source hashes. There are no remaining entries in the prior 31-clip legacy exception list. Original game recordings are retained for rollback. Full tests/checks pass; browser playback of a final clip reports readyState 4 and no media error.

Preview: http://localhost:8081/index.html?version=robin-17
Listening review: http://localhost:8081/voice-review.html
Local only; not committed or deployed.
