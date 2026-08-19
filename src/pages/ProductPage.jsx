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
import { useLocalization } from '../i18n/LocalizationContext.jsx';

function initials(name = '') {
  return String(name).trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '•';
}

export function ProductPage({ slug }) {
  const { tenant, publicApi } = useStore();
  const { t, localizeProduct } = useLocalization();
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

  const localizedProduct = localizeProduct(product);
  const selectedVariant = localizedProduct?.variants?.find((item) => item.public_id === variant);
  const groups = localizedProduct?.modifier_groups || [];
  const safeMods = useMemo(() => sanitizeSelection(groups, mods), [groups, mods]);
  const selectedOptions = useMemo(() => Object.values(safeMods).flat(), [safeMods]);
  const unitBase = Number(selectedVariant?.price_override ?? localizedProduct?.base_price ?? 0);
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
        product_id: localizedProduct.public_id,
        variant_id: variant || undefined,
        quantity,
        fulfillment_mode: mode,
        modifier_option_ids: ids,
      });
      setToast(t('product.added_to_cart'));
    } catch (requestError) {
      if (requestError?.code === 'MODIFIER_SELECTION_INVALID') {
        setToast(modifierErrorMessage(requestError, groups, effectiveSelection));
        setBuilderOpen(true);
      } else {
        setToast(requestError?.message || t('product.unable_add'));
      }
    } finally { setBusy(false); }
  };

  if (loading) return <Spinner />;
  if (error) return <section className="section"><ErrorState code={error?.code} message={error} onRetry={load} /></section>;
  if (!product) return null;

  const media = localizedProduct.media || [];
  const hasGroups = groups.length > 0;
  const canAdd = localizedProduct.availability?.in_stock && !busy;

  return (
    <section className="section product-detail">
      <div className="gallery" aria-label={`${localizedProduct.name} media`}>
        {media.length ? media.map((item, index) => (
          <div className={`gallery-item ${index === 0 ? 'primary' : ''}`} key={item.public_id}>
            {String(item.media_type).toUpperCase() === 'VIDEO'
              ? <video src={item.url} controls />
              : <button type="button" className="product-image-zoom-trigger" onClick={() => setViewerIndex(index)} aria-label={`${t('product.zoom')} ${localizedProduct.name} ${index + 1}`}>
                  <img src={item.url} alt={item.alt_text || localizedProduct.name} />
                  <span className="product-image-zoom-hint"><Icon name="search" size={16} /> {t('product.zoom')}</span>
                </button>}
          </div>
        )) : <div className="gallery-item primary media-placeholder">{initials(localizedProduct.name)}</div>}
      </div>

      <div className="product-buy">
        <div className="product-tags">
          {localizedProduct.category?.name && <Badge>{localizedProduct.category.name}</Badge>}
          <Badge tone={localizedProduct.availability?.in_stock ? 'good' : 'bad'}>{localizedProduct.availability?.in_stock ? t('common.in_stock') : t('common.out_of_stock')}</Badge>
        </div>
        <h1>{localizedProduct.name}</h1>
        {localizedProduct.short_description && <p className="lead">{localizedProduct.short_description}</p>}
        <div className="big-price">
          {money(unit, localizedProduct.currency || tenant?.currency, tenant?.locale)}
          {localizedProduct.compare_at_price && <del>{money(localizedProduct.compare_at_price, localizedProduct.currency || tenant?.currency, tenant?.locale)}</del>}
        </div>

        {localizedProduct.variants?.length > 0 && <div className="option-block">
          <label>{t('product.variant')}</label>
          <div className="choice-grid">{localizedProduct.variants.map((item) => <button key={item.public_id} className={variant === item.public_id ? 'selected' : ''} onClick={() => setVariant(item.public_id)}><strong>{item.title || item.sku}</strong><span>{item.price_override ? money(item.price_override, localizedProduct.currency, tenant?.locale) : t('product.standard_price')}</span></button>)}</div>
        </div>}

        {localizedProduct.fulfillment_modes?.length > 0 && <div className="option-block">
          <label>{t('product.fulfillment')}</label>
          <div className="choice-grid compact">{localizedProduct.fulfillment_modes.map((item) => <button key={item} className={mode === item ? 'selected' : ''} onClick={() => setMode(item)}>{item.replaceAll('_', ' ')}</button>)}</div>
        </div>}

        {hasGroups && <div className={`option-block combo-summary ${modifierValidation.valid ? '' : 'has-errors'}`}>
          <div className="combo-summary-head">
            <label><Icon name="sparkles" size={16} /> {t('product.product_options')}</label>
            <button type="button" className="btn btn-secondary btn-small" onClick={() => setBuilderOpen(true)} data-testid="open-combo-builder">{selectedOptions.length ? t('common.edit_choices') : t('common.choose_options')}</button>
          </div>
          {groups.map((group) => {
            const selected = safeMods[group.public_id] || [];
            const groupInvalid = modifierValidation.group?.public_id === group.public_id;
            return <div className="combo-summary-row" key={group.public_id}><span className="combo-summary-name">{group.name}</span><span className={`combo-summary-value ${groupInvalid ? 'is-missing' : ''}`}>{selected.length ? selected.map((option) => option.name).join(', ') : groupInvalid ? t('product.selection_required') : t('product.none_added')}</span></div>;
          })}
          {!modifierValidation.valid && <p className="combo-inline-error"><Icon name="alert-triangle" size={14} /> {modifierValidation.message}</p>}
        </div>}

        <div className="purchase-row">
          <div className="qty"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button><span>{quantity}</span><button onClick={() => setQuantity(Math.min(1000, quantity + 1))}>+</button></div>
          <button className="btn btn-primary buy-button" disabled={!canAdd} onClick={() => hasGroups && !modifierValidation.valid ? setBuilderOpen(true) : add()} data-testid="add-to-cart">
            {busy ? t('common.adding') : hasGroups && !modifierValidation.valid ? <><Icon name="sparkles" size={16} /> {t('common.choose_options')}</> : t('product.add',{price:money(total, localizedProduct.currency || tenant?.currency, tenant?.locale)})}
          </button>
        </div>

        <SupportLauncher placement="product_detail" />
        <div className="description"><h3>{t('product.about')}</h3><p>{localizedProduct.description || localizedProduct.short_description || t('product.details_fallback')}</p></div>
      </div>

      <ComboBuilder
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        product={localizedProduct}
        groups={groups}
        currency={localizedProduct.currency || tenant?.currency}
        locale={tenant?.locale}
        unitBase={unitBase}
        quantity={quantity}
        initialSelection={safeMods}
        onConfirm={(selection, ids) => { setMods(selection); add(ids, selection); }}
      />
      <ProductMediaViewer media={media} productName={localizedProduct.name} openIndex={viewerIndex} onClose={() => setViewerIndex(-1)} />
      <Toast message={toast} type={toast === t('product.added_to_cart') ? 'good' : 'bad'} onClose={() => setToast('')} />
    </section>
  );
}
