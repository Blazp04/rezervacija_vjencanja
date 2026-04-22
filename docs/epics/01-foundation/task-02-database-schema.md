# Task: Database Schema & Migrations

| | |
|---|---|
| **Epic** | 01 — Foundation |
| **Assignee** | Blaž Perić |
| **Estimate** | 2 days |
| **Status** | Not Started |
| **Depends on** | Task 01 — Project Setup |

## Description

Create all EF Core entity classes, configure `AppDbContext`, run the initial migration, and apply seed data. The schema must exactly match `docs/database.sql`. All other team members depend on this to write their features.

## Acceptance Criteria

- [ ] All entity classes created in `/backend/Models/Entities/`
- [ ] `AppDbContext` has `DbSet<T>` for every entity
- [ ] EF Fluent API configuration applied (constraints, indexes, default values)
- [ ] Initial migration created and applies cleanly on a fresh MSSQL instance
- [ ] Seed data applied via `HasData` or a seed service: all 7 partner types + 5 wedding templates
- [ ] `dotnet ef database update` works without errors
- [ ] All tables and constraints match `docs/database.sql`

## Technical Notes

**Entities to create:**
- `PartnerType`
- `Partner`
- `PartnerCatalogItem`
- `PricingRule`
- `BandMember`
- `WeddingTemplate`
- `Wedding`
- `WeddingPartner`
- `Booking`

**EF Core configuration examples:**

```csharp
// In AppDbContext.OnModelCreating:
modelBuilder.Entity<Partner>()
    .Property(p => p.CommissionPercent)
    .HasPrecision(5, 2);

modelBuilder.Entity<WeddingPartner>()
    .Property(wp => wp.Status)
    .HasDefaultValue("PROPOSED");

modelBuilder.Entity<Booking>()
    .HasIndex(b => new { b.PartnerId, b.StartDateTime, b.EndDateTime })
    .HasDatabaseName("IX_Bookings_DateRange");
```

**JSON columns:** Store as `NVARCHAR(MAX)`. In the entity, keep them as `string?`. Serialize/deserialize in the service layer — do not use `[Column(TypeName = "json")]` EF conversions for MVP (overkill).

**Seed data:** See `docs/database.sql` for the exact INSERT values. Use `modelBuilder.Entity<PartnerType>().HasData(...)`.

**Connection string placeholder in `appsettings.Development.json`:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=RezervacijaVjencanja;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```
