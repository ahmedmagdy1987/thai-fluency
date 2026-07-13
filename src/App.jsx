import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';

import { CARDS } from './data/cards.js';
import { ACHIEVEMENTS, XP_REWARDS, DEFAULT_DAILY_GOAL } from './data/gamification.js';

import { reviewCard, getStats, DAY_MS } from './lib/srs.js';
import { loadState, saveState, clearState, loadRushGuard, saveRushGuard, loadReviewXpDay, saveReviewXpDay } from './lib/storage.js';
import { DEFAULT_VOICE, DEFAULT_VIEW_MODE, DEFAULT_CARD_DIRECTION } from './lib/voice.js';
import { DEFAULT_AUDIO_RATE, BEGINNER_AUDIO_RATE, setPreferredVoiceGender } from './lib/audio.js';
import { getStageState, getMissionState, checkAchievements } from './lib/state.js';
import { DEFAULT_STATS, dateKeyFromValue, getLocalDateKey, hasStatsLearningActivity, migrateStats, previousLocalDateKey, startStudyDay, computeStreak } from './lib/stats.js';
import { evaluateDailyQuests } from './lib/dailyQuests.js';
import { trackEvent, ANALYTICS_EVENTS } from './lib/analytics.js';
import {
  QUEST_CELEBRATIONS,
  questCelebrationId,
  allQuestsCelebrationId,
  allQuestsComplete,
  stageCompleteCelebrationId,
  challengePerfectCelebrationId,
  challengeRewardId,
  challengeGemsId,
  toneQuizRewardId,
  superCtaId,
  hasCelebrated,
  withCelebrated,
  activeCelebrationIds,
  courseCompleteCelebrationId,
} from './lib/celebrations.js';
import { getCourseCompletion } from './lib/courseCompletion.js';
import { isSuper } from './config/entitlements.js';
import {
  effectiveHearts,
  spendHeart,
  refillHeartsWithGems,
  awardGems,
  GEMS_PER_MISSION,
  GEMS_PER_CHALLENGE_PASS,
  GEMS_PER_DAILY_GOAL,
} from './lib/economy.js';
import { resolveCoachIdForStage } from './data/stageCharacters.js';
import { getStageCinematic } from './data/stageCinematics.js';
import { setSoundEffectsEnabled } from './lib/sounds.js';
import { MISSIONS } from './data/taxonomy.js';
import { supabase, hasSupabaseConfig } from './lib/supabase.js';
import { getCapturedAuthError, hadRecoveryTokens, friendlyAuthErrorMessage, stripAuthErrorParams } from './lib/authCallback.js';
import { awardReward, serverRewardsActive, REWARD_EVENTS, rewardKeys } from './lib/serverRewards.js';
import { resetUserScopedRefs, claimCloudInit, releaseCloudInit, shouldWipeLocalOnIdentityChange, canWriteProfileSettings } from './lib/sessionLocks.js';
import {
  hasOneSignalConfig,
  initOneSignal,
  setExternalUserId,
  clearExternalUserId,
  getPushSubscription,
  onSubscriptionChange,
  promptForPushPermission,
  detectTimezone,
} from './lib/onesignal.js';
import {
  uploadProgress,
  uploadStats,
  uploadAchievements,
  uploadFullState,
  downloadProgress,
  downloadStats,
  downloadAchievements,
  downloadEntitlement,
  updateProfile,
} from './lib/cloudStorage.js';
import { mergeProgress, mergeStats, mergeCloudSettings } from './lib/progressMerge.js';

import AppShell from './components/AppShell.jsx';
import LearnPath from './components/LearnPath.jsx';
import ShopScreen from './components/ShopScreen.jsx';
import QuestsScreen from './components/QuestsScreen.jsx';
import LeaderboardScreen from './components/LeaderboardScreen.jsx';
import TodayTab from './components/TodayTab.jsx';
import CardsTab from './components/CardsTab.jsx';
import BrowseTab from './components/BrowseTab.jsx';
import QuizTab from './components/QuizTab.jsx';
import GuideTab from './components/GuideTab.jsx';
import AchievementUnlockedModal from './components/AchievementUnlockedModal.jsx';
import QuestCompleteToast from './components/QuestCompleteToast.jsx';
import CelebrationOverlay from './components/CelebrationOverlay.jsx';
import MissionCompleteRewardScreen from './components/MissionCompleteRewardScreen.jsx';
import GuidedTutorial from './components/GuidedTutorial.jsx';
import StageCinematicOverlay from './components/StageCinematicOverlay.jsx';
import Stage1CompleteCelebration from './components/Stage1CompleteCelebration.jsx';
import PlacementOnboarding from './components/PlacementOnboarding.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import PublicLanding from './components/PublicLanding.jsx';
import AuthGate from './components/auth/AuthGate.jsx';
import AuthLinkNotice from './components/auth/AuthLinkNotice.jsx';
import AppBootScreen from './components/AppBootScreen.jsx';
import PendingConfirmation from './components/auth/PendingConfirmation.jsx';
import ResetPassword from './components/auth/ResetPassword.jsx';
import SuperActivationNotice from './components/SuperActivationNotice.jsx';
import DemoMode from './components/DemoMode.jsx';
import ProfilePage from './components/ProfilePage.jsx';
import PublicInfoPage from './components/legal/PublicInfoPage.jsx';
import PlansPage from './components/PlansPage.jsx';
import MiniUnitFlow from './components/MiniUnitFlow.jsx';
import FirstLessonFlow from './components/FirstLessonFlow.jsx';
import SuperUpgradePrompt from './components/SuperUpgradePrompt.jsx';
import DatingSection from './components/DatingSection.jsx';
import { getMiniUnit, getMiniUnitsForStage, MINI_UNITS, STAGE_1_MINI_UNIT_PILOT } from './data/miniUnits.js';
import { initNativeUi } from './lib/native.js';

// First-run coach-mark tutorial steps. Each targets a real [data-tutorial=...]
// control in the live UI; copy is short and plain. Shown once automatically on
// the Learn screen; replayable from Settings.
const TUTORIAL_STEPS = [
  { target: '[data-tutorial="stats"]', title: 'Your stats', body: 'Up here are your Hearts, Gems, Streak, and XP. They track your daily progress as you learn.' },
  { target: '[data-tutorial="path"]', title: 'Your learning path', body: 'This shows your current stage and the next lesson in your path. Tap it any time to jump back in.' },
  { target: '[data-tutorial="nav-learn"]', title: 'Learn', body: 'Learn is home base. Start new guided lessons and follow your stage-by-stage path here.' },
  { target: '[data-tutorial="nav-cards"]', title: 'Practice', body: 'Practice your due cards here. Reviews come back at the right time so words really stick.' },
  { target: '[data-tutorial="nav-quiz"]', title: 'Challenge, Quests & more', body: 'Take quick Challenges, complete daily Quests, and find your Profile and Settings in the navigation. You are all set — enjoy learning!' },
];

const CLOUD_PROFILE_SETTING_KEYS = [
  'viewMode',
  'cardDirection',
  'audioRate',
  'audioAutoPlay',
  'showCharacters',
  'soundEffects',
  'theme',
  'voice',
  'firstLessonCompleted',
  'firstLessonProgress',
  'activeMiniUnitId',
  'miniUnitProgress',
  'completedMiniUnits',
  'builderRewardedUnits',
  'superPromptLastShownAt',
  'celebratedIds',
  'celebrationBaselineDone',
  'tutorialSeen',
  'cinematicsWatched',
];
const FIRST_LESSON_REWARD_XP = 60;
const MISSION_REWARD_XP = 35;
const MINI_UNIT_REWARD_XP = 45;
const MINI_UNIT_BUILDER_XP = 5;
// One-time bonus for finishing every guided mini-unit across all 8 stages.
// Granted once, guarded by the durable course-complete celebration ledger ID.
const COURSE_COMPLETE_XP = 250;
// Anti-rushing thresholds. We track a "rush run": consecutive high-value
// (Good/Easy) ratings entered faster than RUSH_GAP_MS apart — i.e. with no
// time to actually recall the card. Once the run exceeds RUSH_RUN_LIMIT, XP
// for those ratings is capped at RUSH_XP_CAP so XP/progression can't be farmed
// by spamming Easy. The run (and the timestamp of the last rating) is PERSISTED
// in localStorage so the cap survives refresh, route changes, and immediately
// leaving/returning to Practice — closing the leave/re-enter farm loop.
//
// Recovery, so honest users are never punished forever:
//   - Idle ≥ RUSH_COOLDOWN_MS (10 min) since the last rating → run resets to 0.
//   - An engaged-pace rating (slower than RUSH_GAP_MS) decays the run by 1.
//   - An Again/Hard rating (genuine struggle) decays the run by 2.
// The run is ceilinged at RUSH_RUN_CEIL so even a heavy spammer recovers after
// a few honest ratings rather than being stuck until the cooldown.
const RUSH_GAP_MS = 1300;
const RUSH_RUN_LIMIT = 5;
const RUSH_RUN_CEIL = RUSH_RUN_LIMIT + 3; // 8 — bounded so recovery isn't endless
const RUSH_XP_CAP = 1;
const RUSH_COOLDOWN_MS = 10 * 60 * 1000;  // 10 min idle resets the rush guard
const SUPER_PROMPT_STORAGE_KEY = 'tuk-talk-thai-super-prompt-last-shown';
// Durable one-shot guard for the high-intent push-permission ask fired right
// after the first lesson. Persisted (not just the per-session ref) so we never
// nag a returning user twice, even across reloads or new sessions.
const PUSH_PROMPT_STORAGE_KEY = 'tuk-talk-thai-push-prompt-fired';
const TAB_ROUTES = {
  learn: '/learn',
  today: '/today',
  cards: '/cards',
  browse: '/browse',
  quiz: '/challenge',
  guide: '/guide',
  quests: '/quests',
  shop: '/shop',
  leaderboard: '/leaderboard',
  dating: '/dating',
};
const ROUTE_TABS = {
  '/': 'learn',
  '/learn': 'learn',
  '/today': 'today',
  '/cards': 'cards',
  '/browse': 'browse',
  '/challenge': 'quiz',
  '/quiz': 'quiz',
  '/guide': 'guide',
  '/quests': 'quests',
  '/shop': 'shop',
  '/leaderboard': 'leaderboard',
  '/dating': 'dating',
};
const AUTH_ROUTES = {
  '/welcome': 'welcome',
  '/sign-in': 'signin',
};
const PUBLIC_PAGE_ROUTES = {
  '/privacy': 'privacy',
  '/terms': 'terms',
  '/support': 'support',
  '/feedback': 'feedback',
  '/plans': 'plans',
  // Legacy alias: old links/bookmarks to /premium now show the LIVE plans page
  // (Super is a real, purchasable subscription — there is no separate coming-soon
  // premium page anymore).
  '/premium': 'plans',
  '/delete-account': 'delete-account',
};

function normalizePathname(pathname = '/') {
  const withoutTrailingSlash = pathname.replace(/\/+$/, '');
  return withoutTrailingSlash || '/';
}

function getRouteForPath(pathname) {
  const path = normalizePathname(pathname);
  if (ROUTE_TABS[path]) return { type: 'tab', tab: ROUTE_TABS[path], path };
  if (path === '/profile') return { type: 'profile', path };
  if (path === '/settings') return { type: 'settings', path };
  if (path === '/get-started') return { type: 'landing', path };
  if (path === '/demo') return { type: 'demo', path };
  // Password-recovery landing: the redirectTo of the reset email (see
  // ForgotPassword.jsx / ResetPassword.jsx).
  if (path === '/reset-password') return { type: 'reset-password', path };
  if (PUBLIC_PAGE_ROUTES[path]) return { type: 'public', page: PUBLIC_PAGE_ROUTES[path], path };
  if (AUTH_ROUTES[path]) return { type: 'auth', authScreen: AUTH_ROUTES[path], path };
  return { type: 'tab', tab: 'learn', path: '/learn', unknown: true };
}

function getCurrentRoute() {
  if (typeof window === 'undefined') return { type: 'tab', tab: 'learn', path: '/' };
  return getRouteForPath(window.location.pathname);
}

function routePathForTab(tab) {
  return TAB_ROUTES[tab] || '/learn';
}

function writeRoute(path, { replace = false } = {}) {
  if (typeof window === 'undefined') return;
  const current = normalizePathname(window.location.pathname);
  if (current === path) return;
  const method = replace ? 'replaceState' : 'pushState';
  window.history[method]({ tukTalkRoute: true }, '', path);
}

function pickCloudProfileSettings(settings) {
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) return {};
  return CLOUD_PROFILE_SETTING_KEYS.reduce((picked, key) => {
    if (Object.prototype.hasOwnProperty.call(settings, key)) picked[key] = settings[key];
    return picked;
  }, {});
}

function getLocalSuperPromptDate() {
  try {
    return localStorage.getItem(SUPER_PROMPT_STORAGE_KEY);
  } catch {
    return null;
  }
}

function setLocalSuperPromptDate(value) {
  try {
    localStorage.setItem(SUPER_PROMPT_STORAGE_KEY, value);
  } catch {
    /* ignore */
  }
}

function hasFiredPushPrompt() {
  try {
    return localStorage.getItem(PUSH_PROMPT_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function markPushPromptFired() {
  try {
    localStorage.setItem(PUSH_PROMPT_STORAGE_KEY, 'true');
  } catch {
    /* ignore */
  }
}

export default function TukTalkThaiApp() {
  const initialRoute = getCurrentRoute();
  const [tab, setTab] = useState(() => initialRoute.tab || 'learn');
  const [progress, setProgress] = useState({});
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [loaded, setLoaded] = useState(false);
  const [achievementToast, setAchievementToast] = useState(null);
  const [achievementQueue, setAchievementQueue] = useState([]);
  // Celebration feedback: a single Level-3 overlay descriptor at a time, plus a
  // queue of Level-1 quest toasts. See the celebration effect below.
  const [celebration, setCelebration] = useState(null);
  const [questToasts, setQuestToasts] = useState([]);
  const [showSettings, setShowSettings] = useState(() => initialRoute.type === 'settings');
  const [showProfile, setShowProfile] = useState(() => initialRoute.type === 'profile');
  const [publicPage, setPublicPage] = useState(() => initialRoute.type === 'public' ? initialRoute.page : null);
  const [showStage1Celebration, setShowStage1Celebration] = useState(false);
  const [activeMiniUnitId, setActiveMiniUnitId] = useState(null);
  const [cardSession, setCardSession] = useState(null);
  const [showFirstLessonUnlock, setShowFirstLessonUnlock] = useState(false);
  const [rewardScreen, setRewardScreen] = useState(null);
  // Stage-completion cinematic overlay ({ stageId, courseComplete }). Purely
  // visual; gated by stats.cinematicsWatched so it never replays or grants XP.
  const [stageCinematic, setStageCinematic] = useState(null);
  const [upgradePrompt, setUpgradePrompt] = useState(null);
  // Undo snapshot of the most recent review — per-user attempt state, written
  // and consumed by reviewOne/undo below, cleared on identity change so user B
  // can never "undo" user A's review into their own progress.
  const [lastReviewSnapshot, setLastReviewSnapshot] = useState(null);

  // Auth state. Anonymous access is gated to a 5-card demo (DemoMode); the
  // only paths to the full app are sign-in or sign-up.
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authReady, setAuthReady] = useState(!hasSupabaseConfig);
  const [demoMode, setDemoMode] = useState(() => {
    if (initialRoute.type === 'demo') return true;
    try { return localStorage.getItem('tuk-talk-thai-demo-mode') === 'true'; }
    catch { return false; }
  });
  const [forceAuthGate, setForceAuthGate] = useState(() => initialRoute.type === 'auth');
  const [showPublicLanding, setShowPublicLanding] = useState(() => {
    if (initialRoute.type === 'public' || initialRoute.type === 'demo') return false;
    try { return localStorage.getItem('tuk-talk-thai-demo-mode') !== 'true'; }
    catch { return true; }
  });
  const [authInitialScreen, setAuthInitialScreen] = useState(() => initialRoute.authScreen || 'welcome');
  // Password-recovery flow: true while the /reset-password screen should render.
  // Set by landing on /reset-password or by Supabase's PASSWORD_RECOVERY event.
  const [passwordRecovery, setPasswordRecovery] = useState(() => initialRoute.type === 'reset-password');
  // True only when THIS page load arrived via a real recovery link (captured at
  // module-import time, or via the PASSWORD_RECOVERY event). Gates the
  // set-new-password form so a plain signed-in visit to /reset-password can't
  // change the password without a real emailed link.
  const recoveryEvidenceRef = useRef(hadRecoveryTokens());
  // Expired/invalid email-link error captured from the callback URL before
  // supabase-js could strip it. Surfaced via AuthLinkNotice / ResetPassword.
  const [authCallbackError, setAuthCallbackError] = useState(() => getCapturedAuthError());
  // Post-checkout activation state: null | { status: 'pending' | 'slow' }.
  // Drives the "Activating your Super…" toast while the checkout-return effect
  // polls the webhook-written entitlement (see SuperActivationNotice.jsx).
  const [superActivation, setSuperActivation] = useState(null);
  const [cloudReady, setCloudReady] = useState(false);     // true once cloud has been synced into local state
  const [profileChecked, setProfileChecked] = useState(!hasSupabaseConfig); // true after profile fetch resolves (skipped if no Supabase)
  const cloudSyncTimer = useRef(null);
  const cloudInitClaimRef = useRef(null);                   // user-scoped cloud-init claim (see sessionLocks.js)
  const cloudReadyRef = useRef(false);                      // mirrors cloudReady for the identity-change wipe check
  const prevUserIdRef = useRef(undefined);                  // previous authenticated user id, for identity-change detection
  const oneSignalLinked = useRef(false);                    // guards setExternalUserId from firing repeatedly
  const notificationPromptFired = useRef(false);            // ensures we ask permission at most once per session
  const superSuccessHandled = useRef(false);                // handles the ?super=success return at most once
  const profileSettingsRef = useRef({});
  const celebrationsArmedRef = useRef(false);               // celebrations fire only after the first settled pass (baseline)
  const courseCompleteAtArmingRef = useRef(false);          // true if the course was ALREADY complete at baseline → never retro-celebrate
  const reviewLocksRef = useRef(new Set());
  const missionRewardLocksRef = useRef(new Set());
  const achievementLocksRef = useRef(new Set());
  // Persisted anti-rush guard: { rushRun, lastRatingAt }. Lazily hydrated once
  // from localStorage so the cap survives refresh / route changes / re-entry.
  const rushGuardRef = useRef(null);
  if (rushGuardRef.current === null) rushGuardRef.current = loadRushGuard();
  // Persisted per-card daily review-XP guard: a card pays review XP at most once
  // per local day so re-rating the same card (e.g. "Again") can't farm XP. In
  // memory we keep ids as a Set for O(1) checks; persisted as a plain array.
  const reviewXpDayRef = useRef(null);
  if (reviewXpDayRef.current === null) {
    const loaded = loadReviewXpDay();
    reviewXpDayRef.current = { date: loaded.date, ids: new Set(loaded.ids) };
  }

  useEffect(() => {
    profileSettingsRef.current = (profile?.settings && typeof profile.settings === 'object' && !Array.isArray(profile.settings))
      ? profile.settings
      : {};
  }, [profile?.settings]);

  useEffect(() => {
    (async () => {
      const saved = await loadState();
      if (saved) {
        const savedProgress = saved.progress || {};
        const savedStats = migrateStats(saved.stats || {});
        if (Object.keys(savedProgress).length > 0) savedStats.firstLessonCompleted = true;
        setProgress(savedProgress);
        setStats(savedStats);
      }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    setSoundEffectsEnabled(stats.soundEffects !== false);
  }, [stats.soundEffects]);

  // Supabase session detection
  useEffect(() => {
    if (!hasSupabaseConfig) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session || null);
      setAuthReady(true);
    }).catch(() => setAuthReady(true));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      // A recovery link signs the user in and fires PASSWORD_RECOVERY. Route
      // them to the set-new-password screen — this event is the authoritative
      // recovery evidence (covers links whose redirectTo landed elsewhere).
      if (event === 'PASSWORD_RECOVERY') {
        recoveryEvidenceRef.current = true;
        setPasswordRecovery(true);
        writeRoute('/reset-password', { replace: true });
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Session isolation: whenever the authenticated user id changes — including
  // → null on sign-out and → a new id when a different user signs in in the same
  // tab — clear every user-scoped in-memory ref so the next user can never
  // inherit the previous user's reward/mission/achievement locks or baseline-
  // arming state. Single centralized reset (see lib/sessionLocks.js). Fires on
  // real identity changes only, so anonymous local state is untouched; persisted
  // device-scoped anti-farm guards (rush / per-day review XP) are deliberately
  // left intact. celebrationsArmedRef → false re-seeds the celebration baseline
  // for the new user (the arming effect runs again once their cloud state loads).
  useEffect(() => {
    const nextUserId = session?.user?.id || null;
    const prevUserId = prevUserIdRef.current;
    prevUserIdRef.current = nextUserId;
    // Identity-change local wipe (M2): if a signed-in user whose CLOUD data was
    // loaded is replaced by a DIFFERENT identity (or none) without handleSignOut
    // running — token revocation, refresh failure, remote sign-out — the departed
    // user's cloud-loaded progress is still in memory/localStorage. Left there, the
    // next sign-in's empty-cloud auto-upload could SEED it into the new account, or
    // it would sync under the new id. Wipe it here so the next user starts from
    // their own cloud only. The cloudReady gate on the cloud-init effect defers that
    // init until after this wipe (cloudReady is cleared below). Never fires for
    // anonymous/unconfirmed sessions (cloudReady is false for them), so anonymous
    // local study is preserved for its own sign-in merge.
    if (shouldWipeLocalOnIdentityChange(prevUserId, nextUserId, cloudReadyRef.current)) {
      clearState().catch(() => { /* best effort */ });
      setProgress({});
      setStats(DEFAULT_STATS);
      setCloudReady(false);
    }
    resetUserScopedRefs({
      reviewLocksRef,
      missionRewardLocksRef,
      achievementLocksRef,
      celebrationsArmedRef,
      courseCompleteAtArmingRef,
      superSuccessHandledRef: superSuccessHandled,
      oneSignalLinkedRef: oneSignalLinked,
      notificationPromptFiredRef: notificationPromptFired,
      profileSettingsRef,
      cloudInitClaimRef,
    });
    // Per-user attempt/undo/overlay state must not cross identities either: a
    // stale undo snapshot could splice user A's card state (and its XP delta)
    // into user B's progress, a stale card session could resume A's mission
    // queue, and a stale reward/celebration overlay would replay A's moment to
    // B. All of these are already null/empty on the happy paths (overlays
    // dismissed, handleSignOut clears the card session), so these are no-ops
    // unless something survived an identity change.
    setLastReviewSnapshot(null);
    setCardSession(null);
    setRewardScreen(null);
    setCelebration(null);
    setQuestToasts([]);
    setAchievementToast(null);
    setAchievementQueue([]);
    setStageCinematic(null);
    setUpgradePrompt(null);
    setShowFirstLessonUnlock(false);
    setShowStage1Celebration(false);
    setSuperActivation(null);
    // A captured email-link error describes the page load it arrived on; it
    // must not resurface for a different identity (or after sign-out) later in
    // a long-lived tab. Only on a REAL identity change — this effect also runs
    // once on mount (prevUserId === undefined), where clearing would wipe the
    // just-captured error before the anonymous user ever sees the notice.
    if (prevUserId !== undefined && prevUserId !== nextUserId) {
      setAuthCallbackError(null);
    }
  }, [session?.user?.id]);

  // Mirror cloudReady into a ref so the identity-change effect above can read the
  // DEPARTING session's cloud-loaded state without adding cloudReady to its deps
  // (which would re-run the reset on every cloud-init completion).
  useEffect(() => { cloudReadyRef.current = cloudReady; }, [cloudReady]);

  const applyRouteState = useCallback((route) => {
    setActiveMiniUnitId(null);
    setCardSession(null);

    // Only /reset-password shows the password-recovery screen; navigating
    // anywhere else always leaves it.
    setPasswordRecovery(route.type === 'reset-password');

    // The demo is the only route that turns demo mode ON; every other route
    // turns it OFF, so a browser/mobile Back out of /demo cleanly exits the demo.
    setDemoMode(route.type === 'demo');
    try {
      if (route.type === 'demo') localStorage.setItem('tuk-talk-thai-demo-mode', 'true');
      else localStorage.removeItem('tuk-talk-thai-demo-mode');
    } catch { /* ignore */ }

    if (route.type === 'demo') {
      setPublicPage(null);
      setForceAuthGate(false);
      setShowPublicLanding(false);
      setShowProfile(false);
      setShowSettings(false);
      return;
    }

    if (route.type === 'public') {
      setPublicPage(route.page);
      setShowProfile(false);
      setShowSettings(false);
      setForceAuthGate(false);
      setShowPublicLanding(false);
      return;
    }

    if (route.type === 'reset-password') {
      setPublicPage(null);
      setForceAuthGate(false);
      setShowPublicLanding(false);
      setShowProfile(false);
      setShowSettings(false);
      return;
    }

    setPublicPage(null);

    if (route.type === 'tab') {
      setTab(route.tab);
      setShowProfile(false);
      setShowSettings(false);
      setForceAuthGate(false);
      setShowPublicLanding(true);
      return;
    }

    if (route.type === 'profile') {
      setShowProfile(true);
      setShowSettings(false);
      setForceAuthGate(false);
      setShowPublicLanding(true);
      return;
    }

    if (route.type === 'settings') {
      setShowSettings(true);
      setShowProfile(false);
      setForceAuthGate(false);
      setShowPublicLanding(true);
      return;
    }

    if (route.type === 'auth') {
      setAuthInitialScreen(route.authScreen || 'welcome');
      setForceAuthGate(true);
      setShowPublicLanding(false);
      setShowProfile(false);
      setShowSettings(false);
      return;
    }

    if (route.type === 'landing') {
      setShowPublicLanding(true);
      setForceAuthGate(false);
      setShowProfile(false);
      setShowSettings(false);
    }
  }, []);

  const handleNavigatePath = useCallback((path, options = {}) => {
    const route = getRouteForPath(path);
    writeRoute(route.path, { replace: !!options.replace });
    applyRouteState(route);
  }, [applyRouteState]);

  useEffect(() => {
    const applyRouteFromLocation = () => {
      const route = getCurrentRoute();
      if (route.unknown) writeRoute(route.path, { replace: true });
      applyRouteState(route);
    };

    window.addEventListener('popstate', applyRouteFromLocation);
    return () => window.removeEventListener('popstate', applyRouteFromLocation);
  }, [applyRouteState]);

  useEffect(() => {
    if (!authReady) return;
    const route = getCurrentRoute();
    if (route.unknown) writeRoute(route.path, { replace: true });
    if (session && (route.type === 'auth' || route.type === 'landing' || route.type === 'demo')) {
      setTab('learn');
      setShowProfile(false);
      setShowSettings(false);
      setForceAuthGate(false);
      setShowPublicLanding(false);
      writeRoute('/learn', { replace: true });
    }
  }, [authReady, session?.user?.id]);

  // Load profile when session changes. Three things happen here:
  // 1. display_name backfill: if the profile row's display_name is empty but
  //    user_metadata has one (happens after email-confirmation signup, where
  //    SignUp couldn't write to profiles before the session existed), copy it.
  // 2. onboarding_completed sync (cloud → local): if cloud says the user has
  //    onboarded on any device, set local stats.hasOnboarded = true. This
  //    fixes the cross-device bug where users re-saw placement onboarding.
  // 3. profileChecked flag: gates the onboarding render decision so we don't
  //    flash placement onboarding before the cloud check completes.
  useEffect(() => {
    if (!session || !hasSupabaseConfig) {
      setProfile(null);
      setProfileChecked(true);
      return;
    }
    if (!session.user?.email_confirmed_at) {
      setProfile(null);
      setProfileChecked(true);
      return;
    }
    setProfileChecked(false);
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        if (cancelled) return;
        if (data) {
          const applyProfileSettings = (profileData) => {
            const cloudSettings = pickCloudProfileSettings(profileData?.settings);
            if (!Object.prototype.hasOwnProperty.call(cloudSettings, 'voice') && profileData?.selected_voice) {
              cloudSettings.voice = profileData.selected_voice;
            }
            if (Object.keys(cloudSettings).length > 0) {
              // mergeCloudSettings unions the learning ledgers (completedMiniUnits,
              // builderRewardedUnits, celebratedIds, cinematicsWatched) and ORs the
              // once-true flags, so a stale cloud settings blob can never un-complete
              // a lesson or re-fire a celebration after a cross-device sign-in.
              // UI preferences remain account-synced (cloud wins). See progressMerge.js.
              setStats(s => migrateStats({ ...s, ...mergeCloudSettings(s, cloudSettings) }));
            }
          };
          // (1) display_name backfill
          const metaName = session.user.user_metadata?.display_name;
          if (!data.display_name && metaName) {
            const trimmed = String(metaName).trim();
            await supabase.from('profiles').update({ display_name: trimmed }).eq('id', session.user.id);
            if (cancelled) return;
            const nextProfile = { ...data, display_name: trimmed };
            setProfile(nextProfile);
            applyProfileSettings(nextProfile);
          } else {
            setProfile(data);
            applyProfileSettings(data);
          }
          // (2) onboarding_completed sync: cloud → local
          if (data.onboarding_completed) {
            setStats(s => s.hasOnboarded ? s : { ...s, hasOnboarded: true });
          }
        }
      } finally {
        if (!cancelled) setProfileChecked(true);
      }
    })();
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  // Wire the native status bar / safe-area once on mount. No-op on web/PWA.
  useEffect(() => { initNativeUi(); }, []);

  // Make light/dark switching feel instant: briefly suppress transitions on the
  // whole tree during the flip so no button or card recolors a beat late.
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const el = document.documentElement;
    // Mirror the theme onto <html> so the page (html/body) background matches in
    // dark mode — otherwise the light-cream body shows through during mobile
    // overscroll and behind safe-area insets. The app's real theming still lives
    // on .app-root; this only drives the outermost background.
    el.setAttribute('data-theme', stats.theme || 'light');
    el.classList.add('theme-switching');
    const t = setTimeout(() => el.classList.remove('theme-switching'), 140);
    return () => clearTimeout(t);
  }, [stats.theme]);

  const startDemo = useCallback(() => {
    // Push a dedicated /demo history entry ON TOP of the current screen (the
    // /welcome auth gate the demo is launched from) without touching the entries
    // beneath it. Browser/mobile Back then returns to /welcome, then /get-started,
    // preserving the real journey; the popstate -> applyRouteState path turns demo
    // mode off on the way out. The visible "Back to home" still jumps straight to
    // the landing via handleExitDemo.
    writeRoute('/demo');
    applyRouteState(getRouteForPath('/demo'));
  }, [applyRouteState]);

  const handleDemoSignUp = useCallback(() => {
    setAuthInitialScreen('signup');
    setForceAuthGate(true);
    setShowPublicLanding(false);
    setPublicPage(null);
    writeRoute('/welcome');
  }, []);

  const handleDemoSignIn = useCallback(() => {
    setAuthInitialScreen('signin');
    setForceAuthGate(true);
    setShowPublicLanding(false);
    setPublicPage(null);
    writeRoute('/sign-in');
  }, []);

  // Leave the demo and return to the public landing/home page without a refresh.
  const handleExitDemo = useCallback(() => {
    try { localStorage.removeItem('tuk-talk-thai-demo-mode'); } catch { /* ignore */ }
    setDemoMode(false);
    setForceAuthGate(false);
    setShowPublicLanding(true);
    setPublicPage(null);
    writeRoute('/get-started', { replace: true });
  }, []);

  const handleAuthSuccess = useCallback(() => {
    setForceAuthGate(false);
    setAuthInitialScreen('welcome');
    // Demo flags become irrelevant once signed in; clear them so a future
    // sign-out lands the user back on the welcome screen, not the demo.
    try {
      localStorage.removeItem('tuk-talk-thai-demo-mode');
      localStorage.removeItem('tuk-talk-thai-demo-idx');
    } catch { /* ignore */ }
    setDemoMode(false);
    // onAuthStateChange fires and updates session; cloud sync effect runs next.
  }, []);

  const openAuthGate = useCallback((screen = 'welcome') => {
    setAuthInitialScreen(screen);
    setShowPublicLanding(false);
    setShowProfile(false);
    setShowSettings(false);
    setPublicPage(null);
    setPasswordRecovery(false);
    setForceAuthGate(true);
    // 'forgot' lives inside the sign-in flow, so it shares the /sign-in URL.
    writeRoute(screen === 'signin' || screen === 'forgot' ? '/sign-in' : '/welcome');
  }, []);

  // AuthLinkNotice actions (expired/invalid email-link errors — see
  // lib/authCallback.js). Dismissing consumes the error and cleans the URL.
  const dismissAuthCallbackError = useCallback(() => {
    setAuthCallbackError(null);
    stripAuthErrorParams();
  }, []);
  const handleAuthErrorSignIn = useCallback(() => {
    dismissAuthCallbackError();
    openAuthGate('signin');
  }, [dismissAuthCallbackError, openAuthGate]);
  const handleAuthErrorRequestReset = useCallback(() => {
    dismissAuthCallbackError();
    openAuthGate('forgot');
  }, [dismissAuthCallbackError, openAuthGate]);

  // Password reset finished (or the reset screen was reached without recovery
  // evidence): leave the recovery UI and land in the app / on the landing page.
  const handleResetPasswordComplete = useCallback(() => {
    setPasswordRecovery(false);
    handleNavigatePath('/learn', { replace: true });
  }, [handleNavigatePath]);

  const handleSignOut = useCallback(async () => {
    if (!hasSupabaseConfig) return;
    // Unlink OneSignal first so a future sign-in re-links cleanly.
    if (hasOneSignalConfig) {
      try { await clearExternalUserId(); } catch { /* ignore */ }
      oneSignalLinked.current = false;
    }
    await supabase.auth.signOut();
    setProfile(null);
    setCloudReady(false);
    // Server-of-truth: this device is no longer authorized. Wipe local cache
    // so the next session starts clean from the cloud (or from a fresh demo).
    await clearState();
    try {
      localStorage.removeItem('tuk-talk-thai-demo-mode');
      localStorage.removeItem('tuk-talk-thai-demo-idx');
    } catch { /* ignore */ }
    setProgress({});
    setStats(DEFAULT_STATS);
    setDemoMode(false);
    setForceAuthGate(false);
    setShowPublicLanding(true);
    setAuthInitialScreen('welcome');
    setShowProfile(false);
    setShowSettings(false);
    setPublicPage(null);
    setCardSession(null);
    writeRoute('/get-started', { replace: true });
    notificationPromptFired.current = false;
  }, []);

  // Cloud init: when a user is signed in AND email-confirmed, automatically
  // uploads local-only progress only when the cloud is empty; otherwise the
  // cloud remains the source of truth. No blocking migration prompt.
  useEffect(() => {
    if (!session || !loaded || cloudReady || !hasSupabaseConfig) return;
    if (!session.user?.email_confirmed_at) return;
    // User-scoped in-flight guard: a stale init from a previous user can never
    // block this user's init (the old boolean did). claimCloudInit returns null
    // only when THIS user's init is already running.
    const claim = claimCloudInit(cloudInitClaimRef, session.user.id);
    if (!claim) return;
    let cancelled = false;
    (async () => {
      try {
        const cloudProgress = await downloadProgress(session.user.id);
        const safeCloudProgress = cloudProgress && typeof cloudProgress === 'object' ? cloudProgress : {};
        const safeLocalProgress = progress && typeof progress === 'object' ? progress : {};
        const cloudHasData = Object.keys(safeCloudProgress).length > 0;
        const localHasData = Object.keys(safeLocalProgress).length > 0;
        const [cloudStatsData, cloudAchs, entitlement] = await Promise.all([
          downloadStats(session.user.id),
          downloadAchievements(session.user.id),
          // Server-authoritative Super entitlement (public.subscriptions). Null-safe:
          // resolves to the free tier on failure so a subscriptions read never blocks
          // sign-in. Merged into stats.tier / stats.superUntil, which entitlements.js
          // reads via getTier()/isSuper().
          downloadEntitlement(session.user.id).catch(() => ({ tier: 'free', superUntil: null, cancelAtPeriodEnd: false })),
        ]);
        if (cancelled) return;
        // Merge server-authoritative entitlement into stats: tier + superUntil
        // drive isSuper(); cancelAtPeriodEnd drives the plan-row "canceled but
        // active until <date>" vs "renews on <date>" states in Settings/Profile.
        const ent = {
          tier: entitlement?.tier || 'free',
          superUntil: entitlement?.superUntil || null,
          cancelAtPeriodEnd: !!entitlement?.cancelAtPeriodEnd,
        };
        const cloudHasState = cloudHasData || hasStatsLearningActivity(cloudStatsData || {}) || (cloudAchs && cloudAchs.length > 0);
        if (localHasData && !cloudHasState) {
          await uploadFullState(session.user.id, safeLocalProgress, stats);
          if (!cancelled) {
            setStats(s => ({ ...s, ...ent }));
            setCloudReady(true);
          }
        } else {
          // M2 merge: never REPLACE local state with cloud — combine both so
          // anonymous/offline learning is preserved on sign-in. Progress is a
          // per-card SRS merge (union of cards, monotonic review/lapse counts, no
          // un-graduation); stats keep cloud XP/streak/currency/date authority
          // while unioning ledgers and taking max of monotonic display counters.
          // Neither step grants a reward or replays XP. Entitlement (`ent`) is
          // applied last and is the ONLY source of tier/Super. See lib/progressMerge.js.
          setProgress(p => mergeProgress(p, safeCloudProgress));
          setStats(s => {
            const merged = mergeStats(s, cloudStatsData || {});
            return migrateStats({
              ...s,
              ...merged,
              ...ent,
              // Lessons are "started" if EITHER side shows learning activity.
              firstLessonCompleted: !!(s.firstLessonCompleted || cloudHasData || (cloudStatsData && cloudStatsData.firstLessonCompleted)),
              // Union achievements from the separate user_achievements table too.
              unlockedAchievements: [...new Set([...(merged.unlockedAchievements || []), ...(cloudAchs || [])])],
            });
          });
          setCloudReady(true);
        }
      } catch (e) {
        console.warn('[App] cloud init failed', e);
        // Fall back to local-only mode; user can retry by signing out and back in.
        if (!cancelled) setCloudReady(true);
      } finally {
        // Identity-checked release: a stale init finishing late can never free a
        // newer user's claim (releaseCloudInit is a no-op unless this is still the
        // live claim).
        releaseCloudInit(cloudInitClaimRef, claim);
      }
    })();
    return () => { cancelled = true; };
  }, [session, loaded, cloudReady]);

  // Periodic cloud sync: debounced uploads of progress + stats + achievements
  // whenever local state changes. Only fires after cloud init has resolved
  // (which itself only fires for email-confirmed users).
  useEffect(() => {
    if (!session || !cloudReady || !loaded || !hasSupabaseConfig) return;
    if (!session.user?.email_confirmed_at) return;
    if (cloudSyncTimer.current) clearTimeout(cloudSyncTimer.current);
    cloudSyncTimer.current = setTimeout(async () => {
      try {
        await uploadProgress(session.user.id, progress);
        await uploadStats(session.user.id, stats);
        const achs = stats.unlockedAchievements || [];
        if (achs.length > 0) await uploadAchievements(session.user.id, achs);
      } catch (e) {
        console.warn('[App] cloud sync failed', e);
      }
    }, 2500);
    return () => { if (cloudSyncTimer.current) clearTimeout(cloudSyncTimer.current); };
  }, [progress, stats, session, cloudReady, loaded]);

  useEffect(() => {
    if (loaded && !demoMode) saveState({ progress, stats });
  }, [progress, stats, loaded, demoMode]);

  useEffect(() => {
    if (!loaded) return;
    const today = getLocalDateKey();
    if (stats.todayDate !== today) {
      setStats(s => ({ ...s, todayXp: 0, todayDate: today }));
    }
  }, [loaded, stats.todayDate]);

  useEffect(() => {
    if (!loaded) return;
    const now = Date.now();
    const last = stats.lastFreezeGrant ? new Date(stats.lastFreezeGrant).getTime() : 0;
    if ((stats.streak >= 7) && (now - last >= 7 * DAY_MS) && (stats.streakFreezes || 0) < 2) {
      setStats(s => ({ ...s, streakFreezes: (s.streakFreezes || 0) + 1, lastFreezeGrant: new Date().toISOString() }));
    }
  }, [stats.streak, loaded]);

  const stageState = useMemo(() => loaded ? getStageState(stats, progress) : null, [stats, progress, loaded]);
  const missionState = useMemo(() => loaded ? getMissionState(progress) : null, [progress, loaded]);

  useEffect(() => {
    if (!loaded || !stageState) return;
    if (stageState.currentStage > (stats.currentStage || 1)) {
      // Keep stats.currentStage in sync with the unlocked frontier. The
      // stage-complete celebration itself is handled by the celebration effect
      // below (CelebrationOverlay), so no separate stage-up toast fires here.
      setStats(s => ({ ...s, currentStage: stageState.currentStage }));
    }
  }, [stageState, loaded]);

  // Email confirmation gate: a session whose user has not confirmed their
  // email must NOT be treated as fully authenticated, regardless of what
  // Supabase returned. Defense in depth for the "anyone can sign up with
  // a fake email" attack — even if Supabase mis-issues a session, the
  // client refuses to render the main app.
  //
  // MUST be declared above the useEffects below that reference it in their
  // dep arrays — dep arrays are evaluated immediately and `const` hoists to
  // TDZ, so a later declaration crashes the whole render at module init.
  const isEmailConfirmed = !!(session?.user?.email_confirmed_at);

  // ── Stripe checkout return (?super=success) ──────────────────────────────
  // After embedded checkout completes, Stripe returns the user to
  // origin?super=success&session_id=… . The Super entitlement itself is written
  // server-side by the Stripe webhook into public.subscriptions. Because the
  // webhook can land a few seconds AFTER the redirect, a single read here used
  // to race it — a paying user would silently stay on the free tier until the
  // next reload. Now we show an "Activating your Super…" toast and poll the
  // entitlement with bounded retries (~30s); on success we celebrate, on
  // timeout we show a calm "taking longer than usual" note (the payment has
  // already succeeded — the next full load re-reads the entitlement anyway).
  // Client-side polling only; the webhook remains the sole entitlement writer.
  // Runs at most once per load; needs a confirmed session to read the
  // (RLS-guarded) subscriptions row.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (superSuccessHandled.current) return undefined;
    const params = new URLSearchParams(window.location.search);
    if (params.get('super') !== 'success') return undefined;
    if (!session || !isEmailConfirmed || !hasSupabaseConfig) return undefined; // wait until we can read the row
    // Wait for cloud init to finish first: it reads the entitlement ONCE at its
    // start and applies it last into setStats — if that (possibly pre-webhook,
    // stale-'free') read were applied AFTER this poll found 'super', it would
    // clobber the fresh tier. Deferring the poll until cloudReady makes the
    // poll's write unconditionally the later one. Cloud-init failure still
    // sets cloudReady, so the poll can never deadlock behind it.
    if (!cloudReady) return undefined;
    superSuccessHandled.current = true;
    let cancelled = false;

    const stripParams = () => {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('super');
        url.searchParams.delete('session_id');
        window.history.replaceState({ ...(window.history.state || {}) }, '', url.pathname + url.search + url.hash);
      } catch { /* ignore */ }
    };

    const SUPER_POLL_INTERVAL_MS = 2000;
    const SUPER_POLL_MAX_ATTEMPTS = 15; // ≈30s including request time
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    (async () => {
      let becameSuper = false;
      setSuperActivation({ status: 'pending' });
      for (let attempt = 0; attempt < SUPER_POLL_MAX_ATTEMPTS && !cancelled; attempt++) {
        try {
          const ent = await downloadEntitlement(session.user.id);
          if (ent && ent.tier === 'super') {
            if (!cancelled) {
              setStats(s => ({ ...s, tier: 'super', superUntil: ent.superUntil || null, cancelAtPeriodEnd: !!ent.cancelAtPeriodEnd }));
            }
            becameSuper = true;
            break;
          }
        } catch (e) {
          // Transient read failure — keep polling; the webhook may still land.
          console.warn('[App] entitlement poll after checkout failed', e);
        }
        if (attempt < SUPER_POLL_MAX_ATTEMPTS - 1) await sleep(SUPER_POLL_INTERVAL_MS);
      }
      if (cancelled) return;
      setSuperActivation(becameSuper ? null : { status: 'slow' });
      if (becameSuper) {
        // Funnel: server-confirmed Super after the checkout return. Fired once
        // (the handler is guarded by superSuccessHandled). Safe/non-PII.
        trackEvent(ANALYTICS_EVENTS.SUBSCRIPTION_ACTIVATED, {});
        setCelebration({
          eyebrow: 'Welcome to Super',
          title: 'You’re now Super! 🎉',
          // Name the LIVE benefits so the payer knows what they just unlocked
          // (both are enforced today: Dating gate + effectiveHearts → ∞).
          subtitle: 'Your Super plan is active — the 18+ Dating & Real Talk section and unlimited hearts are unlocked. Thank you for supporting Tuk Talk Thai!',
          primaryLabel: 'Let’s go',
          onPrimary: () => setCelebration(null),
        });
        try {
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification('Welcome to Super! 🎉', {
              body: 'Your Super plan is active — Dating & Real Talk and unlimited hearts are unlocked. Thank you for supporting Tuk Talk Thai!',
            });
          }
        } catch { /* ignore */ }
      }
      stripParams();
    })();

    return () => { cancelled = true; };
  }, [session?.user?.id, isEmailConfirmed, cloudReady]);

  // OneSignal: link the device subscription to the Supabase user once the
  // user is signed in and confirmed. Persist the player_id + timezone on
  // profiles so the server-side worker can target this device by Supabase
  // user_id. Also subscribes to subscription-change events to keep the
  // stored player_id current if it rotates.
  useEffect(() => {
    if (!session || !isEmailConfirmed || !hasOneSignalConfig || !hasSupabaseConfig) return;
    if (oneSignalLinked.current) return;
    oneSignalLinked.current = true;
    let cancelled = false;
    let unsubChange = () => {};
    (async () => {
      try {
        await initOneSignal();
        await setExternalUserId(session.user.id);
        const sub = await getPushSubscription();
        if (cancelled) return;
        // Persist subscription ID + timezone on the profile (best-effort).
        const tz = detectTimezone();
        const patch = {};
        if (sub.id && sub.id !== profile?.onesignal_player_id) patch.onesignal_player_id = sub.id;
        if (tz && tz !== profile?.timezone) patch.timezone = tz;
        if (Object.keys(patch).length > 0) {
          await supabase.from('profiles').update(patch).eq('id', session.user.id);
        }
        unsubChange = await onSubscriptionChange(async (s) => {
          if (cancelled) return;
          if (s.id && s.id !== profile?.onesignal_player_id) {
            try {
              await supabase.from('profiles').update({ onesignal_player_id: s.id }).eq('id', session.user.id);
            } catch { /* ignore */ }
          }
        });
      } catch (e) {
        console.warn('[App] OneSignal link failed', e);
      }
    })();
    return () => { cancelled = true; unsubChange(); };
  }, [session?.user?.id, isEmailConfirmed, profile?.onesignal_player_id, profile?.timezone]);

  // Smart permission prompt: ask AFTER the user has completed placement
  // onboarding (so it doesn't fire on first visit while they're still
  // figuring out the app). Fires at most once per session via a ref guard AND a
  // durable flag, so it never double-nags alongside the post-first-lesson ask.
  useEffect(() => {
    if (!session || !isEmailConfirmed || !hasOneSignalConfig || !stats.hasOnboarded) return;
    if (notificationPromptFired.current || hasFiredPushPrompt()) return;
    if (profile?.onesignal_player_id) return; // already subscribed
    notificationPromptFired.current = true;
    markPushPromptFired();
    // Tiny delay so the user lands on the main app first, then sees the prompt.
    const t = setTimeout(async () => {
      try {
        const sub = await getPushSubscription();
        if (sub.permission === 'granted' || sub.permission === 'denied') return;
        await promptForPushPermission();
      } catch { /* ignore */ }
    }, 2500);
    return () => clearTimeout(t);
  }, [session?.user?.id, isEmailConfirmed, stats.hasOnboarded, profile?.onesignal_player_id]);

  const grantXp = useCallback((amount) => {
    setStats(s => {
      const today = getLocalDateKey();
      // Streak rollover keys on lastStudy, NOT todayDate. The day-rollover effect
      // pre-sets todayDate = today on load (to zero todayXp) before the user
      // studies, so a todayDate check would read false on the normal "reopen the
      // next day" flow and the streak would never increment or reset. lastStudy
      // (the last day XP was actually earned) is not touched by that effect, so
      // it correctly identifies the first study action of a new day. Logic lives
      // in the pure computeStreak (unit-tested by check-quest-logic.mjs).
      const yesterday = previousLocalDateKey();
      const { streak: newStreak, usedFreeze } = computeStreak(s, today, yesterday);
      const next = startStudyDay(s, today, newStreak, amount, usedFreeze);
      // Daily-goal gems: startStudyDay increments dailyGoalsHit exactly when the
      // day's XP first crosses the goal. Award modest gems at that same moment
      // (self-limiting — it only rises once per day since todayXp stays ≥ goal).
      if ((next.dailyGoalsHit || 0) > (s.dailyGoalsHit || 0)) {
        return { ...next, ...awardGems(next, GEMS_PER_DAILY_GOAL) };
      }
      return next;
    });
  }, []);

  // Server-authoritative reward dispatch (Migration 006, staged rollout). For a
  // signed-in, confirmed user the award_reward RPC is the reward AUTHORITY:
  //   • 'awarded'   → apply the SERVER-clamped XP locally (streak / today-XP /
  //                   total-XP bookkeeping; 006B not applied yet, so uploadStats
  //                   still persists total_xp, and using the server amount keeps
  //                   client == server). The client never chooses the amount.
  //   • 'duplicate' → grant NOTHING (idempotent across refresh / double-click /
  //                   tabs / retries / devices via the stable event key).
  //   • unavailable → documented TEMPORARY fallback to the existing local grant.
  //   • rejected    → invalid / unauthorized / unknown event → NO reward, NO
  //                   fallback (can't farm by inducing an error).
  // Anonymous / unconfigured users always use the local path. `localXp` is the
  // already client-gated amount; 0-XP events (achievement / stage) just record the
  // server event.
  const awardXp = useCallback((eventType, eventKey, localXp, payload = {}) => {
    if (!serverRewardsActive(session, isEmailConfirmed, hasSupabaseConfig)) {
      if (localXp > 0) grantXp(localXp);
      return;
    }
    awardReward(eventType, eventKey, { ...payload, local_date: getLocalDateKey() })
      .then(res => {
        if (res.ok) {
          if (res.status === 'awarded' && res.xpAwarded > 0) grantXp(res.xpAwarded);
        } else if (res.unavailable) {
          if (localXp > 0) grantXp(localXp);   // transition-only fallback
        }
        // res.rejected → no reward, no fallback.
      })
      .catch(() => { if (localXp > 0) grantXp(localXp); });
  }, [session, isEmailConfirmed, grantXp]);

  // Record one or more celebration IDs as seen (localStorage via saveState;
  // cloud via the sync effect below). Pruned + idempotent. No external deps so
  // it stays stable and TDZ-safe for early callers like recordQuizComplete.
  const markCelebrated = useCallback((idOrIds) => {
    setStats(s => {
      const next = withCelebrated(s.celebratedIds, idOrIds, getLocalDateKey(), previousLocalDateKey());
      return next === s.celebratedIds ? s : { ...s, celebratedIds: next };
    });
  }, []);

  // Mirror the celebration ledger into profiles.settings so it dedups across
  // devices. Decoupled from updateSettings (no extra setStats churn); loop-safe
  // via the profileSettingsRef reference check.
  useEffect(() => {
    if (!loaded || !session || !isEmailConfirmed || !hasSupabaseConfig) return;
    // Never write before the profile fetch has resolved AND belongs to the
    // CURRENT session user: profileSettingsRef is {} until then, and
    // updateProfile replaces the whole settings blob, so an early write would
    // wipe every synced setting (cardDirection, viewMode, completedMiniUnits,
    // ...). profileChecked alone is not enough — on a same-tab user switch
    // there is one commit where session is already the new user while
    // profileChecked is still stale-true from the previous user (or from the
    // sign-out null-branch), which without the identity check would overwrite
    // the new user's cloud settings with an empty/previous-user ledger.
    if (!canWriteProfileSettings(session.user?.id, profile?.id, profileChecked)) return;
    const prev = profileSettingsRef.current || {};
    if (prev.celebratedIds === stats.celebratedIds && prev.celebrationBaselineDone === stats.celebrationBaselineDone) return;
    const nextSettings = {
      ...prev,
      celebratedIds: stats.celebratedIds,
      celebrationBaselineDone: stats.celebrationBaselineDone,
    };
    profileSettingsRef.current = nextSettings;
    setProfile(p => (p ? { ...p, settings: nextSettings } : p));
    updateProfile(session.user.id, { settings: nextSettings }).catch(e => {
      console.warn('[App] failed to sync celebration ledger to cloud', e);
    });
  }, [stats.celebratedIds, stats.celebrationBaselineDone, loaded, session, isEmailConfirmed, profileChecked, profile?.id]);

  // Mission advancement: when currentMission increases past lastSeenMission,
  // celebrate the mission that just finished. The "just finished" mission is
  // currentMission - 1 (or M6 if everything is done).
  useEffect(() => {
    if (!loaded || !missionState) return;
    const lastSeen = stats.lastSeenMission || 1;
    const cur = missionState.stage1Complete ? MISSIONS.length + 1 : missionState.currentMission;
    if (cur > lastSeen) {
      // Mission(s) finished in between. Reward the one that just completed.
      const justFinished = MISSIONS.find(m => m.id === cur - 1);
      if (justFinished) {
        const rewardKey = `mission:${justFinished.id}`;
        if (!missionRewardLocksRef.current.has(rewardKey)) {
          missionRewardLocksRef.current.add(rewardKey);
          awardXp(REWARD_EVENTS.MISSION_COMPLETED, rewardKeys.mission(1, justFinished.id), MISSION_REWARD_XP);
          // Gems reward, at the same moment XP is granted. Guarded by the same
          // per-mission lock so a refresh / double-fire can't farm gems.
          setStats(s => ({ ...s, ...awardGems(s, GEMS_PER_MISSION) }));
          setRewardScreen({
            id: `mission-${justFinished.id}-${Date.now()}`,
            title: `Mission ${justFinished.id} Complete`,
            subtitle: justFinished.celebration,
            xpEarned: MISSION_REWARD_XP,
            streak: stats.streak || 0,
            nextStep: cur > MISSIONS.length ? 'Stage 2' : `Mission ${cur}`,
            superPromptReason: 'mission',
          });
        }
      }
      setStats(s => ({ ...s, lastSeenMission: cur }));
      // Record completion in user_missions so the database webhook can
      // fan out a milestone notification via the send-notification Edge
      // Function. Best-effort; failure is silent.
      if (session && hasSupabaseConfig && session.user?.email_confirmed_at && cur > 1) {
        supabase.from('user_missions').upsert({
          user_id: session.user.id,
          stage: 1, // S1 missions for now; multi-stage missions are future work
          mission: cur - 1,
          completed: true,
          completed_at: new Date().toISOString(),
        }, { onConflict: 'user_id,stage,mission' }).then(({ error }) => {
          if (error) console.warn('[App] failed to record mission completion', error);
        });
      }
    }
  }, [missionState, loaded, stats.lastSeenMission, stats.streak, awardXp, session]);

  // Stage 1 complete: one-time big celebration. Reveals the full deck.
  useEffect(() => {
    if (!loaded || !missionState) return;
    if (missionState.stage1Complete && !stats.stage1CelebrationShown) {
      setShowStage1Celebration(true);
      setStats(s => ({ ...s, stage1CelebrationShown: true }));
    }
  }, [missionState, loaded, stats.stage1CelebrationShown]);

  useEffect(() => {
    if (!loaded) return;
    const unlocked = checkAchievements(stats, progress).filter(a => a.unlocked).map(a => a.id);
    const newly = unlocked.filter(id => !(stats.unlockedAchievements || []).includes(id) && !achievementLocksRef.current.has(id));
    if (newly.length > 0) {
      newly.forEach(id => achievementLocksRef.current.add(id));
      // Record each new achievement unlock server-side (idempotent; 0 XP).
      newly.forEach(id => awardXp(REWARD_EVENTS.ACHIEVEMENT_UNLOCKED, rewardKeys.achievement(id), 0));
      const newAchievements = newly.map(id => ACHIEVEMENTS.find(a => a.id === id)).filter(Boolean);
      // Show the first one immediately, queue the rest
      setAchievementToast(prev => prev || newAchievements[0]);
      if (newAchievements.length > 1) {
        setAchievementQueue(q => [...q, ...newAchievements.slice(1)]);
      }
      setStats(s => ({ ...s, unlockedAchievements: unlocked }));
    }
  }, [stats.totalReviews, stats.streak, stats.tonesQuizPassed, stats.perfectQuizzes, stats.dialoguesCompleted, stats.totalXp, stats.dailyGoalsHit, stats.currentStage, loaded, awardXp]);

  // Drain achievement queue when current toast closes
  const handleAchievementToastClose = useCallback(() => {
    setAchievementToast(null);
    setAchievementQueue(q => {
      if (q.length === 0) return q;
      const [next, ...rest] = q;
      // Schedule next toast after a short delay
      setTimeout(() => setAchievementToast(next), 400);
      return rest;
    });
  }, []);

  const reviewOne = useCallback((cardId, rating, { assisted = false } = {}) => {
    const previousProgress = progress?.[cardId] || null;
    const reviewKey = `${cardId}:${previousProgress?.lastReview || 'new'}`;
    if (reviewLocksRef.current.has(reviewKey)) return false;
    reviewLocksRef.current.add(reviewKey);
    window.setTimeout(() => reviewLocksRef.current.delete(reviewKey), 1500);

    // --- Assisted-attempt central rule --------------------------------------
    // An attempt is "assisted" when the answer side was exposed by switching the
    // card direction mid-attempt (see CardsTab). The current card's faces are
    // locked to the direction snapshot so the peek is already neutralized in the
    // UI; this is the SINGLE central enforcement point regardless of how the flag
    // was set. An assisted attempt may still update SRS scheduling, but its rating
    // is clamped to at most Good (3) — never the long "Easy" interval — it never
    // earns full XP (capped below), and it is excluded from any first-try /
    // perfect-answer achievement signal.
    const effectiveRating = assisted ? Math.min(rating, 3) : rating;

    // --- Anti-rushing (persisted across sessions) ---------------------------
    // The rush run + last-rating timestamp live in localStorage (rushGuardRef),
    // so the XP cap is NOT reset by refresh / route change / leaving+returning.
    // Only the XP currency is throttled — SRS scheduling, learned/seen counts,
    // and stage unlocks are never affected.
    const now = Date.now();
    const guard = rushGuardRef.current || { rushRun: 0, lastRatingAt: 0 };
    const prevGuard = { rushRun: guard.rushRun || 0, lastRatingAt: guard.lastRatingAt || 0 };
    const gap = prevGuard.lastRatingAt > 0 ? now - prevGuard.lastRatingAt : Infinity;
    const highValue = rating >= 3;
    let nextRun;
    if (gap >= RUSH_COOLDOWN_MS) {
      nextRun = 0;                                              // idle long enough → reset
    } else if (gap < RUSH_GAP_MS && highValue) {
      nextRun = Math.min(prevGuard.rushRun + 1, RUSH_RUN_CEIL); // rapid Good/Easy → escalate
    } else if (rating <= 2) {
      nextRun = Math.max(0, prevGuard.rushRun - 2);             // Again/Hard → decay fast
    } else {
      nextRun = Math.max(0, prevGuard.rushRun - 1);             // engaged pace → decay
    }
    const rushed = nextRun > RUSH_RUN_LIMIT;
    const baseXp = rating === 1 ? XP_REWARDS.again : rating === 2 ? XP_REWARDS.hard : rating === 3 ? XP_REWARDS.good : XP_REWARDS.easy;
    // Per-card daily review-XP guard. A card pays review XP at most ONCE per local
    // day; re-rating the same card after it re-dues (e.g. "Again" → due again in
    // minutes) earns 0, so a single card can't be farmed. Device-local (mirrors
    // the rush guard), resets each local day.
    const today = getLocalDateKey();
    let dayGuard = reviewXpDayRef.current || { date: null, ids: new Set() };
    if (dayGuard.date !== today) dayGuard = { date: today, ids: new Set() };
    // Re-hydrate from storage so a rating made in ANOTHER tab today is honored
    // here too (the ref is per-tab in memory; localStorage is shared).
    const persistedDay = loadReviewXpDay();
    if (persistedDay.date === today) persistedDay.ids.forEach(id => dayGuard.ids.add(id));
    reviewXpDayRef.current = dayGuard;
    const alreadyEarnedToday = dayGuard.ids.has(cardId);
    // XP by source. A new learning card earns once; a genuinely DUE review earns
    // review XP. Re-practicing a card that is NOT due (already learned, scheduled
    // in the future — e.g. a completed-stage card), or one that already paid out
    // today, earns 0, so XP can't be farmed by looping old cards. SRS scheduling +
    // review counts below are unaffected; only the XP currency is gated. The rush
    // cap (and, for assisted attempts, the assisted cap) still apply on top.
    const isNewCard = !previousProgress;
    const isDueReview = !!previousProgress && (previousProgress.nextDue || 0) <= now;
    const earnsXp = (isNewCard || isDueReview) && !alreadyEarnedToday;
    let xp = !earnsXp ? 0 : (rushed ? Math.min(baseXp, RUSH_XP_CAP) : baseXp);
    if (assisted) xp = Math.min(xp, RUSH_XP_CAP);   // assisted attempts never earn full XP
    // Commit + persist immediately so the caps are durable mid-session.
    rushGuardRef.current = { rushRun: nextRun, lastRatingAt: now };
    saveRushGuard(rushGuardRef.current);
    // Record that this card earned review XP today so it can't be re-farmed.
    const earnedXpThisReview = xp > 0;
    if (earnedXpThisReview) {
      dayGuard.ids.add(cardId);
      saveReviewXpDay({ date: dayGuard.date, ids: [...dayGuard.ids] });
    }
    // ------------------------------------------------------------------------

    // Snapshot previous state for undo. Store the XP actually awarded so undo
    // reverses the throttled amount, and the pre-rating rush guard so undo
    // restores the exact persisted run length and timestamp.
    setLastReviewSnapshot({
      cardId,
      rating,
      previousProgress,
      reviewKey,
      xpAwarded: xp,
      prevRushGuard: prevGuard,
      earnedXpDay: earnedXpThisReview,   // undo removes the card from the daily guard
      timestamp: now,
    });
    setProgress(p => {
      const safeProgress = p && typeof p === 'object' ? p : {};
      const newState = reviewCard(safeProgress[cardId], effectiveRating);
      return { ...safeProgress, [cardId]: newState };
    });
    setStats(s => ({ ...s, totalReviews: (s.totalReviews || 0) + 1 }));
    if (xp > 0) {
      // New-card learn vs genuinely-due review are distinct, stable server events.
      const evType = isNewCard ? REWARD_EVENTS.NEW_CARD_LEARNED : REWARD_EVENTS.DUE_REVIEW_COMPLETED;
      const evKey = isNewCard ? rewardKeys.newCard(cardId) : rewardKeys.dueReview(cardId, today);
      awardXp(evType, evKey, xp);
    }
    return { accepted: true, rushed, assisted };
  }, [awardXp, progress]);

  const undoLastReview = useCallback(() => {
    if (!lastReviewSnapshot) return;
    const { cardId, rating, previousProgress, reviewKey } = lastReviewSnapshot;
    if (reviewKey) reviewLocksRef.current.delete(reviewKey);
    // Roll back the persisted rush guard to its exact pre-rating state.
    if (lastReviewSnapshot.prevRushGuard) {
      rushGuardRef.current = {
        rushRun: lastReviewSnapshot.prevRushGuard.rushRun || 0,
        lastRatingAt: lastReviewSnapshot.prevRushGuard.lastRatingAt || 0,
      };
      saveRushGuard(rushGuardRef.current);
    }
    // Roll back the per-card daily review-XP guard so an undone review can earn
    // again — only when THIS review is what recorded the card for today.
    if (lastReviewSnapshot.earnedXpDay && reviewXpDayRef.current && reviewXpDayRef.current.ids) {
      reviewXpDayRef.current.ids.delete(cardId);
      saveReviewXpDay({ date: reviewXpDayRef.current.date, ids: [...reviewXpDayRef.current.ids] });
    }
    setProgress(p => {
      const next = { ...(p && typeof p === 'object' ? p : {}) };
      if (previousProgress) next[cardId] = previousProgress;
      else delete next[cardId];
      return next;
    });
    // Reverse the rating-level XP awarded (throttled or not) and the review
    // counter. As with streak, we intentionally do NOT unwind the daily-goal
    // bonus or dailyGoalsHit when this review happened to cross the goal —
    // reversing derived day-state is brittle and the small leftover is benign.
    const xp = typeof lastReviewSnapshot.xpAwarded === 'number'
      ? lastReviewSnapshot.xpAwarded
      : (rating === 1 ? XP_REWARDS.again : rating === 2 ? XP_REWARDS.hard : rating === 3 ? XP_REWARDS.good : XP_REWARDS.easy);
    setStats(s => ({
      ...s,
      totalReviews: Math.max(0, (s.totalReviews || 0) - 1),
      totalXp: Math.max(0, (s.totalXp || 0) - xp),
      todayXp: Math.max(0, (s.todayXp || 0) - xp),
    }));
    setLastReviewSnapshot(null);
  }, [lastReviewSnapshot]);

  // ── Hearts economy (Challenge-only) ───────────────────────────────────────
  // Super users have UNLIMITED hearts: effectiveHearts is Infinity, spend is a
  // no-op, and the Challenge never blocks them. Free users lose one heart per
  // WRONG Challenge answer (spendHeart), can refill in the Shop with gems, and
  // regenerate one heart every 30 minutes. Hearts NEVER touch flashcard review
  // (CardsTab) or the guided path — only QuizTab calls spendHeart.
  const superActive = isSuper(stats);
  const heartsNow = effectiveHearts(stats, superActive);

  const handleSpendHeart = useCallback(() => {
    // Guard: Super = unlimited, so never decrement (defense in depth; QuizTab
    // also guards). Returns nothing to change for Super users.
    if (isSuper(stats)) return;
    setStats(s => (isSuper(s) ? s : { ...s, ...spendHeart(s) }));
  }, [stats]);

  const handleRefillHearts = useCallback(() => {
    // Spend gems to refill hearts to full. refillHeartsWithGems returns null
    // when already full / can't afford / Super, in which case this no-ops.
    setStats(s => {
      if (isSuper(s)) return s;
      const patch = refillHeartsWithGems(s);
      return patch ? { ...s, ...patch } : s;
    });
  }, []);

  const recordTonesQuiz = useCallback((score, total) => {
    const passed = (score / total) >= 0.8;
    // XP idempotency: the Tone Challenge pays XP at most once per day, so the
    // "Try again" replay can't farm XP. Stat updates below stay live every time.
    const xpId = toneQuizRewardId(getLocalDateKey());
    if (!hasCelebrated(stats.celebratedIds, xpId)) {
      awardXp(REWARD_EVENTS.TONE_CHALLENGE_COMPLETED, rewardKeys.toneChallenge(getLocalDateKey()), score * XP_REWARDS.toneQuizCorrect, { score, total });
      markCelebrated(xpId);
    }
    setStats(s => ({
      ...s,
      tonesQuizBest: Math.max(s.tonesQuizBest || 0, score),
      tonesQuizPassed: passed || s.tonesQuizPassed,
      quizzesPassed: passed ? (s.quizzesPassed || 0) + 1 : (s.quizzesPassed || 0),
      perfectQuizzes: score === total ? (s.perfectQuizzes || 0) + 1 : (s.perfectQuizzes || 0),
    }));
  }, [awardXp, markCelebrated, stats.celebratedIds]);

  const recordQuizComplete = useCallback((score, total, stage) => {
    const passed = (score / total) >= 0.8;
    const correct = Math.max(0, score || 0);
    const wrong = Math.max(0, (total || 0) - correct);
    const today = getLocalDateKey();
    const stageId = stage || 1;
    // XP idempotency: a Stage Challenge pays XP at most once per stage per day, so
    // the "Try again" replay can't farm XP. The stat counters below (attempts,
    // best score, perfect count) still update on every attempt.
    const xpId = challengeRewardId(stageId, today);
    const awardedXp = hasCelebrated(stats.celebratedIds, xpId) ? 0 : score * XP_REWARDS.quizCorrect;
    if (awardedXp > 0) {
      awardXp(REWARD_EVENTS.CHALLENGE_COMPLETED, rewardKeys.challenge(stageId, today), awardedXp, { score, total });
      markCelebrated(xpId);
    }
    // Gems for PASSING (≥80%) a Stage Challenge, at most once per stage per day.
    // Uses its own ledger id (challengeGemsId) so a fail-then-pass on the same
    // day still pays the pass gems exactly once. Modest amount; never gates play.
    if (passed) {
      const gemsId = challengeGemsId(stageId, today);
      if (!hasCelebrated(stats.celebratedIds, gemsId)) {
        markCelebrated(gemsId);
        setStats(s => ({ ...s, ...awardGems(s, GEMS_PER_CHALLENGE_PASS) }));
      }
    }
    // Level 3 — perfect Stage Challenge celebration (once per stage per day).
    // Challenge never marks cards learned; this is purely cosmetic feedback.
    if (total > 0 && score === total) {
      const perfectId = challengePerfectCelebrationId(stageId, today);
      if (!hasCelebrated(stats.celebratedIds, perfectId)) {
        // Super users never see a "Go Super" line (and the daily CTA ledger id
        // isn't burned for them).
        const showSuper = !isSuper(stats) && !hasCelebrated(stats.celebratedIds, superCtaId(today));
        markCelebrated(showSuper ? [perfectId, superCtaId(today)] : perfectId);
        setCelebration({
          eyebrow: 'Perfect Challenge',
          title: `Perfect Stage ${stageId} Challenge`,
          subtitle: 'You got every answer right.',
          characterId: resolveCoachIdForStage(stageId),
          xpEarned: awardedXp,
          primaryLabel: 'Continue',
          onPrimary: () => setCelebration(null),
          superCtaText: showSuper ? 'Go Super to unlock the 18+ Dating & Real Talk section.' : null,
          onSuper: showSuper ? () => { setCelebration(null); handleOpenPremium(); } : null,
        });
      }
    }
    setStats(s => {
      const currentBestScore = s.bestChallengeScore || 0;
      const currentBestTotal = s.bestChallengeTotal || 0;
      const currentBestPct = currentBestTotal > 0 ? currentBestScore / currentBestTotal : -1;
      const nextPct = total > 0 ? correct / total : 0;
      const isNewBest = nextPct > currentBestPct || (nextPct === currentBestPct && correct > currentBestScore);
      return {
        ...s,
        quizzesPassed: passed ? (s.quizzesPassed || 0) + 1 : (s.quizzesPassed || 0),
        perfectQuizzes: score === total ? (s.perfectQuizzes || 0) + 1 : (s.perfectQuizzes || 0),
        challengeAttempts: (s.challengeAttempts || 0) + 1,
        challengeCorrect: (s.challengeCorrect || 0) + correct,
        challengeWrong: (s.challengeWrong || 0) + wrong,
        lastChallengeDate: today,
        bestChallengeScore: isNewBest ? correct : currentBestScore,
        bestChallengeTotal: isNewBest ? (total || 0) : currentBestTotal,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleOpenPremium is stable; referenced lazily on Super tap
  }, [awardXp, markCelebrated, stats.celebratedIds, stats.tier]);

  const recordDialogueComplete = useCallback((dialogueId) => {
    let newlyCompleted = false;
    setStats(s => {
      const done = s.dialoguesCompleted || [];
      if (done.includes(dialogueId)) return s;
      newlyCompleted = true;
      return { ...s, dialoguesCompleted: [...done, dialogueId] };
    });
    // Grant XP only when the dialogue was newly completed, so a repeat call
    // (refresh / double-fire) can't farm the +10. Mirrors the mini-unit pattern.
    if (newlyCompleted) grantXp(10);
  }, [grantXp]);

  const markCardsKnown = useCallback((cardIds) => {
    setProgress(p => {
      const next = { ...(p && typeof p === 'object' ? p : {}) };
      const now = Date.now();
      cardIds.forEach(id => {
        next[id] = {
          lastReview: now,
          nextDue: now + 30 * DAY_MS,
          interval: 30,
          ease: 2.5,
          reviews: 1,
          lapses: 0,
          learning: false,
        };
      });
      return next;
    });
    setStats(s => ({ ...s, knownCardIds: [...new Set([...(s.knownCardIds || []), ...cardIds])] }));
  }, []);

  const markCardKnown = useCallback((cardId) => {
    markCardsKnown([cardId]);
  }, [markCardsKnown]);

  const completeOnboarding = useCallback((startedStage, knownIds, voiceChoice) => {
    if (knownIds && knownIds.length) markCardsKnown(knownIds);
    // Placement respects the chosen level: a learner who already knows Thai and
    // starts above Stage 1 should NOT be forced through the Stage-1 "say hello"
    // starter lesson (the "stuck at the absolute beginning" complaint). For them
    // we mark the guided pilot done and drop them straight onto their chosen
    // stage, where that stage's own first mission still guides them. The curated
    // path is untouched: getStageState keeps maxUnlockedStage at startedStage, so
    // every later stage stays locked and unlocks only by finishing the one before
    // it. Beginners (Stage 1) keep the full polished first-lesson experience.
    const skipStarterLesson = startedStage > 1;
    setStats(s => {
      const next = {
        ...s,
        hasOnboarded: true,
        startedStage,
        currentStage: startedStage,
        voice: voiceChoice || s.voice || DEFAULT_VOICE,
        ...(skipStarterLesson ? { firstLessonCompleted: true } : {}),
      };
      // Placement can satisfy stage-milestone achievements (e.g. "reach Stage 3")
      // just by starting there — those are not earned through play. Record them
      // as already-unlocked and arm the toast lock so a placed learner doesn't
      // get a burst of spurious achievement pop-ups on their very first screen
      // (mirrors how the celebration ledger is baselined at first arming).
      const seededAchievements = checkAchievements(next, progress)
        .filter(a => a.unlocked)
        .map(a => a.id);
      seededAchievements.forEach(id => achievementLocksRef.current.add(id));
      next.unlockedAchievements = [...new Set([...(s.unlockedAchievements || []), ...seededAchievements])];
      return next;
    });
    if (skipStarterLesson) {
      // Land them in the learning path at their placed stage instead of the gate.
      setTab('learn');
      writeRoute('/learn', { replace: true });
    }
    // Cloud write (fire-and-forget). Persists onboarding_completed + voice
    // on profiles so the user doesn't re-see placement onboarding on another
    // device or after sign-out.
    if (session && hasSupabaseConfig && session.user?.email_confirmed_at) {
      supabase.from('profiles').update({
        onboarding_completed: true,
        selected_voice: voiceChoice || DEFAULT_VOICE,
      }).eq('id', session.user.id).then(({ error }) => {
        if (error) console.warn('[App] failed to write onboarding state to cloud', error);
      });
    }
  }, [markCardsKnown, session, progress]);

  const updateSettings = useCallback((updates) => {
    if (Object.prototype.hasOwnProperty.call(updates, 'soundEffects')) {
      setSoundEffectsEnabled(updates.soundEffects !== false);
    }
    setStats(s => ({ ...s, ...updates }));
    if (!session || !session.user?.email_confirmed_at || !hasSupabaseConfig) return;

    const profileSettings = {};
    CLOUD_PROFILE_SETTING_KEYS.forEach(key => {
      if (Object.prototype.hasOwnProperty.call(updates, key)) profileSettings[key] = updates[key];
    });
    if (Object.keys(profileSettings).length === 0) return;

    const nextSettings = { ...(profileSettingsRef.current || {}), ...profileSettings };
    profileSettingsRef.current = nextSettings;
    const profilePatch = { settings: nextSettings };
    if (Object.prototype.hasOwnProperty.call(updates, 'voice')) {
      profilePatch.selected_voice = updates.voice;
    }
    setProfile(p => (p ? { ...p, ...profilePatch } : p));
    updateProfile(session.user.id, profilePatch).catch(e => {
      console.warn('[App] failed to write settings to cloud profile', e);
    });
  }, [session]);

  // Central upgrade-prompt rules (no dark patterns). A prompt is either an
  // automatic value-based reminder (intentional:false) or a response to the user
  // intentionally tapping a premium feature (intentional:true).
  //   • Never on first launch / before onboarding, and never during onboarding,
  //     an active lesson, or another open overlay.
  //   • Never fired after a wrong answer (no caller does so).
  //   • Automatic reminders: the FIRST offer requires Stage 1 complete, and at
  //     most one promotional modal per local day (frequency state persisted +
  //     cloud-synced via superPromptLastShownAt).
  //   • Intentional premium taps skip the stage-1 gate and the daily cap.
  //   • Always dismissible (SuperUpgradePrompt has close + "Maybe later").
  const requestSuperPrompt = useCallback((reason = 'mission', { intentional = false } = {}) => {
    if (!loaded || demoMode) return false;
    if (superActive) return false;                                    // never upsell a paying Super user
    if (!stats.hasOnboarded || !stats.tutorialSeen) return false;     // not on first launch / during onboarding
    if (activeMiniUnitId || celebration || rewardScreen || upgradePrompt || showSettings || showProfile || achievementToast) {
      return false;                                                    // not during a lesson or another overlay
    }
    if (!intentional) {
      const stageOneDone = !!(stats.stage1CelebrationShown || (missionState && missionState.stage1Complete));
      if (!stageOneDone) return false;                                 // first auto-offer only after Stage 1
      const today = getLocalDateKey();
      const lastShown = stats.superPromptLastShownAt || getLocalSuperPromptDate();
      if (lastShown && dateKeyFromValue(lastShown) === today) return false;  // max one promo modal / day
    }
    const shownAt = new Date().toISOString();
    setLocalSuperPromptDate(shownAt);
    updateSettings({ superPromptLastShownAt: shownAt });
    setUpgradePrompt({ reason });
    trackEvent(ANALYTICS_EVENTS.UPGRADE_MODAL_SHOWN, { reason, intentional });
    return true;
  }, [loaded, demoMode, superActive, stats.hasOnboarded, stats.tutorialSeen, stats.stage1CelebrationShown, stats.superPromptLastShownAt, activeMiniUnitId, celebration, rewardScreen, upgradePrompt, showSettings, showProfile, achievementToast, missionState, updateSettings]);

  const handleOpenPremium = useCallback(() => {
    setUpgradePrompt(null);
    setRewardScreen(null);
    // Route Super/upgrade entry points to the full plans/pricing page.
    handleNavigatePath('/plans');
  }, [handleNavigatePath]);

  // Re-read the server-authoritative entitlement and merge it into stats. Used
  // after the cancel-subscription Edge Function returns, so the plan UI flips to
  // the "canceled — active until <date>" state (cancelAtPeriodEnd) without a
  // reload. Best-effort; returns the fresh entitlement or null on failure.
  const handleEntitlementRefresh = useCallback(async () => {
    if (!session || !isEmailConfirmed || !hasSupabaseConfig) return null;
    try {
      const ent = await downloadEntitlement(session.user.id);
      if (ent) {
        setStats(s => ({
          ...s,
          tier: ent.tier || 'free',
          superUntil: ent.superUntil || null,
          cancelAtPeriodEnd: !!ent.cancelAtPeriodEnd,
        }));
      }
      return ent;
    } catch (e) {
      console.warn('[App] entitlement refresh failed', e);
      return null;
    }
  }, [session?.user?.id, isEmailConfirmed]);

  const handleRewardContinue = useCallback(() => {
    const promptReason = rewardScreen?.superPromptReason;
    setRewardScreen(null);
    if (promptReason) {
      window.setTimeout(() => requestSuperPrompt(promptReason), 120);
    }
  }, [requestSuperPrompt, rewardScreen?.superPromptReason]);

  const handleLockedFeature = useCallback(() => {
    // The user intentionally tapped a locked/premium surface → always offer (skips
    // the daily cap), and record the tap for the upgrade funnel.
    trackEvent(ANALYTICS_EVENTS.PREMIUM_FEATURE_TAPPED, { source: 'locked-stage' });
    requestSuperPrompt('locked', { intentional: true });
  }, [requestSuperPrompt]);

  const firstLessonCompleted = !!stats.firstLessonCompleted;

  // Highest-intent push-permission ask: fire ONCE, right after the learner
  // finishes their first lesson (they've just felt the value of the app). Guarded
  // by BOTH the per-session ref AND a durable localStorage flag so it never nags
  // twice, and only when OneSignal is configured, the user is confirmed, and the
  // browser permission hasn't already been decided. The Settings toggle still
  // works independently. Best-effort — never throws.
  const maybePromptPushAfterFirstLesson = useCallback(() => {
    if (!hasOneSignalConfig || !isEmailConfirmed) return;
    if (notificationPromptFired.current || hasFiredPushPrompt()) return;
    if (profile?.onesignal_player_id) return; // already subscribed
    notificationPromptFired.current = true;
    markPushPromptFired();
    // Let the reward screen settle first, then ask.
    window.setTimeout(async () => {
      try {
        const sub = await getPushSubscription();
        if (sub.permission === 'granted' || sub.permission === 'denied') return;
        await promptForPushPermission();
      } catch { /* push is best-effort */ }
    }, 1600);
  }, [isEmailConfirmed, profile?.onesignal_player_id]);

  const completeFirstLesson = useCallback(() => {
    const completedMiniUnits = [...new Set([
      ...(stats.completedMiniUnits || []),
      STAGE_1_MINI_UNIT_PILOT.unitId,
    ])];
    grantXp(FIRST_LESSON_REWARD_XP);
    setRewardScreen({
      id: `first-lesson-${Date.now()}`,
      title: 'First Lesson Complete',
      subtitle: 'You finished the guided starter lesson and unlocked the main practice path.',
      xpEarned: FIRST_LESSON_REWARD_XP,
      streak: Math.max(1, stats.streak || 0),
      // "Cards and Challenge" were both empty right after the first lesson
      // (guided lessons record no card progress) — point at the step that
      // actually works immediately (UX audit).
      nextStep: 'Mission 1 in Learn',
      superPromptReason: 'first-lesson',
    });
    updateSettings({
      firstLessonCompleted: true,
      firstLessonProgress: null,
      activeMiniUnitId: null,
      miniUnitProgress: null,
      completedMiniUnits,
    });
    setShowFirstLessonUnlock(true);
    setActiveMiniUnitId(null);
    setCardSession(null);
    setShowProfile(false);
    setShowSettings(false);
    setPublicPage(null);
    setTab('learn');
    writeRoute('/learn', { replace: true });
    // One-time, highest-intent push-permission ask (see the callback above).
    maybePromptPushAfterFirstLesson();
  }, [grantXp, stats.completedMiniUnits, stats.streak, updateSettings, maybePromptPushAfterFirstLesson]);

  const handleFirstLessonProgressChange = useCallback((progressUpdate) => {
    if (!progressUpdate || firstLessonCompleted) return;
    updateSettings({ firstLessonProgress: progressUpdate });
  }, [firstLessonCompleted, updateSettings]);

  useEffect(() => {
    if (!loaded || !stats.firstLessonCompleted) return;
    if (!session || !isEmailConfirmed || !hasSupabaseConfig || !profile) return;
    if (profile.settings?.firstLessonCompleted === true) return;

    const nextSettings = { ...(profile.settings || {}), firstLessonCompleted: true };
    setProfile(p => (p ? { ...p, settings: nextSettings } : p));
    updateProfile(session.user.id, { settings: nextSettings }).catch(e => {
      console.warn('[App] failed to write first lesson state to cloud profile', e);
    });
  }, [loaded, stats.firstLessonCompleted, session?.user?.id, isEmailConfirmed, profile]);

  const handleStartMiniUnit = useCallback((unitId) => {
    const unit = getMiniUnit(unitId);
    if (!unit) return;
    // Resume only a genuinely mid-flow save of the SAME unit. Reviewing a
    // completed unit (saved step === 'complete') or opening a different unit
    // starts fresh from intro — a clean replay. Replay grants no XP: the
    // completion (+45) and builder (+5) rewards are guarded by persisted lists.
    const saved = stats.miniUnitProgress;
    const resumable = !!(saved && saved.unitId === unitId && saved.step && saved.step !== 'complete' && saved.step !== 'intro');
    const currentProgress = resumable
      ? saved
      : {
          unitId,
          step: 'intro',
          vocabIndex: 0,
          revealed: false,
          challengeIndex: 0,
          selectedId: null,
          checked: false,
          challengeScore: 0,
          builderComplete: false,
        };
    setActiveMiniUnitId(unitId);
    updateSettings({ activeMiniUnitId: unitId, miniUnitProgress: currentProgress });
  }, [stats.miniUnitProgress, updateSettings]);

  const handleMiniUnitProgressChange = useCallback((progressUpdate) => {
    if (!progressUpdate?.unitId) return;
    const updates = {
      activeMiniUnitId: progressUpdate.unitId,
      miniUnitProgress: progressUpdate,
    };
    // Sentence-builder reward: 5 XP, once per unit ever (guarded by a persisted
    // list so replay/refresh can't farm it). Fires when the builder is first
    // completed, independent of unit completion.
    const builderRewarded = stats.builderRewardedUnits || [];
    if (progressUpdate.builderComplete && !builderRewarded.includes(progressUpdate.unitId)) {
      updates.builderRewardedUnits = [...new Set([...builderRewarded, progressUpdate.unitId])];
      grantXp(MINI_UNIT_BUILDER_XP);
    }
    const completed = stats.completedMiniUnits || [];
    if (progressUpdate.step === 'complete' && !completed.includes(progressUpdate.unitId)) {
      updates.completedMiniUnits = [...new Set([
        ...completed,
        progressUpdate.unitId,
      ])];
      grantXp(MINI_UNIT_REWARD_XP);
      // If this is the LAST unit (course now complete), skip the small per-unit
      // reward screen — the global "Course Complete" overlay (fired by the
      // celebration effect) takes over and supersedes it.
      const courseNowComplete = getCourseCompletion(MINI_UNITS, updates.completedMiniUnits).courseComplete;
      if (!courseNowComplete) {
        // Completing the stage's LAST guided unit reads as a bigger milestone
        // than a normal mission recap. Derived purely from existing progress
        // state; any lookup miss falls back to the standard screen.
        const completedUnit = getMiniUnit(progressUpdate.unitId);
        const stageUnits = completedUnit ? getMiniUnitsForStage(completedUnit.stageId) : [];
        const stagePathNowComplete = stageUnits.length > 0 &&
          stageUnits.every(u => updates.completedMiniUnits.includes(u.unitId));
        setRewardScreen({
          id: `mini-unit-${progressUpdate.unitId}-${Date.now()}`,
          title: stagePathNowComplete
            ? `Stage ${completedUnit.stageId} Path Complete`
            : 'Mini-Unit Complete',
          subtitle: stagePathNowComplete
            ? `You finished every guided lesson in Stage ${completedUnit.stageId}. That is a real milestone.`
            : 'You finished a guided lesson and checked your recall.',
          xpEarned: MINI_UNIT_REWARD_XP,
          streak: stats.streak || 0,
          nextStep: stagePathNowComplete ? 'Keep going in Learn' : 'Review or Challenge',
          characterId: resolveCoachIdForStage(completedUnit?.stageId || 1),
          superPromptReason: 'mini-unit',
        });
      }
    }
    updateSettings(updates);
  }, [grantXp, stats.completedMiniUnits, stats.builderRewardedUnits, stats.streak, updateSettings]);

  const handleExitMiniUnit = useCallback(() => {
    setActiveMiniUnitId(null);
    updateSettings({ activeMiniUnitId: null });
  }, [updateSettings]);

  const handleFinishMiniUnitAndOpen = useCallback((nextTab) => {
    setActiveMiniUnitId(null);
    setCardSession(null);
    updateSettings({ activeMiniUnitId: null, miniUnitProgress: null });
    setShowProfile(false);
    setShowSettings(false);
    setPublicPage(null);
    setTab(nextTab);
    writeRoute(routePathForTab(nextTab));
  }, [updateSettings]);

  useEffect(() => {
    if (!loaded || activeMiniUnitId || !stats.firstLessonCompleted) return;
    if (!stats.activeMiniUnitId) return;
    if (showProfile || showSettings || publicPage) return;
    const unit = getMiniUnit(stats.activeMiniUnitId);
    if (unit) setActiveMiniUnitId(stats.activeMiniUnitId);
  }, [loaded, activeMiniUnitId, stats.firstLessonCompleted, stats.activeMiniUnitId, showProfile, showSettings, publicPage]);

  const handleSetTab = useCallback((nextTab, options = {}) => {
    const unlockedStage = stageState?.maxUnlockedStage || 1;
    if (nextTab === 'quests' && firstLessonCompleted && unlockedStage < 2) {
      requestSuperPrompt('locked');
    }
    if (activeMiniUnitId) updateSettings({ activeMiniUnitId: null });
    setActiveMiniUnitId(null);
    setCardSession(nextTab === 'cards' ? (options.sessionScope || null) : null);
    setShowProfile(false);
    setShowSettings(false);
    setPublicPage(null);
    setTab(nextTab);
    writeRoute(routePathForTab(nextTab), { replace: !!options.replace });
  }, [activeMiniUnitId, firstLessonCompleted, requestSuperPrompt, stageState?.maxUnlockedStage, updateSettings]);

  const handleStartMissionCards = useCallback((mission) => {
    if (!mission) {
      handleSetTab('cards');
      return;
    }
    handleSetTab('cards', {
      sessionScope: {
        type: 'mission',
        missionId: mission.id,
        name: mission.name,
        total: mission.total,
        cardIds: mission.cardIds || [],
      },
    });
  }, [handleSetTab]);

  const handleOpenProfile = useCallback(() => {
    setActiveMiniUnitId(null);
    setCardSession(null);
    setPublicPage(null);
    setShowSettings(false);
    setShowProfile(true);
    writeRoute('/profile');
  }, []);

  const handleCloseProfile = useCallback(() => {
    setShowProfile(false);
    setPublicPage(null);
    writeRoute(routePathForTab(tab), { replace: true });
  }, [tab]);

  const handleOpenSettings = useCallback(() => {
    setActiveMiniUnitId(null);
    setCardSession(null);
    setPublicPage(null);
    setShowProfile(false);
    setShowSettings(true);
    writeRoute('/settings');
  }, []);

  const handleCloseSettings = useCallback(() => {
    setShowSettings(false);
    setPublicPage(null);
    writeRoute(routePathForTab(tab), { replace: true });
  }, [tab]);

  // Sequential stage unlock: only stages ≤ maxUnlockedStage are accessible.
  // Stage N+1 unlocks when Stage N is learned/complete, with legacy mature
  // unlock preserved. dashboardStats, the Cards tab SRS pool, Browse listing,
  // and the Quiz pool all filter to the unlocked window. The mission view
  // (S1 only) is a special case within this.
  const maxUnlockedStage = stageState ? stageState.maxUnlockedStage : 1;
  const eligibleCards = useMemo(
    () => CARDS.filter(c => (c.stage || 1) <= maxUnlockedStage),
    [maxUnlockedStage]
  );
  const dashboardStats = useMemo(() => getStats(progress, eligibleCards), [progress, eligibleCards]);

  // Global course completion (all guided mini-units done). Pure, derived from
  // completedMiniUnits; drives the course-complete celebration + LearnPath state.
  const courseCompletion = useMemo(
    () => getCourseCompletion(MINI_UNITS, stats.completedMiniUnits),
    [stats.completedMiniUnits]
  );

  // ── Celebration feedback (Levels 1–3) ────────────────────────────────────
  // Quest toasts, all-quests-complete + stage-complete overlays. Perfect
  // Challenge fires from recordQuizComplete; achievements from their own effect.
  // The first settled pass arms a baseline (records already-satisfied IDs) so
  // existing completions are never retroactively celebrated, and celebratedIds
  // prevents any repeat after refresh / re-opening Quests.
  useEffect(() => {
    if (!loaded || (session && !cloudReady) || !stageState) return;
    const today = getLocalDateKey();
    const quests = evaluateDailyQuests({ stats, dashboardStats, progress, today });

    if (!celebrationsArmedRef.current) {
      celebrationsArmedRef.current = true;
      // Snapshot whether the course was ALREADY complete on the first settled
      // pass. If so, this session must never fire the course-complete overlay
      // (the user finished before this feature / session) — robust regardless of
      // StrictMode double-invoke or un-committed baseline writes.
      courseCompleteAtArmingRef.current = courseCompletion.courseComplete;
      if (!stats.celebrationBaselineDone) {
        const seed = activeCelebrationIds({ quests, stageState, courseComplete: courseCompletion.courseComplete, today });
        setStats(s => ({
          ...s,
          celebratedIds: withCelebrated(s.celebratedIds, seed, today, previousLocalDateKey()),
          celebrationBaselineDone: true,
        }));
      }
      return;
    }

    const ids = stats.celebratedIds || [];
    const allDone = allQuestsComplete(quests);

    // Level 1 — individual quest toasts (suppressed when the whole day is done,
    // which shows the Level 3 overlay instead).
    if (!allDone) {
      const newlyDone = QUEST_CELEBRATIONS.filter(
        q => quests[q.slot] && quests[q.slot].done && !hasCelebrated(ids, questCelebrationId(q.key, today))
      );
      if (newlyDone.length > 0) {
        const items = newlyDone.map(q => ({ id: questCelebrationId(q.key, today), title: q.title }));
        setQuestToasts(prev => [...prev, ...items]);
        markCelebrated(items.map(i => i.id));
      }
    }

    // Level 3 — one overlay at a time.
    if (!celebration) {
      // Highest priority: the global "Course Complete" milestone. Fires once
      // (durable ledger ID), suppresses any smaller stage/mini-unit feedback,
      // and grants a one-time +250 XP bonus guarded by the same ledger ID so it
      // can never be replayed/farmed. Existing already-complete users were seeded
      // at baseline, so this never retro-fires for them.
      const courseId = courseCompleteCelebrationId();
      if (courseCompletion.courseComplete && !courseCompleteAtArmingRef.current && !hasCelebrated(ids, courseId)) {
        const showSuper = !isSuper(stats) && !hasCelebrated(ids, superCtaId(today));
        markCelebrated(showSuper ? [courseId, superCtaId(today)] : courseId);
        awardXp(REWARD_EVENTS.COURSE_COMPLETED, rewardKeys.course(), COURSE_COMPLETE_XP);
        setRewardScreen(null);   // suppress the per-unit "Mini-Unit Complete" screen
        setQuestToasts([]);      // overlay supersedes any lingering quest toast
        setCelebration({
          eyebrow: 'Course Complete',
          title: 'Course Complete',
          subtitle: `You completed the Tuk Talk Thai path: ${courseCompletion.stagesComplete} stages, ${courseCompletion.completedUnits} mini-units, ${courseCompletion.buildersCompleted} sentence builders. Keep your streak alive!`,
          xpEarned: COURSE_COMPLETE_XP,
          characterId: resolveCoachIdForStage(8),
          primaryLabel: 'Review due cards',
          onPrimary: () => { setCelebration(null); handleSetTab('cards'); },
          secondaryLabel: 'Try a Stage Challenge',
          onSecondary: () => { setCelebration(null); handleSetTab('quiz'); },
          superCtaText: showSuper ? 'Go Super to unlock the 18+ Dating & Real Talk section — more extras are on the way.' : null,
          onSuper: showSuper ? () => { setCelebration(null); handleOpenPremium(); } : null,
        });
        // Course-completion cinematic (Stage 8 = the big finale). No-op until a
        // clip ships; never grants rewards; plays at most once.
        if (getStageCinematic(8) && !(stats.cinematicsWatched || []).includes(8)) {
          setStageCinematic({ stageId: 8, courseComplete: true });
        }
        return;
      }

      const stages = stageState.stages || [];
      const newStage = stages.find(
        s => s.complete && s.total > 0 && s.id !== 1 && !hasCelebrated(ids, stageCompleteCelebrationId(s.id))
      );
      if (newStage) {
        const next = stages.find(s => s.id === newStage.id + 1 && s.total > 0);
        markCelebrated(stageCompleteCelebrationId(newStage.id));
        awardXp(REWARD_EVENTS.STAGE_COMPLETED, rewardKeys.stage(newStage.id), 0);
        setCelebration({
          eyebrow: 'Stage Complete',
          title: `Stage ${newStage.id} Complete`,
          subtitle: 'Every word in this stage is learned. Keep reviewing to master them.',
          characterId: resolveCoachIdForStage(newStage.id),
          xpEarned: 0,
          primaryLabel: next ? `Start Stage ${next.id}` : 'Continue learning',
          onPrimary: () => { setCelebration(null); handleSetTab('learn'); },
          secondaryLabel: `Try Stage ${newStage.id} Challenge`,
          onSecondary: () => { setCelebration(null); handleSetTab('quiz'); },
        });
        // Stage-completion cinematic. No-op until a clip ships for this stage;
        // never grants rewards; plays at most once (gated by cinematicsWatched).
        if (getStageCinematic(newStage.id) && !(stats.cinematicsWatched || []).includes(newStage.id)) {
          setStageCinematic({ stageId: newStage.id });
        }
        return;
      }

      if (allDone && !hasCelebrated(ids, allQuestsCelebrationId(today))) {
        const showSuper = !isSuper(stats) && !hasCelebrated(ids, superCtaId(today));
        markCelebrated([
          allQuestsCelebrationId(today),
          ...QUEST_CELEBRATIONS.map(q => questCelebrationId(q.key, today)),
          ...(showSuper ? [superCtaId(today)] : []),
        ]);
        setQuestToasts([]); // overlay supersedes any lingering quest toast
        setCelebration({
          eyebrow: 'Daily Quests Complete',
          title: 'Daily Quests Complete',
          subtitle: 'You finished today’s goals. Come back tomorrow to keep your streak alive.',
          xpEarned: 0,
          primaryLabel: 'Continue learning',
          onPrimary: () => setCelebration(null),
          secondaryLabel: 'Try a Challenge',
          onSecondary: () => { setCelebration(null); handleSetTab('quiz'); },
          superCtaText: showSuper ? 'Go Super to unlock the 18+ Dating & Real Talk section and support new content.' : null,
          onSuper: showSuper ? () => { setCelebration(null); handleOpenPremium(); } : null,
        });
      }
    }
  }, [loaded, cloudReady, session, stageState, dashboardStats, progress, stats, celebration, courseCompletion, awardXp, markCelebrated, handleSetTab, handleOpenPremium]);

  const voice = stats.voice || DEFAULT_VOICE;
  const viewMode = stats.viewMode || DEFAULT_VIEW_MODE;
  const cardDirection = stats.cardDirection === 'th-first' ? 'th-first' : DEFAULT_CARD_DIRECTION;
  const setCardDirection = useCallback(
    (direction) => updateSettings({ cardDirection: direction === 'th-first' ? 'th-first' : 'en-first' }),
    [updateSettings]
  );
  const setVoice = useCallback(
    (style) => updateSettings({ voice: style === 'female' ? 'female' : 'male' }),
    [updateSettings]
  );
  // Best-effort TTS voice matching: try a Thai voice that matches the user's
  // speaking style; lib/audio.js falls back to the best available Thai voice.
  useEffect(() => {
    setPreferredVoiceGender(voice);
  }, [voice]);
  const audioRate = stats.audioRate || DEFAULT_AUDIO_RATE;
  // First lesson and demo always play at a beginner-clear pace, even if the
  // user's saved speed is faster. A slower saved speed is respected.
  const beginnerAudioRate = Math.min(audioRate, BEGINNER_AUDIO_RATE);
  const activeMiniUnit = activeMiniUnitId ? getMiniUnit(activeMiniUnitId) : null;

  // A signed-in, confirmed user viewing /plans gets it rendered INSIDE the app
  // shell (sidebar + header + bottom nav) so upgrading feels native — not like
  // leaving the app for a detached marketing page. Anonymous visitors (and all
  // other public/legal pages) keep the standalone full-page layout.
  const embedPlansInShell = publicPage === 'plans'
    && hasSupabaseConfig && !!session && isEmailConfirmed && authReady && !demoMode;

  if (publicPage && !embedPlansInShell) {
    return (
      <div className="app-root" data-theme={stats.theme || 'light'} data-view-mode={viewMode}>
        {publicPage === 'plans' ? (
          <PlansPage
            isAuthed={!!session}
            isSuperUser={superActive}
            onNavigate={handleNavigatePath}
            onGetStarted={() => openAuthGate('welcome')}
            onSignIn={() => openAuthGate('signin')}
          />
        ) : (
          <PublicInfoPage
            page={publicPage}
            isAuthed={!!session}
            onNavigate={handleNavigatePath}
          />
        )}
      </div>
    );
  }

  // Hard-fail when Supabase env vars are missing — never silently degrade to
  // a no-auth main app. Security audit HIGH-1: previously, an unconfigured
  // build would render the full UI without an AuthGate, exposing the deck.
  if (!hasSupabaseConfig) {
    return (
      <div className="app-root" data-theme="light">
        <div className="config-error-root">
          <div className="config-error-card">
            <div className="config-error-icon">⚠️</div>
            <div className="config-error-eyebrow">Configuration error</div>
            <h1 className="config-error-title">App not properly configured</h1>
            <p className="config-error-body">
              This Tuk Talk Thai instance is missing its Supabase connection
              details. Contact the administrator.
            </p>
            <div className="config-error-hint">
              Missing environment variables: <code>VITE_SUPABASE_URL</code>, <code>VITE_SUPABASE_KEY</code>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Do not render any logged-out or onboarding surface until Supabase has told
  // us whether a session already exists. This prevents a first-paint flash of
  // the wrong gate on cold loads.
  if (!authReady) {
    return <AppBootScreen theme={stats.theme || 'light'} />;
  }

  // Password recovery (/reset-password). Rendered above the email-confirmation
  // gate: clicking the emailed recovery link is itself proof of inbox access.
  // The set-new-password form additionally requires recovery EVIDENCE (real
  // recovery tokens or the PASSWORD_RECOVERY event) so a signed-in user typing
  // the URL can't change their password without the emailed link — they're
  // pointed back to the app (Profile owns the change-password flow).
  if (passwordRecovery) {
    if (session && !recoveryEvidenceRef.current) {
      return (
        <div className="app-root" data-theme={stats.theme || 'light'}>
          <div className="onboard-root">
            <div className="onboard-card auth-card">
              <h1 className="onboard-title">You're already signed in</h1>
              <p className="onboard-sub">
                To change your password, open your Profile and choose "Change password". Password-reset
                links from email land here automatically.
              </p>
              <button className="btn-primary auth-submit" onClick={handleResetPasswordComplete}>
                Back to the app
              </button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="app-root" data-theme={stats.theme || 'light'}>
        <ResetPassword
          hasSession={!!session}
          linkError={authCallbackError}
          onComplete={handleResetPasswordComplete}
          onSignIn={() => openAuthGate('signin')}
        />
      </div>
    );
  }

  // Pending confirmation: session exists but email isn't confirmed. Sits
  // between AuthGate and the main app — the user has signed up but can't
  // proceed until they click the email link.
  if (hasSupabaseConfig && session && !isEmailConfirmed) {
    return (
      <div className="app-root" data-theme={stats.theme || 'light'}>
        <PendingConfirmation
          email={session.user.email}
          onSignOut={handleSignOut}
        />
      </div>
    );
  }

  const showLanding = hasSupabaseConfig && !session && !demoMode && !forceAuthGate && showPublicLanding;
  if (showLanding) {
    return (
      <div className="app-root" data-theme={stats.theme || 'light'}>
        {authCallbackError && (
          <AuthLinkNotice
            message={friendlyAuthErrorMessage(authCallbackError)}
            onSignIn={handleAuthErrorSignIn}
            onRequestReset={handleAuthErrorRequestReset}
            onDismiss={dismissAuthCallbackError}
          />
        )}
        <PublicLanding
          onGetStarted={() => openAuthGate('welcome')}
          onSignIn={() => openAuthGate('signin')}
          onOpenPublicPage={handleNavigatePath}
          audioRate={beginnerAudioRate}
        />
      </div>
    );
  }

  // Auth gate: after the landing page, every anonymous visitor must either
  // sign in/up or pick the 5-card demo. forceAuthGate wins over demoMode so a
  // demo user can convert from the demo's end-CTA buttons.
  const showAuthGate = hasSupabaseConfig && !session && (forceAuthGate || (!demoMode && !showPublicLanding));
  if (showAuthGate) {
    return (
      <div className="app-root" data-theme={stats.theme || 'light'}>
        {authCallbackError && (
          <AuthLinkNotice
            message={friendlyAuthErrorMessage(authCallbackError)}
            onSignIn={handleAuthErrorSignIn}
            onRequestReset={handleAuthErrorRequestReset}
            onDismiss={dismissAuthCallbackError}
          />
        )}
        <AuthGate
          initialScreen={authInitialScreen}
          onTryDemo={startDemo}
          onAuthSuccess={handleAuthSuccess}
          onOpenPublicPage={handleNavigatePath}
          onScreenChange={(screen) => writeRoute(screen === 'signin' || screen === 'forgot' ? '/sign-in' : '/welcome')}
        />
      </div>
    );
  }

  // Demo mode: 5 curated cards, read-only, no progress saved.
  const showDemo = hasSupabaseConfig && !session && demoMode && !forceAuthGate;
  if (showDemo) {
    return (
      <div className="app-root" data-theme={stats.theme || 'light'}>
        <DemoMode
          onSignUp={handleDemoSignUp}
          onSignIn={handleDemoSignIn}
          onBackToHome={handleExitDemo}
          viewMode={viewMode}
          voice={voice}
          onChangeVoice={setVoice}
          audioRate={beginnerAudioRate}
          audioAutoPlay={!!stats.audioAutoPlay}
          showCharacters={stats.showCharacters !== false}
        />
      </div>
    );
  }

  // Wait for the cloud profile check to resolve before deciding to show
  // placement onboarding. Without this, signed-in users on a new device
  // would briefly see the onboarding flow before the cloud sync corrects
  // stats.hasOnboarded — a confusing flash.
  if (loaded && session && isEmailConfirmed && !profileChecked) {
    return <AppBootScreen theme={stats.theme || 'light'} />;
  }

  if (loaded && !stats.hasOnboarded) {
    return (
      <div className="app-root" data-theme={stats.theme || 'light'} data-view-mode={viewMode}>

        <PlacementOnboarding onComplete={completeOnboarding} />
      </div>
    );
  }

  if (loaded && stats.hasOnboarded && session && isEmailConfirmed && !cloudReady && !firstLessonCompleted) {
    return <AppBootScreen theme={stats.theme || 'light'} viewMode={viewMode} />;
  }

  if (loaded && stats.hasOnboarded && !firstLessonCompleted) {
    return (
      <div className="app-root" data-theme={stats.theme || 'light'} data-view-mode={viewMode}>
        <FirstLessonFlow
          unit={STAGE_1_MINI_UNIT_PILOT}
          voice={voice}
          onChangeVoice={setVoice}
          cardDirection={cardDirection}
          onChangeCardDirection={setCardDirection}
          audioRate={beginnerAudioRate}
          showCharacters={stats.showCharacters !== false}
          initialProgress={stats.firstLessonProgress}
          onProgressChange={handleFirstLessonProgressChange}
          onComplete={completeFirstLesson}
        />
      </div>
    );
  }

  // Profile page renders full-screen on top of the main app when opened
  // from the user menu. Closing returns to whatever tab was active.
  if (showProfile && session && profile) {
    return (
      <div className="app-root" data-theme={stats.theme || 'light'} data-view-mode={viewMode}>
        <ProfilePage
          profile={profile}
          fullStats={stats}
          session={session}
          stageState={stageState}
          onClose={handleCloseProfile}
          onSignOut={() => { setShowProfile(false); handleSignOut(); }}
          onOpenPublicPage={handleNavigatePath}
          onEntitlementRefresh={handleEntitlementRefresh}
          onProfileRefresh={async () => {
            const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
            if (data) setProfile(data);
          }}
        />
      </div>
    );
  }

  return (
    <AppShell
      tab={tab}
      setTab={handleSetTab}
      stats={stats}
      dashboardStats={dashboardStats}
      session={session}
      onOpenProfile={handleOpenProfile}
      onOpenSettings={handleOpenSettings}
      onSignOut={handleSignOut}
      onOpenPublicPage={handleNavigatePath}
      themeAttr={stats.theme || 'light'}
      viewModeAttr={viewMode}
    >
      {embedPlansInShell ? (
        <PlansPage
          embedded
          isAuthed
          isSuperUser={superActive}
          onNavigate={handleNavigatePath}
          onBack={() => handleNavigatePath('/learn')}
        />
      ) : activeMiniUnit ? (
        <MiniUnitFlow
          unit={activeMiniUnit}
          voice={voice}
          cardDirection={cardDirection}
          onChangeCardDirection={setCardDirection}
          audioRate={audioRate}
          showCharacters={stats.showCharacters !== false}
          initialProgress={stats.miniUnitProgress}
          onProgressChange={handleMiniUnitProgressChange}
          onExit={handleExitMiniUnit}
          onOpenCards={() => handleFinishMiniUnitAndOpen('cards')}
          onOpenChallenge={() => handleFinishMiniUnitAndOpen('quiz')}
        />
      ) : (
        <>
          {showFirstLessonUnlock && (
            <div className="firstlesson-unlock-note">
              <span>{STAGE_1_MINI_UNIT_PILOT.unlockMessage}</span>
              <button type="button" onClick={() => setShowFirstLessonUnlock(false)}>Got it</button>
            </div>
          )}
          {tab === 'learn'  && <LearnPath stats={stats} fullStats={stats} dashboardStats={dashboardStats} stageState={stageState} missionState={missionState} setTab={handleSetTab} onStartMiniUnit={handleStartMiniUnit} onLockedFeature={handleLockedFeature} onStartMissionCards={handleStartMissionCards} courseCompletion={courseCompletion} />}
          {tab === 'today'  && <TodayTab stats={dashboardStats} fullStats={stats} setTab={handleSetTab} stageState={stageState} missionState={missionState} voice={voice} viewMode={viewMode} onStartMissionCards={handleStartMissionCards} />}
          {tab === 'cards'  && <CardsTab progress={progress} reviewOne={reviewOne} markCardKnown={markCardKnown} dailyNewLimit={stats.dailyNewLimit} voice={voice} viewMode={viewMode} cardDirection={cardDirection} onChangeCardDirection={setCardDirection} startedStage={stats.startedStage || 1} maxUnlockedStage={maxUnlockedStage} audioRate={audioRate} audioAutoPlay={!!stats.audioAutoPlay} showCharacters={stats.showCharacters !== false} undoLastReview={undoLastReview} lastReviewSnapshot={lastReviewSnapshot} sessionScope={cardSession} setTab={handleSetTab} stageState={stageState} />}
          {tab === 'browse' && <BrowseTab progress={progress} maxUnlockedStage={maxUnlockedStage} recordDialogueComplete={recordDialogueComplete} dialoguesCompleted={stats.dialoguesCompleted || []} voice={voice} viewMode={viewMode} audioRate={audioRate} />}
          {tab === 'quiz'   && <QuizTab onComplete={recordQuizComplete} maxUnlockedStage={maxUnlockedStage} stageState={stageState} progress={progress} voice={voice} viewMode={viewMode} audioRate={audioRate} showCharacters={stats.showCharacters !== false} hearts={heartsNow} isSuper={superActive} gems={stats.gems || 0} stats={stats} onSpendHeart={handleSpendHeart} onRefillHearts={handleRefillHearts} onOpenSuper={handleOpenPremium} setTab={handleSetTab} />}
          {tab === 'guide'  && <GuideTab onTonesQuizComplete={recordTonesQuiz} tonesQuizBest={stats.tonesQuizBest || 0} tonesQuizPassed={stats.tonesQuizPassed} />}
          {tab === 'quests' && <QuestsScreen stats={stats} dashboardStats={dashboardStats} progress={progress} setTab={handleSetTab} locked={maxUnlockedStage < 2} onOpenSuper={handleOpenPremium} />}
          {tab === 'shop'   && <ShopScreen stats={stats} hearts={heartsNow} gems={stats.gems || 0} isSuper={superActive} onRefillHearts={handleRefillHearts} onOpenSuper={handleOpenPremium} />}
          {tab === 'dating' && <DatingSection stats={stats} onOpenSuper={handleOpenPremium} setTab={handleSetTab} />}
          {tab === 'leaderboard' && <LeaderboardScreen />}
        </>
      )}

      {questToasts.length > 0 && (
        <QuestCompleteToast
          key={questToasts[0].id}
          title={questToasts[0].title}
          onClose={() => setQuestToasts(q => q.slice(1))}
        />
      )}
      {celebration && (
        <CelebrationOverlay {...celebration} />
      )}
      {superActivation && (
        <SuperActivationNotice
          status={superActivation.status}
          onDismiss={() => setSuperActivation(null)}
        />
      )}
      {!celebration && achievementToast && (
        <AchievementUnlockedModal achievement={achievementToast} onContinue={handleAchievementToastClose} />
      )}
      {showStage1Celebration && (
        <Stage1CompleteCelebration onClose={() => setShowStage1Celebration(false)} />
      )}
      {showSettings && (
        <SettingsModal stats={stats} updateSettings={updateSettings} onClose={handleCloseSettings} onOpenPublicPage={handleNavigatePath} onEntitlementRefresh={handleEntitlementRefresh} onReplayTutorial={() => { updateSettings({ tutorialSeen: false }); handleCloseSettings(); handleSetTab('learn'); }} />
      )}
      {rewardScreen && (
        <MissionCompleteRewardScreen
          {...rewardScreen}
          onContinue={handleRewardContinue}
        />
      )}
      {upgradePrompt && (
        <SuperUpgradePrompt
          reason={upgradePrompt.reason}
          onClose={() => {
            trackEvent(ANALYTICS_EVENTS.UPGRADE_MODAL_DISMISSED, { reason: upgradePrompt.reason });
            setUpgradePrompt(null);
          }}
          onSeeSuper={handleOpenPremium}
        />
      )}

      {stageCinematic && (() => {
        const clip = getStageCinematic(stageCinematic.stageId);
        if (!clip) return null;
        return (
          <StageCinematicOverlay
            src={clip.src}
            poster={clip.poster}
            courseComplete={!!stageCinematic.courseComplete}
            onClose={() => {
              updateSettings({
                cinematicsWatched: [...new Set([...(stats.cinematicsWatched || []), stageCinematic.stageId])],
              });
              setStageCinematic(null);
            }}
          />
        );
      })()}

      {tab === 'learn' && !publicPage && loaded && !demoMode && !activeMiniUnit && !stats.tutorialSeen
        && !celebration && !rewardScreen && !showSettings && !showProfile
        && !showStage1Celebration && !upgradePrompt && !achievementToast && !showFirstLessonUnlock && (
        <GuidedTutorial
          steps={TUTORIAL_STEPS}
          onFinish={() => updateSettings({ tutorialSeen: true })}
        />
      )}
    </AppShell>
  );
}
