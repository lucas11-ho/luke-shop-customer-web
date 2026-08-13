# Technical Analysis — Customer Web v0.2.0

The storefront now treats `GET /v1/storefront/config` as the customer-experience authority. It applies the returned published experience at runtime and falls back to safe defaults when no experience exists. It never calls merchant customer-experience mutation APIs.

## Rendering boundary
The client renders a fixed allowlist of navigation keys and home-section component types. Arbitrary HTML, JavaScript, SQL, and source-code injection are not supported.
