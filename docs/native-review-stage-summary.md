# Tuk Talk Thai — Native Review Stage Summary

_An at-a-glance map of what to review, in priority order. Last updated: May 30, 2026._

This is the quick overview for the owner. Start at the top (HIGH priority) and work
down. Open each stage's **review doc** to see every unit, sentence, and builder in
detail, then record decisions in `docs/native-review-issues.md`.

> Numbers below are produced by `node scripts/report-native-review-coverage.mjs`
> (read-only) and match `scripts/check-mini-units.mjs`.

## All stages — overview

| Stage | Theme | Units | Guided vocab | Builders | Priority | Review doc |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Survival Thai | 5 | 32 / 150 | 4 | **HIGH** | _(in `course-structure-roadmap.md`)_ |
| 2 | Daily Essentials | 10 | 76 / 269 | 6 | **HIGH** | `stage-2-content-review-matrix.md` |
| 3 | Getting Around | 12 | 96 / 423 | 9 | MEDIUM | `stage-3-content-review-matrix.md` |
| 4 | Real Conversations | 14 | 112 / 575 | 12 | MEDIUM | `stage-4-content-review-matrix.md` |
| 5 | Social Confidence | 14 | 112 / 701 | 14 | MEDIUM | `stage-5-content-review-matrix.md` |
| 6 | Intermediate Power | 14 | 110 / 804 | 13 | LOWER | `stage-6-content-review-matrix.md` |
| 7 | Natural Thai | 14 | 112 / 877 | 12 | LOWER | `stage-7-content-review-matrix.md` |
| 8 | Thai Mastery | 13 | 102 / 992 | 13 | LOWER | `stage-8-content-review-matrix.md` |
| **Total** | | **96** | **752** | **83** | | |

## Per-stage detail

### Stage 1 — Survival Thai · **HIGH priority**
- **Units:** 5 · **Guided vocab:** 32 / 150 · **Builders:** 4
- **Main risk:** This is every new user's first impression — greetings, names,
  yes/no, prices. Politeness and the very first build ("My name is ___") must feel
  perfect.
- **Review doc:** documented in `docs/course-structure-roadmap.md` (no separate
  matrix file for Stage 1).
- **Recommended action:** Review first and most carefully. Confirm the pilot
  name-builder, greetings, and polite particles read naturally for a beginner.

### Stage 2 — Daily Essentials · **HIGH priority**
- **Units:** 10 · **Guided vocab:** 76 / 269 · **Builders:** 6
- **Main risk:** Verb/adjective-heavy stage; a few units are vocab-only or show a
  short sentence without a builder (sizes, counting, connectors). Confirm the
  short feeling/like builders (e.g. "I love you", "I don't like it") are natural.
- **Review doc:** `docs/stage-2-content-review-matrix.md`
- **Recommended action:** Review second. Approve the 6 builders; sanity-check the
  4 vocab-only / sentence-only units.

### Stage 3 — Getting Around · MEDIUM priority
- **Units:** 12 · **Guided vocab:** 96 / 423 · **Builders:** 9
- **Main risk:** Deep single-syllable verb/adjective vocabulary; some units group
  by word type rather than a travel theme (the clean "travel" cards are sparse).
  Time / Home / Animals units show a sentence with no builder.
- **Review doc:** `docs/stage-3-content-review-matrix.md`
- **Recommended action:** Confirm the 9 builders and that the verb/adjective
  groupings are useful at this level.

### Stage 4 — Real Conversations · MEDIUM priority
- **Units:** 14 · **Guided vocab:** 112 / 575 · **Builders:** 12
- **Main risk:** Genuinely conversational (small talk, plans, directions, feelings).
  Mostly high-confidence, but confirm the question/request builders sound natural.
- **Review doc:** `docs/stage-4-content-review-matrix.md`
- **Recommended action:** Approve the 12 conversational builders; check the
  at-home (sentence-only) and food (vocab-only) units.

### Stage 5 — Social Confidence · MEDIUM priority
- **Units:** 14 · **Guided vocab:** 112 / 701 · **Builders:** 14
- **Main risk:** Richest builder coverage — **all 14 units have a builder**
  (introductions, feelings, health, weather, food, compliments, requests). Some
  planning/speech verbs are formal; flag any too-formal ones.
- **Review doc:** `docs/stage-5-content-review-matrix.md`
- **Recommended action:** Approve the 14 builders; spot-check compliment/feeling
  phrasing and formality.

### Stage 6 — Intermediate Power · LOWER priority
- **Units:** 14 · **Guided vocab:** 110 / 804 · **Builders:** 13
- **Main risk:** Concept-heavy; longer 4-/5-token builders. **"Explaining and
  confirming"** pairs a request builder with communication verbs (flagged medium).
- **Review doc:** `docs/stage-6-content-review-matrix.md`
- **Recommended action:** Review during/after beta. Decide on the medium-confidence
  unit; approve the rest.

### Stage 7 — Natural Thai · LOWER priority
- **Units:** 14 · **Guided vocab:** 112 / 877 · **Builders:** 12
- **Main risk:** Long natural lines (taxi, social, scheduling) incl. 5-/6-token
  builders. **"Feelings & reactions"** and **"Everyday actions"** pair a social/taxi
  builder with themed vocab (flagged medium). Describing/Nature units are vocab-only.
- **Review doc:** `docs/stage-7-content-review-matrix.md`
- **Recommended action:** Review during/after beta. Decide on the two medium units;
  approve the rest.

### Stage 8 — Thai Mastery · LOWER priority
- **Units:** 13 · **Guided vocab:** 102 / 992 · **Builders:** 13
- **Main risk:** Largest, most sentence-rich stage (33 clean builders available;
  12 used). **"Decisions and opinions"** pairs a want-builder with decision verbs
  (flagged medium). Some kinship cards bundle multiple regional terms.
- **Review doc:** `docs/stage-8-content-review-matrix.md`
- **Recommended action:** Review last. Decide on the medium unit; approve the rest.
  Stage 8 has ~20 unused clean builders if the owner wants to deepen it further.

## Recommended overall review order
1. **Stage 1** (Survival Thai) — first impression, most critical.
2. **Stage 2** (Daily Essentials).
3. **Stages 3 → 4 → 5** (core daily-life Thai).
4. **Stages 6 → 7 → 8** (advanced; can overlap beta), prioritising the four
   **medium-confidence** units called out above.
