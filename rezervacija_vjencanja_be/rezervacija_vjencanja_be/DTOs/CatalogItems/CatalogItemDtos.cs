namespace RezervacijaVjencanja.DTOs.CatalogItems;

public sealed record CatalogItemDto(
    int Id,
    int PartnerId,
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

public sealed record CreateCatalogItemRequest(
    int PartnerId,
    string Name,
    string? Category,
    string? Description,
    string ItemType,
    decimal? BasePrice,
    decimal? PriceMin,
    decimal? PriceMax,
    string? Metadata);

public sealed record UpdateCatalogItemRequest(
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
