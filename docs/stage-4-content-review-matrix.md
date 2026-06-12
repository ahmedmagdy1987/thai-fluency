# Stage 4 — Content Review Matrix (for owner / native-speaker review)

Date: May 30, 2026

This matrix lists every Stage 4 guided mini-unit and its sentence-builder so a
native speaker can **approve or flag** the wording and tokenization. No Thai card
content was changed — all units reference existing Stage 4 cards, and every
builder's tokens were derived from the source sentence card's own phonetic via
the app's `WORD_LOOKUP` / `autoBreakdown` (so the token phonetics reconstruct the
card phonetic exactly; nothing was invented). Verified by
`scripts/check-mini-units.mjs` against the **runtime** `CARDS` (the composed set,
not the inline `RAW_CARDS` in `cards.js`).

- **Stage 4 total cards:** 575 (theme: *Real Conversations*)
- **Coverage before this pass:** 16 vocab cards (2 units)
- **Coverage after this pass:** 112 vocab cards (14 units)
- **Sentence builders:** 12 of 14 units (3- and 4-token, auto-derived)

## A note on theming
Stage 4 is **sentence-rich** (151 sentence/phrase cards, 14 of which produce a
clean ≥3-token breakdown) and genuinely conversational, so unlike Stages 2–3 most
units carry a real conversational builder: small talk, plans, getting around,
asking distance, feelings, understanding, leaving. The vocabulary is still
verb-heavy (104 free verbs) and noun/adjective-heavy, so two "everyday verbs"
batches and a "describing states" unit group those. Food stays vocab-only (no
clean food sentence at this stage) and the home unit shows a relevant sentence
("ไฟดับ – the power is out") without a builder. Coverage is 112/575; the rest of
the deck stays available in Practice and the Stage Challenge.

## How to review
For each unit, confirm: (a) the vocab cards belong together / are useful at this
level, (b) the sentence + English meaning read naturally, (c) the builder tiles
split the sentence at correct Thai word boundaries. Mark anything to change in
the **Notes** column.

## Units (the 2 pre-existing units are included for completeness)

| Unit ID | Title | Topic | Vocab card IDs | Sentence card | Thai | Phonetic | English | Builder tokens (thai) | Token phonetics | Confidence | Needs native review |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| stage-4-actions-travel | Out and about | verbs | 31, 37, 41, 44, 46, 53, 55, 504 | 936 | ผมจะไปเที่ยว | phǒm jà bpai thîao | I am going traveling (male) | ผม · จะ · ไป · เที่ยว | phǒm · jà · bpai · thîao | high | yes |
| stage-4-tastes-describing | Tastes and qualities | adjectives | 66, 69, 71, 75, 80, 88, 1621, 1680 | 910 | อร่อยมากครับ | aròi mâak khráp | It is very delicious (male) | อร่อย · มาก · ครับ | aròi · mâak · khráp | high | yes |
| stage-4-small-talk-people | Small talk and people | people | 1810, 2153, 2308, 2548, 4053, 2180, 115, 3539 | 843 | คุณทำงานอะไร | khun tham-ngaan àrai? | What do you do for work? | คุณ · ทำงาน · อะไร | khun · tham-ngaan · àrai | high | yes |
| stage-4-plans-free-time | Plans and free time | time | 215, 216, 223, 1715, 1825, 2060, 2740, 2792 | 847 | คุณว่างไหม | khun wâang mǎi? | Are you free? | คุณ · ว่าง · ไหม | khun · wâang · mǎi | high | yes |
| stage-4-out-and-about | Out and about | places | 163, 172, 173, 1927, 3112, 608, 612, 606 | 845 | คุณจะไปไหน | khun jà bpai nǎi? | Where are you going? | คุณ · จะ · ไป · ไหน | khun · jà · bpai · nǎi | high | yes |
| stage-4-distance-directions | Distance and directions | directions/transport | 1755, 5724, 2559, 1910, 2585, 1937, 2276, 3290 | 934 | ไกลไหมครับ | glai mǎi khráp? | Is it far? (male) | ไกล · ไหม · ครับ | glai · mǎi · khráp | high | yes |
| stage-4-feelings-reactions | Feelings and reactions | emotions/states | 462, 475, 479, 3374, 3373, 2942, 2536, 2230 | 805 | ผมหนาวครับ | phǒm nǎao khráp | I am cold (male) | ผม · หนาว · ครับ | phǒm · nǎao · khráp | high | yes |
| stage-4-knowing-saying | Knowing and saying | verbs (cognition/speech) | 1720, 2142, 3546, 3585, 1801, 2835, 3430, 4313 | 1590 | ผมเข้าใจแล้ว | phǒm khâo jai láew | I understand now (male) | ผม · เข้าใจ · แล้ว | phǒm · khâo jai · láew | high | yes |
| stage-4-everyday-verbs-1 | Everyday verbs I | verbs | 517, 519, 1660, 2118, 3483, 2679, 2473, 3474 | 1587 | ผมลืมไปครับ | phǒm luem bpai khráp | I forgot (male) | ผม · ลืม · ไป · ครับ | phǒm · luem · bpai · khráp | medium | yes |
| stage-4-at-home | At home | home | 1004, 1005, 1012, 1017, 1022, 1027, 1029, 2930 | 1503 | ไฟดับ | fai dàp | The power is out | (no builder) | — | n/a | yes (sentence wording) |
| stage-4-everyday-verbs-2 | Everyday verbs II | verbs | 1650, 1848, 2406, 2446, 2738, 1919, 1943, 1908 | 4801 | ไม่ต้องแล้ว | mâi tâwng láew | It is no longer needed | ไม่ · ต้อง · แล้ว | mâi · tâwng · láew | high | yes |
| stage-4-describing-states | Describing states | adjectives | 1873, 1941, 3067, 3534, 2870, 2625, 2108, 2461 | 809 | ผมว่างครับ | phǒm wâang khráp | I am free / available (male) | ผม · ว่าง · ครับ | phǒm · wâang · khráp | high | yes |
| stage-4-leaving-going | Leaving and going | verbs (movement) | 2997, 3347, 3491, 2721, 2893, 2849, 3470, 4016 | 896 | ผมจะไปแล้ว | phǒm jà bpai láew | I am going to go now (male) | ผม · จะ · ไป · แล้ว | phǒm · jà · bpai · láew | high | yes |
| stage-4-food-and-dishes | Food and dishes | food | 130, 138, 139, 140, 143, 144, 149, 522 | — | — | — | — | (no builder) | — | n/a | no |

### Notes per unit
- **Small talk and people:** มิตร (2153) is the formal/literary word for
  "friend/ally"; เอ็ง (3539) is a very informal "you". Confirm both are wanted at
  this level, or flag for swap.
- **Plans and free time:** mixes time-of-day nouns (morning/afternoon/evening)
  with frequency adverbs (always/often/frequently) and งั้น ("then, in that
  case") — a planning vocabulary set rather than a single category.
- **Distance and directions:** ท่า (2276) is "position/posture", also used for a
  pier/landing; included for the navigation sense. Confirm it reads right here.
- **Everyday verbs I (1587 "ผมลืมไปครับ"):** marked medium — the third tile ไป/bpai
  is the aspectual "off/already" particle here, not literally "to go". Confirm the
  4-tile split and the English "I forgot" read naturally.
- **Knowing and saying:** literary speech/cognition verbs (เอ่ย utter, ท่อง
  recite, ตรอง reflect). Flag any you'd rather replace with more everyday verbs.
- **At home:** sentence 1503 "ไฟดับ" (the power is out) is shown for context — it
  fits the home theme alongside เสียง/sound and เงียบ/quiet — but has **no builder**
  (it does not split into known `WORD_LOOKUP` pieces).
- **Food and dishes:** vocab-only — Stage 4's clean food sentences are idiomatic
  or do not tokenize cleanly, so food is taught as vocabulary here.

## Skipped sentence-builder candidates (Stage 4)

These Stage 4 sentence/phrase cards were **not** turned into builders. They are
still available as normal cards (Practice / Stage Challenge). Stage 4 has 151
sentence/phrase cards; only 14 produced a clean, safe ≥3-token breakdown — 12 are
now used as builders, and the 3 clean leftovers below are good candidates held
back only because each unit carries one builder.

| Card ID | Thai | Phonetic | English | Skip reason |
| --- | --- | --- | --- | --- |
| 870 | ขอโทษนะครับ | khǎw thôht ná khráp | Excuse me / sorry (male) | Clean 3-token, but courtesy words have no themed Stage 4 vocab unit (taught earlier) |
| 872 | ขอบคุณมากครับ | khàwp khun mâak khráp | Thank you very much (male) | Clean 3-token, but courtesy words have no themed Stage 4 vocab unit |
| 879 | ผมขอโทษจริงๆ | phǒm khǎw thôht jing jing | I am really sorry (male) | Clean 3-token apology, held back (one builder per unit; courtesy is earlier-stage) |
| 5289 | จะไปไหนกัน | jà bpai nǎi gan | Where are you guys going? | Clean 4-token, but overlaps the "Out and about" / "Where are you going?" builder already used (845) |
| 854 | กี่โมงแล้ว | gìi mohng láew? | What time is it? | 2 tokens — too short to arrange |
| 1503 | ไฟดับ | fai dàp | The power is out | Shown as the At-home unit's sentence; phonetic does not split into known pieces |
| 4494 | ไม่เท่าไหร่ | mâi tâo-rài | Not that much | 2 tokens — too short |
| 4490 | ไม่ใช่ครับ | mâi châi krúp | No (male) | Written as one phonetic token; no clean internal split |
| (≈130 others) | various | — | various | Did not produce a clean `WORD_LOOKUP` breakdown (idiomatic, long, female-voice, time-expression, or unknown inner words) — deferred until reviewed |

## Outcome wanted
Please mark each "Needs native review" row **approved** or **change**, and note
any wording/tokenization fixes. Approved builders stay; flagged ones can be
demoted to sentence-shown-only (drop `sentenceBuilder`) without changing any card
data. Once approved, this pattern can be reused to deepen Stage 5 next. The 3–4
clean leftover courtesy/question sentences above are ready to promote into extra
units if you want even deeper Stage 4 coverage.

## Mission intros and recaps (added June 12, 2026)

Every Stage 4 unit above now carries a `lessonIntro` (what you will learn, why
it matters, what to listen for, what to notice) and a `missionRecap` (headline,
lead, 3-5 achievement bullets) shown by the guided mini-unit flow, matching the
pattern already shipped for Stages 1-3. All Thai strings inside them are reused
verbatim from the unit's own cards and builder tokens listed above (no new Thai
was written); phonetics are copied from the same cards.

**Native review for this section:** confirm the English gloss shown next to each
Thai word matches the card meaning, and flag any "Listen for" / "Notice" teaching
claim that reads wrong for Thai (for example which word marks the question, or
where a booster like มาก sits). Wording-only fixes; no card data is involved.
