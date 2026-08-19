import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../store/StoreContext.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { useCart } from '../cart/CartContext.jsx';
import { Spinner, ErrorState, money, Badge, Toast } from '../components/UI.jsx';
import { SupportLauncher } from '../components/SupportLauncher.jsx';
import { go } from '../app/router.js';
import { Icon } from '../components/icons.jsx';
import { ComboBuilder } from '../components/ComboBuilder.jsx';
import { ProductMediaViewer } from '../components/ProductMediaViewer.jsx';
import { modifierErrorMessage, modifierOptionIds, normalizeModifierGroups, sanitizeSelection, validateModifierSelection } from '../modifiers/modifierRules.js';

function initials(name = '') {
  return String(name).trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '•';
}

export function ProductPage({ slug }) {
  const { tenant, publicApi } = useStore();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [variant, setVariant] = useState('');
  const [mode, setMode] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [mods, setMods] = useState({});
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');
  const [builderOpen, setBuilderOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(-1);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const response = await publicApi.request(`/v1/storefront/products/${encodeURIComponent(slug)}`);
      const nextProduct = response.data.product;
      const groups = normalizeModifierGroups(nextProduct.modifier_groups || []);
      setProduct({ ...nextProduct, modifier_groups: groups });
      setVariant(nextProduct.variants?.[0]?.public_id || '');
      setMode(nextProduct.fulfillment_modes?.[0] || '');
      const initial = {};
      for (const group of groups) initial[group.public_id] = [];
      setMods(initial);
    } catch (requestError) { setError(requestError); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [slug]);

  const selectedVariant = product?.variants?.find((item) => item.public_id === variant);
  const groups = product?.modifier_groups || [];
  const safeMods = useMemo(() => sanitizeSelection(groups, mods), [groups, mods]);
  const selectedOptions = useMemo(() => Object.values(safeMods).flat(), [safeMods]);
  const unitBase = Number(selectedVariant?.price_override ?? product?.base_price ?? 0);
  const unit = unitBase + selectedOptions.reduce((sum, option) => sum + Number(option.price_delta || 0), 0);
  const total = unit * quantity;
  const modifierValidation = useMemo(() => validateModifierSelection(groups, safeMods), [groups, safeMods]);

  const add = async (optionIds, selectionOverride) => {
    if (!isAuthenticated) { go('/login', { next: `/product/${slug}` }); return; }
    const effectiveSelection = sanitizeSelection(groups, selectionOverride ?? safeMods);
    const validation = validateModifierSelection(groups, effectiveSelection);
    if (!validation.valid) {
      setToast(validation.message);
      setBuilderOpen(true);
      return;
    }
    const ids = optionIds !== undefined ? optionIds : modifierOptionIds(groups, effectiveSelection);
    setBusy(true);
    try {
      await addItem({
        product_id: product.public_id,
        variant_id: variant || undefined,
        quantity,
        fulfillment_mode: mode,
        modifier_option_ids: ids,
      });
      setToast('Added to cart');
    } catch (requestError) {
      if (requestError?.code === 'MODIFIER_SELECTION_INVALID') {
        setToast(modifierErrorMessage(requestError, groups, effectiveSelection));
        setBuilderOpen(true);
      } else {
        setToast(requestError?.message || 'Unable to add this item. Please try again.');
      }
    } finally { setBusy(false); }
  };

  if (loading) return <Spinner />;
  if (error) return <section className="section"><ErrorState code={error?.code} message={error} onRetry={load} /></section>;
  if (!product) return null;

  const media = product.media || [];
  const hasGroups = groups.length > 0;
  const canAdd = product.availability?.in_stock && !busy;

  return (
    <section className="section product-detail">
      <div className="gallery" aria-label={`${product.name} media`}>
        {media.length ? media.map((item, index) => (
          <div className={`gallery-item ${index === 0 ? 'primary' : ''}`} key={item.public_id}>
            {String(item.media_type).toUpperCase() === 'VIDEO'
              ? <video src={item.url} controls />
              : <button type="button" className="product-image-zoom-trigger" onClick={() => setViewerIndex(index)} aria-label={`Zoom ${product.name} image ${index + 1}`}>
                  <img src={item.url} alt={item.alt_text || product.name} />
                  <span className="product-image-zoom-hint"><Icon name="search" size={16} /> Zoom</span>
                </button>}
          </div>
        )) : <div className="gallery-item primary media-placeholder">{initials(product.name)}</div>}
      </div>

      <div className="product-buy">
        <div className="product-tags">
          {product.category?.name && <Badge>{product.category.name}</Badge>}
          <Badge tone={product.availability?.in_stock ? 'good' : 'bad'}>{product.availability?.in_stock ? 'In stock' : 'Out of stock'}</Badge>
        </div>
        <h1>{product.name}</h1>
        {product.short_description && <p className="lead">{product.short_description}</p>}
        <div className="big-price">
          {money(unit, product.currency || tenant?.currency, tenant?.locale)}
          {product.compare_at_price && <del>{money(product.compare_at_price, product.currency || tenant?.currency, tenant?.locale)}</del>}
        </div>

        {product.variants?.length > 0 && <div className="option-block">
          <label>Variant</label>
          <div className="choice-grid">{product.variants.map((item) => <button key={item.public_id} className={variant === item.public_id ? 'selected' : ''} onClick={() => setVariant(item.public_id)}><strong>{item.title || item.sku}</strong><span>{item.price_override ? money(item.price_override, product.currency, tenant?.locale) : 'Standard price'}</span></button>)}</div>
        </div>}

        {product.fulfillment_modes?.length > 0 && <div className="option-block">
          <label>Fulfillment</label>
          <div className="choice-grid compact">{product.fulfillment_modes.map((item) => <button key={item} className={mode === item ? 'selected' : ''} onClick={() => setMode(item)}>{item.replaceAll('_', ' ')}</button>)}</div>
        </div>}

        {hasGroups && <div className={`option-block combo-summary ${modifierValidation.valid ? '' : 'has-errors'}`}>
          <div className="combo-summary-head">
            <label><Icon name="sparkles" size={16} /> Product options</label>
            <button type="button" className="btn btn-secondary btn-small" onClick={() => setBuilderOpen(true)} data-testid="open-combo-builder">{selectedOptions.length ? 'Edit choices' : 'Choose options'}</button>
          </div>
          {groups.map((group) => {
            const selected = safeMods[group.public_id] || [];
            const groupInvalid = modifierValidation.group?.public_id === group.public_id;
            return <div className="combo-summary-row" key={group.public_id}><span className="combo-summary-name">{group.name}</span><span className={`combo-summary-value ${groupInvalid ? 'is-missing' : ''}`}>{selected.length ? selected.map((option) => option.name).join(', ') : groupInvalid ? 'Selection required' : 'None added'}</span></div>;
          })}
          {!modifierValidation.valid && <p className="combo-inline-error"><Icon name="alert-triangle" size={14} /> {modifierValidation.message}</p>}
        </div>}

        <div className="purchase-row">
          <div className="qty"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button><span>{quantity}</span><button onClick={() => setQuantity(Math.min(1000, quantity + 1))}>+</button></div>
          <button className="btn btn-primary buy-button" disabled={!canAdd} onClick={() => hasGroups && !modifierValidation.valid ? setBuilderOpen(true) : add()} data-testid="add-to-cart">
            {busy ? 'Adding…' : hasGroups && !modifierValidation.valid ? <><Icon name="sparkles" size={16} /> Choose options</> : `Add · ${money(total, product.currency, tenant?.locale)}`}
          </button>
        </div>

        <SupportLauncher placement="product_detail" />
        <div className="description"><h3>About this item</h3><p>{product.description || product.short_description || 'Product details will appear here.'}</p></div>
      </div>

      <ComboBuilder
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        product={product}
        groups={groups}
        currency={product.currency || tenant?.currency}
        locale={tenant?.locale}
        unitBase={unitBase}
        quantity={quantity}
        initialSelection={safeMods}
        onConfirm={(selection, ids) => { setMods(selection); add(ids, selection); }}
      />
      <ProductMediaViewer media={media} productName={product.name} openIndex={viewerIndex} onClose={() => setViewerIndex(-1)} />
      <Toast message={toast} type={toast === 'Added to cart' ? 'good' : 'bad'} onClose={() => setToast('')} />
    </section>
  );
}
