# Deployment Checklist — Customer Web v0.3.0

1. Keep Backend v0.8.0 running and healthy.
2. Run the Windows upgrade `START-HERE-WINDOWS.bat`.
3. Confirm the rollback backup path printed by the installer.
4. Confirm `.env` and `package-lock.json` were preserved.
5. Run `npm install --no-audit --no-fund`.
6. Run `npm run verify`.
7. Run `npm run build`.
8. Run `npm run dev` and test desktop + mobile responsive layouts.
9. Validate authentication, tenant isolation and the primary workflows before deployment.
