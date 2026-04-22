# Task: CSV Import for Catalogs

| | |
|---|---|
| **Epic** | 03 — Partner Catalog & Management |
| **Assignee** | Jelena Vučić |
| **Estimate** | 4 days |
| **Status** | Not Started |
| **Depends on** | Epic 01 Task 03 — Partner API |

## Description

Implement CSV import for partner catalog items with **column mapping**. The user uploads any CSV file, then maps their CSV column headers to the application's target fields before the import is executed. This means the CSV does not need to have any specific column names — it can be an export from any external system (e.g. a band's own spreadsheet).

Import flow:
1. User uploads a CSV file
2. Backend reads the headers and returns them
3. Frontend shows a mapping UI: for each target field, the user selects which CSV column it corresponds to
4. User submits the mapping alongside the file
5. Backend applies the mapping and imports the data

## Acceptance Criteria

**Backend — step 1: read headers**
- [ ] `POST /api/partners/{id}/catalog/import/preview` — accepts `multipart/form-data` with a CSV file
- [ ] Returns: list of CSV column headers detected in the file, and the first 3 data rows as a preview
- [ ] Response shape:
  ```json
  {
    "headers": ["Song Title", "Artist Name", "Genre", "Duration"],
    "preview": [
      ["Lijepa Naša", "Oliver Dragojević", "folk", "3:45"],
      ["Pobjeda", "Massimo", "pop", "4:10"]
    ]
  }
  ```

**Backend — step 2: import with mapping**
- [ ] `POST /api/partners/{id}/catalog/import` — accepts `multipart/form-data` with:
  - `file` — the same CSV file
  - `mapping` — JSON string describing the column mapping (see below)
- [ ] Mapping format:
  ```json
  {
    "name":        "Song Title",
    "category":    "Genre",
    "description": null,
    "itemType":    null,
    "basePrice":   null,
    "metadata":    null
  }
  ```
  - Key = target field name; value = the CSV header to read from, or `null` to use the default value
  - `name` is the only required mapping — if its value is `null` or the mapped column doesn't exist, return `400`
- [ ] Default values applied when mapping value is `null`:
  - `itemType` → `"SERVICE"`
  - `basePrice` → `null`
  - `category`, `description`, `metadata` → `null`
- [ ] Rows are validated after mapping is applied: `name` must be non-empty, `itemType` must be SERVICE/PRODUCT/SONG, `basePrice` numeric or empty
- [ ] Invalid rows are skipped; response includes count imported and list of skipped rows with row number + reason
- [ ] `metadata` mapped column value stored as-is if valid JSON, otherwise stored as `null` (no skip for invalid metadata)
- [ ] Import is additive — does not delete existing catalog items

**Frontend:**
- [ ] "Import CSV" button on the partner Catalog tab opens a **multi-step import modal**:
  - **Step 1 — Upload:** file picker (CSV only), "Next" button calls `/preview` endpoint
  - **Step 2 — Map Columns:** shows a form with one row per target field (Name, Category, Description, Item Type, Base Price, Metadata). Each row has a dropdown populated with the CSV column headers returned by `/preview`. Below the mapping form, a small preview table shows the first 3 rows from the CSV so the user can verify their selections
  - **Step 3 — Review & Import:** shows a summary ("You are about to import N rows"), "Import" button calls `/import`
- [ ] After import: show result summary — "X items imported, Y rows skipped"
- [ ] Skipped rows shown in an expandable panel with row number and reason
- [ ] Target fields that are not required (category, description, etc.) show a "— skip —" option in the dropdown
- [ ] "Download CSV template" button (Step 1) downloads a sample CSV with standard column names and example rows

## Technical Notes

**Backend — reading CSV with arbitrary headers using CsvHelper:**
```csharp
// Preview endpoint: read headers + first N rows as raw string arrays
using var reader = new StreamReader(file.OpenReadStream());
using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);
await csv.ReadAsync();
csv.ReadHeader();
var headers = csv.HeaderRecord!.ToList();

var preview = new List<string[]>();
for (int i = 0; i < 3 && await csv.ReadAsync(); i++)
    preview.Add(headers.Select(h => csv.GetField(h) ?? "").ToArray());
```

**Import endpoint — apply mapping:**
```csharp
// Mapping DTO
public class CsvColumnMapping {
    public string? Name { get; set; }
    public string? Category { get; set; }
    public string? Description { get; set; }
    public string? ItemType { get; set; }
    public string? BasePrice { get; set; }
    public string? Metadata { get; set; }
}

// Reading a row with mapping:
string GetMapped(CsvReader csv, string? columnName, string? defaultValue = null)
    => columnName != null ? (csv.GetField(columnName) ?? defaultValue ?? "") : (defaultValue ?? "");

while (await csv.ReadAsync()) {
    var name      = GetMapped(csv, mapping.Name);
    var category  = GetMapped(csv, mapping.Category);
    var itemType  = GetMapped(csv, mapping.ItemType, "SERVICE");
    var basePrice = GetMapped(csv, mapping.BasePrice);
    // ... validate, build CatalogItem, add to list
}
```

**Mapping is sent as a form field (JSON string):**
```
POST /api/partners/{id}/catalog/import
Content-Type: multipart/form-data
  file=<csv file>
  mapping={"name":"Song Title","category":"Genre","itemType":null,...}
```

On backend, bind with `[FromForm] string mapping` then deserialize with `System.Text.Json`.

**CSV template download:** generate client-side in React as a Blob. Columns in the template use the standard app field names so users can fill it in without mapping.

**Security:** validate file extension is `.csv` and MIME type. Reject files > 5MB. Do not execute any cell values as code or formula (CsvHelper handles this by default).
