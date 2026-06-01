using Microsoft.AspNetCore.Mvc;
using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.DTOs.WeddingTemplates;
using RezervacijaVjencanja.Services.WeddingTemplates;

namespace RezervacijaVjencanja.Controllers;

[ApiController]
[Route("api/wedding-templates")]
public sealed class WeddingTemplatesController(IWeddingTemplateService service) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<WeddingTemplateListDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var result = await service.GetAllAsync();
        return Ok(result);
    }
}
