// ─────────────────────────────────────────────────────────────────────────────
// SITUATION TAGGING OVERLAY — a side map, NEVER a content fork.
//
// The as-built deck groups cards by part of speech inside a stage (taxonomy.js
// CATEGORIES / STAGES), not by real-world situation. FOUNDATION README §2
// restores the situation-first intent as a NEW TAGGING LAYER over the existing
// cards. Rather than edit the 4,791 cards to add a `situation` field (which would
// churn check-mini-units / verify-voice-flip / verify-no-gender-mismatch across
// the whole deck for zero pedagogical gain — curriculum.md §1), this overlay maps
// each EXISTING taxonomy category to a canonical situation id.
//
// A card therefore belongs to a situation via its existing `cat` field alone:
// this file contains ZERO Thai — only category ids and situation ids. Every card
// stays byte-identical.
//
// SCOPE (Pass 2): only the ~7 "adequate raw pool" situations are tagged today
// (curriculum.md §4.2 tier 1) — the ones with enough taggable candidates that the
// work is re-tag/re-unit/re-review, not authoring. The category → situation map
// is 1:1 (each category maps to exactly ONE situation), which is unambiguous for
// these 7 because none of them share a category.
//
// KNOWN LIMITATION (documented, deferred): several LATER situations share a
// single category pool — `sit-store`, `sit-market`, and `sit-money` all want the
// one `shopping` pool (43 cards); `sit-transport` wants context from
// `directions`/`places` which already belong to `sit-directions`. A pure
// category→situation map cannot express that overlap. Disambiguating them needs
// per-cardId tagging or an authored inline `situation` field on new cards
// (curriculum.md §4.2 "shared pools still need disjoint tagging"). Until then,
// `shopping` is assigned to `sit-money` (its highest-`base` claimant among the
// ready set), and `sit-store`/`sit-market` remain untagged ("thin" tier).
//
// New AUTHORED cards do NOT need an entry here — they carry a `situation` field
// inline, and situationOf() prefers that field over this overlay.
// ─────────────────────────────────────────────────────────────────────────────

// taxonomy.js category id  →  canonical FOUNDATION §2 situation id.
// Only the 7 "ready" (adequate-pool) situations are populated in Pass 2.
export const SITUATION_CATEGORY_TAGS = Object.freeze({
  // sit-greet  (127 cards)
  greetings: 'sit-greet',
  pronouns: 'sit-greet',
  intro: 'sit-greet',

  // sit-food  (179 cards)
  food: 'sit-food',
  'food-phrases': 'sit-food',
  'sentences-food': 'sit-food',
  'sentences-want': 'sit-food',

  // sit-money  (102 cards)  — owns `shopping` for now (see KNOWN LIMITATION)
  numbers: 'sit-money',
  shopping: 'sit-money',

  // sit-directions  (107 cards)
  directions: 'sit-directions',
  places: 'sit-directions',

  // sit-smalltalk  (306 cards)
  'sentences-self': 'sit-smalltalk',
  people: 'sit-smalltalk',
  emotions: 'sit-smalltalk',
  'sentences-social': 'sit-smalltalk',

  // sit-housing  (97 cards)
  home: 'sit-housing',
  'sentences-home': 'sit-housing',

  // sit-pharmacy  (110 cards)
  health: 'sit-pharmacy',
  body: 'sit-pharmacy',
  'sentences-health': 'sit-pharmacy',
});
