namespace RezervacijaVjencanja.GraphQL.Inputs;

public record CreatePartnerInput(
    string Name,
    int PartnerTypeId,
    string? Address,
    string? Phone,
    string? Email,
    string? Website,
    decimal CommissionPercent,
    string? Notes,
    string? ExtraFields);

public record UpdatePartnerInput(
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
