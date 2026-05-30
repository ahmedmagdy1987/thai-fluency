# Course Structure Roadmap

Date: May 30, 2026

Part of the Course Structure Sprint — making each learning unit feel like a real
guided lesson rather than loose flashcards.

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
