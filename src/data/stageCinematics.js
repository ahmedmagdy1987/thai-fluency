// Stage-completion cinematics. One short (~6s) vertical 9:16 clip per stage;
// Stage 8 is the larger course-completion cinematic. Files live under
// /public/cinematic/stages/. Each entry is { src, poster }.
//
// IMPORTANT: this map returns null for any stage without a shipped clip, so the
// completion flow no-ops gracefully (the existing static celebration shows
// instead). The cinematic is purely a visual moment — it NEVER grants XP or any
// reward, and watched-state is persisted separately (stats.cinematicsWatched)
// so it plays at most once per stage.
//
// The clips are added in the asset pass; until then every lookup returns null.
const STAGE_CINEMATICS = {
  // Filled in the asset pass, e.g.:
  // 1: { src: '/cinematic/stages/stage-1.mp4', poster: '/cinematic/stages/stage-1.webp' },
  // ...
  // 8: { src: '/cinematic/stages/course-complete.mp4', poster: '/cinematic/stages/course-complete.webp' },
};

export function getStageCinematic(stageId) {
  if (stageId == null) return null;
  return STAGE_CINEMATICS[stageId] || null;
}

export function hasStageCinematic(stageId) {
  return !!getStageCinematic(stageId);
}
