import React from 'react';
import { Lock, Crown, MapPin } from 'lucide-react';
import { getSituationRecommendation, describeAllSituations, LOCK_REASON, LOCK_LABEL } from '../lib/situationProgression.js';
import { DRAFT_BADGE_LABEL } from '../lib/reviewStatus.js';

// The learner's situation order, surfaced inside the Learn tab (README §2/§3;
// curriculum.md §6.1). This is the surface that makes the onboarding promise
// checkable: identityPath claims situations get "boosted in your order", so the
// order has to be visible somewhere. This is that somewhere.
//
// WHAT THIS RENDERS, AND WHY IT RENDERS NOTHING ELSE:
//   • Every entry, every reason, and every count comes from
//     getSituationRecommendation(stats) — the pure recommender. This component
//     computes NO gating, NO ordering and NO readiness of its own; if a rule
//     isn't in situationProgression.js it isn't enforced here.
//   • All 16 are listed. Dropping the locked ones would itself be gating (§3:
//     the path reweights, it never forks), and hiding "coming soon" would fake
//     a catalog we have not written.
//   • The 7 tagged situations show their REAL card count, drawn from the live
//     deck. The other 9 own zero cards and say exactly that.
//   • sit-dating is a locked preview for everyone — Super + 18+ + no rail
//     lessons written. The recommender guarantees it is never `upNext`; this
//     component never second-guesses that, and the 18+ attestation is NOT
//     resolved here because nothing behind it is handed out here.
//
// DRAFT BADGE (exercise-types.md §0.3 — mandatory, non-negotiable): nothing in
// the deck is native-approved, so every surfaced situation carries
// DRAFT_BADGE_LABEL. `offerable` means "owns cards we can teach", which is NOT
// approval — the two are deliberately different signals and the badge is what
// keeps that honest. Never render an approved state here: only a human native
// reviewer can create one, and none exists yet.
//
// NO PER-SITUATION CTA, ON PURPOSE: no situation lesson flow exists yet, so a
// "Start" button would lead nowhere. An affordance that lies is worse than no
// affordance. This is a plan/preview rail until that flow ships.
export default function SituationRail({ stats, onOpenSuper }) {
  const rec = getSituationRecommendation(stats);
  const upNextId = rec.upNext ? rec.upNext.sitId : null;
  // The recommendation exposes `upNext` and `lockedPreviews`, which between them
  // omit the offerable-but-not-first situations — so take the annotated entries
  // from describeAllSituations (same describeSituation() model, same stats) and
  // sequence them by rec.order. Order and annotation both stay the lib's job.
  const byId = new Map(describeAllSituations(stats).map(e => [e.sitId, e]));

  return (
    <section className="situation-rail" aria-labelledby="situation-rail-title">
      <header className="situation-rail-header">
        <h2 id="situation-rail-title" className="situation-rail-title">
          <MapPin size={16} aria-hidden="true" /> Your situation order
        </h2>
        <p className="situation-rail-sub">
          The real-life situations this course covers, ordered for you. Everyone gets all 16 — your
          answer in setup only moves them up or down this list.
        </p>
      </header>

      <ol className="situation-rail-list">
        {rec.order.map((sitId, i) => {
          const e = byId.get(sitId);
          if (!e) return null;
          const isUpNext = sitId === upNextId;
          return (
            <li
              key={sitId}
              className={`situation-row ${e.offerable ? 'situation-row-open' : 'situation-row-locked'} ${isUpNext ? 'situation-row-upnext' : ''}`}
            >
              <span className="situation-row-rank" aria-hidden="true">{i + 1}</span>
              <div className="situation-row-body">
                <div className="situation-row-name">
                  {!e.offerable && <Lock size={12} className="situation-row-lockicon" aria-hidden="true" />}
                  {e.name}
                </div>

                <div className="situation-row-meta">
                  {/* Real counts only. Zero cards is stated, never padded. */}
                  {e.cardCount > 0
                    ? <span className="situation-chip situation-chip-count">{e.cardCount} cards</span>
                    : <span className="situation-chip situation-chip-empty">No lessons written yet</span>}

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

              {/* The only CTA on the rail, and it sells nothing that isn't real:
                  it routes to the plans page for the one situation actually behind
                  a shipped Super entitlement. It does not claim to unlock the
                  situation's lessons — those are not written. */}
              {!e.offerable && e.reasons.includes(LOCK_REASON.SUPER) && onOpenSuper && (
                <button type="button" className="situation-row-cta" onClick={onOpenSuper}>Go Super</button>
              )}
            </li>
          );
        })}
      </ol>

      <p className="situation-rail-note">
        {rec.comingSoon.length} of {rec.order.length} situations have no lessons written yet — they
        are listed so you can see what is planned, not because they are ready. Everything here is
        draft content awaiting native-speaker review.
      </p>
    </section>
  );
}
