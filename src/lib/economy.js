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

// ── TUNABLE ECONOMY CONFIG (single source of truth) ─────────────────────────
// Change the free-user heart cap / regen rate HERE and nowhere else (E3).
export const HEART_MAX = 5;                  // cap (free users). Super = unlimited.
export const HEART_REGEN_MIN = 30;          // minutes to regenerate ONE heart
export const HEART_REGEN_MS = HEART_REGEN_MIN * 60 * 1000;
export const REFILL_COST_GEMS = 50;         // gems for a full heart refill
export const FREEZE_COST_GEMS = 30;         // gems for one streak freeze
// ────────────────────────────────────────────────────────────────────────────

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
//
// Clock-manipulation note (E3): a NEGATIVE elapsed (device clock moved BACKWARD,
// or a future/corrupt stamp) yields 0 — the stored count stands, so winding the
// clock back can never mint hearts. Winding the clock FORWARD to regen faster
// cannot be fully prevented client-side; that needs a server-trusted timestamp
// (the known M1 limitation), deliberately NOT added in this pass. Regen is still
// capped at HEART_MAX per read, so the worst case is "full hearts", never more.
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

// Grant ONE heart — the reward for a completed rewarded ad. Pure: returns a
// stats PATCH, or null when already full. Folds in pending regen first, then +1
// (capped at HEART_MAX), and stamps heartsUpdatedAt so the regen clock restarts.
// NOTE: no ad SDK is integrated (owner decision); a real rewarded-ad network must
// call this ONLY on a verified ad completion. Super users are unlimited already,
// so the caller no-ops this for them.
export function grantHeart(stats, now = Date.now()) {
  const current = effectiveHearts(stats, false, now);
  if (current >= HEART_MAX) return null;      // already full — nothing to grant
  return {
    hearts: Math.min(HEART_MAX, current + 1),
    heartsUpdatedAt: new Date(now).toISOString(),
  };
}

// ── The banked-freeze ceiling (Wave 12) ─────────────────────────────────────
// WHY A CAP EXISTS AT ALL: the freeze is the app's loss-aversion mechanic AND,
// per engagement.md §5.3, "the honest bridge between the free economy and Super".
// Both roles die at scale. The owner reached 31 banked freezes in one sitting
// (31 unconfirmed clicks, 930 gems) — at that point the streak can never break,
// so there is no loss to be averse to, and Super's planned perk (a MONTHLY
// streak-freeze, engagement.md:184 / monetization.md §3.1) is worth nothing to
// someone holding a decade of protection.
//
// WHY 5:
//   • The design's own ceiling for banked freezes is 2 — the free weekly
//     auto-grant stops there (monetization.md:101, "free floor — do not remove").
//     A purchase ceiling must sit ABOVE that or the gem sink is pointless, and
//     monetization.md:102 says the sink "must remain".
//   • 5 is 2.5x the free floor: buying is meaningfully better than waiting, which
//     is what makes it a real conversion surface rather than a formality.
//   • A freeze covers a gap of <= 2 days (stats.js computeStreak), so 5 banked is
//     a holiday's worth of protection — generous, but not immunity.
//   • It matches HEART_MAX, the app's existing small-ceiling idiom.
//
// The free auto-grant's own ceiling (2) is deliberately UNCHANGED here — raising
// it would hand free users more protection and shrink the very sink this cap is
// protecting. See App.jsx's grant effect.
export const MAX_BANKED_FREEZES = 5;

// Buy ONE streak freeze with gems. Pure: returns a stats PATCH, or null when the
// user can't afford it OR is already at the banked ceiling. This is the SECOND
// gem sink (besides heart refills) — it is what keeps gems from being a circular
// currency that only ever buys hearts (E4): a Super user with unlimited hearts
// still has a real use for earned gems.
//
// THE CAP IS ENFORCED HERE, in the purchase path — not in the Shop's disabled
// attribute. A UI-only cap is not a cap: every other entry point (the streak
// recovery card, a future surface, a replayed click) would bypass it.
export function buyStreakFreezeWithGems(stats) {
  const gems = rawGems(stats);
  const freezes = bankedFreezes(stats);
  if (freezes >= MAX_BANKED_FREEZES) return null; // already fully stocked
  if (gems < FREEZE_COST_GEMS) return null;       // can't afford
  return {
    gems: gems - FREEZE_COST_GEMS,
    streakFreezes: freezes + 1,
  };
}

// Null-safe reader for the banked-freeze count.
export function bankedFreezes(stats) {
  return Number.isFinite(stats?.streakFreezes) ? Math.max(0, stats.streakFreezes) : 0;
}

// Can the user buy a freeze right now, and if not, WHY. The Shop renders the
// reason verbatim so the button is never a silent no-op.
export function freezePurchaseState(stats) {
  const gems = rawGems(stats);
  const freezes = bankedFreezes(stats);
  if (freezes >= MAX_BANKED_FREEZES) {
    return { canBuy: false, atCap: true, reason: `You're fully stocked — ${MAX_BANKED_FREEZES} freezes is the maximum you can bank. Use one and you can buy another.` };
  }
  if (gems < FREEZE_COST_GEMS) {
    return { canBuy: false, atCap: false, reason: `You need ${FREEZE_COST_GEMS} gems. You have ${gems}.` };
  }
  return { canBuy: true, atCap: false, reason: `Spend ${FREEZE_COST_GEMS} gems to bank a streak freeze — it saves your streak on a missed day.` };
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
