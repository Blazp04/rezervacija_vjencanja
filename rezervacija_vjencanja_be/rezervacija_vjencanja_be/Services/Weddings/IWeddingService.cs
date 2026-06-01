using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.DTOs.Weddings;

namespace RezervacijaVjencanja.Services.Weddings;

public interface IWeddingService
{
    Task<ApiResponse<IEnumerable<WeddingListDto>>> GetAllAsync(string? status = null);
    Task<ApiResponse<WeddingDto>> GetByIdAsync(int id);
    Task<ApiResponse<WeddingDto>> CreateAsync(CreateWeddingRequest request);
    Task<ApiResponse<WeddingDto>> UpdateAsync(int id, UpdateWeddingRequest request);
    Task<ApiResponse<bool>> DeleteAsync(int id);
}
