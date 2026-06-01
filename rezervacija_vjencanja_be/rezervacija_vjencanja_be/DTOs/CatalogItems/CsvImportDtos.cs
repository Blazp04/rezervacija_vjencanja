namespace RezervacijaVjencanja.DTOs.CatalogItems;

public sealed record CsvPreviewResponse(
    IEnumerable<string> Headers,
    IEnumerable<IEnumerable<string>> Preview,
    int TotalRows);

public sealed class CsvColumnMapping
{
    public string? Name { get; set; }
    public string? Category { get; set; }
    public string? Description { get; set; }
    public string? ItemType { get; set; }
    public string? BasePrice { get; set; }
    public string? Metadata { get; set; }
}

public sealed record CsvImportSkippedRow(int RowNumber, string Reason);

public sealed record CsvImportResponse(
    int Imported,
    int Skipped,
    IEnumerable<CsvImportSkippedRow> SkippedRows);
