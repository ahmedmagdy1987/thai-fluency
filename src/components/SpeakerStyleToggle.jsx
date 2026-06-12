import React from 'react';

// Compact segmented toggle for the Thai speaking style preference.
// 'male' = phǒm / khráp forms (default for new users).
// 'female' = chăn / khâ forms.
// The style changes the WORDS the learner sees and hears; the audio voice
// only tries to match when the device offers a matching Thai voice.
// Pure and controlled: persistence is the caller's job (updateSettings in the
// signed-in app, session-local state in the demo).
export default function SpeakerStyleToggle({ value, onChange, className = '' }) {
  if (!onChange) return null;
  const style = value === 'female' ? 'female' : 'male';
  return (
    <div className={`card-direction-toggle speaker-style-toggle ${className}`.trim()} role="group" aria-label="Thai speaking style">
      <button
        type="button"
        className={`card-direction-btn ${style === 'male' ? 'card-direction-btn-active' : ''}`}
        onClick={() => onChange('male')}
        aria-pressed={style === 'male'}
        title="Male speaking style: phǒm (ผม) and khráp (ครับ)"
      >
        Male speaker
      </button>
      <button
        type="button"
        className={`card-direction-btn ${style === 'female' ? 'card-direction-btn-active' : ''}`}
        onClick={() => onChange('female')}
        aria-pressed={style === 'female'}
        title="Female speaking style: chăn (ฉัน) and khâ (ค่ะ)"
      >
        Female speaker
      </button>
    </div>
  );
}
