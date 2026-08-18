# Luke Shop Customer Web v0.9.3 — Mobile Authentication UX Pro

Step 1 of Mobile Experience + PWA Pro.

## Customer-facing changes
- Email/password is now the primary authentication form.
- The primary Sign In / Create Account button appears before social login options.
- Google and Telegram are presented as compact circular provider controls below the primary action.
- Google remains rendered by Google Identity Services using its official icon/circle button mode.
- Cloudflare Turnstile uses interaction-only appearance on auth pages so the large duplicated verification blocks are no longer permanently visible.
- Password visibility toggle added; minimum 12-character policy remains unchanged.
- Forgot Password remains intentionally absent.
- Mobile auth is edge-to-edge, safe-area aware, 100dvh based, and uses touch-friendly input/button heights.

## Scope
Customer Web only. Backend, Merchant Admin, Platform Admin and database schema are unchanged.
