# IMPLEMENTATION SUMMARY — Customer Web UX enhancement (on v0.6.1)

Enhancement of the existing `luke-shop-customer-web` (React 19 + Vite 7). Presentation-layer only.
No architecture, API-contract, auth, or backend changes. Scope is now locked.

## 1. Files ADDED
- `src/components/icons.jsx` — inline SVG line-icon set (no dependency).
- `src/components/StatusVisuals.jsx` — theme-aware `StatusIcon/StatusBadge/OrderProgress/StatusTimeline`, `resolveVisualPack`, `statusLabel`, restaurant chains.
- `src/components/Skeleton.jsx` — skeleton primitives.
- `src/components/SearchOverlay.jsx` — full-screen search (recents + categories), feature-flag gated.
- `src/components/ComboBuilder.jsx` — guided "build your meal" modal over existing modifier groups.
- `src/components/DeliveryLocation.jsx` — **PROTOTYPE** delivery pin + live-location cards.
- `src/delivery/locationPrototype.js` — **PROTOTYPE** geolocation/sessionStorage helper (no API calls).
- `src/cart/reorder.js` — safe reorder over the existing cart API.
- `scripts/v0.7.0-customer-ux-regression-test.mjs` — new regression suite (wired into `npm run verify`).
- `BACKEND-INTEGRATION-REQUIREMENTS.md`, `RELEASE_NOTES_v0.7.0.md`, this file.

## 2. Files MODIFIED
- `src/components/UI.jsx` — icon-based Empty/Error/Toast/Badge + `friendlyError()` code mapping.
- `src/components/Shell.jsx` — icon header/mobile-nav, search overlay trigger (kept `NAV`, `searchEnabled`, announcement).
- `src/components/ProductCard.jsx` — icon polish, lazy images (kept exact `stockEnabled`/`stock-note`/`discount-chip`/`SafeImage`).
- `src/components/SupportLauncher.jsx` — icon swap only (feature-flag gating unchanged).
- `src/store/StoreContext.jsx` — added `errorCode` passthrough for friendly errors (theme/preview/designer logic untouched).
- `src/app/App.jsx` — pass `errorCode` to ErrorState.
- `src/pages/HomePage.jsx` — skeleton loading (dynamic section renderer + all guardrail markers kept).
- `src/pages/ExplorePage.jsx` — search UX, skeletons, no-result suggestions, `features.search` respected.
- `src/pages/ProductPage.jsx` — combo summary + guided ComboBuilder (kept variants/modifier/fulfillment contract).
- `src/pages/CartPage.jsx` — icon/skeleton polish (cart API unchanged).
- `src/pages/OrdersPage.jsx` — themed status cards + "Order again".
- `src/pages/OrderDetailPage.jsx` — redesigned tracking (progress stepper, themed timeline, friendly labels), restaurant flow + prep countdown (`estimated_at`), delivery-location prototype, reorder + `?reorder=1` deep link.
- `src/styles.css` — appended v0.7.0 style layer (all prior CSS preserved).
- `package.json` — added `test:customer-ux-v07` to `verify`, updated description. **Version kept `0.6.1`** so all shipped guardrails stay green (bump at your release step).

## 3. Files PRESERVED (untouched logic)
`src/api/client.js`, `src/auth/AuthContext.jsx`, `src/cart/CartContext.jsx`, `src/store/route-context.js`,
`src/app/router.js`, `src/main.jsx`, `src/components/SafeMedia.jsx`, `src/pages/CheckoutPage.jsx`,
`src/pages/ProfilePage.jsx`, `src/pages/AuthPages.jsx`, `src/pages/NotFoundPage.jsx`, `vite.config.js`.

## 4. Existing Backend APIs used (unchanged)
`/v1/storefront/resolve`, `/v1/storefront/preview/:token`, `/v1/storefront/{categories,products,products/:slug,promotions,payment-methods,delivery-methods}`,
`/v1/customer/auth/{login,register,refresh,logout}`, `/v1/customer/me`, `/v1/customer/me/{addresses,sessions,change-password}`,
`/v1/customer/{cart,cart/items,checkout,orders,orders/:id,orders/:id/cancel,orders/:id/payment/retry}`, `/v1/customer/support/context`.

## 5. Backend additions still required
See `BACKEND-INTEGRATION-REQUIREMENTS.md`: `experience.status_visual_pack`; address/order delivery
`latitude/longitude/accuracy_meters/location_source`; live-location session endpoints; courier-location endpoint (+ map provider/key);
optional `orders[].item_count`/`estimated_at`; optional atomic reorder endpoint; notification-generated `?reorder=1` deep links.

## 6. Theme compatibility
All theming continues via `experience.theme/typography/layout` tokens and `html[data-*]` attributes; status pack derives from
`experience.status_visual_pack` (future) → `theme.preset`. Store Designer live `postMessage` renderer and preview-token flow intact.

## 7. Responsive
Verified 390 / 768 / 1440: no horizontal overflow; mobile bottom-nav + search overlay + sticky/reachable CTAs; combo builder bottom-sheet on mobile.

## 8. Accessibility
Icon+text pairing for all statuses; `aria-current`/labelled controls; radio/checkbox roles in modifiers/combo builder; focus-visible; `prefers-reduced-motion` respected; friendly error text.

## 9. Verification
`npm run verify` → all suites GREEN: check + source(111) + design(9) + renderer-v3(24) + account(12) + reliability(6) + customer-ux-v07(25). `vite build` clean.
Frontend smoke (testing agent) on served build: 100%, no JS errors, no overflow, routes don't crash.

## 10. Known limitations
- Live e2e against the real Render backend was NOT run (backend unreachable from the build sandbox); all wiring uses the real endpoints.
- GPS pin / live-location = PROTOTYPE (browser-only, not persisted) until the documented backend fields ship.
- Courier map intentionally not implemented (awaiting map provider + backend courier location).
