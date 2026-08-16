import React, { useState } from 'react';
import { money, Badge } from './UI.jsx';
import { go } from '../app/router.js';
import { useStore } from '../store/StoreContext.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { useCart } from '../cart/CartContext.jsx';
import { SafeImage } from './SafeMedia.jsx';
import { Icon } from './icons.jsx';

export function ProductCard({ product }) {
  const { tenant, experience } = useStore();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const price = Number(product.base_price || 0), compare = Number(product.compare_at_price || 0);
  const discount = compare > price && price >= 0 ? Math.round((1 - price / compare) * 100) : 0;
  const stockEnabled=experience?.features?.stock_status!==false;
  const stockLabel = product.in_stock === false ? 'Out of stock' : product.available_quantity != null && Number(product.available_quantity) <= 5 ? `Only ${product.available_quantity} left` : 'In stock';
  const style = experience?.layout?.product_card || 'standard';
  const quick = style === 'quick_add' || experience?.features?.quick_add === true;
  const mode = Array.isArray(product.fulfillment_modes) ? product.fulfillment_modes[0] : null;
  const canQuick = quick && product.in_stock !== false && !product.has_variants && Boolean(mode);
  const open = () => go(`/product/${encodeURIComponent(product.slug)}`);
  const quickAdd = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated) { go('/login', { next: `/product/${product.slug}` }); return; }
    if (!canQuick) { open(); return; }
    setAdding(true);
    try { await addItem({ product_id: product.public_id, quantity: 1, fulfillment_mode: mode }); setAdded(true); setTimeout(() => setAdded(false), 1800); }
    catch { open(); } finally { setAdding(false); }
  };
  return (
    <article className={`product-card product-card-v3 product-card-${style}`} onClick={open} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') open(); }} tabIndex="0" role="link" aria-label={`View ${product.name}`} data-testid="product-card">
      <div className="product-media">
        {product.primary_media_url
          ? <SafeImage src={product.primary_media_url} alt={product.name} loading="lazy" fallback={<div className="media-placeholder">{product.product_type?.replace('_', ' ')}</div>} />
          : <div className="media-placeholder">{product.product_type?.replace('_', ' ')}</div>}
        {discount > 0 && <div className="discount-chip">-{discount}%</div>}
        {!product.in_stock && <div className="sold-overlay">Out of stock</div>}
      </div>
      <div className="product-card-body">
        <div className="product-card-meta">
          <Badge>{product.category_name || product.product_type}</Badge>
          {stockEnabled&&<span className={`stock-note ${product.in_stock === false ? 'bad' : ''}`}>{stockLabel}</span>}
        </div>
        <h3>{product.name}</h3>
        {product.short_description && <p>{product.short_description}</p>}
        <div className="price-row">
          <strong>{money(price, product.currency || tenant?.currency, tenant?.locale)}</strong>
          {compare > price && <del>{money(compare, product.currency || tenant?.currency, tenant?.locale)}</del>}
        </div>
        {quick
          ? <button className="quick-add-button" disabled={adding || product.in_stock === false} onClick={quickAdd} data-testid="quick-add">{added ? <><Icon name="check" size={15} /> Added</> : adding ? 'Adding…' : canQuick ? <><Icon name="plus" size={15} /> Quick add</> : 'Choose options'}</button>
          : <div className="product-card-action"><span>View product</span><Icon name="arrow-right" size={15} /></div>}
      </div>
    </article>
  );
}
