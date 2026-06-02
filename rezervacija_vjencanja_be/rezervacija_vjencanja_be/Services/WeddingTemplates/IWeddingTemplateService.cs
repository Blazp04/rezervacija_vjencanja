using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.DTOs.WeddingTemplates;

namespace RezervacijaVjencanja.Services.WeddingTemplates;

public interface IWeddingTemplateService
{
    Task<ApiResponse<IEnumerable<WeddingTemplateListDto>>> GetAllAsync();
    Task<ApiResponse<WeddingTemplateDto>> GetByIdAsync(int id);
    Task<ApiResponse<WeddingTemplateDto>> CreateAsync(CreateWeddingTemplateRequest request);
    Task<ApiResponse<WeddingTemplateDto>> UpdateAsync(int id, UpdateWeddingTemplateRequest request);
    Task<ApiResponse<bool>> DeleteAsync(int id);
}