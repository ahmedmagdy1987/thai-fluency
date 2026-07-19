// toneFromPh — pure, zero-dependency phonetic-diacritic -> tone parser.
//
// The main deck (src/data/cards.js, see ALL_CARDS) stores tone ONLY as the
// diacritic on the romanized `ph` field (per CLAUDE.md "Data conventions"):
//
//     a-grave = low   a-acute = high   a-circumflex = falling
//     a-caron = rising   (unmarked) = mid
//
// Only the 24 TONE_QUIZ_ITEMS carry a first-class `tone` string. This parser
// lets any clean single-syllable card derive that same tone value from its `ph`
// WITHOUT authoring any new content and WITHOUT leaking the answer (the drill's
// audio always comes from `card.thai`, a separate source -- foundation section 5).
//
// CANONICAL RETURN VALUES -- these MUST stay byte-identical to the literals the
// existing code and validators already compare against:
//   - src/data/gamification.js TONE_QUIZ_ITEMS `tone` field
//   - src/components/TonesQuizSection.jsx grading  (`tone === q.tone`)
//   - scripts/check-quiz-shuffle.mjs regex         (/tone === q\.tone/)
// i.e. the bare strings 'mid' | 'low' | 'falling' | 'high' | 'rising'.
// Do NOT return the foundation's `tone-*` display ids here -- those are a 1:1
// analytics alias layered on top, never the stored/graded value.
//
// CONSERVATIVE BY DESIGN: returns null for anything that is not a clean
// single-syllable romanization (multi-word phrases, multi-syllable words, or a
// string carrying more than one tone mark), so only unambiguous cards ever get
// a tone attached. A false null (skipping a card) is always preferred over a
// false tone (mis-teaching one).
//
// -- Self-check (input -> output) --------------------------------------------
//   toneFromPh('phom-caron')   -> 'rising'    (single caron mark)
//   toneFromPh('khrap-acute')  -> 'high'      (acute)
//   toneFromPh('maak-circ')    -> 'falling'   (circumflex; long vowel = 1 syll)
//   toneFromPh('mai-grave')    -> 'low'       (grave)
//   toneFromPh('maa')          -> 'mid'       (no mark, 1 syllable)
//   toneFromPh('glai')         -> 'mid'       (diphthong 'ai' is one nucleus)
//   toneFromPh('aroi-grave')   -> null        (a-roi is TWO syllables => ambiguous)
//   toneFromPh('sawatdee...')  -> null        (three syllables / two marks)
//   toneFromPh('phet mai...')  -> null        (whitespace = multi-word phrase)
//   toneFromPh('')             -> null
//   toneFromPh(undefined)      -> null
// Verified against all 24 TONE_QUIZ_ITEMS: 23 map to their stored `tone`; only
// the genuinely disyllabic 'aroi' returns null (correct -- it is not a clean
// single syllable). TonesQuizSection keeps reading each item's own `tone`
// field, so this stricter parse never conflicts with the shipped quiz.

// Combining tone marks (Unicode NFD form) -> canonical stored tone value.
// Written as \u escapes so the source is unambiguous and safe to edit (a raw
// combining mark visually attaches to the preceding quote). Matching on the
// COMBINING mark (not the precomposed glyph) makes the parse independent of
// which vowel the mark sits on and of NFC/NFD normalization.
const MARK_TO_TONE = {
  '̀': 'low',      // combining grave      -> low
  '́': 'high',     // combining acute      -> high
  '̂': 'falling',  // combining circumflex -> falling
  '̌': 'rising',   // combining caron      -> rising
};

// Strip ALL combining diacritics (U+0300..U+036F) to recover base letters.
const COMBINING_MARKS_RE = /[̀-ͯ]/g;
const VOWEL_NUCLEUS_RE = /[aeiou]+/g;

/**
 * Map a romanized `ph` syllable to its canonical tone value.
 * @param {string} ph phonetic string from a card (e.g. 'khrap' with an acute)
 * @returns {'mid'|'low'|'falling'|'high'|'rising'|null} null when ambiguous.
 */
export function toneFromPh(ph) {
  if (typeof ph !== 'string') return null;
  const raw = ph.trim();
  if (!raw) return null;
  // Whitespace => multi-word phrase => never a single syllable.
  if (/\s/.test(raw)) return null;

  const nfd = raw.normalize('NFD');

  // Collect every tone mark present (a clean single syllable has 0 or 1).
  const marks = [];
  for (const ch of nfd) {
    const tone = MARK_TO_TONE[ch];
    if (tone) marks.push(tone);
  }
  if (marks.length > 1) return null; // >1 mark => multi-syllable => ambiguous.

  // Estimate syllable count by counting vowel nuclei on the de-accented base.
  // Each Thai syllable has exactly one vowel nucleus (a vowel or vowel cluster
  // such as 'aa' / 'ai' / 'uea'); a consonant between vowels breaks the run.
  const base = nfd.replace(COMBINING_MARKS_RE, '').toLowerCase();
  const nuclei = base.match(VOWEL_NUCLEUS_RE) || [];
  if (nuclei.length !== 1) return null; // not a clean single syllable.

  return marks.length === 1 ? marks[0] : 'mid';
}

export default toneFromPh;
