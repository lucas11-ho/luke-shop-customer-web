# Deployment Checklist — Customer Web v0.2.1

1. Backend v0.7.1 and migration 008 ready.
2. Preserve `.env` and `package-lock.json`.
3. Keep `VITE_LUKE_SHOP_ALLOW_ENV_TENANT_FALLBACK=false`.
4. Run install, verify, build, dev.
5. Test `/t/demo`.
6. Test a newly provisioned tenant route.
7. Test unknown tenant -> not found/error, never Demo.
8. Test secure draft preview from Client Admin.
9. Production static host must rewrite `/t/*` and `/preview/*` to `index.html`.
