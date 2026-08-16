import React, { useEffect, useRef, useState } from 'react';
import { Icon } from './icons.jsx';
import { go } from '../app/router.js';
import { useStore } from '../store/StoreContext.jsx';

const RECENTS_KEY = 'luke-shop.recent-searches.v1';
function readRecents() { try { return JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]'); } catch { return []; } }
function pushRecent(term) {
  const t = term.trim(); if (!t) return;
  const list = [t, ...readRecents().filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 6);
  try { localStorage.setItem(RECENTS_KEY, JSON.stringify(list)); } catch { /* ignore */ }
}

export function SearchOverlay({ open, onClose }) {
  const { publicApi } = useStore();
  const [q, setQ] = useState('');
  const [categories, setCategories] = useState([]);
  const [recents, setRecents] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    setRecents(readRecents());
    setQ('');
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    if (!categories.length) publicApi.request('/v1/storefront/categories').then((d) => setCategories(d.data.categories || [])).catch(() => {});
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { clearTimeout(t); window.removeEventListener('keydown', onKey); };
  }, [open]);

  if (!open) return null;

  const submit = (e) => { e.preventDefault(); const t = q.trim(); if (t) pushRecent(t); onClose(); go('/explore', { q: t }); };
  const pick = (term) => { pushRecent(term); onClose(); go('/explore', { q: term }); };
  const openCategory = (slug) => { onClose(); go('/explore', { category: slug }); };

  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search products" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="search-panel">
        <form className="search-panel-field" onSubmit={submit}>
          <Icon name="search" size={20} />
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" data-testid="search-overlay-input" aria-label="Search products" />
          <button type="button" className="search-panel-close" onClick={onClose} aria-label="Close search"><Icon name="x" size={20} /></button>
        </form>

        {recents.length > 0 && (
          <div className="search-block">
            <div className="search-block-head"><span>Recent searches</span></div>
            <div className="search-chips">
              {recents.map((r) => (
                <button key={r} type="button" className="search-chip" onClick={() => pick(r)} data-testid="search-recent-chip">
                  <Icon name="clock" size={14} /> {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {categories.length > 0 && (
          <div className="search-block">
            <div className="search-block-head"><span>Browse categories</span></div>
            <div className="search-category-grid">
              {categories.slice(0, 8).map((c) => (
                <button key={c.public_id} type="button" className="search-category" onClick={() => openCategory(c.slug)} data-testid="search-category">
                  <Icon name="grid" size={16} /><span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
