# Deployment Checklist — Step 3 R2

1. Extract the repair package to a short fresh folder under Downloads.
2. Run `CHECK-TARGETS-WINDOWS.bat`.
3. Run `START-HERE-WINDOWS.bat` only after check-only success.
4. Review Customer Web changes in GitHub Desktop.
5. Run your normal Node 24 dependency, build, and browser checks.
6. Deploy Customer Web.
7. Confirm English/Burmese/Indonesian system UI switching on a real mobile device.
8. Confirm language selection persists for each tenant/store.
9. Confirm missing merchant translations fall back instead of showing blank text.
10. Confirm modifier groups/cart, Turnstile, map/address, product image zoom, PWA install, and checkout still work.

Until Admin integration is wired, tenant localization can only be configured by a published Customer Experience payload that contains `experience.localization`.

Do NOT claim Admin translation management is live until:
- staged Admin components are integrated into the exact current `luke-shop-admin-web` source, and
- the Backend Customer Experience sanitizer/publisher preserves and validates `experience.localization`.

No database migration is required by this Customer Web-only repair.
