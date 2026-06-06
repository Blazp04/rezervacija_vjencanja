using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.Data;
using RezervacijaVjencanja.DTOs.Weddings;
using RezervacijaVjencanja.Tests.Helpers;
using Xunit;

namespace RezervacijaVjencanja.Tests.Integration;






public sealed class WeddingsIntegrationTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;

    public WeddingsIntegrationTests(TestWebApplicationFactory factory)
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

    
    
    

    [Fact]
    public async Task GET_Weddings_Returns200_WithDataList()
    {
        var response = await _client.GetAsync("/api/weddings");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<List<WeddingListDto>>>();
        body!.Data.Should().NotBeNull();
    }

    [Fact]
    public async Task GET_Weddings_Returns200_ContainsSeededWeddings()
    {
        WithDb(db =>
        {
            SeedHelpers.AddWedding(db, "IntegrationWedding1");
            SeedHelpers.AddWedding(db, "IntegrationWedding2");
            return true;
        });

        var response = await _client.GetAsync("/api/weddings");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<List<WeddingListDto>>>();
        body!.Data.Should().Contain(w => w.Name == "IntegrationWedding1");
        body.Data.Should().Contain(w => w.Name == "IntegrationWedding2");
    }

    [Fact]
    public async Task GET_Weddings_FiltersByStatus()
    {
        WithDb(db =>
        {
            SeedHelpers.AddWedding(db, "FilterPrepWedding", "PREPARATION");
            SeedHelpers.AddWedding(db, "FilterConfWedding", "CONFIRMED");
            return true;
        });

        var response = await _client.GetAsync("/api/weddings?status=CONFIRMED");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<List<WeddingListDto>>>();
        body!.Data.Should().Contain(w => w.Name == "FilterConfWedding");
        body.Data.Should().NotContain(w => w.Name == "FilterPrepWedding");
    }

    
    
    

    [Fact]
    public async Task GET_WeddingById_Returns200_WhenFound()
    {
        var w = WithDb(db => SeedHelpers.AddWedding(db, "SingleWedding"));

        var response = await _client.GetAsync($"/api/weddings/{w.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<WeddingDto>>();
        body!.Data!.Name.Should().Be("SingleWedding");
    }

    [Fact]
    public async Task GET_WeddingById_Returns404_WhenNotFound()
    {
        var response = await _client.GetAsync("/api/weddings/999999");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    
    
    

    [Fact]
    public async Task POST_Wedding_Returns201_WithValidBody()
    {
        var payload = new CreateWeddingRequest("New Wedding", DateTime.UtcNow.AddMonths(3), "Venue", null, null);

        var response = await _client.PostAsJsonAsync("/api/weddings", payload);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<WeddingDto>>();
        body!.Data!.Name.Should().Be("New Wedding");
        body.Data.Status.Should().Be("PREPARATION");
    }

    [Fact]
    public async Task POST_Wedding_Returns400_WhenNameMissing()
    {
        var payload = new CreateWeddingRequest("", DateTime.UtcNow.AddMonths(3), null, null, null);

        var response = await _client.PostAsJsonAsync("/api/weddings", payload);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task POST_Wedding_Returns400_WhenTemplateNotFound()
    {
        var payload = new CreateWeddingRequest("Wedding", DateTime.UtcNow.AddMonths(1), null, 99999, null);

        var response = await _client.PostAsJsonAsync("/api/weddings", payload);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<WeddingDto>>();
        body!.Error.Should().Contain("not found");
    }

    
    
    

    [Fact]
    public async Task PUT_Wedding_Returns200_WhenValid()
    {
        var w = WithDb(db => SeedHelpers.AddWedding(db, "Old Name"));
        var payload = new UpdateWeddingRequest("Updated Name", DateTime.UtcNow.AddMonths(4), "New Venue", null, null, "PREPARATION");

        var response = await _client.PutAsJsonAsync($"/api/weddings/{w.Id}", payload);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<WeddingDto>>();
        body!.Data!.Name.Should().Be("Updated Name");
    }

    [Fact]
    public async Task PUT_Wedding_Returns404_WhenNotFound()
    {
        var payload = new UpdateWeddingRequest("Name", DateTime.UtcNow, null, null, null, "PREPARATION");

        var response = await _client.PutAsJsonAsync("/api/weddings/999999", payload);

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task PUT_Wedding_Returns400_WhenStatusInvalid()
    {
        var w = WithDb(db => SeedHelpers.AddWedding(db));
        var payload = new UpdateWeddingRequest("Name", DateTime.UtcNow, null, null, null, "INVALID");

        var response = await _client.PutAsJsonAsync($"/api/weddings/{w.Id}", payload);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    
    
    

    [Fact]
    public async Task POST_WeddingStatus_Returns200_ForValidTransition()
    {
        var w = WithDb(db => SeedHelpers.AddWedding(db, status: "PREPARATION"));
        var payload = new UpdateWeddingStatusRequest("CONFIRMED");

        var response = await _client.PostAsJsonAsync($"/api/weddings/{w.Id}/status", payload);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<WeddingDto>>();
        body!.Data!.Status.Should().Be("CONFIRMED");
    }

    [Fact]
    public async Task POST_WeddingStatus_Returns400_ForInvalidTransition()
    {
        var w = WithDb(db => SeedHelpers.AddWedding(db, status: "PREPARATION"));
        var payload = new UpdateWeddingStatusRequest("COMPLETED"); 

        var response = await _client.PostAsJsonAsync($"/api/weddings/{w.Id}/status", payload);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    
    
    

    [Fact]
    public async Task DELETE_Wedding_Returns200_AndSoftCancels()
    {
        var w = WithDb(db => SeedHelpers.AddWedding(db, status: "PREPARATION"));

        var response = await _client.DeleteAsync($"/api/weddings/{w.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var getResponse = await _client.GetAsync($"/api/weddings/{w.Id}");
        var body = await getResponse.Content.ReadFromJsonAsync<ApiResponse<WeddingDto>>();
        body!.Data!.Status.Should().Be("CANCELLED");
    }

    [Fact]
    public async Task DELETE_Wedding_Returns404_WhenNotFound()
    {
        var response = await _client.DeleteAsync("/api/weddings/999999");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DELETE_Wedding_Returns400_WhenAlreadyCancelled()
    {
        var w = WithDb(db => SeedHelpers.AddWedding(db, status: "CANCELLED"));

        var response = await _client.DeleteAsync($"/api/weddings/{w.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
