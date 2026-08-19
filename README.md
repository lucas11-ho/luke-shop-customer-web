# LUKE_SHOP_CUSTOMER_WEB — current release v0.10.0

Customer Web v0.10.0 is **Step 2 R1: PWA Foundation Pro + Mobile Delivery Map + Address Field Policy**. It turns the accepted v0.9.5 mobile storefront into an installable PWA foundation, reduces the Google delivery picker to phone-appropriate dimensions, and consumes tenant-controlled visibility for Label, Country code, Address line 2 and Postal code.

- PWA manifest, install icons, standalone metadata, service worker, update flow and offline fallback.
- Conservative caching: same-origin static assets only; sensitive API/auth/checkout/payment/order traffic bypasses the service worker.
- Android/Chromium install prompt and iPhone/iPad Add to Home Screen guidance.
- Mobile map reduced from the legacy 300px phone height, with compact checkout sizing and touch-cooperative gestures.
- Center-pin selection, map search, current location and reverse geocoding remain active.
- Address visibility policy defaults all four fields ON for backward compatibility.
- Hidden Country code keeps map/config fallback and blocks invalid blank-country submission.
- All v0.9.5 mobile storefront and Turnstile reliability behavior is carried forward.

See `RELEASE_NOTES_v0.10.0.md`, `TECHNICAL_ANALYSIS_v0.10.0.md`, `TEST_RESULT_v0.10.0.md` and `DEPLOYMENT_CHECKLIST_v0.10.0.md`.
