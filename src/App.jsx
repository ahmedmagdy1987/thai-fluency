import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Home, Layers, BookOpen, Award, Compass, Flame, Settings, Zap } from 'lucide-react';

import { CARDS } from './data/cards.js';
import { STAGES } from './data/taxonomy.js';
import { ACHIEVEMENTS, XP_REWARDS, DEFAULT_DAILY_GOAL } from './data/gamification.js';

import { reviewCard, getStats, DAY_MS } from './lib/srs.js';
import { loadState, saveState, clearState } from './lib/storage.js';
import { DEFAULT_VOICE, DEFAULT_VIEW_MODE } from './lib/voice.js';
import { getStageState, getMissionState, checkAchievements } from './lib/state.js';
import { DEFAULT_STATS, migrateStats, startStudyDay } from './lib/stats.js';
import { MISSIONS } from './data/taxonomy.js';
import { supabase, hasSupabaseConfig } from './lib/supabase.js';
import {
  uploadProgress,
  uploadStats,
  uploadAchievements,
  uploadFullState,
  downloadProgress,
  downloadStats,
  downloadAchievements,
} from './lib/cloudStorage.js';

import TodayTab from './components/TodayTab.jsx';
import CardsTab from './components/CardsTab.jsx';
import BrowseTab from './components/BrowseTab.jsx';
import QuizTab from './components/QuizTab.jsx';
import GuideTab from './components/GuideTab.jsx';
import NavBtn from './components/NavBtn.jsx';
import AchievementToast from './components/AchievementToast.jsx';
import StageUpToast from './components/StageUpToast.jsx';
import MissionCompleteToast from './components/MissionCompleteToast.jsx';
import Stage1CompleteCelebration from './components/Stage1CompleteCelebration.jsx';
import PlacementOnboarding from './components/PlacementOnboarding.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import AuthGate from './components/auth/AuthGate.jsx';
import UserMenu from './components/auth/UserMenu.jsx';
import MigrationPrompt from './components/auth/MigrationPrompt.jsx';
import DemoMode from './components/DemoMode.jsx';

export default function TukTalkThaiApp() {
  const [tab, setTab] = useState('today');
  const [progress, setProgress] = useState({});
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [loaded, setLoaded] = useState(false);
  const [achievementToast, setAchievementToast] = useState(null);
  const [achievementQueue, setAchievementQueue] = useState([]);
  const [stageUpToast, setStageUpToast] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [missionToast, setMissionToast] = useState(null);
  const [showStage1Celebration, setShowStage1Celebration] = useState(false);

  // Auth state. Anonymous access is gated to a 5-card demo (DemoMode); the
  // only paths to the full app are sign-in or sign-up.
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authReady, setAuthReady] = useState(!hasSupabaseConfig);
  const [demoMode, setDemoMode] = useState(() => {
    try { return localStorage.getItem('tuk-talk-thai-demo-mode') === 'true'; }
    catch { return false; }
  });
  const [forceAuthGate, setForceAuthGate] = useState(false);
  const [authInitialScreen, setAuthInitialScreen] = useState('welcome');
  const [cloudReady, setCloudReady] = useState(false);     // true once cloud has been synced into local state
  const [showMigration, setShowMigration] = useState(false);
  const cloudSyncTimer = useRef(null);
  const cloudInitInFlight = useRef(false);                  // guards against duplicate cloud-init effects

  useEffect(() => {
    (async () => {
      const saved = await loadState();
      if (saved) {
        setProgress(saved.progress || {});
        setStats(migrateStats(saved.stats || {}));
      }
      setLoaded(true);
    })();
  }, []);

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

  // Load profile when session changes
  useEffect(() => {
    if (!session || !hasSupabaseConfig) { setProfile(null); return; }
    let cancelled = false;
    supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle()
      .then(({ data }) => { if (!cancelled && data) setProfile(data); });
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  const startDemo = useCallback(() => {
    try { localStorage.setItem('tuk-talk-thai-demo-mode', 'true'); } catch { /* ignore */ }
    setDemoMode(true);
    setForceAuthGate(false);
  }, []);

  const handleDemoSignUp = useCallback(() => {
    setAuthInitialScreen('signup');
    setForceAuthGate(true);
  }, []);

  const handleDemoSignIn = useCallback(() => {
    setAuthInitialScreen('signin');
    setForceAuthGate(true);
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

  const handleSignOut = useCallback(async () => {
    if (!hasSupabaseConfig) return;
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
    setAuthInitialScreen('welcome');
  }, []);

  const handleHeaderSignInClick = useCallback(() => {
    setAuthInitialScreen('signin');
    setForceAuthGate(true);
  }, []);

  // Cloud init: when a user is signed in and local state is loaded, decide
  // whether to upload local-only progress (migration prompt) or just download
  // whatever's on the cloud. Runs exactly once per session.
  useEffect(() => {
    if (!session || !loaded || cloudReady || cloudInitInFlight.current || !hasSupabaseConfig) return;
    cloudInitInFlight.current = true;
    let cancelled = false;
    (async () => {
      try {
        const cloudProgress = await downloadProgress(session.user.id);
        const cloudHasData = Object.keys(cloudProgress).length > 0;
        const localHasData = Object.keys(progress).length > 0;
        if (cancelled) return;
        if (localHasData && !cloudHasData) {
          // Conflict: local has work, cloud is empty. Ask the user.
          setShowMigration(true);
          // cloudReady stays false until migration resolves.
        } else {
          const [cloudStatsData, cloudAchs] = await Promise.all([
            downloadStats(session.user.id),
            downloadAchievements(session.user.id),
          ]);
          if (cancelled) return;
          if (cloudHasData) setProgress(cloudProgress);
          if (cloudStatsData) {
            setStats(s => ({ ...s, ...cloudStatsData, unlockedAchievements: cloudAchs || s.unlockedAchievements || [] }));
          } else if (cloudAchs && cloudAchs.length > 0) {
            setStats(s => ({ ...s, unlockedAchievements: cloudAchs }));
          }
          setCloudReady(true);
        }
      } catch (e) {
        console.warn('[App] cloud init failed', e);
        // Fall back to local-only mode; user can retry by signing out and back in.
      } finally {
        cloudInitInFlight.current = false;
      }
    })();
    return () => { cancelled = true; };
  }, [session, loaded, cloudReady]);

  // Periodic cloud sync: debounced uploads of progress + stats + achievements
  // whenever local state changes. Only fires after cloud init has resolved.
  useEffect(() => {
    if (!session || !cloudReady || !loaded || !hasSupabaseConfig) return;
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

  const handleMigrateLocal = useCallback(async () => {
    if (!session) return;
    await uploadFullState(session.user.id, progress, stats);
    setShowMigration(false);
    setCloudReady(true);
  }, [session, progress, stats]);

  const handleSkipMigration = useCallback(async () => {
    if (!session) return;
    // Discard local progress; load whatever's on the cloud (likely defaults
    // since the user just signed up).
    try {
      const [cloudStatsData, cloudAchs] = await Promise.all([
        downloadStats(session.user.id),
        downloadAchievements(session.user.id),
      ]);
      setProgress({});
      setStats(s => ({
        ...DEFAULT_STATS,
        ...(cloudStatsData || {}),
        // Preserve a couple of local-only fields we don't want to clobber.
        voice: s.voice || DEFAULT_VOICE,
        viewMode: s.viewMode || DEFAULT_VIEW_MODE,
        theme: s.theme || 'light',
        unlockedAchievements: cloudAchs || [],
        hasOnboarded: false, // fresh start → re-run placement
      }));
    } finally {
      setShowMigration(false);
      setCloudReady(true);
    }
  }, [session]);

  useEffect(() => {
    if (loaded && !demoMode) saveState({ progress, stats });
  }, [progress, stats, loaded, demoMode]);

  useEffect(() => {
    if (!loaded) return;
    const today = new Date().toDateString();
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

  // Mission advancement: when currentMission increases past lastSeenMission,
  // celebrate the mission that just finished. The "just finished" mission is
  // currentMission - 1 (or M6 if everything is done).
  useEffect(() => {
    if (!loaded || !missionState) return;
    const lastSeen = stats.lastSeenMission || 1;
    const cur = missionState.currentMission;
    if (cur > lastSeen) {
      // Mission(s) finished in between. Toast the one that just completed.
      const justFinished = MISSIONS.find(m => m.id === cur - 1);
      if (justFinished) setMissionToast(justFinished);
      setStats(s => ({ ...s, lastSeenMission: cur }));
    }
  }, [missionState, loaded]);

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
    const newly = unlocked.filter(id => !(stats.unlockedAchievements || []).includes(id));
    if (newly.length > 0) {
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

  const grantXp = useCallback((amount) => {
    setStats(s => {
      const today = new Date().toDateString();
      const isNewDay = s.todayDate !== today;
      const yesterday = new Date(Date.now() - DAY_MS).toDateString();
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

  const [lastReviewSnapshot, setLastReviewSnapshot] = useState(null);

  const reviewOne = useCallback((cardId, rating) => {
    // Snapshot previous state for undo
    setLastReviewSnapshot({
      cardId,
      rating,
      previousProgress: progress[cardId] || null,
      timestamp: Date.now(),
    });
    setProgress(p => {
      const newState = reviewCard(p[cardId], rating);
      return { ...p, [cardId]: newState };
    });
    setStats(s => ({ ...s, totalReviews: (s.totalReviews || 0) + 1 }));
    const xp = rating === 1 ? XP_REWARDS.again : rating === 2 ? XP_REWARDS.hard : rating === 3 ? XP_REWARDS.good : XP_REWARDS.easy;
    grantXp(xp);
  }, [grantXp, progress]);

  const undoLastReview = useCallback(() => {
    if (!lastReviewSnapshot) return;
    const { cardId, rating, previousProgress } = lastReviewSnapshot;
    setProgress(p => {
      const next = { ...p };
      if (previousProgress) next[cardId] = previousProgress;
      else delete next[cardId];
      return next;
    });
    // Reverse XP and review counter (don't try to reverse streak — too tricky and not worth it)
    const xp = rating === 1 ? XP_REWARDS.again : rating === 2 ? XP_REWARDS.hard : rating === 3 ? XP_REWARDS.good : XP_REWARDS.easy;
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
    grantXp(score * XP_REWARDS.quizCorrect);
    setStats(s => ({
      ...s,
      quizzesPassed: passed ? (s.quizzesPassed || 0) + 1 : (s.quizzesPassed || 0),
      perfectQuizzes: score === total ? (s.perfectQuizzes || 0) + 1 : (s.perfectQuizzes || 0),
    }));
  }, [grantXp]);

  const recordDialogueComplete = useCallback((dialogueId) => {
    setStats(s => {
      const done = s.dialoguesCompleted || [];
      if (done.includes(dialogueId)) return s;
      return { ...s, dialoguesCompleted: [...done, dialogueId] };
    });
    grantXp(10);
  }, [grantXp]);

  const resetAll = useCallback(() => {
    if (window.confirm('Reset ALL progress? This cannot be undone.')) {
      setProgress({});
      setStats(DEFAULT_STATS);
    }
  }, []);

  const markCardsKnown = useCallback((cardIds) => {
    setProgress(p => {
      const next = { ...p };
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
  }, [markCardsKnown]);

  const updateSettings = useCallback((updates) => {
    setStats(s => ({ ...s, ...updates }));
  }, []);

  // Sequential stage unlock: only stages ≤ maxUnlockedStage are accessible.
  // Stage N+1 unlocks when Stage N reaches 70% mastery. dashboardStats, the
  // Cards tab SRS pool, Browse listing, and the Quiz pool all filter to the
  // unlocked window. The mission view (S1 only) is a special case within this.
  const maxUnlockedStage = stageState ? stageState.maxUnlockedStage : 1;
  const eligibleCards = useMemo(
    () => CARDS.filter(c => (c.stage || 1) <= maxUnlockedStage),
    [maxUnlockedStage]
  );
  const dashboardStats = useMemo(() => getStats(progress, eligibleCards), [progress, eligibleCards]);
  const voice = stats.voice || DEFAULT_VOICE;
  const viewMode = stats.viewMode || DEFAULT_VIEW_MODE;

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

  // Auth gate: every anonymous visitor must either sign in/up or pick the
  // 5-card demo. forceAuthGate wins over demoMode so a demo user can convert
  // by clicking the header "Sign in" button or the demo's end-CTA buttons.
  const showAuthGate = hasSupabaseConfig && authReady && !session && (forceAuthGate || !demoMode);
  if (showAuthGate) {
    return (
      <div className="app-root" data-theme={stats.theme || 'light'}>
        <AuthGate
          initialScreen={authInitialScreen}
          onTryDemo={startDemo}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  // Demo mode: 5 curated cards, read-only, no progress saved.
  const showDemo = hasSupabaseConfig && authReady && !session && demoMode && !forceAuthGate;
  if (showDemo) {
    return (
      <div className="app-root" data-theme={stats.theme || 'light'}>
        <DemoMode onSignUp={handleDemoSignUp} onSignIn={handleDemoSignIn} />
      </div>
    );
  }

  // Migration prompt: shown when newly signed-in user has local-only progress
  // and the cloud is empty. Blocks the rest of the app until resolved.
  if (showMigration) {
    return (
      <div className="app-root" data-theme={stats.theme || 'light'}>
        <MigrationPrompt
          cardCount={Object.keys(progress).length}
          totalXp={stats.totalXp || 0}
          streak={stats.streak || 0}
          onMigrate={handleMigrateLocal}
          onSkip={handleSkipMigration}
        />
      </div>
    );
  }

  if (loaded && !stats.hasOnboarded) {
    return (
      <div className="app-root" data-theme={stats.theme || 'light'} data-view-mode={viewMode}>

        <PlacementOnboarding onComplete={completeOnboarding} />
      </div>
    );
  }

  return (
    <div className="app-root" data-theme={stats.theme || 'light'} data-view-mode={viewMode}>
      

      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-thai">ตุ๊กตุ๊ก</span>
            <span className="brand-thai-ph">dtúk dtúk</span>
            <span className="brand-en">Tuk Talk Thai</span>
          </div>
          <div className="header-stats">
            {dashboardStats.due > 0 && (
              <div className="due-pill" onClick={() => setTab('cards')}>
                <Flame size={12} />
                <span>{dashboardStats.due} due</span>
              </div>
            )}
            {stats.streak > 0 && (
              <div className="streak-pill" title={`${stats.streakFreezes || 0} freeze${(stats.streakFreezes || 0) === 1 ? '' : 's'} available`}>
                <span className="streak-icon">🔥</span>
                <span>{stats.streak}</span>
              </div>
            )}
            <div className="xp-pill" title="Total XP">
              <Zap size={12} />
              <span>{stats.totalXp || 0}</span>
            </div>
            {hasSupabaseConfig && session && (
              <UserMenu profile={profile} session={session} onSignOut={handleSignOut} />
            )}
            {hasSupabaseConfig && !session && (
              <button className="header-signin-btn" onClick={handleHeaderSignInClick} title="Sign in to save progress">
                Sign in
              </button>
            )}
            <button className="settings-btn" onClick={() => setShowSettings(true)} title="Settings">
              <Settings size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {tab === 'today'  && <TodayTab stats={dashboardStats} fullStats={stats} setTab={setTab} stageState={stageState} missionState={missionState} resetAll={resetAll} voice={voice} viewMode={viewMode} />}
        {tab === 'cards'  && <CardsTab progress={progress} reviewOne={reviewOne} markCardKnown={markCardKnown} dailyNewLimit={stats.dailyNewLimit} voice={voice} viewMode={viewMode} startedStage={stats.startedStage || 1} maxUnlockedStage={maxUnlockedStage} audioRate={stats.audioRate || 0.85} audioAutoPlay={!!stats.audioAutoPlay} undoLastReview={undoLastReview} lastReviewSnapshot={lastReviewSnapshot} />}
        {tab === 'browse' && <BrowseTab progress={progress} maxUnlockedStage={maxUnlockedStage} recordDialogueComplete={recordDialogueComplete} dialoguesCompleted={stats.dialoguesCompleted || []} voice={voice} viewMode={viewMode} audioRate={stats.audioRate || 0.85} />}
        {tab === 'quiz'   && <QuizTab onComplete={recordQuizComplete} maxUnlockedStage={maxUnlockedStage} voice={voice} viewMode={viewMode} />}
        {tab === 'guide'  && <GuideTab onTonesQuizComplete={recordTonesQuiz} tonesQuizBest={stats.tonesQuizBest || 0} tonesQuizPassed={stats.tonesQuizPassed} />}
      </main>

      {achievementToast && (
        <AchievementToast achievement={achievementToast} onClose={handleAchievementToastClose} />
      )}
      {stageUpToast && (
        <StageUpToast stage={stageUpToast} onClose={() => setStageUpToast(null)} />
      )}
      {missionToast && (
        <MissionCompleteToast mission={missionToast} onClose={() => setMissionToast(null)} />
      )}
      {showStage1Celebration && (
        <Stage1CompleteCelebration onClose={() => setShowStage1Celebration(false)} />
      )}
      {showSettings && (
        <SettingsModal stats={stats} updateSettings={updateSettings} onClose={() => setShowSettings(false)} resetAll={resetAll} />
      )}

      <nav className="app-nav">
        <NavBtn active={tab === 'today'}  onClick={() => setTab('today')}  Icon={Home}      label="Today" />
        <NavBtn active={tab === 'cards'}  onClick={() => setTab('cards')}  Icon={Layers}    label="Cards" badge={dashboardStats.due > 0 ? dashboardStats.due : null} />
        <NavBtn active={tab === 'browse'} onClick={() => setTab('browse')} Icon={BookOpen}  label="Browse" />
        <NavBtn active={tab === 'quiz'}   onClick={() => setTab('quiz')}   Icon={Award}     label="Quiz" />
        <NavBtn active={tab === 'guide'}  onClick={() => setTab('guide')}  Icon={Compass}   label="Guide" />
      </nav>
    </div>
  );
}
