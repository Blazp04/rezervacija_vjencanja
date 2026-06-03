namespace RezervacijaVjencanja.GraphQL.Inputs;

public record CreateWeddingInput(
    string Name,
    DateTime DateTime,
    string? Location,
    int? TemplateId,
    string? Notes);

public record UpdateWeddingInput(
    string Name,
    DateTime DateTime,
    string? Location,
    int? TemplateId,
    string? Notes,
    string Status);

public record ChangeWeddingStatusInput(
    int Id,
    string NewStatus);
