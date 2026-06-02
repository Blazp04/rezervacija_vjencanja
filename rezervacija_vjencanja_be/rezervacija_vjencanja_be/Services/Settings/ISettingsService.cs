using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.DTOs.Settings;

namespace RezervacijaVjencanja.Services.Settings;

public interface ISettingsService
{
    Task<ApiResponse<AgencySettingsDto>> GetAsync();
    Task<ApiResponse<AgencySettingsDto>> UpdateAsync(UpdateAgencySettingsRequest request);
}
