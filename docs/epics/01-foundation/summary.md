# Epic 01 — Foundation & Generalized Partner Architecture

**Assignee:** Blaž Perić  
**Status:** Not Started  
**Blocks:** All other epics

---

## Goal

Set up the entire project skeleton and implement the generalized partner system — the core architectural piece that all other epics depend on. When this epic is done, every other team member can start their feature with a working API and functional partner CRUD to build on top of.

## Deliverables

By the end of this epic the following must be working:

- `.NET 9` Web API project running locally with CORS configured for React
- `React + TypeScript` (Vite) frontend project running locally
- MSSQL database created, all tables migrated, seed data applied
- Full CRUD for `PartnerTypes` and `Partners` (backend + frontend)
- Full CRUD for `PartnerCatalogItems` and `PricingRules` (backend + frontend)
- Partner list page with search/filter
- Partner detail page with catalog items tab
- All API responses follow the agreed shape: `{ data: T, error: string | null }`

## Why This Blocks Others

| What others need | Provided by |
|------------------|------------|
| Working .NET project to add controllers | Task 01 |
| DB schema + EF context | Task 02 |
| `/api/partners` and `/api/catalog-items` endpoints | Task 03 |
| React app + partner pages to extend | Task 04 |

## Tasks

| Task | Title | Estimate |
|------|-------|----------|
| [task-01-project-setup.md](task-01-project-setup.md) | Project Setup | 2 days |
| [task-02-database-schema.md](task-02-database-schema.md) | Database Schema & Migrations | 2 days |
| [task-03-partner-api.md](task-03-partner-api.md) | Generic Partner REST API | 4 days |
| [task-04-partner-ui.md](task-04-partner-ui.md) | Partner Management UI | 4 days |

**Total estimate:** ~12 days

## Definition of Done

- [ ] Both projects (`/backend`, `/frontend`) start with a single command each
- [ ] README in root describes how to run the project
- [ ] All migrations run without errors on a fresh MSSQL instance
- [ ] Seed data applied (partner types, wedding templates)
- [ ] All partner CRUD operations work via API (verified with a REST client)
- [ ] Partner list + detail pages are accessible in the browser
- [ ] No console errors on page load
