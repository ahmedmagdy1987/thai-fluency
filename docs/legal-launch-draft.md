# Legal launch draft — proposed Terms additions + owner checklist

**Status: DRAFT FOR OWNER REVIEW — nothing here is live.** This document
proposes the Terms-of-Use sections the pre-launch audit found missing
(billing, refunds, cancellation, renewal, entity, jurisdiction) so the owner
can review, edit, and approve them in one sitting. The live legal pages in
`src/components/legal/legalCopy.jsx` were **not modified** in this pass, and
all four `OwnerReviewNotice` banners remain in place until the owner signs off.

> ⚠️ This draft was written by an AI assistant and is **not legal advice**.
> Have it reviewed before launch, especially the refund policy and
> jurisdiction clauses. Items in `[BRACKETS]` are placeholders the owner must
> fill — do not launch with them unresolved.

---

## Part 1 — Proposed new Terms of Use sections

To be inserted into `TermsOfUseContent` (`src/components/legal/legalCopy.jsx`,
currently 8 sections with no billing coverage despite live Stripe checkout at
$4.99/month and $39.99/year).

### Proposed section: Subscriptions and billing

> Tuk Talk Thai offers an optional paid subscription called **Super**
> ($4.99/month or $39.99/year). Payments are processed securely by
> **Stripe**; we never see or store your card details. Prices are shown
> before checkout and may change in the future — if they do, existing
> subscribers will be notified by email before any new price takes effect,
> and the new price applies only from the next renewal.
>
> Super is sold by `[LEGAL ENTITY NAME — the person or company that owns
> Tuk Talk Thai and appears on Stripe receipts]`.

### Proposed section: Renewal

> Super subscriptions **renew automatically** at the end of each billing
> period (monthly or yearly, whichever you chose) until you cancel. The
> renewal charge uses the payment method you gave Stripe at checkout. You
> can turn off auto-renewal at any time by canceling (see below) — you keep
> Super until the end of the period you already paid for.

### Proposed section: Cancellation

> You can cancel anytime, in the app: **Settings → Plan → Cancel plan** (or
> Profile → Plan). Cancellation takes effect at the **end of your current
> billing period** — you keep full Super access until then, and you are not
> charged again. This matches how the cancellation is implemented (Stripe
> `cancel_at_period_end`; see `supabase/functions/cancel-subscription`).
> If the in-app cancel ever fails, email
> [support@tuktalkthai.com](mailto:support@tuktalkthai.com) and we will
> cancel it for you.

### Proposed section: Refunds

> `[REFUND POLICY — OWNER DECISION REQUIRED. Two common options:]`
>
> **Option A (simple/strict):** Payments are non-refundable, and no refunds
> or credits are given for partial billing periods — you keep access until
> the period ends. Where consumer law grants you a mandatory refund right
> (for example the 14-day withdrawal right for EU/UK consumers), that right
> is honored.
>
> **Option B (goodwill):** If you're unhappy with Super, email
> support@tuktalkthai.com within 14 days of a charge and we'll refund it,
> no questions asked. After 14 days, charges are non-refundable but you
> keep access until your period ends.
>
> *(Note: Stripe fees are typically not returned to the merchant on
> refunds. Whichever option is chosen must also be reflected in how support
> actually handles refund emails.)*

### Proposed section: Governing law

> These terms are governed by the laws of `[GOVERNING JURISDICTION —
> country/state where the owner or entity is established]`, without regard
> to conflict-of-law rules. Nothing in these terms limits mandatory
> consumer protections that apply in your country of residence.

### Proposed addition to the existing "Availability" section

> A short limitation-of-liability line, e.g.: "To the maximum extent
> permitted by law, [LEGAL ENTITY NAME] is not liable for indirect or
> consequential damages arising from your use of the app; our total
> liability for any claim is limited to the amount you paid us in the 12
> months before the claim."

---

## Part 2 — The four pages carrying `OwnerReviewNotice` banners

All four render a visible gold "Owner review required" callout to end users in
production today (`OwnerReviewNotice`, `src/components/legal/legalCopy.jsx:20-26`):

| Page | Route | Banner include site |
|---|---|---|
| Privacy Policy | `/privacy` | `legalCopy.jsx:32-34` |
| Terms of Use | `/terms` | `legalCopy.jsx:107-109` |
| Support | `/support` | `legalCopy.jsx:167-169` |
| Delete Account | `/delete-account` | `legalCopy.jsx:285-287` |

Removing the banners = deleting the `<OwnerReviewNotice />` line from each of
the four content components (and optionally the component itself) **after**
the copy is approved. This is deliberately left for the post-approval pass.

---

## Part 3 — Owner launch checklist (legal + adjacent)

1. [ ] **Review & approve** the Privacy, Terms, Support, and Delete Account
       copy (including the new billing sections above, with placeholders
       filled: legal entity, jurisdiction, refund policy choice).
2. [ ] **Remove the four `OwnerReviewNotice` banners** (one-line deletions in
       `legalCopy.jsx`) once approved.
3. [ ] **Confirm the support mailbox works**: send + receive a test email at
       `support@tuktalkthai.com` (the Support page itself flags this).
4. [ ] **Supabase Auth redirect allowlist** (Dashboard → Authentication →
       URL Configuration): add
       `https://www.tuktalkthai.com/reset-password` (and
       `http://localhost:5173/reset-password` for local dev) so the new
       password-recovery flow works. Keep the existing site URL entries.
5. [ ] **OG image asset**: a proper 1200×630 social-preview image. The site
       currently falls back to the square 512px PWA icon (wired in
       `index.html`); replace the `og:image` / `twitter:image` URLs when the
       real asset ships.
6. [ ] Before Live Mode (separate, already-tracked items): production Stripe
       keys/prices, analytics cloud sink decision
       (`docs/analytics-wiring-findings.md`).
