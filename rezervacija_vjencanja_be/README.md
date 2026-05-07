# rezervacija_vjencanja — Backend

.NET 9 Web API | Entity Framework Core | MSSQL | Docker Compose | Scalar docs

---

## Prerequisites

| Tool | Minimum version |
|------|----------------|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | 24+ |
| [.NET SDK](https://dotnet.microsoft.com/download/dotnet/9.0) | 9.0 (local dev only) |
| [dotnet-ef](https://learn.microsoft.com/en-us/ef/core/cli/dotnet) | 9.0 (migrations only) |

Install `dotnet-ef` once globally:
```bash
dotnet tool install --global dotnet-ef
```

---

## Running with Docker Compose (recommended)

This spins up both the API and a SQL Server 2022 container. No local SQL Server required.

**1. Start everything**
```bash
cd rezervacija_vjencanja_be/
docker compose up --build
```

**3. Verify**

| URL | What |
|-----|------|
| `http://localhost:8080/scalar/v1` | Scalar API docs |
| `http://localhost:8080/api/partner-types` | Live endpoint |

Migrations and seed data are applied automatically on startup.

**Stop**
```bash
docker compose down
# To also remove the database volume:
docker compose down -v
```

---

## Running locally (without Docker)

You still need a reachable SQL Server instance (e.g. SQL Server Developer Edition or Azure SQL Edge in Docker).

**1. Start just the database**
```bash
cd rezervacija_vjencanja_be/
docker compose up sqlserver -d
```

**2. Verify the connection string**  
`appsettings.Development.json` already points to `localhost,1433` with the default dev password. Edit it if your local SQL Server uses different credentials.

**3. Run the API**
```bash
cd rezervacija_vjencanja_be/rezervacija_vjencanja_be/
dotnet run
```
API is served on `http://localhost:5128` (see `Properties/launchSettings.json`).

---

## Entity Framework Migrations

All commands must be run from `rezervacija_vjencanja_be/rezervacija_vjencanja_be/`.

```bash
# Create a new migration
dotnet ef migrations add <MigrationName> --output-dir Data/Migrations

# Apply pending migrations to the database
dotnet ef database update

# Roll back to a specific migration
dotnet ef database update <MigrationName>

# Roll back all migrations (empty database)
dotnet ef database update 0

# Remove the last migration (only if not yet applied to DB)
dotnet ef migrations remove
```

> Migrations are also applied automatically when the app starts (`db.Database.Migrate()` in `Program.cs`). This is intentional for development convenience — remove it before going to production.

---

## API Response shape

Every endpoint returns the same envelope:

```json
{
  "data": <T> | null,
  "error": "string" | null
}
```

On success `error` is `null`. On failure `data` is `null` and `error` contains the message.

---

## Example CRUD — `PartnerTypes`

The `PartnerTypes` resource is the canonical example showing how all CRUD endpoints are structured in this project.

Base URL: `http://localhost:8080` (Docker) or `http://localhost:5128` (local)

---

### GET /api/partner-types — list all

```http
GET /api/partner-types
```

**Response 200**
```json
{
  "data": [
    { "id": 1, "name": "BAND",         "hasBooking": true  },
    { "id": 2, "name": "FLORIST",      "hasBooking": false },
    { "id": 3, "name": "PASTRY",       "hasBooking": false },
    { "id": 4, "name": "PHOTOGRAPHER", "hasBooking": true  },
    { "id": 5, "name": "VENUE",        "hasBooking": true  },
    { "id": 6, "name": "CATERING",     "hasBooking": false },
    { "id": 7, "name": "GENERIC",      "hasBooking": false }
  ],
  "error": null
}
```

---

### GET /api/partner-types/{id} — get one

```http
GET /api/partner-types/1
```

**Response 200**
```json
{
  "data": { "id": 1, "name": "BAND", "hasBooking": true },
  "error": null
}
```

**Response 404**
```json
{
  "data": null,
  "error": "PartnerType with id 99 was not found."
}
```

---

### POST /api/partner-types — create

```http
POST /api/partner-types
Content-Type: application/json

{
  "name": "VIDEOGRAPHER",
  "hasBooking": true
}
```

**Response 201**
```json
{
  "data": { "id": 8, "name": "VIDEOGRAPHER", "hasBooking": true },
  "error": null
}
```

**Response 400** (duplicate name)
```json
{
  "data": null,
  "error": "A PartnerType with name 'VIDEOGRAPHER' already exists."
}
```

---

### PUT /api/partner-types/{id} — update

```http
PUT /api/partner-types/8
Content-Type: application/json

{
  "name": "VIDEO",
  "hasBooking": false
}
```

**Response 200**
```json
{
  "data": { "id": 8, "name": "VIDEO", "hasBooking": false },
  "error": null
}
```

---

### DELETE /api/partner-types/{id} — delete

```http
DELETE /api/partner-types/8
```

**Response 200**
```json
{
  "data": true,
  "error": null
}
```

**Response 404**
```json
{
  "data": null,
  "error": "PartnerType with id 8 was not found."
}
```

---

## Project structure

```
rezervacija_vjencanja_be/          ← solution root
├── docker-compose.yml             ← local dev orchestration
├── .env.example                   ← copy to .env and fill SA_PASSWORD
├── rezervacija_vjencanja_be/      ← .NET project
│   ├── Program.cs                 ← app composition root
│   ├── Common/
│   │   └── ApiResponse.cs         ← generic response envelope { data, error }
│   ├── Middleware/
│   │   └── GlobalExceptionMiddleware.cs
│   ├── Data/
│   │   ├── AppDbContext.cs        ← EF Core DbContext + Fluent API config
│   │   └── Migrations/            ← auto-generated migration files
│   ├── Entities/
│   │   └── PartnerType.cs         ← EF entity (example)
│   ├── DTOs/
│   │   └── PartnerTypes/
│   │       └── PartnerTypeDtos.cs ← request/response records
│   ├── Services/
│   │   └── PartnerTypes/
│   │       ├── IPartnerTypeService.cs
│   │       └── PartnerTypeService.cs
│   └── Controllers/
│       └── PartnerTypesController.cs
```

---

## Adding a new resource (pattern)

Follow the same structure as `PartnerTypes`:

1. Add entity in `Entities/`
2. Add `DbSet<T>` + Fluent API config in `AppDbContext`
3. Run `dotnet ef migrations add <Name>`
4. Add DTOs in `DTOs/<Resource>/`
5. Add `IXService` interface + `XService` implementation in `Services/<Resource>/`
6. Register `AddScoped<IXService, XService>()` in `Program.cs`
7. Add controller in `Controllers/`
