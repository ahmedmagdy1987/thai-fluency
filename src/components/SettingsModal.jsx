import React, { useState } from 'react';
import { X } from 'lucide-react';
import { DEFAULT_DAILY_GOAL, XP_REWARDS } from '../data/gamification.js';
import { STAGES } from '../data/taxonomy.js';
import { DEFAULT_VOICE, DEFAULT_VIEW_MODE } from '../lib/voice.js';
import PrivacyPolicy from './legal/PrivacyPolicy.jsx';
import TermsOfService from './legal/TermsOfService.jsx';

export default function SettingsModal({ stats, updateSettings, onClose, resetAll }) {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const voice = stats.voice || DEFAULT_VOICE;
  const viewMode = stats.viewMode || DEFAULT_VIEW_MODE;
  const dailyGoal = stats.dailyGoal || DEFAULT_DAILY_GOAL;
  const theme = stats.theme || 'light';
  const audioRate = stats.audioRate || 0.85;
  const audioAutoPlay = !!stats.audioAutoPlay;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-eyebrow">Preferences</div>
            <div className="modal-title">Settings</div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          <div className="setting-group">
            <div className="setting-label">Theme</div>
            <div className="setting-sub">Light or dark mode</div>
            <div className="setting-toggle">
              <button className={`setting-toggle-btn ${theme === 'light' ? 'setting-toggle-active' : ''}`} onClick={() => updateSettings({ theme: 'light' })}>
                <span className="setting-toggle-icon">☀️</span> Light
              </button>
              <button className={`setting-toggle-btn ${theme === 'dark' ? 'setting-toggle-active' : ''}`} onClick={() => updateSettings({ theme: 'dark' })}>
                <span className="setting-toggle-icon">🌙</span> Dark
              </button>
            </div>
          </div>

          <div className="setting-group">
            <div className="setting-label">Voice / Perspective</div>
            <div className="setting-sub">All sentences will use these particles and pronouns</div>
            <div className="setting-toggle">
              <button className={`setting-toggle-btn ${voice === 'male' ? 'setting-toggle-active' : ''}`} onClick={() => updateSettings({ voice: 'male' })}>
                <span className="setting-toggle-icon">♂</span> Male <span className="setting-toggle-sub">ผม / ครับ</span>
              </button>
              <button className={`setting-toggle-btn ${voice === 'female' ? 'setting-toggle-active' : ''}`} onClick={() => updateSettings({ voice: 'female' })}>
                <span className="setting-toggle-icon">♀</span> Female <span className="setting-toggle-sub">ฉัน / ค่ะ</span>
              </button>
            </div>
          </div>

          <div className="setting-group">
            <div className="setting-label">Learning mode</div>
            <div className="setting-sub">What do you want to focus on?</div>
            <div className="setting-toggle setting-toggle-vert">
              <button className={`setting-toggle-btn ${viewMode === 'speak' ? 'setting-toggle-active' : ''}`} onClick={() => updateSettings({ viewMode: 'speak' })}>
                <div className="setting-toggle-row"><span className="setting-toggle-icon">🗣️</span> <span>Speak only</span></div>
                <span className="setting-toggle-sub">Phonetic + English. Thai script shown small.</span>
              </button>
              <button className={`setting-toggle-btn ${viewMode === 'both' ? 'setting-toggle-active' : ''}`} onClick={() => updateSettings({ viewMode: 'both' })}>
                <div className="setting-toggle-row"><span className="setting-toggle-icon">📖</span> <span>Speak + Read</span></div>
                <span className="setting-toggle-sub">All three equally visible</span>
              </button>
              <button className={`setting-toggle-btn ${viewMode === 'read' ? 'setting-toggle-active' : ''}`} onClick={() => updateSettings({ viewMode: 'read' })}>
                <div className="setting-toggle-row"><span className="setting-toggle-icon">🇹🇭</span> <span>Read mastery</span></div>
                <span className="setting-toggle-sub">Thai script first; phonetic on reveal</span>
              </button>
            </div>
          </div>

          <div className="setting-group">
            <div className="setting-label">Audio (text-to-speech)</div>
            <div className="setting-sub">Tap 🔊 on any card to hear the Thai. Uses your browser's built-in voice.</div>
            <div className="setting-toggle">
              <button className={`setting-toggle-btn ${audioRate === 0.7 ? 'setting-toggle-active' : ''}`} onClick={() => updateSettings({ audioRate: 0.7 })}>
                <span className="setting-toggle-icon">🐢</span> Slow <span className="setting-toggle-sub">for tones</span>
              </button>
              <button className={`setting-toggle-btn ${audioRate === 0.85 ? 'setting-toggle-active' : ''}`} onClick={() => updateSettings({ audioRate: 0.85 })}>
                <span className="setting-toggle-icon">🚶</span> Natural <span className="setting-toggle-sub">default</span>
              </button>
              <button className={`setting-toggle-btn ${audioRate === 1 ? 'setting-toggle-active' : ''}`} onClick={() => updateSettings({ audioRate: 1 })}>
                <span className="setting-toggle-icon">🏃</span> Fast <span className="setting-toggle-sub">native pace</span>
              </button>
            </div>
            <div className="setting-toggle" style={{ marginTop: 8 }}>
              <button className={`setting-toggle-btn ${!audioAutoPlay ? 'setting-toggle-active' : ''}`} onClick={() => updateSettings({ audioAutoPlay: false })}>
                Tap to play
              </button>
              <button className={`setting-toggle-btn ${audioAutoPlay ? 'setting-toggle-active' : ''}`} onClick={() => updateSettings({ audioAutoPlay: true })}>
                Auto-play new cards
              </button>
            </div>
          </div>

          <div className="setting-group">
            <div className="setting-label">Daily XP goal</div>
            <div className="setting-sub">Hit it for a {XP_REWARDS.dailyGoalBonus} XP bonus</div>
            <div className="setting-toggle">
              {[25, 50, 100, 200].map(g => (
                <button key={g} className={`setting-goal-btn ${dailyGoal === g ? 'setting-toggle-active' : ''}`} onClick={() => updateSettings({ dailyGoal: g })}>
                  {g} XP
                </button>
              ))}
            </div>
          </div>

          <div className="setting-group">
            <div className="setting-label">Current stage</div>
            <div className="setting-sub">Stages unlock as you progress — earned through learning, not selected.</div>
            <div className="setting-stage-current-readonly">
              <span className="setting-stage-current-icon">{(STAGES.find(s => s.id === (stats.currentStage || stats.startedStage || 1)) || {}).icon}</span>
              <div>
                <div className="setting-stage-current-num">Stage {stats.currentStage || stats.startedStage || 1}</div>
                <div className="setting-stage-current-name">{(STAGES.find(s => s.id === (stats.currentStage || stats.startedStage || 1)) || {}).name}</div>
              </div>
            </div>
          </div>

          <div className="setting-group">
            <div className="setting-label">Streak protection</div>
            <div className="setting-sub">You have <strong>{stats.streakFreezes || 0}</strong> freeze{(stats.streakFreezes || 0) === 1 ? '' : 's'} available. Auto-grants every 7 study days.</div>
          </div>

          <div className="setting-group">
            <div className="setting-label">Legal</div>
            <div className="settings-legal-links">
              <button type="button" className="settings-legal-link" onClick={() => setShowPrivacy(true)}>Privacy Policy</button>
              <span className="settings-legal-divider" aria-hidden="true">·</span>
              <button type="button" className="settings-legal-link" onClick={() => setShowTerms(true)}>Terms of Service</button>
            </div>
          </div>

          <div className="setting-group setting-group-danger">
            <button className="dash-reset-btn" onClick={() => { onClose(); resetAll(); }}>Reset all progress</button>
          </div>
        </div>
      </div>
      {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}
      {showTerms && <TermsOfService onClose={() => setShowTerms(false)} />}
    </div>
  );
}
