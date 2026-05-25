# Tuk Talk Thai Monetization Launch Options

Date: 2026-05-25

This document is strategy only. No payments, subscriptions, ads, entitlements, database migrations, or app-store products were implemented.

## Recommended launch monetization strategy

Recommended: **launch the web/PWA soft launch free, with optional non-blocking founder interest capture only after the user has completed the first lesson.**

Do not enable:

- Paid subscriptions.
- Ads.
- Ad removal.
- Paid packs.
- Hard paywalls.
- In-app purchase products.
- Gems or heart purchases.

Reason:

The app has a strong learning foundation, but monetization infrastructure is not ready. Current Shop, hearts, gems, leaderboard, and rewards surfaces are previews. Adding real money now would require entitlements, store billing, refund/support workflows, privacy/terms changes, analytics, and QA. That work would slow launch and add avoidable risk.

## Pros and cons of launching free

Pros:

- Fastest launch path.
- Lowest app-store and legal complexity.
- Best for learning whether onboarding and retention work.
- Reduces support burden.
- Avoids negative first impressions from a paywall before the user trusts the product.
- Lets the owner gather testimonials, phrase requests, and retention data.

Cons:

- No immediate revenue.
- Users may expect the app to stay free.
- Harder to validate willingness to pay without asking directly.
- Founder/lifetime offer urgency is delayed.

Best use:

- First 1-2 weeks of soft launch.
- Invite cohort, PWA launch, social/community launch, and retention validation.

## Pros and cons of paid from day one

Pros:

- Immediate revenue test.
- Filters for serious learners.
- Creates business discipline around value.
- Founder/lifetime offer can create early cash if demand exists.

Cons:

- Requires clear premium value that is not currently implemented.
- Requires billing, entitlements, restore purchases, refund policy, cancellation support, and tax/compliance decisions.
- Native iOS and Android digital content sales generally require Apple In-App Purchase and Google Play Billing when sold inside the app.
- Early paywalls can reduce activation before the product has trust.
- Ads and tracking introduce additional privacy and performance risk.
- Entitlement bugs can block paying users or leak paid benefits.

Best use:

- After soft-launch data shows users complete onboarding, return, and ask for more guided units.

## What premium features are currently available

Current features that could support premium value later:

- Large card library: 4,791 cards across 8 stages.
- Guided first lesson.
- SRS review loop.
- Challenge mode.
- Stage path and Stage 1 missions.
- Characters and coach moments.
- XP, streaks, daily goals, achievements.
- Quests scaffold.
- Shop scaffold.
- Push notification infrastructure.
- Cloud sync.
- Male/female perspective and learning mode settings.

Important: these are not currently separated into free vs premium entitlements.

## What premium features are missing

Missing before paid monetization:

- Entitlement table or provider-backed entitlement source.
- Purchase provider integration.
- Apple StoreKit products for iOS.
- Google Play Billing products for Android.
- Stripe or another checkout path for web, if web monetization is approved.
- Restore purchases.
- Subscription status sync.
- Refund and cancellation support.
- Pricing page and subscription terms.
- Account deletion/export paths aligned with legal copy.
- Premium feature gates.
- Durable paid-pack ownership.
- Admin/support view for paid users.
- Analytics for conversion and retention.
- Premium QA test matrix.

## Suggested phase 1, phase 2, phase 3 monetization roadmap

### Phase 1: Free launch plus demand validation

Goal:

- Validate activation and retention before charging.

What to do:

- Launch free PWA.
- Add optional founder/supporter interest capture only after first lesson completion.
- Ask users what they would pay for: more guided units, offline packs, native audio, travel pack, business Thai, no ads, or lifetime access.
- Track first lesson completion, day-1 return, and day-7 return.

Do not do:

- Payments.
- Ads.
- Store subscriptions.
- Hard paywalls.

### Phase 2: Soft premium concept

Goal:

- Define paid value without blocking the core path.

Possible premium value:

- Full guided unit path beyond Stage 1.
- Native speaker audio packs.
- Travel survival pack.
- Business/admin Thai pack.
- Offline/downloadable practice mode.
- Advanced review stats.
- Supporter badge or cosmetic character skins.

Engineering needed:

- Entitlement model.
- Feature gate map.
- Legal terms update.
- Pricing decision.
- Support workflow.
- Analytics approval.

### Phase 3: Real payments

Goal:

- Collect money safely and policy-compliantly.

Web/PWA path:

- Stripe checkout or another web billing provider, if approved.
- Webhook-backed entitlement updates.
- Customer portal for cancellation.
- Refund workflow.

iOS path:

- StoreKit products/subscriptions.
- App Store Connect IAP metadata.
- Restore purchases.
- Subscription terms and review notes.

Android path:

- Google Play Billing products/subscriptions.
- Play Console product metadata.
- Restore/entitlement sync.
- Closed testing if required by account status.

Recommended first paid product:

- A simple annual supporter/premium plan after there is enough guided content to justify it.

Alternative:

- A one-time founding lifetime pass on web only, after legal and entitlement details are ready.

Not recommended yet:

- Ads from day one.
- Hearts-for-money.
- Paywalling the first lesson.
- Selling paid packs before content review and ownership logic exist.

## Decision rule

Enable paid monetization only when all are true:

- At least 100 real users have tried the first lesson or a strong invite cohort has completed it.
- First lesson completion is healthy.
- Users return after day one.
- The owner has selected pricing and refund policy.
- Legal pages cover paid features.
- Entitlements and restore paths are implemented and tested.
- Native-store billing requirements are understood for each platform being shipped.
