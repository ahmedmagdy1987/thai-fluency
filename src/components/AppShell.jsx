import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

import SidebarNav from './SidebarNav.jsx';
import MobileNav from './MobileNav.jsx';
import TopStatsBar from './TopStatsBar.jsx';
import UserMenu from './auth/UserMenu.jsx';

// Wraps the main app surface with: sidebar on desktop, bottom nav on mobile,
// a top stats bar, and the existing user/settings/sign-in controls. Keeps
// App.jsx's concerns to state + routing — the shell only handles chrome.
export default function AppShell({
  children,
  tab,
  setTab,
  stats,
  dashboardStats,
  session,
  profile,
  hasSupabaseConfig,
  onOpenProfile,
  onOpenSettings,
  onSignOut,
  onHeaderSignInClick,
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
            <div className="app-shell-header-account">
              {hasSupabaseConfig && session && (
                <UserMenu
                  profile={profile}
                  session={session}
                  onSignOut={onSignOut}
                  onProfile={onOpenProfile}
                />
              )}
              {hasSupabaseConfig && !session && (
                <button
                  type="button"
                  className="header-signin-btn"
                  onClick={onHeaderSignInClick}
                  title="Sign in to save progress"
                >
                  Sign in
                </button>
              )}
              <button
                type="button"
                className="settings-btn"
                onClick={onOpenSettings}
                title="Settings"
              >
                <SettingsIcon size={16} />
              </button>
            </div>
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
        dashboardStats={dashboardStats}
        isAuthed={isAuthed}
      />
    </div>
  );
}
