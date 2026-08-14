# Deployment Checklist — Customer Web v0.5.0

- [ ] Backend v0.10.0 / migration 011 is deployed.
- [ ] Set `VITE_LUKE_SHOP_API_BASE_URL` to production Backend.
- [ ] Confirm tenant path and hostname storefront resolution still work.
- [ ] Run `npm run verify` and a production Vite build in CI/local environment with dependencies installed.
- [ ] Test a published store in desktop, tablet, and mobile widths.
- [ ] Test slider, video fallback, featured product, full-width hero, categories, product-grid/card styles, and iOS nav.
- [ ] Test signed `/preview/{token}` directly.
- [ ] Test embedded preview from Admin Web and confirm live unsaved changes render without becoming public.
- [ ] Confirm normal storefront pages reject/ignore designer messages.
