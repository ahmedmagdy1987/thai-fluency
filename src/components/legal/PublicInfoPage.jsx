import React from 'react';
import { ArrowLeft } from 'lucide-react';
import {
  DeleteAccountContent,
  FeedbackContent,
  PremiumContent,
  PrivacyPolicyContent,
  SupportContent,
  TermsOfUseContent,
} from './legalCopy.jsx';
import { SITE_CONFIG } from '../../config/site.js';

const PUBLIC_PAGES = {
  privacy: {
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    intro: `How ${SITE_CONFIG.siteName} handles account data, learning progress, preferences, notifications, and service providers.`,
    Content: PrivacyPolicyContent,
  },
  terms: {
    eyebrow: 'Legal',
    title: 'Terms of Use',
    intro: `The basic rules for using ${SITE_CONFIG.siteName} during the web/PWA beta.`,
    Content: TermsOfUseContent,
  },
  support: {
    eyebrow: 'Support',
    title: 'Support',
    intro: 'Get help with account access, notifications, progress, content reports, and beta support questions.',
    Content: SupportContent,
  },
  feedback: {
    eyebrow: 'Beta',
    title: 'Beta Feedback',
    intro: `Help us improve ${SITE_CONFIG.siteName}. Tell us what happened, what device you used, and what you expected.`,
    Content: FeedbackContent,
  },
  premium: {
    eyebrow: 'Super',
    title: 'Tuk Talk Thai Super',
    intro: 'The planned premium layer for early access, flexible practice, bonus rewards, and future ad removal.',
    Content: PremiumContent,
  },
  'delete-account': {
    eyebrow: 'Account',
    title: 'Account Deletion',
    intro: 'Request manual account deletion while automated in-app deletion is still planned.',
    Content: DeleteAccountContent,
  },
};

const PAGE_LINKS = [
  { path: '/plans', label: 'Plans' },
  { path: '/privacy', label: 'Privacy' },
  { path: '/terms', label: 'Terms' },
  { path: '/support', label: 'Support' },
  { path: '/feedback', label: 'Feedback' },
  { path: '/delete-account', label: 'Delete account' },
];

export default function PublicInfoPage({ page = 'privacy', isAuthed = false, onNavigate }) {
  const pageData = PUBLIC_PAGES[page] || PUBLIC_PAGES.privacy;
  const Content = pageData.Content;
  const homePath = isAuthed ? '/learn' : '/get-started';
  const homeLabel = isAuthed ? 'Back to app' : 'Back to home';

  const navClick = (path) => (event) => {
    if (!onNavigate || event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onNavigate(path);
  };

  return (
    <main className="public-info-page">
      <header className="public-info-topbar">
        <a className="public-info-brand" href={homePath} onClick={navClick(homePath)}>
          <span className="public-info-brand-name">{SITE_CONFIG.siteName}</span>
          <span className="public-info-brand-slogan">{SITE_CONFIG.slogan}</span>
        </a>
        <nav className="public-info-nav" aria-label="Public pages">
          {PAGE_LINKS.map(link => (
            <a
              key={link.path}
              className={`public-info-nav-link ${link.path === `/${page}` ? 'public-info-nav-link-active' : ''}`}
              href={link.path}
              onClick={navClick(link.path)}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </header>

      <section className="public-info-shell">
        <a className="public-info-back" href={homePath} onClick={navClick(homePath)}>
          <ArrowLeft size={16} />
          {homeLabel}
        </a>
        <article className="public-info-card">
          <div className="public-info-eyebrow">{pageData.eyebrow}</div>
          <h1 className="public-info-title">{pageData.title}</h1>
          <p className="public-info-intro">{pageData.intro}</p>
          <div className="legal-content public-info-content">
            <Content />
          </div>
        </article>
      </section>
    </main>
  );
}
