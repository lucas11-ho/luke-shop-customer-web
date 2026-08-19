# Test Result — Customer Web v0.9.5

## Dependency-free cumulative regression

Command:

```text
npm run verify
```

Result: PASS.

Regression assertions:

```text
Source regression                         111/111 PASS
Design                                      9/9 PASS
Storefront Renderer v3                     24/24 PASS
Account & Address                          12/12 PASS
Renderer Reliability                        6/6 PASS
Customer UX                                29/29 PASS
Identity / Profile                          9/9 PASS
Commerce Connector                          8/8 PASS
Customer Authentication Pro                12/12 PASS
Google Maps + Delivery                      17/17 PASS
Mobile Authentication UX v0.9.3            15/15 PASS
Mobile Auth Layout v0.9.4                   15/15 PASS
Mobile Storefront + Turnstile v0.9.5       19/19 PASS
-----------------------------------------------
Total                                     286/286 PASS
```

The source-safety scan also passed.

## v0.9.5 contract coverage

The new regression verifies:

- viewport safe-area support;
- separate desktop/mobile storefront headers;
- full-width mobile storefront main surface;
- reduced hero scale;
- horizontal mobile categories;
- compact two-column product collections;
- swipeable product media;
- single-column cart/checkout/order detail;
- safe-area bottom navigation;
- preserved separate email/social Turnstile actions;
- visible Turnstile presentation;
- visible missing-config failure;
- loader timeout and retry behavior;
- error callback token invalidation;
- flexible-size fallback;
- automatic expired/timeout refresh;
- narrow-phone Turnstile width protection.

## Build limitation in packaging environment

A Vite production build was not executed in the packaging environment because dependencies are not installed there (`vite: not found`) and the available runtime is Node 22.16.0 while this repository requires Node 24 or newer.

The Windows installer intentionally does not install dependencies or run a build. Production/build verification must be performed in the normal Node 24 repository/CI environment before deployment.
