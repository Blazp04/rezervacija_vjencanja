# Task: MT Pricing Rules UI

| | |
|---|---|
| **Epic** | 03 — Partner Catalog & Management |
| **Assignee** | Jelena Vučić |
| **Estimate** | 3 days |
| **Status** | Not Started |
| **Depends on** | Epic 01 Task 03 — Partner API (pricing endpoints exist) |

## Description

Build the UI for managing MT pricing rules on catalog items. The base price is already shown in the catalog item form (Epic 01). This task adds the ability to define special-day and specific-date price overrides — visible inline under each priceable catalog item.

## Acceptance Criteria

- [ ] Each catalog item row in the partner's Catalog tab has an expand toggle showing its pricing rules
- [ ] Expanded section shows all pricing rules as a table: type, day/date, price, valid from/to, delete action
- [ ] "Add rule" button opens inline form with fields:
  - Rule type: Special Day / Specific Date (radio/select)
  - If Special Day: day-of-week selector (Monday–Sunday)
  - If Specific Date: date picker
  - Price (decimal)
  - Valid From / Valid To (optional date pickers)
- [ ] Submit adds the rule via `POST /api/catalog-items/{id}/pricing`
- [ ] Delete button removes rule via `DELETE /api/catalog-items/{id}/pricing/{ruleId}`
- [ ] SONG items do not show pricing section (no price for songs)
- [ ] Pricing rules list is sorted: SPECIFIC_DATE entries first, then SPECIAL_DAY
- [ ] Base price visible at top of pricing section as read-only (edit goes through catalog item form)

## Technical Notes

**API endpoints from Epic 01:**
- `GET /api/catalog-items/{id}/pricing`
- `POST /api/catalog-items/{id}/pricing`
- `PUT /api/catalog-items/{id}/pricing/{ruleId}`
- `DELETE /api/catalog-items/{id}/pricing/{ruleId}`

These are already built in Epic 01 — no backend work needed here.

**Day of week mapping** (1=Monday...7=Sunday — matches DB constraint):
```ts
const DAYS_OF_WEEK = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
]
```

**UX note:** Keep the pricing section collapsed by default — most catalog items will only have a base price. Only expand when the user explicitly clicks.
