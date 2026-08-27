import { spawnSync } from 'node:child_process';
import path from 'node:path';

const workersBuild = process.env.WORKERS_CI === '1';
const workersBranch = String(process.env.WORKERS_CI_BRANCH || '').trim();
const explicitProduction = String(process.env.VITE_APP_ENV || '').trim().toLowerCase() === 'production';
const productionBuild = explicitProduction || (workersBuild && workersBranch === 'main');

function fail(message) {
  console.error(`PRODUCTION BUILD BLOCKED: ${message}`);
  process.exit(1);
}

function requireHttpsUrl(name) {
  const raw = String(process.env[name] || '').trim();
  if (!raw) fail(`${name} is required for production.`);
  let url;
  try { url = new URL(raw); } catch { fail(`${name} must be a valid absolute URL.`); }
  if (url.protocol !== 'https:') fail(`${name} must use HTTPS in production.`);
  const host = url.hostname.toLowerCase();
  if (['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(host)) fail(`${name} cannot point to a local address in production.`);
  if (url.username || url.password) fail(`${name} must not contain URL credentials.`);
  return url.toString().replace(/\/$/, '');
}

const env = { ...process.env };
if (productionBuild) {
  env.VITE_APP_ENV = 'production';
  env.VITE_LUKE_SHOP_API_BASE_URL = requireHttpsUrl('VITE_LUKE_SHOP_API_BASE_URL');
  env.VITE_LUKE_SHOP_ALLOW_ENV_TENANT_FALLBACK = 'false';
  console.log(`PASS production environment gate (${workersBuild ? `Cloudflare ${workersBranch}` : 'explicit production'}).`);
} else {
  console.log('PASS build environment gate (non-production build).');
}

const viteBin = path.resolve('node_modules', 'vite', 'bin', 'vite.js');
const result = spawnSync(process.execPath, [viteBin, 'build'], { stdio: 'inherit', env });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
