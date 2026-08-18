# Deployment Checklist — v0.9.3

1. Run the read-only Windows target check from the repair package.
2. Install only if the exact customer-web repository is clean and supported.
3. Review Customer Web changes in GitHub Desktop.
4. Commit/push Customer Web v0.9.3.
5. Deploy Customer Web.
6. Test Sign In and Sign Up at 320px, 375px, 390px and desktop widths.
7. Confirm the main email action appears above Google/Telegram.
8. Confirm Google renders as a circular official GIS icon button.
9. Confirm Telegram renders as a circular control and still opens the configured login flow.
10. Confirm Turnstile is not permanently displayed as two large boxes, while backend-required verification still succeeds.
11. Confirm password minimum remains 12 characters and Forgot Password is absent.
