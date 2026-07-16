import React from 'react';
import { Lock, Crown, MapPin, Play } from 'lucide-react';
import { getSituationRecommendation, LOCK_REASON, LOCK_LABEL } from '../lib/situationProgression.js';
import { DRAFT_BADGE_LABEL } from '../lib/reviewStatus.js';

// The learner's situation order, surfaced inside the Learn tab (README §2/§3;
// curriculum.md §6.1). This is the surface that makes the onboarding promise
// checkable: identityPath claims situations get "boosted in your order", so the
// order has to be visible somewhere. This is that somewhere.
//
// WHAT THIS RENDERS, AND WHY IT RENDERS NOTHING ELSE:
//   • Every entry, every reason, every count and the startable/deferred split
//     come from getSituationRecommendation(stats, stageWindow) — the pure
//     recommender. This component computes NO gating, NO ordering, NO readiness
//     and NO card pool of its own; if a rule isn't in situationProgression.js it
//     isn't enforced here.
//   • The 7 startable situations show the REAL size of the session their Start
//     launches, drawn from the live deck.
//
// ── HIDE, DON'T FAKE: WHY 8 ROWS COLLAPSE INTO ONE ───────────────────────────
// Wave 3 rendered all 16 rows, 9 of them dead ("No lessons written yet") — which
// made the free tier read half-empty, worst on the tourist path where ranks #2
// and #3 are both unwritten. Those rows were honest and still wrong: an empty row
// costs a full row of attention to say "nothing here".
//
// They are COLLAPSED, not deleted. Deleting them would quietly contradict this
// rail's own promise — the course is 16 situations, the identity weighting moves
// all 16, and a tourist who never sees sit-transport or sit-market cannot check
// the promise that they were boosted. One summary line keeps the roadmap visible
// (a named list, no counts, no Start, no badge) while spending one row instead of
// nine. It claims nothing exists: it says the opposite, once, plainly.
//
// sit-dating is NOT collapsed (ALWAYS_PREVIEW in the lib). It owns 0 cards, so
// the content filter would sweep it away — but its row is the one honest upsell
// we have: a real, shipped Super entitlement, carrying all three reasons at once
// (Super + 18+ + coming-soon) so it cannot be mistaken for ready content. The
// recommender guarantees it is never `upNext`; this component never second-
// guesses that, and the 18+ attestation is NOT resolved here because nothing
// behind it is handed out here.
//
// DRAFT BADGE (exercise-types.md §0.3 — mandatory, non-negotiable): nothing in
// the deck is native-approved, so every surfaced situation carries
// DRAFT_BADGE_LABEL. `startable` means "owns cards we can teach and you have them
// open", which is NOT approval — the two are deliberately different signals and
// the badge is what keeps that honest. Never render an approved state here: only
// a human native reviewer can create one, and none exists yet. The collapsed
// summary carries no badge on purpose — a "draft content" badge on a situation
// with zero content would imply draft content exists to review.
//
// THE START BUTTON IS REAL (this is what Wave 3 could not ship). It reuses the
// existing card-session machinery via onStartSituation → App.handleStartSituationCards
// → handleStartMissionCards; no new exercise type, no new Thai, and a card
// session is not graded so it spends NO heart. Absent the prop (e.g. the viz
// harness) no Start renders — an affordance that lies is worse than no affordance.
export default function SituationRail({ stats, startedStage = 1, maxUnlockedStage = 1, onOpenSuper, onStartSituation }) {
  // The stage window is passed through, never recomputed: a situation is a
  // CROSS-STAGE tag (every tagged one spans stages 1-8), so what it can teach
  // depends on the learner's unlocked stages. The lib does that math.
  const rec = getSituationRecommendation(stats, { startedStage, maxUnlockedStage });
  const upNextId = rec.upNext ? rec.upNext.sitId : null;
  // startable + previews = the rows we surface, in the learner's order. `deferred`
  // is everything with nothing to teach and nothing to sell — the collapsed
  // summary below. The three partition all 16; the lib guarantees that.
  const rows = rec.entries.filter(e => e.startable || rec.previews.includes(e));

  return (
    <section className="situation-rail" aria-labelledby="situation-rail-title">
      <header className="situation-rail-header">
        <h2 id="situation-rail-title" className="situation-rail-title">
          <MapPin size={16} aria-hidden="true" /> Your situation order
        </h2>
        <p className="situation-rail-sub">
          The real-life situations this course covers, ordered for you. Your answer in setup only
          moves them up or down this list — it never locks anything.
        </p>
      </header>

      <ol className="situation-rail-list">
        {rows.map((e, i) => {
          const isUpNext = e.sitId === upNextId;
          return (
            <li
              key={e.sitId}
              className={`situation-row ${e.startable ? 'situation-row-open' : 'situation-row-locked'} ${isUpNext ? 'situation-row-upnext' : ''}`}
            >
              {/* Rank among the rows we can honestly show. The full §3 order is
                  unchanged underneath (rec.order still holds all 16). */}
              <span className="situation-row-rank" aria-hidden="true">{i + 1}</span>
              <div className="situation-row-body">
                <div className="situation-row-name">
                  {!e.startable && <Lock size={12} className="situation-row-lockicon" aria-hidden="true" />}
                  {e.name}
                </div>

                <div className="situation-row-meta">
                  {/* startCount, NOT cardCount: the only number a Start may claim
                      is the session it actually launches (teachable ∩ your open
                      stages). The title shows the situation's full teachable size
                      so a small number reads as "more unlocks later", not "tiny". */}
                  {e.startable && (
                    <span
                      className="situation-chip situation-chip-count"
                      title={`${e.startCount} of this situation's ${e.teachableCount} cards are in the stages you've unlocked`}
                    >
                      {e.startCount} card{e.startCount === 1 ? '' : 's'} ready
                    </span>
                  )}

                  {/* Every reason, not just the first: a free user must see Super
                      AND 18+ AND coming-soon on sit-dating, not one of the three. */}
                  {e.reasons.map(r => (
                    <span key={r} className={`situation-chip situation-chip-${r === LOCK_REASON.COMING_SOON ? 'soon' : r === LOCK_REASON.SUPER ? 'super' : 'adult'}`}>
                      {r === LOCK_REASON.SUPER && <Crown size={10} aria-hidden="true" />}
                      {LOCK_LABEL[r]}
                    </span>
                  ))}

                  {/* Mandatory and unconditional for every surfaced situation. */}
                  <span className="situation-chip situation-chip-draft">{DRAFT_BADGE_LABEL}</span>
                </div>
              </div>

              {isUpNext && <span className="situation-row-flag">Up next</span>}

              {/* The real Start: launches this situation's cards through the
                  existing card-session flow. Rendered ONLY when the lib says the
                  session is non-empty, so it can never open onto nothing. */}
              {e.startable && onStartSituation && (
                <button
                  type="button"
                  className="situation-row-start"
                  onClick={() => onStartSituation(e.sitId)}
                >
                  <Play size={11} aria-hidden="true" />
                  {isUpNext ? 'Start' : 'Practice'}
                  <span className="sr-only">
                    {' '}{e.name} — {e.startCount} card{e.startCount === 1 ? '' : 's'}
                  </span>
                </button>
              )}

              {/* Sells only what is real: it routes to the plans page for the one
                  situation actually behind a shipped Super entitlement. It does
                  not claim to unlock the situation's lessons — those are not
                  written, and the row says so on the chip next to it. */}
              {!e.startable && e.reasons.includes(LOCK_REASON.SUPER) && onOpenSuper && (
                <button type="button" className="situation-row-cta" onClick={onOpenSuper}>Go Super</button>
              )}
            </li>
          );
        })}
      </ol>

      {/* Written-but-stage-locked (Wave 7): these situations HAVE lessons — a real
          card count — they just open as the learner advances through the stages.
          Shown with their counts, NOT collapsed as "not written". */}
      {rec.upcoming && rec.upcoming.length > 0 && (
        <div className="situation-upcoming">
          <h3 className="situation-upcoming-title">Unlocks as you advance</h3>
          <ul className="situation-upcoming-list">
            {rec.upcoming.map(e => (
              <li key={e.sitId} className="situation-upcoming-row">
                <Lock size={12} className="situation-row-lockicon" aria-hidden="true" />
                <span className="situation-upcoming-name">{e.name}</span>
                <span className="situation-upcoming-count">{e.teachableCount} card{e.teachableCount === 1 ? '' : 's'}</span>
              </li>
            ))}
          </ul>
          <p className="situation-upcoming-note">
            Written and waiting — they open as you reach their stages. Draft content awaiting native review.
          </p>
        </div>
      )}

      {/* The collapsed roadmap. One row for situations that own NO content yet.
          It names them so the §3 reweighting stays checkable, and states plainly
          that they are not written — no count, no Start, no badge. */}
      {rec.deferred.length > 0 && (
        <div className="situation-backlog">
          <h3 className="situation-backlog-title">
            {rec.deferred.length} more situations coming
          </h3>
          <p className="situation-backlog-body">
            No lessons are written for these yet — they are on the roadmap, not in the app:{' '}
            <span className="situation-backlog-names">
              {rec.deferred.map(e => e.name).join(' · ')}
            </span>
          </p>
        </div>
      )}

      <p className="situation-rail-note">
        {rec.startable.length} of {rec.order.length} situations have lessons you can start today.
        Everything here is draft content awaiting native-speaker review.
      </p>
    </section>
  );
}
