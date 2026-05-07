namespace RezervacijaVjencanja.Entities;

public sealed class PartnerType
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public bool HasBooking { get; set; }
    public string? FieldSchema { get; set; }
    public DateTime CreatedAt { get; set; }

    public ICollection<Partner> Partners { get; set; } = [];
}
