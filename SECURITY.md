# Security Notes
- Customer access/refresh tokens are held in `sessionStorage`, not localStorage.
- The backend remains authoritative for tenant isolation, ownership, prices, stock, promotions, payments, delivery and order transitions.
- Checkout revalidation is server-side; the UI does not calculate authoritative discounts or delivery totals.
- No raw card number/CVV input exists in this release.
- No direct database credentials or Luke CS service credentials exist in frontend source.
- Luke CS support context is short-lived and passed through an in-page integration event, never a URL query string.
- Public product responses are used; private media storage keys are not requested.
