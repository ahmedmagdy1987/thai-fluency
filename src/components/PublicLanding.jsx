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
  Star,
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
// quests, account sync) so nothing here is an unverified claim.
const HERO_CHIPS = ['Guided missions', 'Quick challenges', 'XP and streaks', 'Device sync'];

// Real course size, derived from the data files so the numbers can never
// drift from the product. Card count is floored to a clean "N+" figure.
const COURSE_STATS = [
  { value: String(STAGES.length), label: 'stages' },
  { value: String(MINI_UNITS.length), label: 'guided missions' },
  {
    value: `${(Math.floor(CARDS.length / 100) * 100).toLocaleString('en-US')}+`,
    label: 'words and phrases',
  },
];

// The early-stage "journey" preview. Stage names + themes match the real course
// (Stage 1 Survival Thai, Stage 2 Daily Essentials, Stage 3 Getting Around) and
// mission counts come straight from the mini-unit data. No Thai content here.
const JOURNEY = [
  {
    n: 1,
    Icon: MessageCircle,
    stage: 'Stage 1',
    title: 'First words and politeness',
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

// The teacher-and-game loop every mission follows. Each step is something the
// app actually does today (intro, flashcards, challenge, recap).
const LOOP = [
  { Icon: BookOpen, step: 'Learn', text: 'A short, friendly intro tells you what you are about to learn, with no grammar walls.' },
  { Icon: Repeat2, step: 'Practice', text: 'Smart flashcards keep the right words and phrases in rotation.' },
  { Icon: Target, step: 'Challenge', text: 'A quick challenge checks what stuck, with gentle hints.' },
  { Icon: Trophy, step: 'Win', text: 'A proud recap and small wins celebrate what you just learned.' },
];

// The three cinematic feature bands. Each pairs a Thailand-themed cinematic clip
// (scroll-scrubbed on desktop, poster + gentle drift elsewhere) with a real
// product mockup. Order, themes and characters mirror the learning flow.
const CINE_BANDS = [
  { key: 'practice', side: 'left', video: '/cinematic/muaythai.mp4', poster: '/cinematic/muaythai.webp' },
  { key: 'checks', side: 'right', video: '/cinematic/tropical.mp4', poster: '/cinematic/tropical.webp' },
  { key: 'lessons', side: 'left', video: '/cinematic/temple.mp4', poster: '/cinematic/temple.webp' },
];

const PHRASE_SOURCES = [
  { className: 'landing-phrase-one', cardId: 310, meaning: 'hello' },
  { className: 'landing-phrase-two', cardId: 410, meaning: 'how much?' },
  { className: 'landing-phrase-three', cardId: 5701, meaning: 'this one' },
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

function LandingPhraseCard({ phrase, onPlay, className = '' }) {
  return (
    <div className={`landing-phrase ${phrase.className} ${className}`.trim()}>
      <div className="landing-phrase-copy">
        <span className="landing-phrase-thai">{phrase.thai}</span>
        {phrase.ph && <span className="landing-phrase-ph">{phrase.ph}</span>}
        <span className="landing-phrase-en">{phrase.en}</span>
      </div>
      <button
        type="button"
        className="landing-phrase-audio"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onPlay(phrase.thai);
        }}
        aria-label={`Play ${phrase.en} pronunciation`}
      >
        <Volume2 size={15} />
      </button>
    </div>
  );
}

// Gamified "next mission" chip pinned near the mascot. Mission 1 really is the
// polite introduction unit, so "Say hello" is its honest one-line summary.
function MissionBadge({ className = '' }) {
  return (
    <div className={`landing-mission-badge ${className}`.trim()} aria-hidden="true">
      <Star size={13} />
      <span>Mission 1: Say hello</span>
    </div>
  );
}

const FOOTER_LINKS = [
  { path: '/privacy', label: 'Privacy' },
  { path: '/terms', label: 'Terms' },
  { path: '/support', label: 'Support' },
  { path: '/feedback', label: 'Feedback' },
  { path: '/premium', label: 'Super' },
  { path: '/delete-account', label: 'Account deletion' },
];

export default function PublicLanding({ onGetStarted, onSignIn, onOpenPublicPage, audioRate = 0.8 }) {
  const rootRef = useRef(null);
  const heroVideoRef = useRef(null);
  const [showCrypto, setShowCrypto] = useState(false);
  const [copied, setCopied] = useState(false);

  const support = SITE_CONFIG.support || {};
  const crypto = support.crypto || {};

  // Scroll-reveal: sections fade and rise in as they enter the viewport.
  // Content is visible by default; the hidden start state only applies once
  // JS adds .landing-motion-on, so no-JS visitors and reduced-motion users
  // always get the static page. Layout effect: the class must land before
  // first paint or in-viewport sections would flash visible then hide.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === 'undefined') return undefined;
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targets = Array.from(root.querySelectorAll('[data-reveal]'));
    if (reduced || typeof IntersectionObserver === 'undefined') return undefined;
    root.classList.add('landing-motion-on');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('landing-reveal-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    targets.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Translucent header solidifies once the hero is scrolled past, and a gentle
  // hero parallax drifts decorative layers. Transform/opacity only (cheap),
  // rAF-throttled, off under reduced motion.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === 'undefined') return undefined;
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY || 0;
        root.classList.toggle('landing-scrolled', y > 24);
        if (!reduced) root.style.setProperty('--landing-scroll', String(Math.min(y, 720)));
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  // Hero ambient clip: a slow, seamless ping-pong loop of the Thailand
  // establishing shot. Lazy + desktop-only: the <video> ships with no source
  // and is only loaded/played on a wide screen with a real pointer and motion
  // allowed, so phones and reduced-motion users keep the (still) poster with a
  // gentle CSS Ken Burns. It fades in over the poster once it can play.
  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video || typeof window === 'undefined') return undefined;
    const mq = window.matchMedia;
    const reduced = mq && mq('(prefers-reduced-motion: reduce)').matches;
    const wide = mq && mq('(min-width: 1024px)').matches && mq('(hover: hover)').matches;
    if (reduced || !wide) return undefined;
    let cancelled = false;
    const onReady = () => {
      if (!cancelled) video.classList.add('is-ready');
    };
    video.addEventListener('canplay', onReady, { once: true });
    video.preload = 'auto';
    video.src = video.getAttribute('data-src');
    video.load();
    const p = video.play && video.play();
    if (p && typeof p.catch === 'function') p.catch(() => { /* autoplay blocked; poster stays */ });
    const onVisibility = () => {
      if (document.hidden) { try { video.pause(); } catch (_) { /* noop */ } }
      else { const r = video.play && video.play(); if (r && r.catch) r.catch(() => {}); }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelled = true;
      video.removeEventListener('canplay', onReady);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // CINEMATIC SCROLL-SCRUB. Each [data-cine-scrub] band drives its background
  // <video>'s currentTime from how far the band has travelled through the
  // viewport: scroll down advances the clip, scroll up reverses it. The seek
  // target is approached with damped interpolation (a per-frame lerp), so the
  // motion glides and settles instead of snapping frame-to-frame — the clips
  // are encoded all-intra (every frame a keyframe) so each seek is instant and
  // the result reads like a true film scrub, not a jumpy seek.
  //   • Desktop + fine pointer + wide screen + motion allowed -> scroll-scrub.
  //   • Touch / small / reduced-motion -> no scrub; the poster (with a gentle
  //     CSS drift) stays, so the section is always premium and never broken.
  // Videos are lazy: each ships with no src and is loaded only as its band
  // nears the viewport.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === 'undefined') return undefined;
    const mq = window.matchMedia;
    const reduced = mq && mq('(prefers-reduced-motion: reduce)').matches;
    const canScrub = !reduced
      && mq && mq('(min-width: 1024px)').matches && mq('(hover: hover)').matches
      && typeof IntersectionObserver !== 'undefined';
    const bands = Array.from(root.querySelectorAll('[data-cine-scrub]'));
    if (!bands.length || !canScrub) return undefined;
    root.classList.add('cine-scrub-on');

    const active = new Set();
    const loaded = new WeakSet();
    const ease = new WeakMap();              // video -> last applied (eased) time
    const videoOf = (band) => band.querySelector('.cine-video');

    const ensureLoaded = (video) => {
      if (!video || loaded.has(video)) return;
      const src = video.getAttribute('data-src');
      if (!src) return;
      video.preload = 'auto';
      video.src = src;
      video.load();
      loaded.add(video);
      video.addEventListener('loadeddata', () => {
        video.classList.add('is-ready');
        schedule();
      }, { once: true });
    };

    let raf = 0;
    const apply = () => {
      raf = 0;
      if (document.hidden) return;
      const vh = window.innerHeight || 1;
      let again = false;
      active.forEach((band) => {
        const video = videoOf(band);
        if (!video) return;
        const dur = video.duration;
        if (!dur || Number.isNaN(dur)) { again = true; return; }
        const rect = band.getBoundingClientRect();
        // 0 as the band enters from the bottom, 1 as it leaves past the top.
        const p = Math.min(Math.max((vh - rect.top) / (vh + rect.height), 0), 1);
        const target = p * (dur - 0.05);
        const prev = ease.has(video) ? ease.get(video) : target;
        // Damped lerp toward the scroll target: smooth glide + settle.
        let next = prev + (target - prev) * 0.16;
        if (Math.abs(target - next) < 0.004) next = target; else again = true;
        ease.set(video, next);
        if (Math.abs((video.currentTime || 0) - next) > 0.012) {
          try { video.currentTime = next; } catch (_) { /* seek not ready */ }
        }
      });
      if (again) schedule();
    };
    const schedule = () => { if (!raf) raf = window.requestAnimationFrame(apply); };

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          active.add(entry.target);
          ensureLoaded(videoOf(entry.target));
        } else {
          active.delete(entry.target);
        }
      });
      schedule();
    }, { rootMargin: '400px 0px 400px 0px', threshold: 0 });
    bands.forEach(b => io.observe(b));

    const onScroll = () => schedule();
    const onResize = () => schedule();
    const onVisibility = () => { if (!document.hidden) schedule(); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    schedule();

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      if (raf) window.cancelAnimationFrame(raf);
      root.classList.remove('cine-scrub-on');
    };
  }, []);

  const phrases = PHRASE_SOURCES.map(getPhrase);
  // Real product content for the "How it works" mockups.
  const howFlashcard = getPhrase({ cardId: HOW_FLASHCARD_ID, meaning: 'Hello' });
  const howQuizCorrect = CARDS.find(c => c.id === HOW_QUIZ_CORRECT_ID);
  const howQuizOptions = HOW_QUIZ_OPTION_IDS
    .map(id => CARDS.find(c => c.id === id))
    .filter(Boolean);
  const howLessonIntro = STAGE_1_MINI_UNIT_PILOT.lessonIntro || null;

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
    <main className="landing-page" ref={rootRef}>
      <header className="landing-topbar">
        <div className="landing-topbar-inner">
          {/* Brand lockup: the tuk-tuk emblem is framed from the real app icon
              (the wordmark baked into the icon is cropped out via CSS) so the mark
              reads as a deliberate emblem beside a single, clean wordmark — never a
              duplicate name crammed in a circle. */}
          <div className="landing-topbar-brand" aria-label={SITE_CONFIG.siteName}>
            <span className="landing-brand-mark" role="img" aria-hidden="true" />
            <span className="landing-brand-text">
              <span className="landing-brand-name">{SITE_CONFIG.siteName}</span>
              <span className="landing-brand-slogan">{SITE_CONFIG.slogan}</span>
            </span>
          </div>
          {/* Right-side actions. Future top nav (e.g. Blog) can slot into
              .landing-topbar-nav before the Sign in button without changing
              this layout. */}
          <div className="landing-topbar-actions">
            <nav className="landing-topbar-nav" aria-label="Primary" />
            <button type="button" className="landing-topbar-signin" onClick={onSignIn}>
              Sign in
            </button>
          </div>
        </div>
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        {/* Full-bleed cinematic backdrop: a still poster (with a gentle Ken Burns
            drift) paints instantly; on desktop a slow, seamless ambient clip
            fades in over it. A layered scrim keeps the headline crisp. */}
        <div className="landing-hero-media" aria-hidden="true">
          <span className="landing-hero-poster" />
          <video
            className="landing-hero-video"
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
          <span className="landing-hero-scrim" />
        </div>

        <div className="landing-hero-inner">
          <div className="landing-hero-copy">
            <div className="landing-kicker">
              <Sparkles size={16} aria-hidden="true" />
              Your Thai adventure starts here
            </div>
            <h1 id="landing-title" className="landing-title">
              Speak useful Thai from your very first mission.
            </h1>
            <p className="landing-subtitle">
              Short, game-like missions teach you the words and phrases that matter in real
              Thai moments, from street food to taxi rides.
            </p>

            <div className="landing-actions" aria-label="Start learning">
              <button type="button" className="btn-primary landing-primary-cta" onClick={onGetStarted}>
                Start your first mission
                <ArrowRight size={17} aria-hidden="true" />
              </button>
              <button type="button" className="btn-secondary landing-secondary-cta" onClick={onSignIn}>
                I already have an account
              </button>
            </div>

            {onOpenPublicPage && (
              <button
                type="button"
                className="landing-demo-link"
                onClick={() => onOpenPublicPage('/demo')}
              >
                <Play size={14} aria-hidden="true" />
                Or try a quick demo first, no account needed
              </button>
            )}

            <p className="landing-comfort">
              <Sparkles size={15} aria-hidden="true" />
              New to Thai? Perfect. Every mission opens with a simple, friendly explanation.
            </p>

            <div className="landing-proof-row" aria-label="Highlights">
              {HERO_CHIPS.map(chip => (
                <span key={chip}><CheckCircle2 size={15} aria-hidden="true" /> {chip}</span>
              ))}
            </div>
          </div>

          {/* Floating brand scene: the mascot and a couple of real phrase cards
              composited over the cinematic backdrop. */}
          <div className="landing-hero-scene" aria-hidden="true">
            <span className="landing-sparkle landing-sparkle-1" />
            <span className="landing-sparkle landing-sparkle-2" />
            <span className="landing-sparkle landing-sparkle-3" />
            <img
              className="landing-character"
              src="/characters/muay-thai/happy.webp"
              alt=""
            />
            <MissionBadge className="landing-scene-badge" />
            <LandingPhraseCard
              phrase={phrases[0]}
              onPlay={playPhrase}
              className="landing-scene-phrase landing-scene-phrase-a"
            />
            <LandingPhraseCard
              phrase={phrases[1]}
              onPlay={playPhrase}
              className="landing-scene-phrase landing-scene-phrase-b"
            />
          </div>
        </div>

        <span className="landing-hero-cue" aria-hidden="true">
          <span className="landing-hero-cue-dot" />
        </span>
      </section>

      <section className="landing-stats" aria-label="Course size">
        <div className="landing-stats-inner" data-reveal>
          {COURSE_STATS.map(stat => (
            <div className="landing-stat" key={stat.label}>
              <span className="landing-stat-value">{stat.value}</span>
              <span className="landing-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-how" aria-labelledby="landing-how-title">
        <div className="landing-section-head" data-reveal>
          <span className="landing-eyebrow">How it works</span>
          <h2 id="landing-how-title" className="landing-section-title">
            What you&apos;ll actually do
          </h2>
          <p className="landing-how-sub">
            Real examples from the app. {STAGES.length} stages, {MINI_UNITS.length} guided
            missions. Each stage is a set of short missions.
          </p>
        </div>

        <div className="cine-seq">
          {/* Each band is a full-bleed cinematic scene — a Thailand-themed clip
              that scroll-scrubs on desktop — paired with a real product mockup.
              A shared palette and recurring cast connect the three into one
              journey through the learning loop. */}

          {/* 1: Smart flashcards — Muay Thai training, the coach explains a word */}
          <section className="cine-band" data-cine-side={CINE_BANDS[0].side} data-cine-key="practice">
            <div className="cine-media" data-cine-scrub style={{ '--cine-poster': `url('${CINE_BANDS[0].poster}')` }}>
              <video
                className="cine-video"
                data-src={CINE_BANDS[0].video}
                poster={CINE_BANDS[0].poster}
                muted
                playsInline
                preload="none"
                tabIndex={-1}
                aria-hidden="true"
              />
              <span className="cine-scrim" aria-hidden="true" />
            </div>
            <div className="cine-stage">
              <div className="cine-grid">
                <div className="cine-copy" data-reveal>
                  <span className="cine-eyebrow">
                    <Repeat2 size={15} aria-hidden="true" /> Practice that sticks
                  </span>
                  <h3 className="cine-title">Smart flashcards</h3>
                  <p className="cine-lead">
                    Learn the idea, reveal the Thai, then rate how well you knew it.
                    The app uses your answer to decide what to review sooner. English
                    first by default; Thai first is one tap away.
                  </p>
                  <span className="cine-scene-chip">
                    <Repeat2 size={13} aria-hidden="true" /> Train the words
                  </span>
                </div>
                <div className="cine-panel" data-reveal>
                  <img
                    className="cine-character cine-character-coach"
                    src="/characters/muay-thai/speaking.webp"
                    alt=""
                    aria-hidden="true"
                  />
                  <div className="cine-device">
                    <div className="landing-mock landing-mock-flashcard">
                      <div className="landing-mock-toggle" aria-hidden="true">
                        <span className="landing-mock-toggle-opt landing-mock-toggle-active">English first</span>
                        <span className="landing-mock-toggle-opt">Thai first</span>
                      </div>
                      <div className="landing-mock-card">
                        <span className="landing-mock-card-kicker">How do you say</span>
                        <span className="landing-mock-card-en">{howFlashcard.en}</span>
                        <span className="landing-mock-card-answer">
                          <span className="landing-mock-card-ph">{howFlashcard.ph}</span>
                          <span className="landing-mock-card-thai">{howFlashcard.thai}</span>
                          <button
                            type="button"
                            className="landing-phrase-audio landing-mock-card-audio"
                            onClick={() => playPhrase(howFlashcard.thai)}
                            aria-label={`Play ${howFlashcard.en} pronunciation`}
                          >
                            <Volume2 size={14} />
                          </button>
                        </span>
                      </div>
                      <div className="landing-mock-rate-row" aria-hidden="true">
                        {HOW_RATINGS.map(({ label, color }) => (
                          <span className="landing-mock-rate-btn" style={{ '--rate-color': color }} key={label}>
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2: Quick checks — tropical Thailand, a real multiple-choice moment */}
          <section className="cine-band" data-cine-side={CINE_BANDS[1].side} data-cine-key="checks">
            <div className="cine-media" data-cine-scrub style={{ '--cine-poster': `url('${CINE_BANDS[1].poster}')` }}>
              <video
                className="cine-video"
                data-src={CINE_BANDS[1].video}
                poster={CINE_BANDS[1].poster}
                muted
                playsInline
                preload="none"
                tabIndex={-1}
                aria-hidden="true"
              />
              <span className="cine-scrim" aria-hidden="true" />
            </div>
            <div className="cine-stage">
              <div className="cine-grid">
                <div className="cine-copy" data-reveal>
                  <span className="cine-eyebrow">
                    <Target size={15} aria-hidden="true" /> Real Thai moments
                  </span>
                  <h3 className="cine-title">Quick checks</h3>
                  <p className="cine-lead">
                    Short multiple-choice questions right after you learn, so new words
                    stick before you move on.
                  </p>
                  <span className="cine-scene-chip">
                    <Target size={13} aria-hidden="true" /> Review what you learned
                  </span>
                </div>
                <div className="cine-panel" data-reveal>
                  {howQuizCorrect && (
                    <div className="cine-device">
                      <div className="landing-mock landing-mock-quiz" aria-hidden="true">
                        <span className="landing-mock-quiz-label">Choose the Thai</span>
                        <span className="landing-mock-quiz-prompt">{howQuizCorrect.en}</span>
                        <div className="landing-mock-quiz-options">
                          {howQuizOptions.map((option, index) => {
                            const isCorrect = option.id === HOW_QUIZ_CORRECT_ID;
                            return (
                              <span
                                className={`landing-mock-quiz-opt ${isCorrect ? 'landing-mock-quiz-opt-correct' : ''}`}
                                key={option.id}
                              >
                                <span className="landing-mock-quiz-letter">{String.fromCharCode(65 + index)}</span>
                                <span className="landing-mock-quiz-ph">{option.ph}</span>
                                {isCorrect && <Check size={14} className="landing-mock-quiz-check" />}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* 3: Mini lessons — Thai temple, the why behind the words */}
          <section className="cine-band" data-cine-side={CINE_BANDS[2].side} data-cine-key="lessons">
            <div className="cine-media" data-cine-scrub style={{ '--cine-poster': `url('${CINE_BANDS[2].poster}')` }}>
              <video
                className="cine-video"
                data-src={CINE_BANDS[2].video}
                poster={CINE_BANDS[2].poster}
                muted
                playsInline
                preload="none"
                tabIndex={-1}
                aria-hidden="true"
              />
              <span className="cine-scrim" aria-hidden="true" />
            </div>
            <div className="cine-stage">
              <div className="cine-grid">
                <div className="cine-copy" data-reveal>
                  <span className="cine-eyebrow">
                    <BookOpen size={15} aria-hidden="true" /> Understand the why
                  </span>
                  <h3 className="cine-title">Mini lessons</h3>
                  <p className="cine-lead">
                    Every mission opens with a short, friendly explanation and ends
                    with a recap. You learn the why before you practice — not just
                    word lists.
                  </p>
                  <span className="cine-scene-chip">
                    <BookOpen size={13} aria-hidden="true" /> Know the why
                  </span>
                </div>
                <div className="cine-panel" data-reveal>
                  <img
                    className="cine-character cine-character-think"
                    src="/characters/muay-thai/thinking.webp"
                    alt=""
                    aria-hidden="true"
                  />
                  <div className="cine-device cine-device-lessons">
                    {howLessonIntro && (
                      <div className="landing-mock landing-mock-lesson" aria-hidden="true">
                        <span className="landing-mock-lesson-eyebrow">
                          <BookOpen size={13} /> Mission intro
                        </span>
                        <span className="landing-mock-lesson-lead">{howLessonIntro.lead}</span>
                        {Array.isArray(howLessonIntro.points) && howLessonIntro.points[0] && (
                          <span className="landing-mock-lesson-point">
                            <strong>{howLessonIntro.points[0].label}:</strong> {howLessonIntro.points[0].text}
                          </span>
                        )}
                      </div>
                    )}
                    {/* The "why" box: real language reasoning, not just a word list.
                        Romanization first; Thai script secondary. */}
                    <div className="landing-mock landing-mock-lesson landing-mock-basics">
                      <span className="landing-mock-lesson-eyebrow">
                        <Lightbulb size={13} aria-hidden="true" /> Thai language basics
                      </span>
                      <span className="landing-mock-lesson-point">
                        Thai adds a small polite word at the end of a sentence to sound
                        respectful. Male speakers often end with <strong>khráp</strong> (ครับ).
                        Female speakers often end with <strong>khâ</strong> (ค่ะ).
                      </span>
                      <span className="landing-mock-lesson-point">
                        The word for &quot;I&quot; changes with who is speaking too: male
                        speakers often say <strong>phǒm</strong> (ผม), female speakers often
                        say <strong>chăn</strong> (ฉัน). The app flips this for you
                        automatically.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {onOpenPublicPage && (
          <div className="landing-how-cta-row">
            <button
              type="button"
              className="btn-secondary landing-how-demo-cta"
              onClick={() => onOpenPublicPage('/demo')}
            >
              <Play size={15} aria-hidden="true" />
              Try it now in the quick demo
            </button>
          </div>
        )}
      </section>

      <section className="landing-journey" aria-labelledby="landing-journey-title">
        <div className="landing-section-head" data-reveal>
          <span className="landing-eyebrow">Your journey</span>
          <h2 id="landing-journey-title" className="landing-section-title">
            Stages, broken into missions
          </h2>
          <p className="landing-how-sub">
            The course is {STAGES.length} stages. Each stage is a set of short, guided
            missions. Finish a mission and the next one unlocks — clear, one step at a time.
          </p>
        </div>
        <ol className="landing-path">
          {JOURNEY.map(({ n, Icon, stage, title, text, missions, start }) => (
            <li
              className={`landing-step${start ? ' landing-step-start' : ''}`}
              key={n}
              data-reveal
              style={{ '--reveal-delay': `${(n - 1) * 110}ms` }}
            >
              <div className="landing-step-node" aria-hidden="true">
                <Icon size={20} />
                <span className="landing-step-n">{n}</span>
              </div>
              <div className="landing-step-copy">
                <span className="landing-step-stage">
                  {stage}
                  {start && <span className="landing-step-badge">Start here</span>}
                  <span className="landing-step-missions">{missions} missions</span>
                </span>
                <span className="landing-step-title">{title}</span>
                <span className="landing-step-text">{text}</span>
              </div>
            </li>
          ))}
          <li className="landing-step landing-step-goal" data-reveal style={{ '--reveal-delay': '330ms' }}>
            <div className="landing-step-node landing-step-node-goal" aria-hidden="true">
              <img
                className="landing-step-goal-img"
                src="/characters/muay-thai/celebrating.webp"
                alt=""
              />
            </div>
            <div className="landing-step-copy">
              <span className="landing-step-stage">
                <MapIcon size={13} aria-hidden="true" /> Keep going
              </span>
              <span className="landing-step-title">More stages ahead</span>
              <span className="landing-step-text">Stages 4 to {STAGES.length} take you from real conversations to Thai Mastery.</span>
            </div>
          </li>
        </ol>
      </section>

      <section className="landing-loop" aria-labelledby="landing-loop-title">
        <div className="landing-section-head" data-reveal>
          <div className="landing-loop-mascot" aria-hidden="true">
            <span className="landing-loop-mascot-bubble">sàwàtdee khráp!</span>
            <img src="/characters/muay-thai/speaking.webp" alt="" />
          </div>
          <span className="landing-eyebrow">The mission loop</span>
          <h2 id="landing-loop-title" className="landing-section-title">
            Every mission is a small, friendly loop
          </h2>
        </div>
        <div className="landing-benefits">
          {LOOP.map(({ Icon, step, text }, index) => (
            <article
              className="landing-benefit landing-loop-card"
              data-step={step.toLowerCase()}
              key={step}
              data-reveal
              style={{ '--reveal-delay': `${index * 90}ms` }}
            >
              <div className="landing-loop-head">
                <div className="landing-benefit-icon">
                  <Icon size={20} aria-hidden="true" />
                </div>
                <h3 className="landing-loop-step">
                  <span className="landing-loop-num">{index + 1}</span>
                  {step}
                </h3>
              </div>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-cta-band" aria-label="Get started">
        <div className="landing-cta-inner" data-reveal>
          <h2 className="landing-cta-title">Your first Thai words are one tap away.</h2>
          <p className="landing-cta-sub">Free to start. No card needed. Learn something you can say today.</p>
          <button type="button" className="btn-primary landing-cta-button" onClick={onGetStarted}>
            Start your first mission
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </section>

      <footer className="landing-footer" aria-label="Public links">
        <div className="landing-footer-top">
          <div className="landing-footer-brand">{SITE_CONFIG.siteName}</div>
          <nav className="landing-footer-links">
            {FOOTER_LINKS.map(link => (
              <a key={link.path} href={link.path} onClick={openPublicPage(link.path)}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {(support.buyMeACoffeeUrl || crypto.address) && (
          <div className="landing-footer-support">
            <span className="landing-footer-support-label">Enjoying Tuk Talk Thai? Help keep it growing.</span>
            <div className="landing-footer-support-actions">
              {support.buyMeACoffeeUrl && (
                <a
                  className="landing-footer-coffee"
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
                  className="landing-footer-crypto"
                  onClick={() => setShowCrypto(v => !v)}
                  aria-expanded={showCrypto}
                >
                  <QrCode size={15} aria-hidden="true" /> Donate crypto
                </button>
              )}
            </div>
            {showCrypto && crypto.address && (
              <div className="landing-footer-qr" role="dialog" aria-label="Crypto donation">
                {crypto.qrSrc && (
                  <img
                    className="landing-footer-qr-img"
                    src={crypto.qrSrc}
                    width={128}
                    height={128}
                    alt={`${crypto.label || 'Crypto'} donation QR code`}
                  />
                )}
                <div className="landing-footer-qr-body">
                  {crypto.label && <span className="landing-footer-qr-label">{crypto.label}</span>}
                  <code className="landing-footer-qr-addr">{crypto.address}</code>
                  <button type="button" className="landing-footer-qr-copy" onClick={copyCrypto}>
                    <Copy size={13} aria-hidden="true" /> {copied ? 'Copied' : 'Copy address'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </footer>
    </main>
  );
}
