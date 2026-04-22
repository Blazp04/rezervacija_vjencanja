# Task: Status Flow & Confirmation UI

| | |
|---|---|
| **Epic** | 04 — Wedding-Partner Linking |
| **Assignee** | Marija Musa |
| **Estimate** | 3 days |
| **Status** | Not Started |
| **Depends on** | Task 04-01, Task 04-02, Task 04-03 |

## Description

Implement the full partner status flow on the wedding detail Partners tab: advancing status from PROPOSED → OFFERED → CONFIRMED → CANCELLED, enforcing that actual price is required at confirmation, and showing commission calculations.

## Acceptance Criteria

**Backend:**
- [ ] `PATCH /api/weddings/{id}/partners/{wpId}/status` — update status to PROPOSED or OFFERED or CANCELLED
- [ ] `PATCH /api/weddings/{id}/partners/{wpId}/confirm` — advance to CONFIRMED (separate endpoint, includes actual price + booking time)
- [ ] Transitions allowed:
  - PROPOSED → OFFERED ✅
  - PROPOSED → CANCELLED ✅
  - OFFERED → CONFIRMED ✅ (requires ActualPrice + time range)
  - OFFERED → CANCELLED ✅
  - CONFIRMED → CANCELLED ✅ (also deletes the Booking row)
  - CONFIRMED → anything else ❌ (except CANCELLED)
- [ ] `ActualPrice` is required (non-null, > 0) when confirming
- [ ] When a CONFIRMED partner is cancelled: the associated `Bookings` row is deleted

**Frontend (Partners tab on Wedding Detail):**
- [ ] Each partner row has a status badge that is clickable
- [ ] Clicking status badge opens a dropdown/popover showing allowed next states
- [ ] Clicking CONFIRMED opens a "Confirm Partner" modal with fields:
  - Actual Price (required, decimal)
  - Booking start time (pre-filled with wedding start time)
  - Booking end time (pre-filled with start + estimated duration)
  - Notes
- [ ] After confirmation, row shows actual price, commission %, and commission amount
- [ ] Cancelled partners shown with strikethrough / greyed out but remain in the list
- [ ] At the bottom of the partner list, show totals:
  - Total planned price (confirmed partners only)
  - Total actual price (confirmed partners only)
  - Total agency commission (confirmed partners only)
  - Total client price (actual + commission)

## Technical Notes

**Status badge colour:**
```
PROPOSED  → grey
OFFERED   → yellow/orange
CONFIRMED → green
CANCELLED → red (strikethrough row)
```

**Commission calculation (display only, not stored):**
```
commissionAmount = actualPrice × (commissionPercent / 100)
clientPrice      = actualPrice + commissionAmount
```

Stored in DB: `ActualPrice` and `CommissionPercent` (snapshot).  
Calculated on read: commission amount and client price.

**When cancelling a CONFIRMED partner:**
```csharp
// In WeddingPartnerService.CancelAsync:
var booking = await _db.Bookings.FirstOrDefaultAsync(b => b.WeddingPartnerId == wpId);
if (booking != null) _db.Bookings.Remove(booking);
weddingPartner.Status = "CANCELLED";
await _db.SaveChangesAsync();
```
