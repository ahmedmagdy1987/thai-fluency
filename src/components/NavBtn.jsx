import React from 'react';

export default function NavBtn({ active, onClick, Icon, label, badge }) {
  return (
    <button className={`nav-btn ${active ? 'nav-btn-active' : ''}`} onClick={onClick}>
      <div className="nav-btn-icon-wrap">
        <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
        {badge != null && <span className="nav-badge">{badge > 99 ? '99+' : badge}</span>}
      </div>
      <span className="nav-btn-label">{label}</span>
    </button>
  );
}
