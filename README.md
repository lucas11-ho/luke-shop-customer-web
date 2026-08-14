# LUKE_SHOP_CUSTOMER_WEB — current release v0.6.0

**Customer Account, Address & Session Management** · 2026-08-14

Requires Luke Shop Backend v0.11.0 with migration 012 for the new account/session fields.

See `RELEASE_NOTES_v0.6.0.md`, `TECHNICAL_ANALYSIS_v0.6.0.md` and `DEPLOYMENT_CHECKLIST_v0.6.0.md`.

## Current account controls

Customers can update their display name, manage saved delivery addresses, choose a default address, change their password, inspect active sessions, revoke sessions and use saved addresses during checkout while the order still stores an immutable shipping-address snapshot.

Storefront Renderer v3, tenant routing, signed draft preview and published Experience Engine behavior remain intact.

## Payment safety

Customer Web does not collect or store raw card numbers, CVV/CVC values or provider secrets. Payment-method configuration remains backend/provider controlled.

A self-service forgot-password email/SMS delivery flow is not represented as complete because this source does not include an external notification/identity-delivery provider for reset tokens.

## Verification

The shipped `npm run verify` command performs source/regression checks only. No local dev/build workflow is included in this release package.
