using Microsoft.AspNetCore.Mvc;
using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.DTOs.Partners;
using RezervacijaVjencanja.Services.Partners;

namespace RezervacijaVjencanja.Controllers;

[ApiController]
[Route("api/partners")]
public sealed class PartnersController(IPartnerService service) : ControllerBase
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
}
