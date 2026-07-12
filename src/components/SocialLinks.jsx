import React from 'react';
import { getActiveSocialLinks } from '../config/socialLinks.js';

// Inline brand glyphs (no icon dependency, no network). Each is a 24x24 viewBox
// path drawn with currentColor so the footer's color/hover rules drive them and
// dark mode is automatic. Simplified monochrome marks — recognizable, not
// pixel-official. Keyed by the config `key`.
const ICONS = {
  facebook: (
    <path d="M14 8.5V7c0-.83.67-1 1.5-1H17V3h-2.5C12 3 11 4.9 11 6.8V8.5H9V11h2v10h3V11h2.2l.3-2.5H14z" />
  ),
  instagram: (
    <>
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="12" cy="12" r="4.1" fill="none" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="17.1" cy="6.9" r="1.15" />
    </>
  ),
  tiktok: (
    <path d="M14 3h2.6c.2 1.9 1.3 3.4 3.4 3.7v2.6c-1.3 0-2.5-.4-3.4-1v5.6a5.3 5.3 0 1 1-5.3-5.3c.3 0 .6 0 .9.1v2.7a2.6 2.6 0 1 0 1.8 2.5V3z" />
  ),
  youtube: (
    <>
      <path d="M21.3 8.1c-.2-1-.9-1.7-1.9-1.9C17.7 5.8 12 5.8 12 5.8s-5.7 0-7.4.4c-1 .2-1.7.9-1.9 1.9C2.3 9.8 2.3 12 2.3 12s0 2.2.4 3.9c.2 1 .9 1.7 1.9 1.9 1.7.4 7.4.4 7.4.4s5.7 0 7.4-.4c1-.2 1.7-.9 1.9-1.9.4-1.7.4-3.9.4-3.9s0-2.2-.4-3.9z" fill="currentColor" stroke="none" />
      <path d="M10.2 14.7V9.3l4.7 2.7-4.7 2.7z" fill="var(--jade, #0F3D2E)" stroke="none" />
    </>
  ),
  x: (
    <path d="M17.5 3h3l-6.6 7.5L21.8 21h-6l-4.7-6.1L5.7 21h-3l7.1-8.1L2.5 3h6.1l4.2 5.6L17.5 3zm-1.1 16h1.7L7.7 4.7H5.9L16.4 19z" />
  ),
  line: (
    <path d="M12 3.5c-5 0-9 3.2-9 7.2 0 3.6 3.2 6.6 7.5 7.1.3 0 .7.2.8.4.1.2.1.5 0 .7l-.1.9c0 .3-.2 1 .9.6 1.1-.5 6-3.5 8.2-6C21.6 14 22.5 12.5 22.5 11c0-4-4.5-7.5-10.5-7.5z" />
  ),
  telegram: (
    <path d="M21.5 4.3 3.6 11.2c-1 .4-1 1.4-.2 1.7l4.5 1.4 1.7 5.3c.2.6.4.8.9.8.5 0 .7-.2 1-.5l2.4-2.3 4.6 3.4c.8.5 1.4.2 1.6-.8l3-14c.3-1.2-.5-1.8-1.6-1.4zM9.7 14.3l8.5-5.3c.4-.2.8 0 .5.3L11.8 16c-.3.3-.4.5-.4.9l-.3 2.3-1.4-4.9z" />
  ),
};

// Renders social icons ONLY for platforms with a real, active URL (see
// socialLinks.js). With every url null (default), getActiveSocialLinks() is
// empty and this returns null — no row, no gap, nothing in the DOM. The owner
// pastes a URL into the config and the icon appears with zero code work.
export default function SocialLinks({ className = '' }) {
  const links = getActiveSocialLinks();
  if (links.length === 0) return null;

  return (
    <div className={`social-links ${className}`.trim()}>
      {links.map(({ key, label, url }) => (
        <a
          key={key}
          href={url}
          className="social-link"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true" focusable="false">
            {ICONS[key] || null}
          </svg>
        </a>
      ))}
    </div>
  );
}
