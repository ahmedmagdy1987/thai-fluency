import React, { useEffect, useState } from 'react';
import SignUp from './SignUp.jsx';
import SignIn from './SignIn.jsx';
import ForgotPassword from './ForgotPassword.jsx';
import { SITE_CONFIG } from '../../config/site.js';

// Three-button entry: Create account, Sign in, or Try a quick demo.
// "Try a quick demo" is the only anonymous path — limited to 5 cards via
// the DemoMode component (rendered separately at the App level when the
// onTryDemo callback flips that mode on).
export default function AuthGate({ onTryDemo, onAuthSuccess, initialScreen = 'welcome', onScreenChange, onOpenPublicPage }) {
  const [screen, setScreen] = useState(initialScreen);
  const [prefilledEmail, setPrefilledEmail] = useState('');

  useEffect(() => {
    setScreen(initialScreen);
  }, [initialScreen]);

  const showScreen = (nextScreen) => {
    setScreen(nextScreen);
    onScreenChange && onScreenChange(nextScreen);
  };

  const goToSignUp = (email) => {
    if (typeof email === 'string' && email) setPrefilledEmail(email);
    showScreen('signup');
  };

  const openPublicPage = (path) => {
    if (onOpenPublicPage) {
      onOpenPublicPage(path);
      return;
    }
    window.location.assign(path);
  };

  if (screen === 'signup') {
    return <SignUp
      prefilledEmail={prefilledEmail}
      onBack={() => showScreen('welcome')}
      onSignIn={() => showScreen('signin')}
      onSuccess={onAuthSuccess}
    />;
  }
  if (screen === 'signin') {
    return <SignIn
      onBack={() => showScreen('welcome')}
      onSignUp={goToSignUp}
      onForgot={() => showScreen('forgot')}
      onSuccess={onAuthSuccess}
    />;
  }
  if (screen === 'forgot') {
    return <ForgotPassword onBack={() => showScreen('signin')} />;
  }

  // Welcome (default screen)
  return (
    <div className="onboard-root">
      <div className="onboard-card auth-welcome-card">
        <div className="auth-welcome-brand">
          <div className="auth-welcome-brand-wordmark">{SITE_CONFIG.siteName}</div>
          <div className="auth-welcome-brand-slogan">{SITE_CONFIG.slogan}</div>
        </div>
        <h1 className="auth-welcome-title">Ready for your first mission?</h1>
        <p className="auth-welcome-sub">
          Save your progress with a free account, or try a quick demo first. Every mission opens with a simple, friendly explanation.
        </p>

        <div className="auth-welcome-bullets">
          <div className="auth-welcome-bullet">
            <span className="auth-welcome-bullet-icon" aria-hidden="true">🌱</span>
            <div><strong>Start with guided missions.</strong> Practice greetings, food, taxis, prices, and asking for help.</div>
          </div>
          <div className="auth-welcome-bullet">
            <span className="auth-welcome-bullet-icon" aria-hidden="true">🔄</span>
            <div><strong>Sync across devices.</strong> Your progress follows you from laptop to phone.</div>
          </div>
          <div className="auth-welcome-bullet">
            <span className="auth-welcome-bullet-icon" aria-hidden="true">🎯</span>
            <div><strong>Speak from day one.</strong> Use real phrases for Thailand, not textbook drills.</div>
          </div>
        </div>

        <div className="auth-welcome-actions">
          <button className="btn-primary auth-cta" onClick={() => showScreen('signup')}>
            Create free account
          </button>
          <button className="btn-secondary auth-cta" onClick={() => showScreen('signin')}>
            I already have an account
          </button>
        </div>
        {/* "(5 cards)" miscounted the demo (3 flashcards + quick check +
            mini-lesson) — match the landing's accurate phrasing instead. */}
        <button className="auth-guest-link" onClick={onTryDemo}>
          Try a quick demo — no account needed
        </button>
        <button type="button" className="auth-guest-link auth-back-home-link" onClick={() => openPublicPage('/get-started')}>
          Back to home
        </button>
        <div className="auth-welcome-footer">
          By continuing you agree to our{' '}
          <button type="button" className="auth-footer-link" onClick={() => openPublicPage('/terms')}>Terms</button>
          {' '}and{' '}
          {/* nowrap keeps the sentence period glued to the link so it can never
              wrap onto its own line at narrow widths. */}
          <span style={{ whiteSpace: 'nowrap' }}>
            <button type="button" className="auth-footer-link" onClick={() => openPublicPage('/privacy')}>Privacy Policy</button>.
          </span>
          <span className="auth-footer-secondary-links">
            <button type="button" className="auth-footer-link" onClick={() => openPublicPage('/support')}>Support</button>
            <span aria-hidden="true">/</span>
            <button type="button" className="auth-footer-link" onClick={() => openPublicPage('/delete-account')}>Account deletion</button>
          </span>
        </div>
      </div>
    </div>
  );
}
