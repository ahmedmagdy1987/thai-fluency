import React from 'react';
import { SENTENCE_PATTERNS } from '../data/reference.js';

export default function PatternsSection() {
  return (
    <div>
      <div className="guide-eyebrow">The blueprint</div>
      <h2 className="guide-h2">Sentence patterns</h2>
      <p className="guide-p">Drop any noun or verb into these molds. These 12 patterns cover almost every conversational situation.</p>
      <div className="pattern-list">
        {SENTENCE_PATTERNS.map((p, i) => (
          <div key={i} className="pattern-card">
            <div className="pattern-card-num">{String(i+1).padStart(2,'0')}</div>
            <div className="pattern-card-body">
              <div className="pattern-card-template">{p.pattern}</div>
              <div className="pattern-card-en">{p.en}</div>
              <div className="pattern-card-example">{p.example}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
