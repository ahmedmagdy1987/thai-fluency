// First-lesson pedagogy config.
//
// The course is AUTHORED from a MALE speaker perspective (male-form Thai:
// ผม / ครับ). The female speaking style is produced at render time by
// lib/voice.js (DEFAULT_VOICE there is also 'male'). A user-facing speaking
// style toggle exists in Settings, the demo, and the first lesson; it writes
// stats.voice ('male' | 'female') and male remains the default.
//
// This module centralizes the "which perspective do we default to" decision so
// copy and the TTS voice-preference helper can reference one source of truth
// instead of hard-coding 'male' in several places.

// The speaker perspective new learners start from. Keep in sync with
// DEFAULT_VOICE in lib/voice.js.
export const DEFAULT_SPEAKER_PERSPECTIVE = 'male';

// Human-friendly label for the default perspective (used in primer/intro copy).
export const SPEAKER_PERSPECTIVE_LABEL = 'male speaker';

// True when the app should prefer a male Thai TTS voice. Pass the user's
// chosen speaking style (stats.voice) for a live answer. TTS voice gender
// ultimately depends on the voices the device has installed; see
// lib/audio.js setPreferredVoiceGender for the best-effort selection + safe
// fallback when no matching Thai voice is exposed.
export function prefersMaleVoice(perspective = DEFAULT_SPEAKER_PERSPECTIVE) {
  return perspective !== 'female';
}
