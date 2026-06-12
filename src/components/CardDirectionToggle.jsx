import React from 'react';

// Compact segmented toggle for the flashcard direction preference.
// 'en-first' = English prompt, reveal the Thai (default for new users).
// 'th-first' = Thai prompt, reveal the meaning.
// Pure and controlled: persistence is the caller's job (updateSettings in the
// signed-in app, local state in the demo).
export default function CardDirectionToggle({ value, onChange, className = '' }) {
  if (!onChange) return null;
  const direction = value === 'th-first' ? 'th-first' : 'en-first';
  return (
    <div className={`card-direction-toggle ${className}`.trim()} role="group" aria-label="Flashcard direction">
      <button
        type="button"
        className={`card-direction-btn ${direction === 'en-first' ? 'card-direction-btn-active' : ''}`}
        onClick={() => onChange('en-first')}
        aria-pressed={direction === 'en-first'}
        title="Front shows English; you recall the Thai"
      >
        English first
      </button>
      <button
        type="button"
        className={`card-direction-btn ${direction === 'th-first' ? 'card-direction-btn-active' : ''}`}
        onClick={() => onChange('th-first')}
        aria-pressed={direction === 'th-first'}
        title="Front shows Thai; you recall the meaning"
      >
        Thai first
      </button>
    </div>
  );
}
