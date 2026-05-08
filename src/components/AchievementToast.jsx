import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function AchievementToast({ achievement, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="toast toast-achievement" onClick={onClose}>
      <div className="toast-icon">{achievement.icon}</div>
      <div className="toast-body">
        <div className="toast-eyebrow">Achievement Unlocked</div>
        <div className="toast-title">{achievement.name}</div>
        <div className="toast-desc">{achievement.desc}</div>
      </div>
    </div>
  );
}
