# Technical Analysis — Customer Web v0.9.2

The browser never receives the backend Google Geocoding key. It requests an authenticated map configuration from Luke Backend and receives only the browser-restricted Maps JavaScript key. Google Maps is loaded from `maps.googleapis.com` with origin referrer authorization policy.

Address search uses the current Places API (New) `PlaceAutocompleteElement` and `gmp-select` event instead of the legacy Autocomplete service. The map uses a fixed center pin rather than the deprecated legacy Marker API: the user searches or pans the map, confirms the center coordinate, then Luke Backend performs reverse geocoding and fills the existing editable address fields.
