import React from 'react';
import { SITE_CONFIG } from '../../config/site.js';

const { siteName, siteUrl, supportEmail } = SITE_CONFIG;
export const LEGAL_LAST_UPDATED = 'May 26, 2026';
const FEEDBACK_SUBJECT = `${siteName} Beta Feedback`;
const FEEDBACK_BODY = [
  'What happened:',
  '',
  'What page were you on:',
  '',
  'What device/browser:',
  '',
  'Your account email, optional:',
  '',
  'Screenshot attached, optional:',
].join('\n');
export const FEEDBACK_MAILTO = `mailto:${supportEmail}?subject=${encodeURIComponent(FEEDBACK_SUBJECT)}&body=${encodeURIComponent(FEEDBACK_BODY)}`;

export function OwnerReviewNotice({ children = 'Draft legal/support copy. The owner should review and approve this page before public launch.' }) {
  return (
    <div className="legal-owner-note">
      <strong>Owner review required:</strong> {children}
    </div>
  );
}

export function PrivacyPolicyContent() {
  return (
    <>
      <p className="legal-updated">Last updated: {LEGAL_LAST_UPDATED}</p>
      <OwnerReviewNotice>
        This Privacy Policy uses practical placeholder language and should be reviewed and approved before public launch.
      </OwnerReviewNotice>

      <p>
        This Privacy Policy explains how {siteName} collects, uses, and protects information when you use the web app or PWA beta at <a href={siteUrl}>{siteUrl}</a>.
      </p>

      <h3>1. Information we collect</h3>
      <p>We collect only the information needed to operate {siteName}:</p>
      <ul>
        <li><strong>Account information</strong>: your email address and name/display name if you provide one.</li>
        <li><strong>Learning progress</strong>: reviewed cards, lesson progress, XP, streaks, achievements, mission state, and other progress data.</li>
        <li><strong>App settings and preferences</strong>: theme, audio speed, voice/perspective, character display, sound effects, and similar app preferences.</li>
        <li><strong>Notification preferences</strong>: whether you choose to receive reminders or other push notifications.</li>
        <li><strong>Basic technical data</strong>: device/browser information, IP address, request timestamps, and similar logs collected by hosting and infrastructure providers for security and operations.</li>
      </ul>

      <h3>2. How we use information</h3>
      <ul>
        <li>To create and manage your account.</li>
        <li>To save and sync your learning progress.</li>
        <li>To remember your app settings and preferences.</li>
        <li>To send account emails such as confirmation and password reset messages.</li>
        <li>To send push notifications only when you opt in.</li>
        <li>To monitor reliability, security, and app performance.</li>
      </ul>

      <h3>3. Push notifications</h3>
      <p>
        {siteName} may use OneSignal to deliver optional web push notifications. If you allow notifications, OneSignal may process device identifiers, notification permission state, subscription status, and delivery information needed to send and manage push messages. You can change notification permissions in your browser/device settings and, where available, inside {siteName} notification preferences.
      </p>

      <h3>4. Service providers</h3>
      <p>We rely on trusted service providers to run the app:</p>
      <ul>
        <li><strong>Supabase</strong> for authentication, user accounts, database storage, and related backend services.</li>
        <li><strong>Vercel</strong> for hosting and delivery of the web app.</li>
        <li><strong>OneSignal</strong> for optional push notification delivery and notification preference support.</li>
      </ul>

      <h3>5. Data sharing and selling</h3>
      <p>
        We do not sell user data. We do not use learning progress for third-party advertising. We share information only with service providers needed to operate {siteName}, when required by law, or when needed to protect the app and its users.
      </p>

      <h3>6. Data retention and deletion</h3>
      <p>
        We keep account and learning data while your account is active or as needed to operate the service. To request account or data deletion, email <a href={`mailto:${supportEmail}`}>{supportEmail}</a> with the email address on your account and a clear deletion request.
      </p>

      <h3>7. Your choices</h3>
      <ul>
        <li>You can update some profile and app settings inside {siteName}.</li>
        <li>You can disable push notifications through your browser or device settings.</li>
        <li>You can contact support to request account deletion or help with account data.</li>
      </ul>

      <h3>8. Changes</h3>
      <p>
        We may update this Privacy Policy as {siteName} changes. If the update is material, we will take reasonable steps to notify users.
      </p>

      <h3>9. Contact</h3>
      <p>
        For privacy questions, support requests, or data/account deletion, email <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
      </p>
    </>
  );
}

export function TermsOfUseContent() {
  return (
    <>
      <p className="legal-updated">Last updated: {LEGAL_LAST_UPDATED}</p>
      <OwnerReviewNotice>
        These Terms of Use use practical placeholder language and should be reviewed and approved before public launch.
      </OwnerReviewNotice>

      <p>
        These Terms of Use govern your access to and use of {siteName}. By using the app, you agree to these terms.
      </p>

      <h3>1. Educational use</h3>
      <p>
        {siteName} is an educational app for learning and practicing Thai. It is not a professional translation, interpretation, legal, medical, safety, or immigration service.
      </p>

      <h3>2. Accuracy</h3>
      <p>
        We try to make the Thai content, translations, phonetics, pronunciation audio, and learning guidance useful and accurate. We do not guarantee perfect translation, pronunciation, tone, cultural, or usage accuracy. Users should verify important language before relying on it in high-stakes situations.
      </p>

      <h3>3. Accounts and security</h3>
      <ul>
        <li>You are responsible for keeping your account login details secure.</li>
        <li>You are responsible for activity under your account.</li>
        <li>Contact support if you believe your account has been accessed without permission.</li>
      </ul>

      <h3>4. Acceptable use</h3>
      <p>You agree not to:</p>
      <ul>
        <li>Use {siteName} for unlawful, abusive, or harmful activity.</li>
        <li>Attempt to access another user's account or data.</li>
        <li>Interfere with app security, availability, or normal operation.</li>
        <li>Copy, scrape, resell, or misuse app content or functionality in a way that harms the service.</li>
      </ul>

      <h3>5. Changes to the app</h3>
      <p>
        {siteName} is in beta and may change over time. Features, lesson structure, card availability, notifications, rewards, and other parts of the app may be added, changed, paused, or removed.
      </p>

      <h3>6. Availability</h3>
      <p>
        We aim to keep the app available, but we do not guarantee uninterrupted or error-free access. Maintenance, outages, browser limitations, or service-provider issues may affect availability.
      </p>

      <h3>7. Account deletion</h3>
      <p>
        You can request account deletion by emailing <a href={`mailto:${supportEmail}`}>{supportEmail}</a>. Automated in-app deletion is planned as a future improvement.
      </p>

      <h3>8. Contact</h3>
      <p>
        For questions about these terms or support needs, email <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
      </p>
    </>
  );
}

export function SupportContent() {
  return (
    <>
      <OwnerReviewNotice>
        Confirm the support email is active before public launch. Current public support email: {supportEmail}.
      </OwnerReviewNotice>

      <p>
        Need help with {siteName}? Email <a href={`mailto:${supportEmail}`}>{supportEmail}</a> and include the account email you use for the app when relevant.
      </p>
      <p>
        For beta bugs, content mistakes, audio issues, login issues, or general feedback, use the <a href="/feedback">Beta Feedback page</a>.
      </p>

      <h3>Common help topics</h3>
      <ul>
        <li><strong>Account access</strong>: sign-in issues, password reset, email confirmation, or account recovery.</li>
        <li><strong>Notifications</strong>: push permission, notification preferences, or OneSignal reminder troubleshooting.</li>
        <li><strong>Learning progress</strong>: missing progress, sync questions, streaks, XP, or settings persistence.</li>
        <li><strong>Deleting account</strong>: request manual account deletion through support.</li>
        <li><strong>Reporting incorrect Thai content</strong>: send the phrase, card, screen, and what looks wrong.</li>
        <li><strong>Billing</strong>: questions about Super, your subscription, or a payment. Super is $4.99/month or $39.99/year via secure Stripe checkout; email support for help.</li>
      </ul>

      <h3>What to include</h3>
      <ul>
        <li>Your account email, if you have one.</li>
        <li>The device/browser you are using.</li>
        <li>A short description of what happened.</li>
        <li>A screenshot if it helps explain the issue.</li>
      </ul>
    </>
  );
}

export function FeedbackContent() {
  // The "Help us improve …" lede is already the page subtitle (PublicInfoPage
  // `intro`), so it is NOT repeated here — it used to appear verbatim twice (B4).
  return (
    <>
      <p>
        This page opens your email app. It does not collect or store feedback in the database.
      </p>

      <p>
        <a className="btn-primary feedback-mailto-btn" href={FEEDBACK_MAILTO}>
          Email feedback
        </a>
      </p>

      <h3>Report a bug</h3>
      <p>
        Tell us what broke, the page you were on, and what you expected to happen instead.
      </p>

      <h3>Report incorrect Thai content</h3>
      <p>
        Include the phrase, card, lesson, or screen, plus what looks incorrect.
      </p>

      <h3>Audio/pronunciation issue</h3>
      <p>
        Tell us which phrase or button had the issue, whether audio failed to play, or what sounded wrong.
      </p>

      <h3>Account/login issue</h3>
      <p>
        Include whether the problem happened during sign up, sign in, password reset, email confirmation, or sign out.
      </p>

      <h3>General feedback</h3>
      <p>
        Share what felt confusing, what helped you learn, or what would make the beta better.
      </p>

      <h3>Email template</h3>
      <ul>
        <li>What happened</li>
        <li>What page were you on</li>
        <li>What device/browser</li>
        <li>Your account email, optional</li>
        <li>Screenshot attached, optional</li>
      </ul>
    </>
  );
}

export function PremiumContent() {
  return (
    <>
      <p>
        Tuk Talk Thai Super is our optional subscription for learners who want a little extra and want to support the app. The entire core course — every stage and mission, reviews, quizzes, streaks, XP, quests, the guide, and cloud sync — is free forever. Super never gates the path to speaking Thai.
      </p>

      <p>
        Super is <strong>$4.99/month or $39.99/year</strong>. Checkout is live and handled securely by Stripe. You can cancel anytime. Visit the <a href="/plans">Plans page</a> to subscribe.
      </p>

      <h3>What Super unlocks today</h3>
      <ul className="premium-benefit-list">
        <li><strong>Dating &amp; Real Talk Thai (18+)</strong>: an optional, mature section with practical dating, flirting, and consent phrases. Super-exclusive.</li>
        <li><strong>Support independent development</strong>: you directly help fund native review, better audio, and new Thai learning content.</li>
      </ul>

      <h3>More Super benefits on the way</h3>
      <p>
        We're building more Super extras — a guaranteed ad-free experience if ads are ever added, more flexible practice and review, gentle streak recovery, and bonus or early-access mission packs. These are advertised as "soon" until they ship, and Super never removes anything from the free experience.
      </p>

      <h3>Questions</h3>
      <p>
        For anything about Super, billing, or your subscription, email <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
      </p>
    </>
  );
}

export function DeleteAccountContent() {
  return (
    <>
      <OwnerReviewNotice>
        This page documents the temporary manual deletion process. Automated in-app account deletion is a future improvement.
      </OwnerReviewNotice>

      <p>
        {siteName} currently uses a support-based account deletion workflow. This page does not delete your account automatically.
      </p>

      <h3>How to request deletion</h3>
      <ol>
        <li>Email <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.</li>
        <li>Send the request from the email address on your {siteName} account when possible.</li>
        <li>Include the account email and write that you are requesting account deletion.</li>
        <li>The owner/admin will manually delete the account and associated app data from Supabase until automated deletion exists.</li>
      </ol>

      <h3>Important note</h3>
      <p>
        Automated in-app account deletion is a future improvement. Until then, support will handle deletion requests manually.
      </p>

      <h3>Need help?</h3>
      <p>
        For account questions or deletion status, email <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
      </p>
    </>
  );
}
