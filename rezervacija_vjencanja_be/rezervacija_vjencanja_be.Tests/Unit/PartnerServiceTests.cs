using FluentAssertions;
using RezervacijaVjencanja.DTOs.Partners;
using RezervacijaVjencanja.Services.Partners;
using RezervacijaVjencanja.Tests.Helpers;
using Xunit;

namespace RezervacijaVjencanja.Tests.Unit;

public sealed class PartnerServiceTests
{

    [Fact]
    public async Task GetAllAsync_ReturnsOnlyActivePartners()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        SeedHelpers.AddPartner(db, pt.Id, "Active", isActive: true);
        SeedHelpers.AddPartner(db, pt.Id, "Inactive", isActive: false);
        var svc = new PartnerService(db);

        // Act
        var result = await svc.GetAllAsync();

        // Assert
        result.Error.Should().BeNull();
        result.Data.Should().ContainSingle(p => p.Name == "Active");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task GetAllAsync_FiltersByPartnerTypeId()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt1 = SeedHelpers.AddPartnerType(db, "Band", "BAND");
        var pt2 = SeedHelpers.AddPartnerType(db, "Photo", "PHOTO");
        SeedHelpers.AddPartner(db, pt1.Id, "BandCo");
        SeedHelpers.AddPartner(db, pt2.Id, "PhotCo");
        var svc = new PartnerService(db);

        // Act
        var result = await svc.GetAllAsync(pt1.Id);

        // Assert
        result.Error.Should().BeNull();
        result.Data.Should().ContainSingle(p => p.Name == "BandCo");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsPartner_WhenFound()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p = SeedHelpers.AddPartner(db, pt.Id, "MyPartner");
        var svc = new PartnerService(db);

        // Act
        var result = await svc.GetByIdAsync(p.Id);

        // Assert
        result.Error.Should().BeNull();
        result.Data!.Name.Should().Be("MyPartner");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsFail_WhenNotFound()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var svc = new PartnerService(db);

        // Act
        var result = await svc.GetByIdAsync(999);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("not found");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CreateAsync_CreatesPartner_WithValidRequest()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var svc = new PartnerService(db);
        var req = new CreatePartnerRequest("New Partner", pt.Id, "123 St", "0901", "x@x.com", null, 15m, null, null);

        // Act
        var result = await svc.CreateAsync(req);

        // Assert
        result.Error.Should().BeNull();
        result.Data!.Name.Should().Be("New Partner");
        result.Data.CommissionPercent.Should().Be(15m);
        result.Data.IsActive.Should().BeTrue();
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CreateAsync_ReturnsFail_WhenNameEmpty()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var svc = new PartnerService(db);
        var req = new CreatePartnerRequest("  ", pt.Id, null, null, null, null, 0m, null, null);

        // Act
        var result = await svc.CreateAsync(req);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("Name is required");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CreateAsync_ReturnsFail_WhenPartnerTypeNotFound()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var svc = new PartnerService(db);
        var req = new CreatePartnerRequest("Partner", 999, null, null, null, null, 0m, null, null);

        // Act
        var result = await svc.CreateAsync(req);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("PartnerType with id 999 was not found");
        // Annihilate — db disposed at end of using block
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(101)]
    public async Task CreateAsync_ReturnsFail_WhenCommissionOutOfRange(decimal commission)
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var svc = new PartnerService(db);
        var req = new CreatePartnerRequest("Partner", pt.Id, null, null, null, null, commission, null, null);

        // Act
        var result = await svc.CreateAsync(req);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("CommissionPercent must be between 0 and 100");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CreateAsync_ReturnsFail_WhenExtraFieldsInvalidJson()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var svc = new PartnerService(db);
        var req = new CreatePartnerRequest("Partner", pt.Id, null, null, null, null, 0m, null, "bad-json");

        // Act
        var result = await svc.CreateAsync(req);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("valid JSON");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CreateAsync_AcceptsValidExtraFieldsJson()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var svc = new PartnerService(db);
        var req = new CreatePartnerRequest("Partner", pt.Id, null, null, null, null, 0m, null, """{"key":"value"}""");

        // Act
        var result = await svc.CreateAsync(req);

        // Assert
        result.Error.Should().BeNull();
        result.Data!.ExtraFields.Should().Be("""{"key":"value"}""");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task UpdateAsync_UpdatesPartner_WithValidRequest()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p = SeedHelpers.AddPartner(db, pt.Id, "Old");
        var svc = new PartnerService(db);
        var req = new UpdatePartnerRequest("Updated", pt.Id, null, null, null, null, 20m, null, null, true);

        // Act
        var result = await svc.UpdateAsync(p.Id, req);

        // Assert
        result.Error.Should().BeNull();
        result.Data!.Name.Should().Be("Updated");
        result.Data.CommissionPercent.Should().Be(20m);
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task UpdateAsync_ReturnsFail_WhenNotFound()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var svc = new PartnerService(db);
        var req = new UpdatePartnerRequest("X", pt.Id, null, null, null, null, 0m, null, null, true);

        // Act
        var result = await svc.UpdateAsync(999, req);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("not found");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task UpdateAsync_CanDeactivatePartner()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p = SeedHelpers.AddPartner(db, pt.Id, isActive: true);
        var svc = new PartnerService(db);
        var req = new UpdatePartnerRequest("Test Partner", pt.Id, null, null, null, null, 0m, null, null, false);

        // Act
        var result = await svc.UpdateAsync(p.Id, req);

        // Assert
        result.Error.Should().BeNull();
        result.Data!.IsActive.Should().BeFalse();
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task DeleteAsync_RemovesPartner_WhenFound()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p = SeedHelpers.AddPartner(db, pt.Id);
        var svc = new PartnerService(db);

        // Act
        var result = await svc.DeleteAsync(p.Id);

        // Assert
        result.Error.Should().BeNull();
        result.Data.Should().BeTrue();
        db.Partners.Find(p.Id).Should().BeNull();
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFail_WhenNotFound()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var svc = new PartnerService(db);

        // Act
        var result = await svc.DeleteAsync(999);

        // Assert
        result.Data.Should().BeFalse();
        result.Error.Should().Contain("not found");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CloneAsync_CreatesNewPartner_WithKopijaSuffix()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p = SeedHelpers.AddPartner(db, pt.Id, "Original");
        var svc = new PartnerService(db);

        // Act
        var result = await svc.CloneAsync(p.Id);

        // Assert
        result.Error.Should().BeNull();
        result.Data!.Name.Should().Be("Original (kopija)");
        result.Data.Id.Should().NotBe(p.Id);
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CloneAsync_CopiesCatalogItems_AndPricingRules()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p = SeedHelpers.AddPartner(db, pt.Id, "Original");
        var ci = SeedHelpers.AddCatalogItem(db, p.Id, "Service A", "SERVICE", 500m);
        db.PricingRules.Add(new RezervacijaVjencanja.Entities.PricingRule
        {
            CatalogItemId = ci.Id,
            RuleType = "SPECIAL_DAY",
            DayOfWeek = 6,
            Price = 700m
        });
        await db.SaveChangesAsync();
        var svc = new PartnerService(db);

        // Act
        var result = await svc.CloneAsync(p.Id);

        // Assert
        result.Error.Should().BeNull();
        var cloneId = result.Data!.Id;
        var cloneItems = db.PartnerCatalogItems.Where(ci => ci.PartnerId == cloneId).ToList();
        cloneItems.Should().ContainSingle(i => i.Name == "Service A");
        var cloneRules = db.PricingRules.Where(r => cloneItems.Select(i => i.Id).Contains(r.CatalogItemId)).ToList();
        cloneRules.Should().ContainSingle(r => r.Price == 700m);
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CloneAsync_ReturnsFail_WhenNotFound()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var svc = new PartnerService(db);

        // Act
        var result = await svc.CloneAsync(999);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("not found");
        // Annihilate — db disposed at end of using block
    }
}

