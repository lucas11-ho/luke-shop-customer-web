# Technical Analysis — Customer Web v0.10.1

## Root cause addressed

The captured production response showed `MODIFIER_SELECTION_INVALID`. Backend validation was doing the correct safety job, but Customer Web had two weak paths:

1. Product-card Quick Add could submit without modifier IDs because list products did not prove they were modifier-free.
2. Product detail handled backend rejection as generic toast text instead of reopening the product-option workflow.

v0.10.1 fixes both without relaxing server-side selection validation.

## Shared modifier rules

`src/modifiers/modifierRules.js` centralizes:

- option enabled/disabled filtering;
- group minimum and maximum selection rules;
- single-select compatibility;
- sanitization to allowed option IDs;
- complete-selection validation;
- customer-friendly modifier error recovery;
- safe Quick Add metadata checks.

Both `ProductPage` and `ComboBuilder` use the same rules to reduce frontend drift.

## Category separation

Storefront categories and internal product types are now separated in Customer Web presentation. `/v1/storefront/categories` is the only source of customer-visible category filters. Internal `PHYSICAL`, `FOOD`, `DIGITAL_IMAGE`, `DIGITAL_VIDEO`, and `SERVICE` values remain valid backend domain values but are not rendered as pseudo-categories.

## Image viewer

`ProductMediaViewer` is a dependency-free React component. It renders only image media, uses pointer events for two-pointer scaling, clamps zoom to 1x–4x, supports keyboard navigation, and uses a fixed high-z-index mobile-safe overlay.

## Security and authority

- Backend remains authoritative for modifier membership and selection rules.
- Customer Web never accepts arbitrary modifier IDs outside the product detail payload.
- The release does not collect additional personal/payment data.
- PWA service-worker sensitive-route bypass from v0.10.0 remains unchanged.
