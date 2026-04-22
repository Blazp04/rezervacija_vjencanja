# Task: Partner Clone

| | |
|---|---|
| **Epic** | 03 — Partner Catalog & Management |
| **Assignee** | Jelena Vučić |
| **Estimate** | 1 day |
| **Status** | Not Started |
| **Depends on** | Epic 01 Task 03 — Partner API (clone endpoint already built) |

## Description

Wire up the partner clone button in the UI and verify the clone flow end-to-end. The backend clone endpoint was built in Epic 01 Task 03 — this task is mostly frontend confirmation and UX polish.

## Acceptance Criteria

- [ ] Clone button on partner list (row action) and on partner detail page header
- [ ] Clicking clone shows a confirmation dialog: "Clone [Partner Name]? A full copy including all catalog items will be created."
- [ ] On confirm, calls `POST /api/partners/{id}/clone`
- [ ] On success: navigates to the cloned partner's detail page
- [ ] Cloned partner name has " (kopija)" appended
- [ ] Cloned partner has copies of all catalog items (verify in UI)
- [ ] Cloned partner has copies of all pricing rules
- [ ] Cloned partner has copies of band members (if BAND type)
- [ ] Cloned partner has NO bookings (bookings are not copied)
- [ ] Loading state on clone button during API call

## Technical Notes

The backend logic for this is described in Epic 01 Task 03. Verify it was implemented correctly:
- New Partner row with all same field values, Name += " (kopija)"
- New PartnerCatalogItems rows with new Ids and new PartnerId
- New PricingRules rows with new CatalogItemIds
- New BandMembers rows with new PartnerId
- All done in one DB transaction

If the backend clone is not yet complete from Epic 01, implement it here as part of this task.
