# Technical Analysis — Customer Web v0.5.0

Renderer v3 is the single visual authority for both signed draft previews and published storefronts. It consumes the same Experience config in both cases.

The Store Designer browser bridge is active only when the resolved storefront is a valid signed preview and the query explicitly requests designer embedding. Incoming messages must match the supplied parent origin and `window.parent`; normal customer storefront pages do not accept design-state messages.

Responsive settings are limited overrides rather than separate websites. Product columns and hero media position change by breakpoint while the canonical content/config remains shared.
