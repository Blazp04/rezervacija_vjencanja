using RezervacijaVjencanja.DTOs.BandMembers;
using RezervacijaVjencanja.DTOs.CatalogItems;
using RezervacijaVjencanja.DTOs.PartnerTypes;
using RezervacijaVjencanja.DTOs.Partners;
using RezervacijaVjencanja.DTOs.PricingRules;
using RezervacijaVjencanja.DTOs.Settings;
using RezervacijaVjencanja.DTOs.WeddingPartners;
using RezervacijaVjencanja.DTOs.WeddingTemplates;
using RezervacijaVjencanja.DTOs.Weddings;
using RezervacijaVjencanja.GraphQL.Inputs;
using RezervacijaVjencanja.Services.BandMembers;
using RezervacijaVjencanja.Services.CatalogItems;
using RezervacijaVjencanja.Services.PartnerTypes;
using RezervacijaVjencanja.Services.Partners;
using RezervacijaVjencanja.Services.PricingRules;
using RezervacijaVjencanja.Services.Settings;
using RezervacijaVjencanja.Services.WeddingPartners;
using RezervacijaVjencanja.Services.WeddingTemplates;
using RezervacijaVjencanja.Services.Weddings;

namespace RezervacijaVjencanja.GraphQL;

public class Mutation
{
    // ── Weddings ────────────────────────────────────────────────────────────────

    public async Task<MutationResult<WeddingDto>> CreateWedding(
        CreateWeddingInput input,
        [Service] IWeddingService service)
    {
        var request = new CreateWeddingRequest(
            input.Name, input.DateTime, input.Location, input.TemplateId, input.Notes);
        var result = await service.CreateAsync(request);
        return result.Error is not null
            ? new MutationResult<WeddingDto>(null, result.Error)
            : new MutationResult<WeddingDto>(result.Data, null);
    }

    public async Task<MutationResult<WeddingDto>> UpdateWedding(
        int id,
        UpdateWeddingInput input,
        [Service] IWeddingService service)
    {
        var request = new UpdateWeddingRequest(
            input.Name, input.DateTime, input.Location, input.TemplateId, input.Notes, input.Status);
        var result = await service.UpdateAsync(id, request);
        return result.Error is not null
            ? new MutationResult<WeddingDto>(null, result.Error)
            : new MutationResult<WeddingDto>(result.Data, null);
    }

    public async Task<MutationResult<WeddingDto>> ChangeWeddingStatus(
        int id,
        string newStatus,
        [Service] IWeddingService service)
    {
        var result = await service.ChangeStatusAsync(id, newStatus);
        return result.Error is not null
            ? new MutationResult<WeddingDto>(null, result.Error)
            : new MutationResult<WeddingDto>(result.Data, null);
    }

    public async Task<MutationResult<bool>> DeleteWedding(
        int id,
        [Service] IWeddingService service)
    {
        var result = await service.DeleteAsync(id);
        return result.Error is not null
            ? new MutationResult<bool>(false, result.Error)
            : new MutationResult<bool>(result.Data, null);
    }

    // ── Wedding Templates ───────────────────────────────────────────────────────

    public async Task<MutationResult<WeddingTemplateDto>> CreateWeddingTemplate(
        CreateWeddingTemplateInput input,
        [Service] IWeddingTemplateService service)
    {
        var request = new CreateWeddingTemplateRequest(
            input.Name,
            input.Description,
            input.DefaultNotes,
            input.RequiredPartnerTypes?
                .Select(x => new TemplatePartnerTypeDto(x.TypeCode, x.Required))
                .ToList());
        var result = await service.CreateAsync(request);
        return result.Error is not null
            ? new MutationResult<WeddingTemplateDto>(null, result.Error)
            : new MutationResult<WeddingTemplateDto>(result.Data, null);
    }

    public async Task<MutationResult<WeddingTemplateDto>> UpdateWeddingTemplate(
        int id,
        UpdateWeddingTemplateInput input,
        [Service] IWeddingTemplateService service)
    {
        var request = new UpdateWeddingTemplateRequest(
            input.Name,
            input.Description,
            input.DefaultNotes,
            input.RequiredPartnerTypes?
                .Select(x => new TemplatePartnerTypeDto(x.TypeCode, x.Required))
                .ToList(),
            input.IsActive);
        var result = await service.UpdateAsync(id, request);
        return result.Error is not null
            ? new MutationResult<WeddingTemplateDto>(null, result.Error)
            : new MutationResult<WeddingTemplateDto>(result.Data, null);
    }

    public async Task<MutationResult<bool>> DeleteWeddingTemplate(
        int id,
        [Service] IWeddingTemplateService service)
    {
        var result = await service.DeleteAsync(id);
        return result.Error is not null
            ? new MutationResult<bool>(false, result.Error)
            : new MutationResult<bool>(result.Data, null);
    }

    // ── Partner Types ───────────────────────────────────────────────────────────

    public async Task<MutationResult<PartnerTypeDto>> CreatePartnerType(
        CreatePartnerTypeInput input,
        [Service] IPartnerTypeService service)
    {
        var request = new CreatePartnerTypeRequest(input.Name, input.Code, input.HasBooking, input.FieldSchema);
        var result = await service.CreateAsync(request);
        return result.Error is not null
            ? new MutationResult<PartnerTypeDto>(null, result.Error)
            : new MutationResult<PartnerTypeDto>(result.Data, null);
    }

    public async Task<MutationResult<PartnerTypeDto>> UpdatePartnerType(
        int id,
        UpdatePartnerTypeInput input,
        [Service] IPartnerTypeService service)
    {
        var request = new UpdatePartnerTypeRequest(input.Name, input.Code, input.HasBooking, input.FieldSchema);
        var result = await service.UpdateAsync(id, request);
        return result.Error is not null
            ? new MutationResult<PartnerTypeDto>(null, result.Error)
            : new MutationResult<PartnerTypeDto>(result.Data, null);
    }

    public async Task<MutationResult<bool>> DeletePartnerType(
        int id,
        [Service] IPartnerTypeService service)
    {
        var result = await service.DeleteAsync(id);
        return result.Error is not null
            ? new MutationResult<bool>(false, result.Error)
            : new MutationResult<bool>(result.Data, null);
    }

    // ── Partners ────────────────────────────────────────────────────────────────

    public async Task<MutationResult<PartnerDto>> CreatePartner(
        CreatePartnerInput input,
        [Service] IPartnerService service)
    {
        var request = new CreatePartnerRequest(
            input.Name, input.PartnerTypeId, input.Address, input.Phone,
            input.Email, input.Website, input.CommissionPercent, input.Notes, input.ExtraFields);
        var result = await service.CreateAsync(request);
        return result.Error is not null
            ? new MutationResult<PartnerDto>(null, result.Error)
            : new MutationResult<PartnerDto>(result.Data, null);
    }

    public async Task<MutationResult<PartnerDto>> UpdatePartner(
        int id,
        UpdatePartnerInput input,
        [Service] IPartnerService service)
    {
        var request = new UpdatePartnerRequest(
            input.Name, input.PartnerTypeId, input.Address, input.Phone,
            input.Email, input.Website, input.CommissionPercent, input.Notes, input.ExtraFields, input.IsActive);
        var result = await service.UpdateAsync(id, request);
        return result.Error is not null
            ? new MutationResult<PartnerDto>(null, result.Error)
            : new MutationResult<PartnerDto>(result.Data, null);
    }

    public async Task<MutationResult<bool>> DeletePartner(
        int id,
        [Service] IPartnerService service)
    {
        var result = await service.DeleteAsync(id);
        return result.Error is not null
            ? new MutationResult<bool>(false, result.Error)
            : new MutationResult<bool>(result.Data, null);
    }

    public async Task<MutationResult<PartnerDto>> ClonePartner(
        int id,
        [Service] IPartnerService service)
    {
        var result = await service.CloneAsync(id);
        return result.Error is not null
            ? new MutationResult<PartnerDto>(null, result.Error)
            : new MutationResult<PartnerDto>(result.Data, null);
    }

    // ── Catalog Items ───────────────────────────────────────────────────────────

    public async Task<MutationResult<CatalogItemDto>> CreateCatalogItem(
        CreateCatalogItemInput input,
        [Service] ICatalogItemService service)
    {
        var request = new CreateCatalogItemRequest(
            input.PartnerId, input.Name, input.Category, input.Description,
            input.ItemType, input.BasePrice, input.PriceMin, input.PriceMax, input.Metadata);
        var result = await service.CreateAsync(request);
        return result.Error is not null
            ? new MutationResult<CatalogItemDto>(null, result.Error)
            : new MutationResult<CatalogItemDto>(result.Data, null);
    }

    public async Task<MutationResult<CatalogItemDto>> UpdateCatalogItem(
        int id,
        UpdateCatalogItemInput input,
        [Service] ICatalogItemService service)
    {
        var request = new UpdateCatalogItemRequest(
            input.Name, input.Category, input.Description, input.ItemType,
            input.BasePrice, input.PriceMin, input.PriceMax, input.Metadata, input.IsActive, input.SortOrder);
        var result = await service.UpdateAsync(id, request);
        return result.Error is not null
            ? new MutationResult<CatalogItemDto>(null, result.Error)
            : new MutationResult<CatalogItemDto>(result.Data, null);
    }

    public async Task<MutationResult<bool>> DeleteCatalogItem(
        int id,
        [Service] ICatalogItemService service)
    {
        var result = await service.DeleteAsync(id);
        return result.Error is not null
            ? new MutationResult<bool>(false, result.Error)
            : new MutationResult<bool>(result.Data, null);
    }

    // ── Pricing Rules ───────────────────────────────────────────────────────────

    public async Task<MutationResult<PricingRuleDto>> CreatePricingRule(
        CreatePricingRuleInput input,
        [Service] IPricingRuleService service)
    {
        var request = new CreatePricingRuleRequest(
            input.CatalogItemId, input.RuleType, input.DayOfWeek,
            input.SpecificDate, input.Price, input.ValidFrom, input.ValidTo);
        var result = await service.CreateAsync(request);
        return result.Error is not null
            ? new MutationResult<PricingRuleDto>(null, result.Error)
            : new MutationResult<PricingRuleDto>(result.Data, null);
    }

    public async Task<MutationResult<PricingRuleDto>> UpdatePricingRule(
        int id,
        UpdatePricingRuleInput input,
        [Service] IPricingRuleService service)
    {
        var request = new UpdatePricingRuleRequest(
            input.RuleType, input.DayOfWeek, input.SpecificDate,
            input.Price, input.ValidFrom, input.ValidTo);
        var result = await service.UpdateAsync(id, request);
        return result.Error is not null
            ? new MutationResult<PricingRuleDto>(null, result.Error)
            : new MutationResult<PricingRuleDto>(result.Data, null);
    }

    public async Task<MutationResult<bool>> DeletePricingRule(
        int id,
        [Service] IPricingRuleService service)
    {
        var result = await service.DeleteAsync(id);
        return result.Error is not null
            ? new MutationResult<bool>(false, result.Error)
            : new MutationResult<bool>(result.Data, null);
    }

    // ── Band Members ────────────────────────────────────────────────────────────

    public async Task<MutationResult<BandMemberDto>> CreateBandMember(
        CreateBandMemberInput input,
        [Service] IBandMemberService service)
    {
        var request = new CreateBandMemberRequest(input.Name, input.Role, input.Phone, input.Email);
        var result = await service.CreateAsync(input.PartnerId, request);
        return result.Error is not null
            ? new MutationResult<BandMemberDto>(null, result.Error)
            : new MutationResult<BandMemberDto>(result.Data, null);
    }

    public async Task<MutationResult<BandMemberDto>> UpdateBandMember(
        int partnerId,
        int memberId,
        UpdateBandMemberInput input,
        [Service] IBandMemberService service)
    {
        var request = new UpdateBandMemberRequest(input.Name, input.Role, input.Phone, input.Email);
        var result = await service.UpdateAsync(partnerId, memberId, request);
        return result.Error is not null
            ? new MutationResult<BandMemberDto>(null, result.Error)
            : new MutationResult<BandMemberDto>(result.Data, null);
    }

    public async Task<MutationResult<bool>> DeleteBandMember(
        int partnerId,
        int memberId,
        [Service] IBandMemberService service)
    {
        var result = await service.DeleteAsync(partnerId, memberId);
        return result.Error is not null
            ? new MutationResult<bool>(false, result.Error)
            : new MutationResult<bool>(result.Data, null);
    }

    // ── Wedding Partners ────────────────────────────────────────────────────────

    public async Task<MutationResult<WeddingPartnerDto>> AddWeddingPartner(
        CreateWeddingPartnerInput input,
        [Service] IWeddingPartnerService service)
    {
        var request = new CreateWeddingPartnerRequest(input.PartnerId, input.CatalogItemId, input.Notes);
        var result = await service.AddAsync(input.WeddingId, request);
        return result.Error is not null
            ? new MutationResult<WeddingPartnerDto>(null, result.Error)
            : new MutationResult<WeddingPartnerDto>(result.Data, null);
    }

    public async Task<MutationResult<WeddingPartnerDto>> UpdateWeddingPartner(
        int weddingId,
        int wpId,
        UpdateWeddingPartnerInput input,
        [Service] IWeddingPartnerService service)
    {
        var request = new UpdateWeddingPartnerRequest(input.CatalogItemId, input.Notes);
        var result = await service.UpdateAsync(weddingId, wpId, request);
        return result.Error is not null
            ? new MutationResult<WeddingPartnerDto>(null, result.Error)
            : new MutationResult<WeddingPartnerDto>(result.Data, null);
    }

    public async Task<MutationResult<bool>> RemoveWeddingPartner(
        int weddingId,
        int wpId,
        [Service] IWeddingPartnerService service)
    {
        var result = await service.RemoveAsync(weddingId, wpId);
        return result.Error is not null
            ? new MutationResult<bool>(false, result.Error)
            : new MutationResult<bool>(result.Data, null);
    }

    public async Task<MutationResult<WeddingPartnerDto>> UpdateWeddingPartnerStatus(
        int weddingId,
        int wpId,
        UpdateWeddingPartnerStatusInput input,
        [Service] IWeddingPartnerService service)
    {
        var request = new UpdateWeddingPartnerStatusRequest(input.Status);
        var result = await service.UpdateStatusAsync(weddingId, wpId, request);
        return result.Error is not null
            ? new MutationResult<WeddingPartnerDto>(null, result.Error)
            : new MutationResult<WeddingPartnerDto>(result.Data, null);
    }

    public async Task<MutationResult<WeddingPartnerDto>> ConfirmWeddingPartner(
        int weddingId,
        int wpId,
        ConfirmWeddingPartnerInput input,
        [Service] IWeddingPartnerService service)
    {
        var request = new ConfirmWeddingPartnerRequest(
            input.ActualPrice, input.StartDateTime, input.EndDateTime, input.Notes);
        var result = await service.ConfirmAsync(weddingId, wpId, request);
        return result.Error is not null
            ? new MutationResult<WeddingPartnerDto>(null, result.Error)
            : new MutationResult<WeddingPartnerDto>(result.Data, null);
    }

    // ── Settings ────────────────────────────────────────────────────────────────

    public async Task<MutationResult<AgencySettingsDto>> UpdateAgencySettings(
        UpdateAgencySettingsInput input,
        [Service] ISettingsService service)
    {
        var request = new UpdateAgencySettingsRequest(
            input.CompanyName, input.Oib, input.Address, input.Phone, input.Email);
        var result = await service.UpdateAsync(request);
        return result.Error is not null
            ? new MutationResult<AgencySettingsDto>(null, result.Error)
            : new MutationResult<AgencySettingsDto>(result.Data, null);
    }
}
