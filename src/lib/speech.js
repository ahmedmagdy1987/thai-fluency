// ─────────────────────────────────────────────────────────────────────────────
// SPEECH RECOGNITION — DETECTION + UPGRADE SEAM ONLY (Pass 2).
//
// This file is the INPUT-side mirror of the output-side `ttsAvailable()` in
// src/lib/audio.js. It provides:
//   1. `speechRecognitionAvailable()` — the feature gate for the `[gated]`
//      speaking exercises (exercise-types.md §7/§8/§11.1);
//   2. the `CoarseRecognizer` interface (JSDoc typedef — plain JS, not TS);
//   3. `getRecognizer(stats)` — the upgrade seam that returns the FREE browser
//      recognizer today and is structured so a future PAID `PronunciationScorer`
//      slots in behind the SAME interface when `VITE_PRONUNCIATION_SCORER` is set
//      AND the `enhancedReview` entitlement allows (exercise-types.md §11.3).
//
// WHAT THIS FILE DELIBERATELY DOES NOT DO (out of scope until Pass 5 / needs-owner):
//   • It does NOT build the browser mic capture / SpeechRecognition wiring — the
//     free recognizer here is a documented PLACEHOLDER whose `listen()` throws.
//     Pass 5 (SpeakingExercise.jsx) replaces the placeholder body; the marked
//     block below shows exactly where that wiring lands.
//   • It does NOT integrate any paid pronunciation API and adds ZERO npm deps.
//     The paid scorer is runtime-injected (Supabase Edge Function, mirroring how
//     the Stripe/OneSignal SDKs are loaded), NEVER `npm i` — `loadPronunciationScorer()`
//     is a stub returning null until that ships and `enhancedReview` is flipped
//     from COMING_SOON to AVAILABLE (an owner decision, entitlements.js:50).
//
// HONEST LIMIT (exercise-types.md §7, FOUNDATION §5): the free browser verdict is
// a WORD match — "did the app understand you?" — and CANNOT grade tone (the
// engine auto-corrects a mistoned attempt toward the nearest real word). Only the
// paid `PronunciationScorer.score()` produces per-tone accuracy. Nothing here may
// be advertised or labelled as tone scoring.
// ─────────────────────────────────────────────────────────────────────────────

import { Capacitor } from '@capacitor/core';
import { canUseFeature } from '../config/entitlements.js';

// Same guarded native check as src/lib/audio.js (isNative). Native (Capacitor
// APK / iOS) has no reliable browser SpeechRecognition in the WebView, so the
// coarse path is unavailable there unless a native recognizer plugin is added —
// which would be a new dependency, out of scope.
function isNative() {
  try { return Capacitor.isNativePlatform(); } catch (_) { return false; }
}

/**
 * True when browser speech RECOGNITION can be attempted. Mirrors the
 * `ttsAvailable()` idiom (src/lib/audio.js:271-274): native → false (no reliable
 * WebView SpeechRecognition); web → true iff `window.SpeechRecognition` or the
 * `webkit`-prefixed variant exists.
 *
 * GATING RULE (FOUNDATION §1): a `[gated]` speaking exercise renders ONLY when
 * this is true; when false it renders NOTHING — no button, no "unsupported" stub
 * (mirror SocialLinks.jsx returning null). `mastery-spoken` is therefore
 * structurally unreachable on iOS Safari / Firefox / in-app webviews / native and
 * may NEVER be required for completion, unlock, or streak (FOUNDATION §6).
 *
 * @returns {boolean}
 */
export function speechRecognitionAvailable() {
  if (isNative()) return false;
  return typeof window !== 'undefined'
    && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

// ── Type contracts (JSDoc typedefs — documentation only; ship as plain JS) ────

/**
 * A coarse WORD verdict. Never a tone judgement.
 * @typedef {'correct'|'close'|'wrong'} SpeakVerdict
 */

/**
 * @typedef {Object} CoarseResult
 * @property {string} transcript        What the engine heard.
 * @property {SpeakVerdict} verdict      WORD match to `target` — NOT tone.
 */

/**
 * The FREE-tier interface. `SpeakingExercise.jsx` (Pass 5) consumes this;
 * `lib/speech.js` provides it via `browserCoarseRecognizer()`.
 * @typedef {Object} CoarseRecognizer
 * @property {() => boolean} available   = speechRecognitionAvailable().
 * @property {(opts: { lang: 'th-TH', target: string }) => Promise<CoarseResult>} listen
 *           Capture one utterance and return a coarse word verdict against
 *           `target` (which is `card.thai`, NEVER the `ph` romanization).
 */

/**
 * The PAID upgrade — extends CoarseRecognizer with per-tone accuracy the free
 * browser path CANNOT produce. Ships ONLY when `VITE_PRONUNCIATION_SCORER` is set
 * AND `enhancedReview` is flipped to AVAILABLE. Runtime-injected, never bundled.
 * @typedef {Object} PronunciationScorer
 * @property {() => boolean} available
 * @property {(opts: { lang: 'th-TH', target: string }) => Promise<CoarseResult>} listen
 * @property {(opts: { lang: 'th-TH', target: string, expectedTone: string }) => Promise<{
 *   transcript: string,
 *   verdict: SpeakVerdict,
 *   toneAccuracy: number,
 *   perTone?: { expected: string, heard: string }
 * }>} score  The paid-only signal (0..1 tone accuracy).
 */

// A shared not-implemented error for the placeholder mic body (Pass 5 removes it).
const NOT_WIRED = 'speech.js: browser SpeechRecognition capture is not wired yet '
  + '(lands in Pass 5 / SpeakingExercise.jsx). getRecognizer() resolves the seam; '
  + 'listen() has no mic implementation in Pass 2.';

/**
 * The FREE browser recognizer. In Pass 2 this is a DETECTION + SEAM placeholder:
 * `available()` is fully live (drives the gate), but `listen()` is a stub that
 * throws — there is no mic logic yet. Pass 5 replaces ONLY the marked block.
 *
 * @returns {CoarseRecognizer}
 */
export function browserCoarseRecognizer() {
  return {
    available: () => speechRecognitionAvailable(),
    // eslint-disable-next-line no-unused-vars
    listen: async ({ lang = 'th-TH', target } = {}) => {
      // ┌─ PASS 5 WIRING LANDS HERE ────────────────────────────────────────────┐
      // │ const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;│
      // │ const rec = new Rec();                                                 │
      // │ rec.lang = lang; rec.interimResults = false; rec.maxAlternatives = 3;  │
      // │ // start on a user gesture, resolve on `result`, guard `error`/`end`   │
      // │ // with a safety timeout (mirror the audio.js _speakWeb() hardening);  │
      // │ // then map the transcript → 'correct'|'close'|'wrong' by WORD match   │
      // │ // to `target` (= card.thai, NEVER ph). No tone judgement — see        │
      // │ // HONEST LIMIT at the top of this file.                               │
      // └────────────────────────────────────────────────────────────────────────┘
      throw new Error(NOT_WIRED);
    },
  };
}

/**
 * Runtime-inject the PAID pronunciation scorer. NOT built in Pass 2 — returns
 * null so `getRecognizer()` always falls back to the free recognizer. When it
 * ships it will load a script from a Supabase Edge Function (never `npm i`),
 * mirroring how the Stripe/OneSignal SDKs are runtime-loaded, and return a
 * `PronunciationScorer`. Flipping `enhancedReview` to AVAILABLE is the owner
 * decision that opens this seam (entitlements.js:50; FOUNDATION §7).
 *
 * @returns {PronunciationScorer|null}
 */
export function loadPronunciationScorer() {
  return null; // not shipped; the seam stays closed until it actually exists
}

// Is the paid scorer both flag-enabled AND entitlement-permitted for this user?
// `VITE_PRONUNCIATION_SCORER` is a Vite build flag; guarded so plain-node imports
// (validators) don't throw when `import.meta.env` is undefined.
function pronunciationScorerFlagSet() {
  try {
    return !!(import.meta && import.meta.env && import.meta.env.VITE_PRONUNCIATION_SCORER);
  } catch (_) {
    return false;
  }
}

/**
 * True only when BOTH the build flag is set AND the user is entitled to the
 * (COMING_SOON today) `enhancedReview` feature. Returns false for everyone until
 * the owner flips both — keeps advertised-vs-available honest (FOUNDATION §7/§9).
 * @param {object} stats
 * @returns {boolean}
 */
export function pronunciationScorerEnabled(stats) {
  return pronunciationScorerFlagSet() && canUseFeature('enhancedReview', stats);
}

/**
 * THE UPGRADE SEAM. Resolves the free browser recognizer vs. a future paid
 * scorer behind the SAME `CoarseRecognizer` interface:
 *   • paid path when `pronunciationScorerEnabled(stats)` AND the scorer loads;
 *   • otherwise the free, coarse browser recognizer feature-gated by §11.1.
 * A caller that only needs the coarse `listen()` never has to know which it got.
 *
 * @param {object} [stats]  server-authoritative tier/entitlement state.
 * @returns {CoarseRecognizer|PronunciationScorer}
 */
export function getRecognizer(stats) {
  if (pronunciationScorerEnabled(stats)) {
    const paid = loadPronunciationScorer();
    if (paid) return paid;
  }
  return browserCoarseRecognizer();
}
