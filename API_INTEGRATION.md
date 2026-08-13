# API Integration — Customer Web v0.2.1

Backend requirement: Luke Shop Backend v0.7.1+.

## Bootstrap resolution
Before normal commerce calls, Customer Web resolves storefront context from the browser pathname/hostname:
- `GET /v1/storefront/resolve?tenant_slug={slug}`
- `GET /v1/storefront/resolve?tenant_slug={slug}&store_slug={store}`
- `GET /v1/storefront/resolve?hostname={hostname}`
- `GET /v1/storefront/preview/{signedToken}` for authorized draft preview

The returned tenant/store becomes runtime context. Normal requests then send backend-resolved `x-tenant-slug` and optional `x-store-id`.

## Public storefront
- `GET /v1/storefront/categories`
- `GET /v1/storefront/products`
- `GET /v1/storefront/products/:slug`
- `GET /v1/storefront/payment-methods`
- `GET /v1/storefront/delivery-methods`

## Customer auth/account
- `POST /v1/customer/auth/register`
- `POST /v1/customer/auth/login`
- `POST /v1/customer/auth/refresh`
- `POST /v1/customer/auth/logout`
- `GET /v1/customer/me`

Sessions are stored in `sessionStorage` and include the resolved tenant slug. A session from tenant A is not reused after switching to tenant B.

## Cart/checkout/orders
- `GET /v1/customer/cart`
- `POST /v1/customer/cart/items`
- `PATCH /v1/customer/cart/items/:itemId`
- `DELETE /v1/customer/cart/items/:itemId`
- `POST /v1/customer/checkout`
- `GET /v1/customer/orders`
- `GET /v1/customer/orders/:orderRef`
- `POST /v1/customer/orders/:orderRef/cancel`
- `POST /v1/customer/orders/:orderRef/payment/retry`

## Luke CS boundary
- `POST /v1/customer/support/context`

The launcher dispatches `luke-shop:support-context`. It never places the signed support context in a URL.

Public storefront rendering consumes only PUBLISHED experience returned by Backend. Signed preview is a separate short-lived route and Customer Web never calls merchant Customer Experience mutation APIs.
