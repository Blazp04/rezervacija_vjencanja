using Microsoft.AspNetCore.Mvc;
using RezervacijaVjencanja.Services.Documents;
using RezervacijaVjencanja.Services.Weddings;
using SystemPath = System.IO.Path;

namespace RezervacijaVjencanja.Controllers;

[ApiController]
[Route("api/weddings/{weddingId:int}")]
public sealed class DocumentsController(IDocumentService documentService, IWeddingService weddingService) : ControllerBase
{
    [HttpPost("invoice")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GenerateInvoice(int weddingId)
    {
        var wedding = await weddingService.GetByIdAsync(weddingId);
        if (wedding.Error is not null)
            return wedding.Error.Contains("not found")
                ? NotFound(new { error = wedding.Error })
                : BadRequest(new { error = wedding.Error });

        var (bytes, error) = await documentService.GenerateClientInvoiceAsync(weddingId);

        if (!string.IsNullOrEmpty(error))
            return BadRequest(new { error });

        var safeName = SanitizeFileName(wedding.Data!.Name);
        var dateStr = wedding.Data.DateTime.ToString("yyyy-MM-dd");
        var filename = $"racun-{safeName}-{dateStr}.pdf";

        return File(bytes, "application/pdf", filename);
    }

    [HttpPost("internal-report")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GenerateInternalReport(int weddingId)
    {
        var wedding = await weddingService.GetByIdAsync(weddingId);
        if (wedding.Error is not null)
            return wedding.Error.Contains("not found")
                ? NotFound(new { error = wedding.Error })
                : BadRequest(new { error = wedding.Error });

        var (bytes, error) = await documentService.GenerateInternalReportAsync(weddingId);

        if (!string.IsNullOrEmpty(error))
            return BadRequest(new { error });

        var safeName = SanitizeFileName(wedding.Data!.Name);
        var dateStr = wedding.Data.DateTime.ToString("yyyy-MM-dd");
        var filename = $"interni-obracun-{safeName}-{dateStr}.pdf";

        return File(bytes, "application/pdf", filename);
    }

    private static string SanitizeFileName(string name)
    {
        var invalid = SystemPath.GetInvalidFileNameChars();
        return new string(name.Select(c => invalid.Contains(c) ? '-' : c).ToArray())
            .Replace(' ', '-')
            .ToLowerInvariant();
    }
}
