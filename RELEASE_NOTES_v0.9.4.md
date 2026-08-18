# Luke Shop Customer Web v0.9.4 — Mobile Auth Layout & Social Icon Refinement

## Release goal

This release refines Step 1 of **Mobile Experience + PWA Pro** after v0.9.3 installed successfully but the mobile authentication layout still felt like a storefront page instead of a dedicated mobile account flow.

## What changed

### Dedicated authentication shell

`/login` and `/register` no longer render the normal storefront header, floating support launcher, or bottom mobile navigation. Authentication now gets its own full-height shell so the form is not visually competing with shopping navigation.

### Mobile-first layout

- Uses the full `100dvh` viewport.
- Respects top and bottom device safe areas.
- Uses edge-to-edge white mobile presentation instead of a desktop card squeezed into a phone.
- Keeps desktop/tablet authentication as a centered professional card.
- Uses 54px mobile inputs and a 56px primary action.
- Reduces unnecessary security/form copy while preserving required password and Turnstile behavior.

### Store branding

The old hard-coded `L` authentication mark is removed. Authentication now uses the resolved tenant/store display name and logo, with a safe initial fallback.

### Navigation

A dedicated back-to-store button replaces dependence on the normal storefront header during authentication.

### Google and Telegram controls

- Google continues to use the official Google Identity Services rendered icon button.
- Google and Telegram are now visually balanced with 54–56px circular touch areas.
- Telegram uses a recognizable branded blue circle with a white paper-plane mark.
- The auth screen is icon-only for a cleaner mobile layout; accessible provider labels remain available to assistive technology.

## What did not change

- Backend authentication endpoints.
- Google credential verification.
- Telegram nonce / OIDC verification.
- Customer session handling.
- Cloudflare Turnstile server-side verification.
- Database schema.
- Checkout or order behavior.
- PWA installation support.

## PWA status

This is still a **Step 1 refinement**. PWA manifest, service worker, install flow, offline application shell, and update lifecycle are intentionally deferred until the mobile UI is accepted.
