using Microsoft.AspNetCore.Mvc;
using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.DTOs.WeddingPartners;
using RezervacijaVjencanja.Services.WeddingPartners;

namespace RezervacijaVjencanja.Controllers;

[ApiController]
[Route("api/weddings/{weddingId:int}/partners")]
public sealed class WeddingPartnersController(IWeddingPartnerService service) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<WeddingPartnerDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(int weddingId)
    {
        var result = await service.GetAllByWeddingIdAsync(weddingId);
        if (result.Error is not null)
            return result.Error.Contains("not found") ? NotFound(result) : BadRequest(result);
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<WeddingPartnerDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<WeddingPartnerDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Add(int weddingId, [FromBody] CreateWeddingPartnerRequest request)
    {
        var result = await service.AddAsync(weddingId, request);
        if (result.Error is not null) return BadRequest(result);
        return CreatedAtAction(nameof(GetAll), new { weddingId }, result);
    }

    [HttpPut("{wpId:int}")]
    [ProducesResponseType(typeof(ApiResponse<WeddingPartnerDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<WeddingPartnerDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Update(int weddingId, int wpId, [FromBody] UpdateWeddingPartnerRequest request)
    {
        var result = await service.UpdateAsync(weddingId, wpId, request);
        if (result.Error is not null)
            return result.Error.Contains("not found") ? NotFound(result) : BadRequest(result);
        return Ok(result);
    }

    [HttpDelete("{wpId:int}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Remove(int weddingId, int wpId)
    {
        var result = await service.RemoveAsync(weddingId, wpId);
        if (result.Error is not null)
            return result.Error.Contains("not found") ? NotFound(result) : BadRequest(result);
        return Ok(result);
    }

    [HttpPatch("{wpId:int}/status")]
    [ProducesResponseType(typeof(ApiResponse<WeddingPartnerDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<WeddingPartnerDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateStatus(int weddingId, int wpId, [FromBody] UpdateWeddingPartnerStatusRequest request)
    {
        var result = await service.UpdateStatusAsync(weddingId, wpId, request);
        if (result.Error is not null)
            return result.Error.Contains("not found") ? NotFound(result) : BadRequest(result);
        return Ok(result);
    }

    [HttpPatch("{wpId:int}/confirm")]
    [ProducesResponseType(typeof(ApiResponse<WeddingPartnerDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<WeddingPartnerDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Confirm(int weddingId, int wpId, [FromBody] ConfirmWeddingPartnerRequest request)
    {
        var result = await service.ConfirmAsync(weddingId, wpId, request);

        if (result.Error is not null)
        {
            // Detect conflict errors (prefixed with "CONFLICT:")
            if (result.Error.StartsWith("CONFLICT:"))
            {
                var json = result.Error["CONFLICT:".Length..];
                try
                {
                    var conflict = System.Text.Json.JsonSerializer.Deserialize<ConflictErrorDto>(json,
                        new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    var message = $"Partner je već rezerviran za vjenčanje \"{conflict?.ConflictingWeddingName}\" " +
                                  $"({conflict?.ConflictStart:dd.MM.yyyy HH:mm} – {conflict?.ConflictEnd:HH:mm}).";
                    return Conflict(new { error = message, details = conflict });
                }
                catch
                {
                    return Conflict(new { error = "Konflikt rezervacije. Partner je zauzet u traženom terminu." });
                }
            }

            return result.Error.Contains("not found") ? NotFound(result) : BadRequest(result);
        }

        return Ok(result);
    }
}

[ApiController]
[Route("api/weddings/{weddingId:int}/pricing")]
public sealed class WeddingPricingController(IWeddingPartnerService service) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PricingResultDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<PricingResultDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetPrice(int weddingId, [FromQuery] int catalogItemId)
    {
        var result = await service.CalculatePriceAsync(weddingId, catalogItemId);
        if (result.Error is not null)
            return result.Error.Contains("not found") ? NotFound(result) : BadRequest(result);
        return Ok(result);
    }
}
