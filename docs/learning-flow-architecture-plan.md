# Learning Flow Architecture Plan

Date: 2026-05-16

Goal: combine the current Cards/SRS strength with lightweight interactive challenges without replacing the existing review system.

## Principles

- Cards/SRS remains the source of long-term memory scheduling.
- Challenge remains separate from CardsTab and does not mutate SRS progress directly.
- Mini-units should be an orchestration layer above existing cards, not a rewrite of card storage.
- New interaction types should reference existing card IDs where possible.
- Content changes should be authored and reviewed separately; do not generate Thai guesses in code.

## How To Combine Cards/SRS With Challenge Safely

Keep these responsibilities separate:

- `CardsTab`: due/new SRS reviews, reveal, rating, undo, and SRS state writes.
- `QuizTab`: multiple-choice practice against unlocked cards, XP/stat rewards only.
- Future `UnitSession`: a guided path that selects existing cards and sends the user to a short sequence.

The safe architecture is:

1. Add a `miniUnits` data module that contains metadata and existing card IDs.
2. Add a `UnitSession` component that reads a unit and presents steps.
3. For vocabulary and sentence steps, reuse card display components or route users into CardsTab-like review UI without changing SRS scheduling.
4. For challenge steps, reuse QuizTab logic or extract shared question builders into a small helper.
5. Store unit completion separately from SRS progress when persistence is needed.

Do not make Challenge ratings affect SRS intervals unless the owner explicitly approves that product rule.

## Proposed 75/25 Flow

A 10-minute learning block should be roughly:

- 7 to 8 minutes of SRS-style cards and recall.
- 2 to 3 minutes of interactive challenge.

Suggested sequence:

1. Warm-up review: 2 to 4 due cards.
2. New vocabulary: 6 to 10 new cards from the unit.
3. Sentence flashcard: one sentence that uses the unit vocabulary.
4. Multiple-choice check: one or two questions.
5. Sentence builder: one drag-and-drop reconstruction later.
6. Wrap: short feedback, XP, and next-step CTA.

Daily flow can still prioritize due SRS first. If due cards are high, the app should recommend review before new unit work.

## Proposed Mini-Unit Data Model

Start with a static file such as `src/data/miniUnits.js`:

```js
export const MINI_UNITS = [
  {
    id: 's1-m1-greetings-basic',
    stage: 1,
    mission: 1,
    title: 'Basic greetings',
    targetMinutes: 10,
    vocabCardIds: [310, 312, 313, 314, 1273, 5702],
    sentenceCardId: 5703,
    challengeCardIds: [310, 312, 5703],
    builder: {
      sourceCardId: 5703,
      tokenMode: 'thai-word',
    },
    lesson: {
      recapId: 's1-m1-greetings-recap',
      previewId: 's1-m2-food-preview',
    },
  },
];
```

Rules:

- Use existing card IDs only in the first phase.
- Keep authored lesson copy outside card data.
- Let SRS progress remain keyed by card ID.
- Let unit completion be keyed by unit ID.
- Add database persistence only after the static local model is proven.

## Grouping Words Into Coherent 10-Minute Units

Unit grouping should optimize for usefulness, not category purity.

Recommended grouping criteria:

- One practical situation, such as greeting, ordering, taxi, hotel, prices, help, time.
- 6 to 10 vocabulary cards that naturally appear in one useful sentence or exchange.
- One sentence card that combines at least 2 to 4 of the vocabulary cards.
- Avoid mixing multiple hard grammar ideas in the same unit.
- Keep pronunciation load manageable: do not introduce too many new tone patterns at once.
- Prefer cards already assigned to the same stage and mission.

Quality checks:

- The target sentence must be something the learner would actually say.
- Each vocabulary card should have a clear reason to be in the unit.
- If no existing sentence card fits, create a content issue for later instead of guessing Thai.

## Adding Sentence Cards

Sentence cards should stay in the normal card dataset after content review. The unit layer should only reference them.

Safe process:

1. Identify the desired target sentence in English.
2. Check whether a matching existing sentence card exists.
3. If not, create a content request for native review.
4. After approval, add the sentence card in a separate content pass.
5. Reference the approved sentence card from the unit file.

Do not generate Thai sentence content inside the unit feature work.

## Drag-And-Drop Sentence Builder Later

Add this as a new component after the unit layer exists:

```txt
SentenceBuilder
  props:
    card
    tokenMode: 'thai-word' | 'phonetic-word'
    audioRate
    onComplete(correct)
```

Behavior:

- Uses the sentence card's Thai text and approved tokenization.
- Presents shuffled tokens.
- Lets the user assemble the sentence.
- Plays TTS only when the user taps a pronunciation control or completes the sentence.
- Awards challenge XP but does not modify SRS intervals.

Data needs:

- Approved token boundaries for Thai sentence cards.
- Optional distractor tokens only after content review.
- Accessibility support for keyboard and screen readers.

## Mini-Lessons Between Units

Mini-lessons should be short and text-only at first:

- Paragraph 1: recap what was just learned.
- Paragraph 2: preview what comes next.

Suggested data model:

```js
export const MINI_LESSONS = {
  's1-m1-greetings-recap': {
    title: 'You can start a polite exchange',
    recap: '...',
    preview: '...',
  },
};
```

Insertion points:

- After a unit completion.
- After a mission completion.
- Before a stage transition.

Keep this separate from card content so copy edits do not risk SRS data.

## Thai Sounds And Script Phase 1

The current Guide has tones and pronunciation. The first Sounds & Script phase should add a dedicated learning area without replacing Guide:

1. Consonant overview: classes, common consonants, and sound traps.
2. Vowel overview: short vs long vowels and common vowel shapes.
3. Tone rules primer: class, live/dead syllables, tone marks.
4. Listening drills: identify tone or sound contrast.
5. Script recognition cards: optional, separate from speaking-first SRS.

Use static reference data first. Add persistent mastery only after the content and UX are stable.

## Voice Recognition Future Architecture

Leave a boundary for future speech recognition:

- `SpeechPractice` component for microphone UI and scoring.
- `speechProvider` interface for browser Web Speech API or a paid provider.
- Explicit consent before microphone access.
- No speech uploads unless privacy policy and provider terms are reviewed.
- Store only coarse practice results at first, not raw audio.

Do not build this until pronunciation lessons and target phrases are finalized.

## Recommended Rollout Phases

Phase 1: Stabilize current app
- Complete Challenge audio safety fixes.
- Add sound-effects toggle.
- Keep Cards/SRS untouched.
- Document the roadmap.

Phase 2: Static mini-unit pilot
- Add `miniUnits` metadata for one Stage 1 mission using existing card IDs.
- Add a UnitSession shell that links to current Cards and Challenge behaviors.
- No DB migration.

Phase 3: Unit-aware Challenge
- Extract question builder helpers from QuizTab.
- Add per-unit multiple-choice questions.
- Keep standalone Challenge tab.

Phase 4: Sentence builder
- Add approved tokenization metadata.
- Implement drag-and-drop builder with keyboard support.
- Award XP only; do not affect SRS intervals.

Phase 5: Mini-lessons and Sounds & Script
- Add text mini-lessons between units.
- Add first Thai Sounds & Script area from static reference data.

Phase 6: Persistence and analytics
- Add unit completion persistence only after local behavior is proven.
- Add analytics for time-on-task and completion rate.
- Revisit fluency-hours calculation after reliable activity data exists.
