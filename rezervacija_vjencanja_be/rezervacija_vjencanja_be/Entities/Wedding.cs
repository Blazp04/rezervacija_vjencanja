namespace RezervacijaVjencanja.Entities;

public sealed class Wedding
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime DateTime { get; set; }
    public string? Location { get; set; }
    public int? TemplateId { get; set; }
    public string Status { get; set; } = "PREPARATION";
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public WeddingTemplate? Template { get; set; }
    public ICollection<WeddingPartner> WeddingPartners { get; set; } = [];
}
