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

This sprint implements the next round of feedback from your review video:

1. **Choose your Thai speaking style.** A male / female speaker toggle now
   appears in Settings, in the quick demo, and on the first lesson screen.
   Male is the default and uses phǒm (ผม) and khráp (ครับ). Female uses
   chăn (ฉัน) and khâ (ค่ะ). The words really switch where the style changes
   them: flashcards, quiz options, sentence builder tiles, and most recap
   lines show the selected form, and the audio speaks exactly what is
   displayed. Any explanation line that mentions male or female speakers
   stays as written, so the explanation stays true. Your choice is saved and
   syncs to your account.
2. **Audio tries to match your style.** When the device offers a Thai voice
   that matches your speaking style, the app prefers it; otherwise it uses the
   best available Thai voice. Voice matching depends on the voices installed
   on your device. Audio is still device text-to-speech.
3. **The mini lesson preview now proves the "why".** The homepage Mini lessons
   example gained a second box, "Thai language basics", that explains polite
   endings (khráp / khâ) and the word for "I" (phǒm / chăn), so "Learn the
   why, not just the words" is backed by visible language reasoning.
4. **Homepage feels more premium and alive.** Sections rise in as you scroll,
   the Muay Thai mascot breathes and parallaxes gently with gold sparkles, the
   "Start here" journey node pulses, and a coach mascot greets you above the
   mission loop. All motion is disabled for reduced-motion users and the page
   stays fully readable without it.

Previous sprint highlights (still in this build): English-first flashcards
with the direction toggle, the real-product quick demo with rating buttons,
the "How it works" homepage section, romanization-first beginner guidance,
slower hardened audio, guided intros and recaps for all 96 missions, and the
"Words You Already Know" bonus (13 borrowed words, pending native review).

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

1. Open the homepage on your phone. Does it feel premium as you scroll? Check
   the Mini lessons card for the new "Thai language basics" box.
2. Run the quick demo (no account): switch the speaker toggle to Female and
   confirm the card really changes (khráp becomes khâ) and the audio speaks
   the displayed words.
3. Tap "Start your first mission" and go through the welcome flow. On the
   first lesson screen, try both speaking styles and confirm the lesson words
   follow your choice.
4. In Settings, find "Thai speaking style", switch it, refresh the page, and
   confirm the choice stuck.
5. Continue into Stage 1 missions; read an intro and recap in each style, and
   build the sentence in the sentence builder (tiles should match your style).
6. Try a Challenge round, the Cards review (rating buttons), dark mode, and a
   small phone if available.

## Known limitations (so they do not surprise you)

- All new mission intros/recaps (Stages 4-8) and the 13 borrowed bonus words
  are **pending native-speaker review**; the per-stage review matrices in
  `docs/` list exactly what to check.
- The female speaking style is generated from the male-form source content at
  display time. The generated female forms are mechanical (phǒm to chăn,
  khráp to khâ or khá) and are **flagged for native review** in
  `docs/native-review-master-checklist.md` before public launch.
- The speaking style changes the words you learn. The audio voice tries to
  match when the device offers a matching Thai voice, otherwise it uses the
  available Thai voice. Many phones ship only one Thai voice, so a male or
  female voice can never be guaranteed.
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

> Quick update on Tuk Talk Thai, based on your latest review video. There is
> now a male / female speaking style toggle in Settings, the demo, and the
> first lesson. Male is the default with phom and khrap; female switches the
> actual lesson words to chan and kha, including the sentence builder tiles,
> and the audio speaks whatever is displayed. The audio voice tries to match
> your style when the phone has a matching Thai voice, otherwise it uses the
> best Thai voice available, so the voice gender depends on the device. The
> homepage mini lesson preview now has a "Thai language basics" box that
> explains the polite endings and the word for I, so "learn the why" is shown,
> not just claimed. The homepage also got a premium motion pass: scroll
> reveals, a livelier mascot, sparkles, and a friendlier journey path, all
> safe for reduced motion settings. The web beta at
> https://www.tuktalkthai.com is updated and a fresh Android APK is built.
> Could you try the demo and first lesson in both speaking styles and tell me
> if the switch feels right? The feedback template is in the testing package.
