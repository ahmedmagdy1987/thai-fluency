import React from 'react';
import { CULTURE } from '../data/reference.js';

export default function CultureSection() {
  return (
    <div>
      <div className="guide-eyebrow">Etiquette</div>
      <h2 className="guide-h2">Cultural fluency</h2>
      <p className="guide-p">Speaking Thai gets you 50% of the way. Knowing how to behave gets you the rest.</p>
      <div className="ref-grid">
        {CULTURE.map((c, i) => (
          <div key={i} className="ref-card">
            <div className="ref-card-body">
              <div className="ref-card-title">{c.title}</div>
              <div className="ref-card-desc">{c.body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
