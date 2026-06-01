using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.Data;
using RezervacijaVjencanja.DTOs.Partners;
using RezervacijaVjencanja.Entities;

namespace RezervacijaVjencanja.Services.Partners;

public sealed class PartnerService(AppDbContext db) : IPartnerService
{
    public async Task<ApiResponse<IEnumerable<PartnerListDto>>> GetAllAsync(int? partnerTypeId = null)
    {
        var query = db.Partners
            .AsNoTracking()
            .Where(p => p.IsActive)
            .AsQueryable();

        if (partnerTypeId.HasValue)
            query = query.Where(p => p.PartnerTypeId == partnerTypeId.Value);

        var items = await query
            .OrderBy(p => p.Name)
            .Select(p => new PartnerListDto(
                p.Id,
                p.Name,
                p.PartnerType.Code,
                p.PartnerType.Name,
                p.CommissionPercent,
                p.IsActive))
            .ToListAsync();

        return ApiResponse<IEnumerable<PartnerListDto>>.Ok(items);
    }

    public async Task<ApiResponse<PartnerDto>> GetByIdAsync(int id)
    {
        var entity = await db.Partners
            .AsNoTracking()
            .Include(p => p.PartnerType)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (entity is null)
            return ApiResponse<PartnerDto>.Fail($"Partner with id {id} was not found.");

        return ApiResponse<PartnerDto>.Ok(ToDto(entity));
    }

    public async Task<ApiResponse<PartnerDto>> CreateAsync(CreatePartnerRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return ApiResponse<PartnerDto>.Fail("Name is required.");

        if (!await db.PartnerTypes.AnyAsync(t => t.Id == request.PartnerTypeId))
            return ApiResponse<PartnerDto>.Fail($"PartnerType with id {request.PartnerTypeId} was not found.");

        if (request.CommissionPercent < 0 || request.CommissionPercent > 100)
            return ApiResponse<PartnerDto>.Fail("CommissionPercent must be between 0 and 100.");

        if (request.ExtraFields is not null && !IsValidJson(request.ExtraFields))
            return ApiResponse<PartnerDto>.Fail("ExtraFields must be valid JSON.");

        var now = DateTime.UtcNow;
        var entity = new Partner
        {
            Name = request.Name.Trim(),
            PartnerTypeId = request.PartnerTypeId,
            Address = request.Address?.Trim(),
            Phone = request.Phone?.Trim(),
            Email = request.Email?.Trim(),
            Website = request.Website?.Trim(),
            CommissionPercent = request.CommissionPercent,
            Notes = request.Notes?.Trim(),
            ExtraFields = request.ExtraFields,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now,
        };

        db.Partners.Add(entity);
        await db.SaveChangesAsync();
        await db.Entry(entity).Reference(p => p.PartnerType).LoadAsync();

        return ApiResponse<PartnerDto>.Ok(ToDto(entity));
    }

    public async Task<ApiResponse<PartnerDto>> UpdateAsync(int id, UpdatePartnerRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return ApiResponse<PartnerDto>.Fail("Name is required.");

        var entity = await db.Partners
            .Include(p => p.PartnerType)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (entity is null)
            return ApiResponse<PartnerDto>.Fail($"Partner with id {id} was not found.");

        if (!await db.PartnerTypes.AnyAsync(t => t.Id == request.PartnerTypeId))
            return ApiResponse<PartnerDto>.Fail($"PartnerType with id {request.PartnerTypeId} was not found.");

        if (request.CommissionPercent < 0 || request.CommissionPercent > 100)
            return ApiResponse<PartnerDto>.Fail("CommissionPercent must be between 0 and 100.");

        if (request.ExtraFields is not null && !IsValidJson(request.ExtraFields))
            return ApiResponse<PartnerDto>.Fail("ExtraFields must be valid JSON.");

        bool typeChanged = entity.PartnerTypeId != request.PartnerTypeId;

        entity.Name = request.Name.Trim();
        entity.PartnerTypeId = request.PartnerTypeId;
        entity.Address = request.Address?.Trim();
        entity.Phone = request.Phone?.Trim();
        entity.Email = request.Email?.Trim();
        entity.Website = request.Website?.Trim();
        entity.CommissionPercent = request.CommissionPercent;
        entity.Notes = request.Notes?.Trim();
        entity.ExtraFields = request.ExtraFields;
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        if (typeChanged)
            await db.Entry(entity).Reference(p => p.PartnerType).LoadAsync();

        return ApiResponse<PartnerDto>.Ok(ToDto(entity));
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int id)
    {
        var entity = await db.Partners.FindAsync(id);
        if (entity is null)
            return ApiResponse<bool>.Fail($"Partner with id {id} was not found.");

        db.Partners.Remove(entity);
        await db.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true);
    }

    public async Task<ApiResponse<PartnerDto>> CloneAsync(int id)
    {
        var original = await db.Partners
            .Include(p => p.PartnerType)
            .Include(p => p.CatalogItems)
                .ThenInclude(c => c.PricingRules)
            .Include(p => p.BandMembers)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (original is null)
            return ApiResponse<PartnerDto>.Fail($"Partner with id {id} was not found.");

        using var transaction = await db.Database.BeginTransactionAsync();
        try
        {
            var now = DateTime.UtcNow;

            var clone = new Partner
            {
                Name = original.Name + " (kopija)",
                PartnerTypeId = original.PartnerTypeId,
                Address = original.Address,
                Phone = original.Phone,
                Email = original.Email,
                Website = original.Website,
                CommissionPercent = original.CommissionPercent,
                Notes = original.Notes,
                ExtraFields = original.ExtraFields,
                IsActive = original.IsActive,
                CreatedAt = now,
                UpdatedAt = now,
            };
            db.Partners.Add(clone);
            await db.SaveChangesAsync();

            foreach (var item in original.CatalogItems)
            {
                var cloneItem = new PartnerCatalogItem
                {
                    PartnerId = clone.Id,
                    Name = item.Name,
                    Category = item.Category,
                    Description = item.Description,
                    ItemType = item.ItemType,
                    BasePrice = item.BasePrice,
                    Metadata = item.Metadata,
                    IsActive = item.IsActive,
                    SortOrder = item.SortOrder,
                    CreatedAt = now,
                };
                db.PartnerCatalogItems.Add(cloneItem);
                await db.SaveChangesAsync();

                foreach (var rule in item.PricingRules)
                {
                    db.PricingRules.Add(new PricingRule
                    {
                        CatalogItemId = cloneItem.Id,
                        RuleType = rule.RuleType,
                        DayOfWeek = rule.DayOfWeek,
                        SpecificDate = rule.SpecificDate,
                        Price = rule.Price,
                        ValidFrom = rule.ValidFrom,
                        ValidTo = rule.ValidTo,
                    });
                }
            }

            foreach (var member in original.BandMembers)
            {
                db.BandMembers.Add(new BandMember
                {
                    PartnerId = clone.Id,
                    Name = member.Name,
                    Role = member.Role,
                    Phone = member.Phone,
                    Email = member.Email,
                });
            }

            await db.SaveChangesAsync();
            await transaction.CommitAsync();

            await db.Entry(clone).Reference(p => p.PartnerType).LoadAsync();
            return ApiResponse<PartnerDto>.Ok(ToDto(clone));
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private static PartnerDto ToDto(Partner p) => new(
        p.Id, p.Name, p.Address, p.Phone, p.Email, p.Website,
        p.PartnerTypeId, p.PartnerType.Code, p.PartnerType.Name,
        p.CommissionPercent, p.Notes, p.ExtraFields, p.IsActive,
        p.CreatedAt, p.UpdatedAt);

    private static bool IsValidJson(string json)
    {
        try { JsonDocument.Parse(json); return true; }
        catch { return false; }
    }
}
