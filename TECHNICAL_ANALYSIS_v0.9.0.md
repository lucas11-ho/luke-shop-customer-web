# Technical analysis — Customer Web v0.9.0

The support context remains a Shop-issued short-lived JWT. It is never appended to `chat_url`, query parameters or fragments. The iframe target must be HTTPS and may not embed URL credentials. `postMessage` uses the target iframe origin and receiver window identity. The customer session remains owned by Shop; Luke CS receives only the short-lived support context needed for read-only commerce questions.
