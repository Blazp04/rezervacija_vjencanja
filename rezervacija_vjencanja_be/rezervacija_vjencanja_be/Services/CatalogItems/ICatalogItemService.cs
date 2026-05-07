using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.DTOs.CatalogItems;

namespace RezervacijaVjencanja.Services.CatalogItems;

public interface ICatalogItemService
{
    Task<ApiResponse<IEnumerable<CatalogItemDto>>> GetByPartnerIdAsync(int partnerId);
    Task<ApiResponse<CatalogItemDto>> GetByIdAsync(int id);
    Task<ApiResponse<CatalogItemDto>> CreateAsync(CreateCatalogItemRequest request);
    Task<ApiResponse<CatalogItemDto>> UpdateAsync(int id, UpdateCatalogItemRequest request);
    Task<ApiResponse<bool>> DeleteAsync(int id);
}
