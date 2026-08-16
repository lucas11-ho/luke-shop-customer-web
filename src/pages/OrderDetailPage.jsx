import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { useCart } from '../cart/CartContext.jsx';
import { useStore } from '../store/StoreContext.jsx';
import { reorderItems, canReorder } from '../cart/reorder.js';
import { Spinner, ErrorState, Badge, money, formatDate, Toast } from '../components/UI.jsx';
import { SupportLauncher } from '../components/SupportLauncher.jsx';
import { Icon } from '../components/icons.jsx';
import {
  OrderProgress, StatusTimeline, StatusBadge, resolveVisualPack,
  statusLabel, resolveStatusIconOverrides, primaryFulfillmentMode, isTerminalFailure, isRestaurantOrder,
} from '../components/StatusVisuals.jsx';
import { DeliveryLocationCard, LiveLocationCard } from '../components/DeliveryLocation.jsx';
import { go } from '../app/router.js';

const HEADLINE = {
  OUT_FOR_DELIVERY: 'Your order is on the way.',
  SHIPPED: 'Your order has shipped.',
  PREPARING: 'Your order is being prepared.',
  READY: 'Your order is ready.',
  DELIVERED: 'Your order was delivered.',
  PICKED_UP: 'Your order was picked up.',
  COMPLETED: 'Your order is complete.',
  CANCELLED: 'This order was cancelled.',
  PAYMENT_FAILED: 'Payment could not be completed.',
  PENDING_PAYMENT: 'Waiting for payment confirmation.',
};

// Restaurant / food orders get kitchen-tuned wording.
const RESTAURANT_HEADLINE = {
  PAID: 'Order confirmed — the kitchen is on it.',
  CONFIRMED: 'Order confirmed — the kitchen is on it.',
  PREPARING: 'Your food is being prepared.',
  READY: 'Your order is ready.',
  OUT_FOR_DELIVERY: 'Your rider is on the way.',
  DELIVERED: 'Delivered — enjoy your meal!',
  PICKED_UP: 'Picked up — enjoy!',
  COMPLETED: 'Order complete — enjoy!',
};

function PrepCountdown({ estimatedAt, status, locale }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(id); }, []);
  if (!estimatedAt) return null;
  const diffMin = Math.round((new Date(estimatedAt).getTime() - now) / 60000);
  const arriving = String(status).toUpperCase() === 'OUT_FOR_DELIVERY';
  const verb = arriving ? 'Arriving' : 'Ready';
  const text = diffMin > 0 ? `${verb} in ~${diffMin} min` : (arriving ? 'Arriving any moment' : 'Ready any moment');
  return (
    <div className="prep-countdown" role="status" data-testid="prep-countdown">
      <span className="prep-ring"><Icon name="clock" size={18} /></span>
      <div><strong>{text}</strong><small>Estimated {formatDate(estimatedAt, locale)}</small></div>
    </div>
  );
}

export function OrderDetailPage({ orderRef }) {
  const { api } = useAuth();
  const { addItem } = useCart();
  const { tenant, experience } = useStore();
  const pack = resolveVisualPack(experience);
  const statusIcons = resolveStatusIconOverrides(experience);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');
  const [reordering, setReordering] = useState(false);
  const [reorderResult, setReorderResult] = useState(null);

  const load = async () => {
    setLoading(true); setError('');
    try { const d = await api.request(`/v1/customer/orders/${encodeURIComponent(orderRef)}`, { auth: true }); setOrder(d.data.order); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [orderRef]);

  if (loading) return <Spinner label="Loading your order…" />;
  if (error) return <section className="section"><ErrorState code={error} message={error} onRetry={load} /></section>;
  if (!order) return null;

  const cancel = async () => {
    if (!confirm('Cancel this order?')) return;
    setBusy(true);
    try { const d = await api.request(`/v1/customer/orders/${encodeURIComponent(order.id)}/cancel`, { method: 'POST', body: { reason: 'Customer cancelled from storefront' }, auth: true }); setOrder(d.data.order); setToast('Order cancelled'); }
    catch (e) { setToast(e.message); } finally { setBusy(false); }
  };
  const retry = async () => {
    setBusy(true);
    try { await api.request(`/v1/customer/orders/${encodeURIComponent(order.id)}/payment/retry`, { method: 'POST', body: { idempotency_key: `retry-${Date.now()}-${crypto.randomUUID()}` }, auth: true }); await load(); setToast('Payment retry created'); }
    catch (e) { setToast(e.message); } finally { setBusy(false); }
  };
  const orderAgain = async () => {
    setReordering(true); setReorderResult(null);
    try {
      const res = await reorderItems({ addItem, order });
      setReorderResult(res);
      if (res.failed.length === 0) { setToast('Items added to your cart'); setTimeout(() => go('/cart'), 700); }
      else setToast(`${res.added} of ${res.total} items added — some items changed`);
    } catch (e) { setToast(e.message); } finally { setReordering(false); }
  };

  const mode = primaryFulfillmentMode(order);
  const primaryFulfillment = (order.fulfillments || [])[0] || null;
  const headlineStatus = primaryFulfillment?.status || order.status;
  const food = isRestaurantOrder(order, pack);
  const headlineKey = String(headlineStatus).toUpperCase();
  const headlineText = (food && RESTAURANT_HEADLINE[headlineKey]) || HEADLINE[headlineKey] || `Placed ${formatDate(order.created_at, tenant?.locale)}`;
  const terminal = isTerminalFailure(order);
  const activeDelivery = !terminal && ['SHIPPED', 'OUT_FOR_DELIVERY'].includes(String(headlineStatus).toUpperCase());
  const isDelivery = ['SHIPPING', 'LOCAL_DELIVERY'].includes(mode);
  const timelineEvents = [...(order.status_history || [])].reverse();
  const address = order.shipping_address;
  const addressText = address ? [address.address_line_1, address.city, address.postal_code, address.country_code].filter(Boolean).join(', ') : '';

  return (
    <section className="section order-detail" data-testid="order-detail-page">
      <button className="back-link" onClick={() => go('/orders')}><Icon name="chevron-right" size={16} className="flip" /> All orders</button>


      <div className={`order-hero order-hero-${terminal ? 'alert' : 'active'}`} data-status-pack={pack}>
        <div>
          <span className="eyebrow">Order {order.order_number}</span>
          <h1><StatusBadge status={headlineStatus} visualPack={pack} iconOverrides={statusIcons} /></h1>
          <p>{headlineText}</p>
        </div>
        <div className="order-hero-status">
          <Badge tone={order.payment_status === 'PAID' ? 'good' : 'warn'}>{statusLabel(order.payment_status)}</Badge>
        </div>
      </div>

      {food && !terminal && ['PAID', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'].includes(headlineKey) && (primaryFulfillment?.estimated_ready_at||primaryFulfillment?.estimated_at) && (
        <PrepCountdown estimatedAt={primaryFulfillment.estimated_ready_at||primaryFulfillment.estimated_at} status={headlineStatus} locale={tenant?.locale} />
      )}

      {!terminal && <div className="form-card order-progress-card"><OrderProgress order={order} visualPack={pack} iconOverrides={statusIcons} /></div>}

      <div className="order-detail-grid">
        <div className="detail-stack">
          {(order.fulfillments?.length > 0 || isDelivery) && (
            <div className="form-card">
              <h2><Icon name={food ? 'scooter' : 'truck'} size={18} /> {food ? 'Kitchen & delivery' : 'Delivery & fulfillment'}</h2>
              {(order.fulfillments || []).map((f) => (
                <div className="fulfillment" key={f.id}>
                  <div className="detail-line">
                    <div>
                      <strong>{f.delivery_method_name || statusLabel(f.fulfillment_mode)}</strong>
                      <span>{statusLabel(f.status)}</span>
                    </div>
                    <StatusBadge status={f.status} visualPack={pack} iconOverrides={statusIcons} />
                  </div>
                  <div className="fulfillment-meta">
                    {f.carrier && <div><span>Carrier</span><strong>{f.carrier}</strong></div>}
                    {f.tracking_number && <div><span>Tracking</span><strong>{f.tracking_number}</strong></div>}
                    {(f.estimated_delivery_at||f.estimated_at) && <div><span>Estimated arrival</span><strong>{formatDate(f.estimated_delivery_at||f.estimated_at, tenant?.locale)}</strong></div>}{f.estimated_ready_at&&food&&<div><span>Estimated ready</span><strong>{formatDate(f.estimated_ready_at, tenant?.locale)}</strong></div>}
                  </div>
                  {f.tracking_url && <a className="btn btn-secondary" href={f.tracking_url} target="_blank" rel="noreferrer"><Icon name="navigation" size={16} /> Track package</a>}
                </div>
              ))}
              {!order.fulfillments?.length && <p className="muted">Fulfillment details will appear here once your order is processed.</p>}
            </div>
          )}

          {isDelivery && !terminal && (
            <DeliveryLocationCard orderRef={order.id} initialLocation={address} addressText={addressText} orderStatus={order.status} fulfillmentStatus={headlineStatus} onSaved={next=>setOrder(o=>({...o,shipping_address:{...(o.shipping_address||{}),...next}}))}/>
          )}
          {isDelivery && activeDelivery && (
            <LiveLocationCard orderRef={order.id} orderStatus={order.status} fulfillmentStatus={headlineStatus} initialSession={order.live_customer_location}/>
          )}

          <div className="form-card">
            <h2><Icon name="bag" size={18} /> Items</h2>
            {order.items.map((i) => (
              <div className="detail-line detail-item" key={i.public_id}>
                <div>
                  <strong>{i.quantity} × {i.title_snapshot}</strong>
                  {i.variant_title_snapshot && <span>{i.variant_title_snapshot}</span>}
                  {i.selected_modifiers?.length > 0 && <small>{i.selected_modifiers.map((m) => m.name).join(', ')}</small>}
                </div>
                <strong>{money(i.line_total, i.currency, tenant?.locale)}</strong>
              </div>
            ))}
          </div>

          {address && (
            <div className="form-card">
              <h2><Icon name="map-pin" size={18} /> Delivery address</h2>
              <p className="address-block">
                {address.recipient_name}<br />
                {address.address_line_1}{address.address_line_2 && <><br />{address.address_line_2}</>}<br />
                {address.city}{address.state ? `, ${address.state}` : ''} {address.postal_code || ''}<br />
                {address.country_code}
              </p>
            </div>
          )}

          <div className="form-card">
            <h2><Icon name="clock" size={18} /> Order timeline</h2>
            <StatusTimeline events={timelineEvents} visualPack={pack} iconOverrides={statusIcons} locale={tenant?.locale} formatDate={formatDate} />
          </div>
        </div>

        <aside className="summary-card">
          <h3>Payment summary</h3>
          <div><span>Subtotal</span><strong>{money(order.subtotal, order.currency, tenant?.locale)}</strong></div>
          <div><span>Discounts</span><strong>− {money(order.discount_total, order.currency, tenant?.locale)}</strong></div>
          <div><span>Delivery</span><strong>{money(order.delivery_total, order.currency, tenant?.locale)}</strong></div>
          <hr />
          <div className="summary-total"><span>Total</span><strong>{money(order.grand_total, order.currency, tenant?.locale)}</strong></div>
          {order.payment && (
            <div className="payment-box">
              <span>{order.payment.payment_method_name || 'Payment'}</span>
              <Badge tone={order.payment.status === 'PAID' ? 'good' : 'warn'}>{statusLabel(order.payment.status)}</Badge>
            </div>
          )}
          {order.status === 'PAYMENT_FAILED' && <button className="btn btn-primary btn-full" disabled={busy} onClick={retry} data-testid="retry-payment"><Icon name="cog" size={16} /> Retry payment</button>}
          {order.status === 'PENDING_PAYMENT' && <button className="btn btn-danger btn-full" disabled={busy} onClick={cancel} data-testid="cancel-order"><Icon name="x" size={16} /> Cancel order</button>}
          {canReorder(order.status) && <button className="btn btn-secondary btn-full" disabled={reordering} onClick={orderAgain} data-testid="order-again"><Icon name="bag" size={16} /> {reordering ? 'Adding…' : 'Order again'}</button>}
          {reorderResult && reorderResult.failed.length > 0 && (
            <div className="reorder-notice" data-testid="reorder-notice">
              <strong><Icon name="info" size={14} /> Some items changed</strong>
              <ul>{reorderResult.failed.map((f, i) => <li key={i}>{f.title} — {f.reason}</li>)}</ul>
              <button className="btn btn-primary btn-small" onClick={() => go('/cart')}>Go to cart</button>
            </div>
          )}
          <SupportLauncher placement="order_detail" orderRef={order?.order_number||order?.id||null} />
        </aside>
      </div>
      <Toast message={toast} type={toast.includes('cancelled') || toast.includes('created') ? 'good' : 'bad'} onClose={() => setToast('')} />
    </section>
  );
}
