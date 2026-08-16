# Technical Analysis — luke-shop-customer-web v0.8.0

## Architecture

This is an additive coordinated Luke Shop release. Tenant/store isolation, existing auth/session contracts, Experience Engine rendering and Luke CS boundaries are preserved.

## Major implementation

- Replaces long scrolling Profile with icon/label menu and dedicated pages.
- Personal Information supports avatar/name while email and customer code are read-only.
- Adds runtime-gated Google, Telegram and Phone OTP login plus account linking/security sessions.
- Phone country selector includes flags/calling codes and backend canonicalizes E.164 numbers.
- GPS capture can reverse-geocode into formatted/structured address fields; checkout preserves formatted address.
- No fake map pin or courier coordinates are introduced.

## Safety properties

- Internal UUIDs remain authoritative; readable customer codes are presentation/operations identifiers.
- Provider-dependent features are runtime-gated by Backend readiness.
- Fulfillment state transitions are server-authoritative.
- No fake courier data, fake OTP, Emergent identity provider or direct database access from frontends is introduced.

## Runtime-needed items

- Requires Backend v0.13.0 + migration 014.
- Google/Telegram/Phone UI remains hidden when Backend reports provider not ready.
- Reverse geocoding needs a configured production provider.
