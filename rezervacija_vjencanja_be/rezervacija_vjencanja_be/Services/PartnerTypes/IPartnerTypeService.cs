using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.DTOs.PartnerTypes;

namespace RezervacijaVjencanja.Services.PartnerTypes;

public interface IPartnerTypeService
{
    Task<ApiResponse<IEnumerable<PartnerTypeDto>>> GetAllAsync();
    Task<ApiResponse<PartnerTypeDto>> GetByIdAsync(int id);
    Task<ApiResponse<PartnerTypeDto>> CreateAsync(CreatePartnerTypeRequest request);
    Task<ApiResponse<PartnerTypeDto>> UpdateAsync(int id, UpdatePartnerTypeRequest request);
    Task<ApiResponse<bool>> DeleteAsync(int id);
}
