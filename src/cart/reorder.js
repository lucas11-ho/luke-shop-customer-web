// Safe reorder over the EXISTING cart contract.
// We do NOT blindly clone a historical order. Each item is re-added through
// POST /v1/customer/cart/items, which the backend re-validates against the
// CURRENT product/variant/modifier state, pricing and stock. Items that are no
// longer valid surface as per-item failures so the shopper is told exactly what
// changed. No new API is invented; see BACKEND-INTEGRATION-REQUIREMENTS.md for
// the optional atomic server-side reorder endpoint.

export async function reorderItems({ addItem, order }) {
  const items = order?.items || [];
  const failed = [];
  let added = 0;
  for (const it of items) {
    try {
      await addItem({
        product_id: it.product_id,
        variant_id: it.variant_id || undefined,
        quantity: it.quantity || 1,
        fulfillment_mode: it.fulfillment_mode,
        modifier_option_ids: (it.selected_modifiers || []).map((m) => m.public_id || m.id).filter(Boolean),
      });
      added += 1;
    } catch (e) {
      failed.push({ title: it.title_snapshot || 'An item', reason: e?.message || 'This item is no longer available.' });
    }
  }
  return { added, failed, total: items.length };
}

export function canReorder(status) {
  return ['DELIVERED', 'COMPLETED', 'PICKED_UP', 'FULFILLED', 'CANCELLED'].includes(String(status || '').toUpperCase());
}
