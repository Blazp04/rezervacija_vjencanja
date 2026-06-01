using Microsoft.EntityFrameworkCore;
using RezervacijaVjencanja.Entities;

namespace RezervacijaVjencanja.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<PartnerType> PartnerTypes => Set<PartnerType>();
    public DbSet<Partner> Partners => Set<Partner>();
    public DbSet<PartnerCatalogItem> PartnerCatalogItems => Set<PartnerCatalogItem>();
    public DbSet<PricingRule> PricingRules => Set<PricingRule>();
    public DbSet<BandMember> BandMembers => Set<BandMember>();
    public DbSet<WeddingTemplate> WeddingTemplates => Set<WeddingTemplate>();
    public DbSet<Wedding> Weddings => Set<Wedding>();
    public DbSet<WeddingPartner> WeddingPartners => Set<WeddingPartner>();
    public DbSet<Booking> Bookings => Set<Booking>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── PartnerTypes ────────────────────────────────────────────────────────
        modelBuilder.Entity<PartnerType>(entity =>
        {
            entity.ToTable("PartnerTypes", t =>
                t.HasCheckConstraint("CHK_PartnerTypes_JSON", "FieldSchema IS NULL OR ISJSON(FieldSchema) = 1"));

            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(50).HasDefaultValue(string.Empty);
            entity.Property(e => e.HasBooking).IsRequired().HasDefaultValue(false);
            entity.Property(e => e.FieldSchema).HasColumnType("nvarchar(max)");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");

            entity.HasIndex(e => e.Name).IsUnique();
            entity.HasIndex(e => e.Code).IsUnique().HasDatabaseName("UQ_PartnerTypes_Code");

            entity.HasData(
                new PartnerType { Id = 1, Name = "Bend / DJ",            Code = "BAND",         HasBooking = true,  CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new PartnerType { Id = 2, Name = "Cvjećar",              Code = "FLORIST",      HasBooking = false, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new PartnerType { Id = 3, Name = "Slastičar",            Code = "PASTRY",       HasBooking = false, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new PartnerType { Id = 4, Name = "Fotograf / Snimatelj", Code = "PHOTOGRAPHER", HasBooking = true,  CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new PartnerType { Id = 5, Name = "Sala / Dvorana",       Code = "VENUE",        HasBooking = true,  CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new PartnerType { Id = 6, Name = "Catering",             Code = "CATERING",     HasBooking = false, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new PartnerType { Id = 7, Name = "Ostalo",               Code = "GENERIC",      HasBooking = false, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
            );
        });

        // ── Partners ────────────────────────────────────────────────────────────
        modelBuilder.Entity<Partner>(entity =>
        {
            entity.ToTable("Partners", t =>
            {
                t.HasCheckConstraint("CHK_Partners_Commission",      "CommissionPercent >= 0 AND CommissionPercent <= 100");
                t.HasCheckConstraint("CHK_Partners_ExtraFields_JSON", "ExtraFields IS NULL OR ISJSON(ExtraFields) = 1");
            });

            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Address).HasMaxLength(500);
            entity.Property(e => e.Phone).HasMaxLength(50);
            entity.Property(e => e.Email).HasMaxLength(200);
            entity.Property(e => e.Website).HasMaxLength(500);
            entity.Property(e => e.CommissionPercent).HasColumnType("decimal(5,2)").HasDefaultValue(0m);
            entity.Property(e => e.Notes).HasColumnType("nvarchar(max)");
            entity.Property(e => e.ExtraFields).HasColumnType("nvarchar(max)");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETDATE()");

            entity.HasOne(e => e.PartnerType)
                  .WithMany(pt => pt.Partners)
                  .HasForeignKey(e => e.PartnerTypeId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.PartnerTypeId).HasDatabaseName("IX_Partners_PartnerTypeId");
            entity.HasIndex(e => e.IsActive).HasDatabaseName("IX_Partners_IsActive");

            entity.HasData(
                new Partner { Id = 1, Name = "Luminous Band", PartnerTypeId = 1, CommissionPercent = 15m, IsActive = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Partner { Id = 2, Name = "DJ Stefan", PartnerTypeId = 1, CommissionPercent = 12m, IsActive = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Partner { Id = 3, Name = "Cvjetni Raj", PartnerTypeId = 2, CommissionPercent = 10m, IsActive = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Partner { Id = 4, Name = "Slastica Marija", PartnerTypeId = 3, CommissionPercent = 8m, IsActive = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Partner { Id = 5, Name = "FotoStudio Plus", PartnerTypeId = 4, CommissionPercent = 20m, IsActive = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
            );
        });

        // ── PartnerCatalogItems ─────────────────────────────────────────────────
        modelBuilder.Entity<PartnerCatalogItem>(entity =>
        {
            entity.ToTable("PartnerCatalogItems", t =>
            {
                t.HasCheckConstraint("CHK_PartnerCatalogItems_ItemType",  "ItemType IN ('SERVICE', 'PRODUCT', 'SONG')");
                t.HasCheckConstraint("CHK_PartnerCatalogItems_BasePrice", "BasePrice IS NULL OR BasePrice >= 0");
                t.HasCheckConstraint("CHK_PartnerCatalogItems_Metadata",  "Metadata IS NULL OR ISJSON(Metadata) = 1");
            });

            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Category).HasMaxLength(100);
            entity.Property(e => e.Description).HasColumnType("nvarchar(max)");
            entity.Property(e => e.ItemType).IsRequired().HasMaxLength(20).HasDefaultValue("SERVICE");
            entity.Property(e => e.BasePrice).HasColumnType("decimal(10,2)");
            entity.Property(e => e.Metadata).HasColumnType("nvarchar(max)");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.SortOrder).HasDefaultValue(0);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");

            entity.HasOne(e => e.Partner)
                  .WithMany(p => p.CatalogItems)
                  .HasForeignKey(e => e.PartnerId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.PartnerId).HasDatabaseName("IX_PartnerCatalogItems_PartnerId");
            entity.HasIndex(e => e.ItemType).HasDatabaseName("IX_PartnerCatalogItems_ItemType");
            entity.HasIndex(e => e.IsActive).HasDatabaseName("IX_PartnerCatalogItems_IsActive");

            entity.HasData(
                // Luminous Band (Partner 1)
                new PartnerCatalogItem { Id = 1, PartnerId = 1, Name = "4-satna svirka", Category = "Bend", ItemType = "SERVICE", BasePrice = 800m, IsActive = true, SortOrder = 1, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new PartnerCatalogItem { Id = 2, PartnerId = 1, Name = "6-satna svirka", Category = "Bend", ItemType = "SERVICE", BasePrice = 1200m, IsActive = true, SortOrder = 2, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new PartnerCatalogItem { Id = 3, PartnerId = 1, Name = "DJ za plesnu muziku", Category = "DJ", ItemType = "SERVICE", BasePrice = 500m, IsActive = true, SortOrder = 3, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                // DJ Stefan (Partner 2)
                new PartnerCatalogItem { Id = 4, PartnerId = 2, Name = "DJ svirka (4h)", Category = "DJ", ItemType = "SERVICE", BasePrice = 600m, IsActive = true, SortOrder = 1, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new PartnerCatalogItem { Id = 5, PartnerId = 2, Name = "DJ svirka (8h)", Category = "DJ", ItemType = "SERVICE", BasePrice = 1000m, IsActive = true, SortOrder = 2, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                // Cvjetni Raj (Partner 3 - Florist)
                new PartnerCatalogItem { Id = 6, PartnerId = 3, Name = "Dekoracija sale", Category = "Dekoracija", ItemType = "SERVICE", BasePrice = 1500m, IsActive = true, SortOrder = 1, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new PartnerCatalogItem { Id = 7, PartnerId = 3, Name = "Cvjetni aranžman za stol", Category = "Cvijeće", ItemType = "PRODUCT", BasePrice = 150m, IsActive = true, SortOrder = 2, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                // Slastica Marija (Partner 4 - Pastry)
                new PartnerCatalogItem { Id = 8, PartnerId = 4, Name = "Torta sa jagodama", Category = "Torte", ItemType = "SERVICE", BasePrice = 400m, IsActive = true, SortOrder = 1, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new PartnerCatalogItem { Id = 9, PartnerId = 4, Name = "Kolačići (1kg)", Category = "Kolačići", ItemType = "PRODUCT", BasePrice = 100m, IsActive = true, SortOrder = 2, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                // FotoStudio Plus (Partner 5 - Photographer)
                new PartnerCatalogItem { Id = 10, PartnerId = 5, Name = "Fotografiranje (8h)", Category = "Fotografija", ItemType = "SERVICE", BasePrice = 2000m, IsActive = true, SortOrder = 1, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new PartnerCatalogItem { Id = 11, PartnerId = 5, Name = "Foto album (100 str)", Category = "Proizvodi", ItemType = "PRODUCT", BasePrice = 500m, IsActive = true, SortOrder = 2, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
            );
        });

        // ── PricingRules ────────────────────────────────────────────────────────
        modelBuilder.Entity<PricingRule>(entity =>
        {
            entity.ToTable("PricingRules", t =>
            {
                t.HasCheckConstraint("CHK_PricingRules_RuleType",  "RuleType IN ('SPECIAL_DAY', 'SPECIFIC_DATE')");
                t.HasCheckConstraint("CHK_PricingRules_Price",     "Price >= 0");
                t.HasCheckConstraint("CHK_PricingRules_DayOfWeek", "DayOfWeek IS NULL OR (DayOfWeek >= 1 AND DayOfWeek <= 7)");
                t.HasCheckConstraint("CHK_PricingRules_DateRange", "ValidFrom IS NULL OR ValidTo IS NULL OR ValidFrom <= ValidTo");
            });

            entity.HasKey(e => e.Id);
            entity.Property(e => e.RuleType).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Price).HasColumnType("decimal(10,2)");

            entity.HasOne(e => e.CatalogItem)
                  .WithMany(c => c.PricingRules)
                  .HasForeignKey(e => e.CatalogItemId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.CatalogItemId).HasDatabaseName("IX_PricingRules_CatalogItemId");
            entity.HasIndex(e => e.RuleType).HasDatabaseName("IX_PricingRules_RuleType");
        });

        // ── BandMembers ─────────────────────────────────────────────────────────
        modelBuilder.Entity<BandMember>(entity =>
        {
            entity.ToTable("BandMembers");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Role).HasMaxLength(100);
            entity.Property(e => e.Phone).HasMaxLength(50);
            entity.Property(e => e.Email).HasMaxLength(200);

            entity.HasOne(e => e.Partner)
                  .WithMany(p => p.BandMembers)
                  .HasForeignKey(e => e.PartnerId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.PartnerId).HasDatabaseName("IX_BandMembers_PartnerId");
        });

        // ── WeddingTemplates ────────────────────────────────────────────────────
        modelBuilder.Entity<WeddingTemplate>(entity =>
        {
            entity.ToTable("WeddingTemplates", t =>
            {
                t.HasCheckConstraint("CHK_WeddingTemplates_PartnerTypes_JSON",  "RequiredPartnerTypes IS NULL OR ISJSON(RequiredPartnerTypes) = 1");
                t.HasCheckConstraint("CHK_WeddingTemplates_ActivityOrder_JSON", "ActivityOrder IS NULL OR ISJSON(ActivityOrder) = 1");
            });

            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasColumnType("nvarchar(max)");
            entity.Property(e => e.RequiredPartnerTypes).HasColumnType("nvarchar(max)");
            entity.Property(e => e.DefaultNotes).HasColumnType("nvarchar(max)");
            entity.Property(e => e.ActivityOrder).HasColumnType("nvarchar(max)");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
        });

        // ── Weddings ────────────────────────────────────────────────────────────
        modelBuilder.Entity<Wedding>(entity =>
        {
            entity.ToTable("Weddings", t =>
                t.HasCheckConstraint("CHK_Weddings_Status", "Status IN ('PREPARATION', 'CONFIRMED', 'COMPLETED', 'CANCELLED')"));

            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Location).HasMaxLength(500);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(50).HasDefaultValue("PREPARATION");
            entity.Property(e => e.Notes).HasColumnType("nvarchar(max)");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETDATE()");

            entity.HasOne(e => e.Template)
                  .WithMany(t => t.Weddings)
                  .HasForeignKey(e => e.TemplateId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.Status).HasDatabaseName("IX_Weddings_Status");
            entity.HasIndex(e => e.DateTime).HasDatabaseName("IX_Weddings_DateTime");
        });

        // ── WeddingPartners ─────────────────────────────────────────────────────
        modelBuilder.Entity<WeddingPartner>(entity =>
        {
            entity.ToTable("WeddingPartners", t =>
            {
                t.HasCheckConstraint("CHK_WeddingPartners_Status",            "Status IN ('PROPOSED', 'OFFERED', 'CONFIRMED', 'CANCELLED')");
                t.HasCheckConstraint("CHK_WeddingPartners_ActualPrice",       "ActualPrice IS NULL OR ActualPrice >= 0");
                t.HasCheckConstraint("CHK_WeddingPartners_CommissionPercent", "CommissionPercent IS NULL OR (CommissionPercent >= 0 AND CommissionPercent <= 100)");
            });

            entity.HasKey(e => e.Id);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(50).HasDefaultValue("PROPOSED");
            entity.Property(e => e.PlannedPrice).HasColumnType("decimal(10,2)");
            entity.Property(e => e.ActualPrice).HasColumnType("decimal(10,2)");
            entity.Property(e => e.CommissionPercent).HasColumnType("decimal(5,2)");
            entity.Property(e => e.Notes).HasColumnType("nvarchar(max)");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETDATE()");

            entity.HasOne(e => e.Wedding)
                  .WithMany(w => w.WeddingPartners)
                  .HasForeignKey(e => e.WeddingId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Partner)
                  .WithMany()
                  .HasForeignKey(e => e.PartnerId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.CatalogItem)
                  .WithMany()
                  .HasForeignKey(e => e.CatalogItemId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.WeddingId).HasDatabaseName("IX_WeddingPartners_WeddingId");
            entity.HasIndex(e => e.PartnerId).HasDatabaseName("IX_WeddingPartners_PartnerId");
            entity.HasIndex(e => e.Status).HasDatabaseName("IX_WeddingPartners_Status");
        });

        // ── Bookings ────────────────────────────────────────────────────────────
        modelBuilder.Entity<Booking>(entity =>
        {
            entity.ToTable("Bookings", t =>
                t.HasCheckConstraint("CHK_Bookings_DateRange", "EndDateTime > StartDateTime"));

            entity.HasKey(e => e.Id);
            entity.Property(e => e.Notes).HasColumnType("nvarchar(max)");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");

            entity.HasOne(e => e.Partner)
                  .WithMany()
                  .HasForeignKey(e => e.PartnerId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Wedding)
                  .WithMany()
                  .HasForeignKey(e => e.WeddingId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.WeddingPartner)
                  .WithOne(wp => wp.Booking)
                  .HasForeignKey<Booking>(b => b.WeddingPartnerId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.WeddingPartnerId).IsUnique().HasDatabaseName("UQ_Bookings_WeddingPartner");
            entity.HasIndex(e => e.PartnerId).HasDatabaseName("IX_Bookings_PartnerId");
            entity.HasIndex(e => e.WeddingId).HasDatabaseName("IX_Bookings_WeddingId");
            entity.HasIndex(e => new { e.PartnerId, e.StartDateTime, e.EndDateTime }).HasDatabaseName("IX_Bookings_DateRange");
        });
    }
}

