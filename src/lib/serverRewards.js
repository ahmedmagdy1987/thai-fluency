// Client transition layer for server-authoritative rewards (Migration 006).
//
// DORMANT until SERVER_REWARDS_ENABLED is flipped true AND Phase A is applied.
// This module is imported by nothing active yet, so it is tree-shaken out of the
// production bundle — committing it changes no production behavior.
//
// Contract when active (signed-in users):
//   • The server (award_reward RPC) is the authority for XP. The client NEVER
//     chooses the XP amount — it passes only the event type + a stable unique
//     event key + validated payload (score/total for challenges, local_date).
//   • A 'duplicate' response is a SUCCESS with NO second reward (idempotent across
//     refresh, double-click, two tabs, two devices, offline retry).
//   • If the RPC is unavailable (Phase A not yet applied, network/permission
//     error, or signed-out/anonymous), awardReward reports `unavailable` so the
//     caller falls back to the existing local cloud path. (Anonymous users always
//     keep local behavior.) This fallback is removable in the final hardening
//     phase once Phase B is live and the RPC is proven.

import { supabase } from './supabase.js';
import { SERVER_REWARDS_ENABLED } from '../config/featureFlags.js';

// The 8 required event types.
export const REWARD_EVENTS = {
  NEW_CARD_LEARNED: 'new_card_learned',
  DUE_REVIEW_COMPLETED: 'due_review_completed',
  MISSION_COMPLETED: 'mission_completed',
  CHALLENGE_COMPLETED: 'challenge_completed',
  TONE_CHALLENGE_COMPLETED: 'tone_challenge_completed',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  STAGE_COMPLETED: 'stage_completed',
  COURSE_COMPLETED: 'course_completed',
};

// Stable, unique event-key builders. These mirror the client-side celebration /
// reward ledger ID shapes so server idempotency matches client expectations and a
// given logical reward always maps to exactly one key.
export const rewardKeys = {
  newCard:       (cardId) => `card:${cardId}:learned`,
  dueReview:     (cardId, localDate) => `review:${cardId}:${localDate}`,
  mission:       (stage, mission) => `mission:${stage}:${mission}`,
  challenge:     (stage, localDate) => `challenge:${stage}:${localDate}`,
  toneChallenge: (localDate) => `tone:${localDate}`,
  achievement:   (id) => `achv:${id}`,
  stage:         (stageId) => `stage:${stageId}`,
  course:        () => 'course:v1',
};

// Whether the server reward path should be attempted at all for this caller.
// Anonymous / signed-out / unconfigured → always false (keep local behavior).
export function serverRewardsActive(session, isEmailConfirmed, hasConfig) {
  return !!(SERVER_REWARDS_ENABLED && session && isEmailConfirmed && hasConfig);
}

// Call the award_reward RPC. Returns one of:
//   { ok: true,  status: 'awarded'|'duplicate', xpAwarded, totalXp }
//   { ok: false, unavailable: true, code? }   → caller falls back to local path
// Never throws.
export async function awardReward(eventType, eventKey, payload = {}) {
  if (!SERVER_REWARDS_ENABLED) return { ok: false, unavailable: true };
  if (!eventType || !eventKey) return { ok: false, unavailable: true };
  try {
    const { data, error } = await supabase.rpc('award_reward', {
      p_event_type: eventType,
      p_event_key: eventKey,
      p_payload: payload || {},
    });
    if (error) {
      // 42883 = undefined_function (Phase A not applied). Any error → fall back.
      return { ok: false, unavailable: true, code: error.code };
    }
    return {
      ok: true,
      status: data && data.status,
      xpAwarded: (data && data.xp_awarded) || 0,
      totalXp: data && data.total_xp,
      streak: data && data.streak,
    };
  } catch (e) {
    return { ok: false, unavailable: true };
  }
}
