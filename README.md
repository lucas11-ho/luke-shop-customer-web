# LUKE_SHOP_CUSTOMER_WEB — current release v0.11.0

Customer Web v0.11.0 is **Step 3 R2: Localization Pro** on top of the accepted Step 3 R1A modifier-dialog hotfix.

- Built-in Luke storefront UI dictionaries: English, Burmese, Indonesian.
- Tenant storefront configuration can enable up to 4 customer languages.
- Customer language selector is available in Profile -> Language & region and the desktop account menu.
- Language preference is scoped to the resolved tenant/store.
- Merchant-authored translations can localize branding, navigation titles/descriptions, home sections, categories, products, modifier groups/options, promotions and SEO.
- Missing translations fall back safely to the tenant default locale and then English system UI.
- Product/category/modifier identities are not duplicated per language.
- Carries forward Step 3 R1A modifier reliability, PWA Foundation, mobile maps/address policy, Turnstile, mobile storefront, merchant categories and product image zoom.

See `RELEASE_NOTES_v0.11.0.md`, `TECHNICAL_ANALYSIS_v0.11.0.md`, `TEST_RESULT_v0.11.0.md` and `DEPLOYMENT_CHECKLIST_v0.11.0.md`.

The exact current Merchant Admin/Backend integration remains a coordinated follow-up: the Customer Web runtime is ready to consume `experience.localization`, but Admin translation management must be wired into the current Admin source and the Backend Experience sanitizer must preserve that block before merchants can manage it live.
