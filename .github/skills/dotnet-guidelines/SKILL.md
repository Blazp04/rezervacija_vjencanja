---
name: dotnet-guidelines
description: .NET backend coding conventions for this project. Use when writing, editing, or reviewing any backend code — controllers, services, entities, DTOs, or DbContext. Covers EF Core, ApiResponse pattern, and the full service layer workflow.
applyTo: "rezervacija_vjencanja_be/**/*.cs"
license: MIT
---

# .NET Backend Guidelines

Architecture conventions derived from the existing codebase. Follow these patterns when adding or editing any backend code.

---

## 1. Project Structure

```
Controllers/          → thin HTTP layer, no business logic
Entities/             → EF Core models, one file per entity
DTOs/
  {Feature}/          → {Feature}Dtos.cs — read DTOs + request DTOs together
Services/
  {Feature}/
    I{Feature}Service.cs
    {Feature}Service.cs
Data/
  AppDbContext.cs      → DbSets + Fluent API config in OnModelCreating
Common/
  ApiResponse.cs       → shared response wrapper
Middleware/
  GlobalExceptionMiddleware.cs
```

New features always get their own sub-folder under `Services/` and `DTOs/`.

---

## 2. Entities

```csharp
namespace RezervacijaVjencanja.Entities;

public sealed class MyEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;   // required string → = string.Empty
    public string? Notes { get; set; }                  // optional → nullable
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Required nav property
    public RelatedEntity Related { get; set; } = null!;

    // Optional nav property
    public OtherEntity? Other { get; set; }

    // Collections
    public ICollection<ChildEntity> Children { get; set; } = [];
}
```

Rules:
- Always `sealed class`
- Required string properties default to `string.Empty`, never `null`
- Required navigation properties initialize with `null!`
- Collections initialize with `[]`
- Always include `CreatedAt` and `UpdatedAt` on main entities
- No data annotations — all config goes in `AppDbContext.OnModelCreating`

---

## 3. DTOs

```csharp
namespace RezervacijaVjencanja.DTOs.MyFeature;

// Compact list projection (used in GetAll)
public sealed record MyEntityListDto(
    int Id,
    string Name,
    bool IsActive);

// Full detail (used in GetById, Create response, Update response)
public sealed record MyEntityDto(
    int Id,
    string Name,
    string? Notes,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt);

// Create payload
public sealed record CreateMyEntityRequest(
    string Name,
    string? Notes);

// Update payload (includes all mutable fields + IsActive for soft-delete toggling)
public sealed record UpdateMyEntityRequest(
    string Name,
    string? Notes,
    bool IsActive);
```

Rules:
- Always `sealed record` (immutability + structural equality)
- Separate List / Detail / Create / Update records — never reuse one for multiple roles
- List DTOs carry only fields needed in a table/dropdown
- Full DTOs include timestamps (`CreatedAt`, `UpdatedAt`)
- Request DTOs never include `Id`, `CreatedAt`, `UpdatedAt` — those are server-set
- Group all DTOs for one feature in one file: `DTOs/{Feature}/{Feature}Dtos.cs`

---

## 4. Service Interface

```csharp
using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.DTOs.MyFeature;

namespace RezervacijaVjencanja.Services.MyFeature;

public interface IMyEntityService
{
    Task<ApiResponse<IEnumerable<MyEntityListDto>>> GetAllAsync();
    Task<ApiResponse<MyEntityDto>> GetByIdAsync(int id);
    Task<ApiResponse<MyEntityDto>> CreateAsync(CreateMyEntityRequest request);
    Task<ApiResponse<MyEntityDto>> UpdateAsync(int id, UpdateMyEntityRequest request);
    Task<ApiResponse<bool>> DeleteAsync(int id);
}
```

Rules:
- Every service has a matching interface (`I{Name}Service`)
- All methods return `Task<ApiResponse<T>>`
- Never `throw` from a service — return `ApiResponse<T>.Fail(message)` instead
- GetAll returns `IEnumerable<ListDto>`, GetById/Create/Update return the full DTO

---

## 5. Service Implementation

```csharp
using Microsoft.EntityFrameworkCore;
using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.Data;
using RezervacijaVjencanja.DTOs.MyFeature;
using RezervacijaVjencanja.Entities;

namespace RezervacijaVjencanja.Services.MyFeature;

public sealed class MyEntityService(AppDbContext db) : IMyEntityService
{
    // READ — AsNoTracking for all queries that don't mutate
    public async Task<ApiResponse<IEnumerable<MyEntityListDto>>> GetAllAsync()
    {
        var items = await db.MyEntities
            .AsNoTracking()
            .OrderBy(e => e.Name)
            .Select(e => new MyEntityListDto(e.Id, e.Name, e.IsActive))
            .ToListAsync();

        return ApiResponse<IEnumerable<MyEntityListDto>>.Ok(items);
    }

    public async Task<ApiResponse<MyEntityDto>> GetByIdAsync(int id)
    {
        var entity = await db.MyEntities
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == id);

        if (entity is null)
            return ApiResponse<MyEntityDto>.Fail($"MyEntity with id {id} was not found.");

        return ApiResponse<MyEntityDto>.Ok(ToDto(entity));
    }

    // WRITE — validate first, then mutate
    public async Task<ApiResponse<MyEntityDto>> CreateAsync(CreateMyEntityRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return ApiResponse<MyEntityDto>.Fail("Name is required.");

        // FK existence check example:
        // if (!await db.RelatedEntities.AnyAsync(r => r.Id == request.RelatedId))
        //     return ApiResponse<MyEntityDto>.Fail($"Related entity {request.RelatedId} was not found.");

        var now = DateTime.UtcNow;
        var entity = new MyEntity
        {
            Name = request.Name.Trim(),
            Notes = request.Notes?.Trim(),
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now,
        };

        db.MyEntities.Add(entity);
        await db.SaveChangesAsync();

        return ApiResponse<MyEntityDto>.Ok(ToDto(entity));
    }

    public async Task<ApiResponse<MyEntityDto>> UpdateAsync(int id, UpdateMyEntityRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return ApiResponse<MyEntityDto>.Fail("Name is required.");

        var entity = await db.MyEntities.FirstOrDefaultAsync(e => e.Id == id);
        if (entity is null)
            return ApiResponse<MyEntityDto>.Fail($"MyEntity with id {id} was not found.");

        entity.Name = request.Name.Trim();
        entity.Notes = request.Notes?.Trim();
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return ApiResponse<MyEntityDto>.Ok(ToDto(entity));
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int id)
    {
        var entity = await db.MyEntities.FindAsync(id);
        if (entity is null)
            return ApiResponse<bool>.Fail($"MyEntity with id {id} was not found.");

        db.MyEntities.Remove(entity);
        await db.SaveChangesAsync();
        return ApiResponse<bool>.Ok(true);
    }

    // Private mapper — keep mapping in one place
    private static MyEntityDto ToDto(MyEntity e) => new(
        e.Id, e.Name, e.Notes, e.IsActive, e.CreatedAt, e.UpdatedAt);
}
```

Rules:
- `sealed class`, primary constructor with `AppDbContext db`
- `AsNoTracking()` on every read-only query
- Validate before touching the DB — return `Fail` immediately on bad input
- "not found" error message format: `"EntityName with id {id} was not found."`
- Always `.Trim()` string inputs; use `?.Trim()` for optional strings
- Set `DateTime.UtcNow` for both `CreatedAt` and `UpdatedAt` on create; only `UpdatedAt` on update
- Private `static ToDto()` method for mapping — no mapping libraries
- After `SaveChangesAsync()`, load navigation properties explicitly if needed:
  `await db.Entry(entity).Reference(e => e.Nav).LoadAsync();`

---

## 6. Controller

```csharp
using Microsoft.AspNetCore.Mvc;
using RezervacijaVjencanja.Common;
using RezervacijaVjencanja.DTOs.MyFeature;
using RezervacijaVjencanja.Services.MyFeature;

namespace RezervacijaVjencanja.Controllers;

[ApiController]
[Route("api/my-entities")]
public sealed class MyEntitiesController(IMyEntityService service) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<MyEntityListDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var result = await service.GetAllAsync();
        return result.Error is null ? Ok(result) : BadRequest(result);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<MyEntityDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<MyEntityDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await service.GetByIdAsync(id);
        if (result.Error is not null)
            return result.Error.Contains("not found") ? NotFound(result) : BadRequest(result);
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<MyEntityDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<MyEntityDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateMyEntityRequest request)
    {
        var result = await service.CreateAsync(request);
        if (result.Error is not null) return BadRequest(result);
        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<MyEntityDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<MyEntityDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<MyEntityDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateMyEntityRequest request)
    {
        var result = await service.UpdateAsync(id, request);
        if (result.Error is not null)
            return result.Error.Contains("not found") ? NotFound(result) : BadRequest(result);
        return Ok(result);
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await service.DeleteAsync(id);
        if (result.Error is not null)
            return result.Error.Contains("not found") ? NotFound(result) : BadRequest(result);
        return Ok(result);
    }
}
```

Rules:
- `sealed class`, primary constructor with `IXxxService service`
- `[ApiController]` + `[Route("api/kebab-case-plural")]`
- Always include `[ProducesResponseType]` for every status code the action can return
- No business logic, no DB access — controllers only call the service and map the result to HTTP
- "not found" detection: `result.Error.Contains("not found")` → `NotFound`, else `BadRequest`
- POST returns `CreatedAtAction` pointing at `GetById`

---

## 7. AppDbContext — Adding a New Entity

Add the `DbSet` property:
```csharp
public DbSet<MyEntity> MyEntities => Set<MyEntity>();
```

Add Fluent API config in `OnModelCreating`:
```csharp
modelBuilder.Entity<MyEntity>(entity =>
{
    entity.ToTable("MyEntities");

    entity.HasKey(e => e.Id);
    entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
    entity.Property(e => e.Notes).HasColumnType("nvarchar(max)");
    entity.Property(e => e.IsActive).HasDefaultValue(true);
    entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
    entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETDATE()");

    // FK example
    entity.HasOne(e => e.Related)
          .WithMany(r => r.MyEntities)
          .HasForeignKey(e => e.RelatedId)
          .OnDelete(DeleteBehavior.Cascade);   // or Restrict / SetNull

    // Indexes
    entity.HasIndex(e => e.RelatedId).HasDatabaseName("IX_MyEntities_RelatedId");
    entity.HasIndex(e => e.IsActive).HasDatabaseName("IX_MyEntities_IsActive");

    // Enum-like check constraints (string enums stored as nvarchar)
    // entity.ToTable("MyEntities", t =>
    //     t.HasCheckConstraint("CHK_MyEntities_Status", "Status IN ('A', 'B', 'C')"));

    // JSON field check constraint
    // entity.ToTable("MyEntities", t =>
    //     t.HasCheckConstraint("CHK_MyEntities_JSON", "JsonField IS NULL OR ISJSON(JsonField) = 1"));
});
```

Rules:
- No data annotations on entities — all config here
- Every FK gets a named index: `IX_{Table}_{FkColumn}`
- Enum-like string columns use DB check constraints, not EF `HasConversion`
- JSON columns use `HasColumnType("nvarchar(max)")` + an ISJSON check constraint
- `GETDATE()` via `HasDefaultValueSql` for timestamp defaults
- After adding the entity, create a migration: `dotnet ef migrations add <MigrationName>`

---

## 8. Registering a New Service

In `Program.cs`, add exactly one line under the `-- Services` block:
```csharp
builder.Services.AddScoped<IMyEntityService, MyEntityService>();
```

No other changes to `Program.cs` are needed for a standard CRUD service.

---

## 9. ApiResponse Pattern

`ApiResponse<T>` is the single response wrapper for all endpoints:

```csharp
// Success
ApiResponse<T>.Ok(data)       // { Data: T, Error: null }

// Failure
ApiResponse<T>.Fail(message)  // { Data: null, Error: string }
```

- Never return raw objects from services
- Never throw exceptions for business rule failures — use `Fail`
- The controller checks `result.Error is null` to decide the HTTP status

---

## 10. Migrations Workflow

```bash
# Add a new migration (from the project directory)
dotnet ef migrations add <DescriptiveName>

# Apply to DB manually (optional — auto-applies on app startup)
dotnet ef database update
```

- Migration names should be descriptive: `AddWeddingStatusColumn`, `CreateBookingsTable`
- The app auto-migrates on startup (`db.Database.Migrate()` in `Program.cs`) — no manual apply needed in Docker
- Never edit a migration file after it has been applied to any environment

---

## 11. Quick Checklist for a New Feature

1. **Entity** → `Entities/{Name}.cs` — sealed class, timestamps, nav props
2. **DbSet** → `AppDbContext.cs` — add `DbSet<T>` + Fluent config in `OnModelCreating`
3. **Migration** → `dotnet ef migrations add Create{Name}Table`
4. **DTOs** → `DTOs/{Feature}/{Feature}Dtos.cs` — List, Detail, Create, Update records
5. **Interface** → `Services/{Feature}/I{Feature}Service.cs`
6. **Service** → `Services/{Feature}/{Feature}Service.cs` — implements interface
7. **Register** → `Program.cs` — `AddScoped<IService, Service>()`
8. **Controller** → `Controllers/{Feature}Controller.cs` — thin HTTP layer
