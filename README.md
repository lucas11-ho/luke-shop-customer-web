# LUKE_SHOP_CUSTOMER_WEB — current release v0.9.0

Customer Web v0.9.0 securely embeds Luke CS and transfers the customer's short-lived Shop support context without placing identity or authorization tokens in a URL. It requires Shop Backend v0.14.0 + migration 015.

- Customer Support opens the merchant-configured HTTPS Luke CS chat in an iframe modal.
- Signed context is delivered with `postMessage` only to the iframe's exact origin/window.
- Chat can request a fresh context before expiry.
- Order Detail includes an optional customer-owned order hint, verified by Shop Backend.
- The UI may display the readable customer code after secure context creation.

See `RELEASE_NOTES_v0.9.0.md`, `TECHNICAL_ANALYSIS_v0.9.0.md`, `TEST_RESULT_v0.9.0.md` and `DEPLOYMENT_CHECKLIST_v0.9.0.md`.
