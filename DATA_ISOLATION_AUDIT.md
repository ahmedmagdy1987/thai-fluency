# Data Isolation Audit — Tuk Talk Thai

**Date:** 2026-05-13
**Scope:** Verify that user A's data never leaks to user B (or to anonymous visitors), across all reads and writes.
**Result:** ✅ **PASS** — every database access is properly scoped to the authenticated user, both by client-side filters and by server-side Row-Level Security (RLS) policies.

---

## 1. Every WRITE call site

| # | File:line | Operation | user_id filter | Auth requirement | RLS policy that gates it |
|---|---|---|---|---|---|
| W1 | `SignUp.jsx:43` | `supabase.auth.signUp(email, password)` | Creates own `auth.users` row | Public | Supabase Auth; triggers `handle_new_user` which inserts the matching `profiles` and `user_stats` rows |
| W2 | `SignUp.jsx:89`, `SignIn.jsx:18`, `PendingConfirmation.jsx:19` | `supabase.auth.resend({ type: 'signup', email })` | n/a (re-sends confirmation email for own pending signup) | Public | Supabase Auth |
| W3 | `SignIn.jsx:33` | `supabase.auth.signInWithPassword(email, password)` | Sets own session | Public | Supabase Auth |
| W4 | `App.jsx:131`, `ProfilePage` | `supabase.from('profiles').update({ display_name }).eq('id', session.user.id)` | `id = session.user.id` | Authenticated | `profiles update own`: `auth.uid() = id` |
| W5 | `App.jsx:524` | `supabase.from('profiles').update({ onboarding_completed, selected_voice }).eq('id', session.user.id)` | `id = session.user.id` | Authenticated | `profiles update own`: `auth.uid() = id` |
| W6 | `cloudStorage.js:uploadProgress` | `supabase.from('user_progress').upsert([{ user_id, card_id, ... }], { onConflict: 'user_id,card_id' })` | every row has `user_id: <session.user.id>` | Authenticated | `user_progress insert/update own`: `auth.uid() = user_id` |
| W7 | `cloudStorage.js:uploadStats` | `supabase.from('user_stats').upsert({ user_id, ... }, { onConflict: 'user_id' })` | row has `user_id: <session.user.id>` | Authenticated | `user_stats insert/update own`: `auth.uid() = user_id` |
| W8 | `cloudStorage.js:uploadAchievements` | `supabase.from('user_achievements').upsert([{ user_id, achievement_id }], { onConflict: 'user_id,achievement_id' })` | rows have `user_id: <session.user.id>` | Authenticated | `user_achievements insert/update own`: `auth.uid() = user_id` |
| W9 | `cloudStorage.js:updateProfile` | `supabase.from('profiles').update(fields).eq('id', userId)` | `id = userId` (always passed as `session.user.id`) | Authenticated | `profiles update own`: `auth.uid() = id` |
| W10 | `ForgotPassword.jsx:16` | `supabase.auth.resetPasswordForEmail(email)` | n/a (email-only operation) | Public | Supabase Auth |
| W11 | `App.jsx:180`, `SignUp.jsx:72`, `SignIn.jsx:69` | `supabase.auth.signOut()` | Clears own session | Authenticated | Supabase Auth |

**Defense pattern:** every table-write passes a `user_id` (or `id` for `profiles`) from the **current session**. Even if a malicious client tampered with the value to write someone else's user_id, the **INSERT/UPDATE RLS policy** rejects it because `with check (auth.uid() = user_id)` runs on the **new row's** value.

---

## 2. Every READ call site

| # | File:line | Operation | user_id filter | RLS policy that filters results |
|---|---|---|---|---|
| R1 | `App.jsx:86` | `supabase.auth.getSession()` | Returns own session only | Supabase Auth (client-side localStorage retrieval) |
| R2 | `App.jsx:90` | `supabase.auth.onAuthStateChange(...)` | Listener for own session events | Supabase Auth |
| R3 | `App.jsx` profile-load effect | `supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle()` | `id = session.user.id` | `profiles select own`: `auth.uid() = id` — RLS would return zero rows for a wrong ID even without the .eq() |
| R4 | `cloudStorage.js:downloadProgress` | `supabase.from('user_progress').select('*').eq('user_id', userId)` | `user_id = session.user.id` | `user_progress select own`: `auth.uid() = user_id` |
| R5 | `cloudStorage.js:downloadStats` | `supabase.from('user_stats').select('*').eq('user_id', userId).maybeSingle()` | `user_id = session.user.id` | `user_stats select own`: `auth.uid() = user_id` |
| R6 | `cloudStorage.js:downloadAchievements` | `supabase.from('user_achievements').select('achievement_id').eq('user_id', userId)` | `user_id = session.user.id` | `user_achievements select own`: `auth.uid() = user_id` |
| R7 | `SignIn.jsx:50` | `supabase.rpc('email_exists', { check_email })` | Returns boolean only — does NOT return any row contents | `SECURITY DEFINER` function with explicit `GRANT EXECUTE TO anon, authenticated`. Intentionally public for sign-in UX (flagged as MEDIUM-1 in audit). |

**Defense pattern:** every table-read uses `.eq('user_id', ...)` for clarity, but **even without the filter**, the SELECT RLS policy would only return rows where `auth.uid() = user_id`. Two layers — client-side filter and server-side enforcement.

---

## 3. RLS policy verification

Verified in `supabase/schema.sql` lines 28-171 — every table has 4 policies (SELECT/INSERT/UPDATE/DELETE), all gated by ownership.

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profiles` | `auth.uid() = id` | `auth.uid() = id` (with check) | `auth.uid() = id` | `auth.uid() = id` |
| `user_stats` | `auth.uid() = user_id` | `auth.uid() = user_id` (with check) | `auth.uid() = user_id` | `auth.uid() = user_id` |
| `user_progress` | `auth.uid() = user_id` | `auth.uid() = user_id` (with check) | `auth.uid() = user_id` | `auth.uid() = user_id` |
| `user_missions` | `auth.uid() = user_id` | `auth.uid() = user_id` (with check) | `auth.uid() = user_id` | `auth.uid() = user_id` |
| `user_achievements` | `auth.uid() = user_id` | `auth.uid() = user_id` (with check) | `auth.uid() = user_id` | `auth.uid() = user_id` |

**Postgres RLS semantics note:** UPDATE policies use `using` only. Per Postgres docs, when `with check` is omitted on UPDATE, the `using` clause is used for both pre- and post-update checks. This means a user cannot change their own row's `user_id` field to another user's ID — the new value would have to satisfy `auth.uid() = user_id`, which it can't (auth.uid() doesn't change mid-update).

**Trigger:** `handle_new_user` (in schema.sql) auto-creates the `profiles` and `user_stats` rows on `auth.users` INSERT. It uses `SECURITY DEFINER` so it bypasses RLS, but only fires on auth-system inserts (which clients can't trigger arbitrarily — they go through Supabase Auth's signup endpoint).

---

## 4. Threat model

| Attack | Could it work? | Why not |
|---|---|---|
| User A reads User B's progress via direct SDK call | ❌ | RLS SELECT policy returns zero rows |
| User A writes a fabricated progress row with User B's user_id | ❌ | RLS INSERT `with check` rejects it |
| User A updates their row to change `user_id` to User B's ID | ❌ | UPDATE policy's effective `with check` (from `using`) rejects |
| Logged-out user queries `user_progress` | ❌ | `auth.uid()` is null → no policy matches → zero rows |
| User A intercepts User B's JWT and uses it | Possible only if XSS | We have CSP + no XSS vectors. JWT is in localStorage (XSS-stealable, flagged MEDIUM-6) |
| User A signs up with User B's email | ❌ | Supabase Auth rejects duplicate email |
| User A enumerates registered emails | ⚠️ Partial | `email_exists` RPC returns booleans only. Intentional UX trade-off, rate-limited by Supabase (MEDIUM-1) |
| User A in DemoMode accesses real data | ❌ | DemoMode renders static cards; no cloud calls fire |

---

## 5. Manual test — two-user isolation

To verify hands-on:

### Setup

1. Open https://thai-fluency.vercel.app in **regular Chrome**.
2. Open https://thai-fluency.vercel.app in **incognito window**.

### Test

1. **In regular Chrome**: sign up as User A (`testA+date@example.com`, password `TestPass1234`).
2. Wait for email confirmation, click link, land back on app.
3. Skip placement test (pick "I don't speak any Thai" → Stage 1).
4. Review 3-4 cards in the Cards tab. Note your XP.
5. **In incognito**: sign up as User B (`testB+date@example.com`, password `TestPass1234`).
6. Confirm email, land on app, go through placement.
7. Review a few cards. Note your XP.

### Verify

| What to check | Expected |
|---|---|
| User A and B see different XP in the header | ✓ different values |
| User A and B see different streaks | ✓ both 1 (their own first day) |
| Sign out User B → sign back in as User A | A's progress restored from cloud |
| Sign out User A → sign in as User B | B's progress restored, NOT A's |
| Open Supabase Dashboard → user_progress | Rows for A and B exist with different `user_id`s; no cross-user rows |
| Open Supabase Dashboard → user_stats | One row per user_id, no overlap |
| Browser DevTools → Network → look at any `/rest/v1/user_progress` request | Response only contains current user's rows |

### Direct RLS probe (advanced)

If you want to verify RLS at the API level:

1. Sign in as User A.
2. In DevTools console, copy `supabase.auth.getSession().then(s => console.log(s.data.session.access_token))`.
3. Try to fetch User B's data directly using A's token:
   ```js
   fetch('https://fkebzcywofzloaqeghtn.supabase.co/rest/v1/user_progress?user_id=eq.<USER_B_ID>', {
     headers: {
       'Authorization': 'Bearer <USER_A_TOKEN>',
       'apikey': '<publishable key>'
     }
   }).then(r => r.json()).then(console.log)
   ```
4. **Expected:** empty array `[]`. The API doesn't error, but RLS filters out the rows so nothing returns.

If you see anything other than `[]`, that's a critical bug.

---

## 6. Known gaps (for reference)

| Gap | Severity | Status |
|---|---|---|
| Anti-cheat: a user can edit localStorage to fabricate their own progress, then sync to cloud | HIGH-2 (audit) | Acknowledged v2 work — does not affect cross-user isolation |
| Session JWT in localStorage is XSS-stealable | MEDIUM-6 (audit) | No XSS vectors currently; CSP in place; HttpOnly cookies are v2 work |
| `email_exists` RPC allows email enumeration | MEDIUM-1 (audit) | Intentional UX; rate-limited by Supabase platform |

These are documented in `SECURITY_AUDIT_REPORT.md` and don't affect inter-user isolation, which is the focus of this document.

---

## End of audit

**Conclusion:** every database read and write is properly scoped to the authenticated user. Cross-user data access is prevented at two layers: client-side filters and server-side RLS policies. The manual test above should confirm this end-to-end before launch.
