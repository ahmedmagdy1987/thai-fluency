import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';

export default function UserMenu({ profile, session, onSignOut }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const displayName = profile?.display_name || (session?.user?.email ? session.user.email.split('@')[0] : 'Account');

  return (
    <div className="user-menu-wrap" ref={ref}>
      <button className="user-menu-trigger" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-haspopup="true">
        <span className="user-menu-name">{displayName}</span>
        <ChevronDown size={12} className={`user-menu-chevron ${open ? 'user-menu-chevron-open' : ''}`} />
      </button>
      {open && (
        <div className="user-menu-dropdown" role="menu">
          <div className="user-menu-email">{session?.user?.email}</div>
          <button className="user-menu-item" onClick={() => { setOpen(false); onSignOut(); }}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
