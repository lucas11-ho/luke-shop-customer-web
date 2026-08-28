import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../store/StoreContext.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { useCart } from '../cart/CartContext.jsx';
import { Spinner, ErrorState, money, Badge, Toast } from '../components/UI.jsx';
import { SupportLauncher } from '../components/SupportLauncher.jsx';
import { ProductCard } from '../components/ProductCard.jsx';
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
  const [relatedProducts, setRelatedProducts] = useState([]);
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
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  const load = async () => {
    setLoading(true); setError(''); setRelatedProducts([]);
    try {
      const response = await publicApi.request(`/v1/storefront/products/${encodeURIComponent(slug)}`);
      const nextProduct = response.data.product;
      const groups = normalizeModifierGroups(nextProduct.modifier_groups || []);
      setProduct({ ...nextProduct, modifier_groups: groups });
      setVariant(nextProduct.variants?.[0]?.public_id || '');
      setMode(nextProduct.fulfillment_modes?.[0] || '');
      setQuantity(1);
      setSelectedMediaIndex(0);
      const initial = {};
      for (const group of groups) initial[group.public_id] = [];
      setMods(initial);
      if (nextProduct.category?.slug) {
        publicApi.request('/v1/storefront/products', { query: { category: nextProduct.category.slug, limit: 8, offset: 0 } })
          .then((related) => setRelatedProducts((related.data.products || []).filter((item) => item.public_id !== nextProduct.public_id).slice(0, 4)))
          .catch(() => setRelatedProducts([]));
      }
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
  const comparePrice = Number(selectedVariant?.compare_at_price_override ?? localizedProduct?.compare_at_price ?? 0);
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
  const selectedMedia = media[selectedMediaIndex] || media[0] || null;
  const hasGroups = groups.length > 0;
  const canAdd = localizedProduct.availability?.in_stock && !busy;
  const discount = comparePrice > unitBase && unitBase >= 0 ? Math.round((1 - unitBase / comparePrice) * 100) : 0;
  const purchaseAction = () => hasGroups && !modifierValidation.valid ? setBuilderOpen(true) : add();

  return (
    <section className="section product-detail commerce-product-detail-v4" data-testid="product-detail-v4">
      <div className="commerce-product-breadcrumbs">
        <button type="button" onClick={() => go('/explore')}><Icon name="arrow-left" size={14} /> {t('nav.explore')}</button>
        {localizedProduct.category?.name && <><span>/</span><button type="button" onClick={() => go('/explore', { category: localizedProduct.category.slug })}>{localizedProduct.category.name}</button></>}
      </div>

      <div className="commerce-product-shell">
        <div className="commerce-product-media-column">
          <div className="commerce-gallery-stage" aria-label={`${localizedProduct.name} media`}>
            {selectedMedia ? (
              String(selectedMedia.media_type).toUpperCase() === 'VIDEO'
                ? <video src={selectedMedia.url} controls poster={selectedMedia.poster_url || undefined} />
                : <button type="button" className="product-image-zoom-trigger commerce-main-media" onClick={() => setViewerIndex(selectedMediaIndex)} aria-label={`${t('product.zoom')} ${localizedProduct.name} ${selectedMediaIndex + 1}`}>
                    <img src={selectedMedia.url} alt={selectedMedia.alt_text || localizedProduct.name} />
                    <span className="product-image-zoom-hint"><Icon name="search" size={16} /> {t('product.zoom')}</span>
                  </button>
            ) : <div className="gallery-item primary media-placeholder commerce-main-placeholder">{initials(localizedProduct.name)}</div>}
          </div>
          {media.length > 1 && <div className="commerce-media-strip" aria-label={`${localizedProduct.name} thumbnails`}>
            {media.map((item, index) => <button type="button" key={item.public_id} className={selectedMediaIndex === index ? 'selected' : ''} onClick={() => setSelectedMediaIndex(index)} aria-label={`${localizedProduct.name} ${index + 1}`}>
              {String(item.media_type).toUpperCase() === 'VIDEO' ? <video src={item.url} muted preload="metadata" /> : <img src={item.url} alt="" />}
              {String(item.media_type).toUpperCase() === 'VIDEO' && <span aria-hidden="true">▶</span>}
            </button>)}
          </div>}
        </div>

        <aside className="product-buy commerce-buy-panel">
          <div className="product-tags commerce-product-tags">
            {localizedProduct.category?.name && <Badge>{localizedProduct.category.name}</Badge>}
            <Badge tone={localizedProduct.availability?.in_stock ? 'good' : 'bad'}>{localizedProduct.availability?.in_stock ? t('common.in_stock') : t('common.out_of_stock')}</Badge>
            {discount > 0 && <Badge tone="good">-{discount}%</Badge>}
          </div>
          <h1>{localizedProduct.name}</h1>
          {localizedProduct.short_description && <p className="lead">{localizedProduct.short_description}</p>}
          <div className="big-price commerce-big-price">
            {money(unit, localizedProduct.currency || tenant?.currency, tenant?.locale)}
            {comparePrice > unit && <del>{money(comparePrice, localizedProduct.currency || tenant?.currency, tenant?.locale)}</del>}
          </div>

          <div className="commerce-purchase-facts" aria-label="Product purchase facts">
            <div><Icon name="package" size={17} /><span><strong>{localizedProduct.availability?.in_stock ? t('common.in_stock') : t('common.out_of_stock')}</strong><small>{String(localizedProduct.product_type || '').replaceAll('_', ' ') || '—'}</small></span></div>
            <div><Icon name="truck" size={17} /><span><strong>{t('product.fulfillment')}</strong><small>{localizedProduct.fulfillment_modes?.map((item) => item.replaceAll('_', ' ')).join(' · ') || '—'}</small></span></div>
            <div><Icon name="sparkles" size={17} /><span><strong>{t('product.product_options')}</strong><small>{groups.length ? `${groups.length}` : t('product.none_added')}</small></span></div>
          </div>

          {localizedProduct.variants?.length > 0 && <div className="option-block">
            <label>{t('product.variant')}</label>
            <div className="choice-grid commerce-choice-grid">{localizedProduct.variants.map((item) => <button key={item.public_id} className={variant === item.public_id ? 'selected' : ''} onClick={() => setVariant(item.public_id)}><strong>{item.title || item.sku}</strong><span>{item.price_override ? money(item.price_override, localizedProduct.currency, tenant?.locale) : t('product.standard_price')}</span></button>)}</div>
          </div>}

          {localizedProduct.fulfillment_modes?.length > 0 && <div className="option-block">
            <label>{t('product.fulfillment')}</label>
            <div className="choice-grid compact commerce-choice-grid">{localizedProduct.fulfillment_modes.map((item) => <button key={item} className={mode === item ? 'selected' : ''} onClick={() => setMode(item)}>{item.replaceAll('_', ' ')}</button>)}</div>
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

          <div className="purchase-row commerce-purchase-row">
            <div className="qty"><button aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button><span>{quantity}</span><button aria-label="Increase quantity" onClick={() => setQuantity(Math.min(1000, quantity + 1))}>+</button></div>
            <button className="btn btn-primary buy-button" disabled={!canAdd} onClick={purchaseAction} data-testid="add-to-cart">
              {busy ? t('common.adding') : hasGroups && !modifierValidation.valid ? <><Icon name="sparkles" size={16} /> {t('common.choose_options')}</> : t('product.add', { price: money(total, localizedProduct.currency || tenant?.currency, tenant?.locale) })}
            </button>
          </div>

          <SupportLauncher placement="product_detail" />
          <div className="description commerce-product-description"><h3>{t('product.about')}</h3><p>{localizedProduct.description || localizedProduct.short_description || t('product.details_fallback')}</p></div>
        </aside>
      </div>

      {relatedProducts.length > 0 && <section className="commerce-related-products" aria-label={t('home.curated')}>
        <div className="section-head"><div><span className="eyebrow">{t('home.curated')}</span><h2>{t('home.explore_products')}</h2></div><button type="button" className="link-btn" onClick={() => go('/explore', { category: localizedProduct.category?.slug || undefined })}>{t('home.see_all')} <Icon name="arrow-right" size={15} /></button></div>
        <div className="product-grid commerce-related-grid">{relatedProducts.map((item) => <ProductCard key={item.public_id} product={item} />)}</div>
      </section>}

      <div className="commerce-mobile-buybar" data-testid="mobile-add-to-cart">
        <div><small>{localizedProduct.name}</small><strong>{money(total, localizedProduct.currency || tenant?.currency, tenant?.locale)}</strong></div>
        <button className="btn btn-primary" disabled={!canAdd} onClick={purchaseAction}>{busy ? t('common.adding') : hasGroups && !modifierValidation.valid ? t('common.choose_options') : t('product.add', { price: money(total, localizedProduct.currency || tenant?.currency, tenant?.locale) })}</button>
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
