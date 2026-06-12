# Owner Testing Package

Date: June 12, 2026
Build under test: master (owner review feedback sprint; deployed to production, see below)

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

This sprint implements the feedback from your review video:

1. **Flashcards are English first by default.** A new card sees the English
   meaning on the front ("How do I say hello in Thai?") and reveals the Thai
   answer, romanization first. A compact toggle on the card screens (and in
   Settings) switches between "English first" and "Thai first" anytime. Your
   choice is saved and syncs to your account.
2. **The demo now shows the real product.** The quick demo at /demo walks
   through three smart flashcards with the real rating buttons (Again / Hard /
   Good / Easy) and explains that your answer decides when a card returns,
   then a multiple-choice quick check, then a mini-lesson preview. It still
   needs no account and writes no progress.
3. **Homepage explains how the app works.** A new "How it works" section shows
   product-style examples of a smart flashcard (with the rating buttons and the
   English first / Thai first toggle), a quick check, and a mini lesson, with
   real course numbers. The journey section is now labeled "Your first stages"
   and explains that each stage is a set of short, guided missions.
4. **Beginner guidance is romanization first.** The first-lesson primer, primer
   quiz, Stage 1 mission intros and recaps, and onboarding labels now lead with
   romanized Thai (khrap, kha, phom) and keep Thai script secondary in
   parentheses. Source flashcard content is unchanged.
5. **Audio tuned slower and more reliable.** Audio still uses the device
   text-to-speech voice, and is now tuned slower for beginner review (the demo
   and first lesson are slightly slower again). Playback start was hardened to
   reduce the clipped first syllable.
6. **Stage vs mission wording cleaned up.** Everywhere user-facing: 8 stages,
   96 guided missions, each stage contains several missions. The Learn page
   rail is now titled "Stage N missions".

Previous sprint highlights (still in this build): guided teaching intros and
recaps for all 96 missions, the "Stage N Path Complete" celebration, and the
optional "Words You Already Know" bonus (13 borrowed words, pending native
review).

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

1. Open the homepage on your phone. Does the new "How it works" section make
   the product obvious within 10 seconds?
2. Run the quick demo (no account): flip a card English-first, use the rating
   buttons, try the quick check and the mini-lesson preview.
3. Tap "Start your first mission" and go through the welcome flow. Check that
   cards show English first and the toggle flips them.
4. Do the first lesson: is the romanization-first explanation clear? Is the
   audio pace comfortable, with no clipped first syllable?
5. Continue into Stage 1 missions; read an intro and recap.
6. Try a Challenge round, the Cards review (rating buttons), dark mode, and a
   small phone if available.

## Known limitations (so they do not surprise you)

- All new mission intros/recaps (Stages 4-8) and the 13 borrowed bonus words
  are **pending native-speaker review**; the per-stage review matrices in
  `docs/` list exactly what to check.
- Audio uses the device text-to-speech voice and is tuned slower for beginner
  review. It is not recorded human audio yet.
- Stage 2-8 mission intros and recaps still show Thai script with English
  glosses; the romanization-first rewrite covers Stage 1 and all beginner
  guidance first. The rest is a planned bulk pass.
- Billing/Super is "coming soon" only; the shop and leaderboard are previews.
- An installable iPhone build still requires Mac/TestFlight signing (web/PWA
  works on iPhone today).
- Native push notifications in the APK are not wired yet (web push works).

## Ready-to-send owner update (copy-paste)

> Quick update on Tuk Talk Thai, based on your review video. Flashcards are now
> English first by default (see the meaning, recall the Thai), with a toggle to
> switch back to Thai first anytime. The quick demo now shows the real learning
> loop: smart flashcards with the actual rating buttons, a multiple-choice
> quick check, and a mini-lesson preview, so a new visitor understands the
> product before signing up. The homepage has a new "How it works" section with
> real product examples, and the journey section now clearly says 8 stages,
> each made of short guided missions (96 in total). Beginner explanations now
> lead with romanized Thai like khrap and kha, with Thai script secondary. The
> audio is still the device text-to-speech voice but is tuned slower for
> beginner review, and the start of playback was hardened against the clipped
> first syllable. The web beta at https://www.tuktalkthai.com is updated and a
> fresh Android APK is built. Could you run the demo and the first lesson as a
> brand-new user and tell me if the product now explains itself? The feedback
> template is in the testing package.
