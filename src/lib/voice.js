// Transforms male-voice card content to female-voice on render.
// No data duplication needed — pronouns/particles flip at display time.

export const DEFAULT_VOICE = 'male';
export const DEFAULT_VIEW_MODE = 'speak';

export function transformThai(thai, voice) {
  if (!thai || voice !== 'female') return thai;
  // Pronoun: ผม -> ฉัน
  let out = thai.replace(/ผม/g, 'ฉัน');
  // Particles: ครับ -> ค่ะ (statement) or คะ (question)
  // Simple rule: if line ends with ? (question), use คะ; otherwise ค่ะ
  const isQuestion = /\?\s*$/.test(out) || /(ไหม|มั้ย|หรือ|รึ)\s*ครับ/.test(out);
  if (isQuestion) {
    out = out.replace(/ครับ/g, 'คะ');
  } else {
    out = out.replace(/ครับ/g, 'ค่ะ');
  }
  return out;
}

export function transformPh(ph, voice) {
  if (!ph || voice !== 'female') return ph;
  let out = ph.replace(/\bphǒm\b/g, 'chán');
  // Question detection: ends with ? OR contains question particle before khráp
  const isQuestion = /\?\s*$/.test(out) || /(mǎi|rǔe|rài)\s+khráp/i.test(out);
  if (isQuestion) {
    out = out.replace(/\bkhráp\b/g, 'khá');
  } else {
    out = out.replace(/\bkhráp\b/g, 'khâ');
  }
  return out;
}

export function transformEn(en, voice) {
  if (!en || voice !== 'female') return en;
  return en.replace(/\(male\)/g, '(female)').replace(/I \/ me \(male\)/g, 'I / me (female)');
}

// Apply all transforms to a card object
export function displayCard(card, voice) {
  if (!card || voice !== 'female') return card;
  return {
    ...card,
    thai: transformThai(card.thai, voice),
    ph: transformPh(card.ph, voice),
    en: transformEn(card.en, voice),
    note: card.note ? transformEn(transformPh(card.note, voice), voice) : card.note,
  };
}

export function displayLine(line, voice) {
  if (!line || voice !== 'female') return line;
  return {
    ...line,
    thai: transformThai(line.thai, voice),
    ph: transformPh(line.ph, voice),
  };
}
