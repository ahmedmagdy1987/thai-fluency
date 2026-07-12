import React, { useEffect, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { STAGES } from '../data/taxonomy.js';
import { CARDS } from '../data/cards.js';
import ConfettiBurst from './ConfettiBurst.jsx';
import { playCelebration } from '../lib/sounds.js';

export default function Stage1CompleteCelebration({ onClose }) {
  const s2 = STAGES.find(s => s.id === 2);
  const s2Count = CARDS.filter(c => (c.stage || 1) === 2).length;
  const [showConfetti, setShowConfetti] = useState(true);
  useEffect(() => { playCelebration(); }, []);
  return (
    <div className="s1-complete-overlay" onClick={onClose}>
      {showConfetti && <ConfettiBurst variant="strong" onDone={() => setShowConfetti(false)} />}
      <div className="s1-complete-modal" onClick={(e) => e.stopPropagation()}>
        <button className="s1-complete-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
        <div className="s1-complete-icon"><Sparkles size={56} /></div>
        <div className="s1-complete-eyebrow">Survival Thai Complete</div>
        <h1 className="s1-complete-title">👑 You can handle real Thailand.</h1>
        <p className="s1-complete-thai">gèng mâak (เก่งมาก)</p>
        {/* "learned" not "mastered" — stage completion is seen/learned; the
            app's own model says mastery comes later through review. */}
        <p className="s1-complete-body">
          You've learned all 150 essentials — keep reviewing to master them. You can greet,
          order food, ask directions, handle prices, and call for help in Thai.
        </p>
        <div className="s1-complete-divider" />
        <div className="s1-complete-unlock-eyebrow">Now unlocked</div>
        <div className="s1-complete-unlock-title">{s2.icon} Stage 2: {s2.name}</div>
        <p className="s1-complete-unlock-body">
          {s2Count} new cards unlocked. {s2.desc} More stages unlock as you complete each one.
        </p>
        <button className="s1-complete-cta" onClick={onClose}>Let's keep going</button>
      </div>
    </div>
  );
}
