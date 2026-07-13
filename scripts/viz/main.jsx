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
import { CARDS } from '../../src/data/cards.js';

const params = new URLSearchParams(location.search);
const scene = params.get('scene') || 'dating-teaser';
const theme = params.get('theme') === 'dark' ? 'dark' : 'light';

const noop = () => {};
const superStats = { tier: 'super', hearts: 5, gems: 200, streak: 3, totalXp: 500, totalReviews: 40 };
const freeStats = { tier: 'free', hearts: 5, gems: 60, streak: 3, totalXp: 500, totalReviews: 40 };
const zeroHeartStats = { tier: 'free', hearts: 0, gems: 10, heartsUpdatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() };

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
