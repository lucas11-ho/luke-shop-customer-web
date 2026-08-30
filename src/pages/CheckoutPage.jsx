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
const PHYSICAL_MODES = ['SHIPPING', 'LOCAL_DELIVERY', 'PICKUP'];
const DIGITAL_MODES = ['DIGITAL_ACCESS', 'DIGITAL_DOWNLOAD'];

function CheckoutSectionTitle({ icon, title, body }) {
  return <div className="commerce-checkout-section-title"><span><Icon name={icon} size={18} /></span><div><h2>{title}</h2>{body && <p className="muted">{body}</p>}</div></div>;
}

function CheckoutSelector({ icon, title, value, detail, onClick, testId }) {
  return <button type="button" className="checkout-pro-selector" onClick={onClick} data-testid={testId}>
    <span className="checkout-pro-selector-icon"><Icon name={icon} size={19} /></span>
    <span className="checkout-pro-selector-copy"><small>{title}</small><strong>{value}</strong>{detail && <span>{detail}</span>}</span>
    <span className="checkout-pro-selector-action">Change <Icon name="chevron-right" size={17} /></span>
  </button>;
}

function CheckoutChoiceSheet({ open, title, subtitle, options, selectedId, onChoose, onClose, icon = 'sliders', testId }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.classList.add('checkout-sheet-open');
    return () => { document.removeEventListener('keydown', onKey); document.body.classList.remove('checkout-sheet-open'); };
  }, [open, onClose]);
  if (!open) return null;
  return <div className="checkout-pro-sheet-backdrop" onMouseDown={onClose} data-testid={testId}>
    <section className="checkout-pro-sheet" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
      <div className="checkout-pro-sheet-handle" aria-hidden="true" />
      <header className="checkout-pro-sheet-header">
        <div><span className="checkout-pro-sheet-icon"><Icon name={icon} size={20} /></span><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div></div>
        <button type="button" className="checkout-pro-sheet-close" onClick={onClose} aria-label="Close"><Icon name="x" size={19} /></button>
      </header>
      <div className="checkout-pro-sheet-options">
        {options.map((option) => <button type="button" key={option.id} className={`checkout-pro-sheet-option ${selectedId === option.id ? 'selected' : ''}`} onClick={() => { onChoose(option.id); onClose(); }}>
          <span className="checkout-pro-sheet-radio">{selectedId === option.id && <Icon name="check" size={15} />}</span>
          <span><strong>{option.label}</strong>{option.detail && <small>{option.detail}</small>}{option.meta && <em>{option.meta}</em>}</span>
        </button>)}
      </div>
    </section>
  </div>;
}

function DigitalAccessSheet({ open, items, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.classList.add('checkout-sheet-open');
    return () => { document.removeEventListener('keydown', onKey); document.body.classList.remove('checkout-sheet-open'); };
  }, [open, onClose]);
  if (!open) return null;
  return <div className="checkout-pro-sheet-backdrop" onMouseDown={onClose} data-testid="digital-access-sheet">
    <section className="checkout-pro-sheet" role="dialog" aria-modal="true" aria-label="Digital access" onMouseDown={(event) => event.stopPropagation()}>
      <div className="checkout-pro-sheet-handle" aria-hidden="true" />
      <header className="checkout-pro-sheet-header">
        <div><span className="checkout-pro-sheet-icon"><Icon name="lock" size={20} /></span><div><h2>Digital access</h2><p>Access is released only after the server confirms payment.</p></div></div>
        <button type="button" className="checkout-pro-sheet-close" onClick={onClose} aria-label="Close"><Icon name="x" size={19} /></button>
      </header>
      <div className="checkout-pro-digital-list">
        {items.map((item) => <div className="checkout-pro-digital-item" key={item.public_id}>
          <span className="checkout-pro-digital-icon"><Icon name={item.fulfillment_mode === 'DIGITAL_DOWNLOAD' ? 'download' : 'shield'} size={18} /></span>
          <span><strong>{item.title_snapshot}</strong><small>{item.fulfillment_mode === 'DIGITAL_DOWNLOAD' ? 'Protected download after purchase' : 'Secure access in My Library'}</small></span>
        </div>)}
      </div>
      <div className="checkout-pro-sheet-note"><Icon name="info" size={17} /> Digital products do not require shipping, pickup, or a delivery address.</div>
    </section>
  </div>;
}

function deliveryQuoteAddressReady(address) {
  return Boolean(address?.recipient_name?.trim() && /^[A-Z]{2}$/.test(String(address?.country_code || '').trim().toUpperCase()) && address?.city?.trim() && address?.address_line_1?.trim());
}

function deliveryQuoteErrorMessage(error) {
  if (error?.code === 'DELIVERY_ZONE_UNAVAILABLE') return 'This delivery method is not available for this address. Choose another method or update the delivery address.';
  if (error?.code === 'DELIVERY_ZONE_MIN_ORDER') return 'Your cart does not meet the minimum order for this delivery zone.';
  if (error?.code === 'DELIVERY_MIN_ORDER') return 'Your cart does not meet the minimum order for this delivery method.';
  if (error?.code === 'DELIVERY_METHOD_NOT_FOUND') return 'That delivery method is no longer available. Choose another delivery method.';
  return error?.message || 'The delivery quote could not be refreshed. Checkout will still validate the address and fee on the server.';
}

function checkoutErrorMessage(error) {
  if (error?.code === 'FULFILLMENT_MODE_NOT_AVAILABLE') return 'A product access or delivery option changed. Refresh your cart and try again.';
  if (error?.code === 'CONSTRAINT_VIOLATION') return 'This order could not be placed because a product setting changed. Refresh your cart and try again.';
  if (error?.code === 'PAYMENT_METHOD_NOT_AVAILABLE') return 'That payment method is no longer available. Choose another payment method.';
  if (['DELIVERY_ZONE_UNAVAILABLE', 'DELIVERY_ZONE_MIN_ORDER', 'DELIVERY_MIN_ORDER', 'DELIVERY_METHOD_NOT_FOUND'].includes(error?.code)) return deliveryQuoteErrorMessage(error);
  return error?.message || 'We could not place your order. Please try again.';
}

function etaLabel(minimum, maximum) {
  if (minimum == null && maximum == null) return '';
  if (minimum != null && (maximum == null || Number(minimum) === Number(maximum))) return `${minimum} min`;
  if (minimum == null) return `Up to ${maximum} min`;
  return `${minimum}-${maximum} min`;
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
  const [sheet, setSheet] = useState('');
  const [orderOpen, setOrderOpen] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [deliveryQuote, setDeliveryQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState('');

  const needsAddress = useMemo(() => cart?.items?.some((i) => ['SHIPPING', 'LOCAL_DELIVERY'].includes(i.fulfillment_mode)), [cart]);
  const physicalMode = cart?.items?.find((i) => PHYSICAL_MODES.includes(i.fulfillment_mode))?.fulfillment_mode;
  const digitalItems = useMemo(() => cart?.items?.filter((i) => DIGITAL_MODES.includes(i.fulfillment_mode)) || [], [cart]);
  const sectionBody = (value) => presentation.show_section_descriptions ? value : '';
  const showExtras = presentation.show_promotion_code || presentation.show_order_note || presentation.show_support;
  const eligibleDelivery = physicalMode ? deliveryMethods.filter((d) => d.fulfillment_mode === physicalMode) : [];
  const selectedDeliveryMethod = eligibleDelivery.find((method) => method.id === delivery) || null;
  const selectedPaymentMethod = paymentMethods.find((method) => method.id === payment) || null;
  const preparedQuoteAddress = prepareAddressForPolicy(address, addressPolicy);
  const quoteAddress = { ...preparedQuoteAddress, country_code: String(preparedQuoteAddress.country_code || '').toUpperCase() };
  const quoteReady = Boolean(needsAddress && selectedDeliveryMethod && deliveryQuoteAddressReady(quoteAddress));

  useEffect(() => { setAddress((a) => prepareAddressForPolicy(a, addressPolicy)); }, [addressPolicy.label, addressPolicy.country_code, addressPolicy.address_line_2, addressPolicy.postal_code, addressPolicy.default_country_code]);
  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    Promise.all([
      refresh(),
      publicApi.request('/v1/storefront/payment-methods'),
      publicApi.request('/v1/storefront/delivery-methods'),
      api.request('/v1/customer/me/addresses', { auth: true }),
    ]).then(([c, p, d, a]) => {
      const methods = p.data.payment_methods || [];
      const deliveryOptions = d.data.delivery_methods || [];
      setPaymentMethods(methods);
      setDeliveryMethods(deliveryOptions);
      setPayment(methods[0]?.id || '');
      const cartPhysicalMode = c?.items?.find((i) => PHYSICAL_MODES.includes(i.fulfillment_mode))?.fulfillment_mode;
      const match = deliveryOptions.find((x) => x.fulfillment_mode === cartPhysicalMode);
      setDelivery(match?.id || '');
      const addresses = a.data.addresses || [];
      setSavedAddresses(addresses);
      const preferred = addresses.find((x) => x.is_default) || addresses[0];
      if (preferred) {
        setAddressMode('saved');
        setSelectedAddress(preferred.id);
        setAddress(prepareAddressForPolicy(fromSaved(preferred), addressPolicy));
      }
    }).catch((error) => setToast(checkoutErrorMessage(error))).finally(() => setLoading(false));
  }, [isAuthenticated]);

  useEffect(() => {
    let cancelled = false;
    let timer = null;
    setDeliveryQuote(null);
    setQuoteError('');
    if (!isAuthenticated || !quoteReady || !selectedDeliveryMethod) { setQuoteLoading(false); return () => { cancelled = true; }; }
    timer = window.setTimeout(async () => {
      setQuoteLoading(true);
      try {
        const result = await api.request('/v1/customer/delivery/quote', {
          method: 'POST',
          body: { delivery_method_id: selectedDeliveryMethod.id, shipping_address: quoteAddress },
          auth: true,
        });
        if (!cancelled) setDeliveryQuote(result?.data?.delivery_quote || null);
      } catch (error) {
        if (!cancelled) { setDeliveryQuote(null); setQuoteError(deliveryQuoteErrorMessage(error)); }
      } finally {
        if (!cancelled) setQuoteLoading(false);
      }
    }, 350);
    return () => { cancelled = true; if (timer) window.clearTimeout(timer); };
  }, [isAuthenticated, quoteReady, delivery, quoteAddress.recipient_name, quoteAddress.country_code, quoteAddress.state, quoteAddress.city, quoteAddress.postal_code, quoteAddress.address_line_1, quoteAddress.address_line_2, quoteAddress.latitude, quoteAddress.longitude, cart?.totals?.subtotal]);

  if (!isAuthenticated) return <section className="section"><Empty title="Sign in to checkout" action={<button className="btn btn-primary" onClick={() => go('/login', { next: '/checkout' })}>Sign in</button>} /></section>;
  if (loading) return <Spinner />;
  if (!cart?.items?.length) return <section className="section"><Empty title="Your cart is empty" action={<button className="btn btn-primary" onClick={() => go('/explore')}>Explore</button>} /></section>;

  const itemCount = cart.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const currentTotal = cart.totals?.grand_total ?? cart.totals?.subtotal ?? 0;
  const digitalAccessLabel = digitalItems.length === 0 ? '' : digitalItems.every((item) => item.fulfillment_mode === 'DIGITAL_DOWNLOAD') ? 'Protected download after purchase' : digitalItems.every((item) => item.fulfillment_mode === 'DIGITAL_ACCESS') ? 'Secure access in My Library' : 'Secure library & download access';
  const paymentDetail = (method) => !method ? 'Choose a payment method' : isTokenPayMethod(method) ? `Secure hosted payment · ${method.public_config?.chain || ''} ${method.public_config?.currency || ''}`.trim() : (method.instructions || method.provider_type || 'Merchant-enabled payment');
  const selectedQuote = deliveryQuote?.delivery_method_id === selectedDeliveryMethod?.id ? deliveryQuote : null;
  const deliveryDetail = (method) => {
    if (!method) return 'Choose an available method';
    if (method.id === selectedDeliveryMethod?.id && selectedQuote) {
      const eta = etaLabel(selectedQuote.estimated_min_minutes, selectedQuote.estimated_max_minutes);
      return `${money(selectedQuote.delivery_total, selectedQuote.currency || tenant?.currency, tenant?.locale)}${eta ? ` · ${eta}` : ''}`;
    }
    if (method.pricing_mode === 'ZONE_AWARE') return `Address-based rate${method.estimated_min_minutes != null ? ` · ETA confirmed after address` : ''}`;
    return `${money(method.flat_fee, tenant?.currency, tenant?.locale)}${method.estimated_min_minutes != null ? ` · ${etaLabel(method.estimated_min_minutes, method.estimated_max_minutes)}` : ''}`;
  };
  const quoteSourceLabel = selectedQuote?.zone?.name ? `Zone · ${selectedQuote.zone.name}` : selectedQuote?.pricing_source === 'BASELINE_FALLBACK' ? 'Baseline fallback' : selectedQuote?.pricing_source === 'ZONE_RATE' ? 'Zone rate' : 'Baseline rate';
  const deliveryOptions = eligibleDelivery.map((method) => ({ id: method.id, label: method.name, detail: deliveryDetail(method), meta: method.fulfillment_mode.replaceAll('_', ' ') }));
  const paymentOptions = paymentMethods.map((method) => ({ id: method.id, label: method.name, detail: paymentDetail(method), meta: isTokenPayMethod(method) ? 'Secure hosted payment' : (method.provider_type || 'Payment method') }));
  const updateAddress = (key, value) => setAddress((a) => prepareAddressForPolicy({ ...a, [key]: value }, addressPolicy));
  const chooseSaved = (id) => { setSelectedAddress(id); const found = savedAddresses.find((x) => x.id === id); if (found) setAddress(prepareAddressForPolicy(fromSaved(found), addressPolicy)); };
  const useManual = () => { setAddressMode('manual'); setSelectedAddress(''); setAddress(prepareAddressForPolicy(emptyAddress, addressPolicy)); };
  const applyDetected = (detected) => setAddress((a) => prepareAddressForPolicy({ ...a, formatted_address: detected.formatted_address || a.formatted_address, address_line_1: detected.address_line_1 || a.address_line_1, address_line_2: detected.address_line_2 ?? a.address_line_2, city: detected.city || a.city, state: detected.state ?? a.state, postal_code: detected.postal_code ?? a.postal_code, country_code: detected.country_code || a.country_code }, addressPolicy));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setToast('');
    try {
      if (!payment) throw new Error('Choose a payment method before placing your order.');
      if (physicalMode && eligibleDelivery.length > 0 && !delivery) throw new Error('Choose a delivery method before placing your order.');
      const shipping = prepareAddressForPolicy(address, addressPolicy);
      if (needsAddress && addressPolicy.country_code === false && !shipping.country_code) throw new Error('Choose the delivery point on the map so Luke can determine the country.');
      const body = {
        idempotency_key: `web-${Date.now()}-${crypto.randomUUID()}`,
        payment_method_id: payment || undefined,
        delivery_method_id: physicalMode ? (delivery || undefined) : undefined,
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
    } catch (error) { setToast(checkoutErrorMessage(error)); } finally { setBusy(false); }
  };

  return (
    <section className={`section checkout commerce-checkout-v4 checkout-pro-v1 checkout-layout-${presentation.layout} checkout-summary-${presentation.summary_style} checkout-sections-${presentation.section_style} checkout-addresses-${presentation.saved_address_style}`} data-testid="checkout-page" data-commerce-surface="checkout-v4" data-checkout-layout={presentation.layout} data-checkout-section-style={presentation.section_style}>
      <header className="commerce-checkout-hero checkout-pro-hero">
        <div>
          <button type="button" className="commerce-back-link" onClick={() => go('/cart')}><Icon name="arrow-left" size={14} /> Back to cart</button>
          <span className="eyebrow">Secure checkout</span>
          <h1>Checkout</h1>
          <p>Review your order, choose how it is fulfilled, then place it once at the end.</p>
        </div>
        {presentation.show_trust && <div className="commerce-checkout-trust"><Icon name="shield" size={19} /><span><strong>Server-confirmed order</strong><small>Final fees, discounts and payment state are validated by Shope.</small></span></div>}
      </header>

      <form className="checkout-layout commerce-checkout-layout checkout-pro-layout" onSubmit={submit}>
        <div className="checkout-main commerce-checkout-main checkout-pro-main">
          <section className="form-card commerce-checkout-card checkout-pro-order-card" data-testid="checkout-order-summary">
            <button type="button" className="checkout-pro-order-toggle" onClick={() => setOrderOpen((value) => !value)} aria-expanded={orderOpen}>
              <span className="checkout-pro-selector-icon"><Icon name="receipt" size={19} /></span>
              <span className="checkout-pro-selector-copy"><small>Your order</small><strong>{itemCount} {itemCount === 1 ? 'item' : 'items'} · {money(currentTotal, cart.currency, tenant?.locale)}</strong><span>{orderOpen ? 'Hide order details' : 'View order details'}</span></span>
              <Icon name={orderOpen ? 'chevron-down' : 'chevron-right'} size={18} />
            </button>
            {orderOpen && <div className="checkout-pro-order-details">
              <div className="commerce-checkout-lines">{cart.items.map((item) => <div className="checkout-line" key={item.public_id}><span><small>{item.quantity} ×</small> {item.title_snapshot}</span><strong>{money(item.line_total, item.currency, tenant?.locale)}</strong></div>)}</div>
              <hr />
              <div className="checkout-pro-total-line"><span>Current cart total</span><strong>{money(currentTotal, cart.currency, tenant?.locale)}</strong></div>
            </div>}
          </section>

          {digitalItems.length > 0 && <section className="form-card commerce-checkout-card checkout-pro-compact-card" data-testid="checkout-digital-access">
            <CheckoutSelector icon="lock" title="Digital access" value={digitalAccessLabel} detail="Available after payment is confirmed" onClick={() => setSheet('digital')} testId="digital-access-selector" />
          </section>}

          {eligibleDelivery.length > 0 && <section className="form-card commerce-checkout-card checkout-pro-compact-card" data-testid="checkout-delivery-method">
            <CheckoutSelector icon="truck" title="Delivery method" value={selectedDeliveryMethod?.name || 'Choose delivery method'} detail={deliveryDetail(selectedDeliveryMethod)} onClick={() => setSheet('delivery')} testId="delivery-method-selector" />
          </section>}

          {needsAddress && <section className="form-card commerce-checkout-card checkout-pro-address-card">
            <div className="card-title-row">
              <CheckoutSectionTitle icon="map-pin" title="Delivery address" body={sectionBody('Use a saved delivery address or enter another one.')} />
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
          </section>}

          {needsAddress && selectedDeliveryMethod && <section className={`checkout-zone-quote ${quoteError ? 'checkout-zone-quote-error' : ''} ${quoteLoading ? 'checkout-zone-quote-loading' : ''}`} data-testid="delivery-server-quote" aria-live="polite">
            <div className="checkout-zone-quote-head">
              <span><Icon name="truck" size={17} /> Delivery quote</span>
              <span className="checkout-zone-quote-status">{quoteLoading ? 'Checking' : selectedQuote ? 'Server resolved' : quoteError ? 'Needs attention' : 'Waiting for address'}</span>
            </div>
            {quoteLoading ? <div className="checkout-zone-quote-copy"><span className="checkout-zone-quote-spinner" aria-hidden="true" /> Checking this address against the selected delivery method…</div> : quoteError ? <div className="checkout-zone-quote-copy">{quoteError}</div> : selectedQuote ? <>
              <div className="checkout-zone-quote-main"><span><strong>{money(selectedQuote.delivery_total, selectedQuote.currency || tenant?.currency, tenant?.locale)}</strong><small> estimated delivery fee</small></span><small>{etaLabel(selectedQuote.estimated_min_minutes, selectedQuote.estimated_max_minutes) || 'ETA not specified'}</small></div>
              <div className="checkout-zone-quote-meta"><span><Icon name="map-pin" size={13} /> {quoteSourceLabel}</span><span><Icon name="shield" size={13} /> {selectedQuote.pricing_mode === 'ZONE_AWARE' ? 'Address-based pricing' : 'Standard pricing'}</span></div>
              {Number(selectedQuote.vip_discount || 0) > 0 && <div className="checkout-zone-quote-vip"><span>VIP delivery benefit</span><strong>−{money(selectedQuote.vip_discount, selectedQuote.currency || tenant?.currency, tenant?.locale)}</strong></div>}
              <div className="checkout-zone-quote-copy">Checkout recalculates this delivery fee on the server before creating the order, so this quote is informative rather than client-authoritative.</div>
            </> : <div className="checkout-zone-quote-copy">Complete the required delivery address fields to verify this method’s fee, ETA and availability with the server.</div>}
          </section>}

          <section className="form-card commerce-checkout-card checkout-pro-compact-card" data-testid="checkout-payment-method">
            <CheckoutSelector icon="shield" title="Payment" value={selectedPaymentMethod?.name || 'Choose payment method'} detail={paymentDetail(selectedPaymentMethod)} onClick={() => setSheet('payment')} testId="payment-method-selector" />
          </section>

          {showExtras && <section className="form-card commerce-checkout-card checkout-pro-extras-card">
            {(presentation.show_promotion_code || presentation.show_order_note) && <div className="checkout-pro-disclosures">
              {presentation.show_promotion_code && <div><button type="button" className="checkout-pro-disclosure" onClick={() => setPromoOpen((value) => !value)}><span><Icon name="tag" size={18} /> Promo code</span><Icon name={promoOpen ? 'chevron-down' : 'chevron-right'} size={17} /></button>{promoOpen && <label className="checkout-pro-disclosure-field">Promotion code<input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Optional coupon code" /></label>}</div>}
              {presentation.show_order_note && <div><button type="button" className="checkout-pro-disclosure" onClick={() => setNoteOpen((value) => !value)}><span><Icon name="edit" size={18} /> Order note</span><Icon name={noteOpen ? 'chevron-down' : 'chevron-right'} size={17} /></button>{noteOpen && <label className="checkout-pro-disclosure-field">Order note<textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note for the merchant" /></label>}</div>}
            </div>}
            {presentation.show_support && <SupportLauncher placement="checkout" />}
          </section>}

          <section className="summary-card checkout-summary commerce-checkout-summary checkout-pro-final" data-testid="checkout-final-review">
            <div className="commerce-summary-heading"><div><span className="eyebrow">Final review</span><h3>Place order</h3></div><Icon name="check-circle" size={22} /></div>
            <div className="checkout-pro-review-row"><span>Items</span><strong>{money(cart.totals?.subtotal ?? currentTotal, cart.currency, tenant?.locale)}</strong></div>
            {selectedDeliveryMethod && <div className="checkout-pro-review-row"><span>Selected delivery</span><strong>{selectedDeliveryMethod.name} · {deliveryDetail(selectedDeliveryMethod)}</strong></div>}
            {selectedQuote && <div className="checkout-pro-review-row"><span>Server delivery quote</span><strong>{money(selectedQuote.delivery_total, selectedQuote.currency || tenant?.currency, tenant?.locale)}</strong></div>}
            {selectedQuote && Number(selectedQuote.vip_discount || 0) > 0 && <div className="checkout-pro-review-row"><span>VIP delivery benefit</span><strong>−{money(selectedQuote.vip_discount, selectedQuote.currency || tenant?.currency, tenant?.locale)}</strong></div>}
            {digitalItems.length > 0 && <div className="checkout-pro-review-row"><span>Digital access</span><strong>{digitalAccessLabel}</strong></div>}
            <div className="checkout-pro-review-row"><span>Payment</span><strong>{selectedPaymentMethod?.name || 'Not selected'}</strong></div>
            <hr />
            <div className="checkout-pro-final-total"><span>Current cart total</span><strong>{money(currentTotal, cart.currency, tenant?.locale)}</strong></div>
            <p className="summary-hint">{selectedQuote ? 'The delivery estimate above is resolved by Shope Backend. Promotions and the final delivery fee are recalculated again when the order is placed.' : 'Final delivery fees and promotion discounts are confirmed by the server when the order is placed.'}</p>
            {digitalItems.length > 0 && <p className="checkout-pro-digital-assurance"><Icon name="lock" size={15} /> Secure digital access is added to My Library only after payment is confirmed.</p>}
            <button className="btn btn-primary btn-full commerce-place-order checkout-pro-place-order" disabled={busy}>{busy ? (isTokenPayMethod(selectedPaymentMethod) ? 'Opening secure payment…' : 'Placing order…') : (isTokenPayMethod(selectedPaymentMethod) ? 'Place order & pay' : 'Place order')} <Icon name="arrow-right" size={16} /></button>
            <p className="commerce-summary-assurance"><Icon name="shield" size={15} /> {isTokenPayMethod(selectedPaymentMethod) ? 'Payment opens on TokenPay only after Shope securely creates the order and signed payment session.' : 'One checkout submission creates the order through the existing idempotent server flow.'}</p>
          </section>
        </div>
      </form>

      <CheckoutChoiceSheet open={sheet === 'delivery'} title="Delivery method" subtitle="Choose from the methods valid for the fulfillment mode already selected in your cart." options={deliveryOptions} selectedId={delivery} onChoose={setDelivery} onClose={() => setSheet('')} icon="truck" testId="delivery-method-sheet" />
      <CheckoutChoiceSheet open={sheet === 'payment'} title="Payment method" subtitle="Choose from payment methods enabled by this storefront." options={paymentOptions} selectedId={payment} onChoose={setPayment} onClose={() => setSheet('')} icon="shield" testId="payment-method-sheet" />
      <DigitalAccessSheet open={sheet === 'digital'} items={digitalItems} onClose={() => setSheet('')} />
      <Toast message={toast} type="bad" onClose={() => setToast('')} />
    </section>
  );
}
