# Technical Analysis — v0.9.4 Mobile Auth Layout & Social Icon Refinement

## Root UI problem

v0.9.3 improved auth form sizing but `Shell.jsx` still wrapped login and registration with normal storefront chrome. On a phone this meant the authentication experience shared the screen with the store top bar, support launcher, and bottom navigation. CSS then subtracted header height from the auth viewport rather than giving auth a true dedicated mobile surface.

## Architectural repair

`Shell.jsx` now detects `/login` and `/register` and renders an `auth-only-shell` before normal storefront chrome is created. This is a presentation boundary only; routing, Store context, Auth context, tenant resolution, and API behavior are unchanged.

## Branding repair

`AuthPages.jsx` now reads `effectiveBranding` from Store context. The authentication header renders the tenant/store logo when available and falls back to the first character of the customer-facing store name.

## Social provider treatment

Google remains rendered through `google.accounts.id.renderButton()` with `type: 'icon'` and `shape: 'circle'`. This retains the provider-controlled Google identity control instead of replacing it with a fake custom trigger.

Telegram's compact button keeps the existing secure nonce/OIDC flow but replaces the previous single-color glyph with a branded blue circular mark and white paper-plane graphic.

## Mobile rendering rules

- `100dvh` for auth shell and page.
- `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`.
- No storefront bottom-nav padding on auth routes.
- 54px mobile input height.
- 56px mobile primary action.
- 56px social provider touch areas.
- 16px input font size to avoid mobile browser form zoom.

## Security impact

No authentication trust boundary is changed. Provider credentials are still verified by existing backend endpoints, customer auth still uses the existing session mechanism, and Turnstile behavior remains interaction-only on the frontend while server-side validation remains authoritative.

## Database impact

None.
