# Rezervacija Vjenčanja — Project Scope & Technical Overview

## Project Overview

Internal web application for a wedding/event planning agency. Centralises management of weddings, vendors (partners), pricing, and document generation (offers, invoices, reports).

**Phase 1:** Weddings only. Architecture must support future event types without structural changes.

**Key constraints:**
- No authentication or user accounts — single-agency internal tool
- MVP quality — no monitoring, advanced logging, or production hardening required
- 4-person university team, feature-parallel development

---

## Team & Epic Assignments

| Name | Primary Epic | Follow-up (Epic 05) |
|------|-------------|---------------------|
| Blaž Perić | Epic 01 — Foundation | Assists/unblocks others |
| Vinko Jakeljić | Epic 02 — Weddings & Templates | Task 05-01: Client Offer PDF |
| Jelena Vučić | Epic 03 — Partner Catalog & Management | Task 05-04: CSV Export |
| Marija Musa | Epic 04 — Wedding-Partner Linking | Task 05-02 + 05-03: Invoices & Report |

Work is **feature-based** — each developer owns the full stack (backend + frontend + tests) for their epic. No backend/frontend split.

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Backend | .NET 9 Web API | REST, no MVC views |
| Frontend | React + TypeScript | Vite, component library TBD by team |
| Database | Microsoft SQL Server | EF Core code-first migrations |
| ORM | Entity Framework Core 9 | |
| PDF Generation | QuestPDF | .NET library, MIT licensed |
| CSV | CsvHelper | .NET library |

---

## High-Level Architecture

```
React SPA (Vite)  ←→  .NET 9 REST API  ←→  SQL Server
     :3000                 :5000               :1433
```

- React app runs on separate dev server with CORS proxy to .NET API
- .NET API uses EF Core for all DB access
- No file storage — image/document URLs stored as plain text strings
- No message queues, no background jobs for MVP

---

## What's In Scope (MVP)

| Module | Covered |
|--------|---------|
| Wedding CRUD with status flow | ✅ |
| Wedding templates (presets) | ✅ |
| Partner CRUD (all types, generalized model) | ✅ |
| Partner catalog items (services, products, songs) | ✅ |
| MT 3-tier pricing (base / special days / specific dates) | ✅ |
| Wedding-partner linking with pricing snapshot | ✅ |
| Booking conflict detection (band, photographer, venue) | ✅ |
| Band member management | ✅ |
| Partner clone function | ✅ |
| CSV import for catalog items | ✅ |
| Client offer PDF | ✅ |
| Client invoice PDF | ✅ |
| Internal agency report PDF | ✅ |
| CSV export for catalog data | ✅ |

## What's Out of Scope

- Authentication / login / roles
- Email sending or notifications
- Image / file upload (URLs only)
- Multi-agency support
- Mobile application
- Real-time updates (WebSockets)
- Audit log / history
- Advanced error monitoring (Sentry etc.)

---

## Key Technical Decisions

### 1. Generalized Partner Model
All partner types share a single `PartnerCatalogItems` table. Type-specific data lives in a `Metadata NVARCHAR(MAX)` (JSON) column. This means a band's songs, a florist's arrangements, a venue's menus, and a photographer's packages all use the same table structure — only the metadata shape differs.

See [partner-architecture.md](partner-architecture.md) for full technical detail.

### 2. JSON in MSSQL
MSSQL supports JSON operations on `NVARCHAR(MAX)` columns via `JSON_VALUE()`, `JSON_QUERY()`, and `ISJSON()`. We use JSON columns for:
- `PartnerCatalogItems.Metadata` — type-specific item data
- `Partners.ExtraFields` — extra attributes per partner type
- `WeddingTemplates.RequiredPartnerTypes` — partner type requirements per template

For MVP, JSON querying performance is acceptable. If search-within-JSON becomes slow, the solution is a computed column index (out of MVP scope).

### 3. MT Pricing (3-tier)
A `PricingRules` table stores SPECIAL_DAY and SPECIFIC_DATE overrides per catalog item. The base price lives directly on the `PartnerCatalogItems` record. Lookup priority: specific date > special day > base.

### 4. Feature-Parallel Development
Epic 01 unblocks all other epics. Once Epic 01 delivers working API endpoints and base React pages for partners, Epics 02/03/04 can proceed fully in parallel with no blocking dependency between them.

---

## Epic Overview

```
Epic 01: Foundation & Generalized Partners   [Blaž]
    ↓  (unblocks all)
    ├── Epic 02: Weddings & Templates         [Vinko]
    ├── Epic 03: Partner Catalog & Mgmt       [Jelena]
    └── Epic 04: Wedding-Partner Linking      [Marija]
               ↓             ↓           ↓
          Epic 05 tasks split by feature ownership
```

| Epic | Description | Assignee |
|------|-------------|----------|
| **01** | Project setup, DB schema, EF Core, generic partner CRUD (API + UI) | Blaž |
| **02** | Wedding templates, wedding CRUD, status flow, dashboard | Vinko |
| **03** | Catalog management, pricing rules UI, band members, booking calendar, CSV import/export, clone | Jelena |
| **04** | Partner-wedding linking, MT price calculation, conflict detection, status flow | Marija |
| **05** | PDF documents + CSV exports — distributed as primary epics complete | Split |

---

## Development Conventions

- **API response shape:** `{ data: T, error: string | null }`
- **EF Core:** code-first migrations only, no raw SQL in application code
- **DTOs:** separate request/response DTOs from EF entities
- **Validation:** FluentValidation on backend, basic HTML5 + manual on frontend
- **Error handling:** global exception middleware in .NET, error boundary in React
- **Status enums:** stored as strings in DB (`PREPARATION`, `CONFIRMED`, etc.) for readability
