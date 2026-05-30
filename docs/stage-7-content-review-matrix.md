# Stage 7 — Content Review Matrix (for owner / native-speaker review)

Date: May 30, 2026

This matrix lists every Stage 7 guided mini-unit and its sentence-builder so a
native speaker can **approve or flag** the wording and tokenization. No Thai card
content was changed — all units reference existing Stage 7 cards, and every
builder's tokens were derived from the source sentence card's own phonetic via
the app's `WORD_LOOKUP` / `autoBreakdown` (so the token phonetics reconstruct the
card phonetic exactly; nothing was invented). Verified by
`scripts/check-mini-units.mjs` against the **runtime** `CARDS` (the composed set,
not the inline `RAW_CARDS` in `cards.js`).

- **Stage 7 total cards:** 877 (theme: *Natural Thai*)
- **Coverage before this pass:** 16 vocab cards (2 units)
- **Coverage after this pass:** 112 vocab cards (14 units)
- **Sentence builders:** 12 of 14 units (3- to 6-token, auto-derived)

## A note on theming
Stage 7 is the most **sentence-rich** stage in the course (229 sentence/phrase
cards, 12 with a clean ≥3-token breakdown), and the clean sentences are exactly
the natural, real-life lines the stage is named for: taxi/getting-around
("to the airport", "stop up ahead", "take me here"), communication ("say it
again", "you speak English well"), social ("glad to meet you", "thanks for
everything"), scheduling ("tomorrow I'll go to work", "what time will you
arrive?") and dining ("split the bill"). So 10 of the 12 new units carry a
genuine builder — including several long **5- and 6-token** lines that suit a
natural-Thai level. The "Describing things" and "Nature and outdoors" units are
vocab-only (no clean tokenizable sentence). Coverage is 112/877; the rest of the
deck stays available in Practice and the Stage Challenge.

## How to review
For each unit, confirm: (a) the vocab cards belong together / are useful at this
level, (b) the sentence + English meaning read naturally, (c) the builder tiles
split the sentence at correct Thai word boundaries. Mark anything to change in
the **Notes** column.

## Units (the 2 pre-existing units are included for completeness)

| Unit ID | Title | Topic | Vocab card IDs | Sentence card | Thai | Phonetic | English | Builder tokens (thai) | Token phonetics | Confidence | Needs native review |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| stage-7-food-and-flavors | Food and flavors | food | 145, 146, 150, 153, 158, 520, 523, 525 | 954 | อาหารไทยอร่อยที่สุด | aahǎan thai aròi thîi sùt | Thai food is the most delicious | อาหาร · ไทย · อร่อย · ที่สุด | aahǎan · thai · aròi · thîi sùt | high | yes |
| stage-7-more-verbs | More everyday verbs | verbs | 516, 518, 1933, 1947, 2022, 2030, 2058, 2066 | 894 | ตอนนี้ผมกำลังกินข้าว | tawn níi phǒm gamlang gin khâao | Right now I am eating (male) | ตอนนี้ · ผม · กำลัง · กินข้าว | tawn níi · phǒm · gamlang · gin khâao | high | yes |
| stage-7-places-around-town | Places around town | places | 166, 170, 1800, 1885, 2049, 2706, 3742, 1748 | 930 | ไปสนามบินครับ | bpai sà-nǎam bin khráp | To the airport please (male) | ไป · สนามบิน · ครับ | bpai · sà-nǎam bin · khráp | high | yes |
| stage-7-directions-position | Directions and position | directions | 1705, 2313, 3484, 3893, 3962, 4248, 3294, 2302 | 932 | จอดข้างหน้าครับ | jàwt khâang nâa khráp | Stop up ahead please (male) | จอด · ข้างหน้า · ครับ | jàwt · khâang nâa · khráp | high | yes |
| stage-7-talking-discussing | Talking and discussing | verbs (communication) | 2507, 2707, 2570, 2714, 2715, 2413, 2669, 2950 | 950 | คุณพูดอังกฤษเก่งมาก | khun phûut angkrìt gèng mâak | You speak English very well | คุณ · พูด · อังกฤษ · เก่ง · มาก | khun · phûut · angkrìt · gèng · mâak | high | yes |
| stage-7-meeting-people | Meeting people | people | 1723, 1776, 1837, 2516, 3388, 3733, 3411, 3313 | 958 | ดีใจที่ได้เจอคุณ | dee jai thîi dâai jer khun | Glad I got to meet you | ดีใจ · ที่ · ได้ · เจอ · คุณ | dee jai · thîi · dâai · jer · khun | high | yes |
| stage-7-conversation-flow | Conversation flow | connectors/fluency | 1260, 1265, 1267, 1268, 1270, 1665, 2125, 2666 | 875 | พูดอีกทีได้ไหมครับ | phûut ìik thii dâai mǎi khráp? | Could you say it again please? (male) | พูด · อีกที · ได้ · ไหม · ครับ | phûut · ìik thii · dâai · mǎi · khráp | high | yes |
| stage-7-feelings-reactions | Feelings and reactions | emotions | 464, 470, 474, 476, 3298, 3665, 4027, 2283 | 878 | ขอบคุณสำหรับทุกอย่าง | khàwp khun sǎm-ràp thúk yàang | Thanks for everything | ขอบคุณ · สำหรับ · ทุกอย่าง | khàwp khun · sǎm-ràp · thúk yàang | medium | yes |
| stage-7-plans-times-of-day | Plans and times of day | time | 214, 1761, 2733, 3382, 3678, 3797, 3900, 4282 | 892 | พรุ่งนี้ผมจะไปทำงาน | phrûng níi phǒm jà bpai tham-ngaan | Tomorrow I will go to work (male) | พรุ่งนี้ · ผม · จะ · ไป · ทำงาน | phrûng níi · phǒm · jà · bpai · tham-ngaan | high | yes |
| stage-7-days-and-schedule | Days and schedule | time | 3823, 3879, 3940, 4005, 2766, 2958, 3473, 3776 | 1509 | จะมาถึงกี่โมงครับ | jà maa thǔeng gìi mohng khráp? | What time will you arrive? (male) | จะ · มาถึง · กี่โมง · ครับ | jà · maa thǔeng · gìi mohng · khráp | high | yes |
| stage-7-dining-out | Dining out | food | 133, 2881, 3601, 3692, 3764, 3782, 3980, 4365 | 919 | แยกบิลได้ไหมครับ | yâek bin dâai mǎi khráp? | Can we split the bill? (male) | แยก · บิล · ได้ · ไหม · ครับ | yâek · bin · dâai · mǎi · khráp | high | yes |
| stage-7-everyday-actions | Everyday actions | verbs | 1897, 1914, 2306, 2378, 2554, 2645, 2745, 2940 | 938 | พาผมไปที่นี่ได้ไหม | phaa phǒm bpai thîi nîi dâai mǎi? | Can you take me here? (male) | พา · ผม · ไป · ที่นี่ · ได้ · ไหม | phaa · phǒm · bpai · thîi nîi · dâai · mǎi | medium | yes |
| stage-7-describing-things | Describing things | adjectives | 76, 1744, 1828, 1846, 1970, 2048, 2147, 2140 | — | — | — | — | (no builder) | — | n/a | no |
| stage-7-nature-outdoors | Nature and outdoors | weather/nature | 611, 1863, 2208, 2416, 3192, 3514, 3618, 4296 | — | — | — | — | (no builder) | — | n/a | no |

### Notes per unit
- **Directions and position:** the builder ("Stop up ahead") uses ข้างหน้า, which is
  also vocab card 2302 in this unit — deliberate reinforcement. ขอรับ (3294) is a
  formal/deferential "yes sir"; confirm you want it at this level.
- **Talking and discussing:** the builder "You speak English very well" anchors a
  set of communication verbs (communicate, converse, consult, persuade, negotiate,
  mention, comment, quarrel). High fit (speaking theme).
- **Feelings and reactions:** marked **medium** — the builder "Thanks for
  everything" is a warm social reaction shown alongside emotion words (impatient,
  happy, surprised, excited, smile, worry); the sentence is not literally about
  the listed feelings. Flag if you'd prefer a closer pairing.
- **Plans and times of day:** the builder "Tomorrow I will go to work" anchors
  times-of-day vocab (พรุ่งนี้/tomorrow is taught in Stage 6; the unit's words are
  right-now/after/night/morning/afternoon/evening/often/finally).
- **Everyday actions:** marked **medium** — the builder "Can you take me here?" is
  a taxi/travel request shown alongside general action verbs (touch, assemble,
  improve, add, decorate, dress, get ready, jump). Flag if you'd prefer a closer
  pairing.
- **Describing things / Nature and outdoors:** vocab-only — Stage 7's clean
  adjective/nature sentences are 2-token or idiomatic, so these are taught as
  vocabulary and reused in sentences elsewhere.

## Skipped sentence-builder candidates (Stage 7)

These Stage 7 sentence/phrase cards were **not** turned into builders. They are
still available as normal cards (Practice / Stage Challenge). Stage 7 has 229
sentence/phrase cards; 12 produced a clean, safe ≥3-token breakdown — 10 are now
used as new builders (plus the 2 pre-existing), and the 2 clean leftovers below
are held back only because each unit carries one builder.

| Card ID | Thai | Phonetic | English | Skip reason |
| --- | --- | --- | --- | --- |
| 874 | พูดช้าๆได้ไหมครับ | phûut cháa cháa dâai mǎi khráp? | Could you speak slowly please? (male) | Clean but the ช้าๆ repetition yields two identical tiles (พูด·ช้า·ช้า·ได้·ไหม·ครับ) — awkward to arrange; overlaps the "say it again" builder (875) |
| 933 | รอที่นี่ได้ไหมครับ | raw thîi nîi dâai mǎi khráp? | Can you wait here? (male) | Clean 5-token taxi request; overlaps the "take me here" builder (938) already used — ready to promote into a separate unit |
| (≈217 others) | various | — | various | Did not produce a clean `WORD_LOOKUP` breakdown (idiomatic, long, female-voice, time-expression, or unknown inner words) — deferred until reviewed |

## Outcome wanted
Please mark each "Needs native review" row **approved** or **change**, and note
any wording/tokenization fixes. Approved builders stay; flagged ones can be
demoted to sentence-shown-only (drop `sentenceBuilder`) without changing any card
data. Once approved, this pattern can be reused to deepen Stage 8 — the final
stage — to complete the full 8-stage guided path. The 2 clean leftover sentences
(874 "speak slowly", 933 "wait here") are ready to promote for even deeper Stage 7
coverage.
