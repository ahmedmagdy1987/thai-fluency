import React, { useState } from 'react';
import { ChevronRight, Award, Check, X, RotateCcw } from 'lucide-react';
import { CARDS } from '../data/cards.js';
import { displayCard, displayLine, transformThai, transformPh, transformEn, DEFAULT_VOICE, DEFAULT_VIEW_MODE } from '../lib/voice.js';

export default function QuizTab({ onComplete, voice, maxUnlockedStage }) {
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [direction, setDirection] = useState('thai-to-en'); // or en-to-thai

  const [poolError, setPoolError] = useState(null);

  const startQuiz = (dir) => {
    // Need both phonetic and English non-empty: speak-mode hides Thai script in
    // option cells, so an empty ph renders the option as a blank button.
    // Quiz draws only from unlocked stages (sequential unlock).
    const upper = maxUnlockedStage || 1;
    const eligible = CARDS.filter(c => (c.stage || 1) <= upper);
    const pool = eligible.filter(c =>
      c.cat !== 'numbers' && c.type !== 'g' &&
      c.ph && c.ph.trim() &&
      c.en && c.en.trim()
    );
    if (pool.length < 20) {
      setPoolError(`Not enough cards yet for this quiz mode (only ${pool.length} cards have both Thai and phonetic). Add more cards or wait for the next phonetic generation pass.`);
      return;
    }
    setPoolError(null);
    setDirection(dir);
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 15);
    const qs = shuffled.map(correct => {
      const distractors = pool.filter(c => c.id !== correct.id && c.cat !== correct.cat).sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [correct, ...distractors].sort(() => Math.random() - 0.5);
      return { correct, options };
    });
    setQuestions(qs);
    setIdx(0); setSelected(null); setScore(0); setDone(false);
  };

  const answer = (option) => {
    if (selected) return;
    setSelected(option);
    if (option.id === questions[idx].correct.id) setScore(s => s + 1);
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
      <div className="tab-content">
        <div className="quiz-intro">
          <div className="quiz-intro-icon"><Award size={36} /></div>
          <h2 className="quiz-intro-title">Quiz Yourself</h2>
          <p className="quiz-intro-sub">15 random questions from your deck. Pick a direction:</p>
          {poolError && <p className="quiz-pool-error">{poolError}</p>}
          <div className="quiz-direction-grid">
            <button className="quiz-direction-btn" onClick={() => startQuiz('thai-to-en')}>
              <div className="quiz-dir-thai-wrap">
                <span className="quiz-dir-thai">ภาษาไทย</span>
                <span className="quiz-dir-thai-ph">phaa-sǎa thai</span>
              </div>
              <ChevronRight size={20} />
              <span className="quiz-dir-en">English</span>
              <span className="quiz-dir-label">Recognize Thai</span>
            </button>
            <button className="quiz-direction-btn" onClick={() => startQuiz('en-to-thai')}>
              <span className="quiz-dir-en">English</span>
              <ChevronRight size={20} />
              <div className="quiz-dir-thai-wrap">
                <span className="quiz-dir-thai">ภาษาไทย</span>
                <span className="quiz-dir-thai-ph">phaa-sǎa thai</span>
              </div>
              <span className="quiz-dir-label">Produce Thai</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    const msg = pct === 100 ? 'Perfect!' : pct >= 80 ? 'Excellent!' : pct >= 60 ? 'Good effort.' : 'Keep practicing.';
    return (
      <div className="tab-content">
        <div className="quiz-results">
          <div className="quiz-results-icon">{pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '📚'}</div>
          <div className="quiz-results-score">{score} / {questions.length}</div>
          <div className="quiz-results-pct">{pct}%</div>
          <div className="quiz-results-msg">{msg}</div>
          <div className="quiz-results-actions">
            <button className="btn-primary" onClick={() => startQuiz(direction)}><RotateCcw size={14} /> Try again</button>
            <button className="btn-secondary" onClick={() => setQuestions([])}>Change direction</button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[idx];
  const correctDisplay = displayCard(q.correct, voice);
  const prompt = direction === 'thai-to-en' ? correctDisplay.thai : correctDisplay.en;
  const promptPh = direction === 'thai-to-en' ? correctDisplay.ph : null;

  return (
    <div className="tab-content">
      <div className="quiz-header">
        <div className="quiz-progress-text">Question {idx + 1} of {questions.length}</div>
        <div className="quiz-score-text">Score: <span>{score}</span></div>
      </div>
      <div className="quiz-progress-bar"><div className="quiz-progress-fill" style={{ width: `${((idx) / questions.length) * 100}%` }} /></div>

      <div className="quiz-card">
        <div className="quiz-prompt-label">{direction === 'thai-to-en' ? 'What does this mean?' : 'What is the Thai for...'}</div>
        <div className={`quiz-prompt ${direction === 'thai-to-en' ? 'quiz-prompt-thai' : ''}`}>{prompt}</div>
        {promptPh && <div className="quiz-prompt-ph">{promptPh}</div>}
      </div>

      <div className="quiz-options">
        {q.options.map((rawOpt, i) => {
          const opt = displayCard(rawOpt, voice);
          const isCorrect = opt.id === q.correct.id;
          const isSelected = selected && opt.id === selected.id;
          let cls = 'quiz-option';
          if (selected) {
            if (isCorrect) cls += ' quiz-option-correct';
            else if (isSelected) cls += ' quiz-option-wrong';
            else cls += ' quiz-option-faded';
          }
          return (
            <button key={opt.id} className={cls} onClick={() => answer(opt)} disabled={!!selected}>
              <span className="quiz-option-letter">{String.fromCharCode(65 + i)}</span>
              <span className="quiz-option-text">
                {direction === 'thai-to-en' ? opt.en : <><span className="quiz-opt-thai">{opt.thai}</span><span className="quiz-opt-ph"> {opt.ph}</span></>}
              </span>
              {selected && isCorrect && <Check size={18} className="quiz-option-check" />}
              {selected && isSelected && !isCorrect && <X size={18} className="quiz-option-check" />}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="quiz-feedback">
          {direction === 'thai-to-en' && (
            <div className="quiz-feedback-detail">
              <span className="quiz-feedback-thai">{correctDisplay.thai}</span>
              <span className="quiz-feedback-ph"> {correctDisplay.ph}</span>
              <span className="quiz-feedback-en"> = {correctDisplay.en}</span>
            </div>
          )}
          <button className="btn-primary" onClick={next}>
            {idx + 1 >= questions.length ? 'See results' : 'Next'} <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
