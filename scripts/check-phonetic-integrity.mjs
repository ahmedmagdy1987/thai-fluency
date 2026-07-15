// Regression guard for phonetic integrity (review finding A3).
//
// A card with an empty `ph` has no pronunciation and — because tone lives ONLY
// on the romanization's diacritic — no tone either. Two ways that hurts, and
// this script fails on both:
//   1. SILENT EXCLUSION FAILURE — such a card reaches a phonetic-REQUIRING
//      exercise. ListenMeaning is the sharp case: its prompt is audio ALONE, so
//      the post-answer reveal is the only pronunciation anchor the learner ever
//      gets. An empty `ph` there teaches audio→English with nothing to check the
//      heard tone against.
//   2. FABRICATION — an auto-derived romanization is presented as if a native
//      wrote it. In a tonal language a guessed diacritic is a guessed WORD, and
//      it looks authoritative while being wrong. Nothing may synthesize a `ph`.
//
// It also asserts every empty-`ph` card is triaged in
// docs/empty-phonetics-review-list.md — as SET MEMBERSHIP, never a count (a count
// assertion rots the first time the deck moves, and rots silently). A new
// empty-`ph` card therefore cannot be added without being listed for the native.
//
// ── THE TRAP THIS EXISTS TO KILL ─────────────────────────────────────────────
// `phNeedsGen: true` / `phReview: true` in the card files are TRAILING LINE
// COMMENTS, not properties. `cards.filter(c => c.phNeedsGen)` matches ZERO cards
// — it reads like a guard, passes review, and excludes nothing. That no-op is how
// 335 empty-`ph` cards reached a listening exercise. Asserted dead below.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { ALL_CARDS, CARDS } from '../src/data/cards.js';
import { hasPhonetic, EMPTY_PHONETIC_CARDS, EMPTY_PHONETIC_IDS, withPhonetic } from '../src/lib/phonetics.js';
import { toneFromPh } from '../src/lib/toneFromPh.js';
import { buildPlacementCards } from '../src/lib/state.js';
import { MINI_UNITS } from '../src/data/miniUnits.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');
let failures = 0;
const ok = (name) => console.log(`OK   ${name}`);
const fail = (name, detail = '') => { console.log(`FAIL ${name}  ${detail}`); failures++; };
const assert = (name, cond, detail = '') => (cond ? ok(name) : fail(name, detail));

// ---- 1. hasPhonetic is the real test ------------------------------------------
assert('hasPhonetic accepts a real romanization', hasPhonetic({ ph: 'khráp' }) === true);
assert('hasPhonetic rejects empty / whitespace-only / missing ph',
  hasPhonetic({ ph: '' }) === false && hasPhonetic({ ph: '   ' }) === false
  && hasPhonetic({}) === false && hasPhonetic(undefined) === false);
assert('EMPTY_PHONETIC_IDS matches the live ALL_CARDS scan',
  EMPTY_PHONETIC_IDS.size === EMPTY_PHONETIC_CARDS.length
  && ALL_CARDS.filter((c) => !hasPhonetic(c)).every((c) => EMPTY_PHONETIC_IDS.has(c.id)),
  `${EMPTY_PHONETIC_IDS.size} ids vs ${EMPTY_PHONETIC_CARDS.length} cards`);
assert('the worklist is computed over ALL_CARDS, so gated/quarantined cards cannot hide',
  EMPTY_PHONETIC_CARDS.some((c) => c.mature) && EMPTY_PHONETIC_CARDS.some((c) => c.quarantined),
  'expected mature + quarantined cards to appear in the empty-ph worklist');

// ---- 2. phNeedsGen / phReview are comments, and must stay dead -----------------
assert('`phNeedsGen` matches ZERO cards at runtime (it is a line comment)',
  ALL_CARDS.filter((c) => c.phNeedsGen).length === 0);
assert('`phReview` matches ZERO cards at runtime (it is a line comment)',
  ALL_CARDS.filter((c) => c.phReview).length === 0);
// Only a property read in EXECUTABLE code is the no-op bug. These names must stay
// writable in prose — documenting the trap is how the next person avoids it, and
// phonetics.js quotes the zero-match proof verbatim — so strip comments first and
// assert against code only. (Crude stripper: adequate here, where we are looking
// for a specific property-access shape, not parsing the language.)
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\/\/.*$/gm, '');
for (const f of ['src/components/ListenMeaning.jsx', 'src/components/SpeakingExercise.jsx', 'src/lib/state.js', 'src/lib/phonetics.js']) {
  assert(`${f} never reads .phNeedsGen/.phReview as a property`,
    !/(?:\?\.|\.)\s*(?:phNeedsGen|phReview)\b/.test(stripComments(read(f))),
    'property read on a name that only exists inside a comment — matches zero cards');
}

// ---- 3. No empty-ph card reaches a phonetic-REQUIRING pool ---------------------
// ListenMeaning (audio-only prompt → the reveal is the ONLY pronunciation anchor).
const listen = read('src/components/ListenMeaning.jsx');
assert('ListenMeaning LISTEN_POOL requires hasPhonetic',
  /const LISTEN_POOL = CARDS\.filter\(\(c\) => c\.thai && c\.en && hasPhonetic\(c\)\)/.test(listen),
  'LISTEN_POOL must filter on hasPhonetic — an audio-prompted card with no ph has no anchor');
const listenPool = CARDS.filter((c) => c.thai && c.en && hasPhonetic(c));
assert('ListenMeaning pool (re-derived) contains NO empty-ph card',
  listenPool.every((c) => !EMPTY_PHONETIC_IDS.has(c.id)), 'empty-ph card reachable in listen pool');
assert('ListenMeaning pool is still large enough to build 4-option rounds',
  listenPool.length >= 4, `${listenPool.length} cards`);

// SpeakingExercise (the learner must SAY it — a romanization is the whole prompt).
const speak = read('src/components/SpeakingExercise.jsx');
assert('SpeakingExercise SAY_POOL requires ph',
  /const SAY_POOL = CARDS\.filter\(\(c\) => c\.thai && c\.ph && c\.en\)/.test(speak));

// Placement test (state.js) — executed, not regexed: run the real builder.
const placement = buildPlacementCards();
assert('buildPlacementCards returns ONLY cards with a phonetic',
  placement.length > 0 && placement.every(hasPhonetic),
  `${placement.filter((c) => !hasPhonetic(c)).length} of ${placement.length} lack ph`);

// Mini-units / first lesson are CURATED id lists, not filtered pools — they are
// safe today only because every id a curator picked happens to have a `ph`. That
// is exactly the kind of safety that breaks silently, so assert it.
const unitIds = new Set();
for (const u of MINI_UNITS) {
  for (const id of (u.vocabCardIds || [])) unitIds.add(id);
  if (u.sentenceCardId != null) unitIds.add(u.sentenceCardId);
  for (const id of (u.challengeCardIds || [])) unitIds.add(id);
}
const unitEmpty = [...unitIds].filter((id) => EMPTY_PHONETIC_IDS.has(id));
assert('no mini-unit references an empty-ph card',
  unitEmpty.length === 0, `mini-units reference empty-ph cards: ${unitEmpty.join(',')}`);

// The Stage Challenge is thai<->en and never uses `ph` as prompt or answer, so an
// empty-ph card is honest there (documented, deliberate — do not "fix" by filtering).
const chal = read('src/lib/challengeQuestions.js');
assert('Stage Challenge prompt/answer stay thai<->en (ph is never the prompt or answer)',
  /return type === 'thai-to-en' \? c\.en : c\.thai/.test(chal)
  && /return type === 'thai-to-en' \? c\.thai : c\.en/.test(chal));

// ---- 4. Nothing fabricates a phonetic -----------------------------------------
// toneFromPh READS a tone out of an existing ph; it must never invent one from
// absence. Absence in → absence out.
assert('toneFromPh returns null for an absent ph (never invents a tone)',
  toneFromPh('') === null && toneFromPh(undefined) === null && toneFromPh(null) === null
  && toneFromPh('   ') === null);
assert('toneFromPh still reads a real ph correctly (it is a reader, not a writer)',
  toneFromPh('mâak') === 'falling' && toneFromPh('maa') === 'mid');
const NO_GEN_RE = /(?:generate|synthesi[sz]e|derive|guess|romani[sz]e|transliterate)Ph\b|\bphFrom(?:Thai|Script)\b/i;
for (const f of ['src/components/ListenMeaning.jsx', 'src/lib/phonetics.js', 'src/lib/voice.js']) {
  assert(`${f} contains no phonetic generator`, !NO_GEN_RE.test(read(f)),
    'a synthesized romanization fabricates a tone — only a native may author ph');
}
// No card ships a machine placeholder dressed up as a real romanization.
const FAKE_PH_RE = /^(?:\?+|-+|_+|x{2,}|tbd|todo|n\/?a|auto(?:gen)?|gen|pending|unknown)$/i;
const fakePh = ALL_CARDS.filter((c) => hasPhonetic(c) && FAKE_PH_RE.test(c.ph.trim()));
assert('no card presents a placeholder token as a real phonetic',
  fakePh.length === 0, fakePh.map((c) => `${c.id}:'${c.ph}'`).join(','));
// Absence is rendered honestly, with the shared copy — never silently dropped.
assert('ListenMeaning renders the honest placeholder when a ph is absent',
  /className="ph-pending">phonetic unavailable</.test(listen),
  'reuse the existing ph-pending / "phonetic unavailable" surface (app.css:1738)');

// ---- 5. Every empty-ph card is triaged in the review list ----------------------
const doc = read('docs/empty-phonetics-review-list.md');
const docIds = new Set(
  [...doc.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((m) => Number(m[1]))
);
const missing = [...EMPTY_PHONETIC_IDS].filter((id) => !docIds.has(id));
assert('EVERY empty-ph card is listed in docs/empty-phonetics-review-list.md',
  missing.length === 0,
  `${missing.length} untriaged empty-ph card(s): ${missing.slice(0, 12).join(',')}${missing.length > 12 ? '…' : ''} — add them to the list so a native can author them`);
const stale = [...docIds].filter((id) => !EMPTY_PHONETIC_IDS.has(id));
assert('the review list has no stale rows (every listed card really lacks a ph)',
  stale.length === 0,
  `${stale.length} listed card(s) now have a ph — remove them: ${stale.slice(0, 12).join(',')}`);

// The C3 overlap carries a hard ordering rule: correct the Thai BEFORE authoring
// a ph, or the romanization encodes the corruption and then corroborates it.
const C3_IDS = [4756, 4959, 5002, 5074, 5084, 5151, 5216];
assert('all 7 C3 suspected-corrupt cards are still empty-ph (none got a ph before a Thai fix)',
  C3_IDS.every((id) => EMPTY_PHONETIC_IDS.has(id)),
  `${C3_IDS.filter((id) => !EMPTY_PHONETIC_IDS.has(id)).join(',')} gained a ph — was the Thai corrected first?`);
assert('the review list warns that C3 Thai must be fixed before authoring a phonetic',
  /C3/.test(doc) && C3_IDS.every((id) => doc.includes(String(id))));

// withPhonetic is the helper the pools use; prove it does what it says.
assert('withPhonetic() drops exactly the empty-ph cards',
  withPhonetic(ALL_CARDS).length === ALL_CARDS.length - EMPTY_PHONETIC_CARDS.length
  && withPhonetic(ALL_CARDS).every(hasPhonetic));

console.log('');
if (failures > 0) {
  console.log(`Phonetic integrity check FAILED (${failures} failure(s)).`);
  process.exit(1);
}
console.log(`Phonetic integrity check passed (${EMPTY_PHONETIC_CARDS.length} empty-ph cards, all triaged, 0 reachable in a phonetic-requiring pool).`);
