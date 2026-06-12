# Borrowed English Words Bonus ("Words You Already Know")

Date added: June 12, 2026
Status: shipped as an optional bonus; **all content pending native review**

## What it is

A small confidence-boost feature for beginners: a list of Thai words that are
borrowed from (or sound very close to) English or international words, so a new
learner hears that they already have a head start. Working name in the UI:
**"Bonus: Words You Already Know"**.

- Data: `src/data/borrowedWords.js` (13 starter words; collection-level
  `BORROWED_WORDS_REVIEW_STATUS = 'pending-native-review'`).
- UI: `src/components/BorrowedWordsBonus.jsx`, opened from a gold "Bonus" teaser
  card on the Learn path (`LearnPath.jsx`), in the same lightweight modal shell
  as the "Thai basics" primer. Each word has a speaker button that plays the
  Thai via the existing `speakThai` TTS helper.

## Safety and scope decisions

- **Optional only.** Not part of mission progression, stage unlocks, the SRS
  deck, Challenge pools, or quests. Closing the modal leaves no state behind.
- **No XP.** Granting XP would have needed new anti-farming guards; skipped.
- **No schema or storage changes.** Pure presentational feature.
- **Existing cards untouched.** The bonus list is a separate data file; nothing
  in `cards.js` or `miniUnits.js` changed for this feature.
- **No "same as English" claims.** The lead and notes say the words "sound
  familiar"; the intro explicitly states Thai gives each word its own sounds and
  tones.
- **No alcohol or sensitive examples.**
- **Placement:** Learn path only (signed-in home). A public-homepage teaser was
  considered and skipped to keep the landing focused on the primary CTA; can be
  added later if the owner wants it.

## The starter words (all pending native review)

| English | Thai | Romanization | Note focus |
| --- | --- | --- | --- |
| taxi | แท็กซี่ | tháek-sîi | travel |
| bus | รถบัส | rót bát | travel (รถ = vehicle) |
| coffee | กาแฟ | gaa-fae | food/drink |
| menu | เมนู | mee-nuu | restaurants |
| pizza | พิซซ่า | phít-sâa | food |
| chocolate | ช็อกโกแลต | chók-goo-láet | food (spelling variants exist) |
| ice cream | ไอศกรีม | ai-sà-griim | food |
| computer | คอมพิวเตอร์ | khawm-phiu-dtôe | tech (often shortened to คอม) |
| internet | อินเทอร์เน็ต | in-thoe-nét | tech |
| wifi | ไวไฟ | wai-fai | tech/travel |
| clinic | คลินิก | khlii-ník | health/signs |
| passport | พาสปอร์ต | pháat-sà-bpàwt | travel (formal term is หนังสือเดินทาง) |
| air conditioning | แอร์ | ae | daily life |

Candidates that were considered and **excluded on accuracy grounds**: "hotel"
(โรงแรม is a native compound, not a borrowed word), "phone" (โทรศัพท์ is a
formal coinage), "bank" (ธนาคาร is native-Sanskrit; the colloquial แบงก์ has
unstable spelling), "camera" (กล้อง is native). Rule applied: when uncertain,
leave it out.

## Native review checklist for this list

For each word: (a) Thai spelling is the standard one, (b) romanization and tone
marks are right, (c) the note is accurate and not overclaiming, (d) the word is
actually used this way in everyday Thai. Log decisions in
`docs/native-review-issues.md` like the mini-unit content.
