# Epic 04 — Wedding-Partner Linking

**Assignee:** Marija Musa  
**Status:** Not Started  
**Depends on:** Epic 01 (all tasks complete); Epic 02 (Task 02-02 — Wedding CRUD) for the UI integration point  
**Follow-up:** Task 05-02 + Task 05-03 (Client Invoice + Internal Report) when this epic is complete

---

## Goal

Implement the full wedding-partner linking system: assigning partners and their catalog items to a wedding, automatic MT price calculation, booking conflict detection, and partner status flow. This is the core business logic of the application.

## Deliverables

- `WeddingPartners` CRUD (assign, update, remove)
- MT price auto-calculation on assignment
- Conflict detection for bookable partners (band, photographer, venue)
- Status flow: PROPOSED → OFFERED → CONFIRMED → CANCELLED
- Actual price entry on confirmation
- Commission calculation
- The Partners tab on the Wedding detail page (stub left by Epic 02)

## Tasks

| Task | Title | Estimate |
|------|-------|----------|
| [task-01-partner-assignment.md](task-01-partner-assignment.md) | Partner Assignment CRUD | 3 days |
| [task-02-pricing-calculation.md](task-02-pricing-calculation.md) | MT Pricing Auto-Calculation | 2 days |
| [task-03-conflict-detection.md](task-03-conflict-detection.md) | Booking Conflict Detection | 2 days |
| [task-04-status-management.md](task-04-status-management.md) | Status Flow & Confirmation | 3 days |

**Total estimate:** ~10 days

## Definition of Done

- [ ] Partners can be assigned to a wedding with a selected catalog item
- [ ] Planned price is auto-calculated and shown on assignment
- [ ] Conflict detection blocks confirmation for overlapping bookable partners
- [ ] Status advances through PROPOSED → OFFERED → CONFIRMED with business rules enforced
- [ ] Actual price is required when confirming a partner
- [ ] Commission amount (agency fee) calculated and shown
- [ ] Wedding detail Partners tab fully populated
