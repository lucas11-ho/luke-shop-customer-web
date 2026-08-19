# Luke Shop Customer Web v0.10.1 — Step 3 R1 Commerce Reliability

## Release identity

- Repository: `luke-shop-customer-web`
- Version: `0.10.1`
- Base: `0.10.0`
- Database migration: none
- Backend mutation/API schema changes: none in this Customer Web release

## Modifier Group Reliability

The backend `MODIFIER_SELECTION_INVALID` guard remains authoritative. Customer Web now prevents known-invalid selections before cart submission and recovers cleanly if the backend still rejects a stale or invalid selection.

- Modifier groups are normalized before rendering.
- Disabled/inactive modifier options are excluded from customer selection.
- `required`, `min_selections`, `max_selections`, and single-select semantics are enforced by one shared client rule module.
- Unknown/duplicate modifier option IDs are removed before submission.
- A backend `MODIFIER_SELECTION_INVALID` response reopens Product Options and shows customer-friendly guidance instead of leaving the product flow broken.
- Quick Add is allowed only when the product-list payload explicitly confirms that the product has no modifier groups. Unknown modifier metadata opens the product detail page instead of risking an invalid cart request.

## Merchant-managed Categories Only

Customer Web no longer presents internal product types as storefront category controls.

Removed customer-facing type filters such as:

- Physical
- Food
- Images
- Video
- Services

The Explore page now displays only categories returned from `/v1/storefront/categories`, plus an `All` view and normal product search. Internal `product_type` values remain an implementation/fulfillment concern and are not used as storefront category labels.

Product cards and product detail also stop falling back to `product_type` as a category badge.

## Product Image Zoom

Product detail images can now be opened in a full-screen viewer.

- Click/tap image to open.
- Zoom in/out/reset controls.
- Double-click/double-tap style zoom behavior through the viewer interaction.
- Two-pointer pinch zoom support.
- Previous/next image controls.
- Keyboard Escape and arrow navigation on desktop.
- Mobile safe-area fullscreen presentation.

Video media remains in the regular product gallery and is not forced into the image viewer.

## Carried forward

v0.10.0 PWA Foundation Pro, mobile map sizing, address-field policy, Turnstile reliability, mobile storefront shell, authentication, checkout, profile, and Luke CS launcher behavior remain unchanged.

## Admin/Backend coordination

This Customer Web release does not weaken backend modifier validation and does not guess the current Merchant Admin source. The Step 3 R1 repair package includes an integration contract and read-only preflight for the exact Admin/Backend repositories.

For the best Quick Add UX, the storefront product-list response should explicitly expose one of:

- `has_modifier_groups: true|false`, or
- `modifier_group_count: number`, or
- `requires_modifiers: true|false`.

When this metadata is absent, Customer Web intentionally routes Quick Add to the Product page.
