import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { useCart } from '../cart/CartContext.jsx';
import { useStore } from '../store/StoreContext.jsx';
import { Spinner, Empty, money, Toast, Badge } from '../components/UI.jsx';
import { SupportLauncher } from '../components/SupportLauncher.jsx';
import { LocationCapture } from '../components/DeliveryLocation.jsx';
import { Icon } from '../components/icons.jsx';
import { resolveAddressFieldPolicy, prepareAddressForPolicy, addressSummaryParts } from '../address/addressPolicy.js';
import { resolveCheckoutExperience } from '../commerce/cartCheckoutExperience.js';
import { createHostedPaymentSession, isTokenPayMethod, redirectToHostedPayment } from '../commerce/paymentGateway.js';
import { go } from '../app/router.js';

const emptyAddress = { recipient_name: '', phone: '', country_code: '', state: '', city: '', postal_code: '', address_line_1: '', address_line_2: '', delivery_note: '', formatted_address: '', latitude: null, longitude: null, accuracy_meters: null, location_source: null, location_updated_at: null };
const fromSaved = (a) => ({ recipient_name: a?.recipient_name || '', phone: a?.phone || '', country_code: a?.country_code || '', state: a?.state || '', city: a?.city || '', postal_code: a?.postal_code || '', address_line_1: a?.address_line_1 || '', address_line_2: a?.address_line_2 || '', delivery_note: a?.delivery_note || '', formatted_address: a?.formatted_address || '', latitude: a?.latitude ?? null, longitude: a?.longitude ?? null, accuracy_meters: a?.accuracy_meters ?? null, location_source: a?.location_source || null, location_updated_at: a?.location_updated_at || null });

function CheckoutSectionTitle({ icon, title, body }) {
  return <div className="commerce-checkout-section-title"><span><Icon name={icon} size={18} /></span><div><h2>{title}</h2>{body && <p className="muted">{body}</p>}</div></div>;
}

export function CheckoutPage() {
  const { api, isAuthenticated } = useAuth();
  const { cart, refresh, setCart } = useCart();
  const { tenant, store, experience, publicApi } = useStore();
  const addressPolicy = useMemo(() => resolveAddressFieldPolicy(experience, tenant, store), [experience, tenant, store]);
  const presentation = useMemo(() => resolveCheckoutExperience(experience), [experience]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [deliveryMethods, setDeliveryMethods] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [payment, setPayment] = useState('');
  const [delivery, setDelivery] = useState('');
  const [promo, setPromo] = useState('');
  const [note, setNote] = useState('');
  const [address, setAddress] = useState(() => prepareAddressForPolicy(emptyAddress, addressPolicy));
  const [addressMode, setAddressMode] = useState('manual');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  const needsAddress = useMemo(() => cart?.items?.some((i) => ['SHIPPING', 'LOCAL_DELIVERY'].includes(i.fulfillment_mode)), [cart]);
  const physicalMode = cart?.items?.find((i) => ['SHIPPING', 'LOCAL_DELIVERY', 'PICKUP'].includes(i.fulfillment_mode))?.fulfillment_mode;
  const sectionBody = (value) => presentation.show_section_descriptions ? value : '';
  const showExtras = presentation.show_promotion_code || presentation.show_order_note || presentation.show_support;

  useEffect(() => { setAddress((a) => prepareAddressForPolicy(a, addressPolicy)); }, [addressPolicy.label, addressPolicy.country_code, addressPolicy.address_line_2, addressPolicy.postal_code, addressPolicy.default_country_code]);
  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    Promise.all([
      refresh(),
      publicApi.request('/v1/storefront/payment-methods'),
      publicApi.request('/v1/storefront/delivery-methods'),
      api.request('/v1/customer/me/addresses', { auth: true }),
    ]).then(([c, p, d, a]) => {
      setPaymentMethods(p.data.payment_methods || []);
      setDeliveryMethods(d.data.delivery_methods || []);
      setPayment(p.data.payment_methods?.[0]?.id || '');
      const match = (d.data.delivery_methods || []).find((x) => x.fulfillment_mode === c?.items?.find((i) => ['SHIPPING', 'LOCAL_DELIVERY', 'PICKUP'].includes(i.fulfillment_mode))?.fulfillment_mode);
      setDelivery(match?.id || '');
      const addresses = a.data.addresses || [];
      setSavedAddresses(addresses);
      const preferred = addresses.find((x) => x.is_default) || addresses[0];
      if (preferred) {
        setAddressMode('saved');
        setSelectedAddress(preferred.id);
        setAddress(prepareAddressForPolicy(fromSaved(preferred), addressPolicy));
      }
    }).catch((e) => setToast(e.message)).finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) return <section className="section"><Empty title="Sign in to checkout" action={<button className="btn btn-primary" onClick={() => go('/login', { next: '/checkout' })}>Sign in</button>} /></section>;
  if (loading) return <Spinner />;
  if (!cart?.items?.length) return <section className="section"><Empty title="Your cart is empty" action={<button className="btn btn-primary" onClick={() => go('/explore')}>Explore</button>} /></section>;

  const eligibleDelivery = deliveryMethods.filter((d) => !physicalMode || d.fulfillment_mode === physicalMode);
  const selectedPaymentMethod = paymentMethods.find((method) => method.id === payment) || null;
  const updateAddress = (key, value) => setAddress((a) => prepareAddressForPolicy({ ...a, [key]: value }, addressPolicy));
  const chooseSaved = (id) => { setSelectedAddress(id); const found = savedAddresses.find((x) => x.id === id); if (found) setAddress(prepareAddressForPolicy(fromSaved(found), addressPolicy)); };
  const useManual = () => { setAddressMode('manual'); setSelectedAddress(''); setAddress(prepareAddressForPolicy(emptyAddress, addressPolicy)); };
  const applyDetected = (detected) => setAddress((a) => prepareAddressForPolicy({ ...a, formatted_address: detected.formatted_address || a.formatted_address, address_line_1: detected.address_line_1 || a.address_line_1, address_line_2: detected.address_line_2 ?? a.address_line_2, city: detected.city || a.city, state: detected.state ?? a.state, postal_code: detected.postal_code ?? a.postal_code, country_code: detected.country_code || a.country_code }, addressPolicy));
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setToast('');
    try {
      const shipping = prepareAddressForPolicy(address, addressPolicy);
      if (needsAddress && addressPolicy.country_code === false && !shipping.country_code) throw new Error('Choose the delivery point on the map so Luke can determine the country.');
      const body = {
        idempotency_key: `web-${Date.now()}-${crypto.randomUUID()}`,
        payment_method_id: payment || undefined,
        delivery_method_id: delivery || undefined,
        promotion_code: promo.trim() || undefined,
        customer_note: note.trim() || undefined,
        shipping_address: needsAddress ? { ...shipping, country_code: (shipping.country_code || '').toUpperCase() } : undefined,
      };
      const result = await api.request('/v1/customer/checkout', { method: 'POST', body, auth: true });
      const orderRef = result.data.order.id;
      setCart(null);
      if (isTokenPayMethod(selectedPaymentMethod)) {
        try {
          const session = await createHostedPaymentSession(api, orderRef, { prefix: 'checkout-tokenpay' });
          if (session?.status === 'PAID') { go(`/orders/${encodeURIComponent(orderRef)}`); return; }
          redirectToHostedPayment(session);
          return;
        } catch (paymentError) {
          go(`/orders/${encodeURIComponent(orderRef)}`, { payment_setup: 'failed' });
          return;
        }
      }
      go(`/orders/${encodeURIComponent(orderRef)}`);
    } catch (err) { setToast(err.message); } finally { setBusy(false); }
  };

  return (
    <section className={`section checkout commerce-checkout-v4 checkout-layout-${presentation.layout} checkout-summary-${presentation.summary_style} checkout-sections-${presentation.section_style} checkout-addresses-${presentation.saved_address_style}`} data-testid="checkout-page" data-commerce-surface="checkout-v4" data-checkout-layout={presentation.layout} data-checkout-section-style={presentation.section_style}>
      <header className="commerce-checkout-hero">
        <div>
          <button type="button" className="commerce-back-link" onClick={() => go('/cart')}><Icon name="arrow-left" size={14} /> Back to cart</button>
          <span className="eyebrow">Secure checkout</span>
          <h1>Checkout</h1>
          <p>Confirm delivery, payment and order details before placing the order.</p>
        </div>
        {presentation.show_trust && <div className="commerce-checkout-trust"><Icon name="shield" size={19} /><span><strong>Server-confirmed order</strong><small>Final fees and discounts are validated when you place it.</small></span></div>}
      </header>

      <form className="checkout-layout commerce-checkout-layout" onSubmit={submit}>
        <div className="checkout-main commerce-checkout-main">
          {needsAddress && <div className="form-card commerce-checkout-card">
            <div className="card-title-row">
              <CheckoutSectionTitle icon="map-pin" title="Delivery address" body={sectionBody('Choose a saved address or enter a different delivery address for this order.')} />
              {addressMode === 'saved' && <button type="button" className="btn btn-secondary btn-small" onClick={useManual}>Use another address</button>}
            </div>
            {savedAddresses.length > 0 && addressMode === 'saved' ? <div className={`checkout-address-options commerce-address-options address-style-${presentation.saved_address_style}`}>
              {savedAddresses.map((a) => <label key={a.id} className={`checkout-address-option ${selectedAddress === a.id ? 'selected' : ''}`}>
                <input type="radio" name="saved-address" checked={selectedAddress === a.id} onChange={() => chooseSaved(a.id)} />
                <div><div className="address-option-title">{addressPolicy.label!==false && <strong>{a.label}</strong>}{a.is_default && <Badge tone="good">Default</Badge>}</div><span>{a.recipient_name}{a.phone ? ` · ${a.phone}` : ''}</span><small>{a.formatted_address || addressSummaryParts(a,addressPolicy).join(', ')}</small></div>
              </label>)}
              <button type="button" className="btn btn-secondary btn-small address-manual-button" onClick={useManual}>Enter a different address</button>
            </div> : <>
              <div className="form-grid">
                <label>Recipient<input required value={address.recipient_name} onChange={(e) => updateAddress('recipient_name', e.target.value)} /></label>
                <label>Phone<input value={address.phone} onChange={(e) => updateAddress('phone', e.target.value)} /></label>
                {addressPolicy.country_code!==false && <label>Country code<input required maxLength="2" placeholder="US" value={address.country_code} onChange={(e) => updateAddress('country_code', e.target.value.toUpperCase())} /></label>}
                <label>State / region<input value={address.state} onChange={(e) => updateAddress('state', e.target.value)} /></label>
                <label>City<input required value={address.city} onChange={(e) => updateAddress('city', e.target.value)} /></label>
                {addressPolicy.postal_code!==false && <label>Postal code<input value={address.postal_code} onChange={(e) => updateAddress('postal_code', e.target.value)} /></label>}
                <label className="span-2">Detected / formatted address<input value={address.formatted_address || ''} onChange={(e) => updateAddress('formatted_address', e.target.value)} placeholder="Map lookup can fill this automatically" /></label>
                <label className="span-2">Address line 1<input required value={address.address_line_1} onChange={(e) => updateAddress('address_line_1', e.target.value)} /></label>
                {addressPolicy.address_line_2!==false && <label className="span-2">Address line 2<input value={address.address_line_2} onChange={(e) => updateAddress('address_line_2', e.target.value)} /></label>}
                <label className="span-2">Delivery note<textarea value={address.delivery_note} onChange={(e) => updateAddress('delivery_note', e.target.value)} /></label>
              </div>
              {savedAddresses.length > 0 && <button type="button" className="link-btn checkout-saved-link" onClick={() => { setAddressMode('saved'); chooseSaved(savedAddresses.find((x) => x.is_default)?.id || savedAddresses[0].id); }}>Choose from saved addresses</button>}
            </>}
            <LocationCapture value={address} onChange={(loc) => setAddress((a) => prepareAddressForPolicy({ ...a, ...loc }, addressPolicy))} onAddressResolved={applyDetected} compact />
          </div>}

          {eligibleDelivery.length > 0 && <div className="form-card commerce-checkout-card">
            <CheckoutSectionTitle icon="truck" title="Delivery method" body={sectionBody('Available methods match the fulfillment mode already selected for your cart.')} />
            <div className="select-cards commerce-select-cards">{eligibleDelivery.map((d) => <label key={d.id} className={delivery === d.id ? 'selected' : ''}><input type="radio" name="delivery" checked={delivery === d.id} onChange={() => setDelivery(d.id)} /><div><strong>{d.name}</strong><span>{money(d.flat_fee, tenant?.currency, tenant?.locale)}{d.estimated_min_minutes != null && ` · ${d.estimated_min_minutes}-${d.estimated_max_minutes} min`}</span></div></label>)}</div>
          </div>}

          <div className="form-card commerce-checkout-card">
            <CheckoutSectionTitle icon="shield" title="Payment" body={sectionBody('Choose from the payment methods enabled for this storefront.')} />
            <div className="select-cards commerce-select-cards">{paymentMethods.map((p) => <label key={p.id} className={payment === p.id ? 'selected' : ''}><input type="radio" name="payment" checked={payment === p.id} onChange={() => setPayment(p.id)} /><div><strong>{p.name}</strong><span>{isTokenPayMethod(p) ? `Secure hosted payment · ${p.public_config?.chain || ''} ${p.public_config?.currency || ''}`.trim() : (p.instructions || p.provider_type)}</span></div></label>)}</div>
          </div>

          {showExtras && <div className="form-card commerce-checkout-card commerce-checkout-extras-card">
            <CheckoutSectionTitle icon="tag" title={presentation.show_promotion_code || presentation.show_order_note ? 'Discount & note' : 'Support'} body={sectionBody('Optional order details are sent with the same checkout request.')} />
            {(presentation.show_promotion_code || presentation.show_order_note) && <div className="commerce-checkout-extras">
              {presentation.show_promotion_code && <label>Promotion code<input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Optional coupon code" /></label>}
              {presentation.show_order_note && <label>Order note<textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note for the merchant" /></label>}
            </div>}
            {presentation.show_support && <SupportLauncher placement="checkout" />}
          </div>}
        </div>

        <aside className={`summary-card checkout-summary commerce-checkout-summary summary-${presentation.summary_style}`}>
          <div className="commerce-summary-heading"><div><span className="eyebrow">Review</span><h3>Your order</h3></div><Icon name="receipt" size={20} /></div>
          <div className="commerce-checkout-lines">{cart.items.map((item) => <div className="checkout-line" key={item.public_id}><span><small>{item.quantity} ×</small> {item.title_snapshot}</span><strong>{money(item.line_total, item.currency, tenant?.locale)}</strong></div>)}</div>
          <hr />
          <div><span>Subtotal</span><strong>{money(cart.totals.subtotal, cart.currency, tenant?.locale)}</strong></div>
          <p className="summary-hint">Delivery fees and promotion discounts are finalized by the server when you place the order.</p>
          <button className="btn btn-primary btn-full commerce-place-order" disabled={busy}>{busy ? (isTokenPayMethod(selectedPaymentMethod) ? 'Opening secure payment…' : 'Placing order…') : (isTokenPayMethod(selectedPaymentMethod) ? 'Place order & pay' : 'Place order')} <Icon name="arrow-right" size={16} /></button>
          <p className="commerce-summary-assurance"><Icon name="shield" size={15} /> {isTokenPayMethod(selectedPaymentMethod) ? 'Payment opens on TokenPay after Shope securely creates the order and signed payment session.' : 'One checkout submission creates the order through the existing idempotent server flow.'}</p>
        </aside>
      </form>
      <Toast message={toast} type="bad" onClose={() => setToast('')} />
    </section>
  );
}
