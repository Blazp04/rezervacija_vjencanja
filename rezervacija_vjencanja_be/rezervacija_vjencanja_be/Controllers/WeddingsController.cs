using Microsoft.AspNetCore.Mvc;
using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.DTOs.Weddings;
using RezervacijaVjencanja.Services.Weddings;

namespace RezervacijaVjencanja.Controllers;

[ApiController]
[Route("api/weddings")]
public sealed class WeddingsController(IWeddingService service) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<WeddingListDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] string? status)
    {
        var result = await service.GetAllAsync(status);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<WeddingDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<WeddingDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await service.GetByIdAsync(id);
        if (result.Error is not null)
            return result.Error.Contains("not found") ? NotFound(result) : BadRequest(result);
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<WeddingDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<WeddingDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateWeddingRequest request)
    {
        var result = await service.CreateAsync(request);
        if (result.Error is not null) return BadRequest(result);
        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<WeddingDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<WeddingDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<WeddingDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateWeddingRequest request)
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
