# Mobile Auth & Deep-Link Notes

_For the mobile foundation (Capacitor). Last updated: May 30, 2026._
_No Supabase settings were changed by this task — this documents what WILL be
needed before mobile auth works end-to-end._

## How auth redirects work today (web)

Sign-up / sign-in / password-reset all build their redirect from the current
origin:

| File | Call | Redirect |
| --- | --- | --- |
| `src/components/auth/SignUp.jsx` | `signUp(... emailRedirectTo)` | `window.location.origin + '/'` |
| `src/components/auth/SignIn.jsx` | resend confirm `emailRedirectTo` | `window.location.origin + '/'` |
| `src/components/auth/PendingConfirmation.jsx` | resend `emailRedirectTo` | `window.location.origin + '/'` |
| `src/components/auth/ForgotPassword.jsx` | `resetPasswordForEmail(redirectTo)` | `window.location.origin + '/'` |

On the **web** this resolves to `https://www.tuktalkthai.com/`, which is already
configured in Supabase → works.

## The mobile problem

The Capacitor config bundles the built app (`webDir: dist`), so inside the native
WebView `window.location.origin` is **not** the production domain — it is:

- **Android:** `https://localhost` (Capacitor 8's default `androidScheme` is `https`)
- **iOS:** `capacitor://localhost`

So an email confirmation / magic / reset link generated from the app would point
at `http://localhost/` or `capacitor://localhost/`, which an email client cannot
open back into the installed app. This is the standard mobile-auth gap and must be
closed before mobile sign-in works.

## What needs to be done (before mobile auth works)

### Option A — Deep links into the bundled app (recommended for a real native app)
1. **Pick a deep-link strategy:**
   - **Custom scheme:** `com.tuktalkthai.app://auth-callback` (simplest), or
   - **Universal/App Links:** `https://www.tuktalkthai.com/...` mapped to the app
     (best UX, needs `apple-app-site-association` + Android `assetlinks.json` hosted
     on the domain).
2. **Supabase → Authentication → URL Configuration → Redirect URLs:** add the
   deep-link callback URL(s), e.g. `com.tuktalkthai.app://auth-callback` and/or the
   Universal Link path. (Owner action — not changed here.)
3. **App code (later task, not done now):** when running natively, pass that
   deep-link URL as `emailRedirectTo`/`redirectTo` instead of
   `window.location.origin`. Detect native via `Capacitor.isNativePlatform()`.
4. **Capture the callback:** use the already-installed `@capacitor/app` plugin's
   `appUrlOpen` listener to receive the redirect URL, extract the Supabase tokens
   from the hash/query, and call `supabase.auth.setSession(...)` / exchange the code.
5. **Android intent filter / iOS associated domains:** register the scheme/links in
   `android/app/src/main/AndroidManifest.xml` and the iOS project.

### Option B — Hosted shell (fastest, less "native")
Set `server.url: 'https://www.tuktalkthai.com'` in `capacitor.config.json`. The
WebView then loads the live site, so `window.location.origin` is the production
domain and **existing redirect URLs work unchanged**. Trade-offs: requires network
(no offline), and Apple may scrutinise a thin "website wrapper." Good for an
internal/closed beta; revisit before public App Store review.

## Email confirmation behavior
- Email confirmation is **on** (sign-up shows `PendingConfirmation`). On mobile this
  needs the deep-link callback (Option A) or the hosted shell (Option B) to land the
  user back signed-in. Until then, a mobile user can sign up but the confirmation
  link will open the website in the system browser, not the app.

## Magic link behavior
- The app primarily uses email + password (+ confirmation). If passwordless / magic
  links are enabled later, they have the **same** redirect requirement as above —
  whitelist the deep-link URL and capture it via `appUrlOpen`.

## Production domain redirects
- Apex (`tuktalkthai.com`) → `www` and the old Vercel domain → `www` redirects are
  already in place (see `final-web-beta-launch-status.md`). Keep auth redirect URLs
  pinned to `https://www.tuktalkthai.com` (the canonical origin) plus the chosen
  deep-link URL.

## Summary checklist (owner / later task)
- [ ] Decide deep-link strategy (custom scheme vs Universal/App Links).
- [ ] Add deep-link redirect URL(s) in Supabase URL Configuration.
- [ ] Add native `emailRedirectTo`/`redirectTo` (gated on `isNativePlatform`).
- [ ] Wire `@capacitor/app` `appUrlOpen` → `supabase.auth.setSession`.
- [ ] Register scheme/associated-domains in the Android & iOS projects.
- [ ] Re-test sign-up confirm + password reset on a real device build.
