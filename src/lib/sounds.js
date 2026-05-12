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
