namespace RezervacijaVjencanja.DTOs.WeddingPartners;

public sealed record WeddingPartnerDto(
    int Id,
    int WeddingId,
    int PartnerId,
    string PartnerName,
    string PartnerTypeCode,
    string PartnerTypeName,
    int? CatalogItemId,
    string? CatalogItemName,
    string Status,
    decimal? PlannedPrice,
    decimal? ActualPrice,
    decimal? CommissionPercent,
    decimal? CommissionAmount,
    decimal? ClientPrice,
    string? Notes,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public sealed record CreateWeddingPartnerRequest(
    int PartnerId,
    int? CatalogItemId,
    string? Notes);

public sealed record UpdateWeddingPartnerRequest(
    int? CatalogItemId,
    string? Notes);

public sealed record UpdateWeddingPartnerStatusRequest(string Status);

public sealed record ConfirmWeddingPartnerRequest(
    decimal ActualPrice,
    DateTime StartDateTime,
    DateTime EndDateTime,
    string? Notes);

public sealed record PricingResultDto(
    decimal BasePrice,
    string AppliedRule,
    decimal CalculatedPrice,
    string RuleDescription);

public sealed record ConflictErrorDto(
    string Message,
    string ConflictingWeddingName,
    DateTime ConflictingWeddingDate,
    DateTime ConflictStart,
    DateTime ConflictEnd);
