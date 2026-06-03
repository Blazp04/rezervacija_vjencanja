namespace RezervacijaVjencanja.GraphQL.Inputs;

public record CreateBandMemberInput(
    int PartnerId,
    string Name,
    string? Role,
    string? Phone,
    string? Email);

public record UpdateBandMemberInput(
    string Name,
    string? Role,
    string? Phone,
    string? Email);
