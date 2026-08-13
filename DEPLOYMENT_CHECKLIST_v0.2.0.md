# Deployment Checklist — Customer Web v0.2.0

1. Deploy Backend v0.7.0 and run migration 007 first.
2. Confirm `/health/ready` returns ready.
3. Ensure Customer Web origin is in backend `CORS_ORIGINS`.
4. Keep `VITE_LUKE_SHOP_TENANT_SLUG` tenant-scoped.
5. Build and deploy Customer Web.
6. Publish a Customer Experience draft from Client Admin v0.4.0 and verify the storefront changes.
7. Verify rollback restores the prior published experience.
