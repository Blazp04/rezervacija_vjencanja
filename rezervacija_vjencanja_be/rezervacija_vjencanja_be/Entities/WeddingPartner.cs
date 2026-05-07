namespace RezervacijaVjencanja.Entities;

public sealed class WeddingPartner
{
    public int Id { get; set; }
    public int WeddingId { get; set; }
    public int PartnerId { get; set; }
    public int? CatalogItemId { get; set; }
    public string Status { get; set; } = "PROPOSED";
    public decimal? PlannedPrice { get; set; }
    public decimal? ActualPrice { get; set; }
    public decimal? CommissionPercent { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Wedding Wedding { get; set; } = null!;
    public Partner Partner { get; set; } = null!;
    public PartnerCatalogItem? CatalogItem { get; set; }
    public Booking? Booking { get; set; }
}
