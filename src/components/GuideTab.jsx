import React, { useState } from 'react';
import { TrendingUp, Award, Volume2, BookOpen, Sparkles, AlertTriangle, Heart, Ear } from 'lucide-react';
import TonesQuizSection from './TonesQuizSection.jsx';
import TonesSection from './TonesSection.jsx';
import PronunciationSection from './PronunciationSection.jsx';
import PatternsSection from './PatternsSection.jsx';
import IdiomsSection from './IdiomsSection.jsx';
import ErrorsSection from './ErrorsSection.jsx';
import CultureSection from './CultureSection.jsx';
import ListenMeaning from './ListenMeaning.jsx';

export default function GuideTab({ onTonesQuizComplete, tonesQuizBest, tonesQuizPassed, voice = 'male', audioRate = 0.9, showCharacters = true }) {
  const [section, setSection] = useState('tones');
  return (
    <div className="tab-content">
      <div className="guide-section-tabs">
        {[
          { id: 'tones', label: 'Tones', icon: TrendingUp },
          { id: 'tones-quiz',label: 'Tone Challenge', icon: Award },
          { id: 'listen', label: 'Listen & Match', icon: Ear },
          { id: 'pronoun', label: 'Pronunciation', icon: Volume2 },
          { id: 'patterns', label: 'Patterns', icon: BookOpen },
          { id: 'idioms', label: 'Idioms', icon: Sparkles },
          { id: 'errors', label: 'Errors', icon: AlertTriangle },
          { id: 'culture', label: 'Culture', icon: Heart },
        ].map(s => {
          const Icon = s.icon;
          return (
            <button key={s.id} className={`guide-tab ${section === s.id ? 'guide-tab-active' : ''}`} onClick={() => setSection(s.id)}>
              <Icon size={14} />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {section === 'tones'      && <TonesSection />}
      {section === 'tones-quiz' && <TonesQuizSection onComplete={onTonesQuizComplete} bestScore={tonesQuizBest} passed={tonesQuizPassed} />}
      {section === 'listen'     && <ListenMeaning voice={voice} audioRate={audioRate} showCharacters={showCharacters} />}
      {section === 'pronoun'    && <PronunciationSection />}
      {section === 'patterns'   && <PatternsSection />}
      {section === 'idioms'     && <IdiomsSection />}
      {section === 'errors'     && <ErrorsSection />}
      {section === 'culture'    && <CultureSection />}
    </div>
  );
}
