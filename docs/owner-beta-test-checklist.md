# Owner Beta Test Checklist

Date: June 12, 2026. Build: master (owner review feedback sprint).
Web: https://www.tuktalkthai.com · APK: `android\app\build\outputs\apk\debug\app-debug.apk`

Work through these in order; jot anything odd straight into
`docs/owner-feedback-template.md`. "Pass" means it worked AND felt right.

## 1. Homepage first impression (signed out)

- [ ] Open the homepage on a phone. Within 10 seconds: do you want to start?
- [ ] The mascot is clearly visible and does not cover any text.
- [ ] Phrase bubbles look intentional, do not overlap each other, and the
      speaker buttons play Thai audio on tap.
- [ ] The "Mission 1: Say hello" badge reads clearly.
- [ ] "Start your first mission" button is obvious and inviting.
- [ ] NEW: the "How it works" section shows a flashcard example (English first,
      rating buttons), a quick check example, and a mini lesson example, and
      they read like the real product.
- [ ] NEW: the journey section is titled "Your first stages" and explains that
      each stage is a set of short, guided missions.
- [ ] The "try a quick demo" link works and the browser Back button returns to
      the homepage.
- [ ] The stats band (stages / guided missions / words and phrases) renders on
      one row without crowding.
- [ ] The Learn / Practice / Challenge / Win loop looks tidy and centered.
- [ ] Dark mode: toggle your system/app theme and re-check the homepage,
      including the new "How it works" mockups.
- [ ] Small phone (or narrow browser window ~360px): no horizontal scrolling,
      no overlapping text, buttons fit.

## 2. NEW: Quick demo (no account)

- [ ] The demo opens with a flashcard showing English first; the toggle
      switches to Thai first and back.
- [ ] Tap to reveal: the Thai answer appears romanization first, with script
      smaller, and the speaker button plays it.
- [ ] After reveal, the four rating buttons (Again / Hard / Good / Easy)
      appear, and the note explains the app uses your answer to schedule the
      card.
- [ ] After three cards, a multiple-choice quick check appears and works.
- [ ] The mini-lesson preview explains intros and recaps, then the demo ends
      with the signup screen (Create account / Sign in / Back to home).
- [ ] The demo never asks for an account mid-flow and Back exits cleanly.

## 3. Welcome flow and first lesson

- [ ] "Start your first mission" leads into a clear welcome/signup flow.
- [ ] Create or use a test account; confirm you land in the guided first lesson.
- [ ] The first lesson explanation (primer) is clear, beginner-friendly, and
      leads with romanization (khrap, kha, phom) rather than Thai script.
- [ ] The primer quick-check questions are fair and the wording makes sense.
- [ ] NEW: lesson flashcards show English first by default; the toggle flips
      direction and the choice sticks after a refresh.
- [ ] NEW: audio pace feels comfortable for a beginner and the first syllable
      is not clipped.
- [ ] Correct answers feel rewarding (sound + visual); wrong answers feel
      gentle, not punishing.
- [ ] The mission recap at the end feels motivating and truthful.

## 4. Guided learning flow (Stages 1-3)

- [ ] Stage 1 mini-missions unlock in order; locked ones say why.
- [ ] A mission opens with its teaching intro (you will learn / why it matters /
      listen for / notice). Does it actually help?
- [ ] The sentence builder step is satisfying on a phone (tap to build).
- [ ] The recap and reward screen after a mission feel earned.

## 5. Stage 4-8 guided teaching

- [ ] Open any Stage 4+ mission (use a progressed account, or judge from the
      intro screens). Read the intro: is the English clear? Is the Thai gloss
      next to each word right?
- [ ] Check 2-3 recaps: do the achievement bullets match what the mission
      actually taught?
- [ ] Complete the final mission of any stage: the bigger "Stage N Path
      Complete" screen appears (instead of the generic mini-unit one).

## 6. Words You Already Know bonus

- [ ] On the Learn page, the gold "Bonus: Words You Already Know" card opens
      the list.
- [ ] Audio plays per word; the notes read as friendly, not overclaiming.
- [ ] It is clearly optional (closing it changes nothing in your progress).
- [ ] Thai spelling/romanization look right to you (full native review comes
      separately).

## 7. Core app checks

- [ ] Learn Path progress numbers match what you have actually done; the rail
      is titled "Stage N missions" and reads clearly.
- [ ] Challenge: one round in each direction; questions come only from your
      stage; feedback is clear; speaker button plays the Thai.
- [ ] Cards (Practice): review a few due cards; rating buttons respond once;
      the English first / Thai first toggle works and persists.
- [ ] Settings: the Flashcard direction setting and the new pronunciation
      speed options (Slow / Clear / Fast) work; "Play sample" sounds right.
- [ ] Dark mode across Learn, Cards, Challenge, and modals.
- [ ] Small phone layout across the same screens.

## 8. Android APK specifics

- [ ] APK installs and launches to the landing page.
- [ ] Status bar does not overlap the app header.
- [ ] Audio works on tap (device Thai text-to-speech is expected).
- [ ] Android Back button behaves sensibly (demo → welcome → homepage; never
      traps).
- [ ] Progress persists after killing and reopening the app.

## 9. Catch-all

- [ ] Anything confusing, too long, or boring? Note where you lost interest.
- [ ] Any button that did nothing or did the wrong thing?
- [ ] Any text that overflows, wraps badly, or is cut off?
- [ ] Any Thai that looks wrong (flag for native review)?
