# Guided First Lesson

## What changed

New users who have completed placement but have not completed the first lesson now see a focused guided start instead of the full app navigation. The flow lives in `src/components/FirstLessonFlow.jsx` and does not replace `CardsTab`, `Challenge`, card data, SRS scheduling, rewards, or database schema.

The first-run path is:

1. Intro screen: "Learn your first Thai words"
2. Six beginner flashcards
3. One sentence card
4. Three-question mini challenge
5. Completion screen

After completion, the normal app navigation is revealed and the app shows one short unlock note:

`Cards help you remember. Challenge helps you test yourself.`

## State storage

The persisted flag is:

`firstLessonCompleted`

Storage behavior:

- Signed-in users: synced through `profiles.settings.firstLessonCompleted`.
- Local/demo-capable fallback: included in the existing local `stats` object saved by `localStorage`.
- No database migration was added.
- No new table or column was added.

## Selected card IDs

The lesson uses existing card IDs only:

| Step | Card IDs |
|---|---|
| Beginner flashcards | `3396`, `1`, `1661`, `2`, `2815`, `3254` |
| Sentence | `330` |
| Mini challenge | `3396`, `2815`, `330` |

These are referenced from the existing card data at runtime. Card content was not changed.

## Existing-user protection

Existing active users are protected by marking `firstLessonCompleted` as complete when prior learning activity is detected during stats migration or cloud/local state hydration.

Signals treated as prior activity include:

- Existing progress records
- XP or review counts
- Passed quizzes or tone quiz progress
- Later-stage progress
- Completed dialogues or achievements
- Existing known-card stats

This means active users should continue into the normal app instead of being forced through onboarding.

## Progressive unlock

Before `firstLessonCompleted` is true, the normal `AppShell` is not rendered. That hides the app complexity, including Cards, Challenge, Quests, Shop, Browse, Guide, and Leaderboard navigation, without deleting or changing those features.

After completion:

- `firstLessonCompleted` is saved.
- The route returns to `/learn`.
- The standard navigation is shown.
- The short Cards/Challenge explanation is displayed once for that session.

## Future work

Possible next progressive unlocks:

- Resume support if a user leaves midway through the guided lesson.
- A small post-lesson pointer from Learn to Cards.
- Per-unit completion tracking if guided lessons become a durable learning path.
- More curated first lessons for female voice, travel focus, or absolute-beginner tracks.

Those should still avoid changing SRS scheduling, card content, or Challenge scoring unless explicitly scoped.
