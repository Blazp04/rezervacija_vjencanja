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
        // Arrange
        var response = await _client.GetAsync("/api/weddings");

        // Act
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<List<WeddingListDto>>>();
        body!.Data.Should().NotBeNull();
    }

    [Fact]
    public async Task GET_Weddings_Returns200_ContainsSeededWeddings()
    {
        // Arrange
        WithDb(db =>
        {
            SeedHelpers.AddWedding(db, "IntegrationWedding1");
            SeedHelpers.AddWedding(db, "IntegrationWedding2");
            return true;
        });

        // Act
        var response = await _client.GetAsync("/api/weddings");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<List<WeddingListDto>>>();
        body!.Data.Should().Contain(w => w.Name == "IntegrationWedding1");
        body.Data.Should().Contain(w => w.Name == "IntegrationWedding2");
    }

    [Fact]
    public async Task GET_Weddings_FiltersByStatus()
    {
        // Arrange
        WithDb(db =>
        {
            SeedHelpers.AddWedding(db, "FilterPrepWedding", "PREPARATION");
            SeedHelpers.AddWedding(db, "FilterConfWedding", "CONFIRMED");
            return true;
        });

        // Act
        var response = await _client.GetAsync("/api/weddings?status=CONFIRMED");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<List<WeddingListDto>>>();
        body!.Data.Should().Contain(w => w.Name == "FilterConfWedding");
        body.Data.Should().NotContain(w => w.Name == "FilterPrepWedding");
    }

    [Fact]
    public async Task GET_WeddingById_Returns200_WhenFound()
    {
        // Arrange
        var w = WithDb(db => SeedHelpers.AddWedding(db, "SingleWedding"));

        // Act
        var response = await _client.GetAsync($"/api/weddings/{w.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<WeddingDto>>();
        body!.Data!.Name.Should().Be("SingleWedding");
    }

    [Fact]
    public async Task GET_WeddingById_Returns404_WhenNotFound()
    {
        // Arrange
        var response = await _client.GetAsync("/api/weddings/999999");

        // Act
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task POST_Wedding_Returns201_WithValidBody()
    {
        // Arrange
        var payload = new CreateWeddingRequest("New Wedding", DateTime.UtcNow.AddMonths(3), "Venue", null, null);

        // Act
        var response = await _client.PostAsJsonAsync("/api/weddings", payload);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<WeddingDto>>();
        body!.Data!.Name.Should().Be("New Wedding");
        body.Data.Status.Should().Be("PREPARATION");
    }

    [Fact]
    public async Task POST_Wedding_Returns400_WhenNameMissing()
    {
        // Arrange
        var payload = new CreateWeddingRequest("", DateTime.UtcNow.AddMonths(3), null, null, null);

        // Act
        var response = await _client.PostAsJsonAsync("/api/weddings", payload);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task POST_Wedding_Returns400_WhenTemplateNotFound()
    {
        // Arrange
        var payload = new CreateWeddingRequest("Wedding", DateTime.UtcNow.AddMonths(1), null, 99999, null);

        // Act
        var response = await _client.PostAsJsonAsync("/api/weddings", payload);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<WeddingDto>>();
        body!.Error.Should().Contain("not found");
    }

    [Fact]
    public async Task PUT_Wedding_Returns200_WhenValid()
    {
        // Arrange
        var w = WithDb(db => SeedHelpers.AddWedding(db, "Old Name"));
        var payload = new UpdateWeddingRequest("Updated Name", DateTime.UtcNow.AddMonths(4), "New Venue", null, null, "PREPARATION");

        // Act
        var response = await _client.PutAsJsonAsync($"/api/weddings/{w.Id}", payload);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<WeddingDto>>();
        body!.Data!.Name.Should().Be("Updated Name");
    }

    [Fact]
    public async Task PUT_Wedding_Returns404_WhenNotFound()
    {
        // Arrange
        var payload = new UpdateWeddingRequest("Name", DateTime.UtcNow, null, null, null, "PREPARATION");

        // Act
        var response = await _client.PutAsJsonAsync("/api/weddings/999999", payload);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task PUT_Wedding_Returns400_WhenStatusInvalid()
    {
        // Arrange
        var w = WithDb(db => SeedHelpers.AddWedding(db));
        var payload = new UpdateWeddingRequest("Name", DateTime.UtcNow, null, null, null, "INVALID");

        // Act
        var response = await _client.PutAsJsonAsync($"/api/weddings/{w.Id}", payload);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task POST_WeddingStatus_Returns200_ForValidTransition()
    {
        // Arrange
        var w = WithDb(db => SeedHelpers.AddWedding(db, status: "PREPARATION"));
        var payload = new UpdateWeddingStatusRequest("CONFIRMED");

        // Act
        var response = await _client.PostAsJsonAsync($"/api/weddings/{w.Id}/status", payload);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<WeddingDto>>();
        body!.Data!.Status.Should().Be("CONFIRMED");
    }

    [Fact]
    public async Task POST_WeddingStatus_Returns400_ForInvalidTransition()
    {
        // Arrange
        var w = WithDb(db => SeedHelpers.AddWedding(db, status: "PREPARATION"));
        var payload = new UpdateWeddingStatusRequest("COMPLETED"); 

        // Act
        var response = await _client.PostAsJsonAsync($"/api/weddings/{w.Id}/status", payload);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task DELETE_Wedding_Returns200_AndSoftCancels()
    {
        // Arrange
        var w = WithDb(db => SeedHelpers.AddWedding(db, status: "PREPARATION"));

        // Act
        var response = await _client.DeleteAsync($"/api/weddings/{w.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var getResponse = await _client.GetAsync($"/api/weddings/{w.Id}");
        var body = await getResponse.Content.ReadFromJsonAsync<ApiResponse<WeddingDto>>();
        body!.Data!.Status.Should().Be("CANCELLED");
    }

    [Fact]
    public async Task DELETE_Wedding_Returns404_WhenNotFound()
    {
        // Arrange
        var response = await _client.DeleteAsync("/api/weddings/999999");

        // Act
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DELETE_Wedding_Returns400_WhenAlreadyCancelled()
    {
        // Arrange
        var w = WithDb(db => SeedHelpers.AddWedding(db, status: "CANCELLED"));

        // Act
        var response = await _client.DeleteAsync($"/api/weddings/{w.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}

