# Task: Partner Assignment CRUD

| | |
|---|---|
| **Epic** | 04 — Wedding-Partner Linking |
| **Assignee** | Marija Musa |
| **Estimate** | 3 days |
| **Status** | Not Started |
| **Depends on** | Epic 01 (Partner API), Epic 02 Task 02 (Wedding CRUD) |

## Description

Implement the ability to assign a partner (and optionally a specific catalog item) to a wedding, view all assigned partners, and remove an assignment. This fills in the Partners tab on the Wedding detail page (stub left by Epic 02).

## Acceptance Criteria

**Backend:**
- [ ] `GET /api/weddings/{id}/partners` — returns all WeddingPartner records for a wedding, including partner name, type, catalog item name, planned price, actual price, commission, status
- [ ] `POST /api/weddings/{id}/partners` — assigns a partner to the wedding
  - Request body: `{ partnerId, catalogItemId (optional), notes }`
  - Sets `CommissionPercent` = snapshot of `Partners.CommissionPercent`
  - Sets `PlannedPrice` via MT pricing (see Task 02) if catalogItemId provided
  - Sets Status = `PROPOSED`
- [ ] `PUT /api/weddings/{id}/partners/{wpId}` — update notes or catalogItemId
- [ ] `DELETE /api/weddings/{id}/partners/{wpId}` — removes assignment (allowed unless status = CONFIRMED)

**Frontend (Wedding Detail → Partners tab):**
- [ ] Partners tab shows table: partner name, type badge, selected service, planned price, actual price, commission %, commission amount, status badge, actions
- [ ] "Add Partner" button opens a form:
  - Partner search/select (dropdown with search, filtered by active partners)
  - Catalog item select (loads items for selected partner)
  - Notes textarea
- [ ] Planned price shown immediately after catalog item is selected (calls pricing endpoint)
- [ ] Remove partner button (with confirmation) — disabled if status is CONFIRMED
- [ ] Summary row at bottom: total planned, total actual, total commission

## Technical Notes

**Controller:** `WeddingPartnersController.cs`  
**Service:** `IWeddingPartnerService` + `WeddingPartnerService`

**Commission amount calculation (done in service/DTO mapping):**
```
commissionAmount = actualPrice * (commissionPercent / 100)
clientPrice = actualPrice + commissionAmount
```

This is computed on read — not stored.

**Loading catalog items for selected partner:**  
Reuse existing `GET /api/partners/{id}/catalog` endpoint. Call it from the frontend when user selects a partner in the "Add Partner" form.
