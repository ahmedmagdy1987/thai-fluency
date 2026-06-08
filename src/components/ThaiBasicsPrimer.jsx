import React from 'react';
import { BookOpen } from 'lucide-react';

// Presentational Thai Basics Primer content (title, subtitle, numbered rules).
// Shared so there is ONE source of truth for the primer markup: the first-lesson
// primer step renders it with lesson CTAs around it, and LearnPath's "Thai
// basics" modal renders it with a close button. Pure: no state, no side effects.
export default function ThaiBasicsPrimer({ primer }) {
  if (!primer || !Array.isArray(primer.sections) || primer.sections.length === 0) return null;
  return (
    <div className="basics-primer-content">
      <div className="firstlesson-primer-head">
        <span className="firstlesson-primer-icon" aria-hidden="true"><BookOpen size={20} /></span>
        <div>
          <div className="firstlesson-eyebrow">Quick primer · about {primer.readMinutes || 2} min</div>
          <h1 className="firstlesson-title">{primer.title}</h1>
        </div>
      </div>
      {primer.subtitle && <p className="firstlesson-copy">{primer.subtitle}</p>}
      <ul className="firstlesson-primer-list">
        {primer.sections.map((section, i) => (
          <li key={section.heading || i} className="firstlesson-primer-item">
            <span className="firstlesson-primer-num" aria-hidden="true">{i + 1}</span>
            <div className="firstlesson-primer-text">
              <h2 className="firstlesson-primer-heading">{section.heading}</h2>
              <p className="firstlesson-primer-body">{section.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
