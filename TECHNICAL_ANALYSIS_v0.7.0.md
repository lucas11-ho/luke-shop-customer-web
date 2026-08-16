# Technical Analysis — Customer Web v0.7.0

The Emergent export was treated only as a presentation candidate. Its outer FastAPI/Mongo scaffold was discarded. The nested `luke-shop-customer-web` retained Luke's existing API client, auth/session model, tenant/store routing, Experience Engine, signed preview, cart/checkout/orders and Luke CS integration.

Integration repairs include the historical modifier snapshot ID mapping (`selected_modifiers[].id`), canonical status-visual-pack enums, removal of prototype-only GPS persistence, real Backend v0.12.0 live-location calls, and separation of kitchen-ready vs delivery ETA semantics.


Status visual mappings are resolved by Backend from Platform-managed packs. Customer Web keeps safe canonical fallbacks but prefers `experience.status_visuals.icons`, so Platform Control Center can update approved visuals without changing order workflow data.
