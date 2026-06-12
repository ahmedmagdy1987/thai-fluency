# Stage 8 — Content Review Matrix (for owner / native-speaker review)

Date: May 30, 2026

This matrix lists every Stage 8 guided mini-unit and its sentence-builder so a
native speaker can **approve or flag** the wording and tokenization. No Thai card
content was changed — all units reference existing Stage 8 cards, and every
builder's tokens were derived from the source sentence card's own phonetic via
the app's `WORD_LOOKUP` / `autoBreakdown` (so the token phonetics reconstruct the
card phonetic exactly; nothing was invented). Verified by
`scripts/check-mini-units.mjs` against the **runtime** `CARDS` (the composed set,
not the inline `RAW_CARDS` in `cards.js`).

- **Stage 8 total cards:** 992 (theme: *Thai Mastery* — the final stage)
- **Coverage before this pass:** 6 vocab cards (1 unit)
- **Coverage after this pass:** 102 vocab cards (13 units)
- **Sentence builders:** 13 of 13 units (3- to 5-token, auto-derived)

## A note on theming
Stage 8 is the largest and most **sentence-rich** stage by far (526 sentence/
phrase cards, **33** of which produce a clean ≥3-token breakdown — more clean
builders than any other stage). The clean sentences span the whole mastery range:
introductions, languages, restaurant, taxi, getting lost, shopping, preferences,
travel plans, and feelings about Thailand. As a result **all 12 new units carry a
genuine builder**. Words are dominated by "things" (189), adjectives (72), verbs
(60), with strong themed sets for people, months/days, places, directions,
pronouns, and connectors. Coverage is 102/992 (the rest stays in Practice and the
Stage Challenge), and because Stage 8 has ~25 distinct clean builders beyond the
12 used, it is the richest candidate for further deepening.

## How to review
For each unit, confirm: (a) the vocab cards belong together / are useful at this
level, (b) the sentence + English meaning read naturally, (c) the builder tiles
split the sentence at correct Thai word boundaries. Mark anything to change in
the **Notes** column.

## Units (the pre-existing unit is included for completeness)

| Unit ID | Title | Topic | Vocab card IDs | Sentence card | Thai | Phonetic | English | Builder tokens (thai) | Token phonetics | Confidence | Needs native review |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| stage-8-out-and-about | Out and about | places/food | 162, 168, 171, 132, 152, 159 | 386 | ใกล้ไหมครับ | glâi mǎi khráp | Is it close? (male) | ใกล้ · ไหม · ครับ | glâi · mǎi · khráp | high | yes |
| stage-8-people-family | People and family | people | 3732, 3828, 3947, 4009, 3696, 3834, 2891, 3575 | 331 | คุณชื่ออะไรครับ | khun chûe àrai khráp? | What is your name? (male) | คุณ · ชื่อ · อะไร · ครับ | khun · chûe · àrai · khráp | high | yes |
| stage-8-everyone-no-one | Everyone and no one | pronouns | 3071, 3687, 3891, 3895, 3957, 3984, 3844, 4308 | 317 | ยินดีที่ได้รู้จัก | yindee thîi dâai rúujàk | Nice to meet you | ยินดี · ที่ · ได้ · รู้จัก | yindee · thîi · dâai · rúujàk | high | yes |
| stage-8-months | Months of the year | time | 3853, 3807, 3872, 3693, 3876, 3858, 3856, 3695 | 937 | ผมจะอยู่หนึ่งอาทิตย์ | phǒm jà yùu nèung aa-thít | I will stay for one week (male) | ผม · จะ · อยู่ · หนึ่ง · อาทิตย์ | phǒm · jà · yùu · nèung · aa-thít | high | yes |
| stage-8-days-and-when | Days and when | time | 3975, 3989, 3995, 4029, 2347, 2905, 3961, 2216 | 898 | แล้วเจอกันพรุ่งนี้ | láew jer gan phrûng níi | See you tomorrow | แล้ว · เจอกัน · พรุ่งนี้ | láew · jer gan · phrûng níi | high | yes |
| stage-8-places-in-town | Places in town | places | 1913, 3308, 3441, 3899, 3079, 2415, 2151, 2351 | 852 | อยู่ที่ไหนครับ | yùu thîi nǎi khráp? | Where is it? (male) | อยู่ · ที่ไหน · ครับ | yùu · thîi nǎi · khráp | high | yes |
| stage-8-directions-distance | Directions and distance | directions | 2375, 4018, 3864, 3026, 2272, 2951, 3792, 3540 | 382 | จอดที่นี่ครับ | jàwt thîi nîi khráp | Stop here (male) | จอด · ที่นี่ · ครับ | jàwt · thîi nîi · khráp | high | yes |
| stage-8-travel-and-activities | Travel and activities | verbs | 2478, 4004, 3376, 3404, 3496, 2709, 2827, 3042 | 389 | ผมหลงทางครับ | phǒm lǒng thaang khráp | I am lost (male) | ผม · หลงทาง · ครับ | phǒm · lǒng thaang · khráp | high | yes |
| stage-8-connectors-nuance | Connectors and nuance | adverbs/connectors | 1656, 1798, 1928, 2317, 2786, 2717, 2979, 2226 | 433 | พูดอีกทีครับ | phûut ìik thii khráp | Say it again please (male) | พูด · อีกที · ครับ | phûut · ìik thii · khráp | high | yes |
| stage-8-home-and-documents | Home and documents | home/admin | 1010, 2939, 5738, 1019, 1113, 1116, 1105, 1124 | 844 | คุณอยู่ที่ไหน | khun yùu thîi nǎi? | Where do you live? | คุณ · อยู่ · ที่ไหน | khun · yùu · thîi nǎi | high | yes |
| stage-8-decisions-verbs | Decisions and opinions | verbs | 1827, 1835, 1987, 2016, 2232, 2332, 1736, 1918 | 823 | ผมอยากไปที่นั่น | phǒm yàak bpai thîi nân | I want to go there (male) | ผม · อยาก · ไป · ที่นั่น | phǒm · yàak · bpai · thîi nân | medium | yes |
| stage-8-likes-impressions | Likes and impressions | adjectives | 2292, 2396, 2783, 2913, 2523, 2512, 2858, 2296 | 812 | ผมชอบมากเลย | phǒm chôp mâak loei | I really like it (male) | ผม · ชอบ · มาก · เลย | phǒm · chôp · mâak · loei | high | yes |
| stage-8-society-and-ideas | Society and ideas | adjectives | 2772, 2743, 3159, 2530, 2989, 3090, 3142, 2609 | 955 | คนไทยใจดีมาก | khon thai jai dee mâak | Thai people are very kind | คนไทย · ใจดี · มาก | khon thai · jai dee · mâak | high | yes |

### Notes per unit
- **People and family:** several cards are bundled-gloss kinship cards (e.g. ป้า/น้า/อา
  "aunt", ปู่ย่า/ตายาย "grandparent") that show multiple regional terms — confirm
  this is acceptable for teaching, or flag to pick one term per card.
- **Everyone and no one:** abstract pronoun set (everything/anybody/nobody/
  nothing/somebody/their/himself/she). เจ้าหล่อน (4308) is a literary "she"; flag
  if too archaic for this level.
- **Months / Days:** straightforward calendar vocab; the builder reinforces a
  travel context ("I'll stay one week" / "see you tomorrow").
- **Travel and activities:** the builder "I am lost" anchors travel/activity verbs
  (tour, travel, swim, exercise, exchange, avoid, win). High fit (travel theme).
- **Decisions and opinions:** marked **medium** — the builder "I want to go there"
  is a want/intent line shown alongside decision verbs (consider, decide, support,
  deny, be responsible, analyze, develop, change). Flag if you'd prefer a closer
  pairing.
- **Society and ideas:** abstract/society adjectives (sacred, conserve, harmony,
  public, hardship, complex, strange, progressive) anchored by "Thai people are
  very kind". Confirm the abstract set is wanted at this level.

## Skipped sentence-builder candidates (Stage 8)

Stage 8 has **526** sentence/phrase cards; **33** produced a clean, safe ≥3-token
breakdown — far more than the 12 units can use. 13 are now builders (12 new + the
1 pre-existing); the remaining ~20 clean ones are listed below as a representative
sample (several are duplicate-meaning variants of builders already used). They
stay available as normal cards (Practice / Stage Challenge) and are ready to
promote into extra units.

| Card ID | Thai | Phonetic | English | Skip reason |
| --- | --- | --- | --- | --- |
| 334 | คุณมาจากไหนครับ | khun maa jàak nǎi khráp? | Where are you from? (male) | Clean; one-builder-per-unit (introductions covered by 331/317) |
| 335 | ผมพูดไทยได้นิดหน่อย | phǒm phûut thai dâai nít nàwy | I speak a little Thai (male) | Clean 5-token; ready to promote into a "speaking Thai" unit |
| 336 / 848 | พูดอังกฤษได้ไหม | phûut angkrìt dâai mǎi? | Do you speak English? | Clean; held back (one builder per unit) |
| 350 | ขอเมนูครับ | khǎw meh-nuu khráp | Menu please (male) | Clean; Stage 8 food vocab is thin (3 free) so no dedicated restaurant unit |
| 352 / 354 / 355 / 356 | ไม่เผ็ด / อร่อยมาก / ผมหิว / ผมอิ่มแล้ว | … | not spicy / delicious / hungry / full | Clean restaurant lines; held back (no food-vocab unit — see above) |
| 357 | เช็คบิลด้วยครับ | chék bin dûai khráp | The bill please (male) | Clean; held back (no dedicated dining unit) |
| 381 / 414 / 851 | ไปไหน / มีไหม | … | where to? / do you have? | Clean; held back (one builder per unit) |
| 432 | พูดช้าๆครับ | phûut cháa cháa khráp | Please speak slowly (male) | Clean but ช้าๆ yields two identical tiles — awkward to arrange |
| 953 / 955 (955 used) | ผมชอบเมืองไทย | phǒm chôp mueang thai | I love Thailand (male) | 953 held back (955 used in Society unit) |
| (≈493 others) | various | — | various | Did not produce a clean `WORD_LOOKUP` breakdown (idiomatic, long, female-voice, time-expression, or unknown inner words) — deferred until reviewed |

## Course-structure completion summary
With Stage 8 done, **all 8 stages now have guided mini-unit paths**:

| Stage | Theme | Units | Vocab covered | Builders |
| --- | --- | --- | --- | --- |
| 1 | First Steps | 5 | 32 / 150 | 4 |
| 2 | Everyday Basics | 10 | 76 / 269 | 6 |
| 3 | Getting Around | 12 | 96 / 423 | 9 |
| 4 | Real Conversations | 14 | 112 / 575 | 12 |
| 5 | Social Confidence | 14 | 112 / 701 | 14 |
| 6 | Intermediate Power | 14 | 110 / 804 | 13 |
| 7 | Natural Thai | 14 | 112 / 877 | 12 |
| 8 | Thai Mastery | 13 | 102 / 992 | 13 |
| **Total** | | **96** | **752** | **83** |

## Course-complete state
A **per-stage** completion state exists: when all units in the current stage are
done, `getMiniUnitProgressState` returns `pathComplete: true` and LearnPath shows
"Stage N path complete". A **global "all 8 stages graduated" / course-complete**
celebration does **not** yet exist — it is **deferred** as a future enhancement
(it would be a new UI/celebration state, out of scope for this content sprint and
would require touching celebration logic).

## Remaining native / content-review needs
- All 96 units' builders want a native-speaker pass via the eight
  `docs/stage-N-content-review-matrix.md` files (token boundaries, gender
  particles, naturalness).
- A few units across stages pair a conversational builder with a themed vocab set
  that is not literally about the sentence (flagged **medium**): Stage 6
  "Explaining and confirming", Stage 7 "Feelings & reactions" / "Everyday
  actions", Stage 8 "Decisions and opinions". These are sentence-shown-alongside
  patterns and can be demoted to sentence-only if a reviewer prefers.
- Coverage is the cleanest themed vocab per stage (752 of ~4,790 cards); the rest
  remain available via Practice and the Stage Challenge by design.

## Outcome wanted
Please mark each "Needs native review" row **approved** or **change**, and note
any wording/tokenization fixes. Approved builders stay; flagged ones can be
demoted to sentence-shown-only (drop `sentenceBuilder`) without changing any card
data. Stage 8's ~20 unused clean builders make it the easiest stage to deepen
further (e.g. dedicated restaurant / languages / shopping units) once reviewed.

## Mission intros and recaps (added June 12, 2026)

Every Stage 8 unit above now carries a `lessonIntro` (what you will learn, why
it matters, what to listen for, what to notice) and a `missionRecap` (headline,
lead, 3-5 achievement bullets) shown by the guided mini-unit flow, matching the
pattern already shipped for Stages 1-3. All Thai strings inside them are reused
verbatim from the unit's own cards and builder tokens listed above (no new Thai
was written); phonetics are copied from the same cards.

**Native review for this section:** confirm the English gloss shown next to each
Thai word matches the card meaning, and flag any "Listen for" / "Notice" teaching
claim that reads wrong for Thai (for example which word marks the question, or
where a booster like มาก sits). Wording-only fixes; no card data is involved.
