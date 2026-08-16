# Customer Web v0.9.0 deployment checklist

1. Deploy Shop Backend v0.14.0 + migration 015 first.
2. Configure Store Settings with the exact Luke CS Chat HTTPS URL and platform route key.
3. Deploy Customer Web v0.9.0.
4. Open support from Home/Profile and from an owned Order Detail page.
5. Confirm the iframe receives context by postMessage and that no support context/token appears in the browser URL.
6. Confirm wrong-origin messages are ignored and expired/revoked Shop contexts are rejected server-side.
