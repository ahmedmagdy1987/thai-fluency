// Pure helpers for the mini-unit Sentence Builder. No React / DOM — just token
// arrangement + correctness checking so the logic can be unit-checked (see
// scripts/check-sentence-builder.mjs). The component stays a thin UI layer.

// True when the arranged token ids exactly match the answer order.
export function isBuilderCorrect(arrangedIds, answerIds) {
  if (!Array.isArray(arrangedIds) || !Array.isArray(answerIds)) return false;
  if (arrangedIds.length !== answerIds.length) return false;
  return arrangedIds.every((id, i) => id === answerIds[i]);
}

// A shuffled copy of the tokens for the tile bank. `rand` defaults to
// Math.random but can be injected for deterministic tests. Guarantees the
// shuffle differs from the solved order when there is more than one token
// (so a freshly-opened builder isn't already solved).
export function shuffleTokens(tokens, rand = Math.random) {
  const list = Array.isArray(tokens) ? [...tokens] : [];
  if (list.length < 2) return list;
  const answerOrder = list.map(t => t.id).join('|');
  for (let attempt = 0; attempt < 6; attempt++) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    if (list.map(t => t.id).join('|') !== answerOrder) break;
  }
  return list;
}

// The Thai sentence assembled from the arranged tokens, skipping the name-slot
// placeholder so it can be spoken cleanly by TTS (the blank has no Thai).
export function assembledThai(tokens, arrangedIds) {
  const byId = new Map((Array.isArray(tokens) ? tokens : []).map(t => [t.id, t]));
  return (Array.isArray(arrangedIds) ? arrangedIds : [])
    .map(id => byId.get(id))
    .filter(t => t && !t.isBlank && t.thai)
    .map(t => t.thai)
    .join('');
}

// Validate a sentenceBuilder data object — used by the QA script to confirm the
// pilot data is internally consistent (answer is a permutation of token ids).
export function validateSentenceBuilder(data) {
  if (!data || !Array.isArray(data.tokens) || !Array.isArray(data.answer)) return false;
  const ids = data.tokens.map(t => t && t.id).filter(Boolean);
  if (ids.length !== data.tokens.length) return false;            // every token has an id
  if (new Set(ids).size !== ids.length) return false;             // ids are unique
  if (data.answer.length !== ids.length) return false;            // answer covers all tokens
  const idSet = new Set(ids);
  return data.answer.every(id => idSet.has(id)) && new Set(data.answer).size === data.answer.length;
}
