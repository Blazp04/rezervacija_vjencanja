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
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        SeedHelpers.AddCatalogItem(db, p.Id, "Item A");
        SeedHelpers.AddCatalogItem(db, p.Id, "Item B");
        var svc = new CatalogItemService(db);

        var result = await svc.GetByPartnerIdAsync(p.Id);

        result.Error.Should().BeNull();
        result.Data.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetByPartnerIdAsync_ReturnsFail_WhenPartnerNotFound()
    {
        using var db = DbContextFactory.Create();
        var svc = new CatalogItemService(db);

        var result = await svc.GetByPartnerIdAsync(999);

        result.Data.Should().BeNull();
        result.Error.Should().Contain("not found");
    }

    [Fact]
    public async Task GetByPartnerIdAsync_ReturnsEmpty_WhenNoItemsExist()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var svc = new CatalogItemService(db);

        var result = await svc.GetByPartnerIdAsync(p.Id);

        result.Error.Should().BeNull();
        result.Data.Should().BeEmpty();
    }

    
    
    

    [Fact]
    public async Task GetByIdAsync_ReturnsItem_WhenFound()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var ci = SeedHelpers.AddCatalogItem(db, p.Id, "Live Set");
        var svc = new CatalogItemService(db);

        var result = await svc.GetByIdAsync(ci.Id);

        result.Error.Should().BeNull();
        result.Data!.Name.Should().Be("Live Set");
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsFail_WhenNotFound()
    {
        using var db = DbContextFactory.Create();
        var svc = new CatalogItemService(db);

        var result = await svc.GetByIdAsync(999);

        result.Data.Should().BeNull();
        result.Error.Should().Contain("not found");
    }

    
    
    

    [Fact]
    public async Task CreateAsync_CreatesItem_WithValidServiceRequest()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var svc = new CatalogItemService(db);
        var req = new CreateCatalogItemRequest(p.Id, "DJ Set", "Music", "Full evening", "SERVICE", 800m, null, null, null);

        var result = await svc.CreateAsync(req);

        result.Error.Should().BeNull();
        result.Data!.Name.Should().Be("DJ Set");
        result.Data.ItemType.Should().Be("SERVICE");
        result.Data.BasePrice.Should().Be(800m);
        result.Data.IsActive.Should().BeTrue();
    }

    [Theory]
    [InlineData("SERVICE")]
    [InlineData("PRODUCT")]
    [InlineData("SONG")]
    public async Task CreateAsync_AcceptsAllValidItemTypes(string itemType)
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var svc = new CatalogItemService(db);
        var req = new CreateCatalogItemRequest(p.Id, "Item", null, null, itemType, null, null, null, null);

        var result = await svc.CreateAsync(req);

        result.Error.Should().BeNull();
        result.Data!.ItemType.Should().Be(itemType);
    }

    [Fact]
    public async Task CreateAsync_ReturnsFail_WhenNameEmpty()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var svc = new CatalogItemService(db);
        var req = new CreateCatalogItemRequest(p.Id, "  ", null, null, "SERVICE", null, null, null, null);

        var result = await svc.CreateAsync(req);

        result.Data.Should().BeNull();
        result.Error.Should().Contain("Name is required");
    }

    [Fact]
    public async Task CreateAsync_ReturnsFail_WhenItemTypeInvalid()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var svc = new CatalogItemService(db);
        var req = new CreateCatalogItemRequest(p.Id, "Item", null, null, "INVALID", null, null, null, null);

        var result = await svc.CreateAsync(req);

        result.Data.Should().BeNull();
        result.Error.Should().Contain("ItemType must be one of");
    }

    [Fact]
    public async Task CreateAsync_ReturnsFail_WhenPartnerNotFound()
    {
        using var db = DbContextFactory.Create();
        var svc = new CatalogItemService(db);
        var req = new CreateCatalogItemRequest(999, "Item", null, null, "SERVICE", null, null, null, null);

        var result = await svc.CreateAsync(req);

        result.Data.Should().BeNull();
        result.Error.Should().Contain("Partner with id 999 was not found");
    }

    [Fact]
    public async Task CreateAsync_ReturnsFail_WhenBasePriceNegative()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var svc = new CatalogItemService(db);
        var req = new CreateCatalogItemRequest(p.Id, "Item", null, null, "SERVICE", -1m, null, null, null);

        var result = await svc.CreateAsync(req);

        result.Data.Should().BeNull();
        result.Error.Should().Contain("BasePrice must be >= 0");
    }

    [Fact]
    public async Task CreateAsync_ReturnsFail_WhenMetadataInvalidJson()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var svc = new CatalogItemService(db);
        var req = new CreateCatalogItemRequest(p.Id, "Item", null, null, "SERVICE", null, null, null, "not-json");

        var result = await svc.CreateAsync(req);

        result.Data.Should().BeNull();
        result.Error.Should().Contain("valid JSON");
    }

    
    
    

    [Fact]
    public async Task UpdateAsync_UpdatesItem_WithValidRequest()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var ci = SeedHelpers.AddCatalogItem(db, p.Id, "Old Name", "SERVICE", 100m);
        var svc = new CatalogItemService(db);
        var req = new UpdateCatalogItemRequest("New Name", "Cat", "Desc", "PRODUCT", 200m, null, null, null, false, 5);

        var result = await svc.UpdateAsync(ci.Id, req);

        result.Error.Should().BeNull();
        result.Data!.Name.Should().Be("New Name");
        result.Data.BasePrice.Should().Be(200m);
        result.Data.IsActive.Should().BeFalse();
        result.Data.SortOrder.Should().Be(5);
    }

    [Fact]
    public async Task UpdateAsync_ReturnsFail_WhenNotFound()
    {
        using var db = DbContextFactory.Create();
        var svc = new CatalogItemService(db);
        var req = new UpdateCatalogItemRequest("Name", null, null, "SERVICE", null, null, null, null, true, 0);

        var result = await svc.UpdateAsync(999, req);

        result.Data.Should().BeNull();
        result.Error.Should().Contain("not found");
    }

    [Fact]
    public async Task UpdateAsync_ReturnsFail_WhenNameEmpty()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var ci = SeedHelpers.AddCatalogItem(db, p.Id);
        var svc = new CatalogItemService(db);
        var req = new UpdateCatalogItemRequest("  ", null, null, "SERVICE", null, null, null, null, true, 0);

        var result = await svc.UpdateAsync(ci.Id, req);

        result.Data.Should().BeNull();
        result.Error.Should().Contain("Name is required");
    }

    
    
    

    [Fact]
    public async Task DeleteAsync_RemovesItem_WhenFound()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var ci = SeedHelpers.AddCatalogItem(db, p.Id);
        var svc = new CatalogItemService(db);

        var result = await svc.DeleteAsync(ci.Id);

        result.Error.Should().BeNull();
        result.Data.Should().BeTrue();
        db.PartnerCatalogItems.Find(ci.Id).Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFail_WhenNotFound()
    {
        using var db = DbContextFactory.Create();
        var svc = new CatalogItemService(db);

        var result = await svc.DeleteAsync(999);

        result.Data.Should().BeFalse();
        result.Error.Should().Contain("not found");
    }
}
