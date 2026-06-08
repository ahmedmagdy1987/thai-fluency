// First-lesson pedagogy config.
//
// The course is authored from a MALE speaker perspective (male-form Thai:
// ผม / ครับ). The female view is produced at render time by lib/voice.js
// (DEFAULT_VOICE there is also 'male'); a user-facing female toggle is future
// work and is intentionally NOT built in this sprint.
//
// This module centralizes the "which perspective do we default to" decision so
// copy and the TTS voice-preference helper can reference one source of truth
// instead of hard-coding 'male' in several places.

// The speaker perspective new learners start from. Keep in sync with
// DEFAULT_VOICE in lib/voice.js.
export const DEFAULT_SPEAKER_PERSPECTIVE = 'male';

// Human-friendly label for the default perspective (used in primer/intro copy).
export const SPEAKER_PERSPECTIVE_LABEL = 'male speaker';

// True when the app should prefer a male Thai TTS voice. Driven by the default
// perspective today; if a female toggle is added later, pass the user's chosen
// perspective instead. TTS voice gender ultimately depends on the voices the
// device has installed — see lib/audio.js for the best-effort selection + safe
// fallback when no male Thai voice is exposed.
export function prefersMaleVoice(perspective = DEFAULT_SPEAKER_PERSPECTIVE) {
  return perspective !== 'female';
}
