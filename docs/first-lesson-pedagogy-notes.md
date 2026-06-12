# First Lesson Pedagogy + Gamified Feedback (Pilot: Stage 1 Mission 1)

_Last updated: June 12, 2026. Original scope: the first ~10 minutes of the app —
the guided starter lesson (`FirstLessonFlow`) using `STAGE_1_MINI_UNIT_PILOT`
(`stage-1-introductions-politeness`). The full primer + quiz remains exclusive to
the pilot, but the `lessonIntro` / `missionRecap` teaching pattern born here has
since rolled out to ALL 96 mini-units (Stages 1-3 first, Stages 4-8 on June 12,
2026; see `docs/course-structure-roadmap.md`). No Thai card source content was
changed and Supabase, payments, ads, and subscriptions remain untouched._

## What changed (owner-feedback sprint)

The first learning experience was made clearer, more motivating, and more
game-like, while keeping Thai accuracy strict.

1. **Male-default learner perspective made explicit.** The course is already
   authored male-form (ผม / ครับ; `DEFAULT_VOICE = 'male'` in `lib/voice.js`).
   A small config (`lib/pedagogy.js`, `DEFAULT_SPEAKER_PERSPECTIVE = 'male'`)
   now names that decision in one place, the intro states the path uses a male
   speaker, and the primer explains it. A user-facing female toggle is **future
   work** (not built here).
2. **Thai Basics Primer** before the first cards (new `primer` step in
   `FirstLessonFlow`). Short (~2 min, 7 bite-size rules), friendly, skippable.
3. **Primer quick check** (new `quiz` step): 5 fast multiple-choice questions
   with soft audio + visual feedback. Forgiving — wrong never blocks; skippable.
4. **Correct/wrong feedback** (audio + visual) added to the primer quiz and the
   first-lesson challenge: `playCorrect()` / `playWrong()` Web Audio cues
   (calm/soft, not harsh) gated by the existing Sound Effects setting, plus a
   green glow on correct and a small nudge on wrong (both disabled under
   `prefers-reduced-motion`).
5. **Motivational mission recap** on the complete screen (data-driven from
   `unit.missionRecap`): a headline, a "you are building a real introduction"
   lead, and 3–5 achievement bullets. No fluency claims; no em/en dashes.
6. **Clearer quiz wording** (owner saw "Pick the Thai for My name is ___ (male)"
   mixing a sentence prompt with word options): the first-lesson challenge now
   says "Pick the Thai **sentence** for:" vs "Pick the Thai **word** for:" based
   on the card type, and `QuizTab` (Challenge) says "Choose the Thai word /
   sentence" in the en→Thai direction. Presentational only — challenge scope and
   selection logic are unchanged.

## Files touched

| File | Change |
| --- | --- |
| `src/data/miniUnits.js` | Added optional `lessonPrimer`, `pedagogyQuiz`, `missionRecap` to **STAGE_1_MINI_UNIT_PILOT only**. No card content changed; no Thai invented. |
| `src/lib/pedagogy.js` (new) | `DEFAULT_SPEAKER_PERSPECTIVE = 'male'` + `prefersMaleVoice()`. |
| `src/lib/sounds.js` | New `playCorrect()` / `playWrong()` (gesture- and Sound-Effects-gated like the others). |
| `src/lib/audio.js` | Prefer a male Thai TTS voice (web name heuristic + best-effort native `getSupportedVoices()`), with safe fallback. |
| `src/components/FirstLessonFlow.jsx` | New `primer` + `quiz` steps; recap on complete; feedback sounds; word/sentence prompt label; confetti (reduced-motion gated). |
| `src/components/QuizTab.jsx` | Word/sentence-aware prompt label (presentational). |
| `src/components/MissionCompleteRewardScreen.jsx` | Optional `achievements` prop (extensible; default empty = no change). |
| `src/styles/app.css` | Primer / quick-check / recap / reward-achievement styles + reduced-motion-guarded correct/wrong animations. |

## Thai accuracy safeguards

Every Thai string in the primer, quiz, and recap **already appears in the cards
this pilot unit teaches** — nothing was invented:

- สวัสดี (sà-wàt-dee) — hello (card 3396; polite form adds ครับ / ค่ะ)
- ผม (phǒm) — "I", male (card 1)
- ครับ (khráp) — male polite particle (card 2)
- ชื่อ (chêu) — name (card 1661)
- คุณ (khun) — you, polite (card 3)
- ใช่ (châi) — yes (card 251)
- ไม่ (mâi) — not / negation (card 250)
- ขอบคุณ (kòp kun) — thanks (card 2815)
- ผมชื่อ ___ ครับ (phǒm chûe ___ khráp) — "My name is ___" (card 330)

Accuracy rules followed:
- Male speakers commonly use **ครับ (khráp)**; female speakers use **ค่ะ (khâ)**.
- The app starts from a **male speaker** perspective (toggle = future work).
- **ผม (phǒm)** = a common male "I". **ฉัน (chán)** is mentioned once as a
  common "I" for women / general use, but is **not** over-taught or quizzed.
- **ไม่ (mâi)** = "not" (negation), usually **before** the negated word.
- **ไหม (mǎi)** = a yes/no **question** particle, usually near the **end**.
- The primer states explicitly these are written differently and behave
  differently even though the romanization can look similar. This mirrors the
  verified note already on card 250.
- Thai is described as tonal in simple, non-scary terms ("listen and copy the
  rhythm"). Word order is given as a concept ("a describing word often comes
  after the thing it describes") with no deep grammar.
- No culture/religion facts, statistics, or unverified claims were added.

### Needs native review (recommended, non-blocking)
- The primer/quiz/recap English glosses and romanization (above) are standard
  and drawn from existing card data, but a quick native pass on the primer copy
  tone is worthwhile before any wider rollout.
- ชื่อ romanization: the card dataset shows `chêu` (card 1661) while the pilot's
  sentence builder uses `chûe` (from card 330's phonetic). Both are existing
  data; the primer copy avoids picking one by referencing the card. Flagged for
  a native consistency pass (NOT changed here — no card data edits in scope).
- ฉัน romanization: the primer uses `chăn` to match the card dataset (card 1712
  `chăn`; nearly all ฉัน cards use `chăn`). Note `lib/voice.js` renders the
  female "I" as `chán` (acute) — a pre-existing inconsistency in the transform
  layer, left unchanged (out of pilot scope). Flag for a native consistency pass.

## TTS voice gender (limitation, documented)

TTS voice gender depends entirely on the **voices installed on the device**.
Neither the Web Speech API nor most native engines expose gender metadata, so
`lib/audio.js` uses a conservative name heuristic to prefer a likely-male Thai
voice and **falls back silently** to the default Thai voice when none is found.
Audio never hard-fails and sound buttons still reset via the existing
`.finally()` pattern. Many devices ship only a female Thai voice (e.g. iOS
"Kanya"); in that case the app still works and simply uses what is available.

## Future work (explicitly deferred)

- **Female speaker mode** (user-facing toggle; render flips already exist in
  `lib/voice.js`).
- **Re-open the primer** from Guide/Help after it is skipped (no suitable entry
  point exists today — deferred rather than forced).
- Per-answer confetti/stars (kept to a glow + completion confetti for now).
- Extending `lessonPrimer` / `pedagogyQuiz` / `missionRecap` to other missions,
  stage-level recaps, cultural notes, and a borrowed-English-word bonus. The
  data shape is intentionally generic so this is additive.

## Sprint 2: Stage 1 mission intros + recaps (June 8, 2026)

Extended the guided-teaching style to the **rest of Stage 1** (Stage 1 only;
Stages 2-8 deliberately untouched). Mission 1's pilot is unchanged.

**What changed**
- **Lesson intros** (`lessonIntro`) added to all 5 Stage 1 units. Each answers
  four beginner questions in a compact card: *You will learn / Why it matters /
  Listen for / Notice*. Rendered in `MiniUnitFlow`'s intro step (the pilot's
  first-run still uses the full primer; its `lessonIntro` only shows on replay).
- **Mission recaps** (`missionRecap`) added to the 4 remaining Stage 1 units
  (pilot already had one). Rendered on `MiniUnitFlow`'s complete step: a
  mission-specific headline, an encouraging lead, and 3-5 "now you can..."
  achievement bullets. Reuses the existing once-only `playCelebration`; **no new
  sound, no confetti** on mini-units (keeps Mission 1 special, avoids spam).
- **Feedback reuse:** `MiniUnitFlow` keeps its existing soft
  `playCharacterCorrect` / `playCharacterWrong` cues (no duplicate sounds added);
  the soft glow/nudge visual was extended to `.miniunit-option-*` (reduced-motion
  guarded). Sound Effects OFF still disables cues.
- **Thai basics re-open (resolves the 5002fb6 limitation):** the primer markup
  was extracted into a shared `ThaiBasicsPrimer` component (now used by both the
  first-lesson primer step and a new lightweight **"Open Thai basics" modal** on
  the Learn path). No new route, no global state, no schema; Escape / backdrop /
  close button all dismiss it.

**Data shape (Stage 1 only)**
```
lessonIntro: { lead, points: [{ label, text }] }     // ~120-200 words/mission
missionRecap: { headline, lead, achievements: [..] } // 3-5 bullets
```

**Thai accuracy:** every Thai string reuses words each unit already teaches
(verified against the card dataset). Greetings: สวัสดี/ขอบคุณ/ไม่เป็นไร/เจอกัน;
Yes-no: ใช่/ไม่/ไม่ใช่/เหรอ; Where: ที่ไหน/ห้องน้ำ/อยู่; Prices:
เท่าไหร่/เงิน/ถูก/แพง. No card content was changed, no Thai invented, ไม่ vs ไหม
kept distinct (the yes-no intro stays within its own cards and does not introduce
ไหม), no culture facts, no fluency claims, no em/en dashes.

> **Native review still recommended** for all new Stage 1 intro/recap copy (tone
> + romanization), logged in `docs/native-review-master-checklist.md`.

**Future plan:** expand this lessonIntro/missionRecap model to Stages 2-8 **only
after owner approval** — not in this sprint. The shared component and generic
metadata make that purely additive.

## Sprint 3: Stage 2 mission intros + recaps (June 8, 2026)

Applied the same guided-teaching style to **all of Stage 2** (Stage 2 only;
Stages 1 and 3-8 deliberately untouched). This is metadata-only: no Thai card
content, meanings, or phonetics were changed, and no Supabase, payments, ads,
subscriptions, or build artifacts were touched.

**What changed**
- **Lesson intros** (`lessonIntro`) added to all 10 Stage 2 mini-units. Each
  answers four beginner questions in a compact card: You will learn / Why it
  matters / Listen for / Notice. Rendered by the existing `MiniUnitFlow` intro
  step (no component logic changes were needed; it already reads `lessonIntro`).
- **Mission recaps** (`missionRecap`) added to all 10 Stage 2 mini-units: a
  mission-specific headline, an encouraging lead, and 3-5 "now you can..."
  achievement bullets. Rendered by the existing `MiniUnitFlow` complete step.
- **Reused feedback only:** no new sounds, no confetti, no logic changes. The
  correct/wrong cues and option glow/nudge from earlier sprints are unchanged.

**Data shape (Stage 2, same as Stage 1)**
```
lessonIntro: { lead, points: [{ label, text }] }     // ~120-220 words/mission
missionRecap: { headline, lead, achievements: [..] } // 3-5 bullets
```

**Stage 2 units covered (10):** stage-2-everyday-actions, stage-2-getting-things-done,
stage-2-talking-thinking, stage-2-out-and-about, stage-2-everyday-actions-2,
stage-2-sizes-and-speeds, stage-2-skills-and-qualities, stage-2-feelings,
stage-2-counting, stage-2-connectors-questions.

**Thai accuracy:** every Thai string in the new copy reuses words each unit
already teaches (its vocab cards, its sentence card, or its sentence-builder
tokens), verified against the card dataset. English glosses were aligned to the
card `en` values (for example เก็บ shown as "save", วาง shown as "lay"). No Thai
was invented, no card data changed. ไม่ vs ไหม are kept distinct: the connectors
unit describes มั้ย as a casual sentence-final question particle and states it is
different from ไม่ (not), without ever equating them. No culture, religion, or
statistics facts; no fluency claims; no em or en dash characters; no money symbols.
Word counts (lead plus the four point texts) were checked to fall in 120-220.

**Verification:** the new copy was machine-linted (word counts, banned characters,
required point labels, achievement counts) and adversarially reviewed by an
independent per-unit pass (Thai-accuracy lens + pedagogy/tone-safety lens). Minor
overclaim and gloss-consistency findings were corrected (for example a "talk about
what you are doing now / next" line that implied untaught tense/aspect, and a
"you already know" prior-knowledge assumption). All grammar generalizations are
logged for native review in `docs/native-review-master-checklist.md`.

> **Native review still recommended** for all new Stage 2 intro/recap copy (tone,
> glosses, and the simple grammar generalizations listed in the checklist).

**Future plan:** expand the same lessonIntro/missionRecap model to **Stages 3-8
only after owner approval** (Stage 2 is now done). The shared component and generic
metadata keep that purely additive.

## Sprint 4: Stage 3 mission intros + recaps (June 8, 2026)

Applied the same guided-teaching style to **all of Stage 3** (Stage 3 only;
Stages 1, 2, and 4-8 untouched). Metadata only: no Thai card content, meanings, or
phonetics changed; no Supabase, payments, ads, subscriptions, or build artifacts
touched.

**What changed**
- **Lesson intros** (`lessonIntro`) added to all 12 Stage 3 mini-units (You will
  learn / Why it matters / Listen for / Notice), rendered by the existing
  `MiniUnitFlow` intro step (no component logic changes).
- **Mission recaps** (`missionRecap`) added to all 12 Stage 3 mini-units (headline,
  lead, 3-5 achievement bullets), rendered by the existing complete step.
- **Reused feedback only:** no new sounds, no confetti, no logic changes.

**Stage 3 units covered (12):** daily-verbs, describing-things, people-family,
everyday-verbs-1, everyday-verbs-2, everyday-verbs-3, describing-things-2,
qualities-states, time-sequence, connectors-particles, home-places, animals.

**Thai accuracy:** every Thai string reuses words each unit already teaches (its
vocab, sentence, or builder tokens), glosses aligned to the card `en`. ไม่ vs ไหม
kept distinct. New simple grammar generalizations introduced here (อยาก before a
verb = want to, อยู่ / กำลัง for ongoing action, แล้ว for already/completed, the
question word near the end, particles add tone, แอร์ as an English loanword) are
all logged for native review in `docs/native-review-master-checklist.md`. No
culture/stats, no fluency claims, no em or en dashes, no money symbols. Word counts
(lead plus four points) fall in 120-220.

**Verification:** machine-linted (word counts, banned characters, labels,
achievement counts) and adversarially reviewed per unit (Thai-accuracy +
pedagogy/tone lenses). Minor gloss/scope fixes were applied (for example น่ะ was
re-described to match its card meaning of casual emphasis rather than "softening",
which is the role of อ่ะ; and a "most common question" superlative was softened).

> **Native review still recommended** for all new Stage 3 intro/recap copy.

**Future plan:** expand the same model to **Stages 4-8 only after owner approval**
(Stages 1-3 are now done). The shared component and generic metadata keep that
purely additive.


## Owner review feedback sprint addendum (June 12, 2026)

- Beginner copy is now romanization-first: the lessonPrimer bodies/headings,
  pedagogyQuiz labels and explains, the pilot missionRecap/lessonIntro, and all
  Stage 1 unit recaps/intros/achievements lead with romanization and keep Thai
  script in parentheses. Every romanization is copied verbatim from the ph of
  the card the unit teaches (e.g. khrap from card 2, sa-wat-dee from 3396,
  kop kun from 2815, mai-bpen-rai from 5361, rer from 5709, chue from card
  330's sentence). Known ph inconsistencies (chue vs cheu, sawatdee vs
  sa-wat-dee, mai-bpen-rai vs mai pen rai) remain native-review items.
- Flashcards default to English first (front = meaning, reveal = romanization
  then script). The first lesson and mini-units honor the same cardDirection
  preference and expose the toggle. The quiz direction wording ("Pick the Thai
  word/sentence for") is unchanged.
- First lesson, demo, and landing audio are capped at rate 0.72 (device TTS,
  tuned for beginner clarity); the app-wide default is 0.8.

## Speaking style sprint addendum (June 12, 2026)

- The female speaker mode that earlier sections call "future work" is now
  built. The user-facing setting is "Thai speaking style" (Settings, the
  demo, and the first lesson intro), persisted as stats.voice with male as
  the default and synced through profiles.settings like other preferences
  (no schema change).
- The first lesson primer no longer says the path is male-only: it teaches
  both styles and points at the toggle. The hardcoded male-speaker intro
  note in FirstLessonFlow is now dynamic and shows the selected style with
  the toggle next to it.
- lib/voice.js gained safety fixes: a no-flip list for cards the transform
  would corrupt (573 hair, 3396, 4380 กระผม, 5269), กระผม is never partially
  replaced, question detection is shared between the Thai and phonetic
  fields so คะ always pairs with khá, the female "I" is now chăn (was chán,
  the inconsistency flagged earlier in this file), and the batch2
  romanization scheme (pŏm / poem / krúp / kráp) now flips too.
- Sentence builder tiles and mission intro/recap prose follow the style via
  displayBuilder and transformText. Any prose line that mentions male or
  female speakers, or that already shows a female form, is left verbatim by
  design (a mechanical flip would falsify it). A few descriptive lines
  therefore stay male-form in female mode; they are listed in the native
  review checklist.
- TTS voice matching is best-effort: lib/audio.js prefers a Thai voice whose
  name matches the chosen style and otherwise uses the best available Thai
  voice. Voice gender still depends entirely on the device voices; nothing
  in the UI promises a male or female voice.
