import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';

import { CARDS } from './data/cards.js';
import { STAGES } from './data/taxonomy.js';
import { ACHIEVEMENTS, XP_REWARDS, DEFAULT_DAILY_GOAL } from './data/gamification.js';

import { reviewCard, getStats, DAY_MS } from './lib/srs.js';
import { loadState, saveState, clearState, loadRushGuard, saveRushGuard } from './lib/storage.js';
import { DEFAULT_VOICE, DEFAULT_VIEW_MODE } from './lib/voice.js';
import { getStageState, getMissionState, checkAchievements } from './lib/state.js';
import { DEFAULT_STATS, dateKeyFromValue, getLocalDateKey, hasStatsLearningActivity, migrateStats, previousLocalDateKey, startStudyDay } from './lib/stats.js';
import { setSoundEffectsEnabled } from './lib/sounds.js';
import { MISSIONS } from './data/taxonomy.js';
import { supabase, hasSupabaseConfig } from './lib/supabase.js';
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
  updateProfile,
} from './lib/cloudStorage.js';

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
import AchievementToast from './components/AchievementToast.jsx';
import StageUpToast from './components/StageUpToast.jsx';
import MissionCompleteRewardScreen from './components/MissionCompleteRewardScreen.jsx';
import Stage1CompleteCelebration from './components/Stage1CompleteCelebration.jsx';
import PlacementOnboarding from './components/PlacementOnboarding.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import PublicLanding from './components/PublicLanding.jsx';
import AuthGate from './components/auth/AuthGate.jsx';
import PendingConfirmation from './components/auth/PendingConfirmation.jsx';
import DemoMode from './components/DemoMode.jsx';
import ProfilePage from './components/ProfilePage.jsx';
import PublicInfoPage from './components/legal/PublicInfoPage.jsx';
import MiniUnitFlow from './components/MiniUnitFlow.jsx';
import FirstLessonFlow from './components/FirstLessonFlow.jsx';
import SuperUpgradePrompt from './components/SuperUpgradePrompt.jsx';
import { getMiniUnit, STAGE_1_MINI_UNIT_PILOT } from './data/miniUnits.js';

const CLOUD_PROFILE_SETTING_KEYS = [
  'viewMode',
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
  'superPromptLastShownAt',
];
const FIRST_LESSON_REWARD_XP = 60;
const MISSION_REWARD_XP = 35;
const MINI_UNIT_REWARD_XP = 45;
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
  '/premium': 'premium',
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

export default function TukTalkThaiApp() {
  const initialRoute = getCurrentRoute();
  const [tab, setTab] = useState(() => initialRoute.tab || 'learn');
  const [progress, setProgress] = useState({});
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [loaded, setLoaded] = useState(false);
  const [achievementToast, setAchievementToast] = useState(null);
  const [achievementQueue, setAchievementQueue] = useState([]);
  const [stageUpToast, setStageUpToast] = useState(null);
  const [showSettings, setShowSettings] = useState(() => initialRoute.type === 'settings');
  const [showProfile, setShowProfile] = useState(() => initialRoute.type === 'profile');
  const [publicPage, setPublicPage] = useState(() => initialRoute.type === 'public' ? initialRoute.page : null);
  const [showStage1Celebration, setShowStage1Celebration] = useState(false);
  const [activeMiniUnitId, setActiveMiniUnitId] = useState(null);
  const [cardSession, setCardSession] = useState(null);
  const [showFirstLessonUnlock, setShowFirstLessonUnlock] = useState(false);
  const [rewardScreen, setRewardScreen] = useState(null);
  const [upgradePrompt, setUpgradePrompt] = useState(null);

  // Auth state. Anonymous access is gated to a 5-card demo (DemoMode); the
  // only paths to the full app are sign-in or sign-up.
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authReady, setAuthReady] = useState(!hasSupabaseConfig);
  const [demoMode, setDemoMode] = useState(() => {
    try { return localStorage.getItem('tuk-talk-thai-demo-mode') === 'true'; }
    catch { return false; }
  });
  const [forceAuthGate, setForceAuthGate] = useState(() => initialRoute.type === 'auth');
  const [showPublicLanding, setShowPublicLanding] = useState(() => {
    if (initialRoute.type === 'public') return false;
    try { return localStorage.getItem('tuk-talk-thai-demo-mode') !== 'true'; }
    catch { return true; }
  });
  const [authInitialScreen, setAuthInitialScreen] = useState(() => initialRoute.authScreen || 'welcome');
  const [cloudReady, setCloudReady] = useState(false);     // true once cloud has been synced into local state
  const [profileChecked, setProfileChecked] = useState(!hasSupabaseConfig); // true after profile fetch resolves (skipped if no Supabase)
  const cloudSyncTimer = useRef(null);
  const cloudInitInFlight = useRef(false);                  // guards against duplicate cloud-init effects
  const oneSignalLinked = useRef(false);                    // guards setExternalUserId from firing repeatedly
  const notificationPromptFired = useRef(false);            // ensures we ask permission at most once per session
  const profileSettingsRef = useRef({});
  const reviewLocksRef = useRef(new Set());
  const missionRewardLocksRef = useRef(new Set());
  const achievementLocksRef = useRef(new Set());
  // Persisted anti-rush guard: { rushRun, lastRatingAt }. Lazily hydrated once
  // from localStorage so the cap survives refresh / route changes / re-entry.
  const rushGuardRef = useRef(null);
  if (rushGuardRef.current === null) rushGuardRef.current = loadRushGuard();

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => subscription.unsubscribe();
  }, []);

  const applyRouteState = useCallback((route) => {
    setActiveMiniUnitId(null);
    setCardSession(null);

    if (route.type === 'public') {
      setPublicPage(route.page);
      setShowProfile(false);
      setShowSettings(false);
      setForceAuthGate(false);
      setShowPublicLanding(false);
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
    if (session && (route.type === 'auth' || route.type === 'landing')) {
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
              setStats(s => migrateStats({ ...s, ...cloudSettings }));
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

  const startDemo = useCallback(() => {
    try { localStorage.setItem('tuk-talk-thai-demo-mode', 'true'); } catch { /* ignore */ }
    setDemoMode(true);
    setForceAuthGate(false);
    setShowPublicLanding(false);
    setPublicPage(null);
  }, []);

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
    setForceAuthGate(true);
    writeRoute(screen === 'signin' ? '/sign-in' : '/welcome');
  }, []);

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
    if (!session || !loaded || cloudReady || cloudInitInFlight.current || !hasSupabaseConfig) return;
    if (!session.user?.email_confirmed_at) return;
    cloudInitInFlight.current = true;
    let cancelled = false;
    (async () => {
      try {
        const cloudProgress = await downloadProgress(session.user.id);
        const safeCloudProgress = cloudProgress && typeof cloudProgress === 'object' ? cloudProgress : {};
        const safeLocalProgress = progress && typeof progress === 'object' ? progress : {};
        const cloudHasData = Object.keys(safeCloudProgress).length > 0;
        const localHasData = Object.keys(safeLocalProgress).length > 0;
        const [cloudStatsData, cloudAchs] = await Promise.all([
          downloadStats(session.user.id),
          downloadAchievements(session.user.id),
        ]);
        if (cancelled) return;
        const cloudHasState = cloudHasData || hasStatsLearningActivity(cloudStatsData || {}) || (cloudAchs && cloudAchs.length > 0);
        if (localHasData && !cloudHasState) {
          await uploadFullState(session.user.id, safeLocalProgress, stats);
          if (!cancelled) setCloudReady(true);
        } else {
          if (cloudHasData) setProgress(safeCloudProgress);
          if (cloudStatsData) {
            setStats(s => migrateStats({
              ...s,
              ...cloudStatsData,
              firstLessonCompleted: s.firstLessonCompleted || cloudHasData || cloudStatsData.firstLessonCompleted,
              unlockedAchievements: cloudAchs || s.unlockedAchievements || [],
            }));
          } else if (cloudAchs && cloudAchs.length > 0) {
            setStats(s => ({ ...s, firstLessonCompleted: true, unlockedAchievements: cloudAchs }));
          } else if (cloudHasData) {
            setStats(s => ({ ...s, firstLessonCompleted: true }));
          }
          setCloudReady(true);
        }
      } catch (e) {
        console.warn('[App] cloud init failed', e);
        // Fall back to local-only mode; user can retry by signing out and back in.
        if (!cancelled) setCloudReady(true);
      } finally {
        cloudInitInFlight.current = false;
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
      // Moving past Stage 1 → the big Stage1CompleteCelebration modal handles
      // that transition. Suppress the small toast in that case so the user
      // doesn't see two celebrations stacked.
      const movingPastS1 = (stats.currentStage || 1) === 1;
      if (!movingPastS1) {
        const advancedTo = STAGES.find(S => S.id === stageState.currentStage);
        if (advancedTo) setStageUpToast(advancedTo);
      }
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
  // figuring out the app). Fires at most once per session via a ref guard.
  useEffect(() => {
    if (!session || !isEmailConfirmed || !hasOneSignalConfig || !stats.hasOnboarded) return;
    if (notificationPromptFired.current) return;
    if (profile?.onesignal_player_id) return; // already subscribed
    notificationPromptFired.current = true;
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
      const isNewDay = s.todayDate !== today;
      const yesterday = previousLocalDateKey();
      let newStreak = s.streak || 0;
      if (isNewDay) {
        if (s.lastStudy === yesterday) {
          newStreak = newStreak + 1;
        } else if (s.lastStudy !== today) {
          const daysSince = s.lastStudy ? Math.floor((Date.now() - new Date(s.lastStudy).getTime()) / DAY_MS) : 999;
          if (daysSince <= 2 && (s.streakFreezes || 0) > 0) {
            newStreak = newStreak + 1;
            return startStudyDay(s, today, newStreak, amount, true);
          }
          newStreak = 1;
        }
      }
      return startStudyDay(s, today, newStreak, amount, false);
    });
  }, []);

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
          grantXp(MISSION_REWARD_XP);
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
  }, [missionState, loaded, stats.lastSeenMission, stats.streak, grantXp, session]);

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
      const newAchievements = newly.map(id => ACHIEVEMENTS.find(a => a.id === id)).filter(Boolean);
      // Show the first one immediately, queue the rest
      setAchievementToast(prev => prev || newAchievements[0]);
      if (newAchievements.length > 1) {
        setAchievementQueue(q => [...q, ...newAchievements.slice(1)]);
      }
      setStats(s => ({ ...s, unlockedAchievements: unlocked }));
    }
  }, [stats.totalReviews, stats.streak, stats.tonesQuizPassed, stats.perfectQuizzes, stats.dialoguesCompleted, stats.totalXp, stats.dailyGoalsHit, stats.currentStage, loaded]);

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

  const [lastReviewSnapshot, setLastReviewSnapshot] = useState(null);

  const reviewOne = useCallback((cardId, rating) => {
    const previousProgress = progress?.[cardId] || null;
    const reviewKey = `${cardId}:${previousProgress?.lastReview || 'new'}`;
    if (reviewLocksRef.current.has(reviewKey)) return false;
    reviewLocksRef.current.add(reviewKey);
    window.setTimeout(() => reviewLocksRef.current.delete(reviewKey), 1500);

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
    // XP by source. A new learning card earns once; a genuinely DUE review earns
    // review XP. Re-practicing a card that is NOT due (already learned, scheduled
    // in the future — e.g. a completed-stage card) earns 0, so XP can't be farmed
    // by looping old cards. SRS scheduling + review counts below are unaffected;
    // only the XP currency is gated. The rush cap still applies on top.
    const isNewCard = !previousProgress;
    const isDueReview = !!previousProgress && (previousProgress.nextDue || 0) <= now;
    const earnsXp = isNewCard || isDueReview;
    const xp = !earnsXp ? 0 : (rushed ? Math.min(baseXp, RUSH_XP_CAP) : baseXp);
    // Commit + persist immediately so the cap is durable mid-session.
    rushGuardRef.current = { rushRun: nextRun, lastRatingAt: now };
    saveRushGuard(rushGuardRef.current);
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
      timestamp: now,
    });
    setProgress(p => {
      const safeProgress = p && typeof p === 'object' ? p : {};
      const newState = reviewCard(safeProgress[cardId], rating);
      return { ...safeProgress, [cardId]: newState };
    });
    setStats(s => ({ ...s, totalReviews: (s.totalReviews || 0) + 1 }));
    if (xp > 0) grantXp(xp);
    return { accepted: true, rushed };
  }, [grantXp, progress]);

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

  const recordTonesQuiz = useCallback((score, total) => {
    const passed = (score / total) >= 0.8;
    grantXp(score * XP_REWARDS.toneQuizCorrect);
    setStats(s => ({
      ...s,
      tonesQuizBest: Math.max(s.tonesQuizBest || 0, score),
      tonesQuizPassed: passed || s.tonesQuizPassed,
      quizzesPassed: passed ? (s.quizzesPassed || 0) + 1 : (s.quizzesPassed || 0),
      perfectQuizzes: score === total ? (s.perfectQuizzes || 0) + 1 : (s.perfectQuizzes || 0),
    }));
  }, [grantXp]);

  const recordQuizComplete = useCallback((score, total) => {
    const passed = (score / total) >= 0.8;
    const correct = Math.max(0, score || 0);
    const wrong = Math.max(0, (total || 0) - correct);
    const today = getLocalDateKey();
    grantXp(score * XP_REWARDS.quizCorrect);
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
  }, [grantXp]);

  const recordDialogueComplete = useCallback((dialogueId) => {
    setStats(s => {
      const done = s.dialoguesCompleted || [];
      if (done.includes(dialogueId)) return s;
      return { ...s, dialoguesCompleted: [...done, dialogueId] };
    });
    grantXp(10);
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
    setStats(s => ({
      ...s,
      hasOnboarded: true,
      startedStage,
      currentStage: startedStage,
      voice: voiceChoice || s.voice || DEFAULT_VOICE,
    }));
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
  }, [markCardsKnown, session]);

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

  const requestSuperPrompt = useCallback((reason = 'mission') => {
    const today = getLocalDateKey();
    const lastShown = stats.superPromptLastShownAt || getLocalSuperPromptDate();
    if (dateKeyFromValue(lastShown) === today) return false;

    const shownAt = new Date().toISOString();
    setLocalSuperPromptDate(shownAt);
    updateSettings({ superPromptLastShownAt: shownAt });
    setUpgradePrompt({ reason });
    return true;
  }, [stats.superPromptLastShownAt, updateSettings]);

  const handleOpenPremium = useCallback(() => {
    setUpgradePrompt(null);
    setRewardScreen(null);
    handleNavigatePath('/premium');
  }, [handleNavigatePath]);

  const handleRewardContinue = useCallback(() => {
    const promptReason = rewardScreen?.superPromptReason;
    setRewardScreen(null);
    if (promptReason) {
      window.setTimeout(() => requestSuperPrompt(promptReason), 120);
    }
  }, [requestSuperPrompt, rewardScreen?.superPromptReason]);

  const handleLockedFeature = useCallback(() => {
    requestSuperPrompt('locked');
  }, [requestSuperPrompt]);

  const firstLessonCompleted = !!stats.firstLessonCompleted;

  const completeFirstLesson = useCallback(() => {
    const completedMiniUnits = [...new Set([
      ...(stats.completedMiniUnits || []),
      STAGE_1_MINI_UNIT_PILOT.unitId,
    ])];
    grantXp(FIRST_LESSON_REWARD_XP);
    setRewardScreen({
      id: `first-lesson-${Date.now()}`,
      title: 'First Mission Complete',
      subtitle: 'You finished the guided starter lesson and unlocked the main practice path.',
      xpEarned: FIRST_LESSON_REWARD_XP,
      streak: Math.max(1, stats.streak || 0),
      nextStep: 'Cards and Challenge',
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
  }, [grantXp, stats.completedMiniUnits, stats.streak, updateSettings]);

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
    const currentProgress = stats.miniUnitProgress?.unitId === unitId
      ? stats.miniUnitProgress
      : {
          unitId,
          step: 'intro',
          vocabIndex: 0,
          revealed: false,
          challengeIndex: 0,
          selectedId: null,
          checked: false,
          challengeScore: 0,
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
    const completed = stats.completedMiniUnits || [];
    if (progressUpdate.step === 'complete' && !completed.includes(progressUpdate.unitId)) {
      updates.completedMiniUnits = [...new Set([
        ...completed,
        progressUpdate.unitId,
      ])];
      grantXp(MINI_UNIT_REWARD_XP);
      setRewardScreen({
        id: `mini-unit-${progressUpdate.unitId}-${Date.now()}`,
        title: 'Mini-Unit Complete',
        subtitle: 'You finished a guided lesson and checked your recall.',
        xpEarned: MINI_UNIT_REWARD_XP,
        streak: stats.streak || 0,
        nextStep: 'Review or Challenge',
        superPromptReason: 'mini-unit',
      });
    }
    updateSettings(updates);
  }, [grantXp, stats.completedMiniUnits, stats.streak, updateSettings]);

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
  const voice = stats.voice || DEFAULT_VOICE;
  const viewMode = stats.viewMode || DEFAULT_VIEW_MODE;
  const activeMiniUnit = activeMiniUnitId ? getMiniUnit(activeMiniUnitId) : null;

  if (publicPage) {
    return (
      <div className="app-root" data-theme={stats.theme || 'light'} data-view-mode={viewMode}>
        <PublicInfoPage
          page={publicPage}
          isAuthed={!!session}
          onNavigate={handleNavigatePath}
        />
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
    return <div className="app-root" data-theme={stats.theme || 'light'} />;
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
        <PublicLanding
          onGetStarted={() => openAuthGate('welcome')}
          onSignIn={() => openAuthGate('signin')}
          onOpenPublicPage={handleNavigatePath}
          audioRate={stats.audioRate || 0.95}
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
        <AuthGate
          initialScreen={authInitialScreen}
          onTryDemo={startDemo}
          onAuthSuccess={handleAuthSuccess}
          onOpenPublicPage={handleNavigatePath}
          onScreenChange={(screen) => writeRoute(screen === 'signin' ? '/sign-in' : '/welcome')}
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
          viewMode={viewMode}
          audioRate={stats.audioRate || 0.95}
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
    return <div className="app-root" data-theme={stats.theme || 'light'} />;
  }

  if (loaded && !stats.hasOnboarded) {
    return (
      <div className="app-root" data-theme={stats.theme || 'light'} data-view-mode={viewMode}>

        <PlacementOnboarding onComplete={completeOnboarding} />
      </div>
    );
  }

  if (loaded && stats.hasOnboarded && session && isEmailConfirmed && !cloudReady && !firstLessonCompleted) {
    return <div className="app-root" data-theme={stats.theme || 'light'} data-view-mode={viewMode} />;
  }

  if (loaded && stats.hasOnboarded && !firstLessonCompleted) {
    return (
      <div className="app-root" data-theme={stats.theme || 'light'} data-view-mode={viewMode}>
        <FirstLessonFlow
          unit={STAGE_1_MINI_UNIT_PILOT}
          voice={voice}
          audioRate={stats.audioRate || 0.95}
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
      {activeMiniUnit ? (
        <MiniUnitFlow
          unit={activeMiniUnit}
          voice={voice}
          audioRate={stats.audioRate || 0.95}
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
          {tab === 'learn'  && <LearnPath stats={stats} fullStats={stats} dashboardStats={dashboardStats} stageState={stageState} missionState={missionState} setTab={handleSetTab} onStartMiniUnit={handleStartMiniUnit} onLockedFeature={handleLockedFeature} onStartMissionCards={handleStartMissionCards} />}
          {tab === 'today'  && <TodayTab stats={dashboardStats} fullStats={stats} setTab={handleSetTab} stageState={stageState} missionState={missionState} voice={voice} viewMode={viewMode} onStartMissionCards={handleStartMissionCards} />}
          {tab === 'cards'  && <CardsTab progress={progress} reviewOne={reviewOne} markCardKnown={markCardKnown} dailyNewLimit={stats.dailyNewLimit} voice={voice} viewMode={viewMode} startedStage={stats.startedStage || 1} maxUnlockedStage={maxUnlockedStage} audioRate={stats.audioRate || 0.95} audioAutoPlay={!!stats.audioAutoPlay} showCharacters={stats.showCharacters !== false} undoLastReview={undoLastReview} lastReviewSnapshot={lastReviewSnapshot} sessionScope={cardSession} setTab={handleSetTab} stageState={stageState} />}
          {tab === 'browse' && <BrowseTab progress={progress} maxUnlockedStage={maxUnlockedStage} recordDialogueComplete={recordDialogueComplete} dialoguesCompleted={stats.dialoguesCompleted || []} voice={voice} viewMode={viewMode} audioRate={stats.audioRate || 0.95} />}
          {tab === 'quiz'   && <QuizTab onComplete={recordQuizComplete} maxUnlockedStage={maxUnlockedStage} stageState={stageState} progress={progress} voice={voice} viewMode={viewMode} audioRate={stats.audioRate || 0.95} showCharacters={stats.showCharacters !== false} />}
          {tab === 'guide'  && <GuideTab onTonesQuizComplete={recordTonesQuiz} tonesQuizBest={stats.tonesQuizBest || 0} tonesQuizPassed={stats.tonesQuizPassed} />}
          {tab === 'quests' && <QuestsScreen stats={stats} dashboardStats={dashboardStats} setTab={handleSetTab} locked={maxUnlockedStage < 2} onOpenSuper={handleOpenPremium} />}
          {tab === 'shop'   && <ShopScreen stats={stats} onOpenSuper={handleOpenPremium} />}
          {tab === 'leaderboard' && <LeaderboardScreen stats={stats} onOpenSuper={handleOpenPremium} />}
        </>
      )}

      {achievementToast && (
        <AchievementToast achievement={achievementToast} onClose={handleAchievementToastClose} />
      )}
      {stageUpToast && (
        <StageUpToast stage={stageUpToast} onClose={() => setStageUpToast(null)} />
      )}
      {showStage1Celebration && (
        <Stage1CompleteCelebration onClose={() => setShowStage1Celebration(false)} />
      )}
      {showSettings && (
        <SettingsModal stats={stats} updateSettings={updateSettings} onClose={handleCloseSettings} onOpenPublicPage={handleNavigatePath} />
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
          onClose={() => setUpgradePrompt(null)}
          onSeeSuper={handleOpenPremium}
        />
      )}
    </AppShell>
  );
}
