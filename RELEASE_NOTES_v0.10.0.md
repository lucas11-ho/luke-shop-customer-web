# Luke Shop Customer Web v0.10.0 — PWA Foundation Pro + Mobile Delivery Map + Address Field Policy

## Release identity

- Repository: `luke-shop-customer-web`
- Version: `0.10.0`
- Base: `0.9.5`
- Database migration: none
- Backend API schema migration: none in this Customer Web package

## PWA Foundation Pro

This release adds the first production PWA foundation without changing checkout/payment authority.

- Standards-based `manifest.webmanifest` with 192px, 512px, maskable and Apple touch icons.
- Standalone app display mode and mobile home-screen metadata.
- Service-worker registration with explicit update activation.
- Offline navigation fallback and visible online/offline status.
- Same-origin static asset runtime cache only.
- No service-worker handling for non-GET requests.
- Explicit bypass for API/auth/checkout/payment/order-sensitive traffic.
- Chromium/Android install prompt when supported.
- iPhone/iPad Add to Home Screen guidance.
- Install prompt suppressed on Login, Register and Checkout.
- Shared `/t/{tenant}` route remembered for standalone launch on the shared Customer Web origin.

This is the generic PWA foundation. Dynamic tenant-specific manifests/icons/package identity are intentionally reserved for the next tenant-branded PWA stage.

## Mobile delivery map refinement

The Google delivery picker is now sized as a mobile control instead of a desktop panel squeezed into a phone.

- Normal phone map: 228px high.
- Compact checkout map: 198px high.
- Very small phone map: 210px / compact 184px.
- Short landscape map: 170px.
- Map actions are two touch-friendly columns when space permits.
- Under 380px, actions stack instead of being crushed.
- Touch/coarse-pointer devices use cooperative map gestures.
- Existing search, current-location, center-pin and Confirm this pin behavior remains active.

## Address field visibility policy

Customer Web now consumes this Customer Experience contract:

```json
{
  "delivery": {
    "address_fields": {
      "label": true,
      "country_code": true,
      "address_line_2": true,
      "postal_code": true,
      "default_country_code": ""
    }
  }
}
```

All four requested fields default to visible for backward compatibility.

When a field is disabled:

- `label`: hidden in saved-address editing and saved-address display; an internal fallback remains available for legacy API compatibility.
- `country_code`: hidden from the customer, but Google reverse-geocoding / tenant-store configuration / locale can still provide it internally. If Luke still cannot determine a country, save/checkout stops with a clear map-selection message instead of silently sending an invalid address.
- `address_line_2`: hidden from saved-address and checkout forms and omitted from generated address summaries.
- `postal_code`: hidden from saved-address and checkout forms and omitted from generated address summaries.

## Admin integration status

The current Customer Web is ready to consume the policy. A staged Merchant Admin integration component and schema are included in the Step 2 release package under `ADMIN-WEB-INTEGRATION/`.

The Merchant Admin source itself is **not auto-patched by this Customer Web installer**. The current Admin source archive is not mounted in this build session, so byte-level patching it would be unsafe. The integration module is provided for the coordinated Admin patch once that exact source is available.

## Carried forward

All v0.9.5 mobile storefront and Turnstile reliability behavior remains active, including full-screen mobile auth, Google/Telegram provider controls, visible Turnstile state, compact mobile storefront header, two-column product cards and safe-area navigation.
