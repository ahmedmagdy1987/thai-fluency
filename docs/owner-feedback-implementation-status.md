# Owner Feedback — Implementation Status

Evidence-based audit of every owner-feedback item. Last updated **2026-06-16**
(after the hero-viewport / mascot / stats / mission-loop polish milestone).

**How to read this:** status is one of DONE / PARTIAL / NOT DONE / BLOCKED, set
only from code/docs actually read (never from a commit title). "Owner input"
lists what cannot be resolved in code without a decision or real credential.

## Summary

| # | Item | Status | Priority | Needs owner input? |
|---|------|--------|----------|--------------------|
| 1 | Interactive cinematic "wow factor" | **DONE** | P0 | No |
| 2 | Button wording ("Make the call" → "Review what you've learned") | **DONE** | P3 | No |
| 3 | Footer donations (Buy Me a Coffee + crypto QR) | **PARTIAL** | P2 | **Yes** |
| 4 | Retention & monetization research doc | **DONE** (gaps filled) | P2 | Decisions only |
| 5 | Six-second cutscenes | **PARTIAL** (infra ready, dormant) | P2 | **Yes (assets)** |
| 6 | Advanced level selection / placement | **DONE** | P3 | No |
| 7 | Vocabulary page (Gecko / Water Buffalo / Hippo) | **PARTIAL** (needs clarification) | P2 | **Yes** |
| 8 | Leaderboard = "Coming soon", privacy-safe | **DONE** | P3 | No |
| 9 | Locked content / paywall presentation | **DONE** | P2 | No |
| 10 | Subscription prompt frequency | **DONE** | P2 | No |
| 11 | Audio quality plan | **DONE** (plan authored) | P2 | Decisions only |
| 12 | Launch priorities | **PARTIAL** (docs done; owner checks open) | P1 | **Yes** |

---

## 1. Interactive cinematic "wow factor" — DONE (P0)
- **Files:** `src/components/PublicLanding.jsx`, `src/styles/landing.css`,
  `public/cinematic/{hero-ambient.mp4,hero-islands.webp,temple.mp4,temple.webp}`.
- **Behavior:** one cinematic hero (`hero-ambient.mp4`) + exactly **one**
  secondary cinematic CTA band (`temple.mp4`). Lazy, desktop-only autoplay
  (muted/looped) via IntersectionObserver, fade-in on `canplay`; scroll-reveal,
  header-solidify on scroll, Ken Burns on posters. Reduced-motion and mobile get
  the poster only. **Not** the rejected three-band design (grep: exactly two
  `<video>` tags).
- **Evidence (browser, 2026-06-16):** hero video `readyState=4`,
  `duration=10.08s`, playing (currentTime +1.50s / 1.5s wall — smooth, not
  scrubbed); `temple.mp4` plays on scroll; **reduced-motion and mobile each
  loaded 0 MP4s** (poster only); MP4s served HTTP 206. Hero fills the first
  viewport (100svh) with **no light strip** at every width 320–2560 and height
  600–1080 (measured: next section top == hero bottom).
- **Note on the Bluffing-Monkeys reference:** the earlier scroll-*scrub*
  experiment was removed (owner reported it as jumpy). The current approach is a
  smooth autoplay + parallax/reveal composition — the deliberate, polished
  choice that keeps normal page scrolling intact.
- **Remaining:** none.

## 2. Button wording — DONE (P3)
- **Files:** `src/components/PublicLanding.jsx:472`.
- **Evidence:** `git grep "Make the call" -- src docs` → **no matches** (absent
  everywhere). Replacement present: the "Quick checks" feature card subtitle
  reads **"Review what you've learned"**.
- **Remaining:** none. (No literal `<button>` ever carried the old phrase.)

## 3. Footer donations — PARTIAL (P2) — **owner input required**
- **Files:** `src/config/site.js`, footer in `src/components/PublicLanding.jsx`
  (`lp-footer-coffee` / `lp-footer-crypto` / `lp-footer-qr`), `public/donate/`.
- **Behavior:** the footer architecture is complete and correctly **gated** — the
  Buy-Me-a-Coffee button renders only when `support.buyMeACoffeeUrl` is set, and
  the crypto block (QR + address + copy) renders only when `support.crypto.address`
  is set. No fake/dead controls render when fields are empty.
- **What changed this pass:** the previously placeholdered handle
  `buymeacoffee.com/tuktalkthai` was **verified to return HTTP 404 (2026-06-16)**,
  so it was a dead link. Per the "no dead/fake donation controls" rule,
  `buyMeACoffeeUrl` is now **blanked** (`''`) — the support button is hidden
  until a real URL is supplied. Crypto was already correctly hidden (empty
  address).
- **Owner input needed (exact):**
  1. **Real, confirmed Buy Me a Coffee URL** → paste into `src/config/site.js`
     `support.buyMeACoffeeUrl`. Button reappears automatically.
  2. **(Optional) crypto:** a real wallet **address**, the **network/label**
     (e.g. "USDT (TRC-20)"), and a **QR PNG** at `public/donate/crypto-qr.png`
     that encodes exactly that address → fill `support.crypto.address` /
     `label` / `qrSrc`. See `public/donate/README.md`.
- **Remaining:** none in code; blocked on the two owner-supplied facts above.

## 4. Retention & monetization research — DONE (P2) — *gaps filled this pass*
- **File:** `docs/RETENTION_AND_MONETIZATION.md`.
- **Behavior:** implementation-grounded note covering habit building, streaks,
  ad-free value, premium mission packs, subscription + lifetime/pricing, prompt
  timing + popup-fatigue back-off, "do these first", and non-negotiable
  guardrails — all tagged proposal vs shipped and tied to real files.
- **Gaps filled this pass:** added **§6 Rewarded attempts & hearts economy**
  (grounded in the existing `ShopScreen` hearts/gems scaffold) and **§7 Analytics
  events to instrument** (concrete event table). These were the two missing
  required topics.
- **Owner decisions (not blockers):** whether hearts become a real mechanic;
  which privacy-respecting analytics approach is acceptable.

## 5. Six-second cutscenes — PARTIAL (P2) — **owner assets required**
- **Files:** `src/components/CutscenePlayer.jsx`, `docs/CUTSCENES_INTEGRATION.md`,
  `src/styles/app.css` (`.cutscene-*`).
- **Behavior:** `CutscenePlayer` is a complete, mobile-safe `<video>` wrapper
  (muted/autoplay/playsInline, always-visible **Skip**, single-fire `finish()`
  that funnels *every* exit path — ended / error / skip / timeout /
  reduced-motion / no-src — so the flow can **never get stuck**). It is currently
  **dormant**: `git grep CutscenePlayer -- src` shows it is **not rendered
  anywhere**, and **no clip assets exist** (`public/` has no `cutscenes/` folder).
- **Platform support:** web/PWA and Android/iOS all supported by the component's
  inline muted-autoplay design; nothing platform-specific blocks it.
- **Safety today:** because it is never invoked, there is **no** replay,
  reward-duplication, or progression-blocking risk. Wiring it in must preserve
  these guarantees (skippable, watched-status persisted, failure non-blocking).

### Cutscene placement map (recommended)
| Seam | When | Recommended? | Notes |
|---|---|---|---|
| **Stage completion** | finishing the last mission of a stage | ✅ **Yes (start here)** | Highest payoff, lowest frequency → least fatigue. Persist `stageCutsceneSeen[stageId]` so it plays once. |
| Course completion | finishing the final stage | ✅ Yes | One-time celebration. |
| Stage introduction | first entry into a new stage | ⚠️ Optional | Only if it doesn't delay the first lesson; must be skippable + once-only. |
| Per-mission / milestone | every mission or XP milestone | ❌ No | Too frequent → fatigue; use the existing lightweight celebration overlays instead. |

### To make it live (sequence; do not start without owner sign-off on scope)
1. **Owner supplies** the actual ~6s clip(s) (e.g. `public/cutscenes/stage-1-complete.mp4` + poster). No AI/placeholder clips are in the repo and none should be invented.
2. Additive data lookup `getStageCutscene(stageId)` returning `null` until a clip exists (mirrors the existing `getStageCharacter` null-fallback; **no schema change**).
3. Render `CutscenePlayer` via `React.lazy` at the **stage-completion** seam behind a persisted "seen" flag — a **no-op until a clip ships** (lookup returns `null`).
- **Why not done now:** requires owner-supplied video assets **and** a product
  decision on which seams get cutscenes; wiring without assets would be dead
  code, and the brief forbids schema changes without approval.

## 6. Advanced level selection / placement — DONE (P3)
- **Files:** `src/components/PlacementOnboarding.jsx`, `src/App.jsx`,
  `src/lib/state.js`.
- **Behavior:** onboarding offers self-describing levels (none/few → Stage 1,
  survival → Stage 2, casual → Stage 4, confident → Stage 5) plus an optional
  ~12-card placement test that **recommends** a stage. Choosing an advanced level
  sets `startedStage`/`currentStage`, **skips** the Stage-1 starter lesson when
  `startedStage > 1`, and drops the user onto the Learn tab at their stage —
  **without** unlocking the whole course blindly (the curated path is preserved)
  and **without** awarding completion XP for skipped content.
- **Verified (not trusted from commit title):** the prior-content review path
  works, future stages stay locked, selection **persists after refresh and when
  signed in**, and there are **no duplicate rewards / no spurious stage
  achievements** (the celebration-arming baseline prevents retroactive firing).
- **Remaining:** none required. (Optional later: richer placement signal for
  Stages 5–8, which are light on content.)

## 7. Vocabulary page (Gecko / Water Buffalo / Hippo) — PARTIAL (P2) — **clarification required**
- **Files:** `src/data/cards.js`, `src/data/stageCharacters.js`,
  `src/components/BrowseTab.jsx`, `src/components/CardsTab.jsx`.
- **What the vocab page does (works):** `BrowseTab` and `CardsTab` render
  romanization (`ph`) + Thai (`thai`) + English (`en`) for every card via
  `displayCard`, with working search/filter; the female speaking-style transform
  is token-gated and does **not** corrupt cards.
- **Key finding (verified directly — corrects an earlier mis-read):** **Gecko,
  Water Buffalo, and Hippo do NOT exist as vocabulary cards.**
  `grep -i "gecko|hippo|buffalo|ควาย" src/data/cards.js` → **no matches**. They
  exist only as **stage mascots** in `stageCharacters.js`
  (`gecko` = "Jingjok" 🦎, `buffalo` = "Kwai" 🐃, `hippo` = "Hippo" 🦛) — each
  has a name + emoji + accent + vibe, but **no Thai/romanization/English** (these
  are characters, not vocabulary).
- **Owner clarification needed:** did the feedback mean
  (a) the **stage mascot characters** (already present; nothing to "fix" as
  vocab), or (b) actual **animal vocabulary cards**? If (b), Gecko and Hippo
  cards must be **authored with native-reviewed Thai** (Water Buffalo = ควาย
  /khwaai, Gecko = จิ้งจก /jîngjòk, Hippo = ฮิปโป /híppoh are candidates) — **not
  invented here** without native review, per the "flag, don't guess" rule.
- **Remaining:** awaiting owner intent; then add cards (with native review) if (b).

## 8. Leaderboard — DONE (P3)
- **File:** `src/components/LeaderboardScreen.jsx`.
- **Behavior:** a static **"Coming soon"** screen. Placeholder rows are clearly
  inert ("Player one/two/three", XP shown as "—", container `aria-hidden` +
  `placeholder` class) so they cannot read as real data. **No** real user data,
  **no** upsell. The future plan references only **username/nickname** — never
  full name, email, or private profile data.
- **Remaining:** none. (Optional cosmetic: swap placeholder names for skeleton
  bars.)

## 9. Locked content / paywall presentation — DONE (P2)
- **Files:** `src/components/ShopScreen.jsx`, `SuperUpgradePrompt.jsx`, locked
  stage/mini-unit/mission-rail rendering.
- **Behavior:** locked items render with a Lock icon, dashed borders,
  grayscale/dimmed treatment, and plain-language notes ("Complete earlier stages
  to unlock", "Super early access coming soon"). Locked buttons are `disabled`
  with descriptive `aria-label`/`title` — they read as **locked, not broken**, to
  sighted and assistive-tech users. Locking gates **convenience/early-access
  only**; the curated educational path is **not** locked and progression is not
  broken. The Shop/Super surfaces are explicit **"Coming soon" visual scaffolds**
  (no gem spending, no DB writes).
- **Remaining:** none until real purchase/entitlement wiring is owner-approved.

## 10. Subscription prompt frequency — DONE (P2)
- **Files:** `src/App.jsx` (`requestSuperPrompt` / `superPromptLastShownAt`),
  `src/components/SuperUpgradePrompt.jsx`, celebration "Super CTA".
- **Behavior:** both the full-screen modal and the inline celebration CTA are
  capped to **once per local calendar day**, persisted across reloads
  (`superPromptLastShownAt` + a `super-cta:<date>` ledger). Prompts fire only
  **after a real accomplishment** (first lesson, mission/stage completion) —
  never on first load, never after every action, never before the user
  experiences value, never repeatedly in a session.
- **Remaining:** none. (Optional: a multi-day back-off after repeated
  dismissals — additive, no schema change.)

## 11. Audio quality plan — DONE (P2) — *plan authored this pass*
- **File:** `docs/audio-quality-plan.md` (new); current code `src/lib/audio.js`.
- **Behavior:** the app plays Thai **exclusively via device/browser TTS** (native
  Capacitor TTS on APK, hardened `SpeechSynthesis` on web); rate slowed for
  learners (0.8 / 0.72); gender is a best-effort name heuristic; **no recorded or
  generated files exist**. The new plan compares device TTS vs cloud Thai TTS vs
  AI-generated files vs human-recorded across pronunciation, M/F, latency, file
  size, offline, cost, caching, and native review, and recommends a small
  **Stage-1 pilot** (cloud-neural vs human VO, blind native review) behind a
  non-breaking "play file if it exists, else TTS" lookup.
- **Owner decisions (not blockers):** budget, vendor (cloud/AI vs human),
  distribution (bundled vs CDN+cache), native reviewer.

## 12. Launch priorities — PARTIAL (P1) — **owner checks open**
- **Files:** `docs/launch-readiness-audit.md`, `docs/go-to-market-plan.md`,
  `docs/final-web-beta-launch-status.md`, `docs/mobile-app-launch-checklist.md`.
- **Behavior:** launch readiness is **comprehensively documented** with a clear
  recommendation — free, controlled **web/PWA soft launch first**, native stores
  deferred. Technical web/PWA build, production domain, legal/support/privacy/
  terms/delete-account routes, PWA manifest/icons, OneSignal worker, and
  persistence hardening are in place.
- **NOT claimed ready (no evidence):** payment readiness (no provider wired by
  design) and a full security sign-off — these remain owner/explicit-approval
  gated. No secrets are exposed in the repo.
- **Owner checks open before broad launch:** confirm `support@tuktalkthai.com`
  mailbox is live/monitored; approve Privacy + Terms with the final legal name;
  provide a fresh production test account + inbox; run the documented controlled
  push test; re-run `scripts/smoke-production-routes.mjs` against production.

---

## Consolidated owner action list (what's needed from you)
1. **Buy Me a Coffee:** your real BMAC URL (current placeholder 404s, now hidden).
2. **Crypto (optional):** wallet address + network/label + matching QR image.
3. **Cutscenes:** the actual ~6s clip file(s) + which seams should use them
   (recommended: stage completion only to start).
4. **Vocabulary:** confirm whether Gecko/Water Buffalo/Hippo should be real
   vocab cards (then native-reviewed Thai) or are just stage mascots.
5. **Audio:** budget + vendor + distribution + native reviewer (to start the
   Stage-1 pilot).
6. **Launch:** mailbox confirm, legal approval w/ final name, fresh test account,
   controlled push test.
7. **Retention decisions:** whether hearts become a real mechanic; analytics
   approach.
