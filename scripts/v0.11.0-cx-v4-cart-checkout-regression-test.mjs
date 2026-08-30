import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = (path) => fs.readFileSync(path, 'utf8').replace(/\r\n?/g, '\n');
const pkg = JSON.parse(read('package.json'));
const cart = read('src/pages/CartPage.jsx');
const checkout = read('src/pages/CheckoutPage.jsx');
const css = read('src/cart-checkout-v4.css');
const main = read('src/main.jsx');
const legacy = read('src/styles.css');
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('runtime versions remain the production baseline', () => {
  assert.equal(pkg.version, '0.11.0');
  assert.equal(pkg.dependencies.react, '19.1.1');
  assert.equal(pkg.dependencies['react-dom'], '19.1.1');
  assert.equal(pkg.devDependencies.vite, '7.3.6');
  assert.equal(pkg.devDependencies.wrangler, '4.126.0');
});

test('verify permanently includes the 11F suite', () => {
  assert.equal(pkg.scripts['test:cx-v4-cart-checkout'], 'node scripts/v0.11.0-cx-v4-cart-checkout-regression-test.mjs');
  assert.match(pkg.scripts.verify, /test:cx-v4-cart-checkout/);
});

test('11F stylesheet loads after the existing commerce v4 layer', () => {
  const commerce = main.indexOf("import './commerce-v4.css'");
  const phase = main.indexOf("import './cart-checkout-v4.css'");
  assert.ok(commerce >= 0 && phase > commerce);
});

test('Product Detail add-on repair neutralizes the legacy outer grid', () => {
  assert.match(legacy, /\.product-detail\{display:grid/);
  assert.match(css, /\.commerce-product-detail-v4\{display:block;grid-template-columns:none;gap:0;width:100%\}/);
  assert.match(css, /\.commerce-product-detail-v4>\.commerce-product-shell\{width:100%;min-width:0\}/);
});

test('cart retains authenticated account boundary', () => {
  assert.match(cart, /if \(!isAuthenticated\)/);
  assert.match(cart, /go\('\/login', \{ next: '\/cart' \}\)/);
});

test('cart keeps the existing cart context mutation contracts', () => {
  assert.match(cart, /updateItem\(item\.public_id, item\.quantity - 1\)/);
  assert.match(cart, /updateItem\(item\.public_id, item\.quantity \+ 1\)/);
  assert.match(cart, /removeItem\(item\.public_id\)/);
});

test('cart keeps product and checkout navigation on real routes', () => {
  assert.match(cart, /go\(`\/product\/\$\{item\.product_slug\}`\)/);
  assert.match(cart, /go\('\/checkout'\)/);
  assert.match(cart, /data-testid="cart-checkout"/);
});

test('cart summary uses existing server cart totals only', () => {
  assert.match(cart, /cart\.totals\?\.subtotal/);
  assert.match(cart, /cart\.totals\?\.grand_total/);
  assert.doesNotMatch(cart, /estimated_tax|calculated_tax|shipping_quote|fake_total/i);
});

test('cart renders real fulfillment, modifier and line total facts', () => {
  assert.match(cart, /item\.fulfillment_mode/);
  assert.match(cart, /item\.selected_modifiers/);
  assert.match(cart, /item\.line_total/);
});

test('checkout keeps all existing initialization endpoints', () => {
  for (const marker of ['/v1/storefront/payment-methods', '/v1/storefront/delivery-methods', '/v1/customer/me/addresses']) assert.ok(checkout.includes(marker), `missing ${marker}`);
  assert.match(checkout, /Promise\.all\(/);
  assert.match(checkout, /refresh\(\)/);
});

test('checkout keeps address policy and saved address behavior', () => {
  assert.match(checkout, /resolveAddressFieldPolicy/);
  assert.match(checkout, /prepareAddressForPolicy/);
  assert.match(checkout, /addressSummaryParts/);
  assert.match(checkout, /setAddressMode\('saved'\)/);
  assert.match(checkout, /setAddressMode\('manual'\)/);
});

test('checkout keeps map-assisted location capture', () => {
  assert.match(checkout, /<LocationCapture/);
  assert.match(checkout, /onAddressResolved=\{applyDetected\}/);
  assert.match(checkout, /location_source/);
});

test('checkout filters physical delivery methods and hides them for digital-only carts', () => {
  assert.match(checkout, /\['SHIPPING', 'LOCAL_DELIVERY', 'PICKUP'\]/);
  assert.match(checkout, /const eligibleDelivery = physicalMode \? deliveryMethods\.filter\(\(d\) => d\.fulfillment_mode === physicalMode\) : \[\]/);
  assert.match(checkout, /delivery_method_id: physicalMode \? \(delivery \|\| undefined\) : undefined/);
  assert.match(checkout, /eligibleDelivery\.length > 0/);
});

test('checkout keeps enabled storefront payment methods without collecting card fields', () => {
  assert.match(checkout, /paymentMethods\.map/);
  assert.match(checkout, /p\.instructions \|\| p\.provider_type/);
  assert.doesNotMatch(checkout, /card_number|card number|cvv|cvc|expiry|expiration/i);
});

test('checkout preserves promotion code and customer note payloads', () => {
  assert.match(checkout, /promotion_code: promo\.trim\(\) \|\| undefined/);
  assert.match(checkout, /customer_note: note\.trim\(\) \|\| undefined/);
});

test('checkout submits exactly through the existing idempotent endpoint', () => {
  assert.match(checkout, /idempotency_key: `web-\$\{Date\.now\(\)\}-\$\{crypto\.randomUUID\(\)\}`/);
  assert.match(checkout, /api\.request\('\/v1\/customer\/checkout', \{ method: 'POST', body, auth: true \}\)/);
});

test('successful checkout clears cart and routes using the real created order reference', () => {
  assert.match(checkout, /const orderRef = result\.data\.order\.id/);
  assert.match(checkout, /setCart\(null\)/);
  assert.match(checkout, /go\(`\/orders\/\$\{encodeURIComponent\(orderRef\)\}`\)/);
});

test('checkout retains support launcher placement', () => {
  assert.match(checkout, /SupportLauncher placement="checkout"/);
});

test('Cart and Checkout expose deterministic v4 surface markers', () => {
  assert.match(cart, /data-commerce-surface="cart-v4"/);
  assert.match(checkout, /data-commerce-surface="checkout-v4"/);
  assert.match(cart, /commerce-cart-layout/);
  assert.match(checkout, /commerce-checkout-layout/);
});

test('11F is responsive and reduced-motion safe', () => {
  for (const marker of ['max-width:980px', 'max-width:680px', 'max-width:430px', 'prefers-reduced-motion:reduce']) assert.ok(css.includes(marker), `missing ${marker}`);
});

test('11F introduces no new storefront or merchant API route', () => {
  assert.doesNotMatch(cart, /publicApi\.request|api\.request|\/v1\/merchant\//);
  assert.doesNotMatch(checkout, /\/v1\/merchant\//);
});

let passed = 0;
for (const [name, fn] of tests) {
  try { fn(); passed += 1; console.log(`PASS ${name}`); }
  catch (error) { console.error(`FAIL ${name}`); throw error; }
}
console.log(`${passed}/${tests.length} Luke Shop Customer Web v0.11.0 CX v4 Cart + Checkout checks passed`);
