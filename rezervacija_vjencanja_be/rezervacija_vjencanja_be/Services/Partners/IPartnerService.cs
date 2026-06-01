using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.DTOs.Partners;

namespace RezervacijaVjencanja.Services.Partners;

public interface IPartnerService
{
    Task<ApiResponse<IEnumerable<PartnerListDto>>> GetAllAsync(int? partnerTypeId = null);
    Task<ApiResponse<PartnerDto>> GetByIdAsync(int id);
    Task<ApiResponse<PartnerDto>> CreateAsync(CreatePartnerRequest request);
    Task<ApiResponse<PartnerDto>> UpdateAsync(int id, UpdatePartnerRequest request);
    Task<ApiResponse<bool>> DeleteAsync(int id);
    Task<ApiResponse<PartnerDto>> CloneAsync(int id);
}
