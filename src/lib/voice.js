// Transforms male-voice card content to the female speaking style on render.
// No data duplication needed — pronouns/particles flip at display time.
//
// The user-facing setting is called "Thai speaking style" (Settings, demo,
// first lesson). It is persisted as stats.voice ('male' | 'female') and only
// changes the WORDS the learner sees and hears. The TTS voice gender is a
// separate best-effort concern handled in lib/audio.js.

export const DEFAULT_VOICE = 'male';
export const SPEAKER_STYLES = ['male', 'female'];
export const DEFAULT_VIEW_MODE = 'speak';

// Flashcard direction preference. 'en-first' shows the English meaning on the
// front and reveals the Thai (phonetic first); 'th-first' is the classic
// Thai-front card. English-first is the default because a learner usually
// starts from the idea: "How do I say hello in Thai?"
export const DEFAULT_CARD_DIRECTION = 'en-first';
export const CARD_DIRECTIONS = ['en-first', 'th-first'];

// Cards that must never be auto-flipped to the female speaking style, because
// the gendered string is the lesson topic itself or a homograph, and a
// mechanical replace would corrupt the card. Reviewed during the speaker-style
// sprint; add ids here whenever a new card would be damaged by the flip.
const NO_FLIP_CARD_IDS = new Set([
  573,  // ผม = "hair" (homograph of the male "I"; flipping makes it wrong)
  3396, // สวัสดี: the note explains both ครับ and ค่ะ; flipping corrupts it
  4380, // กระผม (very formal male "I"); flipping corrupts the word
  5269, // โชคดีนะ(ค่ะ/ครับ) already shows both polite forms side by side
  5276, // นี่ครับ/ค่ะ dual-form card
  5291, // สวัสดีค่ะ / สวัสดีครับ dual-form card
  5453, // นี่(ครับ/ค่ะ) dual-form card
  5559, // ครับ(พ่อ) / ค่ะ(พ่อ) dual-form card
]);

// A card whose Thai already shows BOTH polite forms side by side must never
// flip: replacing ครับ would double the female form into nonsense. This
// generic guard backstops the id list for future dual-form cards.
function showsBothPoliteForms(thai) {
  return !!thai && /ครับ/.test(thai) && /ค่ะ|คะ/.test(thai);
}

// True when a card is protected from the speaking-style flip. Exposed so the
// verify scripts can report protected cards separately instead of as failures.
export function isSpeakerStyleProtected(card) {
  if (!card) return false;
  return NO_FLIP_CARD_IDS.has(card.id) || showsBothPoliteForms(card.thai);
}

// Question-ness decides the female particle: ค่ะ (khâ) for statements,
// คะ (khá) for questions. Shared by the card, prose, and builder transforms.
function isThaiQuestion(text) {
  return /\?\s*$/.test(text) || /(ไหม|มั้ย|หรือ|รึ)\s*ครับ/.test(text);
}

function isPhQuestion(text) {
  return /\?\s*$/.test(text) || /(mǎi|mái|rǔe|rài)\s+(khráp|kráp|krúp)/i.test(text);
}

function flipThaiText(text, isQuestion) {
  // Pronoun: ผม -> ฉัน, but never inside กระผม (formal male "I"); a partial
  // replace there would produce a non-word.
  let out = text.replace(/กระผม|ผม/g, m => (m === 'ผม' ? 'ฉัน' : m));
  out = out.replace(/ครับ/g, isQuestion ? 'คะ' : 'ค่ะ');
  return out;
}

function flipPhText(text, isQuestion) {
  // Female "I" is chăn, matching the card dataset (card 1712) and the
  // first-lesson primer. Flagged for a native consistency pass in
  // docs/native-review-master-checklist.md.
  let out = text.replace(/\bphǒm\b/g, 'chăn');
  // cards-imported-batch2.js uses a different romanization scheme (pŏm, poem,
  // krúp, kráp, kâ/ká); cover it so the phonetic flips together with the Thai.
  out = out.replace(/\bpŏm\b/g, 'chăn');
  out = out.replace(/\bpoem\b/g, 'chăn');
  out = out.replace(/\bkhráp\b/g, isQuestion ? 'khá' : 'khâ');
  out = out.replace(/\bkráp\b/g, isQuestion ? 'ká' : 'kâ');
  out = out.replace(/\bkrúp\b/g, isQuestion ? 'ká' : 'kâ');
  return out;
}

export function transformThai(thai, voice) {
  if (!thai || voice !== 'female') return thai;
  return flipThaiText(thai, isThaiQuestion(thai));
}

export function transformPh(ph, voice) {
  if (!ph || voice !== 'female') return ph;
  return flipPhText(ph, isPhQuestion(ph));
}

export function transformEn(en, voice) {
  if (!en || voice !== 'female') return en;
  // Match "(male" that is immediately followed by ")", "," or whitespace so
  // both "(male)" and "(male, casual)" / "(male, response …)" flip, while
  // "(male/female)" stays untouched (the trailing "/" prevents the match).
  return en.replace(/\(male(?=[\),\s])/g, '(female');
}

// Flip gendered Thai and romanization inside mixed prose (recap lines, intro
// bullets, achievement text, card notes). Prose that discusses male or female
// speakers, or that already shows a female form (ค่ะ / คะ / ฉัน), is returned
// verbatim: it teaches the contrast between the two styles, and a mechanical
// flip would falsify it (for example "khráp (ครับ) or khâ (ค่ะ)" must never
// become "khâ or khâ"). Parenthetical annotations like "(male)" or
// "(male form)" flip cleanly, so they are stripped before the guard check.
export function transformText(text, voice) {
  if (!text || voice !== 'female') return text;
  const withoutAnnotations = text.replace(/\((fe)?male/gi, '');
  if (/male|woman|women|\bman\b|\bmen\b/i.test(withoutAnnotations)) return text;
  if (/ค่ะ|คะ|ฉัน/.test(text)) return text;
  let out = transformThai(text, voice);
  out = transformPh(out, voice);
  out = transformEn(out, voice);
  return out;
}

// Apply all transforms to a card object. Question-ness is decided once from
// BOTH fields (Thai punctuation is usually absent while the ph carries the
// "?"), so the Thai particle and the phonetic always agree (คะ with khá,
// ค่ะ with khâ); they previously could disagree on wh-questions. Notes are
// prose, so they go through the guarded transformText: a note that explains
// the male/female contrast stays verbatim instead of being corrupted.
export function displayCard(card, voice) {
  if (!card || voice !== 'female') return card;
  if (isSpeakerStyleProtected(card)) return card;
  const isQuestion = isThaiQuestion(card.thai || '') || isPhQuestion(card.ph || '');
  return {
    ...card,
    thai: card.thai ? flipThaiText(card.thai, isQuestion) : card.thai,
    ph: card.ph ? flipPhText(card.ph, isQuestion) : card.ph,
    en: transformEn(card.en, voice),
    note: card.note ? transformText(card.note, voice) : card.note,
  };
}

export function displayLine(line, voice) {
  if (!line || voice !== 'female') return line;
  const isQuestion = isThaiQuestion(line.thai || '') || isPhQuestion(line.ph || '');
  return {
    ...line,
    thai: line.thai ? flipThaiText(line.thai, isQuestion) : line.thai,
    ph: line.ph ? flipPhText(line.ph, isQuestion) : line.ph,
  };
}

// Apply the speaking style to a sentence-builder data block. Correctness
// checks are token-ID based (lib/sentenceBuilder.js), so flipping the display
// strings keeps the tiles, the assembled sentence, the success line, and the
// spoken audio consistent without touching the answer. Question-ness is a
// sentence-level property; it is decided once from the full sentence and
// applied to every tile (the lone ครับ tile cannot know it sits in a question).
export function displayBuilder(data, voice) {
  if (!data || voice !== 'female') return data;
  if (!Array.isArray(data.tokens) || data.tokens.length === 0) return data;
  // The english often ends with an annotation ("Where is the bathroom? (male)"),
  // so look for the "?" anywhere, not only at the end. Wh-questions carry no
  // Thai question particle, so this is what catches them.
  const isQuestion = isThaiQuestion(data.thai || '')
    || /\?/.test(data.english || '')
    || /\?/.test(data.thai || '');
  return {
    ...data,
    thai: data.thai ? flipThaiText(data.thai, isQuestion) : data.thai,
    english: transformEn(data.english, voice),
    tokens: data.tokens.map(t => ({
      ...t,
      thai: t.thai ? flipThaiText(t.thai, isQuestion) : t.thai,
      ph: t.ph ? flipPhText(t.ph, isQuestion) : t.ph,
      en: transformEn(t.en, voice),
    })),
  };
}
