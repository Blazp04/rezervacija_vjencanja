# Task: Client Offer PDF

| | |
|---|---|
| **Epic** | 05 — Documents & Export |
| **Assignee** | Vinko Jakeljić |
| **Estimate** | 3 days |
| **Status** | Not Started |
| **Depends on** | Epic 02 complete, Epic 04 Task 01 (partners assigned to wedding) |

## Description

Generate a PDF offer for the client (couple) showing all proposed/offered services and their prices (including agency commission). Can be generated at any point — not just when confirmed.

## Acceptance Criteria

- [ ] `POST /api/weddings/{id}/offer` — generates and returns a PDF file
- [ ] PDF contains:
  - Agency name header (hardcoded: "Agencija za organizaciju svečanih događanja")
  - Wedding name, date, and location
  - Table of services: partner name, service description, price (actual if confirmed, planned otherwise), commission included in price
  - Subtotal per partner type (optional)
  - Grand total (what the client pays — actual/planned price + commission)
  - Footer: date generated, "Ova ponuda je informativnog karaktera"
- [ ] Only WeddingPartner records with Status ≠ CANCELLED are included
- [ ] "Generate Offer" button on Wedding detail → Documents tab
- [ ] PDF filename: `ponuda-{weddingName}-{date}.pdf`
- [ ] Button disabled with tooltip if no partners are assigned to the wedding
- [ ] Optional: "package price" toggle — shows grand total as a single line instead of itemized (per spec section 7.1)

## Technical Notes

**Service:** `IDocumentService` + `DocumentService` in `/Services/`

**Data needed for PDF:**
```csharp
var wedding = await _db.Weddings
    .Include(w => w.WeddingPartners.Where(wp => wp.Status != "CANCELLED"))
        .ThenInclude(wp => wp.Partner)
    .Include(w => w.WeddingPartners)
        .ThenInclude(wp => wp.CatalogItem)
    .FirstOrThrowAsync(w => w.Id == id);
```

**Price shown per line:**
- If `ActualPrice` is set → use ActualPrice + commission
- Else → use `PlannedPrice` + commission (mark as "estimated")

**Commission included in client price:**
```
clientLinePrice = (actualPrice ?? plannedPrice) * (1 + commissionPercent / 100)
```

**QuestPDF table example:**
```csharp
table.ColumnsDefinition(cols => {
    cols.RelativeColumn(3); // service name
    cols.RelativeColumn(1); // price
});
table.Header(header => {
    header.Cell().Text("Usluga");
    header.Cell().Text("Cijena (KM)");
});
foreach (var wp in weddingPartners) {
    table.Cell().Text(wp.CatalogItem?.Name ?? wp.Partner.Name);
    table.Cell().Text(clientPrice.ToString("N2"));
}
```
