# LUKE_SHOP_CUSTOMER_WEB — current release v0.10.1

Customer Web v0.10.1 is **Step 3 R1: Commerce Reliability** on top of the accepted v0.10.0 PWA + Maps + Address foundation.

- Keeps backend `MODIFIER_SELECTION_INVALID` protection and repairs the Customer Web selection/recovery flow.
- Enforces modifier min/max/single-selection rules before cart submission.
- Quick Add runs only when the list payload explicitly proves the product has no modifiers; otherwise Luke opens Product Options safely.
- Removes customer-facing hard-coded product-type filters such as Physical, Food, Images, Video and Services.
- Explore now uses merchant-published categories only.
- Product cards/detail no longer use internal `product_type` as a category badge fallback.
- Product images can be opened in a fullscreen viewer with zoom and image navigation.
- Carries forward PWA Foundation Pro, mobile Google Map sizing, address-field policy, Turnstile reliability, mobile auth and mobile storefront behavior.

See `RELEASE_NOTES_v0.10.1.md`, `TECHNICAL_ANALYSIS_v0.10.1.md`, `TEST_RESULT_v0.10.1.md` and `DEPLOYMENT_CHECKLIST_v0.10.1.md`.

The coordinated Admin localization/customer-language work remains Step 3 R2. Tenant-branded PWA + SEO/favicon remains Step 3 R3.
