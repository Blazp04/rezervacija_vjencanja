using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace RezervacijaVjencanja.Controllers;

[ApiController]
[Route("health")]
[Authorize]
public sealed class HealthController : ControllerBase
{
    /// <summary>
    /// Protected endpoint. Requires a valid Auth0 Bearer token.
    /// Returns status + the authenticated user's sub and role claim
    /// so you can verify custom claims are flowing through correctly.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult Get()
    {
        var sub  = User.FindFirstValue(ClaimTypes.NameIdentifier)
                   ?? User.FindFirstValue("sub");
        var role = User.FindFirstValue(ClaimTypes.Role)
                   ?? User.FindFirstValue("https://rezervacija-vjencanja/role");

        return Ok(new
        {
            status = "ok",
            user   = sub,
            role
        });
    }
}
