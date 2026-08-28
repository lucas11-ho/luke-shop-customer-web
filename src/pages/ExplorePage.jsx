import React, { useEffect, useState } from 'react';
import { useRoute, go } from '../app/router.js';
import { useStore } from '../store/StoreContext.jsx';
import { ProductCard } from '../components/ProductCard.jsx';
import { ErrorState, Empty } from '../components/UI.jsx';
import { ProductGridSkeleton } from '../components/Skeleton.jsx';
import { Icon } from '../components/icons.jsx';
import { useLocalization } from '../i18n/LocalizationContext.jsx';

const PAGE_SIZE = 24;
const LOAD_MORE = { en: 'Load more', my: 'နောက်ထပ်ပြမည်', id: 'Muat lebih banyak' };

export function ExplorePage() {
  const { query } = useRoute();
  const { publicApi, experience } = useStore();
  const { t, locale, localizeCategory } = useLocalization();
  const searchEnabled = experience?.features?.search !== false;
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');
  const [q, setQ] = useState(query.get('q') || '');
  const category = query.get('category') || '';

  const productQuery = (offset = 0) => ({
    q: query.get('q') || '',
    category,
    limit: PAGE_SIZE,
    offset,
  });

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [categoryData, productData] = await Promise.all([
        publicApi.request('/v1/storefront/categories'),
        publicApi.request('/v1/storefront/products', { query: productQuery(0) }),
      ]);
      const nextProducts = productData.data.products || [];
      setCategories(categoryData.data.categories || []);
      setProducts(nextProducts);
      setHasMore(nextProducts.length === PAGE_SIZE);
    } catch (requestError) { setError(requestError); } finally { setLoading(false); }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true); setError('');
    try {
      const productData = await publicApi.request('/v1/storefront/products', { query: productQuery(products.length) });
      const nextProducts = productData.data.products || [];
      setProducts((current) => {
        const seen = new Set(current.map((item) => item.public_id));
        return [...current, ...nextProducts.filter((item) => !seen.has(item.public_id))];
      });
      setHasMore(nextProducts.length === PAGE_SIZE);
    } catch (requestError) { setError(requestError); } finally { setLoadingMore(false); }
  };

  useEffect(() => { setQ(query.get('q') || ''); load(); }, [query.toString()]);

  const submit = (event) => {
    event.preventDefault();
    go('/explore', { q: q.trim() || undefined, category: category || undefined });
  };
  const localizedCategories = categories.map(localizeCategory);
  const activeCategory = localizedCategories.find((item) => item.slug === category);
  const resultTitle = activeCategory ? activeCategory.name : q ? t('explore.results_for', { query: q }) : t('explore.title');

  return (
    <section className="section explore commerce-explore-v4" data-testid="explore-page" data-catalog-layout={experience?.layout?.product_grid || 'four'}>
      <div className="commerce-explore-hero">
        <div>
          <span className="eyebrow">{t('explore.eyebrow')}</span>
          <h1>{resultTitle}</h1>
          <p>{t('explore.try_another')}</p>
        </div>
        <div className="commerce-result-count" aria-live="polite"><strong>{products.length}</strong><span>{t('nav.explore')}</span></div>
      </div>

      <div className="commerce-discovery-bar">
        {searchEnabled && (
          <form className="searchbar commerce-searchbar" onSubmit={submit} role="search">
            <span className="searchbar-icon"><Icon name="search" size={18} /></span>
            <input value={q} onChange={(event) => setQ(event.target.value)} placeholder={t('explore.search_placeholder')} aria-label={t('common.search_products')} data-testid="explore-search-input" />
            {q && <button type="button" className="searchbar-clear" aria-label="Clear search" onClick={() => { setQ(''); go('/explore', { category: category || undefined }); }}><Icon name="x" size={16} /></button>}
            <button className="btn btn-primary" data-testid="explore-search-submit">{t('common.search')}</button>
          </form>
        )}

        <div className="filters merchant-category-filters commerce-category-rail" role="tablist" aria-label={t('explore.categories')}>
          <button className={!category ? 'active' : ''} onClick={() => go('/explore', { q: q || undefined })}>{t('common.all')}</button>
          {localizedCategories.map((item) => (
            <button key={item.public_id} className={category === item.slug ? 'active' : ''} onClick={() => go('/explore', { q: q || undefined, category: item.slug })} data-testid={`filter-category-${item.slug}`}>{item.name}</button>
          ))}
        </div>
      </div>

      {loading
        ? <ProductGridSkeleton count={8} />
        : error && !products.length
          ? <ErrorState code={error?.code} message={error} onRetry={load} />
          : products.length
            ? <>
                <div className="product-grid commerce-product-grid" data-testid="explore-results">{products.map((product) => <ProductCard key={product.public_id} product={product} />)}</div>
                {error && <div className="commerce-inline-error"><ErrorState code={error?.code} message={error} onRetry={loadMore} /></div>}
                {hasMore && <div className="commerce-load-more"><button type="button" className="btn btn-secondary" disabled={loadingMore} onClick={loadMore} data-testid="explore-load-more">{loadingMore ? t('common.loading') : LOAD_MORE[locale] || LOAD_MORE.en}</button></div>}
              </>
            : (
              <Empty
                icon="search"
                title={t('explore.no_products')}
                body={categories.length ? t('explore.try_another') : t('explore.no_categories')}
                action={categories.length ? (
                  <div className="empty-suggestions">
                    {localizedCategories.slice(0, 6).map((item) => (
                      <button key={item.public_id} className="search-chip" onClick={() => go('/explore', { category: item.slug })}><Icon name="grid" size={14} /> {item.name}</button>
                    ))}
                  </div>
                ) : null}
              />
            )}
    </section>
  );
}
