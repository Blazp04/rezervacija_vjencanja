using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.DTOs.WeddingPartners;

namespace RezervacijaVjencanja.Services.WeddingPartners;

public interface IWeddingPartnerService
{
    Task<ApiResponse<IEnumerable<WeddingPartnerDto>>> GetAllByWeddingIdAsync(int weddingId);
    Task<ApiResponse<WeddingPartnerDto>> AddAsync(int weddingId, CreateWeddingPartnerRequest request);
    Task<ApiResponse<WeddingPartnerDto>> UpdateAsync(int weddingId, int wpId, UpdateWeddingPartnerRequest request);
    Task<ApiResponse<bool>> RemoveAsync(int weddingId, int wpId);
    Task<ApiResponse<WeddingPartnerDto>> UpdateStatusAsync(int weddingId, int wpId, UpdateWeddingPartnerStatusRequest request);
    Task<ApiResponse<WeddingPartnerDto>> ConfirmAsync(int weddingId, int wpId, ConfirmWeddingPartnerRequest request);
    Task<ApiResponse<PricingResultDto>> CalculatePriceAsync(int weddingId, int catalogItemId);
}
