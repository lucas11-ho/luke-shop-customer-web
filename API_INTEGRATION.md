# API Integration — Customer Web v0.7.0

Required backend: Luke Shop Backend v0.12.0 with migration 013.

Customer Web preserves Luke's React/Vite API client, customer auth/session model, tenant/store resolution, Store Designer signed preview flow, cart/checkout/orders and Luke CS integration.

## Storefront / Experience

Customer Web resolves tenant/store through normal storefront bootstrap or signed preview routes. The Experience payload may include:
- `status_visual_pack`
- resolved `status_visuals.icons` from the Platform-managed pack

Semantic order statuses remain backend data; the mapping controls icons/presentation only.

## Customer delivery location

Saved-address and checkout models support optional latitude/longitude/accuracy/source.

Active order routes used by Customer Web:
- `PATCH /v1/customer/orders/:orderRef/delivery-location`
- `POST /v1/customer/orders/:orderRef/live-location/start`
- `POST /v1/customer/orders/:orderRef/live-location/ping`
- `POST /v1/customer/orders/:orderRef/live-location/stop`

Live sharing is explicit opt-in and browser-permissioned. Customer Web displays accuracy and never claims GPS is perfectly exact.

## Commerce / order UX

Existing cart API remains authoritative. `Order again` re-adds historical items through the current cart route, allowing Backend to revalidate current product, variant, modifier, stock and price data. Historical selected modifier snapshots support both `public_id` and `id` forms.

Restaurant order UX prefers `estimated_ready_at`; delivery arrival prefers `estimated_delivery_at`.

## Deliberately deferred

Customer Web does not invent courier coordinates or a fake live courier map. A true drag-to-map-point editor is deferred until a map provider/projection is chosen.

## v0.8.0 identity/profile integration

- Customer login methods are discovered at runtime from `GET /v1/customer/auth/options`.
- Google, Telegram and Phone OTP only appear when Backend reports the provider enabled and ready.
- Personal information updates only `display_name`; email is intentionally read-only.
- Avatar upload uses `POST /v1/customer/me/avatar` with raw JPEG/PNG/WEBP bytes.
- Address GPS capture can call `POST /v1/customer/location/reverse-geocode` to populate human-readable address fields.
- Login identities and active sessions are managed through authenticated customer self-service routes.


## Customer Authentication Pro v0.9.1
Customer Web loads public authentication options, renders official Google/Telegram provider UX, obtains a tenant-bound Telegram nonce, and submits provider/Turnstile proof to Backend. It never receives provider secrets.
