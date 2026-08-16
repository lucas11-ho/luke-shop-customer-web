import React, { useEffect, useState } from 'react';
import { useRoute, go } from '../app/router.js';
import { useStore } from '../store/StoreContext.jsx';
import { ProductCard } from '../components/ProductCard.jsx';
import { ErrorState, Empty } from '../components/UI.jsx';
import { ProductGridSkeleton } from '../components/Skeleton.jsx';
import { Icon } from '../components/icons.jsx';

const TYPES = [['', 'All types'], ['PHYSICAL', 'Physical'], ['FOOD', 'Food'], ['DIGITAL_IMAGE', 'Images'], ['DIGITAL_VIDEO', 'Video'], ['SERVICE', 'Services']];

export function ExplorePage() {
  const { query } = useRoute();
  const { publicApi, experience } = useStore();
  const searchEnabled = experience?.features?.search !== false;
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState(query.get('q') || '');
  const category = query.get('category') || '';
  const type = query.get('type') || '';

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [c, p] = await Promise.all([
        publicApi.request('/v1/storefront/categories'),
        publicApi.request('/v1/storefront/products', { query: { q: query.get('q') || '', category, product_type: type, limit: 48 } }),
      ]);
      setCategories(c.data.categories || []);
      setProducts(p.data.products || []);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };
  useEffect(() => { setQ(query.get('q') || ''); load(); }, [query.toString()]);

  const submit = (e) => { e.preventDefault(); go('/explore', { q, category, type }); };
  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <section className="section explore" data-testid="explore-page">
      <div className="section-head">
        <div>
          <span className="eyebrow">Storefront</span>
          <h1>{activeCategory ? activeCategory.name : q ? `Results for “${q}”` : 'Explore'}</h1>
        </div>
      </div>

      {searchEnabled && (
        <form className="searchbar" onSubmit={submit} role="search">
          <span className="searchbar-icon"><Icon name="search" size={18} /></span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" aria-label="Search products" data-testid="explore-search-input" />
          {q && <button type="button" className="searchbar-clear" aria-label="Clear search" onClick={() => { setQ(''); go('/explore', { category, type }); }}><Icon name="x" size={16} /></button>}
          <button className="btn btn-primary" data-testid="explore-search-submit">Search</button>
        </form>
      )}

      <div className="filters" role="tablist" aria-label="Categories">
        <button className={!category ? 'active' : ''} onClick={() => go('/explore', { q, type })}>All</button>
        {categories.map((c) => (
          <button key={c.public_id} className={category === c.slug ? 'active' : ''} onClick={() => go('/explore', { q, type, category: c.slug })} data-testid={`filter-category-${c.slug}`}>{c.name}</button>
        ))}
      </div>
      <div className="filters type-filters" aria-label="Product types">
        {TYPES.map(([v, l]) => (
          <button key={v} className={type === v ? 'active' : ''} onClick={() => go('/explore', { q, category, type: v })}>{l}</button>
        ))}
      </div>

      {loading
        ? <ProductGridSkeleton count={8} />
        : error
          ? <ErrorState code={error} message={error} onRetry={load} />
          : products.length
            ? <div className="product-grid" data-testid="explore-results">{products.map((p) => <ProductCard key={p.public_id} product={p} />)}</div>
            : (
              <Empty
                icon="search"
                title="No products found"
                body="Try another search or browse a category below."
                action={(
                  <div className="empty-suggestions">
                    {categories.slice(0, 6).map((c) => (
                      <button key={c.public_id} className="search-chip" onClick={() => go('/explore', { category: c.slug })}><Icon name="grid" size={14} /> {c.name}</button>
                    ))}
                  </div>
                )}
              />
            )}
    </section>
  );
}
