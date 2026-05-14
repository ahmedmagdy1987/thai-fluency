import React, { useEffect, useRef, useState } from 'react';
import { resolveCharacter, getExpressionSrc, STATE_TO_EXPRESSION } from '../data/characters.js';

// The actual coach UI. Renders the resolved character at the right
// expression with a small speech bubble. Animations are CSS-driven —
// the .character-coach-state-* class is the source of truth for what's
// happening so styles can stage transitions cleanly.
//
// Props:
//   characterId   — id from data/characters.js (e.g. "elephant")
//   state         — coach state from useCharacterReaction
//   message       — bubble copy (null/empty hides the bubble)
//   isSpeaking    — overrides state visually with a "speaking" pulse
//   compact       — smaller variant (used in tight lesson rails)
//   className     — additional class hook for callers
//   onClick       — optional callback when the character is tapped
//
// Resilience:
//   - Unknown characterId falls back through resolveCharacter() to the
//     default character.
//   - Image load failure falls back to the character's idle expression
//     (still real art, just a known-good frame).
//   - Reduced-motion is handled in CSS; the component does not enforce
//     it in JS, so anything user-toggleable (system pref) Just Works.
export default function CharacterCoach({
  characterId,
  state = 'idle',
  message = null,
  isSpeaking = false,
  compact = false,
  className = '',
  onClick = null,
}) {
  const character = resolveCharacter(characterId);
  const effectiveState = isSpeaking ? 'speaking' : state;
  const expression = STATE_TO_EXPRESSION[effectiveState] || character.fallbackExpression || 'idle';

  // Track the latest message *and* a nonce so the speech bubble re-animates
  // even when consecutive messages happen to be identical.
  const [displayed, setDisplayed] = useState(message);
  const [nonce, setNonce] = useState(0);
  const lastMsgRef = useRef(message);

  useEffect(() => {
    if (message !== lastMsgRef.current) {
      lastMsgRef.current = message;
      setDisplayed(message);
      setNonce(n => n + 1);
    }
  }, [message]);

  // Pre-compute fallback src for the image's error handler.
  const fallbackSrc = character.expressions[character.fallbackExpression] || character.expressions.idle;
  const currentSrc = getExpressionSrc(character.id, effectiveState);

  const onImgError = (e) => {
    if (e.currentTarget.dataset.fallback === 'true') return;
    e.currentTarget.dataset.fallback = 'true';
    e.currentTarget.src = fallbackSrc;
  };

  const interactive = !!onClick;
  const Tag = interactive ? 'button' : 'div';

  return (
    <div
      className={[
        'character-coach',
        `character-coach-state-${effectiveState}`,
        compact ? 'character-coach-compact' : '',
        className || '',
      ].filter(Boolean).join(' ')}
      data-character={character.id}
      style={{ '--coach-accent': character.accentColor || '#5BAF7C' }}
    >
      {/* Character first, bubble second. In compact (row) mode the
          portrait sits on the LEFT and the bubble flows to its right
          with a left-pointing tail anchoring to the character. In the
          default (column-reverse) mode the bubble still floats above
          the portrait — DOM order is independent of visual stacking. */}
      <Tag
        type={interactive ? 'button' : undefined}
        className="character-coach-portrait"
        onClick={interactive ? onClick : undefined}
        aria-label={interactive ? `${character.displayName} — your Thai coach` : undefined}
      >
        <span className="character-coach-halo" aria-hidden="true" />
        <img
          src={currentSrc}
          alt={`${character.displayName} (${effectiveState})`}
          className="character-coach-img"
          onError={onImgError}
          draggable={false}
          loading="eager"
          decoding="async"
        />
        <span className="character-coach-ground" aria-hidden="true" />
      </Tag>

      {displayed && (
        <div key={nonce} className="character-coach-bubble" role="status" aria-live="polite">
          <span className="character-coach-bubble-text">{displayed}</span>
          <span className="character-coach-bubble-tail" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
