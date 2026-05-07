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
            .Include(p => p.PartnerType)
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
