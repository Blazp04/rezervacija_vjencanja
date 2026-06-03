using RezervacijaVjencanja.DTOs.WeddingTemplates;

namespace RezervacijaVjencanja.GraphQL.Inputs;

public record TemplatePartnerTypeInput(
    string TypeCode,
    bool Required);

public record CreateWeddingTemplateInput(
    string Name,
    string? Description,
    string? DefaultNotes,
    List<TemplatePartnerTypeInput>? RequiredPartnerTypes);

public record UpdateWeddingTemplateInput(
    string Name,
    string? Description,
    string? DefaultNotes,
    List<TemplatePartnerTypeInput>? RequiredPartnerTypes,
    bool IsActive);
