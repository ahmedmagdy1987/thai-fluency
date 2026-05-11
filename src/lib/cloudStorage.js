// Cloud sync helpers for the Supabase backend. All functions assume the
// caller has already verified that hasSupabaseConfig is true and a session
// exists. Errors propagate to the caller — App.jsx logs and continues so
// cloud failures don't break the app.

import { supabase } from './supabase.js';

// ---- Progress (SRS state per card) ----

export async function uploadProgress(userId, progress) {
  const ids = Object.keys(progress);
  if (ids.length === 0) return { count: 0 };
  const rows = ids.map(cardId => {
    const s = progress[cardId];
    return {
      user_id: userId,
      card_id: parseInt(cardId, 10),
      ease: s.ease ?? 2.5,
      interval: s.interval ?? 0,
      reps: s.reviews ?? 0,
      lapses: s.lapses ?? 0,
      learning: !!s.learning,
      next_review: new Date(s.nextDue).toISOString(),
      last_review: s.lastReview ? new Date(s.lastReview).toISOString() : null,
    };
  });
  // Chunk to keep payloads reasonable.
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    const { error } = await supabase
      .from('user_progress')
      .upsert(chunk, { onConflict: 'user_id,card_id' });
    if (error) throw error;
  }
  return { count: rows.length };
}

export async function downloadProgress(userId) {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  const progress = {};
  for (const row of data || []) {
    progress[row.card_id] = {
      ease: row.ease,
      interval: row.interval,
      reviews: row.reps,
      lapses: row.lapses,
      learning: row.learning,
      nextDue: new Date(row.next_review).getTime(),
      lastReview: row.last_review ? new Date(row.last_review).getTime() : Date.now(),
    };
  }
  return progress;
}

// ---- Stats (aggregate gamification state) ----

export async function uploadStats(userId, stats) {
  const row = {
    user_id: userId,
    total_xp: stats.totalXp || 0,
    current_streak: stats.streak || 0,
    longest_streak: Math.max(stats.streak || 0, stats.longestStreak || 0),
    last_active_date: stats.lastStudy
      ? new Date(stats.lastStudy).toISOString().split('T')[0]
      : null,
    current_stage: stats.currentStage || 1,
    started_stage: stats.startedStage || 1,
    total_reviews: stats.totalReviews || 0,
    daily_goal: stats.dailyGoal || 50,
    daily_goals_hit: stats.dailyGoalsHit || 0,
    tones_quiz_passed: !!stats.tonesQuizPassed,
    tones_quiz_best: stats.tonesQuizBest || 0,
    quizzes_passed: stats.quizzesPassed || 0,
    perfect_quizzes: stats.perfectQuizzes || 0,
    streak_freezes: stats.streakFreezes || 0,
    last_freeze_grant: stats.lastFreezeGrant || null,
    last_seen_mission: stats.lastSeenMission || 1,
    stage1_celebration_shown: !!stats.stage1CelebrationShown,
    dialogues_completed: stats.dialoguesCompleted || [],
    known_card_ids: stats.knownCardIds || [],
  };
  // cards_seen / cards_mastered are denormalized aggregates — let the DB
  // hold them at their defaults; we can compute fresh values from
  // user_progress when needed.
  const { error } = await supabase
    .from('user_stats')
    .upsert(row, { onConflict: 'user_id' });
  if (error) throw error;
}

export async function downloadStats(userId) {
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    totalXp: data.total_xp || 0,
    streak: data.current_streak || 0,
    longestStreak: data.longest_streak || 0,
    lastStudy: data.last_active_date || null,
    currentStage: data.current_stage || 1,
    startedStage: data.started_stage || 1,
    totalReviews: data.total_reviews || 0,
    dailyGoal: data.daily_goal || 50,
    dailyGoalsHit: data.daily_goals_hit || 0,
    tonesQuizPassed: !!data.tones_quiz_passed,
    tonesQuizBest: data.tones_quiz_best || 0,
    quizzesPassed: data.quizzes_passed || 0,
    perfectQuizzes: data.perfect_quizzes || 0,
    streakFreezes: data.streak_freezes ?? 1,
    lastFreezeGrant: data.last_freeze_grant || null,
    lastSeenMission: data.last_seen_mission || 1,
    stage1CelebrationShown: !!data.stage1_celebration_shown,
    dialoguesCompleted: data.dialogues_completed || [],
    knownCardIds: data.known_card_ids || [],
  };
}

// ---- Achievements ----

export async function uploadAchievements(userId, achievementIds) {
  if (!achievementIds || achievementIds.length === 0) return;
  const rows = achievementIds.map(id => ({ user_id: userId, achievement_id: id }));
  const { error } = await supabase
    .from('user_achievements')
    .upsert(rows, { onConflict: 'user_id,achievement_id' });
  if (error) throw error;
}

export async function downloadAchievements(userId) {
  const { data, error } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []).map(r => r.achievement_id);
}

// ---- Profile (preferences that aren't gamification state) ----

export async function updateProfile(userId, fields) {
  const { error } = await supabase
    .from('profiles')
    .update(fields)
    .eq('id', userId);
  if (error) throw error;
}

// ---- Snapshot: pull everything for a freshly-signed-in user ----

export async function downloadFullState(userId) {
  const [progress, stats, achievementIds] = await Promise.all([
    downloadProgress(userId),
    downloadStats(userId),
    downloadAchievements(userId),
  ]);
  return { progress, stats, achievementIds };
}

// ---- Bulk upload: full state in one go (used for migration) ----

export async function uploadFullState(userId, progress, stats) {
  // Order matters: stats row first (one row), then progress rows, then
  // achievements. If any step throws, partial state is acceptable — next
  // periodic sync will retry.
  await uploadStats(userId, stats);
  if (progress && Object.keys(progress).length > 0) {
    await uploadProgress(userId, progress);
  }
  if (stats.unlockedAchievements && stats.unlockedAchievements.length > 0) {
    await uploadAchievements(userId, stats.unlockedAchievements);
  }
}
