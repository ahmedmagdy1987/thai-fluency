import React from 'react';
import { IDIOMS } from '../data/reference.js';

export default function IdiomsSection() {
  return (
    <div>
      <div className="guide-eyebrow">Sounding human</div>
      <h2 className="guide-h2">Idioms & slang</h2>
      <p className="guide-p">Textbook Thai gets you understood. Slang gets you accepted. These show up in every casual conversation.</p>
      <div className="ref-grid">
        {IDIOMS.map((it, i) => (
          <div key={i} className="ref-card">
            <div className="ref-card-body">
              <div className="ref-card-thai">{it.thai}</div>
              <div className="ref-card-ph">{it.ph || <span className="ph-pending">phonetic coming soon</span>}</div>
              <div className="ref-card-en">{it.en}</div>
              <div className="ref-card-note">{it.note}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
