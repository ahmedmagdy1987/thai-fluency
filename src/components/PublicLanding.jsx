import React, { useEffect, useLayoutEffect, useRef } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Compass,
  Lightbulb,
  MessageCircle,
  Play,
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

  // Gentle hero parallax: decorative layers drift at different speeds while
  // scrolling. Transform-only (cheap), rAF-throttled, off under reduced motion.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === 'undefined') return undefined;
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const y = Math.min(window.scrollY || 0, 720);
        root.style.setProperty('--landing-scroll', String(y));
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  // Scroll-scrubbed cinematic bands: each [data-cine-band]'s <video> currentTime
  // is driven by how far the band has travelled through the viewport, so
  // scrolling down advances the clip and scrolling up reverses it. Guarded for
  // quality + performance: only runs on large screens with motion allowed,
  // lazy-loads each video the first time its band nears the viewport, skips
  // offscreen bands, throttles with rAF, and pauses while the tab is hidden.
  // Everywhere else (mobile, tablet, reduced motion, no JS) the <video> keeps
  // preload="none" and simply shows its poster, so all content stays visible.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === 'undefined') return undefined;
    const mq = window.matchMedia;
    const reduced = mq && mq('(prefers-reduced-motion: reduce)').matches;
    const canScrub = mq && mq('(min-width: 1024px)').matches && mq('(hover: hover)').matches;
    const bands = Array.from(root.querySelectorAll('[data-cine-band]'));
    if (!bands.length || reduced || !canScrub || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }

    const active = new Set();
    const loaded = new WeakSet();
    const videoOf = (band) => band.querySelector('[data-cine-video]');

    const ensureLoaded = (video) => {
      if (!video || loaded.has(video)) return;
      const src = video.getAttribute('data-src');
      if (src) {
        video.src = src;
        video.load();
        loaded.add(video);
      }
    };

    let raf = 0;
    const apply = () => {
      raf = 0;
      if (document.hidden) return;
      const vh = window.innerHeight || 1;
      active.forEach((band) => {
        const video = videoOf(band);
        if (!video) return;
        const dur = video.duration;
        if (!dur || Number.isNaN(dur)) return;
        const rect = band.getBoundingClientRect();
        // 0 as the band enters from the bottom, 1 as it leaves past the top.
        const p = Math.min(Math.max((vh - rect.top) / (vh + rect.height), 0), 1);
        const t = p * (dur - 0.05);
        if (Math.abs((video.currentTime || 0) - t) > 0.03) {
          try { video.currentTime = t; } catch (_) { /* seek not ready */ }
        }
      });
    };
    const schedule = () => { if (!raf) raf = window.requestAnimationFrame(apply); };

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const band = entry.target;
        if (entry.isIntersecting) {
          active.add(band);
          const video = videoOf(band);
          ensureLoaded(video);
          if (video) video.addEventListener('loadedmetadata', schedule, { once: true });
        } else {
          active.delete(band);
        }
      });
      schedule();
    }, { rootMargin: '300px 0px 300px 0px', threshold: 0 });
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

  return (
    <main className="landing-page" ref={rootRef}>
      <header className="landing-topbar">
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
        {/* Right-side actions. Future top nav (e.g. Blog) can slot in before
            the Sign in button without changing this layout. */}
        <div className="landing-topbar-actions">
          <button type="button" className="landing-topbar-signin" onClick={onSignIn}>
            Sign in
          </button>
        </div>
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-scene">
          <span className="landing-scene-glow" aria-hidden="true" />
          <span className="landing-scene-ground" aria-hidden="true" />
          <span className="landing-sparkle landing-sparkle-1" aria-hidden="true" />
          <span className="landing-sparkle landing-sparkle-2" aria-hidden="true" />
          <span className="landing-sparkle landing-sparkle-3" aria-hidden="true" />
          <img
            className="landing-character"
            src="/characters/muay-thai/happy.webp"
            alt=""
            aria-hidden="true"
          />
          <MissionBadge className="landing-scene-badge" />
          {phrases.map(phrase => (
            <LandingPhraseCard phrase={phrase} onPlay={playPhrase} key={phrase.cardId} />
          ))}
        </div>

        <div className="landing-hero-inner">
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

          <div className="landing-hero-stage">
            <span className="landing-hero-stage-glow" aria-hidden="true" />
            <span className="landing-sparkle landing-sparkle-4" aria-hidden="true" />
            <span className="landing-sparkle landing-sparkle-5" aria-hidden="true" />
            <img
              className="landing-hero-stage-mascot"
              src="/characters/muay-thai/happy.webp"
              alt=""
              aria-hidden="true"
            />
            <MissionBadge className="landing-stage-badge" />
            <LandingPhraseCard
              phrase={phrases[0]}
              onPlay={playPhrase}
              className="landing-stage-phrase landing-stage-phrase-a"
            />
            <LandingPhraseCard
              phrase={phrases[1]}
              onPlay={playPhrase}
              className="landing-stage-phrase landing-stage-phrase-b"
            />
          </div>

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
          {/* Each band is a contained, art-directed showcase: a framed cinematic
              scene with a brand character composited into it, paired with a large,
              central product mockup carrying real app content. A shared spine,
              palette and recurring cast connect the three into one journey. */}

          {/* 1: Smart flashcards — Muay Thai training, the coach explains a word */}
          <section className="cine-band" data-cine-band data-cine-side="left" data-cine-key="practice">
            <div className="cine-stage">
              <div className="cine-grid">
                <figure className="cine-scene" data-reveal>
                  <div className="cine-media" style={{ '--cine-poster': "url('/cinematic/muaythai.webp')" }}>
                    <video
                      className="cine-video"
                      data-cine-video
                      data-src="/cinematic/muaythai.mp4"
                      poster="/cinematic/muaythai.webp"
                      muted
                      playsInline
                      preload="none"
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                    <span className="cine-scrim" aria-hidden="true" />
                  </div>
                  <img
                    className="cine-character cine-character-coach"
                    src="/characters/muay-thai/speaking.webp"
                    alt=""
                    aria-hidden="true"
                  />
                  <span className="cine-scene-chip" aria-hidden="true">
                    <Repeat2 size={13} /> Train the words
                  </span>
                </figure>

                <div className="cine-info">
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
                  </div>
                  <div className="cine-device" data-reveal>
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
                  <p className="cine-foot" data-reveal>Practice the words that need more attention.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 2: Quick checks — tropical Thailand, the elephant guides a real choice */}
          <section className="cine-band" data-cine-band data-cine-side="right" data-cine-key="checks">
            <div className="cine-stage">
              <div className="cine-grid">
                <figure className="cine-scene" data-reveal>
                  <div className="cine-media" style={{ '--cine-poster': "url('/cinematic/tropical.webp')" }}>
                    <video
                      className="cine-video"
                      data-cine-video
                      data-src="/cinematic/tropical.mp4"
                      poster="/cinematic/tropical.webp"
                      muted
                      playsInline
                      preload="none"
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                    <span className="cine-scrim" aria-hidden="true" />
                  </div>
                  <img
                    className="cine-character cine-character-guide"
                    src="/characters/elephant/happy.webp"
                    alt=""
                    aria-hidden="true"
                  />
                  <span className="cine-scene-chip" aria-hidden="true">
                    <Target size={13} /> Make the call
                  </span>
                </figure>

                <div className="cine-info">
                  <div className="cine-copy" data-reveal>
                    <span className="cine-eyebrow">
                      <Target size={15} aria-hidden="true" /> Real Thai moments
                    </span>
                    <h3 className="cine-title">Quick checks</h3>
                    <p className="cine-lead">
                      Short multiple-choice questions right after you learn, so new words
                      stick before you move on.
                    </p>
                  </div>
                  {howQuizCorrect && (
                    <div className="cine-device" data-reveal>
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
                  <p className="cine-foot" data-reveal>A quick win after every few cards.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 3: Mini lessons — Thai temple, the why behind the words */}
          <section className="cine-band" data-cine-band data-cine-side="left" data-cine-key="lessons">
            <div className="cine-stage">
              <div className="cine-grid">
                <figure className="cine-scene" data-reveal>
                  <div className="cine-media" style={{ '--cine-poster': "url('/cinematic/temple.webp')" }}>
                    <video
                      className="cine-video"
                      data-cine-video
                      data-src="/cinematic/temple.mp4"
                      poster="/cinematic/temple.webp"
                      muted
                      playsInline
                      preload="none"
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                    <span className="cine-scrim" aria-hidden="true" />
                  </div>
                  <img
                    className="cine-character cine-character-think"
                    src="/characters/muay-thai/thinking.webp"
                    alt=""
                    aria-hidden="true"
                  />
                  <span className="cine-scene-chip" aria-hidden="true">
                    <BookOpen size={13} /> Know the why
                  </span>
                </figure>

                <div className="cine-info">
                  <div className="cine-copy" data-reveal>
                    <span className="cine-eyebrow">
                      <BookOpen size={15} aria-hidden="true" /> Understand the why
                    </span>
                    <h3 className="cine-title">Mini lessons</h3>
                    <p className="cine-lead">
                      Every mission opens with a short, friendly explanation and ends
                      with a recap. Short explanations show the why before you practice.
                    </p>
                  </div>
                  <div className="cine-device cine-device-lessons" data-reveal>
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
                        The word for &quot;I&quot; can change with speaking style too: male
                        speakers often say <strong>phǒm</strong> (ผม), female speakers often
                        say <strong>chăn</strong> (ฉัน).
                      </span>
                    </div>
                  </div>
                  <p className="cine-foot" data-reveal>Learn the why, not just the words.</p>
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
            Your first stages
          </h2>
          <p className="landing-how-sub">
            Each stage is a set of short, guided missions. Finish a mission and
            the next one unlocks.
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
              <span className="landing-step-stage">Keep going</span>
              <span className="landing-step-title">More stages ahead</span>
              <span className="landing-step-text">Stages 4 to 8 take you from real conversations to Thai Mastery.</span>
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

      <footer className="landing-footer" aria-label="Public links">
        <div className="landing-footer-brand">{SITE_CONFIG.siteName}</div>
        <nav className="landing-footer-links">
          {FOOTER_LINKS.map(link => (
            <a key={link.path} href={link.path} onClick={openPublicPage(link.path)}>
              {link.label}
            </a>
          ))}
        </nav>
      </footer>
    </main>
  );
}
