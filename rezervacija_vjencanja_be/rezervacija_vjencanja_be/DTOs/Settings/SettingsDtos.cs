namespace RezervacijaVjencanja.DTOs.Settings;

public sealed record AgencySettingsDto(
    string CompanyName,
    string? Oib,
    string? Address,
    string? Phone,
    string? Email);

public sealed record UpdateAgencySettingsRequest(
    string CompanyName,
    string? Oib,
    string? Address,
    string? Phone,
    string? Email);
