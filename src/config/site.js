export const SITE_CONFIG = {
  siteName: 'Tuk Talk Thai',
  siteUrl: 'https://www.tuktalkthai.com',
  supportEmail: 'support@tuktalkthai.com',
  slogan: 'Learn Thai the fast and fun way.',

  // Public "support the project" configuration, read from build-time env vars
  // so no real account, wallet, or QR is ever hardcoded in the repo. Every
  // value defaults to empty. When BOTH the coffee URL and the crypto address are
  // unset, the whole support section is HIDDEN (a "Coming soon" card on a paid
  // product reads as unfinished) — see hasActiveSupportOption() below, mirrored
  // on the hidden-by-default social-links pattern. Set EITHER
  // VITE_BUY_ME_A_COFFEE_URL or VITE_CRYPTO_WALLET_ADDRESS in .env.local (local)
  // or the Vercel project env (production) and the section reappears
  // automatically with zero code change. See
  // docs/owner-feedback-implementation-status.md (item 3).
  support: {
    // VITE_BUY_ME_A_COFFEE_URL: a real, confirmed Buy Me a Coffee URL. When set,
    // the card shows an active external link (opened with noopener noreferrer).
    buyMeACoffeeUrl: import.meta.env.VITE_BUY_ME_A_COFFEE_URL || '',
    crypto: {
      // VITE_CRYPTO_WALLET_ADDRESS: a real wallet address. When set, the card
      // shows the network, a shortened address, a copy button, and (if provided)
      // the QR image. Never invent an address here.
      address: import.meta.env.VITE_CRYPTO_WALLET_ADDRESS || '',
      // VITE_CRYPTO_NETWORK: the network / token label, e.g. "USDT (TRC-20)".
      network: import.meta.env.VITE_CRYPTO_NETWORK || '',
      // VITE_CRYPTO_QR_IMAGE: public path to an approved QR image that encodes
      // exactly the address above, e.g. "/donate/crypto-qr.png".
      qrSrc: import.meta.env.VITE_CRYPTO_QR_IMAGE || '',
    },
  },
};

// A coffee link must be a real absolute http(s) URL (same guard as social links).
export function isActiveSupportUrl(url) {
  return typeof url === 'string' && /^https?:\/\/.+/i.test(url.trim());
}

// True when at least one donation option is configured. The public support
// section renders ONLY when this is true; otherwise it is hidden entirely (no
// "Coming soon" cards on a paid product). Reappears automatically the moment the
// owner sets VITE_BUY_ME_A_COFFEE_URL or VITE_CRYPTO_WALLET_ADDRESS.
export function hasActiveSupportOption(config = SITE_CONFIG) {
  const s = (config && config.support) || {};
  const coffee = isActiveSupportUrl(s.buyMeACoffeeUrl);
  const crypto = typeof s.crypto?.address === 'string' && s.crypto.address.trim() !== '';
  return coffee || crypto;
}

export default SITE_CONFIG;
