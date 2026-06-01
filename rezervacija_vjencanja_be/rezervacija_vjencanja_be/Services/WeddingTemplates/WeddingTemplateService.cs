using Microsoft.EntityFrameworkCore;
using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.Data;
using RezervacijaVjencanja.DTOs.WeddingTemplates;

namespace RezervacijaVjencanja.Services.WeddingTemplates;

public sealed class WeddingTemplateService(AppDbContext db) : IWeddingTemplateService
{
    public async Task<ApiResponse<IEnumerable<WeddingTemplateListDto>>> GetAllAsync()
    {
        var items = await db.WeddingTemplates
            .AsNoTracking()
            .Where(t => t.IsActive)
            .OrderBy(t => t.Name)
            .Select(t => new WeddingTemplateListDto(t.Id, t.Name, t.Description))
            .ToListAsync();

        return ApiResponse<IEnumerable<WeddingTemplateListDto>>.Ok(items);
    }
}
