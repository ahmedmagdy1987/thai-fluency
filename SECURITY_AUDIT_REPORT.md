# Security Audit Report — Tuk Talk Thai

**Date:** 2026-05-11
**Auditor:** Claude (read-only audit; no code modifications)
**Commit audited:** `3774dea` (HEAD of master)
**Scope:** Full codebase, Supabase schema, build output, git history, npm dependencies

---

## 1. Executive Summary

**Overall posture: MODERATE.** Foundation is solid (RLS correctly configured, no XSS vectors, no secrets leaked), but the app has the security profile of a v1 product: no anti-cheat, no security headers, no GDPR mechanisms, and one real auth-bypass edge case that needs fixing before public launch.

| Severity | Count | Notes |
|---|---:|---|
| 🔴 **CRITICAL** | 0 | — |
| 🟠 **HIGH** | 2 | Auth bypass when env vars missing; client-side progress tampering (acknowledged) |
| 🟡 **MEDIUM** | 8 | Missing security headers, email enumeration, no account deletion/export, weak password policy, session JWT in localStorage, no email confirmation, no Privacy/Terms pages, redirect URL allowlist |
| 🟢 **LOW** | 5 | npm dev-dep audit, console.warn leaks, stale profiles.email, no app-layer rate limit, raw error in migration UI |

**Recommendation: ship with the 2 HIGH issues fixed (estimated 1 hour total) and 3-4 of the MEDIUM issues addressed (CSP + GDPR pages + email confirmation). The rest can ship as v1.1.**

---

## 2. Detailed Findings

### 🟠 HIGH-1 — Auth bypass when `hasSupabaseConfig` is false

**Category:** Authentication & Authorization, §1
**File:** `src/App.jsx` lines 251, 263

The auth gate and demo gate are both conditional on `hasSupabaseConfig`:

```js
const showAuthGate = hasSupabaseConfig && authReady && !session && (forceAuthGate || !demoMode);
const showDemo    = hasSupabaseConfig && authReady && !session && demoMode && !forceAuthGate;
```

If `VITE_SUPABASE_URL` or `VITE_SUPABASE_KEY` is missing at build time, `hasSupabaseConfig` is `false`, both flags are `false`, and the **main app renders without any authentication**. The user gets unrestricted access to all 4,791 cards and all features.

**Production impact:** Currently mitigated — Vercel env vars are set. But:
- Any **Vercel preview deployment** without env vars exposes the app.
- Any **self-hosted clone** without Supabase setup runs without auth.
- A **build failure that drops env vars** would silently degrade to no-auth mode instead of failing loudly.

**Reproduce:**
1. Remove `.env.local` (or set the keys to empty strings).
2. Run `npm run build` and `npm run preview`.
3. Open the app — no AuthGate appears; you're straight into the main learning UI.

**Recommended fix:** When `hasSupabaseConfig` is false, render a hard-fail screen ("Configuration error — Supabase env vars not set") instead of the main app. Alternatively, render the AuthGate anyway and disable the auth buttons. Keep the dev experience friendly but never let no-config = no-auth.

**Estimated fix time:** 15 minutes.

---

### 🟠 HIGH-2 — Client can fabricate progress; cloud accepts whatever is uploaded

**Category:** Anti-Cheat / Anti-Tampering, §5
**Files:** `src/lib/cloudStorage.js`, `src/App.jsx`

The cloud sync trusts whatever the client uploads. There is no server-side validation that:

- A claimed `total_xp` matches actual reviews.
- A claimed `current_streak` reflects real daily activity.
- A claimed `interval ≥ 21` (mature) was earned by spaced repetition.
- An `achievement_id` in `user_achievements` was actually unlocked.
- A claimed `tones_quiz_best` came from a real quiz session.

**Reproduce:**
1. Sign in.
2. Open dev tools → Application → Local Storage → `thai-fluency-state-v1`.
3. Edit `stats.totalXp` to `99999`, `progress` to add fake mastery rows.
4. Wait ~2.5s (debounced sync).
5. Cloud rows now contain the fabricated values. They persist across devices.

**User has acknowledged this is a v2 problem** ("Full anti-cheat with server-side SRS validation is a v2 problem. For v1, the server-of-truth pattern is enough."). Including for completeness.

**Recommended fix (post-v1):** Move SRS computation server-side via a Postgres function (`record_review(card_id, rating)`) called over RPC. The function computes the new SM-2 state from the previous state — client can't fabricate it. Same pattern for XP grants and streak increments. Estimated effort: 1-2 days.

**For v1:** No fix. The threat model is "casual cheating to inflate leaderboards we don't have yet." Live with it.

---

### 🟡 MEDIUM-1 — Email enumeration via `email_exists` RPC

**Category:** Authentication & Authorization, §1
**File:** `supabase/schema.sql` lines 235-246; `src/components/auth/SignIn.jsx` lines 25-37

The `email_exists(check_email text)` RPC is granted to `anon`, intentionally — it powers the smart sign-in error UX ("No account found" vs "Wrong password"). Anyone, including bots without an account, can probe whether an email is registered:

```js
await supabase.rpc('email_exists', { check_email: 'someone@example.com' })
// → true / false
```

**Threat:** Lets attackers build a list of registered users for phishing/credential stuffing/spam targeting.

**Mitigation in place:** Supabase has built-in rate limits on RPCs (varies by plan). Tier hopping or distributed probes can still slowly enumerate.

**User-acknowledged trade-off** (the UX win was deemed worth it). Include here for awareness.

**Recommended fix (optional, post-launch):** Add server-side rate limit per IP for the RPC (Supabase Edge Functions or a Postgres `count(*)`-since-window check). Or remove the smart-error UX and accept the generic "Invalid login credentials" message. Estimated effort: 1 hour for rate-limit; 5 min to revert UX.

---

### 🟡 MEDIUM-2 — No Content Security Policy or security headers

**Category:** API & Network Security, §6
**Files:** `index.html`, `vercel.json` (does not exist)

The deployed app sends no security-relevant response headers beyond what Vercel adds by default. Specifically missing:

- **CSP** (`Content-Security-Policy`) — defense against XSS, prevents inline `<script>` execution from injected payloads.
- **`X-Content-Type-Options: nosniff`** — prevents MIME-type confusion.
- **`X-Frame-Options: DENY`** or CSP `frame-ancestors 'none'` — prevents clickjacking.
- **`Referrer-Policy: strict-origin-when-cross-origin`** — limits referrer leakage.
- **`Permissions-Policy`** — limits browser feature access (e.g., disable camera/microphone unless needed).

The Google Fonts `<link>` in `index.html` also has no SRI hash. If Google Fonts CDN is compromised, the app loads malicious CSS.

**Why it matters:** Even though no XSS vulnerabilities are currently present, CSP is defense-in-depth. A future code change that introduces XSS would be contained by CSP. For an app that handles sign-in credentials and stores session JWTs in localStorage, this is meaningful protection.

**Recommended fix:** Add a `vercel.json` with security headers:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options",   "value": "nosniff" },
        { "key": "X-Frame-Options",          "value": "DENY" },
        { "key": "Referrer-Policy",          "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy",       "value": "camera=(), microphone=(), geolocation=()" },
        { "key": "Content-Security-Policy",  "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co;" }
      ]
    }
  ]
}
```

Verify CSP works without breaking Supabase realtime (wss://), Google Fonts, and the PWA service worker.

**Estimated fix time:** 30 minutes (write + test in preview deploy).

---

### 🟡 MEDIUM-3 — No account deletion (GDPR right to erasure)

**Category:** Privacy & GDPR Considerations, §9; Authentication & Authorization, §1
**Files:** none — feature is absent

EU/UK/CA users have a right to delete their account and all associated data. The schema has `on delete cascade` from `auth.users` to all derived tables, so the data plumbing works — but there's no user-facing way to trigger a delete.

**Recommended fix:** Add "Delete my account" in Settings → Account section. Requires confirmation (type email to confirm). Calls a server function:

```sql
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;
grant execute on function public.delete_my_account() to authenticated;
```

The cascade chain handles the rest. Then sign the user out client-side.

**Estimated fix time:** 1 hour (UI + RPC + testing).

---

### 🟡 MEDIUM-4 — No data export (GDPR portability)

**Category:** Privacy & GDPR Considerations, §9

EU/UK users have a right to obtain their data in machine-readable form. Currently no export mechanism.

**Recommended fix:** Add "Export my data" in Settings. Client calls `downloadFullState(userId)`, formats as JSON, triggers a download. ~30 min to wire up; the cloud helpers already exist.

**Estimated fix time:** 30 minutes.

---

### 🟡 MEDIUM-5 — Password policy too weak (8 char minimum, no complexity)

**Category:** Data Validation, §4; Authentication & Authorization, §1
**File:** `src/components/auth/SignUp.jsx` lines 15-18, 89

Client requires 8+ chars; Supabase's default is 6. No upper bound, no complexity rules. Per NIST SP 800-63B, length-only is acceptable IF combined with a breached-password check and 8+ chars. Without breach-check, 8 chars allows weak passwords like `password` or `12345678`.

**Recommended fix (in order of impact):**

1. **Enable Supabase's HaveIBeenPwned check** in Auth → Settings → Password Strength. Free. This catches the worst offenders.
2. **Raise minimum to 10 characters** client-side and server-side.
3. **Display strength meter** in SignUp UI as the user types (helpful, not blocking).

**Estimated fix time:** 30 minutes for #1 + #2; 1 hour for #3.

---

### 🟡 MEDIUM-6 — Session JWT stored in localStorage (XSS-stealable)

**Category:** Authentication & Authorization, §1
**File:** `src/lib/supabase.js` lines 30-35

Supabase JS stores the session JWT under `localStorage['tuk-talk-thai-auth']`. Standard SPA pattern. Risk: any XSS payload that runs in the same origin can exfiltrate the JWT.

**Mitigated by:** No XSS vectors currently in the codebase (verified — no `dangerouslySetInnerHTML`, `eval`, `innerHTML`, user-rendered HTML).

**Future-proofing recommendation:** Add the CSP from MEDIUM-2 to limit damage if XSS is ever introduced.

**A proper fix** (HttpOnly cookies) would require deploying a server (Next.js API routes or Vercel functions) as a session-bridge between the browser and Supabase. Big architectural change — not v1 work.

**Estimated fix time:** N/A for v1; ~2 days for full HttpOnly cookie migration.

---

### 🟡 MEDIUM-7 — Email confirmation disabled (anyone can sign up with any email)

**Category:** Authentication & Authorization, §1
**Per user request, currently:** OFF in Supabase Auth settings.

A user can sign up with `someone-elses@example.com`, get an account, and (if the real owner later signs up) hijack their email. The `email_exists` RPC then says "exists" and the real owner can't claim it. They have to reset password — and since they own the inbox, password reset works, locking out the squatter.

So this isn't catastrophic, but it does enable:
- Spam account creation (no friction)
- Email squatting (minor griefing)
- Skewed signup metrics (bot accounts inflate counts)

**Recommended fix (pre-launch):** Re-enable email confirmation in Supabase Auth → Providers → Email → Confirm email. This adds a one-time "click the link in your email" step. UX cost is small; signup quality is much better.

**Estimated fix time:** 5 minutes (one toggle, no code change). Plus 15-30 min UI work to display "check your email" message and handle the deferred-session state.

---

### 🟡 MEDIUM-8 — No Privacy Policy / Terms of Service

**Category:** Privacy & GDPR Considerations, §9

Required for any app that collects emails per CCPA, ePrivacy (EU cookies), and most app store policies. Currently absent.

**Recommended fix:** Add `/privacy` and `/terms` pages (or modals). Boilerplate from a generator (e.g., termly.io, iubenda) is fine to start. Link from Settings and the AuthGate welcome screen footer.

**Estimated fix time:** 2 hours (drafting + UI).

---

### 🟢 LOW-1 — npm audit: 3 moderate vulnerabilities in dev dependencies

**Category:** Third-Party Dependencies, §7

```
esbuild <=0.24.2 — dev-server CSRF (GHSA-67mh-4wv8-2f99)
└─ vite (depends on vulnerable esbuild)
   └─ vite-plugin-pwa (depends on vulnerable vite)
```

**Production impact:** None — esbuild only runs during `npm run dev`. The production bundle does not include esbuild. The vulnerability only affects a developer running `npm run dev` who visits a malicious website that probes their dev server.

**Recommended fix:** When ready to take a Vite major-version bump, run `npm audit fix --force` (Vite 8 is the destination — breaking changes possible). Not urgent for production.

**Estimated fix time:** 30-60 minutes including regression testing.

---

### 🟢 LOW-2 — `console.warn` calls expose error details to dev tools

**Category:** Client-Side Security, §3
**Files:** `src/App.jsx:188`, `src/App.jsx:209`, `src/lib/supabase.js:18`

```js
console.warn('[App] cloud init failed', e);
console.warn('[App] cloud sync failed', e);
```

These pass the raw error object to console. An attacker with access to the user's browser tools (or a logged-screenshot of console) sees the error details. Low risk because the error context is operational, not credentials.

**Recommended fix:** In production builds, strip or anonymize the error message. Vite has a `define` for `process.env.NODE_ENV` — wrap warns in `if (import.meta.env.DEV)`. Or use a structured logger that ships errors to Sentry.

**Estimated fix time:** 10 minutes.

---

### 🟢 LOW-3 — `profiles.email` not synced with `auth.users.email`

**Category:** Data Validation, §4
**File:** `supabase/schema.sql` lines 178-200

The `handle_new_user` trigger copies `auth.users.email` into `profiles.email` once at signup. If a user later changes their email via `supabase.auth.updateUser({ email: 'new@example.com' })`, the `profiles.email` row stays stale. This affects the `email_exists` RPC (it'd say "no account" for the new email when one exists).

**Recommended fix:** Either drop `profiles.email` entirely and look up via `auth.users` (requires SECURITY DEFINER function since RLS hides auth.users from clients), OR add a trigger on `auth.users` UPDATE that mirrors changes to `profiles.email`.

**Estimated fix time:** 20 minutes.

---

### 🟢 LOW-4 — No app-layer rate limiting

**Category:** API & Network Security, §6

Relies entirely on Supabase's built-in rate limits (default: 30 req/min/IP for auth endpoints on free tier, higher for paid). For non-auth endpoints (table queries via RLS), no per-IP throttle at the app layer.

**Threat:** A single malicious client could spam cloud sync uploads, racking up Supabase usage and potentially DOSing other users' sync (if database is saturated).

**Recommended fix:** Supabase has a `pg_rate_limit` extension you can enable for finer control. For free-tier, mostly rely on existing throttling. Worth revisiting if abuse is observed.

**Estimated fix time:** N/A for v1.

---

### 🟢 LOW-5 — Migration prompt shows raw error message

**Category:** Client-Side Security, §3
**File:** `src/components/auth/MigrationPrompt.jsx` line 20

```js
setError('Upload failed: ' + (e?.message || 'unknown error') + '. Try again, or skip to start fresh.');
```

If `e.message` contains Supabase-internal error detail (e.g., "duplicate key violates unique constraint user_progress_user_id_card_id_key"), the user sees raw DB jargon. Not a security issue per se — but leaks schema details (table/column names).

**Recommended fix:** Show a generic "Upload failed. Try again or skip." message; log the raw error to console for debugging.

**Estimated fix time:** 5 minutes.

---

## 3. Positives — What's Done Right

### Strong foundations

✅ **RLS is correctly configured on all 5 tables.** Every table has `enable row level security` + 4 policies (SELECT/INSERT/UPDATE/DELETE), all checking `auth.uid() = user_id` (or `= id` for profiles). Verified in `supabase/schema.sql` lines 28-171. Cross-user data access is **not possible** — verified mentally via threat modeling each policy.

✅ **No XSS vectors found.** Searched the entire `src/` tree for `dangerouslySetInnerHTML`, `innerHTML`, `eval(`, `Function(`, `document.write` — zero matches. All user-controlled strings (`display_name`, `email`) flow through React's default escaping.

✅ **No secrets in code or git history.** `service_role`, database password, etc. — zero matches across the repo. `.env.local` properly gitignored; git history confirmed no env files ever committed. Only the publishable key (intentionally public) appears in the production bundle.

✅ **Server-of-truth pattern on sign-out.** `handleSignOut` in App.jsx wipes localStorage entirely. Demo flags also cleared. Next session loads clean from cloud or starts fresh.

✅ **Strong DB constraints.** Unique constraints on `(user_id, card_id)`, `(user_id, stage, mission)`, `(user_id, achievement_id)` prevent duplicate rows. `on delete cascade` from `auth.users` ensures account deletion propagates cleanly (when implemented).

✅ **Demo state is clamped.** `DemoMode.jsx` does `Math.max(0, Math.min(stored, cards.length))` on the localStorage idx — no out-of-bound exploit.

✅ **Custom Supabase storage key** prevents collision with other Supabase apps on the same origin.

✅ **email_exists is SECURITY DEFINER with explicit grants** — only the boolean is exposed, not row contents. Scoped correctly.

✅ **Sign-up triggers auto-create profile + user_stats** via a `SECURITY DEFINER` function that bypasses RLS in a controlled way (only fires on auth.users INSERT). Client cannot abuse it.

✅ **Migration prompt requires double-confirm to skip.** The "Yes, discard" button only appears after the user clicks "Skip — I want to start fresh." Prevents accidental data loss.

✅ **HTTPS enforced** by Vercel and Supabase platforms (HSTS via Vercel defaults).

### Smart trade-offs

✅ **Publishable key is intentionally public** — Supabase's design pattern. Security comes from RLS, not key secrecy.

✅ **Self-documenting comments** in `cloudStorage.js`, `state.js`, `App.jsx` explain why patterns were chosen (e.g., "the SECURITY DEFINER bypasses RLS for this one boolean lookup").

✅ **Defensive `try/catch` around `localStorage.getItem`** in case of private browsing mode or quota exceeded — silent fail so the app doesn't crash.

---

## 4. Recommended Actions

### 🔴 Immediate (before you push anything else)

| # | Action | Effort |
|---|---|---|
| HIGH-1 | Fix auth bypass when env vars missing — render error screen, not main app | 15 min |

### 🟠 Pre-launch (within 24 hours, before public announcement)

| # | Action | Effort |
|---|---|---|
| MEDIUM-2 | Add `vercel.json` with security headers (CSP, X-Frame-Options, etc.) | 30 min |
| MEDIUM-7 | Re-enable email confirmation in Supabase Auth settings | 5 min toggle + 30 min UI |
| MEDIUM-8 | Add Privacy Policy + Terms of Service pages (boilerplate generator OK to start) | 2 hours |
| MEDIUM-5 | Enable Supabase HaveIBeenPwned check; raise min password to 10 chars | 30 min |

### 🟡 Post-launch v1.1 (within 2 weeks)

| # | Action | Effort |
|---|---|---|
| MEDIUM-3 | Account deletion (GDPR right to erasure) — UI + RPC | 1 hour |
| MEDIUM-4 | Data export (GDPR portability) — Settings button | 30 min |
| LOW-2 | Strip console.warn in production builds | 10 min |
| LOW-3 | Trigger to mirror `auth.users.email` → `profiles.email` on update | 20 min |
| LOW-5 | Generic error message in MigrationPrompt | 5 min |

### 🟢 v2 / Long-term

| # | Action | Effort |
|---|---|---|
| HIGH-2 | Server-side SRS computation (anti-cheat) — Postgres function for `record_review` | 1-2 days |
| MEDIUM-6 | HttpOnly cookie session pattern (requires server) | 2 days |
| MEDIUM-1 | Rate-limit `email_exists` RPC or remove smart-error UX | 1 hour |
| LOW-1 | Run `npm audit fix --force` when ready for Vite 8 migration | 30-60 min |
| LOW-4 | Per-IP rate limiting at app layer (or `pg_rate_limit`) | TBD |

---

## 5. Supabase Configuration to Verify Manually

The audit could not directly query Supabase's project settings. Please verify these in the dashboard before launch:

- [ ] **Auth → Providers → Email → Confirm email**: re-enable for production (currently disabled per spec)
- [ ] **Auth → URL Configuration → Site URL**: set to `https://thai-fluency.vercel.app`
- [ ] **Auth → URL Configuration → Redirect URLs**: includes ONLY production URL + localhost; does NOT include wildcards or preview URLs
- [ ] **Auth → Settings → Password strength**: enable "Check for known leaked passwords" (HaveIBeenPwned)
- [ ] **Auth → Rate limits**: confirm defaults are acceptable (30 req/min/IP)
- [ ] **Project Settings → API → Service role key**: confirm it's NOT in any committed file (we already verified, but worth a final glance in the dashboard)
- [ ] **Database → Policies**: visually confirm all 5 tables show "RLS enabled" + 4 policies each
- [ ] **Storage**: confirm no public buckets exist (we don't use Storage, so any bucket present is suspicious)

---

## 6. Threat Model Summary

| Threat | Outcome | Mitigation Status |
|---|---|---|
| User A queries User B's progress directly via JS SDK | **Blocked** by RLS `auth.uid() = user_id` | ✅ Protected |
| Logged-out user queries `user_progress` | **Blocked** — `auth.uid()` is null, no policy matches | ✅ Protected |
| User inserts row with another user's user_id | **Blocked** by RLS `with check (auth.uid() = user_id)` | ✅ Protected |
| User changes their row's user_id to another user's | **Blocked** — UPDATE policy's implicit WITH CHECK requires user_id match | ✅ Protected |
| XSS via display_name input | **Blocked** by React escaping | ✅ Protected (no XSS vectors anywhere) |
| Session JWT theft via XSS | Possible if XSS introduced; currently no XSS vector | 🟡 Defense-in-depth missing (no CSP) |
| Email enumeration via `email_exists` | Possible by design; UX trade-off | 🟡 Acknowledged |
| Anonymous user accesses full app | Blocked by AuthGate + DemoMode in production. **Bypass via missing env vars** | 🟠 HIGH-1 |
| User fabricates XP/streak/mastery via localStorage | **Possible** — no server-side SRS validation | 🟠 HIGH-2 (v2 problem) |
| User signs up with someone else's email | **Possible** — confirmation disabled | 🟡 MEDIUM-7 |
| Clickjacking | **Possible** — no X-Frame-Options/CSP frame-ancestors | 🟡 MEDIUM-2 |
| CSRF on Supabase endpoints | **Blocked** — JWT in Authorization header, not cookies | ✅ Protected |
| Open redirect | **Blocked** if Supabase Redirect URL allowlist is configured | 🟡 Verify manually |
| Mass account deletion request | No mechanism exists | 🟡 MEDIUM-3 (no GDPR UI) |
| npm supply-chain compromise | Currently 3 moderate (dev-only) advisories | 🟢 LOW-1 |

---

## 7. Audit Methodology

1. **Static code analysis**: read every file in `src/`, `supabase/`, plus `index.html`, `vite.config.js`, `package.json`.
2. **Dependency check**: `npm audit` → reviewed all advisories.
3. **Secret leakage check**: grep for `service_role`, hardcoded passwords, etc. across all committed files + git history.
4. **Build output inspection**: confirmed publishable key + project URL are in `dist/` (expected, by design).
5. **RLS policy review**: walked through each SELECT/INSERT/UPDATE/DELETE policy in `supabase/schema.sql`.
6. **Data flow analysis**: traced user input from forms → localStorage → cloud → render.
7. **Threat modeling**: mapped each `§1-§10` audit category from the scope to concrete attacks and mitigations.

**Not in scope (would require live testing access):** runtime RLS verification with real cross-user queries, Supabase dashboard settings verification (see §5 manual checklist), Vercel deployment configuration review, actual rate-limit testing.

---

## End of Report

Reviewing this with the owner before any fixes. No code has been modified, nothing has been pushed.
