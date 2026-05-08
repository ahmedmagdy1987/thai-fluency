import React from 'react';
import { COMMON_ERRORS } from '../data/reference.js';

export default function ErrorsSection() {
  return (
    <div>
      <div className="guide-eyebrow">Pitfalls</div>
      <h2 className="guide-h2">Common errors</h2>
      <p className="guide-p">Twelve mistakes that mark you as "doesn't get it." Avoid these and you skip 90% of bad-tourist stereotypes.</p>
      <div className="error-list">
        {COMMON_ERRORS.map((e, i) => (
          <div key={i} className="error-card">
            <div className="error-card-num">{String(i+1).padStart(2,'0')}</div>
            <div className="error-card-body">
              <div className="error-card-error">{e.error}</div>
              <div className="error-card-fix">{e.fix}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
