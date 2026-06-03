using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Json;
using System.Text.Json.Serialization;

namespace RezervacijaVjencanja.Controllers;

/// <summary>
/// Proxies token requests to Auth0 so Postman / the frontend
/// can obtain a signed JWT without calling Auth0 directly.
/// POST /auth/token  →  { username, password }
/// </summary>
[ApiController]
[Route("auth")]
public sealed class AuthController(IConfiguration config, IHttpClientFactory httpClientFactory)
    : ControllerBase
{
    [HttpPost("token")]
    [ProducesResponseType(typeof(TokenResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetToken([FromBody] LoginRequest request)
    {
        var domain       = config["Auth0:Domain"]
                           ?? throw new InvalidOperationException("Auth0:Domain missing");
        var clientId     = config["Auth0:ClientId"]
                           ?? throw new InvalidOperationException("Auth0:ClientId missing");
        var clientSecret = config["Auth0:ClientSecret"]
                           ?? throw new InvalidOperationException("Auth0:ClientSecret missing");
        var audience     = config["Auth0:Audience"]
                           ?? throw new InvalidOperationException("Auth0:Audience missing");

        var client = httpClientFactory.CreateClient();

        var payload = new
        {
            grant_type    = "password",
            username      = request.Username,
            password      = request.Password,
            audience,
            scope         = "openid profile email",
            client_id     = clientId,
            client_secret = clientSecret
        };

        var response = await client.PostAsJsonAsync(
            $"https://{domain}/oauth/token", payload);

        var body = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            return BadRequest(new { error = "Auth0 rejected the request.", details = body });

        var token = await response.Content.ReadFromJsonAsync<TokenResponse>();
        return Ok(token);
    }
}

// ── DTOs ────────────────────────────────────────────────────────────────────────

public record LoginRequest(string Username, string Password);

public sealed class TokenResponse
{
    [JsonPropertyName("access_token")]  public string AccessToken  { get; init; } = "";
    [JsonPropertyName("id_token")]      public string? IdToken     { get; init; }
    [JsonPropertyName("token_type")]    public string TokenType    { get; init; } = "Bearer";
    [JsonPropertyName("expires_in")]    public int    ExpiresIn    { get; init; }
    [JsonPropertyName("scope")]         public string? Scope       { get; init; }
}
