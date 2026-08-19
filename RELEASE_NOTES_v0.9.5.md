# Luke Shop Customer Web v0.9.5 — Mobile Storefront App UX + Turnstile Reliability

## Release goal

v0.9.4 fixed the dedicated mobile Sign In / Sign Up flow, but the rest of Customer Web still inherited desktop-oriented storefront spacing and layouts at phone widths. The same release also used an interaction-only Turnstile presentation, which could leave users looking at disabled authentication/social controls without a visible verification surface.

v0.9.5 repairs both issues before PWA installation work begins.

## True mobile storefront shell

At phone widths Customer Web now uses a dedicated compact app-style storefront header instead of squeezing the desktop header into the viewport.

- Desktop navigation is hidden below 760px.
- Mobile header uses store branding, search, and account shortcuts.
- Header and bottom navigation respect device safe areas.
- Main storefront content is full-width and guarded against horizontal overflow.
- Floating customer-support launcher is positioned above the safe-area-aware bottom navigation.

## Mobile home and catalog

- Hero typography, padding, media height, and supporting panels are reduced for phone screens.
- Promotional cards become horizontal swipe/scroll items.
- Categories become touch-friendly horizontal cards/chips instead of a compressed desktop grid.
- Product collections use a compact two-column mobile grid by default.
- Product-card descriptions and secondary desktop actions are suppressed on mobile to reduce visual density.
- Horizontal product layouts remain horizontally scrollable where intentionally selected by the Store Designer.

## Mobile product and commerce pages

- Product media becomes a horizontal swipe carousel on phones.
- Purchase controls are placed near the mobile bottom navigation for easier reach.
- Cart, checkout, and order-detail multi-column layouts collapse to a single mobile column.
- Checkout form grids collapse to one column.
- Orders, profile, empty states, and error states receive compact app-style spacing.

## Turnstile reliability repair

Authentication keeps the existing server-controlled Turnstile policy and keeps separate action semantics for email/password and social authentication.

The client now:

- renders Turnstile explicitly and visibly when the backend policy requires it;
- uses an always-visible presentation instead of interaction-only presentation;
- requests flexible sizing and falls back to the normal widget size if needed;
- shows loading, verified, configuration-missing, and error states;
- clears stale tokens after widget errors;
- provides a Retry verification action;
- automatically refreshes expired/timeout challenges;
- uses a guarded script loader with a timeout and retryable failure state;
- keeps email/password proof separate from Google/Telegram social proof so backend action validation remains unchanged.

## What did not change

- Backend authentication endpoints or Turnstile verification contract.
- Google credential verification.
- Telegram nonce/OIDC verification.
- Customer session model.
- Database schema.
- Merchant Admin or Platform Admin.
- PWA manifest, service worker, install prompt, offline shell, or PWA update lifecycle.

## PWA status

This remains a mobile-foundation release. PWA installation work should begin only after the mobile storefront and visible verification flow are accepted on real phones.
