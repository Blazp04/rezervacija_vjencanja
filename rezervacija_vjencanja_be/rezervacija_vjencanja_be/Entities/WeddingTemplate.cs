namespace RezervacijaVjencanja.Entities;

public sealed class WeddingTemplate
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? RequiredPartnerTypes { get; set; }
    public string? DefaultNotes { get; set; }
    public string? ActivityOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }

    public ICollection<Wedding> Weddings { get; set; } = [];
}
