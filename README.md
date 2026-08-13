# LUKE_SHOP_CUSTOMER_WEB — current release v0.4.0

**Experience Renderer v2 + Scheduled Promotion UI** · 2026-08-13

See `RELEASE_NOTES_v0.4.0.md` and `DEPLOYMENT_CHECKLIST_v0.4.0.md`.

# Luke Shop Customer Web v0.3.1

## v0.3.1 Commercial Storefront Polish

- Tenant campaign-media hero treatment.
- Adaptive category rail/grid for sparse and rich catalogs.
- Discount, stock state, and clearer product-card affordances.
- Search visibility follows the published Customer Experience feature flag.
- Backend v0.8.0 remains unchanged.

Shared multi-tenant Customer Web renderer for **Luke Shop Backend v0.7.1+**.

## v0.3.0 Professional Commercial Storefront

- Editorial, conversion-focused storefront hierarchy.
- Premium responsive header, hero, category, product and account surfaces.
- Tenant-published colors and branding remain the source of storefront identity.
- Dynamic `/t/{tenantSlug}` and `/s/{storeSlug}` routing remains unchanged.



## Dynamic storefront routing
- Primary tenant: `/t/{tenantSlug}`
- Optional non-primary store: `/t/{tenantSlug}/s/{storeSlug}`
- Signed draft preview: `/preview/{token}`
- VERIFIED custom hostname: resolved through Backend
- Optional hosted subdomain: resolved through Backend when `STOREFRONT_HOST_SUFFIX` is configured

The root `/` no longer silently loads `demo`. For local testing use `http://localhost:4174/t/demo`.

## Local environment
```env
VITE_LUKE_SHOP_API_BASE_URL=http://localhost:4100
VITE_LUKE_SHOP_TENANT_SLUG=
VITE_LUKE_SHOP_STORE_ID=
VITE_LUKE_SHOP_ALLOW_ENV_TENANT_FALLBACK=false
VITE_APP_ENV=development
```

The env tenant fallback exists only for controlled compatibility/testing and is disabled by default.

## Hosting requirement
The static host must rewrite `/t/*` and `/preview/*` to `index.html` so the SPA can resolve tenant context before hash-based in-store navigation begins. Custom domains should point at the same Customer Web deployment.

## Local development
```powershell
npm install --no-audit --no-fund
npm run verify
npm run build
npm run dev
```

Open `http://localhost:4174/t/demo`, not bare `http://localhost:4174`.
