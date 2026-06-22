# Launch decision matrix — Tuk Talk Thai

Authoritative, current launch-readiness states. Supersedes the readiness scoring in
`docs/launch-readiness-audit.md` for the integrity/monetization dimension. Audited at
commit `ea62210`.

Three states, each gated on explicit blockers. A state is **READY** only when every
blocker under it is cleared.

---

## State 1 — Beta ready (invite-only / closed testers)  →  **YES (with caveats)**

The product is usable end to end; client-side anti-farm guards (challenge/tone ledger,
per-card daily guard, direction lock) reduce casual cheating; there is no leaderboard
or paid feature, so a tester inflating their **own** XP harms nothing.

Caveats / recommended before inviting testers (not hard blockers for a closed group):
- Publish a manual account-deletion policy (support email) — self-serve deletion can
  come later.
- Run the production E2E smoke (sign-up → confirm → onboard → sync → sign-out/in).
- Keep all premium surfaces as "Coming soon" (already the case).

> Server reward enforcement is **not** required for a closed beta, because nothing
> competitive or paid depends on XP being tamper-proof yet.

---

## State 2 — Public free launch ready  →  **NO (small, non-integrity blockers)**

Open, free, no payments, no leaderboard. Cheating still only affects the cheater's own
stats, so server reward enforcement is **recommended but not strictly blocking** here.

Blockers to clear:
- [ ] Legal: Privacy Policy + Terms live on the domain, updated for Supabase / Vercel /
      OneSignal / web push / support email / data deletion+export (P0 in
      `launch-readiness-audit.md`).
- [ ] Account deletion: real route or documented support workflow.
- [ ] Production E2E auth/progress/push smoke on the real domain.
- [ ] Domain, support email, legal/business identity confirmed.
- [ ] Premium shown only as "Coming soon" (✅ already true).
- [ ] (Recommended, not blocking) Apply server reward migration 006 before any public
      leaderboard or social-compare feature ships.

When the above are done, Public free launch = YES.

---

## State 3 — Paid launch ready  →  **NO (all hard gates open)**

Charging money requires tamper-proof rewards AND server-authoritative entitlement AND a
real, tested billing path. **Do not claim paid-launch readiness until every gate below
is cleared.**

Hard gates (all currently **OPEN**):
- [ ] **Server reward enforcement exists** — migration 006 applied; `award_reward` RPC
      is the only XP writer; client reward columns revoked.
      (`docs/server-reward-integrity-design.md`)
- [ ] **Server entitlement exists** — migration 007 applied; `user_entitlements` is
      server-authoritative; client cannot self-grant.
      (`docs/entitlement-foundation-design.md`)
- [ ] **Provider selected** — Stripe vs merchant-of-record; web-only vs store IAP.
- [ ] **Prices approved** — monthly + yearly + currencies filled in `PLANS` (today
      `null` → "Pricing coming soon"). No invented prices.
- [ ] **Webhooks verified** — signature-checked billing webhook → `apply_entitlement_event`.
- [ ] **Cancel + restore flows tested** — including grace/`past_due`, cross-device, and
      store reconciliation.

Additional paid-launch requirements (also open):
- [ ] Server-side XP clamp/recompute before any leaderboard (Tier-2 hardening).
- [ ] No secrets in the client (✅ already true — only the public anon key is in
      `VITE_*`; service key + webhook secret are server-only).
- [ ] Refund/support policy + App Store / Google Play billing compliance.

Until migrations 006 + 007 are approved and applied, a provider is chosen, prices are
approved, and cancel/restore are tested, **Paid launch is NOT ready.**

---

## Summary

| State | Ready? | Gating |
|---|---|---|
| Beta (closed) | **YES** (caveats) | manual deletion policy + prod smoke |
| Public free | **NO** | legal/deletion/domain/smoke (non-integrity); server rewards recommended pre-leaderboard |
| Paid | **NO** | server rewards (006) + entitlement (007) + provider + prices + webhooks + cancel/restore |

Nothing in this audit changed app behavior, content, or the database. The two
migrations are **proposed and awaiting approval** — see the linked design docs.
