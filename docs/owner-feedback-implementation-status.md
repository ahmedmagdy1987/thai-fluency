# Owner Feedback — Implementation Status

Evidence-based audit of every owner-feedback item. Last updated **2026-06-17**
(support-section + mascot pass: added the public "Support Tuk Talk Thai" section
with configurable Buy Me a Coffee + crypto cards, generated Hippo and Monkey
mascot asset packs via Higgsfield MCP, and made the 4 roadmap cards character-led
with 4 distinct mascots; see items 3 and 7).

**How to read this:** status is one of DONE / PARTIAL / NOT DONE / BLOCKED, set
only from code/docs actually read (never from a commit title). "Owner input"
lists what cannot be resolved in code without a decision or real credential.

## Summary

| # | Item | Status | Priority | Needs owner input? |
|---|------|--------|----------|--------------------|
| 1 | Interactive cinematic "wow factor" | **DONE** | P0 | No |
| 2 | Button wording ("Make the call" → "Review what you've learned") | **DONE** | P3 | No |
| 3 | Public support section (Buy Me a Coffee + crypto) | **PARTIAL** (UI live; real destinations pending) | P2 | **Yes** |
| 4 | Retention & monetization research doc | **DONE** (gaps filled) | P2 | Decisions only |
| 5 | Six-second cutscenes | **PARTIAL** (infra ready, dormant) | P2 | **Yes (assets)** |
| 6 | Advanced level selection / placement | **DONE** | P3 | No |
| 7 | Mascot characters (Gecko / Buffalo / Hippo / Monkey) | **CLARIFIED** (mascot assets, not vocabulary) | P2 | No |
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
- **Mobile mascot pass (2026-06-17):** owner feedback was that the mobile mascot
  read as too small. The mobile hero was reworked so the mascot is a large,
  dominant hero figure stacked above ONE sample card (the card floats at its
  base), instead of a thumbnail squeezed beside the card. Verified via rendered
  browser (Playwright) at 320 / 360 / 390 / 414 px widths: mascot ~210-300px
  wide (up from ~120px), exactly one hero card, the three chips stay on one row,
  and the stats bar is intact (no clipping). Desktop hero is unchanged and still
  balanced (single card, stats visible before scrolling). Landscape / very short
  viewports fall back to a clean side-by-side row. Change is CSS-only
  (`src/styles/landing.css`); no JSX, data, or copy changed.
- **Remaining:** none.

## 2. Button wording — DONE (P3)
- **Files:** `src/components/PublicLanding.jsx:472`.
- **Evidence:** `git grep "Make the call" -- src docs` → **no matches** (absent
  everywhere). Replacement present: the "Quick checks" feature card subtitle
  reads **"Review what you've learned"**.
- **Remaining:** none. (No literal `<button>` ever carried the old phrase.)

## 3. Public support section — PARTIAL (P2) — UI live, real destinations pending
- **Files:** `src/config/site.js`, `src/components/PublicLanding.jsx`
  (`.lp-support` section), `src/styles/landing.css`, `.env.example`,
  `.env.local.example`.
- **What changed this pass:** added a dedicated, always-visible **"Support Tuk
  Talk Thai"** section above the footer (replacing the old gated footer block).
  Heading + copy ("Help us improve the lessons, characters, audio, and learning
  experience.") + two cards: **Buy me a coffee** and **Crypto donation**.
- **Config (public build-time env vars), no hardcoded accounts:**
  `VITE_BUY_ME_A_COFFEE_URL`, `VITE_CRYPTO_WALLET_ADDRESS`,
  `VITE_CRYPTO_NETWORK`, `VITE_CRYPTO_QR_IMAGE` (read in `site.js`, all default
  to empty).
- **Honest states (verified in a real browser, light + dark, desktop + mobile):**
  - Buy Me a Coffee: shows an active external link (`target=_blank`,
    `rel="noopener noreferrer"`) **only** when `VITE_BUY_ME_A_COFFEE_URL` is set;
    otherwise the card stays visible with a polished **"Coming soon"** state.
  - Crypto: shows network + shortened address + copy button + (optional) QR
    **only** when `VITE_CRYPTO_WALLET_ADDRESS` is set; otherwise the card stays
    visible with a **"Coming soon"** state.
  - **No fake account, no invented wallet/network, no generated QR, no dead
    controls.** Neither value is configured in the repo, so both cards currently
    show "Coming soon".
- **UI status:** **implemented and live.** Do **not** describe donations as
  operational: no real destination has been supplied or verified.
- **Owner input needed (exact):**
  1. **Real, confirmed Buy Me a Coffee URL** → set `VITE_BUY_ME_A_COFFEE_URL` in
     Vercel env (and `.env.local` for local). Card activates automatically.
  2. **(Optional) crypto:** a real **wallet address** (`VITE_CRYPTO_WALLET_ADDRESS`),
     **network/label** (`VITE_CRYPTO_NETWORK`, e.g. "USDT (TRC-20)"), and an
     **approved QR image** at e.g. `/donate/crypto-qr.png` that encodes exactly
     that address (`VITE_CRYPTO_QR_IMAGE`).
- **Remaining:** none in code; blocked on the owner-supplied real destinations.

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

## 7. Mascot characters (Gecko / Buffalo / Hippo / Monkey) — CLARIFIED (P2)
- **Owner clarification (now settled):** Gecko, Water Buffalo, Hippo, and Monkey
  are **mascot-style character assets**, the same product role as the existing
  Muay Thai and elephant mascots. They are **NOT vocabulary cards.** No Thai
  vocabulary entries are invented for them, they are **not** in the language card
  dataset (`src/data/cards.js`), and they are **not** in any vocabulary-correction
  backlog. (Verified: `grep -i "gecko|hippo|buffalo|monkey|ควาย" src/data/cards.js`
  → no matches.)
- **Files:** `src/data/stageCharacters.js` (character config), `src/data/characters.js`
  (in-lesson coach manifest), `public/characters/<id>/` (art packs).

### Future mascot character assets
| Mascot | Asset status | Source |
|---|---|---|
| **Hippo** | **New pack generated this pass** via Higgsfield MCP (`nano_banana_pro`) | owner reference `C:\Users\bdstd\Pictures\hippo.PNG` |
| **Monkey** (Ling) | **New pack generated this pass** via Higgsfield MCP (`nano_banana_pro`) | owner reference `C:\Users\bdstd\Pictures\monkey.PNG` |
| **Elephant** (Chang) | **Existing pack** already in project | `public/characters/elephant/` |
| **Samurai / Muay Thai** (Khun Suk) | **Existing pack** already in project | `public/characters/muay-thai/` |

- **Pack structure (all four now consistent):** each pack is the same 7-variant
  set — `idle, happy, celebrating, correct, speaking, thinking, wrong` — as
  1024x1024 WebP with transparent background, matching the elephant/muay-thai
  convention. Elephant and Samurai already had all 7 variants, so **no gap-filling
  was needed**. Hippo and Monkey were generated from the supplied references,
  background-removed, and exported to the same spec.
- **Where the new art is used:** the public **roadmap / "Your journey"** section
  now leads all 4 stage cards with a distinct mascot (Stage 1 elephant, Stage 2
  monkey, Stage 3 hippo, goal card Muay Thai). `hasArt: true` is set for hippo and
  monkey in `stageCharacters.js`.
- **In-lesson coach note:** the lesson Coach (`characters.js`) still ships full
  manifests (sound profile + voice lines) only for elephant and muay-thai, so for
  now stages mapped to hippo/monkey/gecko/buffalo still fall back to the elephant
  coach. Wiring hippo/monkey as full in-lesson coaches (adding sound + lines) is a
  safe future step now that their art exists; it was intentionally left out of this
  pass to avoid changing lesson/audio behavior.
- **Remaining:** none required. (Optional: gecko + buffalo packs, and full
  in-lesson coach manifests for the new mascots.)

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
1. **Buy Me a Coffee:** your real BMAC URL → set `VITE_BUY_ME_A_COFFEE_URL` in
   Vercel env. The card is live and shows "Coming soon" until then.
2. **Crypto (optional):** real wallet address + network/label + an approved QR
   image → set `VITE_CRYPTO_WALLET_ADDRESS` / `VITE_CRYPTO_NETWORK` /
   `VITE_CRYPTO_QR_IMAGE`. Card shows "Coming soon" until then.
3. **Cutscenes:** the actual ~6s clip file(s) + which seams should use them
   (recommended: stage completion only to start).
4. **Mascots (settled):** Gecko / Buffalo / Hippo / Monkey are mascot assets,
   not vocabulary. Hippo + Monkey packs are now generated; gecko + buffalo packs
   are optional future art. No owner action required.
5. **Audio:** budget + vendor + distribution + native reviewer (to start the
   Stage-1 pilot).
6. **Launch:** mailbox confirm, legal approval w/ final name, fresh test account,
   controlled push test.
7. **Retention decisions:** whether hearts become a real mechanic; analytics
   approach.
