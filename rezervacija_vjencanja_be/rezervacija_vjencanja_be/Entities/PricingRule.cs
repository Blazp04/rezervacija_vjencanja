namespace RezervacijaVjencanja.Entities;

public sealed class PricingRule
{
    public int Id { get; set; }
    public int CatalogItemId { get; set; }
    public string RuleType { get; set; } = string.Empty;
    public byte? DayOfWeek { get; set; }
    public DateOnly? SpecificDate { get; set; }
    public decimal Price { get; set; }
    public DateOnly? ValidFrom { get; set; }
    public DateOnly? ValidTo { get; set; }

    public PartnerCatalogItem CatalogItem { get; set; } = null!;
}
