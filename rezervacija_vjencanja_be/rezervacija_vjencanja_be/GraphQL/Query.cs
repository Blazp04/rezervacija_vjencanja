using Microsoft.EntityFrameworkCore;
using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.Data;
using RezervacijaVjencanja.DTOs.BandMembers;
using RezervacijaVjencanja.DTOs.Bookings;
using RezervacijaVjencanja.DTOs.CatalogItems;
using RezervacijaVjencanja.DTOs.PartnerTypes;
using RezervacijaVjencanja.DTOs.Partners;
using RezervacijaVjencanja.DTOs.PricingRules;
using RezervacijaVjencanja.DTOs.Settings;
using RezervacijaVjencanja.DTOs.WeddingPartners;
using RezervacijaVjencanja.DTOs.WeddingTemplates;
using RezervacijaVjencanja.DTOs.Weddings;
using RezervacijaVjencanja.Services.BandMembers;
using RezervacijaVjencanja.Services.CatalogItems;
using RezervacijaVjencanja.Services.PartnerTypes;
using RezervacijaVjencanja.Services.Partners;
using RezervacijaVjencanja.Services.PricingRules;
using RezervacijaVjencanja.Services.Settings;
using RezervacijaVjencanja.Services.WeddingPartners;
using RezervacijaVjencanja.Services.WeddingTemplates;
using RezervacijaVjencanja.Services.Weddings;

namespace RezervacijaVjencanja.GraphQL;

public class Query
{

    public async Task<IEnumerable<WeddingListDto>> GetWeddings(
        string? status,
        [Service] IWeddingService service)
    {
        var result = await service.GetAllAsync(status);
        return result.Data ?? [];
    }

    public async Task<WeddingDto?> GetWedding(
        int id,
        [Service] IWeddingService service)
    {
        var result = await service.GetByIdAsync(id);
        return result.Data;
    }


    public async Task<IEnumerable<WeddingTemplateListDto>> GetWeddingTemplates(
        [Service] IWeddingTemplateService service)
    {
        var result = await service.GetAllAsync();
        return result.Data ?? [];
    }

    public async Task<WeddingTemplateDto?> GetWeddingTemplate(
        int id,
        [Service] IWeddingTemplateService service)
    {
        var result = await service.GetByIdAsync(id);
        return result.Data;
    }


    public async Task<IEnumerable<PartnerTypeDto>> GetPartnerTypes(
        [Service] IPartnerTypeService service)
    {
        var result = await service.GetAllAsync();
        return result.Data ?? [];
    }

    public async Task<PartnerTypeDto?> GetPartnerType(
        int id,
        [Service] IPartnerTypeService service)
    {
        var result = await service.GetByIdAsync(id);
        return result.Data;
    }


    public async Task<IEnumerable<PartnerListDto>> GetPartners(
        int? partnerTypeId,
        [Service] IPartnerService service)
    {
        var result = await service.GetAllAsync(partnerTypeId);
        return result.Data ?? [];
    }

    public async Task<PartnerDto?> GetPartner(
        int id,
        [Service] IPartnerService service)
    {
        var result = await service.GetByIdAsync(id);
        return result.Data;
    }

    public async Task<IEnumerable<BookingDto>> GetPartnerBookings(
        int partnerId,
        [Service] AppDbContext db)
    {
        return await db.Bookings
            .AsNoTracking()
            .Include(b => b.Wedding)
            .Include(b => b.WeddingPartner)
            .Where(b => b.PartnerId == partnerId)
            .OrderBy(b => b.StartDateTime)
            .Select(b => new BookingDto(
                b.Id,
                b.PartnerId,
                b.WeddingId,
                b.Wedding.Name,
                b.StartDateTime,
                b.EndDateTime,
                b.WeddingPartner.Status,
                b.Notes))
            .ToListAsync();
    }

    public async Task<AvailabilityDto> CheckPartnerAvailability(
        int partnerId,
        DateTime start,
        DateTime end,
        [Service] AppDbContext db)
    {
        var conflicts = await db.Bookings
            .AsNoTracking()
            .Include(b => b.Wedding)
            .Include(b => b.WeddingPartner)
            .Where(b => b.PartnerId == partnerId
                     && b.StartDateTime < end
                     && b.EndDateTime > start)
            .Select(b => new BookingDto(
                b.Id,
                b.PartnerId,
                b.WeddingId,
                b.Wedding.Name,
                b.StartDateTime,
                b.EndDateTime,
                b.WeddingPartner.Status,
                b.Notes))
            .ToListAsync();

        return new AvailabilityDto(!conflicts.Any(), conflicts);
    }


    public async Task<IEnumerable<CatalogItemDto>> GetCatalogItemsByPartner(
        int partnerId,
        [Service] ICatalogItemService service)
    {
        var result = await service.GetByPartnerIdAsync(partnerId);
        return result.Data ?? [];
    }

    public async Task<CatalogItemDto?> GetCatalogItem(
        int id,
        [Service] ICatalogItemService service)
    {
        var result = await service.GetByIdAsync(id);
        return result.Data;
    }


    public async Task<IEnumerable<PricingRuleDto>> GetPricingRules(
        int catalogItemId,
        [Service] IPricingRuleService service)
    {
        var result = await service.GetByCatalogItemIdAsync(catalogItemId);
        return result.Data ?? [];
    }


    public async Task<IEnumerable<BandMemberDto>> GetBandMembers(
        int partnerId,
        [Service] IBandMemberService service)
    {
        var result = await service.GetByPartnerIdAsync(partnerId);
        return result.Data ?? [];
    }


    public async Task<IEnumerable<WeddingPartnerDto>> GetWeddingPartners(
        int weddingId,
        [Service] IWeddingPartnerService service)
    {
        var result = await service.GetAllByWeddingIdAsync(weddingId);
        return result.Data ?? [];
    }

    public async Task<PricingResultDto?> GetWeddingPrice(
        int weddingId,
        int catalogItemId,
        [Service] IWeddingPartnerService service)
    {
        var result = await service.CalculatePriceAsync(weddingId, catalogItemId);
        return result.Data;
    }


    public async Task<AgencySettingsDto?> GetAgencySettings(
        [Service] ISettingsService service)
    {
        var result = await service.GetAsync();
        return result.Data;
    }


    public async Task<CalendarMonthGqlDto> GetCalendar(
        int year,
        int month,
        [Service] AppDbContext db)
    {
        var from = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
        var to = from.AddMonths(1);

        var weddings = await db.Weddings
            .AsNoTracking()
            .Where(w => w.DateTime >= from && w.DateTime < to && w.Status != "CANCELLED")
            .OrderBy(w => w.DateTime)
            .Select(w => new CalendarWeddingGqlDto(w.Id, w.Name, w.DateTime, w.Location, w.Status))
            .ToListAsync();

        var bookings = await db.Bookings
            .AsNoTracking()
            .Where(b => b.StartDateTime < to && b.EndDateTime > from)
            .Include(b => b.Partner).ThenInclude(p => p.PartnerType)
            .Include(b => b.Wedding)
            .OrderBy(b => b.StartDateTime)
            .Select(b => new CalendarBookingGqlDto(
                b.Id,
                b.PartnerId,
                b.Partner.Name,
                b.Partner.PartnerType.Code,
                b.WeddingId,
                b.Wedding.Name,
                b.StartDateTime,
                b.EndDateTime))
            .ToListAsync();

        return new CalendarMonthGqlDto(weddings, bookings);
    }
}

public record CalendarWeddingGqlDto(
    int Id,
    string Name,
    DateTime DateTime,
    string? Location,
    string Status);

public record CalendarBookingGqlDto(
    int Id,
    int PartnerId,
    string PartnerName,
    string PartnerTypeCode,
    int WeddingId,
    string WeddingName,
    DateTime StartDateTime,
    DateTime EndDateTime);

public record CalendarMonthGqlDto(
    IEnumerable<CalendarWeddingGqlDto> Weddings,
    IEnumerable<CalendarBookingGqlDto> Bookings);
