# Audio Quality Plan — Tuk Talk Thai

Owner-facing plan for improving Thai pronunciation audio. Status as of
2026-06-16. This is a **decision/comparison document** — it does not generate any
audio or change code. It ends with a small, safe Stage-1 pilot recommendation.

## 1. Where the app stands today (verified in code)

Source: `src/lib/audio.js` (274 lines), `package.json`.

- **Playback is 100% on-device text-to-speech.** There are **no pre-recorded or
  pre-generated audio files** in the repo.
  - **Native (Capacitor APK):** `@capacitor-community/text-to-speech` drives the
    device's Android/iOS TTS engine (the Web Speech API is unreliable inside the
    Android WebView — often silent).
  - **Web / PWA:** the browser `SpeechSynthesis` API, hardened against the known
    Chrome/Edge pitfalls (empty `getVoices()` until `voiceschanged`, the
    `cancel()` race, etc.).
- **Rate** is intentionally slowed: `DEFAULT_AUDIO_RATE = 0.8`,
  `BEGINNER_AUDIO_RATE = 0.72` (Thai TTS defaults sound too fast for learners).
- **Speaker gender is best-effort only.** `MALE_VOICE_HINT` / `FEMALE_VOICE_HINT`
  are name-heuristics over whatever Thai voices the device happens to have
  installed; there is no guaranteed male/female voice and no guaranteed Thai
  voice at all on a given device.

### Known limitations of the current approach
- **Quality and availability vary wildly by device.** Many Android devices ship
  no `th-TH` voice → silent or wrong-language playback.
- **No quality guarantee** for tones (Thai is tonal; engine quality differs).
- **No reliable M/F control** (depends on installed voices).
- It is, however, **free, offline-capable, zero-storage, and zero-latency-to-
  ship** — which is why it is the right *bootstrap*, not the right *endgame*.

## 2. The four sourcing options, compared

| Dimension | (1) Device/Browser TTS *(current)* | (2) Cloud Thai TTS API | (3) AI-generated voice files | (4) Human-recorded native |
|---|---|---|---|---|
| **Pronunciation quality** | Variable; can be poor/none on low-end Android | Good–very good (Google/Azure `th-TH` neural) | Good if vendor supports Thai well; verify tones | **Best** (native speaker, correct tones/register) |
| **Tone accuracy** | Unreliable | Generally good | Must be tone-checked per clip | Best |
| **M / F speaker support** | Not guaranteed | Yes (multiple named voices) | Yes (voice selection) | Yes (hire 1 M + 1 F) |
| **Latency** | Instant (on device) | Network round-trip unless pre-fetched/cached | Zero at runtime (pre-rendered files) | Zero at runtime (files) |
| **File size / storage** | None | None (streamed) or cache | ~10–30 KB/clip Opus; ~4,000 cards ≈ 40–120 MB | Same as (3) |
| **Offline behavior** | Works offline | Needs network (unless pre-cached) | Fully offline once bundled/cached | Fully offline |
| **Cost** | Free | ~$4–16 / 1M chars (pay-per-use; cheap at this scale) | Per-char or per-min vendor fee; ElevenLabs-style | Highest upfront (per-clip or hourly VO rate) |
| **Caching** | N/A | Cache responses by text hash | Ship via PWA precache / Capacitor assets | Same |
| **Native review needed** | Per-device, impractical | Spot-check a sample | **Yes — every clip** before ship | Yes — but recorded by a native, so low risk |
| **Effort to ship** | Already shipped | Low (API + cache layer) | Medium (render pipeline + review) | High (casting, scripts, recording, review) |

## 3. Recommended path (staged, lowest-risk first)

1. **Keep device TTS as the universal fallback** — it must always work offline
   and on cards that have no recorded clip. Do **not** remove it.
2. **Add a non-breaking "play a file if one exists, else TTS" lookup.** Spec:
   a `getAudioClip(cardId, voice)` helper that returns a bundled/cached URL or
   `null`; `speakThai()` plays the clip when present and falls back to TTS
   otherwise. This is additive, needs no schema change, and lets recorded audio
   roll out **card-by-card** without a big-bang migration.
3. **Run a small Stage-1 pilot before committing to any vendor** (next section).

## 4. Stage-1 pilot (do this first — small, cheap, reversible)

- **Scope:** only the highest-traffic Stage 1 vocabulary + the Stage 1 mission
  phrases (~80–150 clips), in **both** male and female register.
- **Produce two candidate sets** for the same pilot script:
  - **Set A — Cloud neural TTS** (e.g. Google `th-TH` Neural2 / Azure `th-TH`):
    cheapest, fastest to generate, easy to regenerate.
  - **Set B — Human native VO** (e.g. a vetted Fiverr/native voice actor):
    quality ceiling.
- **Blind native review** of A vs B on tone correctness, naturalness, and
  learner clarity. Decide per-budget whether neural TTS is "good enough" or the
  human ceiling is worth it for core content.
- **Ship the winner for Stage 1 only**, via the option-2 file lookup, behind the
  TTS fallback. Measure (see retention doc §7 `audio_played`) before scaling to
  Stages 2–8.
- **Do not** mass-generate ~4,000 clips during the pilot — that is the scaling
  decision, made only after the pilot result.

## 5. Owner decisions required before finalizing

- **Budget ceiling** for audio (per-clip and total across ~645 cards now / ~4,000
  target).
- **Vendor preference:** paid cloud/AI (Google/Azure/ElevenLabs) vs. human VO
  (Fiverr/native actor) vs. hybrid (human for core Stage 1, TTS elsewhere).
- **Distribution:** bundle clips in the app (bigger download, fully offline) vs.
  CDN + PWA cache (smaller install, needs first-online).
- **Native reviewer:** who signs off tone/pronunciation before clips ship.

Until these are decided, the current device-TTS path remains the shipping
default and is safe to launch with (it is the documented Stage-1 fallback).
