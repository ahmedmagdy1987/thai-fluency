// ─────────────────────────────────────────────────────────────────────────────
// Main-deck content flags — the ONE greppable choke point for cards that must
// NOT reach the free, ungated deck.
//
// Why this file exists: src/data/cards.js is ~700 lines of data rows and its
// imports run to thousands more. Flagging cards inline there would scatter the
// decision across four files and make it unauditable. Keeping the ids HERE gives
// scripts/check-mature-gating.mjs and scripts/check-card-quarantine.mjs a single
// source of truth to assert against, and gives a native reviewer one list to read.
//
// The flags are consumed by the export pipeline at the bottom of cards.js, which
// stamps `mature:true` / `quarantined:true` onto the card objects and then filters
// BOTH groups out of the default `CARDS` export. Every consumer already imports
// `CARDS`, so the exclusion is safe-by-default with zero consumer edits — including
// the two PRE-AUTH surfaces (PublicLanding.jsx, DemoMode.jsx) that have no Super
// or age check of any kind.
//
// Findings these lists close out: docs/content-review/claude-review.md
//   • S1 (MEDIUM) — mature / crude register sitting in the UNGATED main deck.
//   • C3 (MEDIUM) — suspected Thai orthographic corruption, native to confirm.
// ─────────────────────────────────────────────────────────────────────────────

// S1 — Mature register. The 18+ Dating pack gates this register behind
// age-confirmation + Super (DatingSection.jsx:135); the main deck did not. Owner
// call: GATE all of them, do not delete — over-gating a card costs nothing,
// leaving sexual content reachable by a minor is unacceptable. These are excluded
// from CARDS and exposed only via MATURE_CARDS, which any surface must put behind
// the same 18+/Super standard as the Dating pack.
//   5012 โสดแต่ไม่สด    — sexual innuendo          (cards-imported-batch2.js:626)
//   5073 เป็นเมนส์        — menstruation (C4 split, see 5739)   (batch2.js:687)
//   5739 มีประจำเดือน     — menstruation (C4 split child of 5073)
//   5088 มักมากในกาม   — "to be lustful"          (batch2.js:702)
//   5206 ตอแหล          — insult                  (batch2.js:820)
export const MATURE_CARD_IDS = new Set([5012, 5073, 5088, 5206, 5739]);

// C3 — Suspected Thai orthographic corruption (stray/doubled combining marks,
// truncation, a field contradicted by its own note). The SHAPE is flagged here;
// only a native speaker may confirm and correct the Thai, so nothing in this list
// has been edited. Quarantine means: excluded from CARDS (never taught), still
// present in ALL_CARDS / QUARANTINED_CARDS so a reviewer can find and fix them.
// Remove an id from this Set only when a native has corrected the string.
//   4756 ผมเป็นหนี้บุคุณเขา   — บุคุณ                    (cards-imported-batch2.js:370)
//   4959 เขาเพึ่งจะไป        — own note gives the corrected form   (batch2.js:573)
//   5002 แล้วทีนี้่จะทำยังไง    — doubled mark on ทีนี้่      (batch2.js:616)
//   5074 จะเล่าคามจริงให้ฟัง  — คาม vs expected ความ      (batch2.js:688)
//   5084 พยยามรวบรวมเงิน  — พยยาม                   (batch2.js:698)
//   5151 ต้องรีบท           — truncated vs its English  (batch2.js:765)
//   5216 เปิเเผยความลับ     — เปิเเผย                   (batch2.js:830)
export const QUARANTINED_CARD_IDS = new Set([4756, 4959, 5002, 5074, 5084, 5151, 5216]);
