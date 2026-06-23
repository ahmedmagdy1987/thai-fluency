// Feature flags for staged rollouts.
//
// SERVER_REWARDS_ENABLED gates the server-authoritative reward rollout
// (Migration 006). It MUST stay `false` until:
//   1. Phase A (supabase/migrations/006a_*) is applied in production, AND
//   2. this client transition is verified against the live award_reward RPC.
//
// GATED (inert) pending the Phase-A RPC correction. The client reward paths are
// fully wired to award_reward, but activation is HELD because an adversarial review
// found that the deployed 006 RPC writes user_stats.total_xp server-side WHILE the
// client also writes total_xp (006B unapplied) AND local-only reward paths (dialogue
// / first-lesson / mini-unit) keep writing it — a dual-writer that can double-count
// or clobber un-synced rewards. The fix is migration 006c (award_reward becomes
// idempotency-only: records the event + returns the clamped amount, does NOT write
// user_stats), keeping the client as the single total_xp writer. Flip to true and
// redeploy ONLY after 006c is applied + verified. While false, behavior is identical
// to pre-activation (serverRewardsActive() is false → local path for everyone).
export const SERVER_REWARDS_ENABLED = false;
