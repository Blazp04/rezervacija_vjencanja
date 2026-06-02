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
        using var db = DbContextFactory.Create();
        SeedHelpers.AddPartnerType(db, "Band", "BAND");
        SeedHelpers.AddPartnerType(db, "Photo", "PHOTO");
        var svc = new PartnerTypeService(db);

        var result = await svc.GetAllAsync();

        result.Error.Should().BeNull();
        result.Data.Should().HaveCount(2);
    }

    
    
    

    [Fact]
    public async Task GetByIdAsync_ReturnsType_WhenFound()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db, "Band", "BAND");
        var svc = new PartnerTypeService(db);

        var result = await svc.GetByIdAsync(pt.Id);

        result.Error.Should().BeNull();
        result.Data!.Code.Should().Be("BAND");
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsFail_WhenNotFound()
    {
        using var db = DbContextFactory.Create();
        var svc = new PartnerTypeService(db);

        var result = await svc.GetByIdAsync(999);

        result.Data.Should().BeNull();
        result.Error.Should().Contain("not found");
    }

    
    
    

    [Fact]
    public async Task CreateAsync_CreatesType_WithValidRequest()
    {
        using var db = DbContextFactory.Create();
        var svc = new PartnerTypeService(db);
        var req = new CreatePartnerTypeRequest("Catering", "CAT", false, null);

        var result = await svc.CreateAsync(req);

        result.Error.Should().BeNull();
        result.Data!.Name.Should().Be("Catering");
        result.Data.Code.Should().Be("CAT");
    }

    [Fact]
    public async Task CreateAsync_UppercasesCode()
    {
        using var db = DbContextFactory.Create();
        var svc = new PartnerTypeService(db);
        var req = new CreatePartnerTypeRequest("Catering", "cat", false, null);

        var result = await svc.CreateAsync(req);

        result.Error.Should().BeNull();
        result.Data!.Code.Should().Be("CAT");
    }

    [Fact]
    public async Task CreateAsync_ReturnsFail_WhenNameEmpty()
    {
        using var db = DbContextFactory.Create();
        var svc = new PartnerTypeService(db);
        var req = new CreatePartnerTypeRequest("  ", "CAT", false, null);

        var result = await svc.CreateAsync(req);

        result.Data.Should().BeNull();
        result.Error.Should().Contain("Name is required");
    }

    [Fact]
    public async Task CreateAsync_ReturnsFail_WhenCodeEmpty()
    {
        using var db = DbContextFactory.Create();
        var svc = new PartnerTypeService(db);
        var req = new CreatePartnerTypeRequest("Catering", "  ", false, null);

        var result = await svc.CreateAsync(req);

        result.Data.Should().BeNull();
        result.Error.Should().Contain("Code is required");
    }

    [Fact]
    public async Task CreateAsync_ReturnsFail_WhenNameAlreadyExists()
    {
        using var db = DbContextFactory.Create();
        SeedHelpers.AddPartnerType(db, "Band", "BAND");
        var svc = new PartnerTypeService(db);
        var req = new CreatePartnerTypeRequest("Band", "NEW", false, null);

        var result = await svc.CreateAsync(req);

        result.Data.Should().BeNull();
        result.Error.Should().Contain("already exists");
    }

    [Fact]
    public async Task CreateAsync_ReturnsFail_WhenCodeAlreadyExists()
    {
        using var db = DbContextFactory.Create();
        SeedHelpers.AddPartnerType(db, "Band", "BAND");
        var svc = new PartnerTypeService(db);
        var req = new CreatePartnerTypeRequest("Orchestra", "BAND", false, null);

        var result = await svc.CreateAsync(req);

        result.Data.Should().BeNull();
        result.Error.Should().Contain("already exists");
    }

    [Fact]
    public async Task CreateAsync_ReturnsFail_WhenFieldSchemaInvalidJson()
    {
        using var db = DbContextFactory.Create();
        var svc = new PartnerTypeService(db);
        var req = new CreatePartnerTypeRequest("Catering", "CAT", false, "not-json");

        var result = await svc.CreateAsync(req);

        result.Data.Should().BeNull();
        result.Error.Should().Contain("valid JSON");
    }

    
    
    

    [Fact]
    public async Task UpdateAsync_UpdatesType_WithValidRequest()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db, "Band", "BAND");
        var svc = new PartnerTypeService(db);
        var req = new UpdatePartnerTypeRequest("Orchestra", "ORCH", true, null);

        var result = await svc.UpdateAsync(pt.Id, req);

        result.Error.Should().BeNull();
        result.Data!.Name.Should().Be("Orchestra");
        result.Data.Code.Should().Be("ORCH");
        result.Data.HasBooking.Should().BeTrue();
    }

    [Fact]
    public async Task UpdateAsync_ReturnsFail_WhenNotFound()
    {
        using var db = DbContextFactory.Create();
        var svc = new PartnerTypeService(db);
        var req = new UpdatePartnerTypeRequest("X", "X", false, null);

        var result = await svc.UpdateAsync(999, req);

        result.Data.Should().BeNull();
        result.Error.Should().Contain("not found");
    }

    [Fact]
    public async Task UpdateAsync_AllowsSameNameSameId()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db, "Band", "BAND");
        var svc = new PartnerTypeService(db);
        var req = new UpdatePartnerTypeRequest("Band", "BAND", true, null);

        var result = await svc.UpdateAsync(pt.Id, req);

        result.Error.Should().BeNull();
    }

    [Fact]
    public async Task UpdateAsync_ReturnsFail_WhenNameConflictsWithOtherRecord()
    {
        using var db = DbContextFactory.Create();
        SeedHelpers.AddPartnerType(db, "Band", "BAND");
        var pt2 = SeedHelpers.AddPartnerType(db, "Photo", "PHOTO");
        var svc = new PartnerTypeService(db);
        var req = new UpdatePartnerTypeRequest("Band", "PHO2", false, null);

        var result = await svc.UpdateAsync(pt2.Id, req);

        result.Data.Should().BeNull();
        result.Error.Should().Contain("already exists");
    }

    
    
    

    [Fact]
    public async Task DeleteAsync_RemovesType_WhenFound()
    {
        using var db = DbContextFactory.Create();
        var pt = SeedHelpers.AddPartnerType(db);
        var svc = new PartnerTypeService(db);

        var result = await svc.DeleteAsync(pt.Id);

        result.Error.Should().BeNull();
        result.Data.Should().BeTrue();
        db.PartnerTypes.Find(pt.Id).Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFail_WhenNotFound()
    {
        using var db = DbContextFactory.Create();
        var svc = new PartnerTypeService(db);

        var result = await svc.DeleteAsync(999);

        result.Data.Should().BeFalse();
        result.Error.Should().Contain("not found");
    }
}
