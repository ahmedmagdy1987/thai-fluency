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
