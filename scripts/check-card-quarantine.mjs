// Validation for the corrupted-Thai quarantine on the main deck (claude-review.md C3).
//
// Seven cards carry suspected Thai orthographic corruption — stray/doubled combining
// marks, truncation, a field contradicted by its own note. Nobody but a native may
// correct them, so until then they must not be TAUGHT: quarantine excludes them from
// `CARDS` (what every consumer imports) while keeping them in ALL_CARDS so the
// reviewer can still find them.
//
// Proves, on every run:
//   • NO member of QUARANTINED_CARD_IDS is reachable in CARDS;
//   • every id in QUARANTINED_CARD_IDS exists and carries quarantined:true;
//   • all 7 C3 ids are quarantined (nobody quietly shrank the list);
//   • QUARANTINED_CARDS is exactly the flagged set, subset of ALL_CARDS, non-empty;
//   • quarantine and mature never overlap (a card is filtered for ONE stated reason).

import { ALL_CARDS, CARDS, MATURE_CARDS, QUARANTINED_CARDS } from '../src/data/cards.js';
import { QUARANTINED_CARD_IDS, MATURE_CARD_IDS } from '../src/data/contentFlags.js';

let failures = 0;
const ok = (name) => console.log(`OK   ${name}`);
const fail = (name, detail) => { console.log(`FAIL ${name}  ${detail}`); failures++; };
const assert = (name, cond, detail = '') => (cond ? ok(name) : fail(name, detail));

// ---- 1. The quarantine itself -------------------------------------------------
const leaked = CARDS.filter((c) => QUARANTINED_CARD_IDS.has(c.id));
assert('NO quarantined card is reachable in the free deck (CARDS)',
  leaked.length === 0, `${leaked.length} leaked: ${leaked.map((c) => c.id).join(',')}`);
assert('no card in CARDS carries quarantined:true',
  CARDS.every((c) => !c.quarantined), CARDS.filter((c) => c.quarantined).map((c) => c.id).join(','));

// ---- 2. Every flagged id exists and is stamped --------------------------------
const byId = new Map(ALL_CARDS.map((c) => [c.id, c]));
const missing = [...QUARANTINED_CARD_IDS].filter((id) => !byId.has(id));
assert('every QUARANTINED_CARD_IDS member exists in ALL_CARDS', missing.length === 0, missing.join(','));
const unstamped = [...QUARANTINED_CARD_IDS].filter((id) => byId.get(id)?.quarantined !== true);
assert('every QUARANTINED_CARD_IDS member carries quarantined:true',
  unstamped.length === 0, unstamped.join(','));

// ---- 3. The 7 C3 ids ----------------------------------------------------------
const C3_IDS = [4756, 4959, 5002, 5074, 5084, 5151, 5216];
assert('all 7 C3 suspected-corruption cards are quarantined',
  C3_IDS.every((id) => QUARANTINED_CARD_IDS.has(id) && byId.get(id)?.quarantined === true),
  C3_IDS.filter((id) => !QUARANTINED_CARD_IDS.has(id)).join(','));
assert('the quarantine list has not been quietly shrunk below the 7 C3 ids',
  QUARANTINED_CARD_IDS.size >= C3_IDS.length, `${QUARANTINED_CARD_IDS.size}`);

// ---- 4. QUARANTINED_CARDS surface (the native's worklist) ---------------------
assert('QUARANTINED_CARDS is non-empty', QUARANTINED_CARDS.length > 0, `${QUARANTINED_CARDS.length}`);
const all = new Set(ALL_CARDS);
assert('QUARANTINED_CARDS is a subset of ALL_CARDS', QUARANTINED_CARDS.every((c) => all.has(c)));
assert('QUARANTINED_CARDS is exactly the flagged set',
  QUARANTINED_CARDS.length === QUARANTINED_CARD_IDS.size
  && QUARANTINED_CARDS.every((c) => QUARANTINED_CARD_IDS.has(c.id)),
  `${QUARANTINED_CARDS.length} vs ${QUARANTINED_CARD_IDS.size}`);
assert('quarantined cards are still reachable for review (present in ALL_CARDS)',
  C3_IDS.every((id) => ALL_CARDS.some((c) => c.id === id)));

// ---- 5. One stated reason per card --------------------------------------------
const overlap = [...QUARANTINED_CARD_IDS].filter((id) => MATURE_CARD_IDS.has(id));
assert('mature and quarantine sets are disjoint', overlap.length === 0, overlap.join(','));
assert('no card is stamped both mature and quarantined',
  MATURE_CARDS.every((c) => !c.quarantined) && QUARANTINED_CARDS.every((c) => !c.mature));

console.log('');
if (failures > 0) {
  console.log(`Card quarantine check FAILED (${failures} failure(s)).`);
  process.exit(1);
}
console.log(`Card quarantine check passed (${QUARANTINED_CARDS.length} quarantined, 0 reachable in ${CARDS.length} free cards).`);
