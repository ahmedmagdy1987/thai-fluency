import React from 'react';
import { PRONUNCIATION_TIPS } from '../data/reference.js';

export default function PronunciationSection() {
  return (
    <div>
      <div className="guide-eyebrow">Mouth mechanics</div>
      <h2 className="guide-h2">Sounds Americans get wrong</h2>
      <p className="guide-p">Eleven traps. Master these and your accent goes from "American tourist" to "American who actually tried."</p>
      <div className="ref-grid">
        {PRONUNCIATION_TIPS.map((p, i) => (
          <div key={i} className="ref-card">
            <div className="ref-card-icon">{p.sound}</div>
            <div className="ref-card-body">
              <div className="ref-card-desc">{p.desc}</div>
              <div className="ref-card-example">{p.example}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
