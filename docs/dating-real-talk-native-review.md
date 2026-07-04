# Dating & Real Talk Thai — native-review worksheet

**Status: PENDING NATIVE REVIEW. Do not ship any Thai from this file to users
until a native Thai speaker has reviewed and approved it.**

This is the internal worksheet for the optional, 18+, mature-language Super section
("Dating & Real Talk Thai"). A FIRST BATCH of draft phrases now ships in
`src/data/datingPhrases.js` and is rendered by `DatingSection.jsx` behind the 18+ gate
with a prominent **"Draft content — pending native-speaker review"** banner (the app does
NOT claim the content is reviewed). The **First shipped batch** table below is the review
artifact for that batch — verify it row by row. The older per-intent planning tables that
follow it are the original English-only scoping notes, kept for reference.

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

## First shipped batch — 60 draft phrases (rendered in-app with a "pending review" banner)

> These are the phrases now live in `src/data/datingPhrases.js` and rendered by `DatingSection.jsx`
> behind the 18+ gate with a prominent **"Draft content — pending native-speaker review"** banner.
> The app does **not** claim they are reviewed. Reviewer: verify Thai, tone marks, naturalness,
> severity, and the example sentence for each. Set each row's status from `pending` → `approved` / `revised` / `rejected`.
> Voice is male-default (ผม / ครับ). Tone marks: à low · á high · â falling · ǎ rising · (no mark = mid).

### 1. Introductions & flirting — 8 phrases (category severity: gentle)

| ID | Thai | Phonetic | English | Example (Thai / phonetic / English) | Severity | Note | Status |
|---|---|---|---|---|---|---|---|
| 90001 | ที่นี่มีคนนั่งไหมครับ | thîi nîi mii khon nâng mǎi khráp | Is anyone sitting here? / Is this seat taken? | ขอโทษครับ ที่นี่มีคนนั่งไหมครับ<br>khǎw thôht khráp, thîi nîi mii khon nâng mǎi khráp<br>Excuse me, is this seat taken? | gentle | Classic polite opener. Add ขอโทษครับ (excuse me) first to be smooth. | pending |
| 90002 | ขอทำความรู้จักหน่อยได้ไหมครับ | khǎw tham khwaam rúu-jàk nàwy dâai mǎi khráp | May I introduce myself / get to know you? | สวัสดีครับ ขอทำความรู้จักหน่อยได้ไหมครับ<br>sà-wàt-dii khráp, khǎw tham khwaam rúu-jàk nàwy dâai mǎi khráp<br>Hi, may I get to know you a little? | gentle | Warm, respectful way to open. หน่อย softens the request. | pending |
| 90003 | คุณชื่ออะไรครับ | khun chûe àrai khráp | What is your name? | ผมชื่อเจมส์ครับ แล้วคุณชื่ออะไรครับ<br>phǒm chûe Jem khráp, láew khun chûe àrai khráp<br>I'm James — and what's your name? | gentle |  | pending |
| 90004 | ขอนั่งด้วยได้ไหมครับ | khǎw nâng dûai dâai mǎi khráp | May I sit with you? | ที่นี่บรรยากาศดีนะครับ ขอนั่งด้วยได้ไหมครับ<br>thîi nîi ban-yaa-gàat dii ná khráp, khǎw nâng dûai dâai mǎi khráp<br>Nice atmosphere here — may I sit with you? | gentle |  | pending |
| 90005 | คุณน่ารักมากเลยครับ | khun nâa-rák mâak loei khráp | You're really cute / lovely. | ยิ้มของคุณน่ารักมากเลยครับ<br>yím khǎwng khun nâa-rák mâak loei khráp<br>Your smile is really lovely. | gentle | น่ารัก is sweet and safe — covers cute, endearing, charming. | pending |
| 90006 | ขอเบอร์หน่อยได้ไหมครับ | khǎw boe nàwy dâai mǎi khráp | May I have your number? | คุยกับคุณสนุกมาก ขอเบอร์หน่อยได้ไหมครับ<br>khui gàp khun sà-nùk mâak, khǎw boe nàwy dâai mǎi khráp<br>I really enjoyed talking with you — may I have your number? | gentle | เบอร์ (from "number") = phone number. Very common. | pending |
| 90007 | ขอไลน์ได้ไหมครับ | khǎw laai dâai mǎi khráp | Can I get your LINE? | ไว้คุยกันต่อนะครับ ขอไลน์ได้ไหมครับ<br>wái khui gan tàw ná khráp, khǎw laai dâai mǎi khráp<br>Let's keep chatting — can I add your LINE? | gentle | LINE is the main messaging app in Thailand — often exchanged before a phone number. | pending |
| 90008 | อยากเจอคุณอีกครับ | yàak jer khun ìik khráp | I'd like to see you again. | วันนี้สนุกมากครับ อยากเจอคุณอีก<br>wan níi sà-nùk mâak khráp, yàak jer khun ìik<br>Today was really fun — I want to see you again. | gentle |  | pending |

### 2. Dating apps & meeting plans — 6 phrases (category severity: gentle)

| ID | Thai | Phonetic | English | Example (Thai / phonetic / English) | Severity | Note | Status |
|---|---|---|---|---|---|---|---|
| 90015 | สุดสัปดาห์นี้ว่างไหมครับ | sùt sàp-daa níi wâang mǎi khráp | Are you free this weekend? | สุดสัปดาห์นี้ว่างไหมครับ อยากชวนไปกินข้าว<br>sùt sàp-daa níi wâang mǎi khráp, yàak chuan bpai gin khâao<br>Are you free this weekend? I'd like to take you to dinner. | gentle |  | pending |
| 90016 | ไปกินข้าวเย็นด้วยกันไหมครับ | bpai gin khâao yen dûai gan mǎi khráp | Would you like to go to dinner together? | ศุกร์นี้ไปกินข้าวเย็นด้วยกันไหมครับ<br>sùk níi bpai gin khâao yen dûai gan mǎi khráp<br>Want to grab dinner together this Friday? | gentle | กินข้าวเย็น = eat dinner. Swap เย็น for กลางวัน (lunch) or เช้า (breakfast). | pending |
| 90017 | เจอกันที่ร้านนี้ดีไหมครับ | jer gan thîi ráan níi dii mǎi khráp | Shall we meet at this place? | เจอกันที่ร้านนี้ดีไหมครับ คนเยอะ ปลอดภัยดี<br>jer gan thîi ráan níi dii mǎi khráp, khon yóe, bplàwt-phai dii<br>Shall we meet at this cafe? It's busy and feels safe. | gentle | Suggesting a public, busy spot is the polite, safety-minded default. | pending |
| 90018 | นัดกี่โมงดีครับ | nát gìi mohng dii khráp | What time should we meet? | พรุ่งนี้นัดกี่โมงดีครับ<br>phrûng níi nát gìi mohng dii khráp<br>What time works for us tomorrow? | gentle | นัด = to set an appointment / arrange to meet. | pending |
| 90019 | ขอโทษครับ ผมมาสายนิดหน่อย | khǎw thôht khráp, phǒm maa sǎai nít nàwy | Sorry, I'm running a little late. | ขอโทษครับ ผมมาสายนิดหน่อย รถติดมาก<br>khǎw thôht khráp, phǒm maa sǎai nít nàwy, rót tìt mâak<br>Sorry, I'm a little late — traffic is terrible. | gentle | มาสาย = to arrive late. รถติด = traffic jam (a very common reason). | pending |
| 90020 | ถึงแล้วบอกด้วยนะครับ | thǔeng láew bàwk dûai ná khráp | Let me know when you arrive. | เดินทางปลอดภัยนะครับ ถึงแล้วบอกด้วย<br>doen thaang bplàwt-phai ná khráp, thǔeng láew bàwk dûai<br>Travel safe — let me know when you get there. | gentle | Caring, safety-minded closer for planning a meetup. | pending |

### 3. Compliments — 6 phrases (category severity: gentle)

| ID | Thai | Phonetic | English | Example (Thai / phonetic / English) | Severity | Note | Status |
|---|---|---|---|---|---|---|---|
| 90009 | วันนี้คุณสวยมากครับ | wan níi khun sǔai mâak khráp | You look really beautiful today. | วันนี้คุณสวยมากครับ ชุดนี้เหมาะกับคุณมาก<br>wan níi khun sǔai mâak khráp, chút níi màw gàp khun mâak<br>You look beautiful today — that outfit really suits you. | gentle | For a man complimenting, หล่อ (làw) = handsome; สวย (sǔai) = beautiful. | pending |
| 90010 | ผมชอบมุกตลกของคุณ | phǒm chôp múk tà-lòk khǎwng khun | I love your sense of humor. | ผมชอบมุกตลกของคุณ คุยแล้วหัวเราะตลอดเลย<br>phǒm chôp múk tà-lòk khǎwng khun, khui láew hǔa-rawh tà-làwt loei<br>I love your sense of humor — I laugh the whole time we talk. | gentle |  | pending |
| 90011 | คุยกับคุณสบายใจจังเลยครับ | khui gàp khun sà-baai jai jang loei khráp | You're really easy to talk to. | ไม่รู้ทำไม คุยกับคุณสบายใจจังเลยครับ<br>mâi rúu tham-mai, khui gàp khun sà-baai jai jang loei khráp<br>I don't know why, but you're just so easy to talk to. | gentle | สบายใจ = at ease / comfortable (in the heart). A warm compliment. | pending |
| 90012 | คุณตายิ้มสวยนะครับ | khun taa-yím sǔai ná khráp | You have lovely, smiling eyes. | เวลาคุณหัวเราะ คุณตายิ้มสวยนะครับ<br>weh-laa khun hǔa-rawh, khun taa-yím sǔai ná khráp<br>When you laugh, your eyes smile beautifully. | gentle |  | pending |
| 90013 | คุณเป็นคนใจดีมากครับ | khun pen khon jai dee mâak khráp | You're a very kind person. | ขอบคุณที่ช่วยนะครับ คุณเป็นคนใจดีมาก<br>khàwp khun thîi chûai ná khráp, khun pen khon jai dee mâak<br>Thank you for helping — you are a very kind person. | gentle | ใจดี (kind-hearted) is a compliment about character, always well received. | pending |
| 90014 | คุณดูดีมากเลยวันนี้ | khun duu dii mâak loei wan níi | You look really great today. | โห คุณดูดีมากเลยวันนี้ ทำผมใหม่เหรอครับ<br>hǒo, khun duu dii mâak loei wan níi, tham phǒm mài rǒe khráp<br>Wow, you look great today — did you do something new with your hair? | gentle | ดูดี (looks good) is gender-neutral and safe for anyone. | pending |

### 4. Relationship language — 7 phrases (category severity: moderate)

| ID | Thai | Phonetic | English | Example (Thai / phonetic / English) | Severity | Note | Status |
|---|---|---|---|---|---|---|---|
| 90021 | ผมชอบคุณนะ | phǒm chôp khun ná | I like you. | บอกตรงๆ นะครับ ผมชอบคุณ<br>bàwk trong trong ná khráp, phǒm chôp khun<br>To be honest with you — I like you. | moderate | ชอบ (like) is the gentle first step; รัก (love) is much stronger — save it. | pending |
| 90022 | เราคบกันไหม | rao khóp gan mǎi | Do you want to date / be together? | ผมจริงจังกับคุณนะ เราคบกันไหม<br>phǒm jing-jang gàp khun ná, rao khóp gan mǎi<br>I'm serious about you — will you be my partner? | moderate | คบ (khóp) = to date / go steady. This is the "make it official" question. | pending |
| 90023 | เราเป็นอะไรกัน | rao pen àrai gan | What are we? (defining the relationship) | ถามตรงๆ ได้ไหม เราเป็นอะไรกัน<br>thǎam trong trong dâai mǎi, rao pen àrai gan<br>Can I ask directly — what are we? | moderate | The classic "define the relationship" talk. | pending |
| 90024 | คุณเป็นแฟนผมได้ไหม | khun pen faen phǒm dâai mǎi | Will you be my girlfriend/boyfriend? | ผมอยากอยู่กับคุณจริงๆ คุณเป็นแฟนผมได้ไหม<br>phǒm yàak yùu gàp khun jing jing, khun pen faen phǒm dâai mǎi<br>I really want to be with you — will you be my partner? | moderate | แฟน (faen) = boyfriend/girlfriend (gender-neutral in Thai). | pending |
| 90025 | เราคบกันแบบจริงจังไหม | rao khóp gan bàep jing-jang mǎi | Are we exclusive / serious? | ผมอยากรู้ว่าเราคบกันแบบจริงจังไหม<br>phǒm yàak rúu wâa rao khóp gan bàep jing-jang mǎi<br>I want to know whether we are serious/exclusive. | moderate | จริงจัง = serious. Ask this to clarify exclusivity. | pending |
| 90026 | คิดถึงคุณจังเลย | khít thǔeng khun jang loei | I miss you so much. | วันนี้ไม่ได้เจอกัน คิดถึงคุณจังเลย<br>wan níi mâi dâai jer gan, khít thǔeng khun jang loei<br>We didn't meet today — I miss you so much. | gentle | คิดถึง (khít thǔeng) = to miss someone. Sweet and very common. | pending |
| 90027 | ไปเจอเพื่อนๆ ผมไหม | bpai jer phûean phûean phǒm mǎi | Want to meet my friends? | เสาร์นี้เพื่อนผมนัดกัน ไปเจอเพื่อนๆ ผมไหม<br>sǎo níi phûean phǒm nát gan, bpai jer phûean phûean phǒm mǎi<br>My friends are meeting up Saturday — want to meet them? | gentle | Introducing someone to your friends is a meaningful relationship step here. | pending |

### 5. Boundaries & consent — 8 phrases (category severity: safety)

| ID | Thai | Phonetic | English | Example (Thai / phonetic / English) | Severity | Note | Status |
|---|---|---|---|---|---|---|---|
| 90028 | แบบนี้โอเคไหมครับ | bàep níi oh-keh mǎi khráp | Is this okay? | ผมขอจับมือได้ไหม แบบนี้โอเคไหมครับ<br>phǒm khǎw jàp mue dâai mǎi, bàep níi oh-keh mǎi khráp<br>May I hold your hand — is this okay? | safety | Always check in. Asking first shows respect and keeps consent clear. | pending |
| 90029 | ผมขอ...ได้ไหมครับ | phǒm khǎw ... dâai mǎi khráp | May I ...? (ask permission first) | ผมขอกอดได้ไหมครับ<br>phǒm khǎw gàwt dâai mǎi khráp<br>May I give you a hug? | safety | A template for asking consent. Fill in the action, e.g. กอด (hug). Wait for a clear yes. | pending |
| 90030 | ไม่เป็นไร ไม่ต้องรีบ | mâi pen rai, mâi tâwng rîip | It's fine, there's no rush. | ไม่เป็นไร ไม่ต้องรีบ ค่อยๆ ทำความรู้จักกันก็ได้<br>mâi pen rai, mâi tâwng rîip, khâwy khâwy tham khwaam rúu-jàk gan gâw dâai<br>It's fine, no rush — we can take our time getting to know each other. | safety | Reassuring the other person that there is no pressure. | pending |
| 90031 | ช้าๆ ได้ไหมครับ | cháa cháa dâai mǎi khráp | Can we slow down? | ผมชอบคุณนะ แต่ช้าๆ ได้ไหมครับ<br>phǒm chôp khun ná, tàe cháa cháa dâai mǎi khráp<br>I like you, but can we take it slow? | safety | A polite way to set your own pace and boundaries. | pending |
| 90032 | ผมไม่สะดวกใจ | phǒm mâi sà-dùak jai | I'm not comfortable with that. | ขอโทษนะ ผมไม่สะดวกใจ ขอแค่นี้ก่อน<br>khǎw thôht ná, phǒm mâi sà-dùak jai, khǎw khâe níi gàwn<br>Sorry, I'm not comfortable — let's leave it here for now. | safety | ไม่สะดวกใจ = not comfortable (emotionally). Clear, polite way to decline. | pending |
| 90033 | หยุดก่อนนะ | yùt gàwn ná | Please stop. | หยุดก่อนนะ ผมยังไม่พร้อม<br>yùt gàwn ná, phǒm yang mâi phráwm<br>Please stop — I'm not ready. | safety | หยุด = stop. A clear "no" must always be respected immediately. | pending |
| 90034 | ไม่ แปลว่า ไม่ | mâi bplae wâa mâi | No means no. | ผมบอกว่าไม่ ไม่ แปลว่า ไม่ นะครับ<br>phǒm bàwk wâa mâi, mâi bplae wâa mâi ná khráp<br>I said no — and no means no. | safety | Non-negotiable principle. Respect a no the first time. | pending |
| 90035 | เคารพการตัดสินใจของกันและกัน | khao-róp gaan tàt-sǐn jai khǎwng gan láe gan | Let's respect each other's decisions. | ไม่ว่าจะยังไง เราเคารพการตัดสินใจของกันและกันนะ<br>mâi wâa jà yang-ngai, rao khao-róp gaan tàt-sǐn jai khǎwng gan láe gan ná<br>Whatever happens, let's respect each other's decisions. | safety | เคารพ = to respect. A mature, mutual framing of boundaries. | pending |

### 6. Awkward situations — 5 phrases (category severity: moderate)

| ID | Thai | Phonetic | English | Example (Thai / phonetic / English) | Severity | Note | Status |
|---|---|---|---|---|---|---|---|
| 90036 | ผมว่าเราเข้าใจผิดกันนิดหน่อย | phǒm wâa rao khâo jai phìt gan nít nàwy | I think there was a little misunderstanding. | ผมว่าเราเข้าใจผิดกันนิดหน่อย ขอคุยกันดีๆ นะ<br>phǒm wâa rao khâo jai phìt gan nít nàwy, khǎw khui gan dii dii ná<br>I think we had a little misunderstanding — let's talk it out calmly. | moderate | เข้าใจผิด = to misunderstand. Defuses tension gently. | pending |
| 90037 | ขอเป็นเพื่อนกันได้ไหมครับ | khǎw pen phûean gan dâai mǎi khráp | Can we just be friends? | คุณเป็นคนดีมาก แต่ขอเป็นเพื่อนกันได้ไหมครับ<br>khun pen khon dii mâak, tàe khǎw pen phûean gan dâai mǎi khráp<br>You're a really good person, but can we just be friends? | moderate | Kind way to signal you see it as friendship, not romance. | pending |
| 90038 | ขอโทษครับ ผมมีแฟนแล้ว | khǎw thôht khráp, phǒm mii faen láew | Sorry, I'm seeing someone already. | ขอบคุณนะครับ แต่ขอโทษ ผมมีแฟนแล้ว<br>khàwp khun ná khráp, tàe khǎw thôht, phǒm mii faen láew<br>Thank you, but sorry — I'm already seeing someone. | moderate | มีแฟนแล้ว = already have a partner. Honest, respectful decline. | pending |
| 90039 | ขอโทษถ้าผมทำให้รู้สึกไม่ดี | khǎw thôht thâa phǒm tham hâi rúu-sùek mâi dii | Sorry if I made you feel uncomfortable. | ขอโทษถ้าผมทำให้รู้สึกไม่ดีนะครับ ผมไม่ได้ตั้งใจ<br>khǎw thôht thâa phǒm tham hâi rúu-sùek mâi dii ná khráp, phǒm mâi dâai tâng-jai<br>Sorry if I made you feel bad — I didn't mean to. | moderate | A graceful apology when you misread a signal. | pending |
| 90040 | ไม่ต้องรู้สึกอึดอัดนะครับ | mâi tâwng rúu-sùek ùet-àt ná khráp | No need to feel awkward. | ไม่เป็นไรเลย ไม่ต้องรู้สึกอึดอัดนะครับ<br>mâi pen rai loei, mâi tâwng rúu-sùek ùet-àt ná khráp<br>It's totally fine — no need to feel awkward. | gentle | อึดอัด = awkward / uneasy. Puts the other person at ease. | pending |

### 7. Arguments & breakups — 5 phrases (category severity: moderate)

| ID | Thai | Phonetic | English | Example (Thai / phonetic / English) | Severity | Note | Status |
|---|---|---|---|---|---|---|---|
| 90041 | เราคุยกันหน่อยได้ไหม | rao khui gan nàwy dâai mǎi | Can we talk? | มีเรื่องอยากบอก เราคุยกันหน่อยได้ไหม<br>mii rûeang yàak bàwk, rao khui gan nàwy dâai mǎi<br>There's something I want to say — can we talk? | moderate | Opens a serious conversation without being aggressive. | pending |
| 90042 | ผมขอเวลาอยู่คนเดียวหน่อย | phǒm khǎw weh-laa yùu khon diao nàwy | I need some space / time alone. | ตอนนี้ผมขอเวลาอยู่คนเดียวหน่อยนะ<br>tawn níi phǒm khǎw weh-laa yùu khon diao nàwy ná<br>Right now I need a little time to myself. | moderate | อยู่คนเดียว = to be alone. Asks for space respectfully. | pending |
| 90043 | ผมว่าเราควรเลิกกัน | phǒm wâa rao khuan lôek gan | I think we should break up. | ผมคิดมาเยอะแล้ว ผมว่าเราควรเลิกกันนะ<br>phǒm khít maa yóe láew, phǒm wâa rao khuan lôek gan ná<br>I've thought about it a lot — I think we should break up. | moderate | เลิกกัน (lôek gan) = to break up. Say it kindly and directly. | pending |
| 90044 | อย่าทะเลาะกันเลยนะ | yàa thá-láw gan loei ná | Let's not fight. | ใจเย็นๆ นะ อย่าทะเลาะกันเลย<br>jai yen yen ná, yàa thá-láw gan loei<br>Let's stay calm — let's not fight. | moderate | ทะเลาะ = to argue/quarrel. ใจเย็นๆ = stay calm. | pending |
| 90045 | ขอบคุณสำหรับทุกอย่างนะ | khàwp khun sǎm-ràp thúk yàang ná | Thank you for everything. | ถึงจะจบแบบนี้ ก็ขอบคุณสำหรับทุกอย่างนะ<br>thǔeng jà jòp bàep níi, gâw khàwp khun sǎm-ràp thúk yàang ná<br>Even though it ends this way, thank you for everything. | gentle | A graceful, respectful closing line for a breakup. | pending |

### 8. Nightlife language — 6 phrases (category severity: moderate)

| ID | Thai | Phonetic | English | Example (Thai / phonetic / English) | Severity | Note | Status |
|---|---|---|---|---|---|---|---|
| 90046 | ขอเบียร์สองที่ครับ | khǎw bia sǎwng thîi khráp | Two beers, please. | ขอเบียร์สองที่ครับ เย็นๆ นะครับ<br>khǎw bia sǎwng thîi khráp, yen yen ná khráp<br>Two beers please — nice and cold. | moderate | เบียร์ = beer. ...ที่ (thîi) counts servings/orders. | pending |
| 90047 | รอบนี้ผมเลี้ยงเอง | râwp níi phǒm líang eng | This round's on me. | เก็บเงินไว้เถอะ รอบนี้ผมเลี้ยงเอง<br>gèp ngoen wái thòe, râwp níi phǒm líang eng<br>Put your money away — this round's on me. | moderate | เลี้ยง (líang) = to treat/pay for someone. A friendly gesture. | pending |
| 90048 | ผมว่าผมดื่มพอแล้ว | phǒm wâa phǒm dùem phaw láew | I think I've had enough to drink. | ขอบคุณนะ แต่ผมว่าผมดื่มพอแล้ว<br>khàwp khun ná, tàe phǒm wâa phǒm dùem phaw láew<br>Thanks, but I think I've had enough to drink. | moderate | พอแล้ว = enough already. Knowing your limit is smart and respected. | pending |
| 90049 | ผมกลับก่อนนะครับ | phǒm glàp gàwn ná khráp | I'm heading home now. | ดึกแล้ว ผมกลับก่อนนะครับ<br>dùek láew, phǒm glàp gàwn ná khráp<br>It's late — I'm heading home now. | moderate | กลับก่อน = leave/go back first. Polite way to excuse yourself. | pending |
| 90050 | เรียกแท็กซี่ให้หน่อยได้ไหมครับ | rîak tháek-sîi hâi nàwy dâai mǎi khráp | Could you call me a taxi? | ดึกแล้ว เรียกแท็กซี่ให้หน่อยได้ไหมครับ<br>dùek láew, rîak tháek-sîi hâi nàwy dâai mǎi khráp<br>It's late — could you call me a taxi? | moderate | เรียกแท็กซี่ = call a taxi. Getting home safely comes first. | pending |
| 90051 | ถึงบ้านแล้วทักมานะ | thǔeng bâan láew thák maa ná | Text me when you get home safe. | เดินทางปลอดภัยนะ ถึงบ้านแล้วทักมา<br>doen thaang bplàwt-phai ná, thǔeng bâan láew thák maa<br>Get home safe — text me when you arrive. | safety | ทัก = to message/ping someone. Caring, safety-minded sign-off. | pending |

### 9. Casual slang — 6 phrases (category severity: moderate)

| ID | Thai | Phonetic | English | Example (Thai / phonetic / English) | Severity | Note | Status |
|---|---|---|---|---|---|---|---|
| 90052 | เจ๋งมาก | jěng mâak | That's so cool / awesome. | ที่คุณทำได้เนี่ย เจ๋งมากเลย<br>thîi khun tham dâai nîa, jěng mâak loei<br>What you pulled off — that is so cool. | moderate | เจ๋ง = cool/awesome. Casual, friendly, safe. | pending |
| 90053 | ไม่จริงน่า | mâi jing nâa | No way! / You're kidding! | ไม่จริงน่า เธอเจอดาราด้วยเหรอ<br>mâi jing nâa, thoe jer daa-raa dûai rǒe<br>No way — you met a celebrity?! | moderate | Playful disbelief. เธอ (thoe) = casual "you" among friends. | pending |
| 90054 | จริงดิ | jing dì | Seriously? / For real? | จริงดิ เขาพูดแบบนั้นจริงๆ เหรอ<br>jing dì, khǎo phûut bàep nán jing jing rǒe<br>For real? He actually said that? | moderate | Very casual "for real?". Use with friends, not in formal settings. | pending |
| 90055 | เพื่อน | phûean | friend / buddy / bro | เป็นไงบ้างเพื่อน ไม่ได้เจอกันนานเลย<br>pen ngai bâang phûean, mâi dâai jer gan naan loei<br>How's it going, buddy — long time no see! | gentle | เพื่อน = friend. Warm, universal, safe. | pending |
| 90056 | ชิลๆ | chin chin | chill / relaxed / no big deal | ไม่ต้องคิดมาก อยู่แบบชิลๆ ก็พอ<br>mâi tâwng khít mâak, yùu bàep chin chin gâw phaw<br>Don't overthink it — just keep it chill. | moderate | ชิลๆ (from English "chill") = relaxed, easygoing. | pending |
| 90057 | 5555 | hâa hâa hâa hâa | haha / lol (in text) | มุกนั้นตลกมาก 5555<br>múk nán tà-lòk mâak, hâa hâa hâa hâa<br>That joke was hilarious lol | gentle | The number 5 is pronounced "hâa," so "555" = "hahaha" in Thai texting. | pending |

### 10. Mild swear words & insults — 3 phrases (category severity: strong)

| ID | Thai | Phonetic | English | Example (Thai / phonetic / English) | Severity | Note | Status |
|---|---|---|---|---|---|---|---|
| 90058 | บ้าจริง | bâa jing | "Damn it!" / "Oh, come on!" (mild frustration) | บ้าจริง ลืมกุญแจไว้ที่บ้านอีกแล้ว<br>bâa jing, luem gun-jae wái thîi bâan ìik láew<br>Damn it — I left my keys at home again. | strong | Recognition only. Mild "ugh/darn"-level. Said to yourself, not aimed at a person. | pending |
| 90059 | เชี่ย | chîa | "Damn / whoa" (mild slang exclamation) | เชี่ย ตกใจหมดเลย<br>chîa, tòk-jai mòt loei<br>Whoa — you scared me! | strong | Recognition only, so you understand it when heard. Rough/informal — best not to use; never aim it at someone. | pending |
| 90060 | ปัญญาอ่อน | pan-yaa àwn | "That's so dumb" (light insult about a thing/idea) | กฎอะไรปัญญาอ่อนแบบนี้<br>gòt àrai pan-yaa àwn bàep níi<br>What kind of dumb rule is this? | strong | Recognition only. Insulting if aimed at a person — understand it, do not use it on someone. | pending |

---

## Original planning notes (English-only scoping — superseded by the batch above)

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
- [ ] On approval: apply corrections to `src/data/datingPhrases.js`, set each row's
      `reviewStatus` to `approved`, flip `DATING_REVIEW_STATUS` (and, once the whole
      section is approved, `DATING_REVIEW_COMPLETE`), and update the draft banner copy
