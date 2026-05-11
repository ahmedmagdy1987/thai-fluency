import React from 'react';
import { X } from 'lucide-react';

// Boilerplate privacy policy reflecting the actual data we collect via
// Supabase (email, display name, learning progress) and the third parties
// involved (Supabase for storage, Vercel for hosting). Update the "Last
// updated" date when material changes are made.
export default function PrivacyPolicy({ onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal legal-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-eyebrow">Legal</div>
            <div className="modal-title">Privacy Policy</div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body legal-content">
          <p className="legal-updated">Last updated: May 12, 2026</p>
          <p>
            This Privacy Policy describes how Tuk Talk Thai ("we," "us," or
            "our") collects, uses, and protects your personal information when
            you use the service.
          </p>

          <h3>1. Information we collect</h3>
          <p>We collect the following information directly from you:</p>
          <ul>
            <li><strong>Account information</strong>: email address and display name when you create an account.</li>
            <li><strong>Authentication data</strong>: password (stored as a hash; we never see the plain text) and session tokens used to keep you signed in.</li>
            <li><strong>Learning progress</strong>: which cards you've reviewed, your spaced-repetition state, achievements unlocked, XP earned, streak data, and mission completion.</li>
            <li><strong>Preferences</strong>: selected voice (male/female), theme (light/dark), display options.</li>
          </ul>
          <p>We <strong>do not</strong> collect: real names beyond what you enter, payment information (the app is free), browsing history outside Tuk Talk Thai, location data, or device/biometric data.</p>

          <h3>2. How we use your information</h3>
          <p>We use this information to:</p>
          <ul>
            <li>Provide the learning service</li>
            <li>Sync your progress across the devices you sign in on</li>
            <li>Send transactional emails (account confirmation, password reset)</li>
            <li>Diagnose and fix technical issues</li>
          </ul>
          <p>We <strong>do not</strong>: sell or rent your data, send marketing emails, use your data for advertising, or profile you for any purpose other than displaying your own progress to you.</p>

          <h3>3. How we store and protect your data</h3>
          <ul>
            <li>Data is stored in <strong>Supabase</strong> (PostgreSQL hosted on AWS Singapore).</li>
            <li>Row-Level Security policies ensure your data is only readable by your own authenticated account.</li>
            <li>All connections use HTTPS.</li>
            <li>Passwords are hashed using industry-standard algorithms.</li>
            <li>Your browser stores a cached copy of your progress (for offline use) and an authentication token (to keep you signed in). Signing out removes these.</li>
          </ul>

          <h3>4. Third-party services</h3>
          <p>We use the following service providers as data processors:</p>
          <ul>
            <li><strong>Supabase</strong> — database and authentication. <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">supabase.com/privacy</a></li>
            <li><strong>Vercel</strong> — hosting. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">vercel.com/legal/privacy-policy</a></li>
          </ul>
          <p>These providers may collect technical data (IP address, request timestamps) for security and operational purposes. We use no other third-party integrations — no analytics, no advertising trackers.</p>

          <h3>5. Your rights</h3>
          <p>You have the right to:</p>
          <ul>
            <li><strong>Access</strong> your data — the app shows all of your stored progress.</li>
            <li><strong>Delete</strong> your account and all associated data — contact us at the address below. Deletion cascades to all learning data within 30 days, allowing for backup retention.</li>
            <li><strong>Export</strong> your data in a portable format — contact us at the address below to request an export.</li>
            <li><strong>Correct</strong> inaccurate data — update your name in Settings; for other corrections, contact us.</li>
          </ul>
          <p>If you are in the EU/UK, you have the rights described in the GDPR, including the right to lodge a complaint with your data protection authority.</p>

          <h3>6. Children's privacy</h3>
          <p>Tuk Talk Thai is not directed at children under 13 (or the relevant age in your jurisdiction). If we learn that we have collected information from a child under that age without parental consent, we will delete it.</p>

          <h3>7. Changes to this policy</h3>
          <p>We may update this Privacy Policy from time to time. Material changes will be communicated via email or in-app notice. The "Last updated" date at the top reflects the latest revision.</p>

          <h3>8. Contact us</h3>
          <p>For any privacy-related questions or to exercise your rights, email <a href="mailto:journeypixofficial@gmail.com">journeypixofficial@gmail.com</a>.</p>
        </div>
      </div>
    </div>
  );
}
