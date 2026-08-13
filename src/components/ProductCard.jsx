import React from'react';
import{money,Badge}from'./UI.jsx';
import{go}from'../app/router.js';
import{useStore}from'../store/StoreContext.jsx';
export function ProductCard({product}){
 const{tenant}=useStore();
 const price=Number(product.base_price||0),compare=Number(product.compare_at_price||0);const discount=compare>price&&price>=0?Math.round((1-price/compare)*100):0;
 const stockLabel=product.in_stock===false?'Out of stock':product.available_quantity!=null&&Number(product.available_quantity)<=5?`Only ${product.available_quantity} left`:'In stock';
 return <article className="product-card" onClick={()=>go(`/product/${encodeURIComponent(product.slug)}`)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' ')go(`/product/${encodeURIComponent(product.slug)}`)}} tabIndex="0" role="link" aria-label={`View ${product.name}`}>
   <div className="product-media">{product.primary_media_url?<img src={product.primary_media_url} alt={product.name}/>:<div className="media-placeholder">{product.product_type?.replace('_',' ')}</div>}{discount>0&&<div className="discount-chip">-{discount}%</div>}{!product.in_stock&&<div className="sold-overlay">Out of stock</div>}</div>
   <div className="product-card-body"><div className="product-card-meta"><Badge>{product.category_name||product.product_type}</Badge><span className={`stock-note ${product.in_stock===false?'bad':''}`}>{stockLabel}</span></div><h3>{product.name}</h3>{product.short_description&&<p>{product.short_description}</p>}<div className="price-row"><strong>{money(price,product.currency||tenant?.currency,tenant?.locale)}</strong>{compare>price&&<del>{money(compare,product.currency||tenant?.currency,tenant?.locale)}</del>}</div><div className="product-card-action"><span>View product</span><b>→</b></div></div>
 </article>;
}
