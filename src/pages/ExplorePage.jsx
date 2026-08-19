import React, { useEffect, useState } from 'react';
import { useRoute, go } from '../app/router.js';
import { useStore } from '../store/StoreContext.jsx';
import { ProductCard } from '../components/ProductCard.jsx';
import { ErrorState, Empty } from '../components/UI.jsx';
import { ProductGridSkeleton } from '../components/Skeleton.jsx';
import { Icon } from '../components/icons.jsx';
import { useLocalization } from '../i18n/LocalizationContext.jsx';

export function ExplorePage() {
  const { query } = useRoute();
  const { publicApi, experience } = useStore();
  const { t, localizeCategory } = useLocalization();
  const searchEnabled = experience?.features?.search !== false;
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState(query.get('q') || '');
  const category = query.get('category') || '';

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [categoryData, productData] = await Promise.all([
        publicApi.request('/v1/storefront/categories'),
        publicApi.request('/v1/storefront/products', { query: { q: query.get('q') || '', category, limit: 48 } }),
      ]);
      setCategories(categoryData.data.categories || []);
      setProducts(productData.data.products || []);
    } catch (requestError) { setError(requestError); } finally { setLoading(false); }
  };
  useEffect(() => { setQ(query.get('q') || ''); load(); }, [query.toString()]);

  const submit = (event) => { event.preventDefault(); go('/explore', { q, category }); };
  const localizedCategories = categories.map(localizeCategory);
  const activeCategory = localizedCategories.find((item) => item.slug === category);

  return (
    <section className="section explore" data-testid="explore-page">
      <div className="section-head">
        <div>
          <span className="eyebrow">{t('explore.eyebrow')}</span>
          <h1>{activeCategory ? activeCategory.name : q ? t('explore.results_for',{query:q}) : t('explore.title')}</h1>
        </div>
      </div>

      {searchEnabled && (
        <form className="searchbar" onSubmit={submit} role="search">
          <span className="searchbar-icon"><Icon name="search" size={18} /></span>
          <input value={q} onChange={(event) => setQ(event.target.value)} placeholder={t('explore.search_placeholder')} aria-label={t('common.search_products')} data-testid="explore-search-input" />
          {q && <button type="button" className="searchbar-clear" aria-label="Clear search" onClick={() => { setQ(''); go('/explore', { category }); }}><Icon name="x" size={16} /></button>}
          <button className="btn btn-primary" data-testid="explore-search-submit">{t('common.search')}</button>
        </form>
      )}

      <div className="filters merchant-category-filters" role="tablist" aria-label={t('explore.categories')}>
        <button className={!category ? 'active' : ''} onClick={() => go('/explore', { q })}>{t('common.all')}</button>
        {localizedCategories.map((item) => (
          <button key={item.public_id} className={category === item.slug ? 'active' : ''} onClick={() => go('/explore', { q, category: item.slug })} data-testid={`filter-category-${item.slug}`}>{item.name}</button>
        ))}
      </div>

      {loading
        ? <ProductGridSkeleton count={8} />
        : error
          ? <ErrorState code={error?.code} message={error} onRetry={load} />
          : products.length
            ? <div className="product-grid" data-testid="explore-results">{products.map((product) => <ProductCard key={product.public_id} product={product} />)}</div>
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
