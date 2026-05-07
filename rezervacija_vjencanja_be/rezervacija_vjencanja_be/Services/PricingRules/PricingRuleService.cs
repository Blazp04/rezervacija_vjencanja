using Microsoft.EntityFrameworkCore;
using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.Data;
using RezervacijaVjencanja.DTOs.PricingRules;
using RezervacijaVjencanja.Entities;

namespace RezervacijaVjencanja.Services.PricingRules;

public sealed class PricingRuleService(AppDbContext db) : IPricingRuleService
{
    private static readonly HashSet<string> ValidRuleTypes = ["SPECIAL_DAY", "SPECIFIC_DATE"];

    public async Task<ApiResponse<IEnumerable<PricingRuleDto>>> GetByCatalogItemIdAsync(int catalogItemId)
    {
        if (!await db.PartnerCatalogItems.AnyAsync(c => c.Id == catalogItemId))
            return ApiResponse<IEnumerable<PricingRuleDto>>.Fail($"CatalogItem with id {catalogItemId} was not found.");

        var items = await db.PricingRules
            .AsNoTracking()
            .Where(r => r.CatalogItemId == catalogItemId)
            .OrderBy(r => r.RuleType).ThenBy(r => r.Id)
            .Select(r => ToDto(r))
            .ToListAsync();

        return ApiResponse<IEnumerable<PricingRuleDto>>.Ok(items);
    }

    public async Task<ApiResponse<PricingRuleDto>> CreateAsync(CreatePricingRuleRequest request)
    {
        var validation = Validate(request.RuleType, request.DayOfWeek, request.SpecificDate, request.Price);
        if (validation is not null)
            return ApiResponse<PricingRuleDto>.Fail(validation);

        if (!await db.PartnerCatalogItems.AnyAsync(c => c.Id == request.CatalogItemId))
            return ApiResponse<PricingRuleDto>.Fail($"CatalogItem with id {request.CatalogItemId} was not found.");

        if (request.ValidFrom.HasValue && request.ValidTo.HasValue && request.ValidFrom > request.ValidTo)
            return ApiResponse<PricingRuleDto>.Fail("ValidFrom must not be after ValidTo.");

        var entity = new PricingRule
        {
            CatalogItemId = request.CatalogItemId,
            RuleType = request.RuleType,
            DayOfWeek = request.DayOfWeek,
            SpecificDate = request.SpecificDate,
            Price = request.Price,
            ValidFrom = request.ValidFrom,
            ValidTo = request.ValidTo,
        };

        db.PricingRules.Add(entity);
        await db.SaveChangesAsync();

        return ApiResponse<PricingRuleDto>.Ok(ToDto(entity));
    }

    public async Task<ApiResponse<PricingRuleDto>> UpdateAsync(int id, UpdatePricingRuleRequest request)
    {
        var validation = Validate(request.RuleType, request.DayOfWeek, request.SpecificDate, request.Price);
        if (validation is not null)
            return ApiResponse<PricingRuleDto>.Fail(validation);

        if (request.ValidFrom.HasValue && request.ValidTo.HasValue && request.ValidFrom > request.ValidTo)
            return ApiResponse<PricingRuleDto>.Fail("ValidFrom must not be after ValidTo.");

        var entity = await db.PricingRules.FindAsync(id);
        if (entity is null)
            return ApiResponse<PricingRuleDto>.Fail($"PricingRule with id {id} was not found.");

        entity.RuleType = request.RuleType;
        entity.DayOfWeek = request.DayOfWeek;
        entity.SpecificDate = request.SpecificDate;
        entity.Price = request.Price;
        entity.ValidFrom = request.ValidFrom;
        entity.ValidTo = request.ValidTo;

        await db.SaveChangesAsync();

        return ApiResponse<PricingRuleDto>.Ok(ToDto(entity));
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int id)
    {
        var entity = await db.PricingRules.FindAsync(id);
        if (entity is null)
            return ApiResponse<bool>.Fail($"PricingRule with id {id} was not found.");

        db.PricingRules.Remove(entity);
        await db.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true);
    }

    private static string? Validate(string ruleType, byte? dayOfWeek, DateOnly? specificDate, decimal price)
    {
        if (!ValidRuleTypes.Contains(ruleType))
            return $"RuleType must be one of: {string.Join(", ", ValidRuleTypes)}.";

        if (price < 0)
            return "Price must be >= 0.";

        if (ruleType == "SPECIAL_DAY" && (!dayOfWeek.HasValue || dayOfWeek < 1 || dayOfWeek > 7))
            return "DayOfWeek (1-7) is required for SPECIAL_DAY rules.";

        if (ruleType == "SPECIFIC_DATE" && !specificDate.HasValue)
            return "SpecificDate is required for SPECIFIC_DATE rules.";

        return null;
    }

    private static PricingRuleDto ToDto(PricingRule r) => new(
        r.Id, r.CatalogItemId, r.RuleType, r.DayOfWeek,
        r.SpecificDate, r.Price, r.ValidFrom, r.ValidTo);
}
