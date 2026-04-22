# Task: Booking Conflict Detection

| | |
|---|---|
| **Epic** | 04 — Wedding-Partner Linking |
| **Assignee** | Marija Musa |
| **Estimate** | 2 days |
| **Status** | Not Started |
| **Depends on** | Task 04-01 — Partner Assignment CRUD |

## Description

Implement booking conflict detection for partners that require booking (BAND, PHOTOGRAPHER, VENUE). When a WeddingPartner is confirmed, the system checks if the partner already has a booking that overlaps with the wedding time slot. If so, confirmation is blocked.

## Acceptance Criteria

- [ ] Conflict check runs when `PATCH /api/weddings/{id}/partners/{wpId}/confirm` is called
- [ ] Conflict check queries the `Bookings` table for overlapping time slots for the same partner
- [ ] If a conflict exists: API returns `409 Conflict` with the conflicting wedding name, date, and time range
- [ ] If no conflict: a new `Bookings` row is created and `WeddingPartners.Status` is set to `CONFIRMED`
- [ ] Conflict detection is skipped for partner types where `PartnerTypes.HasBooking = false`
- [ ] Booking time range = wedding `DateTime` to `DateTime + catalog item duration` (if duration in metadata); fallback = wedding DateTime to DateTime + 4 hours
- [ ] Frontend: if `409` returned, show clear error message with the conflicting wedding details
- [ ] Frontend: conflict error shows on the status action button, not a generic toast
- [ ] Pre-check: `GET /api/partners/{id}/availability` endpoint (built in Epic 03) can be used to show availability before confirming

## Technical Notes

**Confirm endpoint:**
```
PATCH /api/weddings/{id}/partners/{wpId}/confirm
Body: { actualPrice: decimal, startDateTime: DateTime, endDateTime: DateTime }
```

Both `startDateTime` and `endDateTime` are provided by the client to allow flexibility (e.g. band that plays from 20:00 to 01:00).

**Conflict query:**
```csharp
var hasConflict = await _db.Bookings
    .AnyAsync(b => b.PartnerId == partnerId
               && b.Id != existingBookingId   // ignore own booking on re-confirm
               && b.StartDateTime < endDateTime
               && b.EndDateTime   > startDateTime);
```

The overlap condition `start1 < end2 AND end1 > start2` correctly detects any overlap, including partial overlaps.

**Booking row creation (only on success):**
```csharp
var booking = new Booking {
    PartnerId        = weddingPartner.PartnerId,
    WeddingId        = weddingPartner.WeddingId,
    WeddingPartnerId = weddingPartner.Id,
    StartDateTime    = startDateTime,
    EndDateTime      = endDateTime,
};
_db.Bookings.Add(booking);
weddingPartner.Status      = "CONFIRMED";
weddingPartner.ActualPrice = request.ActualPrice;
await _db.SaveChangesAsync();
```

Use a DB transaction to ensure the booking and status update are atomic.
