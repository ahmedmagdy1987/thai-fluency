import React, { useEffect, useState } from 'react';
import SignUp from './SignUp.jsx';
import SignIn from './SignIn.jsx';
import ForgotPassword from './ForgotPassword.jsx';
import PrivacyPolicy from '../legal/PrivacyPolicy.jsx';
import TermsOfService from '../legal/TermsOfService.jsx';

// Three-button entry: Create account, Sign in, or Try a quick demo.
// "Try a quick demo" is the only anonymous path — limited to 5 cards via
// the DemoMode component (rendered separately at the App level when the
// onTryDemo callback flips that mode on).
export default function AuthGate({ onTryDemo, onAuthSuccess, initialScreen = 'welcome', onScreenChange }) {
  const [screen, setScreen] = useState(initialScreen);
  const [prefilledEmail, setPrefilledEmail] = useState('');
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

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
          <div className="auth-welcome-brand-thai">ตุ๊ก ตุ๊ก</div>
          <div className="auth-welcome-brand-wordmark">Tuk Talk Thai</div>
        </div>
        <h1 className="auth-welcome-title">Real Thai for real life.</h1>
        <p className="auth-welcome-sub">
          Learn the 150 essentials and you'll handle Bangkok in 6 weeks. Speak first, polish later.
        </p>

        <div className="auth-welcome-bullets">
          <div className="auth-welcome-bullet">
            <span className="auth-welcome-bullet-icon">🌱</span>
            <div><strong>Start with 6 missions.</strong> Practice greetings, food, taxis, prices, and help.</div>
          </div>
          <div className="auth-welcome-bullet">
            <span className="auth-welcome-bullet-icon">🔄</span>
            <div><strong>Sync across devices.</strong> Your progress follows you from laptop to phone.</div>
          </div>
          <div className="auth-welcome-bullet">
            <span className="auth-welcome-bullet-icon">🎯</span>
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
        <button className="auth-guest-link" onClick={onTryDemo}>
          Try a quick demo (5 cards)
        </button>
        <div className="auth-welcome-footer">
          By continuing you agree to our{' '}
          <button type="button" className="auth-footer-link" onClick={() => setShowTerms(true)}>Terms</button>
          {' '}and{' '}
          <button type="button" className="auth-footer-link" onClick={() => setShowPrivacy(true)}>Privacy Policy</button>.
        </div>
      </div>
      {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}
      {showTerms && <TermsOfService onClose={() => setShowTerms(false)} />}
    </div>
  );
}
