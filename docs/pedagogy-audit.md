# Pedagogy Audit — Does Tuk Talk Thai actually TEACH?

**Date:** 2026-07-12 · **HEAD:** `d4b5251` · **Scope:** diagnostic, READ-ONLY (zero code changes).
**Method:** 5 read-only investigation agents across every learning surface + 2 independent verification passes, all with file:line evidence and verbatim quotes; distractors graded question-by-question.

---

## 0. Executive verdict (plain, no hedging)

**The owner's diagnosis names the wrong culprit, but his alarm is justified.**

- **The direction (Thai→English) is a red herring.** Thai→English *recognition* is a legitimate, correct FIRST stage of acquisition, and the app uses it correctly elsewhere (the Stage Challenge's `thai-to-en` mode). It is fully documented and triple-guarded on purpose. It is **not** the defect.
- **The real defect is a TEST WITHOUT A LESSON — and it is confined to Dating.** Dating drops a brand-new Super user straight into a *graded* quiz on phrases it has never taught. The phrase's English meaning literally exists in the data but is rendered **one screen too late** — only in the post-answer reveal.
- **The core learning product is pedagogically sound.** First lesson, mini-units, SRS flashcards, and the Stage Challenge all TEACH before they TEST, and the data proves every graded item was taught first. **Dating is the exception, not the rule.**
- **But do not fully relax:** the audit found *secondary* "win-without-learning" leaks even in the core (the Guide's "Tone Challenge" has no audio; the first-lesson quick-check has a position-bias tell). These are low-stakes but real, and listed in §5.

**So: the fix for the owner's wall is scoped and cheap** (add a lesson step before the Dating quiz — the content already exists), **not** a rewrite of the app's learning method or the enforced direction.

---

## 1. Original rationale for Thai→English — found, verbatim, and it never covered teaching

The direction rule is real, owner-attributed, and defended at three code layers plus a validator. **Commit `8cd9ee7`** (the rewrite of 16 questions), verbatim:

> **fix(dating): enforce Thai-to-English recognition direction in the quiz**
> The pack **teaches recognition first**: every question now shows its Thai subject phrase (with phonetics) and offers ENGLISH-ONLY answer options. Rewrote all 16 English-scenario → choose-the-Thai-phrase questions … Direction is now triple-guarded: validateQuestion rejects Thai answer options …, resolveQuestion throws at render level, and check-dating-quiz.mjs carries regression traps plus per-bank direction assertions.

In-code (verbatim): `DatingSection.jsx:30-35`, `datingQuiz.js:48-52,64-67` (`promptShowsPhrase = () => true`), `datingQuestions.js:4-8`, all headed **"DIRECTION RULE (owner requirement): this pack teaches RECOGNITION."**

**The critical finding:** every one of these justifies only the **direction of the options**. **None describes, or even mentions, an ungraded teaching step.** The word "teaches" is used to mean *"the graded question displays the Thai subject phrase"* — a source comment at `datingQuestions.js:18` literally calls the graded subject "the phrase being taught." But the code shows only Thai + phonetic pre-answer (`DatingSection.jsx:450-464`) and withholds the English meaning (`q.phrase.en`) until **after** grading (`DatingSection.jsx:524`). So the learner's first contact with a never-seen phrase **is** the graded test.

**The "/dating must NOT be a static phrase list" requirement** traces **only** to commit `cc104f3` ("rebuild /dating as an interactive 18+ learning mode") and code comments (`DatingSection.jsx:19-20`) — it is **NOT** found in any owner-requirements document. The rebuild swapped a static list for a quiz **but never added the lesson the quiz was supposed to test.** That requirement, taken literally, removed the learning step.

**This is a regression from the app's OWN documented model.** The course explicitly "teaches before it tests" — `docs/native-review-master-checklist.md:243`, `docs/learning-flow-architecture-plan.md:42-46`, `docs/course-structure-roadmap.md:36-44` (vocab cards → sentence → challenge). Dating violates a model the project already wrote down.

---

## 2. Per-surface pedagogy map

| Surface | TEACH step before test? | Direction | Progression | Verdict |
|---|---|---|---|---|
| **First lesson** (`FirstLessonFlow.jsx`) | **YES** — primer (ungraded prose) → cards reveal Thai+ph+meaning ungraded, before the graded challenge | quick-check + mini-challenge are **PRODUCE** (pick the Thai for English); cards teach both ways | taught → graded within the unit; challenge items ⊆ taught cards (`miniUnits.js:9-11`) | **Sound** (see §5 for a quick-check position-bias leak) |
| **Placement onboarding** (`PlacementOnboarding.jsx:78-129`) | N/A — self-assessment to *skip* content, not a graded test | — | — | Sound (not a test) |
| **LearnPath / mini-units** (`MiniUnitFlow.jsx`) | **YES** — intro → vocab → sentence (all tap-to-reveal cards) → builder → graded challenge; completion copy: *"Cards did most of the learning; Challenge gave you a quick check"* (`:525`) | challenge = PRODUCE (en→thai) | taught ⊆ tested across **all ~40 units** (data-verified) | **Sound** |
| **SRS flashcards** (`CardsTab.jsx` + `srs.js`) | **YES** — reveal shows ph+Thai+meaning+breakdown+note **before** the ungraded self-rating (`:601-704`); new cards only introduced in a learning session, bare Cards tab is review-only | both (`cardDirection`, anti-peek lock) | SM-2 spaced repetition re-shows taught items | **Sound** (the gold standard) |
| **Stage Challenge** (`QuizTab.jsx` + `challengeQuestions.js`) | **YES, hard-enforced** — pool filtered to already-seen cards (`stageComplete \|\| progress[id]`, `:135-142`); **refuses to start** otherwise ("Learn a few more Stage N cards … then come back") | offers `thai-to-en` RECOGNIZE **and** `en-to-thai` PRODUCE (`:20-33`) | reinforces learned items only | **Sound — strongest proof the core respects teach-before-test** |
| **Tone Challenge** (`GuideTab` + `TonesQuizSection.jsx`) | Partial — "Tones" (teach) and "Tone Challenge" (graded) are sibling tabs, no ordering enforced; reachable cold | — | achievement-only, low stakes | **Minor echo** + a real no-audio leak (§5) |
| **Demo** (`DemoMode.jsx`) | **YES** — flashcards → quick-check whose answer is a card just revealed (`:25-36`) | recognition | teach → test | **Sound** |
| **Dating** (`DatingSection.jsx`) | **NO** — category grid → **graded question 1**, no presentation phase; meaning shown only in the post-answer reveal (`:121-126, :450-464, :524`) | Thai→English recognition (correct direction, wrong sequence) | one graded pass per phrase; no re-teach | **BROKEN — test without a lesson** |

---

## 3. Distractor quality grades

Graded all 50 Dating questions. **The owner's "implausible distractors" complaint is *partially* correct — and where it's correct, it's a *second* problem on top of the missing lesson.**

- **Pure "meaning" questions (~8, the good pattern):** four distinct, plausible English glosses, no context leak, no length tell — genuinely 1-in-4, cannot be gamed (`datingQuestions.js:35-55`, e.g. dq-intro-1). Proof the author *can* write fair distractors. But they still teach nothing, because the meaning is revealed only after the graded guess.
- **~30 of 50 (60%) are trivially eliminable with zero study** (≈64% counting borderlines), via four tells:

**(a) The correct answer is systematically the LONGEST / only-hedged option** (~17 usage/scenario/caution questions). Distractors lean on absolutist tells ("never / always / only / rude in any situation"); the correct one is the balanced, qualified, longest string. Example — **dq-rel-5**: correct (b) *"Use it thoughtfully: after you have been dating a while … be ready to hear an honest answer either way."* (~148 chars) vs distractors (~70–82 chars) using "anyone, even someone you just met" and "ever." *(Commit `0f207fa`'s "longest-option repair" fixed only ~4 conspicuous cases; the pattern survives across ~17 questions.)*

**(b) Culturally-absurd distractors resolvable by adult common sense in English.** Example — **dq-night-4**: distractors *"offering to pay for others' drinks is considered insulting in Thailand"* / *"each person must always pay only for their own drinks"* vs correct *"treating the group to a round is a friendly, normal gesture."* This tests etiquette in English, not Thai.

**(c) The owner's cited example — dq-swear-1 (บ้าจริง) — confirmed.** Prompt: *"You hear a Thai friend mutter this after **locking themselves out of their apartment**. What does it mean?"* Options: (a) *"A warm thank-you for everything someone has done."* / **(b) *"A burst of mild frustration at a situation — like muttering 'ugh, not again!'"* [correct]** / (c) *"An excited way to say something is awesome."* / (d) *"A polite request for a little more time."* **The prompt already frames a frustrating mishap; only (b) can fit.** Answerable from the English prompt alone, with the Thai phrase ignored entirely.

**(d) All 11 "tone" questions are winnable via the app's own severity taxonomy, not Thai.** Options are always the four labels {Gentle, Casual, Handle with care, Safety}. Two are always absurd for a given phrase, and — critically — the category card the learner just tapped shows `SEVERITY_LABEL[cat.severity]` (`DatingSection.jsx:317`), which for **single-severity categories IS the answer** (introductions/apps/compliments → Gentle; boundaries-consent → Safety; mild-swears → Handle with care). The in-quiz badge-hiding fix (`badgesLeakAnswer`) closed the leak *inside* the question but not the leak on the *selection screen*.

---

## 4. Where a learner can win without learning (ranked, worst first)

1. **Dating usage/scenario/caution — longest/only-non-absolutist answer** (~17 Q). Options are shuffled (`DatingSection.jsx:116`), so the length/hedging tell survives shuffling. Test-wise learner scores high with zero Thai.
2. **Guide "Tone Challenge" — no audio; the printed diacritic IS the answer key.** It bills itself as *"Ear training"* and *"Look at the romanized syllable and pick the correct tone"* (`TonesQuizSection.jsx:40-42`) but plays **no audio**; the accent mark on the syllable (â=falling, á=high, ǎ=rising, à=low, none=mid) deterministically encodes the answer. Memorize 5 accent shapes → 100%, and it grants the "Tone Master" achievement. *(Core-app leak, not Dating.)*
3. **Dating tone questions — closed 4-label set (25% baseline) + the selection-screen severity leak** (§3d).
4. **First-lesson "Quick check" — position bias.** All 5 pedagogy-quiz correct answers are option **A**, rendered unshuffled (`FirstLessonFlow.jsx:382`); always-tap-A scores 5/5 with the prompt unread. Low stakes (forgiving/skippable), but a clean 100%-reliable tell. *(Core-app leak.)*
5. **First-lesson mini-challenge sentence item — pickable by shape.** The correct option is the only full sentence among single-word distractors (`buildQuestions`, distractors = just-taught vocab). Selectable without meaning.
6. **Dating "dead content":** 15 of 60 phrases are referenced by no question, and 5 are tested twice — so only 45 unique phrases are ever tested, and with no study mode the other 15 are shipped but unreachable as learning.

**Positive exemplar:** the **Stage Challenge** (`challengeQuestions.js`) is the one well-built graded surface — shuffled positions, same-stage/same-category distractors, learned-only scoping, and answer de-dup (`answersTooSimilar`). It is the model the others should follow. (One residual: it can place a sentence correct-answer among word distractors — the same shape tell as #5.)

---

## 5. VERDICT — is the core sound, or is the defect systemic?

**The core learning product is sound; the test-without-a-lesson defect is confined to Dating.** This is verified two independent ways:

1. **Structure:** every core guided surface presents each item as an ungraded card reveal before any graded MCQ.
2. **Data:** for every mini-unit, the graded `challengeCardIds` are a strict subset of the taught `vocabCardIds` + `sentenceCardId` (checked across ~40 units). And the Stage Challenge **hard-blocks** testing on unlearned cards.

**Do not over-relax, though.** The defect *pattern* ("a graded surface reachable without the lesson it tests") has **two low-stakes echoes in the core**: the Guide's Tone Challenge (no audio → decode-the-diacritic, §4.2) and the first-lesson Quick Check (always-A position bias, §4.4). Neither gates progress or money, but both let a user "score" without learning, so both are worth a cheap fix. **The owner's alarm is directionally right — the app does contain "tests you can pass without learning" — but the severe, paid-surface instance is Dating alone.**

---

## 6. Dating — is there ANY teach step? No.

`DatingSection.jsx` has five render branches — locked teaser / 18+ age-gate / **category selector** / **graded question** / summary — and **none present a phrase with its meaning ungraded.** The category selector shows only names/blurbs/badges (`:305-339`), never the phrases. `startCategory` calls `loadQuestion(cat.id, 0)` immediately (`:121-126`), landing the learner on graded question 1. The pre-answer card shows Thai + phonetic but withholds `q.phrase.en`; the gloss, literal, context, and note appear only in the post-submit reveal (`:512-551`). **The teaching content already exists in `datingPhrases.js` (`en`, `example`, `note`, `:39-53`) — it is simply rendered after the grade instead of before it.** The "must NOT be a static phrase list" requirement (§1) is what removed the lesson.

---

## 7. Recommendations (design proposals — NOT implemented), ranked by impact-per-effort

| Rank | Option | What it does | Scope / effort | Risk | Conflicts / approval |
|---|---|---|---|---|---|
| **1** | **A — Add an ungraded TEACH/browse step before the Dating quiz** | Insert a "Study these phrases" stage (or a per-category flip-card walk-through) showing Thai + phonetic + **meaning** + example + note **before** the first graded question. Reuses `datingPhrases.js` content that already renders in the reveal panel. | **Small.** One new render branch in `DatingSection.jsx` (category → *phrases* → quiz); zero content, zero data, zero backend. | **Low.** Doesn't touch gates, badges, direction, validator, XP, or the 18+/Super flow. | None — no owner approval needed. Directly converts the identical Thai→English quiz into a valid RECOGNIZE stage. |
| **2** | **C — Fix the distractor tells** | Normalize option lengths, remove absolutist-only distractors, and de-leak the tone questions (hide the selection-screen severity chip for single-severity categories, or diversify tone options). | **Medium.** Content edits to `datingQuestions.js` (~17 length-tell + 11 tone) + one selector tweak; must keep the validator green. | **Low–med.** Content-only; the validator already guards direction. | None, but it's polish on top of the missing lesson — do #1 first. |
| **3** | **D (core echoes) — cheap systemic hardening** | (a) Tone Challenge: play audio and/or stop printing the diacritic as the visible answer key; (b) first-lesson Quick Check: shuffle options so "always A" fails; (c) Challenge/first-lesson: keep sentence answers out of word-distractor sets. | **Small each.** Localized. | **Low.** | None. |
| **4** | **B — Add a PRODUCTION stage (English→Thai) after recognition** | Let learners progress RECOGNIZE → PRODUCE within Dating (and tighten the core's internal ladder, where mini-units currently jump straight to PRODUCE). | **Large** for Dating. | **High for Dating.** | **CONFLICTS with the enforced direction:** the master doc + `check-dating-quiz.mjs` (§1) **forbid** English→Thai in Dating and the validator will fail the build. **Requires explicit owner approval** to relax the direction rule + validator. Not needed to fix the owner's wall. |

---

## 8. The single highest-impact change

**Option A — add an ungraded TEACH step before the Dating quiz.** It is the smallest change, needs no owner approval, touches no gate/validator/content, and it is the *exact* thing that turns the owner's "test on things I was never taught" into a proper "learn, then get tested on what you learned." It also makes the existing Thai→English direction correct-by-construction (a recognition test that follows a lesson is textbook-correct). Distractor fixes (#2) and the core echoes (#3) are worthwhile but secondary — the missing lesson is the wall.

---

## 9. What requires owner approval

- **Only Option B** (adding an English→Thai production stage to Dating, or otherwise changing the Dating direction) requires owner sign-off, because it **directly conflicts** with the deliberately-enforced Thai→English rule (commit `8cd9ee7`, the header comments in three files, and the `check-dating-quiz.mjs` regression traps). Nothing in Options A, C, or D touches the direction or the validator.
- **Note for the owner:** the "must NOT be a static phrase list" requirement (§1) is what removed the lesson. A *browse/study step is not a static list* — it's an interactive lesson that precedes the interactive quiz — so Option A honors both requirements. Worth confirming the owner agrees that a guided phrase walk-through satisfies "not a static list."

*(This is a diagnostic report. No source files were modified.)*
