# LUKE_SHOP_CUSTOMER_WEB — current release v0.9.5

Customer Web v0.9.5 is **Step 1 R4: Mobile Storefront App UX + Turnstile Reliability**. It keeps the accepted full-screen mobile login/register experience from v0.9.4, converts the rest of the storefront from compressed desktop layouts into deliberate mobile commerce layouts, and restores a visible/recoverable Cloudflare Turnstile flow.

- Dedicated compact mobile storefront header and safe-area bottom navigation.
- Mobile hero, promotions, horizontal categories, compact two-column product cards, swipeable product media, and single-column commerce pages.
- Email/password remains the primary authentication action, with Google/Telegram below it.
- Turnstile is visibly rendered when required, reports loading/error/config states, supports retry, and keeps separate email/social proof actions.
- Password visibility toggle, touch-friendly controls, dynamic viewport sizing, and safe-area support are carried forward.
- Forgot Password remains intentionally unimplemented and hidden.
- All v0.9.2 Google Maps + Delivery Address functionality is carried forward.
- PWA manifest/service worker/install flow are intentionally not included yet.

See `RELEASE_NOTES_v0.9.5.md`, `TECHNICAL_ANALYSIS_v0.9.5.md`, `TEST_RESULT_v0.9.5.md` and `DEPLOYMENT_CHECKLIST_v0.9.5.md`.
