# LUKE_SHOP_CUSTOMER_WEB — current release v0.6.1

**Storefront Renderer Reliability & Media Fallbacks** · 2026-08-15

Requires Luke Shop Backend v0.11.1 with migration 012 for the new account/session fields.

See `RELEASE_NOTES_v0.6.1.md`, `TECHNICAL_ANALYSIS_v0.6.1.md` and `DEPLOYMENT_CHECKLIST_v0.6.1.md`.


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
