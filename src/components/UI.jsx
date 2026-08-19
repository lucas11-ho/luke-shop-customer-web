import React from 'react';
import { Icon } from './icons.jsx';

export function Spinner({ label = 'Loading…' }) {
  return <div className="state"><div className="spinner" /><span>{label}</span></div>;
}

export function Empty({ title, body, action, icon = 'bag' }) {
  return (
    <div className="empty" data-testid="empty-state">
      <div className="empty-icon"><Icon name={icon} size={26} /></div>
      <h3>{title}</h3>
      {body && <p>{body}</p>}
      {action}
    </div>
  );
}

// Map known backend business error codes → customer-friendly copy.
const FRIENDLY_ERRORS = {
  TENANT_NOT_FOUND: { title: 'Store unavailable', body: "This storefront doesn't exist or is currently unavailable." },
  STORE_NOT_FOUND: { title: 'Store unavailable', body: 'This store is currently unavailable. Please try again later.' },
  STOREFRONT_NOT_FOUND: { title: 'Store unavailable', body: 'This storefront could not be found.' },
  STOREFRONT_ROUTE_REQUIRED: { title: 'Choose a store', body: 'Open a store link (for example /t/your-store) to start shopping.' },
  PREVIEW_TOKEN_INVALID: { title: 'Preview link expired', body: 'This preview link is no longer valid. Ask the store to share a fresh preview.' },
  NETWORK_ERROR: { title: "Can't reach the store", body: 'Please check your connection and try again.' },
  MODIFIER_SELECTION_INVALID: { title: 'Review product options', body: 'Please choose the required product options and try again.' },
};

export function friendlyError(err) {
  const code = typeof err === 'string' ? err : err?.code;
  if (code && FRIENDLY_ERRORS[code]) return FRIENDLY_ERRORS[code];
  const message = typeof err === 'string' ? err : err?.message;
  return { title: 'Something went wrong', body: message || 'Please try again in a moment.' };
}

export function ErrorState({ message, code, onRetry }) {
  const friendly = friendlyError(code || message);
  return (
    <div className="error-card" data-testid="error-state">
      <div className="empty-icon error-icon"><Icon name="alert-triangle" size={26} /></div>
      <strong>{friendly.title}</strong>
      <span>{friendly.body}</span>
      {onRetry && <button className="btn btn-secondary" onClick={onRetry}><Icon name="cog" size={16} /> Try again</button>}
    </div>
  );
}

export function Badge({ children, tone = 'neutral', icon }) {
  return <span className={`badge badge-${tone}`}>{icon && <Icon name={icon} size={12} />}{children}</span>;
}

export function money(value, currency = 'USD', locale = 'en') {
  try { return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(Number(value || 0)); }
  catch { return `${currency} ${Number(value || 0).toFixed(2)}`; }
}

export function formatDate(value, locale = 'en') {
  if (!value) return '—';
  try { return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)); }
  catch { return String(value); }
}

export function statusTone(value = '') {
  const v = String(value).toUpperCase();
  if (['ACTIVE', 'PAID', 'DELIVERED', 'COMPLETED', 'PUBLISHED', 'IN_STOCK'].includes(v)) return 'good';
  if (['FAILED', 'CANCELLED', 'BLOCKED', 'DISABLED'].includes(v)) return 'bad';
  if (['PENDING', 'PENDING_PAYMENT', 'PROCESSING', 'PREPARING', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(v)) return 'warn';
  return 'neutral';
}

export function Toast({ message, type = 'good', onClose }) {
  if (!message) return null;
  return (
    <div className={`toast toast-${type}`} role="status" onClick={onClose} data-testid="toast">
      <Icon name={type === 'good' ? 'check-circle' : 'alert-triangle'} size={16} />
      <span>{message}</span>
    </div>
  );
}
