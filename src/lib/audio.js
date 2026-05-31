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

function isNative() {
  try { return Capacitor.isNativePlatform(); } catch (_) { return false; }
}

function clampRate(rate) {
  const r = typeof rate === 'number' && isFinite(rate) ? rate : 0.9;
  return Math.max(0.1, Math.min(2, r));
}

function _resolveThaiVoice() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;
  return voices.find(v => v.lang === 'th-TH')
      || voices.find(v => v.lang && v.lang.toLowerCase().startsWith('th'))
      || voices.find(v => /thai/i.test(v.name))
      || null;
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

// Native playback via the device TTS engine. Resolves when speech ends or on
// any failure (no Thai voice installed, plugin error, etc.).
function _speakNative(text, rate) {
  return (async () => {
    try {
      try { await TextToSpeech.stop(); } catch (_) { /* nothing playing */ }
      await TextToSpeech.speak({
        text,
        lang: 'th-TH',
        rate: clampRate(rate),
        pitch: 1.0,
        volume: 1.0,
        category: 'playback',
      });
    } catch (_) {
      // Device may lack a Thai TTS voice or the plugin may be unavailable.
      // Fail quietly; the caller's button state still resets.
    }
  })();
}

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
        if (synth.paused) synth.resume();
        synth.cancel();

        const u = new SpeechSynthesisUtterance(text);
        u.lang = (_cachedThaiVoice && _cachedThaiVoice.lang) || 'th-TH';
        u.rate = clampRate(rate);
        u.pitch = 1;
        u.volume = 1;
        if (_cachedThaiVoice) u.voice = _cachedThaiVoice;
        u.onend = () => { clearTimeout(safety); finish(); };
        u.onerror = () => { clearTimeout(safety); finish(); };

        // Chrome bug: speak() in the same tick as cancel() can be dropped.
        setTimeout(() => {
          try { synth.speak(u); } catch (_) { clearTimeout(safety); finish(); }
        }, 60);
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
export function speakThai(text, rate = 0.9) {
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
