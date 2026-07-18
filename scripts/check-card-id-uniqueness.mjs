// Card-id uniqueness guard (Wave 10).
//
// The deck is merged from FOUR files (cards.js inline + cards-imported.js +
// cards-imported-batch2.js + cards-step2.js additions) whose id ranges
// interleave, and CLAUDE.md's add-a-card recipe said "ids go up to ~960" while
// the real ceiling is 5739 — a collision trap with NO validator behind it
// (progress is keyed by card id, so a duplicate silently cross-wires two
// cards' SRS state and can double-serve one id). This guard springs that trap
// permanently. It also covers the Dating phrase bank (its own 90000+ id space,
// keyed device-locally by the dating ledgers).
//
// Zero duplicates exist at introduction; this exists so that stays true.

import { ALL_CARDS } from '../src/data/cards.js';
import { DATING_PHRASES } from '../src/data/datingPhrases.js';

let failures = 0;
const ok = (n) => console.log(`OK   ${n}`);
const fail = (n, d = '') => { console.log(`FAIL ${n}  ${d}`); failures++; };
const assert = (n, c, d) => (c ? ok(n) : fail(n, d));

function duplicates(list, label) {
  const seen = new Map();
  const dups = new Map();
  for (const item of list) {
    const id = item?.id;
    if (seen.has(id)) dups.set(id, (dups.get(id) || 1) + 1);
    else seen.set(id, true);
  }
  return [...dups.entries()].map(([id, n]) => `${label} id ${id} ×${n + 0}`);
}

// ── Main deck (ALL_CARDS: free + mature + quarantined — the full merged space) ──
assert('every main-deck card has a positive integer id',
  ALL_CARDS.every(c => Number.isInteger(c.id) && c.id > 0),
  `offenders: ${ALL_CARDS.filter(c => !Number.isInteger(c.id) || c.id <= 0).slice(0, 5).map(c => JSON.stringify(c.id)).join(', ')}`);

const cardDups = duplicates(ALL_CARDS, 'card');
assert(`NO duplicate ids across the merged ${ALL_CARDS.length}-card deck`,
  cardDups.length === 0, cardDups.slice(0, 10).join('; '));

// ── Dating phrase bank (separate 90000+ id space) ───────────────────────────
assert('every dating phrase has a positive integer id',
  DATING_PHRASES.every(p => Number.isInteger(p.id) && p.id > 0));

const phraseDups = duplicates(DATING_PHRASES, 'phrase');
assert(`NO duplicate ids across the ${DATING_PHRASES.length}-phrase dating bank`,
  phraseDups.length === 0, phraseDups.slice(0, 10).join('; '));

// The two id spaces must not overlap either: dating ledgers and card progress
// are separate stores today, but a shared id would make any future join
// ambiguous. Dating ids start at 90001 by convention — pin the separation.
const cardIdSet = new Set(ALL_CARDS.map(c => c.id));
const overlap = DATING_PHRASES.filter(p => cardIdSet.has(p.id)).map(p => p.id);
assert('dating phrase ids never collide with main-deck ids',
  overlap.length === 0, `shared ids: ${overlap.slice(0, 10).join(', ')}`);

console.log('');
if (failures > 0) {
  console.log(`Card-id uniqueness check FAILED (${failures} failure(s)).`);
  process.exit(1);
}
console.log(`Card-id uniqueness check passed (${ALL_CARDS.length} cards + ${DATING_PHRASES.length} dating phrases, all ids unique, spaces disjoint).`);
