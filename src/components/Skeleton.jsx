import React from 'react';

export function Skeleton({ w, h = 14, r = 8, className = '', style = {} }) {
  return <span className={`skeleton ${className}`.trim()} style={{ width: w, height: h, borderRadius: r, ...style }} aria-hidden="true" />;
}

export function ProductCardSkeleton() {
  return (
    <div className="product-card product-card-skeleton" aria-hidden="true">
      <div className="product-media"><Skeleton w="100%" h="100%" r={0} /></div>
      <div className="product-card-body">
        <Skeleton w="45%" h={10} />
        <Skeleton w="80%" h={16} style={{ marginTop: 12 }} />
        <Skeleton w="35%" h={16} style={{ marginTop: 14 }} />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="product-grid" aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }).map((_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  );
}

export function LineSkeleton({ rows = 3 }) {
  return (
    <div className="line-skeleton" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="line-skeleton-row">
          <Skeleton w={64} h={64} r={12} />
          <div className="line-skeleton-text"><Skeleton w="60%" h={14} /><Skeleton w="40%" h={12} style={{ marginTop: 8 }} /></div>
          <Skeleton w={70} h={14} />
        </div>
      ))}
    </div>
  );
}

export function CategoryStripSkeleton({ count = 6 }) {
  return (
    <div className="category-strip" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="category-skeleton"><Skeleton w="100%" h={90} r={16} /><Skeleton w="60%" h={12} style={{ marginTop: 10 }} /></div>
      ))}
    </div>
  );
}
