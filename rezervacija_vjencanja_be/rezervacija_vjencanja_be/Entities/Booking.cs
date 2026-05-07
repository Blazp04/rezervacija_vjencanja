namespace RezervacijaVjencanja.Entities;

public sealed class Booking
{
    public int Id { get; set; }
    public int PartnerId { get; set; }
    public int WeddingId { get; set; }
    public int WeddingPartnerId { get; set; }
    public DateTime StartDateTime { get; set; }
    public DateTime EndDateTime { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }

    public Partner Partner { get; set; } = null!;
    public Wedding Wedding { get; set; } = null!;
    public WeddingPartner WeddingPartner { get; set; } = null!;
}
