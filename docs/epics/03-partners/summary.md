# Epic 03 — Partner Catalog & Management

**Assignee:** Jelena Vučić  
**Status:** Not Started  
**Depends on:** Epic 01 (all tasks complete)  
**Follow-up:** Task 05-04 (CSV Export) when this epic is complete

---

## Goal

Extend the base partner system (built in Epic 01) with the full catalog management experience: detailed metadata editing per partner type, MT pricing rules UI, band member management, booking calendar view, CSV import/export, and the partner clone feature.

## What Epic 01 Already Provides

Epic 01 delivers working partner CRUD with a basic catalog items list. This epic builds the **details on top**:

- Epic 01 → basic catalog item form (name, category, description, itemType, basePrice)
- This epic → rich metadata editor per type, pricing rules management, CSV import, calendar, clone

## Tasks

| Task | Title | Estimate |
|------|-------|----------|
| [task-01-catalog-management.md](task-01-catalog-management.md) | Catalog Item Metadata Editor | 4 days |
| [task-02-pricing-rules-ui.md](task-02-pricing-rules-ui.md) | MT Pricing Rules UI | 3 days |
| [task-03-band-members.md](task-03-band-members.md) | Band Member Management | 2 days |
| [task-04-booking-calendar.md](task-04-booking-calendar.md) | Booking Calendar View | 3 days |
| [task-05-csv-import-export.md](task-05-csv-import-export.md) | CSV Import for Catalogs | 3 days |
| [task-06-partner-clone.md](task-06-partner-clone.md) | Partner Clone | 1 day |

**Total estimate:** ~16 days

## Definition of Done

- [ ] Each partner type has a correctly rendered metadata form in the catalog item editor
- [ ] MT pricing rules (special days, specific dates) can be added/edited/deleted per catalog item
- [ ] Band members can be managed from the partner detail page
- [ ] Partners with HasBooking=true have a bookings/availability view
- [ ] CSV import works for all catalog item types
- [ ] CSV export works for partner catalog
- [ ] Partner clone creates a full deep copy accessible under a new name
