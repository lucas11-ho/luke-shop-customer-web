# Deployment Checklist — Customer Web v0.7.0

- [ ] Backend v0.12.0 deployed.
- [ ] Migration 013 applied after database snapshot.
- [ ] Customer Web uses the production Backend API base URL.
- [ ] Verify tenant route `/t/<tenant-slug>`.
- [ ] Verify signed Store Designer preview.
- [ ] Verify saved address GPS only after explicit browser permission.
- [ ] Verify checkout snapshots the confirmed location.
- [ ] Verify active-order delivery location can be updated.
- [ ] Verify live sharing can start, ping and stop.
- [ ] Verify live sharing is unavailable after terminal order/fulfillment.
- [ ] Verify status visual pack changes only presentation, not semantic status.
- [ ] Verify restaurant progress and separate ready/delivery estimates.
- [ ] Verify Order Again revalidates current cart rules.
