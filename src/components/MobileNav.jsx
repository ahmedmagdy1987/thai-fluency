import React, { useEffect, useRef, useState } from 'react';
import {
  Map as MapIcon,
  Layers,
  Target,
  MoreHorizontal,
  BookOpen,
  Zap,
  Compass,
  User,
  Crown,
  Settings as SettingsIcon,
  LogOut,
  MessageSquare,
  Heart,
} from 'lucide-react';

// Mobile bottom nav keeps the highest-frequency destinations visible while
// the More sheet holds secondary explore/profile actions.
//
// Shop and Leaderboard are intentionally omitted (placeholder-only features,
// unlinked until built). Labels are kept in sync with SidebarNav so the same
// tab reads the same everywhere (e.g. `cards` = "Practice").
const PRIMARY = [
  { id: 'learn',  Icon: MapIcon, label: 'Learn' },
  { id: 'cards',  Icon: Layers,  label: 'Practice' },
  { id: 'quiz',   Icon: Zap,     label: 'Challenge' },
  { id: 'quests', Icon: Target,  label: 'Quests' },
];

const MORE = [
  { id: 'browse',      Icon: BookOpen, label: 'Browse' },
  { id: 'guide',       Icon: Compass,  label: 'Guide' },
  // Optional 18+ Super section. Not part of course progress.
  { id: 'dating',      Icon: Heart,    label: 'Dating 18+' },
];

export default function MobileNav({
  tab,
  setTab,
  onOpenProfile,
  onOpenSettings,
  onOpenSuper,
  onSignOut,
  onOpenPublicPage,
  dashboardStats,
  isAuthed,
  isSuper = false,
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const sheetRef = useRef(null);

  useEffect(() => {
    if (!moreOpen) return;
    const onClick = (e) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target)) setMoreOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setMoreOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [moreOpen]);

  const moreActive = MORE.some(m => m.id === tab);

  return (
    <>
      <nav className="mobile-nav" aria-label="Primary navigation">
        {PRIMARY.map(entry => {
          const isActive = tab === entry.id;
          const badge = entry.id === 'cards' && dashboardStats?.due > 0 ? dashboardStats.due : null;
          return (
            <button
              key={entry.id}
              type="button"
              className={`mobile-nav-btn ${isActive ? 'mobile-nav-btn-active' : ''}`}
              onClick={() => { setTab(entry.id); setMoreOpen(false); }}
              data-tutorial={`nav-${entry.id}`}
            >
              <span className="mobile-nav-icon-wrap">
                <entry.Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
                {badge != null && <span className="mobile-nav-badge">{badge > 99 ? '99+' : badge}</span>}
              </span>
              <span className="mobile-nav-label">{entry.label}</span>
            </button>
          );
        })}
        <button
          type="button"
          className={`mobile-nav-btn ${moreActive ? 'mobile-nav-btn-active' : ''}`}
          onClick={() => setMoreOpen(v => !v)}
          aria-expanded={moreOpen}
        >
          <span className="mobile-nav-icon-wrap">
            <MoreHorizontal size={20} strokeWidth={moreActive ? 2.4 : 1.8} />
          </span>
          <span className="mobile-nav-label">More</span>
        </button>
      </nav>

      {moreOpen && (
        <div className="mobile-more-backdrop" role="dialog" aria-modal="true">
          <div className="mobile-more-sheet" ref={sheetRef}>
            <div className="mobile-more-handle" />
            <div className="mobile-more-title">More</div>
            <div className="mobile-more-grid">
              {MORE.map(entry => {
                const isActive = tab === entry.id;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    className={`mobile-more-item ${isActive ? 'mobile-more-item-active' : ''}`}
                    onClick={() => { setTab(entry.id); setMoreOpen(false); }}
                  >
                    <entry.Icon size={22} />
                    <span>{entry.label}</span>
                  </button>
                );
              })}
              {isSuper ? (
                <div className="mobile-more-item mobile-more-item-super-active" aria-label="You have Super">
                  <Crown size={22} />
                  <span>Super ✓</span>
                </div>
              ) : (
                <button
                  type="button"
                  className="mobile-more-item mobile-more-item-super"
                  onClick={() => { setMoreOpen(false); onOpenSuper && onOpenSuper(); }}
                >
                  <Crown size={22} />
                  <span>Go Super</span>
                </button>
              )}
              {isAuthed && (
                <button
                  type="button"
                  className="mobile-more-item"
                  onClick={() => { setMoreOpen(false); onOpenProfile && onOpenProfile(); }}
                >
                  <User size={22} />
                  <span>Profile</span>
                </button>
              )}
              <button
                type="button"
                className="mobile-more-item"
                onClick={() => { setMoreOpen(false); onOpenSettings && onOpenSettings(); }}
              >
                <SettingsIcon size={22} />
                <span>Settings</span>
              </button>
              <button
                type="button"
                className="mobile-more-item"
                onClick={() => { setMoreOpen(false); onOpenPublicPage && onOpenPublicPage('/feedback'); }}
              >
                <MessageSquare size={22} />
                <span>Feedback</span>
              </button>
              {isAuthed && (
                <button
                  type="button"
                  className="mobile-more-item mobile-more-item-danger"
                  onClick={() => { setMoreOpen(false); onSignOut && onSignOut(); }}
                >
                  <LogOut size={22} />
                  <span>Sign out</span>
                </button>
              )}
            </div>
            <button
              type="button"
              className="mobile-more-close"
              onClick={() => setMoreOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
