# Owner Testing Package

Date: June 12, 2026
Build under test: master `219feb8` (deployed to production; see below)

This package is everything needed to review the current beta without technical
context: what changed, how to open it on web and Android, what to test first,
and how to send feedback. Companion files:

- `docs/owner-beta-test-checklist.md` — the step-by-step test checklist
- `docs/owner-feedback-template.md` — copy-paste feedback form

## Current build summary

Tuk Talk Thai is a speak-first Thai learning app: 8 stages, 96 guided
mini-missions, and 4,700+ words and phrases, with flashcard review, stage
challenges, daily quests, XP and streaks, and celebrations. It runs as a web
app / PWA at https://www.tuktalkthai.com and as an Android debug APK.

## What changed recently (this sprint)

1. **Homepage first impression.** Stronger hero with the mascot front and
   center, a gamified "Mission 1: Say hello" badge, floating phrase bubbles with
   tap-to-hear audio (played through the device's text-to-speech voice), a
   real-numbers stats band (stages / missions / words), a "try the
   demo" shortcut, a more colorful journey roadmap and Learn-Practice-Challenge-
   Win loop, and polish across mobile sizes and dark mode.
2. **Guided teaching through Stage 8.** Every one of the 96 missions now opens
   with a short teaching intro (what you will learn, why it matters, what to
   listen for, what to notice) and ends with a motivating recap of real
   achievements. Stages 1-3 had this already; Stages 4-8 were completed now.
3. **Stage path completion reward.** Finishing the last guided mission of a
   stage now shows a bigger "Stage N Path Complete" celebration screen.
4. **Bonus: Words You Already Know.** An optional gold bonus card on the Learn
   page opens a list of 13 Thai words borrowed from English (taxi, coffee,
   wifi...) with audio. Pure bonus: no XP, not part of the path. The list is
   marked as pending native review inside the app.
5. **Android APK rebuilt** with all of the above.

## How to test on the web

- Production: **https://www.tuktalkthai.com** (deployed from the latest build;
  the homepage should open with the new hero and the mascot on the right).
- Try it both signed out (homepage, demo) and signed in (Learn path).
- For phone testing, open the same URL on your phone browser; "Add to Home
  Screen" gives the app feel.

## How to test on Android

The freshly built debug APK is on the build machine at:

```
android\app\build\outputs\apk\debug\app-debug.apk
```

Two ways to install:

1. With a connected phone (USB debugging on):
   `adb install -r android\app\build\outputs\apk\debug\app-debug.apk`
2. Manual: copy `app-debug.apk` to the phone (drive, chat app, or cable), then
   open it on the phone and allow the install when prompted.

Note: this is a debug build for testing, not the store release. Audio inside
the APK uses the phone's own Thai text-to-speech voice.

## What to test first (the first 10 minutes)

The detailed list is in `docs/owner-beta-test-checklist.md`, but in order of
importance:

1. Open the homepage on your phone. Does it feel exciting within 10 seconds?
2. Tap "Start your first mission" and go through the welcome flow.
3. Do the first lesson: is the explanation clear? Is the quiz fair? Do the
   correct/wrong sounds and the recap feel good?
4. Continue into Stage 1 missions; open a Stage 4+ mission and read its new
   intro and recap.
5. Open the "Words You Already Know" bonus from the Learn page.
6. Try a Challenge round, the Cards review, dark mode, and a small phone if
   available.

## Known limitations (so they do not surprise you)

- All new mission intros/recaps (Stages 4-8) and the 13 borrowed bonus words
  are **pending native-speaker review**; the per-stage review matrices in
  `docs/` list exactly what to check.
- Audio is device text-to-speech, not recorded native audio yet.
- Billing/Super is "coming soon" only; the shop and leaderboard are previews.
- The iOS app does not exist yet (web/PWA works on iPhone).
- Native push notifications in the APK are not wired yet (web push works).

## Ready-to-send owner update (copy-paste)

> Quick update on Tuk Talk Thai. The homepage got a stronger, more playful
> first impression: the mascot now fronts the page, with floating Thai phrase
> bubbles you can tap to hear, a mission badge, and real course numbers. The
> first lesson keeps its guided teaching, and now every mission in the whole
> course (all 8 stages, 96 missions) opens with a short friendly intro and ends
> with a recap of what you achieved, so the app teaches before it tests all the
> way through. There is also a new optional bonus, "Words You Already Know":
> 13 Thai words borrowed from English (taxi, coffee, wifi...) for a quick
> confidence boost; it is clearly marked as pending native review. The web beta
> at https://www.tuktalkthai.com is updated and a fresh Android APK is built
> and ready. Could you spend your first 10 minutes as a brand-new user (phone,
> homepage, first lesson) and tell me what felt exciting, boring, or confusing?
> The feedback template is in the testing package.
