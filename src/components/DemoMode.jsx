import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Volume2, ChevronRight, UserPlus, Sparkles, Check, X, BookOpen, CheckCircle2 } from 'lucide-react';
import { CARDS } from '../data/cards.js';
import { STAGE_1_MINI_UNIT_PILOT } from '../data/miniUnits.js';
import { STAGES } from '../data/taxonomy.js';
import { DEFAULT_VIEW_MODE, DEFAULT_CARD_DIRECTION, DEFAULT_VOICE, displayCard, transformText } from '../lib/voice.js';
import { speakThai, ttsAvailable } from '../lib/audio.js';
import { intervalLabel } from '../lib/srs.js';
import { playFlip, playCharacterSelect, playCharacterCorrect, playCharacterWrong } from '../lib/sounds.js';
import { resolveCoachIdForStage } from '../data/stageCharacters.js';
import { useCharacterReaction } from '../hooks/useCharacterReaction.js';
import CharacterCoach from './CharacterCoach.jsx';
import CardDirectionToggle from './CardDirectionToggle.jsx';
import SpeakerStyleToggle from './SpeakerStyleToggle.jsx';
import RateBtn from './RateBtn.jsx';

// Guided demo for first-time visitors: three smart flashcards WITH the real
// rating buttons, one multiple-choice quick check, and a mini-lesson preview,
// so a new visitor sees how the product actually works before signing up.
// Read-only: ratings here are a simulation of the real review loop and write
// no SRS state, XP, or streaks. The only persistence is the current demo
// position in localStorage (DEMO_IDX_KEY) so a refresh resumes in place.
const DEMO_FLASHCARD_IDS = [310, 312, 853];
// Quick-check question: prompt is the meaning of a card the visitor just
// practiced; the distractors are other demo/survival cards.
const DEMO_QUIZ_CORRECT_ID = 312;
const DEMO_QUIZ_OPTION_IDS = [251, 312, 310, 250];
const DEMO_IDX_KEY = 'tuk-talk-thai-demo-idx';

// Demo positions: 0-2 flashcards, then quick check, then mini-lesson preview,
// then the sign-up screen.
const QUIZ_POS = DEMO_FLASHCARD_IDS.length;
const LESSON_POS = QUIZ_POS + 1;
const END_POS = LESSON_POS + 1;

// Rating buttons mirror the real review screen (CardsTab) exactly: same
// labels, same colors, same projected intervals for a new card.
const DEMO_RATINGS = [
  { rating: 1, label: 'Again', color: '#A03B2C' },
  { rating: 2, label: 'Hard', color: '#E0823B' },
  { rating: 3, label: 'Good', color: '#2E7D5B' },
  { rating: 4, label: 'Easy', color: '#2563A8' },
];

function cardById(id) {
  return CARDS.find(c => c.id === id) || null;
}

export default function DemoMode({
  onSignUp,
  onSignIn,
  onBackToHome,
  viewMode = DEFAULT_VIEW_MODE,
  voice = DEFAULT_VOICE,
  onChangeVoice,
  audioRate = 0.72,
  audioAutoPlay = false,
  showCharacters = true,
}) {
  // The speaking style flips the demo cards at display time (displayCard), so
  // the visitor sees the toggle really change the words, not just a label.
  const cards = useMemo(
    () => DEMO_FLASHCARD_IDS.map(cardById).filter(Boolean).map(c => displayCard(c, voice) || c),
    [voice]
  );
  const quizCorrect = useMemo(() => displayCard(cardById(DEMO_QUIZ_CORRECT_ID), voice), [voice]);
  const quizOptions = useMemo(
    () => DEMO_QUIZ_OPTION_IDS.map(cardById).filter(Boolean).map(c => displayCard(c, voice) || c),
    [voice]
  );
  // The mini-lesson preview prose follows the speaking style too, so the
  // visitor who just picked Female does not see male forms one screen later.
  const lessonIntro = useMemo(() => {
    const raw = STAGE_1_MINI_UNIT_PILOT.lessonIntro || null;
    if (!raw || voice !== 'female') return raw;
    return {
      ...raw,
      lead: transformText(raw.lead, voice),
      points: Array.isArray(raw.points)
        ? raw.points.map(p => ({ ...p, text: transformText(p.text, voice) }))
        : raw.points,
    };
  }, [voice]);
  const lessonRecap = useMemo(() => {
    const raw = STAGE_1_MINI_UNIT_PILOT.missionRecap || null;
    if (!raw || voice !== 'female') return raw;
    return {
      ...raw,
      achievements: Array.isArray(raw.achievements)
        ? raw.achievements.map(item => transformText(item, voice))
        : raw.achievements,
    };
  }, [voice]);

  const [pos, setPos] = useState(() => {
    try {
      const stored = parseInt(localStorage.getItem(DEMO_IDX_KEY) || '0', 10);
      return Math.max(0, Math.min(Number.isFinite(stored) ? stored : 0, END_POS));
    } catch {
      return 0;
    }
  });
  const [revealed, setRevealed] = useState(false);
  // Demo-local direction preference (English first by default, like the real
  // app). Not persisted: anonymous visitors have no settings store.
  const [direction, setDirection] = useState(DEFAULT_CARD_DIRECTION);
  const [rated, setRated] = useState(false);
  const [quizSelectedId, setQuizSelectedId] = useState(null);
  const [quizChecked, setQuizChecked] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speakingTimerRef = useRef(null);
  const advanceTimerRef = useRef(null);

  const isEnglishFirst = direction !== 'th-first';
  const card = pos < cards.length ? cards[pos] : null;
  const coachId = useMemo(
    () => resolveCoachIdForStage((card && card.stage) || 1),
    [card && card.stage]
  );
  const coach = useCharacterReaction({ characterId: coachId, initialState: 'greeting', mode: 'review' });

  // Greet the user on the very first card so the demo feels welcoming, then
  // settle the coach into the idle/thinking rhythm the real lesson uses.
  useEffect(() => {
    if (!card) return;
    if (pos === 0 && !revealed) {
      coach.react('greeting', { duration: 1600, message: 'Welcome! Tap the card to see the answer.' });
    } else if (!revealed) {
      coach.setRestingState('idle');
    }
  }, [card && card.id]);

  useEffect(() => {
    coach.setRestingState(revealed ? 'thinking' : 'idle');
  }, [revealed]);

  useEffect(() => () => {
    if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
  }, []);

  // Auto-play only when the Thai side is visible. English-first keeps the
  // audio for after the reveal so it cannot give the answer away. Two effects
  // so an early reveal cannot cancel the Thai-first prompt audio.
  useEffect(() => {
    if (!audioAutoPlay || isEnglishFirst || !card || !card.thai) return undefined;
    const t = setTimeout(() => triggerSpeak(card.thai), 350);
    return () => clearTimeout(t);
  }, [card && card.id, audioAutoPlay, audioRate, isEnglishFirst]);
  useEffect(() => {
    if (!audioAutoPlay || !isEnglishFirst || !revealed || !card || !card.thai) return undefined;
    const t = setTimeout(() => triggerSpeak(card.thai), 350);
    return () => clearTimeout(t);
  }, [card && card.id, audioAutoPlay, audioRate, isEnglishFirst, revealed]);

  const triggerSpeak = (text) => {
    if (!text) return;
    try { speakThai(text, audioRate); } catch { /* ignore */ }
    setIsSpeaking(true);
    coach.react('speaking', { duration: 1600 });
    if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
    speakingTimerRef.current = setTimeout(() => setIsSpeaking(false), 1600);
  };

  const handleReveal = () => {
    if (revealed) return;
    setRevealed(true);
    playFlip();
    coach.react('choiceSelected', { duration: 900 });
    playCharacterSelect(coachId);
  };

  const goTo = (next) => {
    try { localStorage.setItem(DEMO_IDX_KEY, String(next)); } catch { /* ignore */ }
    setRevealed(false);
    setRated(false);
    setQuizSelectedId(null);
    setQuizChecked(false);
    setPos(next);
  };

  // Simulated rating: shows the same buttons and feedback rhythm as the real
  // review loop, but schedules nothing (the demo never writes progress).
  const handleRate = (rating) => {
    if (rated) return;
    setRated(true);
    if (rating >= 3) {
      playCharacterCorrect(coachId);
      coach.react('correct', { duration: 1400, message: 'In the real app, this card would come back right on time.' });
    } else {
      playCharacterWrong(coachId);
      coach.react('thinking', { duration: 1400, message: 'No problem. In the real app, it would come back sooner.' });
    }
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = setTimeout(() => goTo(pos + 1), 900);
  };

  const selectQuizOption = (option) => {
    if (quizChecked) return;
    setQuizSelectedId(option.id);
    if (option.thai) triggerSpeak(option.thai);
  };

  const checkQuiz = () => {
    if (!quizSelectedId || quizChecked) return;
    setQuizChecked(true);
    if (quizSelectedId === DEMO_QUIZ_CORRECT_ID) playCharacterCorrect(coachId);
    else playCharacterWrong(coachId);
  };

  const quizIsCorrect = quizChecked && quizSelectedId === DEMO_QUIZ_CORRECT_ID;

  const stepLabel = pos < cards.length
    ? `Smart flashcard ${pos + 1} of ${cards.length}`
    : pos === QUIZ_POS
      ? 'Quick check'
      : 'Mini lesson';
  const totalSteps = END_POS;
  const progressPct = Math.min(100, ((Math.min(pos, totalSteps - 1) + 1) / totalSteps) * 100);

  const footerLinks = (
    <div className="demo-footer-links">
      <button type="button" className="auth-link demo-signin-link" onClick={onSignIn}>
        Already have an account? Sign in
      </button>
      {onBackToHome && (
        <button type="button" className="auth-link demo-home-link" onClick={onBackToHome}>
          Back to home
        </button>
      )}
    </div>
  );

  // After every step: signup CTA. No path back to the demo without clearing browser data.
  if (pos >= END_POS) {
    return (
      <div className="onboard-root">
        <div className="onboard-card demo-end-card">
          <div className="demo-end-icon"><Sparkles size={48} /></div>
          <div className="onboard-eyebrow">Demo complete</div>
          <h1 className="onboard-title">Loved it?</h1>
          <p className="demo-end-thai">gèng mâak (เก่งมาก). That means: very good.</p>
          <p className="onboard-sub">
            That was the real learning loop: smart flashcards, quick checks, and
            short mini lessons. Sign up to save your progress and unlock all{' '}
            {STAGES.length} stages, from Survival Thai through Thai Mastery. Free forever.
          </p>
          <button className="btn-primary auth-cta demo-end-cta" onClick={onSignUp}>
            <UserPlus size={16} /> Create my account
          </button>
          <button type="button" className="auth-link demo-end-signin" onClick={onSignIn}>
            Already have an account? Sign in
          </button>
          {onBackToHome && (
            <button type="button" className="auth-link demo-end-home" onClick={onBackToHome}>
              Back to home
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Mini lesson preview ──────────────────────────────────────────────────
  if (pos === LESSON_POS) {
    return (
      <div className="onboard-root">
        <div className="onboard-card demo-card-wrap">
          <div className="demo-progress-row">
            <div className="demo-progress-text">Demo: {stepLabel}</div>
            <div className="demo-progress-bar">
              <div className="demo-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <div className="demo-lesson-preview">
            <div className="demo-lesson-head">
              <span className="demo-lesson-icon" aria-hidden="true"><BookOpen size={18} /></span>
              <div>
                <div className="demo-lesson-eyebrow">Missions are guided lessons</div>
                <h2 className="demo-lesson-title">Every mission opens with a short explanation</h2>
              </div>
            </div>
            {lessonIntro && (
              <div className="demo-lesson-intro-card">
                {lessonIntro.lead && <p className="demo-lesson-lead">{lessonIntro.lead}</p>}
                {Array.isArray(lessonIntro.points) && lessonIntro.points.length > 0 && (
                  <ul className="demo-lesson-points">
                    {lessonIntro.points.slice(0, 2).map((p, i) => (
                      <li key={i}><strong>{p.label}:</strong> {p.text}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <p className="demo-lesson-note">
              Then come the flashcards, a sentence to practice, a quick check,
              and a recap of what you learned:
            </p>
            {lessonRecap && Array.isArray(lessonRecap.achievements) && (
              <ul className="demo-lesson-recap">
                {lessonRecap.achievements.slice(0, 2).map((item, i) => (
                  <li key={i}><CheckCircle2 size={14} aria-hidden="true" /> <span>{item}</span></li>
                ))}
              </ul>
            )}
            <p className="demo-lesson-note demo-lesson-note-structure">
              The full course is {STAGES.length} stages. Each stage is a set of
              short missions like this one.
            </p>
          </div>

          <button className="btn-primary auth-cta demo-next-btn" onClick={() => goTo(pos + 1)}>
            See what&apos;s next <ChevronRight size={16} />
          </button>

          {footerLinks}
        </div>
      </div>
    );
  }

  // ── Multiple-choice quick check ──────────────────────────────────────────
  if (pos === QUIZ_POS && quizCorrect) {
    return (
      <div className="onboard-root">
        <div className="onboard-card demo-card-wrap">
          <div className="demo-progress-row">
            <div className="demo-progress-text">Demo: {stepLabel}</div>
            <div className="demo-progress-bar">
              <div className="demo-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <div className="demo-quiz">
            <div className="miniunit-question-card demo-quiz-question">
              <div className="miniunit-question-label">Choose the Thai</div>
              <div className="miniunit-question-prompt">{quizCorrect.en}</div>
            </div>
            <div className="miniunit-options demo-quiz-options" role="group" aria-label="Answer choices">
              {quizOptions.map((option, index) => {
                const isSelected = quizSelectedId === option.id;
                const isCorrect = option.id === DEMO_QUIZ_CORRECT_ID;
                const cls = [
                  'miniunit-option',
                  isSelected && !quizChecked && 'miniunit-option-selected',
                  quizChecked && isCorrect && 'miniunit-option-correct',
                  quizChecked && isSelected && !isCorrect && 'miniunit-option-wrong',
                  quizChecked && !isSelected && !isCorrect && 'miniunit-option-faded',
                ].filter(Boolean).join(' ');
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={cls}
                    onClick={() => selectQuizOption(option)}
                    disabled={quizChecked}
                    aria-pressed={isSelected}
                  >
                    <span className="miniunit-option-letter">{String.fromCharCode(65 + index)}</span>
                    <span className="miniunit-option-body">
                      <span className="miniunit-option-ph demo-quiz-option-ph">{option.ph}</span>
                      <span className="miniunit-option-thai demo-quiz-option-thai">{option.thai}</span>
                    </span>
                    {quizChecked && isCorrect && <Check size={18} className="miniunit-option-mark" />}
                    {quizChecked && isSelected && !isCorrect && <X size={18} className="miniunit-option-mark" />}
                  </button>
                );
              })}
            </div>
            {quizChecked && (
              <div className={`miniunit-feedback ${quizIsCorrect ? 'miniunit-feedback-correct' : 'miniunit-feedback-wrong'}`}>
                {quizIsCorrect ? <CheckCircle2 size={18} /> : <X size={18} />}
                <span>{quizIsCorrect ? 'Correct.' : `Answer: ${quizCorrect.ph} (${quizCorrect.thai})`}</span>
              </div>
            )}
            <p className="demo-smart-note">Quick checks like this follow the flashcards in every mission.</p>
          </div>

          {!quizChecked ? (
            <button className="btn-primary auth-cta demo-next-btn" onClick={checkQuiz} disabled={!quizSelectedId}>
              Check
            </button>
          ) : (
            <button className="btn-primary auth-cta demo-next-btn" onClick={() => goTo(pos + 1)}>
              Continue <ChevronRight size={16} />
            </button>
          )}

          {footerLinks}
        </div>
      </div>
    );
  }

  // ── Smart flashcards ─────────────────────────────────────────────────────
  return (
    <div className="onboard-root">
      <div className="onboard-card demo-card-wrap">
        <div className="demo-progress-row">
          <div className="demo-progress-text">Demo: {stepLabel}</div>
          <div className="demo-progress-bar">
            <div className="demo-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        <div className="demo-toggle-row">
          <SpeakerStyleToggle value={voice} onChange={onChangeVoice} className="demo-style-toggle" />
          <CardDirectionToggle value={direction} onChange={setDirection} className="demo-direction-toggle" />
        </div>

        {/* Same flip mechanic as the real lesson card so the demo feels
            continuous with the signed-in experience. */}
        <div className="srs-card-flip-wrap demo-flip-wrap">
          <div className={`srs-card-flip ${revealed ? 'srs-card-flip-revealed' : ''}`}>
            {/* FRONT */}
            <div
              className={`srs-card srs-card-face srs-card-face-front demo-card-face ${showCharacters ? 'srs-card-with-coach' : ''}`}
              onClick={handleReveal}
              role="button"
              tabIndex={revealed ? -1 : 0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleReveal(); } }}
              aria-hidden={revealed}
              aria-label={isEnglishFirst
                ? `${card.en}. Tap to reveal the Thai`
                : `${card.ph || card.thai}. Tap to reveal the meaning`}
            >
              <div className="srs-card-meta">
                <span className="srs-card-cat" style={{ color: 'var(--jade)' }}>Demo</span>
                {/* English-first hides the front speaker so the audio cannot
                    give the Thai answer away before the reveal. Hidden after
                    reveal too, so the flipped-away face is never focusable. */}
                {!isEnglishFirst && !revealed && ttsAvailable() && card.thai && (
                  <button
                    className="speaker-btn speaker-btn-card"
                    onClick={(e) => { e.stopPropagation(); triggerSpeak(card.thai); }}
                    title="Hear pronunciation"
                    aria-label="Play pronunciation"
                  >
                    <Volume2 size={16} />
                  </button>
                )}
              </div>

              {showCharacters && (
                <div className="srs-card-coach">
                  <CharacterCoach
                    characterId={coachId}
                    state={coach.state}
                    message={coach.message}
                    isSpeaking={isSpeaking}
                    compact
                  />
                </div>
              )}

              <div className="srs-card-front-body">
                {isEnglishFirst ? (
                  <div className="srs-card-en-primary">{card.en}</div>
                ) : viewMode === 'read' ? (
                  <div className="srs-card-thai srs-card-thai-primary">{card.thai}</div>
                ) : viewMode === 'both' ? (
                  <>
                    <div className="srs-card-thai">{card.thai}</div>
                    <div className="srs-card-ph-front">{card.ph}</div>
                  </>
                ) : (
                  <>
                    <div className="srs-card-ph-primary">{card.ph}</div>
                    <div className="srs-card-thai srs-card-thai-secondary">{card.thai}</div>
                  </>
                )}
              </div>

              <div className="srs-card-prompt">
                <div className="srs-card-prompt-text">Tap to reveal</div>
                <div className="srs-card-prompt-hint">
                  {isEnglishFirst ? 'Try to say it in Thai first' : 'Try to recall the meaning first'}
                </div>
              </div>
            </div>

            {/* BACK */}
            <div className="srs-card srs-card-face srs-card-face-back demo-card-face" aria-hidden={!revealed}>
              <div className="srs-card-back-meta">
                <span className="srs-card-cat" style={{ color: 'var(--jade)' }}>
                  {isEnglishFirst ? 'In Thai' : 'Meaning'}
                </span>
                {/* Rendered only after reveal: the hidden flip face must never
                    hold a focusable button that could speak the answer early. */}
                {revealed && ttsAvailable() && card.thai && (
                  <button
                    className="speaker-btn speaker-btn-card"
                    onClick={(e) => { e.stopPropagation(); triggerSpeak(card.thai); }}
                    title="Hear pronunciation"
                    aria-label="Play pronunciation"
                  >
                    <Volume2 size={16} />
                  </button>
                )}
              </div>

              {showCharacters && (
                <div className="srs-card-coach srs-card-coach-back">
                  <CharacterCoach
                    characterId={coachId}
                    state={coach.state}
                    message={coach.message}
                    isSpeaking={isSpeaking}
                    compact
                  />
                </div>
              )}

              <div className="srs-card-back-body">
                {isEnglishFirst ? (
                  <>
                    <div className="srs-card-back-eyebrow">In Thai</div>
                    <div className="srs-card-ph-primary">{card.ph}</div>
                    <div className="srs-card-thai srs-card-thai-secondary">{card.thai}</div>
                    <div className="srs-card-en srs-card-en-confirm">{card.en}</div>
                  </>
                ) : (
                  <>
                    <div className="srs-card-back-eyebrow">Meaning</div>
                    {card.ph && <div className="srs-card-back-ph">{card.ph}</div>}
                    <div className="srs-card-en">{card.en}</div>
                  </>
                )}
                {card.note && <div className="srs-card-note">{card.note}</div>}
              </div>
            </div>
          </div>
        </div>

        {revealed ? (
          <div className="demo-rate-block">
            <div className="rate-row demo-rate-row">
              {DEMO_RATINGS.map(({ rating, label, color }) => (
                <RateBtn
                  key={rating}
                  rating={rating}
                  label={label}
                  subLabel={intervalLabel(undefined, rating)}
                  color={color}
                  onClick={() => handleRate(rating)}
                  disabled={rated}
                />
              ))}
            </div>
            <p className="demo-smart-note">Your answer helps the app decide when to show the card again.</p>
          </div>
        ) : (
          <button type="button" className="demo-reveal-hint" onClick={handleReveal}>
            Tap the card above to reveal the answer
          </button>
        )}

        {footerLinks}
      </div>
    </div>
  );
}
