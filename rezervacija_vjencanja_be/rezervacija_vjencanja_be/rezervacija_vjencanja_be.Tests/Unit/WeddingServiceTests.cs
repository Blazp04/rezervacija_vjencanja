using FluentAssertions;
using RezervacijaVjencanja.DTOs.Weddings;
using RezervacijaVjencanja.Services.Weddings;
using RezervacijaVjencanja.Tests.Helpers;
using Xunit;

namespace RezervacijaVjencanja.Tests.Unit;

public sealed class WeddingServiceTests
{
    
    
    

    [Fact]
    public async Task GetAllAsync_ReturnsAllWeddings_WhenNoFilter()
    {
        using var db = DbContextFactory.Create();
        SeedHelpers.AddWedding(db, "Alpha", "PREPARATION");
        SeedHelpers.AddWedding(db, "Beta", "CONFIRMED");
        var svc = new WeddingService(db);

        var result = await svc.GetAllAsync();

        result.Error.Should().BeNull();
        result.Data.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetAllAsync_FiltersCorrectly_ByStatus()
    {
        using var db = DbContextFactory.Create();
        SeedHelpers.AddWedding(db, "Alpha", "PREPARATION");
        SeedHelpers.AddWedding(db, "Beta", "CONFIRMED");
        var svc = new WeddingService(db);

        var result = await svc.GetAllAsync("CONFIRMED");

        result.Error.Should().BeNull();
        result.Data.Should().ContainSingle(w => w.Name == "Beta");
    }

    [Fact]
    public async Task GetAllAsync_IsCaseInsensitive_ForStatusFilter()
    {
        using var db = DbContextFactory.Create();
        SeedHelpers.AddWedding(db, "Alpha", "PREPARATION");
        var svc = new WeddingService(db);

        var result = await svc.GetAllAsync("preparation");

        result.Error.Should().BeNull();
        result.Data.Should().ContainSingle();
    }

    [Fact]
    public async Task GetAllAsync_ReturnsEmpty_WhenNoMatch()
    {
        using var db = DbContextFactory.Create();
        SeedHelpers.AddWedding(db, "Alpha", "PREPARATION");
        var svc = new WeddingService(db);

        var result = await svc.GetAllAsync("COMPLETED");

        result.Error.Should().BeNull();
        result.Data.Should().BeEmpty();
    }

    
    
    

    [Fact]
    public async Task GetByIdAsync_ReturnsWedding_WhenFound()
    {
        using var db = DbContextFactory.Create();
        var w = SeedHelpers.AddWedding(db, "MyWedding");
        var svc = new WeddingService(db);

        var result = await svc.GetByIdAsync(w.Id);

        result.Error.Should().BeNull();
        result.Data!.Id.Should().Be(w.Id);
        result.Data.Name.Should().Be("MyWedding");
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsFail_WhenNotFound()
    {
        using var db = DbContextFactory.Create();
        var svc = new WeddingService(db);

        var result = await svc.GetByIdAsync(999);

        result.Data.Should().BeNull();
        result.Error.Should().Contain("not found");
    }

    
    
    

    [Fact]
    public async Task CreateAsync_CreatesWedding_WithValidRequest()
    {
        using var db = DbContextFactory.Create();
        var svc = new WeddingService(db);
        var request = new CreateWeddingRequest("Garden Wedding", DateTime.UtcNow.AddMonths(6), "Park", null, "Notes");

        var result = await svc.CreateAsync(request);

        result.Error.Should().BeNull();
        result.Data!.Name.Should().Be("Garden Wedding");
        result.Data.Status.Should().Be("PREPARATION");
        result.Data.Location.Should().Be("Park");
    }

    [Fact]
    public async Task CreateAsync_TrimsWhitespace_FromName()
    {
        using var db = DbContextFactory.Create();
        var svc = new WeddingService(db);
        var request = new CreateWeddingRequest("  Trimmed  ", DateTime.UtcNow.AddMonths(1), null, null, null);

        var result = await svc.CreateAsync(request);

        result.Error.Should().BeNull();
        result.Data!.Name.Should().Be("Trimmed");
    }

    [Fact]
    public async Task CreateAsync_ReturnsFail_WhenNameIsEmpty()
    {
        using var db = DbContextFactory.Create();
        var svc = new WeddingService(db);
        var request = new CreateWeddingRequest("   ", DateTime.UtcNow, null, null, null);

        var result = await svc.CreateAsync(request);

        result.Data.Should().BeNull();
        result.Error.Should().Contain("Name is required");
    }

    [Fact]
    public async Task CreateAsync_ReturnsFail_WhenTemplateDoesNotExist()
    {
        using var db = DbContextFactory.Create();
        var svc = new WeddingService(db);
        var request = new CreateWeddingRequest("Wedding", DateTime.UtcNow, null, 999, null);

        var result = await svc.CreateAsync(request);

        result.Data.Should().BeNull();
        result.Error.Should().Contain("Template with id 999 was not found");
    }

    [Fact]
    public async Task CreateAsync_AttachesTemplate_WhenTemplateIdProvided()
    {
        using var db = DbContextFactory.Create();
        var tmpl = SeedHelpers.AddTemplate(db, "Classic");
        var svc = new WeddingService(db);
        var request = new CreateWeddingRequest("Wedding", DateTime.UtcNow.AddMonths(2), null, tmpl.Id, null);

        var result = await svc.CreateAsync(request);

        result.Error.Should().BeNull();
        result.Data!.TemplateId.Should().Be(tmpl.Id);
        result.Data.TemplateName.Should().Be("Classic");
    }

    
    
    

    [Fact]
    public async Task UpdateAsync_UpdatesWedding_WithValidRequest()
    {
        using var db = DbContextFactory.Create();
        var w = SeedHelpers.AddWedding(db, "Old Name");
        var svc = new WeddingService(db);
        var dt = DateTime.UtcNow.AddMonths(5);
        var request = new UpdateWeddingRequest("New Name", dt, "New Location", null, "Updated", "PREPARATION");

        var result = await svc.UpdateAsync(w.Id, request);

        result.Error.Should().BeNull();
        result.Data!.Name.Should().Be("New Name");
        result.Data.Location.Should().Be("New Location");
        result.Data.Notes.Should().Be("Updated");
    }

    [Fact]
    public async Task UpdateAsync_ReturnsFail_WhenNotFound()
    {
        using var db = DbContextFactory.Create();
        var svc = new WeddingService(db);
        var request = new UpdateWeddingRequest("X", DateTime.UtcNow, null, null, null, "PREPARATION");

        var result = await svc.UpdateAsync(999, request);

        result.Data.Should().BeNull();
        result.Error.Should().Contain("not found");
    }

    [Fact]
    public async Task UpdateAsync_ReturnsFail_WhenNameIsEmpty()
    {
        using var db = DbContextFactory.Create();
        var w = SeedHelpers.AddWedding(db);
        var svc = new WeddingService(db);
        var request = new UpdateWeddingRequest("", DateTime.UtcNow, null, null, null, "PREPARATION");

        var result = await svc.UpdateAsync(w.Id, request);

        result.Data.Should().BeNull();
        result.Error.Should().Contain("Name is required");
    }

    [Fact]
    public async Task UpdateAsync_ReturnsFail_WhenStatusInvalid()
    {
        using var db = DbContextFactory.Create();
        var w = SeedHelpers.AddWedding(db);
        var svc = new WeddingService(db);
        var request = new UpdateWeddingRequest("Name", DateTime.UtcNow, null, null, null, "INVALID");

        var result = await svc.UpdateAsync(w.Id, request);

        result.Data.Should().BeNull();
        result.Error.Should().Contain("Invalid status");
    }

    
    
    

    [Theory]
    [InlineData("PREPARATION", "CONFIRMED")]
    [InlineData("PREPARATION", "CANCELLED")]
    [InlineData("CONFIRMED", "COMPLETED")]
    [InlineData("CONFIRMED", "CANCELLED")]
    public async Task ChangeStatusAsync_Succeeds_ForAllowedTransitions(string from, string to)
    {
        using var db = DbContextFactory.Create();
        var w = SeedHelpers.AddWedding(db, "W", from);
        var svc = new WeddingService(db);

        var result = await svc.ChangeStatusAsync(w.Id, to);

        result.Error.Should().BeNull();
        result.Data!.Status.Should().Be(to);
    }

    [Theory]
    [InlineData("PREPARATION", "COMPLETED")]
    [InlineData("COMPLETED", "CONFIRMED")]
    [InlineData("CANCELLED", "PREPARATION")]
    [InlineData("COMPLETED", "CANCELLED")]
    public async Task ChangeStatusAsync_ReturnsFail_ForForbiddenTransitions(string from, string to)
    {
        using var db = DbContextFactory.Create();
        var w = SeedHelpers.AddWedding(db, "W", from);
        var svc = new WeddingService(db);

        var result = await svc.ChangeStatusAsync(w.Id, to);

        result.Data.Should().BeNull();
        result.Error.Should().Contain("Cannot change status");
    }

    [Fact]
    public async Task ChangeStatusAsync_ReturnsFail_WhenSameStatus()
    {
        using var db = DbContextFactory.Create();
        var w = SeedHelpers.AddWedding(db, "W", "PREPARATION");
        var svc = new WeddingService(db);

        var result = await svc.ChangeStatusAsync(w.Id, "PREPARATION");

        result.Data.Should().BeNull();
        result.Error.Should().Contain("already in status");
    }

    [Fact]
    public async Task ChangeStatusAsync_ReturnsFail_WhenNotFound()
    {
        using var db = DbContextFactory.Create();
        var svc = new WeddingService(db);

        var result = await svc.ChangeStatusAsync(999, "CONFIRMED");

        result.Data.Should().BeNull();
        result.Error.Should().Contain("not found");
    }

    [Fact]
    public async Task ChangeStatusAsync_ReturnsFail_WhenStatusInvalid()
    {
        using var db = DbContextFactory.Create();
        var w = SeedHelpers.AddWedding(db);
        var svc = new WeddingService(db);

        var result = await svc.ChangeStatusAsync(w.Id, "BOGUS");

        result.Data.Should().BeNull();
        result.Error.Should().Contain("Invalid status");
    }

    
    
    

    [Fact]
    public async Task DeleteAsync_SoftCancels_WeddingInPreparation()
    {
        using var db = DbContextFactory.Create();
        var w = SeedHelpers.AddWedding(db, "W", "PREPARATION");
        var svc = new WeddingService(db);

        var result = await svc.DeleteAsync(w.Id);

        result.Error.Should().BeNull();
        result.Data.Should().BeTrue();
        db.Weddings.Find(w.Id)!.Status.Should().Be("CANCELLED");
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFail_WhenAlreadyCancelled()
    {
        using var db = DbContextFactory.Create();
        var w = SeedHelpers.AddWedding(db, "W", "CANCELLED");
        var svc = new WeddingService(db);

        var result = await svc.DeleteAsync(w.Id);

        result.Data.Should().BeFalse();
        result.Error.Should().Contain("already cancelled");
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFail_WhenNotFound()
    {
        using var db = DbContextFactory.Create();
        var svc = new WeddingService(db);

        var result = await svc.DeleteAsync(999);

        result.Data.Should().BeFalse();
        result.Error.Should().Contain("not found");
    }
}
