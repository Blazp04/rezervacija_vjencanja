namespace RezervacijaVjencanja.GraphQL.Inputs;

public record UpdateAgencySettingsInput(
    string CompanyName,
    string? Oib,
    string? Address,
    string? Phone,
    string? Email);
