namespace RezervacijaVjencanja.DTOs.Weddings;

public sealed record WeddingListDto(
    int Id,
    string Name,
    DateTime DateTime,
    string? Location,
    string Status,
    string? TemplateName);

public sealed record WeddingDto(
    int Id,
    string Name,
    DateTime DateTime,
    string? Location,
    int? TemplateId,
    string? TemplateName,
    string Status,
    string? Notes,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public sealed record CreateWeddingRequest(
    string Name,
    DateTime DateTime,
    string? Location,
    int? TemplateId,
    string? Notes);

public sealed record UpdateWeddingRequest(
    string Name,
    DateTime DateTime,
    string? Location,
    int? TemplateId,
    string? Notes,
    string Status);
