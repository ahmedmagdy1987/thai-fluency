import React, { useState } from 'react';
import { ChevronRight, Award, Check, X, RotateCcw, Volume2 } from 'lucide-react';
import { TONE_QUIZ_ITEMS } from '../data/gamification.js';
import { TONES } from '../data/reference.js';
import { speakThai, ttsAvailable } from '../lib/audio.js';

export default function TonesQuizSection({ onComplete, bestScore, passed }) {
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const startQuiz = () => {
    const shuffled = [...TONE_QUIZ_ITEMS].sort(() => Math.random() - 0.5).slice(0, 10);
    setQuestions(shuffled);
    setIdx(0); setSelected(null); setScore(0); setDone(false);
  };

  const answer = (tone) => {
    if (selected) return;
    setSelected(tone);
    if (tone === questions[idx].tone) setScore(s => s + 1);
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      setDone(true);
      if (onComplete) onComplete(score, questions.length);
      return;
    }
    setIdx(idx + 1); setSelected(null);
  };

  if (questions.length === 0) {
    return (
      <div>
        {/* Honest framing: nothing is gated on this quiz — tonesQuizPassed only
            feeds the Tone Master achievement (UX audit killed the phantom
            "Required for Level 1" gate; no Level system exists). */}
        <div className="guide-eyebrow">Ear training</div>
        <h2 className="guide-h2">Tone Challenge</h2>
        <p className="guide-p">10 questions. Look at the romanized syllable and pick the correct tone (mid / low / falling / high / rising). Pass with 80% or higher to earn the Tone Master achievement.</p>
        <div className="tones-quiz-intro-stats">
          <div className="tqi-stat">
            <div className="tqi-num">{bestScore || 0}<span className="tqi-of">/10</span></div>
            <div className="tqi-label">Best score</div>
          </div>
          <div className="tqi-stat">
            <div className="tqi-num">{passed ? '✓' : ''}</div>
            <div className="tqi-label">{passed ? 'Passed' : 'Not yet passed'}</div>
          </div>
        </div>
        <button className="btn-primary" onClick={startQuiz} style={{ marginTop: 24 }}><Award size={14} /> Start tone challenge</button>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    const passedNow = pct >= 80;
    return (
      <div className="tones-quiz-results">
        <div className="quiz-results-icon">{passedNow ? '🎵' : '📖'}</div>
        <div className="quiz-results-score">{score} / {questions.length}</div>
        <div className="quiz-results-pct">{pct}%</div>
        <div className="quiz-results-msg">{passedNow ? 'You passed the tone challenge!' : 'Need 80% to pass. Try again!'}</div>
        <div className="quiz-results-actions">
          <button className="btn-primary" onClick={startQuiz}><RotateCcw size={14} /> Try again</button>
        </div>
      </div>
    );
  }

  const q = questions[idx];
  const tones = ['mid', 'low', 'falling', 'high', 'rising'];

  return (
    <div>
      <div className="quiz-header">
        <div className="quiz-progress-text">Question {idx + 1} of {questions.length}</div>
        <div className="quiz-score-text">Score: <span>{score}</span></div>
      </div>
      <div className="quiz-progress-bar"><div className="quiz-progress-fill" style={{ width: `${(idx / questions.length) * 100}%` }} /></div>

      <div className="quiz-card">
        <div className="quiz-prompt-label">What tone is this syllable?</div>
        <div className="tones-quiz-syl">{q.syl}</div>
        <div className="tones-quiz-mean">"{q.mean}"</div>
        {/* Ear training needs EARS: play the syllable so the tone is heard, not
            just read off the diacritic. Tap-to-play (audio.js resolves the Thai
            voice on a user gesture; it fails quietly if the device has none). */}
        {ttsAvailable() && q.thai && (
          <button type="button" className="btn-secondary tones-quiz-hear" onClick={() => speakThai(q.thai)}>
            <Volume2 size={15} /> Hear the tone
          </button>
        )}
      </div>

      <div className="tones-quiz-options">
        {tones.map(tone => {
          const isCorrect = tone === q.tone;
          const isSelected = selected === tone;
          let cls = 'tones-quiz-option';
          if (selected) {
            if (isCorrect) cls += ' tones-quiz-option-correct';
            else if (isSelected) cls += ' tones-quiz-option-wrong';
            else cls += ' tones-quiz-option-faded';
          }
          return (
            <button key={tone} className={cls} onClick={() => answer(tone)} disabled={!!selected} style={{ '--tone-color': TONES[tone].color }}>
              <div className="tqo-symbol">{TONES[tone].symbol}</div>
              <div className="tqo-name">{TONES[tone].name}</div>
              {selected && isCorrect && <Check size={14} className="tqo-check" />}
              {selected && isSelected && !isCorrect && <X size={14} className="tqo-check" />}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="quiz-feedback">
          <div className="quiz-feedback-detail">
            <span className="quiz-feedback-thai">{q.syl}</span>
            <span className="quiz-feedback-en"> Answer: {TONES[q.tone].name} tone, "{q.mean}"</span>
          </div>
          <button className="btn-primary" onClick={next}>
            {idx + 1 >= questions.length ? 'See results' : 'Next'} <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
