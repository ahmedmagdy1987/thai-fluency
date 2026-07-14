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

// ── Coarse WORD-match verdict (free tier) ─────────────────────────────────────
// Maps a browser transcript to 'correct'|'close'|'wrong' by comparing the Thai
// the engine RETURNED against `target` (= card.thai, NEVER ph). This is a WORD
// match, never a tone judgement: the engine has already snapped a mistoned
// attempt to the nearest real Thai word, so tone information is gone by the time
// we ever see the transcript (see HONEST LIMIT at the top of this file). Pure,
// dependency-free — safe to import where the SpeechRecognition API is absent.

// Normalise for comparison: NFC, fold whitespace to single spaces (the engine may
// insert spaces between recognised words; `card.thai` may or may not have them),
// and strip punctuation + the Thai repetition/ellipsis marks. We deliberately
// KEEP Thai letters and their spelling marks intact — we are string-matching the
// word the engine heard against the Thai script, never scoring tone.
function normalizeThai(s) {
  return (s == null ? '' : String(s))
    .normalize('NFC')
    .replace(/[\s\u200b\u200c\u200d]+/g, ' ')
    .replace(/[.,!?;:"'`~^*_/\\()[\]{}<>…ฯๆ|]/g, '')
    .trim()
    .toLowerCase();
}

function thaiTokens(s) {
  const n = normalizeThai(s);
  return n ? n.split(' ').filter(Boolean) : [];
}

// Levenshtein ratio — a coarse similarity for single-word (space-less) Thai,
// where token overlap cannot help. 1 = identical, 0 = nothing in common.
function similarity(a, b) {
  const m = a.length, n = b.length;
  if (!m && !n) return 1;
  if (!m || !n) return 0;
  let prev = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    const cur = new Array(n + 1);
    cur[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = cur;
  }
  return 1 - prev[n] / Math.max(m, n);
}

/**
 * Coarse verdict for one utterance. `alternatives` is the list of transcript
 * strings the engine offered (best first). Returns 'correct' on an exact
 * normalised match of ANY alternative; 'close' on strong containment / token
 * overlap / character similarity; otherwise 'wrong'. NEVER a tone comparison.
 * @param {string[]} alternatives
 * @param {string} target  = card.thai (never ph)
 * @returns {SpeakVerdict}
 */
function coarseVerdict(alternatives, target) {
  const targetNorm = normalizeThai(target);
  if (!targetNorm) return 'wrong';
  const alts = (alternatives || []).map(normalizeThai).filter(Boolean);
  if (alts.length === 0) return 'wrong';
  if (alts.some((a) => a === targetNorm)) return 'correct';

  const targetTokenSet = new Set(thaiTokens(target));
  let best = 'wrong';
  for (const a of alts) {
    if (a.includes(targetNorm) || targetNorm.includes(a)) { best = 'close'; continue; }
    if (targetTokenSet.size > 0) {
      const heardTokens = a.split(' ').filter(Boolean);
      const hits = heardTokens.filter((w) => targetTokenSet.has(w)).length;
      if (hits / targetTokenSet.size >= 0.5) { best = 'close'; continue; }
    }
    if (similarity(a, targetNorm) >= 0.7) best = 'close';
  }
  return best;
}

/**
 * The FREE browser recognizer. `available()` drives the feature gate; `listen()`
 * captures one utterance via the browser `SpeechRecognition` API (constructed
 * lazily, th-TH) and returns a COARSE word verdict against `card.thai` — never a
 * tone judgement (HONEST LIMIT, top of file). The paid `PronunciationScorer` seam
 * (getRecognizer / loadPronunciationScorer, below) is unchanged and unaffected.
 *
 * @returns {CoarseRecognizer}
 */
export function browserCoarseRecognizer() {
  return {
    available: () => speechRecognitionAvailable(),
    // Capture ONE utterance and return a coarse WORD verdict against `target`
    // (= card.thai, NEVER ph). MUST be called from a user gesture — the browser
    // prompts for mic permission on the first `start()`. The SpeechRecognition
    // instance is constructed lazily HERE (never at module load) so this module
    // imports cleanly where the API is absent (validators / native / SSR).
    //
    // Resolves { transcript, verdict } on a recognition result. REJECTS with an
    // Error carrying a `.code` so the caller can branch:
    //   'not-allowed' | 'service-not-allowed' → permission denied (hide mic path)
    //   'no-speech' | 'audio-capture' | 'aborted' | 'network' | 'timeout'
    //     | 'start-failed' | 'unsupported'    → transient / retryable, non-fatal
    // It never grades tone — see HONEST LIMIT at the top of this file.
    listen: ({ lang = 'th-TH', target } = {}) => new Promise((resolve, reject) => {
      const Rec = typeof window !== 'undefined'
        && (window.SpeechRecognition || window.webkitSpeechRecognition);
      if (!Rec) {
        const err = new Error('speech.js: SpeechRecognition unavailable');
        err.code = 'unsupported';
        reject(err);
        return;
      }

      let rec;
      let settled = false;
      let timer = null;
      const finish = (fn, val) => {
        if (settled) return;
        settled = true;
        if (timer) clearTimeout(timer);
        try { if (rec && typeof rec.abort === 'function') rec.abort(); } catch (_) { /* ignore */ }
        fn(val);
      };
      const fail = (code) => {
        const err = new Error(`speech.js: recognition ${code}`);
        err.code = code;
        finish(reject, err);
      };

      try {
        rec = new Rec();
      } catch (_) {
        fail('start-failed');
        return;
      }
      rec.lang = lang;
      rec.interimResults = false;
      rec.maxAlternatives = 3;
      try { rec.continuous = false; } catch (_) { /* some engines lack it */ }

      // Safety timeout: some engines never fire `end`/`error` if the OS dialog is
      // dismissed or the user never speaks. Mirror the audio.js _speakWeb()
      // hardening so a stuck recognizer can never hang the UI forever.
      timer = setTimeout(() => fail('timeout'), 12000);

      rec.onresult = (event) => {
        const alts = [];
        try {
          const res = event && event.results && event.results[0];
          if (res) {
            for (let i = 0; i < res.length; i++) {
              const t = res[i] && res[i].transcript;
              if (typeof t === 'string') alts.push(t);
            }
          }
        } catch (_) { /* ignore malformed result */ }
        const transcript = alts[0] || '';
        finish(resolve, { transcript, verdict: coarseVerdict(alts, target) });
      };

      rec.onerror = (event) => fail((event && event.error) || 'error');

      // If recognition ends with no result and no error, nothing was heard.
      rec.onend = () => { if (!settled) fail('no-speech'); };

      try {
        rec.start();
      } catch (_) {
        // start() throws if called twice or outside a user gesture.
        fail('start-failed');
      }
    }),
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
