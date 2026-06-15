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
    // TODO(owner): confirm or replace with your real Buy Me a Coffee handle.
    buyMeACoffeeUrl: 'https://www.buymeacoffee.com/tuktalkthai',
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
