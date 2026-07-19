// Visual-verification harness â€” mounts a single real component inside an
// .app-root wrapper (so all CSS tokens + dark theme resolve) for Playwright to
// screenshot / drive. NOT part of the production build; only Vite dev serves it.
import React from 'react';
import { createRoot } from 'react-dom/client';
import '../../src/styles/app.css';
import '../../src/styles/landing.css';
import '../../src/styles/plans.css';

import DatingSection from '../../src/components/DatingSection.jsx';
import QuizTab from '../../src/components/QuizTab.jsx';
import SettingsModal from '../../src/components/SettingsModal.jsx';
import ShopScreen from '../../src/components/ShopScreen.jsx';
import MiniUnitFlow from '../../src/components/MiniUnitFlow.jsx';
import TonesQuizSection from '../../src/components/TonesQuizSection.jsx';
import ListenMeaning from '../../src/components/ListenMeaning.jsx';
import ComboBadge from '../../src/components/ComboBadge.jsx';
import MissionCompleteRewardScreen from '../../src/components/MissionCompleteRewardScreen.jsx';
import StreakRecoveryCard from '../../src/components/StreakRecoveryCard.jsx';
import MasteryTrack, { MasterySummary } from '../../src/components/MasteryTrack.jsx';
import SpeakingExercise from '../../src/components/SpeakingExercise.jsx';
import SituationRail from '../../src/components/SituationRail.jsx';
import IdentityPathStep from '../../src/components/IdentityPathStep.jsx';
import LearnPath from '../../src/components/LearnPath.jsx';
import SuperActivationNotice from '../../src/components/SuperActivationNotice.jsx';
import PlansPage from '../../src/components/PlansPage.jsx';
import CelebrationOverlay from '../../src/components/CelebrationOverlay.jsx';
import { MAX_BANKED_FREEZES } from '../../src/lib/economy.js';
import { getStagePathSteps } from '../../src/lib/stagePath.js';
import { CARDS } from '../../src/data/cards.js';
import { STAGE_1_MINI_UNIT_PILOT, MINI_UNITS, getMiniUnitsForStage } from '../../src/data/miniUnits.js';
import { getStageState, getMissionState } from '../../src/lib/state.js';
import { getMiniUnitProgressState } from '../../src/lib/miniUnitSequence.js';
import { getCourseCompletion } from '../../src/lib/courseCompletion.js';

const params = new URLSearchParams(location.search);
const scene = params.get('scene') || 'dating-teaser';
const theme = params.get('theme') === 'dark' ? 'dark' : 'light';

// Speaking scenes need deterministic SpeechRecognition availability in headless.
if (scene === 'speaking' && !window.SpeechRecognition && !window.webkitSpeechRecognition) {
  window.SpeechRecognition = function SpeechRecognitionStub() { this.start = () => {}; this.stop = () => {}; this.abort = () => {}; };
}
if (scene === 'speaking-unsupported') {
  window.SpeechRecognition = undefined;
  window.webkitSpeechRecognition = undefined;
}

const noop = () => {};
const superStats = { tier: 'super', hearts: 5, gems: 200, streak: 3, totalXp: 500, totalReviews: 40 };
const freeStats = { tier: 'free', hearts: 5, gems: 60, streak: 3, totalXp: 500, totalReviews: 40 };
const zeroHeartStats = { tier: 'free', hearts: 0, gems: 10, heartsUpdatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() };
// Canceled-but-still-paid Super (auto-renew OFF, period NOT ended): the provider
// set status='canceled' with cancel_at_period_end=false and a FUTURE super_until â€”
// the B5 copy edge. Copy must read "Super â€” active until <date>. Auto-renew is
// off." with NO Cancel button.
const canceledPaidStats = { tier: 'super', status: 'canceled', cancelAtPeriodEnd: false, superUntil: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), hearts: 5, gems: 200, streak: 3, totalXp: 500, totalReviews: 40 };

// Seed "seen" progress for every Stage-1 card so buildChallenge has a pool.
const stage1Progress = {};
let s1count = 0;
for (const c of CARDS) if ((c.stage || 1) === 1) { stage1Progress[c.id] = { reps: 3, interval: 5, ease: 2.4, due: Date.now() }; s1count++; }
const stageState = {
  currentStage: 1,
  maxUnlockedStage: 8,
  stages: [{ id: 1, unlocked: true, total: s1count, complete: true, seen: s1count }],
};

function AppRoot({ children }) {
  return <div className="app-root" data-theme={theme} style={{ minHeight: '100vh' }}>{children}</div>;
}

// â”€â”€ Learn trail scenes: REAL state, REAL libs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Props are computed through the actual unlock logic (getStageState /
// getMissionState / getMiniUnitProgressState / getCourseCompletion), never
// hand-faked, so what renders is what the app derives. Handlers record to
// window.* so Playwright can assert the wiring (launch / lock / tab).
function buildLearnProps({ completed = [], progress = {} } = {}) {
  const lpStats = {
    ...freeStats,
    startedStage: 1,
    hasOnboarded: true,
    tutorialSeen: true,
    firstLessonCompleted: true,
    completedMiniUnits: completed,
    miniUnitProgress: null,
    dailyGoal: 50,
    todayXp: 20,
  };
  return {
    stats: lpStats,
    fullStats: lpStats,
    dashboardStats: { due: 3, seen: Object.keys(progress).length, newAvail: 10 },
    stageState: getStageState(lpStats, progress),
    missionState: getMissionState(progress),
    courseCompletion: getCourseCompletion(MINI_UNITS, completed),
    setTab: (tab, opts) => { window.__LAST_TAB__ = { tab, opts: opts || null }; },
    onStartMiniUnit: (unitId) => { window.__LAST_START__ = unitId; },
    onLockedFeature: (S) => { window.__LOCKED_FEATURE__ = S ? S.id : null; },
    onStartMissionCards: (m) => { window.__LAST_MISSION__ = m ? m.id : null; },
  };
}

// Elephant-move scene: local state + a viz-only sim button that appends the
// CURRENT unit id to completedMiniUnits â€” exactly the write App.jsx's
// completion handler performs â€” so the real LearnPath re-derives and the
// coach travels to the new current node.
function LearnTrailMoveScene() {
  const s1Units = getMiniUnitsForStage(1);
  const [completed, setCompleted] = React.useState(() => s1Units.slice(0, 2).map(u => u.unitId));
  const simulateComplete = () => {
    setCompleted(c => {
      const seq = getMiniUnitProgressState(s1Units, c, null);
      return seq.currentUnitId ? [...new Set([...c, seq.currentUnitId])] : c;
    });
  };
  return (
    <div className="tab-content" style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
      <button
        type="button"
        id="viz-sim-complete"
        style={{ position: 'fixed', top: 4, right: 4, zIndex: 999 }}
        onClick={simulateComplete}
      >
        simulate lesson completion
      </button>
      <LearnPath {...buildLearnProps({ completed })} />
    </div>
  );
}

function sceneEl() {
  switch (scene) {
    case 'dating-teaser':
      return <DatingSection stats={freeStats} onOpenSuper={noop} setTab={noop} />;
    case 'dating-lesson':
    case 'dating-quiz':
      // Super + 18+ confirmed â†’ lands on the category selector.
      try { localStorage.setItem('thai-fluency-dating-adult-v1', JSON.stringify({ confirmedAt: Date.now() })); } catch {}
      return <DatingSection stats={superStats} onOpenSuper={noop} setTab={noop} />;
    case 'quiz-challenge':
      return (
        <div className="tab-content" style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
          <QuizTab onComplete={noop} maxUnlockedStage={8} stageState={stageState} progress={stage1Progress}
            voice="male" viewMode="both" audioRate={0.8} showCharacters isSuper gems={200} stats={superStats}
            onSpendHeart={noop} onRefillHearts={noop} onOpenSuper={noop} setTab={noop} />
        </div>
      );
    case 'out-of-hearts':
      return (
        <div className="tab-content" style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
          <QuizTab onComplete={noop} maxUnlockedStage={8} stageState={stageState} progress={stage1Progress}
            voice="male" viewMode="both" audioRate={0.8} showCharacters isSuper={false} gems={10} stats={zeroHeartStats}
            hearts={0} onSpendHeart={noop} onRefillHearts={noop} onOpenSuper={noop} setTab={noop} />
        </div>
      );
    case 'shop':
      return (
        <div className="tab-content" style={{ maxWidth: 720, margin: '0 auto' }}>
          <ShopScreen stats={freeStats} hearts={2} gems={60} isSuper={false} streakFreezes={1}
            onRefillHearts={noop} onBuyFreeze={noop} onOpenSuper={noop} />
        </div>
      );
    // â”€â”€ WAVE 12 scenes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    case 'shop-super':
      // A Super user has unlimited hearts, so the refill item must render as
      // INCLUDED â€” never priced at 50 gems, which is what shipped.
      return (
        <div className="tab-content" style={{ maxWidth: 720, margin: '0 auto' }}>
          <ShopScreen stats={superStats} hearts={5} gems={120} isSuper streakFreezes={2}
            onRefillHearts={noop} onBuyFreeze={noop} onOpenSuper={noop} />
        </div>
      );
    case 'shop-freeze-cap':
      // At MAX_BANKED_FREEZES the freeze item is unavailable WITH A REASON â€”
      // never a silent no-op, and never an unbounded 31-purchase run.
      return (
        <div className="tab-content" style={{ maxWidth: 720, margin: '0 auto' }}>
          <ShopScreen stats={freeStats} hearts={3} gems={900} isSuper={false}
            streakFreezes={MAX_BANKED_FREEZES}
            onRefillHearts={noop} onBuyFreeze={noop} onOpenSuper={noop} />
        </div>
      );
    // â”€â”€ WAVE 13 scenes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    case 'plans-purchase-pending':
      // G: the payer has completed checkout and the entitlement has not landed.
      // The CTA must NOT be payable â€” this is the window that produced double
      // subscriptions, because every old guard read isSuper(stats) (still false).
      return <PlansPage isAuthed isSuperUser={false} blockedReason="pending" onNavigate={noop} onGetStarted={noop} onSignIn={noop} />;
    case 'plans-unconfirmed-email':
      // H: a session exists but the email is unconfirmed. /plans renders before
      // the confirmation gate, so it must refuse to sell here.
      return <PlansPage isAuthed isSuperUser={false} blockedReason="unconfirmed" onNavigate={noop} onGetStarted={noop} onSignIn={noop} />;
    case 'plans-super-user':
      // WAVE 16: for a Super user the page must not contradict itself — the Free
      // card said "Your plan" while both Super cards said "You're already Super".
      return <PlansPage isAuthed isSuperUser blockedReason={null} onNavigate={noop} onGetStarted={noop} onSignIn={noop} />;
    case 'plans-normal':
      // Control: a normal signed-in free user still gets a payable CTA.
      return <PlansPage isAuthed isSuperUser={false} blockedReason={null} onNavigate={noop} onGetStarted={noop} onSignIn={noop} />;
    case 'super-activation-pending':
      return <SuperActivationNotice status="pending" onDismiss={noop} onRefresh={noop} />;
    case 'super-activation-slow':
      return <SuperActivationNotice status="slow" onDismiss={noop} onRefresh={noop} />;
    case 'super-activation-timeout':
      return <SuperActivationNotice status="timeout" onDismiss={noop} onRefresh={noop} />;
    case 'super-celebration':
      // The celebration is now bound to the ENTITLEMENT landing, so it fires
      // however long the webhook takes â€” including after navigating away.
      return (
        <CelebrationOverlay
          eyebrow="Welcome to Super"
          title="Youâ€™re now Super! ًںژ‰"
          subtitle="Your Super plan is active â€” the 18+ Dating & Real Talk section and unlimited hearts are unlocked. Thank you for supporting Tuk Talk Thai!"
          primaryLabel="Letâ€™s go"
          onPrimary={noop}
        />
      );
    case 'reward-lessons-done': {
      // ROOT CAUSE 2: every guided lesson of stage 1 done, stage CARDS still
      // outstanding. The old build titled this "Stage 1 Path Complete" while the
      // trail said "words to go". It must now name what was actually finished.
      const units = getMiniUnitsForStage(1);
      const statsAfter = { completedMiniUnits: units.map(u => u.unitId) };
      const stateAfter = getStageState(statsAfter, {});
      const path = getStagePathSteps(1, { stageState: stateAfter, stats: statsAfter });
      return (
        <MissionCompleteRewardScreen
          title={path.allSatisfied ? 'Stage 1 Path Complete' : 'Stage 1 Lessons Complete'}
          subtitle={path.allSatisfied
            ? 'You finished every step in Stage 1. That is a real milestone.'
            : `Every guided lesson in Stage 1 is done. ${path.wordsStep.remaining} more words to finish the stage.`}
          xpEarned={20}
          streak={5}
          nextStep={path.allSatisfied ? 'Keep going in Learn' : 'Learn the remaining words'}
          onContinue={noop}
        />
      );
    }
    case 'settings':
      return <SettingsModal stats={superStats} updateSettings={noop} onClose={noop} onOpenPublicPage={noop}
        onEntitlementRefresh={noop} onReplayTutorial={noop} />;
    case 'settings-canceled':
      // B5: canceled-but-paid Super â€” expect "Super â€” active until <date>. Auto-
      // renew is off." and NO Cancel button in the Plan & Billing section.
      return <SettingsModal stats={canceledPaidStats} updateSettings={noop} onClose={noop} onOpenPublicPage={noop}
        onEntitlementRefresh={noop} onReplayTutorial={noop} />;
    case 'mini-unit': {
      // B6: MiniUnitFlow challenge (repeatable). Land on the challenge step so the
      // shuffled question + option order is on screen; reloading reshuffles.
      const unit = STAGE_1_MINI_UNIT_PILOT;
      return (
        <div className="tab-content" style={{ maxWidth: 720, margin: '0 auto' }}>
          <MiniUnitFlow unit={unit} voice="male" cardDirection="en-first" onChangeCardDirection={noop}
            audioRate={0.8} showCharacters
            initialProgress={{ unitId: unit.unitId, step: 'challenge', challengeIndex: 0, challengeScore: 0 }}
            onProgressChange={noop} onExit={noop} onOpenCards={noop} onOpenChallenge={noop} />
        </div>
      );
    }
    case 'tone-question':
    case 'tone-revealed':
      // Pass 1: audio-first Tone Challenge (diacritic hidden pre-answer, shown post-answer).
      return (
        <div className="tab-content" style={{ maxWidth: 640, margin: '0 auto', padding: 16 }}>
          <TonesQuizSection onComplete={noop} bestScore={0} passed={false} />
        </div>
      );
    case 'listen-meaning':
      // Pass 1: new audioâ†’English MCQ.
      return (
        <div className="tab-content" style={{ maxWidth: 640, margin: '0 auto', padding: 16 }}>
          <ListenMeaning voice="male" audioRate={0.9} showCharacters />
        </div>
      );
    case 'combo':
      // Pass 3: a live in-session combo celebration (10-in-a-row, hot pill + confetti).
      return (
        <div className="tab-content" style={{ maxWidth: 640, margin: '40px auto', padding: 16 }}>
          <div className="quiz-header">
            <div className="quiz-progress-text">Question 8 of 10</div>
            <div className="quiz-header-meta">
              <ComboBadge combo={{ current: 10, best: 10, milestone: 10, answered: 10, correct: 10, accuracy: 100 }} onMilestone={noop} />
              <div className="quiz-score-text">Score: <span>10</span></div>
            </div>
          </div>
          <div className="quiz-progress-bar"><div className="quiz-progress-fill" style={{ width: '80%' }} /></div>
        </div>
      );
    case 'payoff':
      // Pass 3: the shared end-of-session payoff with the new accuracy + best-combo cells.
      return (
        <MissionCompleteRewardScreen
          eyebrow="Session complete" title="Nice run!" subtitle="You kept a strong streak going."
          xpEarned={60} streak={5} accuracy={90} comboBest={7} nextStep="Mission 2 in Learn"
          characterId={null} onContinue={noop} />
      );
    case 'streak-recovery':
      // Pass 3: honest, non-shaming streak-break recovery with the gem-freeze bridge.
      return <StreakRecoveryCard bestStreak={12} gems={50} onStudyNow={noop} onBuyFreeze={noop} />;
    case 'mastery': {
      // Pass 4: the mastery overlay â€” per-card 4-dot track + aggregate summary.
      const cards = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
      const progress = { 1: {}, 2: {}, 4: {} };
      const masteryRank = { 1: 2, 2: 1, 3: 3 };
      return (
        <div className="tab-content" style={{ maxWidth: 520, margin: '32px auto', padding: 24 }}>
          <h2 className="guide-h2">Mastery</h2>
          <MasterySummary cards={cards} progress={progress} masteryRank={masteryRank} completedMiniUnits={[]} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 16 }}>
            {['taught', 'recognized', 'produced', 'spoken'].map((st) => (
              <MasteryTrack key={st} state={st} showLabels />
            ))}
          </div>
        </div>
      );
    }
    case 'speaking':
      // Pass 5: the gated speaking drill where the browser supports SpeechRecognition.
      return <div className="tab-content" style={{ maxWidth: 520, margin: '24px auto', padding: 16 }}><SpeakingExercise voice="male" audioRate={0.9} showCharacters /></div>;
    case 'speaking-unsupported':
      // Pass 5: SpeechRecognition removed â†’ the exercise renders NOTHING (returns null).
      return <div className="tab-content" style={{ maxWidth: 520, margin: '24px auto', padding: 16 }}><SpeakingExercise voice="male" /></div>;
    case 'situation-rail-free':
      // Wave 3 B2/B3 + Wave 4 C: the partner path boosts sit-dating up the order,
      // but a FREE learner must still see it as a locked preview â€” never their next
      // lesson (engagement.md:94). Wave 4: the 9 zero-content situations are no
      // longer dead rows, and the ones with content are startable.
      // onStartSituation MUST be passed â€” the rail deliberately renders no Start
      // without it (an affordance that lies is worse than no affordance).
      return (
        <div className="tab-content" style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
          <SituationRail stats={{ ...freeStats, identityPath: 'path-partner' }} startedStage={1} maxUnlockedStage={8}
            onOpenSuper={noop} onStartSituation={noop} />
        </div>
      );
    case 'situation-rail-super':
      // Same rail for a Super learner: sit-dating stays a locked preview behind the
      // 18+ attestation, and is still never `upNext`.
      return (
        <div className="tab-content" style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
          <SituationRail stats={{ ...superStats, identityPath: 'path-partner' }} startedStage={1} maxUnlockedStage={8}
            onOpenSuper={noop} onStartSituation={noop} />
        </div>
      );
    case 'situation-rail-stage1':
      // A FRESH stage-1 learner: situations are CROSS-STAGE tags, so the rail must
      // only promise what the unlocked stage window can actually teach. Counts here
      // are honestly small â€” that is the point, not a bug.
      return (
        <div className="tab-content" style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
          <SituationRail stats={{ ...freeStats, identityPath: 'path-tourist' }} startedStage={1} maxUnlockedStage={1}
            onOpenSuper={noop} onStartSituation={noop} />
        </div>
      );
    case 'identity-path':
      // Wave 3 B1: the ONE optional onboarding question that sets stats.identityPath.
      // Skipping is a first-class outcome, not a fifth path.
      return <IdentityPathStep onSelect={noop} onSkip={noop} />;
    case 'learn-trail-fresh':
      // Zigzag trail, day one: node 1 current (coach there), rest locked.
      return (
        <div className="tab-content" style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
          <LearnPath {...buildLearnProps({ completed: [], progress: {} })} />
        </div>
      );
    case 'learn-trail-mid':
      // Mid-stage: 2 lessons complete, node 3 current, 2 locked â€” all three
      // node states on one screen, coach at the frontier.
      return (
        <div className="tab-content" style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
          <LearnPath {...buildLearnProps({ completed: getMiniUnitsForStage(1).slice(0, 2).map(u => u.unitId) })} />
        </div>
      );
    case 'learn-trail-move':
      // Elephant travel: sim button appends the current unit to
      // completedMiniUnits (the exact completion write) â†’ coach slides on.
      return <LearnTrailMoveScene />;
    case 'learn-trail-course-end': {
      // The all-stages-complete end state: every card seen + every unit done.
      // getStageState keeps currentStage at 8; the Stage-8 review-only session
      // must stay one tap away (reachability parity with the old stage row).
      const allProgress = {};
      for (const c of CARDS) allProgress[c.id] = { reps: 3, interval: 30, ease: 2.4, due: Date.now() };
      return (
        <div className="tab-content" style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
          <LearnPath {...buildLearnProps({
            completed: MINI_UNITS.map(u => u.unitId),
            progress: allProgress,
          })} />
        </div>
      );
    }
    case 'learn-trail-deep':
      // Auto-scroll proof: Stage 2 with 8/10 done puts the current node
      // ~1100px down the trail â€” the load must land on it.
      return (
        <div className="tab-content" style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
          <LearnPath {...buildLearnProps({
            completed: [
              ...getMiniUnitsForStage(1).map(u => u.unitId),
              ...getMiniUnitsForStage(2).slice(0, 8).map(u => u.unitId),
            ],
            progress: stage1Progress,
          })} />
        </div>
      );
    case 'learn-trail-stage2':
      // Stage transition: ALL stage-1 cards seen + all 5 stage-1 units done â†’
      // the REAL getStageState advances currentStage to 2, the trail redraws
      // with Stage 2's 10 nodes, Stage 1 collapses to a âœ“ marker above, and
      // Stage 3 previews locked below.
      return (
        <div className="tab-content" style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
          <LearnPath {...buildLearnProps({
            completed: getMiniUnitsForStage(1).map(u => u.unitId),
            progress: stage1Progress,
          })} />
        </div>
      );
    default:
      return <div style={{ padding: 40 }}>Unknown scene: {scene}</div>;
  }
}

class Boundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  render() { return this.state.err ? <pre style={{ color: 'red', padding: 20 }}>{String(this.state.err.stack || this.state.err)}</pre> : this.props.children; }
}

document.documentElement.setAttribute('data-theme', theme);
createRoot(document.getElementById('viz-root')).render(
  <Boundary><AppRoot>{sceneEl()}</AppRoot></Boundary>
);
window.__VIZ_READY__ = true;
