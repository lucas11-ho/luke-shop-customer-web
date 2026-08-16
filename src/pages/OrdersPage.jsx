import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { useCart } from '../cart/CartContext.jsx';
import { useStore } from '../store/StoreContext.jsx';
import { Empty, ErrorState, money, formatDate, Toast } from '../components/UI.jsx';
import { LineSkeleton } from '../components/Skeleton.jsx';
import { StatusBadge, resolveVisualPack, resolveStatusIconOverrides } from '../components/StatusVisuals.jsx';
import { reorderItems, canReorder } from '../cart/reorder.js';
import { Icon } from '../components/icons.jsx';
import { go } from '../app/router.js';

export function OrdersPage() {
  const { api, isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const { tenant, experience } = useStore();
  const pack = resolveVisualPack(experience);
  const statusIcons = resolveStatusIconOverrides(experience);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [toast, setToast] = useState('');

  const load = async () => {
    if (!isAuthenticated) { setLoading(false); return; }
    setLoading(true);
    try { const d = await api.request('/v1/customer/orders', { auth: true }); setOrders(d.data.orders || []); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [isAuthenticated]);

  const orderAgain = async (o, e) => {
    e.stopPropagation();
    setBusyId(o.id);
    try {
      const d = await api.request(`/v1/customer/orders/${encodeURIComponent(o.id)}`, { auth: true });
      const res = await reorderItems({ addItem, order: d.data.order });
      if (res.failed.length === 0) { setToast('Added to your cart'); setTimeout(() => go('/cart'), 700); }
      else setToast(`${res.added} of ${res.total} added — some items changed`);
    } catch (err) { setToast(err.message); } finally { setBusyId(''); }
  };

  if (!isAuthenticated) {
    return <section className="section"><Empty icon="receipt" title="Sign in to see your orders" body="Track deliveries and reorder in a tap." action={<button className="btn btn-primary" onClick={() => go('/login', { next: '/orders' })}>Sign in</button>} /></section>;
  }

  return (
    <section className="section" data-testid="orders-page">
      <div className="section-head"><div><span className="eyebrow">Account</span><h1>Orders</h1></div></div>
      {loading
        ? <LineSkeleton rows={4} />
        : error
          ? <ErrorState code={error} message={error} onRetry={load} />
          : orders.length
            ? (
              <div className="order-list">
                {orders.map((o) => (
                  <div className="order-card-wrap" key={o.id}>
                    <button className="order-card" onClick={() => go(`/orders/${encodeURIComponent(o.id)}`)} data-testid="order-card">
                      <div className="order-card-top">
                        <div className="order-card-ref">
                          <strong>{o.order_number}</strong>
                          <span>{o.store_name}{o.item_count != null ? ` · ${o.item_count} item${o.item_count === 1 ? '' : 's'}` : ''}</span>
                        </div>
                        <StatusBadge status={o.status} visualPack={pack} iconOverrides={statusIcons} />
                      </div>
                      <div className="order-card-bottom">
                        <span className="order-card-date"><Icon name="clock" size={14} /> {formatDate(o.created_at, tenant?.locale)}</span>
                        <div className="order-card-right">
                          <strong>{money(o.grand_total, o.currency, tenant?.locale)}</strong>
                          <Icon name="chevron-right" size={16} className="order-card-chevron" />
                        </div>
                      </div>
                    </button>
                    {canReorder(o.status) && (
                      <button className="order-again-btn" disabled={busyId === o.id} onClick={(e) => orderAgain(o, e)} data-testid="order-again-list">
                        <Icon name="bag" size={15} /> {busyId === o.id ? 'Adding…' : 'Order again'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )
            : <Empty icon="bag" title="No orders yet" body="Your purchases will appear here." action={<button className="btn btn-primary" onClick={() => go('/explore')}>Explore products</button>} />}
      <Toast message={toast} type={toast.includes('changed') ? 'bad' : 'good'} onClose={() => setToast('')} />
    </section>
  );
}
