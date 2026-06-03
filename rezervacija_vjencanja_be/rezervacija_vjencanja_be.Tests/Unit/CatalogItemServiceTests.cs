using FluentAssertions;
using RezervacijaVjencanja.DTOs.CatalogItems;
using RezervacijaVjencanja.Services.CatalogItems;
using RezervacijaVjencanja.Tests.Helpers;
using Xunit;

namespace RezervacijaVjencanja.Tests.Unit;

public sealed class CatalogItemServiceTests
{

    [Fact]
    public async Task GetByPartnerIdAsync_ReturnsItems_WhenPartnerExists()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        SeedHelpers.AddCatalogItem(db, p.Id, "Item A");
        SeedHelpers.AddCatalogItem(db, p.Id, "Item B");
        var svc = new CatalogItemService(db);

        // Act
        var result = await svc.GetByPartnerIdAsync(p.Id);

        // Assert
        result.Error.Should().BeNull();
        result.Data.Should().HaveCount(2);
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task GetByPartnerIdAsync_ReturnsFail_WhenPartnerNotFound()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var svc = new CatalogItemService(db);

        // Act
        var result = await svc.GetByPartnerIdAsync(999);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("not found");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task GetByPartnerIdAsync_ReturnsEmpty_WhenNoItemsExist()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var svc = new CatalogItemService(db);

        // Act
        var result = await svc.GetByPartnerIdAsync(p.Id);

        // Assert
        result.Error.Should().BeNull();
        result.Data.Should().BeEmpty();
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsItem_WhenFound()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var ci = SeedHelpers.AddCatalogItem(db, p.Id, "Live Set");
        var svc = new CatalogItemService(db);

        // Act
        var result = await svc.GetByIdAsync(ci.Id);

        // Assert
        result.Error.Should().BeNull();
        result.Data!.Name.Should().Be("Live Set");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsFail_WhenNotFound()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var svc = new CatalogItemService(db);

        // Act
        var result = await svc.GetByIdAsync(999);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("not found");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CreateAsync_CreatesItem_WithValidServiceRequest()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var svc = new CatalogItemService(db);
        var req = new CreateCatalogItemRequest(p.Id, "DJ Set", "Music", "Full evening", "SERVICE", 800m, null);

        // Act
        var result = await svc.CreateAsync(req);

        // Assert
        result.Error.Should().BeNull();
        result.Data!.Name.Should().Be("DJ Set");
        result.Data.ItemType.Should().Be("SERVICE");
        result.Data.BasePrice.Should().Be(800m);
        result.Data.IsActive.Should().BeTrue();
        // Annihilate — db disposed at end of using block
    }

    [Theory]
    [InlineData("SERVICE")]
    [InlineData("PRODUCT")]
    [InlineData("SONG")]
    public async Task CreateAsync_AcceptsAllValidItemTypes(string itemType)
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var svc = new CatalogItemService(db);
        var req = new CreateCatalogItemRequest(p.Id, "Item", null, null, itemType, null, null);

        // Act
        var result = await svc.CreateAsync(req);

        // Assert
        result.Error.Should().BeNull();
        result.Data!.ItemType.Should().Be(itemType);
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CreateAsync_ReturnsFail_WhenNameEmpty()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var svc = new CatalogItemService(db);
        var req = new CreateCatalogItemRequest(p.Id, "  ", null, null, "SERVICE", null, null);

        // Act
        var result = await svc.CreateAsync(req);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("Name is required");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CreateAsync_ReturnsFail_WhenItemTypeInvalid()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var svc = new CatalogItemService(db);
        var req = new CreateCatalogItemRequest(p.Id, "Item", null, null, "INVALID", null, null);

        // Act
        var result = await svc.CreateAsync(req);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("ItemType must be one of");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CreateAsync_ReturnsFail_WhenPartnerNotFound()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var svc = new CatalogItemService(db);
        var req = new CreateCatalogItemRequest(999, "Item", null, null, "SERVICE", null, null);

        // Act
        var result = await svc.CreateAsync(req);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("Partner with id 999 was not found");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CreateAsync_ReturnsFail_WhenBasePriceNegative()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var svc = new CatalogItemService(db);
        var req = new CreateCatalogItemRequest(p.Id, "Item", null, null, "SERVICE", -1m, null);

        // Act
        var result = await svc.CreateAsync(req);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("BasePrice must be >= 0");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CreateAsync_ReturnsFail_WhenMetadataInvalidJson()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var svc = new CatalogItemService(db);
        var req = new CreateCatalogItemRequest(p.Id, "Item", null, null, "SERVICE", null, "not-json");

        // Act
        var result = await svc.CreateAsync(req);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("valid JSON");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task UpdateAsync_UpdatesItem_WithValidRequest()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var ci = SeedHelpers.AddCatalogItem(db, p.Id, "Old Name", "SERVICE", 100m);
        var svc = new CatalogItemService(db);
        var req = new UpdateCatalogItemRequest("New Name", "Cat", "Desc", "PRODUCT", 200m, null, false, 5);

        // Act
        var result = await svc.UpdateAsync(ci.Id, req);

        // Assert
        result.Error.Should().BeNull();
        result.Data!.Name.Should().Be("New Name");
        result.Data.BasePrice.Should().Be(200m);
        result.Data.IsActive.Should().BeFalse();
        result.Data.SortOrder.Should().Be(5);
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task UpdateAsync_ReturnsFail_WhenNotFound()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var svc = new CatalogItemService(db);
        var req = new UpdateCatalogItemRequest("Name", null, null, "SERVICE", null, null, true, 0);

        // Act
        var result = await svc.UpdateAsync(999, req);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("not found");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task UpdateAsync_ReturnsFail_WhenNameEmpty()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var ci = SeedHelpers.AddCatalogItem(db, p.Id);
        var svc = new CatalogItemService(db);
        var req = new UpdateCatalogItemRequest("  ", null, null, "SERVICE", null, null, true, 0);

        // Act
        var result = await svc.UpdateAsync(ci.Id, req);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("Name is required");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task DeleteAsync_RemovesItem_WhenFound()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var ci = SeedHelpers.AddCatalogItem(db, p.Id);
        var svc = new CatalogItemService(db);

        // Act
        var result = await svc.DeleteAsync(ci.Id);

        // Assert
        result.Error.Should().BeNull();
        result.Data.Should().BeTrue();
        db.PartnerCatalogItems.Find(ci.Id).Should().BeNull();
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFail_WhenNotFound()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var svc = new CatalogItemService(db);

        // Act
        var result = await svc.DeleteAsync(999);

        // Assert
        result.Data.Should().BeFalse();
        result.Error.Should().Contain("not found");
        // Annihilate — db disposed at end of using block
    }
}

