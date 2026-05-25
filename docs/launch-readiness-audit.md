# Tuk Talk Thai Launch Readiness Audit

Date: 2026-05-25
Audited repo: `ahmedmagdy1987/thai-fluency`
Audited local branch: `master`

This is a planning audit only. No app code, card data, SRS scheduling, auth logic, OneSignal production config, database schema, payments, ads SDKs, or app-store packaging were changed.

## 1. Executive summary

Launch readiness score: **72 / 100 for a controlled web/PWA soft launch**.

Native App Store / Play Store readiness score: **38 / 100**.

Recommended launch path:

1. Launch a controlled web/PWA soft launch first with invited users and a real domain.
2. Keep the app free during the first soft-launch window.
3. Use the soft launch to validate onboarding completion, first lesson completion, day-1 return, push opt-in, and content quality.
4. Prepare native packaging after the first soft-launch feedback pass, using Capacitor or a similar wrapper only after store metadata, legal URLs, screenshots, and test accounts are ready.

Biggest risks:

- Legal and privacy copy is not launch-safe yet because the current in-app Privacy Policy does not reflect OneSignal push notifications and still says there are no other third-party integrations.
- Account deletion is visible as "Not available yet"; this is a store-review and trust risk.
- OneSignal is wired but still needs an end-to-end test with a real subscribed device and production domain.
- Native app-store launch is blocked by missing wrapper, bundle IDs, store assets, support URL, app-review test account, privacy/data-safety forms, and screenshots.
- Monetization infrastructure does not exist yet. Adding payments or ads now would delay launch and increase policy risk.

Recommended monetization approach:

- Launch the first public web/PWA version **free**.
- Add only non-blocking "founder/supporter interest" messaging after the user has experienced value, if the owner wants early monetization validation.
- Do not ship subscriptions, ads, paid packs, or hard paywalls until the entitlement model, legal copy, refund/support flow, and app-store billing path are designed.

## 2. Current app status

| Area | Current status | Launch assessment |
|---|---|---|
| Onboarding | Public landing, auth gate, demo mode, placement onboarding, and first lesson are present. | Strong enough for soft launch. Needs live-device QA and activation metrics. |
| Guided first lesson | New users see a focused Stage 1 mini-unit: intro, 8 vocab cards, 1 sentence card, 3-question challenge, completion. | One of the strongest launch assets. Keep it stable. |
| Cards/SRS | 4,791 cards across 8 stages; SM-2 style review, due/new queues, undo, stage unlock filtering. | Core product is launchable. Do not rewrite before launch. |
| Challenge | Separate multiple-choice Challenge tab using unlocked cards and XP rewards. | Launchable as a supporting mode. Not yet deeply woven into daily path. |
| Characters | Character coach surfaces exist; elephant and muay-thai webp assets exist; stage/character mapping exists. | Useful differentiation. Needs visual QA and owner approval on brand direction. |
| Settings | Theme, voice perspective, learning mode, audio speed, autoplay, characters, sound effects, daily goal, legal links, reset. | Good. Account deletion/export gaps remain outside Settings. |
| Auth | Supabase email/password, sign-up, sign-in, forgot password, pending email confirmation handling, sign out. | Good for soft launch if Supabase settings are verified. Needs test account for app review. |
| Progress sync | LocalStorage plus Supabase cloud sync for progress, stats, achievements, and profile settings. | Good for v1. Anti-cheat is not needed until leaderboards or paid rewards matter. |
| Notifications | OneSignal client wrapper, permission prompt, profile notification settings, Edge Function docs, scheduler docs. | Needs production-domain smoke test. Privacy policy must mention OneSignal before public launch. |
| Landing page | Clear mobile-friendly landing with phrase audio and direct CTAs. | Good for soft launch. Needs domain, analytics, and tighter SEO metadata later. |
| Mobile UX | Responsive shell, mobile bottom nav, More sheet, mobile landing phrases. | Likely launchable, but must be QA-tested on iPhone SE, modern iPhone, small Android, and desktop. |
| Dark mode | Theme setting and CSS variables exist. | Needs one visual QA pass on major screens. |
| Routes/navigation | Custom browser routes for core tabs, auth, profile, settings; Vercel rewrites route to `index.html`. | Good enough. Not a blocker. |
| Database/security | RLS/data isolation documented as passing; security headers exist in `vercel.json`; Supabase publishable key is public by design. | Good base. Remaining launch risks are legal/account deletion/export and dashboard setting verification. |
| Shop/quests | Quests read real stats. Shop, hearts, gems, power-ups, and leaderboard are clearly preview/placeholder surfaces. | Keep as preview only. Do not monetize from these yet. |
| App-store readiness | PWA manifest, icons, and installability exist. No native wrapper or store submission package exists. | Not ready for native stores. PWA soft launch is the practical path. |

## 3. P0 blockers before launch

These are the only items that can seriously block launch or hurt the first user experience.

| Blocker | Applies to | Why it matters | Recommended fix |
|---|---|---|---|
| Privacy Policy and Terms need owner-approved public URLs | Web/PWA and native | Store listings require live legal/support URLs. Current policy does not mention OneSignal and still says no other third-party integrations. | Update legal copy, include Supabase, Vercel, OneSignal, web push, support email, data deletion/export path, and host it on the domain. |
| Account deletion path is not available in-app | Native store, public trust | Profile shows "Delete account" disabled. Stores and privacy expectations require a real deletion route or at least a documented support workflow. | For immediate soft launch, publish a manual deletion policy via support email. Before native submission, implement or expose a deletion request path. |
| End-to-end auth/progress/push smoke test not completed on production domain | Web/PWA and native | First users must be able to sign up, confirm email, finish onboarding, sync progress, sign out/in, and manage notifications. | Create two test accounts and test new-user flow, returning-user flow, progress sync, password reset, and OneSignal opt-in. |
| Native store package does not exist | Native stores only | App Store and Play Store require a native build, bundle ID/package name, screenshots, app metadata, rating, and app review access. | Do not promise native launch until wrapper and metadata are ready. Use PWA for immediate launch. |
| Domain, support email, and public landing URL are not confirmed | Public launch | Marketing, legal, support, app review, and privacy forms need stable URLs and contact identity. | Owner must choose domain, support email, legal/business name, and privacy/terms approval. |

## 4. P1 quick wins before launch

High-impact improvements that are easy enough to do now:

| Quick win | Impact | Notes |
|---|---|---|
| Publish a simple domain landing page | High | Point it to the PWA. Use the current landing message: practical Thai for real life in Thailand. |
| Update legal copy for OneSignal and deletion/export | High | This can be done without changing core app logic if hosted as website pages first. |
| Add a support page or support section | High | App stores need support URL; users need a contact path. |
| Prepare launch screenshots from real app screens | High | Use landing, first lesson, Cards, Challenge, Learn path, Profile/notifications. |
| Create a simple smoke-test checklist | High | Test on desktop Chrome, iPhone Safari, Android Chrome, and one installed PWA. |
| Run OneSignal production test | High | Confirm permission prompt, subscription save, preference toggles, and one controlled notification. |
| Hide paid language from launch messaging | Medium | Do not advertise Shop/hearts/premium as functional. Keep "preview" copy. |
| Add a basic analytics decision | Medium | At minimum track page visits, sign-up starts, account created, onboarding completed, first lesson completed, day-1 return. Requires owner approval before code changes. |
| Reserve social handles | Medium | Use the same handle across TikTok, Instagram, YouTube Shorts, X, Reddit profile, and Facebook page if available. |
| Prepare launch posts and short videos | Medium | Focus on practical Thai in real situations, not generic "learn Thai fast" claims. |

## 5. P2 post-launch improvements

Important, but not worth delaying the soft launch:

- Full monetization: subscriptions, lifetime purchase, paid packs, ads, ad removal.
- Native app-store wrapper and release automation.
- Real economy: gems, hearts, shop purchases, inventories, reward claims.
- Leaderboards and social sharing.
- Server-side SRS validation and anti-cheat.
- Account deletion/export self-service if a manual support workflow is accepted for web soft launch.
- More mini-units beyond the Stage 1 pilot.
- Drag-and-drop sentence builder.
- Native audio recordings and native-speaker content review queue.
- Full analytics dashboard and retention cohorts.
- SEO blog program beyond the first launch posts.

## 6. Monetization recommendation

| Option | Pros | Cons | Fit for current product |
|---|---|---|---|
| Launch fully free | Fastest launch, lowest policy risk, best for retention learning, simple support. | No immediate revenue. Users may anchor on free. | Best choice for first soft launch. |
| Freemium with soft upgrade prompts | Tests demand without blocking learning. Can frame future premium as founder/supporter. | Needs careful copy so users do not expect paid features that do not exist. | Safe if prompts are non-blocking and no payment is collected yet. |
| Paid subscription from day one | Revenue from serious learners, clear business model. | Requires entitlements, pricing, billing, cancellation, restore purchases, taxes, app-store review metadata, and support. | Not recommended now. |
| Ads from day one | Revenue from free users without charging. | Hurts learning focus, adds privacy/compliance work, affects performance, requires ad policy review. | Not recommended. |
| Founder/lifetime offer | Good for early believers, simple story. | Needs legal terms, refund policy, entitlement durability, and store billing decisions if native. | Consider after PWA traction or as website waitlist first. |
| Paid content packs later | Natural fit for travel/business/relationship/admin packs. | Needs pack ownership model, content review, entitlements, and restore flow. | Good phase 3 monetization, not launch day. |

Recommendation:

- Soft launch free.
- If the owner wants monetization signals immediately, add a "Founding supporter interest" CTA on the website or after the first lesson completion, but do not collect payment until entitlements and legal terms are ready.
- For native apps, digital subscriptions or unlocks should use Apple In-App Purchase and Google Play Billing unless a current policy exception applies. Do not add external checkout buttons inside native apps without a policy review.

Safest MVP if monetization must exist from launch:

- Web/PWA only: a non-blocking founder waitlist or manual "contact us for founder access" offer.
- No learning content should be blocked.
- No ads.
- No auto-renewing subscription until billing, entitlement checks, cancellation, restore, refund/support, and privacy/terms are complete.

## 7. Duolingo-inspired product strategy

Use product principles, not copied assets, copy, or branding.

| Pattern | Already implemented | Quick to implement | Later |
|---|---|---|---|
| One clear path | Guided first lesson and Learn path exist. | Make Learn the obvious daily start with "Continue" and due-card priority. | Full multi-unit path across all stages. |
| Streaks | Streak, streak freeze count, daily goal, and streak notifications exist. | Add clearer streak save messaging and streak warning QA. | More nuanced freeze purchase/earn rules. |
| Hearts | Hearts are visible as placeholder 5/5. | Keep as preview only or hide from heavy marketing. | Real heart loss/refill economy after DB design. |
| Rewards | XP, achievements, stage toasts, quests scaffold exist. | Add clearer completion celebrations and reward copy. | Real gems, chests, inventory, store purchases. |
| Daily quests | Quests screen exists and reads stats. | Promote one daily quest after onboarding. | Persist quest state and rewards server-side. |
| Upgrade prompts | Not implemented. | Add "Premium coming" interest capture only if approved. | Real premium prompts after entitlements and pricing. |
| Ad removal | Not relevant because ads are not implemented. | None. | Only if ads are added later. |
| Mascot moments | Character coach and character art exist. | Add one post-lesson mascot encouragement. | Broader character arcs, unlocks, skins. |
| Progress path | Stage path and Stage 1 missions exist. | Tighten first-week path around Stage 1 mini-units. | Full unit map with completion persistence. |
| Push notifications | OneSignal client, settings, and backend docs exist. | Test daily reminder and streak warning with a real device. | Segmented lifecycle campaigns and A/B testing. |

## 8. App Store / Play Store launch checklist

| Item | Current state | Needed before native submission |
|---|---|---|
| Native wrapper | Missing. App is currently a PWA. | Choose Capacitor or equivalent; configure iOS bundle ID and Android package name. |
| App icon | PWA icons exist. | Confirm final icon at all native sizes, adaptive icon for Android, and App Store icon. |
| Splash screen | Missing native splash config. | Create splash screen from brand assets and test on devices. |
| Screenshots | Not prepared. | Capture real screens. Apple accepts 1-10 screenshots per device/localization; Google requires at least 2 screenshots and recommends 4 high-res screenshots. |
| App description | Not prepared for stores. | Write short/long descriptions, subtitle, keywords, category, and release notes. |
| Privacy policy | In-app modal exists but needs update. | Host public URL and update for OneSignal, support, deletion/export. |
| Terms | In-app modal exists but needs owner approval and public URL. | Host public URL and keep copy aligned with free/paid status. |
| Support URL | Missing. | Publish support page with email/contact method. Apple support URL must lead to actual contact info. |
| Content rating | Missing. | Complete Apple age rating and Google Play IARC questionnaire. |
| Test account | Missing. | Create reviewer test account with confirmed email and known state; provide credentials in review notes. |
| App privacy/data safety | Missing. | Complete Apple App Privacy and Google Data Safety based on Supabase, OneSignal, Vercel, auth, progress, and notifications. |
| In-app purchases | Missing and not recommended now. | If monetized, create IAP/Play Billing products, entitlements, restore flow, review metadata, and subscription terms. |
| Closed testing | Not started. | Google personal developer accounts created after 2023-11-13 need closed testing with at least 12 opted-in testers for 14 continuous days before production access. |
| PWA vs native wrapper | PWA is ready sooner. | Recommendation: launch PWA first, then wrap after soft-launch feedback. |

## 9. Marketing plan

Domain and website:

- Buy a short, memorable domain such as `tuktalkthai.com` if available.
- Use the current landing page as the first website, with public Privacy, Terms, and Support pages.
- Primary positioning: "Practical Thai for real life in Thailand. Speak from day one."

Social accounts:

- Reserve TikTok, Instagram, YouTube Shorts, Facebook page, X, Reddit profile, and Quora profile.
- Use consistent handle and avatar.
- Post useful micro-lessons, not generic ads.

SEO/blog topics:

- "Thai phrases for ordering food in Thailand"
- "How to say hello politely in Thai"
- "Thai taxi phrases every visitor should know"
- "Thai tones explained for absolute beginners"
- "Male vs female polite particles in Thai"

Reddit/Quora plan:

- Answer real questions in Thailand, Thai language, expat, travel, and digital nomad communities.
- Provide value first: phrase breakdowns, cultural context, pronunciation tips.
- Link only when directly useful and allowed by community rules.

Meta ads first test:

- Wait until the landing page has analytics and the first lesson is stable.
- Start with $10-$20/day for 5-7 days.
- Test two audiences: Thailand travelers/expats and language learners interested in Thai.
- Optimize for landing-page signup or first lesson completion, not installs at first.

Landing page messaging:

- Lead with practical outcomes: food, taxis, prices, polite basics, help.
- Avoid unverifiable claims such as "fluent in X days."
- Show one real Thai phrase interaction above the fold.

Launch content calendar for first 7 days:

| Day | Content |
|---|---|
| Day 1 | Launch post: "Real Thai for real life in Thailand." |
| Day 2 | Food ordering phrase breakdown. |
| Day 3 | Taxi phrase carousel/video. |
| Day 4 | Thai politeness: `khrap` / `kha` basics. |
| Day 5 | Tone myth: why tones matter but should not stop you. |
| Day 6 | Founder build story and invite for testers. |
| Day 7 | User feedback request and "what should we add next?" |

Analytics needed:

- Landing visits.
- Signup started.
- Account created.
- Email confirmed.
- Placement completed.
- First lesson started/completed.
- Day-1 and day-7 return.
- Cards reviewed.
- Challenge completed.
- Push prompt shown/accepted/denied.
- Support/legal page visits.

## 10. Day-by-day sprint plan

| Day | Goal | Code tasks | Non-code tasks | Owner inputs needed |
|---|---|---|---|---|
| Today | Make web/PWA soft launch safe | No large code changes. Optionally update legal copy only after owner approval. | Buy/choose domain, choose support email, approve launch positioning, create reviewer/test accounts, run smoke test checklist. | Domain, support email, legal/business name, legal approval direction, test device. |
| Tomorrow | Prepare public launch assets | Only small P0/P1 fixes if approved: legal links, support link, broken copy, obvious mobile issues. | Capture screenshots, create social handles, draft 7 launch posts, write support/privacy/terms pages. | App icon preference, screenshots/device access, social handle preference. |
| Next day | Controlled soft launch | Fix only launch-blocking issues from smoke test. | Invite 10-25 trusted testers, collect feedback form, monitor Supabase/OneSignal/Vercel, post first content. | Tester list, native speaker availability, launch approval. |
| App submission day | Prepare native store submission, not public launch | Only wrapper/store-specific changes after explicit approval. | Create App Store Connect and Play Console apps, upload metadata/screenshots, complete privacy/data-safety/rating forms, provide test account. | Apple/Google developer account status, legal entity, support URL, pricing/monetization decision. |
| Launch day | Public web/PWA launch | Fix only urgent production issues. | Publish domain, post launch announcement, answer communities, collect support issues, watch activation metrics. | Go/no-go approval, support availability, social posting approval. |
| First week after launch | Learn from real usage | Triage P0 bugs only, then P1 retention improvements. | Review metrics daily, talk to users, collect phrase requests, prepare first content update. | Feedback review time, native speaker review, monetization decision after data. |

## 11. Owner inputs needed

The owner must provide exactly these inputs before launch planning can finish:

- Apple Developer account status.
- Google Play Developer account status.
- Whether the Google Play account is personal and whether it was created after 2023-11-13.
- Domain purchase decision.
- Legal/business name to display on legal pages and store listings.
- Support email.
- Privacy Policy approval.
- Terms of Service approval.
- App icon preference or final icon artwork.
- Screenshot/device sizes available for capture.
- Monetization decision for launch: free, founder waitlist, or paid.
- Pricing decision if any paid offer is approved.
- OneSignal test device and permission to send a controlled test notification.
- Native speaker review availability for launch-critical Thai content.
- Store category and target audience decision, including whether the app is intended for children.
- Public launch date and go/no-go owner.

## Sources checked

- Apple App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Apple App Store Connect app information and privacy policy URL requirements: https://developer.apple.com/help/app-store-connect/reference/app-information/
- Apple screenshot specifications: https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/
- Apple screenshots upload guidance: https://developer.apple.com/help/app-store-connect/manage-app-information/upload-app-previews-and-screenshots
- Google Play closed testing requirements: https://support.google.com/googleplay/android-developer/answer/14151465
- Google Play Data safety form: https://support.google.com/googleplay/android-developer/answer/10787469
- Google Play app review preparation and privacy policy guidance: https://support.google.com/googleplay/android-developer/answer/9859455
- Google Play preview asset requirements: https://support.google.com/googleplay/android-developer/answer/1078870
- Google Play content ratings: https://support.google.com/googleplay/android-developer/answer/9898843
- Google Play payments policy: https://support.google.com/googleplay/android-developer/answer/9858738
