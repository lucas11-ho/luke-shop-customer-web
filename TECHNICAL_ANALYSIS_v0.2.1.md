# Technical Analysis — Customer Web v0.2.1

The browser pathname/hostname is resolved first. Customer Web asks Backend for authoritative tenant/store context, then sets a runtime context used by all normal storefront/customer API calls. Tenant selection is not taken from customer-controlled API headers alone; Backend validates the selected tenant/store. Sessions include tenant slug and cannot be reused after switching tenant routes.
