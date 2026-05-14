// Lightweight Web Audio sound effects for in-app feedback.
//
// Three sounds: a positive blip for an Easy rating, a two-note "tin tin"
// for the 10-card milestone, and a fuller flourish for mission/stage
// completion. All generated on the fly — no audio assets shipped.
//
// AudioContext is created lazily on first call (browsers require a user
// gesture before audio can play). Every helper is wrapped in try/catch
// and silently no-ops on failure so a missing API never breaks the UI.

let _ctx = null;
let _ctxFailed = false;

function getCtx() {
  if (_ctx) return _ctx;
  if (_ctxFailed) return null;
  if (typeof window === 'undefined') return null;
  try {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) { _ctxFailed = true; return null; }
    _ctx = new Ctor();
    return _ctx;
  } catch (_) {
    _ctxFailed = true;
    return null;
  }
}

// Resume the context if it was suspended (browser autoplay policies put new
// contexts into 'suspended' until the first user gesture).
function ensureRunning(ctx) {
  if (!ctx) return;
  if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
    try { ctx.resume(); } catch (_) { /* ignore */ }
  }
}

// Schedule a single tone with a short attack/release envelope. Time and
// duration are in seconds. Volume is the peak gain (0..1).
function tone(ctx, freq, startSec, durSec, peak = 0.18, type = 'sine') {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startSec);
  // Envelope: tiny attack, exponential decay
  const t0 = ctx.currentTime + startSec;
  const t1 = t0 + durSec;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t1);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t1 + 0.02);
}

// Easy / correct-answer blip. Short rising sine — ~120ms.
export function playEasy() {
  const ctx = getCtx();
  if (!ctx) return;
  try {
    ensureRunning(ctx);
    tone(ctx, 660, 0,     0.06, 0.16, 'sine');
    tone(ctx, 990, 0.06,  0.10, 0.14, 'sine');
  } catch (_) { /* ignore */ }
}

// 10-card milestone "tin tin" — two clear chime notes (C5, E5).
export function playMilestone() {
  const ctx = getCtx();
  if (!ctx) return;
  try {
    ensureRunning(ctx);
    tone(ctx, 523.25, 0,     0.18, 0.22, 'triangle'); // C5
    tone(ctx, 659.25, 0.16,  0.22, 0.22, 'triangle'); // E5
  } catch (_) { /* ignore */ }
}

// Mission / stage complete flourish — C major arpeggio + a held top note.
export function playCelebration() {
  const ctx = getCtx();
  if (!ctx) return;
  try {
    ensureRunning(ctx);
    // C5 — E5 — G5 — C6 ascending
    tone(ctx, 523.25, 0.00, 0.14, 0.22, 'triangle');
    tone(ctx, 659.25, 0.10, 0.14, 0.22, 'triangle');
    tone(ctx, 783.99, 0.20, 0.14, 0.22, 'triangle');
    tone(ctx, 1046.50, 0.30, 0.36, 0.24, 'triangle');
    // A soft sine layer for body
    tone(ctx, 523.25, 0.30, 0.36, 0.10, 'sine');
  } catch (_) { /* ignore */ }
}

// ====================================================================
// Character reaction sounds
//
// Each character has a sound profile (see data/characters.js) describing
// the notes, durations, oscillator type, and peak gain for four
// reactions: select / correct / wrong / celebrate. These helpers look
// up the profile by character id and schedule the notes sequentially.
//
// All four helpers are autoplay-safe (lazy AudioContext, ensureRunning),
// wrapped in try/catch, and silent no-ops if Web Audio is unavailable.
// They never interfere with the Thai pronunciation TTS, which uses a
// separate browser API (speechSynthesis).
// ====================================================================

import { resolveCharacter } from '../data/characters.js';

function getProfile(characterId, slot) {
  try {
    const char = resolveCharacter(characterId);
    const profile = char && char.soundProfile && char.soundProfile[slot];
    if (!profile || !Array.isArray(profile.notes) || profile.notes.length === 0) return null;
    return profile;
  } catch (_) {
    return null;
  }
}

function playProfile(profile, gainScale = 1) {
  const ctx = getCtx();
  if (!ctx || !profile) return;
  try {
    ensureRunning(ctx);
    let t = 0;
    const type = profile.type || 'sine';
    const peak = (profile.peak || 0.16) * gainScale;
    profile.notes.forEach((freq, i) => {
      const dur = (profile.dur && profile.dur[i]) || 0.12;
      tone(ctx, freq, t, dur, peak, type);
      t += Math.max(0.04, dur - 0.04);
    });
  } catch (_) { /* ignore */ }
}

export function playCharacterSelect(characterId) {
  const profile = getProfile(characterId, 'select');
  // Lower gain — this fires on every reveal, shouldn't be intrusive.
  playProfile(profile, 0.85);
}

export function playCharacterCorrect(characterId) {
  const profile = getProfile(characterId, 'correct');
  playProfile(profile, 1.0);
}

export function playCharacterWrong(characterId) {
  const profile = getProfile(characterId, 'wrong');
  // Wrong should feel supportive, not punishing — keep gain modest.
  playProfile(profile, 0.85);
}

export function playCharacterCelebrate(characterId) {
  const profile = getProfile(characterId, 'celebrate');
  playProfile(profile, 1.0);
}
