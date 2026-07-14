import React, { useMemo, useState } from 'react';
import { Check, ChevronRight, RotateCcw, Volume2, X } from 'lucide-react';
import { speakThai, ttsAvailable } from '../lib/audio.js';
import { playCelebration, playCharacterCorrect, playCharacterWrong, playCharacterSelect } from '../lib/sounds.js';
import { isBuilderCorrect, shuffleTokens, assembledThai } from '../lib/sentenceBuilder.js';
import { useCharacterReaction } from '../hooks/useCharacterReaction.js';
import CharacterCoach from './CharacterCoach.jsx';

// Mini-unit Sentence Builder — TAP-TO-BUILD (mobile-first, keyboard usable,
// no mouse/drag required). The user taps Thai word tiles from the bank into the
// answer row, then Checks. Correct → success + Continue (fires onComplete once).
// Wrong → gentle feedback, keep trying. Sounds are gated by the Sound-effects
// setting (in sounds.js). Feedback never relies on color alone (icons + text).
export default function SentenceBuilder({
  data,
  audioRate = 0.95,
  showCharacters = true,
  characterId = 'elephant',
  onComplete,
  // Mastery overlay (optional; no-op if absent). Building the Thai sentence from
  // its tokens is production → 'produced' for the source card. Fired ONCE on a
  // correct build; never on a wrong attempt. Never gates, scores, or spends.
  onMastery,
}) {
  const tokens = useMemo(() => (data && Array.isArray(data.tokens) ? data.tokens : []), [data]);
  const answer = useMemo(() => (data && Array.isArray(data.answer) ? data.answer : []), [data]);
  const byId = useMemo(() => new Map(tokens.map(t => [t.id, t])), [tokens]);
  // Stable shuffled order for the bank, frozen once per mount.
  const shuffledIds = useMemo(() => shuffleTokens(tokens).map(t => t.id), [tokens]);

  const [arranged, setArranged] = useState([]); // ordered token ids placed by the user
  const [status, setStatus] = useState('building'); // 'building' | 'wrong' | 'correct'
  const coach = useCharacterReaction({ characterId, initialState: 'greeting', mode: 'quiz' });

  const bankIds = shuffledIds.filter(id => !arranged.includes(id));
  const isComplete = arranged.length === tokens.length && tokens.length > 0;
  const locked = status === 'correct';

  const tile = (id) => byId.get(id);

  const placeToken = (id) => {
    if (locked || arranged.includes(id)) return;
    setArranged(prev => [...prev, id]);
    if (status === 'wrong') setStatus('building');
    playCharacterSelect(characterId);
  };

  const removeToken = (id) => {
    if (locked) return;
    setArranged(prev => prev.filter(x => x !== id));
    if (status === 'wrong') setStatus('building');
  };

  const clearAll = () => {
    if (locked) return;
    setArranged([]);
    setStatus('building');
  };

  const check = () => {
    if (!isComplete || locked) return;
    if (isBuilderCorrect(arranged, answer)) {
      setStatus('correct');
      if (data?.sourceCardId != null) onMastery?.(data.sourceCardId, 'produced');
      playCharacterCorrect(characterId);
      playCelebration();
      coach.react('correct', { duration: 1800, message: 'That is the sentence!' });
      const thai = assembledThai(tokens, arranged);
      if (thai && ttsAvailable()) {
        try { speakThai(thai, audioRate); } catch (_) { /* ignore */ }
      }
    } else {
      setStatus('wrong');
      playCharacterWrong(characterId);
      coach.react('wrong', { duration: 1600, message: 'Close, try a different order.' });
    }
  };

  const speakWhole = () => {
    const thai = assembledThai(tokens, answer);
    if (thai && ttsAvailable()) {
      try { speakThai(thai, audioRate); } catch (_) { /* ignore */ }
    }
  };

  const tokenLabel = (t) => (t.isBlank ? `${t.thai}` : `${t.thai} ${t.ph || ''}`).trim();

  return (
    <section className="sentence-builder">
      <div className="miniunit-step-label">Build the sentence</div>

      {showCharacters && (
        <div className="miniunit-coach miniunit-coach-inline">
          <CharacterCoach characterId={characterId} state={coach.state} message={coach.message} compact />
        </div>
      )}

      <div className="sb-prompt-card">
        <div className="sb-prompt-label">{data?.prompt || 'Build this Thai sentence'}</div>
        {data?.english && <div className="sb-prompt-english">{data.english}</div>}
      </div>

      {/* Answer row — tap a placed tile to send it back. */}
      <div
        className={`sb-answer ${status === 'wrong' ? 'sb-answer-wrong' : ''} ${status === 'correct' ? 'sb-answer-correct' : ''}`}
        aria-label="Your sentence"
      >
        {arranged.length === 0 ? (
          <span className="sb-answer-placeholder">Tap the words below to build the sentence</span>
        ) : (
          arranged.map((id) => {
            const t = tile(id);
            if (!t) return null;
            return (
              <button
                key={id}
                type="button"
                className={`sb-tile sb-tile-placed ${t.isBlank ? 'sb-tile-blank' : ''}`}
                onClick={() => removeToken(id)}
                disabled={locked}
                aria-label={`Remove ${tokenLabel(t)}`}
              >
                <span className="sb-tile-thai">{t.thai}</span>
                {!t.isBlank && t.ph && <span className="sb-tile-ph">{t.ph}</span>}
              </button>
            );
          })
        )}
      </div>

      {/* Bank — tap a tile to place it. Plain group of buttons (no list role,
          so screen readers announce each tile as a button, not a list item). */}
      <div className="sb-bank" role="group" aria-label="Word tiles">
        {bankIds.length === 0 ? (
          <span className="sb-bank-empty">All tiles placed. Check your answer.</span>
        ) : (
          bankIds.map(id => {
            const t = tile(id);
            if (!t) return null;
            return (
              <button
                key={id}
                type="button"
                className={`sb-tile ${t.isBlank ? 'sb-tile-blank' : ''}`}
                onClick={() => placeToken(id)}
                disabled={locked}
                aria-label={`Add ${tokenLabel(t)}`}
              >
                <span className="sb-tile-thai">{t.thai}</span>
                {!t.isBlank && t.ph && <span className="sb-tile-ph">{t.ph}</span>}
              </button>
            );
          })
        )}
      </div>

      {/* Feedback — icon + text, never color alone. */}
      <div className="sb-feedback-row" aria-live="polite">
        {status === 'wrong' && (
          <div className="sb-feedback sb-feedback-wrong">
            <X size={16} /> <span>Not quite. Try a different order. Tap a tile to move it.</span>
          </div>
        )}
        {status === 'correct' && (
          <div className="sb-feedback sb-feedback-correct">
            <Check size={16} /> <span>Correct! {data?.thai}</span>
            {ttsAvailable() && (
              <button type="button" className="sb-speak-btn" onClick={speakWhole} aria-label="Hear the sentence">
                <Volume2 size={15} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="sb-actions">
        {status === 'correct' ? (
          <button type="button" className="btn-primary sb-continue-btn" onClick={onComplete}>
            Continue <ChevronRight size={16} />
          </button>
        ) : (
          <>
            <button type="button" className="btn-secondary sb-clear-btn" onClick={clearAll} disabled={arranged.length === 0}>
              <RotateCcw size={14} /> Clear
            </button>
            <button type="button" className="btn-primary sb-check-btn" onClick={check} disabled={!isComplete}>
              Check
            </button>
          </>
        )}
      </div>
    </section>
  );
}
