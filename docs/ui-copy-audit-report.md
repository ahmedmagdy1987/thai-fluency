# UI Copy Audit Report

Date: May 15, 2026

## Summary

Total UI strings reviewed: 173

Total user-facing strings changed: 90

Files changed:

- `src/components/AchievementToast.jsx`
- `src/components/BrowseTab.jsx`
- `src/components/CardsTab.jsx`
- `src/components/CharacterCoach.jsx`
- `src/components/DemoMode.jsx`
- `src/components/DialoguesView.jsx`
- `src/components/IdiomsSection.jsx`
- `src/components/LeaderboardScreen.jsx`
- `src/components/LearnPath.jsx`
- `src/components/PlacementOnboarding.jsx`
- `src/components/ProfilePage.jsx`
- `src/components/QuestsScreen.jsx`
- `src/components/SettingsModal.jsx`
- `src/components/ShopScreen.jsx`
- `src/components/Stage1CompleteCelebration.jsx`
- `src/components/StageUpToast.jsx`
- `src/components/TodayTab.jsx`
- `src/components/TonesQuizSection.jsx`
- `src/components/TonesSection.jsx`
- `src/components/TopStatsBar.jsx`
- `src/components/auth/AuthGate.jsx`
- `src/components/auth/MigrationPrompt.jsx`
- `src/components/auth/PendingConfirmation.jsx`
- `src/components/auth/SignIn.jsx`
- `src/components/auth/SignUp.jsx`
- `src/components/legal/PrivacyPolicy.jsx`
- `src/components/profile/NotificationSettings.jsx`
- `src/data/stageCharacters.js`
- `src/data/taxonomy.js`
- `src/styles/app.css`

## Audit Table

| Area | Old Copy | New Copy | Reason |
|---|---|---|---|
| Learn continue banner | `Continue · {due} due` | `Continue: {due} due` | Removes separator punctuation and reads better in a compact CTA. |
| Learn continue banner | `Mission {id} · {name}` / `Stage {id} · {name}` | `Mission {id}: {name}` / `Stage {id}: {name}` | Keeps the same metadata without dash-style separators. |
| Learn character subtitle | `with Chang — patient, steady, never forgets a word` | `Guided by Chang. Patient, steady, and ready to help you remember.` | Fixes the screenshot issue and makes the coach copy feel intentional. |
| Learn mission header | `Mission {id} · {name}` | `Mission {id}: {name}` | Cleaner mobile wrapping and no separator punctuation. |
| Learn mission meta | `Stage 1 · Survival Thai` | `Stage 1: Survival Thai` | Cleaner metadata label. |
| Learn mission stats | `{seen}/{total} seen · {mastered}/{total} mastered` | `{seen}/{total} seen` and `{mastered}/{total} mastered` | Removes filler separator and lets stats wrap cleanly. |
| Learn path meta | `{stages} stages · {missions} S1 missions` | `{stages} stages, {missions} Stage 1 missions` | More natural wording for mobile. |
| Learn empty stage | `More cards coming soon` | `More lessons planned` | Avoids generic placeholder phrasing. |
| Learn footnote | `Take your time — practical fluency over speed.` | `Take your time. Practical fluency matters more than speed.` | Removes em dash and improves tone. |
| Character vibes | `patient, steady, never forgets a word` and similar raw vibe fragments | Polished full-sentence coach descriptions | Prevents raw data fragments from appearing in stage and shop cards. |
| Stage descriptions | Short fragments like `Taxis, motorbikes, hotels, airports. Get anywhere.` | Natural descriptions like `Use taxis, motorbikes, hotels, and airports with confidence.` | Makes stage cards sound finished and learner-focused. |
| Mission celebrations | Thai snippets and dash-style celebration text | Short completion messages without dash separators | Keeps celebrations clear without exposing rough placeholder phrasing. |
| Today hero subtitle | `{due} due now · {new} new available` | `{due} due now, {new} new available` | Removes separator and improves reading. |
| Today mission cards | `Mission {id} · {name}` / `Stage {id} · {name}` | `Mission {id}: {name}` / `Stage {id}: {name}` | Consistent card metadata. |
| Today quick start | `{cards} cards · 6 dialogues` | `{cards} cards, 6 dialogues` | Cleaner compact summary. |
| Today tones shortcut | `✓ Passed · try again` | `Passed. Try again` | More readable and avoids compact symbol clutter. |
| Today footer phrase | `โชคดีค่ะ · chôhk dee khâ` | `โชคดีค่ะ (chôhk dee khâ)` | Removes separator while keeping the Thai sign-off. |
| Browse locked stage chip | `Stage {id} · {name} (next)` | `Stage {id}: {name} (next)` | Cleaner locked-stage preview. |
| Browse Stage 1 notice | `Browsing Survival Thai · 150 cards · Stage 2 unlocks...` | `Browsing Survival Thai. 150 cards. Stage 2 unlocks...` | Better mobile wrapping. |
| Browse category hint | `Topic — food, body, time, and more` | `Topics: food, body, time, and more` | Removes em dash and sounds more direct. |
| Browse load more | `Load more · {n} more` | `Load more ({n} more)` | Better button copy. |
| Phonetic fallback labels | `phonetic coming soon` | `phonetic unavailable` | Avoids placeholder wording while accurately describing missing data. |
| Card rerating coach | `Re-rating it — your call.` | `Re-rate it if needed.` | Shorter and less awkward. |
| Skip chip | `I already know this — skip` | `I already know this. Skip` | Removes dash separator and improves readability. |
| Tone guide callout | Thai example separated with an em dash | Thai example followed by a colon | Keeps the teaching content but removes dash-style copy. |
| Tones quiz result | `Need 80% to pass — try again!` | `Need 80% to pass. Try again!` | Cleaner feedback sentence. |
| Tones quiz feedback | `→ {tone} tone` | `Answer: {tone} tone` | More explicit and screen-reader friendly. |
| Top stats tooltips | `Gems — coming soon` / `Hearts — coming soon` | `Gems preview` / `Hearts preview` | Avoids placeholder tooltip phrasing. |
| Shop item notes and disabled button | `Purchases coming soon.` and `Coming soon` | `Not available yet.` or `Earned through milestones.` | Reduces repeated placeholder copy. |
| Shop hero | `A reward shop is on the way` | `Reward shop preview` | Shorter, clearer status. |
| Shop subtitle | `Spend them on power-ups...` | `Power-ups, hearts, and character unlocks are planned.` | Makes preview status explicit without overpromising. |
| Shop character section | `Original art coming soon.` | `Character choices and skins are planned.` | Removes generic placeholder phrasing. |
| Shop character lock | `Unlocks coming soon` | `Preview only` | Clearer status badge. |
| Shop footnote | `No purchases are processed yet. Phase 1 is visual only.` | `Purchases are not available yet.` | Less internal and more user-facing. |
| Quests rewards | `Rewards coming soon` / `Streak rewards coming soon` | `Rewards planned` / `Streak rewards planned` | Cleaner placeholder status. |
| Quests future panel | `Rewards coming soon. Daily practice tracking is available now.` | `Rewards are planned. Daily practice tracking is available now.` | More polished status copy. |
| Settings audio preview | `Preview selected speed` | `Play sample` | Shorter button label. |
| Settings daily goal | `Hit it for a 25 XP bonus` | `Earn a 25 XP bonus when you hit it.` | More natural helper text. |
| Settings streak protection | `Auto-grants every 7 study days.` | `You earn one every 7 study days.` | Less system-like wording. |
| Welcome bullets | Bullet copy joined with em dashes | Short sentence pairs | Better mobile wrapping and more premium tone. |
| Welcome demo link | `Try a quick demo (5 cards) →` | `Try a quick demo (5 cards)` | Removes arrow glyph from text. |
| Sign-up subtitle | `Save progress to the cloud — pick up on any device.` | `Save progress to the cloud and pick up on any device.` | Natural sentence structure. |
| Sign-in recovery CTAs | `Forgot password? →` and related arrow CTAs | CTAs without arrows | Cleaner button text. |
| Pending confirmation CTA | `I confirmed — reload` | `I confirmed. Reload` | Removes dash separator. |
| Migration prompt | `Skip — I want to start fresh` | `Skip. Start fresh` | Shorter and less awkward. |
| Demo completion | `เก่งมาก — gèng mâak` | `เก่งมาก (gèng mâak)` | Keeps Thai while removing separator punctuation. |
| Demo completion subtitle | `path — from Survival Thai...` | `path, from Survival Thai...` | Removes em dash. |
| Demo progress | `Demo · Card 1 of 5` | `Demo: Card 1 of 5` | Clearer compact label. |
| Demo CTA | `Create my account →` / `See what's next →` | `Create my account` / `See what's next` | Removes arrow glyphs from button copy. |
| Placement welcome | `ภาษาไทย · phaa-sǎa thai` | `Thai setup` | Shorter setup heading for American learners. |
| Placement phonetic fallback | `phonetic coming soon` | `phonetic unavailable` | Consistent missing-data copy. |
| Placement recommendation | `We'll start you at the right level — we suggest Stage X.` | `We suggest Stage X.` | Shorter and less mechanical. |
| Placement beginner skip | `I'm a total beginner — start at Stage 1` | `I'm a total beginner. Start at Stage 1` | Removes dash separator. |
| Stage complete modal | `เก่งมาก — gèng mâak` | `เก่งมาก (gèng mâak)` | Keeps Thai while removing separator punctuation. |
| Stage unlock title | `Stage 2 · Daily Essentials` | `Stage 2: Daily Essentials` | Consistent stage metadata. |
| Stage unlock body | `{count} new cards — ...` | `{count} new cards unlocked. ...` | More natural unlock copy. |
| Stage complete CTA | `Let's keep going →` | `Let's keep going` | Cleaner CTA. |
| Achievement milestone | `Keep going — you’re building real Thai fluency.` | `Keep going. You are building real Thai fluency.` | Removes em dash and curly contraction. |
| Coach aria label | `{name} — your Thai coach` | `{name}, your Thai coach` | More natural accessibility label. |
| Leaderboard eyebrow | `Leaderboard · Preview` | `Leaderboard preview` | Cleaner status label. |
| Leaderboard placeholders | `A future learner`, `—`, `— XP` | `Learner preview`, `0`, `0 XP` | Removes placeholder dash copy. |
| Leaderboard privacy note | `Phase 1 keeps everything private.` | `Your profile stays private by default.` | Removes internal roadmap wording. |
| Leaderboard future note | `When leaderboards ship... Display name only — no email...` | `You will choose whether to appear. Display name only. No email or streak data without consent.` | Clearer and less placeholder-like. |
| Profile fallback | `—` | `Not available` | Replaces dash placeholder. |
| Profile delete action | `Coming soon` | `Not available yet` | Clearer disabled state. |
| Notifications status | `On — this device` | `On for this device` | Removes dash separator. |
| Privacy policy provider lines | Provider names separated with em dashes | Provider names followed by colons | Keeps legal meaning while matching copy rule. |
| Privacy policy rights | Rights described with em dashes | Rights described as short sentences | Removes dash-style legal UI copy. |

## Strings Left Unchanged

- Thai learning card content, English meanings, phonetics, romanization, and grammar notes were not edited.
- Tones quiz syllables and tone meanings were left unchanged because they are learning content, not app chrome.
- `Preview` badges were left where they are clear status labels, especially Shop and Leaderboard sections.
- Source comments may still contain arrows or em dashes. They are not user-facing UI copy.

## Notes

- No auth logic, SRS scheduling, rewards logic, OneSignal behavior, database schema, or card data was changed.
- Mobile readability was improved by shortening long subtitles and allowing Learn mission stats to wrap without separator text.
