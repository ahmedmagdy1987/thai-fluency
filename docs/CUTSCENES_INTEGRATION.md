# Cutscenes Integration Plan (Owner Feedback Item G)

Short (~6-second) video clips between missions and stages — review of the
current state, and a practical, step-by-step plan to integrate them safely on
web and mobile (Capacitor).

---

## 1. Current state (as of this review)

**There are no cutscene video clips anywhere in the learning flow today.** A
repo-wide audit found:

- **No video files** outside the marketing landing page. The only `.mp4`/video
  assets live in `public/cinematic/` and are used exclusively by the public
  landing page (`LandingPage` / `.cine-media`), never by the app's learning
  loop.
- **Between-mission / between-stage moments are handled by static UI + audio**,
  not video:
  - `src/components/MissionCompleteRewardScreen.jsx` — the per-mission reward
    modal (static icon, XP count-up, confetti, WebAudio chime).
  - `src/components/CelebrationOverlay.jsx` — the shared "big" celebration
    overlay (stage complete, all daily quests, perfect Stage Challenge).
  - `src/components/Stage1CompleteCelebration.jsx` — the one-time Stage 1 →
    Stage 2 unlock modal.
  - `src/components/MiniUnitFlow.jsx` — the `'complete'` step (Sparkles icon +
    confetti + chime).
- Celebration animation is driven by `ConfettiBurst` + `lib/sounds.js`, and
  every celebration component already respects `prefers-reduced-motion` via a
  local `prefersReducedMotion()` helper.

So this is a **greenfield integration**, not an existing feature to tune. The
goal of this work item is to land safe, dormant infrastructure plus a clear
plan, **without changing live behavior**.

### What was delivered in this work item

- **`src/components/CutscenePlayer.jsx`** — a production-ready, mobile-safe,
  dependency-free React component that wraps a native `<video>` for short
  clips. It is **not yet wired into the flow** (dormant infrastructure).
- An appended `.cutscene-*` CSS block at the end of `src/styles/app.css`.
- This document.

`CutscenePlayer` is intentionally left unimported so it tree-shakes out of the
build until clips and wiring exist. Nothing about the current learning flow
changes.

---

## 2. Where the ~6-second clips should play (the seams)

All celebration components are rendered conditionally near the bottom of
`src/App.jsx` (around lines 1778–1795). The three natural insertion seams,
from highest value to lowest:

| Seam | Trigger (App.jsx) | Rendered component | Best for |
| --- | --- | --- | --- |
| **Between stages** (prime) | `showStage1Celebration` (set near line 877); generic `celebration` state set around lines 1037 / 1471 / 1493 / 1514 | `Stage1CompleteCelebration` / `CelebrationOverlay` | A real ~6s cutscene — stage transitions are rare and momentous, so a clip feels earned, not repetitive. |
| **Between missions** | `rewardScreen` state set around lines 844 / 1188 / 1290 | `MissionCompleteRewardScreen` | A shorter sting (2–3s) or character bumper. Missions complete often, so keep it brief and skippable. |
| **Mini-unit complete** | `MiniUnitFlow` `step === 'complete'` | inline `.miniunit-complete` section | Optional / lowest priority — happens frequently. |

The recommended rollout order is: **stage seam first** (lowest frequency,
highest impact), then optionally the mission seam.

### The `cutscene` config field (`src/data/stageCharacters.js`)

`stageCharacters.js` already uses a graceful-fallback pattern
(`getStageCharacter`, `resolveCoachIdForStage`). Add an **optional** per-stage
`cutscene` descriptor the same way — absent fields simply mean "no clip, fall
through to the static celebration":

```js
// In src/data/stageCharacters.js — add to a stage's config (optional).
// Keep src/poster paths under /public/cutscenes/ (see §3). Both optional;
// if `src` is missing, CutscenePlayer renders nothing and the caller falls
// through to its existing static celebration.
export const STAGE_CUTSCENES = {
  1: { src: '/cutscenes/stage-1-complete.mp4', poster: '/cutscenes/stage-1-complete.jpg' },
  // 2..8 omitted until clips exist → no cutscene, static celebration only.
};

// Safe lookup (mirrors getStageCharacter's never-crash contract):
export function getStageCutscene(stageId) {
  const c = stageId ? STAGE_CUTSCENES[stageId] : null;
  return c && c.src ? c : null; // null → caller skips the player entirely
}
```

This keeps content (which stage has a clip) out of `App.jsx` and in the data
layer, consistent with how characters are configured.

---

## 3. Encoding & packaging the clips (`public/cutscenes/`)

Place clips and posters in a **new** `public/cutscenes/` folder. Static assets
under `public/` are copied verbatim to the build root and served from `/`.

### Encoding recipe (web-optimized H.264 mp4 + poster)

Target: ~6 seconds, small, universally decodable (iOS Safari, Android Chrome,
Capacitor WebViews all support H.264/AAC in MP4).

```bash
# H.264 (baseline-friendly), faststart so playback can begin before full
# download, no audio track needed (clips autoplay muted — see §4).
ffmpeg -i source.mov \
  -t 6 \
  -vf "scale='min(1080,iw)':-2" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -crf 24 -preset slow \
  -movflags +faststart \
  -an \
  public/cutscenes/stage-1-complete.mp4

# Poster frame (shown instantly while the video buffers / if autoplay is blocked)
ffmpeg -i public/cutscenes/stage-1-complete.mp4 -frames:v 1 -q:v 3 \
  public/cutscenes/stage-1-complete.jpg
```

Guidelines:
- **Keep each clip well under ~1.5 MB.** At 6s / 1080p / CRF 24 this is easily
  achievable. Smaller is better on mobile data.
- **Drop the audio track** (`-an`). Clips autoplay **muted** on mobile (§4), so
  audio would be silent anyway; the existing WebAudio celebration chime
  (`playCelebration()`) still fires from the caller.
- **Always ship a poster `.jpg`.** It is the first paint and the graceful
  visual if autoplay is blocked.
- Filenames should be stable and content-addressed by stage, e.g.
  `stage-<n>-complete.mp4` / `.jpg`.

### Keep clips OUT of the PWA precache, and lazy-load them

`vite.config.js` uses `vite-plugin-pwa` with `registerType: 'autoUpdate'`.
Workbox's default `globPatterns` precache **must not** swallow these video
files — precaching multi-hundred-KB clips would bloat the install and the
service-worker update payload. Two safeguards:

1. **Exclude videos from precache** in `vite.config.js` (add a `workbox`
   block; this is the only config change cutscenes require):

   ```js
   VitePWA({
     registerType: 'autoUpdate',
     // ...existing manifest...
     workbox: {
       // Do not precache cutscene clips/posters — they are lazy, on-demand,
       // and would bloat the SW install. Runtime-cache them instead.
       globIgnores: ['**/cutscenes/**'],
       runtimeCaching: [
         {
           urlPattern: ({ url }) => url.pathname.startsWith('/cutscenes/'),
           handler: 'CacheFirst',
           options: {
             cacheName: 'cutscenes',
             expiration: { maxEntries: 16, maxAgeSeconds: 60 * 60 * 24 * 30 },
             cacheableResponse: { statuses: [0, 200] },
           },
         },
       ],
     },
   })
   ```

2. **Lazy-load `CutscenePlayer`** at the wiring site so the (tiny) component and
   any future logic only load when a celebration is imminent:

   ```js
   const CutscenePlayer = React.lazy(() => import('./components/CutscenePlayer.jsx'));
   // ...render inside <React.Suspense fallback={null}>...
   ```

   The `<video src>` itself is already lazy — the browser only fetches bytes
   when the element mounts (and `preload="auto"` only kicks in then).

---

## 4. Mobile / Capacitor autoplay caveats

Capacitor native folders (`android/`, `ios/`) exist, so clips must play inside
a WebView, not just a desktop browser. The hard rules:

- **Muted autoplay is the only reliable autoplay.** iOS Safari and Android
  Chrome both block *audible* autoplay without a user gesture. `CutscenePlayer`
  sets `muted` + `autoPlay`, and ships clips with no audio track anyway (§3).
- **`playsInline` + the legacy `webkit-playsinline` attribute are mandatory on
  iOS**, otherwise the clip hijacks the screen into the native fullscreen
  player. Both are set on the element.
- **Android WebView gesture policy:** older Android WebViews gate even muted
  autoplay behind `mediaPlaybackRequiresUserGesture`. The between-stage seam is
  reached **after** the user has been tapping through the lesson, so a recent
  gesture is usually in the activation stack — but this is **not guaranteed**.
  `CutscenePlayer` therefore treats a rejected `video.play()` promise as a
  non-event: it calls `onEnded` and the caller falls through to the existing
  static celebration. (If you want belt-and-braces native autoplay on Android,
  set `appendUserAgent`/WebView media flags in `capacitor.config`, but the
  fallback already keeps the flow correct without it.)
- **`disablePictureInPicture`** and `controls={false}` keep the clip from
  showing OS chrome / PiP affordances mid-celebration.
- **No service worker on native?** Capacitor serves the bundled web assets from
  the app package, so `/cutscenes/*.mp4` resolves from local disk on device —
  fast, offline, no network. The PWA precache discussion in §3 is a web concern.

---

## 5. Reduced-motion & never-stuck fallback

`CutscenePlayer` is built so the flow can **never** get stuck:

- **`prefers-reduced-motion: reduce`** → the clip is skipped entirely and
  `onEnded` fires on mount. The caller shows its normal static celebration.
- **No `src`** → renders nothing, fires `onEnded` immediately. This is why the
  component is safe to wire in **dormant** before any clips exist.
- **`play()` rejected (autoplay blocked) or media `error`** → `onEnded` fires;
  caller falls through.
- **Stall safety net** → if the `<video>` never reports `ended` (rare mobile
  decode stalls), a `maxDurationMs` timeout (default 9s for a ~6s clip)
  advances the flow anyway.
- **Always-visible Skip / Continue button** → the user can dismiss the clip at
  any time, routing through `onSkip` (or `onEnded` if `onSkip` is not passed).

Every exit path is funneled through one single-fire `finish()`, so `onEnded` /
`onSkip` can never double-fire and the flow always advances **exactly once**.

---

## 6. Exactly how to wire `CutscenePlayer` at the seams

`CutscenePlayer` is dormant by design — do **not** wire it until clips exist.
When ready, the change is localized to `src/App.jsx` (render block ~1778–1795)
plus the optional `stageCharacters.js` config from §2.

### Pattern: gate the existing celebration behind the clip

Render the cutscene **first**; when it ends (or is skipped/bypassed), reveal the
existing static celebration. The clip never replaces the celebration — it
precedes it, and falls through to it on every fallback path.

**Between-stage seam** (the prime seam — wrapping `Stage1CompleteCelebration`):

```jsx
// At top of App.jsx:
import { getStageCutscene } from './data/stageCharacters.js';
const CutscenePlayer = React.lazy(() => import('./components/CutscenePlayer.jsx'));

// Add one piece of state next to showStage1Celebration:
const [stage1ClipDone, setStage1ClipDone] = useState(false);
const stage1Cutscene = getStageCutscene(1); // null until a clip ships

// In the render block (replacing the current Stage1CompleteCelebration line):
{showStage1Celebration && (
  <>
    {!stage1ClipDone && stage1Cutscene && (
      <React.Suspense fallback={null}>
        <CutscenePlayer
          src={stage1Cutscene.src}
          poster={stage1Cutscene.poster}
          ariaLabel="Stage 1 complete"
          skipLabel="Skip"
          onEnded={() => setStage1ClipDone(true)}
          onSkip={() => setStage1ClipDone(true)}
        />
      </React.Suspense>
    )}
    {(stage1ClipDone || !stage1Cutscene) && (
      <Stage1CompleteCelebration
        onClose={() => { setShowStage1Celebration(false); setStage1ClipDone(false); }}
      />
    )}
  </>
)}
```

Because `getStageCutscene(1)` returns `null` until a real clip is added to
`STAGE_CUTSCENES`, this wiring is a **no-op** today: the static celebration
shows immediately, exactly as it does now. Add the clip file + config entry and
it lights up — no further code change.

**Between-mission seam** (wrapping `MissionCompleteRewardScreen`) follows the
identical pattern: add a `clipDone` flag, attach a `cutscene` descriptor to the
`rewardScreen` object that `setRewardScreen({...})` builds (around lines 844 /
1188 / 1290), render `CutscenePlayer` before the reward modal, and reveal the
modal on `onEnded`. Keep mission clips short (2–3s) since missions complete
frequently.

### Component prop reference

| Prop | Type | Default | Purpose |
| --- | --- | --- | --- |
| `src` | string | — | Clip URL (`/cutscenes/*.mp4`). Falsy → bypass, fire `onEnded`. |
| `poster` | string | — | Poster image shown while buffering / if blocked. |
| `skipLabel` | string | `'Skip'` | Label on the always-visible button. |
| `maxDurationMs` | number | `9000` | Stall safety net before forcing advance. |
| `onEnded` | fn | — | Clip finished or was bypassed (advance the flow). |
| `onSkip` | fn | — | User tapped Skip (falls back to `onEnded` if absent). |
| `ariaLabel` | string | `'Intro clip'` | Accessible label for the overlay. |

---

## 7. Checklist to ship the first clip

1. Encode `stage-1-complete.mp4` + `.jpg` per §3 into `public/cutscenes/`.
2. Add the `workbox` exclude + runtime-cache block to `vite.config.js` (§3).
3. Add `STAGE_CUTSCENES` + `getStageCutscene()` to `src/data/stageCharacters.js`
   (§2).
4. Wire `CutscenePlayer` at the Stage-1 seam in `App.jsx` (§6).
5. Test: web (Chrome + reduced-motion on), and on device via Capacitor
   (Android WebView + iOS Safari WebView) — confirm muted inline autoplay, the
   Skip button, and the fall-through to the static celebration when autoplay is
   blocked.
6. Roll out to additional stages by adding entries to `STAGE_CUTSCENES` only.
