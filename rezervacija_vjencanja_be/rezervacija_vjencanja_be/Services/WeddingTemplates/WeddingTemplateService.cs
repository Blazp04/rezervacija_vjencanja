using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.Data;
using RezervacijaVjencanja.DTOs.WeddingTemplates;
using RezervacijaVjencanja.Entities;

namespace RezervacijaVjencanja.Services.WeddingTemplates;

public sealed class WeddingTemplateService(AppDbContext db) : IWeddingTemplateService
{
    public async Task<ApiResponse<IEnumerable<WeddingTemplateListDto>>> GetAllAsync()
    {
        var entities = await db.WeddingTemplates
            .AsNoTracking()
            .Where(t => t.IsActive)
            .OrderBy(t => t.Name)
            .ToListAsync();

        var items = entities.Select(t => new WeddingTemplateListDto(
            t.Id,
            t.Name,
            t.Description,
            ParsePartnerTypes(t.RequiredPartnerTypes).Count));

        return ApiResponse<IEnumerable<WeddingTemplateListDto>>.Ok(items);
    }

    public async Task<ApiResponse<WeddingTemplateDto>> GetByIdAsync(int id)
    {
        var entity = await db.WeddingTemplates
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == id);

        if (entity is null)
            return ApiResponse<WeddingTemplateDto>.Fail($"Wedding template with id {id} was not found.");

        return ApiResponse<WeddingTemplateDto>.Ok(ToDto(entity));
    }

    public async Task<ApiResponse<WeddingTemplateDto>> CreateAsync(CreateWeddingTemplateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return ApiResponse<WeddingTemplateDto>.Fail("Name is required.");

        var entity = new WeddingTemplate
        {
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            DefaultNotes = request.DefaultNotes?.Trim(),
            RequiredPartnerTypes = SerializePartnerTypes(request.RequiredPartnerTypes),
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
        };

        db.WeddingTemplates.Add(entity);
        await db.SaveChangesAsync();

        return ApiResponse<WeddingTemplateDto>.Ok(ToDto(entity));
    }

    public async Task<ApiResponse<WeddingTemplateDto>> UpdateAsync(int id, UpdateWeddingTemplateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return ApiResponse<WeddingTemplateDto>.Fail("Name is required.");

        var entity = await db.WeddingTemplates.FirstOrDefaultAsync(t => t.Id == id);
        if (entity is null)
            return ApiResponse<WeddingTemplateDto>.Fail($"Wedding template with id {id} was not found.");

        entity.Name = request.Name.Trim();
        entity.Description = request.Description?.Trim();
        entity.DefaultNotes = request.DefaultNotes?.Trim();
        entity.RequiredPartnerTypes = SerializePartnerTypes(request.RequiredPartnerTypes);
        entity.IsActive = request.IsActive;

        await db.SaveChangesAsync();

        return ApiResponse<WeddingTemplateDto>.Ok(ToDto(entity));
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int id)
    {
        var entity = await db.WeddingTemplates.FirstOrDefaultAsync(t => t.Id == id);
        if (entity is null)
            return ApiResponse<bool>.Fail($"Wedding template with id {id} was not found.");

        // Soft delete — task trazi IsActive = false (predlozak moze biti vezan uz vjencanja)
        entity.IsActive = false;
        await db.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true);
    }

    private static WeddingTemplateDto ToDto(WeddingTemplate t) => new(
        t.Id,
        t.Name,
        t.Description,
        t.DefaultNotes,
        ParsePartnerTypes(t.RequiredPartnerTypes),
        t.IsActive,
        t.CreatedAt);

    private static List<TemplatePartnerTypeDto> ParsePartnerTypes(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return [];
        try
        {
            return JsonSerializer.Deserialize<List<TemplatePartnerTypeDto>>(json) ?? [];
        }
        catch
        {
            return [];
        }
    }

    private static string? SerializePartnerTypes(List<TemplatePartnerTypeDto>? types)
    {
        if (types is null || types.Count == 0)
            return null;
        return JsonSerializer.Serialize(types);
    }
}