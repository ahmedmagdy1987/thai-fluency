// Visual-verification harness — mounts a single real component inside an
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
import { CARDS } from '../../src/data/cards.js';
import { STAGE_1_MINI_UNIT_PILOT } from '../../src/data/miniUnits.js';

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
// set status='canceled' with cancel_at_period_end=false and a FUTURE super_until —
// the B5 copy edge. Copy must read "Super — active until <date>. Auto-renew is
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

function sceneEl() {
  switch (scene) {
    case 'dating-teaser':
      return <DatingSection stats={freeStats} onOpenSuper={noop} setTab={noop} />;
    case 'dating-lesson':
    case 'dating-quiz':
      // Super + 18+ confirmed → lands on the category selector.
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
    case 'settings':
      return <SettingsModal stats={superStats} updateSettings={noop} onClose={noop} onOpenPublicPage={noop}
        onEntitlementRefresh={noop} onReplayTutorial={noop} />;
    case 'settings-canceled':
      // B5: canceled-but-paid Super — expect "Super — active until <date>. Auto-
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
      // Pass 1: new audio→English MCQ.
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
      // Pass 4: the mastery overlay — per-card 4-dot track + aggregate summary.
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
      // Pass 5: SpeechRecognition removed → the exercise renders NOTHING (returns null).
      return <div className="tab-content" style={{ maxWidth: 520, margin: '24px auto', padding: 16 }}><SpeakingExercise voice="male" /></div>;
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
