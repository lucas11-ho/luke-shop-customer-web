# Luke Shop Customer Web v0.7.0 — Integration Status

This release is integrated with Luke Shop Backend v0.12.0. The previous Emergent prototype boundaries for customer GPS, live customer location and `status_visual_pack` are now implemented by the real Luke Shop backend/admin architecture. No mock FastAPI/Mongo backend is used.

## Implemented in Backend v0.12.0

- `experience.status_visual_pack` canonical enum: `AUTO`, `MODERN`, `FASHION_LUXURY`, `RESTAURANT_MODERN`, `ELECTRONICS_PRO`, `GROCERY_CLEAN`, `DIGITAL_CREATOR`.
- Saved customer address coordinates: `latitude`, `longitude`, `accuracy_meters`, `location_source`, `location_updated_at`.
- Immutable checkout order-address location snapshot.
- Customer order precise-location update endpoint.
- Explicit opt-in live customer-location sessions with start/ping/stop, expiry, order ownership and terminal-order guards.
- Separate `estimated_ready_at` and `estimated_delivery_at` fulfillment fields.
- Customer order details expose product type so food orders render restaurant-specific progress correctly.
- Customer order list provides item count and delivery estimate where available.

## Still intentionally deferred

### Courier / driver live location
A real courier map requires a separate authenticated courier/driver location source and a map-provider decision. Customer Web does **not** invent courier coordinates.

Future contract should provide a read-only courier point for the ordering customer while delivery is active, for example:

```json
{
  "latitude": 12.34,
  "longitude": 56.78,
  "accuracy_meters": 8,
  "updated_at": "...",
  "eta_minutes": 12
}
```

### True draggable geographic map pin
Customer Web v0.7.0 captures the browser's permissioned GPS coordinate and allows the customer to update/reconfirm it. A true drag-to-map-point editor is deferred until a map SDK/provider is chosen, because moving a decorative pin without a projection must never pretend to change latitude/longitude.

### Optional atomic reorder endpoint
`Order again` works through the existing cart endpoint, so each historical product/variant/modifier is revalidated using current availability, stock and price. An atomic server-side reorder endpoint remains optional for performance only.

## Security / privacy

- Location is opt-in and customer-controlled.
- Live sharing has explicit start/stop and backend expiry.
- Live location automatically becomes unavailable after terminal fulfillment/order states.
- Customer Web never claims GPS is perfectly exact; accuracy is displayed in meters.
- Semantic order statuses remain backend data; visual packs only control presentation.
