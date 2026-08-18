# Technical Analysis — v0.9.3 Mobile Authentication UX Pro

The v0.9.1/v0.9.2 authentication runtime was functionally provider-first and rendered permanent Turnstile blocks. On narrow screens this caused excessive vertical space and made the form feel like a desktop card compressed into a phone viewport.

v0.9.3 changes presentation and client-side widget configuration only. Existing backend auth endpoints, provider credential verification, session handling, tenant scoping and Turnstile server validation remain unchanged.

Google continues to use `google.accounts.id.renderButton`; compact mode requests the official `icon` / `circle` button configuration. Telegram keeps the existing login runtime but gains a compact circular presentation. Turnstile now accepts configurable `appearance` and `size`; auth pages request `interaction-only` so Cloudflare can remain hidden until user interaction is needed while still issuing the token used by the existing backend flow.

The mobile layout uses dynamic viewport units, safe-area bottom padding, 16px email/password input text to avoid iOS input zoom, edge-to-edge presentation below 640px, and >=44px provider controls.
