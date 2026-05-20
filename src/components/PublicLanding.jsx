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

export default function PublicLanding({ onGetStarted, onSignIn, audioRate = 0.95 }) {
  const phrases = PHRASE_SOURCES.map(getPhrase);

  const playPhrase = (thai) => {
    if (!thai) return;
    try { speakThai(thai, audioRate); } catch (_) { /* TTS unavailable */ }
  };

  return (
    <main className="landing-page">
      <header className="landing-topbar">
        <div className="landing-topbar-brand" aria-label="Tuk Talk Thai">
          <span className="landing-brand-name">Tuk Talk Thai</span>
          <span className="landing-brand-slogan">Learn Thai the fast and fun way.</span>
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
            <div className={`landing-phrase ${phrase.className}`} key={phrase.cardId}>
              <div className="landing-phrase-copy">
                <span className="landing-phrase-thai">{phrase.thai}</span>
                {phrase.ph && <span className="landing-phrase-ph">{phrase.ph}</span>}
                <span className="landing-phrase-en">{phrase.en}</span>
              </div>
              <button
                type="button"
                className="landing-phrase-audio"
                onClick={() => playPhrase(phrase.thai)}
                aria-label={`Play ${phrase.en} pronunciation`}
              >
                <Volume2 size={15} />
              </button>
            </div>
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
    </main>
  );
}
