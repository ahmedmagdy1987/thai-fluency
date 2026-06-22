import React, { useEffect, useRef, useState } from 'react';
import { SkipForward, Volume2, VolumeX } from 'lucide-react';

// Full-screen stage-completion cinematic player. Built to NEVER block
// progression and to never grant rewards (the caller owns XP/celebrations).
//
// Safety contract — every exit path routes through finish() exactly once:
//   - No src, prefers-reduced-motion, or Data Saver → static celebration
//     fallback that auto-advances (and has a Continue button).
//   - Autoplay blocked → poster + Skip/Continue remain; the safety timeout
//     still advances.
//   - Media error → swap to the static fallback (auto-advances).
//   - Esc or Skip → advance immediately.
//
// Plays muted+inline (required for mobile/WebView autoplay) with a sound toggle
// so the user can opt into the music/SFX. Watched-state persistence is the
// caller's job (onClose).
function prefersReducedMotion() {
  return typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function dataSaverOn() {
  if (typeof navigator === 'undefined') return false;
  const c = navigator.connection || navigator.webkitConnection || navigator.mozConnection;
  return !!(c && c.saveData);
}

export default function StageCinematicOverlay({
  src,
  poster,
  courseComplete = false,
  // Safety net: advance even if the clip never reports `ended` (stalled decode).
  maxDurationMs = 12000,
  onClose,
}) {
  const videoRef = useRef(null);
  const doneRef = useRef(false);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);

  // Decide once whether to attempt playback at all.
  const bypass = !src || prefersReducedMotion() || dataSaverOn();

  const finish = useRef(null);
  finish.current = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    const v = videoRef.current;
    if (v) { try { v.pause(); } catch (_) { /* ignore */ } }
    if (typeof onClose === 'function') onClose();
  };

  // Bypass / failed path: show the static celebration briefly, then advance.
  useEffect(() => {
    if (!bypass && !failed) return undefined;
    const t = window.setTimeout(() => finish.current(), 1600);
    return () => window.clearTimeout(t);
  }, [bypass, failed]);

  // Play path: attempt muted autoplay + arm the safety timeout.
  useEffect(() => {
    if (bypass) return undefined;
    const v = videoRef.current;
    let timer = 0;
    if (v) {
      const p = v.play && v.play();
      if (p && p.catch) p.catch(() => { /* autoplay blocked; poster + Skip remain */ });
    }
    timer = window.setTimeout(() => finish.current(), maxDurationMs);
    return () => { if (timer) window.clearTimeout(timer); };
  }, [bypass, maxDurationMs]);

  // Esc always advances.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { e.preventDefault(); finish.current(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggleSound = () => {
    const v = videoRef.current;
    const next = !muted;
    setMuted(next);
    if (v) {
      v.muted = next;
      if (!next) { const p = v.play(); if (p && p.catch) p.catch(() => { /* ignore */ }); }
    }
  };

  const label = courseComplete ? 'Course Complete!' : 'Stage Complete!';

  if (bypass || failed) {
    return (
      <div
        className={`cine-overlay cine-fallback${courseComplete ? ' cine-course' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
      >
        <div className="cine-fallback-card">
          <div className="cine-fallback-emoji" aria-hidden="true">🎉</div>
          <div className="cine-fallback-title">{label}</div>
        </div>
        <div className="cine-controls">
          <button type="button" className="cine-skip-btn" onClick={() => finish.current()}>
            Continue <SkipForward size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`cine-overlay${courseComplete ? ' cine-course' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={courseComplete ? 'Course complete celebration' : 'Stage complete celebration'}
    >
      <video
        ref={videoRef}
        className="cine-video"
        src={src}
        poster={poster || undefined}
        muted={muted}
        autoPlay
        playsInline
        webkit-playsinline="true"
        preload="auto"
        controls={false}
        disablePictureInPicture
        onEnded={() => finish.current()}
        onError={() => setFailed(true)}
      />
      <div className="cine-controls">
        <button
          type="button"
          className="cine-sound-btn"
          onClick={toggleSound}
          aria-label={muted ? 'Unmute' : 'Mute'}
          aria-pressed={!muted}
        >
          {muted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
        </button>
        <button type="button" className="cine-skip-btn" onClick={() => finish.current()}>
          Skip <SkipForward size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
