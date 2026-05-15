import React, { useEffect, useState } from 'react';
import { Bell, BellOff, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';
import {
  hasOneSignalConfig,
  getPushSubscription,
  promptForPushPermission,
  onSubscriptionChange,
} from '../../lib/onesignal.js';

const DEFAULT_PREFS = {
  daily_reminder: true,
  streak_warning: true,
  milestone: true,
  new_content: true,
  re_engagement: true,
};

const TYPE_DESCRIPTIONS = [
  { id: 'daily_reminder', label: 'Daily reminder',
    desc: 'A nudge an hour before your usual study time.' },
  { id: 'streak_warning', label: 'Streak warning',
    desc: "When you're a few hours from losing your streak." },
  { id: 'milestone', label: 'Milestone celebrations',
    desc: 'When you complete a mission or finish a stage.' },
  { id: 'new_content', label: 'New content alerts',
    desc: 'When new cards or dialogues are added.' },
  { id: 're_engagement', label: 'We-miss-you nudges',
    desc: "After about a week of no activity. Won't spam." },
];

export default function NotificationSettings({ session, profile, onProfileRefresh }) {
  const [permission, setPermission] = useState('default');
  const [optedIn, setOptedIn] = useState(false);
  const [prefs, setPrefs] = useState(profile?.notification_preferences || DEFAULT_PREFS);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Initial subscription state check + subscribe to changes.
  useEffect(() => {
    let cancelled = false;
    let unsub = () => {};
    (async () => {
      const sub = await getPushSubscription();
      if (cancelled) return;
      setPermission(sub.permission);
      setOptedIn(sub.optedIn);
      // Subscribe to runtime changes (user toggles permission in browser, etc.)
      unsub = await onSubscriptionChange((s) => {
        if (cancelled) return;
        setOptedIn(s.optedIn);
        if (s.id && s.id !== profile?.onesignal_player_id && session) {
          // New subscription ID — persist to profile so the worker can target this device.
          supabase.from('profiles').update({ onesignal_player_id: s.id }).eq('id', session.user.id);
          onProfileRefresh && onProfileRefresh();
        }
      });
    })();
    return () => { cancelled = true; unsub(); };
  }, [profile?.onesignal_player_id, session?.user?.id]);

  // When prefs change locally, save to cloud (debounced via a small wait).
  useEffect(() => {
    if (!session) return;
    if (JSON.stringify(prefs) === JSON.stringify(profile?.notification_preferences || DEFAULT_PREFS)) return;
    setSavingPrefs(true);
    const t = setTimeout(async () => {
      try {
        await supabase.from('profiles').update({ notification_preferences: prefs }).eq('id', session.user.id);
        onProfileRefresh && await onProfileRefresh();
      } finally {
        setSavingPrefs(false);
      }
    }, 600);
    return () => clearTimeout(t);
  }, [prefs, session, profile?.notification_preferences]);

  const handleEnable = async () => {
    setError(null);
    setBusy(true);
    try {
      const opened = await promptForPushPermission();
      if (!opened) {
        setError("Couldn't open the permission prompt. Your browser may not support push, or notifications are blocked in browser settings.");
      }
      // The subscription-change listener will update state when the user accepts.
    } finally {
      setBusy(false);
    }
  };

  const togglePref = (id) => {
    setPrefs(p => ({ ...p, [id]: !p[id] }));
  };

  // Resolve status label + tone for the badge.
  let statusLabel;
  let statusTone;
  if (!hasOneSignalConfig) {
    statusLabel = 'Not configured';
    statusTone = 'muted';
  } else if (permission === 'unsupported') {
    statusLabel = 'Not supported on this device';
    statusTone = 'muted';
  } else if (permission === 'denied') {
    statusLabel = 'Blocked in browser settings';
    statusTone = 'warn';
  } else if (permission === 'granted' && optedIn) {
    statusLabel = 'On for this device';
    statusTone = 'on';
  } else if (permission === 'granted' && !optedIn) {
    statusLabel = 'Permission granted but paused';
    statusTone = 'muted';
  } else {
    statusLabel = 'Off';
    statusTone = 'muted';
  }

  return (
    <div className="profile-section">
      <div className="profile-section-title">Notifications</div>

      <div className={`notifsettings-status notifsettings-status-${statusTone}`}>
        {statusTone === 'on' ? <Bell size={16} /> : statusTone === 'warn' ? <AlertCircle size={16} /> : <BellOff size={16} />}
        <span className="notifsettings-status-label">{statusLabel}</span>
      </div>

      {(!hasOneSignalConfig || permission === 'unsupported') && (
        <div className="profile-field-hint">
          {!hasOneSignalConfig
            ? 'Push notifications are disabled on this build. Set VITE_ONESIGNAL_APP_ID to enable.'
            : "This browser doesn't support web push. Try the latest Chrome, Edge, or Safari (iOS 16.4+ requires Add to Home Screen)."}
        </div>
      )}

      {hasOneSignalConfig && permission === 'denied' && (
        <div className="profile-field-hint profile-field-hint-warn">
          You blocked notifications in browser settings. To re-enable, open your browser's site settings and allow notifications for this domain.
        </div>
      )}

      {hasOneSignalConfig && permission === 'default' && (
        <div className="notifsettings-enable-row">
          <p className="profile-field-hint">
            Turn on notifications to get streak reminders, milestone celebrations, and new-content alerts.
          </p>
          <button
            type="button"
            className="btn-primary auth-submit notifsettings-enable-btn"
            onClick={handleEnable}
            disabled={busy}
          >
            {busy ? 'Opening…' : 'Enable notifications'}
          </button>
        </div>
      )}

      {error && <div className="auth-error">{error}</div>}

      {hasOneSignalConfig && permission !== 'unsupported' && (
        <div className="notifsettings-types">
          <div className="notifsettings-types-title">
            Send me…
            {savingPrefs && <span className="notifsettings-saving">Saving…</span>}
          </div>
          {TYPE_DESCRIPTIONS.map(t => (
            <label key={t.id} className="notifsettings-type-row">
              <input
                type="checkbox"
                checked={!!prefs[t.id]}
                onChange={() => togglePref(t.id)}
                className="notifsettings-checkbox"
                disabled={permission !== 'granted'}
              />
              <div className="notifsettings-type-text">
                <div className="notifsettings-type-label">{t.label}</div>
                <div className="notifsettings-type-desc">{t.desc}</div>
              </div>
            </label>
          ))}
          {permission !== 'granted' && (
            <div className="profile-field-hint">
              These toggles take effect once you allow notifications above.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
