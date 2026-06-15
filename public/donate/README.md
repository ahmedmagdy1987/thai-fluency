# Donations

The public landing footer can show two "support the project" options. Both are
configured in `src/config/site.js` under `SITE_CONFIG.support`.

## Buy Me a Coffee (live)

Set `support.buyMeACoffeeUrl` to your Buy Me a Coffee page. It opens in a new
tab. The current value is a placeholder handle — confirm or replace it.

## Crypto donation (wired, dormant by default)

The crypto block is intentionally hidden until you provide a wallet address, so
nothing ships half-finished. To enable it:

1. In `src/config/site.js`, set `support.crypto.address` to your wallet address
   and adjust `support.crypto.label` (e.g. `USDT (TRC-20)`, `BTC`, `ETH`).
2. Generate a QR code image of that exact address and save it here as
   `crypto-qr.png` (square, ~512×512 works well). Any QR generator is fine.
3. The footer then shows a "Donate crypto" button that reveals the QR, the
   label, the address, and a copy-to-clipboard button.

Only commit a QR image that matches the address in the config.
