# Customer Web Production Hosting

One Cloudflare Worker deployment serves all tenant storefronts.

## Production platform

- Cloudflare Workers Static Assets
- Production branch: `main`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Output directory: `dist`
- Non-production branch builds: disabled
- Worker preview URLs: disabled by `wrangler.jsonc`

Cloudflare Workers Builds injects `WORKERS_CI=1` and the pushed branch name. The repository production build gate treats `main` as production and refuses to build if the API URL is missing, non-HTTPS, or local.

## Required production build variables

Set these under Worker > Settings > Build > Variables and secrets:

- `VITE_LUKE_SHOP_API_BASE_URL=https://<production-api-host>`
- `VITE_APP_ENV=production` is optional because the production build wrapper sets it for the Vite process.
- `VITE_LUKE_SHOP_ALLOW_ENV_TENANT_FALLBACK=false`

Do not configure `VITE_LUKE_SHOP_TENANT_SLUG` or `VITE_LUKE_SHOP_STORE_ID` for the shared production deployment. Tenant/store context must come from the URL or verified hostname.

## Storefront routing

`wrangler.jsonc` uses `assets.not_found_handling = "single-page-application"`, so navigation requests that do not match a static asset resolve to `index.html`.

Supported storefront shapes include:

- `/t/{tenantSlug}`
- `/t/{tenantSlug}/s/{storeSlug}`
- `/preview/{token}` when a valid backend preview token is intentionally used
- verified custom storefront hostnames

Internal storefront navigation may use the URL hash, for example `/t/abc-fashion#/product/red-shirt`.

## Backend requirements

The final Customer Web production origin must be allowed by Backend `CORS_ORIGINS`, unless it is covered by a configured `STOREFRONT_HOST_SUFFIX` or a VERIFIED storefront domain in the database.

All production frontend-to-backend traffic must use HTTPS.
