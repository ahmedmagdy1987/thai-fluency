// Pure logic for the interactive "Dating & Real Talk Thai" learning mode.
// No React, no DOM — node-importable so scripts/check-dating-quiz.mjs can
// validate the question bank and the exact rules the UI uses.
//
// SAFETY MODEL: questions never carry Thai script themselves — all Thai is
// referenced via phraseId into DATING_PHRASES (the reviewed-pending draft set),
// so the interactive mode can never introduce new unreviewed Thai. The
// validator enforces this by scanning datingQuestions.js for Thai characters.

// ── Badge derivations (shared by the UI and validators) ─────────────────────
export const SEVERITY_LABEL = {
  gentle: 'Gentle',
  moderate: 'Casual',
  strong: 'Handle with care',
  safety: 'Safety',
};

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
export const QUESTION_TYPES = ['meaning', 'response', 'safest', 'tone', 'scenario'];

export const QUESTION_TYPE_LABEL = {
  meaning: 'Best meaning',
  response: 'Natural response',
  safest: 'Safest choice',
  tone: 'Tone check',
  scenario: 'Judgement call',
};

// Whether the question card shows the subject phrase (Thai + phonetic) above
// the prompt. response/safest questions hide it — the options ARE phrases and
// showing the subject (= the correct option) would leak the answer.
export const promptShowsPhrase = (questionType) =>
  questionType === 'meaning' || questionType === 'tone' || questionType === 'scenario';

// Whether severity/tone/usage badges on the QUESTION card would leak the
// answer before reveal. Tone questions ask for exactly what those badges say;
// scenario questions ask for the judgement the usage badge encodes. The full
// badge set always appears on the explanation panel after reveal.
export const badgesLeakAnswer = (questionType) =>
  questionType === 'tone' || questionType === 'scenario' || questionType === 'safest';

// Options: { id, text } renders an English option; { id, phraseId } renders a
// phrase option (Thai + phonetic pre-reveal; English meaning shown post-reveal).
export const optionIsPhrase = (opt) => Number.isFinite(opt.phraseId);

// Resolve a question against the phrase bank into a render-ready view model.
// Throws on a broken reference — the validator runs this over the whole bank so
// a bad question can never reach production.
export function resolveQuestion(q, phraseById) {
  const phrase = phraseById.get(q.phraseId);
  if (!phrase) throw new Error(`question ${q.id}: unknown phraseId ${q.phraseId}`);
  const options = q.options.map((opt) => {
    if (optionIsPhrase(opt)) {
      const p = phraseById.get(opt.phraseId);
      if (!p) throw new Error(`question ${q.id}: option ${opt.id} unknown phraseId ${opt.phraseId}`);
      return { ...opt, phrase: p };
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
// strings (empty = valid). Used by scripts/check-dating-quiz.mjs.
export function validateQuestion(q, phraseById, categoryIds) {
  const errors = [];
  const err = (m) => errors.push(`${q.id || '(no id)'}: ${m}`);
  if (!q.id || typeof q.id !== 'string') err('missing string id');
  if (!categoryIds.has(q.cat)) err(`unknown category "${q.cat}"`);
  if (!QUESTION_TYPES.includes(q.questionType)) err(`unknown questionType "${q.questionType}"`);
  if (!q.prompt || typeof q.prompt !== 'string') err('missing prompt');
  if (!q.explanation || typeof q.explanation !== 'string') err('missing explanation');
  const subject = phraseById.get(q.phraseId);
  if (!subject) err(`unknown phraseId ${q.phraseId}`);
  else if (subject.cat !== q.cat) err(`subject phrase ${q.phraseId} belongs to "${subject.cat}", not "${q.cat}"`);
  if (!Array.isArray(q.options) || q.options.length < 2) err('needs at least 2 options');
  else {
    const ids = new Set();
    for (const opt of q.options) {
      if (!opt.id) err('option missing id');
      if (ids.has(opt.id)) err(`duplicate option id "${opt.id}"`);
      ids.add(opt.id);
      if (optionIsPhrase(opt)) {
        if (!phraseById.get(opt.phraseId)) err(`option ${opt.id} unknown phraseId ${opt.phraseId}`);
      } else if (!opt.text || typeof opt.text !== 'string') {
        err(`option ${opt.id} needs text or phraseId`);
      }
    }
    if (!ids.has(q.correctOptionId)) err(`correctOptionId "${q.correctOptionId}" not an option`);
    const phraseOpts = q.options.filter(optionIsPhrase).length;
    if (phraseOpts > 0 && phraseOpts !== q.options.length) err('options must be all-phrase or all-text, not mixed');
    if ((q.questionType === 'response' || q.questionType === 'safest') && phraseOpts === 0) {
      err(`${q.questionType} question needs phrase options`);
    }
    if (q.questionType === 'tone') {
      const labels = new Set(Object.values(SEVERITY_LABEL));
      for (const opt of q.options) {
        if (!labels.has(opt.text)) err(`tone option "${opt.text}" is not a severity label`);
      }
      const correct = q.options.find((o) => o.id === q.correctOptionId);
      if (subject && correct && correct.text !== SEVERITY_LABEL[subject.severity]) {
        err(`tone answer "${correct && correct.text}" does not match subject severity "${subject && subject.severity}"`);
      }
    }
    if ((q.questionType === 'response' || q.questionType === 'safest') && subject) {
      const correct = q.options.find((o) => o.id === q.correctOptionId);
      if (correct && correct.phraseId !== q.phraseId) {
        err('response/safest subject phraseId must equal the correct option phraseId');
      }
    }
  }
  if (subject && subject.severity === 'strong' && !q.warning) {
    err('strong-severity subject requires a warning field');
  }
  return errors;
}
