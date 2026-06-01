using Microsoft.EntityFrameworkCore;
using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.Data;
using RezervacijaVjencanja.DTOs.WeddingPartners;
using RezervacijaVjencanja.Entities;

namespace RezervacijaVjencanja.Services.WeddingPartners;

public sealed class WeddingPartnerService(AppDbContext db) : IWeddingPartnerService
{
    private static readonly HashSet<string> AllowedStatuses = ["PROPOSED", "OFFERED", "CANCELLED"];

    public async Task<ApiResponse<IEnumerable<WeddingPartnerDto>>> GetAllByWeddingIdAsync(int weddingId)
    {
        if (!await db.Weddings.AnyAsync(w => w.Id == weddingId))
            return ApiResponse<IEnumerable<WeddingPartnerDto>>.Fail($"Wedding with id {weddingId} was not found.");

        var items = await db.WeddingPartners
            .AsNoTracking()
            .Where(wp => wp.WeddingId == weddingId)
            .Include(wp => wp.Partner).ThenInclude(p => p.PartnerType)
            .Include(wp => wp.CatalogItem)
            .OrderBy(wp => wp.CreatedAt)
            .ToListAsync();

        return ApiResponse<IEnumerable<WeddingPartnerDto>>.Ok(items.Select(ToDto));
    }

    public async Task<ApiResponse<WeddingPartnerDto>> AddAsync(int weddingId, CreateWeddingPartnerRequest request)
    {
        var wedding = await db.Weddings.FindAsync(weddingId);
        if (wedding is null)
            return ApiResponse<WeddingPartnerDto>.Fail($"Wedding with id {weddingId} was not found.");

        var partner = await db.Partners
            .Include(p => p.PartnerType)
            .FirstOrDefaultAsync(p => p.Id == request.PartnerId);
        if (partner is null)
            return ApiResponse<WeddingPartnerDto>.Fail($"Partner with id {request.PartnerId} was not found.");

        if (!partner.IsActive)
            return ApiResponse<WeddingPartnerDto>.Fail("Only active partners can be assigned to a wedding.");

        PartnerCatalogItem? catalogItem = null;
        if (request.CatalogItemId.HasValue)
        {
            catalogItem = await db.PartnerCatalogItems
                .Include(ci => ci.PricingRules)
                .FirstOrDefaultAsync(ci => ci.Id == request.CatalogItemId && ci.PartnerId == request.PartnerId);
            if (catalogItem is null)
                return ApiResponse<WeddingPartnerDto>.Fail($"Catalog item with id {request.CatalogItemId} was not found for this partner.");
        }

        decimal? plannedPrice = null;
        if (catalogItem is not null && catalogItem.BasePrice.HasValue)
        {
            var pricing = CalculatePrice(catalogItem, wedding.DateTime);
            plannedPrice = pricing.CalculatedPrice;
        }

        var now = DateTime.UtcNow;
        var entity = new WeddingPartner
        {
            WeddingId = weddingId,
            PartnerId = request.PartnerId,
            CatalogItemId = request.CatalogItemId,
            Status = "PROPOSED",
            PlannedPrice = plannedPrice,
            CommissionPercent = partner.CommissionPercent,
            Notes = request.Notes?.Trim(),
            CreatedAt = now,
            UpdatedAt = now,
        };

        db.WeddingPartners.Add(entity);
        await db.SaveChangesAsync();

        entity.Partner = partner;
        entity.CatalogItem = catalogItem;

        return ApiResponse<WeddingPartnerDto>.Ok(ToDto(entity));
    }

    public async Task<ApiResponse<WeddingPartnerDto>> UpdateAsync(int weddingId, int wpId, UpdateWeddingPartnerRequest request)
    {
        var entity = await db.WeddingPartners
            .Include(wp => wp.Partner).ThenInclude(p => p.PartnerType)
            .Include(wp => wp.CatalogItem)
            .FirstOrDefaultAsync(wp => wp.Id == wpId && wp.WeddingId == weddingId);

        if (entity is null)
            return ApiResponse<WeddingPartnerDto>.Fail($"WeddingPartner with id {wpId} was not found.");

        if (entity.Status == "CONFIRMED")
            return ApiResponse<WeddingPartnerDto>.Fail("Cannot update a confirmed assignment.");

        if (request.CatalogItemId.HasValue)
        {
            var catalogItem = await db.PartnerCatalogItems
                .Include(ci => ci.PricingRules)
                .FirstOrDefaultAsync(ci => ci.Id == request.CatalogItemId && ci.PartnerId == entity.PartnerId);
            if (catalogItem is null)
                return ApiResponse<WeddingPartnerDto>.Fail($"Catalog item with id {request.CatalogItemId} was not found for this partner.");

            var wedding = await db.Weddings.FindAsync(weddingId);
            entity.CatalogItemId = request.CatalogItemId;
            entity.CatalogItem = catalogItem;

            if (catalogItem.BasePrice.HasValue && wedding is not null)
            {
                var pricing = CalculatePrice(catalogItem, wedding.DateTime);
                entity.PlannedPrice = pricing.CalculatedPrice;
            }
            else
            {
                entity.PlannedPrice = null;
            }
        }
        else
        {
            entity.CatalogItemId = null;
            entity.CatalogItem = null;
            entity.PlannedPrice = null;
        }

        entity.Notes = request.Notes?.Trim();
        entity.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        return ApiResponse<WeddingPartnerDto>.Ok(ToDto(entity));
    }

    public async Task<ApiResponse<bool>> RemoveAsync(int weddingId, int wpId)
    {
        var entity = await db.WeddingPartners
            .FirstOrDefaultAsync(wp => wp.Id == wpId && wp.WeddingId == weddingId);

        if (entity is null)
            return ApiResponse<bool>.Fail($"WeddingPartner with id {wpId} was not found.");

        if (entity.Status == "CONFIRMED")
            return ApiResponse<bool>.Fail("Cannot remove a confirmed assignment. Cancel it first.");

        db.WeddingPartners.Remove(entity);
        await db.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true);
    }

    public async Task<ApiResponse<WeddingPartnerDto>> UpdateStatusAsync(int weddingId, int wpId, UpdateWeddingPartnerStatusRequest request)
    {
        var status = request.Status.ToUpper();

        if (!AllowedStatuses.Contains(status))
            return ApiResponse<WeddingPartnerDto>.Fail($"Status must be one of: {string.Join(", ", AllowedStatuses)}. Use the confirm endpoint for CONFIRMED.");

        var entity = await db.WeddingPartners
            .Include(wp => wp.Partner).ThenInclude(p => p.PartnerType)
            .Include(wp => wp.CatalogItem)
            .FirstOrDefaultAsync(wp => wp.Id == wpId && wp.WeddingId == weddingId);

        if (entity is null)
            return ApiResponse<WeddingPartnerDto>.Fail($"WeddingPartner with id {wpId} was not found.");

        var (allowed, error) = IsTransitionAllowed(entity.Status, status);
        if (!allowed)
            return ApiResponse<WeddingPartnerDto>.Fail(error!);

        // When cancelling a confirmed partner, remove the booking
        if (status == "CANCELLED" && entity.Status == "CONFIRMED")
        {
            var booking = await db.Bookings.FirstOrDefaultAsync(b => b.WeddingPartnerId == wpId);
            if (booking is not null)
                db.Bookings.Remove(booking);
        }

        entity.Status = status;
        entity.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return ApiResponse<WeddingPartnerDto>.Ok(ToDto(entity));
    }

    public async Task<ApiResponse<WeddingPartnerDto>> ConfirmAsync(int weddingId, int wpId, ConfirmWeddingPartnerRequest request)
    {
        if (request.ActualPrice <= 0)
            return ApiResponse<WeddingPartnerDto>.Fail("ActualPrice must be greater than 0.");

        if (request.EndDateTime <= request.StartDateTime)
            return ApiResponse<WeddingPartnerDto>.Fail("EndDateTime must be after StartDateTime.");

        var entity = await db.WeddingPartners
            .Include(wp => wp.Partner).ThenInclude(p => p.PartnerType)
            .Include(wp => wp.CatalogItem)
            .FirstOrDefaultAsync(wp => wp.Id == wpId && wp.WeddingId == weddingId);

        if (entity is null)
            return ApiResponse<WeddingPartnerDto>.Fail($"WeddingPartner with id {wpId} was not found.");

        if (entity.Status != "OFFERED")
            return ApiResponse<WeddingPartnerDto>.Fail("Only OFFERED assignments can be confirmed.");

        // Conflict detection — only for partners with HasBooking = true
        if (entity.Partner.PartnerType.HasBooking)
        {
            var existingBookingId = await db.Bookings
                .Where(b => b.WeddingPartnerId == wpId)
                .Select(b => (int?)b.Id)
                .FirstOrDefaultAsync();

            var conflictingBooking = await db.Bookings
                .Include(b => b.Wedding)
                .Where(b => b.PartnerId == entity.PartnerId
                         && b.Id != existingBookingId
                         && b.StartDateTime < request.EndDateTime
                         && b.EndDateTime > request.StartDateTime)
                .FirstOrDefaultAsync();

            if (conflictingBooking is not null)
            {
                var conflict = new ConflictErrorDto(
                    $"Partner is already booked for another wedding during this time slot.",
                    conflictingBooking.Wedding.Name,
                    conflictingBooking.Wedding.DateTime,
                    conflictingBooking.StartDateTime,
                    conflictingBooking.EndDateTime);

                return ApiResponse<WeddingPartnerDto>.Fail(
                    $"CONFLICT:{System.Text.Json.JsonSerializer.Serialize(conflict)}");
            }

            // Remove old booking if re-confirming
            var oldBooking = await db.Bookings.FirstOrDefaultAsync(b => b.WeddingPartnerId == wpId);
            if (oldBooking is not null)
                db.Bookings.Remove(oldBooking);

            // Create booking
            db.Bookings.Add(new Booking
            {
                PartnerId = entity.PartnerId,
                WeddingId = weddingId,
                WeddingPartnerId = wpId,
                StartDateTime = request.StartDateTime,
                EndDateTime = request.EndDateTime,
                Notes = request.Notes?.Trim(),
                CreatedAt = DateTime.UtcNow,
            });
        }

        entity.Status = "CONFIRMED";
        entity.ActualPrice = request.ActualPrice;
        entity.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        return ApiResponse<WeddingPartnerDto>.Ok(ToDto(entity));
    }

    public async Task<ApiResponse<PricingResultDto>> CalculatePriceAsync(int weddingId, int catalogItemId)
    {
        var wedding = await db.Weddings.FindAsync(weddingId);
        if (wedding is null)
            return ApiResponse<PricingResultDto>.Fail($"Wedding with id {weddingId} was not found.");

        var item = await db.PartnerCatalogItems
            .AsNoTracking()
            .Include(i => i.PricingRules)
            .FirstOrDefaultAsync(i => i.Id == catalogItemId);

        if (item is null)
            return ApiResponse<PricingResultDto>.Fail($"CatalogItem with id {catalogItemId} was not found.");

        if (item.ItemType == "SONG" || item.BasePrice is null)
            return ApiResponse<PricingResultDto>.Ok(new PricingResultDto(0, "N/A", 0, "No price (song or free item)"));

        var result = CalculatePrice(item, wedding.DateTime);
        return ApiResponse<PricingResultDto>.Ok(result);
    }

    // 3-tier MT pricing algorithm
    private static PricingResultDto CalculatePrice(PartnerCatalogItem item, DateTime weddingDate)
    {
        var dateOnly = DateOnly.FromDateTime(weddingDate);
        // App convention: 1=Mon...7=Sun (convert from .NET DayOfWeek where Sunday=0)
        var dow = (int)weddingDate.DayOfWeek;
        var appDayOfWeek = (byte)(dow == 0 ? 7 : dow);

        // 1. SPECIFIC_DATE
        var specificRule = item.PricingRules
            .Where(r => r.RuleType == "SPECIFIC_DATE"
                     && r.SpecificDate == dateOnly
                     && (r.ValidFrom == null || r.ValidFrom <= dateOnly)
                     && (r.ValidTo == null || r.ValidTo >= dateOnly))
            .FirstOrDefault();

        if (specificRule is not null)
            return new PricingResultDto(item.BasePrice!.Value, "SPECIFIC_DATE", specificRule.Price, $"Special date: {specificRule.SpecificDate}");

        // 2. SPECIAL_DAY
        var specialRule = item.PricingRules
            .Where(r => r.RuleType == "SPECIAL_DAY"
                     && r.DayOfWeek == appDayOfWeek
                     && (r.ValidFrom == null || r.ValidFrom <= dateOnly)
                     && (r.ValidTo == null || r.ValidTo >= dateOnly))
            .FirstOrDefault();

        if (specialRule is not null)
        {
            var dayName = weddingDate.DayOfWeek.ToString();
            return new PricingResultDto(item.BasePrice!.Value, "SPECIAL_DAY", specialRule.Price, $"{dayName} rate");
        }

        // 3. Base price
        return new PricingResultDto(item.BasePrice!.Value, "BASE", item.BasePrice!.Value, "Base price");
    }

    private static (bool Allowed, string? Error) IsTransitionAllowed(string current, string target)
    {
        return (current, target) switch
        {
            ("PROPOSED", "OFFERED") => (true, null),
            ("PROPOSED", "CANCELLED") => (true, null),
            ("OFFERED", "CANCELLED") => (true, null),
            ("CONFIRMED", "CANCELLED") => (true, null),
            _ => (false, $"Transition from {current} to {target} is not allowed.")
        };
    }

    private static WeddingPartnerDto ToDto(WeddingPartner wp)
    {
        decimal? commissionAmount = null;
        decimal? clientPrice = null;

        if (wp.ActualPrice.HasValue && wp.CommissionPercent.HasValue)
        {
            commissionAmount = wp.ActualPrice.Value * (wp.CommissionPercent.Value / 100m);
            clientPrice = wp.ActualPrice.Value + commissionAmount;
        }

        return new WeddingPartnerDto(
            wp.Id, wp.WeddingId, wp.PartnerId,
            wp.Partner.Name, wp.Partner.PartnerType.Code, wp.Partner.PartnerType.Name,
            wp.CatalogItemId, wp.CatalogItem?.Name,
            wp.Status, wp.PlannedPrice, wp.ActualPrice, wp.CommissionPercent,
            commissionAmount, clientPrice,
            wp.Notes, wp.CreatedAt, wp.UpdatedAt);
    }
}
