# Task: Client Invoice PDF

| | |
|---|---|
| **Epic** | 05 — Documents & Export |
| **Assignee** | Marija Musa |
| **Estimate** | 2 days |
| **Status** | Not Started |
| **Depends on** | Epic 04 complete (all partners confirmed, actual prices entered) |

## Description

Generate the final client invoice — the document the agency gives the couple showing what they owe. Only available when all key partners are CONFIRMED. Uses actual prices + commission.

## Acceptance Criteria

- [ ] `POST /api/weddings/{id}/invoice` — generates and returns a PDF
- [ ] Endpoint returns `400` with message if any WeddingPartner in status ≠ CONFIRMED (and ≠ CANCELLED) — invoice can only be generated when finalized
- [ ] PDF contains:
  - Agency name header
  - Wedding name, date, location
  - Invoice number (use format: `R-{weddingId}-{year}` e.g. `R-42-2025`)
  - Date of issue
  - Table: service name, partner name, unit price, commission %, total client price per line
  - Grand total (sum of all client prices)
  - "Ukupno za uplatu: X,XX KM" clearly stated
  - Footer: agency contact info (hardcoded for MVP)
- [ ] "Generate Invoice" button on Documents tab
- [ ] Button disabled with explanation if not all partners are confirmed
- [ ] PDF filename: `racun-{weddingName}-{date}.pdf`

## Technical Notes

**Finalization check:**
```csharp
var hasUnconfirmed = await _db.WeddingPartners
    .AnyAsync(wp => wp.WeddingId == id
                 && wp.Status != "CONFIRMED"
                 && wp.Status != "CANCELLED");
if (hasUnconfirmed)
    return BadRequest("All partners must be confirmed before generating invoice.");
```

**Price calculation:**
```
clientPrice = actualPrice + (actualPrice * commissionPercent / 100)
```

`ActualPrice` is required for all CONFIRMED partners — it was enforced in Epic 04.

**Reuse `DocumentService`** started in Task 05-01. Add `GenerateClientInvoiceAsync(int weddingId)` method.
