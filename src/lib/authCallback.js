// Auth-callback URL helpers for Supabase email links (confirmation + password
// recovery). When a link is expired or invalid, Supabase redirects back with
// error params in the URL fragment (and sometimes the query string), e.g.
//   #error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired
//
// supabase-js (detectSessionInUrl) may process and strip the URL during its own
// async init, so the params are captured HERE, synchronously at module-import
// time — before any Supabase URL handling can run — and exposed via
// getCapturedAuthError(). The same import-time snapshot records whether the URL
// carried password-recovery evidence (type=recovery tokens or a recovery code),
// which gates the /reset-password screen so a plain signed-in visit to that URL
// never exposes a set-new-password form without a real recovery link.

function readParams() {
  if (typeof window === 'undefined') return { hash: new URLSearchParams(), query: new URLSearchParams() };
  try {
    return {
      hash: new URLSearchParams((window.location.hash || '').replace(/^#/, '')),
      query: new URLSearchParams(window.location.search || ''),
    };
  } catch {
    return { hash: new URLSearchParams(), query: new URLSearchParams() };
  }
}

function captureAuthError() {
  const { hash, query } = readParams();
  const pick = (key) => hash.get(key) || query.get(key) || '';
  const error = pick('error');
  const code = pick('error_code');
  const description = pick('error_description');
  if (!error && !code && !description) return null;
  return { error, code, description };
}

function captureRecoveryEvidence() {
  const { hash, query } = readParams();
  // Implicit-grant recovery lands with #access_token=…&type=recovery; the PKCE
  // flow lands with ?code=… on the /reset-password redirect. (Failed links
  // carry only error params and take the invalid-link path instead — they are
  // deliberately NOT treated as evidence for the set-new-password form.)
  return hash.get('type') === 'recovery'
    || (!!query.get('code') && typeof window !== 'undefined' && window.location.pathname.replace(/\/+$/, '') === '/reset-password');
}

const capturedError = captureAuthError();
const capturedRecoveryEvidence = captureRecoveryEvidence();

// The error params (if any) present on this page load, frozen at import time.
export function getCapturedAuthError() {
  return capturedError;
}

// True when THIS page load arrived via a real password-recovery link (success
// tokens). Failed links are covered by getCapturedAuthError() instead.
export function hadRecoveryTokens() {
  return capturedRecoveryEvidence;
}

// Human wording for the captured error. Supabase's raw error_description is
// serviceable but terse; map the common cases to friendlier copy.
export function friendlyAuthErrorMessage(err) {
  if (!err) return '';
  const code = (err.code || '').toLowerCase();
  const desc = (err.description || '').toLowerCase();
  if (code === 'otp_expired' || desc.includes('expired')) {
    return 'That email link has expired — links only work for a limited time.';
  }
  if (desc.includes('invalid')) {
    return 'That email link is invalid or has already been used.';
  }
  if (code || desc || err.error) {
    return 'We couldn’t verify that email link.';
  }
  return '';
}

// Remove the error params from the address bar (both hash and query) once they
// have been surfaced, so a refresh doesn't re-show a stale error. Leaves every
// other param untouched and never throws.
export function stripAuthErrorParams() {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    ['error', 'error_code', 'error_description'].forEach((key) => url.searchParams.delete(key));
    const hashParams = new URLSearchParams((url.hash || '').replace(/^#/, ''));
    ['error', 'error_code', 'error_description'].forEach((key) => hashParams.delete(key));
    const nextHash = hashParams.toString();
    url.hash = nextHash ? `#${nextHash}` : '';
    window.history.replaceState({ ...(window.history.state || {}) }, '', url.pathname + url.search + url.hash);
  } catch { /* cosmetic only — never throw */ }
}
