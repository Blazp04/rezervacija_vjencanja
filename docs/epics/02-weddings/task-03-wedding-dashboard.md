# Task: Dashboard & Wedding Detail Page

| | |
|---|---|
| **Epic** | 02 — Weddings & Templates |
| **Assignee** | Vinko Jakeljić |
| **Estimate** | 3 days |
| **Status** | Not Started |
| **Depends on** | Task 02-02 — Wedding CRUD |

## Description

Build the main wedding dashboard (the app's home screen) and the full wedding detail page. The dashboard is the first thing the agency sees — it should give a clear overview of all weddings at a glance. The detail page is the hub for managing a specific wedding.

## Acceptance Criteria

**Dashboard (`/` or `/weddings`):**
- [ ] Lists all weddings sorted by date (ascending, upcoming first)
- [ ] Filter by: status (multi-select chips), date range (from/to)
- [ ] Search by wedding name
- [ ] Each wedding card/row shows: name, date, location, status badge, number of partners assigned
- [ ] "Quick stats" header: total weddings, weddings this month, weddings in PREPARATION
- [ ] Empty state displayed when no weddings match filters
- [ ] "New Wedding" button navigates to create form

**Wedding Detail Page (`/weddings/:id`):**
- [ ] Header: wedding name, date, location, status with advance-status button
- [ ] **Info** tab: all wedding fields with inline edit option
- [ ] **Partners** tab: placeholder section — "Partners will appear here (Epic 04)"
- [ ] **Documents** tab: placeholder — "PDF generation coming in Epic 05"
- [ ] Breadcrumb: Dashboard → Wedding name
- [ ] Status badge is colour-coded: PREPARATION=blue, CONFIRMED=green, COMPLETED=grey, CANCELLED=red

## Technical Notes

No new API endpoints needed — reuse `GET /api/weddings` with query params for filters.

**Frontend routing:**
```
/              → redirect to /weddings
/weddings      → DashboardPage (list)
/weddings/:id  → WeddingDetailPage
```

**Status colour map (example using CSS classes or Tailwind):**
```ts
const STATUS_COLORS = {
  PREPARATION: 'blue',
  CONFIRMED:   'green',
  COMPLETED:   'gray',
  CANCELLED:   'red',
}
```

Keep the Partners tab and Documents tab as stub components now — Epic 04 and Epic 05 will fill them in. This avoids merge conflicts: Epic 04 (Marija) adds to the Partners tab, Epic 05 (Vinko) adds to the Documents tab.
