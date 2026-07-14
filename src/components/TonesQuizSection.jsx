import React, { useMemo, useState } from 'react';
import { ChevronRight, Award, Check, X, RotateCcw, Volume2, Ear, VolumeX } from 'lucide-react';
import { TONE_QUIZ_ITEMS } from '../data/gamification.js';
import { TONES } from '../data/reference.js';
import { speakThai, ttsAvailable } from '../lib/audio.js';
import { useSessionCombo } from '../hooks/useSessionCombo.js';
import ComboBadge from './ComboBadge.jsx';

// AUDIO-FIRST Tone Challenge (foundation section 5 — `tone-discriminate`).
//
// THE LEAK THIS FIXES: the old version printed `q.syl` (the romanized syllable
// WITH its tone diacritic) above the options, so the printed diacritic WAS the
// answer key — the learner read the tone instead of hearing it. The redesign
// HIDES the written Thai, the diacritic, AND the romanization during the
// question; the prompt is a play button that speaks the item's real `thai`
// (audio comes from `q.thai`, never from the tone label). Everything is
// REVEALED only after the learner answers, so the mapping is still taught.
//
// Grading stays `tone === q.tone` (value equality, never index); question order
// and the five tone options are both shuffled per attempt. Hearts never apply
// here (this is the free ear-training track, not the Stage Challenge).
export default function TonesQuizSection({ onComplete, bestScore, passed }) {
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  // Shuffle the five tone options PER QUESTION (B6) so the correct tone isn't
  // always in the same slot across questions/attempts. Correctness is by tone
  // value (`tone === q.tone`), never by index, so display order is free to vary.
  // Stable within a question (keyed on idx) so it doesn't reshuffle on select.
  // Declared with the other hooks (BEFORE any early return) so hook order stays
  // constant across the intro/question/results renders (rules-of-hooks safe).
  const tones = useMemo(() => {
    const t = ['mid', 'low', 'falling', 'high', 'rising'];
    for (let i = t.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [t[i], t[j]] = [t[j], t[i]]; }
    return t;
  }, [idx]);

  const audioReady = ttsAvailable();
  // Transient session combo (spec 04 §3): display-only momentum; no hearts/XP/SRS/gems.
  const combo = useSessionCombo();

  // Play a syllable's real Thai (user-gesture-initiated: called from Start /
  // Next / the play button, all clicks, so the audio context is unlocked).
  const playSyllable = (thai) => {
    if (audioReady && thai) {
      try { speakThai(thai); } catch (_) { /* fails quietly, button still works */ }
    }
  };

  const startQuiz = () => {
    const shuffled = [...TONE_QUIZ_ITEMS].sort(() => Math.random() - 0.5).slice(0, 10);
    setQuestions(shuffled);
    setIdx(0); setSelected(null); setScore(0); setDone(false);
    combo.reset();
    // Auto-play the first syllable so the learner hears it immediately.
    playSyllable(shuffled[0] && shuffled[0].thai);
  };

  const answer = (tone) => {
    if (selected) return;
    setSelected(tone);
    const isCorrect = tone === questions[idx].tone;
    if (isCorrect) setScore(s => s + 1);
    combo.register(isCorrect); // transient session combo; no hearts/XP/SRS side effects
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      setDone(true);
      if (onComplete) onComplete(score, questions.length);
      return;
    }
    const nextIdx = idx + 1;
    setIdx(nextIdx); setSelected(null);
    // Auto-play the next syllable (this runs inside the Next click gesture).
    playSyllable(questions[nextIdx] && questions[nextIdx].thai);
  };

  if (questions.length === 0) {
    return (
      <div>
        {/* Honest framing: nothing is gated on this quiz — tonesQuizPassed only
            feeds the Tone Master achievement (UX audit killed the phantom
            "Required for Level 1" gate; no Level system exists). */}
        <div className="guide-eyebrow">Ear training</div>
        <h2 className="guide-h2">Tone Challenge</h2>
        <p className="guide-p">10 questions. Listen to each syllable and pick the tone you hear (mid / low / falling / high / rising). The written Thai and romanization stay hidden until you answer — so you train your ear, not your eyes. Pass with 80% or higher to earn the Tone Master achievement.</p>
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
        {audioReady ? (
          <button className="btn-primary" onClick={startQuiz} style={{ marginTop: 24 }}><Award size={14} /> Start tone challenge</button>
        ) : (
          <div className="tones-quiz-noaudio" role="status">
            <VolumeX size={18} />
            <p>This challenge is audio-only — it needs text-to-speech, which isn't available in this browser. Try Chrome or the installed app to train your ear for tones.</p>
          </div>
        )}
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

  return (
    <div>
      <div className="quiz-header">
        <div className="quiz-progress-text">Question {idx + 1} of {questions.length}</div>
        <div className="quiz-header-meta">
          <ComboBadge combo={combo} onMilestone={() => {}} />
          <div className="quiz-score-text">Score: <span>{score}</span></div>
        </div>
      </div>
      <div className="quiz-progress-bar"><div className="quiz-progress-fill" style={{ width: `${(idx / questions.length) * 100}%` }} /></div>

      <div className="quiz-card tones-quiz-card">
        <div className="quiz-prompt-label">Which tone do you hear?</div>
        {/* AUDIO-FIRST PROMPT: no syllable, no diacritic, no romanization, no
            Thai script before the answer — only sound. The written forms reveal
            below once the learner has committed to a tone. */}
        {!selected ? (
          <>
            <button type="button" className="tones-quiz-play" onClick={() => playSyllable(q.thai)} aria-label="Play the syllable">
              <Volume2 size={30} />
            </button>
            <div className="tones-quiz-listen-hint"><Ear size={14} /> Listen, then choose the tone</div>
          </>
        ) : (
          // REVEAL: show what was hidden so the audio→writing mapping is taught.
          <div className="tones-quiz-reveal">
            <div className="tones-quiz-reveal-thai">{q.thai}</div>
            <div className="tones-quiz-reveal-syl">{q.syl}</div>
            <div className="tones-quiz-reveal-mean">"{q.mean}"</div>
            <button type="button" className="btn-secondary tones-quiz-hear" onClick={() => playSyllable(q.thai)}>
              <Volume2 size={15} /> Hear it again
            </button>
          </div>
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
