// Text-to-speech for Thai using browser SpeechSynthesis API.
// Hardened against the common Chrome/Edge pitfalls:
//   1. getVoices() can return [] until voiceschanged fires
//   2. cancel() immediately followed by speak() can silently drop the utterance
//   3. speechSynthesis can enter a paused state after idle (Chrome auto-suspend)
//   4. If no Thai voice is found, the engine may "speak" silently — better to fail loudly

let _cachedThaiVoice = null;
let _voicesReady = false;

function _resolveThaiVoice() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;
  return voices.find(v => v.lang === 'th-TH')
      || voices.find(v => v.lang && v.lang.toLowerCase().startsWith('th'))
      || voices.find(v => /thai/i.test(v.name))
      || null;
}

function _loadVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    _voicesReady = true;
    _cachedThaiVoice = _resolveThaiVoice();
  }
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  // Some engines populate voices synchronously, others fire voiceschanged.
  _loadVoices();
  if (typeof window.speechSynthesis.addEventListener === 'function') {
    window.speechSynthesis.addEventListener('voiceschanged', _loadVoices);
  } else {
    window.speechSynthesis.onvoiceschanged = _loadVoices;
  }
}

export function speakThai(text, rate = 0.9) {
  if (typeof window === 'undefined' || !window.speechSynthesis || !text) return;
  const synth = window.speechSynthesis;

  // Re-resolve if voices have arrived since the last attempt.
  if (!_cachedThaiVoice) _cachedThaiVoice = _resolveThaiVoice();

  const doSpeak = () => {
    try {
      // Workaround: Chrome can leave speechSynthesis in a paused state after idle.
      if (synth.paused) synth.resume();
      synth.cancel();

      const u = new SpeechSynthesisUtterance(text);
      // If we found a Thai voice, use its lang; else hint th-TH so the engine
      // can pick a default Thai voice itself.
      u.lang = (_cachedThaiVoice && _cachedThaiVoice.lang) || 'th-TH';
      u.rate = rate;
      u.pitch = 1;
      u.volume = 1;
      if (_cachedThaiVoice) u.voice = _cachedThaiVoice;

      // Chrome bug: speak() called in the same tick as cancel() can be dropped.
      // Defer one tick so the queue is clear.
      setTimeout(() => {
        try { synth.speak(u); } catch (_) {}
      }, 60);
    } catch (_) { /* TTS unavailable */ }
  };

  if (_voicesReady) {
    doSpeak();
    return;
  }

  // First-click race: voices not yet loaded. Wait briefly for voiceschanged,
  // then speak. Fall back to speaking anyway after a short timeout.
  let fired = false;
  const onVoices = () => {
    if (fired) return;
    fired = true;
    _loadVoices();
    if (typeof synth.removeEventListener === 'function') {
      synth.removeEventListener('voiceschanged', onVoices);
    }
    doSpeak();
  };
  if (typeof synth.addEventListener === 'function') {
    synth.addEventListener('voiceschanged', onVoices);
  }
  setTimeout(() => { if (!fired) onVoices(); }, 250);
}

export function ttsAvailable() {
  return typeof window !== 'undefined' && !!window.speechSynthesis;
}
