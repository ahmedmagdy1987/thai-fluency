export const SITE_CONFIG = {
  siteName: 'Tuk Talk Thai',
  siteUrl: 'https://www.tuktalkthai.com',
  supportEmail: 'support@tuktalkthai.com',
  slogan: 'Learn Thai the fast and fun way.',

  // Public "support the project" configuration, read from build-time env vars
  // so no real account, wallet, or QR is ever hardcoded in the repo. Every
  // value defaults to empty: the support section still renders both cards, but
  // an unconfigured card shows a polished "Coming soon" state instead of an
  // active link or a fake destination. Set these in .env.local (local) or the
  // Vercel project env (production) to activate a card. See
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

export default SITE_CONFIG;
