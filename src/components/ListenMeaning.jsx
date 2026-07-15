import React, { useMemo, useState } from 'react';
import { Check, ChevronRight, Ear, RotateCcw, Volume2, X } from 'lucide-react';
import { CARDS } from '../data/cards.js';
import { hasPhonetic } from '../lib/phonetics.js';
import { displayCard } from '../lib/voice.js';
import { speakThai, ttsAvailable } from '../lib/audio.js';
import { playCharacterCorrect, playCharacterWrong } from '../lib/sounds.js';
import { resolveCoachIdForStage } from '../data/stageCharacters.js';
import { useCharacterReaction } from '../hooks/useCharacterReaction.js';
import CharacterCoach from './CharacterCoach.jsx';
import { useSessionCombo } from '../hooks/useSessionCombo.js';
import ComboBadge from './ComboBadge.jsx';

// `listen-meaning` (foundation section 5 / exercise-types.md section 5):
// Hear Thai audio -> pick the English meaning. Comprehension from SOUND alone,
// no script crutch — the core "living in Thailand" skill.
//
// PROMPT IS AUDIO ONLY: before the learner answers there is NO printed Thai and
// NO romanization — just a play button that speaks `card.thai` (voice-flipped).
// The written forms reveal only after answering. Options are English meanings.
//
// Reuses the existing MCQ conventions verbatim: grade by option.id (never
// index); shuffle BOTH question order and option order per attempt via
// Fisher-Yates (never a deterministic index rotation). NEVER spends a heart —
// this is the free learning/review path, not the Stage Challenge. No new
// content — any card with `thai` + `en` + a real `ph` qualifies (the `ph`
// requirement is review finding A3; see LISTEN_POOL below for why it is not
// optional in an audio-prompted exercise).
//
// TTS GATE (documented decision): the whole exercise is audio-first, so when
// `ttsAvailable()` is false it renders NOTHING (returns null, mirroring
// SocialLinks.jsx) rather than degrading into a silent read exercise. The
// residual "TTS present but no Thai voice installed" edge (spec section 13, open
// question 1) is left as a known limitation — the play button is simply silent
// there — to keep the scoring/combo contract clean and uniform.

const ROUND_SIZE = 10;
const OPTION_COUNT = 4; // 1 correct + 3 distractors

// Fisher-Yates. A fresh shuffled COPY every call — never a deterministic
// index rotation, so a retake never serves the same order (check-quiz-shuffle).
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const normEn = (s) => (s || '').trim().toLowerCase();

// Cards that can back a listen-meaning question: real Thai audio + an English
// meaning to choose + a romanization to reveal. Computed once (module-level pool
// never changes).
//
// `hasPhonetic` is NOT optional here (review finding A3). This exercise is the
// one place where the prompt is audio ALONE — no Thai, no romanization, until
// the learner answers. The reveal is the entire pedagogical payoff: it is where
// the sound the learner just parsed gets pinned to a spelling and a TONE. A card
// with an empty `ph` reveals Thai script and nothing else, so the learner hears
// a tone, guesses a meaning, and is handed no way to check what they heard —
// audio→English with no pronunciation anchor at all. That is worse than not
// asking. 335 cards on the live deck are in exactly that state; they are excluded
// here until a native authors their `ph` (docs/empty-phonetics-review-list.md).
//
// Filter on the real field via hasPhonetic — NEVER on `phNeedsGen`/`phReview`,
// which are trailing line comments in the data and match zero cards at runtime
// (see src/lib/phonetics.js).
const LISTEN_POOL = CARDS.filter((c) => c.thai && c.en && hasPhonetic(c));

// Build a fresh round. Question order is shuffled; each question's options are a
// shuffled mix of the correct card + 3 distractors with DISTINCT English
// meanings (so no two options read the same).
function buildRound(voice) {
  const pool = LISTEN_POOL;
  const picks = shuffle(pool).slice(0, ROUND_SIZE);
  return picks.map((correct) => {
    const usedEn = new Set([normEn(displayCard(correct, voice).en)]);
    const distractors = [];
    for (const c of shuffle(pool)) {
      if (distractors.length >= OPTION_COUNT - 1) break;
      if (c.id === correct.id) continue;
      const en = normEn(displayCard(c, voice).en);
      if (usedEn.has(en)) continue;
      usedEn.add(en);
      distractors.push(c);
    }
    const options = shuffle([correct, ...distractors]);
    return { id: `lm-${correct.id}`, correct, options };
  });
}

export default function ListenMeaning({ voice = 'male', audioRate = 0.9, showCharacters = true, onComplete, onMastery }) {
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const current = questions[idx] || null;
  const coachId = useMemo(
    () => resolveCoachIdForStage(current?.correct?.stage || 1),
    [current?.correct?.stage]
  );
  const coach = useCharacterReaction({ characterId: coachId, initialState: 'greeting', mode: 'quiz' });
  // Transient session combo (spec 04 §3): display-only; no hearts/XP/SRS/gems. Declared
  // BEFORE the early returns below so hook order stays constant (rules of hooks).
  const combo = useSessionCombo();

  // Audio-first: hide the whole exercise where speech output is unavailable.
  if (!ttsAvailable()) return null;
  // Defensive: too few cards to build a 4-option question (never true on the
  // real deck — 4,457 of the 4,780 free cards carry a phonetic — but keeps the
  // component honest if the pool shrinks).
  if (LISTEN_POOL.length < OPTION_COUNT) return null;

  const playCurrent = () => {
    if (!current) return;
    const thai = displayCard(current.correct, voice).thai;
    if (thai) {
      try { speakThai(thai, audioRate); } catch (_) { /* silent-fail, button still resets */ }
    }
    coach.react('speaking', { duration: 1400 });
  };

  const startRound = () => {
    const built = buildRound(voice);
    setQuestions(built);
    setIdx(0); setSelectedId(null); setScore(0); setDone(false);
    combo.reset();
    coach.react('greeting', { duration: 1200, message: 'Listen closely.' });
    // Auto-play the first clip (inside this click gesture, so audio is unlocked).
    const first = built[0];
    if (first) {
      const thai = displayCard(first.correct, voice).thai;
      if (thai) { try { speakThai(thai, audioRate); } catch (_) { /* ignore */ } }
    }
  };

  const answer = (opt) => {
    if (selectedId || !current) return;
    setSelectedId(opt.id);
    const isCorrect = opt.id === current.correct.id;
    if (isCorrect) {
      setScore((s) => s + 1);
      // Correct listen-meaning = comprehension from sound → recognition depth.
      // Optional no-op if the parent doesn't pass onMastery; never gates/scores.
      onMastery?.(current.correct.id, 'recognized');
      coach.react('correct', { duration: 1600 });
      playCharacterCorrect(coachId);
    } else {
      coach.react('wrong', { duration: 1800 });
      playCharacterWrong(coachId);
    }
    combo.register(isCorrect); // transient session combo; no hearts/XP/SRS/gems side effects
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      setDone(true);
      coach.react(score === questions.length ? 'celebrating' : 'idle', { duration: 1600 });
      if (onComplete) onComplete(score, questions.length);
      return;
    }
    setIdx(idx + 1);
    setSelectedId(null);
    coach.react('greeting', { duration: 1000, message: 'Next one.' });
    const nextQ = questions[idx + 1];
    if (nextQ) {
      const thai = displayCard(nextQ.correct, voice).thai;
      if (thai) { try { speakThai(thai, audioRate); } catch (_) { /* ignore */ } }
    }
  };

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (questions.length === 0) {
    return (
      <div className="listen-meaning">
        <div className="guide-eyebrow">Listening</div>
        <h2 className="guide-h2">Listen &amp; Match</h2>
        <p className="guide-p">{ROUND_SIZE} questions. Tap play, listen to the Thai, and choose its English meaning — the Thai script and romanization stay hidden until you answer, so you train your ears. No hearts, just practice.</p>
        <button className="btn-primary listen-meaning-start" onClick={startRound} style={{ marginTop: 24 }}>
          <Ear size={15} /> Start listening
        </button>
      </div>
    );
  }

  // ── Results ──────────────────────────────────────────────────────────────────
  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    const strong = pct >= 80;
    return (
      <div className="listen-meaning listen-meaning-results">
        <div className="quiz-results-icon">{strong ? '👂' : '📖'}</div>
        <div className="quiz-results-score">{score} / {questions.length}</div>
        <div className="quiz-results-pct">{pct}%</div>
        <div className="quiz-results-msg">{strong ? 'Sharp ears!' : 'Keep listening — it gets easier.'}</div>
        <div className="quiz-results-actions">
          <button className="btn-primary" onClick={startRound}><RotateCcw size={14} /> Try again</button>
        </div>
      </div>
    );
  }

  // ── Question ─────────────────────────────────────────────────────────────────
  const revealed = displayCard(current.correct, voice);
  const answered = !!selectedId;

  return (
    <div className="listen-meaning">
      <div className="quiz-header">
        <div className="quiz-progress-text">Question {idx + 1} of {questions.length}</div>
        <div className="quiz-header-meta">
          <ComboBadge combo={combo} onMilestone={(t) => coach.react('celebrating', { duration: 1600 })} />
          <div className="quiz-score-text">Score: <span>{score}</span></div>
        </div>
      </div>
      <div className="quiz-progress-bar"><div className="quiz-progress-fill" style={{ width: `${(idx / questions.length) * 100}%` }} /></div>

      {showCharacters && (
        <div className="listen-meaning-coach">
          <CharacterCoach characterId={coachId} state={coach.state} message={coach.message} compact />
        </div>
      )}

      <div className="quiz-card listen-meaning-card">
        <div className="quiz-prompt-label">What does this mean?</div>
        {/* AUDIO-ONLY PROMPT: no Thai, no romanization shown before the answer. */}
        {!answered ? (
          <>
            <button type="button" className="listen-meaning-play" onClick={playCurrent} aria-label="Play the Thai audio">
              <Volume2 size={30} />
            </button>
            <div className="listen-meaning-hint"><Ear size={14} /> Tap to hear it again</div>
          </>
        ) : (
          // REVEAL after answering: the Thai + romanization the audio was hiding.
          // The romanization is NOT hidden behind `&&` — that silent drop is the
          // A3 defect itself. LISTEN_POOL already guarantees a `ph` here, so this
          // placeholder is unreachable belt-and-braces; if a future change ever
          // does let an empty-`ph` card in, it says so out loud instead of quietly
          // teaching a toneless card. Same class/copy as the other honest-absence
          // surfaces (CardsTab, DialoguesView, PlacementOnboarding) — no new CSS.
          <div className="listen-meaning-reveal">
            <div className="listen-meaning-reveal-thai">{revealed.thai}</div>
            <div className="listen-meaning-reveal-ph">
              {revealed.ph || <span className="ph-pending">phonetic unavailable</span>}
            </div>
            <button type="button" className="btn-secondary listen-meaning-hear" onClick={playCurrent}>
              <Volume2 size={15} /> Hear it again
            </button>
          </div>
        )}
      </div>

      <div className="listen-meaning-options" role="list">
        {current.options.map((opt, i) => {
          const optEn = displayCard(opt, voice).en;
          const isCorrect = opt.id === current.correct.id;
          const isSelected = opt.id === selectedId;
          const cls = [
            'listen-meaning-option',
            answered && isCorrect && 'listen-meaning-option-correct',
            answered && isSelected && !isCorrect && 'listen-meaning-option-wrong',
            answered && !isSelected && !isCorrect && 'listen-meaning-option-faded',
          ].filter(Boolean).join(' ');
          return (
            <button
              key={opt.id}
              type="button"
              className={cls}
              onClick={() => answer(opt)}
              disabled={answered}
              aria-pressed={isSelected}
            >
              <span className="quiz-option-letter">{String.fromCharCode(65 + i)}</span>
              <span className="listen-meaning-option-en">{optEn}</span>
              {answered && isCorrect && <Check size={16} className="quiz-option-check" />}
              {answered && isSelected && !isCorrect && <X size={16} className="quiz-option-check" />}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="quiz-feedback listen-meaning-feedback">
          <div className="quiz-feedback-detail">
            <span className="quiz-feedback-thai">{revealed.thai}</span>
            <span className="quiz-feedback-en"> = {revealed.en}</span>
          </div>
          <button className="btn-primary" onClick={next}>
            {idx + 1 >= questions.length ? 'See results' : 'Next'} <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
