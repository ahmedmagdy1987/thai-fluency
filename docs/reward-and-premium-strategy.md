# Reward and Premium Strategy

Date: May 26, 2026

## Beta Scope

This sprint adds a motivational layer for the web/PWA beta without adding payments, ads, subscriptions, database entitlements, or real shop purchases.

No Thai card content, SRS scheduling, Challenge answer generation, auth provider configuration, OneSignal app configuration, payments, or ads were changed.

## Mission Complete Rewards

Mission Complete rewards now appear after positive completion moments:

| Moment | Reward surface | XP event | Notes |
| --- | --- | --- | --- |
| Guided first lesson complete | Full-screen Mission Complete reward | 60 XP | Unlocks main app path after completion. |
| Stage 1 mission complete | Full-screen Mission Complete reward | 35 XP | Replaces the small mission toast with a larger reward moment. |
| Mini-unit complete | Full-screen Mission Complete reward | 45 XP | Shows after first completion of that mini-unit. |

The reward screen includes animated XP count-up, progress fill, streak preview, gems preview marked as preview-only, next-step preview, and a Continue button.

## Sound and Motion

The XP count-up uses a generated short Web Audio tick. No new large audio asset was added.

| Setting | Behavior |
| --- | --- |
| Sound effects on | Reward count-up ticks can play during the XP animation. |
| Sound effects off | XP tick and celebration sounds are suppressed by the existing sound helper. |
| Reduced motion | Count-up jumps to the final XP value, confetti is skipped, and reward panel animation is disabled. |

## Tuk Talk Thai Super

`/premium` now exists as a public route under the existing public-page navigation pattern.

Current beta copy presents **Tuk Talk Thai Super** as coming soon only:

- Unlock every lesson path.
- Practice any topic anytime.
- Bonus rewards.
- Early access to phrase packs.
- Remove future ads.
- Support new Thai learning features.

No checkout, subscription, billing, entitlement, or payment claim exists in this sprint.

## Upgrade Prompt Rules

The Super prompt is intentionally limited:

| Rule | Implementation |
| --- | --- |
| Never on first app open | The prompt is only requested after completion or intentional locked-feature taps. |
| Max once per day | Last shown timestamp is stored in `profiles.settings.superPromptLastShownAt` for signed-in users, with localStorage fallback. |
| Positive/intentional moments only | Reward Continue after first lesson, mission, mini-unit, or tapping a locked feature. |
| User control | Close button and Maybe later dismiss the prompt. |
| CTA | See Super opens `/premium`. |

## Locked and Preview Messaging

Visible secondary features now communicate their state more clearly:

| Surface | Message |
| --- | --- |
| First lesson intro | Cards and Challenge unlock after the first lesson; Quests unlock at Level 2. |
| Locked stage path nodes | Progress through the path; Super will unlock this early when it opens. |
| Quests | Reach Level 2 to unlock Quests; Super early access is coming. |
| Shop | Purchases are not available; Super founder offer is coming soon. |
| Leaderboard | Leaderboards require Level 2 and opt-in sharing; Super competitive features are coming. |

Existing users are not permanently blocked by this sprint. Current stage/progress state still drives unlocks.

## Known Limitations

- Super is not purchasable.
- There are no premium entitlements yet.
- Gems remain preview-only in the reward screen.
- Shop purchases, inventory, paid packs, subscriptions, and ads removal are not implemented.
- Upgrade prompt persistence depends on `profiles.settings` for signed-in users; anonymous/demo users use localStorage only.

## Manual QA

Before broad beta promotion, verify:

| Test | Expected Result |
| --- | --- |
| Complete guided first lesson | Reward screen appears, XP counts up, Continue enters the app. |
| Turn Sound effects off, complete a reward event | No XP tick sound plays. |
| Enable reduced motion at OS/browser level | Reward skips motion-heavy effects and still shows final XP. |
| Visit `/premium` logged out | Super coming-soon page loads. |
| Visit `/premium` logged in | Super coming-soon page loads and Back to app works. |
| Tap locked Quests before Level 2 | Clear locked messaging appears; Super prompt does not repeat more than once per day. |
| Open Shop and Leaderboard | Copy clearly says preview/coming soon with no fake purchase flow. |

## Celebration Feedback System (update — May 30, 2026)

A three-level celebration system gives every meaningful action clear,
non-annoying feedback.

**Levels & triggers**

- **Level 1 — `QuestCompleteToast`** (small, auto-dismiss, tiny tick): each
  daily quest transitioning incomplete → complete (Hit daily XP goal, Practice
  10 cards, Review your due cards, Keep your streak alive).
- **Level 2 — `AchievementUnlockedModal`** (centered modal, reward sound,
  Continue): a newly-unlocked achievement. Reuses the existing achievement
  detection/queue; shown one at a time.
- **Level 3 — `CelebrationOverlay`** (confetti, optional XP count-up, CTAs):
  all daily quests complete; a stage completes (stages ≥2; Stage 1 keeps its
  existing dedicated celebration); a **perfect Stage N Challenge**. CTAs point
  forward (Start Stage N+1 / Try Stage N Challenge / Try a Challenge / Continue).

**Repeat prevention** — `src/lib/celebrations.js` + `stats.celebratedIds`
(date-keyed for daily/quest/perfect, durable for stage-complete) +
`celebrationBaselineDone`. A one-time baseline seeds all already-satisfied IDs
so users who met conditions before this feature are never retro-celebrated.
celebratedIds persists in localStorage and mirrors to `profiles.settings`
(union merge) for cross-device dedup. Nothing re-fires on refresh or on
re-opening Quests.

**Sound rules** — `playQuestTick` (L1), `playAchievement` (L2),
`playCelebration` + `playXpTick` (L3). All gated by the Sound effects setting
(OFF → fully silent) and by the first-user-gesture AudioContext guard (no
autoplay warnings). No looping sounds. Reduced motion reduces animation but
still allows sound when Sound effects is ON.

**Premium CTA rules** — a soft, secondary Super line appears only AFTER the
all-quests-complete and perfect-challenge celebrations, at most once per day
(`super-cta:DATE`), never claims payments are active, and never gates the
celebration.

**Known limitations** — cross-device celebration dedup depends on the
`profiles.settings` sync (cloud-authoritative on sign-in); in a rare race a
celebration could re-show once on a brand-new device before the ledger syncs.
A perfect-challenge overlay renders over the in-quiz results screen (intended).
Verified by `node scripts/check-celebrations.mjs` (27 assertions).

## Mini-Unit Sentence Builder XP (update — May 30, 2026)

The guided mini-unit now includes a tap-to-build Sentence Builder step (see
`docs/course-structure-roadmap.md`).

- **Sentence builder completion: +5 XP, once per unit ever.** Guarded by a
  persisted `stats.builderRewardedUnits` list (in `CLOUD_PROFILE_SETTING_KEYS`),
  so replaying or refreshing the unit cannot farm the reward. Awarded in
  `handleMiniUnitProgressChange` the first time `builderComplete` becomes true.
- The existing **mini-unit completion reward (+45 XP, once)** is unchanged, as
  is the streak / today-XP machinery.
- Builder sounds (correct/wrong/celebration) respect the Sound-effects setting;
  the success state can optionally speak the assembled sentence via TTS.
- No premium/Super CTA is attached to the builder; it is a small intrinsic
  reward within the lesson, consistent with the no-fake-purchase rule.

## Course Complete milestone (added May 30, 2026)

The global "Course Complete" reward fires once when a user finishes **every**
guided mini-unit across all 8 stages (derived purely by
`src/lib/courseCompletion.js` from `completedMiniUnits` — no schema change).

- **Celebration:** reuses the shared `CelebrationOverlay` (Level-3) — "Course
  Complete / You completed the Tuk Talk Thai path." with a progress summary
  (stages, mini-units, sentence builders) and a one-time XP count-up.
- **XP reward:** **+250 XP, once.** Guarded by the durable celebration-ledger ID
  `course-complete:v1` (localStorage + `profiles.settings.celebratedIds`) AND a
  per-session arming snapshot, so it can never be replayed or farmed. The +45
  per-unit reward for the final unit still applies; the +250 is a separate bonus.
- **Soft Super line:** "More practice paths and advanced challenges can unlock
  with Tuk Talk Thai Super soon." — shown after the celebration, never gates it,
  and makes no claim that payments are active (consistent with the no-fake-purchase
  rule).
- **Repeat-prevention / fairness:** existing users who were already course-complete
  before this feature are **not** retro-celebrated (arming snapshot + baseline
  seed). Refresh never repeats it.
