# Technical Analysis — Customer Web v0.9.1

Customer Web treats Google, Telegram and Turnstile output as short-lived proof submitted to Luke Shop Backend. It does not decode provider data into an authenticated Shop session by itself.

Google is rendered by `google.accounts.id.renderButton`. Telegram uses the official Login library with a nonce fetched from Backend. Turnstile uses explicit rendering and sends the resulting token only to the relevant authentication request.

No provider client secret, bot token, Turnstile secret, Shop JWT signing key, or service credential is bundled into Customer Web.
