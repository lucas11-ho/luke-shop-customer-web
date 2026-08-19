# Step 3 R2 — Localization Pro

Customer Web advances to v0.11.0 from the Step 3 R1A v0.10.1 baseline.

## Customer storefront
- Built-in Luke system UI languages: English, Burmese, Indonesian.
- A tenant storefront can enable up to 4 customer languages.
- Customer language selector appears under Profile -> Language & region.
- Desktop account menu also links to language settings.
- Customer preference is stored per tenant/store in the browser.
- Store default language is used when no customer preference exists.
- Missing content falls back to store default, then English system UI.
- Merchant translations can target branding, navigation title/description, home sections, categories, products, modifier groups/options, promotions, SEO, and UI overrides.
- Product/category/modifier identity is never duplicated by language.
- Current modifier reliability, image zoom, PWA, mobile maps, address policy, and Turnstile behavior are carried forward.

## Admin Web UI language kit
`ADMIN-WEB-INTEGRATION` contains a staged Admin UI language provider for:
- English
- Burmese
- Indonesian

It also contains a storefront-language manager (maximum 4), manual translation-field component, and localization schema.

## Backend integration kit
`BACKEND-INTEGRATION` documents the `experience.localization` persistence and sanitizer contract.

## Source-safety boundary
This package automatically patches Customer Web only. Admin/Backend code is deliberately not overwritten from an older snapshot. Use the included collector to provide the exact current Admin/Backend source before the coordinated live Admin translation-management patch.
