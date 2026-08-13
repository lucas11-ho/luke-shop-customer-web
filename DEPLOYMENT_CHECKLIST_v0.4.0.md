# Deployment Checklist v0.4.0

1. Run the upgrade `START-HERE-WINDOWS.bat`.
2. Confirm `.env` and `package-lock.json` were preserved.
3. Run `npm install --no-audit --no-fund`.
4. Run `npm run verify`.
5. Run `npm run build`.
6. Run `npm run dev`.
