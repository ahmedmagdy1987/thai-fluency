import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft, Target } from 'lucide-react';
import { STAGES } from '../data/taxonomy.js';
import { displayCard, displayLine, transformThai, transformPh, transformEn, DEFAULT_VOICE, DEFAULT_VIEW_MODE } from '../lib/voice.js';
import { getStageState, buildPlacementCards, autoBreakdown, checkAchievements } from '../lib/state.js';

export default function PlacementOnboarding({ onComplete }) {
  const [step, setStep] = useState('welcome');
  const [idx, setIdx] = useState(0);
  const [knownIds, setKnownIds] = useState([]);
  const [voice, setVoice] = useState(DEFAULT_VOICE);

  // Build placement cards once on mount
  const cards = useMemo(() => buildPlacementCards(), []);

  // 5 self-describing levels — most users will just pick one of these
  const SKILL_LEVELS = [
    { id: 'none', stage: 1, icon: '🌱', name: "I don't speak any Thai", desc: 'Start from the very beginning' },
    { id: 'few', stage: 1, icon: '👋', name: 'I know a few words', desc: 'sàwàtdee, khàwp khun, the basics' },
    { id: 'survival', stage: 2, icon: '🍜', name: 'I can survive (food, taxis)', desc: 'Can order food, ask basic questions' },
    { id: 'casual', stage: 4, icon: '💬', name: 'I can hold short conversations', desc: 'Daily life mostly works in Thai' },
    { id: 'confident', stage: 5, icon: '🥷', name: "I'm conversational", desc: 'Comfortable, want to fill gaps' },
  ];

  if (step === 'welcome') {
    return (
      <div className="onboard-root">
        <div className="onboard-card">
          <div className="onboard-eyebrow">ภาษาไทย · phaa-sǎa thai</div>
          <h1 className="onboard-title">Welcome.</h1>
          <p className="onboard-sub">Quick setup. We'll skip what you already know.</p>

          <div className="onboard-section">
            <div className="onboard-section-title">First, who are you speaking as?</div>
            <div className="onboard-section-sub">All sentences will be tailored. Change anytime in Settings.</div>
            <div className="onboard-toggle">
              <button className={`onboard-toggle-btn ${voice === 'male' ? 'onboard-toggle-active' : ''}`} onClick={() => setVoice('male')}>
                <div className="onboard-toggle-icon">♂</div>
                <div className="onboard-toggle-label">Male</div>
                <div className="onboard-toggle-sub">ผม / ครับ</div>
              </button>
              <button className={`onboard-toggle-btn ${voice === 'female' ? 'onboard-toggle-active' : ''}`} onClick={() => setVoice('female')}>
                <div className="onboard-toggle-icon">♀</div>
                <div className="onboard-toggle-label">Female</div>
                <div className="onboard-toggle-sub">ฉัน / ค่ะ</div>
              </button>
            </div>
          </div>

          <div className="onboard-section">
            <div className="onboard-section-title">Where are you with Thai?</div>
            <div className="onboard-section-sub">Pick the closest match. You can change levels anytime.</div>
            <div className="skill-level-list">
              {SKILL_LEVELS.map(L => (
                <button key={L.id} className="skill-level-btn" onClick={() => onComplete(L.stage, [], voice)}>
                  <div className="skill-level-icon">{L.icon}</div>
                  <div className="skill-level-body">
                    <div className="skill-level-name">{L.name}</div>
                    <div className="skill-level-desc">{L.desc}</div>
                  </div>
                  <ChevronRight size={18} className="skill-level-arrow" />
                </button>
              ))}
            </div>
          </div>

          <div className="onboard-or-divider"><span>or</span></div>
          <button className="onboard-secondary-btn" onClick={() => setStep('placement')}>
            <Target size={14} /> Take the placement test (12 cards, ~1 min)
          </button>
        </div>
      </div>
    );
  }

  if (step === 'placement') {
    const card = cards[idx];
    const handle = (rating) => {
      if (rating === 'know') {
        setKnownIds(prev => [...prev, card.id]);
      }
      if (idx + 1 >= cards.length) {
        setStep('stage-pick');
      } else {
        setIdx(idx + 1);
      }
    };
    return (
      <div className="onboard-root">
        <div className="onboard-card onboard-card-narrow">
          <button className="onboard-back-btn" onClick={() => {
            if (idx > 0) {
              setIdx(idx - 1);
              setKnownIds(prev => prev.filter(id => id !== cards[idx - 1].id));
            } else {
              setStep('welcome');
            }
          }} aria-label="Go back">
            <ChevronLeft size={18} /> Back
          </button>
          <div className="onboard-progress">
            <div className="onboard-progress-bar"><div className="onboard-progress-fill" style={{ width: `${(idx / cards.length) * 100}%` }} /></div>
            <div className="onboard-progress-text">Card {idx + 1} of {cards.length}</div>
          </div>
          <div className="onboard-eyebrow">Do you know this?</div>
          <div className="onboard-placement-card">
            <div className="onboard-placement-thai">{transformThai(card.thai, voice)}</div>
            <div className="onboard-placement-ph">{transformPh(card.ph, voice)}</div>
            <div className="onboard-placement-en">{transformEn(card.en, voice)}</div>
          </div>
          <div className="onboard-rate-row">
            <button className="onboard-rate-btn onboard-rate-no" onClick={() => handle('no')}>
              <div>No</div>
              <div className="onboard-rate-sub">never seen it</div>
            </button>
            <button className="onboard-rate-btn onboard-rate-kinda" onClick={() => handle('kinda')}>
              <div>Kinda</div>
              <div className="onboard-rate-sub">need practice</div>
            </button>
            <button className="onboard-rate-btn onboard-rate-know" onClick={() => handle('know')}>
              <div>I know it</div>
              <div className="onboard-rate-sub">skip this one</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Smart suggestion: find highest stage where user knew at least one card,
  // then suggest the NEXT stage (where they don't know enough yet)
  const knownCardObjs = knownIds.map(id => cards.find(c => c.id === id)).filter(Boolean);
  let suggestedStage = 1;
  if (knownCardObjs.length > 0) {
    // For each stage, count how many of its placement cards were marked known
    const stageMarks = {};
    cards.forEach(c => {
      const st = c.stage || 1;
      if (!stageMarks[st]) stageMarks[st] = { total: 0, known: 0 };
      stageMarks[st].total++;
      if (knownIds.includes(c.id)) stageMarks[st].known++;
    });
    // User "knows" a stage if they got at least 1 card right
    let highestKnownStage = 0;
    Object.entries(stageMarks).forEach(([stage, m]) => {
      if (m.known >= 1) highestKnownStage = Math.max(highestKnownStage, +stage);
    });
    // Suggest the stage AFTER the highest stage they showed mastery of
    suggestedStage = Math.min(8, Math.max(1, highestKnownStage));
    // But only push past stage 1 if they got 50%+ correct overall (defensible signal)
    if (knownIds.length / cards.length < 0.25) suggestedStage = 1;
  }
  return (
    <div className="onboard-root">
      <div className="onboard-card">
        <div className="onboard-eyebrow">Almost done</div>
        <h2 className="onboard-title">Where do you want to start?</h2>
        <p className="onboard-sub">
          You marked {knownIds.length} of {cards.length} as known — those are auto-matured. Pick a starting stage. We'd suggest <strong>Stage {suggestedStage}</strong>.
        </p>
        <div className="onboard-stage-grid">
          {STAGES.map(s => (
            <button key={s.id} className={`onboard-stage-card ${s.id === suggestedStage ? 'onboard-stage-suggested' : ''}`} style={{ '--stage-color': s.color }} onClick={() => onComplete(s.id, knownIds, voice)}>
              <div className="onboard-stage-icon">{s.icon}</div>
              <div className="onboard-stage-num">Stage {s.id}</div>
              <div className="onboard-stage-name">{s.name}</div>
              <div className="onboard-stage-desc">{s.desc}</div>
            </button>
          ))}
        </div>
        <div className="onboard-skip-row">
          <button className="onboard-skip-btn" onClick={() => onComplete(1, knownIds, voice)}>I'm a total beginner — start at Stage 1</button>
        </div>
      </div>
    </div>
  );
}

