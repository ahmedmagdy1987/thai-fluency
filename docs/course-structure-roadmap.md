# Course Structure Roadmap

Date: May 30, 2026

Part of the Course Structure Sprint — making each learning unit feel like a real
guided lesson rather than loose flashcards.

## ✅ Course Structure Sprint COMPLETE — native review is the next required step

All 8 stages now have guided mini-unit paths: **96 mini-units, 752 guided vocab
cards, 83 sentence builders**, validated by `scripts/check-mini-units.mjs` (and the
other check scripts) with the build passing. Per-stage review matrices exist for
Stages 2–8; Stage 1 is documented in this roadmap.

**Next required content-QA step: native / owner review.** The structure is ready,
but the sentence builders and Thai phrasing were auto-derived from existing cards
and need a native speaker to confirm naturalness, tokenization, and meaning before
the content can be called **final**. The review package lives in:

- `docs/native-review-master-checklist.md` — what to review, decisions, priorities.
- `docs/native-review-stage-summary.md` — at-a-glance per-stage table + links.
- `docs/native-review-issues.md` — issue/decision tracker (template + the four
  already-documented medium-confidence items).
- `scripts/report-native-review-coverage.mjs` — read-only coverage report.

**Remaining limitation:** content is **not final** until a native speaker has
approved (or logged fixes for) at least the HIGH-priority stages (1–2) and the
MEDIUM stages (3–5). No Thai card content was changed during the sprint.

## Mini-unit flow (current)

The guided mini-unit (`src/components/MiniUnitFlow.jsx`, launched from the Learn
path "Try guided lesson" card) now runs:

```
intro → vocab cards → sentence card → sentence builder → mini challenge → recap → complete
```

**Why this order (builder before challenge):** the sentence builder directly
reinforces the sentence card the user just saw ("see it, then build it"), while
it is freshest; the mini challenge then tests recognition of the vocabulary. The
alternative (challenge before builder) is also valid; this order was chosen for
the tighter see → build cognitive link. The builder step is **required** before
the unit can complete (Continue appears only after a correct build).

Note: the separate onboarding **first lesson** (`FirstLessonFlow.jsx`, shown
once before the app unlocks) is intentionally left unchanged in this pilot — the
builder ships in the repeatable mini-unit flow only.

## Sentence Builder behavior (pilot)

`src/components/SentenceBuilder.jsx` + pure logic in `src/lib/sentenceBuilder.js`.

- **Tap-to-build (mobile-first, no mouse/drag required):** tap a Thai word tile
  in the bank to place it in the answer row; tap a placed tile to send it back;
  **Clear** resets; **Check** is enabled only when all tiles are placed.
- **Correct:** success state + correct sound + (optional) TTS of the assembled
  sentence + **Continue** (advances the flow, awards XP once).
- **Wrong:** gentle "try a different order" feedback + wrong sound; the user
  keeps rearranging (no harsh penalty, no forced exit).
- **Accessibility:** tiles are real `<button>`s (keyboard Enter/Space); feedback
  uses icon **and** text (never color alone); `aria-live` announces results;
  tiles `flex-wrap` and use ≥44px tap targets; dark mode covered.
- Native HTML5 drag-and-drop is intentionally **deferred** (touch-drag is risky);
  tap-to-build is the shipped, safe interaction.

## Data source

Uses the pilot unit's existing sentence card **330** (`ผมชื่อ ___ ครับ` /
`phǒm chûe ___ khráp` / "My name is ___ (male)"). An explicit `sentenceBuilder`
field on `STAGE_1_MINI_UNIT_PILOT` (`src/data/miniUnits.js`) lists the tokens —
ผม (phǒm), ชื่อ (chûe), the `(your name)` slot, ครับ (khráp) — split on the
card's own space-separated phonetic, with meanings from the app's `WORD_LOOKUP`.
**No Thai card content was changed and no new Thai content was invented**; the
`(your name)` tile is a non-Thai placeholder for the card's existing `___` slot.

## XP / reward rules

- **Sentence builder completion: +5 XP, once per unit ever.** Guarded by a
  persisted `stats.builderRewardedUnits` list, so replay/refresh cannot farm it.
  Awarded in `handleMiniUnitProgressChange` when `builderComplete` first becomes
  true (independent of unit completion).
- **Mission/unit completion reward unchanged** (+45 XP once, via
  `completedMiniUnits`). Streak/today-XP machinery is unchanged.
- Sounds respect the Sound-effects setting; animations are minimal and respect
  reduced motion.

## Persistence / resume

`builderComplete` is part of the mini-unit progress payload (localStorage +
`profiles.settings`). Refreshing during the builder returns the user to the
builder step; once passed, the flow resumes after it. `builderRewardedUnits`
syncs cross-device (in `CLOUD_PROFILE_SETTING_KEYS`).

## Current pilot limitations

- Only the Stage 1 pilot unit (`stage-1-introductions-politeness`) has builder
  data; other/future units skip the builder until they ship `sentenceBuilder`
  data with approved token boundaries.
- Tokens render in male polite form (matching source card 330); voice transform
  is not applied to builder tiles in the pilot.
- Tap-to-build only (no native drag yet).
- The builder must be solved to continue (no skip); kept easy (4 tiles).

## Next steps (expanding to all stages)

1. Add `sentenceBuilder` data to more sentence cards once token boundaries are
   reviewed (the lib + component already generalize to any token set).
2. Optionally derive tokens automatically from the existing `autoBreakdown` /
   `WORD_LOOKUP` breakdown instead of hand-authoring per unit.
3. Consider a "show answer after N tries" assist for longer sentences.
4. Add native drag-and-drop as a progressive enhancement once touch-drag is
   proven on mobile.
5. Apply male/female voice transforms to tiles when builders cover gendered
   sentences.

## Verification

`node scripts/check-sentence-builder.mjs` (18 assertions: data validity, fidelity
to card 330, `isBuilderCorrect`, `shuffleTokens` permutation/anti-pre-solved,
`assembledThai`) passes, alongside the existing celebration/quest/challenge
checks. `npm run build` passes.

## Stage 1 mini-units (expansion — May 30, 2026)

### Stage 1 audit
Stage 1 ("Survival Thai") has **150 cards** across 6 missions (29/26/24/24/28/19),
categorised (pronouns, verbs, grammar, greetings, questions, numbers, time,
adjectives, things, …). There are 13 sentence/phrase cards; **4 are safely
tokenizable** from their own existing content for a sentence builder.

### Units added (`src/data/miniUnits.js`, all existing Stage-1 card ids)
| # | Unit | Topic | Vocab | Sentence | Builder |
| --- | --- | --- | --- | --- | --- |
| 1 | Your first polite introduction | greetings / intro (pilot) | 8 | 330 ผมชื่อ ___ ครับ | ✅ |
| 2 | Greetings and courtesy | hello / thanks / sorry | 7 | 312 ขอบคุณมากครับ | ✅ |
| 3 | Yes, no and easy replies | yes / no / replies | 7 | 313 ไม่เป็นไรครับ | ❌ (see below) |
| 4 | Asking where things are | where / getting around | 8 | 853 ห้องน้ำอยู่ที่ไหนครับ | ✅ |
| 5 | Prices and shopping | how much / money | 8 | 850 อันนี้เท่าไหร่ครับ | ✅ |

`getMiniUnitsForStage(1)` exposes the path; `LearnPath` lists these units (Stage 1
only) and each launches via the existing mini-unit flow. The pilot remains Unit 1.

### Sentence-builder coverage
**4 of 5 units** have a builder. Each builder uses **only the source sentence
card's own tokens** — token phonetics reconstruct the card's phonetic exactly
(ignoring the trailing `?` punctuation the card appends) and each non-blank token
is a real Stage-1 word (ขอบคุณ/2815, มาก/100, ครับ/2, ห้องน้ำ/164, อยู่/11,
ที่ไหน/112, อันนี้/5701, เท่าไหร่/116). **No Thai content was changed or
invented.**

### Skipped / unsafe builder candidates (Stage 1)
- **313 ไม่เป็นไรครับ** (Unit 3): ไม่เป็นไร is a single lexical chunk → only ~2
  safe tiles (ไม่เป็นไร + ครับ), too trivial. Sentence card is shown, builder
  omitted.
- **310 สวัสดีครับ / 314 ขอโทษครับ / 410 เท่าไหร่ครับ**: 1–2 token sentences →
  too short for a meaningful builder.
- **380/853 without the ครับ split, 431 ผมไม่เข้าใจครับ, 5700 ผมพูดภาษาไทยไม่ได้ครับ**:
  longer, but several inner words (เข้าใจ, พูด, ภาษาไทย, ไม่ได้) need careful
  boundary review before tokenizing — deferred to keep the pilot safe.

### Next steps for Stage 2
- Build themed Stage 2 mini-units (food/ordering, flavours/quantities, shopping)
  the same way, using existing Stage 2 cards and their `sentences-food` /
  `sentences-want` sentence cards for builders where safely tokenizable.
- Reuse `scripts/check-mini-units.mjs` (it is stage-agnostic) to validate Stage 2.
- Consider auto-deriving tokens from `WORD_LOOKUP` to scale builder coverage.

### Validation
`node scripts/check-mini-units.mjs` validates unique ids, existing cards, Stage-1
membership, intra-unit duplicates, builder validity, and builder→source-card
fidelity (no invented content). Passes with 0 warnings.

## Stage 1 sequential unlock (update — May 30, 2026)

Stage 1 mini-units now unlock **sequentially** so the path feels like a guided
game, not a free-for-all list.

### Sequence logic (`src/lib/miniUnitSequence.js`)
`getMiniUnitProgressState(units, completedMiniUnits, currentMiniUnitId)` derives,
from the existing `completedMiniUnits` list (no new persisted field, no
migration):

- **Unit 1** is unlocked by default; **Unit N** unlocks when **Unit N-1** is
  completed.
- Exactly **one** incomplete-unlocked unit is `current` (the frontier); units
  after it are `locked`; completed units stay `complete` (reviewable).
- `pathComplete` when all are complete (`currentUnitId` → null).
- Malformed completed ids (null/number/non-array) are filtered safely.
- **Existing users**: `completeFirstLesson` already records the pilot in
  `completedMiniUnits`, so anyone past onboarding sees **Unit 2 unlocked**
  automatically.

### LearnPath UI
Each unit card shows a status badge (**Complete / Current / Locked**) and the
matching action: **Review** ("Completed. Review anytime."), **Start / Continue**
("Continue your path."), or a disabled **Locked** button ("Complete the previous
unit to unlock."). The section header shows `N/5 complete` (or "Stage 1 path
complete"). Locked cards are visually muted with a lock icon; the launch button
is `disabled` so a locked unit cannot be opened.

### Completed / review behavior (no XP farm)
Reviewing a completed unit replays it from the start but **grants no XP**: the
completion (+45) and sentence-builder (+5) rewards are guarded by the persisted
`completedMiniUnits` / `builderRewardedUnits` lists, and `MiniUnitFlow` itself
grants no XP (the mini-challenge only updates a local score; no `reviewOne` /
`markCard`). The completion reward screen does not re-fire on replay.

### Resume behavior
`handleStartMiniUnit` resumes only a genuinely **mid-flow** save of the *same*
unit (step not `intro`/`complete`); a completed unit or a different unit starts
fresh at intro. "Continue" appears only when such mid-flow progress exists. So:
start Unit 2 → leave at the vocab/builder step → refresh → Unit 2 shows
**Continue** and resumes, while Unit 3 stays **Locked**.

### Known limitations
- Sequencing is derived from `completedMiniUnits` (whole-unit granularity); it
  does not gate the legacy mission rail (unchanged).
- A completed unit's review is a full replay from intro (not a dedicated summary
  screen) — acceptable because replay is XP-safe by construction.

### Validation
`node scripts/check-mini-unit-sequence.mjs` covers: Unit 1 unlocked when none
complete, Unit 2 locked until Unit 1 complete, sequential unlock, single
frontier (even on non-sequential sets), all-complete path, malformed-input
safety, Continue-vs-Start, and consistency with the real Stage-1 catalogue.
Passes.

## Stage 2 mini-unit work (next)
Apply the same pattern to Stage 2: themed units from existing Stage 2 cards,
safe sentence-builders from `sentences-food`/`sentences-want` cards where
tokenizable, validated by `check-mini-units.mjs`, with the same sequential
`getMiniUnitProgressState` driving a Stage 2 unit list.

## All-stages expansion (update — May 30, 2026)

The guided mini-unit system now spans **every stage** (18 units total). LearnPath
shows the **current stage's** unit path (`getMiniUnitsForStage(currentStage)`)
with the same sequential unlock, completed/review, and resume behavior.

### Audit by stage (card counts; safe builder candidates found via WORD_LOOKUP breakdown)
| Stage | Cards | Sentence/phrase | Theme (taxonomy) |
| --- | --- | --- | --- |
| 1 | 150 | 13 | Survival Thai |
| 2 | 269 | 72 | Daily Essentials |
| 3 | 423 | 111 | Getting Around |
| 4 | 575 | 151 | Real Conversations |
| 5 | 701 | 184 | Social Confidence |
| 6 | 804 | 210 | Intermediate Power |
| 7 | 877 | 229 | Natural Thai |
| 8 | 992 | 526 | Thai Mastery |

### Mini-units added by stage (all existing card ids; no content changed)
| Stage | Units | Builders | Cards covered |
| --- | --- | --- | --- |
| 1 | 5 (pilot + greetings, yes/no, where, prices) | 4 | 32/150 |
| 2 | Everyday actions · Getting things done | 2 | 16/269 |
| 3 | Daily verbs · Describing things | 2 | 16/423 |
| 4 | Out and about · Tastes and qualities | 2 | 16/575 |
| 5 | Useful verbs · Describing more | 2 | 16/701 |
| 6 | Wants and plans · Health and body | 2 | 14/804 |
| 7 | Food and flavors · More everyday verbs | 2 | 16/877 |
| 8 | Out and about | 1 | 6/992 |

### sentenceBuilder coverage
**17 of 18 units** carry a builder. Every builder's tokens were derived from the
**source sentence card's own phonetic** via the app's `autoBreakdown` /
`WORD_LOOKUP` (so token phonetics reconstruct the card phonetic exactly and each
non-blank tile is a real existing word) — **no Thai was invented**. Examples:
Stage 6 `ผมอยากเรียนภาษาไทย` (I want to learn Thai), Stage 7
`อาหารไทยอร่อยที่สุด` (Thai food is the most delicious).

### Skipped / unsafe builder candidates
- Stage 1 Unit 3 (`ไม่เป็นไรครับ`) — single lexical chunk, kept builder-free.
- Thousands of stage 2-8 sentence cards were **not** tokenized into builders:
  only sentences that produced a fully-clean `autoBreakdown` (no unknown tokens,
  2-5 tiles, phonetic reconstructs) were used. Longer/idiomatic sentences and
  ones with uncertain word boundaries are deferred until reviewed.

### Coverage / known limitations
- Coverage is intentionally **partial** (core themed vocab per stage), not the
  whole deck — each stage gets an initial 1-2 unit path; the rest of the cards
  remain available through Practice and the Stage Challenge.
- Stage 8 ("Thai Mastery") is sentence-heavy with few clean themed word clusters,
  so it gets one lighter "out and about" unit.
- Units render in male polite form (matching source cards); tiles aren't
  voice-transformed.
- Within a stage, units are launchable in unlock order; cross-stage review
  shows only the current stage's path (earlier stages' cards stay in Practice).

### Next steps (native review / content QA)
- Owner/native review of the auto-derived builder token meanings before scaling.
- Add more units per stage and expand coverage once token boundaries are
  reviewed; consider runtime token derivation from `WORD_LOOKUP` to scale.

### Validation
`node scripts/check-mini-units.mjs` now validates **all stages** (existence,
stage match, intra-unit duplicates, builder fidelity, contiguous-stage ordering)
and prints per-stage coverage; `node scripts/check-mini-unit-sequence.mjs`
verifies sequencing for every stage with units. Both pass.

## Stage 2 deepened (update — May 30, 2026)

Stage 2 expanded from **2 units (16 cards)** to **10 units (76 vocab cards)** — a
real guided section, using existing Stage 2 cards only. A native-review matrix
for the owner/native speaker lives at `docs/stage-2-content-review-matrix.md`.

### Stage 2 audit
269 cards. Clean vocab is **verb-heavy (61) and adjective-heavy (45)**; other
themes (food, drinks, numbers, body, health, home, emotions) each have only 2–6
clean cards — the food/shopping cards the taxonomy *names* for Stage 2 mostly
live in later stages. So units group verbs / adjectives / feelings / numbers /
connectors rather than forcing unsupported food/shopping themes.

### Units added (8 new; all existing Stage 2 cards)
Talking and thinking · Out and about · Everyday actions II · Sizes and speeds ·
Skills and qualities · Feelings · Counting · Connectors and questions.

| | Before | After |
| --- | --- | --- |
| Stage 2 units | 2 | 10 |
| Stage 2 vocab covered | 16 / 269 | 76 / 269 |
| Stage 2 sentence builders | 2 | 6 |

### sentenceBuilder coverage / skipped
**6 of 10** Stage 2 units have a builder (all 3-token, derived from the source
card's own phonetic via WORD_LOOKUP). Adjective / number / connector units skip
the builder because their candidate sentences are **2 tokens (too short)** or
have no clean number sentence; ~58 other Stage 2 sentences didn't produce a clean
breakdown and are deferred. All skips are listed in the review matrix.

### Known limitations
- Coverage is 76/269 (core themed vocab); the remaining cards stay available via
  Practice and the Stage Challenge.
- Three verb units share a broad theme (distinct flavors: actions / talking /
  out-and-about) because verbs dominate Stage 2's clean vocab.
- Builder token meanings should get the native-speaker pass via the review matrix
  before scaling further.

### Next recommended stage to expand
**Stage 3** ("Getting Around", 423 cards, 85 adjectives / 83 verbs / 63 things) —
same approach: themed units from existing cards, safe builders only, validated by
`check-mini-units.mjs`, with a Stage 3 review matrix.

## Stage 3 deepened (update — May 30, 2026)

Stage 3 expanded from **2 units (16 cards)** to **12 units (96 vocab cards)** — a
real guided section, using existing Stage 3 cards only. A native-review matrix
for the owner/native speaker lives at `docs/stage-3-content-review-matrix.md`.

### Stage 3 audit
423 cards (306 words, 6 grammar, 111 sentences). Clean vocab is dominated by
single-syllable **verbs (75 free), adjectives (77 free), and "things"/nouns
(63 free)**; the literal "Getting Around" sub-themes the taxonomy names
(transport, directions, hotel, travel verbs) have very few clean cards at this
stage (places = 3, transport nouns ≈ 4). So units group the cleanest, most
teachable cards by theme rather than forcing the travel taxonomy.

### Units added (10 new; all existing Stage 3 cards)
People and family · Everyday verbs I · Everyday verbs II · Everyday verbs III ·
Describing things II · Qualities and states · Time and sequence · Connectors and
particles · Home and places · Animals.

| | Before | After |
| --- | --- | --- |
| Stage 3 units | 2 | 12 |
| Stage 3 vocab covered | 16 / 423 | 96 / 423 |
| Stage 3 sentence builders | 2 | 9 |

### sentenceBuilder coverage / skipped
**9 of 12** Stage 3 units have a builder (all 3-token, derived from the source
card's own phonetic via WORD_LOOKUP, verified against the runtime CARDS). The
Time, Home, and Animals units skip the builder: their candidate sentences are
**2 tokens (too short)**, do not split into known word pieces, or no clean theme
sentence exists. Of Stage 3's 111 sentence cards only 12 produced a clean safe
breakdown; the remaining ~98 are idiomatic / long / female-voice / unknown-inner-
word and are deferred. All skips are listed in the review matrix.

### Known limitations
- Coverage is 96/423 (the cleanest themed vocab); the remaining ~327 cards stay
  available via Practice and the Stage Challenge.
- Three verb units share a broad theme (distinct batches: enter/ride, pour/dig,
  write/sign) because single-syllable verbs dominate Stage 3's clean vocab.
- The "Getting Around" travel taxonomy is only lightly supported by clean Stage 3
  vocab; Home/places and Animals cover what exists.
- Builder token meanings should get the native-speaker pass via the review matrix
  before scaling further.

### Next recommended stage to expand
**Stage 4** ("Real Conversations") — same approach: themed units from existing
Stage 4 cards, safe builders only, validated by `check-mini-units.mjs`, with a
Stage 4 review matrix.

## Stage 4 deepened (update — May 30, 2026)

Stage 4 expanded from **2 units (16 cards)** to **14 units (112 vocab cards)** — a
real guided "Real Conversations" section, using existing Stage 4 cards only. A
native-review matrix lives at `docs/stage-4-content-review-matrix.md`.

### Stage 4 audit
575 cards (420 words, 4 grammar, 151 sentences). Stage 4 is **sentence-rich** and
genuinely conversational: of its 151 sentence cards, **14 produce a clean ≥3-token
breakdown**, so most units carry a real conversational builder (small talk, plans,
getting around, distance, feelings, understanding, leaving). Vocab is verb-heavy
(104 free verbs) plus nouns/adjectives, so two everyday-verb batches and a
describing-states unit group those.

### Units added (12 new; all existing Stage 4 cards)
Small talk & people · Plans & free time · Out and about · Distance & directions ·
Feelings & reactions · Knowing & saying · Everyday verbs I · At home · Everyday
verbs II · Describing states · Leaving & going · Food & dishes.

| | Before | After |
| --- | --- | --- |
| Stage 4 units | 2 | 14 |
| Stage 4 vocab covered | 16 / 575 | 112 / 575 |
| Stage 4 sentence builders | 2 | 12 |

### sentenceBuilder coverage / skipped
**12 of 14** Stage 4 units have a builder (3- and 4-token, derived from the source
card's own phonetic via WORD_LOOKUP, verified against the runtime CARDS). The home
unit shows a relevant sentence (ไฟดับ) without a builder, and food is vocab-only
(no clean food sentence). Four clean leftover sentences (courtesy 870/872/879 and
question 5289) are held back as one-builder-per-unit extras — ready to promote later.
All skips are listed in the review matrix.

### Known limitations
- Coverage is 112/575 (the cleanest conversational vocab); the rest stays in
  Practice and the Stage Challenge.
- Two verb units share a broad theme (distinct batches) and "Knowing & saying"
  leans on some literary speech verbs — flagged for native review.
- Builder token meanings should get the native-speaker pass via the review matrix
  before scaling further.

### Next recommended stage to expand
**Stage 5** ("Social Confidence") — same approach: themed units from existing
Stage 5 cards, safe builders only, validated by `check-mini-units.mjs`, with a
Stage 5 review matrix.

## Stage 5 deepened (update — May 30, 2026)

Stage 5 expanded from **2 units (16 cards)** to **14 units (112 vocab cards)** — a
real guided "Social Confidence" section, using existing Stage 5 cards only. A
native-review matrix lives at `docs/stage-5-content-review-matrix.md`.

### Stage 5 audit
701 cards (510 words, 7 grammar, 184 sentences). Stage 5 is the **most
sentence-rich** stage so far: of its 184 sentence cards, **18 produce a clean
≥3-token breakdown**, and the phrases are squarely social (introductions,
feelings, health, weather, time, food/drink, ordering, requests, compliments,
places, wants, everyday verbs). Vocab is verb-/adjective-/noun-heavy (131/117/110
free cards).

### Units added (12 new; all existing Stage 5 cards)
Family & people · Emotions & feelings · Health & the body · Weather & seasons ·
Days & time · Food & drink · Ordering & money · Asking & giving · Compliments &
praise · Around town · Wants & plans · Everyday social verbs.

| | Before | After |
| --- | --- | --- |
| Stage 5 units | 2 | 14 |
| Stage 5 vocab covered | 16 / 701 | 112 / 701 |
| Stage 5 sentence builders | 2 | 14 |

### sentenceBuilder coverage / skipped
**All 14** Stage 5 units have a builder (3- and 4-token, derived from the source
card's own phonetic via WORD_LOOKUP, verified against the runtime CARDS) — the
richest builder coverage of any stage, because Stage 5's sentence cards are so
conversational. Six clean leftover sentences (801/802/820/842/849/915) are held
back as one-builder-per-unit extras — ready to promote later. All skips are
listed in the review matrix.

### Known limitations
- Coverage is 112/701 (the cleanest social vocab); the rest stays in Practice and
  the Stage Challenge.
- Some planning/speech verbs are formal (กำหนด schedule, เลื่อน postpone, ตรัส
  speak) — flagged for native review in the matrix.
- Builder token meanings should get the native-speaker pass via the review matrix
  before scaling further.

### Next recommended stage to expand
**Stage 6** ("Intermediate Power") — same approach: themed units from existing
Stage 6 cards, safe builders only, validated by `check-mini-units.mjs`, with a
Stage 6 review matrix.

## Stage 6 deepened (update — May 30, 2026)

Stage 6 expanded from **2 units (14 cards)** to **14 units (110 vocab cards)** — a
real guided "Intermediate Power" section, using existing Stage 6 cards only. A
native-review matrix lives at `docs/stage-6-content-review-matrix.md`.

### Stage 6 audit
804 cards (593 words, 1 grammar, 210 sentences). Concept-heavy: words are
dominated by **"things"/nouns (158), verbs (133), adjectives (105)**. Of 210
sentence cards, **13 produce a clean ≥3-token breakdown**, and the clean ones are
squarely intermediate (wants, restaurant requests, scheduling/appointments,
farewells, past-tense narration, well-wishing, allergies) — several are longer
4-/5-token lines.

### Units added (12 new; all existing Stage 6 cards)
People & family · Days & dates · Times & waiting · At a restaurant · Rest & home ·
Out in town · Banking & paperwork · Emotions & moods · Learning & ability ·
Everyday verbs · Explaining & confirming · Describing qualities.

| | Before | After |
| --- | --- | --- |
| Stage 6 units | 2 | 14 |
| Stage 6 vocab covered | 14 / 804 | 110 / 804 |
| Stage 6 sentence builders | 2 | 13 |

### sentenceBuilder coverage / skipped
**13 of 14** Stage 6 units have a builder (3- to 5-token, derived from the source
card's own phonetic via WORD_LOOKUP, verified against the runtime CARDS). The
"Describing qualities" adjectives unit is vocab-only (Stage 6's clean adjective
sentences are 2-token or idiomatic). Two clean leftover sentences (877 "sorry I'm
late", 1534 "allergic to this") are held back as one-builder-per-unit extras. All
skips are listed in the review matrix.

### Known limitations
- Coverage is 110/804 (the cleanest themed vocab); the rest stays in Practice and
  the Stage Challenge.
- "Explaining and confirming" pairs a request builder ("may I have some more") with
  communication verbs — flagged medium for native review in the matrix.
- Builder token meanings should get the native-speaker pass via the review matrix
  before scaling further.

### Next recommended stage to expand
**Stage 7** ("Natural Thai") — same approach: themed units from existing Stage 7
cards, safe builders only, validated by `check-mini-units.mjs`, with a Stage 7
review matrix.

## Stage 7 deepened (update — May 30, 2026)

Stage 7 expanded from **2 units (16 cards)** to **14 units (112 vocab cards)** — a
real guided "Natural Thai" section, using existing Stage 7 cards only. A
native-review matrix lives at `docs/stage-7-content-review-matrix.md`.

### Stage 7 audit
877 cards (648 words, 229 sentences). The most **sentence-rich** stage in the
course: of 229 sentence cards, **12 produce a clean ≥3-token breakdown**, and the
clean ones are exactly the natural real-life lines the stage is named for — taxi/
getting-around, communication, social, scheduling, dining — several are long
5-/6-token sentences. Words are dominated by "things" (204), verbs (119),
adjectives (110).

### Units added (12 new; all existing Stage 7 cards)
Places around town · Directions & position · Talking & discussing · Meeting
people · Conversation flow · Feelings & reactions · Plans & times of day · Days &
schedule · Dining out · Everyday actions · Describing things · Nature & outdoors.

| | Before | After |
| --- | --- | --- |
| Stage 7 units | 2 | 14 |
| Stage 7 vocab covered | 16 / 877 | 112 / 877 |
| Stage 7 sentence builders | 2 | 12 |

### sentenceBuilder coverage / skipped
**12 of 14** Stage 7 units have a builder (3- to 6-token, derived from the source
card's own phonetic via WORD_LOOKUP, verified against the runtime CARDS),
including long natural lines like "Can you take me here?" (6-token) and "You speak
English very well" (5-token). The "Describing things" and "Nature and outdoors"
units are vocab-only (no clean tokenizable sentence). Two clean leftover sentences
(874 "speak slowly", 933 "wait here") are held back as one-builder-per-unit
extras. All skips are listed in the review matrix.

### Known limitations
- Coverage is 112/877 (the cleanest natural-conversation vocab); the rest stays in
  Practice and the Stage Challenge.
- "Feelings & reactions" and "Everyday actions" pair a social/taxi builder with
  themed vocab — flagged medium for native review in the matrix.
- Builder token meanings should get the native-speaker pass via the review matrix
  before scaling further.

### Next recommended stage to expand
**Stage 8** ("Thai Mastery") — the final stage. Same approach: themed units from
existing Stage 8 cards, safe builders only, validated by `check-mini-units.mjs`,
with a Stage 8 review matrix. Completing Stage 8 finishes the full 8-stage guided
path.

## Stage 8 deepened — Course Structure Sprint COMPLETE (update — May 30, 2026)

Stage 8 expanded from **1 unit (6 cards)** to **13 units (102 vocab cards)** — a
real guided "Thai Mastery" section, using existing Stage 8 cards only. A
native-review matrix lives at `docs/stage-8-content-review-matrix.md`. **This
completes the Course Structure Sprint: all 8 stages now have guided mini-unit
paths.**

### Stage 8 audit
992 cards (466 words, 237 phrases, 289 sentences). The largest and most
**sentence-rich** stage: of its 526 sentence/phrase cards, **33 produce a clean
≥3-token breakdown** (more than any other stage). Clean sentences span the full
mastery range — introductions, languages, restaurant, taxi, getting lost,
shopping, preferences, travel plans, feelings about Thailand. Words dominated by
"things" (189), adjectives (72), verbs (60).

### Units added (12 new; all existing Stage 8 cards)
People & family · Everyone & no one · Months of the year · Days & when · Places
in town · Directions & distance · Travel & activities · Connectors & nuance ·
Home & documents · Decisions & opinions · Likes & impressions · Society & ideas.

| | Before | After |
| --- | --- | --- |
| Stage 8 units | 1 | 13 |
| Stage 8 vocab covered | 6 / 992 | 102 / 992 |
| Stage 8 sentence builders | 1 | 13 |

### sentenceBuilder coverage / skipped
**All 13** Stage 8 units have a builder (3- to 5-token, derived from the source
card's own phonetic via WORD_LOOKUP, verified against the runtime CARDS). Stage 8
has ~25 distinct clean builders beyond the 12 used (restaurant, languages,
shopping lines) — held back as one-builder-per-unit extras, ready to promote. All
skips are listed in the review matrix.

### All-stage guided path summary
| Stage | Units | Vocab covered | Builders |
| --- | --- | --- | --- |
| 1 | 5 | 32 / 150 | 4 |
| 2 | 10 | 76 / 269 | 6 |
| 3 | 12 | 96 / 423 | 9 |
| 4 | 14 | 112 / 575 | 12 |
| 5 | 14 | 112 / 701 | 14 |
| 6 | 14 | 110 / 804 | 13 |
| 7 | 14 | 112 / 877 | 12 |
| 8 | 13 | 102 / 992 | 13 |
| **Total** | **96** | **752** | **83** |

### Course-complete state ✅ (shipped May 30, 2026)
Both completion states now exist:
- **Per-stage:** `pathComplete` → LearnPath shows "Stage N path complete".
- **Global course-complete:** `src/lib/courseCompletion.js` `getCourseCompletion()`
  derives `courseComplete` (every guided mini-unit done) purely from
  `completedMiniUnits` (no schema). When it transitions false→true:
  - a one-time **"Course Complete"** `CelebrationOverlay` fires ("You completed the
    Tuk Talk Thai path.") with a stages/units/builders summary and **+250 XP**;
  - LearnPath shows a persistent **"Course path complete"** banner with Review /
    Challenge CTAs, while keeping the stage/unit path visible for review.
  - **Repeat-prevention:** durable ledger ID `course-complete:v1` (localStorage +
    `profiles.settings.celebratedIds`) plus a per-session arming snapshot, so it
    fires once, never on refresh, and never retro-fires for users who were already
    complete before this feature. Validated by `scripts/check-course-completion.mjs`.

### Known limitations
- Coverage is 752 / ~4,790 cards (the cleanest themed vocab per stage); the rest
  stays in Practice and the Stage Challenge by design.
- A few units pair a conversational builder with a themed vocab set not literally
  about the sentence (flagged medium): S6 "Explaining & confirming", S7 "Feelings
  & reactions" / "Everyday actions", S8 "Decisions & opinions".
- All 96 units' builders want a native-speaker pass via the eight
  `docs/stage-N-content-review-matrix.md` files before scaling further.

### Next steps (post-sprint)
- Native-speaker review pass across the eight matrices.
- Optional: a global course-complete celebration when all 8 stage paths finish.
- Optional: deepen any stage further (Stage 8 has ~20 unused clean builders).

## First-lesson pedagogy pilot (June 8, 2026)

Stage 1 Mission 1 (`stage-1-introductions-politeness`) is now a pedagogy pilot:
a short Thai Basics Primer + a 5-question quick check before the first cards, a
motivational mission recap, soft correct/wrong feedback, and male-default voice
preference. The unit carries new **optional** metadata — `lessonPrimer`,
`pedagogyQuiz`, `missionRecap` — read by `FirstLessonFlow`. See
`docs/first-lesson-pedagogy-notes.md`.

Extensibility (future work, intentionally NOT done in this sprint): the same
metadata shape can be filled for other missions, plus stage-level recaps,
cultural notes, and a borrowed-English-word bonus. A user-facing female speaker
mode and re-opening the primer from Guide/Help are also deferred.

## Stage 1 mission intros + recaps (June 8, 2026)

Sprint 2 extended the guided-teaching style to all of Stage 1 (Stage 1 only):
- Every Stage 1 mini-unit gained a short `lessonIntro` (shown before the cards in
  `MiniUnitFlow`) and the 4 non-pilot units gained a `missionRecap` (shown on
  completion). Data lives on each unit in `src/data/miniUnits.js`; rendering is in
  `MiniUnitFlow`. Mission 1's pilot first-run is unchanged.
- The Thai Basics primer is now re-openable from an "Open Thai basics" modal on
  the Learn path (shared `ThaiBasicsPrimer` component) — the earlier deferred
  limitation is resolved.

**Deferred (needs owner approval before starting):** applying the same
`lessonIntro` / `missionRecap` model to Stages 2-8, plus stage-level recaps and
cultural notes. The shared component + generic metadata keep that additive.
