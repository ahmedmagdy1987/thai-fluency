# Stage 1 Mini-Unit Pilot

Date: 2026-05-16

## Topic

Introductions and polite basics.

This pilot proves a short 10-minute flow that combines mostly card-style recall with a small Challenge block. It does not replace CardsTab, does not update SRS scheduling, and does not write mini-unit progress to Supabase.

## Selected Card IDs

Vocabulary cards:

| Card ID | Type | Role in unit |
|---|---|---|
| 1 | word | "I / me" for the intro sentence. |
| 2 | word | Polite particle for the intro sentence. |
| 1661 | word | "name" for the intro sentence. |
| 3396 | word | General hello/goodbye greeting. |
| 2815 | word | Thanks. |
| 3254 | word | Sorry. |
| 5361 | word | No problem / you're welcome. |
| 5702 | word | See you. |

Sentence card:

| Card ID | Type | Role in unit |
|---|---|---|
| 330 | phrase | Target sentence: "My name is ___ (male)." |

Challenge cards:

`[1, 2, 1661, 3396, 330, 2815, 3254, 5361, 5702]`

## Why These Cards Were Chosen

The unit has one practical situation: a first polite exchange. The first three vocabulary cards directly support the target sentence. The remaining greeting and politeness cards give the learner enough context for a simple first interaction: say hello, introduce yourself, thank someone, apologize, respond politely, and say goodbye.

The selected cards already exist in Stage 1. No new Thai content was created.

## Sentence Built Toward

The unit builds toward existing card `330`: "My name is ___ (male)."

This sentence directly uses the ideas from cards `1`, `2`, and `1661`. It also fits naturally after the greeting card `3396`.

## Implemented Now

- Static mini-unit config in `src/data/miniUnits.js`.
- Learn-screen entry card for the Stage 1 pilot.
- Guided mini-unit flow in `src/components/MiniUnitFlow.jsx`.
- Vocab step with card-style reveal and TTS pronunciation button.
- Sentence step using existing sentence card `330`.
- Local mini Challenge using the same related cards.
- English-to-Thai challenge prompts do not include prompt speaker audio.
- Tapping Thai options plays that option's Thai pronunciation.
- Correct/wrong feedback sounds use the existing sound helpers, so the master sound toggle applies.
- Recap and preview text blocks.
- Completion screen.

## Intentionally Deferred

- SRS scheduling updates from mini-unit practice.
- Supabase persistence for mini-unit progress.
- Database migrations.
- New card content.
- Full unit curriculum.
- Drag-and-drop sentence builder.
- Analytics and fluency-hours calculations.
- Rewards economy, payments, ads, and app-store work.

## How This Becomes The 75/25 Flow Later

This pilot uses the intended shape:

1. Most of the time is card-style learning and recall: 8 vocabulary cards plus 1 sentence card.
2. A smaller portion is interactive Challenge: 5 local multiple-choice questions.
3. Completion includes a short recap and preview.

Later, a unit session composer can choose due SRS reviews first, then introduce new unit cards, then run one or two Challenge interactions. CardsTab should remain the long-term memory engine; mini-units should orchestrate existing cards instead of replacing the SRS model.

## Future Drag-And-Drop Plan

The config includes:

```js
futureDragDropSentence: {
  sourceCardId: 330,
  status: 'deferred',
  note: 'Use approved Thai token boundaries before enabling drag-and-drop.',
}
```

The next safe step is to add approved token boundaries for card `330` in a separate metadata file. After that, a `SentenceBuilder` component can present shuffled tokens, let the learner assemble the sentence, and award Challenge-style XP without changing SRS intervals.
