import React, { useState, useEffect } from 'react';
import { Volume2, RotateCcw, ChevronRight } from 'lucide-react';
import { DIALOGUES } from '../data/reference.js';
import { displayCard, displayLine, transformThai, transformPh, transformEn, DEFAULT_VOICE, DEFAULT_VIEW_MODE } from '../lib/voice.js';
import { speakThai, ttsAvailable } from '../lib/audio.js';

export default function DialoguesView({ recordDialogueComplete, dialoguesCompleted = [], voice, audioRate }) {
  const [openId, setOpenId] = useState(DIALOGUES[0].id);
  const [revealed, setRevealed] = useState(0);
  const dlg = DIALOGUES.find(d => d.id === openId);
  const isAtEnd = revealed + 1 >= dlg.lines.length;
  const isCompleted = dialoguesCompleted.includes(openId);

  useEffect(() => {
    if (isAtEnd && !isCompleted && recordDialogueComplete) {
      recordDialogueComplete(openId);
    }
  }, [isAtEnd, isCompleted, openId, recordDialogueComplete]);

  return (
    <div className="dialogues-view">
      <div className="dialogue-tabs">
        {DIALOGUES.map(d => {
          const done = dialoguesCompleted.includes(d.id);
          return (
            <button key={d.id} className={`dialogue-tab ${openId === d.id ? 'dialogue-tab-active' : ''} ${done ? 'dialogue-tab-done' : ''}`} onClick={() => { setOpenId(d.id); setRevealed(0); }}>
              <span className="dialogue-tab-icon">{d.icon}</span>
              <span>{d.title}</span>
              {done && <span className="dialogue-tab-check">✓</span>}
            </button>
          );
        })}
      </div>

      <div className="dialogue-setting">{dlg.setting}</div>

      <div className="dialogue-lines">
        {dlg.lines.slice(0, revealed + 1).map((rawLine, i) => {
          const line = displayLine(rawLine, voice);
          return (
            <div key={i} className={`dialogue-line dialogue-line-${line.who}`}>
              <div className="dialogue-line-who">{line.who}</div>
              <div className="dialogue-line-bubble">
                <div className="dialogue-bubble-row">
                  <div className="dialogue-bubble-text">
                    <div className="dialogue-line-thai">{line.thai}</div>
                    <div className="dialogue-line-ph">{line.ph}</div>
                    <div className="dialogue-line-en">"{line.en}"</div>
                  </div>
                  {ttsAvailable() && line.thai && (
                    <button className="speaker-btn speaker-btn-inline speaker-btn-bubble" onClick={() => speakThai(line.thai, audioRate)} title="Hear pronunciation" aria-label="Play pronunciation">
                      <Volume2 size={14} />
                    </button>
                  )}
                </div>
                {line.note && <div className="dialogue-line-note">{line.note}</div>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="dialogue-controls">
        {ttsAvailable() && (
          <button className="dialogue-playall-btn" onClick={() => {
            // Speak each visible line in sequence with small gaps
            const lines = dlg.lines.slice(0, revealed + 1);
            window.speechSynthesis.cancel();
            lines.forEach((rawLine, i) => {
              const line = displayLine(rawLine, voice);
              setTimeout(() => speakThai(line.thai, audioRate), i * 1800);
            });
          }} title="Play all visible lines">
            <Volume2 size={14} /> Play
          </button>
        )}
        {revealed + 1 < dlg.lines.length ? (
          <button className="dialogue-next-btn" onClick={() => setRevealed(r => r + 1)}>
            Next line <ChevronRight size={16} />
          </button>
        ) : (
          <button className="dialogue-reset-btn" onClick={() => setRevealed(0)}>
            <RotateCcw size={14} /> Restart
          </button>
        )}
      </div>
    </div>
  );
}
