export const SITE_CONFIG = {
  siteName: 'Tuk Talk Thai',
  siteUrl: 'https://www.tuktalkthai.com',
  supportEmail: 'support@tuktalkthai.com',
  slogan: 'Learn Thai the fast and fun way.',

  // Optional "support the project" links shown in the public landing footer.
  // The Buy Me a Coffee link renders whenever `buyMeACoffeeUrl` is set; the
  // crypto donation block (QR + copyable address) only renders once
  // `crypto.address` is filled in. Leave a field empty to hide that option.
  support: {
    // ACTION REQUIRED (owner): paste your REAL Buy Me a Coffee URL here to show
    // the footer support button. Kept empty on purpose - the previously
    // placeholdered handle (buymeacoffee.com/tuktalkthai) was verified to return
    // HTTP 404 (2026-06-16), so shipping it would render a dead donation link.
    // The footer architecture is ready: set this to a confirmed URL and the
    // "Buy me a coffee" button appears automatically. See
    // docs/owner-feedback-implementation-status.md (item 3).
    buyMeACoffeeUrl: '',
    crypto: {
      label: 'USDT (TRC-20)',
      // TODO(owner): paste your wallet address here to activate crypto
      // donations, and drop a matching QR image at public/donate/crypto-qr.png
      // (see public/donate/README.md). Kept empty so nothing ships half-wired.
      address: '',
      qrSrc: '/donate/crypto-qr.png',
    },
  },
};

export default SITE_CONFIG;
