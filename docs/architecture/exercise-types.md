# Tuk Talk Thai — Spec 01: Exercise Types

**Status:** Planning only. This spec elaborates the FOUNDATION CONTRACT (`docs/architecture/README.md`) and never contradicts it. Where this spec and the foundation disagree, the foundation wins. Canonical IDs from the foundation (`exercise-type id`, `sit-*`, `path-*`, `reg-*`, `tone-*`, `mastery-*`) are reused **verbatim**.

**Owns:** foundation §1 (exercise-type catalog), §5 drill mechanics, the Web-Speech gate + paid-scoring upgrade seam.

**Scope discipline:** Zero application code. Interface signatures and data-shape sketches only. Every "buildable-now" means "fits the existing stack + 21 validators," not "already built." Data shapes below are documentation sketches — the app is **not** TypeScript (CLAUDE.md); `interface`/`type` blocks are for precision only and would ship as plain JS object literals.

---

## 0. How to read a type contract

Each of the ten canonical exercise types (foundation §1) gets one contract with a fixed shape:

- **Purpose** — what the learner does.
- **Skill trained** — the differentiator axis (situation / register / tone / production / recognition / speaking).
- **Direction** — load-bearing per foundation §1 (prompt→answer axis).
- **Data shape** — concrete field list, reusing a real shape from `src/data` or `src/lib` with `file:line`.
- **UI behaviour** — what renders, what is hidden, teach-before-test steps.
- **Grading** — by `id`/value equality, **never array index**; shuffle policy per attempt.
- **Hearts** — graded-only; non-graded teach steps never cost a heart (foundation §7).
- **Mastery writes** — which `mastery-*` signal it advances (foundation §6).
- **Status** — `buildable-now` / `needs-content` / `needs-owner`, with the reason.
- **Validators touched** — which of the 21 bind it, and how it stays green.

### 0.1 Cross-cutting invariants (bind EVERY graded MCQ)

Both are enforced today by `check-quiz-shuffle.mjs` and `check-challenge-scope.mjs`:

1. **Grade by identity, never index.** Compare `option.id === correct.id` (MCQ) or a value equality (`tone === q.tone`). The live pattern is `rawOpt.id === current.correct.id` (`src/components/QuizTab.jsx:463`) and `optionId === q.correctOptionId` (`src/lib/datingQuiz.js:119`). No `options[0]`, no `rotateOptions`.
2. **Shuffle both axes per attempt** on any *repeatable* quiz — question order AND option order. Live pattern: `shuffle(pool)` for questions + `options: shuffle([correct, ...distractors])` for options (`src/lib/challengeQuestions.js:200,217`); tone options reshuffle via `useMemo(..., [idx])` (`src/components/TonesQuizSection.jsx:80-84`).

**Rule for every NEW screen:** when you add a repeatable MCQ component, you MUST add its file to the scan arrays in `check-quiz-shuffle.mjs` (list at lines 7-14) — the static scanner uses a fixed allowlist, so an unlisted new file would silently slip the guard. The blueprint closes the gap; it does not exploit it (foundation §8).

### 0.2 Hearts invariant (graded-only)

Hearts gate **graded activities only**, and today only the Stage Challenge spends them: `−1 heart per WRONG answer, free users only` (`src/components/QuizTab.jsx:220`; model doc `src/lib/economy.js:8-10`). Super = `Infinity` (`economy.js:77-82`). **No teach step, primer, flashcard review, or lesson may ever cost a heart** (`check-economy.mjs:34-39`). Any new graded type that spends a heart must mirror the `QuizTab` gate exactly: block *starting* at 0 hearts, always offer a free way forward, Super bypasses (`QuizTab.jsx:149,302-354`). In this catalog **only** `recognition-th-en` and `production-en-th`, and only *inside the Stage Challenge*, spend hearts. Every other type is heart-free (see the summary table in §12).

### 0.3 Review-pending badge (all new content)

Every new artifact any of these exercises consumes (situation cards, register variants, dialogue lines, `register-judge` items, diacritic→tone parser output) ships `reviewStatus: 'pending'` by default and MUST render the **"Draft content — pending native-speaker review"** badge (foundation §9). The badge component and status vocabulary already exist for Dating: `REVIEW_STATUS` / `reviewBadge()` (`src/lib/datingQuiz.js:35-40`). Auto-derivations (M/F flip, sentence-builder tokens, tone-from-`ph` parse) are **not** approvals and never claim to be.

---

## 1. `flashcard-srs` — SRS flashcard review (the spine)

- **Purpose:** Spaced-repetition review of any card; the backbone loop.
- **Skill trained:** recall (recognition + production depending on frozen face direction).
- **Direction:** user-config, default `en-first` (`src/lib/voice.js:17`, `DEFAULT_CARD_DIRECTION`).
- **Data shape:** the canonical card (`src/data/cards.js`; CLAUDE.md "Data conventions"):
  ```
  Card { id:int, thai:str, ph:str, en:str, type:'w'|'p'|'s'|'g',
         stage:1..8, cat:str, note?:str, mission?:int, needsReview?:bool }
  ```
  Rendered ALWAYS through `displayCard(card, voice)` (`voice.js:124`) so the male→female flip applies. Face selection is frozen per attempt via `faceIsEnglishFirst(attemptDirection)` (`src/lib/attemptDirection.js:26`).
- **UI behaviour:** front shows the frozen prompt face; reveal shows the other; four self-rating buttons. Thai-script visibility follows `viewMode` (speak/both/read). Exists today: `CardsTab.jsx`, `srs.js`.
- **Grading:** self-rating Again/Hard/Good/Easy → modified SM-2 (`src/lib/srs.js`). No options, no index. A mid-attempt direction toggle latches `assisted` and caps reward (`attemptDirection.js:36-40`).
- **Hearts:** **never** — this is the learning path (`check-economy.mjs:34-36`).
- **Mastery writes:** `mastery-taught` (progress row exists, `state.js:27`). A rating on an `en-first` (production) face MAY additionally write `mastery-produced`; a `th-first` (recognition) face MAY write `mastery-recognized` — recorded alongside `progress`, merged **max** (foundation §6, `check-progress-merge`). Never gates advancement.
- **Status:** **buildable-now (exists).**
- **Validators:** `check-direction-lock` (CardsTab already in `SCREENS`, `check-direction-lock.mjs:61-66`); `check-economy`.

---

## 2. `recognition-th-en` — Read Thai → pick English

- **Purpose:** Confirm the learner maps a Thai form to its meaning.
- **Skill trained:** recognition (comprehension).
- **Direction:** Thai→English.
- **Data shape:** reuses the Challenge question built by `buildChallenge({ type:'thai-to-en', ... })` (`src/lib/challengeQuestions.js:197-222`):
  ```
  ChallengeQuestion { id:str, type:'thai-to-en', correct:Card, options:Card[] }
  ```
  Prompt/answer text derive via `getPromptText(card,'thai-to-en',voice)` = `card.thai` and `getAnswerText(...)` = `card.en` (`challengeQuestions.js:112-120`).
- **UI behaviour:** Thai prompt (+ `ph`, + optional TTS button gated by `ttsAvailable()`), four English options. Lives in `QuizTab` `thai-to-en` mode (`QuizTab.jsx:21-34`). Also the sole direction of the **Dating** pack (recognition-only, English options — `datingQuiz.js:47-53`), which is a **separate, reward-free, heart-free** surface.
- **Grading:** `rawOpt.id === current.correct.id` (`QuizTab.jsx:463`). Questions shuffled (`shuffle(pool)`) and options shuffled (`shuffle([correct, ...distractors])`) per attempt (`challengeQuestions.js:200,217`).
- **Hearts:** **Stage-Challenge only** — −1 per wrong answer, free users (`QuizTab.jsx:220`). The identical MCQ inside Dating is heart-free and reward-free (`check-dating-badges`).
- **Mastery writes:** correct answer → `mastery-recognized` (foundation §6).
- **Status:** **buildable-now (exists).**
- **Validators:** `check-challenge-scope` (runs both directions, `check-challenge-scope.mjs:26`); `check-quiz-shuffle`; `check-economy`; inside Dating additionally `check-dating-quiz`, `check-dating-badges`, `check-dating-distractors`.

---

## 3. `production-en-th` — Read English → pick Thai

- **Purpose:** Force retrieval of the Thai form from the English idea — the first *production* step.
- **Skill trained:** production (harder than recognition).
- **Direction:** English→Thai.
- **Where it sits in the sequence:** AFTER recognition, per the mastery ladder `taught → recognized → produced → spoken` (foundation §6). A card should reach `mastery-recognized` (via §2 or `listen-meaning`) before `production-en-th` is scheduled for it; producing before recognizing is allowed but not the default recommender order. It sits *before* any spoken step.
- **How it COEXISTS with the Dating Thai→English lock (RESOLVED, foundation §8 headline):** English→Thai production is **already first-class and enforced-as-supported** in the main deck — `check-challenge-scope.mjs:26` runs `en-to-thai`, and `buildChallenge` builds an English prompt with Thai-answer options (`challengeQuestions.js:117-120`, `QuizTab.jsx:28-33,484-491`). The Thai→English lock is **Dating-module-only** (`check-dating-quiz.mjs`, enforced by `optionIsPhrase` rejecting any Thai/`phraseId` option — `datingQuiz.js:87,97,147-153`). **Resolution:** `production-en-th` is built and scheduled **entirely outside the Dating module** (Stage Challenge `en-to-thai`, `MiniUnitFlow`, `FirstLessonFlow`, and `sentence-build`). The Dating pack is untouched: it stays recognition-only, English-option, reward-free. Relaxing Dating's lock is explicitly **needs-owner** (not proposed here).
- **Data shape:** same `ChallengeQuestion` as §2 but `type:'en-to-thai'`; prompt = `card.en`, answer = `card.thai`, options render `answer` + `opt.ph` (`QuizTab.jsx:484-491`).
- **UI behaviour:** English prompt, four Thai options (each with phonetic); selecting a Thai option auto-plays its TTS when available (`QuizTab.jsx:199-204`).
- **Grading:** `rawOpt.id === current.correct.id` (`QuizTab.jsx:463`); both axes shuffled. Distractor similarity is guarded direction-aware (`en-to-thai` string-containment guard, `challengeQuestions.js:90-95`).
- **Hearts:** **Stage-Challenge only**, mirrors §2. Never in Learn/Review.
- **Mastery writes:** correct → `mastery-produced` (foundation §6).
- **Status:** **buildable-now (exists)** — the surface exists; the only rule is "must live OUTSIDE Dating."
- **Validators:** `check-challenge-scope`; `check-quiz-shuffle`; `check-economy`. Must **not** be added to the Dating files (would trip `check-dating-quiz`'s Thai-option ban).

---

## 4. `sentence-build` — Order tokens → produce a Thai sentence

- **Purpose:** Assemble a Thai sentence from scrambled tiles — production with word-order load.
- **Skill trained:** production + syntax (Thai word order, foundation §4/§5 sit alongside).
- **Direction:** English→Thai (production).
- **Data shape:** the real mini-unit `sentenceBuilder` block (`src/data/miniUnits.js:18-31`):
  ```
  SentenceBuilder {
    sourceCardId:int,        // the real card the sentence comes from
    prompt:str, english:str, thai:str,
    tokens: Token[],         // listed in CORRECT order
    answer: str[]            // token ids in correct order (permutation of tokens)
  }
  Token { id:str, thai:str, ph:str, en:str, isBlank?:bool }
  ```
  Voice flip via `displayBuilder(data, voice)` (`voice.js:153-173`) — token *display* flips, token *ids* do not, so the answer is voice-invariant.
- **UI behaviour:** tap-to-build tile bank; `SentenceBuilder.jsx` (present in 83/96 units). Name-slot placeholder (`isBlank`) is a non-Thai tile (`miniUnits.js:27`).
- **Grading:** `isBuilderCorrect(arrangedIds, answerIds)` — exact id-sequence equality (`src/lib/sentenceBuilder.js:6-10`). Tile bank shuffled by `shuffleTokens`, which **guarantees the opening order is not already the solved order** (`sentenceBuilder.js:16-28`). Grading is by token id, never tile position.
- **Hearts:** **never** (learning-path production).
- **Mastery writes:** correct → `mastery-produced`.
- **Status:** **buildable-now (exists).** This is the **sanctioned home** for `production-en-th` token-ordering (foundation §8, `check-sentence-builder`). New situational sentences require **cards first** (see Status caveat below).
- **Validators:** `check-sentence-builder` (`answer` is a permutation, faithful to `sourceCardId`, never pre-solved); `check-mini-units` (**no invented Thai** — every token must already appear in a real card; add cards before authoring a new builder). `verify-voice-flip` (display flips, id-based answer stays correct).

---

## 5. `listen-meaning` — Hear Thai audio → pick English meaning

- **Purpose:** Comprehension from *sound* alone, no script crutch — the core "living in Thailand" skill.
- **Skill trained:** listening comprehension (situational).
- **Direction:** audio→English.
- **Data shape:** reuse the `ChallengeQuestion` shape (§2) with a play-source flag:
  ```
  ListenQuestion { id:str, type:'listen-meaning',
                   correct:Card, options:Card[], playText:str /* = correct.thai */ }
  ```
  Audio source is `card.thai` via `speakThai` (`src/lib/audio.js:251`); options are English (`card.en`). No new content — any card with `thai` + `en` qualifies.
- **UI behaviour:** NET-NEW surface reusing the MCQ shell. A prompt that is a **play button only** (no printed Thai, no `ph`) + four English options. Reveal may then show `thai`/`ph`/`en`. Hide the whole exercise where audio is unavailable: render only when `ttsAvailable()` is true (`audio.js:271-274`) — mirror the button-gating idiom (`TonesQuizSection.jsx:101`, `QuizTab.jsx:243`). When `ttsAvailable()` is false, render nothing (mirror `SocialLinks.jsx:43-46` returning `null`) rather than a text-only fallback that would silently degrade into a read exercise.
- **Grading:** `option.id === correct.id`; shuffle questions + options per attempt. Add the new component to `check-quiz-shuffle.mjs`'s scan list.
- **Hearts:** **never** (foundation §1 marks it heart-free; keep it out of the Challenge heart gate).
- **Mastery writes:** correct → `mastery-recognized` (foundation §6 explicitly: "passes `listen-meaning`").
- **Status:** **buildable-now (net-new surface).** No new content; only a new component + scan-list entry.
- **Honest edge (flag):** on a device where `ttsAvailable()` is true but no Thai voice is installed, `speakThai` fails silently (`audio.js:166-170,84`) — an audio-only question becomes unanswerable. Mitigation: keep a **"can't hear it? reveal the phrase"** escape that converts the item to a read prompt *without* scoring it (never a heart, never a mastery write for the audio skill). Tracked in §13.
- **Validators:** `check-quiz-shuffle` (add file); `check-economy` (must not spend a heart).

---

## 6. `tone-discriminate` — Hear a syllable → pick 1 of 5 tones (diacritic HIDDEN)

- **Purpose:** Train the ear to hear tone, the app's headline game mechanic (foundation §5).
- **Skill trained:** tone perception.
- **Direction:** audio→tone-label.
- **Data shape:** the existing `TONE_QUIZ_ITEMS` (24 items, each already carrying a discrete `tone` + real `thai`) (`src/data/gamification.js:38-63`):
  ```
  ToneItem { syl:str, tone:'mid'|'low'|'falling'|'high'|'rising',
             mean:str, thai:str }
  ```
  Canonical tone IDs are `tone-mid`, `tone-low`, `tone-falling`, `tone-high`, `tone-rising` (foundation §5). The existing data uses the bare values `mid/low/falling/high/rising` (matching `TONES` in `reference.js:3-9` and the grading `tone === q.tone`, `TonesQuizSection.jsx:20-23,50`); a `tone-` prefix is the **display/analytics ID**, mapped 1:1 to the stored value — do not rename the stored field (would break `check-quiz-shuffle.mjs:50`).
  To attach a tone drill to any of the 4,791 main-deck cards (which store tone only as `ph` diacritics), derive the tone with a **diacritic→tone parser** (pure JS, zero deps): `à→low á→high â→falling ǎ→rising`, unmarked→`mid` (CLAUDE.md conventions; foundation §5). Audio still comes from `card.thai`, a **separate source from the written answer**, so the audio can never leak the answer.
- **UI behaviour — the REDESIGN that fixes the leak:** today the prompt prints `q.syl` (the romanized syllable *with its diacritic*), and the diacritic **is** the answer key — `TonesQuizSection.jsx:96` renders `{q.syl}` above the tone options. The redesign: during the question, **hide the written Thai diacritic AND the romanization**; the prompt is a **play button only** (`speakThai(q.thai)`, already wired at `TonesQuizSection.jsx:101-105`). `syl`/`thai`/`mean` reveal **only after answering** (they already reappear in the feedback block, lines 129-139). Preserve the protected copy string **"Ear training"** (`TonesQuizSection.jsx:41`; `check-pedagogy-regression`) and add/keep a **"Hidden until you answer"**-style placeholder for the suppressed prompt (that exact string is already protected via `datingQuiz.js:83`).
- **Grading:** by tone value — keep `tone === q.tone` (`TonesQuizSection.jsx:20-23,50`), never index. Keep the two shuffle patterns the scanner asserts verbatim: `[...TONE_QUIZ_ITEMS].sort(() => Math.random() ...)` for questions (line 15) and `useMemo(() => {... Math.random() ...}, [idx])` for the five tone options (lines 80-84) — `check-quiz-shuffle.mjs:46-51` matches these by regex.
- **Hearts:** **never.**
- **Mastery writes:** none in the ladder (tone is a **parallel achievement track, never an advance gate** — foundation §5/§6). Feeds only the `tonesQuizPassed` → Tone Master achievement (`gamification.js:15`).
- **Status:** **buildable-now (needs the diacritic-hidden redesign).** Content exists (24 items); optional expansion to the full deck needs the diacritic→tone parser (buildable-now, zero deps).
- **Honest edge (flag):** audio-only means it depends on TTS. If `ttsAvailable()` is false, hide the audio-first mode entirely (render `null`); if TTS exists but no Thai voice is installed the syllable is silent and the item is unanswerable — offer the same non-scored reveal escape as §5. Tracked in §13.
- **Validators:** `check-quiz-shuffle` (TonesQuizSection already scanned, `check-quiz-shuffle.mjs:44-51`); `check-pedagogy-regression` (protected strings — update the guard in the **same commit** if the redesign intentionally changes protected copy).

---

## 7. `tone-produce` `[gated]` — Say the syllable; browser returns a coarse word verdict

- **Purpose:** Let the learner *attempt* the syllable and get an honest "did the app understand you?" signal.
- **Skill trained:** speaking attempt (NOT tone accuracy — see honest limit).
- **Direction:** speak→verdict.
- **Data shape:**
  ```
  SpeakVerdict = 'correct' | 'close' | 'wrong'
  SpeakTarget { thai:str, ph:str, expectedWords:str[] /* from card.thai */ }
  ```
  Target audio/answer come from a real card or `ToneItem.thai`. New `lib/speech.js` wraps the browser `SpeechRecognition`/`webkitSpeechRecognition` API (free, imprecise). New `SpeakingExercise.jsx` (parent type `speaking-repeat`, §8).
- **UI behaviour:** renders **only** when `speechRecognitionAvailable()` is true (see §11). When absent it **renders nothing** — no button, no "unsupported" stub (mirror `SocialLinks.jsx:43-46`; the same discipline as `ttsAvailable()` gating). Mic button → capture → transcript → coarse verdict.
- **Grading:** `correct` / `close` / `wrong` by **word match against `card.thai`**, never a tone comparison, never an index.
- **HONEST LIMIT (write verbatim, foundation §5):** *browser recognition **cannot grade tone** — it auto-corrects a mistoned attempt toward the nearest real Thai word.* The free verdict is honestly framed as **"did the app understand you?"**, not pronunciation assessment. It must never be advertised or labelled as tone scoring.
- **Hearts:** **never.**
- **Mastery writes:** `correct`/`close` → `mastery-spoken` (foundation §6). **HARD:** `mastery-spoken` is **structurally unreachable on iOS Safari / Firefox / native APK** (no Web Speech recognition), so it may **never** be required for any completion, unlock, or streak (foundation §6). It is a parallel achievement only.
- **Status:** **buildable-now (coarse, gated).** Precise per-tone scoring is **needs-owner** — the paid `enhancedReview` scorer (§11.3, foundation §7).
- **Validators:** `check-economy` (no heart); `check-progress-merge` (a `spoken` flag is a **sticky-OR** passed-flag; never routed through tier); `check-quest-logic` (if a spoken attempt grants XP, route it through the same "activity today" streak signal, don't double-count).

---

## 8. `speaking-repeat` `[gated]` — Say the target phrase; coarse verdict

- **Purpose:** Repeat a full target phrase aloud and get the same honest "understood you?" signal.
- **Skill trained:** speaking attempt at phrase level. Parent type of `tone-produce`.
- **Direction:** speak→verdict.
- **Data shape:** same `SpeakTarget` / `SpeakVerdict` as §7; target is `card.thai` (**never** `ph` — you match against the Thai the engine recognizes, not the romanization).
- **UI behaviour:** shared `SpeakingExercise.jsx`, same `speechRecognitionAvailable()` gate and null-render-when-absent rule. Shows the target (Thai/ph/en), a mic button, and the coarse verdict with a "play the model" TTS button when `ttsAvailable()`.
- **Grading:** `correct`/`close`/`wrong` matched to `card.thai`, never `ph`, never index. Repeated attempts allowed; no fixed order to shuffle (single-target), so `check-quiz-shuffle` does not apply.
- **Hearts:** **never.**
- **Mastery writes:** `correct`/`close` → `mastery-spoken` (same iOS/Firefox/native unreachability rule as §7).
- **Status:** **buildable-now (coarse, gated).**
- **Validators:** `check-economy`; `check-progress-merge` (sticky-OR); `check-session-isolation` (any per-attempt anti-farm / spam guard must be **device-scoped** and any user reward-lock must be registered in `resetUserScopedRefs`).

---

## 9. `register-judge` — Given a listener/situation → pick the register-appropriate Thai

- **Purpose:** Make politeness/register a **first-class trainable skill** (foundation §4) — pick the phrasing that fits the listener.
- **Skill trained:** register/politeness selection.
- **Direction:** situation→register-choice.
- **Data shape (NEW, main-deck; authored male-form, `pending`):**
  ```
  RegisterItem {
    id:str,
    listener:'elder'|'boss'|'friend'|'stranger'|'police',   // English prompt subject
    situationId: sit-*,                                       // foundation §2 id
    prompt:str,                                               // English, e.g. "You're speaking to your boss."
    options: RegisterOption[],
    correctOptionId:str,
    register: reg-intimate|reg-casual|reg-polite|reg-formal|reg-deferential, // foundation §4
    explanation:str,
    reviewStatus:'pending'|'needs-review'|'approved'
  }
  RegisterOption { id:str, cardId:int, register: reg-*, /* Thai rendered from the real card */ }
  ```
  Options reference **real cards** by `cardId` (Thai rendered via `displayCard`), each tagged with a canonical `reg-*` level. The **NEW `register` field** does not exist on the deck today (foundation §4) — add register variants as **cards first** (`check-mini-units`: no invented Thai), authored male-polite default (`voice.js:9`), dual-form/particle-contrast cards marked `isSpeakerStyleProtected` (`voice.js:44-47`) so the M/F flip cannot corrupt the teaching contrast. Map Dating `severity`→register per foundation §4 (gentle→`reg-casual`/`reg-polite`, moderate→`reg-casual`, strong→`reg-intimate`+"Rude", safety→cross-cutting) rather than re-modeling `severity`.
- **UI behaviour:** English listener/situation prompt; candidate **Thai** responses at differing `reg-*` levels as options. Preceded by an **ungraded register primer** (teach-before-test, foundation §4/§8 `check-dating-sequence`) — the primer costs no heart and no XP. Built **OUTSIDE the Dating module** (options are Thai, which Dating forbids).
- **Grading:** `option.id === correct.id` where `correct` is the register-appropriate response; shuffle both axes; add the component to `check-quiz-shuffle.mjs`.
- **Hearts:** **never (parallel track).** Register mastery is a parallel track, never an advance gate (foundation §4/§6).
- **Mastery writes:** none in the card ladder; feeds a **register achievement track** (mint milestone IDs via the existing helpers; add to the `activeCelebrationIds` baseline — `check-celebrations`).
- **Status:** **needs-content** — register tagging does not exist on the deck yet (foundation §1/§4). Component is buildable-now; blocked on tagged/authored register cards.
- **Conflict + resolution:** Thai answer options are **forbidden inside Dating** (`check-dating-quiz`, `datingQuiz.js:87,97,147-153`). **Resolution:** `register-judge` is a **main-deck** exercise built outside the Dating files; Dating stays recognition-only/English-option/reward-free. Do not add `register-judge` sources to the Dating scan set.
- **Validators:** `check-quiz-shuffle` (add file); `check-mini-units` (cards first, no invented Thai); `check-dating-sequence` (teach-before-test, no hearts/XP in the primer branch); `verify-voice-flip` + `verify-no-gender-mismatch` (author male-form; English annotation must match the Thai pronoun/particle; use `(male/female)` for dual-form); `check-economy` (no heart).

---

## 10. `dialogue` — Multi-turn situational exchange → pick the appropriate next line (with reply consequences)

- **Purpose:** Situational, multi-turn conversation where the learner's choice **changes the other speaker's next line** — situations-not-units, made interactive.
- **Skill trained:** situational comprehension + register-in-context + turn-taking.
- **Direction:** situation→response.
- **Existing surface:** `DialoguesView.jsx` renders scripted, linear dialogues today (reveal-next-line, no choice, no grading) from `DIALOGUES` (`src/data/reference.js:25+`). Line shape:
  ```
  DialogueLine { who:'you'|'her'|'him'|..., thai:str, ph:str, en:str, note?:str }
  ```
  Rendered via `displayLine(line, voice)` (`voice.js:137-145`), TTS via `speakThai` gated by `ttsAvailable()` (`DialoguesView.jsx:70-74`).
- **Data shape (NEW graded branching layer, `pending`):**
  ```
  DialogueScene {
    id:str, situationId: sit-*, setting:str,
    turns: DialogueTurn[]
  }
  DialogueTurn {
    speaker:'partner'|'you',
    // partner turns: a scripted line keyed by which branch we're on
    line?: DialogueLine,
    // 'you' turns: a graded choice
    choice?: {
      prompt:str,
      options: DialogueChoiceOption[],
      correctOptionId:str
    }
  }
  DialogueChoiceOption {
    id:str,
    line: DialogueLine,          // the Thai the learner would say (real card-backed)
    register?: reg-*,            // optional register tag
    nextBranch:str,              // which partner branch this reply leads to (consequence)
    outcome:'good'|'awkward'|'bad'
  }
  ```
  **Reply consequence** = each `DialogueChoiceOption.nextBranch` selects a different subsequent partner line, so an inappropriate reply visibly derails the exchange (e.g. too-blunt register → the partner reacts coldly). Because the branch graph is authored content, it introduces **no invented Thai**: every `line.thai` is backed by a real card/phrase.
- **UI behaviour:** extends `DialoguesView`. Partner line reveals; on a `you` turn the learner picks the next line; the pick drives which partner branch renders next. Keep the existing linear reveal for scripted-only scenes; the graded loop is additive.
- **Grading:** `option.id === correct.id`; the *consequence* (branch/outcome) is a teaching device, not a second grade. If a scene is replayable, shuffle option order per attempt (question order is fixed by the conversation, which is legitimate — the scanner note in §0.1 applies only to option order here) and add the component to `check-quiz-shuffle.mjs`.
- **Hearts:** **never** (foundation §1). A wrong reply costs a branch consequence, not a heart.
- **Mastery writes:** `mastery-recognized` for the card behind a correct comprehension choice (optional); primarily feeds the existing dialogue achievements (`first-dialogue`, `all-dialogues` — `gamification.js:17-18`).
- **Status:** **needs-content** — needs authored situational, branching dialogue (the current `DIALOGUES` are linear and un-branched). Component work is buildable-now; blocked on content.
- **Validators:** `check-quiz-shuffle` (add file, option-order shuffle on replay); `check-mini-units` spirit (no invented Thai — line Thai must be card-backed); `check-celebrations` (any new dialogue milestone minted via existing helpers).

---

## 11. Web-Speech feature-detection gate + paid-scoring upgrade seam

The two `[gated]` speaking types (§7, §8) and the audio-first listening types (§5, §6) depend on browser speech APIs that are **free, imprecise, and unevenly supported** (no `SpeechRecognition` on iOS Safari/Firefox/in-app webviews/Capacitor APK; `SpeechSynthesis` broader but not universal). This section defines the detection gate and the upgrade seam to a future paid scorer.

### 11.1 Detection — mirror the existing `ttsAvailable()` idiom

`ttsAvailable()` already exists for output (`src/lib/audio.js:271-274`): native → true; web → `!!window.speechSynthesis`. Add a symmetrical input detector in a new `src/lib/speech.js` (zero deps):

```
// src/lib/speech.js  (interface sketch — plain JS, no new npm dependency)
speechRecognitionAvailable(): boolean
```

Mirrors the existing `ttsAvailable()` idiom in `src/lib/audio.js`: returns `false` in native/Capacitor, else `true` iff `window` is defined and `window.SpeechRecognition || window.webkitSpeechRecognition` exists. Native returns `false` because the browser `SpeechRecognition` API is not reliable in the Android WebView — there is no coarse path there unless/until a native recognizer plugin is added, which would be a new dependency (out of scope).

**Gating rule (foundation §1):** a `[gated]` exercise renders **only** when `speechRecognitionAvailable()` is true. When absent it **renders nothing** — no button, no "unsupported" stub — mirroring `SocialLinks.jsx:43-46` (`if (links.length === 0) return null;`). The upstream lesson flow must also route *around* a gated step so a learner on iOS/Firefox never hits a dead end or an unreachable requirement (ties to `mastery-spoken` never being required, foundation §6).

### 11.2 Coarse verdict contract (free tier)

```
// SpeakingExercise.jsx consumes this; lib/speech.js provides it.
interface CoarseRecognizer {
  available(): boolean;                    // = speechRecognitionAvailable()
  listen(opts:{ lang:'th-TH', target:string }): Promise<{
    transcript: string,
    verdict: 'correct' | 'close' | 'wrong'  // WORD match to target, NOT tone
  }>;
}
```

The verdict is a word match, framed as "did the app understand you?" (foundation §5). It never claims tone accuracy.

### 11.3 Upgrade seam — the paid pronunciation scorer (`needs-owner`)

Precise, tone-aware scoring is the **Super differentiator** and is **needs-owner** (foundation §7): it ships only when the `VITE_PRONUNCIATION_SCORER` flag is set **AND** the `enhancedReview` entitlement is flipped from `COMING_SOON` to `AVAILABLE`. The entitlement slot already exists: `enhancedReview` (`src/config/entitlements.js:50`, currently `FEATURE_STATUS.COMING_SOON`), gated centrally by `canUseFeature('enhancedReview', stats)` (`entitlements.js:119-124`). Define the seam so the free path and the paid path share one interface:

```
// The scorer is an OPTIONAL, runtime-injected upgrade — NEVER `npm i`.
// It loads a script from a Supabase Edge Function only when the flag is set
// (mirrors how Stripe/OneSignal SDKs are runtime-loaded, not bundled).
interface PronunciationScorer extends CoarseRecognizer {
  // Adds per-tone + phoneme accuracy the free browser path CANNOT produce.
  score(opts:{ lang:'th-TH', target:string, expectedTone: tone-* }): Promise<{
    transcript: string,
    verdict: 'correct' | 'close' | 'wrong',
    toneAccuracy: number,          // 0..1  — the paid-only signal
    perTone?: { expected: tone-*, heard: tone-* }
  }>;
}

// Resolution at call time (signature only):
getRecognizer(stats): CoarseRecognizer
```

Resolves the free browser scorer vs a future paid scorer behind the same interface: when the `VITE_PRONUNCIATION_SCORER` flag is set **and** `canUseFeature('enhancedReview', stats)` is true it returns the runtime-injected, Super-entitled paid scorer (`loadPronunciationScorer()`); otherwise it returns the free, coarse browser recognizer feature-gated by §11.1 (`browserCoarseRecognizer()`).

**Honesty enforcement (foundation §7/§9):** keep `enhancedReview` at `COMING_SOON` until the scorer actually ships — never advertise tone scoring as delivered while only the coarse browser verdict exists. `check-economy.mjs:54-64` verifies advertised-vs-available Super benefits stay honest; `check-subscription-status` requires Super copy to come from the shared `entitlements`/`subscriptionStatus` source, not inline strings. Flipping `enhancedReview` to `AVAILABLE` is the **owner decision** that opens this seam.

---

## 12. Hearts + mastery summary (per type)

| `id` | Graded? | Hearts | Shuffle req. | Mastery write | Status |
|---|---|---|---|---|---|
| `flashcard-srs` | self-rate | never | n/a | `taught` (+opt. recognized/produced by face) | buildable-now (exists) |
| `recognition-th-en` | MCQ | Stage-Challenge only | both axes | `recognized` | buildable-now (exists) |
| `production-en-th` | MCQ | Stage-Challenge only | both axes | `produced` | buildable-now (exists) |
| `sentence-build` | id-sequence | never | tile bank (not pre-solved) | `produced` | buildable-now (exists) |
| `listen-meaning` | MCQ | never | both axes | `recognized` | buildable-now (net-new) |
| `tone-discriminate` | MCQ | never | both axes | none (tone track) | buildable-now (needs redesign) |
| `tone-produce` `[gated]` | speak verdict | never | n/a | `spoken` (unreachable on iOS/FF/native) | buildable-now coarse; precise = needs-owner |
| `speaking-repeat` `[gated]` | speak verdict | never | n/a | `spoken` (same) | buildable-now (coarse) |
| `register-judge` | MCQ | never | both axes | none (register track) | needs-content |
| `dialogue` | MCQ | never | option axis on replay | opt. `recognized` | needs-content |

Only `recognition-th-en` and `production-en-th`, **only inside the Stage Challenge**, ever touch a heart. Everything a learner does in Learn/Review is heart-free (`check-economy.mjs:34-39`).

---

## 13. Open questions / proposed foundation changes

These do not silently diverge from the foundation — they surface gaps for the owner.

1. **Audio-only exercises depend on an installed Thai TTS voice, not just `ttsAvailable()`.** `speakThai` fails silently when a device has `speechSynthesis` but no Thai voice (`audio.js:84,166-170`). `listen-meaning` and audio-first `tone-discriminate` become **unanswerable** in that case, yet `ttsAvailable()` returns true. Proposed: add a non-scored **"reveal the phrase"** escape (never a heart, never a mastery write) and/or a stricter `thaiVoiceLikely()` probe. Owner decision: acceptable degradation vs. a second detector.

2. **`tone-*` display IDs vs. stored `mid/low/...` values.** Foundation §5 canonicalizes `tone-mid … tone-rising`, but the shipped data and the grading string are the bare values (`gamification.js:39-62`, `TonesQuizSection.jsx:50`, matched verbatim by `check-quiz-shuffle.mjs:50`). This spec treats `tone-*` as a 1:1 display/analytics alias over the stored value and does **not** rename the field. Confirm this is the intended reading (renaming the stored field would break the validator).

3. **`register-judge` needs a real content axis that does not exist.** The deck has **no per-card `register` field** (foundation §4). This is `needs-content`: authoring the `elder/boss/friend/stranger/police` option sets means adding register-variant **cards first** (`check-mini-units`). Flag: without an owner-sized content sprint, `register-judge` cannot ship even though the component is buildable-now.

4. **`dialogue` reply-consequences need branching content the current data cannot express.** `DIALOGUES` (`reference.js:25+`) are linear, single-path scripts. The branching `DialogueScene`/`nextBranch` shape (§10) is new authored content, `pending`. Flag as `needs-content` + a content-authoring owner.

5. **`mastery-spoken` is permanently unreachable for a large share of users.** iOS Safari, Firefox, in-app webviews, and the Capacitor APK have no reliable `SpeechRecognition` (§11.1). The foundation already forbids requiring it for completion; this spec additionally recommends the mastery UI **visibly mark `spoken` as "optional / device-dependent"** so those users don't perceive a permanently incomplete track. Owner decision on copy.

6. **`tone-discriminate` redesign vs. `check-pedagogy-regression`.** Hiding the diacritic/romanization changes what `TonesQuizSection` renders. The protected string "Ear training" (`TonesQuizSection.jsx:41`) is preserved, but if the redesign removes or alters any other protected copy, the guard in `check-pedagogy-regression` must be updated **in the same commit** (foundation §8). Not a divergence — a coordination note.

---

*End of Spec 01 — Exercise Types. Elaborates the FOUNDATION CONTRACT; does not contradict it.*
