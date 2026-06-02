namespace RezervacijaVjencanja.Entities;

public sealed class PartnerCatalogItem
{
    public int Id { get; set; }
    public int PartnerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? Description { get; set; }
    public string ItemType { get; set; } = "SERVICE";
    public decimal? BasePrice { get; set; }
    public decimal? PriceMin { get; set; }
    public decimal? PriceMax { get; set; }
    public string? Metadata { get; set; }
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; }

    public Partner Partner { get; set; } = null!;
    public ICollection<PricingRule> PricingRules { get; set; } = [];
}
