using Microsoft.AspNetCore.Mvc;
using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.DTOs.PartnerTypes;
using RezervacijaVjencanja.Services.PartnerTypes;

namespace RezervacijaVjencanja.Controllers;

[ApiController]
[Route("api/partner-types")]
public sealed class PartnerTypesController(IPartnerTypeService service) : ControllerBase
{
    /// <summary>Get all partner types.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<PartnerTypeDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var result = await service.GetAllAsync();
        return Ok(result);
    }

    /// <summary>Get a single partner type by ID.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<PartnerTypeDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<PartnerTypeDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await service.GetByIdAsync(id);
        return result.Error is not null ? NotFound(result) : Ok(result);
    }

    /// <summary>Create a new partner type.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<PartnerTypeDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<PartnerTypeDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreatePartnerTypeRequest request)
    {
        var result = await service.CreateAsync(request);
        if (result.Error is not null)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result);
    }

    /// <summary>Update an existing partner type.</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<PartnerTypeDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<PartnerTypeDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<PartnerTypeDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePartnerTypeRequest request)
    {
        var result = await service.UpdateAsync(id, request);
        if (result.Error is not null)
        {
            return result.Error.Contains("not found", StringComparison.OrdinalIgnoreCase)
                ? NotFound(result)
                : BadRequest(result);
        }
        return Ok(result);
    }

    /// <summary>Delete a partner type.</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await service.DeleteAsync(id);
        return result.Error is not null ? NotFound(result) : Ok(result);
    }
}
