using FluentAssertions;
using RezervacijaVjencanja.DTOs.PartnerTypes;
using RezervacijaVjencanja.Services.PartnerTypes;
using RezervacijaVjencanja.Tests.Helpers;
using Xunit;

namespace RezervacijaVjencanja.Tests.Unit;

public sealed class PartnerTypeServiceTests
{

    [Fact]
    public async Task GetAllAsync_ReturnsAllTypes()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        SeedHelpers.AddPartnerType(db, "Band", "BAND");
        SeedHelpers.AddPartnerType(db, "Photo", "PHOTO");
        var svc = new PartnerTypeService(db);

        // Act
        var result = await svc.GetAllAsync();

        // Assert
        result.Error.Should().BeNull();
        result.Data.Should().HaveCount(2);
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsType_WhenFound()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db, "Band", "BAND");
        var svc = new PartnerTypeService(db);

        // Act
        var result = await svc.GetByIdAsync(pt.Id);

        // Assert
        result.Error.Should().BeNull();
        result.Data!.Code.Should().Be("BAND");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsFail_WhenNotFound()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var svc = new PartnerTypeService(db);

        // Act
        var result = await svc.GetByIdAsync(999);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("not found");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CreateAsync_CreatesType_WithValidRequest()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var svc = new PartnerTypeService(db);
        var req = new CreatePartnerTypeRequest("Catering", "CAT", false, null);

        // Act
        var result = await svc.CreateAsync(req);

        // Assert
        result.Error.Should().BeNull();
        result.Data!.Name.Should().Be("Catering");
        result.Data.Code.Should().Be("CAT");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CreateAsync_UppercasesCode()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var svc = new PartnerTypeService(db);
        var req = new CreatePartnerTypeRequest("Catering", "cat", false, null);

        // Act
        var result = await svc.CreateAsync(req);

        // Assert
        result.Error.Should().BeNull();
        result.Data!.Code.Should().Be("CAT");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CreateAsync_ReturnsFail_WhenNameEmpty()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var svc = new PartnerTypeService(db);
        var req = new CreatePartnerTypeRequest("  ", "CAT", false, null);

        // Act
        var result = await svc.CreateAsync(req);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("Name is required");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CreateAsync_ReturnsFail_WhenCodeEmpty()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var svc = new PartnerTypeService(db);
        var req = new CreatePartnerTypeRequest("Catering", "  ", false, null);

        // Act
        var result = await svc.CreateAsync(req);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("Code is required");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CreateAsync_ReturnsFail_WhenNameAlreadyExists()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        SeedHelpers.AddPartnerType(db, "Band", "BAND");
        var svc = new PartnerTypeService(db);
        var req = new CreatePartnerTypeRequest("Band", "NEW", false, null);

        // Act
        var result = await svc.CreateAsync(req);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("already exists");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CreateAsync_ReturnsFail_WhenCodeAlreadyExists()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        SeedHelpers.AddPartnerType(db, "Band", "BAND");
        var svc = new PartnerTypeService(db);
        var req = new CreatePartnerTypeRequest("Orchestra", "BAND", false, null);

        // Act
        var result = await svc.CreateAsync(req);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("already exists");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CreateAsync_ReturnsFail_WhenFieldSchemaInvalidJson()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var svc = new PartnerTypeService(db);
        var req = new CreatePartnerTypeRequest("Catering", "CAT", false, "not-json");

        // Act
        var result = await svc.CreateAsync(req);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("valid JSON");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task UpdateAsync_UpdatesType_WithValidRequest()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db, "Band", "BAND");
        var svc = new PartnerTypeService(db);
        var req = new UpdatePartnerTypeRequest("Orchestra", "ORCH", true, null);

        // Act
        var result = await svc.UpdateAsync(pt.Id, req);

        // Assert
        result.Error.Should().BeNull();
        result.Data!.Name.Should().Be("Orchestra");
        result.Data.Code.Should().Be("ORCH");
        result.Data.HasBooking.Should().BeTrue();
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task UpdateAsync_ReturnsFail_WhenNotFound()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var svc = new PartnerTypeService(db);
        var req = new UpdatePartnerTypeRequest("X", "X", false, null);

        // Act
        var result = await svc.UpdateAsync(999, req);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("not found");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task UpdateAsync_AllowsSameNameSameId()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db, "Band", "BAND");
        var svc = new PartnerTypeService(db);
        var req = new UpdatePartnerTypeRequest("Band", "BAND", true, null);

        // Act
        var result = await svc.UpdateAsync(pt.Id, req);

        // Assert
        result.Error.Should().BeNull();
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task UpdateAsync_ReturnsFail_WhenNameConflictsWithOtherRecord()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        SeedHelpers.AddPartnerType(db, "Band", "BAND");
        var pt2 = SeedHelpers.AddPartnerType(db, "Photo", "PHOTO");
        var svc = new PartnerTypeService(db);
        var req = new UpdatePartnerTypeRequest("Band", "PHO2", false, null);

        // Act
        var result = await svc.UpdateAsync(pt2.Id, req);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("already exists");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task DeleteAsync_RemovesType_WhenFound()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var svc = new PartnerTypeService(db);

        // Act
        var result = await svc.DeleteAsync(pt.Id);

        // Assert
        result.Error.Should().BeNull();
        result.Data.Should().BeTrue();
        db.PartnerTypes.Find(pt.Id).Should().BeNull();
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFail_WhenNotFound()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var svc = new PartnerTypeService(db);

        // Act
        var result = await svc.DeleteAsync(999);

        // Assert
        result.Data.Should().BeFalse();
        result.Error.Should().Contain("not found");
        // Annihilate — db disposed at end of using block
    }
}

