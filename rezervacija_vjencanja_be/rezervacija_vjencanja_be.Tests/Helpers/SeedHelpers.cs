using RezervacijaVjencanja.Data;
using RezervacijaVjencanja.Entities;

namespace RezervacijaVjencanja.Tests.Helpers;




public static class SeedHelpers
{
    public static PartnerType AddPartnerType(
        AppDbContext db,
        string name = "Band",
        string code = "BAND",
        bool hasBooking = true)
    {
        var pt = new PartnerType
        {
            Name = name,
            Code = code,
            HasBooking = hasBooking,
            CreatedAt = DateTime.UtcNow
        };
        db.PartnerTypes.Add(pt);
        db.SaveChanges();
        return pt;
    }

    public static Partner AddPartner(
        AppDbContext db,
        int partnerTypeId,
        string name = "Test Partner",
        decimal commission = 10m,
        bool isActive = true)
    {
        var p = new Partner
        {
            Name = name,
            PartnerTypeId = partnerTypeId,
            CommissionPercent = commission,
            IsActive = isActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        db.Partners.Add(p);
        db.SaveChanges();
        return p;
    }

    public static WeddingTemplate AddTemplate(AppDbContext db, string name = "Classic")
    {
        var t = new WeddingTemplate
        {
            Name = name,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        db.WeddingTemplates.Add(t);
        db.SaveChanges();
        return t;
    }

    public static Wedding AddWedding(
        AppDbContext db,
        string name = "Test Wedding",
        string status = "PREPARATION",
        DateTime? dateTime = null,
        int? templateId = null)
    {
        var w = new Wedding
        {
            Name = name,
            DateTime = dateTime ?? DateTime.UtcNow.AddMonths(3),
            Status = status,
            TemplateId = templateId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        db.Weddings.Add(w);
        db.SaveChanges();
        return w;
    }

    public static PartnerCatalogItem AddCatalogItem(
        AppDbContext db,
        int partnerId,
        string name = "Live Music",
        string itemType = "SERVICE",
        decimal? basePrice = 1000m)
    {
        var ci = new PartnerCatalogItem
        {
            PartnerId = partnerId,
            Name = name,
            ItemType = itemType,
            BasePrice = basePrice,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        db.PartnerCatalogItems.Add(ci);
        db.SaveChanges();
        return ci;
    }

    public static WeddingPartner AddWeddingPartner(
        AppDbContext db,
        int weddingId,
        int partnerId,
        string status = "PROPOSED",
        int? catalogItemId = null,
        decimal? commissionPercent = 10m)
    {
        var wp = new WeddingPartner
        {
            WeddingId = weddingId,
            PartnerId = partnerId,
            CatalogItemId = catalogItemId,
            Status = status,
            CommissionPercent = commissionPercent,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        db.WeddingPartners.Add(wp);
        db.SaveChanges();
        return wp;
    }
}
