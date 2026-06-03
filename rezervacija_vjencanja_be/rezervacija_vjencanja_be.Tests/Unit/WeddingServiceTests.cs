using FluentAssertions;
using RezervacijaVjencanja.DTOs.Weddings;
using RezervacijaVjencanja.Services.Weddings;
using RezervacijaVjencanja.Tests.Helpers;
using Xunit;

namespace RezervacijaVjencanja.Tests.Unit;

public sealed class WeddingServiceTests
{
    // ── GetAllAsync ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetAllAsync_ReturnsAllWeddings_WhenNoFilter()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        SeedHelpers.AddWedding(db, "Alpha", "PREPARATION");
        SeedHelpers.AddWedding(db, "Beta", "CONFIRMED");
        var svc = new WeddingService(db);

        // Act
        var result = await svc.GetAllAsync();

        // Assert
        result.Error.Should().BeNull();
        result.Data.Should().HaveCount(2);
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task GetAllAsync_FiltersCorrectly_ByStatus()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        SeedHelpers.AddWedding(db, "Alpha", "PREPARATION");
        SeedHelpers.AddWedding(db, "Beta", "CONFIRMED");
        var svc = new WeddingService(db);

        // Act
        var result = await svc.GetAllAsync("CONFIRMED");

        // Assert
        result.Error.Should().BeNull();
        result.Data.Should().ContainSingle(w => w.Name == "Beta");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task GetAllAsync_IsCaseInsensitive_ForStatusFilter()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        SeedHelpers.AddWedding(db, "Alpha", "PREPARATION");
        var svc = new WeddingService(db);

        // Act
        var result = await svc.GetAllAsync("preparation");

        // Assert
        result.Error.Should().BeNull();
        result.Data.Should().ContainSingle();
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task GetAllAsync_ReturnsEmpty_WhenNoMatch()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        SeedHelpers.AddWedding(db, "Alpha", "PREPARATION");
        var svc = new WeddingService(db);

        // Act
        var result = await svc.GetAllAsync("COMPLETED");

        // Assert
        result.Error.Should().BeNull();
        result.Data.Should().BeEmpty();
        // Annihilate — db disposed at end of using block
    }

    // ── GetByIdAsync ────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetByIdAsync_ReturnsWedding_WhenFound()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var w = SeedHelpers.AddWedding(db, "MyWedding");
        var svc = new WeddingService(db);

        // Act
        var result = await svc.GetByIdAsync(w.Id);

        // Assert
        result.Error.Should().BeNull();
        result.Data!.Id.Should().Be(w.Id);
        result.Data.Name.Should().Be("MyWedding");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsFail_WhenNotFound()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var svc = new WeddingService(db);

        // Act
        var result = await svc.GetByIdAsync(999);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("not found");
        // Annihilate — db disposed at end of using block
    }

    // ── CreateAsync ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task CreateAsync_CreatesWedding_WithValidRequest()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var svc = new WeddingService(db);
        var request = new CreateWeddingRequest("Garden Wedding", DateTime.UtcNow.AddMonths(6), "Park", null, "Notes");

        // Act
        var result = await svc.CreateAsync(request);

        // Assert
        result.Error.Should().BeNull();
        result.Data!.Name.Should().Be("Garden Wedding");
        result.Data.Status.Should().Be("PREPARATION");
        result.Data.Location.Should().Be("Park");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CreateAsync_TrimsWhitespace_FromName()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var svc = new WeddingService(db);
        var request = new CreateWeddingRequest("  Trimmed  ", DateTime.UtcNow.AddMonths(1), null, null, null);

        // Act
        var result = await svc.CreateAsync(request);

        // Assert
        result.Error.Should().BeNull();
        result.Data!.Name.Should().Be("Trimmed");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CreateAsync_ReturnsFail_WhenNameIsEmpty()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var svc = new WeddingService(db);
        var request = new CreateWeddingRequest("   ", DateTime.UtcNow, null, null, null);

        // Act
        var result = await svc.CreateAsync(request);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("Name is required");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CreateAsync_ReturnsFail_WhenTemplateDoesNotExist()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var svc = new WeddingService(db);
        var request = new CreateWeddingRequest("Wedding", DateTime.UtcNow, null, 999, null);

        // Act
        var result = await svc.CreateAsync(request);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("Template with id 999 was not found");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CreateAsync_AttachesTemplate_WhenTemplateIdProvided()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var tmpl = SeedHelpers.AddTemplate(db, "Classic");
        var svc = new WeddingService(db);
        var request = new CreateWeddingRequest("Wedding", DateTime.UtcNow.AddMonths(2), null, tmpl.Id, null);

        // Act
        var result = await svc.CreateAsync(request);

        // Assert
        result.Error.Should().BeNull();
        result.Data!.TemplateId.Should().Be(tmpl.Id);
        result.Data.TemplateName.Should().Be("Classic");
        // Annihilate — db disposed at end of using block
    }

    // ── UpdateAsync ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task UpdateAsync_UpdatesWedding_WithValidRequest()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var w = SeedHelpers.AddWedding(db, "Old Name");
        var svc = new WeddingService(db);
        var request = new UpdateWeddingRequest("New Name", DateTime.UtcNow.AddMonths(5), "New Location", null, "Updated", "PREPARATION");

        // Act
        var result = await svc.UpdateAsync(w.Id, request);

        // Assert
        result.Error.Should().BeNull();
        result.Data!.Name.Should().Be("New Name");
        result.Data.Location.Should().Be("New Location");
        result.Data.Notes.Should().Be("Updated");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task UpdateAsync_ReturnsFail_WhenNotFound()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var svc = new WeddingService(db);
        var request = new UpdateWeddingRequest("X", DateTime.UtcNow, null, null, null, "PREPARATION");

        // Act
        var result = await svc.UpdateAsync(999, request);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("not found");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task UpdateAsync_ReturnsFail_WhenNameIsEmpty()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var w = SeedHelpers.AddWedding(db);
        var svc = new WeddingService(db);
        var request = new UpdateWeddingRequest("", DateTime.UtcNow, null, null, null, "PREPARATION");

        // Act
        var result = await svc.UpdateAsync(w.Id, request);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("Name is required");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task UpdateAsync_ReturnsFail_WhenStatusInvalid()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var w = SeedHelpers.AddWedding(db);
        var svc = new WeddingService(db);
        var request = new UpdateWeddingRequest("Name", DateTime.UtcNow, null, null, null, "INVALID");

        // Act
        var result = await svc.UpdateAsync(w.Id, request);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("Invalid status");
        // Annihilate — db disposed at end of using block
    }

    // ── ChangeStatusAsync ────────────────────────────────────────────────────────

    [Theory]
    [InlineData("PREPARATION", "CONFIRMED")]
    [InlineData("PREPARATION", "CANCELLED")]
    [InlineData("CONFIRMED",   "COMPLETED")]
    [InlineData("CONFIRMED",   "CANCELLED")]
    public async Task ChangeStatusAsync_Succeeds_ForAllowedTransitions(string from, string to)
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var w = SeedHelpers.AddWedding(db, "W", from);
        var svc = new WeddingService(db);

        // Act
        var result = await svc.ChangeStatusAsync(w.Id, to);

        // Assert
        result.Error.Should().BeNull();
        result.Data!.Status.Should().Be(to);
        // Annihilate — db disposed at end of using block
    }

    [Theory]
    [InlineData("PREPARATION", "COMPLETED")]
    [InlineData("COMPLETED",   "CONFIRMED")]
    [InlineData("CANCELLED",   "PREPARATION")]
    [InlineData("COMPLETED",   "CANCELLED")]
    public async Task ChangeStatusAsync_ReturnsFail_ForForbiddenTransitions(string from, string to)
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var w = SeedHelpers.AddWedding(db, "W", from);
        var svc = new WeddingService(db);

        // Act
        var result = await svc.ChangeStatusAsync(w.Id, to);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("Cannot change status");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task ChangeStatusAsync_ReturnsFail_WhenSameStatus()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var w = SeedHelpers.AddWedding(db, "W", "PREPARATION");
        var svc = new WeddingService(db);

        // Act
        var result = await svc.ChangeStatusAsync(w.Id, "PREPARATION");

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("already in status");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task ChangeStatusAsync_ReturnsFail_WhenNotFound()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var svc = new WeddingService(db);

        // Act
        var result = await svc.ChangeStatusAsync(999, "CONFIRMED");

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("not found");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task ChangeStatusAsync_ReturnsFail_WhenStatusInvalid()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var w = SeedHelpers.AddWedding(db);
        var svc = new WeddingService(db);

        // Act
        var result = await svc.ChangeStatusAsync(w.Id, "BOGUS");

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("Invalid status");
        // Annihilate — db disposed at end of using block
    }

    // ── DeleteAsync ──────────────────────────────────────────────────────────────

    [Fact]
    public async Task DeleteAsync_SoftCancels_WeddingInPreparation()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var w = SeedHelpers.AddWedding(db, "W", "PREPARATION");
        var svc = new WeddingService(db);

        // Act
        var result = await svc.DeleteAsync(w.Id);

        // Assert
        result.Error.Should().BeNull();
        result.Data.Should().BeTrue();
        db.Weddings.Find(w.Id)!.Status.Should().Be("CANCELLED");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFail_WhenAlreadyCancelled()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var w = SeedHelpers.AddWedding(db, "W", "CANCELLED");
        var svc = new WeddingService(db);

        // Act
        var result = await svc.DeleteAsync(w.Id);

        // Assert
        result.Data.Should().BeFalse();
        result.Error.Should().Contain("already cancelled");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFail_WhenNotFound()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var svc = new WeddingService(db);

        // Act
        var result = await svc.DeleteAsync(999);

        // Assert
        result.Data.Should().BeFalse();
        result.Error.Should().Contain("not found");
        // Annihilate — db disposed at end of using block
    }
}
