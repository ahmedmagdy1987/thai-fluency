import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function StageUpToast({ stage, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="toast toast-levelup" style={{ '--level-color': stage.color }} onClick={onClose}>
      <div className="toast-icon toast-icon-big">{stage.icon}</div>
      <div className="toast-body">
        <div className="toast-eyebrow">Stage Complete!</div>
        <div className="toast-title">Stage {stage.id} · {stage.name}</div>
        <div className="toast-desc">{stage.desc}</div>
      </div>
    </div>
  );
}
