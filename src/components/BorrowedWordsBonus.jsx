import React from 'react';
import { Volume2 } from 'lucide-react';
import { BORROWED_WORDS } from '../data/borrowedWords.js';
import { speakThai } from '../lib/audio.js';

// "Words You Already Know" — optional bonus list shown in a modal from the
// Learn path. Pure presentation: no XP, no progress writes, no schema. The
// word list lives in src/data/borrowedWords.js (pending native review).
export default function BorrowedWordsBonus({ audioRate = 0.95 }) {
  const play = (thai) => {
    if (!thai) return;
    try { speakThai(thai, audioRate); } catch (_) { /* TTS unavailable */ }
  };

  return (
    <div className="borrowed-words">
      <p className="borrowed-words-lead">
        Thai borrows many everyday words from English and other languages. They are
        not said exactly the way you know them, Thai gives each one its own sounds
        and tones, but your ear already has a head start. Tap the speaker to hear
        the Thai version.
      </p>
      <ul className="borrowed-words-list">
        {BORROWED_WORDS.map(word => (
          <li className="borrowed-word" key={word.id}>
            <div className="borrowed-word-copy">
              <span className="borrowed-word-en">{word.english}</span>
              <span className="borrowed-word-thai" lang="th">{word.thai}</span>
              <span className="borrowed-word-ph">{word.romanization}</span>
              <span className="borrowed-word-note">{word.note}</span>
            </div>
            <button
              type="button"
              className="borrowed-word-audio"
              onClick={() => play(word.thai)}
              aria-label={`Play ${word.english} in Thai`}
            >
              <Volume2 size={16} />
            </button>
          </li>
        ))}
      </ul>
      <p className="borrowed-words-footnote">
        This is a small starter list, and it is pending a native-speaker review.
        It is bonus fun, not a required part of your path.
      </p>
    </div>
  );
}
