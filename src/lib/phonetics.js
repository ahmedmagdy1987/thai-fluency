// ─────────────────────────────────────────────────────────────────────────────
// PHONETIC PRESENCE — the single test for "does this card have a pronunciation
// anchor?", plus the derived worklist of the cards that do not.
//
// Cards store tone ONLY as the diacritic on the romanized `ph` field (CLAUDE.md
// "Data conventions"). A card with an empty `ph` therefore has NO pronunciation
// and NO tone at all — it is unteachable in any exercise whose prompt is audio
// or whose job is to train the mouth. This module is what those exercises filter
// on. Review finding A3 (docs/content-review/claude-review.md).
//
// ── THE TRAP: `phNeedsGen` / `phReview` ARE COMMENTS, NOT FIELDS ─────────────
// The card data files carry TRAILING LINE COMMENTS that look like properties:
//
//     {id:5073, thai:'…', ph:'', en:'…', …},  // phNeedsGen: true
//
// They are inside a `//` comment. They are NOT parsed, NOT on the object, and
// NOT reachable at runtime. Runtime proof, on the live deck:
//
//     ALL_CARDS.filter(c => c.phNeedsGen).length === 0   // ← matches ZERO cards
//     ALL_CARDS.filter(c => c.phReview).length   === 0   // ← matches ZERO cards
//
// A filter written against `card.phNeedsGen` is a SILENT NO-OP: it looks like a
// guard, it reads like a guard, it passes review, and it excludes nothing. That
// is exactly how 335 empty-`ph` cards reached a listening exercise unnoticed.
// NEVER filter on those names. Filter on the real field, via `hasPhonetic`.
// scripts/check-phonetic-integrity.mjs fails the build if either name is ever
// used as a property again.
//
// ── NEVER SYNTHESIZE A PHONETIC ──────────────────────────────────────────────
// This module REPORTS absence; it never repairs it. A romanization is Thai
// content: inventing one (by transliterating the script, by pattern-matching a
// similar card, or by any "derivation") fabricates a tone, and a fabricated tone
// teaches a wrong word in a tonal language. The repo already proved this cannot
// be mechanized — scripts/audit-missing-phonetics.mjs tried every safe derivation
// path and got 0 hits on all of them. Every one of these cards needs a HUMAN
// native speaker. See docs/empty-phonetics-review-list.md for the worklist.
//
// Note the direction of the one derivation that IS legal: src/lib/toneFromPh.js
// reads a tone OUT of an existing `ph`. It never writes a `ph`, and it returns
// null for an empty one. Absence in → absence out; nothing is invented.
// ─────────────────────────────────────────────────────────────────────────────

import { ALL_CARDS } from '../data/cards.js';

// THE test. `ph` is always a string on the live deck (335 cards hold '', zero
// hold undefined), but the null-guard keeps this honest for a hand-built card
// object — SpeakingExercise, for one, accepts a caller-supplied `{thai, ph, en}`.
// Trim matters: a whitespace-only `ph` is an absent one, not a present one.
export function hasPhonetic(card) {
  return !!(card && card.ph && card.ph.trim());
}

// Cards with NO pronunciation anchor, computed over ALL_CARDS — deliberately the
// ungated deck, so mature/quarantined cards cannot hide from the native's
// worklist. DERIVED, never hand-maintained: a hardcoded list (or a count) rots
// the moment a card is added, and the rot is silent.
export const EMPTY_PHONETIC_CARDS = ALL_CARDS.filter((c) => !hasPhonetic(c));

// Just the ids, as a Set, for cheap membership tests in pools and validators.
export const EMPTY_PHONETIC_IDS = new Set(EMPTY_PHONETIC_CARDS.map((c) => c.id));

// Convenience for the exercise pools: keep only cards a phonetic-REQUIRING
// exercise can honestly teach. Reads as the intent it enforces.
export function withPhonetic(cards) {
  return cards.filter(hasPhonetic);
}
