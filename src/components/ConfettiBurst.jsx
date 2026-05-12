import React, { useEffect, useRef } from 'react';

// Lightweight, self-contained confetti effect.
//
//   <ConfettiBurst variant="light"  onDone={...} />   ~40 particles, ~1.2s
//   <ConfettiBurst variant="strong" onDone={...} />   ~90 particles, ~1.8s
//
// Renders a fixed-position canvas covering the viewport, animates particles
// with simple gravity, then unmounts itself by calling onDone(). Respects
// prefers-reduced-motion: if the user opts out, we render a brief static
// flash (no falling particles) before completing.
//
// No external deps. Mobile-safe (uses devicePixelRatio).

const COLORS = ['#2E7D5B', '#E0823B', '#E1B85C', '#2563A8', '#A03B2C', '#9B6BD3', '#3CB371'];

export default function ConfettiBurst({ variant = 'light', onDone }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const doneRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = typeof window !== 'undefined' && window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    const ctx = canvas.getContext('2d');
    if (!ctx) { onDone && onDone(); return; }
    ctx.scale(dpr, dpr);

    const count = variant === 'strong' ? 90 : 40;
    const duration = variant === 'strong' ? 1800 : 1200;
    const start = performance.now();

    // Particles burst from two anchor points (left third, right third) to feel
    // bigger than a single point source on wide screens.
    const anchors = variant === 'strong'
      ? [{ x: W * 0.30, y: H * 0.30 }, { x: W * 0.70, y: H * 0.30 }]
      : [{ x: W * 0.50, y: H * 0.30 }];

    const particles = [];
    for (let i = 0; i < count; i++) {
      const a = anchors[i % anchors.length];
      const angle = Math.random() * Math.PI - Math.PI; // upward hemisphere
      const speed = 3 + Math.random() * 6;
      particles.push({
        x: a.x + (Math.random() - 0.5) * 40,
        y: a.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2, // bias upward
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.4,
        size: 4 + Math.random() * 6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: Math.random() < 0.5 ? 'rect' : 'circle',
      });
    }

    const gravity = 0.18;
    const drag = 0.995;

    function finish() {
      if (doneRef.current) return;
      doneRef.current = true;
      cancelAnimationFrame(rafRef.current);
      onDone && onDone();
    }

    function frame(now) {
      const t = now - start;
      ctx.clearRect(0, 0, W, H);

      if (reduced) {
        // Static, non-distracting flash of dots — held briefly, no motion.
        const alpha = Math.max(0, 1 - t / 800);
        for (const p of particles) {
          ctx.globalAlpha = alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
        if (t >= 800) return finish();
        rafRef.current = requestAnimationFrame(frame);
        return;
      }

      const fade = Math.max(0, 1 - Math.max(0, t - duration * 0.6) / (duration * 0.4));

      for (const p of particles) {
        p.vy += gravity;
        p.vx *= drag;
        p.vy *= drag;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vrot;

        ctx.globalAlpha = fade;
        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      if (t >= duration) return finish();
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [variant, onDone]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    />
  );
}
