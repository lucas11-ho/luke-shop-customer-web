import React, { useState } from 'react';
import { useCart } from '../cart/CartContext.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { useStore } from '../store/StoreContext.jsx';
import { Empty, money, Toast } from '../components/UI.jsx';
import { LineSkeleton } from '../components/Skeleton.jsx';
import { SafeImage } from '../components/SafeMedia.jsx';
import { Icon } from '../components/icons.jsx';
import { go } from '../app/router.js';

export function CartPage() {
  const { isAuthenticated } = useAuth();
  const { tenant } = useStore();
  const { cart, loading, updateItem, removeItem } = useCart();
  const [busy, setBusy] = useState('');
  const [toast, setToast] = useState('');

  if (!isAuthenticated) {
    return <section className="section"><Empty icon="bag" title="Sign in to view your cart" body="Your cart is connected to your customer account." action={<button className="btn btn-primary" onClick={() => go('/login', { next: '/cart' })}>Sign in</button>} /></section>;
  }
  if (loading && !cart) return <section className="section"><LineSkeleton rows={3} /></section>;

  const items = cart?.items || [];
  const mutate = async (fn, id) => { setBusy(id); try { await fn(); } catch (e) { setToast(e.message); } finally { setBusy(''); } };

  return (
    <section className="section" data-testid="cart-page">
      <div className="section-head"><div><span className="eyebrow">Your bag</span><h1>Cart</h1></div></div>
      {!items.length
        ? <Empty icon="bag" title="Your cart is empty" body="Discover something you'll love." action={<button className="btn btn-primary" onClick={() => go('/explore')}>Start shopping</button>} />
        : (
          <div className="cart-layout">
            <div className="cart-list">
              {items.map((item) => (
                <article className="cart-item" key={item.public_id} data-testid="cart-item">
                  {item.media_url
                    ? <SafeImage src={item.media_url} alt="" loading="lazy" fallback={<div className="cart-thumb media-placeholder">Item</div>} />
                    : <div className="cart-thumb media-placeholder">Item</div>}
                  <div className="cart-item-info">
                    <button className="item-title" onClick={() => go(`/product/${item.product_slug}`)}>{item.title_snapshot}</button>
                    {item.variant_title_snapshot && <span>{item.variant_title_snapshot}</span>}
                    <span className="cart-item-mode"><Icon name="truck" size={13} /> {item.fulfillment_mode.replaceAll('_', ' ').toLowerCase()}</span>
                    {item.selected_modifiers?.length > 0 && <small>{item.selected_modifiers.map((m) => m.name).join(', ')}</small>}
                    <strong>{money(item.line_total, item.currency, tenant?.locale)}</strong>
                  </div>
                  <div className="cart-controls">
                    <div className="qty">
                      <button aria-label="Decrease quantity" disabled={busy === item.public_id || item.quantity <= 1} onClick={() => mutate(() => updateItem(item.public_id, item.quantity - 1), item.public_id)}><Icon name="minus" size={15} /></button>
                      <span>{item.quantity}</span>
                      <button aria-label="Increase quantity" disabled={busy === item.public_id} onClick={() => mutate(() => updateItem(item.public_id, item.quantity + 1), item.public_id)}><Icon name="plus" size={15} /></button>
                    </div>
                    <button className="text-danger cart-remove" disabled={busy === item.public_id} onClick={() => mutate(() => removeItem(item.public_id), item.public_id)}><Icon name="trash" size={15} /> Remove</button>
                  </div>
                </article>
              ))}
            </div>
            <aside className="summary-card cart-summary">
              <h3>Order summary</h3>
              <div><span>Subtotal</span><strong>{money(cart.totals?.subtotal, cart.currency, tenant?.locale)}</strong></div>
              <div><span>Delivery</span><span className="muted">Calculated at checkout</span></div>
              <hr />
              <div className="summary-total"><span>Estimated total</span><strong>{money(cart.totals?.grand_total, cart.currency, tenant?.locale)}</strong></div>
              <button className="btn btn-primary btn-full" onClick={() => go('/checkout')} data-testid="cart-checkout">Continue to checkout <Icon name="arrow-right" size={16} /></button>
            </aside>
          </div>
        )}
      <Toast message={toast} type="bad" onClose={() => setToast('')} />
    </section>
  );
}
