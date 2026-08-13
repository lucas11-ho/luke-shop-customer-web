# Deployment Checklist — Customer Web v0.3.1

1. Back up the current frontend project.
2. Preserve `.env` and `package-lock.json`.
3. Apply the v0.3.1 upgrade.
4. Run `npm install --no-audit --no-fund`.
5. Run `npm run verify`.
6. Run `npm run build`.
7. Run `npm run dev` for local review.
8. Validate desktop and mobile layouts plus existing auth/tenant flows.
