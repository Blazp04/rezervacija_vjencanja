using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.Data;
using RezervacijaVjencanja.DTOs.Partners;
using RezervacijaVjencanja.Tests.Helpers;

namespace RezervacijaVjencanja.Tests.Integration;




public sealed class PartnersIntegrationTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;

    public PartnersIntegrationTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client  = factory.CreateClient();
    }

    private AppDbContext GetDb()
    {
        var scope = _factory.Services.CreateScope();
        return scope.ServiceProvider.GetRequiredService<AppDbContext>();
    }

    
    
    

    [Fact]
    public async Task GET_Partners_Returns200_WithActivePartners()
    {
        using var db = GetDb();
        var pt = SeedHelpers.AddPartnerType(db);
        SeedHelpers.AddPartner(db, pt.Id, "ActiveOne", isActive: true);
        SeedHelpers.AddPartner(db, pt.Id, "InactiveOne", isActive: false);

        var response = await _client.GetAsync("/api/partners");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<List<PartnerListDto>>>();
        body!.Data.Should().Contain(p => p.Name == "ActiveOne");
        body.Data.Should().NotContain(p => p.Name == "InactiveOne");
    }

    [Fact]
    public async Task GET_Partners_FiltersByPartnerTypeId()
    {
        using var db = GetDb();
        var pt1 = SeedHelpers.AddPartnerType(db, "Band",  "BND");
        var pt2 = SeedHelpers.AddPartnerType(db, "Photo", "PHT");
        SeedHelpers.AddPartner(db, pt1.Id, "BandPartner");
        SeedHelpers.AddPartner(db, pt2.Id, "PhotoPartner");

        var response = await _client.GetAsync($"/api/partners?partnerTypeId={pt1.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<List<PartnerListDto>>>();
        body!.Data.Should().Contain(p => p.Name == "BandPartner");
        body.Data.Should().NotContain(p => p.Name == "PhotoPartner");
    }

    
    
    

    [Fact]
    public async Task GET_PartnerById_Returns200_WhenFound()
    {
        using var db = GetDb();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id, "SpecificPartner");

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

    
    
    

    [Fact]
    public async Task POST_Partner_Returns201_WhenValid()
    {
        using var db = GetDb();
        var pt = SeedHelpers.AddPartnerType(db);
        var payload = new CreatePartnerRequest("NewPartner", pt.Id, null, null, null, null, 10m, null, null);

        var response = await _client.PostAsJsonAsync("/api/partners", payload);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<PartnerDto>>();
        body!.Data!.Name.Should().Be("NewPartner");
        body.Data.IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task POST_Partner_Returns400_WhenNameEmpty()
    {
        using var db = GetDb();
        var pt = SeedHelpers.AddPartnerType(db);
        var payload = new CreatePartnerRequest("  ", pt.Id, null, null, null, null, 0m, null, null);

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
        using var db = GetDb();
        var pt = SeedHelpers.AddPartnerType(db);
        var payload = new CreatePartnerRequest("Partner", pt.Id, null, null, null, null, commission, null, null);

        var response = await _client.PostAsJsonAsync("/api/partners", payload);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task POST_Partner_Returns400_WhenExtraFieldsInvalidJson()
    {
        using var db = GetDb();
        var pt = SeedHelpers.AddPartnerType(db);
        var payload = new CreatePartnerRequest("Partner", pt.Id, null, null, null, null, 0m, null, "bad-json");

        var response = await _client.PostAsJsonAsync("/api/partners", payload);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    
    
    

    [Fact]
    public async Task PUT_Partner_Returns200_WhenValid()
    {
        using var db = GetDb();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id, "OldName");
        var payload = new UpdatePartnerRequest("NewName", pt.Id, null, null, null, null, 20m, null, null, true);

        var response = await _client.PutAsJsonAsync($"/api/partners/{p.Id}", payload);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<PartnerDto>>();
        body!.Data!.Name.Should().Be("NewName");
        body.Data.CommissionPercent.Should().Be(20m);
    }

    [Fact]
    public async Task PUT_Partner_Returns404_WhenNotFound()
    {
        using var db = GetDb();
        var pt = SeedHelpers.AddPartnerType(db);
        var payload = new UpdatePartnerRequest("Name", pt.Id, null, null, null, null, 0m, null, null, true);

        var response = await _client.PutAsJsonAsync("/api/partners/999999", payload);

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    
    
    

    [Fact]
    public async Task DELETE_Partner_Returns200_WhenFound()
    {
        using var db = GetDb();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);

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

    
    
    

    [Fact]
    public async Task POST_Clone_Returns201_WithKopijaSuffix()
    {
        using var db = GetDb();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id, "Original");

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

    
    
    

    [Fact]
    public async Task GET_PartnerBookings_Returns200_WithEmptyList_WhenNoBookings()
    {
        using var db = GetDb();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);

        var response = await _client.GetAsync($"/api/partners/{p.Id}/bookings");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GET_PartnerBookings_Returns404_WhenPartnerNotFound()
    {
        var response = await _client.GetAsync("/api/partners/999999/bookings");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    
    
    

    [Fact]
    public async Task GET_PartnerAvailability_Returns200_WhenAvailable()
    {
        using var db = GetDb();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
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
