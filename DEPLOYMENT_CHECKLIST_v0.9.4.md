# Deployment Checklist — v0.9.4

1. Confirm the exact repository is `C:\Users\LENOVO\Documents\cloud-projects\luke-shop-customer-web` and contains `.git`.
2. Run the repair package `CHECK-TARGETS-WINDOWS.bat`.
3. Run `START-HERE-WINDOWS.bat` only after the check passes.
4. Review the changed files in GitHub Desktop.
5. With Node 24+, run the project verification/build commands you normally use before production deployment.
6. Test both `/login` and `/register` at desktop and mobile widths.
7. On mobile, confirm the normal store top bar, support floating control and bottom navigation are absent during auth.
8. Confirm the tenant/store name and logo are correct.
9. Confirm email/password login and registration still work.
10. Confirm Google login opens and completes correctly when configured.
11. Confirm Telegram login opens and completes correctly when configured.
12. Confirm Turnstile behavior when enabled.
13. Confirm returning to the storefront restores normal navigation.
14. Commit and push through GitHub Desktop only after review.

No DB migration is required.
