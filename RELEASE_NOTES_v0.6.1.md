# Luke Shop Customer Web v0.6.1 — Storefront Renderer Reliability & Media Fallbacks

Date: 2026-08-15
Base: v0.6.0
Required backend: v0.11.1

## Fixed

- Typography button_case now changes real storefront action/navigation rendering.
- Customer Experience support=false suppresses the actual Luke CS launcher.
- Customer Experience stock_status=false suppresses Product Card stock labels.
- Important storefront images fall back cleanly when a stale/missing media URL cannot load.
- Store Designer postMessage preview still updates the same real Customer Web renderer.

A frontend fallback cannot restore missing media bytes. After production R2 is configured, stale assets should be re-uploaded/reselected in Merchant Admin.
