using Microsoft.AspNetCore.Mvc;
using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.DTOs.Settings;
using RezervacijaVjencanja.Services.Settings;

namespace RezervacijaVjencanja.Controllers;

[ApiController]
[Route("api/settings")]
public sealed class SettingsController(ISettingsService service) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<AgencySettingsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Get()
    {
        var result = await service.GetAsync();
        return Ok(result);
    }

    [HttpPut]
    [ProducesResponseType(typeof(ApiResponse<AgencySettingsDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<AgencySettingsDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Update([FromBody] UpdateAgencySettingsRequest request)
    {
        var result = await service.UpdateAsync(request);
        if (result.Error is not null) return BadRequest(result);
        return Ok(result);
    }
}
