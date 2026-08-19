# Technical Analysis — v0.10.0 PWA Foundation Pro + Mobile Delivery Address UX

## 1. PWA architecture

`PwaProvider` is mounted inside `StoreProvider`, so the installation experience can use resolved storefront branding and route context without moving commerce authority into the browser cache.

The service worker is intentionally conservative:

- cacheable: same-origin styles, scripts, images and fonts;
- navigation: network first, then `offline.html`;
- never handled: non-GET requests;
- bypassed: `/v1/`, `/api/`, `/auth/`, `/checkout`, `/payment`, `/orders/` sensitive paths.

The service worker does not cache authentication tokens, Turnstile tokens, checkout mutations, payment mutations or order mutations.

A first service-worker claim is prevented from forcing an unnecessary first-install reload. Later update activations can reload after the new worker takes control.

## 2. Shared multi-tenant PWA route

A single generic manifest on the shared Customer Web origin can only represent the shared application foundation. When the customer browses a real `/t/{tenant}` storefront, Luke remembers that storefront pathname. A standalone launch at `/` can reuse that remembered tenant path before normal storefront resolution.

This is deliberately not the final tenant-branded PWA solution. Per-tenant name/icon/manifest identity should be added in the later tenant-branded stage.

## 3. Map mobile interaction

The legacy map was 300px high on phones and its toolbar became full-width stacked actions. This consumed too much vertical space.

v0.10.0 applies responsive map heights and keeps the existing center-pin selection model. Coarse-pointer/touch layouts use `cooperative` Google Maps gesture handling while desktop keeps `greedy` handling.

## 4. Address field policy

The new policy resolver accepts `experience.delivery.address_fields` and defaults missing booleans to `true`.

Customer Web uses one shared policy in:

- Profile → Saved addresses;
- Checkout → saved address display;
- Checkout → manual delivery address.

The policy does not destroy stored historical data. It controls customer input/display. This matters for old orders and addresses because hiding a field today must not rewrite historical address snapshots.

## 5. Country fallback safety

Country code is structurally more important than the other optional presentation fields. If the merchant hides it, Customer Web tries to preserve a country from:

1. existing/saved address;
2. reverse-geocoded map result;
3. configured `default_country_code`;
4. tenant/store country metadata;
5. locale region where available.

If none exists, Customer Web blocks address save/checkout and asks the customer to choose the delivery point on the map. It does not silently submit a blank country.

## 6. Admin contract

Expected Customer Experience JSON:

```json
{
  "delivery": {
    "address_fields": {
      "label": true,
      "country_code": true,
      "address_line_2": true,
      "postal_code": true,
      "default_country_code": "IN"
    }
  }
}
```

Merchant Admin should expose four Show/Hide controls. If Country code is hidden, Admin should expose `Default country code` as a two-letter ISO-style configuration fallback.

The backend Experience sanitizer/publisher must preserve this nested contract in the public/published experience object. The Step 2 Customer Web package does not modify backend persistence.
