# Customer Web Hosting — v0.2.1

One Customer Web deployment serves all tenants.

Required rewrites:
- `/t/*` -> `/index.html`
- `/preview/*` -> `/index.html`
- custom-domain requests -> the same deployment/index

Examples:
- `https://shop.example.com/t/abc-fashion`
- `https://shop.example.com/t/abc-fashion/s/outlet`
- `https://shop.abcfashion.com/` after the hostname is VERIFIED in Backend

The app uses real pathname for storefront context and hash routing for internal pages. A typical product navigation may therefore look like `/t/abc-fashion#/product/red-shirt`.

Custom-domain DNS and TLS certificate automation are deployment/platform concerns and are not automated in v0.2.1.
