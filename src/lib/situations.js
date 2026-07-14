// ─────────────────────────────────────────────────────────────────────────────
// SITUATION CATALOG + TAGGING OVERLAY (FOUNDATION README §2/§3; curriculum.md §2/§3/§6).
//
// This is a NEW TAGGING LAYER over the existing deck, never a content fork:
//   • the 16 canonical situation ids, order, names, and `base` priority are
//     reproduced VERBATIM from FOUNDATION README §2;
//   • the per-path weights are VERBATIM from FOUNDATION README §3;
//   • a card belongs to a situation via its EXISTING `cat` field, using the
//     category→situation overlay in src/data/situationTags.js (zero Thai, zero
//     card edits). New authored cards may instead carry a `situation` field
//     inline, which situationOf() prefers.
//
// This module authors ZERO new Thai. It only reads existing CARDS and existing
// category ids. Every count it reports is derived from the live deck.
//
// Dependency direction (no cycles): situations.js → { cards.js, situationTags.js,
// reviewStatus.js }. reviewStatus.js is a leaf primitive and never imports this
// file (it hardcodes the same 16 ids; the validator cross-checks they match).
// ─────────────────────────────────────────────────────────────────────────────

import { CARDS } from '../data/cards.js';
import { SITUATION_CATEGORY_TAGS } from '../data/situationTags.js';
import {
  reviewStatusOf, isApproved, situationReviewComplete, SITUATION_REVIEW_COMPLETE,
} from './reviewStatus.js';

// Invert the category overlay: situation id → [category ids] currently tagged to
// it. Derived from the overlay so SITUATIONS[].cats can never drift from it.
const CATS_BY_SITUATION = {};
for (const [cat, sit] of Object.entries(SITUATION_CATEGORY_TAGS)) {
  (CATS_BY_SITUATION[sit] || (CATS_BY_SITUATION[sit] = [])).push(cat);
}

// Content-readiness tier (curriculum.md §4.2), independent of approval state:
//   'adequate' — enough taggable candidates today (the 7 tagged in Pass 2);
//   'thin'     — small / shared pool, needs targeted authoring;
//   'net-new'  — zero dedicated cards, fully greenfield;
//   'dating-pack' — the separate 18+ Super pack (own id space, own review flag).
const CONTENT_TIER = {
  'sit-greet': 'adequate', 'sit-food': 'adequate', 'sit-money': 'adequate',
  'sit-directions': 'adequate', 'sit-smalltalk': 'adequate',
  'sit-housing': 'adequate', 'sit-pharmacy': 'adequate',
  'sit-store': 'thin', 'sit-market': 'thin', 'sit-transport': 'thin',
  'sit-admin': 'thin', 'sit-emergency': 'thin',
  'sit-delivery': 'net-new', 'sit-work': 'net-new', 'sit-formal': 'net-new',
  'sit-dating': 'dating-pack',
};

// ── The 16 canonical situations — VERBATIM from FOUNDATION README §2 ──────────
// `order` and `base` are load-bearing and must not be renamed or re-scoped.
// `cats` is DERIVED from the overlay (accurate by construction); `tagged` is
// true iff the overlay currently assigns any category to this situation.
const SITUATION_BASE = [
  { id: 'sit-greet',      name: 'Greetings & politeness particles',        base: 10 },
  { id: 'sit-store',      name: 'Convenience store (7-Eleven)',            base: 9  },
  { id: 'sit-food',       name: 'Ordering food & drinks',                 base: 9  },
  { id: 'sit-money',      name: 'Numbers, prices & paying',               base: 8  },
  { id: 'sit-transport',  name: 'Taxi / Grab / bus',                      base: 8  },
  { id: 'sit-directions', name: 'Asking & understanding directions',      base: 7  },
  { id: 'sit-market',     name: 'Markets & bargaining',                   base: 7  },
  { id: 'sit-smalltalk',  name: 'Small talk & address-by-age (pîi/náwng)', base: 6  },
  { id: 'sit-delivery',   name: 'Delivery & app messaging (Grab/Lineman)', base: 6  },
  { id: 'sit-housing',    name: 'Condo, rent & utilities',                base: 5  },
  { id: 'sit-pharmacy',   name: 'Pharmacy, symptoms & health',            base: 5  },
  { id: 'sit-work',       name: 'Workplace & office',                     base: 4  },
  { id: 'sit-dating',     name: 'Dating & relationships',                 base: 4  },
  { id: 'sit-admin',      name: 'Visa / immigration / bank',              base: 3  },
  { id: 'sit-emergency',  name: 'Emergencies & safety',                   base: 3  },
  { id: 'sit-formal',     name: 'Temple, monks & deference',              base: 2  },
];

export const SITUATIONS = SITUATION_BASE.map((s, i) => {
  const cats = CATS_BY_SITUATION[s.id] || [];
  return Object.freeze({
    ...s,
    order: i + 1,               // 1-based §2 order
    cats,                        // categories tagged to this situation (may be [])
    content: CONTENT_TIER[s.id], // curriculum.md §4.2 tier
    tagged: cats.length > 0,     // overlay assigns cards to it today
  });
});

// Ordered list of the 16 canonical situation ids (FOUNDATION §2 order). This is
// the single source of the id list; scripts/check-situation-review.mjs asserts
// it deep-equals Object.keys(SITUATION_REVIEW_COMPLETE) in reviewStatus.js.
export const SITUATION_IDS = Object.freeze(SITUATIONS.map((s) => s.id));

const SITUATION_BY_ID = new Map(SITUATIONS.map((s) => [s.id, s]));
export const getSituation = (sitId) => SITUATION_BY_ID.get(sitId) || null;
export const isSituationId = (sitId) => SITUATION_BY_ID.has(sitId);

// ── §3 identity-path weighting overlay (reweights ORDER only; never gates) ────
// Canonical weight letters → multipliers (FOUNDATION README §3).
export const WEIGHT_VALUE = Object.freeze({ C: 2.0, H: 1.5, N: 1.0, L: 0.5 });

export const PATHS = Object.freeze([
  'path-tourist', 'path-expat', 'path-partner', 'path-worker', 'path-none',
]);

// Per-path weight letters — VERBATIM from FOUNDATION README §3. `path-none` is
// implicit: all 'N' (handled in priority()).
export const WEIGHTS = Object.freeze({
  'path-tourist': {
    'sit-greet': 'N', 'sit-store': 'H', 'sit-food': 'C', 'sit-money': 'H',
    'sit-transport': 'C', 'sit-directions': 'H', 'sit-market': 'H',
    'sit-smalltalk': 'N', 'sit-delivery': 'L', 'sit-housing': 'L',
    'sit-pharmacy': 'N', 'sit-work': 'L', 'sit-dating': 'L', 'sit-admin': 'L',
    'sit-emergency': 'H', 'sit-formal': 'N',
  },
  'path-expat': {
    'sit-greet': 'N', 'sit-store': 'H', 'sit-food': 'H', 'sit-money': 'H',
    'sit-transport': 'H', 'sit-directions': 'N', 'sit-market': 'N',
    'sit-smalltalk': 'H', 'sit-delivery': 'H', 'sit-housing': 'C',
    'sit-pharmacy': 'H', 'sit-work': 'N', 'sit-dating': 'N', 'sit-admin': 'C',
    'sit-emergency': 'H', 'sit-formal': 'N',
  },
  'path-partner': {
    'sit-greet': 'N', 'sit-store': 'N', 'sit-food': 'N', 'sit-money': 'N',
    'sit-transport': 'N', 'sit-directions': 'N', 'sit-market': 'N',
    'sit-smalltalk': 'C', 'sit-delivery': 'H', 'sit-housing': 'H',
    'sit-pharmacy': 'H', 'sit-work': 'N', 'sit-dating': 'C', 'sit-admin': 'N',
    'sit-emergency': 'N', 'sit-formal': 'H',
  },
  'path-worker': {
    'sit-greet': 'N', 'sit-store': 'N', 'sit-food': 'N', 'sit-money': 'H',
    'sit-transport': 'N', 'sit-directions': 'N', 'sit-market': 'N',
    'sit-smalltalk': 'H', 'sit-delivery': 'N', 'sit-housing': 'H',
    'sit-pharmacy': 'N', 'sit-work': 'C', 'sit-dating': 'L', 'sit-admin': 'H',
    'sit-emergency': 'N', 'sit-formal': 'C',
  },
});

// priority(sit, path) = base(sit) × weight(sit, path). Unknown/`path-none` → ×1.0.
export function priority(sitId, path = 'path-none') {
  const s = SITUATION_BY_ID.get(sitId);
  if (!s) return 0;
  const letter = (WEIGHTS[path] && WEIGHTS[path][sitId]) || 'N';
  return s.base * WEIGHT_VALUE[letter];
}

// A learner's situation order: sort DESCENDING by priority, ties broken by §2
// `base` order (stable). Pure sort over the ONE catalog — never a fork, never a
// gate; every situation stays present for every path (FOUNDATION §3, curriculum §6.1).
export function getSituationOrder(path = 'path-none') {
  return SITUATIONS
    .map((s) => s.id)
    .sort((a, b) => (priority(b, path) - priority(a, path))
      || (SITUATION_BY_ID.get(b).base - SITUATION_BY_ID.get(a).base)
      || (SITUATION_BY_ID.get(a).order - SITUATION_BY_ID.get(b).order));
}

// ── Card ↔ situation resolution (derived from existing cards; zero new Thai) ──

// Which situation does a card belong to? Authored inline `situation` field wins
// (forward-compatible with new cards); otherwise derive from the card's existing
// `cat` via the overlay. Returns null when the card's category is not yet tagged.
export function situationOf(card) {
  if (!card) return null;
  if (card.situation) return card.situation;
  return SITUATION_CATEGORY_TAGS[card.cat] || null;
}

// All existing cards tagged to a situation (curriculum.md §4.4 getSituationVocab:
// overlay ∪ authored `situation` field). Disjoint across the 7 tagged situations
// (no category is shared among them).
export function cardsInSituation(sitId) {
  return CARDS.filter((c) => situationOf(c) === sitId);
}

// Precomputed count per situation (all 16; untagged → 0). Handy for readiness UI.
export const SITUATION_CARD_COUNTS = Object.freeze(
  SITUATIONS.reduce((acc, s) => {
    acc[s.id] = cardsInSituation(s.id).length;
    return acc;
  }, {}),
);

// ── Readiness gate (curriculum.md §4.3) ──────────────────────────────────────
// A situation is 'ready' (surfaceable as the free "up next") ONLY when its
// native reviewer has flipped its SITUATION_REVIEW_COMPLETE flag AND it owns
// ≥ 8 APPROVED vocab cards + ≥ 1 APPROVED sentence card. Because nothing is
// approved yet (reviewStatus.js: no card resolves to 'approved'; every situation
// flag is false), this returns 'coming-soon' for ALL 16 situations today. It
// will flip to 'ready' only after a human native-speaker sign-off — never by
// derivation. Order (§2) says WHERE a situation belongs; readiness says WHETHER
// it can be surfaced yet.
export function situationReadiness(sitId) {
  if (!situationReviewComplete(sitId)) return 'coming-soon';
  const cards = cardsInSituation(sitId);
  const approvedVocab = cards.filter(
    (c) => (c.type === 'w' || c.type === 'p') && isApproved(c),
  ).length;
  const approvedSentence = cards.filter((c) => c.type === 's' && isApproved(c)).length;
  return approvedVocab >= 8 && approvedSentence >= 1 ? 'ready' : 'coming-soon';
}

// Re-export the completion map so situation consumers have one import surface.
export { SITUATION_REVIEW_COMPLETE, situationReviewComplete, reviewStatusOf };
