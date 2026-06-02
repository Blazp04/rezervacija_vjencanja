using Microsoft.EntityFrameworkCore;
using RezervacijaVjencanja.Data.Seeds;
using RezervacijaVjencanja.Entities;

namespace RezervacijaVjencanja.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        await SeedPartnerTypesAsync(db);
        await SeedPartnersAsync(db);
        await SeedCatalogItemsAsync(db);
    }

    private static async Task SeedPartnerTypesAsync(AppDbContext db)
    {
        if (await db.PartnerTypes.AnyAsync()) return;

        var now = DateTime.UtcNow;
        db.PartnerTypes.AddRange(PartnerTypeSeed.Data.Select(e => new PartnerType
        {
            Name       = e.Name,
            Code       = e.Code,
            HasBooking = e.HasBooking,
            CreatedAt  = now,
        }));

        await db.SaveChangesAsync();
    }

    private static async Task SeedPartnersAsync(AppDbContext db)
    {
        if (await db.Partners.AnyAsync()) return;

        // Build Code -> Id lookup from what was just seeded
        var typeIdByCode = await db.PartnerTypes
            .ToDictionaryAsync(pt => pt.Code, pt => pt.Id);

        var now = DateTime.UtcNow;
        db.Partners.AddRange(PartnerSeed.Data.Select(e => new Partner
        {
            Name              = e.Name,
            PartnerTypeId     = typeIdByCode[e.PartnerTypeCode],
            CommissionPercent = e.CommissionPercent,
            IsActive          = true,
            CreatedAt         = now,
            UpdatedAt         = now,
        }));

        await db.SaveChangesAsync();
    }

    private static async Task SeedCatalogItemsAsync(AppDbContext db)
    {
        if (await db.PartnerCatalogItems.AnyAsync()) return;

        // Build Name -> Id lookup from what was just seeded
        var partnerIdByName = await db.Partners
            .ToDictionaryAsync(p => p.Name, p => p.Id);

        var now = DateTime.UtcNow;
        db.PartnerCatalogItems.AddRange(PartnerCatalogItemSeed.Data.Select(e => new PartnerCatalogItem
        {
            PartnerId  = partnerIdByName[e.PartnerName],
            Name       = e.Name,
            Category   = e.Category,
            ItemType   = e.ItemType,
            BasePrice  = e.BasePrice,
            IsActive   = true,
            SortOrder  = e.SortOrder,
            CreatedAt  = now,
        }));

        await db.SaveChangesAsync();
    }
}
