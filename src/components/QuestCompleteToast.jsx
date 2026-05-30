import React, { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { playQuestTick } from '../lib/sounds.js';

// Level 1 feedback: a small, non-blocking toast for a single daily-quest
// completion. Auto-dismisses; plays a tiny tick (only if Sound effects is ON —
// gating lives in sounds.js). No confetti, no modal — never interrupts learning.
export default function QuestCompleteToast({ title, onClose }) {
  useEffect(() => {
    playQuestTick();
    const t = setTimeout(onClose, 2800);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="toast toast-quest" role="status" aria-live="polite" onClick={onClose}>
      <div className="toast-icon toast-quest-icon" aria-hidden="true">
        <CheckCircle2 size={20} />
      </div>
      <div className="toast-body">
        <div className="toast-eyebrow">Quest complete</div>
        <div className="toast-title">{title}</div>
      </div>
    </div>
  );
}
