import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';

// First-run coach-mark tutorial. Spotlights real controls in the live UI with a
// small anchored card, step by step. Design goals:
//   - Never covers the highlighted control (the card is placed outside the
//     spotlight rect; four dim panels surround the hole and block interaction).
//   - Scrolls each target into view before measuring.
//   - Responsive: the card width and position are clamped to the viewport, so
//     it works from 320px phones to wide desktops.
//   - Keyboard accessible: Esc skips, ArrowRight/Enter advances, ArrowLeft goes
//     back; the card is focused on each step.
//   - Dark mode is handled in CSS (it reads the app's theme variables).
//
// A step targets a `[data-tutorial="..."]` element by selector. If a step's
// target can't be found (e.g. a nav item hidden behind a responsive
// breakpoint), the card centers and still explains the step, so the flow never
// dead-ends.
const PAD = 8; // padding around the spotlighted element

function findTarget(selector) {
  if (typeof document === 'undefined') return null;
  const els = Array.from(document.querySelectorAll(selector));
  // Prefer the visible match (the app renders both a desktop sidebar and a
  // mobile bottom nav; only one is on-screen at a time).
  return els.find((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && el.offsetParent !== null;
  }) || els[0] || null;
}

export default function GuidedTutorial({ steps, onFinish }) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState(null);
  const cardRef = useRef(null);

  const step = steps[index];
  const isFirst = index === 0;
  const isLast = index === steps.length - 1;

  const measure = useCallback(() => {
    if (!step) return;
    const el = findTarget(step.target);
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step]);

  // Scroll the target into view, then measure a few times as the scroll settles.
  useLayoutEffect(() => {
    if (!step) return undefined;
    const el = findTarget(step.target);
    if (el && el.scrollIntoView) {
      try { el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' }); }
      catch (_) { el.scrollIntoView(); }
    }
    measure();
    const t1 = window.setTimeout(measure, 200);
    const t2 = window.setTimeout(measure, 460);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
  }, [step, measure]);

  // Keep the spotlight aligned on resize / scroll.
  useEffect(() => {
    const onChange = () => measure();
    window.addEventListener('resize', onChange);
    window.addEventListener('scroll', onChange, true);
    return () => {
      window.removeEventListener('resize', onChange);
      window.removeEventListener('scroll', onChange, true);
    };
  }, [measure]);

  // Focus the card so keyboard users land inside the dialog each step.
  useEffect(() => {
    if (cardRef.current) cardRef.current.focus();
  }, [index]);

  const finish = useCallback(() => { if (onFinish) onFinish(); }, [onFinish]);
  const next = useCallback(() => {
    setIndex((i) => {
      if (i >= steps.length - 1) { finish(); return i; }
      return i + 1;
    });
  }, [steps.length, finish]);
  const back = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); finish(); }
      else if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); back(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, back, finish]);

  if (!step) return null;

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 768;

  // Spotlight rect (padded + clamped to the viewport).
  const sx = rect ? Math.max(0, rect.left - PAD) : 0;
  const sy = rect ? Math.max(0, rect.top - PAD) : 0;
  const sw = rect ? Math.min(vw - sx, rect.width + PAD * 2) : 0;
  const sh = rect ? Math.min(vh - sy, rect.height + PAD * 2) : 0;

  // Card placement: below the target if there's room, else above. Centered on
  // the target horizontally, clamped so it never spills off-screen.
  const CARD_W = Math.min(330, vw - 24);
  const spaceBelow = rect ? vh - (sy + sh) : vh;
  const placeBelow = !rect || spaceBelow > 210;
  const cardTop = rect ? (placeBelow ? sy + sh + 12 : Math.max(12, sy - 12)) : Math.round(vh / 2);
  let cardLeft = rect ? (sx + sw / 2 - CARD_W / 2) : (vw / 2 - CARD_W / 2);
  cardLeft = Math.max(12, Math.min(cardLeft, vw - CARD_W - 12));

  return (
    <div className="tut-root" role="dialog" aria-modal="true" aria-label="App tutorial">
      {rect ? (
        <>
          {/* Four dim panels surround the target: they dim + block the rest of
              the app, leaving the highlighted control clear. */}
          <div className="tut-dim" style={{ top: 0, left: 0, width: '100%', height: sy }} />
          <div className="tut-dim" style={{ top: sy + sh, left: 0, width: '100%', height: Math.max(0, vh - (sy + sh)) }} />
          <div className="tut-dim" style={{ top: sy, left: 0, width: sx, height: sh }} />
          <div className="tut-dim" style={{ top: sy, left: sx + sw, width: Math.max(0, vw - (sx + sw)), height: sh }} />
          {/* Transparent blocker over the hole so a stray tap can't navigate away. */}
          <div className="tut-hole-block" style={{ top: sy, left: sx, width: sw, height: sh }} />
          <div className="tut-ring" style={{ top: sy, left: sx, width: sw, height: sh }} aria-hidden="true" />
        </>
      ) : (
        <div className="tut-dim tut-dim-full" />
      )}

      <div
        ref={cardRef}
        className={`tut-card${rect && !placeBelow ? ' tut-card-above' : ''}${!rect ? ' tut-card-center' : ''}`}
        style={rect ? { top: cardTop, left: cardLeft, width: CARD_W } : { width: CARD_W }}
        tabIndex={-1}
      >
        <button type="button" className="tut-skip" onClick={finish}>
          Skip <X size={13} aria-hidden="true" />
        </button>
        <div className="tut-step-count">Step {index + 1} of {steps.length}</div>
        <h3 className="tut-title">{step.title}</h3>
        <p className="tut-body">{step.body}</p>
        <div className="tut-actions">
          <button type="button" className="tut-btn tut-btn-ghost" onClick={back} disabled={isFirst}>
            <ArrowLeft size={15} aria-hidden="true" /> Back
          </button>
          <button type="button" className="tut-btn tut-btn-primary" onClick={next}>
            {isLast
              ? (<><Check size={15} aria-hidden="true" /> Finish</>)
              : (<>Next <ArrowRight size={15} aria-hidden="true" /></>)}
          </button>
        </div>
      </div>
    </div>
  );
}
