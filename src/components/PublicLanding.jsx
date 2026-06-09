import React from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  MessageCircle,
  Repeat2,
  Sparkles,
  Target,
  Trophy,
  Volume2,
} from 'lucide-react';
import { CARDS } from '../data/cards.js';
import { speakThai } from '../lib/audio.js';
import { SITE_CONFIG } from '../config/site.js';

// Small, verifiable highlight chips shown under the hero CTAs. Each maps to a
// real part of the app (guided mini-units, the challenge step, mission recaps,
// account sync) so nothing here is an unverified claim.
const HERO_CHIPS = ['Guided missions', 'Quick challenges', 'Mission recaps', 'Device sync'];

// The early-stage "journey" preview. Stage names + themes match the real course
// (Stage 1 Survival Thai, Stage 2 Daily Essentials, Stage 3 Getting Around) and
// the mission content already shipped for Stages 1 to 3. No Thai content here.
const JOURNEY = [
  {
    n: 1,
    Icon: MessageCircle,
    stage: 'Stage 1',
    title: 'First words and politeness',
    text: 'Say hello, thank you, yes and no.',
    start: true,
  },
  {
    n: 2,
    Icon: Sparkles,
    stage: 'Stage 2',
    title: 'Daily essentials',
    text: 'Everyday actions, feelings, and counting.',
  },
  {
    n: 3,
    Icon: Compass,
    stage: 'Stage 3',
    title: 'Getting around',
    text: 'People, places, time, and directions.',
  },
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

const FOOTER_LINKS = [
  { path: '/privacy', label: 'Privacy' },
  { path: '/terms', label: 'Terms' },
  { path: '/support', label: 'Support' },
  { path: '/feedback', label: 'Feedback' },
  { path: '/premium', label: 'Super' },
  { path: '/delete-account', label: 'Account deletion' },
];

export default function PublicLanding({ onGetStarted, onSignIn, onOpenPublicPage, audioRate = 0.95 }) {
  const phrases = PHRASE_SOURCES.map(getPhrase);

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
    <main className="landing-page">
      <header className="landing-topbar">
        <div className="landing-topbar-brand" aria-label={SITE_CONFIG.siteName}>
          <span className="landing-brand-name">{SITE_CONFIG.siteName}</span>
          <span className="landing-brand-slogan">{SITE_CONFIG.slogan}</span>
        </div>
        <button type="button" className="landing-topbar-signin" onClick={onSignIn}>
          Sign in
        </button>
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-scene">
          <img
            className="landing-character"
            src="/characters/muay-thai/speaking.webp"
            alt=""
            aria-hidden="true"
          />
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
            Start speaking useful Thai, one mission at a time.
          </h1>
          <p className="landing-subtitle">
            Short guided missions teach the words, phrases, and patterns that help in real Thai moments.
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

          <p className="landing-comfort">
            <Sparkles size={15} aria-hidden="true" />
            New to Thai? Perfect. Every mission opens with a simple, friendly explanation.
          </p>

          <div className="landing-proof-row" aria-label="Highlights">
            {HERO_CHIPS.map(chip => (
              <span key={chip}><CheckCircle2 size={15} aria-hidden="true" /> {chip}</span>
            ))}
          </div>

          <div className="landing-mobile-phrases" aria-label="Try a phrase">
            <div className="landing-mobile-phrases-title">Try a phrase</div>
            {phrases.map(phrase => (
              <LandingPhraseCard
                phrase={phrase}
                onPlay={playPhrase}
                className="landing-mobile-phrase"
                key={`mobile-${phrase.cardId}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="landing-journey" aria-labelledby="landing-journey-title">
        <div className="landing-section-head">
          <span className="landing-eyebrow">Your journey</span>
          <h2 id="landing-journey-title" className="landing-section-title">
            Your first missions, one step at a time
          </h2>
        </div>
        <ol className="landing-path">
          {JOURNEY.map(({ n, Icon, stage, title, text, start }) => (
            <li className={`landing-step${start ? ' landing-step-start' : ''}`} key={n}>
              <div className="landing-step-node" aria-hidden="true">
                <Icon size={20} />
                <span className="landing-step-n">{n}</span>
              </div>
              <div className="landing-step-copy">
                <span className="landing-step-stage">
                  {stage}
                  {start && <span className="landing-step-badge">Start here</span>}
                </span>
                <span className="landing-step-title">{title}</span>
                <span className="landing-step-text">{text}</span>
              </div>
            </li>
          ))}
          <li className="landing-step landing-step-goal">
            <div className="landing-step-node landing-step-node-goal" aria-hidden="true">
              <Trophy size={20} />
            </div>
            <div className="landing-step-copy">
              <span className="landing-step-stage">Keep going</span>
              <span className="landing-step-title">More missions ahead</span>
              <span className="landing-step-text">Unlock new themes as you finish each one.</span>
            </div>
          </li>
        </ol>
      </section>

      <section className="landing-loop" aria-labelledby="landing-loop-title">
        <div className="landing-section-head">
          <span className="landing-eyebrow">How it works</span>
          <h2 id="landing-loop-title" className="landing-section-title">
            Every mission is a small, friendly loop
          </h2>
        </div>
        <div className="landing-benefits">
          {LOOP.map(({ Icon, step, text }, index) => (
            <article className="landing-benefit landing-loop-card" key={step}>
              <div className="landing-benefit-icon">
                <Icon size={20} aria-hidden="true" />
              </div>
              <h3 className="landing-loop-step">
                <span className="landing-loop-num">{index + 1}</span>
                {step}
              </h3>
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
