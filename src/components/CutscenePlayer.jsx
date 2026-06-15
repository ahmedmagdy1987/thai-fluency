import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SkipForward } from 'lucide-react';

// Local copy of the prefers-reduced-motion check used across the flow
// components (see FirstLessonFlow.jsx). Kept inline so this component stays
// dependency-free and safe to render before any wiring exists.
function prefersReducedMotion() {
  return typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// CutscenePlayer — a mobile-safe, dependency-free wrapper around a native
// <video> for the short (~6s) between-mission / between-stage clips.
//
// Design contract: the flow can NEVER get stuck on this component.
//   - No `src`               → renders nothing and calls onEnded immediately.
//   - prefers-reduced-motion → skips the clip and calls onEnded immediately.
//   - play() rejected/blocked or media error → calls onEnded immediately
//     (so the caller falls through to its existing static celebration).
//   - A visible Skip / Continue button is ALWAYS rendered while playing.
//
// onEnded fires exactly once for the "clip finished or was bypassed" path;
// onSkip (falling back to onEnded when not provided) fires when the user taps
// the button. Callers can treat both as "advance the flow now".
export default function CutscenePlayer({
  src,
  poster,
  // Label for the always-visible button. While the clip plays we show "Skip";
  // some callers may prefer "Continue" — overridable per seam.
  skipLabel = 'Skip',
  // Hard safety net: if the video never reports `ended` (e.g. a stalled mobile
  // decode), advance anyway after this many ms. Generous default for a ~6s clip.
  maxDurationMs = 9000,
  onEnded,
  onSkip,
  // Optional aria-label for the overlay region.
  ariaLabel = 'Intro clip',
}) {
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);
  const videoRef = useRef(null);
  const doneRef = useRef(false);
  // Decide once, on mount, whether we even attempt to render the video. If
  // there is no clip or motion is reduced, we bypass entirely.
  const shouldPlay = !!src && !reducedMotion;
  const [failed, setFailed] = useState(false);

  // Single-fire completion. Every exit path (ended, error, skip, timeout,
  // bypass) routes through here so onEnded/onSkip can never double-fire and the
  // flow always advances exactly once.
  const finish = useRef(null);
  finish.current = (viaSkip) => {
    if (doneRef.current) return;
    doneRef.current = true;
    const video = videoRef.current;
    if (video) {
      try { video.pause(); } catch (_) { /* ignore */ }
    }
    if (viaSkip && typeof onSkip === 'function') onSkip();
    else if (typeof onEnded === 'function') onEnded();
  };

  // Bypass path: no clip or reduced motion. Fire onEnded once, on mount.
  useEffect(() => {
    if (shouldPlay) return undefined;
    finish.current(false);
    return undefined;
  }, [shouldPlay]);

  // Play path: attempt autoplay and arm the safety timeout. Mobile browsers
  // only allow autoplay when the video is muted + plays inline, both of which
  // are set on the element below. If play() still rejects (policy/blocked) we
  // bypass to the caller's static celebration.
  useEffect(() => {
    if (!shouldPlay) return undefined;
    const video = videoRef.current;
    let timer = 0;

    if (video) {
      const attempt = video.play();
      if (attempt && typeof attempt.then === 'function') {
        attempt.catch(() => { finish.current(false); });
      }
    }

    timer = window.setTimeout(() => { finish.current(false); }, maxDurationMs);
    return () => { if (timer) window.clearTimeout(timer); };
  }, [shouldPlay, maxDurationMs]);

  // Nothing to render on the bypass path. (onEnded already fired above.)
  if (!shouldPlay || failed) return null;

  return (
    <div className="cutscene-overlay" role="dialog" aria-modal="true" aria-label={ariaLabel}>
      <video
        ref={videoRef}
        className="cutscene-video"
        src={src}
        poster={poster || undefined}
        // Mobile-safe inline autoplay. Muted is REQUIRED for autoplay on iOS
        // Safari and Android Chrome / Capacitor WebViews.
        muted
        autoPlay
        playsInline
        webkit-playsinline="true"
        preload="auto"
        controls={false}
        disablePictureInPicture
        onEnded={() => finish.current(false)}
        onError={() => { setFailed(true); finish.current(false); }}
      />
      <button
        type="button"
        className="cutscene-skip-btn"
        onClick={() => finish.current(true)}
      >
        {skipLabel} <SkipForward size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
