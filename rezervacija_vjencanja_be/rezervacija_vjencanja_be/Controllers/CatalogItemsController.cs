using Microsoft.AspNetCore.Mvc;
using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.DTOs.CatalogItems;
using RezervacijaVjencanja.Services.CatalogItems;

namespace RezervacijaVjencanja.Controllers;

[ApiController]
public sealed class CatalogItemsController(ICatalogItemService service) : ControllerBase
{
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
}
