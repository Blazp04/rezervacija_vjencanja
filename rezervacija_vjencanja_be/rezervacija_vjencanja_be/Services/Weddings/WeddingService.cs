using Microsoft.EntityFrameworkCore;
using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.Data;
using RezervacijaVjencanja.DTOs.Weddings;
using RezervacijaVjencanja.Entities;

namespace RezervacijaVjencanja.Services.Weddings;

public sealed class WeddingService(AppDbContext db) : IWeddingService
{
    private static readonly HashSet<string> ValidStatuses = ["PREPARATION", "CONFIRMED", "COMPLETED", "CANCELLED"];

    private static readonly Dictionary<string, string[]> AllowedTransitions = new()
    {
        ["PREPARATION"] = ["CONFIRMED", "CANCELLED"],
        ["CONFIRMED"]   = ["COMPLETED", "CANCELLED"],
        ["COMPLETED"]   = [],
        ["CANCELLED"]   = [],
    };

    public async Task<ApiResponse<IEnumerable<WeddingListDto>>> GetAllAsync(string? status = null)
    {
        var query = db.Weddings
            .AsNoTracking()
            .Include(w => w.Template)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(w => w.Status == status.ToUpper());

        var items = await query
            .OrderByDescending(w => w.DateTime)
            .Select(w => new WeddingListDto(w.Id, w.Name, w.DateTime, w.Location, w.Status, w.Template != null ? w.Template.Name : null))
            .ToListAsync();

        return ApiResponse<IEnumerable<WeddingListDto>>.Ok(items);
    }

    public async Task<ApiResponse<WeddingDto>> GetByIdAsync(int id)
    {
        var entity = await db.Weddings
            .AsNoTracking()
            .Include(w => w.Template)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (entity is null)
            return ApiResponse<WeddingDto>.Fail($"Wedding with id {id} was not found.");

        return ApiResponse<WeddingDto>.Ok(ToDto(entity));
    }

    public async Task<ApiResponse<WeddingDto>> CreateAsync(CreateWeddingRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return ApiResponse<WeddingDto>.Fail("Name is required.");

        if (request.TemplateId.HasValue && !await db.WeddingTemplates.AnyAsync(t => t.Id == request.TemplateId))
            return ApiResponse<WeddingDto>.Fail($"Template with id {request.TemplateId} was not found.");

        var now = DateTime.UtcNow;
        var entity = new Wedding
        {
            Name = request.Name.Trim(),
            DateTime = request.DateTime,
            Location = request.Location?.Trim(),
            TemplateId = request.TemplateId,
            Notes = request.Notes?.Trim(),
            Status = "PREPARATION",
            CreatedAt = now,
            UpdatedAt = now,
        };

        db.Weddings.Add(entity);
        await db.SaveChangesAsync();

        if (entity.TemplateId.HasValue)
            await db.Entry(entity).Reference(w => w.Template).LoadAsync();

        return ApiResponse<WeddingDto>.Ok(ToDto(entity));
    }

    public async Task<ApiResponse<WeddingDto>> UpdateAsync(int id, UpdateWeddingRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return ApiResponse<WeddingDto>.Fail("Name is required.");

        if (!ValidStatuses.Contains(request.Status))
            return ApiResponse<WeddingDto>.Fail($"Invalid status. Valid values: {string.Join(", ", ValidStatuses)}.");

        var entity = await db.Weddings
            .Include(w => w.Template)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (entity is null)
            return ApiResponse<WeddingDto>.Fail($"Wedding with id {id} was not found.");

        if (request.TemplateId.HasValue && request.TemplateId != entity.TemplateId
            && !await db.WeddingTemplates.AnyAsync(t => t.Id == request.TemplateId))
            return ApiResponse<WeddingDto>.Fail($"Template with id {request.TemplateId} was not found.");

        entity.Name = request.Name.Trim();
        entity.DateTime = request.DateTime;
        entity.Location = request.Location?.Trim();
        entity.TemplateId = request.TemplateId;
        entity.Notes = request.Notes?.Trim();
        entity.Status = request.Status;
        entity.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        if (entity.TemplateId.HasValue && entity.Template is null)
            await db.Entry(entity).Reference(w => w.Template).LoadAsync();

        return ApiResponse<WeddingDto>.Ok(ToDto(entity));
    }

    public async Task<ApiResponse<WeddingDto>> ChangeStatusAsync(int id, string newStatus)
    {
        if (string.IsNullOrWhiteSpace(newStatus))
            return ApiResponse<WeddingDto>.Fail("New status is required.");

        var target = newStatus.Trim().ToUpper();

        if (!ValidStatuses.Contains(target))
            return ApiResponse<WeddingDto>.Fail($"Invalid status. Valid values: {string.Join(", ", ValidStatuses)}.");

        var entity = await db.Weddings
            .Include(w => w.Template)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (entity is null)
            return ApiResponse<WeddingDto>.Fail($"Wedding with id {id} was not found.");

        if (entity.Status == target)
            return ApiResponse<WeddingDto>.Fail($"Wedding is already in status {target}.");

        var allowed = AllowedTransitions.TryGetValue(entity.Status, out var next) ? next : [];
        if (!allowed.Contains(target))
            return ApiResponse<WeddingDto>.Fail($"Cannot change status from {entity.Status} to {target}.");

        entity.Status = target;
        entity.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return ApiResponse<WeddingDto>.Ok(ToDto(entity));
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int id)
    {
        var entity = await db.Weddings.FindAsync(id);
        if (entity is null)
            return ApiResponse<bool>.Fail($"Wedding with id {id} was not found.");

        if (entity.Status == "CANCELLED")
            return ApiResponse<bool>.Fail("Wedding is already cancelled.");

        entity.Status = "CANCELLED";
        entity.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true);
    }

    private static WeddingDto ToDto(Wedding w) => new(
        w.Id, w.Name, w.DateTime, w.Location,
        w.TemplateId, w.Template?.Name,
        w.Status, w.Notes, w.CreatedAt, w.UpdatedAt);
}
