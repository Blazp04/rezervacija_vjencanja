namespace RezervacijaVjencanja.GraphQL.Inputs;

public record CreateWeddingPartnerInput(
    int WeddingId,
    int PartnerId,
    int? CatalogItemId,
    string? Notes);

public record UpdateWeddingPartnerInput(
    int? CatalogItemId,
    string? Notes);

public record UpdateWeddingPartnerStatusInput(
    string Status);

public record ConfirmWeddingPartnerInput(
    decimal ActualPrice,
    DateTime StartDateTime,
    DateTime EndDateTime,
    string? Notes);
