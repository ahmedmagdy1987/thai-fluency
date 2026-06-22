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
  // Mascot-led celebrations (Seedance 2.0, 9:16 720p, ~6s, generated from each
  // stage mascot's reference art). Posters reuse committed art so something
  // shows instantly while the clip loads.
  1: { src: '/cinematic/stages/stage-1.mp4', poster: '/characters/elephant/happy.webp' },
  2: { src: '/cinematic/stages/stage-2.mp4', poster: '/characters/monkey/happy.webp' },
  // Stages 3 & 8 are the Muay-Thai stages. Their cinematics feature the Khun Suk
  // mascot, generated from a neutral moderation-safe coach reference (the original
  // bare-chest fighting art is rejected by the generator's input filter).
  3: { src: '/cinematic/stages/stage-3.mp4', poster: '/characters/muay-thai-champion/idle.webp' },
  4: { src: '/cinematic/stages/stage-4.mp4', poster: '/characters/hippo/happy.webp' },
  5: { src: '/cinematic/stages/stage-5.mp4', poster: '/characters/monkey/happy.webp' },
  6: { src: '/cinematic/stages/stage-6.mp4', poster: '/characters/elephant/happy.webp' },
  7: { src: '/cinematic/stages/stage-7.mp4', poster: '/characters/hippo/happy.webp' },
  8: { src: '/cinematic/stages/course-complete.mp4', poster: '/characters/muay-thai-champion/celebrating.webp' },
};

export function getStageCinematic(stageId) {
  if (stageId == null) return null;
  return STAGE_CINEMATICS[stageId] || null;
}

export function hasStageCinematic(stageId) {
  return !!getStageCinematic(stageId);
}
