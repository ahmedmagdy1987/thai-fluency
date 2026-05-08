// Text-to-speech for Thai using browser SpeechSynthesis API
let _cachedThaiVoice = undefined;

function _resolveThaiVoice() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  return voices.find(v => v.lang === 'th-TH')
      || voices.find(v => v.lang && v.lang.startsWith('th'))
      || voices.find(v => /thai/i.test(v.name))
      || null;
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => { _cachedThaiVoice = _resolveThaiVoice(); };
}

export function speakThai(text, rate = 0.9) {
  if (typeof window === 'undefined' || !window.speechSynthesis || !text) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'th-TH';
    u.rate = rate;
    u.pitch = 1;
    if (_cachedThaiVoice === undefined) _cachedThaiVoice = _resolveThaiVoice();
    if (_cachedThaiVoice) u.voice = _cachedThaiVoice;
    window.speechSynthesis.speak(u);
  } catch (e) { /* TTS unavailable */ }
}

export function ttsAvailable() {
  return typeof window !== 'undefined' && !!window.speechSynthesis;
}
