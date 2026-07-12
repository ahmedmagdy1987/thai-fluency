// Social links config — HIDDEN BY DEFAULT.
//
// Every entry ships with `url: null`, so the footer renders NOTHING: no icon,
// no empty row, no gap (see SocialLinks.jsx). The owner enables a platform by
// pasting a real, full URL (https://…) into the matching `url` below — the icon
// then appears instantly with zero code changes.
//
// HARD RULE: never put a placeholder, a "#", or a partial handle here. A dead
// or wrong social link is worse than none. Leave it `null` until the real URL
// is confirmed live. Order below is the order icons render in.
export const SOCIAL_LINKS = [
  { key: 'facebook',  label: 'Facebook',  url: null },
  { key: 'instagram', label: 'Instagram', url: null },
  { key: 'tiktok',    label: 'TikTok',    url: null },
  { key: 'youtube',   label: 'YouTube',   url: null },
  { key: 'x',         label: 'X',         url: null },
  { key: 'line',      label: 'LINE',      url: null },
  { key: 'telegram',  label: 'Telegram',  url: null },
];

// A URL counts as "active" only if it's a non-empty string that looks like an
// absolute http(s) link. Anything else (null, '', '#', a bare handle) is
// treated as disabled and never rendered — defense in depth behind the config.
export function isActiveSocialUrl(url) {
  return typeof url === 'string' && /^https?:\/\/.+/i.test(url.trim());
}

// The links the footer should actually render (may be empty → render nothing).
export function getActiveSocialLinks() {
  return SOCIAL_LINKS.filter((s) => isActiveSocialUrl(s.url));
}
