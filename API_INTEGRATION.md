# API Integration — Customer Web v0.6.0

Required backend: Luke Shop Backend v0.11.0.

## Storefront bootstrap

Customer Web resolves tenant/store context through `/v1/storefront/resolve` or a signed `/v1/storefront/preview/:token`. Normal commerce requests then use the backend-resolved tenant/store context.

## Public storefront

- categories/products/product detail
- promotions
- customer-safe payment methods
- customer-safe delivery methods
- Store Designer v3 published rendering

## Customer account

- register/login/refresh/logout
- `GET/PATCH /v1/customer/me`
- saved address list/create/edit/delete/default
- password change
- session list/revoke/revoke-others

## Commerce

- cart list/add/update/remove
- checkout
- order list/detail/cancel
- payment retry
- order payment/fulfillment reads

Checkout can reuse a saved address, but the backend receives a shipping-address snapshot so later profile edits do not rewrite historical orders.

## Security boundaries

Customer Web does not collect raw card numbers or CVV/CVC values. A forgot-password delivery workflow is not claimed because this source does not include an external email/SMS reset-token delivery provider.
