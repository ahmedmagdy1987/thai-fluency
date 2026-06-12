# Stage 5 — Content Review Matrix (for owner / native-speaker review)

Date: May 30, 2026

This matrix lists every Stage 5 guided mini-unit and its sentence-builder so a
native speaker can **approve or flag** the wording and tokenization. No Thai card
content was changed — all units reference existing Stage 5 cards, and every
builder's tokens were derived from the source sentence card's own phonetic via
the app's `WORD_LOOKUP` / `autoBreakdown` (so the token phonetics reconstruct the
card phonetic exactly; nothing was invented). Verified by
`scripts/check-mini-units.mjs` against the **runtime** `CARDS` (the composed set,
not the inline `RAW_CARDS` in `cards.js`).

- **Stage 5 total cards:** 701 (theme: *Social Confidence*)
- **Coverage before this pass:** 16 vocab cards (2 units)
- **Coverage after this pass:** 112 vocab cards (14 units)
- **Sentence builders:** 14 of 14 units (3- and 4-token, auto-derived)

## A note on theming
Stage 5 is the most **sentence-rich** stage so far (184 sentence/phrase cards, 18
of which produce a clean ≥3-token breakdown) and the phrases are squarely social:
introductions, feelings, health, weather, time, food/drink, ordering, requests,
compliments, places, wants, and everyday social verbs. As a result **all 12 new
units carry a genuine conversational builder** — this is the richest builder
coverage of any stage. The vocabulary is verb-/adjective-/noun-heavy (131/117/110
free cards), and each unit groups a coherent set behind its conversational line.
Coverage is 112/701; the rest of the deck stays available in Practice and the
Stage Challenge.

## How to review
For each unit, confirm: (a) the vocab cards belong together / are useful at this
level, (b) the sentence + English meaning read naturally, (c) the builder tiles
split the sentence at correct Thai word boundaries. Mark anything to change in
the **Notes** column.

## Units (the 2 pre-existing units are included for completeness)

| Unit ID | Title | Topic | Vocab card IDs | Sentence card | Thai | Phonetic | English | Builder tokens (thai) | Token phonetics | Confidence | Needs native review |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| stage-5-useful-verbs | Useful verbs | verbs | 27, 32, 503, 507, 1685, 1704, 1901, 1907 | 815 | ผมคิดถึงคุณ | phǒm khít thǔeng khun | I miss you (male) | ผม · คิดถึง · คุณ | phǒm · khít thǔeng · khun | high | yes |
| stage-5-describing-more | Describing more | adjectives | 61, 83, 87, 90, 1860, 1931, 1972, 1779 | 808 | ผมเหนื่อยมาก | phǒm nùeai mâak | I am very tired (male) | ผม · เหนื่อย · มาก | phǒm · nùeai · mâak | high | yes |
| stage-5-family-people | Family and people | people | 1730, 1735, 2395, 2515, 2677, 1886, 3325, 199 | 841 | คุณมาจากไหน | khun maa jàak nǎi? | Where are you from? | คุณ · มา · จากไหน | khun · maa · jàak nǎi | high | yes |
| stage-5-emotions-feelings | Emotions and feelings | emotions | 460, 467, 469, 471, 5717, 3587, 2855, 2358 | 811 | ผมดีใจมาก | phǒm dee jai mâak | I am very happy (male) | ผม · ดีใจ · มาก | phǒm · dee jai · mâak | high | yes |
| stage-5-health-and-body | Health and the body | health/body | 1215, 1220, 2205, 3043, 2387, 563, 3315, 3327 | 807 | ผมไม่สบายครับ | phǒm mâi sàbaai khráp | I am not feeling well (male) | ผม · ไม่สบาย · ครับ | phǒm · mâi sàbaai · khráp | high | yes |
| stage-5-weather-seasons | Weather and seasons | weather | 600, 2470, 3500, 3644, 2623, 613, 4305, 3558 | 891 | วันนี้ร้อนมาก | wan níi ráwn mâak | It is very hot today | วันนี้ · ร้อน · มาก | wan níi · ráwn · mâak | high | yes |
| stage-5-days-and-time | Days and time | time | 210, 213, 219, 2863, 3205, 258, 297, 279 | 855 | วันนี้วันอะไร | wan níi wan àrai? | What day is today? | วันนี้ · วัน · อะไร | wan níi · wan · àrai | high | yes |
| stage-5-food-and-drink | Food and drink | food | 136, 147, 148, 155, 521, 524, 527, 528 | 826 | ผมอยากดื่มกาแฟ | phǒm yàak dùem gaafae | I want to drink coffee (male) | ผม · อยาก · ดื่ม · กาแฟ | phǒm · yàak · dùem · gaafae | high | yes |
| stage-5-ordering-and-money | Ordering and money | shopping/money | 5711, 5726, 5727, 1107, 2597, 3033, 2784, 2995 | 828 | ผมเอาอันนี้ครับ | phǒm ao annǐi khráp | I will take this one (male) | ผม · เอา · อันนี้ · ครับ | phǒm · ao · annǐi · khráp | high | yes |
| stage-5-asking-and-giving | Asking and giving | verbs (speech/giving) | 3632, 2555, 2767, 2837, 2982, 1786, 3070, 2257 | 831 | ขอน้ำหน่อยครับ | khǎw náam nàwy khráp | May I have some water (male) | ขอ · น้ำ · หน่อย · ครับ | khǎw · náam · nàwy · khráp | high | yes |
| stage-5-compliments | Compliments and praise | adjectives | 1826, 2404, 2732, 2154, 2241, 2551, 3270, 3531 | 951 | คุณสวยมากครับ | khun sǔai mâak khráp | You are very beautiful (male speaker) | คุณ · สวย · มาก · ครับ | khun · sǔai · mâak · khráp | high | yes |
| stage-5-around-town | Around town | places | 1648, 2278, 2354, 2370, 4230, 2670, 2897, 2450 | 952 | ที่นี่สวยมาก | thîi nîi sǔai mâak | It is very beautiful here | ที่นี่ · สวย · มาก | thîi nîi · sǔai · mâak | high | yes |
| stage-5-wants-and-plans | Wants and plans | verbs (planning) | 3130, 2044, 1787, 2021, 2616, 2541, 2467, 1958 | 822 | ผมอยากกลับบ้าน | phǒm yàak glàp bâan | I want to go home (male) | ผม · อยาก · กลับบ้าน | phǒm · yàak · glàp bâan | high | yes |
| stage-5-everyday-verbs | Everyday social verbs | verbs | 1718, 2694, 3125, 2730, 2845, 3064, 2606, 3383 | 895 | ผมเพิ่งมาถึง | phǒm phêung maa thǔeng | I just arrived (male) | ผม · เพิ่ง · มาถึง | phǒm · phêung · maa thǔeng | high | yes |

### Notes per unit
- **Family and people:** the builder ("Where are you from?") uses จากไหน as a single
  "from where" tile; confirm that split reads naturally vs. จาก · ไหน.
- **Emotions and feelings:** the builder's word ดีใจ (happy) is also vocab card 460
  in this unit — deliberate reinforcement. อิจฉา (jealous) and โมโห (angry) are
  included; flag if too strong for this level.
- **Health and the body:** mixes medical roles (nurse/doctor), a state (wound/
  blood) and body parts (nose/knee/shoulder) behind "I'm not feeling well".
- **Asking and giving:** speech/giving verbs (advise, warn, hand out, feed, scoop,
  say, call out, inform) behind the polite request "May I have some water". ตัก
  (2982) is "scoop/ladle"; confirm it fits the giving theme.
- **Compliments and praise:** the builder is "You are very beautiful (คุณสวยมากครับ)"
  — male speaker addressing the listener. The vocab are positive adjectives.
- **Wants and plans:** planning verbs behind "I want to go home". Some are formal
  (กำหนด schedule, เลื่อน postpone) — flag any to swap for more casual ones.
- **Everyday social verbs:** ไหว้ (to wai) and ทัก (greet) are the social anchors;
  the builder is "I just arrived".

## Skipped sentence-builder candidates (Stage 5)

These Stage 5 sentence/phrase cards were **not** turned into builders. They are
still available as normal cards (Practice / Stage Challenge). Stage 5 has 184
sentence/phrase cards; 18 produced a clean, safe ≥3-token breakdown — 14 are now
used as builders (12 new + the 2 pre-existing), and the 6 clean leftovers below
are good candidates held back only because each unit carries one builder.

| Card ID | Thai | Phonetic | English | Skip reason |
| --- | --- | --- | --- | --- |
| 801 | ผมหิวน้ำครับ | phǒm hǐu náam khráp | I am thirsty (male) | Clean 3-token; held back (Feelings unit already uses the happy builder) |
| 802 | ผมเหนื่อยครับ | phǒm nùeai khráp | I am tired (male) | Clean 3-token; overlaps the pre-existing "very tired" builder (808) |
| 820 | ผมอยากกินข้าว | phǒm yàak gin khâao | I want to eat (male) | Clean; overlaps the "want to drink coffee" want-builder (826) |
| 842 | คุณอายุเท่าไหร่ | khun aa-yú thâo rài? | How old are you? | Clean 3-token; held back (Family unit uses the "where from" builder) |
| 849 | อันนี้คืออะไร | annǐi khue àrai? | What is this? | Clean 3-token; no themed vocab unit — ready to promote |
| 915 | ผมไม่กินเนื้อ | phǒm mâi gin núea | I do not eat beef (male) | Clean 4-token; overlaps the Food unit's drink-coffee builder |
| 899 | โชคดีครับ | chôhk dee khráp | Good luck (male) | Written as one phonetic token; no clean internal split |
| 912 | เผ็ดเกินไป | phèt geun bpai | Too spicy | 2 tokens — too short to arrange |
| (≈158 others) | various | — | various | Did not produce a clean `WORD_LOOKUP` breakdown (idiomatic, long, female-voice, time-expression, or unknown inner words) — deferred until reviewed |

## Outcome wanted
Please mark each "Needs native review" row **approved** or **change**, and note
any wording/tokenization fixes. Approved builders stay; flagged ones can be
demoted to sentence-shown-only (drop `sentenceBuilder`) without changing any card
data. Once approved, this pattern can be reused to deepen Stage 6 next. The 6
clean leftover sentences above (esp. 842 "how old are you?" and 849 "what is
this?") are ready to promote into extra units for even deeper Stage 5 coverage.

## Mission intros and recaps (added June 12, 2026)

Every Stage 5 unit above now carries a `lessonIntro` (what you will learn, why
it matters, what to listen for, what to notice) and a `missionRecap` (headline,
lead, 3-5 achievement bullets) shown by the guided mini-unit flow, matching the
pattern already shipped for Stages 1-3. All Thai strings inside them are reused
verbatim from the unit's own cards and builder tokens listed above (no new Thai
was written); phonetics are copied from the same cards.

**Native review for this section:** confirm the English gloss shown next to each
Thai word matches the card meaning, and flag any "Listen for" / "Notice" teaching
claim that reads wrong for Thai (for example which word marks the question, or
where a booster like มาก sits). Wording-only fixes; no card data is involved.
