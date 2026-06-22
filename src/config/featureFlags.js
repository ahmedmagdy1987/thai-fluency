// Feature flags for staged rollouts.
//
// SERVER_REWARDS_ENABLED gates the server-authoritative reward rollout
// (Migration 006). It MUST stay `false` until:
//   1. Phase A (supabase/migrations/006a_*) is applied in production, AND
//   2. this client transition is verified against the live award_reward RPC.
//
// While false, NOTHING changes: the app uses the existing client reward path.
// This module + src/lib/serverRewards.js are intentionally NOT imported by any
// active code yet, so they are tree-shaken out of the production bundle — the
// patch is dormant and production-safe until activation (see
// docs/migration-006-staged-rollout-runbook.md, "Client activation").
export const SERVER_REWARDS_ENABLED = false;
