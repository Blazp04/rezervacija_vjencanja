using Microsoft.AspNetCore.Mvc;
using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.DTOs.PricingRules;
using RezervacijaVjencanja.Services.PricingRules;

namespace RezervacijaVjencanja.Controllers;

[ApiController]
public sealed class PricingRulesController(IPricingRuleService service) : ControllerBase
{
    [HttpGet("api/catalog-items/{catalogItemId:int}/pricing-rules")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<PricingRuleDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<PricingRuleDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByCatalogItem(int catalogItemId)
    {
        var result = await service.GetByCatalogItemIdAsync(catalogItemId);
        if (result.Error is not null)
            return result.Error.Contains("not found") ? NotFound(result) : BadRequest(result);
        return Ok(result);
    }

    [HttpPost("api/pricing-rules")]
    [ProducesResponseType(typeof(ApiResponse<PricingRuleDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<PricingRuleDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreatePricingRuleRequest request)
    {
        var result = await service.CreateAsync(request);
        if (result.Error is not null) return BadRequest(result);
        return Ok(result);
    }

    [HttpPut("api/pricing-rules/{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<PricingRuleDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<PricingRuleDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<PricingRuleDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePricingRuleRequest request)
    {
        var result = await service.UpdateAsync(id, request);
        if (result.Error is not null)
            return result.Error.Contains("not found") ? NotFound(result) : BadRequest(result);
        return Ok(result);
    }

    [HttpDelete("api/pricing-rules/{id:int}")]
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
