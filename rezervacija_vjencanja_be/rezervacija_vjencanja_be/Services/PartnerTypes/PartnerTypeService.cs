using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.Data;
using RezervacijaVjencanja.DTOs.PartnerTypes;
using RezervacijaVjencanja.Entities;

namespace RezervacijaVjencanja.Services.PartnerTypes;

public sealed class PartnerTypeService(AppDbContext db) : IPartnerTypeService
{
    public async Task<ApiResponse<IEnumerable<PartnerTypeDto>>> GetAllAsync()
    {
        var items = await db.PartnerTypes
            .AsNoTracking()
            .OrderBy(p => p.Id)
            .Select(p => new PartnerTypeDto(p.Id, p.Name, p.Code, p.HasBooking, p.FieldSchema))
            .ToListAsync();

        return ApiResponse<IEnumerable<PartnerTypeDto>>.Ok(items);
    }

    public async Task<ApiResponse<PartnerTypeDto>> GetByIdAsync(int id)
    {
        var entity = await db.PartnerTypes.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id);

        if (entity is null)
            return ApiResponse<PartnerTypeDto>.Fail($"PartnerType with id {id} was not found.");

        return ApiResponse<PartnerTypeDto>.Ok(ToDto(entity));
    }

    public async Task<ApiResponse<PartnerTypeDto>> CreateAsync(CreatePartnerTypeRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return ApiResponse<PartnerTypeDto>.Fail("Name is required.");

        if (string.IsNullOrWhiteSpace(request.Code))
            return ApiResponse<PartnerTypeDto>.Fail("Code is required.");

        if (request.FieldSchema is not null && !IsValidJson(request.FieldSchema))
            return ApiResponse<PartnerTypeDto>.Fail("FieldSchema must be valid JSON.");

        if (await db.PartnerTypes.AnyAsync(p => p.Name == request.Name))
            return ApiResponse<PartnerTypeDto>.Fail($"A PartnerType with name '{request.Name}' already exists.");

        var code = request.Code.Trim().ToUpperInvariant();
        if (await db.PartnerTypes.AnyAsync(p => p.Code == code))
            return ApiResponse<PartnerTypeDto>.Fail($"A PartnerType with code '{code}' already exists.");

        var entity = new PartnerType
        {
            Name = request.Name.Trim(),
            Code = code,
            HasBooking = request.HasBooking,
            FieldSchema = request.FieldSchema,
            CreatedAt = DateTime.UtcNow,
        };
        db.PartnerTypes.Add(entity);
        await db.SaveChangesAsync();

        return ApiResponse<PartnerTypeDto>.Ok(ToDto(entity));
    }

    public async Task<ApiResponse<PartnerTypeDto>> UpdateAsync(int id, UpdatePartnerTypeRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return ApiResponse<PartnerTypeDto>.Fail("Name is required.");

        if (string.IsNullOrWhiteSpace(request.Code))
            return ApiResponse<PartnerTypeDto>.Fail("Code is required.");

        if (request.FieldSchema is not null && !IsValidJson(request.FieldSchema))
            return ApiResponse<PartnerTypeDto>.Fail("FieldSchema must be valid JSON.");

        var entity = await db.PartnerTypes.FindAsync(id);
        if (entity is null)
            return ApiResponse<PartnerTypeDto>.Fail($"PartnerType with id {id} was not found.");

        if (await db.PartnerTypes.AnyAsync(p => p.Name == request.Name && p.Id != id))
            return ApiResponse<PartnerTypeDto>.Fail($"A PartnerType with name '{request.Name}' already exists.");

        var code = request.Code.Trim().ToUpperInvariant();
        if (await db.PartnerTypes.AnyAsync(p => p.Code == code && p.Id != id))
            return ApiResponse<PartnerTypeDto>.Fail($"A PartnerType with code '{code}' already exists.");

        entity.Name = request.Name.Trim();
        entity.Code = code;
        entity.HasBooking = request.HasBooking;
        entity.FieldSchema = request.FieldSchema;
        await db.SaveChangesAsync();

        return ApiResponse<PartnerTypeDto>.Ok(ToDto(entity));
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int id)
    {
        var entity = await db.PartnerTypes.FindAsync(id);
        if (entity is null)
            return ApiResponse<bool>.Fail($"PartnerType with id {id} was not found.");

        db.PartnerTypes.Remove(entity);
        await db.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true);
    }

    private static PartnerTypeDto ToDto(PartnerType e) =>
        new(e.Id, e.Name, e.Code, e.HasBooking, e.FieldSchema);

    private static bool IsValidJson(string json)
    {
        try { JsonDocument.Parse(json); return true; }
        catch { return false; }
    }
}
