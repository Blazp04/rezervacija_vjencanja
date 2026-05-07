using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.Data;
using RezervacijaVjencanja.DTOs.CatalogItems;
using RezervacijaVjencanja.Entities;

namespace RezervacijaVjencanja.Services.CatalogItems;

public sealed class CatalogItemService(AppDbContext db) : ICatalogItemService
{
    private static readonly HashSet<string> ValidItemTypes = ["SERVICE", "PRODUCT", "SONG"];

    public async Task<ApiResponse<IEnumerable<CatalogItemDto>>> GetByPartnerIdAsync(int partnerId)
    {
        if (!await db.Partners.AnyAsync(p => p.Id == partnerId))
            return ApiResponse<IEnumerable<CatalogItemDto>>.Fail($"Partner with id {partnerId} was not found.");

        var items = await db.PartnerCatalogItems
            .AsNoTracking()
            .Where(c => c.PartnerId == partnerId)
            .OrderBy(c => c.SortOrder).ThenBy(c => c.Name)
            .Select(c => ToDto(c))
            .ToListAsync();

        return ApiResponse<IEnumerable<CatalogItemDto>>.Ok(items);
    }

    public async Task<ApiResponse<CatalogItemDto>> GetByIdAsync(int id)
    {
        var entity = await db.PartnerCatalogItems.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
        if (entity is null)
            return ApiResponse<CatalogItemDto>.Fail($"CatalogItem with id {id} was not found.");

        return ApiResponse<CatalogItemDto>.Ok(ToDto(entity));
    }

    public async Task<ApiResponse<CatalogItemDto>> CreateAsync(CreateCatalogItemRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return ApiResponse<CatalogItemDto>.Fail("Name is required.");

        if (!ValidItemTypes.Contains(request.ItemType))
            return ApiResponse<CatalogItemDto>.Fail($"ItemType must be one of: {string.Join(", ", ValidItemTypes)}.");

        if (!await db.Partners.AnyAsync(p => p.Id == request.PartnerId))
            return ApiResponse<CatalogItemDto>.Fail($"Partner with id {request.PartnerId} was not found.");

        if (request.BasePrice.HasValue && request.BasePrice.Value < 0)
            return ApiResponse<CatalogItemDto>.Fail("BasePrice must be >= 0.");

        if (request.Metadata is not null && !IsValidJson(request.Metadata))
            return ApiResponse<CatalogItemDto>.Fail("Metadata must be valid JSON.");

        var entity = new PartnerCatalogItem
        {
            PartnerId = request.PartnerId,
            Name = request.Name.Trim(),
            Category = request.Category?.Trim(),
            Description = request.Description?.Trim(),
            ItemType = request.ItemType,
            BasePrice = request.BasePrice,
            Metadata = request.Metadata,
            IsActive = true,
            SortOrder = 0,
            CreatedAt = DateTime.UtcNow,
        };

        db.PartnerCatalogItems.Add(entity);
        await db.SaveChangesAsync();

        return ApiResponse<CatalogItemDto>.Ok(ToDto(entity));
    }

    public async Task<ApiResponse<CatalogItemDto>> UpdateAsync(int id, UpdateCatalogItemRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return ApiResponse<CatalogItemDto>.Fail("Name is required.");

        if (!ValidItemTypes.Contains(request.ItemType))
            return ApiResponse<CatalogItemDto>.Fail($"ItemType must be one of: {string.Join(", ", ValidItemTypes)}.");

        if (request.BasePrice.HasValue && request.BasePrice.Value < 0)
            return ApiResponse<CatalogItemDto>.Fail("BasePrice must be >= 0.");

        if (request.Metadata is not null && !IsValidJson(request.Metadata))
            return ApiResponse<CatalogItemDto>.Fail("Metadata must be valid JSON.");

        var entity = await db.PartnerCatalogItems.FindAsync(id);
        if (entity is null)
            return ApiResponse<CatalogItemDto>.Fail($"CatalogItem with id {id} was not found.");

        entity.Name = request.Name.Trim();
        entity.Category = request.Category?.Trim();
        entity.Description = request.Description?.Trim();
        entity.ItemType = request.ItemType;
        entity.BasePrice = request.BasePrice;
        entity.Metadata = request.Metadata;
        entity.IsActive = request.IsActive;
        entity.SortOrder = request.SortOrder;

        await db.SaveChangesAsync();

        return ApiResponse<CatalogItemDto>.Ok(ToDto(entity));
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int id)
    {
        var entity = await db.PartnerCatalogItems.FindAsync(id);
        if (entity is null)
            return ApiResponse<bool>.Fail($"CatalogItem with id {id} was not found.");

        db.PartnerCatalogItems.Remove(entity);
        await db.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true);
    }

    private static CatalogItemDto ToDto(PartnerCatalogItem c) => new(
        c.Id, c.PartnerId, c.Name, c.Category, c.Description,
        c.ItemType, c.BasePrice, c.Metadata, c.IsActive, c.SortOrder);

    private static bool IsValidJson(string json)
    {
        try { JsonDocument.Parse(json); return true; }
        catch { return false; }
    }
}
