import React, { useState, useMemo, useEffect } from 'react';
import { Search, Volume2, BookOpen, MessageSquare, Layers, X } from 'lucide-react';

const PAGE_SIZE = 60;
import { CARDS } from '../data/cards.js';
import { DIALOGUES } from '../data/reference.js';
import { CATEGORIES, STAGES } from '../data/taxonomy.js';
import { displayCard, displayLine, transformThai, transformPh, transformEn, DEFAULT_VOICE, DEFAULT_VIEW_MODE } from '../lib/voice.js';
import { speakThai, ttsAvailable } from '../lib/audio.js';
import DialoguesView from './DialoguesView.jsx';

export default function BrowseTab({ progress, recordDialogueComplete, dialoguesCompleted, voice, viewMode, audioRate }) {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState(null);
  const [activeStage, setActiveStage] = useState(null);
  const [section, setSection] = useState('vocab'); // vocab | dialogues
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [search, activeCat, activeStage, section]);

  const filtered = useMemo(() => {
    let items = CARDS;
    if (activeStage) items = items.filter(c => (c.stage || 1) === activeStage);
    if (activeCat) items = items.filter(c => c.cat === activeCat);
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      items = items.filter(c =>
        c.thai.includes(q) ||
        c.ph.toLowerCase().includes(q) ||
        c.en.toLowerCase().includes(q)
      );
    }
    return items;
  }, [search, activeCat, activeStage]);

  const cardsByCategory = useMemo(() => {
    const map = {};
    CARDS.forEach(c => {
      if (!map[c.cat]) map[c.cat] = 0;
      map[c.cat]++;
    });
    return map;
  }, []);

  const cardsByStage = useMemo(() => {
    const map = {};
    CARDS.forEach(c => {
      const s = c.stage || 1;
      map[s] = (map[s] || 0) + 1;
    });
    return map;
  }, []);

  return (
    <div className="tab-content">
      <div className="browse-tabs">
        <button className={`browse-tab ${section === 'vocab' ? 'browse-tab-active' : ''}`} onClick={() => setSection('vocab')}>
          <Layers size={14} /> Words & Phrases
        </button>
        <button className={`browse-tab ${section === 'dialogues' ? 'browse-tab-active' : ''}`} onClick={() => setSection('dialogues')}>
          <MessageSquare size={14} /> Dialogues
        </button>
      </div>

      {section === 'vocab' && (
        <>
          <div className="browse-sticky">
            <div className="search-bar">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search Thai, phonetic, or English..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && <button className="search-clear" onClick={() => setSearch('')} aria-label="Clear search"><X size={14} /></button>}
            </div>
          </div>

          {!search && (
            <section className="browse-filter-section" aria-labelledby="filter-stage-label">
              <header className="browse-filter-header">
                <h3 id="filter-stage-label" className="browse-filter-title">📚 Filter by Stage</h3>
                <span className="browse-filter-hint">Difficulty level — start with Stage 1</span>
              </header>
              <div className="stage-chips">
                <button className={`stage-chip ${activeStage === null ? 'stage-chip-active' : ''}`} onClick={() => setActiveStage(null)}>
                  All stages
                </button>
                {STAGES.map(s => (
                  <button key={s.id} className={`stage-chip ${activeStage === s.id ? 'stage-chip-active' : ''}`} onClick={() => setActiveStage(s.id)} style={{ '--chip-color': s.color }}>
                    <span className="stage-chip-icon">{s.icon}</span>
                    Stage {s.id}
                    <span className="stage-chip-count">{cardsByStage[s.id] || 0}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {!search && (
            <section className="browse-filter-section" aria-labelledby="filter-cat-label">
              <header className="browse-filter-header">
                <h3 id="filter-cat-label" className="browse-filter-title">🏷️ Filter by Category</h3>
                <span className="browse-filter-hint">Topic — food, body, time, and more</span>
              </header>
              <div className="cat-chips">
                <button className={`cat-chip ${activeCat === null ? 'cat-chip-active' : ''}`} onClick={() => setActiveCat(null)}>
                  All ({CARDS.length})
                </button>
                {CATEGORIES.map(c => (
                  <button key={c.id} className={`cat-chip ${activeCat === c.id ? 'cat-chip-active' : ''}`} onClick={() => setActiveCat(c.id)} style={{ '--chip-color': c.color }}>
                    <span className="cat-chip-icon">{c.icon}</span>
                    {c.name}
                    <span className="cat-chip-count">{cardsByCategory[c.id] || 0}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {(activeStage || activeCat) && (
            <div className="browse-active-filters">
              <span className="browse-active-label">Active filter{activeStage && activeCat ? 's' : ''}:</span>
              {activeStage && (() => {
                const s = STAGES.find(st => st.id === activeStage);
                return <span className="browse-active-pill" style={{ '--pill-color': s?.color }}>{s?.icon} Stage {activeStage}</span>;
              })()}
              {activeCat && (() => {
                const c = CATEGORIES.find(cc => cc.id === activeCat);
                return <span className="browse-active-pill" style={{ '--pill-color': c?.color }}>{c?.icon} {c?.name}</span>;
              })()}
              <button className="browse-active-clear" onClick={() => { setActiveStage(null); setActiveCat(null); }}>
                <X size={12} /> Clear
              </button>
            </div>
          )}

          <div className="browse-results-meta">
            {filtered.length === 0
              ? '0 items'
              : (filtered.length > visibleCount
                  ? `Showing ${visibleCount} of ${filtered.length}`
                  : `${filtered.length} ${filtered.length === 1 ? 'item' : 'items'}`)}
          </div>

          {filtered.length > 0 && (
            <div className="vocab-list">
              {filtered.slice(0, visibleCount).map(rawC => {
                const c = displayCard(rawC, voice);
                const state = progress[c.id];
                const cat = CATEGORIES.find(cc => cc.id === c.cat);
                return (
                  <div key={c.id} className="vocab-item">
                    <div className="vocab-item-main">
                      <div className="vocab-item-thai">{c.thai}</div>
                      <div className="vocab-item-ph">{c.ph || <span className="vocab-item-ph-pending">phonetic coming soon</span>}</div>
                      <div className="vocab-item-en">{c.en}</div>
                      {c.note && <div className="vocab-item-note">{c.note}</div>}
                    </div>
                    <div className="vocab-item-meta">
                      {ttsAvailable() && c.thai && (
                        <button className="speaker-btn speaker-btn-inline" onClick={(e) => { e.stopPropagation(); speakThai(c.thai, audioRate); }} title="Hear pronunciation" aria-label="Play pronunciation">
                          <Volume2 size={14} />
                        </button>
                      )}
                      {cat && <div className="vocab-item-cat" style={{ color: cat.color }}>{cat.icon}</div>}
                      {state && (
                        <div className={`vocab-item-status ${state.learning ? 'vis-learning' : (state.interval >= 21 ? 'vis-mature' : 'vis-young')}`}>
                          {state.learning ? '◐' : (state.interval >= 21 ? '●' : '◑')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filtered.length > visibleCount && (
            <div className="browse-load-more-row">
              <button
                className="browse-load-more-btn"
                onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
              >
                Load more · {Math.min(PAGE_SIZE, filtered.length - visibleCount)} more
              </button>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="browse-empty">
              <div className="browse-empty-icon">🔍</div>
              <div className="browse-empty-title">
                {search ? `No results for "${search}"` : 'No items match your filters'}
              </div>
              <div className="browse-empty-sub">
                {search ? 'Try a different search term, or browse by category.' : 'Try a different category or stage.'}
              </div>
              {(search || activeCat || activeStage) && (
                <button
                  className="browse-empty-reset"
                  onClick={() => { setSearch(''); setActiveCat(null); setActiveStage(null); }}
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </>
      )}

      {section === 'dialogues' && <DialoguesView recordDialogueComplete={recordDialogueComplete} dialoguesCompleted={dialoguesCompleted} voice={voice} audioRate={audioRate} />}
    </div>
  );
}
