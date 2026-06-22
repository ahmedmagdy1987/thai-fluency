# Dating & Real Talk Thai — native-review worksheet

**Status: PENDING NATIVE REVIEW. Do not ship any Thai from this file to users
until a native Thai speaker has reviewed and approved it.**

This is the internal worksheet for the optional, 18+, mature-language Super section
("Dating & Real Talk Thai"). The shipped app (`src/data/datingContent.js`,
`DatingSection.jsx`) contains **English only** — no Thai from this file is in the
public bundle. The drafts below are AI-proposed starting points for a native
reviewer to correct, replace, or reject.

Conventions & policy:
- **Voice:** male-default (ผม / ครับ) per project convention; the app auto-transforms
  to female (ฉัน / ค่ะ) at render. Reviewer: confirm particle/gender per phrase.
- **Tone marks in romanization:** à=low, á=high, â=falling, ǎ=rising, no mark=mid.
- **Severity:** gentle · moderate · strong · safety (see `DATING_SEVERITY`).
- **Politeness:** casual · neutral · polite (note when a particle changes it).
- **Excluded by policy (never add):** hateful slurs, harassment instructions,
  coercive sexual language, explicit pornographic material. For "mild swears &
  insults", the reviewer supplies appropriate mild, non-slur examples — AI does not
  draft these.
- **Reviewer status** per row: `pending` → set to `approved` / `revised` / `rejected`.

Columns: English intent · Proposed Thai (draft) · Romanization (draft) · Literal ·
Natural meaning · Politeness · Severity · Who can say it · When NOT to use · Status.

---

## 1. Introductions & flirting  (severity: gentle)

| English intent | Proposed Thai (draft) | Romanization (draft) | Literal | Natural | Politeness | Severity | Who can say it | When NOT to use | Status |
|---|---|---|---|---|---|---|---|---|---|
| Is this seat taken? | ตรงนี้มีคนนั่งไหมครับ | drong née mee khon nâng mái khráp | here-has-person-sit-(q)-(polite) | Is anyone sitting here? | polite | gentle | anyone → anyone | — | pending |
| You have a lovely smile | คุณยิ้มสวยจังเลยครับ | khun yím sǔay jang loei khráp | you-smile-pretty-so | Your smile is so lovely | polite | gentle | to someone you're interested in | with strangers in a work context | pending |
| Can I buy you a coffee? | ขอเลี้ยงกาแฟได้ไหมครับ | khǒr líang gaafae dâi mái khráp | ask-treat-coffee-can-(q) | Can I treat you to a coffee? | polite | gentle | anyone | — | pending |
| I'd like to see you again | อยากเจอคุณอีกครับ | yàak joe khun ìik khráp | want-meet-you-again | I'd like to see you again | polite | gentle | after a good date | too early / first hello | pending |

## 2. Dating apps & meeting plans  (severity: gentle)

| English intent | Proposed Thai (draft) | Romanization (draft) | Literal | Natural | Politeness | Severity | Who can say it | When NOT to use | Status |
|---|---|---|---|---|---|---|---|---|---|
| Want to grab dinner this week? | สัปดาห์นี้ไปกินข้าวเย็นกันไหม | sàpdaa née bpai gin khâao yen gan mái | this-week-go-eat-dinner-together-(q) | Want to get dinner this week? | neutral | gentle | matched/chatting | — | pending |
| Let's meet somewhere public | เจอกันที่ที่คนเยอะๆ ดีกว่า | joe gan thîi thîi khon yúh-yúh dii gwàa | meet-at-place-people-many-better | Let's meet somewhere busy/public | neutral | gentle | safety-minded planning | — | pending |
| What time works for you? | สะดวกกี่โมงครับ | sàdùak gìi moong khráp | convenient-what-time-(polite) | What time suits you? | polite | gentle | anyone | — | pending |
| I'm running ten minutes late | ขอโทษ มาช้าสิบนาทีครับ | khǒr-thôot, maa cháa sìp naa-thii khráp | sorry-come-late-ten-minute | Sorry, I'm ten minutes late | polite | gentle | anyone | — | pending |

## 3. Compliments  (severity: gentle)

| English intent | Proposed Thai (draft) | Romanization (draft) | Literal | Natural | Politeness | Severity | Who can say it | When NOT to use | Status |
|---|---|---|---|---|---|---|---|---|---|
| You look great tonight | คืนนี้คุณดูดีมากเลย | kuen née khun duu dii mâak loei | tonight-you-look-good-very | You look really great tonight | neutral | gentle | a date | a stranger/coworker | pending |
| I love your sense of humor | ชอบที่คุณตลกจัง | chôop thîi khun dtà-lòk jang | like-that-you-funny-so | I love how funny you are | casual | gentle | someone you're close-ish with | — | pending |
| You're really easy to talk to | คุยกับคุณสบายใจจัง | khui gàp khun sàbaai-jai jang | talk-with-you-comfortable-so | You're so easy to talk to | neutral | gentle | anyone | — | pending |

## 4. Relationship language  (severity: moderate)

| English intent | Proposed Thai (draft) | Romanization (draft) | Literal | Natural | Politeness | Severity | Who can say it | When NOT to use | Status |
|---|---|---|---|---|---|---|---|---|---|
| Are we exclusive? | เราคบกันคนเดียวไหม | rao kóp gan khon diao mái | we-date-together-one-person-(q) | Are we seeing only each other? | neutral | moderate | a dating partner | too early | pending |
| I really like you | ผมชอบคุณมากจริงๆ | phǒm chôop khun mâak jing-jing | I-like-you-very-really | I really like you | neutral | moderate | a partner/interest | a stranger | pending |
| Would you like to meet my friends? | อยากไปเจอเพื่อนผมไหม | yàak bpai joe phûean phǒm mái | want-go-meet-friend-my-(q) | Want to meet my friends? | neutral | moderate | an established partner | very early | pending |

## 5. Boundaries & consent  (severity: safety — review with priority)

| English intent | Proposed Thai (draft) | Romanization (draft) | Literal | Natural | Politeness | Severity | Who can say it | When NOT to use | Status |
|---|---|---|---|---|---|---|---|---|---|
| Is this okay? | แบบนี้โอเคไหม | bàep née oo-kee mái | like-this-okay-(q) | Is this okay? | neutral | safety | anyone, always appropriate | — | pending |
| No, I don't want to | ไม่ ผมไม่อยาก / ไม่เอา | mâi, phǒm mâi yàak / mâi ao | no, I-not-want / not-take | No, I don't want to | neutral | safety | anyone | never wrong to say | pending |
| Please stop | พอแล้วนะ / หยุดก่อน | phor láew ná / yùt gòn | enough-already / stop-first | Please stop | neutral→firm | safety | anyone | — | pending |
| I'm not comfortable with that | ผมไม่สบายใจกับเรื่องนี้ | phǒm mâi sàbaai-jai gàp rûeang née | I-not-comfortable-with-matter-this | I'm not comfortable with that | neutral | safety | anyone | — | pending |
| Let's slow down | ค่อยเป็นค่อยไปดีกว่า | khôi bpen khôi bpai dii gwàa | gradually-be-gradually-go-better | Let's take it slow | neutral | safety | anyone | — | pending |

## 6. Awkward situations  (severity: moderate)

| English intent | Proposed Thai (draft) | Romanization (draft) | Literal | Natural | Politeness | Severity | Who can say it | When NOT to use | Status |
|---|---|---|---|---|---|---|---|---|---|
| I think there's been a misunderstanding | ผมว่าเราเข้าใจผิดกัน | phǒm wâa rao khâo-jai phìt gan | I-think-we-understand-wrong-together | I think we've misunderstood each other | neutral | moderate | anyone | — | pending |
| I'd rather just be friends | เป็นเพื่อนกันดีกว่า | bpen phûean gan dii gwàa | be-friend-together-better | Let's just be friends | neutral (soft) | moderate | letting someone down | — | pending |
| Sorry, I'm seeing someone | ขอโทษ ผมมีคนคุยอยู่แล้ว | khǒr-thôot, phǒm mee khon khui yùu láew | sorry-I-have-person-talking-already | Sorry, I'm already seeing someone | polite | moderate | declining politely | — | pending |

## 7. Arguments & breakups  (severity: moderate)

| English intent | Proposed Thai (draft) | Romanization (draft) | Literal | Natural | Politeness | Severity | Who can say it | When NOT to use | Status |
|---|---|---|---|---|---|---|---|---|---|
| We need to talk | เราต้องคุยกันหน่อย | rao dtông khui gan nòi | we-must-talk-together-a-bit | We need to talk | neutral | moderate | a partner | in public/heated moment | pending |
| I think we should break up | ผมว่าเราเลิกกันดีกว่า | phǒm wâa rao lôek gan dii gwàa | I-think-we-break-up-better | I think we should break up | neutral | moderate | a partner | impulsively | pending |
| I need some space | ผมขอเวลาอยู่คนเดียวหน่อย | phǒm khǒr welaa yùu khon diao nòi | I-ask-time-be-alone-a-bit | I need some space | neutral | moderate | a partner | — | pending |

## 8. Nightlife language  (severity: moderate)

| English intent | Proposed Thai (draft) | Romanization (draft) | Literal | Natural | Politeness | Severity | Who can say it | When NOT to use | Status |
|---|---|---|---|---|---|---|---|---|---|
| Two beers, please | ขอเบียร์สองที่ครับ | khǒr bia sǒng thîi khráp | ask-beer-two-(classifier)-(polite) | Two beers, please | polite | moderate | anyone | — | pending |
| I'll get this round | รอบนี้ผมเลี้ยงเอง | rôp née phǒm líang eeng | round-this-I-treat-self | This round's on me | casual | moderate | with friends | — | pending |
| I've had enough to drink | ผมพอแล้วครับ | phǒm phor láew khráp | I-enough-already-(polite) | I've had enough | polite | safety | anyone | — | pending |
| Can you call me a taxi? | เรียกแท็กซี่ให้หน่อยได้ไหมครับ | rîak tháeksîi hâi nòi dâi mái khráp | call-taxi-for-a-bit-can-(q) | Could you call me a taxi? | polite | safety | anyone | — | pending |

## 9. Casual slang  (severity: moderate)

| English intent | Proposed Thai (draft) | Romanization (draft) | Literal | Natural | Politeness | Severity | Who can say it | When NOT to use | Status |
|---|---|---|---|---|---|---|---|---|---|
| That's so cool | เจ๋งอะ / เท่มาก | jěng à / thêh mâak | cool / handsome-very | That's so cool | casual | moderate | friends | formal settings | pending |
| No way! / Seriously? | จริงดิ / เว่อ | jing dì / wôe | real-(particle) / exaggerated | No way! / Really?! | casual | moderate | friends | formal settings | pending |
| My close friend (bro/mate) | เพื่อนซี้ | phûean síi | friend-tight | best mate | casual | moderate | among friends | strangers/elders | pending |

## 10. Mild swear words & insults  (severity: strong — RECOGNITION ONLY)

> AI has intentionally **not** drafted Thai here. The native reviewer supplies a
> small set of genuinely mild, commonly-heard items for *comprehension*, each with
> a strong "understand, mostly don't use" note. No slurs, no harassment, nothing
> targeting protected groups.

| English intent | Proposed Thai (draft) | Romanization (draft) | Literal | Natural | Politeness | Severity | Who can say it | When NOT to use | Status |
|---|---|---|---|---|---|---|---|---|---|
| A mild "damn / ugh" exclamation | — (native reviewer to supply) — | — | — | mild frustration exclamation | casual | strong | close friends only | with elders, strangers, formal, anyone you don't know well | pending |
| Light teasing between close friends | — (native reviewer to supply) — | — | — | affectionate teasing | casual | strong | very close friends, mutual | if there's any doubt it's welcome | pending |
| Recognizing that something said was rude | — (native reviewer to supply) — | — | — | "that was rude/strong" awareness | n/a | strong | comprehension only | — | pending |

## 11. Severity & context warnings  (severity: safety — guidance, not phrases)

Guidance rows that accompany the section (how to read severity, who/when). The
reviewer confirms the framing is accurate and culturally appropriate.

| English intent | Proposed Thai (draft) | Romanization (draft) | Literal | Natural | Politeness | Severity | Who can say it | When NOT to use | Status |
|---|---|---|---|---|---|---|---|---|---|
| "How rude/intimate is this phrase?" label | n/a (UI guidance) | n/a | n/a | severity scale shown per phrase | n/a | safety | n/a | n/a | pending |
| "Who can say this, and to whom?" note | n/a (UI guidance) | n/a | n/a | relationship/age/gender guidance | n/a | safety | n/a | n/a | pending |
| "When this is inappropriate" note | n/a (UI guidance) | n/a | n/a | situations to avoid the phrase | n/a | safety | n/a | n/a | pending |

---

### Reviewer sign-off
- [ ] All Thai/romanization/tone checked by a native speaker
- [ ] Severity + politeness labels confirmed
- [ ] "Who can say it / when not to" confirmed culturally accurate
- [ ] Mild-swear category populated appropriately (recognition-only)
- [ ] Nothing in the excluded categories slipped in
- [ ] On approval: move approved content into the app data path and flip
      `DATING_REVIEW_COMPLETE` (and the relevant `FEATURES.datingRealTalk.status`)
