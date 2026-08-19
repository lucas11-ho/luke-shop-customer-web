# Technical Analysis — v0.11.0 Localization Pro

Localization is layered on top of one canonical commerce identity. A product remains one product; languages add display values only.

Customer configuration is read from `experience.localization`:
- `enabled`
- `default_locale`
- `enabled_locales` (maximum 4)
- `locales`
- `translations`

Translation maps support stable public IDs/slugs for categories/products/modifiers/promotions and section IDs for home content.

The runtime deliberately separates:
1. Luke system UI dictionaries (English/Burmese/Indonesian), and
2. Merchant-authored storefront content translations.

A fourth tenant language is supported through merchant/admin translation content and optional UI overrides. If Luke has no built-in system dictionary for that locale, untranslated system labels fall back safely instead of becoming blank.

Security: translation values are treated as plain strings in Customer Web. No arbitrary HTML or script execution is introduced.
