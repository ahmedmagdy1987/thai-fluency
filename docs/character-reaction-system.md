# Character Coach Reaction System

The Tuk Talk Thai lesson flow features a live animated character — the
"coach" — who reacts to the learner's actions. As of this iteration two
characters have real production art: **elephant** (default) and
**muay-thai**. Everything else (gecko, monkey, buffalo, hippo) still
ships with emoji placeholders in the LearnPath stage list, but the
lesson coach itself always falls back to elephant when a stage points at
a no-art character.

## Supported characters (live)

| Id | Display name | Role |
| --- | --- | --- |
| `elephant` | Chang | Default Survival Thai coach — patient, steady, never forgets a word. |
| `muay-thai` | Khun Suk | Travel & mastery coach — disciplined, sharp, pushes you forward. |

## Asset locations

Each character lives under `/public/characters/<id>/` with exactly seven
WebP files (transparent, 1024 × 1024):

```
public/characters/elephant/
  idle.webp
  happy.webp
  thinking.webp
  correct.webp
  wrong.webp
  celebrating.webp
  speaking.webp

public/characters/muay-thai/
  (same seven names)
```

> The implementation reads WebP, not PNG. WebP is universally supported
> in evergreen browsers and is ~30 % smaller than equivalent PNG. If
> you cut new art, please export as WebP.

If a file is missing on disk the `<img>` element's `onError` handler
swaps to that character's `idle` expression. If the whole character id
is unknown, `resolveCharacter(id)` returns `elephant`. The UI never
crashes on missing assets.

## State → expression mapping

The reaction hook drives a coach **state**. Each state maps to one of
the seven expression image files via `STATE_TO_EXPRESSION` in
`src/data/characters.js`:

| State            | Expression file | When it fires |
| ---------------- | --------------- | ------------- |
| `idle`           | `idle.webp`        | Default rest pose — between cards |
| `greeting`       | `happy.webp`       | "Knew it already" skip; can be used on lesson entry |
| `thinking`       | `thinking.webp`    | Once a card is revealed — coach is "evaluating" |
| `choiceSelected` | `thinking.webp`    | Brief "let me check" beat after Reveal |
| `correct`        | `correct.webp`     | Self-rated Good (3) or Easy (4) |
| `wrong`          | `wrong.webp`       | Self-rated Again (1) or Hard (2) |
| `celebrating`    | `celebrating.webp` | Milestone or mission complete (future wire) |
| `speaking`       | `speaking.webp`    | Lesson TTS audio is playing |

Multiple states intentionally share an image — this keeps the art set
small while giving us room to tune nuance via animation/sound without
re-cutting assets.

## Sound profiles

Each character carries a `soundProfile` object describing the notes,
durations, oscillator type, and peak gain used for four reaction
sounds. Profiles live alongside the character definition in
`src/data/characters.js`; the runtime helpers in `src/lib/sounds.js`
look them up by character id:

```
playCharacterSelect(characterId)
playCharacterCorrect(characterId)
playCharacterWrong(characterId)
playCharacterCelebrate(characterId)
```

Sound design intent:

- **Elephant** — warm, rounded, low-mid range, triangle/sine. C5/E5
  for "correct" feels like a gentle "yes."
- **Muay-thai** — brighter, slightly punchier, higher pitch (E5/A5).
  Square wave on the "select" beat gives a martial-arts-mitt snap.

All helpers are wrapped in try/catch and lazy-create the
`AudioContext`. They are silent no-ops if Web Audio is unavailable or
the browser refuses to start the context (no user gesture yet). The
existing `playEasy`, `playMilestone`, `playCelebration` helpers are
untouched.

## Reaction hook (`useCharacterReaction`)

`src/hooks/useCharacterReaction.js` wraps the state machine:

```js
const { state, message, react, setRestingState, isReacting } =
  useCharacterReaction({ characterId, initialState: 'idle' });
```

- `state` — current coach state (idle | thinking | correct | …)
- `message` — current speech bubble copy (string or `null`)
- `react(state, opts?)` — transition into a transient state. Auto-reverts
  to the resting state after `opts.duration` (or a per-state default).
  `opts.message` overrides the auto-picked line; `opts.silent` skips
  the bubble entirely.
- `setRestingState(next)` — change the long-term mood (e.g. shift from
  `idle` to `thinking` once an answer is on screen).

The hook clears the previous timer on each `react()` call, so
back-to-back reactions never pile up. On character change the timer is
cleared and the resting state is restored — moving between stages
won't carry a "wrong face" over.

## Wiring in CardsTab

```
Phase                       react()                  Sound                       Notes
--------------------------- ------------------------ --------------------------- ---------------------------
card shown (face-down)      —                        —                           resting = idle
user taps Show answer       choiceSelected (700ms)   playCharacterSelect()       resting flips to thinking
self-rates Good / Easy      correct (1500ms)         playCharacterCorrect()      Easy also plays existing playEasy()
self-rates Again / Hard     wrong  (1700ms)          playCharacterWrong()        gentle shake + supportive bubble
plays TTS audio             speaking (1800ms)        —                           pulse animation only
"I already know this" skip  greeting (1200ms)        —                           overrides bubble with a custom line
undo last review            thinking (1000ms)        —                           shows revealed card again
```

`celebrating` and `playCharacterCelebrate()` are wired into the
manifest but not yet auto-triggered by Mission/Stage complete toasts.
Those toasts (`MissionCompleteToast`, `StageUpToast`,
`Stage1CompleteCelebration`) already drive their own confetti +
celebration sound; pulling the coach into those toasts is left as a
follow-up so we don't double-up the celebration moment.

## Reduced motion

`@media (prefers-reduced-motion: reduce)` zeros out every coach
animation:

- The idle bob and tilt are disabled.
- The happy/celebrate bounce, wrong shake, and speaking pulse are all
  disabled.
- The bubble's slide/scale-in animation is disabled too — it still
  appears, it just doesn't slide.
- The character art swap still happens (state changes are still
  meaningful), and we add a small opacity dip on "wrong" so the
  feedback isn't entirely silent.

## How to add a future character

1. Export the seven WebPs (square, transparent, ~1024 × 1024).
2. Drop them in `public/characters/<id>/`.
3. Add a `CHARACTERS[<id>]` entry to `src/data/characters.js` with a
   `displayName`, `accentColor`, `soundProfile`, and `lines` arrays.
4. In `src/data/stageCharacters.js`:
   - Set `hasArt: true` on the matching entry.
   - Adjust `STAGE_CHARACTER_MAP` if you want a specific stage to
     route to the new character.
5. The lesson coach will pick the new character up automatically the
   next time the user touches a card in a stage mapped to it.
   No CSS changes are required — the animations are state-driven and
   character-agnostic.

If the new character should also appear in the LearnPath stage badges,
its `placeholderEmoji` keeps the LearnPath happy even without art.

## Limitations

- **No real lipsync.** The `speaking` state is a uniform pulse — we
  don't attempt to time mouth shapes to TTS. This is deliberate (faking
  lipsync would feel uncanny with Thai phonemes from generic TTS).
- **Audio gate.** Web Audio context resumes on first user gesture.
  Until the user taps something, sounds may not play on certain
  browsers — this is expected behaviour, not a bug.
- **Bubble lines are pre-written.** They are static arrays per state.
  No card-specific copy yet (e.g. naming the category). Doable later
  by passing `message` into `react()` from CardsTab.
- **One coach per session phase.** If a SRS queue mixes stages, the
  coach swaps between cards as the stage changes. No fade transition
  between coaches yet.

## Next upgrade path

- Wire `celebrating` into `MissionCompleteToast` / `StageUpToast` /
  `Stage1CompleteCelebration` so the coach shares the moment.
- Add coach to `QuizTab` (multiple-choice flow) — `choiceSelected` is
  a more natural fit there.
- Per-card bubble lines (e.g. food cards trigger food-themed nudges).
- Optional cosmetic skins per character once the shop economy ships.
- User preference: "choose your favourite coach" override that wins
  over the stage mapping.
