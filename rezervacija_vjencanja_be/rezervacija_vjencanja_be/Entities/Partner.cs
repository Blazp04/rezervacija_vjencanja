namespace RezervacijaVjencanja.Entities;

public sealed class Partner
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public int PartnerTypeId { get; set; }
    public decimal CommissionPercent { get; set; }
    public string? Notes { get; set; }
    public string? ExtraFields { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public PartnerType PartnerType { get; set; } = null!;
    public ICollection<PartnerCatalogItem> CatalogItems { get; set; } = [];
    public ICollection<BandMember> BandMembers { get; set; } = [];
}
