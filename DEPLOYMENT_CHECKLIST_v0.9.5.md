# Deployment Checklist — Customer Web v0.9.5

## Before installation

- Use the exact existing repository: `C:\Users\LENOVO\Documents\cloud-projects\luke-shop-customer-web`.
- Preserve its existing `.git` directory.
- Run `CHECK-TARGETS-WINDOWS.bat` from the repair package first.
- Do not install over an unexpected/manual modification of a guarded payload file.

## After installation

- Review all changes in GitHub Desktop before commit/push.
- Use Node 24+ for dependency/build verification.
- Run the normal production build in the repository/CI environment.
- Confirm desktop Storefront still renders correctly.

## Real-device mobile acceptance

Test at minimum:

- iPhone-width viewport around 390px;
- narrow phone around 320–360px;
- Android phone around 360–430px.

Verify:

- compact mobile store header replaces desktop navigation;
- no horizontal page overflow;
- hero does not resemble a desktop banner squeezed into the phone;
- categories are swipeable/touch friendly;
- products use a usable two-column mobile layout;
- product media can be swiped horizontally;
- cart, checkout, and order detail are single-column;
- bottom navigation does not overlap content;
- support launcher sits above bottom navigation;
- login/register still use the dedicated auth shell.

## Turnstile acceptance

When the backend auth policy requires Turnstile:

- a visible verification block appears;
- the widget can complete and the protected action becomes available;
- the loading state does not remain indefinitely;
- errors show a visible retry control;
- no missing-site-key case becomes a silent disabled form;
- Google/Telegram social auth continues to use its own `social` proof action where required.

If the widget returns a Cloudflare error, record the visible error code and verify the production Turnstile site-key hostname configuration and backend verification configuration before changing client-side enforcement.

## PWA

Do not treat this release as PWA completion. Manifest, service worker, install experience, offline shell, and update lifecycle remain deferred.
