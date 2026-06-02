using FluentAssertions;
using RezervacijaVjencanja.DTOs.WeddingPartners;
using RezervacijaVjencanja.Entities;
using RezervacijaVjencanja.Services.WeddingPartners;
using RezervacijaVjencanja.Tests.Helpers;
using Xunit;

namespace RezervacijaVjencanja.Tests.Unit;







public sealed class PricingCalculationTests
{
    
    
    

    [Fact]
    public async Task CalculatePrice_ReturnsBase_WhenNoRulesExist()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var w  = SeedHelpers.AddWedding(db, dateTime: new DateTime(2025, 6, 14, 12, 0, 0)); 
        var ci = SeedHelpers.AddCatalogItem(db, p.Id, basePrice: 1000m);
        var svc = new WeddingPartnerService(db);

        var result = await svc.CalculatePriceAsync(w.Id, ci.Id);

        result.Error.Should().BeNull();
        result.Data!.AppliedRule.Should().Be("BASE");
        result.Data.CalculatedPrice.Should().Be(1000m);
        result.Data.BasePrice.Should().Be(1000m);
    }

    
    
    

    [Fact]
    public async Task CalculatePrice_ReturnsSpecialDay_WhenMatchingDayOfWeek()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        
        var w  = SeedHelpers.AddWedding(db, dateTime: new DateTime(2025, 6, 14, 12, 0, 0));
        var ci = SeedHelpers.AddCatalogItem(db, p.Id, basePrice: 1000m);
        db.PricingRules.Add(new PricingRule
        {
            CatalogItemId = ci.Id,
            RuleType      = "SPECIAL_DAY",
            DayOfWeek     = 6,   
            Price         = 1400m
        });
        await db.SaveChangesAsync();
        var svc = new WeddingPartnerService(db);

        var result = await svc.CalculatePriceAsync(w.Id, ci.Id);

        result.Error.Should().BeNull();
        result.Data!.AppliedRule.Should().Be("SPECIAL_DAY");
        result.Data.CalculatedPrice.Should().Be(1400m);
    }

    [Fact]
    public async Task CalculatePrice_ReturnsBase_WhenDayOfWeekDoesNotMatch()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        
        var w  = SeedHelpers.AddWedding(db, dateTime: new DateTime(2025, 6, 13, 12, 0, 0));
        var ci = SeedHelpers.AddCatalogItem(db, p.Id, basePrice: 1000m);
        db.PricingRules.Add(new PricingRule
        {
            CatalogItemId = ci.Id,
            RuleType      = "SPECIAL_DAY",
            DayOfWeek     = 6,   
            Price         = 1400m
        });
        await db.SaveChangesAsync();
        var svc = new WeddingPartnerService(db);

        var result = await svc.CalculatePriceAsync(w.Id, ci.Id);

        result.Data!.AppliedRule.Should().Be("BASE");
        result.Data.CalculatedPrice.Should().Be(1000m);
    }

    [Fact]
    public async Task CalculatePrice_ReturnsBase_WhenSpecialDayRuleExpired()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var w  = SeedHelpers.AddWedding(db, dateTime: new DateTime(2025, 6, 14, 12, 0, 0)); 
        var ci = SeedHelpers.AddCatalogItem(db, p.Id, basePrice: 1000m);
        db.PricingRules.Add(new PricingRule
        {
            CatalogItemId = ci.Id,
            RuleType      = "SPECIAL_DAY",
            DayOfWeek     = 6,
            Price         = 1400m,
            ValidTo       = new DateOnly(2025, 1, 1) 
        });
        await db.SaveChangesAsync();
        var svc = new WeddingPartnerService(db);

        var result = await svc.CalculatePriceAsync(w.Id, ci.Id);

        result.Data!.AppliedRule.Should().Be("BASE");
    }

    [Fact]
    public async Task CalculatePrice_ReturnsBase_WhenSpecialDayRuleNotYetActive()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var w  = SeedHelpers.AddWedding(db, dateTime: new DateTime(2025, 6, 14, 12, 0, 0)); 
        var ci = SeedHelpers.AddCatalogItem(db, p.Id, basePrice: 1000m);
        db.PricingRules.Add(new PricingRule
        {
            CatalogItemId = ci.Id,
            RuleType      = "SPECIAL_DAY",
            DayOfWeek     = 6,
            Price         = 1400m,
            ValidFrom     = new DateOnly(2025, 12, 1) 
        });
        await db.SaveChangesAsync();
        var svc = new WeddingPartnerService(db);

        var result = await svc.CalculatePriceAsync(w.Id, ci.Id);

        result.Data!.AppliedRule.Should().Be("BASE");
    }

    
    
    

    [Fact]
    public async Task CalculatePrice_ReturnsSpecificDate_WhenExactDateMatches()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var w  = SeedHelpers.AddWedding(db, dateTime: new DateTime(2025, 6, 14, 12, 0, 0));
        var ci = SeedHelpers.AddCatalogItem(db, p.Id, basePrice: 1000m);
        
        db.PricingRules.Add(new PricingRule
        {
            CatalogItemId = ci.Id,
            RuleType      = "SPECIFIC_DATE",
            SpecificDate  = new DateOnly(2025, 6, 14),
            Price         = 1800m
        });
        
        db.PricingRules.Add(new PricingRule
        {
            CatalogItemId = ci.Id,
            RuleType      = "SPECIAL_DAY",
            DayOfWeek     = 6,
            Price         = 1400m
        });
        await db.SaveChangesAsync();
        var svc = new WeddingPartnerService(db);

        var result = await svc.CalculatePriceAsync(w.Id, ci.Id);

        result.Error.Should().BeNull();
        result.Data!.AppliedRule.Should().Be("SPECIFIC_DATE");
        result.Data.CalculatedPrice.Should().Be(1800m);
    }

    [Fact]
    public async Task CalculatePrice_FallsBackToSpecialDay_WhenSpecificDateDoesNotMatch()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var w  = SeedHelpers.AddWedding(db, dateTime: new DateTime(2025, 6, 14, 12, 0, 0)); 
        var ci = SeedHelpers.AddCatalogItem(db, p.Id, basePrice: 1000m);
        db.PricingRules.Add(new PricingRule
        {
            CatalogItemId = ci.Id,
            RuleType      = "SPECIFIC_DATE",
            SpecificDate  = new DateOnly(2025, 7, 4), 
            Price         = 1800m
        });
        db.PricingRules.Add(new PricingRule
        {
            CatalogItemId = ci.Id,
            RuleType      = "SPECIAL_DAY",
            DayOfWeek     = 6,
            Price         = 1400m
        });
        await db.SaveChangesAsync();
        var svc = new WeddingPartnerService(db);

        var result = await svc.CalculatePriceAsync(w.Id, ci.Id);

        result.Data!.AppliedRule.Should().Be("SPECIAL_DAY");
        result.Data.CalculatedPrice.Should().Be(1400m);
    }

    
    
    

    [Fact]
    public async Task CalculatePrice_ReturnsNA_WhenItemIsSong()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var w  = SeedHelpers.AddWedding(db);
        var ci = SeedHelpers.AddCatalogItem(db, p.Id, itemType: "SONG", basePrice: null);
        var svc = new WeddingPartnerService(db);

        var result = await svc.CalculatePriceAsync(w.Id, ci.Id);

        result.Error.Should().BeNull();
        result.Data!.AppliedRule.Should().Be("N/A");
        result.Data.CalculatedPrice.Should().Be(0);
    }

    [Fact]
    public async Task CalculatePrice_ReturnsNA_WhenBasePriceIsNull()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var w  = SeedHelpers.AddWedding(db);
        var ci = SeedHelpers.AddCatalogItem(db, p.Id, itemType: "SERVICE", basePrice: null);
        var svc = new WeddingPartnerService(db);

        var result = await svc.CalculatePriceAsync(w.Id, ci.Id);

        result.Error.Should().BeNull();
        result.Data!.AppliedRule.Should().Be("N/A");
    }

    
    
    

    [Fact]
    public async Task CalculatePriceAsync_ReturnsFail_WhenWeddingNotFound()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var ci = SeedHelpers.AddCatalogItem(db, p.Id);
        var svc = new WeddingPartnerService(db);

        var result = await svc.CalculatePriceAsync(999, ci.Id);

        result.Data.Should().BeNull();
        result.Error.Should().Contain("not found");
    }

    [Fact]
    public async Task CalculatePriceAsync_ReturnsFail_WhenCatalogItemNotFound()
    {
        using var db = DbContextFactory.Create();
        var w  = SeedHelpers.AddWedding(db);
        var svc = new WeddingPartnerService(db);

        var result = await svc.CalculatePriceAsync(w.Id, 999);

        result.Data.Should().BeNull();
        result.Error.Should().Contain("not found");
    }

    
    
    

    [Fact]
    public async Task CalculatePrice_HandlesSunday_AsAppDayOfWeek7()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        
        var w  = SeedHelpers.AddWedding(db, dateTime: new DateTime(2025, 6, 15, 12, 0, 0));
        var ci = SeedHelpers.AddCatalogItem(db, p.Id, basePrice: 1000m);
        db.PricingRules.Add(new PricingRule
        {
            CatalogItemId = ci.Id,
            RuleType      = "SPECIAL_DAY",
            DayOfWeek     = 7,   
            Price         = 1600m
        });
        await db.SaveChangesAsync();
        var svc = new WeddingPartnerService(db);

        var result = await svc.CalculatePriceAsync(w.Id, ci.Id);

        result.Data!.AppliedRule.Should().Be("SPECIAL_DAY");
        result.Data.CalculatedPrice.Should().Be(1600m);
    }
}
