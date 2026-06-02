using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.Data;
using RezervacijaVjencanja.DTOs.Partners;
using RezervacijaVjencanja.Tests.Helpers;
using Xunit;

namespace RezervacijaVjencanja.Tests.Integration;

/// <summary>
/// Full HTTP-layer integration tests for /api/partners.
/// </summary>
public sealed class PartnersIntegrationTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;

    public PartnersIntegrationTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client  = factory.CreateClient();
    }

    private T WithDb<T>(Func<AppDbContext, T> action)
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        return action(db);
    }

    // ──────────────────────────────────────────────
    // GET /api/partners
    // ──────────────────────────────────────────────

    [Fact]
    public async Task GET_Partners_Returns200_ContainsActivePartners()
    {
        WithDb(db =>
        {
            var pt = SeedHelpers.AddPartnerType(db, "GetAllBand", "GABAND");
            SeedHelpers.AddPartner(db, pt.Id, "GAActiveOne", isActive: true);
            SeedHelpers.AddPartner(db, pt.Id, "GAInactiveOne", isActive: false);
            return true;
        });

        var response = await _client.GetAsync("/api/partners");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<List<PartnerListDto>>>();
        body!.Data.Should().Contain(p => p.Name == "GAActiveOne");
        body.Data.Should().NotContain(p => p.Name == "GAInactiveOne");
    }

    [Fact]
    public async Task GET_Partners_FiltersByPartnerTypeId()
    {
        var (bandTypeId, photoTypeId) = WithDb(db =>
        {
            var pt1 = SeedHelpers.AddPartnerType(db, "FilterBand",  "FBAND");
            var pt2 = SeedHelpers.AddPartnerType(db, "FilterPhoto", "FPHOT");
            SeedHelpers.AddPartner(db, pt1.Id, "FBandPartner");
            SeedHelpers.AddPartner(db, pt2.Id, "FPhotoPartner");
            return (pt1.Id, pt2.Id);
        });

        var response = await _client.GetAsync($"/api/partners?partnerTypeId={bandTypeId}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<List<PartnerListDto>>>();
        body!.Data.Should().Contain(p => p.Name == "FBandPartner");
        body.Data.Should().NotContain(p => p.Name == "FPhotoPartner");
    }

    // ──────────────────────────────────────────────
    // GET /api/partners/{id}
    // ──────────────────────────────────────────────

    [Fact]
    public async Task GET_PartnerById_Returns200_WhenFound()
    {
        var p = WithDb(db =>
        {
            var pt = SeedHelpers.AddPartnerType(db, "GBIBand", "GBIBAND");
            return SeedHelpers.AddPartner(db, pt.Id, "SpecificPartner");
        });

        var response = await _client.GetAsync($"/api/partners/{p.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<PartnerDto>>();
        body!.Data!.Name.Should().Be("SpecificPartner");
    }

    [Fact]
    public async Task GET_PartnerById_Returns404_WhenNotFound()
    {
        var response = await _client.GetAsync("/api/partners/999999");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    // ──────────────────────────────────────────────
    // POST /api/partners
    // ──────────────────────────────────────────────

    [Fact]
    public async Task POST_Partner_Returns201_WhenValid()
    {
        var ptId = WithDb(db => SeedHelpers.AddPartnerType(db, "PostBand", "POSTBAND").Id);
        var payload = new CreatePartnerRequest("NewPartner", ptId, null, null, null, null, 10m, null, null);

        var response = await _client.PostAsJsonAsync("/api/partners", payload);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<PartnerDto>>();
        body!.Data!.Name.Should().Be("NewPartner");
        body.Data.IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task POST_Partner_Returns400_WhenNameEmpty()
    {
        var ptId = WithDb(db => SeedHelpers.AddPartnerType(db, "PostEmptyBand", "PEMBAND").Id);
        var payload = new CreatePartnerRequest("  ", ptId, null, null, null, null, 0m, null, null);

        var response = await _client.PostAsJsonAsync("/api/partners", payload);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task POST_Partner_Returns400_WhenPartnerTypeNotFound()
    {
        var payload = new CreatePartnerRequest("Partner", 99999, null, null, null, null, 0m, null, null);

        var response = await _client.PostAsJsonAsync("/api/partners", payload);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<PartnerDto>>();
        body!.Error.Should().Contain("not found");
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(101)]
    public async Task POST_Partner_Returns400_WhenCommissionOutOfRange(decimal commission)
    {
        var ptId = WithDb(db => SeedHelpers.AddPartnerType(db, $"CommBand{commission}", $"CB{(int)commission}").Id);
        var payload = new CreatePartnerRequest("Partner", ptId, null, null, null, null, commission, null, null);

        var response = await _client.PostAsJsonAsync("/api/partners", payload);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task POST_Partner_Returns400_WhenExtraFieldsInvalidJson()
    {
        var ptId = WithDb(db => SeedHelpers.AddPartnerType(db, "JsonBand", "JSONBAND").Id);
        var payload = new CreatePartnerRequest("Partner", ptId, null, null, null, null, 0m, null, "bad-json");

        var response = await _client.PostAsJsonAsync("/api/partners", payload);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    // ──────────────────────────────────────────────
    // PUT /api/partners/{id}
    // ──────────────────────────────────────────────

    [Fact]
    public async Task PUT_Partner_Returns200_WhenValid()
    {
        var (p, ptId) = WithDb(db =>
        {
            var pt = SeedHelpers.AddPartnerType(db, "PutBand", "PUTBAND");
            return (SeedHelpers.AddPartner(db, pt.Id, "OldName"), pt.Id);
        });

        var payload = new UpdatePartnerRequest("NewName", ptId, null, null, null, null, 20m, null, null, true);

        var response = await _client.PutAsJsonAsync($"/api/partners/{p.Id}", payload);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<PartnerDto>>();
        body!.Data!.Name.Should().Be("NewName");
        body.Data.CommissionPercent.Should().Be(20m);
    }

    [Fact]
    public async Task PUT_Partner_Returns404_WhenNotFound()
    {
        var ptId = WithDb(db => SeedHelpers.AddPartnerType(db, "Put404Band", "P404BAND").Id);
        var payload = new UpdatePartnerRequest("Name", ptId, null, null, null, null, 0m, null, null, true);

        var response = await _client.PutAsJsonAsync("/api/partners/999999", payload);

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    // ──────────────────────────────────────────────
    // DELETE /api/partners/{id}
    // ──────────────────────────────────────────────

    [Fact]
    public async Task DELETE_Partner_Returns200_AndRemoves()
    {
        var p = WithDb(db =>
        {
            var pt = SeedHelpers.AddPartnerType(db, "DelBand", "DELBAND");
            return SeedHelpers.AddPartner(db, pt.Id, "ToDelete");
        });

        var response = await _client.DeleteAsync($"/api/partners/{p.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var getResponse = await _client.GetAsync($"/api/partners/{p.Id}");
        getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DELETE_Partner_Returns404_WhenNotFound()
    {
        var response = await _client.DeleteAsync("/api/partners/999999");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    // ──────────────────────────────────────────────
    // POST /api/partners/{id}/clone
    // ──────────────────────────────────────────────

    [Fact]
    public async Task POST_Clone_Returns201_WithKopijaSuffix()
    {
        var p = WithDb(db =>
        {
            var pt = SeedHelpers.AddPartnerType(db, "CloneBand", "CLBAND");
            return SeedHelpers.AddPartner(db, pt.Id, "Original");
        });

        var response = await _client.PostAsync($"/api/partners/{p.Id}/clone", null);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<PartnerDto>>();
        body!.Data!.Name.Should().Be("Original (kopija)");
        body.Data.Id.Should().NotBe(p.Id);
    }

    [Fact]
    public async Task POST_Clone_Returns404_WhenNotFound()
    {
        var response = await _client.PostAsync("/api/partners/999999/clone", null);

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    // ──────────────────────────────────────────────
    // GET /api/partners/{id}/bookings
    // ──────────────────────────────────────────────

    [Fact]
    public async Task GET_PartnerBookings_Returns200_WithEmptyList()
    {
        var p = WithDb(db =>
        {
            var pt = SeedHelpers.AddPartnerType(db, "BookBand", "BKBAND");
            return SeedHelpers.AddPartner(db, pt.Id);
        });

        var response = await _client.GetAsync($"/api/partners/{p.Id}/bookings");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GET_PartnerBookings_Returns404_WhenPartnerNotFound()
    {
        var response = await _client.GetAsync("/api/partners/999999/bookings");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    // ──────────────────────────────────────────────
    // GET /api/partners/{id}/availability
    // ──────────────────────────────────────────────

    [Fact]
    public async Task GET_PartnerAvailability_Returns200_WhenAvailable()
    {
        var p = WithDb(db =>
        {
            var pt = SeedHelpers.AddPartnerType(db, "AvailBand", "AVBAND");
            return SeedHelpers.AddPartner(db, pt.Id);
        });
        var start = Uri.EscapeDataString(DateTime.UtcNow.AddDays(30).ToString("o"));
        var end   = Uri.EscapeDataString(DateTime.UtcNow.AddDays(30).AddHours(6).ToString("o"));

        var response = await _client.GetAsync($"/api/partners/{p.Id}/availability?start={start}&end={end}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GET_PartnerAvailability_Returns404_WhenPartnerNotFound()
    {
        var start = Uri.EscapeDataString(DateTime.UtcNow.ToString("o"));
        var end   = Uri.EscapeDataString(DateTime.UtcNow.AddHours(4).ToString("o"));

        var response = await _client.GetAsync($"/api/partners/999999/availability?start={start}&end={end}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
