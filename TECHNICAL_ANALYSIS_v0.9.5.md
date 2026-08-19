# Technical Analysis — Customer Web v0.9.5

## Root causes

### Storefront still looked like desktop on mobile

The application already had responsive rules, but major storefront components were still primarily desktop-shaped: the desktop header/navigation remained the structural shell, hero sections retained desktop scale, categories/products inherited broad grid behavior, product galleries used desktop composition, and commerce pages retained multi-column layouts too far down the viewport range.

The result was a responsive desktop site rather than a deliberate mobile shopping interface.

### Turnstile looked absent and could block progress

The previous auth release selected `appearance="interaction-only"` and hid the supporting Turnstile note. Authentication buttons correctly continued to require the server-directed Turnstile token. On a phone this could produce a confusing state in which the security control was not visibly present while the protected action remained unavailable.

## Repair architecture

### Mobile storefront layer

`src/components/Shell.jsx` now separates desktop and mobile storefront header presentations. `src/styles.css` contains a v0.9.5 phone contract below 760px that intentionally changes composition rather than only shrinking desktop dimensions.

The mobile contract covers:

- shell/header/navigation;
- section rhythm and typography;
- hero and campaign media;
- promotions;
- categories;
- product collections/cards;
- explore/search/filter areas;
- product-detail gallery and purchasing controls;
- cart;
- checkout;
- order detail/history;
- profile and general state cards.

The Store Designer remains authoritative for selected experiences. The v0.9.5 rules provide mobile-safe rendering defaults without creating a second independent theme system.

### Turnstile lifecycle

`src/components/AuthMethods.jsx` now owns a visible lifecycle:

`loading -> ready -> verified`

or

`loading/ready -> error -> retry`

The loader uses explicit Cloudflare rendering, a finite load timeout, and resets its cached promise after a loader failure so a later retry is possible.

Widget error callbacks invalidate the client token. Flexible sizing is attempted first, with a normal-size fallback if the flexible render fails.

### Separate security actions retained

`src/pages/AuthPages.jsx` deliberately keeps two possible proof contexts:

- email/password action: `login` or `signup`;
- social action: `social`.

The frontend does not reuse one proof token for a different action. This avoids silently changing the backend verification contract while repairing visibility and recovery.

## Responsive thresholds

Primary mobile composition begins at 760px and below. Additional constraints below 360px protect very narrow phones, including an explicit 300px Turnstile frame allowance.

## Security behavior

If the backend says Turnstile is required but does not provide a site key, the client now displays a configuration error rather than silently presenting an unusable protected action.

No server-side verification has been removed or bypassed.

## No migration

v0.9.5 is Customer Web only. No PostgreSQL migration is required.
