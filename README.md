# LUKE_SHOP_CUSTOMER_WEB — current release v0.9.2

Customer Web v0.9.2 adds **Google Maps + Delivery Address Pro** for Shop Backend v0.14.2.

- Google Maps address/place search using the current Places API (New) `PlaceAutocompleteElement`.
- Interactive delivery map with a fixed center pin designed for mobile map panning.
- Use current device location, confirm map pin, reverse-geocode through Luke Backend, then edit/confirm written fields.
- Map is integrated into saved-address management and manual checkout delivery addresses.
- Browser map key is loaded at runtime from the authenticated backend map-config endpoint; no Google secret is stored in Customer Web source.
- Manual address and GPS-only fallback remain available when map configuration fails.

See `RELEASE_NOTES_v0.9.2.md`, `TECHNICAL_ANALYSIS_v0.9.2.md`, `TEST_RESULT_v0.9.2.md` and `DEPLOYMENT_CHECKLIST_v0.9.2.md`.
