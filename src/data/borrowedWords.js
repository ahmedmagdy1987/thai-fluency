// "Words You Already Know" — bonus list of Thai words borrowed from (or very
// close to) English/international words. Purpose: a quick confidence boost for
// beginners; NOT part of the mission path, SRS deck, XP, or stage progression.
//
// Content rules for this file:
// - Every entry is PENDING NATIVE REVIEW (see BORROWED_WORDS_REVIEW_STATUS and
//   docs/borrowed-english-words-notes.md). Script, romanization, and notes need
//   a native speaker's confirmation before this list is called final.
// - Notes never claim the pronunciation is identical to English; Thai gives
//   these words its own sounds and tones. "Sounds familiar" is the ceiling.
// - This list is a starter set, not a complete catalogue of Thai loanwords.
// - No alcohol or sensitive examples.
export const BORROWED_WORDS_REVIEW_STATUS = 'pending-native-review';

export const BORROWED_WORDS = [
  {
    id: 'taxi',
    english: 'taxi',
    thai: 'แท็กซี่',
    romanization: 'tháek-sîi',
    note: 'Flag one down and you already know the word. Thai adds its own tones.',
  },
  {
    id: 'bus',
    english: 'bus',
    thai: 'รถบัส',
    romanization: 'rót bát',
    note: 'rót means vehicle; the bát part will sound familiar right away.',
  },
  {
    id: 'coffee',
    english: 'coffee',
    thai: 'กาแฟ',
    romanization: 'gaa-fae',
    note: 'A borrowed-style word you can order with on your very first morning.',
  },
  {
    id: 'menu',
    english: 'menu',
    thai: 'เมนู',
    romanization: 'mee-nuu',
    note: 'Ask for this in any restaurant and it sounds close to what you expect.',
  },
  {
    id: 'pizza',
    english: 'pizza',
    thai: 'พิซซ่า',
    romanization: 'phít-sâa',
    note: 'Comfort food with a familiar name, said with a Thai rhythm.',
  },
  {
    id: 'chocolate',
    english: 'chocolate',
    thai: 'ช็อกโกแลต',
    romanization: 'chók-goo-láet',
    note: 'Longer in Thai, but your ear will catch it immediately.',
  },
  {
    id: 'ice-cream',
    english: 'ice cream',
    thai: 'ไอศกรีม',
    romanization: 'ai-sà-griim',
    note: 'A hot-day essential that sounds pleasantly familiar.',
  },
  {
    id: 'computer',
    english: 'computer',
    thai: 'คอมพิวเตอร์',
    romanization: 'khawm-phiu-dtôe',
    note: 'Often shortened to just khawm in everyday talk.',
  },
  {
    id: 'internet',
    english: 'internet',
    thai: 'อินเทอร์เน็ต',
    romanization: 'in-thoe-nét',
    note: 'You will see and hear this one everywhere, and it sounds familiar.',
  },
  {
    id: 'wifi',
    english: 'wifi',
    thai: 'ไวไฟ',
    romanization: 'wai-fai',
    note: 'Ask for the wifi and Thai speakers will understand you instantly.',
  },
  {
    id: 'clinic',
    english: 'clinic',
    thai: 'คลินิก',
    romanization: 'khlii-ník',
    note: 'A useful word to recognize on signs around any neighborhood.',
  },
  {
    id: 'passport',
    english: 'passport',
    thai: 'พาสปอร์ต',
    romanization: 'pháat-sà-bpàwt',
    note: 'The everyday borrowed word; Thai also has its own formal term.',
  },
  {
    id: 'air-con',
    english: 'air conditioning',
    thai: 'แอร์',
    romanization: 'ae',
    note: 'Thai shortened "air conditioner" to just ae. You will use it a lot.',
  },
];

export default BORROWED_WORDS;
