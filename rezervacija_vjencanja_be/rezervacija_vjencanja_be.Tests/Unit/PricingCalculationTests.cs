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
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var w  = SeedHelpers.AddWedding(db, dateTime: new DateTime(2025, 6, 14, 12, 0, 0)); 
        var ci = SeedHelpers.AddCatalogItem(db, p.Id, basePrice: 1000m);
        var svc = new WeddingPartnerService(db);

        // Act
        var result = await svc.CalculatePriceAsync(w.Id, ci.Id);

        // Assert
        result.Error.Should().BeNull();
        result.Data!.AppliedRule.Should().Be("BASE");
        result.Data.CalculatedPrice.Should().Be(1000m);
        result.Data.BasePrice.Should().Be(1000m);
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CalculatePrice_ReturnsSpecialDay_WhenMatchingDayOfWeek()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);

        // Act
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

        // Assert
        var result = await svc.CalculatePriceAsync(w.Id, ci.Id);

        result.Error.Should().BeNull();
        result.Data!.AppliedRule.Should().Be("SPECIAL_DAY");
        result.Data.CalculatedPrice.Should().Be(1400m);
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CalculatePrice_ReturnsBase_WhenDayOfWeekDoesNotMatch()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);

        // Act
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

        // Assert
        var result = await svc.CalculatePriceAsync(w.Id, ci.Id);

        result.Data!.AppliedRule.Should().Be("BASE");
        result.Data.CalculatedPrice.Should().Be(1000m);
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CalculatePrice_ReturnsBase_WhenSpecialDayRuleExpired()
    {
        // Arrange
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

        // Act
        var result = await svc.CalculatePriceAsync(w.Id, ci.Id);

        // Assert
        result.Data!.AppliedRule.Should().Be("BASE");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CalculatePrice_ReturnsBase_WhenSpecialDayRuleNotYetActive()
    {
        // Arrange
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

        // Act
        var result = await svc.CalculatePriceAsync(w.Id, ci.Id);

        // Assert
        result.Data!.AppliedRule.Should().Be("BASE");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CalculatePrice_ReturnsSpecificDate_WhenExactDateMatches()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var w  = SeedHelpers.AddWedding(db, dateTime: new DateTime(2025, 6, 14, 12, 0, 0));
        var ci = SeedHelpers.AddCatalogItem(db, p.Id, basePrice: 1000m);

        // Act
        db.PricingRules.Add(new PricingRule
        {
            CatalogItemId = ci.Id,
            RuleType      = "SPECIFIC_DATE",
            SpecificDate  = new DateOnly(2025, 6, 14),
            Price         = 1800m
        });

        // Assert
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
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CalculatePrice_FallsBackToSpecialDay_WhenSpecificDateDoesNotMatch()
    {
        // Arrange
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

        // Act
        var result = await svc.CalculatePriceAsync(w.Id, ci.Id);

        // Assert
        result.Data!.AppliedRule.Should().Be("SPECIAL_DAY");
        result.Data.CalculatedPrice.Should().Be(1400m);
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CalculatePrice_ReturnsNA_WhenItemIsSong()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var w  = SeedHelpers.AddWedding(db);
        var ci = SeedHelpers.AddCatalogItem(db, p.Id, itemType: "SONG", basePrice: null);
        var svc = new WeddingPartnerService(db);

        // Act
        var result = await svc.CalculatePriceAsync(w.Id, ci.Id);

        // Assert
        result.Error.Should().BeNull();
        result.Data!.AppliedRule.Should().Be("N/A");
        result.Data.CalculatedPrice.Should().Be(0);
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CalculatePrice_ReturnsNA_WhenBasePriceIsNull()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var w  = SeedHelpers.AddWedding(db);
        var ci = SeedHelpers.AddCatalogItem(db, p.Id, itemType: "SERVICE", basePrice: null);
        var svc = new WeddingPartnerService(db);

        // Act
        var result = await svc.CalculatePriceAsync(w.Id, ci.Id);

        // Assert
        result.Error.Should().BeNull();
        result.Data!.AppliedRule.Should().Be("N/A");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CalculatePriceAsync_ReturnsFail_WhenWeddingNotFound()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var ci = SeedHelpers.AddCatalogItem(db, p.Id);
        var svc = new WeddingPartnerService(db);

        // Act
        var result = await svc.CalculatePriceAsync(999, ci.Id);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("not found");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CalculatePriceAsync_ReturnsFail_WhenCatalogItemNotFound()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var w  = SeedHelpers.AddWedding(db);
        var svc = new WeddingPartnerService(db);

        // Act
        var result = await svc.CalculatePriceAsync(w.Id, 999);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("not found");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task CalculatePrice_HandlesSunday_AsAppDayOfWeek7()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);

        // Act
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

        // Assert
        var result = await svc.CalculatePriceAsync(w.Id, ci.Id);

        result.Data!.AppliedRule.Should().Be("SPECIAL_DAY");
        result.Data.CalculatedPrice.Should().Be(1600m);
        // Annihilate — db disposed at end of using block
    }
}

