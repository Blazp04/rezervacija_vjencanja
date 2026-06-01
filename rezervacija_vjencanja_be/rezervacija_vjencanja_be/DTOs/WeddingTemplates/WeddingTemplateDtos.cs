namespace RezervacijaVjencanja.DTOs.WeddingTemplates;

public sealed record WeddingTemplateListDto(
    int Id,
    string Name,
    string? Description,
    int RequiredPartnerTypesCount);

public sealed record WeddingTemplateDto(
    int Id,
    string Name,
    string? Description,
    string? DefaultNotes,
    List<TemplatePartnerTypeDto> RequiredPartnerTypes,
    bool IsActive,
    DateTime CreatedAt);

public sealed record TemplatePartnerTypeDto(
    string TypeCode,
    bool Required);

public sealed record CreateWeddingTemplateRequest(
    string Name,
    string? Description,
    string? DefaultNotes,
    List<TemplatePartnerTypeDto>? RequiredPartnerTypes);

public sealed record UpdateWeddingTemplateRequest(
    string Name,
    string? Description,
    string? DefaultNotes,
    List<TemplatePartnerTypeDto>? RequiredPartnerTypes,
    bool IsActive);