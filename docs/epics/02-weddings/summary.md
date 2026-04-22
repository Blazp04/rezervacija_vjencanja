# Epic 02 — Weddings & Templates

**Assignee:** Vinko Jakeljić  
**Status:** Not Started  
**Depends on:** Epic 01 (Task 02 — DB schema must be applied)  
**Follow-up:** Task 05-01 (Client Offer PDF) when this epic is complete

---

## Goal

Implement the full wedding management module: templates (presets), wedding CRUD, status flow, and the wedding dashboard. This is the primary day-to-day view the agency uses to see all upcoming weddings.

## Deliverables

- Template management (CRUD)
- Wedding management (CRUD with status flow)
- Wedding dashboard (list with filters)
- Wedding detail page (overview — partner list populated by Epic 04)

## Tasks

| Task | Title | Estimate |
|------|-------|----------|
| [task-01-templates-crud.md](task-01-templates-crud.md) | Templates CRUD | 3 days |
| [task-02-wedding-crud.md](task-02-wedding-crud.md) | Wedding CRUD | 3 days |
| [task-03-wedding-dashboard.md](task-03-wedding-dashboard.md) | Dashboard & Wedding Detail | 3 days |

**Total estimate:** ~9 days

## Definition of Done

- [ ] Templates can be created, edited, and deleted
- [ ] Weddings can be created (with template selection), edited, and cancelled
- [ ] Wedding status can be advanced through the flow (PREPARATION → CONFIRMED → COMPLETED)
- [ ] Dashboard shows all weddings with filter by status and date range
- [ ] Wedding detail page shows all wedding fields
- [ ] All endpoints return correct HTTP status codes
- [ ] No uncaught errors in browser console
