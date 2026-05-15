import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Award, Check, CheckCircle2, ChevronRight, RotateCcw, Volume2, X, XCircle } from 'lucide-react';
import { CARDS } from '../data/cards.js';
import { displayCard } from '../lib/voice.js';
import { speakThai, ttsAvailable } from '../lib/audio.js';
import { playCharacterCorrect, playCharacterWrong } from '../lib/sounds.js';
import { resolveCoachIdForStage } from '../data/stageCharacters.js';
import { useCharacterReaction } from '../hooks/useCharacterReaction.js';
import CharacterCoach from './CharacterCoach.jsx';

const QUESTION_COUNT = 12;
const MIN_DISTRACTORS = 2;
const MAX_DISTRACTORS = 3;

const QUESTION_TYPES = {
  'thai-to-en': {
    label: 'Thai to English',
    intro: 'Read Thai and choose the meaning.',
    promptLabel: 'Choose the English meaning',
    answerLabel: 'Meaning',
  },
  'en-to-thai': {
    label: 'English to Thai',
    intro: 'Read English and choose the Thai.',
    promptLabel: 'Choose the Thai',
    answerLabel: 'Thai',
  },
};

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function normalizeAnswer(text, type) {
  const base = String(text || '').trim().toLowerCase();
  if (type === 'en-to-thai') {
    return base.replace(/\s+/g, '');
  }
  return base
    .replace(/\([^)]*\)/g, '')
    .replace(/\b(male|female|formal|casual)\b/g, '')
    .replace(/[^a-z0-9\u0E00-\u0E7F]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getDisplayed(card, voice) {
  return displayCard(card, voice) || card;
}

function getPromptText(card, type, voice) {
  const c = getDisplayed(card, voice);
  return type === 'thai-to-en' ? c.thai : c.en;
}

function getAnswerText(card, type, voice) {
  const c = getDisplayed(card, voice);
  return type === 'thai-to-en' ? c.en : c.thai;
}

function isEligible(card, type, voice) {
  return !!(
    card &&
    card.thai &&
    card.en &&
    getPromptText(card, type, voice) &&
    getAnswerText(card, type, voice)
  );
}

function collectDistractors(correct, pool, type, voice) {
  const correctNorm = normalizeAnswer(getAnswerText(correct, type, voice), type);
  const seenIds = new Set([correct.id]);
  const seenAnswers = new Set([correctNorm]);
  const picked = [];

  const tiers = [
    card => (card.stage || 1) === (correct.stage || 1) && card.cat === correct.cat,
    card => card.cat === correct.cat,
    card => (card.stage || 1) === (correct.stage || 1),
    () => true,
  ];

  tiers.forEach(matchesTier => {
    if (picked.length >= MAX_DISTRACTORS) return;
    const candidates = shuffle(pool).filter(card => {
      if (picked.length >= MAX_DISTRACTORS) return false;
      if (seenIds.has(card.id) || !matchesTier(card)) return false;
      const answer = getAnswerText(card, type, voice);
      const norm = normalizeAnswer(answer, type);
      if (!norm || seenAnswers.has(norm)) return false;
      return true;
    });

    candidates.forEach(card => {
      if (picked.length >= MAX_DISTRACTORS) return;
      const norm = normalizeAnswer(getAnswerText(card, type, voice), type);
      seenIds.add(card.id);
      seenAnswers.add(norm);
      picked.push(card);
    });
  });

  return picked;
}

function buildQuestions(type, maxUnlockedStage, voice) {
  const upper = maxUnlockedStage || 1;
  const pool = CARDS
    .filter(card => (card.stage || 1) <= upper)
    .filter(card => isEligible(card, type, voice));

  const candidates = shuffle(pool);
  const questions = [];
  const usedCorrectAnswers = new Set();

  candidates.forEach(correct => {
    if (questions.length >= QUESTION_COUNT) return;
    const correctNorm = normalizeAnswer(getAnswerText(correct, type, voice), type);
    if (!correctNorm || usedCorrectAnswers.has(correctNorm)) return;

    const distractors = collectDistractors(correct, pool, type, voice);
    if (distractors.length < MIN_DISTRACTORS) return;

    usedCorrectAnswers.add(correctNorm);
    questions.push({
      id: `${type}-${correct.id}-${questions.length}`,
      type,
      correct,
      options: shuffle([correct, ...distractors]),
    });
  });

  return { poolSize: pool.length, questions };
}

export default function QuizTab({
  onComplete,
  voice,
  maxUnlockedStage,
  audioRate = 0.95,
  showCharacters = true,
}) {
  const [type, setType] = useState('thai-to-en');
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [poolError, setPoolError] = useState(null);
  const checkLockedRef = useRef(false);

  const current = questions[idx] || null;
  const correctDisplay = current ? getDisplayed(current.correct, voice) : null;
  const selected = current?.options.find(option => option.id === selectedId) || null;
  const selectedIsCorrect = !!(selected && current && selected.id === current.correct.id);
  const coachId = useMemo(
    () => resolveCoachIdForStage(current?.correct?.stage || maxUnlockedStage || 1),
    [current?.correct?.stage, maxUnlockedStage]
  );
  const coach = useCharacterReaction({ characterId: coachId, initialState: 'greeting', mode: 'quiz' });

  useEffect(() => {
    if (!current) return;
    coach.react('greeting', { duration: 1400, message: 'Pick the best answer.' });
  }, [current?.id]);

  const startQuiz = (nextType) => {
    const built = buildQuestions(nextType, maxUnlockedStage, voice);
    if (built.questions.length < 1) {
      setPoolError(`Not enough unlocked cards for this challenge yet. Available cards: ${built.poolSize}.`);
      return;
    }
    setType(nextType);
    setQuestions(built.questions);
    setIdx(0);
    setSelectedId(null);
    setChecked(false);
    setScore(0);
    setDone(false);
    setPoolError(null);
    checkLockedRef.current = false;
  };

  const resetQuiz = () => {
    setQuestions([]);
    setIdx(0);
    setSelectedId(null);
    setChecked(false);
    setScore(0);
    setDone(false);
    setPoolError(null);
    checkLockedRef.current = false;
    coach.clearMessage();
  };

  const handleSelect = (option) => {
    if (checked) return;
    setSelectedId(option.id);
    if (type === 'en-to-thai') {
      const thai = getDisplayed(option, voice)?.thai;
      if (thai) {
        try { speakThai(thai, audioRate); } catch (_) { /* ignore */ }
      }
    }
    coach.react('choiceSelected', { duration: 900, message: 'Locked in?' });
  };

  const handleCheck = () => {
    if (!current || !selected || checked || checkLockedRef.current) return;
    checkLockedRef.current = true;
    setChecked(true);
    if (selected.id === current.correct.id) {
      setScore(prev => prev + 1);
      coach.react('correct', { duration: 1700 });
      playCharacterCorrect(coachId);
    } else {
      coach.react('wrong', { duration: 1900 });
      playCharacterWrong(coachId);
    }
  };

  const handleContinue = () => {
    if (!checked) return;
    if (idx + 1 >= questions.length) {
      const finalScore = score;
      setDone(true);
      coach.react(finalScore === questions.length ? 'celebrating' : 'idle', { duration: 1800 });
      if (onComplete) onComplete(finalScore, questions.length);
      return;
    }
    setIdx(prev => prev + 1);
    setSelectedId(null);
    setChecked(false);
    checkLockedRef.current = false;
  };

  const playCorrectThai = () => {
    if (correctDisplay?.thai) speakThai(correctDisplay.thai, audioRate);
    coach.react('speaking', { duration: 1400 });
  };

  if (questions.length === 0) {
    return (
      <div className="tab-content quiz-mode">
        <div className="quiz-mode-intro">
          {showCharacters && (
            <div className="quiz-mode-coach">
              <CharacterCoach
                characterId={coachId}
                state={coach.state}
                message={coach.message || 'Ready for a quick challenge?'}
                compact
              />
            </div>
          )}
          <div className="quiz-mode-intro-icon"><Award size={34} /></div>
          <h2 className="quiz-mode-title">Challenge</h2>
          <p className="quiz-mode-sub">Test yourself with quick questions and build confidence.</p>
          {poolError && <p className="quiz-pool-error">{poolError}</p>}
          <div className="quiz-mode-direction-grid">
            {Object.entries(QUESTION_TYPES).map(([id, config]) => (
              <button key={id} className="quiz-mode-direction-btn" onClick={() => startQuiz(id)}>
                <span className="quiz-mode-direction-title">{config.label}</span>
                <span className="quiz-mode-direction-sub">{config.intro}</span>
                <ChevronRight size={18} />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    const msg = pct === 100 ? 'Perfect round.' : pct >= 80 ? 'Strong challenge.' : pct >= 60 ? 'Good practice.' : 'Keep practicing.';
    return (
      <div className="tab-content quiz-mode">
        <div className="quiz-mode-results">
          {showCharacters && (
            <div className="quiz-mode-coach">
              <CharacterCoach
                characterId={coachId}
                state={coach.state}
                message={coach.message || (pct >= 80 ? 'Strong run!' : 'Keep practicing.')}
                compact
              />
            </div>
          )}
          <div className="quiz-mode-results-icon">{pct >= 80 ? <CheckCircle2 size={54} /> : <Award size={54} />}</div>
          <div className="quiz-mode-results-score">{score} / {questions.length}</div>
          <div className="quiz-mode-results-pct">{pct}%</div>
          <div className="quiz-mode-results-msg">{msg}</div>
          <div className="quiz-results-actions">
            <button className="btn-primary" onClick={() => startQuiz(type)}><RotateCcw size={14} /> Try again</button>
            <button className="btn-secondary" onClick={resetQuiz}>Change direction</button>
          </div>
        </div>
      </div>
    );
  }

  const typeConfig = QUESTION_TYPES[type];
  const prompt = getPromptText(current.correct, type, voice);
  const progressPct = Math.round((idx / questions.length) * 100);

  return (
    <div className="tab-content quiz-mode">
      <div className="quiz-mode-header">
        <div>
          <div className="quiz-progress-text">Question {idx + 1} of {questions.length}</div>
          <div className="quiz-mode-type">{typeConfig.label}</div>
        </div>
        <div className="quiz-score-text">Score: <span>{score}</span></div>
      </div>
      <div className="quiz-progress-bar"><div className="quiz-progress-fill" style={{ width: `${progressPct}%` }} /></div>

      <section className={`quiz-mode-card quiz-mode-card-${type}`}>
        {showCharacters && (
          <div className="quiz-mode-coach quiz-mode-coach-card">
            <CharacterCoach
              characterId={coachId}
              state={coach.state}
              message={coach.message}
              compact
            />
          </div>
        )}
        <div className="quiz-mode-prompt-label">{typeConfig.promptLabel}</div>
        <div className={`quiz-mode-prompt ${type === 'thai-to-en' ? 'quiz-mode-prompt-thai' : 'quiz-mode-prompt-en'}`}>
          {prompt}
        </div>
        {type === 'thai-to-en' && correctDisplay?.ph && (
          <div className="quiz-mode-prompt-ph">{correctDisplay.ph}</div>
        )}
        {ttsAvailable() && correctDisplay?.thai && (
          <button
            type="button"
            className="speaker-btn speaker-btn-card quiz-mode-speaker"
            onClick={playCorrectThai}
            aria-label="Play pronunciation"
            title="Play pronunciation"
          >
            <Volume2 size={16} />
          </button>
        )}
      </section>

      <div className="quiz-mode-options" role="list">
        {current.options.map((rawOpt, i) => {
          const opt = getDisplayed(rawOpt, voice);
          const answer = getAnswerText(rawOpt, type, voice);
          const isCorrect = rawOpt.id === current.correct.id;
          const isSelected = rawOpt.id === selectedId;
          const cls = [
            'quiz-mode-option',
            isSelected && !checked && 'quiz-mode-option-selected',
            checked && isCorrect && 'quiz-mode-option-correct',
            checked && isSelected && !isCorrect && 'quiz-mode-option-wrong',
            checked && !isSelected && !isCorrect && 'quiz-mode-option-faded',
          ].filter(Boolean).join(' ');

          return (
            <button
              key={rawOpt.id}
              type="button"
              className={cls}
              onClick={() => handleSelect(rawOpt)}
              disabled={checked}
              aria-pressed={isSelected}
            >
              <span className="quiz-option-letter">{String.fromCharCode(65 + i)}</span>
              <span className="quiz-mode-option-main">
                {type === 'en-to-thai' ? (
                  <>
                    <span className="quiz-mode-option-thai">{answer}</span>
                    {opt.ph && <span className="quiz-mode-option-sub">{opt.ph}</span>}
                  </>
                ) : (
                  <span className="quiz-mode-option-en">{answer}</span>
                )}
              </span>
              {checked && isCorrect && <Check size={18} className="quiz-option-check" />}
              {checked && isSelected && !isCorrect && <X size={18} className="quiz-option-check" />}
            </button>
          );
        })}
      </div>

      <div className="quiz-mode-actions">
        {!checked ? (
          <button className="btn-primary quiz-mode-check-btn" onClick={handleCheck} disabled={!selectedId}>
            Check
          </button>
        ) : (
          <button className="btn-primary quiz-mode-check-btn" onClick={handleContinue}>
            {idx + 1 >= questions.length ? 'See results' : 'Continue'} <ChevronRight size={16} />
          </button>
        )}
      </div>

      {checked && (
        <div className={`quiz-mode-feedback ${selectedIsCorrect ? 'quiz-mode-feedback-correct' : 'quiz-mode-feedback-wrong'}`}>
          <div className="quiz-mode-feedback-icon">
            {selectedIsCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          </div>
          <div className="quiz-mode-feedback-body">
            <div className="quiz-mode-feedback-title">
              {selectedIsCorrect ? 'Correct.' : 'Not quite.'}
            </div>
            <div className="quiz-mode-feedback-detail">
              Correct {typeConfig.answerLabel.toLowerCase()}: <strong>{getAnswerText(current.correct, type, voice)}</strong>
            </div>
            <div className="quiz-mode-feedback-pair">
              {correctDisplay.thai}
              {correctDisplay.ph ? ` (${correctDisplay.ph})` : ''} = {correctDisplay.en}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
