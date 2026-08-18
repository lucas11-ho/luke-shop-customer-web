# Deployment Checklist — Customer Web v0.9.2

1. Deploy Backend v0.14.2 first with Google Maps environment values.
2. In Google Cloud enable Maps JavaScript API and Places API (New) for the browser key.
3. Restrict the browser key by HTTP referrer to `https://luke-shop-customer-web.lacus-mm-ph.workers.dev/*` (and future verified custom storefront domains as they are onboarded).
4. Restrict the browser key API list to Maps JavaScript API and Places API (New).
5. Deploy Customer Web v0.9.2; no new Vite Google key variable is required because map config is runtime-delivered by Backend.
6. Test Profile → Addresses & locations: search, pan, current GPS, confirm pin, reverse geocode, edit fields, save, refresh.
7. Test Checkout → Enter a different address with the same map workflow.
8. Test mobile layout and denied-GPS fallback.
