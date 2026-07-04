// ─────────────────────────────────────────────────────────────────────────────
// CENTRAL PREMIUM ENTITLEMENT MODEL — the single source of truth for tiers, the
// free / Super feature catalog, plan + pricing config, entitlement checks, and
// upgrade-surface copy. Anything that GATES or ADVERTISES a Super feature should
// import from here, so there is exactly ONE place to change entitlements.
//
// BILLING IS LIVE (Stripe embedded checkout). Super is a real, purchasable
// subscription and `tier` is derived from a server-authoritative source
// (public.subscriptions.super_until, synced into stats.tier / stats.superUntil).
//
// HONESTY CONSTRAINT (do not violate):
//   • Gate ONLY what actually ships. The Dating & Real Talk (18+) section is the
//     Super-EXCLUSIVE benefit enforced today (status AVAILABLE, access super).
//   • Other Super benefits (ad-free, enhanced practice, recovery, flexibility,
//     bonus packs) are ADVERTISED on the plans page but NOT enforced yet — they
//     stay status 'coming-soon' so `canUseFeature()` never fake-gates real value
//     behind a benefit that isn't built. Flip a feature to 'available' when it
//     actually ships.
//   • Prices are real ($4.99/mo, $39.99/yr). Do not revert them to null.
// ─────────────────────────────────────────────────────────────────────────────

export const TIERS = { FREE: 'free', SUPER: 'super' };

// A feature is either shipped & usable now (AVAILABLE) or advertised-but-not-built
// (COMING_SOON). Coming-soon features are advertised on the plans page but must
// never be presented as a delivered benefit or used to gate real value.
export const FEATURE_STATUS = { AVAILABLE: 'available', COMING_SOON: 'coming-soon' };

// access: 'free' (never gated) | 'super' (premium). group: 'core' | 'premium'.
export const FEATURES = {
  // ---- FREE: the core learning path is free forever, all 8 stages included ----
  coreLearning:  { id: 'coreLearning',  name: 'All 8 learning stages',        access: TIERS.FREE, status: FEATURE_STATUS.AVAILABLE, group: 'core' },
  srsReviews:    { id: 'srsReviews',    name: 'Spaced-repetition reviews',    access: TIERS.FREE, status: FEATURE_STATUS.AVAILABLE, group: 'core' },
  guidedUnits:   { id: 'guidedUnits',   name: 'Guided missions & mini-units', access: TIERS.FREE, status: FEATURE_STATUS.AVAILABLE, group: 'core' },
  challenges:    { id: 'challenges',    name: 'Stage & tone challenges',      access: TIERS.FREE, status: FEATURE_STATUS.AVAILABLE, group: 'core' },
  guide:         { id: 'guide',         name: 'Pronunciation & culture guide', access: TIERS.FREE, status: FEATURE_STATUS.AVAILABLE, group: 'core' },
  streakFreeze:  { id: 'streakFreeze',  name: 'Auto streak freeze (weekly)',  access: TIERS.FREE, status: FEATURE_STATUS.AVAILABLE, group: 'core' },
  cloudSync:     { id: 'cloudSync',     name: 'Cloud sync across devices',    access: TIERS.FREE, status: FEATURE_STATUS.AVAILABLE, group: 'core' },

  // ---- SUPER: the Dating & Real Talk (18+) section is LIVE and Super-exclusive.
  //      The rest are advertised on the plans page but not enforced yet
  //      (COMING_SOON) so we never fake-gate a benefit that isn't built. ----
  datingRealTalk:  { id: 'datingRealTalk',  name: 'Dating & Real Talk Thai (18+)',      access: TIERS.SUPER, status: FEATURE_STATUS.AVAILABLE,   group: 'premium', upsell: 'Unlock Dating & Real Talk Thai (18+) with Super.' },
  adFree:          { id: 'adFree',          name: 'Ad-free experience',                 access: TIERS.SUPER, status: FEATURE_STATUS.COMING_SOON, group: 'premium', upsell: 'Go ad-free with Super.' },
  enhancedReview:  { id: 'enhancedReview',  name: 'Enhanced practice & review tools',   access: TIERS.SUPER, status: FEATURE_STATUS.COMING_SOON, group: 'premium', upsell: 'Unlock deeper practice and review tools with Super.' },
  streakRecovery:  { id: 'streakRecovery',  name: 'Streak recovery',                    access: TIERS.SUPER, status: FEATURE_STATUS.COMING_SOON, group: 'premium', upsell: 'Recover a lost streak with Super.' },
  extraFlexibility:{ id: 'extraFlexibility',name: 'Extra daily flexibility & attempts', access: TIERS.SUPER, status: FEATURE_STATUS.COMING_SOON, group: 'premium', upsell: 'More daily flexibility and attempts with Super.' },
  bonusPacks:      { id: 'bonusPacks',      name: 'Bonus content packs',                access: TIERS.SUPER, status: FEATURE_STATUS.COMING_SOON, group: 'premium', upsell: 'Unlock bonus content packs with Super.' },
};

// ─── Plans + pricing config (used by /plans and any upgrade surface) ─────────
// Prices are LIVE. Stripe embedded checkout is wired to these plans. Keep the
// amounts in sync with the Stripe products.
export const PRICING_TBA = false; // pricing is live
export const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    tagline: 'The full core course, forever.',
    price: 0,
    period: 'forever',
    cta: 'Start free',
  },
  superMonthly: {
    id: 'super-monthly',
    name: 'Super Monthly',
    tagline: 'Flexible month-to-month.',
    price: 4.99,
    period: 'month',
    cta: 'Go Super',
  },
  superYearly: {
    id: 'super-yearly',
    name: 'Super Yearly',
    tagline: 'Best value — pay once a year.',
    price: 39.99,
    period: 'year',
    cta: 'Go Super',
    badge: 'Best value',
  },
};

// ─── Upgrade-prompt copy (reason → message). Single home for upsell wording. ──
// Present-tense, live copy: Super is purchasable now, so nothing is framed as
// "coming soon" / "when it opens". The Dating section is the concrete, live
// Super-exclusive benefit; other benefits are described as part of the plan.
export const UPSELL_COPY = {
  'first-lesson': 'Nice — first lesson done. Go Super to unlock the 18+ Dating & Real Talk section and support new Thai content.',
  mission:        'Mission complete! Super unlocks the 18+ Dating & Real Talk section and helps fund more lessons.',
  'mini-unit':    'Mini-unit done. Super unlocks the 18+ Dating & Real Talk section and more as it ships.',
  locked:         'The full learning path is free. Super adds the 18+ Dating & Real Talk section and supports development.',
  dating:         'Dating & Real Talk Thai (18+) is a Super-exclusive section. Go Super to unlock it.',
  generic:        'Super unlocks the 18+ Dating & Real Talk section today, and adds an ad-free experience, enhanced practice and bonus content as they ship.',
};

// ─── Entitlement checks ──────────────────────────────────────────────────────
// Future: derive tier from a server-authoritative field (e.g. superUntil > now,
// synced from a payment webhook). Today every user resolves to FREE.
export function getTier(stats) {
  return stats && stats.tier === TIERS.SUPER ? TIERS.SUPER : TIERS.FREE;
}
export function isSuper(stats) {
  return getTier(stats) === TIERS.SUPER;
}

// Can the user USE this feature right now? Free → always. Super → only if the
// user is Super AND the feature is actually shipped. Coming-soon premium features
// therefore return false for everyone, so we never gate real value behind an
// unimplemented benefit.
export function canUseFeature(featureId, stats) {
  const f = FEATURES[featureId];
  if (!f) return false;
  if (f.access === TIERS.FREE) return f.status === FEATURE_STATUS.AVAILABLE;
  return isSuper(stats) && f.status === FEATURE_STATUS.AVAILABLE;
}

export function isComingSoon(featureId) {
  const f = FEATURES[featureId];
  return !!f && f.status === FEATURE_STATUS.COMING_SOON;
}

export function getUpsellCopy(reason) {
  return UPSELL_COPY[reason] || UPSELL_COPY.generic;
}

export function listFeatures(group) {
  return Object.values(FEATURES).filter(f => !group || f.group === group);
}
export const FREE_FEATURES = listFeatures('core');
export const PREMIUM_FEATURES = listFeatures('premium');
