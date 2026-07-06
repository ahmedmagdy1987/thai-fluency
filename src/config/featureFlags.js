// Feature flags for staged rollouts.
//
// SERVER_REWARDS_ENABLED gates the server-authoritative reward rollout
// (Migration 006). It MUST stay `false` until:
//   1. Phase A (supabase/migrations/006a_*) is applied in production, AND
//   2. this client transition is verified against the live award_reward RPC.
//
// ACTIVE since 2026-07-06. Both prerequisites are met and were verified against
// live production (project fkebzcywofzloaqeghtn):
//   • 006c is deployed: award_reward is idempotency-only (source matches the 006c
//     migration byte-for-byte; behaviorally confirmed it does NOT write
//     user_stats.total_xp) — the client remains the single total_xp writer, so
//     the dual-writer hazard that previously held this flag is gone.
//   • Live checks passed: anon EXECUTE revoked; valid event awards once;
//     duplicate key is a no-op (single reward_events row); unknown event type
//     rejected (P0001); client-supplied score/xp clamped server-side; the 010
//     guard trigger clamps forged total_xp / streak / hearts / gems writes.
// Signed-in confirmed users now take the server award_reward path; anonymous
// users keep the local path. The local fallback in awardXp remains ONLY for
// genuine RPC unavailability (function missing / network) — duplicate, rejected,
// auth and permission errors never fall back.
export const SERVER_REWARDS_ENABLED = true;
