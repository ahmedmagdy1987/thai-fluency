# Stage 6 — Content Review Matrix (for owner / native-speaker review)

Date: May 30, 2026

This matrix lists every Stage 6 guided mini-unit and its sentence-builder so a
native speaker can **approve or flag** the wording and tokenization. No Thai card
content was changed — all units reference existing Stage 6 cards, and every
builder's tokens were derived from the source sentence card's own phonetic via
the app's `WORD_LOOKUP` / `autoBreakdown` (so the token phonetics reconstruct the
card phonetic exactly; nothing was invented). Verified by
`scripts/check-mini-units.mjs` against the **runtime** `CARDS` (the composed set,
not the inline `RAW_CARDS` in `cards.js`).

- **Stage 6 total cards:** 804 (theme: *Intermediate Power*)
- **Coverage before this pass:** 14 vocab cards (2 units)
- **Coverage after this pass:** 110 vocab cards (14 units)
- **Sentence builders:** 13 of 14 units (3- to 5-token, auto-derived)

## A note on theming
Stage 6 is large and concept-heavy: 593 word cards dominated by **"things"/nouns
(158), verbs (133), and adjectives (105)**, plus 210 sentence cards (13 with a
clean ≥3-token breakdown). The clean sentences are squarely intermediate and
practical (wants, restaurant requests, scheduling/appointments, farewells,
past-tense narration, well-wishing, allergies), so 11 of the 12 new units carry a
genuine builder — including several longer **4- and 5-token** lines that suit an
intermediate level. The "Describing qualities" adjectives unit is vocab-only
because Stage 6's clean adjective sentences are 2-token or idiomatic. Coverage is
110/804; the rest of the deck stays available in Practice and the Stage Challenge.

## How to review
For each unit, confirm: (a) the vocab cards belong together / are useful at this
level, (b) the sentence + English meaning read naturally, (c) the builder tiles
split the sentence at correct Thai word boundaries. Mark anything to change in
the **Notes** column.

## Units (the 2 pre-existing units are included for completeness)

| Unit ID | Title | Topic | Vocab card IDs | Sentence card | Thai | Phonetic | English | Builder tokens (thai) | Token phonetics | Confidence | Needs native review |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| stage-6-wants-and-plans | Wants and plans | verbs | 40, 50, 1614, 1659, 1683, 1745, 1759, 1823 | 824 | ผมอยากเรียนภาษาไทย | phǒm yàak rian phaa-sǎa thai | I want to learn Thai (male) | ผม · อยาก · เรียน · ภาษาไทย | phǒm · yàak · rian · phaa-sǎa thai | high | yes |
| stage-6-health-and-body | Health and body | health | 1202, 1210, 1984, 2807, 2041, 2222 | 914 | ผมแพ้อาหารทะเล | phǒm pháe aahǎan thá-leh | I am allergic to seafood (male) | ผม · แพ้ · อาหารทะเล | phǒm · pháe · aahǎan thá-leh | high | yes |
| stage-6-people-family | People and family | people | 191, 192, 2383, 2436, 2508, 3124, 3611, 3829 | 897 | เจอกันใหม่นะครับ | jer gan mài ná khráp | See you again (male) | เจอกัน · ใหม่ · นะ · ครับ | jer gan · mài · ná · khráp | high | yes |
| stage-6-days-and-dates | Days and dates | time | 211, 212, 222, 1864, 2632, 2762, 3743, 3996 | 893 | เมื่อวานผมไปตลาด | mêua waan phǒm bpai talàat | Yesterday I went to the market (male) | เมื่อวาน · ผม · ไป · ตลาด | mêua waan · phǒm · bpai · talàat | high | yes |
| stage-6-times-and-waiting | Times and waiting | time | 2795, 3648, 3183, 4017, 5708, 3219, 1769, 3110 | 876 | รอสักครู่นะครับ | raw sàk khrûu ná khráp | Please wait a moment (male) | รอ · สักครู่ · นะ · ครับ | raw · sàk khrûu · ná · khráp | high | yes |
| stage-6-at-a-restaurant | At a restaurant | food | 137, 529, 4389, 5706, 5710, 4294, 4333, 70 | 832 | ขอเมนูหน่อยครับ | khǎw meh-nuu nàwy khráp | May I have the menu (male) | ขอ · เมนู · หน่อย · ครับ | khǎw · meh-nuu · nàwy · khráp | high | yes |
| stage-6-rest-and-home | Rest and home | home | 1002, 1006, 1008, 1011, 3453, 2821, 1030, 2773 | 827 | ผมอยากพักผ่อน | phǒm yàak phák-phàwn | I want to rest (male) | ผม · อยาก · พักผ่อน | phǒm · yàak · phák-phàwn | high | yes |
| stage-6-out-in-town | Out in town | places | 161, 167, 169, 1662, 1819, 2197, 2453, 610 | 957 | ผมจะกลับมาอีก | phǒm jà glàp maa ìik | I will come back again (male) | ผม · จะ · กลับ · มา · อีก | phǒm · jà · glàp · maa · ìik | high | yes |
| stage-6-banking-paperwork | Banking and paperwork | admin | 1100, 1103, 1111, 1119, 1123, 1127, 1129, 1132 | 1505 | มาวันนี้ได้ไหมครับ | maa wan níi dâai mǎi khráp? | Can you come today? (male) | มา · วันนี้ · ได้ · ไหม · ครับ | maa · wan níi · dâai · mǎi · khráp | high | yes |
| stage-6-emotions-moods | Emotions and moods | emotions | 461, 463, 465, 466, 468, 478, 1838, 3871 | 959 | รักษาตัวด้วยนะ | rák-sǎa tua dûai ná | Take care of yourself | รักษาตัว · ด้วย · นะ | rák-sǎa tua · dûai · ná | high | yes |
| stage-6-learning-ability | Learning and ability | verbs | 1872, 1969, 2170, 2029, 2152, 2073, 1840, 2284 | 825 | ผมอยากพูดไทยได้ | phǒm yàak phûut thai dâai | I want to be able to speak Thai (male) | ผม · อยาก · พูด · ไทย · ได้ | phǒm · yàak · phûut · thai · dâai | high | yes |
| stage-6-everyday-verbs | Everyday verbs | verbs | 1831, 2063, 2229, 2330, 2399, 2443, 2610, 2435 | 846 | คุณกินข้าวหรือยัง | khun gin khâao rǔe yang? | Have you eaten yet? | คุณ · กินข้าว · หรือยัง | khun · gin khâao · rǔe yang | high | yes |
| stage-6-communication-verbs | Explaining and confirming | verbs | 2599, 2329, 2109, 2262, 2571, 2537, 2217, 2502 | 913 | ขอเพิ่มหน่อยครับ | khǎw phôem nàwy khráp | May I have some more (male) | ขอ · เพิ่ม · หน่อย · ครับ | khǎw · phôem · nàwy · khráp | medium | yes |
| stage-6-describing-qualities | Describing qualities | adjectives | 1923, 2053, 2337, 2594, 3034, 2589, 2603, 2256 | — | — | — | — | (no builder) | — | n/a | no |

### Notes per unit
- **People and family:** the builder ("See you again") is a social farewell; the
  vocab is the family/relations set. Confirm pairing reads OK (sentence is shown
  alongside the words, not implied to be about family).
- **Days and dates:** builder "Yesterday I went to the market" uses เมื่อวาน, a vocab
  card in this unit (212) — deliberate reinforcement of past-tense narration.
- **Times and waiting:** สักครู่ (a moment, 5708) is a vocab card and the builder's
  key tile. Mixes weekdays (Sat/Wed) with duration words — confirm grouping.
- **At a restaurant:** vocab is fruit + dining words; กระทง (4333) is the floating
  offering, included as a culturally adjacent noun — flag if you'd rather drop it.
  Builder uses เมนู (menu), which is taught as vocab in Stage 5.
- **Banking and paperwork:** builder "Can you come today?" frames an appointment to
  handle the paperwork in this unit — confirm the framing.
- **Explaining and confirming:** marked **medium** — the builder "May I have some
  more" is a request, while the vocab are communication/commitment verbs (explain,
  confirm, promise, guarantee). The sentence is shown for a polite-request anchor;
  flag if you'd prefer a closer pairing.
- **Describing qualities:** vocab-only (no builder) — Stage 6's clean adjective
  sentences are 2-token or idiomatic. Useful intermediate adjectives (convenient,
  correct, confused, smart, diligent, strong, warm, familiar).

## Skipped sentence-builder candidates (Stage 6)

These Stage 6 sentence/phrase cards were **not** turned into builders. They are
still available as normal cards (Practice / Stage Challenge). Stage 6 has 210
sentence/phrase cards; 13 produced a clean, safe ≥3-token breakdown — 11 are now
used as new builders (plus the 2 pre-existing), and the 2 clean leftovers below
are good candidates held back only because each unit carries one builder.

| Card ID | Thai | Phonetic | English | Skip reason |
| --- | --- | --- | --- | --- |
| 877 | ขอโทษที่มาช้า | khǎw thôht thîi maa cháa | Sorry I am late | Clean 4-token; no themed apology/punctuality unit — ready to promote |
| 1534 | ผมแพ้อันนี้ครับ | phǒm pháe annǐi khráp | I am allergic to this (male) | Clean 4-token; overlaps the pre-existing allergy builder (914) — Stage 6 body/health vocab is thin |
| 918 | เช็คบิลครับ | chék bin khráp | The bill please (male) | 2 tokens — too short to arrange |
| 1582 | ไว้ทีหลัง | wái thii-lǎng | Maybe later | Written as one phonetic token; no clean internal split |
| 917 | แนะนำอะไรดีครับ | náe-nam àrai dee khráp? | What do you recommend? (male) | Token boundaries do not reconstruct cleanly (เ-prefixed inner word) |
| 1591 | แพงเกินไปสำหรับผม | phaeng geun bpai sǎm-ràp phǒm | That's too expensive for me (male) | Long/idiomatic; phonetic does not reconstruct cleanly |
| (≈193 others) | various | — | various | Did not produce a clean `WORD_LOOKUP` breakdown (idiomatic, long, female-voice, time-expression, or unknown inner words) — deferred until reviewed |

## Outcome wanted
Please mark each "Needs native review" row **approved** or **change**, and note
any wording/tokenization fixes. Approved builders stay; flagged ones can be
demoted to sentence-shown-only (drop `sentenceBuilder`) without changing any card
data. Once approved, this pattern can be reused to deepen Stages 7–8 next. The 2
clean leftover sentences above (877 "sorry I'm late", 1534 "allergic to this") are
ready to promote into extra units for even deeper Stage 6 coverage.
