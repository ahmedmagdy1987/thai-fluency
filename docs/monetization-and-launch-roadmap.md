# Monetization And Launch Roadmap

Date: 2026-05-16

This document is planning only. No payments, ads, database migrations, app-store packaging, or external marketing changes were implemented in this pass.

## What Is Safe To Implement Now

Safe now:

- Product copy and roadmap docs.
- Non-monetized settings and accessibility improvements.
- Local-only UI placeholders clearly marked as future features.
- Static entitlement design notes that do not block free learning.
- Content issue tracking and native-review workflow docs.
- Analytics planning, if no new SDK is added yet.

Not safe in this pass:

- Real subscriptions.
- Lifetime purchases.
- Super User plan.
- Ad SDKs.
- Paid card packs.
- App-store in-app purchases.
- Database migrations for entitlements.
- Server-side receipt validation.
- Any paywall that can block current learning paths without owner approval.

## Work That Requires DB, Payment, Or Ads Infrastructure

| Feature | Required Work | Notes |
|---|---|---|
| Yearly membership | Payment provider, subscription lifecycle, entitlement checks, invoices/taxes, cancellation handling. | Requires current research on Stripe, Apple, Google, and web checkout constraints. |
| Lifetime membership | One-time payment product, durable entitlement, restore flow. | Needs refund policy and entitlement precedence with subscriptions. |
| Super User plan | Plan definition, feature gates, pricing, and entitlement hierarchy. | Must be concrete before engineering starts. |
| Ad removal | Ads integration plus entitlement check to suppress ads. | Requires privacy/consent design before SDK work. |
| Gems/rewards/shop | Persistent balances, earn/spend rules, anti-abuse, support tooling. | Current shop should stay cosmetic until economy design is stable. |
| Paid card packs | Pack manifest, ownership model, content pipeline, native review, entitlement checks. | Avoid mixing paid content with core SRS until launch retention is proven. |
| Ads for free users | Ad SDK, placement policy, frequency caps, consent, performance testing. | Needs current SDK policy research and target geos. |
| Cross-promo banner | Placement, copy, destination URL, dismissal persistence, analytics. | Can be local-only first, but final copy and tracking rules are needed. |

## Risks

- Payments add compliance and support obligations: refunds, failed payments, restore purchases, taxes, account recovery.
- App-store rules can conflict with web payment flows, especially for digital content in native apps.
- Ads can hurt learning focus, retention, performance, and privacy posture.
- Paid packs can fragment the learning path if core free content is not clearly complete.
- Entitlement bugs can either leak paid content or block paying users.
- Premature monetization can obscure whether the core learning loop is working.
- Marketing before onboarding is stable can create churn that is hard to diagnose.

## Suggested Monetization Phases

Phase 0: Free learning loop
- Polish SRS, Challenge, characters, settings, and mobile experience.
- Add docs and content-review workflow.
- Validate retention before adding monetization.

Phase 1: Soft supporter tier
- Add a non-blocking supporter plan concept.
- Benefits should be cosmetic or convenience-based at first.
- Avoid blocking the core Stage 1 learning path.

Phase 2: Entitlements
- Add a DB-backed entitlement table.
- Add server-side checks for profile entitlements.
- Add a local fallback that does not crash the app if entitlement fetch fails.

Phase 3: Payments
- Add Stripe for web if policy review allows.
- If native apps are planned, research Apple/Google IAP requirements first.
- Implement receipt/webhook validation before showing paid status.

Phase 4: Paid packs
- Add a pack manifest and ownership checks.
- Keep pack content separate from core deck metadata.
- Add native-review signoff before any paid card pack ships.

Phase 5: Ads and ad removal
- Add ads only after the learning loop is healthy.
- Use frequency caps and avoid card-review interruptions.
- Offer ad removal through membership or one-time purchase.

## What Needs Current External Research Before Implementation

Research must be current at implementation time because policies and SDK terms change:

- Apple App Store rules for subscriptions, lifetime purchases, external links, and digital content.
- Google Play billing rules for subscriptions, one-time purchases, and external payment options.
- Stripe pricing, tax/VAT handling, customer portal, and subscription webhooks.
- AdMob or alternative ad network policies for education apps and child-directed content concerns.
- Privacy requirements for ads, analytics, push notifications, and speech recognition in target markets.
- Vercel/Supabase limits for expected traffic and webhook volume.
- Domain availability and social handle availability.
- Reddit, Quora, Meta, and other platform promotion rules.

## App Store Launch Checklist

Product readiness:

- Core SRS flow stable.
- Challenge flow safe and separate.
- Character and sound toggles available.
- Settings, privacy, and terms accessible.
- Content issues documented with a triage process.
- No known answer-leaking challenge behavior.

Technical readiness:

- Production build passes.
- PWA manifest and icons verified.
- Error logging plan defined.
- Account deletion/support flow defined.
- Push notification behavior tested or disabled.
- Offline behavior documented.
- App versioning and release notes process defined.

Store readiness:

- App name, subtitle, description, keywords.
- Screenshots for phone sizes.
- App icon and feature graphic.
- Privacy labels/data safety form.
- Support URL and marketing URL.
- Test account if required.
- Age rating questionnaire.
- Subscription/IAP metadata if monetized.

Soft launch:

- Limited geography or invite cohort.
- Track activation, day-1 retention, review completion, challenge completion, and sign-up conversion.
- Have a content fix process ready for post-launch updates.
- Avoid paid acquisition until onboarding and retention are acceptable.

## Marketing Notes

Domain:

- Secure a domain before public launch.
- Use a simple landing page with clear value proposition and app link.
- Avoid promises about fluency hours until the calculation is defined and defensible.

Social and community:

- Reserve brand handles.
- Build short clips around practical Thai scenarios.
- Reddit and Quora should focus on useful answers, not spammy promotion.
- Meta ads should wait for a clean onboarding funnel and basic retention data.

Cross-promo banner:

- Use low-frequency placement.
- Do not interrupt card reviews.
- Allow dismissal.
- Track impressions and clicks only after analytics/privacy review.
- Keep owner-supplied copy and destination URL in config.

## Recommended Next Implementation Phase

Build a static Stage 1 mini-unit pilot:

- Add a `miniUnits` data file referencing existing card IDs only.
- Add a guided UnitSession shell.
- Reuse existing Cards and Quiz behavior where possible.
- Add no migrations.
- Add no card content.
- Measure whether the 75/25 flow feels better before building monetization.
