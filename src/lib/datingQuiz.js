// Pure logic for the interactive "Dating & Real Talk Thai" learning mode.
// No React, no DOM — node-importable so scripts/check-dating-quiz.mjs can
// validate the question bank and the exact rules the UI uses.
//
// SAFETY MODEL: questions never carry Thai script themselves — all Thai is
// referenced via phraseId into DATING_PHRASES (the reviewed-pending draft set),
// so the interactive mode can never introduce new unreviewed Thai. The
// validator enforces this by scanning datingQuestions.js for Thai characters.

// ── Badge derivations (shared by the UI and validators) ─────────────────────
// TWO AXES, DELIBERATELY SEPARATE (claude-review.md P1):
//   • SEVERITY_LABEL (below) = the HANDLING label. Gentle/Casual/Handle with
//     care grade how much care a phrase needs; 'safety' is off that intensity
//     grade entirely — it flags TOPIC/RISK (consent, boundaries, getting home)
//     and is the one band a learner SHOULD reach for. Four labels, one per
//     phrase, mutually exclusive.
//   • CATEGORY_REGISTER (further down) = the actual LANGUAGE-REGISTER axis
//     (Slang / Rude). Separate field, separate badge, separate question.
// The word "register" therefore belongs to CATEGORY_REGISTER and to nothing
// else. Tone questions used to ask "what register is it?" over the four
// SEVERITY_LABEL values, which taught a category error: it made "Safety" an
// answer to a register question, and left "Gentle" and "Safety" both true of a
// calmly-spoken consent phrase — two correct options on a graded item. The stem
// now asks for the handling label the section teaches (TONE_STEM_AXIS), which
// exactly one of the four satisfies. validateQuestion enforces both halves.
export const SEVERITY_LABEL = {
  gentle: 'Gentle',
  moderate: 'Casual',
  strong: 'Handle with care',
  safety: 'Safety',
};

// Canonical wording of the tone question's ASK. Tone stems may vary their
// subject noun ("this phrase" / "this compliment" / "this exclamation") but
// must ask this one question. The bank spells its prompts out in full (it is
// flat data, it imports nothing), so this is the string validateQuestion holds
// them to — the one place the axis wording is defined, and the reason it cannot
// quietly drift back onto register.
export const TONE_STEM_AXIS = 'which of these labels does it carry?';

// Usage guidance derived from the reviewer-set severity. Safety phrases
// (consent, boundaries, getting home) are exactly the ones a learner SHOULD use.
export const USAGE_GUIDANCE = {
  gentle: { label: 'Safe to use', cls: 'safe' },
  moderate: { label: 'Use carefully', cls: 'careful' },
  strong: { label: 'Don’t use casually', cls: 'avoid' },
  safety: { label: 'Safe to use', cls: 'safe' },
};

// Language-register flag for categories whose register itself needs a warning.
export const CATEGORY_REGISTER = {
  'casual-slang': { label: 'Slang', cls: 'slang' },
  'mild-swears-insults': { label: 'Rude', cls: 'rude' },
};

// Native-review status → badge. Labels flip automatically when the native
// reviewer marks items approved; never claim approval that isn't in the data.
export const REVIEW_STATUS = {
  pending: { label: 'Native review pending', cls: 'review-pending' },
  approved: { label: 'Native approved', cls: 'review-approved' },
  'needs-review': { label: 'Needs review', cls: 'review-needs' },
};
export const reviewBadge = (status) => REVIEW_STATUS[status] || REVIEW_STATUS.pending;

// All shipped phrases are male-polite form (ผม / ครับ) per the app-wide
// male-default voice convention; badge it so female learners know to swap.
export const isMaleForm = (p) =>
  /ครับ|ผม/.test(`${p.thai} ${p.example ? p.example.thai : ''}`);

// ── Question model ───────────────────────────────────────────────────────────
// DIRECTION RULE (owner requirement): this pack teaches RECOGNITION —
// Thai phrase → English meaning/context/tone/usage judgement. Every question
// shows its Thai subject phrase, and every answer option is English text.
// English-scenario → choose-the-Thai-phrase questions are forbidden; the
// validator and resolver both reject Thai (phraseId) answer options.
export const QUESTION_TYPES = ['meaning', 'context', 'tone', 'usage', 'scenario', 'caution'];

export const QUESTION_TYPE_LABEL = {
  meaning: 'Best meaning',
  context: 'Context check',
  tone: 'Tone check',
  usage: 'Usage judgement',
  scenario: 'Judgement call',
  caution: 'Careful with this',
};

// Thai→English direction: every question type shows the subject phrase
// (Thai + phonetic) above the prompt. Kept as a function so the UI and the
// validators share one source of truth for the direction rule.
export const promptShowsPhrase = () => true;

// Whether severity/tone/usage badges on the QUESTION card would leak the
// answer before reveal. Tone questions ask for exactly what those badges say;
// usage/scenario/caution questions ask for the judgement the usage badge
// encodes. The full badge set always appears on the explanation panel after
// reveal — this is answer-hygiene, not badge removal.
export const badgesLeakAnswer = (questionType) =>
  questionType === 'tone' || questionType === 'usage'
  || questionType === 'scenario' || questionType === 'caution';

// Neutral placeholder chip shown wherever an answer-revealing badge is
// suppressed pre-reveal (answer-hygiene, not badge removal — the real badge
// returns on reveal). Shared so the UI and validators agree on the label.
// Wording: "Hidden until you answer" — the earlier "Answer after reveal" read
// as an instruction rather than a placeholder (UX audit).
export const ANSWER_AFTER_REVEAL_LABEL = 'Hidden until you answer';

// Direction guard helper: an option carrying a phraseId is a Thai answer
// option, which the Thai→English direction forbids.
export const optionIsPhrase = (opt) => Number.isFinite(opt.phraseId);

// Resolve a question against the phrase bank into a render-ready view model.
// Throws on a broken reference or a Thai answer option — the validator runs
// this over the whole bank so a bad question can never reach production.
export function resolveQuestion(q, phraseById) {
  const phrase = phraseById.get(q.phraseId);
  if (!phrase) throw new Error(`question ${q.id}: unknown phraseId ${q.phraseId}`);
  const options = q.options.map((opt) => {
    if (optionIsPhrase(opt)) {
      throw new Error(`question ${q.id}: option ${opt.id} is a Thai phrase option — direction must be Thai→English`);
    }
    return { ...opt };
  });
  if (!options.some((o) => o.id === q.correctOptionId)) {
    throw new Error(`question ${q.id}: correctOptionId ${q.correctOptionId} not among options`);
  }
  return {
    ...q,
    phrase,
    options,
    literal: q.literal || null,
    severity: phrase.severity,
    tone: SEVERITY_LABEL[phrase.severity],
    riskLevel: USAGE_GUIDANCE[phrase.severity].cls,
    usageGuidance: USAGE_GUIDANCE[phrase.severity].label,
    register: CATEGORY_REGISTER[q.cat] || null,
    speakerNote: isMaleForm(phrase) ? 'Male form' : null,
    nativeReviewStatus: phrase.reviewStatus || 'pending',
  };
}

export const gradeAnswer = (q, optionId) => optionId === q.correctOptionId;

// Structural validation for one raw question. Returns an array of error
// strings (empty = valid). Used by scripts/check-dating-quiz.mjs. Enforces the
// Thai→English direction: the subject phrase carries the Thai; every option
// (and the prompt/explanation) must be Thai-free English text.
const THAI_RE = /[฀-๿]/;

export function validateQuestion(q, phraseById, categoryIds) {
  const errors = [];
  const err = (m) => errors.push(`${q.id || '(no id)'}: ${m}`);
  if (!q.id || typeof q.id !== 'string') err('missing string id');
  if (!categoryIds.has(q.cat)) err(`unknown category "${q.cat}"`);
  if (!QUESTION_TYPES.includes(q.questionType)) err(`unknown questionType "${q.questionType}" (English-to-Thai types like response/safest are forbidden)`);
  if (!q.prompt || typeof q.prompt !== 'string') err('missing prompt');
  else if (THAI_RE.test(q.prompt)) err('prompt contains Thai script (Thai renders only from the subject phrase)');
  if (!q.explanation || typeof q.explanation !== 'string') err('missing explanation');
  else if (THAI_RE.test(q.explanation)) err('explanation contains Thai script');
  const subject = phraseById.get(q.phraseId);
  if (!subject) err(`unknown phraseId ${q.phraseId} (every question must reference one main Thai phrase)`);
  else if (subject.cat !== q.cat) err(`subject phrase ${q.phraseId} belongs to "${subject.cat}", not "${q.cat}"`);
  if (!Array.isArray(q.options) || q.options.length < 2) err('needs at least 2 options');
  else {
    const ids = new Set();
    for (const opt of q.options) {
      if (!opt.id) err('option missing id');
      if (ids.has(opt.id)) err(`duplicate option id "${opt.id}"`);
      ids.add(opt.id);
      if (optionIsPhrase(opt)) {
        err(`option ${opt.id} is a Thai phrase option — answer options must be English text (Thai→English direction)`);
      } else if (!opt.text || typeof opt.text !== 'string') {
        err(`option ${opt.id} needs English text`);
      } else if (THAI_RE.test(opt.text)) {
        err(`option ${opt.id} contains Thai script — options must be English before reveal`);
      }
    }
    if (!ids.has(q.correctOptionId)) err(`correctOptionId "${q.correctOptionId}" not an option`);
    if (q.questionType === 'tone') {
      const labels = new Set(Object.values(SEVERITY_LABEL));
      for (const opt of q.options) {
        if (!labels.has(opt.text)) err(`tone option "${opt.text}" is not a severity label`);
      }
      const correct = q.options.find((o) => o.id === q.correctOptionId);
      if (subject && correct && correct.text !== SEVERITY_LABEL[subject.severity]) {
        err(`tone answer "${correct && correct.text}" does not match subject severity "${subject && subject.severity}"`);
      }
      // Axis lock (claude-review.md P1). The options are the four SEVERITY_LABEL
      // handling labels, so the stem must ask for a handling label. Asking "what
      // register is it?" over them conflates two axes and makes "Gentle" and
      // "Safety" both defensible for a gently-spoken consent phrase.
      if (!q.prompt.toLowerCase().includes(TONE_STEM_AXIS)) {
        err(`tone stem must ask the handling-label question ("… ${TONE_STEM_AXIS}") — the options ARE the handling labels`);
      }
      if (/\bregisters?\b/i.test(q.prompt)) {
        err('tone stem must not say "register" — register is the separate CATEGORY_REGISTER axis (Slang/Rude), not the severity labels');
      }
    }
  }
  if (q.literal && THAI_RE.test(q.literal)) err('literal gloss contains Thai script');
  if (subject && subject.severity === 'strong' && !q.warning) {
    err('strong-severity subject requires a warning field');
  }
  return errors;
}
