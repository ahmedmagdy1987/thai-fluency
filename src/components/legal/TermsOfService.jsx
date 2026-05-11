import React from 'react';
import { X } from 'lucide-react';

// Boilerplate terms reflecting the app's actual model: free service, no
// account-required for the demo, account-required for full use, no payments.
// Update the "Last updated" date when material changes are made.
export default function TermsOfService({ onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal legal-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-eyebrow">Legal</div>
            <div className="modal-title">Terms of Service</div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body legal-content">
          <p className="legal-updated">Last updated: May 12, 2026</p>
          <p>By using Tuk Talk Thai ("the service"), you agree to these Terms of Service. Please read them carefully.</p>

          <h3>1. Acceptance of terms</h3>
          <p>By creating an account or using the service, you agree to be bound by these terms. If you don't agree, please don't use the service.</p>

          <h3>2. Your account</h3>
          <ul>
            <li>You must provide accurate information when creating an account.</li>
            <li>You're responsible for keeping your password secure. Don't share it.</li>
            <li>You're responsible for all activity under your account.</li>
            <li>You must be at least 13 years old (or the relevant age in your jurisdiction).</li>
          </ul>

          <h3>3. Acceptable use</h3>
          <p>You agree <strong>not</strong> to:</p>
          <ul>
            <li>Use the service for any unlawful purpose</li>
            <li>Attempt to bypass security or access other users' data</li>
            <li>Reverse engineer, decompile, or attempt to extract source code</li>
            <li>Use automated systems (bots, scrapers) to access the service</li>
            <li>Resell, sublicense, or commercially exploit the service or its content</li>
            <li>Interfere with the service's operation or other users' use of it</li>
          </ul>

          <h3>4. Service availability</h3>
          <p>We provide the service on a "best effort" basis. We don't guarantee uninterrupted availability. We may modify, suspend, or discontinue features at any time, with or without notice.</p>

          <h3>5. Intellectual property</h3>
          <ul>
            <li>The Thai language content, card definitions, and app design are owned by us.</li>
            <li>Your account information and learning progress data are <strong>yours</strong>. We have a limited license to store and display this data to you in order to provide the service.</li>
            <li>The "Tuk Talk Thai" name and branding are our trademarks.</li>
          </ul>

          <h3>6. Termination</h3>
          <ul>
            <li>You can delete your account at any time by contacting us.</li>
            <li>We may suspend or terminate your account if you violate these terms, with notice when reasonable.</li>
            <li>Termination doesn't relieve you of obligations incurred before termination.</li>
          </ul>

          <h3>7. Disclaimers and limitation of liability</h3>
          <p>THE SERVICE IS PROVIDED "AS IS," WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.</p>
          <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, WE ARE NOT LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.</p>
          <p>Some jurisdictions don't allow these limitations, so they may not apply to you in full.</p>

          <h3>8. Changes to these terms</h3>
          <p>We may update these Terms from time to time. Continued use of the service after changes means you accept the new terms. Material changes will be communicated.</p>

          <h3>9. Contact</h3>
          <p>Questions? Email <a href="mailto:journeypixofficial@gmail.com">journeypixofficial@gmail.com</a>.</p>
        </div>
      </div>
    </div>
  );
}
