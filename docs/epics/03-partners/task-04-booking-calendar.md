# Task: Booking Calendar View

| | |
|---|---|
| **Epic** | 03 — Partner Catalog & Management |
| **Assignee** | Jelena Vučić |
| **Estimate** | 3 days |
| **Status** | Not Started |
| **Depends on** | Epic 01 Task 04 — Partner UI |

## Description

Build a bookings/availability view for partners that support booking (BAND, PHOTOGRAPHER, VENUE). From the partner detail page, an **Availability** tab shows all future bookings as a simple timeline or list, making it easy to see when the partner is busy.

## Acceptance Criteria

- [ ] Availability tab only visible for partners where `PartnerType.HasBooking == true`
- [ ] Tab shows all bookings for this partner sorted by StartDateTime (ascending)
- [ ] Each booking entry shows: wedding name, date, start time, end time, status (linked from WeddingPartner.Status)
- [ ] Past bookings shown below a divider (or in a collapsible "History" section)
- [ ] "Check availability" form: pick a date range and the system indicates if partner is free or shows conflicting bookings
- [ ] Backend: `GET /api/partners/{id}/bookings` — returns all bookings for the partner
- [ ] Backend: `GET /api/partners/{id}/availability?start=YYYY-MM-DDTHH:mm&end=YYYY-MM-DDTHH:mm` — returns `{ available: bool, conflicts: Booking[] }`

## Technical Notes

**New API endpoints needed (add to `PartnersController`):**

```csharp
// GET /api/partners/{id}/bookings
[HttpGet("{id}/bookings")]
public async Task<IActionResult> GetBookings(int id)

// GET /api/partners/{id}/availability
[HttpGet("{id}/availability")]
public async Task<IActionResult> CheckAvailability(int id, [FromQuery] DateTime start, [FromQuery] DateTime end)
```

**Conflict check query:**
```csharp
await _db.Bookings
    .Where(b => b.PartnerId == id
             && b.StartDateTime < end
             && b.EndDateTime > start)
    .Include(b => b.Wedding)
    .ToListAsync();
```

**Note:** Bookings are created by Epic 04 (when WeddingPartner status → CONFIRMED). For testing this view before Epic 04 is complete, manually insert a booking row in the DB.

**Keep the UI simple:** a sortable table is perfectly fine. No need for a visual calendar widget (out of MVP scope).
