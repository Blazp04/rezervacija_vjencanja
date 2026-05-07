namespace RezervacijaVjencanja.DTOs.CatalogItems;

public sealed record CatalogItemDto(
    int Id,
    int PartnerId,
    string Name,
    string? Category,
    string? Description,
    string ItemType,
    decimal? BasePrice,
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
    string? Metadata);

public sealed record UpdateCatalogItemRequest(
    string Name,
    string? Category,
    string? Description,
    string ItemType,
    decimal? BasePrice,
    string? Metadata,
    bool IsActive,
    int SortOrder);
