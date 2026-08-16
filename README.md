# LUKE_SHOP_CUSTOMER_WEB — current release v0.8.0

**Professional Profile, Multi-login & GPS Address Management** · 2026-08-17

Requires Luke Shop Backend v0.13.0 with migration 014 for readable customer identity, production-gated login providers, avatar upload, formatted GPS addresses and type-safe fulfillment.

See `RELEASE_NOTES_v0.8.0.md`, `TECHNICAL_ANALYSIS_v0.8.0.md` and `DEPLOYMENT_CHECKLIST_v0.8.0.md`.




## v0.8.0 release focus

Requires Backend v0.13.0 + migration 014. Profile options are split into dedicated pages; email is read-only; customer avatars, readable customer codes, Google/Telegram/Phone login, account linking, GPS reverse-geocoded addresses and security/session management use real Luke APIs.

Coordinated versions: Backend v0.13.0, Merchant Admin v0.11.0, Customer Web v0.8.0, Platform Admin v0.6.0.

## v0.7.0 customer experience

- Preserves the real React/Vite tenant/store, auth, cart, checkout, orders, Experience Engine, preview-token and Luke CS architecture.
- Adds professional order cards/detail, industry-aware fulfillment progress, restaurant preparation/pickup/delivery wording and theme-aware status icons.
- Adds safe `Order again` using the existing cart API with current product/variant/modifier/price/stock validation.
- Integrates precise browser-GPS capture into saved addresses, checkout and active-order delivery-location updates.
- Adds real opt-in live customer-location sharing through Backend v0.12.0 start/ping/stop routes.
- Does not implement fake courier coordinates or a decorative drag pin that pretends to change real latitude/longitude.
- Adds richer search, modifiers/combo UX, skeleton/empty/error states and responsive storefront polish.

## v0.6.1 renderer reliability

- Store Designer button-case configuration now reaches actual storefront buttons/navigation.
- The Customer Experience support toggle gates the real Luke CS launcher instead of being a cosmetic setting.
- Stock-status visibility gates the actual Product Card stock label.
- Critical storefront images use safe visual fallbacks when an old/stale media URL can no longer be loaded.
- Signed preview/live editor messages continue to update the same Customer Web renderer used by shoppers.

## Current account controls

Customers can update their display name, manage saved delivery addresses, choose a default address, change their password, inspect active sessions, revoke sessions and use saved addresses during checkout while the order still stores an immutable shipping-address snapshot.

Storefront Renderer v3, tenant routing, signed draft preview and published Experience Engine behavior remain intact.

## Payment safety

Customer Web does not collect or store raw card numbers, CVV/CVC values or provider secrets. Payment-method configuration remains backend/provider controlled.

A self-service forgot-password email/SMS delivery flow is not represented as complete because this source does not include an external notification/identity-delivery provider for reset tokens.

## Verification

The shipped `npm run verify` command performs source/regression checks only. No local dev/build workflow is included in this release package.
