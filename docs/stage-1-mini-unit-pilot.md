# Stage 1 Mini-Unit Pilot

Date: 2026-05-20

## Topic

Your first polite introduction.

The pilot teaches a first-exchange pattern: say hello, introduce yourself, recognize yes/no, and use polite basics. It is intentionally narrow so a new learner sees one path instead of choosing between the whole app.

## Data Config

The pilot is defined in `src/data/miniUnits.js` as `STAGE_1_MINI_UNIT_PILOT`.

Required fields now present:

- `unitId`
- `stageId`
- `missionId`
- `title`
- `subtitle`
- `estimatedMinutes`
- `characterId`
- `vocabCardIds`
- `sentenceCardId`
- `challengeCardIds`
- `recapText`
- `previewText`
- `unlockMessage`

## Selected Card IDs

Vocabulary cards:

| Card ID | Role in unit |
|---|---|
| `3396` | Hello / goodbye greeting |
| `1` | I / me |
| `1661` | Name |
| `2` | Polite particle |
| `3` | You |
| `251` | Yes / correct |
| `250` | No / not |
| `2815` | Thank you |

Sentence card:

| Card ID | Role in unit |
|---|---|
| `330` | Target sentence: "My name is ___ (male)." |

Challenge cards:

`3396`, `330`, `251`

## Why These Cards

The cards belong to a coherent beginner topic: greetings and polite introductions. The set includes the exact building blocks for the intro sentence plus a few practical exchange words so the lesson feels usable immediately.

No card content was changed and no new Thai content was invented.

## Sentence Card

Sentence card `330` exists and is used.

If a future mini-unit has no suitable sentence card, that gap should be documented in the mini-unit report or dev notes. The user-facing lesson should skip awkward missing-content copy and continue to the challenge.

## 75% Cards / 25% Challenge

The pilot uses:

- 8 vocabulary flashcard steps
- 1 sentence flashcard step
- 3 local challenge questions

That gives 9 card-learning steps and 3 challenge checks, matching the intended 75/25 learning model.

## Implemented Now

- Stage 1 mini-unit config in `src/data/miniUnits.js`.
- First-time guided lesson now reads from the mini-unit config instead of hard-coded card IDs.
- Regular Learn screen still exposes the guided mini-unit pilot for Stage 1 users.
- Vocab card flow uses one card at a time.
- Sentence step uses existing sentence card `330`.
- Challenge step uses a lightweight local 3-question challenge and does not modify global Challenge scoring.
- Completion copy says: "Nice! You learned your first Thai words and sentence."
- First-time completion unlocks the normal app navigation.
- Post-completion guidance says: "Cards help you remember. Challenge helps you test yourself. Learn keeps you moving forward."

## Intentionally Deferred

- SRS scheduling updates from mini-unit practice.
- Supabase persistence for per-mini-unit progress.
- Database migrations.
- Card content changes.
- Full Stage 1 curriculum.
- Rewards economy changes.
- Analytics and fluency-hours tracking.

## Future Drag-And-Drop Sentence Builder

The config still includes:

```js
futureDragDropSentence: {
  sourceCardId: 330,
  status: 'deferred',
  note: 'Use approved Thai token boundaries before enabling drag-and-drop.',
}
```

The safe next step is to add reviewed token metadata for sentence card `330`. A future `SentenceBuilder` component can then let learners arrange the sentence pieces without changing the source card text.

## Future Mini-Lessons Between Units

Short mini-lessons can sit between guided units to explain grammar or cultural context after the learner has seen examples. For this pilot, good candidates are:

- Why polite particles matter
- How "I", "you", and "name" combine in introductions
- The difference between "yes/correct" and "no/not"

Those mini-lessons should stay short and should not become a second navigation layer for new users.
