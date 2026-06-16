import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Coffee,
  Compass,
  Copy,
  Lightbulb,
  Map as MapIcon,
  MessageCircle,
  Play,
  QrCode,
  Repeat2,
  Sparkles,
  Target,
  Trophy,
  Volume2,
} from 'lucide-react';
import { CARDS } from '../data/cards.js';
import { getMiniUnitsForStage, MINI_UNITS, STAGE_1_MINI_UNIT_PILOT } from '../data/miniUnits.js';
import { STAGES } from '../data/taxonomy.js';
import { speakThai } from '../lib/audio.js';
import { SITE_CONFIG } from '../config/site.js';

// Small, verifiable highlight chips shown under the hero CTAs. Each maps to a
// real part of the app (guided mini-units, the challenge step, XP/streak
// quests) so nothing here is an unverified claim.
const HERO_CHIPS = ['Guided missions', 'Quick challenges', 'XP and streaks'];

// Real course size, derived from the data files so the numbers can never drift
// from the product. Card count is floored to a clean "N+" figure.
const COURSE_STATS = [
  { value: String(STAGES.length), label: 'stages' },
  { value: String(MINI_UNITS.length), label: 'guided missions' },
  {
    value: `${(Math.floor(CARDS.length / 100) * 100).toLocaleString('en-US')}+`,
    label: 'words & phrases',
  },
];

// The early-stage "journey" preview. Stage names + themes match the real course
// and mission counts come straight from the mini-unit data.
const JOURNEY = [
  {
    n: 1,
    Icon: MessageCircle,
    stage: 'Stage 1',
    title: 'First words & politeness',
    text: 'Say hello, thank you, yes and no.',
    missions: getMiniUnitsForStage(1).length,
    start: true,
  },
  {
    n: 2,
    Icon: Sparkles,
    stage: 'Stage 2',
    title: 'Daily essentials',
    text: 'Everyday actions, feelings, and counting.',
    missions: getMiniUnitsForStage(2).length,
  },
  {
    n: 3,
    Icon: Compass,
    stage: 'Stage 3',
    title: 'Getting around',
    text: 'People, places, time, and directions.',
    missions: getMiniUnitsForStage(3).length,
  },
];

// The teacher-and-game loop every mission follows. Each step is something the
// app actually does today (intro, flashcards, challenge, recap).
const LOOP = [
  { Icon: BookOpen, step: 'Learn', text: 'A short, friendly intro tells you what you are about to learn, with no grammar walls.' },
  { Icon: Repeat2, step: 'Practice', text: 'Smart flashcards keep the right words and phrases in rotation.' },
  { Icon: Target, step: 'Challenge', text: 'A quick check confirms what stuck, with gentle hints.' },
  { Icon: Trophy, step: 'Win', text: 'A proud recap and small wins celebrate what you just learned.' },
];

// Source cards for the "How it works" product mockups. All content is pulled
// from the real deck so the examples can never drift from the product.
const HOW_FLASHCARD_ID = 310;            // hello, the canonical first word
const HOW_QUIZ_CORRECT_ID = 312;         // thank you very much
const HOW_QUIZ_OPTION_IDS = [310, 312, 251]; // hello / thank you very much / yes

// Rating buttons exactly as they appear on the real review screen.
const HOW_RATINGS = [
  { label: 'Again', color: '#A03B2C' },
  { label: 'Hard', color: '#E0823B' },
  { label: 'Good', color: '#2E7D5B' },
  { label: 'Easy', color: '#2563A8' },
];

const FOOTER_LINKS = [
  { path: '/plans', label: 'Plans' },
  { path: '/privacy', label: 'Privacy' },
  { path: '/terms', label: 'Terms' },
  { path: '/support', label: 'Support' },
  { path: '/feedback', label: 'Feedback' },
  { path: '/delete-account', label: 'Account deletion' },
];

function getPhrase(source) {
  const card = CARDS.find(item => item.id === source.cardId);
  return {
    ...source,
    thai: card?.thai || '',
    ph: card?.ph || '',
    en: source.meaning || card?.en || '',
  };
}

// Strip a trailing voice annotation like "(male)" / "(female)" so the marketing
// mockups read clean. The underlying word is identical; the parenthetical is
// just the app's voice-perspective label.
const cleanLabel = (s) => (s || '').replace(/\s*\((?:male|female)\)\s*/gi, ' ').trim();

// The flashcard mockup - the core "learn the idea, reveal the Thai, rate it"
// loop, shown clean inside a bounded card. Reused in the hero showcase and the
// "How it works" grid. When `decorative`, the audio control renders as an inert
// <span> (the hero showcase is aria-hidden, so a focusable button there would be
// a phantom tab stop with no accessible name).
function FlashcardMock({ phrase, onPlay, decorative = false }) {
  return (
    <div className="lp-mock lp-mock-flash">
      <div className="lp-mock-toggle" aria-hidden="true">
        <span className="lp-mock-toggle-opt lp-mock-toggle-on">English first</span>
        <span className="lp-mock-toggle-opt">Thai first</span>
      </div>
      <div className="lp-mock-card">
        <span className="lp-mock-card-kicker">How do you say</span>
        <span className="lp-mock-card-en">{phrase.en}</span>
        <span className="lp-mock-card-answer">
          <span className="lp-mock-card-ph">{phrase.ph}</span>
          <span className="lp-mock-card-thai">{phrase.thai}</span>
          {decorative ? (
            <span className="lp-audio lp-mock-card-audio" aria-hidden="true">
              <Volume2 size={14} />
            </span>
          ) : (
            <button
              type="button"
              className="lp-audio lp-mock-card-audio"
              onClick={() => onPlay(phrase.thai)}
              aria-label={`Play ${phrase.en} pronunciation`}
            >
              <Volume2 size={14} />
            </button>
          )}
        </span>
      </div>
      <div className="lp-mock-rate-row" aria-hidden="true">
        {HOW_RATINGS.map(({ label, color }) => (
          <span className="lp-mock-rate-btn" style={{ '--rate-color': color }} key={label}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// Quick-check (multiple-choice) mockup. Reused in the hero sample deck and the
// "How it works" grid so the two never drift.
function QuickCheckMock({ correct, options, correctId }) {
  if (!correct) return null;
  return (
    <div className="lp-mock lp-mock-quiz" aria-hidden="true">
      <span className="lp-mock-quiz-label">Choose the Thai</span>
      <span className="lp-mock-quiz-prompt">{cleanLabel(correct.en)}</span>
      <div className="lp-mock-quiz-options">
        {options.map((option, index) => {
          const isCorrect = option.id === correctId;
          return (
            <span
              className={`lp-mock-quiz-opt ${isCorrect ? 'lp-mock-quiz-opt-ok' : ''}`}
              key={option.id}
            >
              <span className="lp-mock-quiz-letter">{String.fromCharCode(65 + index)}</span>
              <span className="lp-mock-quiz-ph">{option.ph}</span>
              {isCorrect && <Check size={14} className="lp-mock-quiz-check" />}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// Mini-lesson mockup. Reused in the hero sample deck and the "How it works"
// grid.
function MiniLessonMock({ intro }) {
  return (
    <div className="lp-mock lp-mock-lesson" aria-hidden="true">
      {intro && (
        <>
          <span className="lp-mock-lesson-eyebrow">
            <BookOpen size={13} aria-hidden="true" /> Mission intro
          </span>
          <span className="lp-mock-lesson-lead">{intro.lead}</span>
        </>
      )}
      <span className="lp-mock-lesson-point">
        <Lightbulb size={13} aria-hidden="true" />
        Thai adds a small polite word at the end of a sentence. Male speakers say{' '}
        <strong>khráp</strong> (ครับ); female speakers say <strong>khâ</strong> (ค่ะ).
        The app flips this for you automatically.
      </span>
    </div>
  );
}

export default function PublicLanding({ onGetStarted, onSignIn, onOpenPublicPage, audioRate = 0.8 }) {
  const rootRef = useRef(null);
  const heroVideoRef = useRef(null);
  const cineVideoRef = useRef(null);
  const deckRef = useRef(null);
  const [showCrypto, setShowCrypto] = useState(false);
  const [copied, setCopied] = useState(false);

  const support = SITE_CONFIG.support || {};
  const crypto = support.crypto || {};

  // Real product content for the hero showcase + "How it works" mockups.
  const heroFlashcard = getPhrase({ cardId: HOW_FLASHCARD_ID, meaning: 'Hello' });
  const howQuizCorrect = CARDS.find(c => c.id === HOW_QUIZ_CORRECT_ID);
  const howQuizOptions = HOW_QUIZ_OPTION_IDS
    .map(id => CARDS.find(c => c.id === id))
    .filter(Boolean);
  const howLessonIntro = STAGE_1_MINI_UNIT_PILOT.lessonIntro || null;

  // Scroll-reveal: sections fade and rise in as they enter the viewport.
  // Content is visible by default; the hidden start state only applies once JS
  // adds .lp-motion, so no-JS and reduced-motion visitors always get the static
  // page. Layout effect: the class must land before first paint or in-viewport
  // sections would flash visible then hide.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === 'undefined') return undefined;
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined') return undefined;
    root.classList.add('lp-motion');
    const targets = Array.from(root.querySelectorAll('[data-reveal]'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('lp-reveal-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    targets.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Translucent header solidifies once the hero is scrolled past. Cheap class
  // toggle, rAF-throttled.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === 'undefined') return undefined;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        root.classList.toggle('lp-scrolled', (window.scrollY || 0) > 24);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  // Hero sample deck: on mobile the deck is a horizontal scroll-snap carousel,
  // so keep the dot indicators in sync with the scroll position. On desktop the
  // deck is a static fan (not scrollable) and this is a cheap no-op.
  useEffect(() => {
    const deck = deckRef.current;
    if (!deck || typeof window === 'undefined') return undefined;
    const dotsWrap = deck.parentElement && deck.parentElement.querySelector('.lp-deck-dots');
    if (!dotsWrap) return undefined;
    const dots = Array.from(dotsWrap.querySelectorAll('.lp-deck-dot'));
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = deck.scrollWidth - deck.clientWidth;
      if (max <= 4) return; // not a carousel (desktop fan)
      const ratio = deck.scrollLeft / max;
      const active = Math.round(ratio * (dots.length - 1));
      dots.forEach((d, i) => d.classList.toggle('lp-deck-dot-on', i === active));
    };
    const onScroll = () => { if (!raf) raf = window.requestAnimationFrame(update); };
    deck.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      deck.removeEventListener('scroll', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  // Lazy, desktop-only ambient background clips (hero + the single cinematic CTA
  // band). Each <video> ships with no source and is only loaded/played on a wide
  // screen with a real pointer and motion allowed, so phones and reduced-motion
  // users keep the still poster (with a gentle CSS drift). It fades in once it
  // can play. A simple muted loop - no scroll-scrubbing, so motion stays smooth.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const mq = window.matchMedia;
    const reduced = mq && mq('(prefers-reduced-motion: reduce)').matches;
    const wide = mq && mq('(min-width: 1024px)').matches && mq('(hover: hover)').matches;
    if (reduced || !wide) return undefined;

    const videos = [heroVideoRef.current, cineVideoRef.current].filter(Boolean);
    if (!videos.length) return undefined;

    const visible = new Set();
    const playIfReady = (video) => {
      const p = video.play && video.play();
      if (p && p.catch) p.catch(() => { /* autoplay blocked; poster stays */ });
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          visible.add(video);
          if (!video.dataset.lpLoaded) {
            video.dataset.lpLoaded = '1';
            video.preload = 'auto';
            video.src = video.getAttribute('data-src');
            video.load();
            video.addEventListener('canplay', () => video.classList.add('is-ready'), { once: true });
          }
          playIfReady(video);
        } else {
          visible.delete(video);
          if (video.dataset.lpLoaded) { try { video.pause(); } catch (_) { /* noop */ } }
        }
      });
    }, { rootMargin: '300px 0px 300px 0px', threshold: 0 });

    videos.forEach((v) => { io.observe(v); });

    // The observer doesn't re-fire on tab focus changes, so resume the
    // in-viewport clips ourselves when the tab becomes visible again.
    const onVisibility = () => {
      if (document.hidden) {
        videos.forEach(v => { try { v.pause(); } catch (_) { /* noop */ } });
      } else {
        visible.forEach(v => { if (v.dataset.lpLoaded) playIfReady(v); });
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const playPhrase = (thai) => {
    if (!thai) return;
    try { speakThai(thai, audioRate); } catch (_) { /* TTS unavailable */ }
  };

  const openPublicPage = (path) => (event) => {
    if (!onOpenPublicPage || event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onOpenPublicPage(path);
  };

  const copyCrypto = () => {
    if (!crypto.address || typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(crypto.address).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }).catch(() => { /* clipboard blocked */ });
  };

  return (
    <main className="lp" ref={rootRef}>
      {/* ===================== HEADER ===================== */}
      <header className="lp-nav">
        <div className="lp-shell lp-nav-inner">
          <div className="lp-brand">
            <span className="lp-brand-mark" role="img" aria-hidden="true" />
            <span className="lp-brand-text">
              <span className="lp-brand-name">{SITE_CONFIG.siteName}</span>
              <span className="lp-brand-slogan">{SITE_CONFIG.slogan}</span>
            </span>
          </div>
          <div className="lp-nav-actions">
            {onOpenPublicPage && (
              <button
                type="button"
                className="lp-nav-demo"
                onClick={() => onOpenPublicPage('/demo')}
              >
                Try the demo
              </button>
            )}
            <button type="button" className="lp-nav-signin" onClick={onSignIn}>
              Sign in
            </button>
          </div>
        </div>
      </header>

      {/* ===================== HERO ===================== */}
      <section className="lp-hero" aria-labelledby="lp-title">
        <div className="lp-hero-media" aria-hidden="true">
          <span className="lp-hero-poster" />
          <video
            className="lp-hero-video"
            ref={heroVideoRef}
            data-src="/cinematic/hero-ambient.mp4"
            poster="/cinematic/hero-islands.webp"
            muted
            loop
            playsInline
            preload="none"
            tabIndex={-1}
            aria-hidden="true"
          />
          <span className="lp-hero-scrim" />
        </div>

        <div className="lp-hero-body">
        <div className="lp-shell lp-hero-inner">
          <div className="lp-hero-copy">
            <span className="lp-kicker">
              <Sparkles size={15} aria-hidden="true" />
              Your Thai adventure starts here
            </span>
            <h1 id="lp-title" className="lp-title">
              Speak useful Thai from your <span>very first mission</span>.
            </h1>
            <p className="lp-subtitle">
              Short missions designed like a game teach you the words and phrases that matter
              in real Thai moments, from street food to taxi rides.
            </p>

            <div className="lp-hero-actions">
              <button type="button" className="lp-cta-primary" onClick={onGetStarted}>
                Start your first mission
                <ArrowRight size={18} aria-hidden="true" />
              </button>
              <button type="button" className="lp-cta-secondary" onClick={onSignIn}>
                I already have an account
              </button>
            </div>

            {onOpenPublicPage && (
              <button
                type="button"
                className="lp-hero-demo-link"
                onClick={() => onOpenPublicPage('/demo')}
              >
                <Play size={13} aria-hidden="true" />
                Try a quick demo first. No account needed.
              </button>
            )}

            <ul className="lp-hero-chips" aria-label="Highlights">
              {HERO_CHIPS.map(chip => (
                <li key={chip}><CheckCircle2 size={14} aria-hidden="true" /> {chip}</li>
              ))}
            </ul>
          </div>

          {/* Hero visual group: the three real product samples (flashcard,
              quick check, mini lesson) plus the mascot. On desktop the samples
              are a controlled fanned deck (all three identifiable); on mobile
              they become a swipeable scroll-snap carousel with dot controls.
              isolation:isolate gives this group its own stacking context, so the
              z-order (mascot above the deck) is local, not global. */}
          <div className="lp-hero-visual" aria-hidden="true">
            <div className="lp-deck" ref={deckRef}>
              <div className="lp-deck-card lp-deck-card-flash">
                <FlashcardMock phrase={heroFlashcard} onPlay={playPhrase} decorative />
              </div>
              <div className="lp-deck-card lp-deck-card-quiz">
                <QuickCheckMock correct={howQuizCorrect} options={howQuizOptions} correctId={HOW_QUIZ_CORRECT_ID} />
              </div>
              <div className="lp-deck-card lp-deck-card-lesson">
                <MiniLessonMock intro={howLessonIntro} />
              </div>
            </div>
            <div className="lp-deck-dots" aria-hidden="true">
              <span className="lp-deck-dot lp-deck-dot-on" />
              <span className="lp-deck-dot" />
              <span className="lp-deck-dot" />
            </div>
            <img className="lp-hero-mascot" src="/characters/muay-thai/happy.webp" alt="" />
          </div>
        </div>
        </div>

        {/* Stats docked inside the hero so the first viewport is one complete
            composition - no light strip leaking in from the next section. */}
        <div className="lp-shell lp-hero-stats-wrap">
          <div className="lp-hero-stats" aria-label="Course size">
            {COURSE_STATS.map(stat => (
              <div className="lp-hero-stat" key={stat.label}>
                <span className="lp-hero-stat-value">{stat.value}</span>
                <span className="lp-hero-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section className="lp-features" aria-labelledby="lp-features-title">
        <div className="lp-shell">
          <div className="lp-head" data-reveal>
            <span className="lp-eyebrow">How it works</span>
            <h2 id="lp-features-title" className="lp-h2">What you&apos;ll actually do</h2>
            <p className="lp-head-sub">
              Real examples from the app. {STAGES.length} stages and {MINI_UNITS.length} guided
              missions, each a set of short steps.
            </p>
          </div>

          <div className="lp-feature-grid">
            <article className="lp-feature" data-reveal>
              <div className="lp-feature-top">
                <span className="lp-feature-icon"><Repeat2 size={18} aria-hidden="true" /></span>
                <div>
                  <h3 className="lp-feature-title">Smart flashcards</h3>
                  <p className="lp-feature-sub">Practice that sticks</p>
                </div>
              </div>
              <p className="lp-feature-text">
                Learn the idea, reveal the Thai, then rate how well you knew it. The app uses
                your answer to decide what to review sooner.
              </p>
              <div className="lp-feature-media">
                <FlashcardMock phrase={heroFlashcard} onPlay={playPhrase} />
              </div>
            </article>

            <article className="lp-feature" data-reveal style={{ '--reveal-delay': '90ms' }}>
              <div className="lp-feature-top">
                <span className="lp-feature-icon"><Target size={18} aria-hidden="true" /></span>
                <div>
                  <h3 className="lp-feature-title">Quick checks</h3>
                  <p className="lp-feature-sub">Review what you&apos;ve learned</p>
                </div>
              </div>
              <p className="lp-feature-text">
                Short multiple-choice questions right after you learn, so new words stick
                before you move on.
              </p>
              <div className="lp-feature-media">
                <QuickCheckMock correct={howQuizCorrect} options={howQuizOptions} correctId={HOW_QUIZ_CORRECT_ID} />
              </div>
            </article>

            <article className="lp-feature" data-reveal style={{ '--reveal-delay': '180ms' }}>
              <div className="lp-feature-top">
                <span className="lp-feature-icon"><BookOpen size={18} aria-hidden="true" /></span>
                <div>
                  <h3 className="lp-feature-title">Mini lessons</h3>
                  <p className="lp-feature-sub">Understand the why</p>
                </div>
              </div>
              <p className="lp-feature-text">
                Every mission opens with a short, friendly explanation and ends with a recap,
                so you learn the why, not just word lists.
              </p>
              <div className="lp-feature-media">
                <MiniLessonMock intro={howLessonIntro} />
              </div>
            </article>
          </div>

          {onOpenPublicPage && (
            <div className="lp-features-cta" data-reveal>
              <button
                type="button"
                className="lp-cta-ghost"
                onClick={() => onOpenPublicPage('/demo')}
              >
                <Play size={15} aria-hidden="true" />
                Try it now in the quick demo
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ===================== MISSION LOOP ===================== */}
      <section className="lp-loop" aria-labelledby="lp-loop-title">
        <div className="lp-shell">
          <div className="lp-head lp-head-loop" data-reveal>
            <span className="lp-eyebrow">The mission loop</span>
            <h2 id="lp-loop-title" className="lp-h2">Every mission is a small, friendly loop</h2>
            <div className="lp-loop-mascot" aria-hidden="true">
              <span className="lp-loop-bubble">sàwàtdee khráp!</span>
              <img src="/characters/muay-thai/speaking.webp" alt="" />
            </div>
          </div>
          <ol className="lp-loop-track">
            {LOOP.map(({ Icon, step, text }, index) => (
              <li className="lp-loop-step" key={step} data-reveal style={{ '--reveal-delay': `${index * 80}ms` }}>
                <span className="lp-loop-icon">
                  <Icon size={20} aria-hidden="true" />
                  <span className="lp-loop-num">{index + 1}</span>
                </span>
                <h3 className="lp-loop-step-title">{step}</h3>
                <p className="lp-loop-step-text">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ===================== JOURNEY ===================== */}
      <section className="lp-journey" aria-labelledby="lp-journey-title">
        <div className="lp-shell">
          <div className="lp-head" data-reveal>
            <span className="lp-eyebrow">Your journey</span>
            <h2 id="lp-journey-title" className="lp-h2">Stages, broken into missions</h2>
            <p className="lp-head-sub">
              The course is {STAGES.length} stages. Finish a mission and the next one unlocks.
              Clear, one step at a time.
            </p>
          </div>
          <ol className="lp-journey-track">
            {JOURNEY.map(({ n, Icon, stage, title, text, missions, start }) => (
              <li
                className={`lp-journey-step${start ? ' lp-journey-step-start' : ''}`}
                key={n}
                data-reveal
                style={{ '--reveal-delay': `${(n - 1) * 90}ms` }}
              >
                <div className="lp-journey-node" aria-hidden="true">
                  <Icon size={20} />
                  <span className="lp-journey-n">{n}</span>
                </div>
                <div className="lp-journey-copy">
                  <span className="lp-journey-stage">
                    {stage}
                    {start && <span className="lp-journey-badge">Start here</span>}
                    <span className="lp-journey-missions">{missions} missions</span>
                  </span>
                  <span className="lp-journey-title">{title}</span>
                  <span className="lp-journey-text">{text}</span>
                </div>
              </li>
            ))}
            <li className="lp-journey-step lp-journey-step-goal" data-reveal style={{ '--reveal-delay': '270ms' }}>
              <div className="lp-journey-node lp-journey-node-goal" aria-hidden="true">
                <img src="/characters/muay-thai/celebrating.webp" alt="" />
              </div>
              <div className="lp-journey-copy">
                <span className="lp-journey-stage">
                  <MapIcon size={13} aria-hidden="true" /> Keep going
                </span>
                <span className="lp-journey-title">More stages ahead</span>
                <span className="lp-journey-text">
                  Stages 4 to {STAGES.length} take you from real conversations to Thai mastery.
                </span>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* ===== ONE secondary cinematic moment: full-bleed clip + final CTA ===== */}
      <section className="lp-cine" aria-label="Get started">
        <div className="lp-cine-media" aria-hidden="true">
          <span className="lp-cine-poster" />
          <video
            className="lp-cine-video"
            ref={cineVideoRef}
            data-src="/cinematic/temple.mp4"
            poster="/cinematic/temple.webp"
            muted
            loop
            playsInline
            preload="none"
            tabIndex={-1}
            aria-hidden="true"
          />
          <span className="lp-cine-scrim" />
        </div>
        <div className="lp-shell lp-cine-inner" data-reveal>
          <span className="lp-cine-eyebrow">
            <Sparkles size={15} aria-hidden="true" /> Free to start · no card needed
          </span>
          <h2 className="lp-cine-title">Your first Thai words are one tap away.</h2>
          <p className="lp-cine-sub">Learn something you can actually say in Thailand today.</p>
          <button type="button" className="lp-cta-primary lp-cine-cta" onClick={onGetStarted}>
            Start your first mission
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="lp-footer" aria-label="Public links">
        <div className="lp-shell">
          <div className="lp-footer-top">
            <div className="lp-footer-brand">{SITE_CONFIG.siteName}</div>
            <nav className="lp-footer-links">
              {FOOTER_LINKS.map(link => (
                <a key={link.path} href={link.path} onClick={openPublicPage(link.path)}>
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {(support.buyMeACoffeeUrl || crypto.address) && (
            <div className="lp-footer-support">
              <span className="lp-footer-support-label">Enjoying Tuk Talk Thai? Help keep it growing.</span>
              <div className="lp-footer-support-actions">
                {support.buyMeACoffeeUrl && (
                  <a
                    className="lp-footer-coffee"
                    href={support.buyMeACoffeeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Coffee size={15} aria-hidden="true" /> Buy me a coffee
                  </a>
                )}
                {crypto.address && (
                  <button
                    type="button"
                    className="lp-footer-crypto"
                    onClick={() => setShowCrypto(v => !v)}
                    aria-expanded={showCrypto}
                  >
                    <QrCode size={15} aria-hidden="true" /> Donate crypto
                  </button>
                )}
              </div>
              {showCrypto && crypto.address && (
                <div className="lp-footer-qr" role="dialog" aria-label="Crypto donation">
                  {crypto.qrSrc && (
                    <img
                      className="lp-footer-qr-img"
                      src={crypto.qrSrc}
                      width={128}
                      height={128}
                      alt={`${crypto.label || 'Crypto'} donation QR code`}
                    />
                  )}
                  <div className="lp-footer-qr-body">
                    {crypto.label && <span className="lp-footer-qr-label">{crypto.label}</span>}
                    <code className="lp-footer-qr-addr">{crypto.address}</code>
                    <button type="button" className="lp-footer-qr-copy" onClick={copyCrypto}>
                      <Copy size={13} aria-hidden="true" /> {copied ? 'Copied' : 'Copy address'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <p className="lp-footer-fine">© {SITE_CONFIG.siteName}. Learn Thai the fast and fun way.</p>
        </div>
      </footer>
    </main>
  );
}
