using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.DTOs.WeddingTemplates;

namespace RezervacijaVjencanja.Services.WeddingTemplates;

public interface IWeddingTemplateService
{
    Task<ApiResponse<IEnumerable<WeddingTemplateListDto>>> GetAllAsync();
}
