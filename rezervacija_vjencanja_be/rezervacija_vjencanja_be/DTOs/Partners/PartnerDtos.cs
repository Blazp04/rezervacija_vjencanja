namespace RezervacijaVjencanja.DTOs.Partners;

public sealed record PartnerListDto(
    int Id,
    string Name,
    string PartnerTypeCode,
    string PartnerTypeName,
    decimal CommissionPercent,
    bool IsActive);

public sealed record PartnerDto(
    int Id,
    string Name,
    string? Address,
    string? Phone,
    string? Email,
    string? Website,
    int PartnerTypeId,
    string PartnerTypeCode,
    string PartnerTypeName,
    decimal CommissionPercent,
    string? Notes,
    string? ExtraFields,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public sealed record CreatePartnerRequest(
    string Name,
    int PartnerTypeId,
    string? Address,
    string? Phone,
    string? Email,
    string? Website,
    decimal CommissionPercent,
    string? Notes,
    string? ExtraFields);

public sealed record UpdatePartnerRequest(
    string Name,
    int PartnerTypeId,
    string? Address,
    string? Phone,
    string? Email,
    string? Website,
    decimal CommissionPercent,
    string? Notes,
    string? ExtraFields,
    bool IsActive);
