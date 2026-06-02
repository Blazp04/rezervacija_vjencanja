using Microsoft.EntityFrameworkCore;
using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.Data;
using RezervacijaVjencanja.DTOs.Settings;
using RezervacijaVjencanja.Entities;

namespace RezervacijaVjencanja.Services.Settings;

public sealed class SettingsService(AppDbContext db) : ISettingsService
{
    public async Task<ApiResponse<AgencySettingsDto>> GetAsync()
    {
        var entity = await db.AgencySettings.AsNoTracking().FirstOrDefaultAsync(s => s.Id == 1);
        if (entity is null)
            return ApiResponse<AgencySettingsDto>.Ok(new AgencySettingsDto(string.Empty, null, null, null, null));

        return ApiResponse<AgencySettingsDto>.Ok(ToDto(entity));
    }

    public async Task<ApiResponse<AgencySettingsDto>> UpdateAsync(UpdateAgencySettingsRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CompanyName))
            return ApiResponse<AgencySettingsDto>.Fail("Naziv tvrtke je obavezan.");

        var entity = await db.AgencySettings.FirstOrDefaultAsync(s => s.Id == 1);

        if (entity is null)
        {
            entity = new AgencySettings { Id = 1 };
            db.AgencySettings.Add(entity);
        }

        entity.CompanyName = request.CompanyName.Trim();
        entity.Oib = request.Oib?.Trim();
        entity.Address = request.Address?.Trim();
        entity.Phone = request.Phone?.Trim();
        entity.Email = request.Email?.Trim();
        entity.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return ApiResponse<AgencySettingsDto>.Ok(ToDto(entity));
    }

    private static AgencySettingsDto ToDto(AgencySettings e) =>
        new(e.CompanyName, e.Oib, e.Address, e.Phone, e.Email);
}
