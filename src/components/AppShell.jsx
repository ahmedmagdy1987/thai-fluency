import React from 'react';

import SidebarNav from './SidebarNav.jsx';
import MobileNav from './MobileNav.jsx';
import TopStatsBar from './TopStatsBar.jsx';

// Wraps the main app surface with: sidebar on desktop, bottom nav on mobile,
// and a header dedicated to progress stats. Profile + Settings live in the
// sidebar/mobile nav — the header stays focused on streak/gems/hearts/XP.
export default function AppShell({
  children,
  tab,
  setTab,
  stats,
  dashboardStats,
  session,
  onOpenProfile,
  onOpenSettings,
  onSignOut,
  themeAttr,
  viewModeAttr,
}) {
  const isAuthed = !!session;

  return (
    <div className="app-root app-shell-root" data-theme={themeAttr} data-view-mode={viewModeAttr}>
      <SidebarNav
        tab={tab}
        setTab={setTab}
        onOpenProfile={onOpenProfile}
        onOpenSettings={onOpenSettings}
        onSignOut={onSignOut}
        dashboardStats={dashboardStats}
        isAuthed={isAuthed}
      />

      <div className="app-shell-main-col">
        <header className="app-shell-header">
          <div className="app-shell-header-inner">
            <div className="app-shell-header-brand">
              <span className="brand-thai">ตุ๊กตุ๊ก</span>
              <span className="brand-en">Tuk Talk Thai</span>
            </div>
            <TopStatsBar
              stats={stats}
              dashboardStats={dashboardStats}
              onOpenShop={() => setTab('shop')}
            />
          </div>
        </header>

        <main className="app-shell-main">
          {children}
        </main>
      </div>

      <MobileNav
        tab={tab}
        setTab={setTab}
        onOpenProfile={onOpenProfile}
        onOpenSettings={onOpenSettings}
        onSignOut={onSignOut}
        dashboardStats={dashboardStats}
        isAuthed={isAuthed}
      />
    </div>
  );
}
