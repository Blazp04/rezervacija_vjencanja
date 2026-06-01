using Microsoft.AspNetCore.Mvc;
using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.DTOs.BandMembers;
using RezervacijaVjencanja.Services.BandMembers;

namespace RezervacijaVjencanja.Controllers;

[ApiController]
[Route("api/partners/{partnerId:int}/members")]
public sealed class BandMembersController(IBandMemberService service) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<BandMemberDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<BandMemberDto>>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAll(int partnerId)
    {
        var result = await service.GetByPartnerIdAsync(partnerId);
        if (result.Error is not null)
            return result.Error.Contains("not found") ? NotFound(result) : BadRequest(result);
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<BandMemberDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<BandMemberDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create(int partnerId, [FromBody] CreateBandMemberRequest request)
    {
        var result = await service.CreateAsync(partnerId, request);
        if (result.Error is not null) return BadRequest(result);
        return StatusCode(StatusCodes.Status201Created, result);
    }

    [HttpPut("{memberId:int}")]
    [ProducesResponseType(typeof(ApiResponse<BandMemberDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<BandMemberDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<BandMemberDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int partnerId, int memberId, [FromBody] UpdateBandMemberRequest request)
    {
        var result = await service.UpdateAsync(partnerId, memberId, request);
        if (result.Error is not null)
            return result.Error.Contains("not found") ? NotFound(result) : BadRequest(result);
        return Ok(result);
    }

    [HttpDelete("{memberId:int}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int partnerId, int memberId)
    {
        var result = await service.DeleteAsync(partnerId, memberId);
        if (result.Error is not null)
            return result.Error.Contains("not found") ? NotFound(result) : BadRequest(result);
        return Ok(result);
    }
}
