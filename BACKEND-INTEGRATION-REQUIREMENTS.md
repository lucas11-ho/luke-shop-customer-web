# Luke Shop Customer Web v0.8.0 — Integration Status

This release is integrated with Luke Shop Backend v0.13.0. It does not use Emergent authentication, FastAPI, MongoDB or fake persistence.

## Implemented by the real Luke backend

- Readable tenant customer codes such as `LUK0000001` while preserving internal UUIDs.
- Merchant-controlled customer ID prefix for future registrations; existing codes are immutable.
- Runtime customer login options for Email/Password, Google, Telegram and Phone OTP.
- Auth identity linking so an authenticated member can connect additional login methods without creating duplicate accounts.
- Avatar upload through the Luke media/storage layer.
- Read-only profile email; display-name updates remain supported.
- Saved address coordinates plus human-readable `formatted_address`.
- Backend reverse-geocoding boundary using a configured Nominatim-compatible provider.
- Existing precise delivery location/live customer-location APIs from v0.12.0.
- Type-specific fulfillment groups and server-authoritative allowed transitions.

## Production provider configuration still required

These features intentionally remain unavailable until real provider credentials/services are configured:

- Google: `CUSTOMER_GOOGLE_CLIENT_ID`.
- Telegram: `CUSTOMER_TELEGRAM_BOT_USERNAME` and `CUSTOMER_TELEGRAM_BOT_TOKEN`.
- Phone OTP: `CUSTOMER_PHONE_OTP_WEBHOOK_URL`, optional bearer credential, and `CUSTOMER_PHONE_OTP_HASH_SECRET`.
- Reverse geocoding: `GEOCODING_PROVIDER=NOMINATIM` plus a production-appropriate `GEOCODING_BASE_URL` (managed or self-hosted is recommended rather than assuming a public free endpoint).

## Still intentionally deferred

### Courier / driver live location
A real courier/driver GPS source and true courier map remain deferred.
- True draggable geographic pin until a map SDK/provider is selected.
- Luke CS Commerce Connector v2 / AI commerce tools; this is the next coordinated release, not part of v0.8.0.

## Privacy/security

- GPS is customer-controlled and includes accuracy rather than claiming perfect precision.
- Provider login is verified server-side.
- Email cannot be edited from Customer Profile.
- Customer-facing codes are not used as database/security identifiers.
- No raw payment-card data is collected by Customer Web.

## v0.10.0 Customer Experience address-field contract

Customer Web v0.10.0 can consume the following nested published Experience configuration:

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

All visibility flags default to `true` when absent. The Experience save/sanitize/publish path must preserve these keys before Merchant Admin can control them in production. No new database table is required if the existing Experience document is JSON-backed and safely allows this controlled nested schema.
