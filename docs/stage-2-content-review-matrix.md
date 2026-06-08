# Stage 2 — Content Review Matrix (for owner / native-speaker review)

Date: May 30, 2026

This matrix lists every Stage 2 guided mini-unit and its sentence-builder so a
native speaker can **approve or flag** the wording and tokenization. No Thai card
content was changed — all units reference existing Stage 2 cards, and every
builder's tokens were derived from the source sentence card's own phonetic via
the app's `WORD_LOOKUP` / `autoBreakdown` (so the token phonetics reconstruct the
card phonetic exactly; nothing was invented).

- **Stage 2 total cards:** 269
- **Coverage before this pass:** 16 vocab cards (2 units)
- **Coverage after this pass:** 76 vocab cards (10 units)
- **Sentence builders:** 6 of 10 units (all 3-token, auto-derived)

## How to review
For each unit, confirm: (a) the vocab cards belong together / are useful at this
level, (b) the sentence + English meaning read naturally, (c) the builder tiles
split the sentence at correct Thai word boundaries. Mark anything to change in
the **Notes** column.

## Units

| Unit ID | Title | Topic | Vocab card IDs | Sentence card | Thai | Phonetic | English | Builder tokens (thai) | Token phonetics | Confidence | Needs native review |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| stage-2-everyday-actions | Everyday actions | verbs | 16, 36, 39, 45, 56, 505, 506, 21 | 814 | ผมรักคุณ | phǒm rák khun | I love you (male) | ผม · รัก · คุณ | phǒm · rák · khun | high | yes |
| stage-2-getting-things-done | Getting things done | verbs | 42, 500, 502, 509, 512, 514, 1609, 1672 | 813 | ผมไม่ชอบ | phǒm mâi chôp | I do not like it (male) | ผม · ไม่ · ชอบ | phǒm · mâi · chôp | high | yes |
| stage-2-talking-thinking | Talking and thinking | verbs | 2128, 2206, 2194, 3222, 2122, 2081, 1727, 1989 | 818 | ผมไม่รู้ | phǒm mâi rúu | I do not know (male) | ผม · ไม่ · รู้ | phǒm · mâi · rúu | high | yes |
| stage-2-out-and-about | Out and about | verbs | 2336, 2816, 2056, 2774, 1677, 1732, 1974, 1739 | 5389 | ไปไหนมา | bpai nǎi maa | Where did you go? | ไป · ไหน · มา | bpai · nǎi · maa | high | yes |
| stage-2-everyday-actions-2 | Everyday actions II | verbs | 1692, 2037, 2646, 2506, 5718, 2013, 2888, 3656 | 4738 | ทำไปเลย | tham bpai loei | Go ahead and do it | ทำ · ไป · เลย | tham · bpai · loei | medium | yes |
| stage-2-sizes-and-speeds | Sizes and speeds | adjectives | 63, 65, 78, 79, 2923, 2737, 1833, 1622 | — | — | — | — | (no builder) | — | n/a | no |
| stage-2-skills-and-qualities | Skills and qualities | adjectives | 77, 1973, 2235, 5715, 3012, 2014, 1982, 1762 | 5228 | เก่งมาก | gèng mâak | Very good! / Nice job! | (no builder) | — | n/a | yes (sentence wording) |
| stage-2-feelings | Feelings | emotions/states | 473, 477, 5731, 2532, 2969, 1747 | 800 | ผมหิวครับ | phǒm hǐu khráp | I am hungry (male) | ผม · หิว · ครับ | phǒm · hǐu · khráp | high | yes |
| stage-2-counting | Counting | numbers | 232, 233, 235, 236, 239, 241 | — | — | — | — | (no builder) | — | n/a | no |
| stage-2-connectors-questions | Connectors and questions | grammar/particles | 256, 291, 292, 4038, 5704, 1275, 1625, 1598 | 857 | ใครครับ | khrai khráp | Who? (male) | (no builder) | — | n/a | yes (sentence wording) |

### Notes per unit
- **Everyday actions II (4738 "ทำไปเลย"):** "เลย" here is the colloquial "go on /
  just do it" sense; confirm the English "Go ahead and do it" reads right. Vocab
  includes a few blunt verbs (ตี hit, ตบ slap, ดูด suck) — flag if you prefer
  gentler everyday verbs.
- **Feelings:** "หิว/hungry" is the sentence's feeling word; the vocab set covers
  related states (afraid, shy, discouraged, awake, drunk, happiness). Flag any
  you'd rather not teach this early (e.g. เมา "drunk").
- **Connectors and questions:** particles only (must, with, or, let's, "right?",
  "and you?", is, from) — confirm the casual particles มั้ย / ล่ะ are desired at
  this level.
- **Skills and qualities / Sizes and speeds / Counting:** vocab-only or
  sentence-shown-without-builder; no tokenization risk.

## Skipped sentence-builder candidates (Stage 2)

These Stage 2 sentence/phrase cards were **not** turned into builders. They are
still available as normal cards (Practice / Stage Challenge).

| Card ID | Thai | Phonetic | English | Skip reason |
| --- | --- | --- | --- | --- |
| 816 | ผมเข้าใจ | phǒm khâo jai | I understand (male) | 2 tokens (ผม + เข้าใจ) — too short to arrange |
| 857 | ใครครับ | khrai khráp | Who? (male) | 2 tokens — shown as the Connectors unit's sentence, no builder |
| 5228 | เก่งมาก | gèng mâak | Very good! | 2 tokens — shown as the Qualities unit's sentence, no builder |
| 4595 | เก่งนะ | gèng ná | You are skilled (casual) | 2 tokens — too short |
| 4741 | อะไรนะ | àrai ná | What did you say? | 2 tokens — too short |
| 4763 | ใครบอก | khrai bàwk | Who told you that? | 2 tokens — too short |
| 5397 | หิวมาก | hǐu mâak | I'm so hungry! | 2 tokens — too short |
| 5439 | ไม่ไม่ไม่ | mâi mâi mâi | No! No! No! | Repetition, not a buildable sentence |
| (≈58 others) | various | — | various | Did not produce a clean `WORD_LOOKUP` breakdown (idiomatic, long, or unknown inner words) — deferred until reviewed |

## Outcome wanted
Please mark each "Needs native review" row **approved** or **change**, and note
any wording/tokenization fixes. Approved builders stay; flagged ones can be
demoted to sentence-shown-only (drop `sentenceBuilder`) without changing any card
data. Once approved, this pattern can be reused to deepen Stage 3 next.

## Mission intros + recaps added (Sprint 3, June 8, 2026)

All 10 Stage 2 units above now carry beginner `lessonIntro` and `missionRecap`
metadata, matching the Stage 1 teaching model (rendered by the existing
`MiniUnitFlow` intro and complete steps, no component logic changes). This is the
same lightweight "feel like a teacher and a game" copy: a short intro card (You
will learn / Why it matters / Listen for / Notice) before the cards, and a
"now you can..." recap on completion.

- **Metadata only.** No Thai card content, meanings, or phonetics were changed, and
  no Thai was invented. Every Thai string in the new copy is one of the unit's own
  vocab/sentence/builder words. English glosses were aligned to each card's `en`
  (for example เก็บ shown as "save", วาง shown as "lay").
- **Safety.** No culture/religion/statistics, no fluency claims, no em or en dash
  characters, no money symbols. ไม่ vs ไหม / มั้ย kept distinct (มั้ย is described
  as a casual sentence-final question particle, explicitly different from ไม่).
- **Checked.** Word counts (lead + four points) fall in 120-220; achievement
  bullets are 3-5 per unit. The copy was machine-linted and adversarially reviewed
  (Thai-accuracy + pedagogy/tone lenses) before commit.
- **Native review:** the simple grammar generalizations in the new copy (for
  example "ไม่ goes before the verb", "มาก follows a describing word", "สิบ helps
  build larger numbers", เย็น also meaning "evening") are listed for a native pass
  in `docs/native-review-master-checklist.md`. Non-blocking.

**Stage-level intro note (Part 11):** a dedicated per-stage intro surface was NOT
added. `MiniUnitFlow` renders per-unit intros and there is no per-stage intro slot
today; building one is documented here as future work rather than forcing a new
system. The first Stage 2 unit's `lessonIntro` already opens by framing Stage 2 as
moving from first introductions into everyday actions.

**Next:** expanding this intro/recap model to Stages 3-8 is deferred pending owner
approval.
