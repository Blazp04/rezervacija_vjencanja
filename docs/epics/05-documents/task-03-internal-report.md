# Task: Internal Agency Report

| | |
|---|---|
| **Epic** | 05 — Documents & Export |
| **Assignee** | Marija Musa |
| **Estimate** | 2 days |
| **Status** | Not Started |
| **Depends on** | Task 05-02 — Client Invoice PDF (share DocumentService) |

## Description

Generate the internal agency report that shows the financial breakdown: what each partner charges, what commission the agency earns per partner, and the total agency earnings. Generated alongside the client invoice.

## Acceptance Criteria

- [ ] `POST /api/weddings/{id}/internal-report` — generates and returns a PDF
- [ ] Same finalization check as client invoice (all partners must be CONFIRMED)
- [ ] PDF contains:
  - Header: "INTERNI OBRAČUN — INTERNO / NIJE ZA KLIJENTA" (clearly marked)
  - Wedding name, date
  - Table with columns: partner name, partner type, actual partner cost, commission %, commission amount, client price
  - Row for each CONFIRMED WeddingPartner
  - Summary row: total partner cost, total commission, total client revenue
  - Agency net earnings section: total commission earned = total client revenue − total partner cost
- [ ] "Generate Internal Report" button on Documents tab (same location as invoice)
- [ ] PDF filename: `interni-obracun-{weddingName}-{date}.pdf`
- [ ] Report is visually distinct from client invoice (different header colour or watermark)

## Technical Notes

**Financial summary calculation:**
```
totalPartnerCost    = SUM(wp.ActualPrice) for all CONFIRMED
totalCommission     = SUM(wp.ActualPrice * wp.CommissionPercent / 100) for all CONFIRMED
totalClientRevenue  = totalPartnerCost + totalCommission
agencyEarnings      = totalCommission  (same value — just for clarity in report)
```

**Add to `DocumentService`:** `GenerateInternalReportAsync(int weddingId)`

**Layout note:** Consider using a two-column layout in QuestPDF — left side has the table, right side has the financial summary box.

**Security note:** This document must never be accidentally sent to clients. The "INTERNO" watermark serves as a visual reminder. No access control needed (per project spec — no auth), but make the visual distinction obvious.
