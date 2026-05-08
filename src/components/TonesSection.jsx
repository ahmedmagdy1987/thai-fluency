import React, { useState } from 'react';
import { TONES } from '../data/reference.js';

export default function TonesSection() {
  const [active, setActive] = useState('mid');
  const t = TONES[active];
  return (
    <div>
      <div className="guide-eyebrow">The five voices</div>
      <h2 className="guide-h2">Tones</h2>
      <p className="guide-p">Same syllable, different pitch contour, different word entirely. This is THE thing separating tourists from speakers.</p>

      <div className="tone-buttons">
        {Object.entries(TONES).map(([key, tone]) => (
          <button key={key} className={`tone-btn ${active === key ? 'tone-btn-active' : ''}`} onClick={() => setActive(key)} style={{ '--tone-color': tone.color }}>
            <div className="tone-btn-symbol">{tone.symbol}</div>
            <div className="tone-btn-name">{tone.name}</div>
          </button>
        ))}
      </div>

      <div className="tone-detail" style={{ '--tone-color': t.color }}>
        <div className="tone-detail-shape">
          <svg viewBox="0 0 400 100" className="tone-svg">
            <line x1="0" y1="50" x2="400" y2="50" stroke="#C9A961" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.4" />
            <text x="0" y="20" fill="#C9A961" fontSize="10" opacity="0.6">high</text>
            <text x="0" y="95" fill="#C9A961" fontSize="10" opacity="0.6">low</text>
            <path d={t.path} stroke={t.color} strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        <div className="tone-detail-name">{t.name} tone</div>
        <div className="tone-detail-desc">{t.desc}</div>
      </div>

      <div className="guide-callout">
        <div className="guide-callout-title">The classic five-mai sentence</div>
        <p className="guide-callout-body">"ไม้ใหม่ไม่ไหม้ไหม" <em>(mái mài mâi mâi mǎi)</em> — "New wood doesn't burn, does it?" Five different tones on the same syllable.</p>
        <div className="tone-examples-grid">
          {[
            { syl: 'mái', tone: 'high', mean: 'wood' },
            { syl: 'mài', tone: 'low', mean: 'new' },
            { syl: 'mâi', tone: 'falling', mean: 'not' },
            { syl: 'mâi', tone: 'falling', mean: 'burn' },
            { syl: 'mǎi', tone: 'rising', mean: '?' },
          ].map((m, i) => (
            <div key={i} className="tone-example-cell" style={{ '--tone-color': TONES[m.tone].color }}>
              <div className="tone-example-syll">{m.syl}</div>
              <div className="tone-example-tone">{m.tone}</div>
              <div className="tone-example-mean">{m.mean}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
