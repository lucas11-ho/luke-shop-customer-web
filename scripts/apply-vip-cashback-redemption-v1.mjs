import fs from 'node:fs';

const path = 'src/pages/CheckoutPage.jsx';
let source = fs.readFileSync(path, 'utf8').replace(/\r\n?/g, '\n');

if (source.includes('data-testid="checkout-vip-cashback"')) {
  console.log('VIP cashback checkout patch already applied.');
  process.exit(0);
}

function replaceOnce(from, to, label) {
  const first = source.indexOf(from);
  if (first < 0) throw new Error(`Patch marker not found: ${label}`);
  if (source.indexOf(from, first + from.length) >= 0) throw new Error(`Patch marker is not unique: ${label}`);
  source = source.replace(from, to);
}

replaceOnce(
  "import { go } from '../app/router.js';",
  "import { go } from '../app/router.js';\nimport '../vip-redemption-checkout.css';",
  'checkout VIP stylesheet import',
);

replaceOnce(
  "  if (error?.code === 'PAYMENT_METHOD_NOT_AVAILABLE') return 'That payment method is no longer available. Choose another payment method.';",
  "  if (error?.code === 'PAYMENT_METHOD_NOT_AVAILABLE') return 'That payment method is no longer available. Choose another payment method.';\n  if (error?.code === 'VIP_REDEMPTION_DISABLED') return 'VIP cashback redemption is no longer available for this store. Your rewards were not spent.';\n  if (error?.code === 'VIP_REDEMPTION_MINIMUM_NOT_MET') return error?.message || 'The cashback amount is below the store minimum.';\n  if (error?.code === 'VIP_REDEMPTION_EXCEEDS_LIMIT') return 'The cashback amount is above the server-authorized checkout limit. Refresh your rewards and try a smaller amount.';\n  if (error?.code === 'VIP_REWARD_BALANCE_INSUFFICIENT') return 'Your VIP cashback balance changed. We refreshed it; choose the amount again.';\n  if (error?.code === 'VIP_REWARD_SOURCES_INSUFFICIENT') return 'Some VIP cashback is no longer spendable. We refreshed your rewards; choose the amount again.';",
  'VIP checkout error messages',
);

replaceOnce(
  "  const [quoteError, setQuoteError] = useState('');",
  "  const [quoteError, setQuoteError] = useState('');\n  const [vipRewards, setVipRewards] = useState(null);\n  const [vipRedemptionPolicy, setVipRedemptionPolicy] = useState(null);\n  const [vipCashbackAmount, setVipCashbackAmount] = useState('');",
  'VIP checkout state',
);

replaceOnce(
  "      api.request('/v1/customer/me/addresses', { auth: true }),",
  "      api.request('/v1/customer/me/addresses', { auth: true }),\n      api.request('/v1/customer/vip/rewards', { auth: true }).catch(() => null),",
  'VIP rewards bootstrap request',
);

replaceOnce(
  "]).then(([c, p, d, a]) => {",
  "]).then(([c, p, d, a, r]) => {",
  'VIP rewards bootstrap tuple',
);

replaceOnce(
  "      const addresses = a.data.addresses || [];\n      setSavedAddresses(addresses);",
  "      const addresses = a.data.addresses || [];\n      setSavedAddresses(addresses);\n      setVipRewards(r?.data?.rewards || null);\n      setVipRedemptionPolicy(r?.data?.redemption_policy || null);",
  'VIP rewards bootstrap state',
);

replaceOnce(
  "  const currentTotal = cart.totals?.grand_total ?? cart.totals?.subtotal ?? 0;",
  "  const currentTotal = cart.totals?.grand_total ?? cart.totals?.subtotal ?? 0;\n  const vipBalance = Math.max(0, Number(vipRewards?.balance || 0));\n  const vipPolicyEnabled = Boolean(vipRedemptionPolicy?.enabled);\n  const vipMaxPercent = Math.max(0, Math.min(100, Number(vipRedemptionPolicy?.max_percent ?? 100)));\n  const vipMinAmount = Math.max(0, Number(vipRedemptionPolicy?.min_amount || 0));\n  const vipCashbackValue = Number.isFinite(Number(vipCashbackAmount)) ? Math.max(0, Number(vipCashbackAmount)) : 0;\n  const vipSuggestedMax = Math.max(0, Math.min(vipBalance, Number(currentTotal || 0) * vipMaxPercent / 100));\n  const vipCanRedeem = vipPolicyEnabled && vipSuggestedMax > 0 && (vipMinAmount <= 0 || vipSuggestedMax >= vipMinAmount);\n  const vipEstimatedPayable = Math.max(0, Number(currentTotal || 0) - Math.min(vipCashbackValue, vipSuggestedMax));",
  'VIP checkout display calculations',
);

replaceOnce(
  "\n\n  const submit = async (e) => {",
  "\n\n  const refreshVipRewards = async () => {\n    try {\n      const latest = await api.request('/v1/customer/vip/rewards', { auth: true });\n      setVipRewards(latest?.data?.rewards || null);\n      setVipRedemptionPolicy(latest?.data?.redemption_policy || null);\n      return latest;\n    } catch { return null; }\n  };\n\n  const submit = async (e) => {",
  'VIP rewards refresh helper',
);

replaceOnce(
  "        customer_note: note.trim() || undefined,\n        shipping_address: needsAddress ? { ...shipping, country_code: (shipping.country_code || '').toUpperCase() } : undefined,",
  "        customer_note: note.trim() || undefined,\n        vip_cashback_amount: vipCashbackValue > 0 ? vipCashbackValue : undefined,\n        shipping_address: needsAddress ? { ...shipping, country_code: (shipping.country_code || '').toUpperCase() } : undefined,",
  'VIP checkout request amount',
);

replaceOnce(
  "      const orderRef = result.data.order.id;\n      setCart(null);\n      if (isTokenPayMethod(selectedPaymentMethod)) {",
  "      const orderRef = result.data.order.id;\n      const serverPaymentStatus = String(result.data.order.payment_status || '').toUpperCase();\n      setCart(null);\n      if (serverPaymentStatus === 'PAID') {\n        go(`/orders/${encodeURIComponent(orderRef)}`, result.data.vip_redemption ? { vip_cashback: 'applied' } : undefined);\n        return;\n      }\n      if (isTokenPayMethod(selectedPaymentMethod)) {",
  'server-paid checkout bypasses hosted payment',
);

replaceOnce(
  "    } catch (error) { setToast(checkoutErrorMessage(error)); } finally { setBusy(false); }",
  "    } catch (error) {\n      if (['VIP_REDEMPTION_DISABLED','VIP_REDEMPTION_MINIMUM_NOT_MET','VIP_REDEMPTION_EXCEEDS_LIMIT','VIP_REWARD_BALANCE_INSUFFICIENT','VIP_REWARD_SOURCES_INSUFFICIENT'].includes(error?.code)) {\n        setVipCashbackAmount('');\n        await refreshVipRewards();\n      }\n      setToast(checkoutErrorMessage(error));\n    } finally { setBusy(false); }",
  'VIP checkout stale-state recovery',
);

const paymentSection = `          <section className="form-card commerce-checkout-card checkout-pro-compact-card" data-testid="checkout-payment-method">\n            <CheckoutSelector icon="shield" title="Payment" value={selectedPaymentMethod?.name || 'Choose payment method'} detail={paymentDetail(selectedPaymentMethod)} onClick={() => setSheet('payment')} testId="payment-method-selector" />\n          </section>`;
const vipSection = `          {vipPolicyEnabled && <section className="form-card commerce-checkout-card checkout-vip-cashback-card" data-testid="checkout-vip-cashback">\n            <div className="checkout-vip-cashback-head">\n              <CheckoutSectionTitle icon="star" title="VIP cashback" body={sectionBody('Apply available cashback to this order. The server confirms the final eligible amount during checkout.')} />\n              <Badge tone="good">Server confirmed</Badge>\n            </div>\n            <div className="checkout-vip-balance-row"><span>Available balance</span><strong>{money(vipBalance, vipRewards?.currency || cart.currency || tenant?.currency, tenant?.locale)}</strong></div>\n            <div className="checkout-vip-redemption-control">\n              <label><span>Cashback to use</span><input data-testid="vip-cashback-amount" type="number" min="0" step="0.01" inputMode="decimal" value={vipCashbackAmount} disabled={!vipCanRedeem} onChange={(event) => setVipCashbackAmount(event.target.value)} placeholder={vipCanRedeem ? '0.00' : 'Not available'} /></label>\n              <button type="button" className="btn btn-secondary checkout-vip-max-btn" disabled={!vipCanRedeem} onClick={() => setVipCashbackAmount(String(Number(vipSuggestedMax.toFixed(4))))}>Use maximum</button>\n            </div>\n            <div className="checkout-vip-policy-note">Store policy allows up to <strong>{vipMaxPercent}%</strong> of the server-calculated payable total{vipMinAmount > 0 ? <> with a minimum redemption of <strong>{money(vipMinAmount, vipRewards?.currency || cart.currency || tenant?.currency, tenant?.locale)}</strong></> : null}. The amount shown here is an estimate from the current cart; Backend rechecks balance, expiry, promotions, delivery and the policy inside the order transaction.</div>\n            {vipCashbackValue > 0 && <div className="checkout-vip-estimate"><span>Cart estimate after cashback</span><strong>{money(vipEstimatedPayable, cart.currency || tenant?.currency, tenant?.locale)}</strong></div>}\n            {!vipCanRedeem && vipBalance > 0 && vipMinAmount > vipSuggestedMax && <div className="checkout-vip-unavailable">Your current server-confirmed balance or cart amount does not meet this store’s minimum redemption.</div>}\n          </section>}\n\n${paymentSection}`;
replaceOnce(paymentSection, vipSection, 'VIP cashback checkout UI');

fs.writeFileSync(path, source);
console.log('Applied VIP Cashback Redemption v1 checkout patch.');
