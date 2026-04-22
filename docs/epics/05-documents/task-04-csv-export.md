# Task: CSV Export

| | |
|---|---|
| **Epic** | 05 — Documents & Export |
| **Assignee** | Jelena Vučić |
| **Estimate** | 2 days |
| **Status** | Not Started |
| **Depends on** | Epic 03 complete (catalog items fully managed) |

## Description

Implement CSV export for partner catalog items. The export mirrors the CSV import format so data can be exported, edited in a spreadsheet, and re-imported. Also add a wedding partners export (list of all assigned partners for a wedding).

## Acceptance Criteria

**Partner catalog export:**
- [ ] `GET /api/partners/{id}/catalog/export` — returns a CSV file with all catalog items for the partner
- [ ] CSV columns match import format: `name`, `category`, `description`, `itemType`, `basePrice`, `metadata`
- [ ] `metadata` column contains the raw JSON string
- [ ] Includes all active catalog items (IsActive = true)
- [ ] "Export CSV" button on partner Catalog tab
- [ ] CSV filename: `catalog-{partnerName}-{date}.csv`

**Wedding partners export:**
- [ ] `GET /api/weddings/{id}/partners/export` — returns a CSV with all partner assignments for the wedding
- [ ] CSV columns: `partnerName`, `partnerType`, `serviceName`, `status`, `plannedPrice`, `actualPrice`, `commissionPercent`, `commissionAmount`, `clientPrice`, `notes`
- [ ] "Export to CSV" button on Wedding detail → Partners tab
- [ ] CSV filename: `partneri-{weddingName}-{date}.csv`

## Technical Notes

**CsvHelper export (backend):**
```csharp
using var writer = new StringWriter();
using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);
csv.WriteRecords(records);
var bytes = Encoding.UTF8.GetBytes(writer.ToString());
return File(bytes, "text/csv", filename);
```

**Note:** Add UTF-8 BOM (`\uFEFF`) to the start of the CSV so Excel opens Croatian characters (čšžđć) correctly:
```csharp
var bytes = Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(writer.ToString())).ToArray();
```

**Frontend download:** same pattern as PDF download — create an object URL from the blob and trigger a link click.

These two export endpoints are the only new backend work in this task. All data is already available from existing queries.
