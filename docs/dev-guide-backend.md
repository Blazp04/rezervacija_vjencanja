# Backend Developer Guide

**Project:** Rezervacija Vjenčanja — Wedding Booking System  
**Stack:** .NET 9 · ASP.NET Core Web API · Entity Framework Core 9 · SQL Server 2022 · Docker

---

## Quick Start

> **Recommended:** Always use `docker-compose`. It provisions SQL Server, runs migrations, and starts the API with a single command. No local .NET SDK or SQL Server installation required.

```bash
cd rezervacija_vjencanja_be
docker-compose up --build -d
```

This starts:
- **SQL Server 2022** on port `1433`
- **API** on port `8080` (waits for DB to be healthy)

The API auto-migrates the database on startup. No manual migration steps needed.

### Alternative — Local (.NET CLI)

Only use this if you cannot run Docker. Requires a local SQL Server instance and the .NET 9 SDK.

```bash
cd rezervacija_vjencanja_be/rezervacija_vjencanja_be
dotnet restore
dotnet run
# API at http://localhost:5000
```

Set the connection string in `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=RezervacijaVjencanja;User Id=sa;Password=Dev#Str0ngPass1;TrustServerCertificate=True;"
  }
}
```

### Useful URLs

| URL | Description |
|---|---|
| `http://localhost:8080/scalar/v1` | Interactive API docs (Scalar UI) |
| `http://localhost:8080/openapi/v1.json` | OpenAPI 3.1 JSON spec |

---

## Project Structure

```
rezervacija_vjencanja_be/
└── rezervacija_vjencanja_be/    # The actual .NET project
    ├── Program.cs               # DI registration, middleware pipeline, DB migration
    ├── Controllers/             # HTTP endpoints
    ├── Services/                # Business logic (interface + implementation per domain)
    ├── Entities/                # EF Core entity classes
    ├── DTOs/                    # Request/response data transfer objects
    ├── Data/
    │   ├── AppDbContext.cs      # EF Core DbContext
    │   └── Migrations/          # Auto-generated EF migrations (do not edit)
    ├── Common/
    │   └── ApiResponse.cs       # Generic response envelope
    ├── Middleware/
    │   └── GlobalExceptionMiddleware.cs
    └── Properties/
        └── launchSettings.json
```

---

## Response Envelope

**All API responses use a shared `ApiResponse<T>` envelope:**

```csharp
public record ApiResponse<T>(T? Data, string? Error)
{
    public static ApiResponse<T> Ok(T data) => new(data, null);
    public static ApiResponse<T> Fail(string error) => new(default, error);
}
```

**Success:**
```json
{ "data": { "id": 1, "name": "Bend Ritam" }, "error": null }
```

**Failure:**
```json
{ "data": null, "error": "Partner not found." }
```

Every controller action, service method, and error middleware returns this shape. The frontend's `apiRequest()` helper unwraps `data` on success and throws `error` on failure.

---

## Adding a New Feature

Follow this checklist for any new domain (example: `Invoices`):

### 1. Entity

Create `Entities/Invoice.cs`:

```csharp
public sealed class Invoice
{
    public int Id { get; set; }
    public int WeddingId { get; set; }
    public decimal Amount { get; set; }
    public DateTime IssuedAt { get; set; }
    public DateTime CreatedAt { get; set; }

    public Wedding Wedding { get; set; } = null!;
}
```

### 2. DbContext

Register the entity in `Data/AppDbContext.cs`:

```csharp
public DbSet<Invoice> Invoices => Set<Invoice>();
```

Configure relationships/constraints in `OnModelCreating`:

```csharp
modelBuilder.Entity<Invoice>(e =>
{
    e.HasOne(i => i.Wedding)
     .WithMany(w => w.Invoices)
     .HasForeignKey(i => i.WeddingId)
     .OnDelete(DeleteBehavior.Cascade);
});
```

### 3. Migration

```bash
cd rezervacija_vjencanja_be
dotnet ef migrations add AddInvoices --project rezervacija_vjencanja_be
dotnet ef database update
```

The migration runs automatically on next startup via `db.Database.Migrate()` in `Program.cs`.

### 4. DTOs

Create `DTOs/Invoices/InvoiceDto.cs`, `CreateInvoiceRequest.cs`, etc. Keep DTOs flat — map entity fields explicitly, do not expose navigation properties.

```csharp
public record InvoiceDto(int Id, int WeddingId, decimal Amount, DateTime IssuedAt);

public record CreateInvoiceRequest(int WeddingId, decimal Amount);
```

### 5. Service Interface + Implementation

`Services/Invoices/IInvoiceService.cs`:

```csharp
public interface IInvoiceService
{
    Task<ApiResponse<IEnumerable<InvoiceDto>>> GetAllAsync(int? weddingId = null);
    Task<ApiResponse<InvoiceDto>> GetByIdAsync(int id);
    Task<ApiResponse<InvoiceDto>> CreateAsync(CreateInvoiceRequest request);
    Task<ApiResponse<InvoiceDto>> UpdateAsync(int id, UpdateInvoiceRequest request);
    Task<ApiResponse<bool>> DeleteAsync(int id);
}
```

`Services/Invoices/InvoiceService.cs`:

```csharp
public sealed class InvoiceService(AppDbContext db) : IInvoiceService
{
    public async Task<ApiResponse<IEnumerable<InvoiceDto>>> GetAllAsync(int? weddingId = null)
    {
        var query = db.Invoices.AsQueryable();
        if (weddingId.HasValue)
            query = query.Where(i => i.WeddingId == weddingId.Value);

        var invoices = await query
            .Select(i => new InvoiceDto(i.Id, i.WeddingId, i.Amount, i.IssuedAt))
            .ToListAsync();

        return ApiResponse<IEnumerable<InvoiceDto>>.Ok(invoices);
    }

    // ... other methods
}
```

### 6. Controller

`Controllers/InvoicesController.cs`:

```csharp
[ApiController]
[Route("api/invoices")]
public sealed class InvoicesController(IInvoiceService service) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<InvoiceDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] int? weddingId)
    {
        var result = await service.GetAllAsync(weddingId);
        return result.Error is null ? Ok(result) : BadRequest(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await service.GetByIdAsync(id);
        return result.Error is null ? Ok(result) : NotFound(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<InvoiceDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateInvoiceRequest request)
    {
        var result = await service.CreateAsync(request);
        if (result.Error is not null) return BadRequest(result);
        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateInvoiceRequest request)
    {
        var result = await service.UpdateAsync(id, request);
        return result.Error is null ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await service.DeleteAsync(id);
        return result.Error is null ? Ok(result) : NotFound(result);
    }
}
```

### 7. Register in Program.cs

```csharp
builder.Services.AddScoped<IInvoiceService, InvoiceService>();
```

---

## Program.cs — Pipeline Overview

```
Request
  │
  ├── GlobalExceptionMiddleware  (catches all unhandled exceptions → 500 JSON)
  ├── CORS                       (allows localhost:5173, localhost:3000)
  ├── UseAuthorization           (placeholder — no auth in MVP)
  └── MapControllers             (routes to [ApiController] classes)
```

OpenAPI spec is served at `/openapi/v1.json`. Scalar UI at `/scalar/v1`.

---

## Database — Key Entities & Relationships

```
PartnerType (seeded)
    └── Partner (many)
            ├── PartnerCatalogItem (many)
            │       └── PricingRule (many)
            ├── BandMember (many)       -- only for BAND type
            └── WeddingPartner (many)
                    └── Booking (one)   -- only for bookable types

WeddingTemplate (seeded)
    └── Wedding (many)
            └── WeddingPartner (many)
```

### Seeded Partner Types

| Id | Name | Code | HasBooking |
|---|---|---|---|
| 1 | Bend / DJ | BAND | true |
| 2 | Cvjećar | FLORIST | false |
| 3 | Slastičar | PASTRY | false |
| 4 | Fotograf / Snimatelj | PHOTOGRAPHER | true |
| 5 | Sala / Dvorana | VENUE | true |
| 6 | Catering | CATERING | false |
| 7 | Ostalo | GENERIC | false |

`HasBooking = true` means the partner type supports date-based conflict detection and calendar bookings.

### Wedding Statuses

`PREPARATION` → `CONFIRMED` → `COMPLETED` | `CANCELLED`

### ExtraFields (JSON column)

`Partner.ExtraFields` is stored as `nvarchar(max)` with an `ISJSON` check constraint. Use it for partner-type-specific fields that don't warrant dedicated columns. Serialize/deserialize manually using `System.Text.Json`.

---

## EF Core Conventions

- **Primary keys:** `Id` property on every entity (convention-based, no explicit config needed)
- **String columns:** EF defaults to `nvarchar(max)` — override with `HasMaxLength()` where appropriate
- **Timestamps:** `CreatedAt` and `UpdatedAt` are set in the service layer (not DB-generated)
- **Delete behavior:** Explicitly set with `OnDelete(DeleteBehavior.Cascade)` or `Restrict` per relationship — do not rely on defaults
- **Seed data:** Defined in `OnModelCreating` with `HasData()` — partner types and wedding templates are seeded

---

## Error Handling

Errors flow in one of two ways:

1. **Expected errors** (not found, validation failures) — return `ApiResponse.Fail("message")` from the service, map to `BadRequest` or `NotFound` in the controller.
2. **Unexpected exceptions** — bubble up uncaught; `GlobalExceptionMiddleware` catches them and returns `500` with `ApiResponse.Fail("An unexpected error occurred.")`. The full exception is logged via `ILogger`.

Do not catch exceptions in services unless you need to translate them into a business error. Let unexpected errors propagate.

---

## Configuration

| File | Purpose |
|---|---|
| `appsettings.json` | Base config — logging levels, AllowedHosts |
| `appsettings.Development.json` | Dev-only overrides — connection string, detailed logging |
| `docker-compose.yml` | Container definitions — SQL Server + API |
| `docker-compose.override.yml` | Local Docker overrides |

**Connection string (Development):**
```
Server=localhost,1433;Database=RezervacijaVjencanja;User Id=sa;Password=Dev#Str0ngPass1;TrustServerCertificate=True;
```

**Connection string (Docker Compose):**
```
Server=sqlserver,1433;Database=RezervacijaVjencanja;User Id=sa;Password=Dev#Str0ngPass1;TrustServerCertificate=True;
```

---

## Docker Details

The backend uses a **multi-stage Docker build**:
- **Stage 1 (sdk):** Restore + publish
- **Stage 2 (aspnet runtime):** Copy published output, expose port 8080

The API container depends on `sqlserver` with `condition: service_healthy` — SQL Server must pass its health check before the API starts. Health check runs `SELECT 1` via `sqlcmd` every 10 seconds, with a 30-second start period.

```bash
# Rebuild and start fresh
docker-compose down -v          # removes containers AND volumes (wipes DB)
docker-compose up --build -d

# View logs
docker-compose logs api -f
docker-compose logs sqlserver -f

# Run EF migration manually inside container
docker-compose exec api dotnet ef database update
```

---

## OpenAPI & Frontend Type Sync

The backend generates a full OpenAPI 3.1 spec via `Microsoft.AspNetCore.OpenApi`. After adding or changing endpoints:

1. Start the backend (`docker-compose up -d` or `dotnet run`)
2. In the frontend directory, run:

```bash
npm run sync-schema
```

This fetches `http://localhost:8080/openapi/v1.json` and regenerates `src/types/api.d.ts`. Always do this after changing DTOs or adding endpoints so the frontend types stay in sync.

---

## Coding Conventions

- **One service interface per domain** — `IPartnerService`, `ICatalogItemService`, etc.
- **Constructor injection via primary constructors** — `public sealed class PartnerService(AppDbContext db)`
- **Sealed classes** for all controllers and services (no inheritance needed)
- **Records for DTOs** — `public record PartnerDto(int Id, string Name, ...)`
- **Async all the way** — all service methods are `async Task<>`, no `.Result` or `.Wait()`
- **No raw SQL** — use EF Core LINQ queries; raw SQL only if absolutely necessary with parameterized queries
- **No business logic in controllers** — controllers only call service methods and map results to HTTP responses
- **No business logic in entities** — entities are plain data classes
