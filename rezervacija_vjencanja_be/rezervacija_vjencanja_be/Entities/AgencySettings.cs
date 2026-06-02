namespace RezervacijaVjencanja.Entities;

/// <summary>Single-row table that holds agency-wide settings (Id is always 1).</summary>
public sealed class AgencySettings
{
    public int Id { get; set; } = 1;
    public string CompanyName { get; set; } = string.Empty;
    public string? Oib { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public DateTime UpdatedAt { get; set; }
}
