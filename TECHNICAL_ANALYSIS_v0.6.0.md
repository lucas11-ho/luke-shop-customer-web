# Technical Analysis — Customer Web v0.6.0

The previous profile surface exposed account information but left editing/address management for a future release. v0.6.0 wires the new bounded customer self-service backend routes.

Saved addresses remain profile records; checkout still submits an address snapshot so changing an address later cannot mutate historical orders. Session management uses stable public session IDs introduced by migration 012 and never exposes refresh-token hashes.
