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

## Stage 1 mission intros + recaps copy — needs a native pass (June 8, 2026)

Sprint 2 added `lessonIntro` and `missionRecap` text to all 5 Stage 1 mini-units
(see `docs/first-lesson-pedagogy-notes.md`). Every Thai string reuses words the
unit already teaches (no new Thai, no card-data edits), and ไม่ vs ไหม are kept
distinct. A native pass on the new beginner copy is recommended before any
expansion to later stages:
- Greetings (`stage-1-greetings-courtesy`): สวัสดี, ขอบคุณ, ไม่เป็นไร, เจอกัน.
- Yes/no (`stage-1-yes-no-replies`): ใช่, ไม่, ไม่ใช่, เหรอ (intro stays within
  these cards and intentionally does not introduce the question particle ไหม).
- Asking where (`stage-1-asking-where`): ที่ไหน, ห้องน้ำ, อยู่.
- Prices (`stage-1-prices-shopping`): เท่าไหร่, เงิน, ถูก, แพง.
Check English glosses + tone are beginner-accurate and that no claim over-teaches
grammar. Expanding this model to Stages 2-8 is deferred pending owner approval.

## Stage 2 mission intros + recaps copy — needs a native pass (June 8, 2026)

Sprint 3 added `lessonIntro` and `missionRecap` text to all 10 Stage 2 mini-units
(see `docs/first-lesson-pedagogy-notes.md` and `docs/stage-2-content-review-matrix.md`).
Metadata only: no Thai card content, meanings, or phonetics were changed, and no
Thai was invented (every Thai string reuses the unit's own vocab/sentence/builder
words). English glosses were aligned to the card `en` values. ไม่ vs ไหม / มั้ย are
kept distinct (the connectors unit states มั้ย is different from ไม่; it never
equates them). No culture/religion/statistics, no fluency claims, no em/en dashes,
no money symbols. The copy was machine-linted and adversarially reviewed before
commit; the items below are simple, beginner-safe generalizations that should
still get a quick native confirmation (recommended, non-blocking):

- **Everyday actions** (`stage-2-everyday-actions`): "verbs do not change form";
  ผมรักคุณ described as I + love + you (subject-verb-object order); เปิด (bpòet)
  vs ปิด (bpìt) framed as differing mainly in the vowel sound (both are written
  with a low-tone mark) - confirm this contrast framing is fair for beginners;
  dual gloss เปิด = open / turn on, ปิด = close / turn off matches the cards.
- **Getting things done** (`stage-2-getting-things-done`): ไม่ placed before the
  verb to negate; in ผมไม่ชอบ, ไม่ sits between ผม (I) and ชอบ (like).
- **Talking and thinking** (`stage-2-talking-thinking`): same ไม่-before-verb
  negation ("I + ไม่ + verb") and the cross-unit "same pattern as the last
  mission" continuity reference.
- **Out and about** (`stage-2-out-and-about`): ไปไหนมา presented as ไป (go) +
  ไหน (where) + มา (come) and as a natural everyday question; gloss "where did you
  go" for a sentence whose card en is "Where did you go? / Where have you been?";
  วาง glossed "lay" (matches card).
- **Everyday actions II** (`stage-2-everyday-actions-2`): the sentence-final
  particle เลย described as "adding a feeling / a gentle push"; ทำไปเลย shown as
  a simple stack (note ไป here is aspectual, not literal "to go"); เก็บ glossed
  "save" (matches card).
- **Sizes and speeds** (`stage-2-sizes-and-speeds`): the secondary meaning that
  เย็น also means "evening" (correct, but beyond the card en "cool / cold");
  เร็ว / ช้า presented as an opposites pair; describing words treated as
  adjectives.
- **Skills and qualities** (`stage-2-skills-and-qualities`): มาก placed after a
  describing word to intensify it; เก่งมาก decomposed as skilled + very; เสร็จ
  glossed "done or finished" (card en is "completed").
- **Feelings** (`stage-2-feelings`): ผมหิวครับ described as I + the feeling/need
  word + the male polite particle ครับ; หิว (hungry) grouped with the feelings
  vocab; ครับ continuity callback to the first lessons.
- **Counting** (`stage-2-counting`): the generalization that สิบ (ten) helps build
  larger numbers met in later lessons.
- **Connectors and questions** (`stage-2-connectors-questions`): มั้ย as a casual
  sentence-final yes/no question particle; ล่ะ used for "and you? / what about?";
  the statement that มั้ย is different from ไม่ (confirm the phrasing reads as
  clearly distinct, not as equating them); ใครครับ glossed simply as "who".

Expanding this model to Stages 3-8 is deferred pending owner approval (Stage 2 is
now done).

## Stage 3 mission intros + recaps copy — needs a native pass (June 8, 2026)

Sprint 4 added `lessonIntro` and `missionRecap` text to all 12 Stage 3 mini-units
(see `docs/first-lesson-pedagogy-notes.md` and `docs/stage-3-content-review-matrix.md`).
Metadata only: no Thai card content/meanings/phonetics changed, no Thai invented
(every Thai string reuses the unit's own vocab/sentence/builder words), glosses
aligned to the card `en`. ไม่ vs ไหม kept distinct. No culture/religion/statistics,
no fluency claims, no em/en dashes, no money symbols. Machine-linted and
adversarially reviewed before commit (one gloss fix: น่ะ described as casual
emphasis per its card, not "softening" which is อ่ะ; one superlative softened).
The simple, beginner-safe generalizations below should still get a quick native
confirmation (recommended, non-blocking):

- **Daily verbs** (`stage-3-daily-verbs`): อยาก placed before a verb to say "want
  to" (ผมอยากนอน = I want to sleep).
- **Describing things** (`stage-3-describing-things`): ง่าย / ยาก presented as an
  opposites pair; the I + describing word + ครับ order (ผมร้อนครับ).
- **People and family** (`stage-3-people-family`): the question word อะไร at the
  end of คุณชื่ออะไร; the breakdown you (คุณ) + name (ชื่อ) + what (อะไร).
- **Everyday verbs I** (`stage-3-everyday-verbs-1`): อยู่ at the end of ทำอะไรอยู่
  marking an ongoing action (card note: same as กำลังทำอะไร).
- **Everyday verbs II** (`stage-3-everyday-verbs-2`): ทำไม (why) at the end of
  ทำไปทำไม; question word near the end (the card note shows a slightly rhetorical
  sense, worth a native nod).
- **Everyday verbs III** (`stage-3-everyday-verbs-3`): แล้ว at the end signalling
  that something has already happened (ผมลืมแล้ว).
- **Describing things II** (`stage-3-describing-things-2`): the I + state + ครับ
  order (ผมง่วงครับ). Data note: ง่วง vocab card ph is "ngûaang" while the
  sentence/builder use "ngûang" (not cited in copy; reconcile if desired).
- **Qualities and states** (`stage-3-qualities-states`): the I + describing word +
  ครับ order (ผมยุ่งครับ); glosses ไว = fast, ด่วน = urgent, เด็ด = excellent.
- **Time and sequence** (`stage-3-time-sequence`): กำลัง placed before a verb to
  mark an ongoing action (card note: "Before verb. gamlang gin = eating right
  now"); เดี๋ยวมา rendered as "I will be right back" (card en: "I'll be right back").
- **Connectors and particles** (`stage-3-connectors-particles`): ไม่ before a verb
  to negate (ผมไม่เข้าใจ); casual sentence-final particles add tone (the unit
  cards label น่ะ as casual emphasis, อ่ะ as soft, เนอะ as sentence-final).
- **Home and places** (`stage-3-home-places`): แอร์ as a loanword from English
  "air" (card note); พัง (broken) kept distinct from เสีย inside แอร์เสีย.
- **Animals** (`stage-3-animals`): the observation that many common animal names
  are short / one-syllable; vocab-only mission, no grammar claim.

Expanding this model to Stages 4-8 is deferred pending owner approval (Stages 1-3
are now done).

## New since May 30: mission intros and recaps (all 96 units)

_Added June 12, 2026._ Each guided mini-unit now opens with a short teaching
intro (`lessonIntro`: you will learn / why it matters / listen for / notice) and
ends with a motivational recap (`missionRecap`: headline + 3-5 achievements).
Stages 1-3 shipped earlier; Stages 4-8 were completed in this pass, so the whole
course now teaches before it tests.

These are English teaching copy drafted around each unit's existing cards. Every
Thai string and phonetic inside them is copied from that unit's own cards or
builder tokens, so there is **no new Thai to verify**. What IS worth a native
pass: the English gloss next to each Thai word, and the small "Listen for" /
"Notice" teaching claims (e.g. which word turns a sentence into a question).
Each per-stage matrix file now has a "Mission intros and recaps" section with the
same guidance. Priority follows the existing stage order (HIGH first).
