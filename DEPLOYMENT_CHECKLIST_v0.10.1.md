# Deployment Checklist — Customer Web v0.10.1

- [ ] Run repair `CHECK-TARGETS-WINDOWS.bat` first.
- [ ] Confirm target is `C:\Users\LENOVO\Documents\cloud-projects\luke-shop-customer-web` and `.git` exists.
- [ ] Install only after checksum/guard checks pass.
- [ ] Review changes in GitHub Desktop.
- [ ] Use Node 24+ for dependency install/build verification.
- [ ] Test a product with one required single-select modifier group.
- [ ] Test a product with optional multi-select modifiers and max selections.
- [ ] Confirm invalid modifier choices reopen Product Options with a readable message.
- [ ] Confirm Quick Add opens Product detail when modifier metadata is unknown or modifiers exist.
- [ ] Confirm a modifier-free product can Quick Add only when backend list metadata explicitly says it is modifier-free.
- [ ] Confirm Explore shows only merchant categories; no Physical/Food/Images/Video/Services type strip.
- [ ] Confirm product cards/detail do not use internal product type as a category badge.
- [ ] Confirm product image opens fullscreen and zooms on desktop/mobile.
- [ ] Re-test Login/Register/Turnstile.
- [ ] Re-test PWA installation/update behavior.
- [ ] Re-test saved address and Checkout map/address fields.
- [ ] Commit/push only after production build and real-device smoke tests pass.
