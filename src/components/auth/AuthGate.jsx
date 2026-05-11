import React, { useState } from 'react';
import SignUp from './SignUp.jsx';
import SignIn from './SignIn.jsx';
import ForgotPassword from './ForgotPassword.jsx';

// Three-button entry: Create account, Sign in, or Try a quick demo.
// "Try a quick demo" is the only anonymous path — limited to 5 cards via
// the DemoMode component (rendered separately at the App level when the
// onTryDemo callback flips that mode on).
export default function AuthGate({ onTryDemo, onAuthSuccess, initialScreen = 'welcome' }) {
  const [screen, setScreen] = useState(initialScreen);
  const [prefilledEmail, setPrefilledEmail] = useState('');

  const goToSignUp = (email) => {
    if (typeof email === 'string' && email) setPrefilledEmail(email);
    setScreen('signup');
  };

  if (screen === 'signup') {
    return <SignUp
      prefilledEmail={prefilledEmail}
      onBack={() => setScreen('welcome')}
      onSignIn={() => setScreen('signin')}
      onSuccess={onAuthSuccess}
    />;
  }
  if (screen === 'signin') {
    return <SignIn
      onBack={() => setScreen('welcome')}
      onSignUp={goToSignUp}
      onForgot={() => setScreen('forgot')}
      onSuccess={onAuthSuccess}
    />;
  }
  if (screen === 'forgot') {
    return <ForgotPassword onBack={() => setScreen('signin')} />;
  }

  // Welcome (default screen)
  return (
    <div className="onboard-root">
      <div className="onboard-card auth-welcome-card">
        <div className="auth-welcome-brand">
          <div className="auth-welcome-brand-thai">ตุ๊กตุ๊ก</div>
          <div className="auth-welcome-brand-ph">dtúk dtúk</div>
        </div>
        <h1 className="auth-welcome-title">Real Thai for real life.</h1>
        <p className="auth-welcome-sub">
          Learn the 150 essentials and you'll handle Bangkok in 6 weeks. Speak first, polish later.
        </p>

        <div className="auth-welcome-bullets">
          <div className="auth-welcome-bullet">
            <span className="auth-welcome-bullet-icon">🌱</span>
            <div><strong>Start with 6 missions</strong> in Survival Thai — greetings, food, taxi, prices, help.</div>
          </div>
          <div className="auth-welcome-bullet">
            <span className="auth-welcome-bullet-icon">🔄</span>
            <div><strong>Sync across devices.</strong> Your progress follows you from laptop to phone.</div>
          </div>
          <div className="auth-welcome-bullet">
            <span className="auth-welcome-bullet-icon">🇹🇭</span>
            <div><strong>4,791 cards total</strong> — all the way to natural fluency, one stage at a time.</div>
          </div>
        </div>

        <div className="auth-welcome-actions">
          <button className="btn-primary auth-cta" onClick={() => setScreen('signup')}>
            Create free account
          </button>
          <button className="btn-secondary auth-cta" onClick={() => setScreen('signin')}>
            I already have an account
          </button>
        </div>
        <button className="auth-guest-link" onClick={onTryDemo}>
          Try a quick demo (5 cards) →
        </button>
      </div>
    </div>
  );
}
