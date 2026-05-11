import React, { useEffect } from 'react';

export default function MissionCompleteToast({ mission, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="toast toast-levelup" style={{ '--level-color': mission.color }} onClick={onClose}>
      <div className="toast-icon toast-icon-big">{mission.icon}</div>
      <div className="toast-body">
        <div className="toast-eyebrow">Mission {mission.id} Complete!</div>
        <div className="toast-title">{mission.name}</div>
        <div className="toast-desc">{mission.celebration}</div>
      </div>
    </div>
  );
}
