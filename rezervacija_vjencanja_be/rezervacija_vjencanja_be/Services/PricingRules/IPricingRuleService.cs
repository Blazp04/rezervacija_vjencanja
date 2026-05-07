using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.DTOs.PricingRules;

namespace RezervacijaVjencanja.Services.PricingRules;

public interface IPricingRuleService
{
    Task<ApiResponse<IEnumerable<PricingRuleDto>>> GetByCatalogItemIdAsync(int catalogItemId);
    Task<ApiResponse<PricingRuleDto>> CreateAsync(CreatePricingRuleRequest request);
    Task<ApiResponse<PricingRuleDto>> UpdateAsync(int id, UpdatePricingRuleRequest request);
    Task<ApiResponse<bool>> DeleteAsync(int id);
}
