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
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        SeedHelpers.AddPartner(db, pt.Id, "Active", isActive: true);
        SeedHelpers.AddPartner(db, pt.Id, "Inactive", isActive: false);
        var svc = new PartnerService(db);

        var result = await svc.GetAllAsync();

        result.Error.Should().BeNull();
        result.Data.Should().ContainSingle(p => p.Name == "Active");
    }

    [Fact]
    public async Task GetAllAsync_FiltersByPartnerTypeId()
    {
        using var db = DbContextFactory.Create();
        var pt1 = SeedHelpers.AddPartnerType(db, "Band", "BAND");
        var pt2 = SeedHelpers.AddPartnerType(db, "Photo", "PHOTO");
        SeedHelpers.AddPartner(db, pt1.Id, "BandCo");
        SeedHelpers.AddPartner(db, pt2.Id, "PhotCo");
        var svc = new PartnerService(db);

        var result = await svc.GetAllAsync(pt1.Id);

        result.Error.Should().BeNull();
        result.Data.Should().ContainSingle(p => p.Name == "BandCo");
    }

    
    
    

    [Fact]
    public async Task GetByIdAsync_ReturnsPartner_WhenFound()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p = SeedHelpers.AddPartner(db, pt.Id, "MyPartner");
        var svc = new PartnerService(db);

        var result = await svc.GetByIdAsync(p.Id);

        result.Error.Should().BeNull();
        result.Data!.Name.Should().Be("MyPartner");
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsFail_WhenNotFound()
    {
        using var db = DbContextFactory.Create();
        var svc = new PartnerService(db);

        var result = await svc.GetByIdAsync(999);

        result.Data.Should().BeNull();
        result.Error.Should().Contain("not found");
    }

    
    
    

    [Fact]
    public async Task CreateAsync_CreatesPartner_WithValidRequest()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var svc = new PartnerService(db);
        var req = new CreatePartnerRequest("New Partner", pt.Id, "123 St", "0901", "x@x.com", null, 15m, null, null);

        var result = await svc.CreateAsync(req);

        result.Error.Should().BeNull();
        result.Data!.Name.Should().Be("New Partner");
        result.Data.CommissionPercent.Should().Be(15m);
        result.Data.IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task CreateAsync_ReturnsFail_WhenNameEmpty()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var svc = new PartnerService(db);
        var req = new CreatePartnerRequest("  ", pt.Id, null, null, null, null, 0m, null, null);

        var result = await svc.CreateAsync(req);

        result.Data.Should().BeNull();
        result.Error.Should().Contain("Name is required");
    }

    [Fact]
    public async Task CreateAsync_ReturnsFail_WhenPartnerTypeNotFound()
    {
        using var db = DbContextFactory.Create();
        var svc = new PartnerService(db);
        var req = new CreatePartnerRequest("Partner", 999, null, null, null, null, 0m, null, null);

        var result = await svc.CreateAsync(req);

        result.Data.Should().BeNull();
        result.Error.Should().Contain("PartnerType with id 999 was not found");
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(101)]
    public async Task CreateAsync_ReturnsFail_WhenCommissionOutOfRange(decimal commission)
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var svc = new PartnerService(db);
        var req = new CreatePartnerRequest("Partner", pt.Id, null, null, null, null, commission, null, null);

        var result = await svc.CreateAsync(req);

        result.Data.Should().BeNull();
        result.Error.Should().Contain("CommissionPercent must be between 0 and 100");
    }

    [Fact]
    public async Task CreateAsync_ReturnsFail_WhenExtraFieldsInvalidJson()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var svc = new PartnerService(db);
        var req = new CreatePartnerRequest("Partner", pt.Id, null, null, null, null, 0m, null, "bad-json");

        var result = await svc.CreateAsync(req);

        result.Data.Should().BeNull();
        result.Error.Should().Contain("valid JSON");
    }

    [Fact]
    public async Task CreateAsync_AcceptsValidExtraFieldsJson()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var svc = new PartnerService(db);
        var req = new CreatePartnerRequest("Partner", pt.Id, null, null, null, null, 0m, null, """{"key":"value"}""");

        var result = await svc.CreateAsync(req);

        result.Error.Should().BeNull();
        result.Data!.ExtraFields.Should().Be("""{"key":"value"}""");
    }

    
    
    

    [Fact]
    public async Task UpdateAsync_UpdatesPartner_WithValidRequest()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p = SeedHelpers.AddPartner(db, pt.Id, "Old");
        var svc = new PartnerService(db);
        var req = new UpdatePartnerRequest("Updated", pt.Id, null, null, null, null, 20m, null, null, true);

        var result = await svc.UpdateAsync(p.Id, req);

        result.Error.Should().BeNull();
        result.Data!.Name.Should().Be("Updated");
        result.Data.CommissionPercent.Should().Be(20m);
    }

    [Fact]
    public async Task UpdateAsync_ReturnsFail_WhenNotFound()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var svc = new PartnerService(db);
        var req = new UpdatePartnerRequest("X", pt.Id, null, null, null, null, 0m, null, null, true);

        var result = await svc.UpdateAsync(999, req);

        result.Data.Should().BeNull();
        result.Error.Should().Contain("not found");
    }

    [Fact]
    public async Task UpdateAsync_CanDeactivatePartner()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p = SeedHelpers.AddPartner(db, pt.Id, isActive: true);
        var svc = new PartnerService(db);
        var req = new UpdatePartnerRequest("Test Partner", pt.Id, null, null, null, null, 0m, null, null, false);

        var result = await svc.UpdateAsync(p.Id, req);

        result.Error.Should().BeNull();
        result.Data!.IsActive.Should().BeFalse();
    }

    
    
    

    [Fact]
    public async Task DeleteAsync_RemovesPartner_WhenFound()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p = SeedHelpers.AddPartner(db, pt.Id);
        var svc = new PartnerService(db);

        var result = await svc.DeleteAsync(p.Id);

        result.Error.Should().BeNull();
        result.Data.Should().BeTrue();
        db.Partners.Find(p.Id).Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFail_WhenNotFound()
    {
        using var db = DbContextFactory.Create();
        var svc = new PartnerService(db);

        var result = await svc.DeleteAsync(999);

        result.Data.Should().BeFalse();
        result.Error.Should().Contain("not found");
    }

    
    
    

    [Fact]
    public async Task CloneAsync_CreatesNewPartner_WithKopijaSuffix()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p = SeedHelpers.AddPartner(db, pt.Id, "Original");
        var svc = new PartnerService(db);

        var result = await svc.CloneAsync(p.Id);

        result.Error.Should().BeNull();
        result.Data!.Name.Should().Be("Original (kopija)");
        result.Data.Id.Should().NotBe(p.Id);
    }

    [Fact]
    public async Task CloneAsync_CopiesCatalogItems_AndPricingRules()
    {
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

        var result = await svc.CloneAsync(p.Id);

        result.Error.Should().BeNull();
        var cloneId = result.Data!.Id;
        var cloneItems = db.PartnerCatalogItems.Where(ci => ci.PartnerId == cloneId).ToList();
        cloneItems.Should().ContainSingle(i => i.Name == "Service A");
        var cloneRules = db.PricingRules.Where(r => cloneItems.Select(i => i.Id).Contains(r.CatalogItemId)).ToList();
        cloneRules.Should().ContainSingle(r => r.Price == 700m);
    }

    [Fact]
    public async Task CloneAsync_ReturnsFail_WhenNotFound()
    {
        using var db = DbContextFactory.Create();
        var svc = new PartnerService(db);

        var result = await svc.CloneAsync(999);

        result.Data.Should().BeNull();
        result.Error.Should().Contain("not found");
    }
}
