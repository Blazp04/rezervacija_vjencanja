# Epic 05 — Documents & Export

**Status:** Not Started  
**Depends on:** Epics 02, 03, 04 (all complete)  
**Split:** Tasks distributed to team members as their primary epics complete

---

## Goal

Implement all document generation and export features: client offer PDF, client invoice PDF, internal agency report, and CSV export. Each task is picked up by whoever finishes their primary epic first.

## Task Assignment

| Task | Title | Assignee | Primary Epic Done |
|------|-------|----------|-------------------|
| [task-01-client-offer-pdf.md](task-01-client-offer-pdf.md) | Client Offer PDF | Vinko Jakeljić | after Epic 02 |
| [task-02-client-invoice-pdf.md](task-02-client-invoice-pdf.md) | Client Invoice PDF | Marija Musa | after Epic 04 |
| [task-03-internal-report.md](task-03-internal-report.md) | Internal Agency Report | Marija Musa | after Epic 04 |
| [task-04-csv-export.md](task-04-csv-export.md) | CSV Export | Jelena Vučić | after Epic 03 |

## Shared Technical Notes

**PDF library:** QuestPDF (already added in Epic 01 setup).

```csharp
// QuestPDF basic structure:
Document.Create(container => {
    container.Page(page => {
        page.Content().Column(col => {
            col.Item().Text("Heading");
            col.Item().Table(...);
        });
    });
}).GeneratePdf(stream);
```

**PDF download endpoint pattern:**
```csharp
[HttpPost("{id}/offer")]
public async Task<IActionResult> GenerateOffer(int id)
{
    var bytes = await _docService.GenerateClientOfferAsync(id);
    return File(bytes, "application/pdf", $"offer-{id}.pdf");
}
```

**Frontend download trigger:**
```ts
const response = await fetch(`/api/weddings/${id}/offer`, { method: 'POST' })
const blob = await response.blob()
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url; a.download = `offer-${id}.pdf`; a.click()
```

## Definition of Done

- [ ] Client offer PDF downloads correctly and contains correct data
- [ ] Client invoice PDF downloads and shows correct final prices + commission totals
- [ ] Internal report PDF shows per-partner breakdown with commission details
- [ ] CSV export downloads catalog items for a given partner
- [ ] Documents tab on Wedding detail page has working download buttons
- [ ] PDFs include agency name header (hardcoded for MVP — no branding settings screen)
