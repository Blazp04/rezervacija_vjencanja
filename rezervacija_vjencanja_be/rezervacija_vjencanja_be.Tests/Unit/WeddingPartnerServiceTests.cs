using FluentAssertions;
using RezervacijaVjencanja.DTOs.WeddingPartners;
using RezervacijaVjencanja.Entities;
using RezervacijaVjencanja.Services.WeddingPartners;
using RezervacijaVjencanja.Tests.Helpers;
using Xunit;

namespace RezervacijaVjencanja.Tests.Unit;

public sealed class WeddingPartnerServiceTests
{

    private static (int weddingId, int partnerId, int wpId) SeedBasicGraph(
        RezervacijaVjencanja.Data.AppDbContext db,
        string wpStatus = "PROPOSED",
        bool hasBooking = true)
    {
        var pt = SeedHelpers.AddPartnerType(db, "Band", "BAND", hasBooking);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var w  = SeedHelpers.AddWedding(db);
        var wp = SeedHelpers.AddWeddingPartner(db, w.Id, p.Id, wpStatus);
        return (w.Id, p.Id, wp.Id);
    }

    [Fact]
    public async Task GetAllByWeddingIdAsync_ReturnsItems_WhenWeddingExists()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var (wId, pId, _) = SeedBasicGraph(db);
        SeedHelpers.AddWeddingPartner(db, wId, pId); 
        var svc = new WeddingPartnerService(db);

        // Act
        var result = await svc.GetAllByWeddingIdAsync(wId);

        // Assert
        result.Error.Should().BeNull();
        result.Data.Should().HaveCount(2);
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task GetAllByWeddingIdAsync_ReturnsFail_WhenWeddingNotFound()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var svc = new WeddingPartnerService(db);

        // Act
        var result = await svc.GetAllByWeddingIdAsync(999);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("not found");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task AddAsync_CreatesWeddingPartner_WithValidRequest()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var w  = SeedHelpers.AddWedding(db);
        var svc = new WeddingPartnerService(db);
        var req = new CreateWeddingPartnerRequest(p.Id, null, "Some notes");

        // Act
        var result = await svc.AddAsync(w.Id, req);

        // Assert
        result.Error.Should().BeNull();
        result.Data!.WeddingId.Should().Be(w.Id);
        result.Data.PartnerId.Should().Be(p.Id);
        result.Data.Status.Should().Be("PROPOSED");
        result.Data.Notes.Should().Be("Some notes");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task AddAsync_ReturnsFail_WhenWeddingNotFound()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var svc = new WeddingPartnerService(db);
        var req = new CreateWeddingPartnerRequest(p.Id, null, null);

        // Act
        var result = await svc.AddAsync(999, req);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("not found");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task AddAsync_ReturnsFail_WhenPartnerNotFound()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var w = SeedHelpers.AddWedding(db);
        var svc = new WeddingPartnerService(db);
        var req = new CreateWeddingPartnerRequest(999, null, null);

        // Act
        var result = await svc.AddAsync(w.Id, req);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("not found");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task AddAsync_ReturnsFail_WhenPartnerInactive()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id, isActive: false);
        var w  = SeedHelpers.AddWedding(db);
        var svc = new WeddingPartnerService(db);
        var req = new CreateWeddingPartnerRequest(p.Id, null, null);

        // Act
        var result = await svc.AddAsync(w.Id, req);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("active partners");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task AddAsync_CalculatesPlannedPrice_WhenCatalogItemHasBasePrice()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var w  = SeedHelpers.AddWedding(db);
        var ci = SeedHelpers.AddCatalogItem(db, p.Id, "Service", "SERVICE", 1500m);
        var svc = new WeddingPartnerService(db);
        var req = new CreateWeddingPartnerRequest(p.Id, ci.Id, null);

        // Act
        var result = await svc.AddAsync(w.Id, req);

        // Assert
        result.Error.Should().BeNull();
        result.Data!.PlannedPrice.Should().Be(1500m); 
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task AddAsync_SetsPlannedPriceNull_WhenCatalogItemHasNoBasePrice()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var w  = SeedHelpers.AddWedding(db);
        var ci = SeedHelpers.AddCatalogItem(db, p.Id, "Song", "SONG", null);
        var svc = new WeddingPartnerService(db);
        var req = new CreateWeddingPartnerRequest(p.Id, ci.Id, null);

        // Act
        var result = await svc.AddAsync(w.Id, req);

        // Assert
        result.Error.Should().BeNull();
        result.Data!.PlannedPrice.Should().BeNull();
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task UpdateAsync_UpdatesNotes_WhenNoCatalogItem()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var (wId, _, wpId) = SeedBasicGraph(db);
        var svc = new WeddingPartnerService(db);
        var req = new UpdateWeddingPartnerRequest(null, "Updated note");

        // Act
        var result = await svc.UpdateAsync(wId, wpId, req);

        // Assert
        result.Error.Should().BeNull();
        result.Data!.Notes.Should().Be("Updated note");
        result.Data.PlannedPrice.Should().BeNull();
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task UpdateAsync_ReturnsFail_WhenConfirmed()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var (wId, _, wpId) = SeedBasicGraph(db, wpStatus: "CONFIRMED");
        var svc = new WeddingPartnerService(db);
        var req = new UpdateWeddingPartnerRequest(null, "note");

        // Act
        var result = await svc.UpdateAsync(wId, wpId, req);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("confirmed assignment");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task UpdateAsync_ReturnsFail_WhenNotFound()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var w = SeedHelpers.AddWedding(db);
        var svc = new WeddingPartnerService(db);
        var req = new UpdateWeddingPartnerRequest(null, null);

        // Act
        var result = await svc.UpdateAsync(w.Id, 999, req);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("not found");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task RemoveAsync_Removes_WhenProposed()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var (wId, _, wpId) = SeedBasicGraph(db, "PROPOSED");
        var svc = new WeddingPartnerService(db);

        // Act
        var result = await svc.RemoveAsync(wId, wpId);

        // Assert
        result.Error.Should().BeNull();
        result.Data.Should().BeTrue();
        db.WeddingPartners.Find(wpId).Should().BeNull();
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task RemoveAsync_ReturnsFail_WhenConfirmed()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var (wId, _, wpId) = SeedBasicGraph(db, "CONFIRMED");
        var svc = new WeddingPartnerService(db);

        // Act
        var result = await svc.RemoveAsync(wId, wpId);

        // Assert
        result.Data.Should().BeFalse();
        result.Error.Should().Contain("Cannot remove a confirmed");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task RemoveAsync_ReturnsFail_WhenNotFound()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var w = SeedHelpers.AddWedding(db);
        var svc = new WeddingPartnerService(db);

        // Act
        var result = await svc.RemoveAsync(w.Id, 999);

        // Assert
        result.Data.Should().BeFalse();
        result.Error.Should().Contain("not found");
        // Annihilate — db disposed at end of using block
    }

    [Theory]
    [InlineData("PROPOSED",  "OFFERED")]
    [InlineData("PROPOSED",  "CANCELLED")]
    [InlineData("OFFERED",   "CANCELLED")]
    public async Task UpdateStatusAsync_Succeeds_ForAllowedTransitions(string from, string to)
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var (wId, _, wpId) = SeedBasicGraph(db, from);
        var svc = new WeddingPartnerService(db);

        // Act
        var result = await svc.UpdateStatusAsync(wId, wpId, new UpdateWeddingPartnerStatusRequest(to));

        // Assert
        result.Error.Should().BeNull();
        result.Data!.Status.Should().Be(to);
        // Annihilate — db disposed at end of using block
    }

    [Theory]
    [InlineData("PROPOSED",  "CONFIRMED")]  
    [InlineData("OFFERED",   "PROPOSED")]   
    [InlineData("CANCELLED", "PROPOSED")]   
    public async Task UpdateStatusAsync_ReturnsFail_ForForbiddenTransitions(string from, string to)
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var (wId, _, wpId) = SeedBasicGraph(db, from);
        var svc = new WeddingPartnerService(db);

        // Act
        var result = await svc.UpdateStatusAsync(wId, wpId, new UpdateWeddingPartnerStatusRequest(to));

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().NotBeNullOrEmpty();
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task UpdateStatusAsync_ReturnsFail_WhenStatusInvalid()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var (wId, _, wpId) = SeedBasicGraph(db);
        var svc = new WeddingPartnerService(db);

        // Act
        var result = await svc.UpdateStatusAsync(wId, wpId, new UpdateWeddingPartnerStatusRequest("BOGUS"));

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("Status must be one of");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task UpdateStatusAsync_CancellingConfirmed_RemovesBooking()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db, "Band", "BAND", hasBooking: true);
        var p  = SeedHelpers.AddPartner(db, pt.Id);
        var w  = SeedHelpers.AddWedding(db);
        var wp = SeedHelpers.AddWeddingPartner(db, w.Id, p.Id, "CONFIRMED");

        
// Act
        
        db.Bookings.Add(new Booking
        {
            PartnerId      = p.Id,
            WeddingId      = w.Id,
            WeddingPartnerId = wp.Id,
            StartDateTime  = DateTime.UtcNow,
            EndDateTime    = DateTime.UtcNow.AddHours(6),
            CreatedAt      = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        // Assert
        var svc = new WeddingPartnerService(db);
        var result = await svc.UpdateStatusAsync(w.Id, wp.Id, new UpdateWeddingPartnerStatusRequest("CANCELLED"));

        result.Error.Should().BeNull();
        db.Bookings.Any(b => b.WeddingPartnerId == wp.Id).Should().BeFalse();
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task ConfirmAsync_Confirms_WhenOfferedAndNoConflict()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var (wId, _, wpId) = SeedBasicGraph(db, "OFFERED");
        var svc = new WeddingPartnerService(db);
        var start = DateTime.UtcNow.AddHours(10);
        var req   = new ConfirmWeddingPartnerRequest(2000m, start, start.AddHours(5), null);

        // Act
        var result = await svc.ConfirmAsync(wId, wpId, req);

        // Assert
        result.Error.Should().BeNull();
        result.Data!.Status.Should().Be("CONFIRMED");
        result.Data.ActualPrice.Should().Be(2000m);
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task ConfirmAsync_CreatesBooking_ForHasBookingPartnerType()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var (wId, pId, wpId) = SeedBasicGraph(db, "OFFERED", hasBooking: true);
        var svc  = new WeddingPartnerService(db);
        var start = DateTime.UtcNow.AddHours(10);
        var req   = new ConfirmWeddingPartnerRequest(1000m, start, start.AddHours(4), null);

        // Act
        await svc.ConfirmAsync(wId, wpId, req);

        // Assert
        db.Bookings.Should().ContainSingle(b => b.WeddingPartnerId == wpId && b.PartnerId == pId);
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task ConfirmAsync_ReturnsFail_WhenNotOffered()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var (wId, _, wpId) = SeedBasicGraph(db, "PROPOSED");
        var svc   = new WeddingPartnerService(db);
        var start = DateTime.UtcNow.AddHours(10);
        var req   = new ConfirmWeddingPartnerRequest(1000m, start, start.AddHours(4), null);

        // Act
        var result = await svc.ConfirmAsync(wId, wpId, req);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("OFFERED");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task ConfirmAsync_ReturnsFail_WhenActualPriceIsZero()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var (wId, _, wpId) = SeedBasicGraph(db, "OFFERED");
        var svc   = new WeddingPartnerService(db);
        var start = DateTime.UtcNow.AddHours(10);
        var req   = new ConfirmWeddingPartnerRequest(0m, start, start.AddHours(4), null);

        // Act
        var result = await svc.ConfirmAsync(wId, wpId, req);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("ActualPrice must be greater than 0");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task ConfirmAsync_ReturnsFail_WhenEndBeforeStart()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var (wId, _, wpId) = SeedBasicGraph(db, "OFFERED");
        var svc   = new WeddingPartnerService(db);
        var start = DateTime.UtcNow.AddHours(10);
        var req   = new ConfirmWeddingPartnerRequest(500m, start, start.AddHours(-1), null);

        // Act
        var result = await svc.ConfirmAsync(wId, wpId, req);

        // Assert
        result.Data.Should().BeNull();
        result.Error.Should().Contain("EndDateTime must be after StartDateTime");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task ConfirmAsync_ReturnsConflict_WhenPartnerAlreadyBooked()
    {
        // Arrange
        using var db = DbContextFactory.Create();

        // Act
        var pt = SeedHelpers.AddPartnerType(db, "Band", "BAND", hasBooking: true);
        var p  = SeedHelpers.AddPartner(db, pt.Id);

        
// Assert
        
        var w1  = SeedHelpers.AddWedding(db, "W1");
        var wp1 = SeedHelpers.AddWeddingPartner(db, w1.Id, p.Id, "CONFIRMED");
        var existingStart = DateTime.UtcNow.AddHours(10);
        db.Bookings.Add(new Booking
        {
            PartnerId        = p.Id,
            WeddingId        = w1.Id,
            WeddingPartnerId = wp1.Id,
            StartDateTime    = existingStart,
            EndDateTime      = existingStart.AddHours(6),
            CreatedAt        = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        
        var w2  = SeedHelpers.AddWedding(db, "W2");
        var wp2 = SeedHelpers.AddWeddingPartner(db, w2.Id, p.Id, "OFFERED");
        var svc = new WeddingPartnerService(db);
        var newStart = existingStart.AddHours(2); 
        var req = new ConfirmWeddingPartnerRequest(1500m, newStart, newStart.AddHours(4), null);

        var result = await svc.ConfirmAsync(w2.Id, wp2.Id, req);

        result.Data.Should().BeNull();
        result.Error.Should().Contain("CONFLICT");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task ConfirmAsync_Succeeds_WhenSlotsDoNotOverlap()
    {
        // Arrange
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db, "Band", "BAND", hasBooking: true);
        var p  = SeedHelpers.AddPartner(db, pt.Id);

        // Act
        var w1  = SeedHelpers.AddWedding(db, "W1");
        var wp1 = SeedHelpers.AddWeddingPartner(db, w1.Id, p.Id, "CONFIRMED");
        var existingStart = DateTime.UtcNow.AddHours(10);
        db.Bookings.Add(new Booking
        {
            PartnerId        = p.Id,
            WeddingId        = w1.Id,
            WeddingPartnerId = wp1.Id,
            StartDateTime    = existingStart,
            EndDateTime      = existingStart.AddHours(4),
            CreatedAt        = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        // Assert
        var w2  = SeedHelpers.AddWedding(db, "W2");
        var wp2 = SeedHelpers.AddWeddingPartner(db, w2.Id, p.Id, "OFFERED");
        var svc = new WeddingPartnerService(db);

        var newStart = existingStart.AddHours(4);
        var req = new ConfirmWeddingPartnerRequest(1500m, newStart, newStart.AddHours(4), null);

        var result = await svc.ConfirmAsync(w2.Id, wp2.Id, req);

        result.Error.Should().BeNull();
        result.Data!.Status.Should().Be("CONFIRMED");
        // Annihilate — db disposed at end of using block
    }

    [Fact]
    public async Task ConfirmAsync_CalculatesCommissionAndClientPrice_Correctly()
    {
        // Arrange
        using var db = DbContextFactory.Create();

        // Act
        var pt = SeedHelpers.AddPartnerType(db, "Photo", "PHOTO", hasBooking: false);
        var p  = SeedHelpers.AddPartner(db, pt.Id, commission: 10m);
        var w  = SeedHelpers.AddWedding(db);
        var wp = SeedHelpers.AddWeddingPartner(db, w.Id, p.Id, "OFFERED", commissionPercent: 10m);
        var svc   = new WeddingPartnerService(db);
        var start = DateTime.UtcNow.AddHours(10);
        var req   = new ConfirmWeddingPartnerRequest(1000m, start, start.AddHours(4), null);

        // Assert
        var result = await svc.ConfirmAsync(w.Id, wp.Id, req);

        result.Error.Should().BeNull();
        result.Data!.ActualPrice.Should().Be(1000m);
        result.Data.CommissionPercent.Should().Be(10m);
        result.Data.CommissionAmount.Should().Be(100m);   
        result.Data.ClientPrice.Should().Be(1100m);       
        // Annihilate — db disposed at end of using block
    }
}

