using System.Globalization;
using System.Text;
using CsvHelper;
using SystemPath = System.IO.Path;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.Data;

namespace RezervacijaVjencanja.Controllers;

[ApiController]
[Route("api/weddings")]
public sealed class WeddingExportController(AppDbContext db) : ControllerBase
{
    [HttpGet("{id:int}/partners/export")]
    public async Task<IActionResult> ExportPartners(int id)
    {
        var wedding = await db.Weddings
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.Id == id);

        if (wedding is null)
            return NotFound(ApiResponse<string>.Fail($"Wedding with id {id} was not found."));

        var partners = await db.WeddingPartners
            .AsNoTracking()
            .Include(wp => wp.Partner).ThenInclude(p => p.PartnerType)
            .Include(wp => wp.CatalogItem)
            .Where(wp => wp.WeddingId == id)
            .OrderBy(wp => wp.Partner.Name)
            .ToListAsync();

        using var writer = new StringWriter();
        using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);

        csv.WriteField("partnerName");
        csv.WriteField("partnerType");
        csv.WriteField("serviceName");
        csv.WriteField("status");
        csv.WriteField("plannedPrice");
        csv.WriteField("actualPrice");
        csv.WriteField("commissionPercent");
        csv.WriteField("commissionAmount");
        csv.WriteField("clientPrice");
        csv.WriteField("notes");
        await csv.NextRecordAsync();

        foreach (var wp in partners)
        {
            var commission = wp.ActualPrice.HasValue && wp.CommissionPercent.HasValue
                ? wp.ActualPrice.Value * wp.CommissionPercent.Value / 100m
                : (decimal?)null;
            var clientPrice = wp.ActualPrice.HasValue && commission.HasValue
                ? wp.ActualPrice.Value + commission.Value
                : (decimal?)null;

            csv.WriteField(wp.Partner.Name);
            csv.WriteField(wp.Partner.PartnerType.Name);
            csv.WriteField(wp.CatalogItem?.Name ?? "");
            csv.WriteField(wp.Status);
            csv.WriteField(wp.PlannedPrice?.ToString("F2", CultureInfo.InvariantCulture) ?? "");
            csv.WriteField(wp.ActualPrice?.ToString("F2", CultureInfo.InvariantCulture) ?? "");
            csv.WriteField(wp.CommissionPercent?.ToString("F2", CultureInfo.InvariantCulture) ?? "");
            csv.WriteField(commission?.ToString("F2", CultureInfo.InvariantCulture) ?? "");
            csv.WriteField(clientPrice?.ToString("F2", CultureInfo.InvariantCulture) ?? "");
            csv.WriteField(wp.Notes ?? "");
            await csv.NextRecordAsync();
        }

        var safeName = string.Concat(wedding.Name.Where(c => !SystemPath.GetInvalidFileNameChars().Contains(c)));
        var date = DateTime.UtcNow.ToString("yyyy-MM-dd");
        var filename = $"partneri-{safeName}-{date}.csv";

        var bom = Encoding.UTF8.GetPreamble();
        var content = Encoding.UTF8.GetBytes(writer.ToString());
        var bytes = bom.Concat(content).ToArray();

        return File(bytes, "text/csv", filename);
    }
}
