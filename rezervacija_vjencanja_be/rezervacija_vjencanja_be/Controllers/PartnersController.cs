using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.Data;
using RezervacijaVjencanja.DTOs.Bookings;
using RezervacijaVjencanja.DTOs.Partners;
using RezervacijaVjencanja.Services.Partners;

namespace RezervacijaVjencanja.Controllers;

[ApiController]
[Route("api/partners")]
public sealed class PartnersController(IPartnerService service, AppDbContext db) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<PartnerListDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] int? partnerTypeId)
    {
        var result = await service.GetAllAsync(partnerTypeId);
        return result.Error is null ? Ok(result) : BadRequest(result);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<PartnerDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<PartnerDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await service.GetByIdAsync(id);
        if (result.Error is not null)
            return result.Error.Contains("not found") ? NotFound(result) : BadRequest(result);
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<PartnerDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<PartnerDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreatePartnerRequest request)
    {
        var result = await service.CreateAsync(request);
        if (result.Error is not null) return BadRequest(result);
        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<PartnerDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<PartnerDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<PartnerDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePartnerRequest request)
    {
        var result = await service.UpdateAsync(id, request);
        if (result.Error is not null)
            return result.Error.Contains("not found") ? NotFound(result) : BadRequest(result);
        return Ok(result);
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await service.DeleteAsync(id);
        if (result.Error is not null)
            return result.Error.Contains("not found") ? NotFound(result) : BadRequest(result);
        return Ok(result);
    }

    [HttpPost("{id:int}/clone")]
    [ProducesResponseType(typeof(ApiResponse<PartnerDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<PartnerDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Clone(int id)
    {
        var result = await service.CloneAsync(id);
        if (result.Error is not null)
            return result.Error.Contains("not found") ? NotFound(result) : BadRequest(result);
        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result);
    }

    [HttpGet("{id:int}/bookings")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<BookingDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<BookingDto>>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBookings(int id)
    {
        if (!await db.Partners.AnyAsync(p => p.Id == id))
            return NotFound(ApiResponse<IEnumerable<BookingDto>>.Fail($"Partner with id {id} was not found."));

        var bookings = await db.Bookings
            .AsNoTracking()
            .Include(b => b.Wedding)
            .Include(b => b.WeddingPartner)
            .Where(b => b.PartnerId == id)
            .OrderBy(b => b.StartDateTime)
            .Select(b => new BookingDto(
                b.Id,
                b.PartnerId,
                b.WeddingId,
                b.Wedding.Name,
                b.StartDateTime,
                b.EndDateTime,
                b.WeddingPartner.Status,
                b.Notes))
            .ToListAsync();

        return Ok(ApiResponse<IEnumerable<BookingDto>>.Ok(bookings));
    }

    [HttpGet("{id:int}/availability")]
    [ProducesResponseType(typeof(ApiResponse<AvailabilityDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<AvailabilityDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CheckAvailability(int id, [FromQuery] DateTime start, [FromQuery] DateTime end)
    {
        if (!await db.Partners.AnyAsync(p => p.Id == id))
            return NotFound(ApiResponse<AvailabilityDto>.Fail($"Partner with id {id} was not found."));

        var conflicts = await db.Bookings
            .AsNoTracking()
            .Include(b => b.Wedding)
            .Include(b => b.WeddingPartner)
            .Where(b => b.PartnerId == id
                     && b.StartDateTime < end
                     && b.EndDateTime > start)
            .Select(b => new BookingDto(
                b.Id,
                b.PartnerId,
                b.WeddingId,
                b.Wedding.Name,
                b.StartDateTime,
                b.EndDateTime,
                b.WeddingPartner.Status,
                b.Notes))
            .ToListAsync();

        var result = new AvailabilityDto(!conflicts.Any(), conflicts);
        return Ok(ApiResponse<AvailabilityDto>.Ok(result));
    }
}
