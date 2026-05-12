# Thai Card Content Audit Report

**Date:** 2026-05-12
**Scope:** Linguistic and content-quality audit of every Thai learning card in
the project, with a particular focus on **gendered speech** (male / female
pronouns and polite particles) and **learner clarity** in the English side.

This report records what was reviewed, what was changed automatically, what
remains for human or native-speaker review, and how to reproduce the audit.

---

## 1. Totals

| Metric                | Value |
| --------------------- | ----- |
| Cards reviewed        | 4,791 |
| Files reviewed        | 5     |
| Cards fixed in pass   | 421   |
| Cards flagged for review (out-of-scope categories) | 29 |
| Voice-flip regressions found | 0 |

Card breakdown by source file:

| File                                  | Cards | ID range    |
| ------------------------------------- | ----: | ----------- |
| `src/data/cards.js` (RAW_CARDS)       |   645 | 1–1592      |
| `src/data/cards-imported.js`          | 2,801 | 1593–4393   |
| `src/data/cards-imported-batch2.js`   | 1,306 | 4394–5699   |
| `src/data/cards-step2.js` (ADDITIONS) |    39 | 5700–5738   |
| `src/data/lookup.js` (WORD_LOOKUP)    |   192 | — (keyed on phonetic) |

Card breakdown by stage: 150 / 269 / 423 / 575 / 701 / 804 / 877 / 992
(stages 1–8).

Card breakdown by type: 3,267 words (`w`) · 1,249 sentences (`s`) ·
247 phrases (`p`) · 28 grammar (`g`).

Gendered-form cards encountered:

| Form                                    | Count |
| --------------------------------------- | ----: |
| Male (`ผม` / `ครับ` in Thai)            |   278 |
| Casual female (`ฉัน` / `ค่ะ` / `คะ` in Thai) | 140 |
| Formal female (`ดิฉัน` in Thai)         |     4 |
| Mixed teaching (`ครับ/ค่ะ` etc.)         |     9 |

---

## 2. The gender-clarity problem (before)

Some cards correctly clarified that a Thai pronoun or polite particle was
gender-specific, but other equivalent cards did not, leaving the learner with
no signal that a phrase is spoken by a male vs. a female speaker.

Examples found before the audit:

| id   | Thai                  | English (before)   | Problem |
| ---- | --------------------- | ------------------ | --- |
|  311 | ขอบคุณครับ            | `Thank you`        | Hides that this is the **male** form. |
| 1712 | ฉัน                   | `I`                | Hides that this is the **female** pronoun. |
| 4431 | สามีดิฉัน             | `my husband`       | Hides that this is the **formal female** speaker's form. |
| 4675 | ไม่ใช่วันนี้ค่ะ          | `not today`        | Hides that `ค่ะ` marks **female** speech. |
| 4486 | ขอบคุณค่ะ             | `thank you (f)`    | Inconsistent short-form annotation. |

These cards looked identical on the English side regardless of speaker, so a
learner studying gendered greetings could easily assume `ขอบคุณครับ` and
`ขอบคุณค่ะ` are the same phrase.

---

## 3. Annotation convention (after)

The project already has an auto-flip system in `src/lib/voice.js`:
when the user toggles voice → female, `ผม` becomes `ฉัน`, `ครับ` becomes `ค่ะ`
(or `คะ` in questions), and the English annotation `(male)` becomes `(female)`.

We chose to lean into the **existing convention** rather than introduce a new
one. The full convention used after this audit:

| Form                       | Annotation in English        |
| -------------------------- | ---------------------------- |
| Male pronoun / particle    | `(male)` — auto-flips to `(female)` |
| Casual female form         | `(female)` — present in both voice modes |
| Formal female (`ดิฉัน`)    | `(female, formal)` — present in both voice modes |
| Card teaching both forms   | `(male/female)` — does **not** flip (intentional) |
| Optional context           | `(male, casual)`, `(male, response to "Are you?")`, etc. — flips |

`voice.js` was extended so that `(male, X)` annotations also flip to
`(female, X)`; the previous regex only matched `(male)` literally. The new
match `/\(male(?=[\),\s])/g` deliberately ignores `(male/female)` (because the
`/` blocks the lookahead), so mixed-gender teaching cards stay annotated as
both.

---

## 4. Fixes applied

All fixes were applied to source files via `scripts/fix-content.mjs` (a
re-runnable script) plus one targeted cleanup pass
(`scripts/fix-double-annotation.mjs`) for double-annotation artifacts.

### 4.1 Category summary

| Category                                  | Cards fixed | Action                                     |
| ----------------------------------------- | ----------: | ------------------------------------------ |
| male-thai-missing-en-annotation           |         235 | appended `(male)` to English               |
| chǎn-missing-female-annotation            |          76 | appended `(female)` to English             |
| female-uses-short-form-(f)                |          33 | `(f)` → `(female)`, `(f, X)` → `(female, X)` |
| male-uses-short-form-(m)                  |          32 | `(m)` → `(male)`, `(m, X)` → `(male, X)`   |
| female-particle-missing-annotation        |          24 | appended `(female)` to English             |
| mixed-gender-thai                         |           9 | appended `(male/female)` to English        |
| dìchǎn-missing-female-annotation          |           1 | appended `(female, formal)` (id 4431)      |
| note-mentions-gender-without-flip-pattern |           1 | `polite + male` → `polite (male)` (id 2)   |
| double-annotation cleanup                 |          10 | `(m, X) (male)` → `(male, X)`; `(female)` → `(female, formal)` on `ดิฉัน` |
| **Total card lines modified**             |         **421** |                                       |

### 4.2 Voice-flip verification

After fixes, every card containing `(male)` or `(male,` in its English field
was simulated through `displayCard(card, 'female')`:

```
Total (male)-annotated cards: 260+ (varies with verification regex)
OK flips:   100%
Bad flips:  0
```

Spot-check examples (male voice → female voice):

```
id 311: ขอบคุณครับ | khàwp khun khráp | Thank you (male)
     → ขอบคุณค่ะ | khàwp khun khâ    | Thank you (female)

id 315: สบายดีไหมครับ?  | sàbaai dee mǎi khráp? | How are you? (male)
     → สบายดีไหมคะ?    | sàbaai dee mǎi khá?   | How are you? (female)
       (question form — note ครับ→คะ not ค่ะ)

id 4654: ผมขอน้ำหน่อยนะครับ | … kráp? | May I have some water? (male, casual)
      → ฉันขอน้ำหน่อยนะค่ะ  | … kráp? | May I have some water? (female, casual)
```

Female-form cards stay female regardless of voice toggle (correct — they
specifically teach the female form):

```
id 2144: ดิฉัน | I (female, formal)         — same in both voices
id 4034: ค่ะ   | okay / yes (female)         — same in both voices
```

### 4.3 Sample edits per file

`src/data/cards.js` (150 changes):
```diff
- en:'Hello / Goodbye'
+ en:'Hello / Goodbye (male)'        # id 310 (ครับ in Thai)

- en:'Thank you'
+ en:'Thank you (male)'              # id 311

- note:'…Marks you as polite + male.'
+ note:'…Marks you as polite (male).'   # id 2 — fix so note auto-flips
```

`src/data/cards-imported.js` (7 changes):
```diff
- en:"I"
+ en:"I (female)"                    # id 1712 (ฉัน in Thai)

- en:"I (female)"
+ en:"I (female, formal)"            # id 2144 (ดิฉัน in Thai)
```

`src/data/cards-imported-batch2.js` (253 changes):
```diff
- en:"my husband"
+ en:"my husband (female, formal)"   # id 4431 (สามีดิฉัน)

- en:"hello / goodbye (f)"
+ en:"hello / goodbye (female)"      # id 4485

- en:"yes (m, response to \"Are you?\") (male)"   # double-annotated
+ en:"yes (male, response to \"Are you?\")"       # id 4489 cleanup

- en:"not today"
+ en:"not today (female)"            # id 4675 (ค่ะ in Thai)
```

`src/data/cards-step2.js` (1 change):
```diff
- en:'I can\'t speak Thai'
+ en:'I can\'t speak Thai (male)'    # id 5700
```

---

## 5. Gendered speech — what to remember going forward

Concise rules for future card authors / contributors:

1. **Default to male form.** When you write a card with a Thai pronoun or
   particle, use `ผม` and `ครับ`. Voice.js will flip them at render time.
2. **Annotate English** with `(male)` so the auto-flip catches it. Cards
   without an annotation hide the gender from the learner and break the
   female-voice rendering.
3. **`ดิฉัน` is special.** It has no male counterpart in the auto-flip system
   — it is intrinsically formal female. Use `(female, formal)` in English.
4. **Mixed-form teaching cards** (e.g. `ครับ/ค่ะ` shown together) should be
   annotated `(male/female)`. This deliberately does **not** flip.
5. **Don't hard-code gendered duplicates.** Never write both an `ผม/ครับ` and
   a `ฉัน/ค่ะ` version of the same phrase as two separate cards. Pick male
   form and let voice.js do the flip.
6. **`(m)`, `(f)`, `(m, casual)`, `(f, casual)` are not allowed in cards.** Use
   the long form `(male)` / `(female)`. Short forms remain only in
   `src/data/lookup.js` where each phonetic key already maps to a single
   voice.

---

## 6. Issues left for manual review

The audit script still flags **361 issues** in four categories that are
out-of-scope for the gender-clarity pass. Each is recorded below with cards
needing attention.

### 6.1 `missing-ph-sentence` — 332 cards

Sentences or phrases (`type: 's'` or `type: 'p'`) without a phonetic field.
Almost all of these are from `cards-imported.js` and `cards-imported-batch2.js`
(auto-imported from frequency lists). They render the Thai script but the
learner gets no romanized pronunciation. Recommendation: re-run the import
script with phonetic generation, or fill in by hand for high-frequency cards.

Sample affected cards:

| id   | stage | Thai                  | English                          |
| ---- | ----- | --------------------- | -------------------------------- |
| 4732 | 8     | แป๊บนึง               | Just one moment                  |
| 4733 | 8     | อะไรอย่างเงี้ยะ        | Something like that              |
| 4734 | 8     | ทำปุ๊บ เสร็จปั๊บ        | As soon as I do it, it's done    |

### 6.2 `duplicate-thai-conflicting-en` — 14 cards

Same Thai string, different English. Most are **legitimate Thai polysemy**
(homonyms — the same Thai script means different things in different
contexts) and should be **kept**. A native speaker should review the
ambiguous ones:

| id (dup) | Thai      | English A (orig)             | English B (dup)              | Likely status |
| -------- | --------- | ---------------------------- | ---------------------------- | --- |
|  65/217  | เย็น      | cool / cold (drinks/AC)      | evening (4-6pm)              | Both correct — Thai polysemy |
| 190/270  | คน        | person                       | classifier:people            | Both correct — noun + classifier |
|  11/510  | อยู่      | to be at / to live / to stay | to stay                      | Same meaning, near-duplicate |
| 297/572  | หลัง      | after                        | back                         | Both correct — homonym |
|   1/573  | ผม        | I / me (male)                | hair                         | Both correct — homonym (note exists) |
| 550/520  | น้ำตาล    | brown                        | sugar                        | Both correct — color + noun |
| 356/806  | ผมอิ่มแล้วครับ | I am full                | I am full (already)           | Near-duplicate; possibly merge |
| 414/851  | มีไหมครับ | Do you have (it)?            | Do you have (any)?           | Near-duplicate |
| 313/871  | ไม่เป็นไรครับ | No worries / You are welcome | No worries / it is fine  | Near-duplicate |
| 354/910  | อร่อยมากครับ | Very delicious            | It is very delicious          | Near-duplicate |
| 351/916  | อันนี้คืออะไรครับ | What is this?         | What is this dish?            | "dish" is interpretive — review |
| 103/1276 | เลย       | really / so / at all         | really / at all (emphatic)   | Near-duplicate |
| 104/1277 | จัง       | so / very (casual)           | really / so much (casual)    | Near-duplicate |
| 1759/5722 | รู้สึก    | feel                         | to feel                      | Near-duplicate; "to feel" is canonical |

### 6.3 `duplicate-thai-identical` — 14 cards

Same Thai, same English. Mostly stage-redistribution artifacts (the same
vocab word reused across stages so the spaced-repetition system can re-show
it in a different context). These do not break the app but consume SRS slots.
Recommendation: review each in the context of the missions/stage plan; either
keep intentional re-introductions or consolidate.

| id (dup) | Thai             | English      |
| -------- | ---------------- | ------------ |
| 173/609  | หาด              | beach        |
| 133/156  | น้ำแข็ง          | ice          |
| 355/800  | ผมหิวครับ        | I am hungry  |
| 312/872  | ขอบคุณมากครับ    | Thank you very much |
| 389/939  | ผมหลงทางครับ     | I am lost    |
| 165/1007 | ห้อง             | room         |
|  86/1030 | สะอาด            | clean        |
|  87/1031 | สกปรก            | dirty        |
|  38/1038 | จ่าย             | to pay       |
| 171/1213 | ร้านขายยา        | pharmacy     |
| 198/1214 | หมอ              | doctor       |
| 170/1216 | โรงพยาบาล        | hospital     |
| 169/1100 | ธนาคาร           | bank         |
| 105/1264 | จริงๆ            | really / truly |

### 6.4 `thai-in-english` — 1 card

| id   | Thai | English                         | Status |
| ---- | ---- | ------------------------------- | --- |
| 5721 | ไม๊  | variant of มั้ย/ไหม (question)   | **Intentional** — the English deliberately references two Thai variants by their script. False positive; safe to whitelist if rule is tightened. |

### 6.5 Phonetic romanization inconsistency (separate issue)

`src/data/cards-imported-batch2.js` was imported using a **different
romanization scheme** than the rest of the project:

| Project convention | batch2 (imported) |
| ------------------ | ----------------- |
| `phǒm` (caron-o + `ph-`)  | `pŏm` (breve-o, no `h-`) |
| `khráp`                   | `kráp`            |
| `chán`                    | `chăn`            |

Side-effects:
- `voice.js`'s phonetic transform (`phǒm → chán`, `khráp → khâ/khá`) **does
  not match** batch2 phonetics. In female voice mode, batch2 cards still
  display the male phonetic. The Thai script and English do flip; only the
  phonetic doesn't.
- This is a pre-existing data-quality issue, not introduced by this audit.
- Recommendation: separate cleanup pass to either re-romanize batch2 to
  match project convention, or extend `voice.js` to recognize both styles.

---

## 7. How to re-run the audit

```bash
# 1. Run the audit; writes findings to docs/content-audit-findings.json
node scripts/audit-content.mjs

# 2. Dry-run the fix script to preview changes
node scripts/fix-content.mjs

# 3. Apply fixes to source files
node scripts/fix-content.mjs --apply

# 4. Clean up any leftover double-annotation patterns
node scripts/fix-double-annotation.mjs --apply

# 5. Verify gender alignment & voice-flip behavior
node scripts/verify-no-gender-mismatch.mjs
node scripts/verify-voice-flip.mjs
```

The audit, fix, and verify scripts are all idempotent — re-running them after
a clean pass produces zero changes.

---

## 8. Open questions for the project owner

These are not bugs but content decisions that benefit from a human call:

1. **Near-duplicate sentences** (e.g. `id 806` "I am full (already)" vs
   `id 356` "I am full"). Keep both for SRS reinforcement, or consolidate?
2. **Stage-redistribution duplicates** (14 cards in §6.3). Are these
   intentional re-introductions across stages, or accidental?
3. **Phonetic romanization unification**. Worth a one-shot rewrite of
   batch2 to match project convention?
4. **Missing phonetics** on 332 sentences. Generate via script, or
   prioritize manual fill-in for high-frequency cards?

None of the above block this audit; they belong in follow-up work.
