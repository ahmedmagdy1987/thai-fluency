import React from 'react';
import { Sparkles, X } from 'lucide-react';
import { STAGES } from '../data/taxonomy.js';
import { CARDS } from '../data/cards.js';

export default function Stage1CompleteCelebration({ onClose }) {
  const s2 = STAGES.find(s => s.id === 2);
  const s2Count = CARDS.filter(c => (c.stage || 1) === 2).length;
  return (
    <div className="s1-complete-overlay" onClick={onClose}>
      <div className="s1-complete-modal" onClick={(e) => e.stopPropagation()}>
        <button className="s1-complete-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
        <div className="s1-complete-icon"><Sparkles size={56} /></div>
        <div className="s1-complete-eyebrow">Survival Thai Complete</div>
        <h1 className="s1-complete-title">👑 You can handle real Thailand.</h1>
        <p className="s1-complete-thai">เก่งมาก — gèng mâak</p>
        <p className="s1-complete-body">
          You've mastered the 150 essentials. You can greet, order food, ask directions,
          handle prices, and call for help in Thai.
        </p>
        <div className="s1-complete-divider" />
        <div className="s1-complete-unlock-eyebrow">Now unlocked</div>
        <div className="s1-complete-unlock-title">{s2.icon} Stage 2 · {s2.name}</div>
        <p className="s1-complete-unlock-body">
          {s2Count} new cards — {s2.desc.toLowerCase()} More stages unlock as you complete each one.
        </p>
        <button className="s1-complete-cta" onClick={onClose}>Let's keep going →</button>
      </div>
    </div>
  );
}
