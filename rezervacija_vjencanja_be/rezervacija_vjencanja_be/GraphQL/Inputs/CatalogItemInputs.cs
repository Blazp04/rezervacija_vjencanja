namespace RezervacijaVjencanja.GraphQL.Inputs;

public record CreateCatalogItemInput(
    int PartnerId,
    string Name,
    string? Category,
    string? Description,
    string ItemType,
    decimal? BasePrice,
    decimal? PriceMin,
    decimal? PriceMax,
    string? Metadata);

public record UpdateCatalogItemInput(
    string Name,
    string? Category,
    string? Description,
    string ItemType,
    decimal? BasePrice,
    decimal? PriceMin,
    decimal? PriceMax,
    string? Metadata,
    bool IsActive,
    int SortOrder);
