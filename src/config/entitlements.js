// ─────────────────────────────────────────────────────────────────────────────
// CENTRAL PREMIUM ENTITLEMENT MODEL — the single source of truth for tiers, the
// free / premium / coming-soon feature catalog, plan + pricing config, entitlement
// checks, and upgrade-surface copy. Anything that GATES or ADVERTISES a premium
// feature should import from here, so there is exactly ONE place to change when
// real billing lands.
//
// HONESTY CONSTRAINT (do not violate):
//   • No real billing exists yet. No user is actually "Super" and NO premium
//     feature unlocks on payment. `tier` defaults to 'free' for everyone.
//   • Every premium feature below is status 'coming-soon' until it is actually
//     implemented. `canUseFeature()` returns false for a coming-soon feature even
//     for a (hypothetical) Super user, so we can NEVER gate real value behind an
//     unimplemented benefit or fake a delivered benefit.
//   • A real, server-authoritative entitlement (Supabase column + payment webhook)
//     is required before any paid benefit can be granted — see
//     docs/payment-readiness.md. Flip a feature to 'available' ONLY when shipped.
//   • Pricing is intentionally unset (null) → surfaces show "Pricing coming soon".
//     Fill real numbers in PLANS only once a provider + prices are decided.
// ─────────────────────────────────────────────────────────────────────────────

export const TIERS = { FREE: 'free', SUPER: 'super' };

// A feature is either shipped & usable now (AVAILABLE) or advertised-but-not-built
// (COMING_SOON). Coming-soon features must render as "Coming soon", never as a
// live benefit.
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

  // ---- SUPER: premium focus areas. All COMING SOON (not yet implemented) ----
  adFree:          { id: 'adFree',          name: 'Ad-free experience',                 access: TIERS.SUPER, status: FEATURE_STATUS.COMING_SOON, group: 'premium', upsell: 'Go ad-free with Super.' },
  enhancedReview:  { id: 'enhancedReview',  name: 'Enhanced practice & review tools',   access: TIERS.SUPER, status: FEATURE_STATUS.COMING_SOON, group: 'premium', upsell: 'Unlock deeper practice and review tools with Super.' },
  streakRecovery:  { id: 'streakRecovery',  name: 'Streak recovery',                    access: TIERS.SUPER, status: FEATURE_STATUS.COMING_SOON, group: 'premium', upsell: 'Recover a lost streak with Super.' },
  extraFlexibility:{ id: 'extraFlexibility',name: 'Extra daily flexibility & attempts', access: TIERS.SUPER, status: FEATURE_STATUS.COMING_SOON, group: 'premium', upsell: 'More daily flexibility and attempts with Super.' },
  bonusPacks:      { id: 'bonusPacks',      name: 'Bonus content packs',                access: TIERS.SUPER, status: FEATURE_STATUS.COMING_SOON, group: 'premium', upsell: 'Unlock bonus content packs with Super.' },
  datingRealTalk:  { id: 'datingRealTalk',  name: 'Dating & Real Talk Thai (18+)',      access: TIERS.SUPER, status: FEATURE_STATUS.COMING_SOON, group: 'premium', upsell: 'Dating & Real Talk Thai unlocks with Super.' },
};

// ─── Plans + pricing config (used by /plans and any upgrade surface) ─────────
// price is NULL until real numbers are decided → surfaces show "Pricing coming
// soon". Do NOT invent prices. `currency` is also TBD. Fill once a provider is
// chosen (see docs/payment-readiness.md).
export const PRICING_TBA = false; // real (beta/test) pricing is now supplied
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
    price: 4.99,            // beta/test price — change for launch
    period: 'month',
    cta: 'Get notified',
  },
  superYearly: {
    id: 'super-yearly',
    name: 'Super Yearly',
    tagline: 'Best value — pay once a year.',
    price: 39.99,           // beta/test price — change for launch
    period: 'year',
    cta: 'Get notified',
    badge: 'Best value',
  },
};

// ─── Upgrade-prompt copy (reason → message). Single home for upsell wording. ──
export const UPSELL_COPY = {
  'first-lesson': 'You finished your first guided lesson. Super will make the full path faster to explore when it opens.',
  mission:        'You completed a mission. Super will unlock more practice flexibility when it opens.',
  'mini-unit':    'You completed a guided mini-unit. Super will add more practice tools when it opens.',
  locked:         'This is part of the progressive path. Super will unlock some paths early when it opens.',
  dating:         'Dating & Real Talk Thai is a Super feature. It opens after native review when Super launches.',
  generic:        'Super adds an ad-free experience, enhanced practice tools, and bonus content when it opens.',
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
