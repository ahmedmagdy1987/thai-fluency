import React, { useMemo, useRef, useState } from 'react';
import { Mic, Volume2, Check, X, RotateCcw, ChevronRight } from 'lucide-react';
import { CARDS } from '../data/cards.js';
import { displayCard } from '../lib/voice.js';
import { speakThai, ttsAvailable } from '../lib/audio.js';
import { speechRecognitionAvailable, getRecognizer } from '../lib/speech.js';

// `speaking-repeat` / `tone-produce` (foundation §1 [gated]; exercise-types.md
// §7/§8/§11). The learner reads a real Thai phrase aloud and taps the mic; the
// browser SpeechRecognition engine (lib/speech.js) returns a COARSE word verdict
// — 'correct' | 'close' | 'wrong' — matched against `card.thai` (NEVER `ph`).
//
// HONEST FRAMING (foundation §5, exercise-types.md §7 — verbatim intent): this is
// "did the app understand you?", a WORD check. It CANNOT and MUST NOT claim to
// score tone or pronunciation — browser recognition auto-corrects a mistoned
// attempt toward the nearest real Thai word, so tone information is already gone.
//
// FEATURE-GATED (foundation §1/§8, §11.1): renders ONLY when
// `speechRecognitionAvailable()` is true. When absent it returns null — NOTHING
// in the DOM, no button, no "unsupported" stub — mirroring SocialLinks.jsx. So on
// iOS Safari / Firefox / in-app webviews / native APK the whole surface vanishes
// and `mastery-spoken` is simply unreachable (never required for completion).
//
// HEARTS: never. This is the free learning path — it neither spends a heart nor
// blocks progression. On a 'correct' or 'close' verdict it calls
// onMastery?.(card.id, 'spoken') (the ONLY mastery signal it writes; wrong / not-
// heard write nothing — mastery.js MASTERY-SIGNAL CONTRACT).

const DEFAULT_ROUND = 12;

// Fisher-Yates — a fresh shuffled COPY, never a deterministic rotation.
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Default drill pool: any real card that has Thai + romanization + meaning, so a
// learner always has something speakable. Computed once (module-level).
const SAY_POOL = CARDS.filter((c) => c.thai && c.ph && c.en);

// A human message for the transient (non-permission) mic failures. None of these
// are dead ends — the learner keeps the phrase + the "Hear it" model and can retry.
function emptyMessage(code) {
  switch (code) {
    case 'audio-capture': return "We couldn't reach your microphone — check it's connected, then try again.";
    case 'network':       return 'Speech recognition needs a connection — try again in a moment.';
    case 'timeout':       return 'That took a little too long — tap the mic and try again.';
    case 'unsupported':   return 'Speech recognition is unavailable right now — try again later.';
    default:              return "We didn't catch any speech — tap the mic and say it again.";
  }
}

/**
 * SpeakingExercise — gated coarse speaking drill.
 *
 * Props (all optional except a source of phrases):
 *   card         {object}   A single card { id, thai, ph, en } to drill.
 *   cards        {object[]} A pool of cards to drill in sequence (takes priority
 *                           over `card`). Falls back to a shuffled default round
 *                           from the deck when neither is supplied.
 *   thai/ph/en/id           Loose alternative to `card` (a phrase without a card).
 *   onMastery    {func}     onMastery(cardId, 'spoken') — called ONLY on a
 *                           'correct' or 'close' verdict. No-op if absent.
 *   showCharacters {bool}   Show the small emoji reaction on a verdict (default true).
 *   voice        {'male'|'female'} M/F flip for the shown phrase (default 'male').
 *   audioRate    {number}   TTS rate for the "Hear it" model button (default 0.9).
 *   stats        {object}   Passed to getRecognizer(stats) so the paid-scorer seam
 *                           stays wired (free coarse recognizer for everyone today).
 *   className    {string}   Extra class on the root.
 */
export default function SpeakingExercise({
  card = null,
  cards = null,
  thai = null,
  ph = null,
  en = null,
  id = null,
  onMastery,
  showCharacters = true,
  voice = 'male',
  audioRate = 0.9,
  stats = undefined,
  className = '',
}) {
  // Hooks first (rules of hooks) — declared BEFORE the availability gate so hook
  // order is constant whether or not the component ends up rendering.
  const recognizer = useMemo(() => getRecognizer(stats), [stats]);
  const pool = useMemo(() => {
    if (Array.isArray(cards) && cards.length) return cards;
    const single = card || (thai ? { id: id != null ? id : `speak-${thai}`, thai, ph, en } : null);
    if (single) return [single];
    return shuffle(SAY_POOL).slice(0, DEFAULT_ROUND);
  }, [cards, card, thai, ph, en, id]);

  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState('idle'); // 'idle' | 'listening' | 'result' | 'empty'
  const [verdict, setVerdict] = useState(null); // 'correct' | 'close' | 'wrong'
  const [heard, setHeard] = useState('');
  const [errCode, setErrCode] = useState(null);
  const [micDenied, setMicDenied] = useState(false);
  const [showReason, setShowReason] = useState(false);
  const askedRef = useRef(false);

  // FEATURE GATE — render NOTHING where recognition is unavailable (mirror
  // SocialLinks.jsx: `if (...) return null;`). Placed after the hooks above.
  if (!speechRecognitionAvailable()) return null;
  if (pool.length === 0) return null;

  const active = pool[idx % pool.length];
  const shown = displayCard(active, voice);
  const target = shown.thai; // match against the Thai the learner is asked to say — NEVER ph
  const hasNext = pool.length > 1;
  const canHear = ttsAvailable();

  const playModel = () => {
    if (!target) return;
    try { speakThai(target, audioRate); } catch (_) { /* silent-fail; button still resets */ }
  };

  const startListen = async () => {
    if (!target || phase === 'listening') return;
    // In-context permission ask, ONCE, with a one-line reason. The browser prompts
    // for the mic on the first start(); the reason line explains why.
    if (!askedRef.current) { askedRef.current = true; setShowReason(true); }
    setPhase('listening');
    setVerdict(null);
    setHeard('');
    setErrCode(null);
    try {
      const res = await recognizer.listen({ lang: 'th-TH', target });
      setHeard(res.transcript || '');
      setVerdict(res.verdict);
      setPhase('result');
      // Mastery: 'correct' OR 'close' → 'spoken'. Wrong writes NOTHING.
      if (res.verdict === 'correct' || res.verdict === 'close') {
        onMastery?.(active.id, 'spoken');
      }
    } catch (e) {
      const code = (e && e.code) || 'error';
      if (code === 'not-allowed' || code === 'service-not-allowed') {
        // Permission denied — hide the mic path, show the calm fallback. Ask once.
        setMicDenied(true);
        setPhase('idle');
      } else {
        // Transient (no-speech / audio-capture / network / timeout / aborted) —
        // a retryable, non-dead-end state. No mastery write.
        setErrCode(code);
        setPhase('empty');
      }
    } finally {
      setShowReason(false);
    }
  };

  const retry = () => { setPhase('idle'); setVerdict(null); setHeard(''); setErrCode(null); };

  const nextPhrase = () => {
    setIdx((i) => i + 1);
    setPhase('idle');
    setVerdict(null);
    setHeard('');
    setErrCode(null);
  };

  // Shared phrase card — always visible so no branch is ever a dead end.
  const phraseCard = (
    <div className="speaking-card">
      <div className="speaking-thai">{shown.thai}</div>
      {shown.ph && <div className="speaking-ph">{shown.ph}</div>}
      {shown.en && <div className="speaking-en">{shown.en}</div>}
      {canHear && (
        <button type="button" className="btn-secondary speaking-hear" onClick={playModel}>
          <Volume2 size={15} /> Hear it
        </button>
      )}
    </div>
  );

  const verdictMeta = {
    correct: { cls: 'speaking-verdict-correct', emoji: '🎉', msg: 'The app understood you clearly.' },
    close:   { cls: 'speaking-verdict-close',   emoji: '👍', msg: 'Close — the app mostly caught it.' },
    wrong:   { cls: 'speaking-verdict-wrong',   emoji: '🤔', msg: 'The app heard something different.' },
  };

  return (
    <div className={`speaking-exercise ${className}`.trim()} data-testid="speaking-exercise">
      <div className="guide-eyebrow">Speaking</div>
      <h2 className="guide-h2">Say It</h2>
      <p className="guide-p">
        Read the Thai out loud and tap the mic. We&apos;ll tell you whether speech recognition
        caught your words — this is a word check, not a tone or pronunciation score. No hearts, just practice.
      </p>

      {hasNext && (
        <div className="speaking-progress">Phrase {(idx % pool.length) + 1} of {pool.length}</div>
      )}

      {phraseCard}

      {/* ── Permission denied: calm, non-dead-end fallback (no mic button) ── */}
      {micDenied ? (
        <div className="speaking-fallback" role="note">
          Speaking needs microphone access — you can keep learning without it.
          Allow the mic in your browser settings to try speaking, or just read along and tap “Hear it”.
        </div>
      ) : phase === 'listening' ? (
        <div className="speaking-listening">
          <button type="button" className="speaking-mic speaking-mic-listening" disabled aria-live="polite" aria-label="Listening">
            <Mic size={30} />
          </button>
          <div className="speaking-listening-hint">Listening… say it out loud</div>
          {showReason && (
            <div className="speaking-permission-notice" role="note">
              Speaking uses your microphone to hear your Thai — allow it when your browser asks.
            </div>
          )}
        </div>
      ) : phase === 'result' && verdict ? (
        <div className={`speaking-verdict ${verdictMeta[verdict].cls}`} role="status" aria-live="polite">
          <div className="speaking-verdict-head">
            {verdict === 'wrong'
              ? <X size={18} className="speaking-verdict-icon" />
              : <Check size={18} className="speaking-verdict-icon" />}
            <span>Did the app understand you?</span>
          </div>
          {showCharacters && <div className="speaking-verdict-emoji" aria-hidden="true">{verdictMeta[verdict].emoji}</div>}
          <div className="speaking-verdict-msg">{verdictMeta[verdict].msg}</div>
          <div className="speaking-heard">We heard: <span>{heard || '—'}</span></div>
          <div className="speaking-disclaimer">
            This only checks whether speech recognition caught your words. It does not score tone or pronunciation.
          </div>
          <div className="speaking-actions">
            <button type="button" className="btn-secondary" onClick={retry}>
              <RotateCcw size={14} /> Try again
            </button>
            {hasNext && (
              <button type="button" className="btn-primary" onClick={nextPhrase}>
                Next phrase <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      ) : phase === 'empty' ? (
        <div className="speaking-empty" role="status" aria-live="polite">
          <div className="speaking-empty-msg">{emptyMessage(errCode)}</div>
          <div className="speaking-actions">
            <button type="button" className="btn-primary speaking-mic-retry" onClick={startListen}>
              <Mic size={15} /> Try again
            </button>
            {hasNext && (
              <button type="button" className="btn-secondary" onClick={nextPhrase}>
                Skip <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="speaking-idle">
          <button type="button" className="speaking-mic" onClick={startListen} aria-label="Tap and speak">
            <Mic size={30} />
          </button>
          <div className="speaking-idle-hint">Tap and say it</div>
          {hasNext && (
            <button type="button" className="btn-secondary speaking-skip" onClick={nextPhrase}>
              Next phrase <ChevronRight size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
