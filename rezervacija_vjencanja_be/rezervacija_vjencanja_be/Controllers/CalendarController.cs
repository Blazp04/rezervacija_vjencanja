using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.Data;

namespace RezervacijaVjencanja.Controllers;

public sealed record CalendarWeddingDto(
    int Id,
    string Name,
    string DateTime,
    string? Location,
    string Status);

public sealed record CalendarBookingDto(
    int Id,
    int PartnerId,
    string PartnerName,
    string PartnerTypeCode,
    int WeddingId,
    string WeddingName,
    string StartDateTime,
    string EndDateTime);

public sealed record CalendarMonthDto(
    IEnumerable<CalendarWeddingDto> Weddings,
    IEnumerable<CalendarBookingDto> Bookings);

[ApiController]
[Route("api/calendar")]
public sealed class CalendarController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<CalendarMonthDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMonth([FromQuery] int year, [FromQuery] int month)
    {
        if (year < 2000 || year > 2100 || month < 1 || month > 12)
            return BadRequest(ApiResponse<CalendarMonthDto>.Fail("Invalid year or month."));

        var from = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
        var to = from.AddMonths(1);

        var weddings = await db.Weddings
            .AsNoTracking()
            .Where(w => w.DateTime >= from && w.DateTime < to && w.Status != "CANCELLED")
            .OrderBy(w => w.DateTime)
            .Select(w => new CalendarWeddingDto(
                w.Id, w.Name,
                w.DateTime.ToString("o"),
                w.Location,
                w.Status))
            .ToListAsync();

        var bookings = await db.Bookings
            .AsNoTracking()
            .Where(b => b.StartDateTime < to && b.EndDateTime > from)
            .Include(b => b.Partner).ThenInclude(p => p.PartnerType)
            .Include(b => b.Wedding)
            .OrderBy(b => b.StartDateTime)
            .Select(b => new CalendarBookingDto(
                b.Id,
                b.PartnerId,
                b.Partner.Name,
                b.Partner.PartnerType.Code,
                b.WeddingId,
                b.Wedding.Name,
                b.StartDateTime.ToString("o"),
                b.EndDateTime.ToString("o")))
            .ToListAsync();

        return Ok(ApiResponse<CalendarMonthDto>.Ok(new CalendarMonthDto(weddings, bookings)));
    }
}
