import React from 'react';
export function Spinner({label='Loading…'}){return <div className="state"><div className="spinner"/><span>{label}</span></div>;}
export function Empty({title,body,action}){return <div className="empty"><div className="empty-icon">◇</div><h3>{title}</h3>{body&&<p>{body}</p>}{action}</div>;}
export function ErrorState({message,onRetry}){return <div className="error-card"><strong>Something went wrong</strong><span>{message}</span>{onRetry&&<button className="btn btn-secondary" onClick={onRetry}>Try again</button>}</div>;}
export function Badge({children,tone='neutral'}){return <span className={`badge badge-${tone}`}>{children}</span>;}
export function money(value,currency='USD',locale='en'){try{return new Intl.NumberFormat(locale,{style:'currency',currency}).format(Number(value||0));}catch{return `${currency} ${Number(value||0).toFixed(2)}`;}}
export function formatDate(value,locale='en'){if(!value)return '—';try{return new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeStyle:'short'}).format(new Date(value));}catch{return String(value);}}
export function statusTone(value=''){const v=String(value).toUpperCase();if(['ACTIVE','PAID','DELIVERED','COMPLETED','PUBLISHED','IN_STOCK'].includes(v))return'good';if(['FAILED','CANCELLED','BLOCKED','DISABLED'].includes(v))return'bad';if(['PENDING','PENDING_PAYMENT','PROCESSING','PREPARING','SHIPPED','OUT_FOR_DELIVERY'].includes(v))return'warn';return'neutral';}
export function Toast({message,type='good',onClose}){if(!message)return null;return <div className={`toast toast-${type}`} onClick={onClose}>{message}</div>;}
