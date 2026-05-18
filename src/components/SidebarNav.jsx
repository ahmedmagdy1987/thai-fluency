import React from 'react';
import {
  Map as MapIcon,
  Layers,
  Target,
  ShoppingBag,
  BookOpen,
  Zap,
  Compass,
  User,
  Settings as SettingsIcon,
  Trophy,
  LogOut,
} from 'lucide-react';

// Desktop-only sidebar (visible at ≥1024px via CSS). Groups items by intent
// so the user has a single, scannable column on every screen. The active
// item is driven by the `tab` prop — same identifier used by App's main
// router, so adding a new tab here is one entry plus a render case.
const PRIMARY = [
  { id: 'learn',  Icon: MapIcon, label: 'Learn' },
  { id: 'cards',  Icon: Layers,  label: 'Practice' },
];
const ENGAGE = [
  { id: 'quests', Icon: Target,      label: 'Quests' },
  { id: 'shop',   Icon: ShoppingBag, label: 'Shop' },
  { id: 'leaderboard', Icon: Trophy, label: 'Leaderboard' },
];
const EXPLORE = [
  { id: 'browse', Icon: BookOpen, label: 'Browse' },
  { id: 'quiz',   Icon: Zap,      label: 'Challenge' },
  { id: 'guide',  Icon: Compass,  label: 'Guide' },
];

export default function SidebarNav({
  tab,
  setTab,
  onOpenProfile,
  onOpenSettings,
  onSignOut,
  dashboardStats,
  isAuthed,
}) {
  const Item = ({ entry }) => {
    const isActive = tab === entry.id;
    const badge = entry.id === 'cards' && dashboardStats?.due > 0 ? dashboardStats.due : null;
    return (
      <button
        type="button"
        className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
        onClick={() => setTab(entry.id)}
      >
        <entry.Icon size={18} strokeWidth={isActive ? 2.4 : 1.8} />
        <span className="sidebar-item-label">{entry.label}</span>
        {badge != null && <span className="sidebar-item-badge">{badge > 99 ? '99+' : badge}</span>}
      </button>
    );
  };

  return (
    <aside className="sidebar-nav" aria-label="Primary navigation">
      <div className="sidebar-brand">
        <span className="sidebar-brand-mark" aria-hidden="true">ตุ๊กตุ๊ก</span>
        <span className="sidebar-brand-name">Tuk Talk Thai</span>
      </div>

      <nav className="sidebar-group">
        {PRIMARY.map(e => <Item key={e.id} entry={e} />)}
      </nav>

      <div className="sidebar-group-label">Engage</div>
      <nav className="sidebar-group">
        {ENGAGE.map(e => <Item key={e.id} entry={e} />)}
      </nav>

      <div className="sidebar-group-label">Explore</div>
      <nav className="sidebar-group">
        {EXPLORE.map(e => <Item key={e.id} entry={e} />)}
      </nav>

      <div className="sidebar-footer">
        {isAuthed && (
          <button type="button" className="sidebar-item" onClick={onOpenProfile}>
            <User size={18} strokeWidth={1.8} />
            <span className="sidebar-item-label">Profile</span>
          </button>
        )}
        <button type="button" className="sidebar-item" onClick={onOpenSettings}>
          <SettingsIcon size={18} strokeWidth={1.8} />
          <span className="sidebar-item-label">Settings</span>
        </button>
        {isAuthed && (
          <button type="button" className="sidebar-item sidebar-item-danger" onClick={onSignOut}>
            <LogOut size={18} strokeWidth={1.8} />
            <span className="sidebar-item-label">Sign out</span>
          </button>
        )}
      </div>
    </aside>
  );
}
