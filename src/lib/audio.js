// Centralized Thai pronunciation playback.
//
// Two backends, picked automatically:
//   - NATIVE (Capacitor APK): the @capacitor-community/text-to-speech plugin,
//     which drives the device's real Android/iOS TTS engine. The Web Speech
//     API is unreliable inside the Android WebView (often silent / no voices),
//     so native builds must not depend on it.
//   - WEB / PWA: the browser SpeechSynthesis API, hardened against the common
//     Chrome/Edge pitfalls (empty getVoices() until voiceschanged; cancel()
//     immediately before speak() dropping the utterance; idle auto-suspend).
//
// speakThai() always returns a Promise that RESOLVES (never rejects) when
// playback finishes or fails, so callers can reset a button's active/loading
// state in .finally() without risk of it sticking on.

import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

let _cachedThaiVoice = null;
let _voicesReady = false;

// Default Thai pronunciation rate. Tuned slower than typical device defaults
// because beginner review needs clear tones; owner feedback flagged the old
// 0.9-0.95 range as too fast. Keep in sync with DEFAULT_STATS.audioRate.
export const DEFAULT_AUDIO_RATE = 0.8;

// Cap applied to first-lesson and demo playback so brand-new learners always
// hear an extra-clear pace, even before they discover the speed setting.
export const BEGINNER_AUDIO_RATE = 0.72;

function isNative() {
  try { return Capacitor.isNativePlatform(); } catch (_) { return false; }
}

function clampRate(rate) {
  const r = typeof rate === 'number' && isFinite(rate) ? rate : DEFAULT_AUDIO_RATE;
  return Math.max(0.1, Math.min(2, r));
}

// Best-effort gender guess from a voice NAME only. Neither the Web Speech API
// nor most native TTS engines expose gender metadata, so this is a heuristic
// over whatever voices the device happens to have installed. The hints are
// deliberately conservative (real Thai voice names + plain "male"/"man") to
// avoid mis-tagging. `\bmale\b` does not match "female" (no word boundary before
// "male" inside "female"), so the two patterns don't collide.
const MALE_VOICE_HINT = /\bmale\b|\bman\b|niwat/i;
const FEMALE_VOICE_HINT = /\bfemale\b|\bwoman\b|premwadee|achara|kanya|narisa/i;

// The speaking style the voice picker should try to match. Driven by the
// user's Thai speaking style setting (stats.voice) via setPreferredVoiceGender.
// Matching is best-effort only: if the device has no Thai voice of the wanted
// gender, the best available Thai voice is used and audio keeps working.
let _preferredVoiceGender = 'male';

function _voiceHints() {
  return _preferredVoiceGender === 'female'
    ? { want: FEMALE_VOICE_HINT, avoid: MALE_VOICE_HINT }
    : { want: MALE_VOICE_HINT, avoid: FEMALE_VOICE_HINT };
}

// Update the preferred TTS voice gender and invalidate both resolver caches so
// the next playback re-picks. Safe to call repeatedly with the same value.
export function setPreferredVoiceGender(gender) {
  const next = gender === 'female' ? 'female' : 'male';
  if (next === _preferredVoiceGender) return;
  _preferredVoiceGender = next;
  _cachedThaiVoice = _resolveThaiVoice();
  _nativeVoiceIndex = undefined; // re-resolve on the next native speak()
}

function _isThaiVoice(v) {
  return !!((v.lang && v.lang.toLowerCase().startsWith('th')) || /thai/i.test(v.name || ''));
}

// Pick a Thai voice, PREFERRING one that matches the user's speaking style
// (male by default). Order: explicit gender-matching Thai voice -> a Thai
// voice not explicitly tagged as the other gender -> th-TH exact -> first
// Thai voice. Returns null only when the device has no Thai voice at all.
// Pronunciation must never break for the sake of gender, so every branch
// degrades gracefully.
function _resolveThaiVoice() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;
  const thai = voices.filter(_isThaiVoice);
  if (thai.length === 0) return null;
  const { want, avoid } = _voiceHints();
  const match = thai.find(v => want.test(v.name || '') && !avoid.test(v.name || ''));
  if (match) return match;
  return thai.find(v => !avoid.test(v.name || ''))
      || thai.find(v => v.lang === 'th-TH')
      || thai[0];
}

function _loadVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    _voicesReady = true;
    _cachedThaiVoice = _resolveThaiVoice();
  }
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  // Some engines populate voices synchronously, others fire voiceschanged.
  _loadVoices();
  if (typeof window.speechSynthesis.addEventListener === 'function') {
    window.speechSynthesis.addEventListener('voiceschanged', _loadVoices);
  } else {
    window.speechSynthesis.onvoiceschanged = _loadVoices;
  }
}

// Native (Capacitor) best-effort gender-matching Thai voice index.
// getSupportedVoices() returns the device voices with name + lang but usually
// NO gender, so we apply the same name heuristic. Cached until the preferred
// gender changes (setPreferredVoiceGender resets it): a number = a confident
// Thai voice index to pass to speak(); null = no confident match, let the
// engine use its default th-TH voice (the previous behavior). Never throws.
let _nativeVoiceIndex; // undefined = unresolved, null = resolved-none, number = index

async function _resolveNativeThaiVoiceIndex() {
  if (_nativeVoiceIndex !== undefined) return _nativeVoiceIndex;
  _nativeVoiceIndex = null;
  try {
    const res = await TextToSpeech.getSupportedVoices();
    const voices = (res && res.voices) || [];
    const thai = voices.map((v, i) => ({ v, i })).filter(({ v }) => _isThaiVoice(v));
    // Only override the engine default when we have a CONFIDENT gender match;
    // otherwise leave it to lang:'th-TH' so we never pick a worse voice.
    const { want, avoid } = _voiceHints();
    const match = thai.find(({ v }) => want.test(v.name || '') && !avoid.test(v.name || ''));
    if (match) _nativeVoiceIndex = match.i;
  } catch (_) {
    // getSupportedVoices unsupported or no voices — keep null (engine default).
  }
  return _nativeVoiceIndex;
}

// Native playback via the device TTS engine. Resolves when speech ends or on
// any failure (no Thai voice installed, plugin error, etc.).
function _speakNative(text, rate) {
  return (async () => {
    try {
      try { await TextToSpeech.stop(); } catch (_) { /* nothing playing */ }
      // Short settle after stop(): the engine's audio focus / output route can
      // still be winding down when speak() starts, which clips the first
      // syllable on some Android devices and Bluetooth routes.
      await new Promise(resolve => setTimeout(resolve, 80));
      const opts = {
        text,
        lang: 'th-TH',
        rate: clampRate(rate),
        pitch: 1.0,
        volume: 1.0,
        category: 'playback',
      };
      // Prefer a Thai voice matching the user's speaking style when the device
      // exposes one; fall back silently to the default th-TH voice (TTS voice
      // gender depends on the voices installed on the device).
      try {
        const idx = await _resolveNativeThaiVoiceIndex();
        if (typeof idx === 'number') opts.voice = idx;
      } catch (_) { /* keep default voice */ }
      await TextToSpeech.speak(opts);
    } catch (_) {
      // Device may lack a Thai TTS voice or the plugin may be unavailable.
      // Fail quietly; the caller's button state still resets.
    }
  })();
}

// Monotonic call counter so only the NEWEST speak request actually reaches
// synth.speak(). speak() is deferred (see below), so without this a second tap
// landing inside the deferral window would queue BOTH utterances (the engine
// looks idle to it) and they would play back to back, or even out of order.
let _webSpeakGen = 0;

// Web playback via SpeechSynthesis. Resolves on end/error and always within a
// safety timeout so a silent/stuck engine never leaves a caller hanging.
function _speakWeb(text, rate) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) { resolve(); return; }
    const synth = window.speechSynthesis;
    if (!_cachedThaiVoice) _cachedThaiVoice = _resolveThaiVoice();

    let settled = false;
    const finish = () => { if (!settled) { settled = true; resolve(); } };
    const safety = setTimeout(finish, 8000);

    const doSpeak = () => {
      try {
        const myGen = ++_webSpeakGen;
        if (synth.paused) synth.resume();
        // Only cancel when something is actually queued/playing. cancel() tears
        // down the engine's output route; doing it while idle just forces the
        // route to reopen, which is what clips the first syllable.
        const needsCancel = !!(synth.speaking || synth.pending);
        if (needsCancel) synth.cancel();

        const u = new SpeechSynthesisUtterance(text);
        u.lang = (_cachedThaiVoice && _cachedThaiVoice.lang) || 'th-TH';
        u.rate = clampRate(rate);
        u.pitch = 1;
        u.volume = 1;
        if (_cachedThaiVoice) u.voice = _cachedThaiVoice;
        u.onend = () => { clearTimeout(safety); finish(); };
        u.onerror = () => { clearTimeout(safety); finish(); };

        // Chrome bugs: speak() in the same tick as cancel() can be dropped
        // entirely, and speaking too soon after cancel() clips the first
        // syllable while the output stream reopens. Hence the longer gap
        // after a cancel and only a short tick when the engine was idle.
        setTimeout(() => {
          try {
            // A newer speak request arrived during the deferral: yield to it
            // (last tap wins) instead of queueing two utterances.
            if (myGen !== _webSpeakGen) { clearTimeout(safety); finish(); return; }
            synth.speak(u);
            // Chrome auto-suspends the engine after ~15s idle WITHOUT
            // reporting paused === true; resume() right after speak() is the
            // standard fix and is a harmless no-op on other engines.
            synth.resume();
          } catch (_) { clearTimeout(safety); finish(); }
        }, needsCancel ? 180 : 40);
      } catch (_) { clearTimeout(safety); finish(); }
    };

    if (_voicesReady) { doSpeak(); return; }

    // First-click race: voices not loaded yet. Wait briefly for voiceschanged.
    let fired = false;
    const onVoices = () => {
      if (fired) return;
      fired = true;
      _loadVoices();
      if (typeof synth.removeEventListener === 'function') {
        synth.removeEventListener('voiceschanged', onVoices);
      }
      doSpeak();
    };
    if (typeof synth.addEventListener === 'function') {
      synth.addEventListener('voiceschanged', onVoices);
    }
    setTimeout(() => { if (!fired) onVoices(); }, 250);
  });
}

// Speak a Thai string. Returns a Promise that always resolves (never rejects).
// Should only be called from a user gesture (no autoplay on load).
export function speakThai(text, rate = DEFAULT_AUDIO_RATE) {
  if (!text) return Promise.resolve();
  try {
    return isNative() ? _speakNative(text, rate) : _speakWeb(text, rate);
  } catch (_) {
    return Promise.resolve();
  }
}

// Best-effort stop of any in-flight speech (used on unmount / rapid taps).
export function stopSpeaking() {
  try {
    if (isNative()) { TextToSpeech.stop().catch(() => {}); return; }
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
  } catch (_) { /* ignore */ }
}

// True when pronunciation can be attempted. Native always has a TTS engine
// available (a missing Thai voice is handled at speak time); web depends on
// the SpeechSynthesis API existing.
export function ttsAvailable() {
  if (isNative()) return true;
  return typeof window !== 'undefined' && !!window.speechSynthesis;
}
