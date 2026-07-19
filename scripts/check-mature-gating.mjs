// Validation for the mature-content gate on the main deck (claude-review.md S1).
//
// The one rule this script exists to enforce: a card flagged mature must NEVER be
// reachable in the free, ungated deck. `CARDS` is what every consumer imports —
// two of them (PublicLanding.jsx, DemoMode.jsx) render PRE-AUTH with no Super and
// no age check — so "reachable in CARDS" means "reachable by a minor".
//
// Proves, on every run:
//   • NO member of MATURE_CARD_IDS is reachable in CARDS;
//   • every id in MATURE_CARD_IDS exists and carries mature:true in ALL_CARDS;
//   • the S1 four (5012, 5073, 5088, 5206) + the C4 split child 5739 are all flagged;
//   • MATURE_CARDS is exactly the flagged set, is a subset of ALL_CARDS, non-empty;
//   • CARDS + the flagged groups still account for the whole deck (nothing dropped).

import { ALL_CARDS, CARDS, MATURE_CARDS, QUARANTINED_CARDS } from '../src/data/cards.js';
import { MATURE_CARD_IDS } from '../src/data/contentFlags.js';

let failures = 0;
const ok = (name) => console.log(`OK   ${name}`);
const fail = (name, detail) => { console.log(`FAIL ${name}  ${detail}`); failures++; };
const assert = (name, cond, detail = '') => (cond ? ok(name) : fail(name, detail));

// ---- 1. The gate itself -------------------------------------------------------
const leaked = CARDS.filter((c) => MATURE_CARD_IDS.has(c.id));
assert('NO mature card is reachable in the free ungated deck (CARDS)',
  leaked.length === 0, `${leaked.length} leaked: ${leaked.map((c) => c.id).join(',')}`);
assert('no card in CARDS carries mature:true',
  CARDS.every((c) => !c.mature), CARDS.filter((c) => c.mature).map((c) => c.id).join(','));

// ---- 2. Every flagged id exists and is stamped --------------------------------
const byId = new Map(ALL_CARDS.map((c) => [c.id, c]));
const missing = [...MATURE_CARD_IDS].filter((id) => !byId.has(id));
assert('every MATURE_CARD_IDS member exists in ALL_CARDS', missing.length === 0, missing.join(','));
const unstamped = [...MATURE_CARD_IDS].filter((id) => byId.get(id)?.mature !== true);
assert('every MATURE_CARD_IDS member carries mature:true', unstamped.length === 0, unstamped.join(','));

// ---- 3. The S1 four + the C4 split child --------------------------------------
const S1_IDS = [5012, 5073, 5088, 5206];
assert('the four S1 mature cards are flagged',
  S1_IDS.every((id) => MATURE_CARD_IDS.has(id) && byId.get(id)?.mature === true), S1_IDS.join(','));
assert('the C4 split child 5739 is flagged mature alongside its 5073 sibling',
  MATURE_CARD_IDS.has(5739) && byId.get(5739)?.mature === true);
assert('the 5073/5739 split halves each hold ONE phrase (no " / " alternation left)',
  [5073, 5739].every((id) => !byId.get(id)?.thai.includes(' / ')),
  [5073, 5739].map((id) => byId.get(id)?.thai).join(' | '));

// ---- 4. MATURE_CARDS surface --------------------------------------------------
assert('MATURE_CARDS is non-empty', MATURE_CARDS.length > 0, `${MATURE_CARDS.length}`);
const all = new Set(ALL_CARDS);
assert('MATURE_CARDS is a subset of ALL_CARDS', MATURE_CARDS.every((c) => all.has(c)));
assert('MATURE_CARDS is exactly the flagged set',
  MATURE_CARDS.length === MATURE_CARD_IDS.size
  && MATURE_CARDS.every((c) => MATURE_CARD_IDS.has(c.id)),
  `${MATURE_CARDS.length} vs ${MATURE_CARD_IDS.size}`);

// ---- 5. Gating removes, never destroys ----------------------------------------
assert('CARDS + MATURE_CARDS + QUARANTINED_CARDS account for the whole deck',
  CARDS.length + MATURE_CARDS.length + QUARANTINED_CARDS.length === ALL_CARDS.length,
  `${CARDS.length}+${MATURE_CARDS.length}+${QUARANTINED_CARDS.length} vs ${ALL_CARDS.length}`);

console.log('');
if (failures > 0) {
  console.log(`Mature gating check FAILED (${failures} failure(s)).`);
  process.exit(1);
}
console.log(`Mature gating check passed (${MATURE_CARDS.length} mature cards gated, 0 reachable in ${CARDS.length} free cards).`);
