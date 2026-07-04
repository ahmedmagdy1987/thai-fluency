// ─────────────────────────────────────────────────────────────────────────────
// HEARTS + GEMS ECONOMY — pure, null-safe helpers. No React, no I/O.
//
// MODEL (see docs/app-shell-rewards-roadmap.md + migration 009):
//   • HEARTS are gentle "lives" used ONLY in the Challenge (QuizTab). They are
//     NEVER touched by flashcard review (CardsTab) or the guided learning path.
//     Max 5. Lose 1 per WRONG Challenge answer. Regenerate +1 every 30 minutes,
//     computed from stats.hearts_updated_at (server column, mapped to
//     stats.heartsUpdatedAt on the client). Super users have UNLIMITED hearts —
//     effectiveHearts() returns Infinity, spendHeart() is a no-op for them, and
//     they are never blocked from starting a Challenge.
//   • GEMS are earned currency (missions / challenge pass / daily goal) and are
//     spent in the Shop to refill hearts (REFILL_COST_GEMS = full hearts). The
//     free learning path is never gated by gems.
//
// Every function tolerates a null/partial stats object: hearts defaults to
// HEART_MAX (a fresh account starts full) and gems to 0. Timestamps are read
// from heartsUpdatedAt (client) and fall back gracefully when absent.
// ─────────────────────────────────────────────────────────────────────────────

export const HEART_MAX = 5;
export const HEART_REGEN_MIN = 30;          // minutes to regenerate one heart
export const HEART_REGEN_MS = HEART_REGEN_MIN * 60 * 1000;
export const REFILL_COST_GEMS = 50;         // gems for a full heart refill

// Reward amounts — kept modest. Referenced from App.jsx at the same moments XP
// is granted so gems and XP stay in lockstep.
export const GEMS_PER_MISSION = 5;
export const GEMS_PER_CHALLENGE_PASS = 3;
export const GEMS_PER_DAILY_GOAL = 5;

// Null-safe readers. A brand-new account (no hearts key yet) reads as full.
function rawHearts(stats) {
  const h = stats?.hearts;
  return Number.isFinite(h) ? Math.max(0, Math.min(HEART_MAX, h)) : HEART_MAX;
}

function rawGems(stats) {
  const g = stats?.gems;
  return Number.isFinite(g) ? Math.max(0, g) : 0;
}

// Parse the heart timestamp (heartsUpdatedAt on the client, mapped from the
// hearts_updated_at column). Returns a ms epoch, or null when unset/invalid.
function heartsUpdatedMs(stats) {
  const v = stats?.heartsUpdatedAt;
  if (!v) return null;
  const t = typeof v === 'number' ? v : new Date(v).getTime();
  return Number.isFinite(t) ? t : null;
}

// How many hearts have regenerated since the last stored update, given the
// stored count and timestamp. Never exceeds HEART_MAX. When already at/above
// max, or when there is no timestamp to measure from, nothing regenerates.
function regenCount(storedHearts, updatedMs, now) {
  if (storedHearts >= HEART_MAX) return 0;
  if (!updatedMs) return 0;
  const elapsed = now - updatedMs;
  if (elapsed <= 0) return 0;
  return Math.floor(elapsed / HEART_REGEN_MS);
}

// Effective (regenerated) heart count RIGHT NOW.
//   • Super → Infinity (unlimited; never decremented, never blocked).
//   • Otherwise stored hearts + regenerated-since-timestamp, capped at HEART_MAX.
export function effectiveHearts(stats, isSuperFlag, now = Date.now()) {
  if (isSuperFlag) return Infinity;
  const stored = rawHearts(stats);
  const regened = regenCount(stored, heartsUpdatedMs(stats), now);
  return Math.min(HEART_MAX, stored + regened);
}

// Countdown state for the "out of hearts" gate.
//   • hearts: the effective (regenerated) count now (free users only; Super is
//     handled by the caller which shows ∞ instead of calling this).
//   • nextRegenMs: milliseconds until the NEXT heart regenerates, or 0 when
//     hearts are already full (nothing pending).
export function regenState(stats, now = Date.now()) {
  const stored = rawHearts(stats);
  const updatedMs = heartsUpdatedMs(stats);
  const regened = regenCount(stored, updatedMs, now);
  const hearts = Math.min(HEART_MAX, stored + regened);
  if (hearts >= HEART_MAX) return { hearts, nextRegenMs: 0 };
  // Anchor the countdown to the effective timeline: each regenerated heart
  // advances the anchor by one full interval, so the remaining time is measured
  // from the most recent (virtual) regeneration, not the stale stored stamp.
  if (!updatedMs) {
    // No timestamp yet → a full interval from now (regen clock effectively
    // starts on the next spend, which will stamp heartsUpdatedAt).
    return { hearts, nextRegenMs: HEART_REGEN_MS };
  }
  const anchor = updatedMs + regened * HEART_REGEN_MS;
  const nextRegenMs = Math.max(0, anchor + HEART_REGEN_MS - now);
  return { hearts, nextRegenMs };
}

// Spend one heart (a WRONG Challenge answer). Pure: returns a stats PATCH the
// caller merges via setStats. Folds in any pending regeneration first so the
// stored value is accurate, then decrements by one (never below 0). Stamps
// heartsUpdatedAt to now so the regen clock restarts from this spend.
//
// NOTE: callers must NOT invoke this for Super users — effectiveHearts is
// Infinity for them and QuizTab guards the call. As a safety net this still
// floors at 0, but the contract is "free users only".
export function spendHeart(stats, now = Date.now()) {
  const stored = rawHearts(stats);
  const regened = regenCount(stored, heartsUpdatedMs(stats), now);
  const current = Math.min(HEART_MAX, stored + regened);
  const nextHearts = Math.max(0, current - 1);
  return {
    hearts: nextHearts,
    gems: rawGems(stats),
    heartsUpdatedAt: new Date(now).toISOString(),
  };
}

// Refill hearts to full by spending REFILL_COST_GEMS. Pure: returns a stats
// PATCH. When the user can't afford it or is already full, returns null so the
// caller can no-op (the Shop also disables the button in those cases).
export function refillHeartsWithGems(stats, now = Date.now()) {
  const gems = rawGems(stats);
  const current = effectiveHearts(stats, false, now);
  if (current >= HEART_MAX) return null;      // already full — nothing to buy
  if (gems < REFILL_COST_GEMS) return null;   // can't afford
  return {
    hearts: HEART_MAX,
    gems: gems - REFILL_COST_GEMS,
    heartsUpdatedAt: new Date(now).toISOString(),
  };
}

// Award gems. Pure: returns a stats PATCH ({ gems }). Non-positive amounts are
// ignored (returns the current balance) so a bad call can never subtract.
export function awardGems(stats, n) {
  const gems = rawGems(stats);
  const amount = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  return { gems: gems + amount };
}

// Format a millisecond duration as a short "Mm Ss" / "Ss" countdown for the
// hearts gate. Purely presentational; kept here so the gate and Shop agree.
export function formatCountdown(ms) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m <= 0) return `${s}s`;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}
