import React from 'react';
import { SITE_CONFIG } from '../config/site.js';
import SocialLinks from './SocialLinks.jsx';

// Single source of truth for the public footer, used by the landing page and
// (in a slim variant) by the standalone legal/info and Plans pages so no public
// surface ends in a bare void. The signed-in app shell deliberately does NOT
// render this — an app shell shouldn't carry a marketing footer.
export const FOOTER_LINKS = [
  { path: '/plans', label: 'Plans' },
  { path: '/privacy', label: 'Privacy' },
  { path: '/terms', label: 'Terms' },
  { path: '/support', label: 'Support' },
  { path: '/feedback', label: 'Feedback' },
  { path: '/delete-account', label: 'Account deletion' },
];

// onNavigate: (path: string) => void — SPA navigation. The click handler keeps
// modifier-clicks (new tab) working and only intercepts a plain left click.
export default function SiteFooter({ onNavigate, variant = 'full' }) {
  const handleClick = (path) => (event) => {
    if (!onNavigate || event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onNavigate(path);
  };

  return (
    <footer className={`lp-footer${variant === 'slim' ? ' lp-footer-slim' : ''}`} aria-label="Public links">
      <div className="lp-shell">
        <div className="lp-footer-top">
          <div className="lp-footer-brand">{SITE_CONFIG.siteName}</div>
          <nav className="lp-footer-links">
            {FOOTER_LINKS.map((link) => (
              <a key={link.path} href={link.path} onClick={handleClick(link.path)}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Social icons render only when a URL is set in config/socialLinks.js.
            All null by default → renders nothing (no empty row, no gap). */}
        <SocialLinks className="lp-footer-social" />

        <p className="lp-footer-fine">© {new Date().getFullYear()} {SITE_CONFIG.siteName}. All rights reserved.</p>
      </div>
    </footer>
  );
}
