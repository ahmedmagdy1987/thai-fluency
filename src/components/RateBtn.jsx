import React from 'react';

export default function RateBtn({ rating, label, subLabel, color, onClick, disabled = false }) {
  return (
    <button className="rate-btn" style={{ '--rate-color': color }} onClick={onClick} disabled={disabled}>
      <div className="rate-btn-label">{label}</div>
      <div className="rate-btn-sub">{subLabel}</div>
    </button>
  );
}
