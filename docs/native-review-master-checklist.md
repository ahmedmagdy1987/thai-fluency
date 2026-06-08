# Tuk Talk Thai — Native Review Master Checklist

_For the owner and a native Thai speaker. Last updated: May 30, 2026._

## Why this review is needed

The **app structure is ready**. All 8 stages now have a guided learning path made
of short "mini-units" (learn a few words → see a sentence → build the sentence →
quick challenge → recap). Across the course there are **96 mini-units**, **752
guided vocabulary cards**, and **83 sentence builders**.

**What still needs a human:** the sentence builders and the Thai phrasing were
**assembled automatically from the Thai cards that already existed in the app.**
No Thai was invented and no card meaning or spelling was changed — but a computer
chose how to split each sentence into tappable tiles and which words to group into
a unit. A **native speaker needs to confirm those choices read naturally** before
we call the course content "final."

Think of this as proof-reading, not rewriting. Most items should be a quick
"looks good." The goal is to catch the few that sound awkward, are split at the
wrong place, or don't fit a beginner.

## What to review (for each unit / builder)

Go stage by stage using the matching `docs/stage-N-content-review-matrix.md` file
(each lists every unit, its words, its sentence, and the builder tiles). For each
item, check:

- [ ] **Thai sentence is natural** — a real person would actually say it this way.
- [ ] **English meaning is accurate** — the translation matches the Thai.
- [ ] **Phonetic is accurate** — the romanised pronunciation and tone marks are right.
- [ ] **Token (tile) boundaries are correct** — the sentence is split at real Thai
      word boundaries, not mid-word.
- [ ] **Builder tile order makes sense** — arranging the tiles in the given answer
      order produces the correct, natural sentence.
- [ ] **Not too awkward for a beginner** — the sentence is simple enough for the
      stage it's in.
- [ ] **Polite form is acceptable** — most builders use the **male polite form**
      (ผม / ครับ) because that's how the source card is written. Confirm this is OK,
      or note where a neutral/female form would be better.
- [ ] **Builder should stay / be simplified / be removed** — if a sentence is fine
      to *show* but bad to *build* (e.g. too long, repeated tiles), say so.
- [ ] **Unit topic fits** — the grouped words belong together and match the title.

## How to record a decision

For every item you review, pick one decision and (optionally) jot a note in
`docs/native-review-issues.md`:

| Decision | Meaning |
| --- | --- |
| **Approved** | Reads naturally, keep as-is. |
| **Needs wording fix** | Small Thai/English/phonetic tweak needed (note the fix). |
| **Remove sentence builder** | Keep the sentence as a normal card, drop the build step. |
| **Keep sentence but no builder** | Same as above — show it, don't ask the user to build it. |
| **Needs native rewrite later** | The sentence/topic needs a proper rewrite (out of scope for now). |
| **Unsure** | Flag for a second opinion / discussion. |

> Nothing here changes automatically. A developer applies approved fixes later;
> "Remove builder" simply means deleting the `sentenceBuilder` block from a unit —
> no card data is touched.

## Review priority

Review in this order so the screens beginners hit first are perfected first:

| Priority | Stages | Why |
| --- | --- | --- |
| **HIGH** | Stage 1 (Survival Thai), Stage 2 (Daily Essentials) | First contact — every new user sees these. Must be flawless. |
| **MEDIUM** | Stage 3 (Getting Around), Stage 4 (Real Conversations), Stage 5 (Social Confidence) | Core daily-life Thai; reached by motivated learners. |
| **LOWER (before beta)** | Stage 6 (Intermediate Power), Stage 7 (Natural Thai), Stage 8 (Thai Mastery) | Advanced; fewer users reach these early, and they have the most auto-derived builders. |

(See `docs/native-review-stage-summary.md` for the at-a-glance table with counts
and direct links to each stage's review document.)

## Already-flagged items to look at first

A handful of units were marked **"medium confidence"** during the build because a
conversational sentence is *shown alongside* a themed word set rather than being
literally about those words. These are the most likely to need a "remove builder"
or "keep sentence, no builder" decision:

- **Stage 6 — Explaining and confirming** (`stage-6-communication-verbs`): builder
  "May I have some more" sits with communication verbs.
- **Stage 7 — Feelings and reactions** (`stage-7-feelings-reactions`): builder
  "Thanks for everything" sits with feeling words.
- **Stage 7 — Everyday actions** (`stage-7-everyday-actions`): builder "Can you take
  me here?" sits with general action verbs.
- **Stage 8 — Decisions and opinions** (`stage-8-decisions-verbs`): builder "I want
  to go there" sits with decision verbs.

## Known limitations (please read before reviewing)

- **Builders are based on existing card content only.** Each builder's tiles come
  from a real sentence card's own phonetic, split into words. Nothing was invented.
- **No Thai content was changed during the Course Structure Sprint.** Card Thai,
  phonetics, and meanings are exactly as they were.
- **Some builders are auto-derived and need human approval** — that is the whole
  point of this review.
- **Tiles use the source card's polite form**, which is **mostly the male polite
  form** (ผม / ครับ) where the card uses it.
- **Coverage is partial by design.** 752 of ~4,790 cards are in guided units; the
  rest stay available in **Practice** and the **Stage Challenge**. Uncovered cards
  are not "missing" — they're just not in a guided unit yet.

## When is content "final"?

Content can be called final once a native speaker has gone through the HIGH and
MEDIUM priority stages and either **Approved** them or logged fixes in
`docs/native-review-issues.md`, and those fixes have been applied. LOWER-priority
stages can be approved during or shortly after beta.

## First-lesson primer copy — needs a native pass (June 8, 2026)

The Stage 1 Mission 1 pilot added a Thai Basics Primer, a primer quiz, and a
mission recap (see `docs/first-lesson-pedagogy-notes.md`). Every Thai string in
that copy is reused from existing pilot cards (no new Thai invented), and the
ไม่ vs ไหม wording mirrors the verified note already on card 250. A quick native
review is still recommended before any wider rollout:
- Primer/quiz/recap English glosses + romanization tone (beginner-friendly,
  accurate, not over-teaching ฉัน / chán).
- Romanization consistency for ชื่อ: card 1661 shows `chêu`, card 330's phonetic
  uses `chûe`. Both are existing data; the primer references the card rather than
  picking one. Flag for a consistency decision (no card-data edits were made).
