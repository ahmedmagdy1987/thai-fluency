import React from 'react';

export const SUPPORT_EMAIL = 'support@tuktalkthai.com';
export const LEGAL_LAST_UPDATED = 'May 26, 2026';

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
        This Privacy Policy explains how Tuk Talk Thai collects, uses, and protects information when you use the web app or PWA beta.
      </p>

      <h3>1. Information we collect</h3>
      <p>We collect only the information needed to operate Tuk Talk Thai:</p>
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
        Tuk Talk Thai may use OneSignal to deliver optional web push notifications. If you allow notifications, OneSignal may process device identifiers, notification permission state, subscription status, and delivery information needed to send and manage push messages. You can change notification permissions in your browser/device settings and, where available, inside Tuk Talk Thai notification preferences.
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
        We do not sell user data. We do not use learning progress for third-party advertising. We share information only with service providers needed to operate Tuk Talk Thai, when required by law, or when needed to protect the app and its users.
      </p>

      <h3>6. Data retention and deletion</h3>
      <p>
        We keep account and learning data while your account is active or as needed to operate the service. To request account or data deletion, email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with the email address on your account and a clear deletion request.
      </p>

      <h3>7. Your choices</h3>
      <ul>
        <li>You can update some profile and app settings inside Tuk Talk Thai.</li>
        <li>You can disable push notifications through your browser or device settings.</li>
        <li>You can contact support to request account deletion or help with account data.</li>
      </ul>

      <h3>8. Changes</h3>
      <p>
        We may update this Privacy Policy as Tuk Talk Thai changes. If the update is material, we will take reasonable steps to notify users.
      </p>

      <h3>9. Contact</h3>
      <p>
        For privacy questions, support requests, or data/account deletion, email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
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
        These Terms of Use govern your access to and use of Tuk Talk Thai. By using the app, you agree to these terms.
      </p>

      <h3>1. Educational use</h3>
      <p>
        Tuk Talk Thai is an educational app for learning and practicing Thai. It is not a professional translation, interpretation, legal, medical, safety, or immigration service.
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
        <li>Use Tuk Talk Thai for unlawful, abusive, or harmful activity.</li>
        <li>Attempt to access another user's account or data.</li>
        <li>Interfere with app security, availability, or normal operation.</li>
        <li>Copy, scrape, resell, or misuse app content or functionality in a way that harms the service.</li>
      </ul>

      <h3>5. Changes to the app</h3>
      <p>
        Tuk Talk Thai is in beta and may change over time. Features, lesson structure, card availability, notifications, rewards, and other parts of the app may be added, changed, paused, or removed.
      </p>

      <h3>6. Availability</h3>
      <p>
        We aim to keep the app available, but we do not guarantee uninterrupted or error-free access. Maintenance, outages, browser limitations, or service-provider issues may affect availability.
      </p>

      <h3>7. Account deletion</h3>
      <p>
        You can request account deletion by emailing <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. Automated in-app deletion is planned as a future improvement.
      </p>

      <h3>8. Contact</h3>
      <p>
        For questions about these terms or support needs, email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </>
  );
}

export function SupportContent() {
  return (
    <>
      <OwnerReviewNotice>
        Confirm the support email before public launch. Current placeholder: {SUPPORT_EMAIL}.
      </OwnerReviewNotice>

      <p>
        Need help with Tuk Talk Thai? Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> and include the account email you use for the app when relevant.
      </p>

      <h3>Common help topics</h3>
      <ul>
        <li><strong>Account access</strong>: sign-in issues, password reset, email confirmation, or account recovery.</li>
        <li><strong>Notifications</strong>: push permission, notification preferences, or OneSignal reminder troubleshooting.</li>
        <li><strong>Learning progress</strong>: missing progress, sync questions, streaks, XP, or settings persistence.</li>
        <li><strong>Deleting account</strong>: request manual account deletion through support.</li>
        <li><strong>Reporting incorrect Thai content</strong>: send the phrase, card, screen, and what looks wrong.</li>
        <li><strong>Billing</strong>: coming later. Tuk Talk Thai is not collecting payments in the current beta.</li>
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

export function DeleteAccountContent() {
  return (
    <>
      <OwnerReviewNotice>
        This page documents the temporary manual deletion process. Automated in-app account deletion is a future improvement.
      </OwnerReviewNotice>

      <p>
        Tuk Talk Thai currently uses a support-based account deletion workflow. This page does not delete your account automatically.
      </p>

      <h3>How to request deletion</h3>
      <ol>
        <li>Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</li>
        <li>Send the request from the email address on your Tuk Talk Thai account when possible.</li>
        <li>Include the account email and write that you are requesting account deletion.</li>
        <li>The owner/admin will manually delete the account and associated app data from Supabase until automated deletion exists.</li>
      </ol>

      <h3>Important note</h3>
      <p>
        Automated in-app account deletion is a future improvement. Until then, support will handle deletion requests manually.
      </p>

      <h3>Need help?</h3>
      <p>
        For account questions or deletion status, email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </>
  );
}
