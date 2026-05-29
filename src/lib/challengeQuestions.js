// Pure question-generation logic for the stage-scoped Challenge.
//
// Extracted from QuizTab so the scoping rules can be unit-checked without the
// React/browser layer (see scripts/check-challenge-scope.mjs). No gameplay or
// SRS rules live here — this only SELECTS which cards become questions.
//
// Scoping guarantees (verified by the check script):
//   1. A Stage N Challenge only uses cards whose stage === N.
//   2. Distractors are drawn from the SAME pool as the correct answer, so they
//      inherit the stage + learned constraint and never leak from another
//      stage or an unlearned card.
//   3. Completed stages may use the whole stage (mastery review). In-progress
//      or not-yet-started stages use ONLY cards the user has already SEEN in
//      Learn (progress[id] exists) — never random unseen future cards.

import { CARDS } from '../data/cards.js';
import { displayCard, DEFAULT_VOICE } from './voice.js';

export const QUESTION_COUNT = 12;
export const MIN_DISTRACTORS = 2;
export const MAX_DISTRACTORS = 3;
// A buildable question needs a correct answer + at least MIN_DISTRACTORS other
// distinct cards. The UI uses this to decide whether a stage is challengeable
// yet (vs. showing a "learn more first" empty state).
export const MIN_CHALLENGE_POOL = MIN_DISTRACTORS + 1;

export const EXCLUDED_CHALLENGE_CARD_IDS = new Set([
  // Client-reported bad Challenge item: คา / "to obstruct; to be stuck".
  // It produced a low-quality generic verb question; keep it out of Challenge
  // until the content can be reviewed without changing the card data.
  2250,
]);

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function normalizeAnswer(text, type) {
  const base = String(text || '').trim().toLowerCase();
  if (type === 'en-to-thai') {
    return base.replace(/\s+/g, '');
  }
  return base
    .replace(/\([^)]*\)/g, '')
    .replace(/\b(male|female|formal|casual)\b/g, '')
    .replace(/[^a-z0-9฀-๿]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function answerMeaningParts(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .split(/[;\/,|]+|\bor\b/gi)
    .map(part => part
      .replace(/[^a-z0-9฀-๿]+/gi, ' ')
      .replace(/\b(to|a|an|the|be|is|are|am|for|of|and|or|it|this|that|thing|male|female|formal|casual)\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim())
    .filter(Boolean);
}

function answerTokens(text) {
  return new Set(answerMeaningParts(text).join(' ').split(/\s+/).filter(Boolean));
}

function tokenOverlapRatio(a, b) {
  if (a.size === 0 || b.size === 0) return 0;
  let overlap = 0;
  a.forEach(token => { if (b.has(token)) overlap += 1; });
  return overlap / Math.min(a.size, b.size);
}

function sharesMeaningPart(a, b) {
  const aParts = answerMeaningParts(a);
  const bParts = answerMeaningParts(b);
  return aParts.some(aPart => bParts.some(bPart => {
    if (aPart === bPart) return true;
    if (aPart.length < 4 || bPart.length < 4) return false;
    return aPart.includes(bPart) || bPart.includes(aPart);
  }));
}

function answersTooSimilar(a, b, type) {
  const aNorm = normalizeAnswer(a, type);
  const bNorm = normalizeAnswer(b, type);
  if (!aNorm || !bNorm) return true;
  if (aNorm === bNorm) return true;
  if (type === 'en-to-thai') {
    if (aNorm.length >= 4 && bNorm.length >= 4 && (aNorm.includes(bNorm) || bNorm.includes(aNorm))) return true;
    return false;
  }
  if (sharesMeaningPart(a, b)) return true;
  return tokenOverlapRatio(answerTokens(a), answerTokens(b)) >= 0.75;
}

function choicesTooSimilar(candidate, existing, type, voice) {
  if (answersTooSimilar(getAnswerText(candidate, type, voice), getAnswerText(existing, type, voice), type)) {
    return true;
  }
  if (type === 'en-to-thai') {
    return answersTooSimilar(getDisplayed(candidate, voice)?.en, getDisplayed(existing, voice)?.en, 'thai-to-en');
  }
  return false;
}

export function getDisplayed(card, voice) {
  return displayCard(card, voice) || card;
}

export function getPromptText(card, type, voice) {
  const c = getDisplayed(card, voice);
  return type === 'thai-to-en' ? c.thai : c.en;
}

export function getAnswerText(card, type, voice) {
  const c = getDisplayed(card, voice);
  return type === 'thai-to-en' ? c.en : c.thai;
}

function isEligible(card, type, voice) {
  return !!(
    card &&
    !EXCLUDED_CHALLENGE_CARD_IDS.has(card.id) &&
    card.thai &&
    card.en &&
    getPromptText(card, type, voice) &&
    getAnswerText(card, type, voice)
  );
}

// The allowed card set for a Stage N Challenge under the learned/unlocked rule.
// Completed stage → whole stage; otherwise → only already-seen cards.
function allowedStageCards(cards, stageId, voice, progress, stageComplete, type) {
  const stage = stageId || 1;
  const safeProgress = progress && typeof progress === 'object' ? progress : {};
  return cards
    .filter(card => (card.stage || 1) === stage)
    .filter(card => stageComplete || safeProgress[card.id])
    .filter(card => isEligible(card, type, voice));
}

function collectDistractors(correct, pool, type, voice) {
  const correctNorm = normalizeAnswer(getAnswerText(correct, type, voice), type);
  const seenIds = new Set([correct.id]);
  const seenAnswers = new Set([correctNorm]);
  const selectedCards = [correct];
  const picked = [];

  // Every tier is applied WITHIN `pool`, which is already scoped to the
  // selected stage + learned set — so even the catch-all `() => true` tier can
  // only pick same-stage, learned cards. Distractors never leak across stages.
  const tiers = [
    card => (card.stage || 1) === (correct.stage || 1) && card.cat === correct.cat,
    card => card.cat === correct.cat,
    card => (card.stage || 1) === (correct.stage || 1),
    () => true,
  ];

  tiers.forEach(matchesTier => {
    if (picked.length >= MAX_DISTRACTORS) return;
    const candidates = shuffle(pool).filter(card => {
      if (picked.length >= MAX_DISTRACTORS) return false;
      if (seenIds.has(card.id) || !matchesTier(card)) return false;
      const answer = getAnswerText(card, type, voice);
      const norm = normalizeAnswer(answer, type);
      if (!norm || seenAnswers.has(norm)) return false;
      if (selectedCards.some(existing => choicesTooSimilar(card, existing, type, voice))) return false;
      return true;
    });

    candidates.forEach(card => {
      if (picked.length >= MAX_DISTRACTORS) return;
      const norm = normalizeAnswer(getAnswerText(card, type, voice), type);
      seenIds.add(card.id);
      seenAnswers.add(norm);
      selectedCards.push(card);
      picked.push(card);
    });
  });

  return picked;
}

// How many cards are eligible to appear in a Stage N Challenge given the
// learned/unlocked rule. Direction-agnostic (a normal card has both thai+en,
// so it is usable in both directions); we count via the canonical lens.
export function countChallengePool({ stageId, voice = DEFAULT_VOICE, progress, stageComplete, cards = CARDS } = {}) {
  return allowedStageCards(cards, stageId, voice, progress, stageComplete, 'thai-to-en').length;
}

// Build a stage-scoped, learned-filtered challenge round. Returns up to
// QUESTION_COUNT questions; fewer (or zero) when the learned same-stage pool is
// small — callers handle the empty/needs-more-learning state. NEVER pads from
// another stage.
export function buildChallenge({ type, stageId, voice, progress, stageComplete, cards = CARDS } = {}) {
  const pool = allowedStageCards(cards, stageId, voice, progress, stageComplete, type);

  const candidates = shuffle(pool);
  const questions = [];
  const usedCorrectAnswers = new Set();

  candidates.forEach(correct => {
    if (questions.length >= QUESTION_COUNT) return;
    const correctNorm = normalizeAnswer(getAnswerText(correct, type, voice), type);
    if (!correctNorm || usedCorrectAnswers.has(correctNorm)) return;

    const distractors = collectDistractors(correct, pool, type, voice);
    if (distractors.length < MIN_DISTRACTORS) return;

    usedCorrectAnswers.add(correctNorm);
    questions.push({
      id: `${type}-${correct.id}-${questions.length}`,
      type,
      correct,
      options: shuffle([correct, ...distractors]),
    });
  });

  return { poolSize: pool.length, questions };
}
