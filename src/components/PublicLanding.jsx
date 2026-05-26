import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Cloud,
  MessageCircle,
  Repeat2,
  Volume2,
} from 'lucide-react';
import { CARDS } from '../data/cards.js';
import { speakThai } from '../lib/audio.js';
import { SITE_CONFIG } from '../config/site.js';

const BENEFITS = [
  {
    Icon: MessageCircle,
    title: 'Speak from day one',
    text: 'Start with useful phrases for greetings, food, taxis, prices, and help.',
  },
  {
    Icon: Repeat2,
    title: 'Practice that adapts',
    text: 'Smart flashcards and quick challenges keep the right words in rotation.',
  },
  {
    Icon: Clock3,
    title: 'Short daily lessons',
    text: 'Build confidence in focused sessions that fit around real travel days.',
  },
  {
    Icon: Cloud,
    title: 'Progress everywhere',
    text: 'Sync your learning across devices when you create your account.',
  },
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
            <Volume2 size={16} />
            Practical Thai for real places
          </div>
          <h1 id="landing-title" className="landing-title">
            Real Thai for real life.
          </h1>
          <p className="landing-subtitle">
            Learn the words, sounds, and phrases you actually need in Thailand.
          </p>

          <div className="landing-actions" aria-label="Start learning">
            <button type="button" className="btn-primary landing-primary-cta" onClick={onGetStarted}>
              Get started
              <ArrowRight size={17} />
            </button>
            <button type="button" className="btn-secondary landing-secondary-cta" onClick={onSignIn}>
              I already have an account
            </button>
          </div>

          <div className="landing-proof-row" aria-label="Highlights">
            <span><CheckCircle2 size={15} /> Smart review</span>
            <span><CheckCircle2 size={15} /> Quick challenges</span>
            <span><CheckCircle2 size={15} /> Device sync</span>
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

      <section className="landing-benefits" aria-label="Key benefits">
        {BENEFITS.map(({ Icon, title, text }) => (
          <article className="landing-benefit" key={title}>
            <div className="landing-benefit-icon">
              <Icon size={20} />
            </div>
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
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
