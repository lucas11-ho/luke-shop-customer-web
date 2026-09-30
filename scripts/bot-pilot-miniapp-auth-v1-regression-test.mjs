import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const index = read('index.html');
const main = read('src/main.jsx');
const bridge = read('src/integrations/botPilotMiniApp.js');

const checks = [
  ['Telegram Mini App runtime is loaded before the Vite entrypoint',
    index.indexOf('telegram-web-app.js?63') >= 0
      && index.indexOf('telegram-web-app.js?63') < index.indexOf('/src/main.jsx')],
  ['Bot Pilot storefront entry uses an opaque public Shop ID',
    bridge.includes("parts[0] !== 's'") && bridge.includes('SHOP_ID')],
  ['raw Telegram initData is exchanged only with Bot Pilot',
    bridge.includes('tg?.initData') && bridge.includes("actor_type: 'CUSTOMER'")],
  ['customer bootstrap does not trust initDataUnsafe',
    !bridge.includes('initDataUnsafe')],
  ['canonical customer session is written before the storefront renders',
    main.includes('bootstrapBotPilotCustomerMiniApp({ writeSession: writeStoredSession })')
      && main.indexOf('bootstrapBotPilotCustomerMiniApp') < main.lastIndexOf('.then(renderApp)')],
  ['verified routing context is converted to the existing tenant route',
    bridge.includes('session.tenant_slug')
      && bridge.includes('session.store_slug')
      && bridge.includes('/t/')],
  ['normal non-Bot-Pilot storefront routes remain supported',
    bridge.includes('if (!shopPublicId) return { handled: false }')],
];

let passed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  if (ok) passed++;
}
console.log(`${passed}/${checks.length} Bot Pilot customer Mini App checks passed`);
if (passed !== checks.length) process.exit(1);
