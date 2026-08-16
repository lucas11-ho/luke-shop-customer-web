import React from 'react';
import { Icon } from './icons.jsx';

// ── Theme-aware fulfillment status visual system ─────────────────────────────
// The BACKEND stores only the semantic status (e.g. OUT_FOR_DELIVERY).
// The Experience theme decides the icon pack + visual treatment.
//
// Integration boundary: resolveVisualPack() prefers experience.status_visual_pack
// (a future backend/Platform-Admin field). Until it ships we derive the pack from
// the existing experience.theme.preset. See BACKEND-INTEGRATION-REQUIREMENTS.md.

export const STATUS_LABELS = {
  PENDING: 'Pending', PENDING_PAYMENT: 'Awaiting payment', PAYMENT_FAILED: 'Payment failed',
  PAID: 'Paid', CONFIRMED: 'Confirmed', PROCESSING: 'Processing', RESTAURANT_ACCEPTED: 'Accepted',
  PREPARING: 'Preparing', READY: 'Ready for pickup', SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for delivery', PICKED_UP: 'Picked up', DELIVERED: 'Delivered',
  COMPLETED: 'Completed', FULFILLED: 'Fulfilled', FAILED: 'Failed', CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded', ACCESS_GRANTED: 'Access granted', AVAILABLE: 'Available', DOWNLOADED: 'Downloaded',
};

export function statusLabel(status) {
  const key = String(status || '').toUpperCase();
  return STATUS_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || '—';
}

export function statusTone(status) {
  const v = String(status || '').toUpperCase();
  if (['PAID', 'DELIVERED', 'COMPLETED', 'FULFILLED', 'PICKED_UP', 'CONFIRMED', 'ACCESS_GRANTED', 'AVAILABLE'].includes(v)) return 'good';
  if (['FAILED', 'PAYMENT_FAILED', 'CANCELLED', 'REFUNDED'].includes(v)) return 'bad';
  if (['PENDING', 'PENDING_PAYMENT', 'PROCESSING', 'PREPARING', 'READY', 'SHIPPED', 'OUT_FOR_DELIVERY', 'RESTAURANT_ACCEPTED'].includes(v)) return 'warn';
  return 'neutral';
}

const DEFAULT_ICONS = {
  PENDING: 'clock', PENDING_PAYMENT: 'clock', PAYMENT_FAILED: 'alert-triangle',
  PAID: 'check-circle', CONFIRMED: 'check-circle', PROCESSING: 'cog', RESTAURANT_ACCEPTED: 'check-circle',
  PREPARING: 'package', READY: 'shopping-bag', SHIPPED: 'package',
  OUT_FOR_DELIVERY: 'truck', PICKED_UP: 'shopping-bag', DELIVERED: 'package-check',
  COMPLETED: 'check-circle', FULFILLED: 'check-circle', FAILED: 'alert-triangle', CANCELLED: 'x-circle',
  REFUNDED: 'x-circle', ACCESS_GRANTED: 'unlock', AVAILABLE: 'sparkles', DOWNLOADED: 'download',
};

// Per-pack icon overrides on top of DEFAULT_ICONS.
const PACKS = {
  modern: {},
  luxury: { PREPARING: 'shopping-bag', SHIPPED: 'gift', DELIVERED: 'gift', COMPLETED: 'check-circle' },
  restaurant: { PENDING: 'receipt', PENDING_PAYMENT: 'receipt', PREPARING: 'chef-hat', READY: 'shopping-bag', PICKED_UP: 'shopping-bag', OUT_FOR_DELIVERY: 'scooter', DELIVERED: 'home' },
  electronics: { PENDING: 'radar', PENDING_PAYMENT: 'radar', PREPARING: 'cog', READY: 'package', SHIPPED: 'package', OUT_FOR_DELIVERY: 'truck', DELIVERED: 'package-check' },
  grocery: { PREPARING: 'shopping-bag', OUT_FOR_DELIVERY: 'truck', DELIVERED: 'package-check' },
  creator: { PAID: 'check-circle', PREPARING: 'unlock', READY: 'unlock', ACCESS_GRANTED: 'unlock', AVAILABLE: 'sparkles', DELIVERED: 'download', COMPLETED: 'check-circle' },
};


export const STATUS_VISUAL_PACK_OPTIONS = [
  ['AUTO','Automatic (template default)'],
  ['MODERN','Modern'],
  ['FASHION_LUXURY','Fashion Luxury'],
  ['RESTAURANT_MODERN','Restaurant Modern'],
  ['ELECTRONICS_PRO','Electronics Pro'],
  ['GROCERY_CLEAN','Grocery Clean'],
  ['DIGITAL_CREATOR','Digital Creator'],
];
const EXPLICIT_TO_INTERNAL = {
  AUTO:null, MODERN:'modern', FASHION_LUXURY:'luxury', RESTAURANT_MODERN:'restaurant',
  ELECTRONICS_PRO:'electronics', GROCERY_CLEAN:'grocery', DIGITAL_CREATOR:'creator',
};

const PRESET_TO_PACK = {
  luxury: 'luxury', fashion: 'luxury', fashion_modern: 'luxury', bold: 'luxury',
  restaurant: 'restaurant', fast_food: 'restaurant', cafe: 'restaurant',
  electronics: 'electronics', grocery: 'grocery', creator: 'creator',
  modern: 'modern', ios_minimal: 'modern', general: 'modern',
};

export function resolveVisualPack(experience) {
  const explicit = String(experience?.status_visual_pack || 'AUTO').toUpperCase();
  const resolvedExplicit = EXPLICIT_TO_INTERNAL[explicit];
  if (resolvedExplicit && PACKS[resolvedExplicit]) return resolvedExplicit;
  const preset = String(experience?.theme?.preset || '').toLowerCase();
  return PRESET_TO_PACK[preset] || 'modern';
}

export function statusIconName(status, pack = 'modern', iconOverrides = {}) {
  const key = String(status || '').toUpperCase();
  return iconOverrides?.[key] || (PACKS[pack] || {})[key] || DEFAULT_ICONS[key] || 'clock';
}

export function resolveStatusIconOverrides(experience) { return experience?.status_visuals?.icons || {}; }


export function StatusIcon({ status, visualPack = 'modern', iconOverrides = {}, size = 18, className = '' }) {
  return <Icon name={statusIconName(status, visualPack, iconOverrides)} size={size} className={`status-icon ${className}`.trim()} />;
}

export function StatusBadge({ status, visualPack = 'modern', iconOverrides = {} }) {
  const tone = statusTone(status);
  return (
    <span className={`status-badge status-badge-${tone}`} data-status-pack={visualPack}>
      <StatusIcon status={status} visualPack={visualPack} iconOverrides={iconOverrides} size={14} />
      <span>{statusLabel(status)}</span>
    </span>
  );
}

// ── Order progress stepper ───────────────────────────────────────────────────
// Chains are [semanticStatus, displayLabel]. Restaurant/food orders get a
// prep → ready → rider (out for delivery) → delivered flow tuned for kitchens.
const CHAINS = {
  SHIPPING: [['PAID', 'Paid'], ['PREPARING', 'Preparing'], ['SHIPPED', 'Shipped'], ['OUT_FOR_DELIVERY', 'Out for delivery'], ['DELIVERED', 'Delivered']],
  LOCAL_DELIVERY: [['PAID', 'Paid'], ['PREPARING', 'Preparing'], ['OUT_FOR_DELIVERY', 'Out for delivery'], ['DELIVERED', 'Delivered']],
  PICKUP: [['PAID', 'Paid'], ['PREPARING', 'Preparing'], ['READY', 'Ready for pickup'], ['PICKED_UP', 'Picked up']],
  DIGITAL_DOWNLOAD: [['PAID', 'Paid'], ['ACCESS_GRANTED', 'Access granted'], ['AVAILABLE', 'Available']],
};

const RESTAURANT_CHAINS = {
  LOCAL_DELIVERY: [['PAID', 'Confirmed'], ['PREPARING', 'Preparing'], ['READY', 'Ready'], ['OUT_FOR_DELIVERY', 'Rider on the way'], ['DELIVERED', 'Delivered']],
  SHIPPING: [['PAID', 'Confirmed'], ['PREPARING', 'Preparing'], ['READY', 'Ready'], ['OUT_FOR_DELIVERY', 'Rider on the way'], ['DELIVERED', 'Delivered']],
  PICKUP: [['PAID', 'Confirmed'], ['PREPARING', 'Preparing'], ['READY', 'Ready for pickup'], ['PICKED_UP', 'Picked up']],
  DIGITAL_DOWNLOAD: CHAINS.DIGITAL_DOWNLOAD,
};

const RANK = {
  PENDING_PAYMENT: 0, PENDING: 0, PAYMENT_FAILED: 0,
  PAID: 1, CONFIRMED: 1,
  PROCESSING: 2, PREPARING: 2, RESTAURANT_ACCEPTED: 2, ACCESS_GRANTED: 2,
  READY: 3, SHIPPED: 3, AVAILABLE: 3,
  OUT_FOR_DELIVERY: 4,
  PICKED_UP: 5, DELIVERED: 5,
  COMPLETED: 6, FULFILLED: 6,
};

export function primaryFulfillmentMode(order) {
  const modes = (order?.items || []).map((i) => i.fulfillment_mode);
  return modes.find((m) => CHAINS[m]) || 'SHIPPING';
}

// Current semantic status: prefer live fulfillment status, else order status.
function currentSemanticStatus(order) {
  const f = (order?.fulfillments || []).map((x) => x.status).filter(Boolean);
  if (f.length) return f.sort((a, b) => (RANK[b] || 0) - (RANK[a] || 0))[0];
  return order?.status || 'PENDING';
}

export function isTerminalFailure(order) {
  const s = String(order?.status || '').toUpperCase();
  return s === 'CANCELLED' || s === 'FAILED' || s === 'PAYMENT_FAILED';
}

// A food order is one where the store theme is restaurant-style OR any item is FOOD.
export function isRestaurantOrder(order, visualPack = 'modern') {
  if (visualPack === 'restaurant') return true;
  return (order?.items || []).some((i) => String(i.product_type || '').toUpperCase() === 'FOOD');
}

function resolveChain(order, visualPack) {
  const mode = primaryFulfillmentMode(order);
  const table = isRestaurantOrder(order, visualPack) ? RESTAURANT_CHAINS : CHAINS;
  return table[mode] || table.SHIPPING || CHAINS.SHIPPING;
}

export function computeProgress(order, visualPack = 'modern', iconOverrides = {}) {
  const chain = resolveChain(order, visualPack);
  const current = currentSemanticStatus(order);
  const currentRank = RANK[String(current).toUpperCase()] ?? 0;
  const terminal = isTerminalFailure(order);
  let currentAssigned = false;
  return chain.map(([step, label]) => {
    const r = RANK[step] ?? 0;
    let state = 'todo';
    if (r <= currentRank && !terminal) state = r === currentRank ? 'current' : 'done';
    if (state === 'current') { if (currentAssigned) state = 'done'; else currentAssigned = true; }
    return { key: step, label, state, icon: statusIconName(step, visualPack, iconOverrides) };
  });
}

export function OrderProgress({ order, visualPack = 'modern', iconOverrides = {} }) {
  const steps = computeProgress(order, visualPack, iconOverrides);
  return (
    <ol className="order-progress" data-status-pack={visualPack} aria-label="Order progress">
      {steps.map((s, i) => (
        <li key={s.key} className={`order-progress-step is-${s.state}`}>
          <span className="order-progress-dot">
            {s.state === 'done'
              ? <Icon name="check" size={15} />
              : <Icon name={s.icon} size={15} />}
          </span>
          <span className="order-progress-label">{s.label}</span>
          {i < steps.length - 1 && <span className="order-progress-bar" aria-hidden="true" />}
        </li>
      ))}
    </ol>
  );
}

export function StatusTimeline({ events = [], visualPack = 'modern', iconOverrides = {}, locale, formatDate }) {
  if (!events.length) return null;
  return (
    <ol className="status-timeline" data-status-pack={visualPack}>
      {events.map((e, i) => {
        const status = e.to_status || e.status;
        return (
          <li key={`${e.created_at}-${i}`} className={`status-timeline-item ${i === 0 ? 'is-latest' : ''}`}>
            <span className={`status-timeline-icon status-icon-${statusTone(status)}`}>
              <StatusIcon status={status} visualPack={visualPack} iconOverrides={iconOverrides} size={16} />
            </span>
            <div className="status-timeline-body">
              <strong>{statusLabel(status)}</strong>
              <small>{formatDate ? formatDate(e.created_at, locale) : e.created_at}{e.reason ? ` · ${e.reason}` : ''}</small>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
