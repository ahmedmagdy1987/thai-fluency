# Data Safety and Privacy Checklist - Tuk Talk Thai

> Status: DRAFT checklist for owner and developer review. It is derived from the
> current code and project docs to help fill the Google Play Data Safety form and
> the Apple App Privacy labels. This is not legal advice and is not a privacy
> policy. Do not publish any of it without your own review. Do not invent claims;
> verify the items marked VERIFY before submission.

Status legend:
- **[CONFIRMED]** observed in code or project docs
- **[VERIFY]** owner or developer must confirm before declaring
- **[NOT YET]** not implemented in the current build

## Permissions (Android)
- **[CONFIRMED]** The Android manifest declares only `INTERNET`. No location,
  camera, microphone, contacts, storage, or phone permissions are requested.

## Data categories

### Account / contact info
- Email address: **[CONFIRMED]** collected for account creation and sign-in via
  Supabase authentication. Linked to the user identity. Required only if the user
  creates an account; a demo path is available without one.
- Name / phone / address: **[NOT YET]** not collected.

### Learning progress and app activity
- Progress data: **[CONFIRMED]** XP, streak, completed mini-units, challenge
  aggregates, daily XP, and related fields sync for signed-in users (project docs:
  `user_stats`, `user_progress`, `profiles.settings`). Linked to identity.
- App settings / preferences: **[CONFIRMED]** learning mode, audio rate, auto-play,
  sound effects, show-characters, theme, voice, and daily goal sync for signed-in
  users.
- For anonymous users: **[CONFIRMED per docs]** progress is held locally and
  auto-syncs only when a signed-in cloud account is empty.

### Device / push identifiers
- Push notification token (OneSignal): **[CONFIRMED present]** the app integrates
  OneSignal; a push subscription identifier exists only if the user enables
  notifications. Optional. **[VERIFY]** exact identifier type stored and whether it
  is linked to the account.

### Usage analytics / crash reporting
- **[VERIFY]** No analytics or crash-reporting SDK was found in the audit and none
  is documented. Confirm whether any such SDK is present before declaring "no
  analytics." Do not claim analytics that do not exist, and do not omit one that
  does.

### Support / feedback
- Feedback and support: **[CONFIRMED per docs]** handled by opening an email draft
  to `support@tuktalkthai.com`. **[CONFIRMED]** no in-app storage of feedback was
  added. Email content then lives in the owner-controlled support mailbox.

### Location, contacts, media, financial data
- **[NOT YET]** none collected. No location, no contacts, no photos or media, no
  financial or payment data.

## Monetization and third parties
- Ads: **[NOT YET]** no ads are shown and no ad SDK is integrated.
- Payments / subscriptions: **[NOT YET]** Super (premium) is shown as coming soon
  with no checkout, no billing, and no paid entitlement. Do not declare in-app
  purchases until real billing exists.
- Data sale: **[CONFIRMED per docs]** no data is sold to third parties.
- Service providers in use: **[CONFIRMED]** Supabase (auth, database) and OneSignal
  (push, only when enabled). **[VERIFY]** list these as data processors and confirm
  their roles in your privacy policy.

## Data handling
- In transit: **[VERIFY]** data is sent to Supabase and OneSignal over HTTPS by
  design; confirm there are no plaintext endpoints.
- At rest: **[VERIFY]** managed by Supabase and OneSignal; declare per their terms.
- Row-level security: **[CONFIRMED per docs]** user data tables use own-row RLS
  policies.
- Retention: **[VERIFY]** define how long account and progress data is kept.

## User controls
- Account deletion: **[CONFIRMED]** a manual deletion request flow exists at
  `/delete-account`. **[NOT YET]** automated in-app one-tap deletion is still
  planned. Both stores require a working deletion path; confirm the manual flow is
  monitored and responsive before launch.
- Data access / export: **[VERIFY]** confirm whether users can request a copy of
  their data and how.
- Notification opt-in: **[CONFIRMED per docs]** push requires explicit user opt-in.

## Pre-submission verification list (owner)
1. Confirm or rule out any analytics / crash SDK, then declare accordingly.
2. Confirm OneSignal token handling and link-to-identity status.
3. Confirm HTTPS-only transport for all endpoints.
4. Confirm data retention windows for account and progress data.
5. Confirm the `/delete-account` flow is live and the support mailbox is monitored.
6. Map each [CONFIRMED] item to a line in the published privacy policy.
7. Keep the Data Safety form and the App Privacy labels consistent with each other
   and with the privacy policy.
