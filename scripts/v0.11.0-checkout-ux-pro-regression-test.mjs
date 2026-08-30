import assert from 'node:assert/strict';
import fs from 'node:fs';

const checkout = fs.readFileSync(new URL('../src/pages/CheckoutPage.jsx', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../src/checkout-ux-pro.css', import.meta.url), 'utf8');
const main = fs.readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8');

assert.ok(checkout.includes('checkout-pro-v1'), 'Checkout UX Pro surface must be active');
assert.equal((checkout.match(/commerce-place-order/g) || []).length, 1, 'Checkout must expose exactly one Place order CTA');
assert.ok(checkout.indexOf('checkout-pro-final') > checkout.indexOf('checkout-pro-extras-card'), 'Final Place order review must follow optional checkout controls');
assert.ok(checkout.includes('delivery-method-selector') && checkout.includes('delivery-method-sheet'), 'Delivery method must use a compact selector and choice sheet');
assert.ok(checkout.includes('payment-method-selector') && checkout.includes('payment-method-sheet'), 'Payment method must use a compact selector and choice sheet');
assert.ok(checkout.includes('digital-access-selector') && checkout.includes('digital-access-sheet'), 'Digital products must expose a secure Digital access disclosure');
assert.ok(checkout.includes("const eligibleDelivery = physicalMode ? deliveryMethods.filter((d) => d.fulfillment_mode === physicalMode) : []"), 'Digital-only carts must expose zero physical delivery methods');
assert.ok(checkout.includes('delivery_method_id: physicalMode ? (delivery || undefined) : undefined'), 'Digital-only checkout must never submit a physical delivery method id');
assert.ok(checkout.includes("DIGITAL_MODES = ['DIGITAL_ACCESS', 'DIGITAL_DOWNLOAD']"), 'Checkout must recognize authoritative digital fulfillment modes');
assert.ok(checkout.includes('Secure access in My Library') && checkout.includes('Protected download after purchase'), 'Customer-facing digital access copy must avoid raw technical mode names');
assert.ok(checkout.includes('checkoutErrorMessage') && checkout.includes('FULFILLMENT_MODE_NOT_AVAILABLE') && checkout.includes('CONSTRAINT_VIOLATION'), 'Known checkout business-rule failures need friendly customer copy');
assert.ok(checkout.includes("publicApi.request('/v1/storefront/payment-methods')") && checkout.includes("publicApi.request('/v1/storefront/delivery-methods')") && checkout.includes("api.request('/v1/customer/checkout'"), 'Checkout UX Pro must reuse existing commerce APIs');
assert.doesNotMatch(checkout, /\/v1\/merchant\/|card_number|cvv|cvc/i, 'Checkout UX Pro must not invent merchant APIs or collect raw card data');
assert.ok(css.includes('.checkout-pro-sheet-backdrop') && css.includes('max-width:680px') && css.includes('env(safe-area-inset-bottom)'), 'Choice sheets must be responsive and mobile safe-area aware');
assert.ok(main.includes("import './checkout-ux-pro.css'"), 'Checkout UX Pro stylesheet must be loaded');
assert.ok(main.indexOf("'./digital-library.css'") < main.indexOf("'./checkout-ux-pro.css'"), 'Checkout UX Pro must load after Digital Library');
assert.ok(main.indexOf("'./checkout-ux-pro.css'") < main.indexOf("'./mobile-scroll-safety.css'"), 'Mobile scroll safety must remain the final stylesheet');

console.log('PASS Checkout UX Pro v1: single final CTA, delivery/payment sheets, digital access disclosure, server-authoritative checkout and mobile-safe presentation');
