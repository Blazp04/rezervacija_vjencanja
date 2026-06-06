using System.Globalization;
using System.Text;
using System.Text.Json;
using CsvHelper;
using SystemPath = System.IO.Path;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.Data;
using RezervacijaVjencanja.DTOs.CatalogItems;
using RezervacijaVjencanja.Entities;
using RezervacijaVjencanja.Services.CatalogItems;

namespace RezervacijaVjencanja.Controllers;

[ApiController]
public sealed class CatalogItemsController(ICatalogItemService service, AppDbContext db) : ControllerBase
{
    private static readonly HashSet<string> ValidItemTypes = ["SERVICE", "PRODUCT", "SONG"];

    [HttpGet("api/partners/{partnerId:int}/catalog-items")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<CatalogItemDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<CatalogItemDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByPartner(int partnerId)
    {
        var result = await service.GetByPartnerIdAsync(partnerId);
        if (result.Error is not null)
            return result.Error.Contains("not found") ? NotFound(result) : BadRequest(result);
        return Ok(result);
    }

    [HttpGet("api/catalog-items/{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<CatalogItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<CatalogItemDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await service.GetByIdAsync(id);
        if (result.Error is not null)
            return result.Error.Contains("not found") ? NotFound(result) : BadRequest(result);
        return Ok(result);
    }

    [HttpPost("api/catalog-items")]
    [ProducesResponseType(typeof(ApiResponse<CatalogItemDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<CatalogItemDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateCatalogItemRequest request)
    {
        var result = await service.CreateAsync(request);
        if (result.Error is not null) return BadRequest(result);
        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result);
    }

    [HttpPut("api/catalog-items/{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<CatalogItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<CatalogItemDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<CatalogItemDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCatalogItemRequest request)
    {
        var result = await service.UpdateAsync(id, request);
        if (result.Error is not null)
            return result.Error.Contains("not found") ? NotFound(result) : BadRequest(result);
        return Ok(result);
    }

    [HttpDelete("api/catalog-items/{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await service.DeleteAsync(id);
        if (result.Error is not null)
            return result.Error.Contains("not found") ? NotFound(result) : BadRequest(result);
        return Ok(result);
    }


    [HttpPost("api/partners/{partnerId:int}/catalog/import/preview")]
    [ProducesResponseType(typeof(ApiResponse<CsvPreviewResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<CsvPreviewResponse>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ImportPreview(int partnerId, IFormFile file)
    {
        if (!await db.Partners.AnyAsync(p => p.Id == partnerId))
            return NotFound(ApiResponse<CsvPreviewResponse>.Fail($"Partner with id {partnerId} was not found."));

        if (file is null || file.Length == 0)
            return BadRequest(ApiResponse<CsvPreviewResponse>.Fail("A CSV file is required."));

        if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
            return BadRequest(ApiResponse<CsvPreviewResponse>.Fail("Only .csv files are allowed."));

        if (file.Length > 5 * 1024 * 1024)
            return BadRequest(ApiResponse<CsvPreviewResponse>.Fail("File size must not exceed 5 MB."));

        using var reader = new StreamReader(file.OpenReadStream());
        using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);

        await csv.ReadAsync();
        csv.ReadHeader();
        var headers = csv.HeaderRecord!.ToList();

        var preview = new List<List<string>>();
        int totalRows = 0;
        while (await csv.ReadAsync())
        {
            if (totalRows < 3)
                preview.Add(headers.Select(h => csv.GetField(h) ?? "").ToList());
            totalRows++;
        }

        return Ok(ApiResponse<CsvPreviewResponse>.Ok(new CsvPreviewResponse(headers, preview, totalRows)));
    }

    [HttpPost("api/partners/{partnerId:int}/catalog/import")]
    [ProducesResponseType(typeof(ApiResponse<CsvImportResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<CsvImportResponse>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Import(int partnerId, IFormFile file, [FromForm] string mapping)
    {
        if (!await db.Partners.AnyAsync(p => p.Id == partnerId))
            return NotFound(ApiResponse<CsvImportResponse>.Fail($"Partner with id {partnerId} was not found."));

        if (file is null || file.Length == 0)
            return BadRequest(ApiResponse<CsvImportResponse>.Fail("A CSV file is required."));

        if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
            return BadRequest(ApiResponse<CsvImportResponse>.Fail("Only .csv files are allowed."));

        if (file.Length > 5 * 1024 * 1024)
            return BadRequest(ApiResponse<CsvImportResponse>.Fail("File size must not exceed 5 MB."));

        CsvColumnMapping? columnMapping;
        try
        {
            columnMapping = JsonSerializer.Deserialize<CsvColumnMapping>(mapping,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }
        catch
        {
            return BadRequest(ApiResponse<CsvImportResponse>.Fail("Invalid mapping JSON."));
        }

        if (columnMapping is null || columnMapping.Name is null)
            return BadRequest(ApiResponse<CsvImportResponse>.Fail("Mapping must include a value for 'name'."));

        using var reader = new StreamReader(file.OpenReadStream());
        using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);

        await csv.ReadAsync();
        csv.ReadHeader();

        if (!csv.HeaderRecord!.Contains(columnMapping.Name))
            return BadRequest(ApiResponse<CsvImportResponse>.Fail($"CSV does not contain column '{columnMapping.Name}'."));

        static string GetMapped(CsvReader c, string? col, string? fallback = null)
            => col is not null ? (c.GetField(col) ?? fallback ?? "") : (fallback ?? "");

        var imported = 0;
        var skipped = new List<CsvImportSkippedRow>();
        var rowNumber = 1;
        var now = DateTime.UtcNow;

        while (await csv.ReadAsync())
        {
            rowNumber++;
            var name = GetMapped(csv, columnMapping.Name);
            if (string.IsNullOrWhiteSpace(name))
            {
                skipped.Add(new CsvImportSkippedRow(rowNumber, "Name is empty."));
                continue;
            }

            var itemTypeRaw = GetMapped(csv, columnMapping.ItemType, "SERVICE");
            var itemType = itemTypeRaw.Trim().ToUpperInvariant();
            if (!ValidItemTypes.Contains(itemType))
            {
                skipped.Add(new CsvImportSkippedRow(rowNumber, $"Invalid ItemType '{itemTypeRaw}'."));
                continue;
            }

            decimal? basePrice = null;
            var basePriceRaw = GetMapped(csv, columnMapping.BasePrice);
            if (!string.IsNullOrWhiteSpace(basePriceRaw))
            {
                if (!decimal.TryParse(basePriceRaw, NumberStyles.Any, CultureInfo.InvariantCulture, out var price) || price < 0)
                {
                    skipped.Add(new CsvImportSkippedRow(rowNumber, $"Invalid BasePrice '{basePriceRaw}'."));
                    continue;
                }
                basePrice = price;
            }

            var metadataRaw = GetMapped(csv, columnMapping.Metadata);
            string? metadata = null;
            if (!string.IsNullOrWhiteSpace(metadataRaw))
            {
                try { JsonDocument.Parse(metadataRaw); metadata = metadataRaw; }
                catch { /* invalid JSON → store as null, don't skip */ }
            }

            db.PartnerCatalogItems.Add(new PartnerCatalogItem
            {
                PartnerId = partnerId,
                Name = name.Trim(),
                Category = GetMapped(csv, columnMapping.Category).Trim().NullIfEmpty(),
                Description = GetMapped(csv, columnMapping.Description).Trim().NullIfEmpty(),
                ItemType = itemType,
                BasePrice = basePrice,
                Metadata = metadata,
                IsActive = true,
                SortOrder = 0,
                CreatedAt = now,
            });
            imported++;
        }

        if (imported > 0)
            await db.SaveChangesAsync();

        return Ok(ApiResponse<CsvImportResponse>.Ok(new CsvImportResponse(imported, skipped.Count, skipped)));
    }


    [HttpGet("api/partners/{partnerId:int}/catalog/export")]
    public async Task<IActionResult> Export(int partnerId)
    {
        var partner = await db.Partners
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == partnerId);

        if (partner is null)
            return NotFound(ApiResponse<string>.Fail($"Partner with id {partnerId} was not found."));

        var items = await db.PartnerCatalogItems
            .AsNoTracking()
            .Where(c => c.PartnerId == partnerId && c.IsActive)
            .OrderBy(c => c.SortOrder).ThenBy(c => c.Name)
            .ToListAsync();

        using var writer = new StringWriter();
        using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);

        csv.WriteField("name");
        csv.WriteField("category");
        csv.WriteField("description");
        csv.WriteField("itemType");
        csv.WriteField("basePrice");
        csv.WriteField("metadata");
        await csv.NextRecordAsync();

        foreach (var item in items)
        {
            csv.WriteField(item.Name);
            csv.WriteField(item.Category ?? "");
            csv.WriteField(item.Description ?? "");
            csv.WriteField(item.ItemType);
            csv.WriteField(item.BasePrice?.ToString(CultureInfo.InvariantCulture) ?? "");
            csv.WriteField(item.Metadata ?? "");
            await csv.NextRecordAsync();
        }

        var safeName = string.Concat(partner.Name.Where(c => !SystemPath.GetInvalidFileNameChars().Contains(c)));
        var date = DateTime.UtcNow.ToString("yyyy-MM-dd");
        var filename = $"catalog-{safeName}-{date}.csv";

        var bom = Encoding.UTF8.GetPreamble();
        var content = Encoding.UTF8.GetBytes(writer.ToString());
        var bytes = bom.Concat(content).ToArray();

        return File(bytes, "text/csv", filename);
    }
}

file static class StringExtensions
{
    public static string? NullIfEmpty(this string s) => string.IsNullOrEmpty(s) ? null : s;
}
