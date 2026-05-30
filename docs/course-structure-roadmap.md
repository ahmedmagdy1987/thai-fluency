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
