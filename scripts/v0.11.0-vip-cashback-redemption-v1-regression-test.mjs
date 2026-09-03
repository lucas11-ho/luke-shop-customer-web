import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=(path)=>fs.readFileSync(path,'utf8').replace(/\r\n?/g,'\n');
const checkout=read('src/pages/CheckoutPage.jsx');
const gateway=read('src/commerce/paymentGateway.js');
const css=read('src/vip-redemption-checkout.css');
const pkg=JSON.parse(read('package.json'));
const tests=[];const test=(name,fn)=>tests.push([name,fn]);

test('Customer checkout loads server reward account and effective redemption policy',()=>{assert.match(checkout,/\/v1\/customer\/vip\/rewards/);assert.match(checkout,/r\?\.data\?\.rewards/);assert.match(checkout,/r\?\.data\?\.redemption_policy/);});
test('Redemption controls render only behind effective server enabled policy',()=>{assert.match(checkout,/vipPolicyEnabled = Boolean\(vipRedemptionPolicy\?\.enabled\)/);assert.match(checkout,/vipPolicyEnabled && <section[^>]+data-testid="checkout-vip-cashback"/);});
test('Checkout submits requested cashback amount but does not mutate reward ledger locally',()=>{assert.match(checkout,/vip_cashback_amount: vipCashbackValue > 0 \? vipCashbackValue : undefined/);assert.doesNotMatch(checkout,/setVipRewards\([^\n]*(balance|amount).*-/);});
test('UI copy preserves Backend authority for final redemption amount',()=>{assert.match(checkout,/server confirms the final eligible amount during checkout/i);assert.match(checkout,/Backend rechecks balance, reward validity, promotions, delivery and the policy inside the order transaction/);});
test('Server PAID checkout bypasses hosted TokenPay session',()=>{const paid=checkout.indexOf("serverPaymentStatus === 'PAID'");const hosted=checkout.indexOf('createHostedPaymentSession(api, orderRef');assert.ok(paid>=0&&hosted>paid);assert.match(checkout,/result\.data\.order\.payment_status/);});
test('VIP stale balance and policy errors clear intent and refresh server rewards',()=>{for(const code of ['VIP_REDEMPTION_DISABLED','VIP_REDEMPTION_MINIMUM_NOT_MET','VIP_REDEMPTION_EXCEEDS_LIMIT','VIP_REWARD_BALANCE_INSUFFICIENT','VIP_REWARD_SOURCES_INSUFFICIENT'])assert.ok(checkout.includes(code),`missing ${code}`);assert.match(checkout,/setVipCashbackAmount\(''\)/);assert.match(checkout,/await refreshVipRewards\(\)/);});
test('Existing TokenPay redirect remains HTTPS-only and server-session based',()=>{assert.match(gateway,/action!==['"]REDIRECT['"]/);assert.match(gateway,/url\.protocol===['"]https:['"]/);assert.match(gateway,/\/payment\/session/);});
test('VIP redemption checkout styles include responsive controls',()=>{assert.match(css,/checkout-vip-redemption-control/);assert.match(css,/@media\(max-width:640px\)/);});
test('VIP cashback regression is part of normal verify chain',()=>{assert.equal(pkg.scripts['test:vip-cashback-redemption-v1'],'node scripts/v0.11.0-vip-cashback-redemption-v1-regression-test.mjs');assert.match(pkg.scripts.verify,/test:vip-cashback-redemption-v1/);});

let passed=0;for(const[name,fn]of tests){try{fn();passed++;console.log(`PASS ${name}`)}catch(error){console.error(`FAIL ${name}`);throw error}}console.log(`${passed}/${tests.length} Customer Web VIP Cashback Redemption v1 checks passed`);
