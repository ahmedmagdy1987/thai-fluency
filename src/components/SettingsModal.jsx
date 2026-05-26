import React, { useState } from 'react';
import { X } from 'lucide-react';
import { DEFAULT_DAILY_GOAL, XP_REWARDS } from '../data/gamification.js';
import { STAGES } from '../data/taxonomy.js';
import { DEFAULT_VOICE, DEFAULT_VIEW_MODE, transformThai } from '../lib/voice.js';
import { speakThai } from '../lib/audio.js';
import PrivacyPolicy from './legal/PrivacyPolicy.jsx';
import TermsOfService from './legal/TermsOfService.jsx';

const PREVIEW_THAI = '\u0e2a\u0e27\u0e31\u0e2a\u0e14\u0e35\u0e04\u0e23\u0e31\u0e1a';

const AUDIO_RATE_OPTIONS = [
  { value: 0.7, label: 'Slow', helper: 'Clear tone practice' },
  { value: 0.95, label: 'Natural', helper: 'Everyday pace' },
  { value: 1.15, label: 'Fast', helper: 'Challenge pace' },
];

export default function SettingsModal({ stats, updateSettings, onClose, resetAll, onOpenPublicPage }) {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const voice = stats.voice || DEFAULT_VOICE;
  const viewMode = stats.viewMode || DEFAULT_VIEW_MODE;
  const dailyGoal = stats.dailyGoal || DEFAULT_DAILY_GOAL;
  const theme = stats.theme || 'light';
  const audioRate = stats.audioRate || 0.95;
  const audioAutoPlay = !!stats.audioAutoPlay;
  const showCharacters = stats.showCharacters !== false;
  const soundEffects = stats.soundEffects !== false;
  const currentStageId = stats.currentStage || stats.startedStage || 1;
  const currentStage = STAGES.find(s => s.id === currentStageId) || {};
  const previewText = transformThai(PREVIEW_THAI, voice);
  const openPublicPage = (path, fallback) => {
    if (onOpenPublicPage) {
      onOpenPublicPage(path);
      return;
    }
    if (fallback) {
      fallback(true);
      return;
    }
    window.location.assign(path);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-eyebrow">Preferences</div>
            <div className="modal-title">Settings</div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close settings"><X size={20} /></button>
        </div>
        <div className="modal-body">
          <div className="setting-group">
            <div className="setting-label">Theme</div>
            <div className="setting-sub">Light or dark mode</div>
            <div className="setting-toggle">
              <button type="button" className={`setting-toggle-btn ${theme === 'light' ? 'setting-toggle-active' : ''}`} onClick={() => updateSettings({ theme: 'light' })} aria-pressed={theme === 'light'}>
                <span>Light</span>
              </button>
              <button type="button" className={`setting-toggle-btn ${theme === 'dark' ? 'setting-toggle-active' : ''}`} onClick={() => updateSettings({ theme: 'dark' })} aria-pressed={theme === 'dark'}>
                <span>Dark</span>
              </button>
            </div>
          </div>

          <div className="setting-group">
            <div className="setting-label">Voice / Perspective</div>
            <div className="setting-sub">All sentences use this speaker's pronouns and polite particles.</div>
            <div className="setting-toggle">
              <button type="button" className={`setting-toggle-btn ${voice === 'male' ? 'setting-toggle-active' : ''}`} onClick={() => updateSettings({ voice: 'male' })} aria-pressed={voice === 'male'}>
                <span>Male</span>
                <span className="setting-toggle-sub">phom / khrap</span>
              </button>
              <button type="button" className={`setting-toggle-btn ${voice === 'female' ? 'setting-toggle-active' : ''}`} onClick={() => updateSettings({ voice: 'female' })} aria-pressed={voice === 'female'}>
                <span>Female</span>
                <span className="setting-toggle-sub">chan / kha</span>
              </button>
            </div>
          </div>

          <div className="setting-group">
            <div className="setting-label">Learning mode</div>
            <div className="setting-sub">Choose what the lesson card emphasizes.</div>
            <div className="setting-toggle setting-toggle-vert">
              <button type="button" className={`setting-toggle-btn ${viewMode === 'speak' ? 'setting-toggle-active' : ''}`} onClick={() => updateSettings({ viewMode: 'speak' })} aria-pressed={viewMode === 'speak'}>
                <div className="setting-toggle-row"><span>Speak only</span></div>
                <span className="setting-toggle-sub">Phonetic first; Thai script is secondary.</span>
              </button>
              <button type="button" className={`setting-toggle-btn ${viewMode === 'both' ? 'setting-toggle-active' : ''}`} onClick={() => updateSettings({ viewMode: 'both' })} aria-pressed={viewMode === 'both'}>
                <div className="setting-toggle-row"><span>Speak + Read</span></div>
                <span className="setting-toggle-sub">Thai script and phonetic text are both visible.</span>
              </button>
              <button type="button" className={`setting-toggle-btn ${viewMode === 'read' ? 'setting-toggle-active' : ''}`} onClick={() => updateSettings({ viewMode: 'read' })} aria-pressed={viewMode === 'read'}>
                <div className="setting-toggle-row"><span>Read mastery</span></div>
                <span className="setting-toggle-sub">Thai script first; phonetic appears after reveal.</span>
              </button>
            </div>
          </div>

          <div className="setting-group">
            <div className="setting-label">Pronunciation speed</div>
            <div className="setting-sub">Controls Thai text-to-speech everywhere the speaker button is used.</div>
            <div className="setting-toggle setting-toggle-compact">
              {AUDIO_RATE_OPTIONS.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`setting-toggle-btn ${audioRate === option.value ? 'setting-toggle-active' : ''}`}
                  onClick={() => updateSettings({ audioRate: option.value })}
                  aria-pressed={audioRate === option.value}
                >
                  <span>{option.label}</span>
                  <span className="setting-toggle-sub">{option.helper}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="setting-test-audio-btn"
              onClick={() => speakThai(previewText, audioRate)}
            >
              Play sample
            </button>
          </div>

          <div className="setting-group">
            <div className="setting-label">Audio playback</div>
            <div className="setting-sub">Choose when lesson audio plays.</div>
            <div className="setting-toggle setting-toggle-vert">
              <button
                type="button"
                className={`setting-toggle-btn ${!audioAutoPlay ? 'setting-toggle-active' : ''}`}
                onClick={() => updateSettings({ audioAutoPlay: false })}
                aria-pressed={!audioAutoPlay}
              >
                <div className="setting-toggle-row"><span>Tap speaker to play</span></div>
                <span className="setting-toggle-sub">Audio plays only when you tap the speaker.</span>
              </button>
              <button
                type="button"
                className={`setting-toggle-btn ${audioAutoPlay ? 'setting-toggle-active' : ''}`}
                onClick={() => updateSettings({ audioAutoPlay: true })}
                aria-pressed={audioAutoPlay}
              >
                <div className="setting-toggle-row"><span>Auto-play new cards</span></div>
                <span className="setting-toggle-sub">Play Thai audio automatically when a card appears.</span>
              </button>
            </div>
          </div>

          <div className="setting-group">
            <div className="setting-label">Show lesson characters</div>
            <div className="setting-sub">Turn off animated lesson characters if they feel distracting.</div>
            <div className="setting-toggle">
              <button
                type="button"
                className={`setting-toggle-btn ${showCharacters ? 'setting-toggle-active' : ''}`}
                onClick={() => updateSettings({ showCharacters: true })}
                aria-pressed={showCharacters}
              >
                <span>On</span>
                <span className="setting-toggle-sub">Animated tutor</span>
              </button>
              <button
                type="button"
                className={`setting-toggle-btn ${!showCharacters ? 'setting-toggle-active' : ''}`}
                onClick={() => updateSettings({ showCharacters: false })}
                aria-pressed={!showCharacters}
              >
                <span>Off</span>
                <span className="setting-toggle-sub">Cleaner cards</span>
              </button>
            </div>
          </div>

          <div className="setting-group">
            <div className="setting-label">Sound effects</div>
            <div className="setting-sub">Turn off lesson sounds, feedback sounds, and celebration sounds.</div>
            <div className="setting-toggle">
              <button
                type="button"
                className={`setting-toggle-btn ${soundEffects ? 'setting-toggle-active' : ''}`}
                onClick={() => updateSettings({ soundEffects: true })}
                aria-pressed={soundEffects}
              >
                <span>On</span>
                <span className="setting-toggle-sub">Feedback sounds</span>
              </button>
              <button
                type="button"
                className={`setting-toggle-btn ${!soundEffects ? 'setting-toggle-active' : ''}`}
                onClick={() => updateSettings({ soundEffects: false })}
                aria-pressed={!soundEffects}
              >
                <span>Off</span>
                <span className="setting-toggle-sub">Silent effects</span>
              </button>
            </div>
          </div>

          <div className="setting-group">
            <div className="setting-label">Daily XP goal</div>
            <div className="setting-sub">Earn a {XP_REWARDS.dailyGoalBonus} XP bonus when you hit it.</div>
            <div className="setting-toggle setting-goal-grid">
              {[25, 50, 100, 200].map(g => (
                <button
                  key={g}
                  type="button"
                  className={`setting-goal-btn ${dailyGoal === g ? 'setting-toggle-active' : ''}`}
                  onClick={() => updateSettings({ dailyGoal: g })}
                  aria-pressed={dailyGoal === g}
                >
                  {g} XP
                </button>
              ))}
            </div>
          </div>

          <div className="setting-group">
            <div className="setting-label">Current stage</div>
            <div className="setting-sub">Stages unlock as you progress. They are earned through learning, not selected here.</div>
            <div className="setting-stage-current-readonly">
              <span className="setting-stage-current-icon">{currentStage.icon}</span>
              <div>
                <div className="setting-stage-current-num">Stage {currentStageId}</div>
                <div className="setting-stage-current-name">{currentStage.name}</div>
              </div>
            </div>
          </div>

          <div className="setting-group">
            <div className="setting-label">Streak protection</div>
            <div className="setting-sub">You have <strong>{stats.streakFreezes || 0}</strong> freeze{(stats.streakFreezes || 0) === 1 ? '' : 's'} available. You earn one every 7 study days.</div>
          </div>

          <div className="setting-group">
            <div className="setting-label">Legal</div>
            <div className="setting-sub">Public launch pages and support information</div>
            <div className="settings-legal-links">
              <button type="button" className="settings-legal-link" onClick={() => openPublicPage('/privacy', setShowPrivacy)}>Privacy Policy</button>
              <span className="settings-legal-divider" aria-hidden="true">/</span>
              <button type="button" className="settings-legal-link" onClick={() => openPublicPage('/terms', setShowTerms)}>Terms of Use</button>
              <span className="settings-legal-divider" aria-hidden="true">/</span>
              <button type="button" className="settings-legal-link" onClick={() => openPublicPage('/support')}>Support</button>
              <span className="settings-legal-divider" aria-hidden="true">/</span>
              <button type="button" className="settings-legal-link" onClick={() => openPublicPage('/delete-account')}>Account Deletion</button>
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
