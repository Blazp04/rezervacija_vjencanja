namespace RezervacijaVjencanja.GraphQL.Inputs;

public record CreatePartnerTypeInput(
    string Name,
    string Code,
    bool HasBooking,
    string? FieldSchema);

public record UpdatePartnerTypeInput(
    string Name,
    string Code,
    bool HasBooking,
    string? FieldSchema);
