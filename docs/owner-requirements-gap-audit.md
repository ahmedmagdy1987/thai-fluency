# Owner Requirements Gap Audit

Date: 2026-05-16

Scope of this pass:
- Audit the owner product vision against the current app.
- Implement only safe immediate fixes: Challenge audio controls and master sound-effects toggle.
- Do not rewrite the app, change card content, alter SRS scheduling, add migrations, add payments, add ads, or deploy app-store assets.

| Area | Owner Requirement | Current Status | Implemented Now | Still Missing | Recommended Next Step |
|---|---|---|---|---|---|
| Characters | Characters default ON, motivating, polished, character-driven, mobile-friendly. | CharacterCoach exists in Cards, Challenge, and demo. Default setting is ON through `showCharacters !== false`. Stage character resolution exists. | Verified default ON and kept existing character surfaces. | More character art/states, deeper character progression, and broader use in rewards/lesson transitions. | Add a character QA pass and map each major learning event to an intentional coach state. |
| Character toggle | Clear toggle to disable/enable characters, easy to find. | Settings modal has "Show lesson characters" toggle. Mobile More sheet exposes Settings. Preference persists in local state and signed-in profile settings. | Verified placement and persistence. | No always-visible lesson toggle, by design, to avoid clutter. | User-test whether mobile users find More -> Settings quickly enough; add a settings shortcut only if discovery is weak. |
| Sound toggle | Clear sound effects toggle, default ON, disables lesson/feedback/celebration sounds. | No master effects toggle existed before this pass. TTS settings already existed separately. | Added `Sound effects` setting, default ON, persisted locally and in `profiles.settings` for signed-in users. Gated flip, Easy, character reaction, milestone, and celebration sounds centrally. | Fine-grained effect categories are not split. | Keep one master switch until user feedback proves separate controls are needed. |
| Cards/SRS | Existing flashcard/SRS system stays and remains the core product. | CardsTab uses the current SRS queue, reveal, rating, undo, and progression logic. | No SRS scheduling or card content changed. Sound effects are gated through shared sound helpers only. | SRS is not yet embedded inside structured 10-minute units. | Add a unit layer above SRS selection rather than replacing CardsTab. |
| Challenge mode | Multiple-choice Challenge remains separate from Cards/SRS. | QuizTab is a separate Challenge tab and builds its own question pool from unlocked cards. | Removed answer-revealing English-to-Thai prompt audio, kept Thai-to-English prompt audio, preserved Thai option TTS on tap, and retained correct/wrong sounds after Check. | No drag-and-drop sentence builder yet. Challenge is not yet sequenced into units. | Add unit-aware Challenge entry points while keeping standalone Challenge available. |
| 75/25 learning mix | App should feel roughly 75 percent Anki-style SRS and 25 percent interactive challenges. | Current app is mostly SRS plus Browse/Guide/Challenge/Quests. Challenge exists but is not woven into daily flow. | Documented target architecture. | No runtime balancing or daily mix planner. | Introduce a session composer that suggests card reviews first, then one short challenge block. |
| 10-minute mini-units | Each stage/mini-unit should take about 10 minutes. | Stage 1 missions exist, but they are mastery groups, not timed 10-minute units. | Documented unit sizing and timing assumptions. | No unit duration tracking, no per-unit completion model. | Create a local static `miniUnits` data layer for Stage 1 only before adding DB persistence. |
| 6-10 vocab + sentence + multiple choice + drag-drop flow | Ideal unit flow: 6-10 vocab cards, one sentence flashcard, multiple-choice question, drag-and-drop sentence builder. | Cards and multiple-choice Challenge exist separately. Some sentence cards exist. Drag-drop does not exist. | Documented safe flow design. | No unit composer, no sentence builder, no requirement that selected vocab builds to a target sentence. | Build one hard-coded pilot unit using existing cards only, then generalize. |
| Related word grouping | Words inside a mini-unit should be related and build toward a useful sentence. | Stage 1 missions and categories provide partial grouping. The global card deck is not consistently unit-scaffolded. | Documented grouping rules. | Need curated mini-unit membership and target sentence mapping. | Add non-content-changing metadata in a separate unit file referencing existing card IDs. |
| Mini-lessons | Support short lessons between stages: recap and preview paragraphs. | Learn path and Guide exist. No stage transition mini-lessons. | Documented insertion points. | No lesson content model or UI. | Add a read-only mini-lesson component after unit or stage completion, using authored copy reviewed separately. |
| Thai Sounds & Script | Future learning area for consonants, vowels, tones, pronunciation differences, listening practice. | Guide has Tones, Tone Challenge, and Pronunciation sections. It is not a full Sounds & Script academy. | Documented architecture and first implementation phase. | Thai consonant/vowel/script curriculum, listening drills, script progression, audio assets. | Start with a Guide subarea for consonant classes, vowels, and tone rules, reusing current tabs. |
| Fluency-hours calculation | Product vision implies motivating progress toward fluency hours. | No explicit fluency-hours calculation found. Current stats include XP, reviews, streaks, stage progress. | Documented as missing. | Need definition of a "fluency hour", telemetry inputs, and display rules. | Define a conservative formula from reviews, challenges, and active lesson time before showing it. |
| Shop/rewards | Gems/rewards/shop should motivate users. | ShopScreen and Quests exist as placeholder/early reward surfaces. Real economy is not implemented. | No rewards economy changed. | No robust earn/spend economy, inventory, or anti-abuse rules. | Keep rewards cosmetic until monetization and persistence model are designed. |
| Monetization | Future yearly, lifetime, Super User, ad removal, paid packs. | No real monetization implemented. | Documented roadmap only. | Payment provider, entitlements, pricing, tax/compliance, restore purchases, subscription lifecycle. | Research current web/app-store payment constraints and choose an entitlement model first. |
| Ads | Free users may see ads later. | No ads SDKs integrated. | Documented only. | Ad SDK choice, privacy consent, placement policy, performance testing. | Do not add ads until retention and core learning loop are stable. |
| Paid packs | Future paid card packs. | Card deck is bundled in code. No pack ownership model. | Documented only. | Pack metadata, entitlement checks, content pipeline, review workflow. | Design pack manifest and entitlement checks before creating paid content. |
| Cross-promotion banner | Future banner for Hustle Book Vault. | No cross-promo banner found. | Documented only. | Banner placement, tracking, dismissal, frequency caps. | Add only after owner supplies final copy, destination, and privacy requirements. |
| App stores | Play Store/App Store packaging later. | Vite/PWA app exists. No native wrapper or store config in this pass. | Documented only. | Store assets, native packaging, policy checks, subscriptions/IAP if monetized in app. | Choose Capacitor or equivalent only after launch target and monetization route are fixed. |
| Marketing | Domain, social accounts, Reddit/Quora/Meta, soft launch checklist. | No marketing implementation in code. | Documented only. | External account setup, analytics plan, landing/domain work, campaign creative. | Create launch checklist and content calendar outside the app repo or in docs only. |
| Native review workflow | Do not block launch on minor native-level issues; document content issues for later. | Existing content audit docs and scripts exist. Some cards have review markers. | No card content changed. | Need a lightweight triage queue for post-launch content fixes. | Keep using audit docs; add owner/native-review status tags before changing content. |
| Voice recognition future architecture | Leave room for speech recognition later, document only. | TTS exists through browser speech synthesis. No speech recognition feature. | Documented architecture only. | Speech API/provider choice, scoring, privacy consent, microphone UX, mobile support. | Prototype behind a feature flag after pronunciation curriculum is stable. |

## Safe Fixes Completed In This Pass

- Challenge prompt audio now renders only for Thai-to-English questions, where the prompt itself is Thai.
- English-to-Thai Challenge options still play the tapped option's Thai pronunciation through the existing option click handler.
- Check feedback still plays correct/wrong character sounds once per question because `handleCheck` is guarded by `checked` and `checkLockedRef`.
- Added a master `Sound effects` setting that defaults ON and gates Web Audio effects centrally.
- Sound effects remain separate from Thai pronunciation TTS.

## Explicitly Not Changed

- CardsTab SRS scheduling.
- Card data content.
- Supabase schema or migrations.
- Auth, OneSignal, payments, ads, app-store packaging, or real rewards economy.
