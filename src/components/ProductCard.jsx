import React, { useState } from 'react';
import { money, Badge } from './UI.jsx';
import { go } from '../app/router.js';
import { useStore } from '../store/StoreContext.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { useCart } from '../cart/CartContext.jsx';
import { SafeImage } from './SafeMedia.jsx';
import { Icon } from './icons.jsx';
import { productExplicitlyHasNoModifiers } from '../modifiers/modifierRules.js';

function initials(name = '') { return String(name).trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '•'; }

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
  // Quick-add is allowed only when the list payload explicitly confirms there are no modifier groups.
  // Unknown modifier metadata must open the product page rather than risking MODIFIER_SELECTION_INVALID.
  const modifierFree = productExplicitlyHasNoModifiers(product);
  const canQuick = quick && product.in_stock !== false && !product.has_variants && Boolean(mode) && modifierFree;
  const open = () => go(`/product/${encodeURIComponent(product.slug)}`);
  const quickAdd = async (event) => {
    event.preventDefault(); event.stopPropagation();
    if (!isAuthenticated) { go('/login', { next: `/product/${product.slug}` }); return; }
    if (!canQuick) { open(); return; }
    setAdding(true);
    try {
      await addItem({ product_id: product.public_id, quantity: 1, fulfillment_mode: mode, modifier_option_ids: [] });
      setAdded(true); setTimeout(() => setAdded(false), 1800);
    } catch { open(); } finally { setAdding(false); }
  };
  return (
    <article className={`product-card product-card-v3 product-card-${style}`} onClick={open} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') open(); }} tabIndex="0" role="link" aria-label={`View ${product.name}`} data-testid="product-card">
      <div className="product-media">
        {product.primary_media_url
          ? <SafeImage src={product.primary_media_url} alt={product.name} loading="lazy" fallback={<div className="media-placeholder">{initials(product.name)}</div>} />
          : <div className="media-placeholder">{initials(product.name)}</div>}
        {discount > 0 && <div className="discount-chip">-{discount}%</div>}
        {!product.in_stock && <div className="sold-overlay">Out of stock</div>}
      </div>
      <div className="product-card-body">
        <div className="product-card-meta">
          {product.category_name && <Badge>{product.category_name}</Badge>}
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
